import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authConfig } from '../src/config/auth.js';
import { hashPassword } from '../src/utils/crypto.js';
import { Admin } from '../src/models/Admin.js';
import { SuperAdmin } from '../src/models/SuperAdmin.js';
import { User } from '../src/models/User.js';
import { SecurityLog } from '../src/models/SecurityLog.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { PERMISSIONS } from '../src/constants/permissions.js';
import { ACCOUNT_STATUS } from '../src/constants/accountStatus.js';

describe('Super Admin Frontend Foundation Integration Tests', () => {
  let superAdmin = null;
  let normalAdmin = null;
  let normalUser = null;

  let superAdminToken = null;
  let normalAdminToken = null;
  let normalUserToken = null;

  let testAdmin = null;
  const totpSecret = authenticator.generateSecret();
  const testBatch = `sa_test_${Date.now()}`;

  before(async () => {
    await connectDatabase();
    const defaultPasswordHash = await hashPassword('SuperSecurePass123!');

    // 1. Create Super Admin with 2FA enabled
    superAdmin = await SuperAdmin.create({
      fullName: 'প্রধান সুপার অ্যাডমিন',
      email: `${testBatch}_superadmin@jonoshor-verify.org`,
      passwordHash: defaultPasswordHash,
      permissions: ['*'],
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      twoFactorEnabled: true,
      twoFactorSecret: totpSecret,
    });

    superAdminToken = jwt.sign(
      {
        id: superAdmin._id.toString(),
        _id: superAdmin._id.toString(),
        email: superAdmin.email,
        accountType: 'superAdmin',
        role: 'superAdmin',
        permissions: ['*'],
        tokenVersion: 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 2. Create Normal Admin
    normalAdmin = await Admin.create({
      fullName: 'সাধারণ অ্যাডমিন',
      email: `${testBatch}_admin@jonoshor-verify.org`,
      passwordHash: defaultPasswordHash,
      permissions: [PERMISSIONS.COMPLAINT_READ],
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    });

    normalAdminToken = jwt.sign(
      {
        id: normalAdmin._id.toString(),
        _id: normalAdmin._id.toString(),
        email: normalAdmin.email,
        accountType: 'admin',
        role: 'admin',
        permissions: normalAdmin.permissions,
        tokenVersion: 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 3. Create Regular Citizen User
    normalUser = await User.create({
      fullName: 'সাধারণ নাগরিক',
      email: `${testBatch}_user@jonoshor-verify.org`,
      passwordHash: defaultPasswordHash,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      authProvider: 'local',
      emailVerified: true,
    });

    normalUserToken = jwt.sign(
      {
        id: normalUser._id.toString(),
        _id: normalUser._id.toString(),
        email: normalUser.email,
        accountType: 'user',
        tokenVersion: 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 4. Create an Admin to manage
    testAdmin = await Admin.create({
      fullName: 'পরীক্ষাধীন অ্যাডমিন',
      email: `${testBatch}_manage_admin@jonoshor-verify.org`,
      mobile: '01711223344',
      passwordHash: defaultPasswordHash,
      permissions: [PERMISSIONS.COMPLAINT_READ, PERMISSIONS.COMPLAINT_REVIEW],
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      createdBy: superAdmin._id,
    });

    // 5. Seed a test SecurityLog and AuditLog
    await SecurityLog.create({
      eventType: 'AUTH_FAILED',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 Test Suite',
      riskSignal: 'INVALID_CREDENTIALS',
      actionTaken: 'BLOCKED_ATTEMPT',
      metadata: { test: true },
    });

    await AuditLog.create({
      actorId: superAdmin._id,
      actorType: 'superAdmin',
      action: 'ADMIN_CREATED',
      resourceType: 'admin',
      resourceId: testAdmin._id,
      ip: '127.0.0.1',
      metadata: { test: true },
    });
  });

  after(async () => {
    // Cleanup all synthetic records
    const allEmails = [
      superAdmin?.email,
      normalAdmin?.email,
      normalUser?.email,
      testAdmin?.email,
      `${testBatch}_new_admin@jonoshor-verify.org`,
    ].filter(Boolean);

    await SuperAdmin.deleteMany({ email: { $in: allEmails } });
    await Admin.deleteMany({ email: { $in: allEmails } });
    await User.deleteMany({ email: { $in: allEmails } });
    await SecurityLog.deleteMany({ 'metadata.test': true });
    await AuditLog.deleteMany({ 'metadata.test': true });

    await disconnectDatabase();
  });

  test('1. Super Admin Dashboard returns operational status and live entity counts', async () => {
    const res = await request(app)
      .get('/api/v1/super-admin/dashboard')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'SuperAdmin dashboard operational');
    assert.ok(res.body.data.counts);
    assert.ok(typeof res.body.data.counts.totalAdmins === 'number');
    assert.ok(typeof res.body.data.counts.activeAdmins === 'number');
    assert.ok(typeof res.body.data.counts.totalSecurityLogs === 'number');
    assert.ok(typeof res.body.data.counts.totalAuditLogs === 'number');
  });

  test('2. Authoritative permissions endpoint returns list of all system permissions', async () => {
    const res = await request(app)
      .get('/api/v1/super-admin/permissions')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.includes(PERMISSIONS.COMPLAINT_READ));
    assert.ok(res.body.data.includes(PERMISSIONS.EVIDENCE_REVIEW));
    assert.ok(res.body.data.includes(PERMISSIONS.USER_MANAGE));
  });

  test('3. Super Admin can list admins with pagination metadata, suppressing passwordHash', async () => {
    const res = await request(app)
      .get('/api/v1/super-admin/admins?page=1&limit=10')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.meta);
    assert.equal(res.body.meta.page, 1);

    const found = res.body.data.find((a) => a._id === testAdmin._id.toString());
    assert.ok(found);
    assert.equal(found.fullName, 'পরীক্ষাধীন অ্যাডমিন');
    assert.equal(found.passwordHash, undefined, 'passwordHash must never be exposed');
  });

  test('4. Super Admin can retrieve admin details by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/super-admin/admins/${testAdmin._id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data._id, testAdmin._id.toString());
    assert.equal(res.body.data.fullName, 'পরীক্ষাধীন অ্যাডমিন');
    assert.equal(res.body.data.passwordHash, undefined);
  });

  test('5. Super Admin can create a new Admin account with permissions and records audit log', async () => {
    const newAdminEmail = `${testBatch}_new_admin@jonoshor-verify.org`;
    const res = await request(app)
      .post('/api/v1/super-admin/admins')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        fullName: 'নতুন নিয়োগকৃত অ্যাডমিন',
        email: newAdminEmail,
        password: 'AdminSecurePassword999!',
        mobile: '01899887766',
        permissions: [PERMISSIONS.COMPLAINT_READ, PERMISSIONS.COMPLAINT_SCREEN],
      })
      .expect(201);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.email, newAdminEmail.toLowerCase());
    assert.equal(res.body.data.fullName, 'নতুন নিয়োগকৃত অ্যাডমিন');
    assert.equal(res.body.data.passwordHash, undefined);
    assert.deepEqual(res.body.data.permissions, [PERMISSIONS.COMPLAINT_READ, PERMISSIONS.COMPLAINT_SCREEN]);

    // Check DB
    const inDb = await Admin.findOne({ email: newAdminEmail.toLowerCase() });
    assert.ok(inDb);

    // Check AuditLog
    const audit = await AuditLog.findOne({
      action: 'ADMIN_CREATED',
      'metadata.email': newAdminEmail.toLowerCase(),
    });
    assert.ok(audit, 'AuditLog entry for ADMIN_CREATED must exist');
  });

  test('6. Super Admin can update Admin profile & account status (suspend)', async () => {
    const res = await request(app)
      .patch(`/api/v1/super-admin/admins/${testAdmin._id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        fullName: 'আপডেটেড নাম অ্যাডমিন',
        accountStatus: 'suspended',
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.fullName, 'আপডেটেড নাম অ্যাডমিন');
    assert.equal(res.body.data.accountStatus, 'suspended');

    const inDb = await Admin.findById(testAdmin._id);
    assert.equal(inDb.accountStatus, 'suspended');
  });

  test('7. Modifying permissions without Re-Authentication token is rejected with 401 Unauthorized', async () => {
    const res = await request(app)
      .patch(`/api/v1/super-admin/admins/${testAdmin._id}/permissions`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        permissions: [PERMISSIONS.COMPLAINT_READ, PERMISSIONS.LEGAL_READ],
      })
      .expect(401);

    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('re-authentication'));
  });

  test('8. Re-Authentication issuance and permission update with valid token succeeds', async () => {
    // A. Perform re-authentication using password + TOTP code
    const totpCode = authenticator.generate(totpSecret);
    const reAuthRes = await request(app)
      .post('/api/v1/auth/re-authenticate')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        password: 'SuperSecurePass123!',
        totpCode,
      })
      .expect(200);

    assert.equal(reAuthRes.body.success, true);
    const reAuthToken = reAuthRes.body.data.reAuthToken;
    assert.ok(reAuthToken);

    // B. Apply permission modification using reAuthToken header
    const updateRes = await request(app)
      .patch(`/api/v1/super-admin/admins/${testAdmin._id}/permissions`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .set('x-reauth-token', reAuthToken)
      .send({
        permissions: [PERMISSIONS.COMPLAINT_READ, PERMISSIONS.COMPLAINT_VERIFY, PERMISSIONS.USER_READ],
      })
      .expect(200);

    assert.equal(updateRes.body.success, true);
    assert.deepEqual(updateRes.body.data.permissions, [
      PERMISSIONS.COMPLAINT_READ,
      PERMISSIONS.COMPLAINT_VERIFY,
      PERMISSIONS.USER_READ,
    ]);

    // Check DB
    const inDb = await Admin.findById(testAdmin._id);
    assert.deepEqual(inDb.permissions, [
      PERMISSIONS.COMPLAINT_READ,
      PERMISSIONS.COMPLAINT_VERIFY,
      PERMISSIONS.USER_READ,
    ]);
  });

  test('9. Super Admin can retrieve security logs with pagination metadata', async () => {
    const res = await request(app)
      .get('/api/v1/super-admin/security/logs?page=1&limit=10')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.meta);
    assert.ok(res.body.data.length >= 1);
  });

  test('10. Super Admin can retrieve audit logs with pagination metadata', async () => {
    const res = await request(app)
      .get('/api/v1/super-admin/audit-logs?page=1&limit=10')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.meta);
    assert.ok(res.body.data.length >= 1);
  });

  test('11. Normal Admin cannot access Super Admin endpoints (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/super-admin/admins')
      .set('Authorization', `Bearer ${normalAdminToken}`)
      .expect(403);

    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  test('12. Citizen user cannot access Super Admin endpoints (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/super-admin/dashboard')
      .set('Authorization', `Bearer ${normalUserToken}`)
      .expect(403);

    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  test('13. Unauthenticated request to Super Admin endpoints is rejected with 401 Unauthorized', async () => {
    const res = await request(app)
      .get('/api/v1/super-admin/security/logs')
      .expect(401);

    assert.equal(res.body.success, false);
  });
});
