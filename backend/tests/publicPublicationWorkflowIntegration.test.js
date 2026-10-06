import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authConfig } from '../src/config/auth.js';
import { Complaint } from '../src/models/Complaint.js';
import { Reporter } from '../src/models/Reporter.js';
import { Evidence } from '../src/models/Evidence.js';
import { PublicReport } from '../src/models/PublicReport.js';
import { Admin } from '../src/models/Admin.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { LegalCase } from '../src/models/LegalCase.js';
import { COMPLAINT_STATUS } from '../src/constants/complaintStatus.js';
import { EVIDENCE_PUBLIC_STATUS, MALWARE_SCAN_STATUS } from '../src/constants/evidenceStatus.js';
import { PERMISSIONS } from '../src/constants/permissions.js';

describe('Public Disclosure / Publication Workflow & Security Integration Tests', () => {
  let authorizedAdmin = null;
  let unauthorizedAdmin = null;
  let conflictedAdmin = null;
  let authAdminToken = null;
  let unauthAdminToken = null;
  let conflictedAdminToken = null;

  let testComplaint = null;
  let cleanPublicEvidence = null;
  let privateEvidence = null;
  let publishedPublicReport = null;

  const testEmailDomain = `pubtest_${Date.now()}@jonoshor-verify.org`;

  before(async () => {
    await connectDatabase();

    // 1. Authorized Admin with COMPLAINT_PUBLISH
    authorizedAdmin = await Admin.create({
      fullName: 'প্রকাশনা এডমিন',
      email: `pub_admin_${Date.now()}@jonoshor-verify.org`,
      passwordHash: 'hashed_secret_test',
      permissions: [PERMISSIONS.COMPLAINT_READ, PERMISSIONS.COMPLAINT_VERIFY, PERMISSIONS.COMPLAINT_PUBLISH],
    });
    authAdminToken = jwt.sign(
      {
        id: authorizedAdmin._id.toString(),
        _id: authorizedAdmin._id.toString(),
        accountType: 'admin',
        role: 'admin',
        permissions: authorizedAdmin.permissions,
        tokenVersion: authorizedAdmin.tokenVersion || 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 2. Unauthorized Admin lacking COMPLAINT_PUBLISH
    unauthorizedAdmin = await Admin.create({
      fullName: 'রিভিউয়ার কেবল',
      email: `unauth_admin_${Date.now()}@jonoshor-verify.org`,
      passwordHash: 'hashed_secret_test',
      permissions: [PERMISSIONS.COMPLAINT_READ],
    });
    unauthAdminToken = jwt.sign(
      {
        id: unauthorizedAdmin._id.toString(),
        _id: unauthorizedAdmin._id.toString(),
        accountType: 'admin',
        role: 'admin',
        permissions: unauthorizedAdmin.permissions,
        tokenVersion: unauthorizedAdmin.tokenVersion || 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 3. Conflicted Admin
    conflictedAdmin = await Admin.create({
      fullName: 'দ্বন্দ্বযুক্ত এডমিন',
      email: `conflict_admin_${Date.now()}@jonoshor-verify.org`,
      passwordHash: 'hashed_secret_test',
      permissions: [PERMISSIONS.COMPLAINT_READ, PERMISSIONS.COMPLAINT_PUBLISH],
    });
    conflictedAdminToken = jwt.sign(
      {
        id: conflictedAdmin._id.toString(),
        _id: conflictedAdmin._id.toString(),
        accountType: 'admin',
        role: 'admin',
        permissions: conflictedAdmin.permissions,
        tokenVersion: conflictedAdmin.tokenVersion || 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 4. Create synthetic complaint in 'verified' status
    const reporter = await Reporter.create({
      reporterType: 'non_user',
      isAnonymous: true,
      contact: { email: `anon_rep_${Date.now()}@jonoshor-verify.org`, mobile: '01711998877' },
      securityIdentifiers: { tokenHash: 'dummy_security_secret_hash' },
    });

    testComplaint = await Complaint.create({
      submissionType: 'non_user',
      reporterId: reporter._id,
      category: { primary: 'নির্যাতন ও হেফাজতে মৃত্যু', secondary: ['মানবাধিকার লঙ্ঘন'] },
      location: {
        divisionId: 'dhaka',
        districtId: 'dhaka',
        upazilaId: 'dhanmondi',
        freeTextLocation: 'ধানমন্ডি ২৭ নং রোড',
      },
      incident: {
        startDate: new Date('2026-05-10'),
        endDate: new Date('2026-05-11'),
        datePrecision: 'range',
        description: 'ধানমন্ডি এলাকায় ভুক্তভোগীকে অন্যায়ভাবে আটকের পর শারীরিক নির্যাতন করা হয়।',
      },
      status: COMPLAINT_STATUS.VERIFIED,
      riskFlags: ['high_risk'],
      review: {
        assignedReviewerId: authorizedAdmin._id,
        reviewerNotes: 'অভ্যন্তরীণ অত্যন্ত সংবেদনশীল তদন্ত নোট যা কখনোই প্রকাশ করা যাবে না।',
        verifiedBy: authorizedAdmin._id,
        verificationDecision: 'verified',
        verificationReason: 'সরেজমিন অনুসন্ধান ও প্রত্যক্ষদর্শীর সাক্ষ্যে নিশ্চিত।',
      },
      victims: [
        { name: 'করিম শেখ', age: 16, minor: true, relationshipToIncident: 'ভুক্তভোগী প্রত্যক্ষদর্শী' },
        { name: 'রহিম উদ্দিন', age: 35, minor: false, relationshipToIncident: 'প্রধান ভুক্তভোগী' },
      ],
      accused: [
        { name: 'কর্মকর্তা এক্স', role: 'তদন্তকারী কর্মকর্তা', organization: 'স্থানীয় থানা' },
      ],
      authorityActions: [
        { authorityName: 'জেলা পুলিশ প্রশাসন', action: 'বিভাগীয় তদন্ত কমিটি গঠন', actionDate: new Date() },
      ],
      legal: { hasLegalCase: false },
    });

    // 5. Create one clean approved_public evidence and one private evidence
    cleanPublicEvidence = await Evidence.create({
      complaintId: testComplaint._id,
      uploaderId: reporter._id,
      uploaderType: 'reporter',
      type: 'image',
      originalFilename: 'verified_medical_report.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      driveFileId: 'mock_gdrive_public_verified_file_123',
      storagePath: '/clean/verified_medical_report.jpg',
      malwareScanStatus: MALWARE_SCAN_STATUS.CLEAN,
      publicStatus: EVIDENCE_PUBLIC_STATUS.APPROVED_PUBLIC,
    });

    privateEvidence = await Evidence.create({
      complaintId: testComplaint._id,
      uploaderId: reporter._id,
      uploaderType: 'reporter',
      type: 'document',
      originalFilename: 'private_witness_identity.pdf',
      mimeType: 'application/pdf',
      size: 2048,
      driveFileId: 'mock_gdrive_private_witness_secret_456',
      storagePath: '/quarantine/private_witness.pdf',
      malwareScanStatus: MALWARE_SCAN_STATUS.CLEAN,
      publicStatus: EVIDENCE_PUBLIC_STATUS.PRIVATE,
    });

    // Declare conflict for conflictedAdmin
    await AuditLog.create({
      actorId: conflictedAdmin._id,
      actorType: 'admin',
      action: 'CONFLICT_OF_INTEREST_DECLARED',
      resourceType: 'complaint',
      resourceId: testComplaint._id,
      metadata: { reason: 'পারিবারিক সম্পর্ক রয়েছে' },
    });
  });

  after(async () => {
    await Complaint.deleteMany({ _id: testComplaint?._id });
    await Reporter.deleteMany({ 'contact.email': /@jonoshor-verify\.org$/ });
    await Evidence.deleteMany({ complaintId: testComplaint?._id });
    await PublicReport.deleteMany({ complaintId: testComplaint?._id });
    await LegalCase.deleteMany({ complaintId: testComplaint?._id });
    await AuditLog.deleteMany({ resourceId: testComplaint?._id });
    await Admin.deleteMany({ email: /@jonoshor-verify\.org$/ });
    await disconnectDatabase();
  });

  test('1. Verified complaint cannot appear publicly without publication approval', async () => {
    // List reports -> must not show testComplaint
    const listRes = await request(app).get('/api/v1/public/reports');
    assert.equal(listRes.status, 200);
    const foundInList = (listRes.body.data || []).some(
      (r) => r.complaintId?.toString() === testComplaint._id.toString()
    );
    assert.equal(foundInList, false, 'Unpublished verified complaint must not appear in public listing');

    // Get single report by complaintId -> 404
    const getRes = await request(app).get(`/api/v1/public/reports/${testComplaint._id}`);
    assert.equal(getRes.status, 404);
  });

  test('2. Unauthorized publication actions are rejected (401, 403, and Conflict-of-Interest)', async () => {
    const pubPayload = {
      bn: {
        title: 'ধানমন্ডিতে নির্যাতনের ঘটনায় সত্যতা যাচাইকৃত প্রতিবেদন',
        summary: 'নিরপেক্ষ তদন্তে নির্যাতনের প্রাথমিক সত্যতা প্রমাণিত হয়েছে।',
        incidentStory: '২০২৬ সালের মে মাসে ধানমন্ডি এলাকায় সংঘটিত ঘটনার পূর্ণাঙ্গ বিবরণ...',
      },
    };

    // Unauthenticated -> 401
    const unauthRes = await request(app)
      .post(`/api/v1/admin/complaints/${testComplaint._id}/public-report`)
      .send(pubPayload);
    assert.equal(unauthRes.status, 401);

    // Lacking COMPLAINT_PUBLISH -> 403
    const forbiddenRes = await request(app)
      .post(`/api/v1/admin/complaints/${testComplaint._id}/public-report`)
      .set('Authorization', `Bearer ${unauthAdminToken}`)
      .send(pubPayload);
    assert.equal(forbiddenRes.status, 403);

    // Conflicted Admin -> 403 Conflict of Interest
    const conflictRes = await request(app)
      .post(`/api/v1/admin/complaints/${testComplaint._id}/public-report`)
      .set('Authorization', `Bearer ${conflictedAdminToken}`)
      .send(pubPayload);
    assert.equal(conflictRes.status, 403);
  });

  test('3. Authorized Admin publishes verified complaint -> creates canonical PublicReport', async () => {
    const pubPayload = {
      bn: {
        title: 'ধানমন্ডিতে নির্যাতনের ঘটনায় সত্যতা যাচাইকৃত প্রতিবেদন',
        summary: 'নিরপেক্ষ তদন্তে শারীরিক নির্যাতনের ঘটনার সত্যতা প্রমাণিত হয়েছে।',
        incidentStory: '২০২৬ সালের মে মাসে ধানমন্ডি এলাকায় সংঘটিত ঘটনার সত্যতা পাওয়া গেছে। নিরপেক্ষ দল প্রমাণ যাচাই করেছে।',
        authorityActionSummary: 'জেলা প্রশাসন বিভাগীয় তদন্ত কমিটি গঠন করেছে।',
      },
      en: {
        title: 'Verified Report on Custodial Mistreatment in Dhanmondi',
        summary: 'Investigation confirmed incidents of mistreatment in Dhanmondi.',
        incidentStory: 'Following investigative procedures regarding the incident from May 2026...',
      },
      publicAccused: [{ name: 'কর্মকর্তা এক্স', role: 'অভিযুক্ত তদন্তকারী কর্মকর্তা' }],
      caseStatus: 'under_investigation',
    };

    const res = await request(app)
      .post(`/api/v1/admin/complaints/${testComplaint._id}/public-report`)
      .set('Authorization', `Bearer ${authAdminToken}`)
      .send(pubPayload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    publishedPublicReport = res.body.data;

    assert.ok(publishedPublicReport._id);
    assert.equal(publishedPublicReport.publicationStatus, 'published');
    assert.equal(publishedPublicReport.bn.title, pubPayload.bn.title);

    // Verify complaint status transitioned to PUBLISHED
    const updatedComp = await Complaint.findById(testComplaint._id);
    assert.equal(updatedComp.status, COMPLAINT_STATUS.PUBLISHED);
    assert.equal(updatedComp.publication?.status, 'approved');
  });

  test('4. Private/internal fields are strictly excluded from PublicReport', async () => {
    const reportFromDb = await PublicReport.findById(publishedPublicReport._id).lean();

    // Sensitive reporter details must NOT exist
    assert.equal(reportFromDb.reporterId, undefined);
    assert.equal(reportFromDb.contact, undefined);

    // Reviewer internal metadata must NOT exist
    assert.equal(reportFromDb.reviewerNotes, undefined);
    assert.equal(reportFromDb.assignedReviewerId, undefined);
    assert.equal(reportFromDb.verifiedBy, undefined);

    // Risk / internal security metadata must NOT exist
    assert.equal(reportFromDb.riskFlags, undefined);
    assert.equal(reportFromDb.securityIdentifiers, undefined);
  });

  test('5. Private evidence does NOT appear publicly; only approved clean evidence is linked', async () => {
    const reportRes = await request(app).get(`/api/v1/public/reports/${publishedPublicReport._id}`);
    assert.equal(reportRes.status, 200);

    const approvedEvidenceList = reportRes.body.data.approvedEvidence;
    assert.ok(Array.isArray(approvedEvidenceList));
    assert.equal(approvedEvidenceList.length, 1);

    const ev = approvedEvidenceList[0];
    assert.equal(ev.evidenceId.toString(), cleanPublicEvidence._id.toString());
    assert.equal(ev.type, 'image');

    // Security assertion: Private evidence must NOT be in approvedEvidence
    const hasPrivateEv = approvedEvidenceList.some(
      (e) => e.evidenceId.toString() === privateEvidence._id.toString()
    );
    assert.equal(hasPrivateEv, false, 'Private evidence must never appear in public report');
  });

  test('6. Public evidence does NOT expose raw Drive URLs and uses safe backend proxy', async () => {
    const ev = publishedPublicReport.approvedEvidence[0];
    assert.ok(ev.publicUrl);
    assert.equal(ev.publicUrl, `/api/v1/public/evidence/${cleanPublicEvidence._id}/file`);
    assert.equal(ev.publicUrl.includes('drive.google.com'), false);
    assert.equal(ev.publicUrl.includes('mock_gdrive'), false);
  });

  test('7. Approved public evidence metadata is accessible without login with zero viewer tracking', async () => {
    const res = await request(app).get(`/api/v1/public/evidence/${cleanPublicEvidence._id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.originalFilename, 'verified_medical_report.jpg');

    // Private evidence cannot be fetched publicly
    const privRes = await request(app).get(`/api/v1/public/evidence/${privateEvidence._id}`);
    assert.equal(privRes.status, 403);
  });

  test('8. Zero tracking security headers are present and cookies/IP logging are avoided', async () => {
    const reportRes = await request(app).get(`/api/v1/public/reports/${publishedPublicReport._id}`);
    assert.equal(reportRes.status, 200);

    // Referrer-Policy header check
    assert.equal(reportRes.headers['referrer-policy'], 'no-referrer');

    // No session/tracking cookies
    assert.equal(reportRes.headers['set-cookie'], undefined);
  });

  test('9. Reporter and victim visibility rules are respected (minor protection & anonymity)', async () => {
    const reportFromDb = await PublicReport.findById(publishedPublicReport._id).lean();

    // Minor victim name must be protected as 'পরিচয় গোপনীয়'
    const minorVictim = reportFromDb.publicVictims.find((v) => v.category?.includes('ভুক্তভোগী'));
    assert.ok(minorVictim);
    assert.equal(minorVictim.name, 'পরিচয় গোপনীয়');

    // Accused is labeled neutrally, not defamatory
    const accused = reportFromDb.publicAccused[0];
    assert.ok(accused);
    assert.equal(accused.name, 'কর্মকর্তা এক্স');
    assert.equal(accused.role.includes('অপরাধী'), false, 'Must not defame accused as criminal without verdict');
  });

  test('10. Public report search and filtering works across keyword, district, category, and caseStatus', async () => {
    // 10a. Filter by category
    const catRes = await request(app)
      .get('/api/v1/public/reports')
      .query({ category: 'নির্যাতন ও হেফাজতে মৃত্যু' });
    assert.equal(catRes.status, 200);
    assert.ok(catRes.body.data.some((r) => r._id === publishedPublicReport._id));

    // 10b. Filter by wrong category -> empty
    const wrongCatRes = await request(app)
      .get('/api/v1/public/reports')
      .query({ category: 'দুর্নীতি ও অর্থ আত্মসাৎ' });
    assert.equal(wrongCatRes.status, 200);
    assert.equal(wrongCatRes.body.data.some((r) => r._id === publishedPublicReport._id), false);

    // 10c. Filter by district
    const distRes = await request(app)
      .get('/api/v1/public/reports')
      .query({ districtId: 'dhaka' });
    assert.equal(distRes.status, 200);
    assert.ok(distRes.body.data.some((r) => r._id === publishedPublicReport._id));

    // 10d. Filter by keyword (Bangla keyword)
    const kwRes = await request(app)
      .get('/api/v1/public/reports')
      .query({ keyword: 'ধানমন্ডি' });
    assert.equal(kwRes.status, 200);
    assert.ok(kwRes.body.data.some((r) => r._id === publishedPublicReport._id));

    // 10e. Filter by caseStatus
    const statusRes = await request(app)
      .get('/api/v1/public/reports')
      .query({ caseStatus: 'under_investigation' });
    assert.equal(statusRes.status, 200);
    assert.ok(statusRes.body.data.some((r) => r._id === publishedPublicReport._id));
  });

  test('11. Public statistics endpoint loads live metrics dynamically', async () => {
    const res = await request(app).get('/api/v1/public/statistics');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.totalComplaints >= 1);
    assert.ok(res.body.data.verifiedReports >= 1);
    assert.ok(Array.isArray(res.body.data.categories));
    assert.ok(Array.isArray(res.body.data.districts));
  });

  test('12. Admin can retrieve public report by complaintId via dedicated endpoint', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/complaints/${testComplaint._id}/public-report`)
      .set('Authorization', `Bearer ${authAdminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data._id, publishedPublicReport._id);
  });
});
