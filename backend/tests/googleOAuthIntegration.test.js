import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authConfig } from '../src/config/auth.js';
import { ENV } from '../src/config/env.js';
import { hashPassword } from '../src/utils/crypto.js';
import { User } from '../src/models/User.js';
import { Reporter } from '../src/models/Reporter.js';
import { Session } from '../src/models/Session.js';
import { RefreshToken } from '../src/models/RefreshToken.js';
import { ACCOUNT_STATUS } from '../src/constants/accountStatus.js';
import { googleAuthService } from '../src/services/auth/googleAuth.service.js';

describe('Google OAuth 2.0 Integration Tests', () => {
  const testBatch = `g_oauth_${Date.now()}`;
  let localUser = null;
  let suspendedUser = null;
  let preExistingReporter = null;
  const localPassword = 'LocalPassword123!';
  const createdUserIds = [];

  class MockGoogleOAuthClient {
    constructor() {
      this.redirectUri = ENV.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback';
    }

    generateAuthUrl(options) {
      return `https://accounts.google.com/o/oauth2/v2/auth?access_type=${options.access_type}&scope=${encodeURIComponent(options.scope.join(' '))}&state=${options.state}&prompt=${options.prompt}&response_type=code&client_id=${ENV.GOOGLE_CLIENT_ID || 'test_client_id'}&redirect_uri=${encodeURIComponent(this.redirectUri)}`;
    }

    async getToken(code) {
      if (code === 'invalid_code' || code === 'failing_exchange_code') {
        throw new Error('Google token exchange failed: invalid code');
      }
      return {
        tokens: {
          access_token: 'mock_google_access_token_secret_9999',
          id_token: `mock_id_token_${code}`,
        },
      };
    }

    async verifyIdToken({ idToken }) {
      if (idToken.includes('synth_new_1')) {
        return {
          getPayload: () => ({
            sub: 'google_sub_synth_1',
            email: `${testBatch}_user1@jonoshor-verify.org`,
            email_verified: true,
            name: 'Synthetic Google User One',
          }),
        };
      }
      if (idToken.includes('synth_link_2')) {
        return {
          getPayload: () => ({
            sub: 'google_sub_synth_link_2',
            email: `${testBatch}_local@jonoshor-verify.org`,
            email_verified: true,
            name: 'Synthetic Local User Linked',
          }),
        };
      }
      if (idToken.includes('synth_unverified_3')) {
        return {
          getPayload: () => ({
            sub: 'google_sub_unverified_3',
            email: `${testBatch}_unverified@jonoshor-verify.org`,
            email_verified: false,
            name: 'Unverified Google User',
          }),
        };
      }
      if (idToken.includes('synth_suspended_4')) {
        return {
          getPayload: () => ({
            sub: 'google_sub_suspended_4',
            email: `${testBatch}_suspended@jonoshor-verify.org`,
            email_verified: true,
            name: 'Suspended Google User',
          }),
        };
      }
      throw new Error(`Unrecognized mock ID token: ${idToken}`);
    }
  }

  before(async () => {
    await connectDatabase();
    googleAuthService.setClient(new MockGoogleOAuthClient());

    // Create a synthetic local user with password for linking test
    const passwordHash = await hashPassword(localPassword);
    localUser = await User.create({
      fullName: 'লোকাল ইউজার পরীক্ষার্থী',
      email: `${testBatch}_local@jonoshor-verify.org`,
      passwordHash,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      authProvider: 'local',
      emailVerified: false,
    });
    createdUserIds.push(localUser._id);

    // Create a suspended user account for status restriction test
    suspendedUser = await User.create({
      fullName: 'স্থগিত ইউজার পরীক্ষার্থী',
      email: `${testBatch}_suspended@jonoshor-verify.org`,
      accountStatus: ACCOUNT_STATUS.SUSPENDED,
      authProvider: 'google',
      authProviderId: 'google_sub_suspended_4',
      emailVerified: true,
    });
    createdUserIds.push(suspendedUser._id);

    // Create a pre-existing anonymous reporter record for user1
    preExistingReporter = await Reporter.create({
      reporterType: 'non_user',
      contact: { email: `${testBatch}_user1@jonoshor-verify.org` },
      identityVisibility: 'private',
    });
  });

  after(async () => {
    googleAuthService.resetClient();

    // Clean up all synthetic users created in this batch
    await User.deleteMany({
      $or: [
        { _id: { $in: createdUserIds } },
        { email: new RegExp(`^${testBatch}`) },
      ],
    });
    await Session.deleteMany({ accountId: { $in: createdUserIds } });
    await RefreshToken.deleteMany({ accountId: { $in: createdUserIds } });
    await Reporter.deleteMany({ 'contact.email': new RegExp(`^${testBatch}`) });

    await disconnectDatabase();
  });

  // ================= 1 & 2. AUTHORIZATION ENDPOINT & STATE =================

  test('1. Google authorization endpoint generates a valid redirect URL', async () => {
    const res = await request(app)
      .get('/api/v1/auth/google')
      .expect(302);

    const location = res.headers.location;
    assert.ok(location, 'Must return a Location redirect header');
    assert.ok(location.startsWith('https://accounts.google.com/o/oauth2/v2/auth'));
    assert.ok(location.includes('response_type=code'), 'Must specify authorization code flow');
    assert.ok(location.includes('access_type=online'), 'Must specify online access only');
    assert.ok(location.includes('openid'), 'Must request openid scope');
    assert.ok(location.includes('userinfo.email'), 'Must request email scope');
    assert.ok(location.includes('userinfo.profile'), 'Must request profile scope');
    assert.ok(!location.includes('drive.file'), 'Must never request Google Drive scopes in login');
  });

  test('2. OAuth state is present, signed, and saved in temporary cookie', async () => {
    const res = await request(app)
      .get('/api/v1/auth/google')
      .expect(302);

    const location = res.headers.location;
    const urlObj = new URL(location);
    const state = urlObj.searchParams.get('state');
    assert.ok(state, 'OAuth state parameter must be present in redirect URL');

    // Verify state token is a valid signed JWT
    const decoded = jwt.verify(state, authConfig.jwt.accessTokenSecret);
    assert.equal(decoded.purpose, 'google_oauth_login');
    assert.ok(decoded.nonce, 'State must contain a random nonce');

    // Verify oauth_state cookie is attached
    const setCookie = res.headers['set-cookie'];
    assert.ok(setCookie, 'Must set oauth_state cookie');
    const hasStateCookie = setCookie.some(c => c.includes('oauth_state='));
    assert.ok(hasStateCookie, 'oauth_state cookie must be set');
  });

  // ================= 3 & 4. STATE VALIDATION =================

  test('3. Tampered state is rejected and redirects safely to login', async () => {
    const res = await request(app)
      .get('/api/v1/auth/google/callback?code=mock_code&state=tampered.invalid.state')
      .expect(302);

    assert.ok(res.headers.location.includes('/#/login?error=invalid_state'));
  });

  test('4. Missing state is rejected and redirects safely to login', async () => {
    const res = await request(app)
      .get('/api/v1/auth/google/callback?code=mock_code')
      .expect(302);

    assert.ok(res.headers.location.includes('/#/login?error=invalid_state'));
  });

  // ================= 5 & 6. USER CREATION & IDEMPOTENCY =================

  test('5. Successful Google identity creates a new User with proper attributes', async () => {
    const state = googleAuthService.generateState();

    const res = await request(app)
      .get(`/api/v1/auth/google/callback?code=synth_new_1&state=${state}`)
      .set('Cookie', [`oauth_state=${state}`])
      .expect(302);

    assert.ok(res.headers.location.includes('/#/user/dashboard'));

    // Verify user in database
    const createdUser = await User.findOne({ email: `${testBatch}_user1@jonoshor-verify.org` });
    assert.ok(createdUser, 'User must be created in MongoDB');
    createdUserIds.push(createdUser._id);

    assert.equal(createdUser.fullName, 'Synthetic Google User One');
    assert.equal(createdUser.authProvider, 'google');
    assert.equal(createdUser.authProviderId, 'google_sub_synth_1');
    assert.equal(createdUser.emailVerified, true);
    assert.equal(createdUser.passwordHash, undefined, 'Google-created user must not have passwordHash');
    assert.equal(createdUser.accountStatus, ACCOUNT_STATUS.ACTIVE);

    // Verify pre-existing anonymous reporter was linked without generating a new Reporter record
    const linkedReporter = await Reporter.findById(preExistingReporter._id);
    assert.ok(linkedReporter, 'Pre-existing reporter must exist');
    assert.equal(linkedReporter.accountId.toString(), createdUser._id.toString(), 'Reporter must link to new user account');
    assert.equal(linkedReporter.reporterType, 'user', 'Reporter type must update to user');
    assert.equal(linkedReporter.identityVisibility, 'private', 'Reporter identity visibility must remain private');
  });

  test('6. Existing Google user logs in without duplicate creation', async () => {
    const initialCount = await User.countDocuments({ email: `${testBatch}_user1@jonoshor-verify.org` });
    assert.equal(initialCount, 1);

    const state = googleAuthService.generateState();
    const res = await request(app)
      .get(`/api/v1/auth/google/callback?code=synth_new_1&state=${state}`)
      .set('Cookie', [`oauth_state=${state}`])
      .expect(302);

    assert.ok(res.headers.location.includes('/#/user/dashboard'));

    const finalCount = await User.countDocuments({ email: `${testBatch}_user1@jonoshor-verify.org` });
    assert.equal(finalCount, 1, 'Duplicate user must not be created on repeated Google login');
  });

  // ================= 7 & 8. ACCOUNT LINKING & PASSWORD PRESERVATION =================

  test('7. Existing local user with matching verified email is safely linked', async () => {
    assert.equal(localUser.authProvider, 'local');
    assert.equal(localUser.emailVerified, false);

    const state = googleAuthService.generateState();
    const res = await request(app)
      .get(`/api/v1/auth/google/callback?code=synth_link_2&state=${state}`)
      .set('Cookie', [`oauth_state=${state}`])
      .expect(302);

    assert.ok(res.headers.location.includes('/#/user/dashboard'));

    const linkedUser = await User.findById(localUser._id);
    assert.equal(linkedUser.authProviderId, 'google_sub_synth_link_2');
    assert.equal(linkedUser.emailVerified, true, 'Email verification must be confirmed after Google login');
  });

  test('8. Existing local password remains intact after Google account linking', async () => {
    // Check that user can still log in using local credentials
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: localUser.email,
        password: localPassword,
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, localUser.email);
    assert.ok(res.body.data.accessToken, 'Local password authentication must still issue access token');
  });

  // ================= 9 & 10. UNVERIFIED EMAIL & ACCOUNT RESTRICTION =================

  test('9. Unverified Google email is rejected and does not create account', async () => {
    const state = googleAuthService.generateState();
    const res = await request(app)
      .get(`/api/v1/auth/google/callback?code=synth_unverified_3&state=${state}`)
      .set('Cookie', [`oauth_state=${state}`])
      .expect(302);

    assert.ok(res.headers.location.includes('/#/login?error=unverified_email'));

    const unverifiedUser = await User.findOne({ email: `${testBatch}_unverified@jonoshor-verify.org` });
    assert.equal(unverifiedUser, null, 'Account must not be created for unverified Google email');
  });

  test('10. Blocked/suspended account cannot bypass status restrictions via Google login', async () => {
    const state = googleAuthService.generateState();
    const res = await request(app)
      .get(`/api/v1/auth/google/callback?code=synth_suspended_4&state=${state}`)
      .set('Cookie', [`oauth_state=${state}`])
      .expect(302);

    assert.ok(res.headers.location.includes('/#/login?error=account_suspended'));

    // Ensure no session cookies are set for suspended account
    const setCookie = res.headers['set-cookie'];
    if (setCookie) {
      assert.ok(!setCookie.some(c => c.includes('access_token=')), 'No access token cookie for suspended user');
    }
  });

  // ================= 11 & 12. JONOSHOR SESSION & SENSITIVE TOKEN ISOLATION =================

  test('11. Successful OAuth creates JonoShor normal session cookies', async () => {
    const state = googleAuthService.generateState();
    const res = await request(app)
      .get(`/api/v1/auth/google/callback?code=synth_new_1&state=${state}`)
      .set('Cookie', [`oauth_state=${state}`])
      .expect(302);

    const cookies = res.headers['set-cookie'] || [];
    const hasAccessToken = cookies.some(c => c.startsWith('access_token=') && c.includes('HttpOnly'));
    const hasRefreshToken = cookies.some(c => c.startsWith('refresh_token=') && c.includes('HttpOnly'));

    assert.ok(hasAccessToken, 'access_token cookie must be set and HttpOnly');
    assert.ok(hasRefreshToken, 'refresh_token cookie must be set and HttpOnly');
  });

  test('12. Google provider access token is never returned to frontend or set in cookies', async () => {
    const state = googleAuthService.generateState();
    const res = await request(app)
      .get(`/api/v1/auth/google/callback?code=synth_new_1&state=${state}`)
      .set('Cookie', [`oauth_state=${state}`])
      .expect(302);

    const location = res.headers.location;
    const cookies = (res.headers['set-cookie'] || []).join(';');
    const bodyStr = JSON.stringify(res.body || {});

    // Ensure mock Google access token is nowhere in the client response
    assert.ok(!location.includes('mock_google_access_token_secret_9999'), 'Google token must not be in redirect URL');
    assert.ok(!cookies.includes('mock_google_access_token_secret_9999'), 'Google token must not be in cookies');
    assert.ok(!bodyStr.includes('mock_google_access_token_secret_9999'), 'Google token must not be in response body');
  });

  // ================= 13. OAUTH FAILURE & ERROR HANDLING =================

  test('13. OAuth failure redirects safely to login without leaking diagnostic secrets', async () => {
    // 13a. Provider access denied
    const resDenied = await request(app)
      .get('/api/v1/auth/google/callback?error=access_denied')
      .expect(302);
    assert.ok(resDenied.headers.location.includes('/#/login?error=google_auth_denied'));

    // 13b. Missing code parameter
    const state = googleAuthService.generateState();
    const resMissingCode = await request(app)
      .get(`/api/v1/auth/google/callback?state=${state}`)
      .set('Cookie', [`oauth_state=${state}`])
      .expect(302);
    assert.ok(resMissingCode.headers.location.includes('/#/login?error=missing_code'));

    // 13c. Provider exchange failure
    const resExchangeFail = await request(app)
      .get(`/api/v1/auth/google/callback?code=failing_exchange_code&state=${state}`)
      .set('Cookie', [`oauth_state=${state}`])
      .expect(302);
    assert.ok(resExchangeFail.headers.location.includes('/#/login?error=google_auth_failed'));
  });

  // ================= 14. CREDENTIAL SEPARATION =================

  test('14. Google Drive credentials and scopes remain completely isolated', async () => {
    // Google Login uses GOOGLE_CLIENT_ID
    assert.equal(googleAuthService.clientId, ENV.GOOGLE_CLIENT_ID);

    // Google Login scopes only include identity scopes
    assert.ok(googleAuthService.scopes.includes('openid'));
    assert.ok(googleAuthService.scopes.includes('https://www.googleapis.com/auth/userinfo.email'));
    assert.ok(googleAuthService.scopes.includes('https://www.googleapis.com/auth/userinfo.profile'));
    assert.ok(!googleAuthService.scopes.includes('https://www.googleapis.com/auth/drive.file'), 'Drive scope must never be in Google Login');

    // Google Drive Client ID is independent and does not fall back to Google Login Client ID
    const driveClientId = ENV.GOOGLE_DRIVE_CLIENT_ID;
    const userClientId = ENV.GOOGLE_CLIENT_ID;

    // Both are distinct configs
    assert.notEqual(driveClientId, userClientId, 'Google Drive and Google User Login client IDs should be isolated');
  });
});
