import rateLimit from 'express-rate-limit';
import { securityConfig } from '../config/security.js';
import { ENV } from '../config/env.js';

const isWhitelisted = (req) => {
  if (ENV.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
    return true;
  }
  if (req.headers['x-test-rate-limit']) {
    return false;
  }

  const clientIp = req.ip || req.connection?.remoteAddress || '';

  // In development mode, automatically whitelist localhost and local network addresses
  if (ENV.NODE_ENV === 'development') {
    if (
      !clientIp ||
      clientIp === '127.0.0.1' ||
      clientIp === '::1' ||
      clientIp === '::ffff:127.0.0.1' ||
      clientIp === 'localhost' ||
      clientIp.startsWith('192.168.') ||
      clientIp.startsWith('10.') ||
      clientIp.startsWith('172.16.')
    ) {
      return true;
    }
  }

  // Check optional whitelisted IPs from environment
  const whitelist = (process.env.RATE_LIMIT_WHITELIST_IPS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (whitelist.includes('*') || (whitelist.length && whitelist.includes(clientIp))) {
    return true;
  }

  return false;
};

export const generalRateLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: securityConfig.rateLimit.message,
  skip: isWhitelisted,
});

export const authRateLimiter = rateLimit({
  windowMs: securityConfig.authRateLimit.windowMs,
  max: securityConfig.authRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: securityConfig.authRateLimit.message,
  skip: isWhitelisted,
});

export const complaintSubmissionRateLimiter = rateLimit({
  windowMs: securityConfig.complaintSubmissionRateLimit.windowMs,
  max: securityConfig.complaintSubmissionRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: securityConfig.complaintSubmissionRateLimit.message,
  skip: isWhitelisted,
});
