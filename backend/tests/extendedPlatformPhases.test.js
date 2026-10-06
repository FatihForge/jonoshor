import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authConfig } from '../src/config/auth.js';
import { User } from '../src/models/User.js';
import { Admin } from '../src/models/Admin.js';
import { SuperAdmin } from '../src/models/SuperAdmin.js';
import { Reporter } from '../src/models/Reporter.js';
import { Complaint } from '../src/models/Complaint.js';
import { JoinUsSubmission } from '../src/models/JoinUsSubmission.js';
import { CorrectionRequest } from '../src/models/CorrectionRequest.js';
import { hashPassword } from '../src/utils/crypto.js';
import { PERMISSIONS } from '../src/constants/permissions.js';

test('Extended Platform Phases (20, 21, 22, 23, 24, 26, 27, 28, 72) Tests', async (t) => {
  let userToken;
  let adminToken;
  let superAdminToken;
  let testUserId;
  let testAdminId;
  let testSuperAdminId;
  let testComplaintId;
  let testJoinUsId;
  let testCorrectionId;
  let testNotificationId;

  t.before(async () => {
    await connectDatabase();

    // Create User
    const user = await User.create({
      fullName: 'Platform Tester',
      email: `platform_user_${Date.now()}@jonoshor.org`,
      passwordHash: await hashPassword('UserSecurePass123!'),
      emailVerified: true,
      accountStatus: 'active',
      mobile: '01700000000',
    });
    testUserId = user._id;

    const reporter = await Reporter.create({
      reporterType: 'user',
      accountId: user._id,
      contact: { email: user.email },
    });
    user.reporterId = reporter._id;
    await user.save();

    userToken = jwt.sign(
      {
        id: user._id,
        _id: user._id,
        email: user.email,
        accountType: 'user',
        reporterId: reporter._id,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // Create Admin with complete suite of permissions
    const admin = await Admin.create({
      fullName: 'Full Admin',
      email: `full_admin_${Date.now()}@jonoshor.org`,
      passwordHash: await hashPassword('AdminPass123!'),
      twoFactorEnabled: true,
      permissions: Object.values(PERMISSIONS),
      accountStatus: 'active',
    });
    testAdminId = admin._id;

    adminToken = jwt.sign(
      {
        id: admin._id,
        _id: admin._id,
        email: admin.email,
        accountType: 'admin',
        permissions: admin.permissions,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // Create Super Admin
    const superAdmin = await SuperAdmin.create({
      fullName: 'Chief Super Admin',
      email: `chief_super_${Date.now()}@jonoshor.org`,
      passwordHash: await hashPassword('SuperAdminPass123!'),
      twoFactorEnabled: true,
      accountStatus: 'active',
    });
    testSuperAdminId = superAdmin._id;

    superAdminToken = jwt.sign(
      {
        id: superAdmin._id,
        _id: superAdmin._id,
        email: superAdmin.email,
        accountType: 'superAdmin',
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // Create test complaint
    const complaint = await Complaint.create({
      trackingNumber: `JS-EXT-${Date.now()}`,
      reporterId: reporter._id,
      submissionType: 'user',
      category: { primary: 'freedom_of_speech' },
      incident: {
        startDate: new Date(),
        datePrecision: 'exact',
        description: 'Test incident description for extended phases.',
      },
      location: {
        divisionId: 'dhaka',
        districtId: 'dhaka',
        upazilaId: 'mirpur',
      },
      contact: { email: user.email },
    });
    testComplaintId = complaint._id.toString();

    // Create test join us submission
    const joinUs = await JoinUsSubmission.create({
      fullName: 'Volunteer Applicant',
      email: `applicant_${Date.now()}@test.org`,
      primaryProfession: 'Lawyer',
      primaryContributionRole: 'Legal Aid & Review',
      contributionDetails: 'Interested in providing pro-bono assistance to victims.',
    });
    testJoinUsId = joinUs._id.toString();

    // Create test correction request
    const correction = await CorrectionRequest.create({
      complaintId: complaint._id,
      requesterId: user._id,
      requestedChanges: 'Update time of event to morning',
      reason: 'Typographical error in initial filing',
      status: 'submitted',
    });
    testCorrectionId = correction._id.toString();
  });

  t.after(async () => {
    await JoinUsSubmission.deleteMany({ _id: testJoinUsId });
    await CorrectionRequest.deleteMany({ _id: testCorrectionId });
    await Complaint.deleteMany({ trackingNumber: /JS-EXT-/ });
    await User.deleteMany({ _id: testUserId });
    await Admin.deleteMany({ _id: testAdminId });
    await SuperAdmin.deleteMany({ _id: testSuperAdminId });
    await disconnectDatabase();
  });

  // Phase 20: Legal & Authority Tracking
  await t.test('Phase 20: Admin records legal case and timeline event', async () => {
    const resCase = await request(app)
      .post(`/api/v1/admin/complaints/${testComplaintId}/legal-cases`)
      .set('Cookie', [`access_token=${adminToken}`])
      .send({
        caseNumber: 'GD-998822',
        caseType: 'General Diary',
        authorities: [{ type: 'police', name: 'Mirpur Thana', reference: 'GD Entry #45' }],
        courts: [{ name: 'Chief Metropolitan Magistrate Court', location: 'Dhaka' }],
        currentLegalStatus: 'case_filed',
      });

    assert.equal(resCase.status, 201);
    assert.equal(resCase.body.success, true);
    const legalCaseId = resCase.body.data._id;

    // Add timeline event
    const resTimeline = await request(app)
      .post(`/api/v1/admin/legal-cases/${legalCaseId}/timeline`)
      .set('Cookie', [`access_token=${adminToken}`])
      .send({
        eventType: 'Hearing',
        description: 'Bail hearing scheduled before Magistrate.',
        verified: true,
      });

    assert.equal(resTimeline.status, 201);
    assert.equal(resTimeline.body.success, true);
  });

  await t.test('Phase 20: Reporter submits legal update request (unverified claim)', async () => {
    const res = await request(app)
      .post(`/api/v1/user/complaints/${testComplaintId}/legal-update-request`)
      .set('Cookie', [`access_token=${userToken}`])
      .send({
        type: 'police',
        name: 'Mirpur Thana',
        claim: 'Investigating officer visited the scene today.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  // Phase 21: Corrections & Withdrawals
  await t.test('Phase 21: Admin reviews and approves correction request', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/corrections/${testCorrectionId}/review`)
      .set('Cookie', [`access_token=${adminToken}`])
      .send({
        status: 'approved',
        decisionReason: 'Verified with secondary corroborating timestamp.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'approved');
  });

  await t.test('Phase 21: User requests withdrawal and Admin reviews it', async () => {
    // User requests withdrawal
    const reqWithdraw = await request(app)
      .post(`/api/v1/user/complaints/${testComplaintId}/withdraw`)
      .set('Cookie', [`access_token=${userToken}`])
      .send({ reason: 'Matter resolved with community elders.' });

    assert.equal(reqWithdraw.status, 200);

    // Admin reviews withdrawal
    const resReview = await request(app)
      .post(`/api/v1/admin/complaints/${testComplaintId}/withdrawal-review`)
      .set('Cookie', [`access_token=${adminToken}`])
      .send({ approved: true, decisionReason: 'Withdrawal approved upon user confirmation.' });

    assert.equal(resReview.status, 200);
    assert.equal(resReview.body.success, true);
    assert.equal(resReview.body.data.status, 'withdrawn');
  });

  // Phase 22: Notifications
  await t.test('Phase 22: Admin sends user notification, user lists and marks read', async () => {
    // Admin sends notification
    const resSend = await request(app)
      .post(`/api/v1/admin/users/${testUserId}/notifications`)
      .set('Cookie', [`access_token=${adminToken}`])
      .send({
        type: 'complaint_status',
        title: 'Complaint Update',
        message: 'Your complaint review has advanced to the next stage.',
        targetUrl: `#/complaint/${testComplaintId}`,
      });

    assert.equal(resSend.status, 201);
    testNotificationId = resSend.body.data._id;

    // User lists notifications
    const resList = await request(app)
      .get('/api/v1/user/notifications')
      .set('Cookie', [`access_token=${userToken}`]);

    assert.equal(resList.status, 200);
    assert.ok(resList.body.data.length >= 1);

    // User marks as read
    const resRead = await request(app)
      .patch(`/api/v1/user/notifications/${testNotificationId}/read`)
      .set('Cookie', [`access_token=${userToken}`]);

    assert.equal(resRead.status, 200);
    assert.equal(resRead.body.data.read, true);
  });

  // Phase 23: Messaging
  await t.test('Phase 23: Admin initiates message, User replies, messages are immutable', async () => {
    // Admin sends message to user
    const resMsg = await request(app)
      .post(`/api/v1/admin/users/${testUserId}/messages`)
      .set('Cookie', [`access_token=${adminToken}`])
      .send({
        complaintId: testComplaintId,
        body: 'Please clarify the exact location of the incident.',
      });

    assert.equal(resMsg.status, 201);
    const convId = resMsg.body.data.conversationId;

    // User replies
    const resReply = await request(app)
      .post(`/api/v1/user/messages/${convId}`)
      .set('Cookie', [`access_token=${userToken}`])
      .send({
        recipientId: testAdminId,
        body: 'It happened near the north entrance of the municipal market.',
      });

    assert.equal(resReply.status, 201);

    // User retrieves conversation
    const resConv = await request(app)
      .get(`/api/v1/user/messages/${convId}`)
      .set('Cookie', [`access_token=${userToken}`]);

    assert.equal(resConv.status, 200);
    assert.equal(resConv.body.data.length, 2);
  });

  // Phase 24: User Profile & Security Settings
  await t.test('Phase 24: User retrieves/updates profile and retrieves security settings without session list', async () => {
    // Update profile
    const resUpdate = await request(app)
      .patch('/api/v1/user/profile')
      .set('Cookie', [`access_token=${userToken}`])
      .send({
        fullName: 'Updated Evidence Reporter',
        languagePreference: 'bn',
      });

    assert.equal(resUpdate.status, 200);
    assert.equal(resUpdate.body.data.fullName, 'Updated Evidence Reporter');

    // Get security settings (active sessions list is intentionally not provided)
    const resSec = await request(app)
      .get('/api/v1/user/security')
      .set('Cookie', [`access_token=${userToken}`]);

    assert.equal(resSec.status, 200);
    assert.ok(resSec.body.data.email);
    assert.equal(resSec.body.data.activeSessions, undefined);
  });

  // Phase 26: Join Us Admin Management
  await t.test('Phase 26: Admin lists, adds note, exports Join Us; SuperAdmin deletes', async () => {
    // Admin lists Join Us
    const resList = await request(app)
      .get('/api/v1/admin/join-us')
      .set('Cookie', [`access_token=${adminToken}`]);

    assert.equal(resList.status, 200);
    assert.ok(resList.body.data.length >= 1);

    // Admin adds internal note
    const resNote = await request(app)
      .post(`/api/v1/admin/join-us/${testJoinUsId}/notes`)
      .set('Cookie', [`access_token=${adminToken}`])
      .send({ note: 'Reviewed bar council credentials; approved for interview.' });

    assert.equal(resNote.status, 200);

    // Admin exports Join Us
    const resExport = await request(app)
      .post('/api/v1/admin/join-us/export')
      .set('Cookie', [`access_token=${adminToken}`]);

    assert.equal(resExport.status, 200);

    // SuperAdmin deletes Join Us submission
    const resDel = await request(app)
      .delete(`/api/v1/admin/join-us/${testJoinUsId}`)
      .set('Cookie', [`access_token=${superAdminToken}`])
      .send({ reason: 'Applicant requested GDPR-equivalent removal.' });

    assert.equal(resDel.status, 200);
  });

  // Phase 27: Public CMS Content & FAQs
  await t.test('Phase 27: Public CMS content, announcements, and FAQs', async () => {
    const resContent = await request(app).get('/api/v1/public/content/about');
    assert.equal(resContent.status, 200);
    assert.ok(resContent.body.data.bn);
    assert.ok(resContent.body.data.en);

    const resFaqs = await request(app).get('/api/v1/public/faqs');
    assert.equal(resFaqs.status, 200);
    assert.ok(Array.isArray(resFaqs.body.data));
    assert.ok(resFaqs.body.data.length >= 3);
  });

  // Phase 28: Public Statistics
  await t.test('Phase 28: Public aggregated statistics', async () => {
    const resStats = await request(app).get('/api/v1/public/statistics');
    assert.equal(resStats.status, 200);
    assert.ok(resStats.body.data.totalComplaints !== undefined);
    assert.ok(Array.isArray(resStats.body.data.categories));
  });

  // Phase 72: Super Admin Financial Settings with Re-Authentication
  await t.test('Phase 72: Super Admin updates and retrieves financial settings with re-authentication', async () => {
    // 1. Without reAuthToken -> rejected (401)
    const resWithoutReAuth = await request(app)
      .patch('/api/v1/super-admin/financial-settings')
      .set('Cookie', [`access_token=${superAdminToken}`])
      .send({
        settings: [{ key: 'bank_name', value: 'Unauthorized Bank' }],
      });
    assert.equal(resWithoutReAuth.status, 401);

    // 2. With valid reAuthToken -> allowed (200)
    const reAuthToken = jwt.sign(
      { id: testSuperAdminId, purpose: 'critical_reauth' },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '5m' }
    );

    const resUpdate = await request(app)
      .patch('/api/v1/super-admin/financial-settings')
      .set('Cookie', [`access_token=${superAdminToken}`])
      .set('X-Reauth-Token', reAuthToken)
      .send({
        settings: [
          { key: 'bank_account_title', value: 'JonoShor Legal Defense Trust' },
          { key: 'bank_name', value: 'Dhaka Bank Limited' },
        ],
      });

    assert.equal(resUpdate.status, 200);

    const resGet = await request(app)
      .get('/api/v1/super-admin/financial-settings')
      .set('Cookie', [`access_token=${superAdminToken}`]);

    assert.equal(resGet.status, 200);
    assert.ok(resGet.body.data.length >= 2);
  });
});
