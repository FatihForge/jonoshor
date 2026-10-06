import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { ENV } from '../../config/env.js';
import { authConfig } from '../../config/auth.js';
import { userRepository } from '../../repositories/user.repository.js';
import { reporterRepository } from '../../repositories/reporter.repository.js';
import { User } from '../../models/User.js';
import { ACCOUNT_STATUS } from '../../constants/accountStatus.js';
import { ValidationError, ForbiddenError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

const GOOGLE_AUTH_SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export class GoogleAuthService {
  constructor({
    clientId = ENV.GOOGLE_CLIENT_ID,
    clientSecret = ENV.GOOGLE_CLIENT_SECRET,
    callbackUrl = ENV.GOOGLE_CALLBACK_URL,
    client = null,
  } = {}) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.callbackUrl = callbackUrl;
    this.scopes = GOOGLE_AUTH_SCOPES;

    this.defaultClient =
      client ||
      new OAuth2Client(this.clientId, this.clientSecret, this.callbackUrl);
    this.activeClient = this.defaultClient;
  }

  /**
   * Set custom or mock client (useful for testing)
   */
  setClient(mockClient) {
    this.activeClient = mockClient;
  }

  /**
   * Reset to default OAuth2Client
   */
  resetClient() {
    this.activeClient = this.defaultClient;
  }

  /**
   * Returns current active OAuth client
   */
  getClient() {
    return this.activeClient;
  }

  /**
   * Check if Google OAuth credentials are configured
   */
  isConfigured() {
    return Boolean(this.clientId && this.clientSecret);
  }

  /**
   * Generate cryptographically signed OAuth state value to protect against login CSRF
   */
  generateState() {
    const nonce = crypto.randomBytes(16).toString('hex');
    return jwt.sign(
      { purpose: 'google_oauth_login', nonce },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '15m' }
    );
  }

  /**
   * Validate state parameter received in callback
   */
  verifyState(state, cookieState = null) {
    if (!state) {
      return { valid: false, error: 'missing_state' };
    }

    try {
      const decoded = jwt.verify(state, authConfig.jwt.accessTokenSecret);
      if (decoded.purpose !== 'google_oauth_login') {
        return { valid: false, error: 'invalid_purpose' };
      }

      if (cookieState && cookieState !== state) {
        return { valid: false, error: 'cookie_mismatch' };
      }

      return { valid: true, decoded };
    } catch {
      return { valid: false, error: 'invalid_state' };
    }
  }

  /**
   * Generate Google authorization URL requesting only identity scopes
   */
  getAuthorizationUrl(state) {
    return this.activeClient.generateAuthUrl({
      access_type: 'online', // login-only flow, no offline storage access requested
      scope: this.scopes,
      state,
      prompt: 'select_account',
    });
  }

  /**
   * Exchange authorization code for Google tokens and verify identity
   */
  async exchangeAndVerifyCode(code) {
    const { tokens } = await this.activeClient.getToken(code);
    return await this.verifyTokens(tokens);
  }

  /**
   * Verify Google token and extract user identity
   */
  async verifyTokens(tokens) {
    if (!tokens) {
      throw new ValidationError('No tokens received from Google provider');
    }

    let sub, email, emailVerified, name;

    if (tokens.id_token) {
      try {
        const ticket = await this.activeClient.verifyIdToken({
          idToken: tokens.id_token,
          audience: this.clientId,
        });
        const payload = ticket.getPayload();
        sub = payload.sub;
        email = payload.email;
        emailVerified = payload.email_verified === true;
        name = payload.name;
      } catch (err) {
        // Fallback for mocked tokens in test environments
        if (ENV.NODE_ENV === 'test') {
          const decoded = jwt.decode(tokens.id_token);
          if (decoded && decoded.sub) {
            sub = decoded.sub;
            email = decoded.email;
            emailVerified = decoded.email_verified === true;
            name = decoded.name;
          }
        }
        if (!sub) {
          throw err;
        }
      }
    } else if (tokens.access_token) {
      const res = await globalThis.fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to retrieve userinfo from Google API');
      }
      const data = await res.json();
      sub = data.sub;
      email = data.email;
      emailVerified = data.email_verified === true;
      name = data.name;
    }

    if (!sub || !email) {
      throw new ValidationError('Incomplete profile received from Google');
    }

    return {
      sub,
      email: email.toLowerCase().trim(),
      emailVerified: Boolean(emailVerified),
      name: name || '',
    };
  }

  /**
   * Account matching & linking logic:
   * 1. Match by authProvider = 'google' and Google sub
   * 2. Else match by verified email: link Google sub, preserve passwordHash
   * 3. Else create new User with authProvider = 'google', authProviderId = sub, emailVerified = true
   */
  async resolveGoogleUser({ sub, email, emailVerified, name }) {
    if (!emailVerified) {
      throw new ValidationError('Google account email is not verified');
    }

    // 1. Find existing user by authProvider = 'google' and Google sub
    let user = await userRepository.findByAuthProviderId('google', sub);
    if (!user) {
      user = await User.findOne({ authProviderId: sub }).exec();
    }

    if (!user) {
      // 2. Find by verified email
      const existingByEmail = await userRepository.findByEmail(email, true);

      if (existingByEmail) {
        // 3. Link Google identity to existing local user:
        // Preserves existing passwordHash (local authentication method remains functional)
        // Ensures email verification is set to true
        user = await userRepository.updateById(existingByEmail._id, {
          authProvider: 'google',
          authProviderId: sub,
          emailVerified: true,
        });

        // Ensure any unlinked anonymous reporter records matching this email are linked
        const existingReporter = await reporterRepository.findByEmailOrMobile(email, null);
        if (existingReporter && !existingReporter.accountId) {
          await reporterRepository.linkAccount(existingReporter._id, user._id);
        }

        logger.info('Linked Google account to existing user account', {
          userId: user._id,
          email: user.email,
          authProviderId: sub,
        });
      } else {
        // 4. Create new User account
        user = await userRepository.create({
          fullName: name || 'Google User',
          email: email.toLowerCase().trim(),
          authProvider: 'google',
          authProviderId: sub,
          emailVerified: true,
          // passwordHash is omitted (remains undefined/null)
        });

        // Link any prior anonymous reporter records matching this email
        const existingReporter = await reporterRepository.findByEmailOrMobile(email, null);
        if (existingReporter && !existingReporter.accountId) {
          await reporterRepository.linkAccount(existingReporter._id, user._id);
        }

        logger.info('Created new User account via Google login', {
          userId: user._id,
          email: user.email,
          authProviderId: sub,
        });
      }
    }

    // Account status enforcement: suspended or blocked accounts cannot log in
    if (user.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
      const err = new ForbiddenError(`Account is ${user.accountStatus}. Please contact support.`);
      err.accountStatus = user.accountStatus;
      throw err;
    }

    return user;
  }
}

export const googleAuthService = new GoogleAuthService();
