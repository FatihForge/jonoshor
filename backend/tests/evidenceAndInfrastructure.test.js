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
import { Evidence } from '../src/models/Evidence.js';
import { hashPassword } from '../src/utils/crypto.js';
import { PERMISSIONS } from '../src/constants/permissions.js';
import { malwareScanService } from '../src/services/security/malwareScan.service.js';
import { MALWARE_SCAN_STATUS } from '../src/constants/evidenceStatus.js';

test('Phase 13, 14, 15 — Google Drive Evidence Infrastructure, Review & Public Evidence Tests', async (t) => {
  let userToken;
  let adminToken;
  let superAdminToken;
  let testUserId;
  let testAdminId;
  let testSuperAdminId;
  let testComplaintId;
  let testEvidenceId;

  t.before(async () => {
    await connectDatabase();

    // Create a verified user with reporter
    const user = await User.create({
      fullName: 'Evidence Tester',
      email: `ev_test_${Date.now()}@jonoshor.org`,
      passwordHash: await hashPassword('EvidenceSecure123!'),
      emailVerified: true,
      accountStatus: 'active',
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

    // Create an Admin with evidence permissions
    const admin = await Admin.create({
      fullName: 'Evidence Admin',
      email: `ev_admin_${Date.now()}@jonoshor.org`,
      passwordHash: await hashPassword('AdminSecurePass123!'),
      twoFactorEnabled: true,
      permissions: [
        PERMISSIONS.EVIDENCE_READ,
        PERMISSIONS.EVIDENCE_REVIEW,
        PERMISSIONS.EVIDENCE_PUBLISH,
        PERMISSIONS.EVIDENCE_DELETE,
      ],
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

    // Create a SuperAdmin for storage infrastructure endpoints
    const superAdmin = await SuperAdmin.create({
      fullName: 'Storage SuperAdmin',
      email: `ev_super_${Date.now()}@jonoshor.org`,
      passwordHash: await hashPassword('SuperSecurePass123!'),
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

    // Create a complaint for user
    const complaint = await Complaint.create({
      trackingNumber: `JS-EV-${Date.now()}`,
      reporterId: reporter._id,
      submissionType: 'user',
      category: { primary: 'freedom_of_speech' },
      incident: {
        startDate: new Date(),
        datePrecision: 'exact',
        description: 'Test incident description for evidence verification.',
      },
      location: {
        divisionId: 'dhaka',
        districtId: 'dhaka',
        upazilaId: 'dhanmondi',
      },
      contact: { email: user.email },
    });
    testComplaintId = complaint._id.toString();
  });

  t.after(async () => {
    await Evidence.deleteMany({ complaintId: testComplaintId });
    await Complaint.deleteMany({ trackingNumber: /JS-EV-/ });
    await User.deleteMany({ _id: testUserId });
    await Admin.deleteMany({ _id: testAdminId });
    await SuperAdmin.deleteMany({ _id: testSuperAdminId });
    await disconnectDatabase();
  });

  await t.test('1. User creates an upload session for Google Drive evidence storage', async () => {
    const res = await request(app)
      .post(`/api/v1/user/complaints/${testComplaintId}/evidence/upload-session`)
      .set('Cookie', [`access_token=${userToken}`])
      .send({
        type: 'image',
        originalFilename: 'protest_photo.jpg',
        mimeType: 'image/jpeg',
        size: 204800,
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.uploadUrl);
    assert.ok(res.body.data.evidenceId);
    assert.ok(res.body.data.driveFileId);
    testEvidenceId = res.body.data.evidenceId;
  });

  await t.test('2. Upload session rejects unapproved mime types', async () => {
    const res = await request(app)
      .post(`/api/v1/user/complaints/${testComplaintId}/evidence/upload-session`)
      .set('Cookie', [`access_token=${userToken}`])
      .send({
        type: 'document',
        originalFilename: 'malicious.exe',
        mimeType: 'application/x-msdownload',
        size: 1024,
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  await t.test('2b. Object ownership: Attacker cannot complete another user\'s evidence upload (IDOR prevention)', async () => {
    const attackerToken = jwt.sign(
      {
        id: '670000000000000000000099',
        _id: '670000000000000000000099',
        email: 'attacker@jonoshor.org',
        accountType: 'user',
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post(`/api/v1/user/complaints/${testComplaintId}/evidence/complete`)
      .set('Cookie', [`access_token=${attackerToken}`])
      .send({
        evidenceId: testEvidenceId,
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('3. Complete upload executes malware scan and moves file to clean folder', async () => {
    const res = await request(app)
      .post(`/api/v1/user/complaints/${testComplaintId}/evidence/complete`)
      .set('Cookie', [`access_token=${userToken}`])
      .send({
        evidenceId: testEvidenceId,
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.uploadStatus, 'stored');
    assert.equal(res.body.data.malwareScanStatus, 'clean');
    assert.ok(res.body.data.driveFileId);
  });

  await t.test('4. Add external evidence link with SSRF safety check', async () => {
    // Valid public URL
    const resValid = await request(app)
      .post(`/api/v1/user/complaints/${testComplaintId}/evidence/external`)
      .set('Cookie', [`access_token=${userToken}`])
      .send({
        url: 'https://news.example.com/report/12345',
        sourceType: 'news_report',
      });

    assert.equal(resValid.status, 201);
    assert.equal(resValid.body.success, true);

    // Blocked SSRF loopback/private URL
    const resSSRF = await request(app)
      .post(`/api/v1/user/complaints/${testComplaintId}/evidence/external`)
      .set('Cookie', [`access_token=${userToken}`])
      .send({
        url: 'http://169.254.169.254/latest/meta-data',
        sourceType: 'metadata',
      });

    assert.equal(resSSRF.status, 400);
    assert.equal(resSSRF.body.success, false);
  });

  await t.test('5. User lists permitted complaint evidence with private backend access link', async () => {
    const res = await request(app)
      .get(`/api/v1/user/complaints/${testComplaintId}/evidence`)
      .set('Cookie', [`access_token=${userToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 2);
    // Find our uploaded stored evidence
    const stored = res.body.data.find((e) => e._id === testEvidenceId);
    assert.ok(stored);
    assert.ok(stored.downloadUrl);
    // Never expose Google Drive raw sharing URLs directly
    assert.ok(!stored.downloadUrl.includes('drive.google.com'));
    assert.ok(!stored.downloadUrl.includes('storage.googleapis.com'));
    assert.ok(stored.downloadUrl.includes(`/evidence/${testEvidenceId}/download`));
  });

  await t.test('6. Authenticated user can stream their private evidence', async () => {
    const res = await request(app)
      .get(`/api/v1/user/complaints/${testComplaintId}/evidence/${testEvidenceId}/download`)
      .set('Cookie', [`access_token=${userToken}`]);

    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type']);
    assert.ok(res.headers['content-disposition']);
  });

  await t.test('7. Admin reviews evidence (relevance, credibility, malware clean)', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/evidence/${testEvidenceId}/review`)
      .set('Cookie', [`access_token=${adminToken}`])
      .send({
        reviewStatus: 'reviewed',
        malwareScanStatus: 'clean',
        notes: 'Verified authenticity through photographic metadata.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.reviewStatus, 'reviewed');
  });

  await t.test('8. Admin approves evidence for public disclosure', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/evidence/${testEvidenceId}/publication`)
      .set('Cookie', [`access_token=${adminToken}`])
      .send({
        publicStatus: 'approved_public',
        redactionStatus: 'completed',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.publicStatus, 'approved_public');
  });

  await t.test('9. Public evidence viewer retrieves approved evidence metadata without tracking', async () => {
    const res = await request(app).get(`/api/v1/public/evidence/${testEvidenceId}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.publicUrl);
    // Points to zero-tracking backend stream, never raw Google Drive URL
    assert.ok(res.body.data.publicUrl.includes(`/api/v1/public/evidence/${testEvidenceId}/file`));
    assert.equal(res.body.data.redactionStatus, 'completed');
  });

  await t.test('10. Public evidence file stream enforces zero viewer tracking headers', async () => {
    const res = await request(app).get(`/api/v1/public/evidence/${testEvidenceId}/file`);

    assert.equal(res.status, 200);
    // Verified zero tracking: referrer stripped, CORS enabled, no tracking cookies
    assert.equal(res.headers['referrer-policy'], 'no-referrer');
    assert.equal(res.headers['cross-origin-resource-policy'], 'cross-origin');
    assert.ok(!res.headers['set-cookie']);
  });

  await t.test('11. Real malware scanning engine detects EICAR test signature and rejects', async () => {
    const eicarBuffer = Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');
    const scanResult = await malwareScanService.scanBuffer({
      buffer: eicarBuffer,
      filename: 'test_virus.com',
      mimeType: 'application/octet-stream',
    });

    assert.equal(scanResult.status, MALWARE_SCAN_STATUS.MALICIOUS);
    assert.ok(scanResult.threats.includes('EICAR_ANTIVIRUS_TEST_SIGNATURE'));
  });

  await t.test('12. Admin cannot delete evidence when blocked by legal hold', async () => {
    // Set legal hold flag
    await Evidence.findByIdAndUpdate(testEvidenceId, {
      'deletionStatus.blocked_by_legal_hold': true,
    });

    const res = await request(app)
      .post(`/api/v1/admin/evidence/${testEvidenceId}/delete`)
      .set('Cookie', [`access_token=${adminToken}`])
      .send({ reason: 'Routine cleanup' });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  await t.test('13. SuperAdmin inspects Google Drive storage status & initializes folders', async () => {
    const resStatus = await request(app)
      .get('/api/v1/super-admin/storage/google-drive/status')
      .set('Cookie', [`access_token=${superAdminToken}`]);

    assert.equal(resStatus.status, 200);
    assert.equal(resStatus.body.success, true);
    assert.equal(resStatus.body.data.provider, 'google-drive');
    assert.ok(resStatus.body.data.folders);

    const resInit = await request(app)
      .post('/api/v1/super-admin/storage/google-drive/init-folders')
      .set('Cookie', [`access_token=${superAdminToken}`]);

    assert.equal(resInit.status, 200);
    assert.equal(resInit.body.success, true);
    assert.ok(resInit.body.data.folders);
  });
});
