import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authConfig } from '../src/config/auth.js';
import { User } from '../src/models/User.js';
import { Admin } from '../src/models/Admin.js';
import { SuperAdmin } from '../src/models/SuperAdmin.js';
import { Complaint } from '../src/models/Complaint.js';
import { Reporter } from '../src/models/Reporter.js';
import { Evidence } from '../src/models/Evidence.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { hashPassword } from '../src/utils/crypto.js';
import { PERMISSIONS } from '../src/constants/permissions.js';
import { COMPLAINT_STATUS } from '../src/constants/complaintStatus.js';

describe('Admin Evidence Review Integration & Security', () => {
  const testId = Date.now();
  const testEmailPrefix = `ev_rev_${testId}`;

  let adminUser;
  let adminToken;
  let adminNoPermToken;
  let adminConflictedUser;
  let adminConflictedToken;
  let regularUserToken;
  let superAdminToken;

  let testUserId;
  let testComplaint;
  let testEvidenceClean;
  let testEvidenceMalicious;

  before(async () => {
    await connectDatabase();

    const defaultPasswordHash = await hashPassword('SecurePass123!');

    // 1. Regular User
    const regUser = await User.create({
      fullName: 'Evidence Uploader',
      email: `${testEmailPrefix}_user@jonoshor-test.org`,
      passwordHash: defaultPasswordHash,
      accountStatus: 'active',
      emailVerified: true,
    });
    testUserId = regUser._id;
    regularUserToken = jwt.sign(
      {
        id: regUser._id,
        _id: regUser._id,
        email: regUser.email,
        accountType: 'user',
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 2. Reporter & Complaint
    const reporter = await Reporter.create({
      reporterType: 'user',
      accountId: regUser._id,
      contact: { email: regUser.email, mobile: '01711111111' },
      isAnonymous: false,
    });

    testComplaint = await Complaint.create({
      complaintNumber: `CMP-${testId}-EV`,
      title: 'Evidence Review Integration Test',
      reporterId: reporter._id,
      submissionType: 'user',
      category: {
        primary: 'corruption',
        secondary: ['bribery'],
      },
      incident: {
        startDate: new Date(),
        description: 'Complaint for testing evidence administrative review.',
      },
      location: {
        divisionId: 'dhaka',
        districtId: 'dhaka',
        upazilaId: 'gulshan',
        freeTextLocation: 'Gulshan 2',
      },
      status: COMPLAINT_STATUS.EVIDENCE_REVIEW,
      priority: { level: 'high' },
      sensitivity: { level: 'medium' },
    });

    // 3. Clean Evidence item
    testEvidenceClean = await Evidence.create({
      complaintId: testComplaint._id,
      uploaderId: regUser._id,
      type: 'document',
      originalFilename: 'verified_audit_document.pdf',
      mimeType: 'application/pdf',
      size: 15360,
      driveFileId: `mock_gdrive_clean_${testId}`,
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      uploadStatus: 'stored',
      malwareScanStatus: 'clean',
      reviewStatus: 'pending',
      publicStatus: 'private',
    });

    // 4. Malicious Evidence item
    testEvidenceMalicious = await Evidence.create({
      complaintId: testComplaint._id,
      uploaderId: regUser._id,
      type: 'image',
      originalFilename: 'infected_trojan_photo.jpg',
      mimeType: 'image/jpeg',
      size: 5120,
      driveFileId: `mock_gdrive_malicious_${testId}`,
      sha256: '44d88612fea8a8f36de82e1278abb02f',
      uploadStatus: 'stored',
      malwareScanStatus: 'malicious',
      reviewStatus: 'pending',
      publicStatus: 'private',
    });

    // 5. Authorized Admin with evidence review & read permissions
    adminUser = await Admin.create({
      fullName: 'Evidence Review Officer',
      email: `${testEmailPrefix}_admin_auth@jonoshor-test.org`,
      passwordHash: defaultPasswordHash,
      permissions: [
        PERMISSIONS.EVIDENCE_READ,
        PERMISSIONS.EVIDENCE_REVIEW,
        PERMISSIONS.EVIDENCE_PUBLISH,
        PERMISSIONS.EVIDENCE_DELETE,
      ],
      accountStatus: 'active',
      twoFactorEnabled: true,
    });
    adminToken = jwt.sign(
      {
        id: adminUser._id,
        _id: adminUser._id,
        email: adminUser.email,
        accountType: 'admin',
        permissions: adminUser.permissions,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 6. Admin lacking evidence permissions
    const adminNoPerm = await Admin.create({
      fullName: 'No Evidence Perm Admin',
      email: `${testEmailPrefix}_admin_noperm@jonoshor-test.org`,
      passwordHash: defaultPasswordHash,
      permissions: [PERMISSIONS.COMPLAINT_READ],
      accountStatus: 'active',
      twoFactorEnabled: true,
    });
    adminNoPermToken = jwt.sign(
      {
        id: adminNoPerm._id,
        _id: adminNoPerm._id,
        email: adminNoPerm.email,
        accountType: 'admin',
        permissions: adminNoPerm.permissions,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 7. Conflicted Admin who has declared conflict on testComplaint
    adminConflictedUser = await Admin.create({
      fullName: 'Conflicted Admin',
      email: `${testEmailPrefix}_admin_conflict@jonoshor-test.org`,
      passwordHash: defaultPasswordHash,
      permissions: [
        PERMISSIONS.EVIDENCE_READ,
        PERMISSIONS.EVIDENCE_REVIEW,
        PERMISSIONS.EVIDENCE_PUBLISH,
      ],
      accountStatus: 'active',
      twoFactorEnabled: true,
    });
    adminConflictedToken = jwt.sign(
      {
        id: adminConflictedUser._id,
        _id: adminConflictedUser._id,
        email: adminConflictedUser.email,
        accountType: 'admin',
        permissions: adminConflictedUser.permissions,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // Record conflict of interest in AuditLog for this admin on testComplaint
    await AuditLog.create({
      actorId: adminConflictedUser._id,
      actorType: 'admin',
      action: 'CONFLICT_OF_INTEREST_DECLARED',
      resourceType: 'complaint',
      resourceId: testComplaint._id,
      metadata: { reason: 'Relative of complainant' },
    });

    // 8. Super Admin
    const superAdmin = await SuperAdmin.create({
      fullName: 'Super Admin Evidence Test',
      email: `${testEmailPrefix}_superadmin@jonoshor-test.org`,
      passwordHash: defaultPasswordHash,
      accountStatus: 'active',
      twoFactorEnabled: true,
    });
    superAdminToken = jwt.sign(
      {
        id: superAdmin._id,
        _id: superAdmin._id,
        email: superAdmin.email,
        accountType: 'superAdmin',
        permissions: ['*'],
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );
  });

  after(async () => {
    await Complaint.deleteMany({ _id: testComplaint._id });
    await Evidence.deleteMany({ _id: { $in: [testEvidenceClean._id, testEvidenceMalicious._id] } });
    if (testUserId) await Reporter.deleteMany({ accountId: testUserId });
    await User.deleteMany({ email: new RegExp(`^${testEmailPrefix}`) });
    await Admin.deleteMany({ email: new RegExp(`^${testEmailPrefix}`) });
    await SuperAdmin.deleteMany({ email: new RegExp(`^${testEmailPrefix}`) });
    await AuditLog.deleteMany({ resourceId: { $in: [testComplaint._id, testEvidenceClean._id, testEvidenceMalicious._id] } });
    await disconnectDatabase();
  });

  test('1. Admin can list authorized evidence (GET /api/v1/admin/evidence)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/evidence')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.meta);
    assert.ok(typeof res.body.meta.total === 'number');

    const cleanItem = res.body.data.find((e) => e._id.toString() === testEvidenceClean._id.toString());
    assert.ok(cleanItem);
    assert.equal(cleanItem.originalFilename, 'verified_audit_document.pdf');
    assert.equal(cleanItem.type, 'document');
    assert.equal(cleanItem.complaintId.complaintNumber, testComplaint.complaintNumber);
  });

  test('2. Evidence metadata is displayed safely without exposing raw Google Drive URLs or secrets', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/evidence/${testEvidenceClean._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const ev = res.body.data;

    // Checks safe metadata
    assert.equal(ev._id.toString(), testEvidenceClean._id.toString());
    assert.equal(ev.type, 'document');
    assert.equal(ev.mimeType, 'application/pdf');
    assert.equal(ev.size, 15360);
    assert.equal(ev.malwareScanStatus, 'clean');

    // Never expose raw Google Drive URLs
    const serialized = JSON.stringify(ev);
    assert.equal(serialized.includes('https://drive.google.com'), false);
    assert.equal(serialized.includes('refresh_token'), false);
    assert.equal(serialized.includes('client_secret'), false);

    // Protected download URL points to backend authorization gateway
    assert.ok(ev.downloadUrl.includes(`/api/v1/admin/evidence/${testEvidenceClean._id}/file`));
  });

  test('3. Malware status is displayed and malicious evidence cannot be approved as reviewed', async () => {
    // Attempting to approve evidence flagged as malicious must be rejected
    const res = await request(app)
      .post(`/api/v1/admin/evidence/${testEvidenceMalicious._id}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        reviewStatus: 'reviewed',
        notes: 'Trying to approve malicious file',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('malicious'));
  });

  test('4. Review action reaches correct backend endpoint and updates review status (POST /api/v1/admin/evidence/:id/review)', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/evidence/${testEvidenceClean._id}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        reviewStatus: 'reviewed',
        notes: 'Document content verified against official tax registry.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.reviewStatus, 'reviewed');

    // Verify DB update
    const dbEv = await Evidence.findById(testEvidenceClean._id);
    assert.equal(dbEv.reviewStatus, 'reviewed');
  });

  test('5. Audit log is created for evidence review action', async () => {
    const audit = await AuditLog.findOne({
      resourceId: testEvidenceClean._id,
      action: 'EVIDENCE_REVIEW',
    });

    assert.ok(audit);
    assert.equal(audit.actorId.toString(), adminUser._id.toString());
    assert.equal(audit.metadata.reviewStatus, 'reviewed');
    assert.equal(audit.metadata.notes, 'Document content verified against official tax registry.');
  });

  test('6. Public approval rejects un-scanned or non-clean evidence', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/evidence/${testEvidenceMalicious._id}/publication`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        publicStatus: 'approved_public',
        redactionStatus: 'none',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('malware scan'));
  });

  test('7. Admin approves clean evidence for public disclosure (POST /api/v1/admin/evidence/:id/publication)', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/evidence/${testEvidenceClean._id}/publication`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        publicStatus: 'approved_public',
        redactionStatus: 'completed',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.publicStatus, 'approved_public');
    assert.equal(res.body.data.redactionStatus, 'completed');
  });

  test('8. Audit log is created for public approval action', async () => {
    const audit = await AuditLog.findOne({
      resourceId: testEvidenceClean._id,
      action: 'EVIDENCE_PUBLISH_UPDATE',
    });

    assert.ok(audit);
    assert.equal(audit.actorId.toString(), adminUser._id.toString());
    assert.equal(audit.metadata.publicStatus, 'approved_public');
    assert.equal(audit.metadata.redactionStatus, 'completed');
  });

  test('9. Public evidence is accessible without login after approval, with zero viewer tracking', async () => {
    // 1. Metadata check without auth
    const metaRes = await request(app).get(`/api/v1/public/evidence/${testEvidenceClean._id}`);
    assert.equal(metaRes.status, 200);
    assert.equal(metaRes.body.success, true);
    assert.equal(metaRes.body.data.redactionStatus, 'completed');
    assert.ok(metaRes.body.data.publicUrl);
    // Public URL must proxy through backend, never direct Google Drive
    assert.ok(metaRes.body.data.publicUrl.includes(`/api/v1/public/evidence/${testEvidenceClean._id}/file`));

    // 2. Stream headers check (strictly zero tracking)
    const streamRes = await request(app).get(`/api/v1/public/evidence/${testEvidenceClean._id}/file`);
    assert.equal(streamRes.status, 200);
    assert.equal(streamRes.headers['referrer-policy'], 'no-referrer');
    assert.equal(streamRes.headers['cross-origin-resource-policy'], 'cross-origin');
    assert.equal(streamRes.headers['set-cookie'], undefined);
  });

  test('10. Unauthorized user (unauthenticated and regular user) is rejected with 401 / 403', async () => {
    // Unauthenticated
    const noAuth = await request(app).get('/api/v1/admin/evidence');
    assert.equal(noAuth.status, 401);

    // Regular user attempting admin evidence endpoint
    const regRes = await request(app)
      .get('/api/v1/admin/evidence')
      .set('Authorization', `Bearer ${regularUserToken}`);
    assert.equal(regRes.status, 403);
  });

  test('11. Unauthorized Admin (lacking EVIDENCE_READ) is rejected with 403', async () => {
    const res = await request(app)
      .get('/api/v1/admin/evidence')
      .set('Authorization', `Bearer ${adminNoPermToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('evidence.read'));
  });

  test('12. Conflicted Admin cannot access or review evidence belonging to conflicted complaint', async () => {
    // 1. Direct GET details for conflicted complaint's evidence
    const getRes = await request(app)
      .get(`/api/v1/admin/evidence/${testEvidenceClean._id}`)
      .set('Authorization', `Bearer ${adminConflictedToken}`);
    assert.equal(getRes.status, 403);
    assert.equal(getRes.body.error.code, 'CONFLICT_OF_INTEREST');

    // 2. Review action on conflicted complaint's evidence
    const revRes = await request(app)
      .post(`/api/v1/admin/evidence/${testEvidenceClean._id}/review`)
      .set('Authorization', `Bearer ${adminConflictedToken}`)
      .send({ reviewStatus: 'under_review' });
    assert.equal(revRes.status, 403);
    assert.equal(revRes.body.error.code, 'CONFLICT_OF_INTEREST');

    // 3. Evidence list automatically excludes conflicted complaint's evidence
    const listRes = await request(app)
      .get('/api/v1/admin/evidence')
      .set('Authorization', `Bearer ${adminConflictedToken}`);
    assert.equal(listRes.status, 200);
    const hasConflictedItem = listRes.body.data.some(
      (e) => e._id.toString() === testEvidenceClean._id.toString()
    );
    assert.equal(hasConflictedItem, false);
  });

  test('13. Super Admin has full administrative access to evidence review endpoints', async () => {
    const listRes = await request(app)
      .get('/api/v1/admin/evidence')
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert.equal(listRes.status, 200);

    const detailRes = await request(app)
      .get(`/api/v1/admin/evidence/${testEvidenceClean._id}`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert.equal(detailRes.status, 200);
  });
});
