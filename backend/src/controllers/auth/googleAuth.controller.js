import { googleAuthService } from '../../services/auth/googleAuth.service.js';
import { authService } from '../../services/auth/auth.service.js';
import { authConfig } from '../../config/auth.js';
import { ENV } from '../../config/env.js';
import { sendSuccess } from '../../utils/response.js';
import { ACCOUNT_TYPES } from '../../constants/roles.js';
import { logger } from '../../utils/logger.js';

export const googleAuthController = {
  /**
   * GET /api/v1/auth/google
   * Initiates Google OAuth Authorization Code flow with signed state token
   */
  async getAuthUrl(req, res, next) {
    try {
      const state = googleAuthService.generateState();
      const authUrl = googleAuthService.getAuthorizationUrl(state);

      // Set short-lived state cookie for CSRF validation
      res.cookie('oauth_state', state, {
        ...authConfig.cookie,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      // If client requests JSON without browser redirect (useful for programmatic testing)
      if (req.query.redirect === 'false') {
        return sendSuccess(res, { authUrl, state });
      }

      // Redirect browser to Google authorization endpoint
      return res.redirect(authUrl);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/auth/google/callback
   * Handles Google OAuth callback, code exchange, account matching/linking, and session creation
   */
  async handleCallback(req, res) {
    try {
      const { error, code, state } = req.query;

      // Handle provider error / cancellation
      if (error) {
        logger.warn('Google OAuth denied or failed by provider', { error });
        const errorParam = error === 'access_denied' ? 'google_auth_denied' : 'google_auth_failed';
        return res.redirect(`${ENV.FRONTEND_URL}/#/login?error=${errorParam}`);
      }

      // Ensure authorization code is present
      if (!code) {
        logger.warn('Google OAuth callback missing authorization code');
        return res.redirect(`${ENV.FRONTEND_URL}/#/login?error=missing_code`);
      }

      // Validate OAuth state to prevent login CSRF
      const cookieState = req.cookies?.oauth_state || null;
      const stateValidation = googleAuthService.verifyState(state, cookieState);
      if (!stateValidation.valid) {
        logger.warn('Google OAuth state validation failed', { reason: stateValidation.error });
        return res.redirect(`${ENV.FRONTEND_URL}/#/login?error=invalid_state`);
      }

      // Securely exchange authorization code for Google user identity
      const identity = await googleAuthService.exchangeAndVerifyCode(code);

      // Enforce email verification by Google
      if (!identity.emailVerified) {
        logger.warn('Google account email is not verified', { email: identity.email });
        return res.redirect(`${ENV.FRONTEND_URL}/#/login?error=unverified_email`);
      }

      // Match, link, or create user account
      const user = await googleAuthService.resolveGoogleUser(identity);

      // Create JonoShor session and issue native tokens
      const { accessToken, refreshToken } = await authService.createTokensAndSession({
        account: user,
        accountType: ACCOUNT_TYPES.USER,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      // Set JonoShor HttpOnly auth cookies (Google access tokens are never returned)
      res.cookie('access_token', accessToken, {
        ...authConfig.cookie,
        maxAge: 15 * 60 * 1000,
      });

      if (refreshToken) {
        res.cookie('refresh_token', refreshToken, {
          ...authConfig.cookie,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      // Clear the temporary state cookie
      res.clearCookie('oauth_state', authConfig.cookie);

      // Redirect user to their dashboard
      return res.redirect(`${ENV.FRONTEND_URL}/#/user/dashboard`);
    } catch (err) {
      logger.error('Google OAuth callback encountered an error', { error: err.message });

      // Preserve account status restrictions (suspended/blocked)
      if (err.accountStatus) {
        return res.redirect(`${ENV.FRONTEND_URL}/#/login?error=account_${err.accountStatus}`);
      }

      // Unverified email check
      if (err.message?.includes('not verified')) {
        return res.redirect(`${ENV.FRONTEND_URL}/#/login?error=unverified_email`);
      }

      // Generic safe failure redirect without exposing secrets or internals
      return res.redirect(`${ENV.FRONTEND_URL}/#/login?error=google_auth_failed`);
    }
  },
};
