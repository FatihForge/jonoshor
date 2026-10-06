import { Router } from 'express';
import authRoutes from './auth.routes.js';
import { authRateLimiter } from '../../middlewares/rateLimit.middleware.js';

const router = Router();

// Apply auth rate limiting
router.use(authRateLimiter);

// Mount main auth routes
router.use('/', authRoutes);

export default router;
