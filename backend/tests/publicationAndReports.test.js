import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { Complaint } from '../src/models/Complaint.js';
import { Reporter } from '../src/models/Reporter.js';
import { PublicReport } from '../src/models/PublicReport.js';
import { Admin } from '../src/models/Admin.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { complaintService } from '../src/services/complaints/complaint.service.js';
import { verificationService } from '../src/services/verification/verification.service.js';
import { publicationService } from '../src/services/publication/publication.service.js';
import { COMPLAINT_STATUS } from '../src/constants/complaintStatus.js';

describe('Phase 12 & 14 — Review Pipeline & Public Reports System Tests', () => {
  let adminReviewerA = null;
  let adminReviewerB = null;
  let complaint = null;
  let publicReport = null;

  before(async () => {
    await connectDatabase();

    // Create Admin Reviewer A
    adminReviewerA = await Admin.create({
      fullName: 'রিভিউয়ার ১',
      email: `rev_a_${Date.now()}@jonoshor-test.org`,
      passwordHash: 'dummy',
      permissions: ['complaint.review', 'complaint.verify'],
    });

    // Create Admin Reviewer B
    adminReviewerB = await Admin.create({
      fullName: 'রিভিউয়ার ২',
      email: `rev_b_${Date.now()}@jonoshor-test.org`,
      passwordHash: 'dummy',
      permissions: ['complaint.review', 'complaint.verify', 'complaint.publish'],
    });

    // Create a submitted complaint
    complaint = await complaintService.createComplaint({
      complaintData: {
        category: { primary: 'বেআইনি আটক' },
        incident: {
          startDate: new Date('2026-06-01'),
          description: 'ঘটনার বিস্তারিত বিবরণ যা যথাযথভাবে অভিযোগ আকারে জমা দেওয়া হয়েছে।',
        },
        location: {
          divisionId: 'dhaka',
          districtId: 'dhaka',
          upazilaId: 'mirpur',
          freeTextLocation: 'মিরপুর ২ নং সেকশন',
        },
        contact: { email: `victim_pub_${Date.now()}@jonoshor-test.org` },
        accused: [{ name: 'অভিযুক্ত ক', role: 'ওসি' }],
        victims: [{ name: 'ভুক্তভোগী খ', age: 28 }],
      },
    });
  });

  after(async () => {
    await Complaint.deleteMany({});
    await Reporter.deleteMany({});
    await PublicReport.deleteMany({});
    await Admin.deleteMany({ email: /@jonoshor-test\.org$/ });
    await disconnectDatabase();
  });

  test('1. Admin assigns Reviewer A to complaint', async () => {
    const updated = await verificationService.assignReviewer(
      complaint._id,
      adminReviewerA._id,
      adminReviewerB._id
    );
    assert.equal(updated.status, COMPLAINT_STATUS.SCREENING);
    assert.equal(updated.review.assignedReviewerId.toString(), adminReviewerA._id.toString());
  });

  test('2. Reviewer A declares conflict of interest and complaint returns to queue', async () => {
    const updated = await verificationService.declareConflict(
      complaint._id,
      adminReviewerA._id,
      'অভিযুক্ত ব্যক্তি দূরবর্তী আত্মীয়'
    );
    assert.equal(updated.status, COMPLAINT_STATUS.SUBMITTED);
    assert.equal(updated.review.conflictOfInterest, true);
    assert.equal(updated.review.assignedReviewerId, null);
  });

  test('3. Reviewer B is assigned and marks complaint verified', async () => {
    await verificationService.assignReviewer(complaint._id, adminReviewerB._id, adminReviewerB._id);

    const verified = await verificationService.recordDecision(
      complaint._id,
      adminReviewerB._id,
      {
        decision: 'verified',
        status: COMPLAINT_STATUS.VERIFIED,
        reason: 'যথাযথ দালিলিক প্রমাণ ও প্রত্যক্ষদর্শীর সাক্ষ্য দ্বারা সমর্থিত',
        assessment: 'উচ্চ নির্ভরযোগ্যতা সম্পন্ন',
      }
    );

    assert.equal(verified.status, COMPLAINT_STATUS.VERIFIED);
  });

  test('4. Verified complaint is approved for publication as Public Report', async () => {
    publicReport = await publicationService.publishReport({
      complaintId: complaint._id,
      adminId: adminReviewerB._id,
      bn: {
        title: 'মিরপুরে বেআইনি আটকের ঘটনায় সত্যতা যাচাইকৃত প্রতিবেদন',
        summary: 'নাগরিককে ২৪ ঘণ্টার অধিক সময় বেআইনিভাবে আটকে রাখার ঘটনার সত্যতা নিশ্চিত করা হয়েছে।',
        incidentStory: '২০২৬ সালের ১ জুন মিরপুর এলাকায় সংঘটিত ঘটনায় তদন্তের পর সত্যতা পাওয়া গেছে...',
      },
      en: {
        title: 'Verified Report on Unlawful Detention in Mirpur',
        summary: 'Confirmation of unlawful detention of a citizen exceeding 24 hours in Mirpur.',
        incidentStory: 'Following investigative procedures on the incident from June 1, 2026...',
      },
      publicAccused: [{ name: 'সংশ্লিষ্ট কর্মকর্তা', role: 'দায়িত্বরত ব্যক্তি' }],
    });

    assert.ok(publicReport._id);
    assert.equal(publicReport.publicationStatus, 'published');
    assert.equal(publicReport.bn.title, 'মিরপুরে বেআইনি আটকের ঘটনায় সত্যতা যাচাইকৃত প্রতিবেদন');
  });

  test('5. Public API GET /api/v1/public/reports lists published reports without exposing private details', async () => {
    const res = await request(app).get('/api/v1/public/reports');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length >= 1);

    const report = res.body.data[0];
    assert.equal(report.bn.title, 'মিরপুরে বেআইনি আটকের ঘটনায় সত্যতা যাচাইকৃত প্রতিবেদন');

    // Security assertion: Internal private fields MUST NOT be present
    assert.equal(report.reporterId, undefined);
    assert.equal(report.contact, undefined);
    assert.equal(report.riskFlags, undefined);
  });

  test('6. Public API GET /api/v1/public/reports/:id retrieves specific public report', async () => {
    const res = await request(app).get(`/api/v1/public/reports/${publicReport._id}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.bn.title, 'মিরপুরে বেআইনি আটকের ঘটনায় সত্যতা যাচাইকৃত প্রতিবেদন');
    assert.equal(res.body.data.en.title, 'Verified Report on Unlawful Detention in Mirpur');
  });
});
