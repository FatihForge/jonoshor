import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authConfig } from '../src/config/auth.js';
import { User } from '../src/models/User.js';
import { Admin } from '../src/models/Admin.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { PERMISSIONS } from '../src/constants/permissions.js';
import { ACCOUNT_STATUS } from '../src/constants/accountStatus.js';

describe('Admin User Management Frontend & API Integration Tests', () => {
  let adminFull = null;
  let adminReadOnly = null;
  let adminNoPerms = null;
  let regularUser = null;

  let adminFullToken = null;
  let adminReadOnlyToken = null;
  let adminNoPermsToken = null;
  let regularUserToken = null;

  let testUserActive = null;
  let testUserSuspended = null;
  let testUserBlocked = null;

  const testBatch = `fe_user_${Date.now()}`;

  before(async () => {
    await connectDatabase();

    // 1. Create Admins
    adminFull = await Admin.create({
      fullName: 'এডমিন ইউজার ম্যানেজার',
      email: `${testBatch}_admin_full@jonoshor-verify.org`,
      passwordHash: 'dummy_hash_for_testing',
      permissions: [PERMISSIONS.USER_READ, PERMISSIONS.USER_MANAGE],
    });
    adminFullToken = jwt.sign(
      {
        id: adminFull._id.toString(),
        _id: adminFull._id.toString(),
        email: adminFull.email,
        accountType: 'admin',
        role: 'admin',
        permissions: adminFull.permissions,
        tokenVersion: 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    adminReadOnly = await Admin.create({
      fullName: 'এডমিন রিড অনলি',
      email: `${testBatch}_admin_read@jonoshor-verify.org`,
      passwordHash: 'dummy_hash_for_testing',
      permissions: [PERMISSIONS.USER_READ],
    });
    adminReadOnlyToken = jwt.sign(
      {
        id: adminReadOnly._id.toString(),
        _id: adminReadOnly._id.toString(),
        email: adminReadOnly.email,
        accountType: 'admin',
        role: 'admin',
        permissions: adminReadOnly.permissions,
        tokenVersion: 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    adminNoPerms = await Admin.create({
      fullName: 'এডমিন নো পার্মস',
      email: `${testBatch}_admin_noperms@jonoshor-verify.org`,
      passwordHash: 'dummy_hash_for_testing',
      permissions: [PERMISSIONS.COMPLAINT_READ],
    });
    adminNoPermsToken = jwt.sign(
      {
        id: adminNoPerms._id.toString(),
        _id: adminNoPerms._id.toString(),
        email: adminNoPerms.email,
        accountType: 'admin',
        role: 'admin',
        permissions: adminNoPerms.permissions,
        tokenVersion: 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 2. Create Regular User
    regularUser = await User.create({
      fullName: 'সাধারণ নাগরিক',
      email: `${testBatch}_regular@jonoshor-verify.org`,
      passwordHash: 'dummy_user_hash',
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      authProvider: 'local',
      emailVerified: true,
    });
    regularUserToken = jwt.sign(
      {
        id: regularUser._id.toString(),
        _id: regularUser._id.toString(),
        email: regularUser.email,
        accountType: 'user',
        tokenVersion: 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 3. Create Synthetic Test Users for listing and details
    testUserActive = await User.create({
      fullName: 'মো: রফিকুল ইসলাম',
      email: `${testBatch}_rafiq@jonoshor-verify.org`,
      mobile: '01712345678',
      passwordHash: 'super_secret_password_hash_xyz',
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      authProvider: 'local',
      emailVerified: true,
      mobileVerified: true,
      languagePreference: 'bn',
      externalLinks: ['https://example.com/rafiq'],
    });

    testUserSuspended = await User.create({
      fullName: 'তানিয়া সুলতানা',
      email: `${testBatch}_tania@jonoshor-verify.org`,
      mobile: '01812345678',
      passwordHash: 'super_secret_password_hash_abc',
      accountStatus: ACCOUNT_STATUS.SUSPENDED,
      authProvider: 'google',
      authProviderId: 'google_oauth_sub_secret_9999',
      emailVerified: true,
      languagePreference: 'en',
    });

    testUserBlocked = await User.create({
      fullName: 'কামাল আহমেদ',
      email: `${testBatch}_kamal@jonoshor-verify.org`,
      passwordHash: 'super_secret_password_hash_123',
      accountStatus: ACCOUNT_STATUS.BLOCKED,
      authProvider: 'local',
      emailVerified: false,
    });
  });

  after(async () => {
    // Clean up all synthetic records created in this test
    const allEmails = [
      adminFull?.email,
      adminReadOnly?.email,
      adminNoPerms?.email,
      regularUser?.email,
      testUserActive?.email,
      testUserSuspended?.email,
      testUserBlocked?.email,
    ].filter(Boolean);

    await User.deleteMany({ email: { $in: allEmails } });
    await Admin.deleteMany({ email: { $in: allEmails } });
    await AuditLog.deleteMany({ 'metadata.targetUserId': { $in: [testUserActive?._id, testUserSuspended?._id, testUserBlocked?._id] } });

    await disconnectDatabase();
  });

  test('1. Admin with USER_READ can list users with pagination metadata', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminFullToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 3);
    assert.ok(res.body.meta);
    assert.equal(res.body.meta.page, 1);
    assert.equal(res.body.meta.limit, 10);
    assert.ok(typeof res.body.meta.total === 'number');

    const foundActive = res.body.data.find((u) => u._id === testUserActive._id.toString());
    assert.ok(foundActive);
    assert.equal(foundActive.fullName, 'মো: রফিকুল ইসলাম');
    assert.equal(foundActive.accountStatus, 'active');
  });

  test('2. Admin can filter users by account status (suspended)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users?status=suspended')
      .set('Authorization', `Bearer ${adminReadOnlyToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    const allSuspended = res.body.data.every((u) => u.accountStatus === 'suspended');
    assert.ok(allSuspended);

    const foundTania = res.body.data.find((u) => u._id === testUserSuspended._id.toString());
    assert.ok(foundTania);
    assert.equal(foundTania.fullName, 'তানিয়া সুলতানা');
  });

  test('3. Admin with USER_READ can get user details by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/users/${testUserActive._id}`)
      .set('Authorization', `Bearer ${adminFullToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    const user = res.body.data;
    assert.equal(user._id, testUserActive._id.toString());
    assert.equal(user.fullName, 'মো: রফিকুল ইসলাম');
    assert.equal(user.email, testUserActive.email);
    assert.equal(user.mobile, '01712345678');
    assert.equal(user.emailVerified, true);
    assert.equal(user.mobileVerified, true);
    assert.equal(user.accountStatus, 'active');
    assert.deepEqual(user.externalLinks, ['https://example.com/rafiq']);
  });

  test('4. Sensitive authentication and security fields are strictly suppressed from user details', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/users/${testUserSuspended._id}`)
      .set('Authorization', `Bearer ${adminFullToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    const user = res.body.data;

    // Strict suppression assertions
    assert.equal(user.passwordHash, undefined, 'passwordHash must never be exposed');
    assert.equal(user.authProviderId, undefined, 'authProviderId must never be exposed');
    assert.equal(user.twoFactorSecret, undefined, 'twoFactorSecret must never be exposed');
    assert.equal(user.twoFactorRecoveryCodes, undefined, 'twoFactorRecoveryCodes must never be exposed');
    assert.equal(user.refreshTokenHash, undefined, 'refreshTokenHash must never be exposed');
    assert.equal(user.security, undefined, 'security metadata must never be exposed');
    assert.equal(user.__v, undefined, '__v internal version must never be exposed');
  });

  test('5. Admin with USER_MANAGE can update user account status with administrative reason', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${testUserActive._id}/status`)
      .set('Authorization', `Bearer ${adminFullToken}`)
      .send({
        status: 'suspended',
        reason: 'সন্দেহজনক কার্যকলাপের কারণে সাময়িক স্থগিতাদেশ',
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.accountStatus, 'suspended');

    // Verify DB updated
    const updatedInDb = await User.findById(testUserActive._id);
    assert.equal(updatedInDb.accountStatus, 'suspended');

    // Verify AuditLog was recorded
    const audit = await AuditLog.findOne({
      action: 'USER_STATUS_UPDATED',
      resourceId: testUserActive._id,
    });
    assert.ok(audit, 'Audit log entry must be created');
    assert.equal(audit.actorId.toString(), adminFull._id.toString());
    assert.equal(audit.metadata.newStatus, 'suspended');
    assert.equal(audit.metadata.reason, 'সন্দেহজনক কার্যকলাপের কারণে সাময়িক স্থগিতাদেশ');
  });

  test('6. Invalid account status is rejected with 400 Bad Request', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${testUserActive._id}/status`)
      .set('Authorization', `Bearer ${adminFullToken}`)
      .send({
        status: 'invalid_status_xyz',
      })
      .expect(400);

    assert.equal(res.body.success, false);
  });

  test('7. Admin without USER_READ is rejected with 403 Forbidden on list and view', async () => {
    const listRes = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminNoPermsToken}`)
      .expect(403);

    assert.equal(listRes.body.success, false);

    const getRes = await request(app)
      .get(`/api/v1/admin/users/${testUserActive._id}`)
      .set('Authorization', `Bearer ${adminNoPermsToken}`)
      .expect(403);

    assert.equal(getRes.body.success, false);
  });

  test('8. Admin without USER_MANAGE is rejected with 403 Forbidden on status update', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${testUserActive._id}/status`)
      .set('Authorization', `Bearer ${adminReadOnlyToken}`)
      .send({
        status: 'blocked',
        reason: 'চেষ্টা ব্যর্থ হওয়া উচিত',
      })
      .expect(403);

    assert.equal(res.body.success, false);
  });

  test('9. Admin cannot modify their own account status via user status endpoint', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${adminFull._id}/status`)
      .set('Authorization', `Bearer ${adminFullToken}`)
      .send({
        status: 'blocked',
      })
      .expect(403);

    assert.equal(res.body.success, false);
  });

  test('10. Regular user cannot access Admin User Management endpoints (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${regularUserToken}`)
      .expect(403);

    assert.equal(res.body.success, false);
  });

  test('11. Unauthenticated request is rejected with 401 Unauthorized', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .expect(401);

    assert.equal(res.body.success, false);
  });
});
