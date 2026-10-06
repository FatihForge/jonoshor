import { ENV } from './env.js';

export const securityConfig = {
  rateLimit: {
    windowMs: ENV.RATE_LIMIT_WINDOW_MS,
    max: ENV.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests, please try again later.',
      },
    },
  },
  authRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many authentication attempts, please try again after 15 minutes.',
      },
    },
  },
  complaintSubmissionRateLimit: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // max 5 submissions per hour per IP
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many complaint submissions. Please try again later.',
      },
    },
  },
  argon2: {
    memoryCost: ENV.ARGON2_MEMORY_COST,
    timeCost: ENV.ARGON2_TIME_COST,
    parallelism: ENV.ARGON2_PARALLELISM,
  },
  csrfSecret: ENV.CSRF_SECRET,
};
