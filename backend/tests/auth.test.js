import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';

describe('Phase 5 — Authentication Foundation Tests', () => {
  const testUser = {
    fullName: 'আহমেদ হাসান',
    email: `ahmed_${Date.now()}@jonoshor-test.org`,
    password: 'SecurePassword123!',
    mobile: '01712345678',
    languagePreference: 'bn',
  };

  let verificationToken = null;
  let accessToken = null;
  let refreshTokenCookie = null;

  before(async () => {
    await connectDatabase();
  });

  after(async () => {
    await User.deleteMany({ email: /@jonoshor-test\.org$/ });
    await disconnectDatabase();
  });

  test('1. User Registration succeeds with Argon2id password hashing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testUser.email.toLowerCase());
    assert.equal(res.body.data.user.emailVerified, false);
    assert.ok(res.body.data.verificationToken);

    verificationToken = res.body.data.verificationToken;

    // Verify raw password is NOT stored, Argon2id hash is used
    const userInDb = await User.findOne({ email: testUser.email.toLowerCase() }).select('+passwordHash');
    assert.ok(userInDb.passwordHash.startsWith('$argon2id$'));
  });

  test('2. Duplicate user registration is rejected with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'CONFLICT');
  });

  test('2a. Disposable email registration is rejected with 400 Validation Error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Fake User',
        email: 'fake_person@mailinator.com',
        password: 'Password123!',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  test('2b. Login before email verification is rejected with 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'EMAIL_NOT_VERIFIED');
  });

  test('2c. Resend verification email sends token and returns success', async () => {
    const res = await request(app)
      .post('/api/v1/auth/resend-verification')
      .send({ email: testUser.email });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    if (res.body.data.verificationToken) {
      verificationToken = res.body.data.verificationToken;
    }
  });

  test('3. Email Verification activates emailVerified flag', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token: verificationToken });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const userInDb = await User.findOne({ email: testUser.email.toLowerCase() });
    assert.equal(userInDb.emailVerified, true);
  });

  test('4. Login with invalid password fails with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword999!' });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  test('5. Login with valid credentials succeeds and issues HttpOnly cookies', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.accessToken);

    accessToken = res.body.data.accessToken;

    // Check Set-Cookie headers
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies);
    const hasAccessCookie = cookies.some(c => c.startsWith('access_token='));
    const hasRefreshCookie = cookies.some(c => c.startsWith('refresh_token='));
    assert.ok(hasAccessCookie);
    assert.ok(hasRefreshCookie);

    refreshTokenCookie = cookies.find(c => c.startsWith('refresh_token='));
  });

  test('6. Authenticated request to GET /api/v1/auth/me succeeds with Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testUser.email.toLowerCase());
    assert.equal(res.body.data.user.accountType, 'user');
  });

  test('7. Token refresh rotates refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh-token')
      .set('Cookie', [refreshTokenCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.accessToken);

    const cookies = res.headers['set-cookie'];
    assert.ok(cookies);
    const newRefreshCookie = cookies.find(c => c.startsWith('refresh_token='));
    assert.ok(newRefreshCookie);
    assert.notEqual(newRefreshCookie, refreshTokenCookie);

    refreshTokenCookie = newRefreshCookie;
  });

  test('8. Logout revokes authentication and clears cookies', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', [refreshTokenCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
