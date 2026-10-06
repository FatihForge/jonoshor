import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Admin } from '../src/models/Admin.js';
import { SuperAdmin } from '../src/models/SuperAdmin.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authConfig } from '../src/config/auth.js';
import { hashPassword } from '../src/utils/crypto.js';
import { PERMISSIONS } from '../src/constants/permissions.js';
import { ACCOUNT_STATUS } from '../src/constants/accountStatus.js';

describe('Admin User Management API (Section 57)', () => {
  let adminAllToken;
  let adminReadToken;
  let adminManageToken;
  let adminNoPermToken;
  let superAdminToken;
  let userToken;

  let testAdminAll;
  let testAdminRead;
  let testAdminManage;
  let testSuperAdmin;
  let testNormalUser;

  let userActiveId;
  let userSuspendedId;
  let userBlockedId;

  const testEmailPrefix = `usertest_${Date.now()}`;

  before(async () => {
    await connectDatabase();
    const defaultPassHash = await hashPassword('TestPassword123!');

    // 1. Create 3 test users in `users` collection
    const user1 = await User.create({
      fullName: 'Active User Test',
      email: `${testEmailPrefix}_active@jonoshor-usertest.org`,
      mobile: '01711111111',
      passwordHash: defaultPassHash,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      authProvider: 'local',
      emailVerified: true,
      mobileVerified: true,
    });
    userActiveId = user1._id.toString();

    const user2 = await User.create({
      fullName: 'Suspended User Test',
      email: `${testEmailPrefix}_suspended@jonoshor-usertest.org`,
      mobile: '01822222222',
      passwordHash: defaultPassHash,
      accountStatus: ACCOUNT_STATUS.SUSPENDED,
      authProvider: 'google',
      authProviderId: 'google-oauth-sub-12345',
      emailVerified: true,
    });
    userSuspendedId = user2._id.toString();

    const user3 = await User.create({
      fullName: 'Blocked User Test',
      email: `${testEmailPrefix}_blocked@jonoshor-usertest.org`,
      passwordHash: defaultPassHash,
      accountStatus: ACCOUNT_STATUS.BLOCKED,
      authProvider: 'local',
    });
    userBlockedId = user3._id.toString();

    // 2. Create Admin with both USER_READ and USER_MANAGE
    testAdminAll = await Admin.create({
      fullName: 'Admin Full Users',
      email: `${testEmailPrefix}_admin_full@jonoshor-usertest.org`,
      passwordHash: defaultPassHash,
      permissions: [PERMISSIONS.USER_READ, PERMISSIONS.USER_MANAGE],
      accountStatus: 'active',
      twoFactorEnabled: true,
    });
    adminAllToken = jwt.sign(
      {
        id: testAdminAll._id,
        _id: testAdminAll._id,
        email: testAdminAll.email,
        accountType: 'admin',
        permissions: testAdminAll.permissions,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 3. Create Admin with only USER_READ
    testAdminRead = await Admin.create({
      fullName: 'Admin Read Only',
      email: `${testEmailPrefix}_admin_read@jonoshor-usertest.org`,
      passwordHash: defaultPassHash,
      permissions: [PERMISSIONS.USER_READ],
      accountStatus: 'active',
      twoFactorEnabled: true,
    });
    adminReadToken = jwt.sign(
      {
        id: testAdminRead._id,
        _id: testAdminRead._id,
        email: testAdminRead.email,
        accountType: 'admin',
        permissions: testAdminRead.permissions,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 4. Create Admin with only USER_MANAGE
    testAdminManage = await Admin.create({
      fullName: 'Admin Manage Only',
      email: `${testEmailPrefix}_admin_manage@jonoshor-usertest.org`,
      passwordHash: defaultPassHash,
      permissions: [PERMISSIONS.USER_MANAGE],
      accountStatus: 'active',
      twoFactorEnabled: true,
    });
    adminManageToken = jwt.sign(
      {
        id: testAdminManage._id,
        _id: testAdminManage._id,
        email: testAdminManage.email,
        accountType: 'admin',
        permissions: testAdminManage.permissions,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 5. Create Admin with no user permissions
    const adminNoPerm = await Admin.create({
      fullName: 'Admin Other Perms',
      email: `${testEmailPrefix}_admin_noperm@jonoshor-usertest.org`,
      passwordHash: defaultPassHash,
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

    // 6. Create SuperAdmin
    testSuperAdmin = await SuperAdmin.create({
      fullName: 'Super Admin User',
      email: `${testEmailPrefix}_super@jonoshor-usertest.org`,
      passwordHash: defaultPassHash,
      permissions: ['*'],
      accountStatus: 'active',
      twoFactorEnabled: true,
    });
    superAdminToken = jwt.sign(
      {
        id: testSuperAdmin._id,
        _id: testSuperAdmin._id,
        email: testSuperAdmin.email,
        accountType: 'superAdmin',
        permissions: ['*'],
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 7. Normal user token
    testNormalUser = user1;
    userToken = jwt.sign(
      {
        id: testNormalUser._id,
        _id: testNormalUser._id,
        email: testNormalUser.email,
        accountType: 'user',
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );
  });

  after(async () => {
    await User.deleteMany({ email: new RegExp(`^${testEmailPrefix}`) });
    await Admin.deleteMany({ email: new RegExp(`^${testEmailPrefix}`) });
    await SuperAdmin.deleteMany({ email: new RegExp(`^${testEmailPrefix}`) });
    await AuditLog.deleteMany({
      resourceId: { $in: [userActiveId, userSuspendedId, userBlockedId] },
    });
    await disconnectDatabase();
  });

  test('1. Admin with USER_READ can list users with pagination (GET /api/v1/admin/users)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminReadToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 3);
    assert.ok(res.body.meta);
    assert.equal(res.body.meta.page, 1);
    assert.equal(res.body.meta.limit, 10);
    assert.ok(res.body.meta.total >= 3);
  });

  test('2. Admin with USER_READ can filter users by status (GET /api/v1/admin/users?status=suspended)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users?status=suspended')
      .set('Authorization', `Bearer ${adminReadToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    const suspendedList = res.body.data;
    assert.ok(suspendedList.some(u => u._id === userSuspendedId));
    suspendedList.forEach(u => {
      assert.equal(u.accountStatus, 'suspended');
    });
  });

  test('3. Admin with USER_READ can view single user by ID (GET /api/v1/admin/users/:id)', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/users/${userActiveId}`)
      .set('Authorization', `Bearer ${adminReadToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data._id, userActiveId);
    assert.equal(res.body.data.fullName, 'Active User Test');
    assert.equal(res.body.data.accountStatus, 'active');
  });

  test('4. Admin without USER_READ is denied listing and viewing users (403 Forbidden)', async () => {
    // Admin with no user permissions
    const listResNoPerm = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminNoPermToken}`);
    assert.equal(listResNoPerm.status, 403);

    const getResNoPerm = await request(app)
      .get(`/api/v1/admin/users/${userActiveId}`)
      .set('Authorization', `Bearer ${adminNoPermToken}`);
    assert.equal(getResNoPerm.status, 403);

    // Admin with only USER_MANAGE (lacks USER_READ)
    const listResManageOnly = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminManageToken}`);
    assert.equal(listResManageOnly.status, 403);
  });

  test('5. Sensitive authentication and security fields are NEVER returned in list or get endpoints', async () => {
    // Check single user view of OAuth user
    const resDetail = await request(app)
      .get(`/api/v1/admin/users/${userSuspendedId}`)
      .set('Authorization', `Bearer ${adminReadToken}`);

    assert.equal(resDetail.status, 200);
    const userDetail = resDetail.body.data;
    assert.equal(userDetail.passwordHash, undefined);
    assert.equal(userDetail.authProviderId, undefined);
    assert.equal(userDetail.twoFactorSecret, undefined);
    assert.equal(userDetail.twoFactorRecoveryCodes, undefined);
    assert.equal(userDetail.refreshTokenHash, undefined);
    assert.equal(userDetail.security, undefined);
    assert.equal(userDetail.__v, undefined);

    // Check list users
    const resList = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminReadToken}`);

    assert.equal(resList.status, 200);
    resList.body.data.forEach(user => {
      assert.equal(user.passwordHash, undefined);
      assert.equal(user.authProviderId, undefined);
      assert.equal(user.twoFactorSecret, undefined);
      assert.equal(user.twoFactorRecoveryCodes, undefined);
      assert.equal(user.refreshTokenHash, undefined);
      assert.equal(user.security, undefined);
    });
  });

  test('6. Admin with USER_MANAGE can change user status (PATCH /api/v1/admin/users/:id/status)', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${userActiveId}/status`)
      .set('Authorization', `Bearer ${adminManageToken}`)
      .send({
        status: ACCOUNT_STATUS.SUSPENDED,
        reason: 'Investigation pending',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data._id, userActiveId);
    assert.equal(res.body.data.accountStatus, ACCOUNT_STATUS.SUSPENDED);
    assert.equal(res.body.data.passwordHash, undefined);

    // Verify persisted in database
    const dbUser = await User.findById(userActiveId);
    assert.equal(dbUser.accountStatus, ACCOUNT_STATUS.SUSPENDED);
  });

  test('7. Admin without USER_MANAGE is denied changing user status (403 Forbidden)', async () => {
    // Admin with only USER_READ
    const resRead = await request(app)
      .patch(`/api/v1/admin/users/${userActiveId}/status`)
      .set('Authorization', `Bearer ${adminReadToken}`)
      .send({ status: ACCOUNT_STATUS.ACTIVE });

    assert.equal(resRead.status, 403);

    // Admin with no user permissions
    const resNoPerm = await request(app)
      .patch(`/api/v1/admin/users/${userActiveId}/status`)
      .set('Authorization', `Bearer ${adminNoPermToken}`)
      .send({ status: ACCOUNT_STATUS.ACTIVE });

    assert.equal(resNoPerm.status, 403);
  });

  test('8. Audit log is created for status changes with actor, target user, and previous/new status', async () => {
    // Perform status change from suspended to blocked
    const res = await request(app)
      .patch(`/api/v1/admin/users/${userActiveId}/status`)
      .set('Authorization', `Bearer ${adminAllToken}`)
      .send({
        status: ACCOUNT_STATUS.BLOCKED,
        reason: 'Confirmed terms violation',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.accountStatus, ACCOUNT_STATUS.BLOCKED);

    // Query AuditLog
    const auditEntry = await AuditLog.findOne({
      resourceId: userActiveId,
      action: 'USER_STATUS_UPDATED',
    }).sort({ _id: -1 });

    assert.ok(auditEntry, 'Audit log entry should exist');
    assert.equal(auditEntry.actorId.toString(), testAdminAll._id.toString());
    assert.equal(auditEntry.actorType, 'admin');
    assert.equal(auditEntry.resourceType, 'user');
    assert.equal(auditEntry.previousValue?.accountStatus, ACCOUNT_STATUS.SUSPENDED);
    assert.equal(auditEntry.newValue?.accountStatus, ACCOUNT_STATUS.BLOCKED);
    assert.equal(auditEntry.metadata?.reason, 'Confirmed terms violation');
    assert.equal(auditEntry.metadata?.targetUserId.toString(), userActiveId);
  });

  test('9. Unauthorized role/privilege escalation is strictly blocked', async () => {
    // Attempt 1: Passing role in status patch payload is rejected
    const roleRes = await request(app)
      .patch(`/api/v1/admin/users/${userBlockedId}/status`)
      .set('Authorization', `Bearer ${adminManageToken}`)
      .send({
        status: ACCOUNT_STATUS.ACTIVE,
        role: 'superAdmin',
      });
    assert.equal(roleRes.status, 400);

    // Attempt 2: Passing permissions in status patch payload is rejected
    const permRes = await request(app)
      .patch(`/api/v1/admin/users/${userBlockedId}/status`)
      .set('Authorization', `Bearer ${adminManageToken}`)
      .send({
        status: ACCOUNT_STATUS.ACTIVE,
        permissions: ['*'],
      });
    assert.equal(permRes.status, 400);

    // Attempt 3: Passing accountType in status patch payload is rejected
    const acctTypeRes = await request(app)
      .patch(`/api/v1/admin/users/${userBlockedId}/status`)
      .set('Authorization', `Bearer ${adminManageToken}`)
      .send({
        status: ACCOUNT_STATUS.ACTIVE,
        accountType: 'admin',
      });
    assert.equal(acctTypeRes.status, 400);

    // Attempt 4: Admin trying to modify their own account status via this endpoint
    const selfRes = await request(app)
      .patch(`/api/v1/admin/users/${testAdminManage._id}/status`)
      .set('Authorization', `Bearer ${adminManageToken}`)
      .send({ status: ACCOUNT_STATUS.ACTIVE });
    assert.equal(selfRes.status, 403);

    // Attempt 5: Admin trying to target another Admin or SuperAdmin account
    const targetAdminRes = await request(app)
      .patch(`/api/v1/admin/users/${testAdminRead._id}/status`)
      .set('Authorization', `Bearer ${adminManageToken}`)
      .send({ status: ACCOUNT_STATUS.BLOCKED });
    assert.equal(targetAdminRes.status, 403);

    const targetSuperAdminRes = await request(app)
      .patch(`/api/v1/admin/users/${testSuperAdmin._id}/status`)
      .set('Authorization', `Bearer ${adminManageToken}`)
      .send({ status: ACCOUNT_STATUS.BLOCKED });
    assert.equal(targetSuperAdminRes.status, 403);
  });

  test('10. Status validation enforces allowed status values (active, suspended, blocked)', async () => {
    // Invalid status value
    const resInvalid = await request(app)
      .patch(`/api/v1/admin/users/${userBlockedId}/status`)
      .set('Authorization', `Bearer ${adminManageToken}`)
      .send({ status: 'deleted_invalid' });

    assert.equal(resInvalid.status, 400);
    assert.equal(resInvalid.body.success, false);

    // Missing status
    const resMissing = await request(app)
      .patch(`/api/v1/admin/users/${userBlockedId}/status`)
      .set('Authorization', `Bearer ${adminManageToken}`)
      .send({});

    assert.equal(resMissing.status, 400);
  });

  test('11. Super Admin can list, view, and update user status (Preserves Super Admin authority)', async () => {
    // List
    const listRes = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert.equal(listRes.status, 200);

    // View
    const viewRes = await request(app)
      .get(`/api/v1/admin/users/${userBlockedId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert.equal(viewRes.status, 200);
    assert.equal(viewRes.body.data._id, userBlockedId);

    // Update
    const updateRes = await request(app)
      .patch(`/api/v1/admin/users/${userBlockedId}/status`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        status: ACCOUNT_STATUS.ACTIVE,
        reason: 'Unblocked by Super Admin',
      });
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.data.accountStatus, ACCOUNT_STATUS.ACTIVE);
  });

  test('12. Authentication and Role boundaries: Unauthenticated and Regular User are denied', async () => {
    // Unauthenticated
    const noAuthList = await request(app).get('/api/v1/admin/users');
    assert.equal(noAuthList.status, 401);

    const noAuthUpdate = await request(app)
      .patch(`/api/v1/admin/users/${userActiveId}/status`)
      .send({ status: 'active' });
    assert.equal(noAuthUpdate.status, 401);

    // Regular User
    const userList = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(userList.status, 403);

    const userUpdate = await request(app)
      .patch(`/api/v1/admin/users/${userActiveId}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'active' });
    assert.equal(userUpdate.status, 403);
  });

  test('13. Non-existent user ID returns 404 Not Found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    const getRes = await request(app)
      .get(`/api/v1/admin/users/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminReadToken}`);
    assert.equal(getRes.status, 404);

    const patchRes = await request(app)
      .patch(`/api/v1/admin/users/${nonExistentId}/status`)
      .set('Authorization', `Bearer ${adminManageToken}`)
      .send({ status: ACCOUNT_STATUS.ACTIVE });
    assert.equal(patchRes.status, 404);
  });
});
