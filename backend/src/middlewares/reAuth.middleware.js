import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.js';
import { UnauthorizedError } from '../utils/errors.js';

export function requireReAuth(req, _res, next) {
  const token = req.headers['x-reauth-token'] || req.body?.reAuthToken;

  if (!token) {
    return next(new UnauthorizedError('Critical action requires re-authentication (password + 2FA)'));
  }

  try {
    const decoded = jwt.verify(token, authConfig.jwt.accessTokenSecret);
    if (decoded.purpose !== 'critical_reauth' || decoded.id !== req.auth?.id) {
      return next(new UnauthorizedError('Invalid re-authentication token'));
    }
    next();
  } catch {
    return next(new UnauthorizedError('Re-authentication token has expired or is invalid'));
  }
}
