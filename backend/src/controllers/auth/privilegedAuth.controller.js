import { privilegedAuthService } from '../../services/auth/privilegedAuth.service.js';
import { sendSuccess } from '../../utils/response.js';
import { authConfig } from '../../config/auth.js';

function setAuthCookies(res, accessToken, refreshToken) {
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
}

export const privilegedAuthController = {
  async adminLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await privilegedAuthService.adminLogin({ email, password });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async superAdminLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await privilegedAuthService.superAdminLogin({ email, password });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async setup2FA(req, res, next) {
    try {
      const { temp2FAToken } = req.body;
      const result = await privilegedAuthService.setup2FA(temp2FAToken);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async verify2FA(req, res, next) {
    try {
      const { temp2FAToken, totpCode } = req.body;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await privilegedAuthService.verify2FA({
        temp2FAToken,
        totpCode,
        ip,
        userAgent,
      });

      setAuthCookies(res, result.accessToken, result.refreshToken);

      return sendSuccess(res, {
        account: result.account,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  },

  async reAuthenticate(req, res, next) {
    try {
      const { password, totpCode } = req.body;
      const accountId = req.auth?.id;
      const accountType = req.auth?.accountType;

      const result = await privilegedAuthService.reAuthenticate({
        accountId,
        accountType,
        password,
        totpCode,
      });

      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};
