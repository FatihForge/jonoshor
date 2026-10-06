import { ENV } from './env.js';

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl/Postman in non-prod)
    if (!origin) {
      if (ENV.NODE_ENV === 'production') {
        return callback(null, true);
      }
      return callback(null, true);
    }

    if (ENV.CORS_ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS allowlist`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'X-Request-Id', 'X-Reauth-Token'],
  exposedHeaders: ['X-Request-Id'],
};
