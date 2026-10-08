import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Admin } from '../src/models/Admin.js';
import { Complaint } from '../src/models/Complaint.js';
import { Reporter } from '../src/models/Reporter.js';
import { Evidence } from '../src/models/Evidence.js';
import { LegalCase } from '../src/models/LegalCase.js';
import { PublicReport } from '../src/models/PublicReport.js';
import { CorrectionRequest } from '../src/models/CorrectionRequest.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { storageAdapterService } from '../src/services/storage/storageAdapter.service.js';
import { authConfig } from '../src/config/auth.js';
import jwt from 'jsonwebtoken';
import { EVIDENCE_PUBLIC_STATUS, MALWARE_SCAN_STATUS } from '../src/constants/evidenceStatus.js';
import { COMPLAINT_STATUS } from '../src/constants/complaintStatus.js';

describe('JonoShor Comprehensive Complaint System Lifecycle & Audit Verification', () => {
  let userTokenA = null;
  let userTokenB = null;
  let adminToken = null;
  let adminUser = null;
  let userA = null;
  let complaintIdA = null;
  let anonymousComplaintId = null;
  let evidenceRecord = null;
  let createdLegalCaseId = null;
  let createdTimelineEventId = null;
  let createdAuthorityActionId = null;
  let reporterUpdateRequestId = null;

  const userAEmail = `lifecycle_user_a_${Date.now()}@jonoshor-lifecycle.org`;
  const userBEmail = `lifecycle_user_b_${Date.now()}@jonoshor-lifecycle.org`;
  const adminEmail = `admin_lifecycle_${Date.now()}@jonoshor-lifecycle.org`;
  const password = 'Password123!';

  before(async () => {
    await connectDatabase();

    // 1. Create User A
    const regA = await request(app).post('/api/v1/auth/register').send({
      fullName: 'ব্যবহারকারী ক',
      email: userAEmail,
      password,
    });
    userA = regA.body.data;
    await User.updateOne({ email: userAEmail }, { emailVerified: true });
    const loginA = await request(app).post('/api/v1/auth/login').send({
      email: userAEmail,
      password,
    });
    userTokenA = loginA.body.data.accessToken;

    // 2. Create User B
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'ব্যবহারকারী খ',
      email: userBEmail,
      password,
    });
    await User.updateOne({ email: userBEmail }, { emailVerified: true });
    const loginB = await request(app).post('/api/v1/auth/login').send({
      email: userBEmail,
      password,
    });
    userTokenB = loginB.body.data.accessToken;

    // 3. Create Admin with full complaint, evidence, and legal permissions
    adminUser = await Admin.create({
      fullName: 'Lifecycle Admin',
      email: adminEmail,
      passwordHash: 'dummy_hash',
      permissions: [
        'complaint.read',
        'complaint.screen',
        'complaint.assign',
        'complaint.verify',
        'complaint.publish',
        'evidence.read',
        'evidence.review',
        'evidence.publish',
        'evidence.delete',
        'legal.create',
        'legal.read',
        'legal.update',
      ],
    });

    adminToken = jwt.sign(
      {
        id: adminUser._id.toString(),
        _id: adminUser._id.toString(),
        email: adminUser.email,
        accountType: 'admin',
        role: 'admin',
        permissions: adminUser.permissions,
        tokenVersion: 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '2h' }
    );
  });

  after(async () => {
    await User.deleteMany({ email: /@jonoshor-lifecycle\.org$/ });
    await Admin.deleteMany({ email: /@jonoshor-lifecycle\.org$/ });
    await Complaint.deleteMany({});
    await Reporter.deleteMany({});
    await Evidence.deleteMany({});
    await LegalCase.deleteMany({});
    await PublicReport.deleteMany({});
    await CorrectionRequest.deleteMany({});
    await AuditLog.deleteMany({});
    await disconnectDatabase();
  });

  // ==========================================
  // SECTION 1: SUBMISSION VALIDATIONS
  // ==========================================
  describe('1. Complaint Submission & Validations', () => {
    test('1.1 Registered user submits complaint with valid categories, location hierarchy and dates', async () => {
      const res = await request(app)
        .post('/api/v1/user/complaints')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          category: {
            primary: 'arbitrary_arrest_detention',
            secondary: ['torture_custodial_violence'],
          },
          incident: {
            startDate: new Date('2026-06-01').toISOString(),
            datePrecision: 'exact',
            ongoing: false,
            description: 'অভিযোগকারীর পরিচিত ব্যক্তিকে আইনবহির্ভূতভাবে আটক করে হেফাজতে নির্যাতন করা হয়েছে।',
          },
          location: {
            divisionId: 'dhaka',
            districtId: 'dhaka',
            upazilaId: 'mirpur',
            freeTextLocation: 'মিরপুর সেকশন ১০',
          },
          accused: [
            {
              name: 'দায়িত্বরত পুলিশ কর্মকর্তা',
              role: 'ওসি',
              organization: 'স্থানীয় থানা',
              visibility: 'private',
            },
          ],
          victims: [
            {
              name: 'কিশোর ভুক্তভোগী',
              minor: true,
              gender: 'male',
              identityVisibility: 'private',
            },
          ],
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      const createdComp = res.body.data.complaint || res.body.data;
      assert.ok(createdComp._id);
      complaintIdA = createdComp._id;

      // Verify category was normalized to stable enum key
      assert.equal(createdComp.category.primary, 'arbitrary_arrest_detention');
      assert.equal(createdComp.status, COMPLAINT_STATUS.SUBMITTED);
      assert.equal(createdComp.statusHistory.length, 1);
    });

    test('1.2 Anonymous visitor submits complaint without authentication', async () => {
      const res = await request(app)
        .post('/api/v1/public/complaints')
        .send({
          contact: {
            email: `anon_reporter_${Date.now()}@example.com`,
            mobile: '01711223344',
          },
          category: {
            primary: 'enforced_disappearance',
          },
          incident: {
            startDate: new Date('2026-07-15').toISOString(),
            datePrecision: 'exact',
            description: 'একদল ব্যক্তি সাধারণ পোশাকে এসে ভিকটিমকে জোরপূর্বক মাইক্রোবাসে তুলে নিয়ে যায়।',
          },
          location: {
            divisionId: 'chattogram',
            districtId: 'chattogram',
            freeTextLocation: 'পাঁচলাইশ এলাকা',
          },
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      const anonId = res.body.data.id || res.body.data._id || res.body.data.complaint?._id;
      assert.ok(anonId);
      anonymousComplaintId = anonId;
    });

    test('1.3 Submission is rejected if both email and mobile are missing (Anonymous)', async () => {
      const res = await request(app)
        .post('/api/v1/public/complaints')
        .send({
          category: { primary: 'corruption_extortion' },
          incident: {
            startDate: new Date('2026-08-01').toISOString(),
            description: 'ঘুষ দাবি এবং হয়রানির বিবরণ।',
          },
          location: {
            divisionId: 'dhaka',
            districtId: 'dhaka',
          },
        });

      assert.equal(res.status, 400);
      const errText = JSON.stringify(res.body);
      assert.match(errText, /contact/i);
    });

    test('1.4 Submission is rejected if invalid complaint category is provided', async () => {
      const res = await request(app)
        .post('/api/v1/user/complaints')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          category: { primary: 'completely_fabricated_category_xyz' },
          incident: {
            startDate: new Date('2026-08-01').toISOString(),
            description: 'ঘটনার বিস্তারিত বিবরণ যা অন্তত কুড়ি অক্ষরের বেশি হতে হবে।',
          },
          location: {
            divisionId: 'dhaka',
            districtId: 'dhaka',
          },
        });

      assert.equal(res.status, 400);
      const errText = JSON.stringify(res.body);
      assert.match(errText, /categor/i);
    });

    test('1.5 Submission is rejected if district does not belong to specified division', async () => {
      const res = await request(app)
        .post('/api/v1/user/complaints')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          category: { primary: 'arbitrary_arrest_detention' },
          incident: {
            startDate: new Date('2026-08-01').toISOString(),
            description: 'বৈধ বিবরণ অন্তত কুড়ি অক্ষরের হতে হবে।',
          },
          location: {
            divisionId: 'dhaka',
            districtId: 'coxsbazar', // Cox's Bazar is in Chattogram division, not Dhaka!
          },
        });

      assert.equal(res.status, 400);
      const errText = JSON.stringify(res.body);
      assert.match(errText, /district does not belong/i);
    });

    test('1.6 Submission is rejected if start date is in the future', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const res = await request(app)
        .post('/api/v1/user/complaints')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          category: { primary: 'arbitrary_arrest_detention' },
          incident: {
            startDate: futureDate.toISOString(),
            description: 'বৈধ বিবরণ অন্তত কুড়ি অক্ষরের হতে হবে।',
          },
          location: {
            divisionId: 'dhaka',
            districtId: 'dhaka',
          },
        });

      assert.equal(res.status, 400);
      const errText = JSON.stringify(res.body);
      assert.match(errText, /future/i);
    });
  });

  // ==========================================
  // SECTION 2: OBJECT-LEVEL OWNERSHIP
  // ==========================================
  describe('2. Object-Level Ownership & Security', () => {
    test('2.1 User A can view their own complaint', async () => {
      const res = await request(app)
        .get(`/api/v1/user/complaints/${complaintIdA}`)
        .set('Authorization', `Bearer ${userTokenA}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data._id, complaintIdA);
    });

    test('2.2 User B CANNOT access User A complaint (Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/user/complaints/${complaintIdA}`)
        .set('Authorization', `Bearer ${userTokenB}`);

      assert.equal(res.status, 403);
    });

    test('2.3 Anonymous complaint cannot be accessed without authorization', async () => {
      const res = await request(app)
        .get(`/api/v1/user/complaints/${anonymousComplaintId}`)
        .set('Authorization', `Bearer ${userTokenA}`);

      assert.equal(res.status, 403);
    });
  });

  // ==========================================
  // SECTION 3: WORKFLOW & STATUS HISTORY
  // ==========================================
  describe('3. Admin Screening & Workflow Transitions', () => {
    test('3.1 Admin screens complaint and transitions to screening', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/complaints/${complaintIdA}/screen`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'screening',
          notes: 'Preliminary intake passed successfully.',
        });

      assert.equal(res.status, 200);
      const updated = await Complaint.findById(complaintIdA);
      assert.equal(updated.status, 'screening');
      assert.equal(updated.statusHistory.length, 2);
    });

    test('3.2 Admin verifies complaint with corroboration assessment', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/complaints/${complaintIdA}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          decision: 'verified',
          reason: 'Eyewitness corroboration and medical records confirmed incident.',
          assessment: 'High credibility.',
        });

      assert.equal(res.status, 200);
      const updated = await Complaint.findById(complaintIdA);
      assert.equal(updated.status, 'verified');
      assert.equal(updated.review.verificationDecision, 'verified');
    });
  });

  // ==========================================
  // SECTION 4: EVIDENCE & GOOGLE DRIVE
  // ==========================================
  describe('4. Evidence & Storage Architecture', () => {
    test('4.1 Creates evidence record and generates upload session', async () => {
      const res = await request(app)
        .post(`/api/v1/user/complaints/${complaintIdA}/evidence/upload-session`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          type: 'image',
          filename: 'incident_photo.jpg',
          mimeType: 'image/jpeg',
          size: 1024 * 500,
        });

      assert.equal(res.status, 201);
      assert.ok(res.body.data.driveFileId);
      assert.ok(res.body.data.uploadUrl);

      // Create stored evidence record
      evidenceRecord = await Evidence.create({
        complaintId: complaintIdA,
        type: 'image',
        originalFilename: 'incident_photo.jpg',
        mimeType: 'image/jpeg',
        size: 512000,
        driveFileId: res.body.data.driveFileId,
        uploadStatus: 'stored',
        malwareScanStatus: MALWARE_SCAN_STATUS.CLEAN,
        publicStatus: EVIDENCE_PUBLIC_STATUS.PRIVATE,
      });
    });

    test('4.2 Infected evidence cannot be published', async () => {
      const infected = await Evidence.create({
        complaintId: complaintIdA,
        type: 'document',
        originalFilename: 'malware.exe',
        mimeType: 'application/x-msdownload',
        size: 1000,
        driveFileId: 'gdrive_malware_file',
        uploadStatus: 'stored',
        malwareScanStatus: MALWARE_SCAN_STATUS.MALICIOUS,
        publicStatus: EVIDENCE_PUBLIC_STATUS.PRIVATE,
      });

      const res = await request(app)
        .patch(`/api/v1/admin/evidence/${infected._id}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          publicStatus: EVIDENCE_PUBLIC_STATUS.APPROVED_PUBLIC,
        });

      assert.equal(res.status, 400);
      const errText = JSON.stringify(res.body);
      assert.match(errText, /malware scan/i);
    });

    test('4.3 Public approval creates safe public copy preserving private original in Drive', async () => {
      const originalDriveId = evidenceRecord.driveFileId;

      const res = await request(app)
        .patch(`/api/v1/admin/evidence/${evidenceRecord._id}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          publicStatus: EVIDENCE_PUBLIC_STATUS.APPROVED_PUBLIC,
          redactionStatus: 'none',
        });

      assert.equal(res.status, 200);

      const reloaded = await Evidence.findById(evidenceRecord._id);
      assert.equal(reloaded.publicStatus, EVIDENCE_PUBLIC_STATUS.APPROVED_PUBLIC);
      // Private original is preserved in driveFileId
      assert.equal(reloaded.driveFileId, originalDriveId);
      // Safe public copy is stored in publicDriveFileId
      assert.ok(reloaded.publicDriveFileId);
      assert.notEqual(reloaded.publicDriveFileId, originalDriveId);
    });

    test('4.4 Public evidence is accessible without login and zero tracking', async () => {
      const res = await request(app).get(`/api/v1/public/evidence/${evidenceRecord._id}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.data.publicStatus, undefined); // sanitized
      assert.ok(res.body.data.publicUrl);
    });
  });

  // ==========================================
  // SECTION 5: LEGAL CASES & TIMELINE
  // ==========================================
  describe('5. Legal Cases & Timeline Tracking', () => {
    test('5.1 Admin creates formal legal case linked to complaint', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/complaints/${complaintIdA}/legal-cases`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          caseNumber: 'CR-104/2026',
          caseType: 'Criminal Investigation',
          authorities: [{ name: 'মিরপুর মডেল থানা', type: 'police' }],
          courts: [{ name: 'ঢাকা চিফ মেট্রোপলিটন ম্যাজিস্ট্রেট আদালত' }],
          currentLegalStatus: 'case_filed',
        });

      assert.equal(res.status, 201);
      assert.ok(res.body.data._id);
      createdLegalCaseId = res.body.data._id;
      assert.equal(res.body.data.caseNumber, 'CR-104/2026');
      assert.equal(res.body.data.currentLegalStatus, 'case_filed');
    });

    test('5.2 Admin adds timeline event to legal case', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/legal-cases/${createdLegalCaseId}/timeline`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          date: '2026-06-15',
          eventType: 'FIR Filed',
          description: 'থানায় এজাহার দায়ের করা হয়েছে।',
          publicSummary: 'FIR accepted by police magistrate.',
          verified: true,
        });

      assert.equal(res.status, 201);
      const lc = await LegalCase.findById(createdLegalCaseId);
      assert.equal(lc.timeline.length, 1);
      createdTimelineEventId = lc.timeline[0]._id;
    });

    test('5.3 Admin updates timeline event via PATCH endpoint', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/legal-cases/${createdLegalCaseId}/timeline/${createdTimelineEventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          publicSummary: 'Updated verified public summary for FIR.',
          verified: true,
        });

      assert.equal(res.status, 200);
      const lc = await LegalCase.findById(createdLegalCaseId);
      assert.equal(lc.timeline[0].publicSummary, 'Updated verified public summary for FIR.');
    });

    test('5.4 Admin creates and updates structured authority action', async () => {
      // 1. Create authority action
      const addRes = await request(app)
        .post(`/api/v1/admin/complaints/${complaintIdA}/authority-actions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          authorityType: 'police',
          authorityName: 'ডিএমপি বিশেষ তদন্ত দল',
          action: 'তদন্তকারী কর্মকর্তা নিয়োগ এবং ঘটনাস্থল পরিদর্শন',
          reference: 'DMP-INV-891',
          verified: true,
          publicSummary: 'Investigation team visited site and recorded testimonies.',
        });

      assert.equal(addRes.status, 201);
      createdAuthorityActionId = addRes.body.data._id;

      // 2. Fetch authority actions
      const getRes = await request(app)
        .get(`/api/v1/admin/complaints/${complaintIdA}/authority-actions`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(getRes.status, 200);
      assert.ok(getRes.body.data.length >= 1);

      // 3. Update authority action
      const patchRes = await request(app)
        .patch(`/api/v1/admin/complaints/${complaintIdA}/authority-actions/${createdAuthorityActionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          notes: 'Updated field notes by supervising admin.',
          verified: true,
        });

      assert.equal(patchRes.status, 200);
      assert.equal(patchRes.body.data.verified, true);
    });
  });

  // ==========================================
  // SECTION 6: REPORTER LEGAL UPDATES & CLAIMS
  // ==========================================
  describe('6. Reporter Legal Updates & Admin Review', () => {
    test('6.1 User submits legal update claim (remains unverified initially)', async () => {
      const res = await request(app)
        .post(`/api/v1/user/complaints/${complaintIdA}/legal-update-request`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          claim: 'আদালতে আসামির বিরুদ্ধে গ্রেপ্তারি পরোয়ানা জারি করা হয়েছে।',
          type: 'court',
          name: 'সিএমএম আদালত ঢাকা',
          reference: 'Warrant #551/26',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.success, true);

      const comp = await Complaint.findById(complaintIdA);
      assert.equal(comp.legalUpdateRequests.length, 1);
      assert.equal(comp.legalUpdateRequests[0].status, 'pending');
      reporterUpdateRequestId = comp.legalUpdateRequests[0]._id;
    });

    test('6.2 Admin reviews user claim, authenticates it, and adds to official authority actions', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/complaints/${complaintIdA}/legal-update-requests/${reporterUpdateRequestId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'verified',
          adminNotes: 'Court register verified warrant issuance.',
          addToAuthorityActions: true,
          publicSummary: 'Arrest warrant officially issued by CMM Court.',
        });

      assert.equal(res.status, 200);
      const comp = await Complaint.findById(complaintIdA);
      const verifiedClaim = comp.legalUpdateRequests.id(reporterUpdateRequestId);
      assert.equal(verifiedClaim.status, 'verified');

      // Verified authority actions should contain the newly verified action
      const addedAction = comp.authorityActions.find((a) => a.action === verifiedClaim.claim);
      assert.ok(addedAction);
      assert.equal(addedAction.verified, true);
    });
  });

  // ==========================================
  // SECTION 7: PUBLIC REPORT & DISCLOSURE
  // ==========================================
  describe('7. Publication & Sanitized Public Reports', () => {
    test('7.1 Admin creates public report with minor protection and bilingual summaries', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/complaints/${complaintIdA}/public-report`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bn: {
            title: 'মিরপুরে বেআইনি আটক ও নির্যাতনের ঘটনায় তদন্ত অব্যাহত',
            summary: 'আইনশৃঙ্খলা বাহিনীর কিছু সদস্যের বিরুদ্ধে দায়েরকৃত অভিযোগের সত্যতা পাওয়া গেছে।',
            incidentStory: 'গত জুন মাসে ভুক্তভোগীকে তুলে নিয়ে নির্যাতন করা হয়।',
            legalSummary: 'সিএমএম আদালতে মামলা বিচারাধীন রয়েছে।',
            authorityActionSummary: 'তদন্তকারী কর্মকর্তা প্রতিবেদন দাখিল করেছেন।',
          },
          en: {
            title: 'Investigation Continues into Unlawful Detention and Custodial Violence in Mirpur',
            summary: 'Allegations against certain members of local enforcement corroborated.',
            incidentStory: 'Victim was detained without warrant and subjected to physical abuse in custody.',
            legalSummary: 'Case pending before the CMM Court.',
            authorityActionSummary: 'Special investigative team submitted formal preliminary report.',
          },
          caseStatus: 'trial',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      const report = res.body.data;
      assert.ok(report._id);

      // Verify minor victim protection (name must be masked as 'পরিচয় গোপনীয়')
      assert.ok(report.publicVictims && report.publicVictims.length >= 1);
      assert.equal(report.publicVictims[0].name, 'পরিচয় গোপনীয়');
    });

    test('7.2 Public can fetch sanitized report without leaking reporter or internal notes', async () => {
      const res = await request(app).get('/api/v1/public/reports');
      assert.equal(res.status, 200);
      const reports = Array.isArray(res.body.data) ? res.body.data : res.body.data.reports;
      assert.ok(reports && reports.length >= 1);

      const pubReport = reports[0];
      // Must not leak reporter ID or internal metadata
      assert.equal(pubReport.reporterId, undefined);
      assert.equal(pubReport.securityIdentifiers, undefined);
      assert.equal(pubReport.review, undefined);
      assert.ok(pubReport.bn.title);
      assert.ok(pubReport.en.title);
    });
  });

  // ==========================================
  // SECTION 8: CORRECTIONS & WITHDRAWAL
  // ==========================================
  describe('8. Corrections (Max 3) & Withdrawal Requests', () => {
    test('8.1 User requests correction (allowed up to 3 times)', async () => {
      // 1st correction
      const res1 = await request(app)
        .post(`/api/v1/user/complaints/${complaintIdA}/corrections`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          requestedChanges: 'তারিখের সংশোধন',
          reason: 'টাইপিং ভুল',
        });
      assert.equal(res1.status, 201);

      // 2nd correction
      const res2 = await request(app)
        .post(`/api/v1/user/complaints/${complaintIdA}/corrections`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          requestedChanges: 'আসামির পদবি সংশোধন',
          reason: 'নতুন তথ্য',
        });
      assert.equal(res2.status, 201);

      // 3rd correction
      const res3 = await request(app)
        .post(`/api/v1/user/complaints/${complaintIdA}/corrections`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          requestedChanges: 'উপজেলার নাম সংশোধন',
          reason: 'স্পষ্টীকরণ',
        });
      assert.equal(res3.status, 201);

      // 4th correction must be REJECTED (Max 3 exceeded)
      const res4 = await request(app)
        .post(`/api/v1/user/complaints/${complaintIdA}/corrections`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          requestedChanges: 'চতুর্থ অনুরোধ',
          reason: 'সীমাহীন চেষ্টা',
        });
      assert.equal(res4.status, 400);
      const errText = JSON.stringify(res4.body);
      assert.match(errText, /correction limit/i);
    });

    test('8.2 User requests withdrawal without automatic destruction of complaint record', async () => {
      const res = await request(app)
        .post(`/api/v1/user/complaints/${complaintIdA}/withdraw`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          reason: 'উভয় পক্ষের মধ্যে পারিবারিক সমঝোতা হয়েছে।',
        });

      assert.equal(res.status, 200);
      const comp = await Complaint.findById(complaintIdA);
      assert.equal(comp.withdrawal.requested, true);
      assert.equal(comp.withdrawal.reason, 'উভয় পক্ষের মধ্যে পারিবারিক সমঝোতা হয়েছে।');
      // Record is intact, never deleted!
      assert.ok(comp._id);
    });
  });

  // ==========================================
  // SECTION 9: PUBLIC STATISTICS
  // ==========================================
  describe('9. Public Statistics Non-Decreasing Integrity', () => {
    test('9.1 Public statistics returns aggregated counts', async () => {
      const res = await request(app).get('/api/v1/public/statistics');
      assert.equal(res.status, 200);
      assert.ok(res.body.data.totalComplaints >= 2);
      assert.ok(res.body.data.verifiedReports >= 1);
      assert.ok(Array.isArray(res.body.data.categories));
      assert.ok(Array.isArray(res.body.data.districts));
    });
  });
});
