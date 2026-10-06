import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authConfig } from '../src/config/auth.js';
import { hashPassword } from '../src/utils/crypto.js';
import { User } from '../src/models/User.js';
import { Session } from '../src/models/Session.js';
import { RefreshToken } from '../src/models/RefreshToken.js';
import { ACCOUNT_STATUS } from '../src/constants/accountStatus.js';

describe('Password Recovery (Forgot Password & Reset Password) Integration Tests', () => {
  let testUser = null;
  const initialPassword = 'InitialPass123!';
  const updatedPassword = 'NewSecurePass456!';
  const testBatch = `pwd_recov_${Date.now()}`;

  before(async () => {
    await connectDatabase();
    const passwordHash = await hashPassword(initialPassword);

    testUser = await User.create({
      fullName: 'পাসওয়ার্ড রিকভারি পরীক্ষার্থী',
      email: `${testBatch}_user@jonoshor-verify.org`,
      passwordHash,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      authProvider: 'local',
      emailVerified: true,
    });
  });

  after(async () => {
    if (testUser) {
      await Promise.all([
        User.deleteOne({ _id: testUser._id }),
        Session.deleteMany({ accountId: testUser._id }),
        RefreshToken.deleteMany({ accountId: testUser._id }),
      ]);
    }
    await disconnectDatabase();
  });

  // ================= FORGOT PASSWORD =================

  test('1. Forgot password request for registered email returns success with resetToken', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: testUser.email })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(res.body.data?.resetToken, 'Reset token should be generated');

    // Verify token payload structure
    const decoded = jwt.verify(res.body.data.resetToken, authConfig.jwt.accessTokenSecret);
    assert.equal(decoded.userId, testUser._id.toString());
    assert.equal(decoded.type, 'password_reset');
  });

  test('2. Anti-enumeration: Forgot password for non-existent email returns success without leaking presence', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nonexistent_account_9999@jonoshor-verify.org' })
      .expect(200);

    assert.equal(res.body.success, true);
    // Crucial: No reset token returned for non-existent user, preventing account creation/hijacking
    assert.equal(res.body.data?.resetToken, undefined);
  });

  test('3. Forgot password with invalid email format is rejected with 400 ValidationError', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'not-an-email-address' })
      .expect(400);

    assert.equal(res.body.success, false);
    assert.equal(res.body.error?.code, 'VALIDATION_ERROR');
  });

  // ================= RESET PASSWORD =================

  test('4. Reset password with valid token and strong password successfully updates credentials', async () => {
    // 1. Generate fresh reset token
    const token = jwt.sign(
      { userId: testUser._id.toString(), type: 'password_reset' },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '15m' }
    );

    // 2. Perform reset
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token,
        newPassword: updatedPassword,
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(res.body.data?.message.includes('successfully'));

    // 3. Verify user can now log in with the new password
    const loginNew = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: updatedPassword,
      })
      .expect(200);

    assert.equal(loginNew.body.success, true);
    assert.ok(loginNew.body.data?.accessToken);

    // 4. Verify old password no longer works
    const loginOld = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: initialPassword,
      })
      .expect(401);

    assert.equal(loginOld.body.success, false);
  });

  test('5. Reset password with invalid token is rejected with 401 or 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: 'invalid_malformed_token_string',
        newPassword: 'AnotherPassword789!',
      });

    assert.ok([400, 401].includes(res.status));
    assert.equal(res.body.success, false);
  });

  test('6. Reset password with expired token is rejected with 400 ValidationError', async () => {
    // Generate expired token
    const expiredToken = jwt.sign(
      { userId: testUser._id.toString(), type: 'password_reset' },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '-1s' }
    );

    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: expiredToken,
        newPassword: 'AnotherPassword789!',
      })
      .expect(400);

    assert.equal(res.body.success, false);
    assert.ok(res.body.error?.message.includes('expired'));
  });

  test('7. Reset password with weak password (missing digit or length < 8) is rejected with 400', async () => {
    const token = jwt.sign(
      { userId: testUser._id.toString(), type: 'password_reset' },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '15m' }
    );

    // Too short (< 8 chars)
    const resShort = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token,
        newPassword: 'short',
      })
      .expect(400);
    assert.equal(resShort.body.success, false);

    // Missing digit
    const resNoDigit = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token,
        newPassword: 'PasswordWithoutDigits',
      })
      .expect(400);
    assert.equal(resNoDigit.body.success, false);
  });

  // ================= CSRF PROTECTION =================

  test('8. CSRF protection is enforced on password reset mutations', async () => {
    const tokenRes = await request(app).get('/api/v1/csrf-token');
    const csrfCookieHeader = tokenRes.headers['set-cookie'];
    const csrfCookie = csrfCookieHeader.find((c) => c.startsWith('csrf_token='));
    const tokenValue = tokenRes.body.csrfToken;

    // Tampered CSRF -> 403 Forbidden
    const invalidCsrf = await request(app)
      .post('/api/v1/auth/forgot-password')
      .set('Cookie', [csrfCookie])
      .set('X-CSRF-Token', 'tampered_token_value')
      .set('x-test-csrf-enforce', 'true')
      .send({ email: testUser.email });

    assert.equal(invalidCsrf.status, 403);
    assert.equal(invalidCsrf.body.error?.code, 'CSRF_ERROR');

    // Valid CSRF -> 200 OK
    const validCsrf = await request(app)
      .post('/api/v1/auth/forgot-password')
      .set('Cookie', [csrfCookie])
      .set('X-CSRF-Token', tokenValue)
      .set('x-test-csrf-enforce', 'true')
      .send({ email: testUser.email });

    assert.equal(validCsrf.status, 200);
  });
});
