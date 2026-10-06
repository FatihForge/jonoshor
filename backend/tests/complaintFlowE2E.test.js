import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authConfig } from '../src/config/auth.js';
import { User } from '../src/models/User.js';
import { Reporter } from '../src/models/Reporter.js';
import { Complaint } from '../src/models/Complaint.js';
import { Evidence } from '../src/models/Evidence.js';
import { CorrectionRequest } from '../src/models/CorrectionRequest.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { hashPassword } from '../src/utils/crypto.js';
import { COMPLAINT_STATUS } from '../src/constants/complaintStatus.js';

test('Task 2 E2E — Complaint + Evidence End-to-End Flow & Security', async (t) => {
  let userToken;
  let unauthorizedToken;
  let testUserId;
  let unauthorizedUserId;
  let testComplaintId;
  let testEvidenceId;
  const createdUserIds = [];
  const createdComplaintIds = [];
  const createdReporterIds = [];

  t.before(async () => {
    await connectDatabase();

    // 1. Create primary verified test user
    const primaryUser = await User.create({
      fullName: 'E2E Test User',
      email: `e2e_complaint_${Date.now()}@jonoshor.org`,
      passwordHash: await hashPassword('ValidPass123!@#'),
      emailVerified: true,
      accountStatus: 'active',
      accountType: 'user',
    });
    testUserId = primaryUser._id.toString();
    createdUserIds.push(primaryUser._id);

    userToken = jwt.sign(
      {
        id: testUserId,
        _id: testUserId,
        email: primaryUser.email,
        accountType: 'user',
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 2. Create unauthorized attacker user
    const attacker = await User.create({
      fullName: 'Attacker User',
      email: `e2e_attacker_${Date.now()}@jonoshor.org`,
      passwordHash: await hashPassword('AttackerPass123!@#'),
      emailVerified: true,
      accountStatus: 'active',
      accountType: 'user',
    });
    unauthorizedUserId = attacker._id.toString();
    createdUserIds.push(attacker._id);

    unauthorizedToken = jwt.sign(
      {
        id: unauthorizedUserId,
        _id: unauthorizedUserId,
        email: attacker.email,
        accountType: 'user',
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );
  });

  t.after(async () => {
    // Clean up all synthetic test data
    if (createdComplaintIds.length > 0) {
      await Evidence.deleteMany({ complaintId: { $in: createdComplaintIds } });
      await CorrectionRequest.deleteMany({ complaintId: { $in: createdComplaintIds } });
      await AuditLog.deleteMany({ resourceId: { $in: createdComplaintIds } });
      await Complaint.deleteMany({ _id: { $in: createdComplaintIds } });
    }
    if (createdUserIds.length > 0) {
      await Reporter.deleteMany({ accountId: { $in: createdUserIds } });
      await User.deleteMany({ _id: { $in: createdUserIds } });
    }
    if (createdReporterIds.length > 0) {
      await Reporter.deleteMany({ _id: { $in: createdReporterIds } });
    }
    await disconnectDatabase();
  });

  await t.test('1. Geographic Location Hierarchy: Division -> District -> Upazila', async () => {
    // Divisions
    const divRes = await request(app).get('/api/v1/public/divisions');
    assert.equal(divRes.status, 200);
    assert.ok(Array.isArray(divRes.body.data));
    assert.ok(divRes.body.data.length >= 8);

    // Districts by division
    const distRes = await request(app).get('/api/v1/public/districts?divisionId=dhaka');
    assert.equal(distRes.status, 200);
    assert.ok(Array.isArray(distRes.body.data));
    assert.ok(distRes.body.data.length > 0);

    // Upazilas by district
    const upaRes = await request(app).get('/api/v1/public/districts/dhaka/upazilas');
    assert.equal(upaRes.status, 200);
    assert.ok(Array.isArray(upaRes.body.data));
    assert.ok(upaRes.body.data.length > 0);
  });

  await t.test('2. Save a Draft: Authenticated user saves a draft complaint with partial fields', async () => {
    const res = await request(app)
      .post('/api/v1/user/complaints')
      .set('Cookie', [`access_token=${userToken}`])
      .send({
        isDraft: true,
        category: {
          primary: 'বেআইনি আটক ও নির্যাতন',
          secondary: ['পুলিশি বা প্রাতিষ্ঠানিক ক্ষমতার অপব্যবহার'],
        },
        location: {
          divisionId: 'dhaka',
          districtId: 'dhaka',
          upazilaId: 'mirpur',
          freeTextLocation: 'মিরপুর ১০ নম্বর গোলচত্বর',
        },
        incident: {
          datePrecision: 'approximate',
          ongoing: true,
        },
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.complaint);
    assert.equal(res.body.data.complaint.status, COMPLAINT_STATUS.DRAFT);
    testComplaintId = res.body.data.complaint._id.toString();
    createdComplaintIds.push(testComplaintId);

    // Check status history includes draft note
    const hist = res.body.data.complaint.statusHistory;
    assert.ok(hist.length >= 1);
    assert.equal(hist[0].status, COMPLAINT_STATUS.DRAFT);
  });

  await t.test('3. Re-open Draft: User retrieves their draft and sensitive reviewer info is not exposed', async () => {
    const res = await request(app)
      .get(`/api/v1/user/complaints/${testComplaintId}`)
      .set('Cookie', [`access_token=${userToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, COMPLAINT_STATUS.DRAFT);
    assert.equal(res.body.data.location.upazilaId, 'mirpur');

    // Security check: internal admin reviewer notes, risk flags, security identifiers are NOT exposed
    assert.equal(res.body.data.review?.reviewerNotes, undefined);
    assert.equal(res.body.data.review?.assignedReviewerId, undefined);
    assert.equal(res.body.data.riskFlags, undefined);
  });

  await t.test('4. Submit Complaint: Transition draft to submitted with validation', async () => {
    const res = await request(app)
      .patch(`/api/v1/user/complaints/${testComplaintId}`)
      .set('Cookie', [`access_token=${userToken}`])
      .send({
        action: 'submit',
        category: {
          primary: 'বেআইনি আটক ও নির্যাতন',
          secondary: ['পুলিশি বা প্রাতিষ্ঠানিক ক্ষমতার অপব্যবহার'],
        },
        incident: {
          startDate: new Date('2026-05-10').toISOString(),
          description: 'ঘটনার বিস্তারিত বিবরণ: মিরপুরে রাত ১১টায় বিনা পরোয়ানায় বেআইনিভাবে আটক করা হয়।',
          ongoing: false,
          datePrecision: 'exact',
        },
        location: {
          divisionId: 'dhaka',
          districtId: 'dhaka',
          upazilaId: 'mirpur',
        },
        accused: [
          {
            name: 'ওসি অমুক',
            role: 'পুলিশ কর্মকর্তা',
            organization: 'মিরপুর মডেল থানা',
          },
        ],
        victims: [
          {
            name: 'ভুক্তভোগী নাগরিক',
            ageCategory: 'adult',
            gender: 'male',
            relationshipToIncident: 'আমি নিজে',
          },
        ],
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.complaint.status, COMPLAINT_STATUS.SUBMITTED);

    // Verify submission status in database
    const inDb = await Complaint.findById(testComplaintId);
    assert.equal(inDb.status, COMPLAINT_STATUS.SUBMITTED);
  });

  await t.test('5. Create Evidence Upload Session: Google Drive session created safely', async () => {
    const res = await request(app)
      .post(`/api/v1/user/complaints/${testComplaintId}/evidence/upload-session`)
      .set('Cookie', [`access_token=${userToken}`])
      .send({
        type: 'image',
        originalFilename: 'safe_evidence_photo.jpg',
        mimeType: 'image/jpeg',
        size: 512,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.evidenceId);
    assert.ok(res.body.data.driveFileId);
    assert.ok(res.body.data.uploadUrl);
    testEvidenceId = res.body.data.evidenceId.toString();
  });

  await t.test('6. Complete Upload: Upload small safe test file buffer -> scan & store clean', async () => {
    const safeBuffer = Buffer.from('Simulated safe binary image content for JonoShor complaint evidence');

    const res = await request(app)
      .post(`/api/v1/user/complaints/${testComplaintId}/evidence/complete`)
      .set('Cookie', [`access_token=${userToken}`])
      .attach('file', safeBuffer, 'safe_evidence_photo.jpg')
      .field('evidenceId', testEvidenceId);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.uploadStatus, 'stored');
    assert.equal(res.body.data.malwareScanStatus, 'clean');
  });

  await t.test('7. Verify Evidence Appears: User lists evidence with private backend access URL', async () => {
    const res = await request(app)
      .get(`/api/v1/user/complaints/${testComplaintId}/evidence`)
      .set('Cookie', [`access_token=${userToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    const ev = res.body.data.find((e) => e._id.toString() === testEvidenceId);
    assert.ok(ev);
    assert.equal(ev.uploadStatus, 'stored');
    assert.equal(ev.malwareScanStatus, 'clean');
    assert.ok(ev.downloadUrl);

    // Private by default, no raw Drive URL leaked
    assert.ok(!ev.downloadUrl.includes('drive.google.com'));
    assert.ok(ev.downloadUrl.includes(`/evidence/${testEvidenceId}/download`));
  });

  await t.test('8. Authorized Download: Owner can download their evidence stream', async () => {
    const res = await request(app)
      .get(`/api/v1/user/complaints/${testComplaintId}/evidence/${testEvidenceId}/download`)
      .set('Cookie', [`access_token=${userToken}`]);

    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type']);
  });

  await t.test('9. Security & IDOR: Unauthorized user cannot access/complete/download that evidence', async () => {
    // Attacker cannot complete upload on User 1's complaint
    const resComplete = await request(app)
      .post(`/api/v1/user/complaints/${testComplaintId}/evidence/complete`)
      .set('Cookie', [`access_token=${unauthorizedToken}`])
      .send({ evidenceId: testEvidenceId });
    assert.equal(resComplete.status, 403);

    // Attacker cannot list evidence from User 1's complaint
    const resList = await request(app)
      .get(`/api/v1/user/complaints/${testComplaintId}/evidence`)
      .set('Cookie', [`access_token=${unauthorizedToken}`]);
    assert.equal(resList.status, 403);

    // Attacker cannot download User 1's evidence directly
    const resDownload = await request(app)
      .get(`/api/v1/user/complaints/${testComplaintId}/evidence/${testEvidenceId}/download`)
      .set('Cookie', [`access_token=${unauthorizedToken}`]);
    assert.equal(resDownload.status, 403);
  });

  await t.test('10. Structured Actions: Withdrawal, Correction and Legal update', async () => {
    // Correction request
    const correctRes = await request(app)
      .post(`/api/v1/user/complaints/${testComplaintId}/corrections`)
      .set('Cookie', [`access_token=${userToken}`])
      .send({
        requestedChanges: 'তারিখ ও অভিযুক্তের পদবি সংশোধন',
        reason: 'টাইপিং ভুল ছিল',
      });
    assert.equal(correctRes.status, 201);

    // Legal update request
    const legalRes = await request(app)
      .post(`/api/v1/user/complaints/${testComplaintId}/legal-update-request`)
      .set('Cookie', [`access_token=${userToken}`])
      .send({
        type: 'police',
        name: 'মিরপুর মডেল থানা',
        claim: 'জিডি নং ১২৩৪/২৪ দায়ের করা হয়েছে',
        reference: 'GD-1234',
      });
    assert.equal(legalRes.status, 200);

    // Withdrawal request
    const withdrawRes = await request(app)
      .post(`/api/v1/user/complaints/${testComplaintId}/withdraw`)
      .set('Cookie', [`access_token=${userToken}`])
      .send({ reason: 'পারস্পরিক মীমাংসা হয়েছে' });
    assert.equal(withdrawRes.status, 200);
  });
});
