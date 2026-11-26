import crypto from 'crypto';
import { Buffer } from 'buffer';
import { ForbiddenError } from '../utils/errors.js';
import { ENV } from '../config/env.js';

export function csrfProtection(req, res, next) {
  // Safe HTTP methods do not require CSRF token
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Exempt auth callback endpoints (e.g., OAuth) and public webhooks if any
  if (
    req.path.includes('/auth/google') ||
    req.path.includes('/auth/facebook') ||
    req.path.includes('/storage/google-drive/callback')
  ) {
    return next();
  }

  // If request uses Bearer token authorization header (API client / mobile), CSRF is not vulnerable
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next();
  }

  const hasAuthCookie = Boolean(req.cookies?.access_token || req.cookies?.refresh_token);
  const clientToken = req.headers['x-csrf-token'] || req.body?._csrf;
  const cookieToken = req.cookies?.csrf_token;

  // Requests that do not use cookie authentication and have no CSRF cookie are not vulnerable to browser CSRF
  if (!hasAuthCookie && !cookieToken && !req.headers['x-test-csrf-enforce']) {
    return next();
  }

  // In test environment: bypass unless explicitly testing CSRF with x-test-csrf-enforce
  if (ENV.NODE_ENV === 'test' && !req.headers['x-test-csrf-enforce']) {
    return next();
  }

  if (!clientToken || !cookieToken) {
    return next(new ForbiddenError('Invalid or missing CSRF token', 'CSRF_ERROR'));
  }

  const clientBuf = Buffer.from(String(clientToken));
  const cookieBuf = Buffer.from(String(cookieToken));

  if (clientBuf.length !== cookieBuf.length || !crypto.timingSafeEqual(clientBuf, cookieBuf)) {
    return next(new ForbiddenError('Invalid or missing CSRF token', 'CSRF_ERROR'));
  }

  next();
}

/**
 * Generate a new CSRF token and set it in a cookie
 */
export function generateCsrfToken(res) {
  const token = crypto.randomBytes(24).toString('hex');
  res.cookie('csrf_token', token, {
    path: '/',
    httpOnly: false, // Must be readable by client JS to send in X-CSRF-Token header
    secure: ENV.NODE_ENV === 'production',
    sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
}
