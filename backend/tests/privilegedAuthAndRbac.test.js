import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { authenticator } from 'otplib';
import { app } from '../src/app.js';
import { Admin } from '../src/models/Admin.js';
import { SuperAdmin } from '../src/models/SuperAdmin.js';
import { User } from '../src/models/User.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { hashPassword } from '../src/utils/crypto.js';
import { PERMISSIONS } from '../src/constants/permissions.js';

describe('Phase 6 & 7 — Privileged Auth (2FA) & RBAC Authorization Tests', () => {
  let userToken = null;
  let adminWithPermissionToken = null;
  let adminWithoutPermissionToken = null;
  let superAdminToken = null;

  const adminEmail = `admin_${Date.now()}@jonoshor-test.org`;
  const adminNoPermEmail = `admin_noperm_${Date.now()}@jonoshor-test.org`;
  const superAdminEmail = `super_${Date.now()}@jonoshor-test.org`;
  const userEmail = `user_rbac_${Date.now()}@jonoshor-test.org`;
  const password = 'StrongPassword123!';

  const adminTotpSecret = authenticator.generateSecret();
  const superAdminTotpSecret = authenticator.generateSecret();

  before(async () => {
    await connectDatabase();

    const passwordHash = await hashPassword(password);

    // 1. Create User
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'সাধারণ নাগরিক',
      email: userEmail,
      password,
    });
    await User.updateOne({ email: userEmail }, { emailVerified: true });
    const userLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: userEmail,
      password,
    });
    userToken = userLoginRes.body.data.accessToken;

    // 2. Create Admin with complaint.read permission
    const admin = await Admin.create({
      fullName: 'এডমিন অফিসার',
      email: adminEmail,
      passwordHash,
      permissions: [PERMISSIONS.COMPLAINT_READ],
      twoFactorEnabled: true,
      twoFactorSecret: adminTotpSecret,
    });

    // 3. Create Admin without permissions
    await Admin.create({
      fullName: 'নতুন এডমিন',
      email: adminNoPermEmail,
      passwordHash,
      permissions: [],
      twoFactorEnabled: true,
      twoFactorSecret: adminTotpSecret,
    });

    // 4. Create SuperAdmin
    await SuperAdmin.create({
      fullName: 'সুপার এডমিন',
      email: superAdminEmail,
      passwordHash,
      permissions: ['*'],
      twoFactorEnabled: true,
      twoFactorSecret: superAdminTotpSecret,
    });
  });

  after(async () => {
    await User.deleteMany({ email: /@jonoshor-test\.org$/ });
    await Admin.deleteMany({ email: /@jonoshor-test\.org$/ });
    await SuperAdmin.deleteMany({ email: /@jonoshor-test\.org$/ });
    await disconnectDatabase();
  });

  test('Phase 6: Admin login requires 2FA and does not issue access token directly', async () => {
    const res = await request(app).post('/api/v1/auth/admin/login').send({
      email: adminEmail,
      password,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.requires2FA, true);
    assert.ok(res.body.data.temp2FAToken);
    assert.equal(res.body.data.accessToken, undefined); // No access token yet!

    // Verify TOTP code to get full session
    const totpCode = authenticator.generate(adminTotpSecret);
    const verifyRes = await request(app).post('/api/v1/auth/admin/2fa/verify').send({
      temp2FAToken: res.body.data.temp2FAToken,
      totpCode,
    });

    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.body.success, true);
    assert.ok(verifyRes.body.data.accessToken);
    adminWithPermissionToken = verifyRes.body.data.accessToken;
  });

  test('Phase 6: Admin without permissions 2FA verify', async () => {
    const res = await request(app).post('/api/v1/auth/admin/login').send({
      email: adminNoPermEmail,
      password,
    });
    const totpCode = authenticator.generate(adminTotpSecret);
    const verifyRes = await request(app).post('/api/v1/auth/admin/2fa/verify').send({
      temp2FAToken: res.body.data.temp2FAToken,
      totpCode,
    });
    adminWithoutPermissionToken = verifyRes.body.data.accessToken;
    assert.ok(adminWithoutPermissionToken);
  });

  test('Phase 6: SuperAdmin login requires 2FA and grants SuperAdmin access upon verification', async () => {
    const res = await request(app).post('/api/v1/auth/super-admin/login').send({
      email: superAdminEmail,
      password,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.requires2FA, true);

    const totpCode = authenticator.generate(superAdminTotpSecret);
    const verifyRes = await request(app).post('/api/v1/auth/super-admin/2fa/verify').send({
      temp2FAToken: res.body.data.temp2FAToken,
      totpCode,
    });

    assert.equal(verifyRes.status, 200);
    assert.ok(verifyRes.body.data.accessToken);
    superAdminToken = verifyRes.body.data.accessToken;
  });

  // Mandatory Phase 7 RBAC Boundary Matrix Tests
  test('Phase 7 Matrix: 1. User -> User API = ALLOWED (200)', async () => {
    const res = await request(app)
      .get('/api/v1/user/profile')
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  test('Phase 7 Matrix: 2. User -> Admin API = DENIED (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  test('Phase 7 Matrix: 3. User -> Super Admin API = DENIED (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/super-admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  test('Phase 7 Matrix: 4. Admin -> Admin API = ALLOWED with permission (200)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/complaints')
      .set('Authorization', `Bearer ${adminWithPermissionToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  test('Phase 7 Matrix: 4b. Admin WITHOUT permission -> Admin API = DENIED (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/complaints')
      .set('Authorization', `Bearer ${adminWithoutPermissionToken}`);
    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  test('Phase 7 Matrix: 5. Admin -> Super Admin API = DENIED (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/super-admin/dashboard')
      .set('Authorization', `Bearer ${adminWithPermissionToken}`);
    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  test('Phase 7 Matrix: 6. Super Admin -> Super Admin API = ALLOWED (200)', async () => {
    const res = await request(app)
      .get('/api/v1/super-admin/dashboard')
      .set('Authorization', `Bearer ${superAdminToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  test('Phase 6: Re-authentication mechanism generates short-lived critical reAuthToken', async () => {
    const totpCode = authenticator.generate(adminTotpSecret);
    const res = await request(app)
      .post('/api/v1/auth/re-authenticate')
      .set('Authorization', `Bearer ${adminWithPermissionToken}`)
      .send({ password, totpCode });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.reAuthToken);
  });
});
