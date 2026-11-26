import { authService } from '../../services/auth/auth.service.js';
import { sendSuccess } from '../../utils/response.js';
import { authConfig } from '../../config/auth.js';

function setAuthCookies(res, accessToken, refreshToken) {
  // Access token cookie (15m)
  res.cookie('access_token', accessToken, {
    ...authConfig.cookie,
    maxAge: 15 * 60 * 1000,
  });

  // Refresh token cookie (7d)
  if (refreshToken) {
    res.cookie('refresh_token', refreshToken, {
      ...authConfig.cookie,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}

function clearAuthCookies(res) {
  res.clearCookie('access_token', authConfig.cookie);
  res.clearCookie('refresh_token', authConfig.cookie);
}

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, null, 201);
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req, res, next) {
    try {
      const { token, email, code } = req.body;
      const result = await authService.verifyEmail({ token, email, code });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.resendVerification(email);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login({ email, password, ip, userAgent });

      if (result.requires2FA) {
        return sendSuccess(res, result);
      }

      setAuthCookies(res, result.accessToken, result.refreshToken);

      return sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const rawRefreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.refreshAccessToken({ rawRefreshToken, ip, userAgent });

      setAuthCookies(res, result.accessToken, result.refreshToken);

      return sendSuccess(res, {
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const rawRefreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
      await authService.logout(rawRefreshToken);
      clearAuthCookies(res);
      return sendSuccess(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword({ token, newPassword });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getCurrentUser(req, res, next) {
    try {
      return sendSuccess(res, { user: req.auth });
    } catch (err) {
      next(err);
    }
  },
};
