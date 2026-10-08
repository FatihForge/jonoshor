import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { authenticator } from 'otplib';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { SuperAdmin } from '../src/models/SuperAdmin.js';
import { Admin } from '../src/models/Admin.js';
import { User } from '../src/models/User.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { SecurityLog } from '../src/models/SecurityLog.js';
import { runBootstrap, validateBootstrapInputs } from '../src/scripts/bootstrapSuperAdmin.js';
import { verifyPassword } from '../src/utils/crypto.js';
import { PERMISSIONS } from '../src/constants/permissions.js';

describe('Super Admin Bootstrap & Complete Access Flow Integration Tests', () => {
  const testBatch = `bootstrap_test_${Date.now()}`;
  const superAdminEmail = `${testBatch}_sa@jonoshor-verify.org`;
  const superAdminPassword = 'SuperAdminSecretPass123!';
  let superAdminTotpSecret = null;
  let superAdminToken = null;

  const normalUserEmail = `${testBatch}_user@jonoshor-verify.org`;
  const normalUserPassword = 'NormalUserPass123!';
  let normalUserToken = null;

  const normalAdminEmail = `${testBatch}_admin@jonoshor-verify.org`;
  const normalAdminPassword = 'AdminSecretPass123!';
  const normalAdminTotpSecret = authenticator.generateSecret();
  let normalAdminToken = null;

  let createdAdminId = null;
  let preservedSuperAdmins = [];

  before(async () => {
    await connectDatabase();
    // Temporarily backup existing real SuperAdmins so the bootstrap isolation test can run without destroying user data
    preservedSuperAdmins = await SuperAdmin.find({ email: { $not: /@jonoshor-verify\.org$/ } }).lean();
    if (preservedSuperAdmins.length > 0) {
      await SuperAdmin.deleteMany({ email: { $not: /@jonoshor-verify\.org$/ } });
    }
    await SuperAdmin.deleteMany({ email: /@jonoshor-verify\.org$/ });
    await Admin.deleteMany({ email: /@jonoshor-verify\.org$/ });
    await User.deleteMany({ email: /@jonoshor-verify\.org$/ });
  });

  after(async () => {
    await SuperAdmin.deleteMany({ email: /@jonoshor-verify\.org$/ });
    await Admin.deleteMany({ email: /@jonoshor-verify\.org$/ });
    await User.deleteMany({ email: /@jonoshor-verify\.org$/ });
    await AuditLog.deleteMany({ 'metadata.email': superAdminEmail });
    await SecurityLog.deleteMany({ 'metadata.email': superAdminEmail });
    // Restore preserved real SuperAdmins
    if (preservedSuperAdmins.length > 0) {
      await SuperAdmin.insertMany(preservedSuperAdmins);
    }
    await disconnectDatabase();
  });

  test('1. Initial State: No Super Admin exists in database', async () => {
    const count = await SuperAdmin.countDocuments();
    assert.equal(count, 0, 'Database should initially have 0 super admins for bootstrap test');
  });

  test('2. Validation: Invalid bootstrap data is rejected', async () => {
    // Missing / empty name
    assert.throws(
      () => validateBootstrapInputs({ fullName: '', email: superAdminEmail, password: superAdminPassword }),
      /Full name is required/
    );

    // Invalid email
    assert.throws(
      () => validateBootstrapInputs({ fullName: 'Super Admin', email: 'invalid-email', password: superAdminPassword }),
      /A valid email address is required/
    );

    // Password too short
    assert.throws(
      () => validateBootstrapInputs({ fullName: 'Super Admin', email: superAdminEmail, password: 'short' }),
      /at least 8 characters/
    );

    // Password missing number
    assert.throws(
      () => validateBootstrapInputs({ fullName: 'Super Admin', email: superAdminEmail, password: 'NoNumberHerePass' }),
      /contain at least one letter and one number/
    );
  });

  test('3. Bootstrap creates the first Super Admin safely', async () => {
    superAdminTotpSecret = authenticator.generateSecret();

    const result = await runBootstrap({
      interactive: false,
      fullName: 'প্রধান সুপার অ্যাডমিন',
      email: superAdminEmail,
      password: superAdminPassword,
      totpSecret: superAdminTotpSecret,
      skipTotpPrompt: true,
    });

    assert.equal(result.success, true);
    assert.equal(result.alreadyExists, false);
    assert.ok(result.superAdmin.id);
    assert.equal(result.superAdmin.email, superAdminEmail.toLowerCase());
    assert.deepEqual(result.superAdmin.permissions, ['*']);
    assert.equal(result.superAdmin.twoFactorEnabled, true);

    const doc = await SuperAdmin.findOne({ email: superAdminEmail.toLowerCase() });
    assert.ok(doc, 'SuperAdmin document must exist in MongoDB');
    assert.equal(doc.accountStatus, 'active');
  });

  test('4. Password is secure: hashed with Argon2id, plaintext never stored', async () => {
    const doc = await SuperAdmin.findOne({ email: superAdminEmail.toLowerCase() }).select('+passwordHash');
    assert.ok(doc.passwordHash, 'Password hash must be stored');
    assert.notEqual(doc.passwordHash, superAdminPassword, 'Password must NOT be plaintext');
    assert.ok(doc.passwordHash.startsWith('$argon2id$'), 'Password must use Argon2id hashing');

    const isValid = await verifyPassword(doc.passwordHash, superAdminPassword);
    assert.equal(isValid, true, 'Stored Argon2id hash must verify against original password');

    // Default select must not expose passwordHash
    const unselectedDoc = await SuperAdmin.findOne({ email: superAdminEmail.toLowerCase() });
    assert.equal(unselectedDoc.passwordHash, undefined, 'passwordHash must have select: false');
  });

  test('5. Idempotency & Safety: Bootstrap CANNOT create a second Super Admin', async () => {
    const result = await runBootstrap({
      interactive: false,
      fullName: 'দ্বিতীয় সুপার অ্যাডমিন',
      email: 'another_superadmin@jonoshor-verify.org',
      password: 'AnotherSecretPass123!',
      skipTotpPrompt: true,
    });

    assert.equal(result.success, false);
    assert.equal(result.alreadyExists, true);
    assert.match(result.message, /Super Admin already exists/);

    const count = await SuperAdmin.countDocuments();
    assert.equal(count, 1, 'Total Super Admin count must strictly remain 1');
  });

  test('6. Public registration API cannot register as Super Admin or Admin', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      fullName: 'ম্যালিশিয়াস ইউজার',
      email: 'attacker@jonoshor-verify.org',
      password: 'AttackerPassword123!',
      accountType: 'superAdmin', // attempting privilege injection
      role: 'superAdmin',
    });

    assert.equal(res.status, 201);
    // User is created in User model, never SuperAdmin model
    const attackerInSA = await SuperAdmin.findOne({ email: 'attacker@jonoshor-verify.org' });
    assert.equal(attackerInSA, null, 'Public registration must never create a SuperAdmin document');

    const attackerInUser = await User.findOne({ email: 'attacker@jonoshor-verify.org' });
    assert.ok(attackerInUser, 'Created record must strictly be a standard User');
  });

  test('7. Super Admin Login requires mandatory 2FA and does not leak access token directly', async () => {
    // Testing through unified POST /api/v1/auth/login
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: superAdminEmail,
      password: superAdminPassword,
    });

    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.data.requires2FA, true);
    assert.equal(loginRes.body.data.accountType, 'superAdmin');
    assert.ok(loginRes.body.data.temp2FAToken);
    assert.equal(loginRes.body.data.accessToken, undefined, 'Must NOT issue access token before 2FA verification');

    // Invalid password returns 401 Unauthorized
    const badLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: superAdminEmail,
      password: 'WrongPassword123!',
    });
    assert.equal(badLoginRes.status, 401);
  });

  test('8. 2FA Verification establishes session, sets HttpOnly cookies, and returns Super Admin identity', async () => {
    const loginRes = await request(app).post('/api/v1/auth/super-admin/login').send({
      email: superAdminEmail,
      password: superAdminPassword,
    });
    const temp2FAToken = loginRes.body.data.temp2FAToken;

    // Reject invalid TOTP code
    const badTotpRes = await request(app).post('/api/v1/auth/super-admin/2fa/verify').send({
      temp2FAToken,
      totpCode: '000000',
    });
    assert.equal(badTotpRes.status, 401);

    // Accept valid TOTP code
    const validTotpCode = authenticator.generate(superAdminTotpSecret);
    const verifyRes = await request(app).post('/api/v1/auth/super-admin/2fa/verify').send({
      temp2FAToken,
      totpCode: validTotpCode,
    });

    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.body.success, true);
    assert.ok(verifyRes.body.data.accessToken);
    assert.equal(verifyRes.body.data.account.accountType, 'superAdmin');
    assert.deepEqual(verifyRes.body.data.account.permissions, ['*']);

    // Check HttpOnly cookies
    const cookies = verifyRes.headers['set-cookie'];
    assert.ok(cookies, 'Response must set cookies');
    assert.ok(cookies.some((c) => c.includes('access_token=') && c.includes('HttpOnly')));
    assert.ok(cookies.some((c) => c.includes('refresh_token=') && c.includes('HttpOnly')));

    superAdminToken = verifyRes.body.data.accessToken;
  });

  test('9. Super Admin can access Super Admin Dashboard and system APIs', async () => {
    const res = await request(app)
      .get('/api/v1/super-admin/dashboard')
      .set('Authorization', `Bearer ${superAdminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'SuperAdmin dashboard operational');
    assert.ok(res.body.data.counts);

    // Verify /auth/me returns superAdmin accountType
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${superAdminToken}`);

    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.data.user.accountType, 'superAdmin');
  });

  test('10. Normal User CANNOT access Super Admin APIs (403 Forbidden)', async () => {
    // Setup regular user
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'সাধারণ নাগরিক',
      email: normalUserEmail,
      password: normalUserPassword,
    });
    await User.updateOne({ email: normalUserEmail }, { emailVerified: true });
    const userLogin = await request(app).post('/api/v1/auth/login').send({
      email: normalUserEmail,
      password: normalUserPassword,
    });
    normalUserToken = userLogin.body.data.accessToken;

    const res = await request(app)
      .get('/api/v1/super-admin/dashboard')
      .set('Authorization', `Bearer ${normalUserToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  test('11. Normal Admin CANNOT access Super Admin APIs (403 Forbidden)', async () => {
    // Setup regular admin via direct creation for permission testing
    const defaultPasswordHash = await (await import('../src/utils/crypto.js')).hashPassword(normalAdminPassword);
    await Admin.create({
      fullName: 'সাধারণ অ্যাডমিন',
      email: normalAdminEmail,
      passwordHash: defaultPasswordHash,
      permissions: [PERMISSIONS.COMPLAINT_READ],
      twoFactorEnabled: true,
      twoFactorSecret: normalAdminTotpSecret,
    });

    const adminLoginRes = await request(app).post('/api/v1/auth/admin/login').send({
      email: normalAdminEmail,
      password: normalAdminPassword,
    });
    const adminTotp = authenticator.generate(normalAdminTotpSecret);
    const adminVerifyRes = await request(app).post('/api/v1/auth/admin/2fa/verify').send({
      temp2FAToken: adminLoginRes.body.data.temp2FAToken,
      totpCode: adminTotp,
    });
    normalAdminToken = adminVerifyRes.body.data.accessToken;

    // Normal Admin attempts Super Admin Dashboard
    const dashRes = await request(app)
      .get('/api/v1/super-admin/dashboard')
      .set('Authorization', `Bearer ${normalAdminToken}`);
    assert.equal(dashRes.status, 403);

    // Normal Admin attempts Super Admin Financial Settings
    const finRes = await request(app)
      .get('/api/v1/super-admin/financial-settings')
      .set('Authorization', `Bearer ${normalAdminToken}`);
    assert.equal(finRes.status, 403);
  });

  test('12. Super Admin can create Admin accounts according to permission model', async () => {
    const newAdminEmail = `${testBatch}_created_admin@jonoshor-verify.org`;
    const res = await request(app)
      .post('/api/v1/super-admin/admins')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        fullName: 'নতুন নিয়োগকৃত অ্যাডমিন',
        email: newAdminEmail,
        password: 'NewAdminPass123!',
        permissions: [PERMISSIONS.COMPLAINT_READ, PERMISSIONS.COMPLAINT_REVIEW],
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.email, newAdminEmail.toLowerCase());
    assert.equal(res.body.data.passwordHash, undefined, 'Plaintext/hash password must never be in response');
    createdAdminId = res.body.data._id;
  });

  test('13. Normal Admin and Normal User CANNOT create Admin accounts', async () => {
    // Normal User attempts to create Admin
    const userAttempt = await request(app)
      .post('/api/v1/super-admin/admins')
      .set('Authorization', `Bearer ${normalUserToken}`)
      .send({
        fullName: 'অবৈধ অ্যাডমিন',
        email: 'illegal1@jonoshor-verify.org',
        password: 'IllegalPass123!',
      });
    assert.equal(userAttempt.status, 403);

    // Normal Admin attempts to create Admin
    const adminAttempt = await request(app)
      .post('/api/v1/super-admin/admins')
      .set('Authorization', `Bearer ${normalAdminToken}`)
      .send({
        fullName: 'অবৈধ অ্যাডমিন',
        email: 'illegal2@jonoshor-verify.org',
        password: 'IllegalPass123!',
      });
    assert.equal(adminAttempt.status, 403);
  });

  test('14. Critical-Action Re-Authentication generates short-lived token', async () => {
    const totpCode = authenticator.generate(superAdminTotpSecret);

    // Password + TOTP required
    const reAuthRes = await request(app)
      .post('/api/v1/auth/re-authenticate')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        password: superAdminPassword,
        totpCode,
      });

    assert.equal(reAuthRes.status, 200);
    assert.equal(reAuthRes.body.success, true);
    assert.ok(reAuthRes.body.data.reAuthToken);

    // Critical mutation without reAuthToken fails
    const failRes = await request(app)
      .patch(`/api/v1/super-admin/admins/${createdAdminId}/permissions`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        permissions: [PERMISSIONS.COMPLAINT_READ, PERMISSIONS.LEGAL_READ],
      });
    assert.equal(failRes.status, 401);

    // Critical mutation with reAuthToken succeeds
    const successRes = await request(app)
      .patch(`/api/v1/super-admin/admins/${createdAdminId}/permissions`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .set('x-reauth-token', reAuthRes.body.data.reAuthToken)
      .send({
        permissions: [PERMISSIONS.COMPLAINT_READ, PERMISSIONS.LEGAL_READ],
      });
    assert.equal(successRes.status, 200);
    assert.equal(successRes.body.success, true);
  });

  test('15. Security & Audit Integrity: Plaintext passwords and secrets are never in logs', async () => {
    const auditLogs = await AuditLog.find({ 'metadata.email': superAdminEmail });
    assert.ok(auditLogs.length > 0, 'Audit log must record bootstrap');

    for (const log of auditLogs) {
      const logStr = JSON.stringify(log.toObject());
      assert.equal(logStr.includes(superAdminPassword), false, 'Audit log must not contain plaintext password');
      assert.equal(logStr.includes(superAdminTotpSecret), false, 'Audit log must not contain TOTP secret');
    }

    const secLogs = await SecurityLog.find({ 'metadata.email': superAdminEmail });
    for (const log of secLogs) {
      const logStr = JSON.stringify(log.toObject());
      assert.equal(logStr.includes(superAdminPassword), false, 'Security log must not contain plaintext password');
      assert.equal(logStr.includes(superAdminTotpSecret), false, 'Security log must not contain TOTP secret');
    }
  });

  test('16. Anonymous/Unauthenticated requests to Super Admin routes receive 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/super-admin/dashboard');
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });
});
