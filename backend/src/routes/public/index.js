import { Router } from 'express';
import locationsRoutes from './locations.routes.js';
import reportsRoutes from './reports.routes.js';
import evidenceRoutes from './evidence.routes.js';
import { publicComplaintController } from '../../controllers/public/complaint.controller.js';
import { publicJoinUsController } from '../../controllers/public/joinUs.controller.js';
import { createComplaintValidator } from '../../validators/complaints/complaint.validator.js';
import { complaintSubmissionRateLimiter } from '../../middlewares/rateLimit.middleware.js';

const router = Router();

// Mount location endpoints (/api/v1/public/...)
router.use('/', locationsRoutes);

// Public complaint submission for visitors
router.post('/complaints', complaintSubmissionRateLimiter, createComplaintValidator, publicComplaintController.submitComplaint);

// Public Join Us application submission
router.post('/join-us', publicJoinUsController.submit);

// Public reports list & details
router.use('/reports', reportsRoutes);

// Public evidence access
router.use('/evidence', evidenceRoutes);

import { publicStatisticsController } from '../../controllers/public/statistics.controller.js';
import { publicContentController } from '../../controllers/public/content.controller.js';

// Statistics
router.get('/statistics', publicStatisticsController.getStatistics);

// Content CMS & Information
router.get('/content/:slug', publicContentController.getContent);
router.get('/announcements', publicContentController.getAnnouncements);
router.get('/faqs', publicContentController.getFaqs);

export default router;
