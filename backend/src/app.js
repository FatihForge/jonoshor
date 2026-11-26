import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ENV } from './config/env.js';
import { isDatabaseConnected } from './config/database.js';
import { corsOptions } from './config/cors.js';
import { requestIdMiddleware } from './middlewares/requestId.middleware.js';
import { helmetMiddleware, noSqlSanitizerMiddleware } from './middlewares/security.middleware.js';
import { notFoundMiddleware } from './middlewares/notFound.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { generalRateLimiter } from './middlewares/rateLimit.middleware.js';
import { csrfProtection, generateCsrfToken } from './middlewares/csrf.middleware.js';

// Route imports
import publicRoutes from './routes/public/index.js';
import authRoutes from './routes/auth/index.js';
import userRoutes from './routes/user/index.js';
import adminRoutes from './routes/admin/index.js';
import superAdminRoutes from './routes/superAdmin/index.js';

export const app = express();

// Trust proxy headers (Render / Cloudflare) for accurate client IP & rate limiting
const trustProxyValue = ENV.TRUST_PROXY === 'true'
  ? 1
  : (ENV.TRUST_PROXY === 'false' ? false : (Number.isNaN(Number(ENV.TRUST_PROXY)) ? ENV.TRUST_PROXY : Number(ENV.TRUST_PROXY)));
app.set('trust proxy', trustProxyValue);

// Security HTTP headers
app.use(helmetMiddleware);

// Request ID tracking
app.use(requestIdMiddleware);

// CORS configuration
app.use(cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing
app.use(cookieParser());

// NoSQL Injection sanitization
app.use(noSqlSanitizerMiddleware);

// Rate limiting
app.use(generalRateLimiter);

// Health check endpoint (Phase 2 completion criteria)
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ success: true });
});

// Readiness check endpoint (verifies database connectivity)
app.get('/api/v1/health/ready', (_req, res) => {
  const dbReady = isDatabaseConnected();
  if (!dbReady) {
    return res.status(503).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Database connection is not ready' },
    });
  }
  return res.status(200).json({ success: true, database: 'connected' });
});

// CSRF token retrieval endpoint
app.get('/api/v1/csrf-token', (_req, res) => {
  const token = generateCsrfToken(res);
  res.status(200).json({ success: true, csrfToken: token });
});

// Enforce CSRF protection on state-changing requests
app.use(csrfProtection);

// Mount route boundaries
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/super-admin', superAdminRoutes);

// 404 Handler
app.use(notFoundMiddleware);

// Centralized Error Handler
app.use(errorMiddleware);
