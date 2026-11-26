import { Router } from 'express';
import locationsRoutes from './locations.routes.js';
import reportsRoutes from './reports.routes.js';
import evidenceRoutes from './evidence.routes.js';
import { publicComplaintController } from '../../controllers/public/complaint.controller.js';
import { publicJoinUsController } from '../../controllers/public/joinUs.controller.js';
import { createComplaintValidator } from '../../validators/complaints/complaint.validator.js';
import { submitJoinUsValidator } from '../../validators/public/joinUs.validator.js';
import { uploadMiddleware } from '../../middlewares/upload.middleware.js';
import { noSqlSanitizerMiddleware } from '../../middlewares/security.middleware.js';
import {
  complaintSubmissionRateLimiter,
  joinUsSubmissionRateLimiter,
} from '../../middlewares/rateLimit.middleware.js';
import { publicStatisticsController } from '../../controllers/public/statistics.controller.js';
import { publicContentController } from '../../controllers/public/content.controller.js';
import { publicContactController } from '../../controllers/public/contact.controller.js';
import { submitContactValidator } from '../../validators/public/contact.validator.js';
import { contactSubmissionRateLimiter } from '../../middlewares/rateLimit.middleware.js';
import { getPublicSocialLinks } from '../../controllers/public/socialLinks.controller.js';

const router = Router();

// Mount location endpoints (/api/v1/public/...)
router.use('/', locationsRoutes);

// Public complaint submission for visitors
router.post(
  '/complaints',
  complaintSubmissionRateLimiter,
  createComplaintValidator,
  publicComplaintController.submitComplaint
);

// Public Join Us application submission (with rate limiting, upload support, and reference/document validation)
router.post(
  '/join-us',
  joinUsSubmissionRateLimiter,
  uploadMiddleware.array('documents', 5),
  noSqlSanitizerMiddleware,
  submitJoinUsValidator,
  publicJoinUsController.submit
);

// Public contact form submission
router.post(
  '/contact',
  contactSubmissionRateLimiter,
  submitContactValidator,
  publicContactController.submitContact
);

// Public social platform links
router.get('/social-links', getPublicSocialLinks);

// Public reports list & details
router.use('/reports', reportsRoutes);

// Public evidence access
router.use('/evidence', evidenceRoutes);

// Statistics
router.get('/statistics', publicStatisticsController.getStatistics);

// Content CMS & Information
router.get('/content/:slug', publicContentController.getContent);
router.get('/announcements', publicContentController.getAnnouncements);
router.get('/faqs', publicContentController.getFaqs);

export default router;

