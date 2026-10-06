import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { Complaint } from '../src/models/Complaint.js';
import { Reporter } from '../src/models/Reporter.js';
import { Evidence } from '../src/models/Evidence.js';
import { Admin } from '../src/models/Admin.js';
import { SuperAdmin } from '../src/models/SuperAdmin.js';
import { User } from '../src/models/User.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authConfig } from '../src/config/auth.js';
import { hashPassword } from '../src/utils/crypto.js';
import { PERMISSIONS } from '../src/constants/permissions.js';
import { COMPLAINT_STATUS } from '../src/constants/complaintStatus.js';

describe('Admin Complaint Review UI & Integration Tests', () => {
  let adminToken;
  let adminNoPermToken;
  let superAdminToken;
  let userToken;

  let testAdminId;
  let testAdminNoPermId;
  let testComplaintId;
  let testEvidenceId;
  let testUserId;

  const testEmailPrefix = `admin_complaint_test_${Date.now()}`;

  before(async () => {
    await connectDatabase();
    const defaultPasswordHash = await hashPassword('AdminPass123!');

    // 1. Create Normal User & Reporter
    const user = await User.create({
      fullName: 'Test Complaint Citizen',
      email: `${testEmailPrefix}_citizen@jonoshor-test.org`,
      passwordHash: defaultPasswordHash,
      emailVerified: true,
      accountStatus: 'active',
    });
    testUserId = user._id;

    const reporter = await Reporter.create({
      reporterType: 'user',
      accountId: user._id,
      contact: { email: user.email, mobile: '01700000000' },
      isAnonymous: false,
    });

    // 2. Create Complaint
    const complaint = await Complaint.create({
      reporterId: reporter._id,
      submissionType: 'user',
      category: { primary: 'corruption', secondary: ['bribery'] },
      incident: {
        startDate: new Date('2026-05-10'),
        description: 'Illegal toll collection observed and documented.',
      },
      location: {
        divisionId: 'dhaka',
        districtId: 'dhaka',
        upazilaId: 'dhanmondi',
        freeTextLocation: 'Near Dhanmondi Lake',
      },
      status: COMPLAINT_STATUS.SUBMITTED,
      priority: { level: 'high' },
      sensitivity: { level: 'high' },
      accused: [
        {
          name: 'Official X',
          role: 'Tax Inspector',
          organization: 'Local Authority',
        },
      ],
      victims: [
        {
          name: 'Vendor Y',
          ageCategory: 'adult',
          gender: 'male',
        },
      ],
    });
    testComplaintId = complaint._id.toString();

    // 3. Create Evidence for this complaint
    const evidence = await Evidence.create({
      complaintId: complaint._id,
      uploaderId: user._id,
      type: 'document',
      originalFilename: 'toll_receipt.pdf',
      mimeType: 'application/pdf',
      size: 10240,
      driveFileId: `mock_gdrive_evidence_${Date.now()}`,
      uploadStatus: 'stored',
      malwareScanStatus: 'clean',
    });
    testEvidenceId = evidence._id.toString();

    // 4. Create Admin with all complaint permissions
    const admin = await Admin.create({
      fullName: 'Review Officer Admin',
      email: `${testEmailPrefix}_admin_full@jonoshor-test.org`,
      passwordHash: defaultPasswordHash,
      permissions: [
        PERMISSIONS.COMPLAINT_READ,
        PERMISSIONS.COMPLAINT_ASSIGN,
        PERMISSIONS.COMPLAINT_SCREEN,
        PERMISSIONS.COMPLAINT_VERIFY,
        PERMISSIONS.COMPLAINT_PUBLISH,
        PERMISSIONS.EVIDENCE_READ,
      ],
      accountStatus: 'active',
      twoFactorEnabled: true,
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

    // 5. Create Admin without permissions
    const adminNoPerm = await Admin.create({
      fullName: 'No Perm Officer',
      email: `${testEmailPrefix}_admin_noperm@jonoshor-test.org`,
      passwordHash: defaultPasswordHash,
      permissions: [],
      accountStatus: 'active',
      twoFactorEnabled: true,
    });
    testAdminNoPermId = adminNoPerm._id;
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

    // 6. Create Super Admin
    const superAdmin = await SuperAdmin.create({
      fullName: 'Chief Super Admin',
      email: `${testEmailPrefix}_super@jonoshor-test.org`,
      passwordHash: defaultPasswordHash,
      permissions: ['*'],
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

    // 7. Regular User Token
    userToken = jwt.sign(
      {
        id: user._id,
        _id: user._id,
        email: user.email,
        accountType: 'user',
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );
  });

  after(async () => {
    await Complaint.deleteMany({ _id: testComplaintId });
    await Evidence.deleteMany({ _id: testEvidenceId });
    await Reporter.deleteMany({ accountId: testUserId });
    await User.deleteMany({ email: new RegExp(`^${testEmailPrefix}`) });
    await Admin.deleteMany({ email: new RegExp(`^${testEmailPrefix}`) });
    await SuperAdmin.deleteMany({ email: new RegExp(`^${testEmailPrefix}`) });
    await AuditLog.deleteMany({ resourceId: testComplaintId });
    await disconnectDatabase();
  });

  test('1. Admin Dashboard loads and returns operational metrics (GET /api/v1/admin/dashboard)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'Admin dashboard operational');
    assert.ok(res.body.data.counts);
    assert.ok(typeof res.body.data.counts.total === 'number');
    assert.ok(typeof res.body.data.counts.submitted === 'number');
    assert.ok(typeof res.body.data.counts.pendingReview === 'number');
    assert.ok(typeof res.body.data.counts.verified === 'number');
    assert.ok(typeof res.body.data.counts.published === 'number');
  });

  test('2. Unauthorized access to Admin Dashboard is rejected (401 / 403)', async () => {
    // Unauthenticated
    const noAuthRes = await request(app).get('/api/v1/admin/dashboard');
    assert.equal(noAuthRes.status, 401);

    // Regular user
    const userRes = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(userRes.status, 403);
  });

  test('3. Complaint list loads with pagination and filters (GET /api/v1/admin/complaints)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/complaints?page=1&limit=10&status=submitted')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.meta);
    assert.equal(res.body.meta.page, 1);
    assert.equal(res.body.meta.limit, 10);

    const match = res.body.data.find(c => c._id === testComplaintId);
    assert.ok(match, 'Test complaint should be in list results');
    assert.equal(match.status, COMPLAINT_STATUS.SUBMITTED);
  });

  test('4. Admin without COMPLAINT_READ is denied complaint list (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/complaints')
      .set('Authorization', `Bearer ${adminNoPermToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  test('5. Complaint details loads with authorized internal review information and evidence', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/complaints/${testComplaintId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const complaint = res.body.data;

    assert.equal(complaint._id, testComplaintId);
    assert.equal(complaint.category.primary, 'corruption');
    assert.equal(complaint.location.districtId, 'dhaka');
    assert.ok(Array.isArray(complaint.accused));
    assert.equal(complaint.accused[0].name, 'Official X');
    assert.ok(Array.isArray(complaint.victims));
    assert.equal(complaint.victims[0].name, 'Vendor Y');

    // Verify populated evidence array
    assert.ok(Array.isArray(complaint.evidence));
    assert.ok(complaint.evidence.some(e => e._id === testEvidenceId));

    // Verify no password hashes or sensitive security secrets are exposed
    assert.equal(complaint.passwordHash, undefined);
    assert.equal(complaint.twoFactorSecret, undefined);
  });

  test('6. Review Action: Assign Reviewer (POST /api/v1/admin/complaints/:id/assign)', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/complaints/${testComplaintId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reviewerId: testAdminId });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Verify status transitioned to screening and reviewer is assigned
    const dbComp = await Complaint.findById(testComplaintId);
    assert.equal(dbComp.status, COMPLAINT_STATUS.SCREENING);
    assert.equal(dbComp.review.assignedReviewerId.toString(), testAdminId.toString());
  });

  test('7. Review Action: Screen Complaint (POST /api/v1/admin/complaints/:id/screen)', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/complaints/${testComplaintId}/screen`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: COMPLAINT_STATUS.EVIDENCE_REVIEW,
        notes: 'Initial screening passed. Advance to evidence review.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const dbComp = await Complaint.findById(testComplaintId);
    assert.equal(dbComp.status, COMPLAINT_STATUS.EVIDENCE_REVIEW);
    assert.equal(dbComp.review.reviewerNotes, 'Initial screening passed. Advance to evidence review.');
  });

  test('8. Review Action: Request Information (POST /api/v1/admin/complaints/:id/request-information)', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/complaints/${testComplaintId}/request-information`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        message: 'Please provide certified transaction receipts.',
        targetUserId: testUserId,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const dbComp = await Complaint.findById(testComplaintId);
    assert.equal(dbComp.status, COMPLAINT_STATUS.NEEDS_INFORMATION);
  });

  test('9. Review Action: Verify Complaint (POST /api/v1/admin/complaints/:id/verify)', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/complaints/${testComplaintId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        decision: 'verified',
        reason: 'Evidence confirms unauthorized tolling.',
        assessment: 'Document authenticated with district gazette.',
        notes: 'Verification complete and corroborated.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const dbComp = await Complaint.findById(testComplaintId);
    assert.equal(dbComp.status, COMPLAINT_STATUS.VERIFIED);
    assert.equal(dbComp.review.verificationDecision, 'verified');
    assert.equal(dbComp.review.verificationStatus, COMPLAINT_STATUS.VERIFIED);
  });

  test('10. Review Action: Declare Conflict of Interest (POST /api/v1/admin/complaints/:id/conflict)', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/complaints/${testComplaintId}/conflict`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        reason: 'Reviewer knows the accused party personally.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const dbComp = await Complaint.findById(testComplaintId);
    assert.equal(dbComp.review.conflictOfInterest, true);
    assert.equal(dbComp.review.assignedReviewerId, null);
    assert.equal(dbComp.status, COMPLAINT_STATUS.SUBMITTED);
  });

  test('11. Error handling: Non-existent complaint ID returns 404 Not Found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    const getRes = await request(app)
      .get(`/api/v1/admin/complaints/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(getRes.status, 404);

    const assignRes = await request(app)
      .post(`/api/v1/admin/complaints/${nonExistentId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reviewerId: testAdminId });
    assert.equal(assignRes.status, 404);
  });

  test('12. Super Admin can access all review endpoints preserving Super Admin authority', async () => {
    const dashRes = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert.equal(dashRes.status, 200);

    const listRes = await request(app)
      .get('/api/v1/admin/complaints')
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert.equal(listRes.status, 200);

    const detailRes = await request(app)
      .get(`/api/v1/admin/complaints/${testComplaintId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert.equal(detailRes.status, 200);
  });
});
