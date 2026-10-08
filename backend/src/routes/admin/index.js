import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdminOrSuperAdmin, requireSuperAdmin } from '../../middlewares/role.middleware.js';
import { requirePermission } from '../../middlewares/permission.middleware.js';
import { PERMISSIONS } from '../../constants/permissions.js';

import evidenceRoutes from './evidence.routes.js';
import { adminComplaintReviewController } from '../../controllers/admin/complaintReview.controller.js';
import { adminLegalController } from '../../controllers/admin/legal.controller.js';
import { adminCorrectionsWithdrawalsController } from '../../controllers/admin/correctionsWithdrawals.controller.js';
import { adminJoinUsController } from '../../controllers/admin/joinUs.controller.js';
import { adminNotificationController } from '../../controllers/admin/notification.controller.js';
import { adminMessagingController } from '../../controllers/admin/messaging.controller.js';
import { adminUserController } from '../../controllers/admin/user.controller.js';
import { adminContactController } from '../../controllers/admin/contact.controller.js';
import {
  listJoinUsValidator,

  updateJoinUsStatusValidator,
  addJoinUsNoteValidator,
  updateJoinUsNoteValidator,
  deleteJoinUsValidator,
} from '../../validators/admin/joinUs.validator.js';
import {
  listUsersValidator,
  getUserByIdValidator,
  updateUserStatusValidator,
} from '../../validators/admin/user.validator.js';
import { AuditLog } from '../../models/AuditLog.js';
import { Complaint } from '../../models/Complaint.js';
import { COMPLAINT_STATUS } from '../../constants/complaintStatus.js';
import { sendSuccess } from '../../utils/response.js';

const router = Router();

// Enforce authentication & admin or superAdmin account type
router.use(authenticate, requireAdminOrSuperAdmin);

// Dashboard
router.get('/dashboard', async (_req, res, next) => {
  try {
    const [
      total,
      submitted,
      screening,
      needsInformation,
      verified,
      published,
      rejected,
      highPriority,
    ] = await Promise.all([
      Complaint.countDocuments({}),
      Complaint.countDocuments({ status: COMPLAINT_STATUS.SUBMITTED }),
      Complaint.countDocuments({
        status: { $in: [COMPLAINT_STATUS.SCREENING, COMPLAINT_STATUS.EVIDENCE_REVIEW, COMPLAINT_STATUS.VERIFICATION] },
      }),
      Complaint.countDocuments({ status: COMPLAINT_STATUS.NEEDS_INFORMATION }),
      Complaint.countDocuments({ status: COMPLAINT_STATUS.VERIFIED }),
      Complaint.countDocuments({ status: COMPLAINT_STATUS.PUBLISHED }),
      Complaint.countDocuments({ status: COMPLAINT_STATUS.REJECTED }),
      Complaint.countDocuments({ 'priority.level': { $in: ['high', 'urgent'] } }),
    ]);

    sendSuccess(res, 200, {
      status: 'Admin dashboard operational',
      counts: {
        total,
        submitted,
        pendingReview: screening,
        needsInformation,
        verified,
        published,
        rejected,
        highPriority,
      },
    }, 'Admin dashboard metrics retrieved');
  } catch (err) {
    next(err);
  }
});

// Complaints Review Pipeline
router.get('/complaints', requirePermission(PERMISSIONS.COMPLAINT_READ), adminComplaintReviewController.listComplaints);
router.get('/complaints/:id', requirePermission(PERMISSIONS.COMPLAINT_READ), adminComplaintReviewController.getComplaintById);
router.post('/complaints/:id/assign', requirePermission(PERMISSIONS.COMPLAINT_ASSIGN), adminComplaintReviewController.assignReviewer);
router.post('/complaints/:id/conflict', adminComplaintReviewController.declareConflict);
router.post('/complaints/:id/screen', requirePermission(PERMISSIONS.COMPLAINT_SCREEN), adminComplaintReviewController.screenComplaint);
router.post('/complaints/:id/request-information', requirePermission(PERMISSIONS.COMPLAINT_SCREEN), adminComplaintReviewController.requestInformation);
router.post('/complaints/:id/verify', requirePermission(PERMISSIONS.COMPLAINT_VERIFY), adminComplaintReviewController.verifyComplaint);
router.post('/complaints/:id/publication-review', requirePermission(PERMISSIONS.COMPLAINT_PUBLISH), adminComplaintReviewController.reviewPublication);
router.post('/complaints/:id/public-report', requirePermission(PERMISSIONS.COMPLAINT_PUBLISH), adminComplaintReviewController.createPublicReport);
router.get('/complaints/:id/public-report', requirePermission(PERMISSIONS.COMPLAINT_READ), adminComplaintReviewController.getPublicReportByComplaintId);

// Public Reports management
router.patch('/public-reports/:id', requirePermission(PERMISSIONS.COMPLAINT_PUBLISH), adminComplaintReviewController.updatePublicReport);

// Legal Cases & Authority Tracking
router.post('/complaints/:id/legal-cases', requirePermission(PERMISSIONS.LEGAL_CREATE), adminLegalController.createCase);
router.get('/complaints/:id/legal-cases', requirePermission(PERMISSIONS.LEGAL_READ), adminLegalController.getCases);
router.patch('/legal-cases/:id', requirePermission(PERMISSIONS.LEGAL_UPDATE), adminLegalController.updateCase);
router.post('/legal-cases/:id/timeline', requirePermission(PERMISSIONS.LEGAL_UPDATE), adminLegalController.addTimeline);
router.post('/complaints/:id/authority-actions', requirePermission(PERMISSIONS.LEGAL_UPDATE), adminLegalController.addAuthorityAction);

// Evidence Management (Phase 13 & 14)
router.use('/evidence', evidenceRoutes);

// Corrections Management (Phase 21)
router.get('/corrections', requirePermission(PERMISSIONS.COMPLAINT_SCREEN), adminCorrectionsWithdrawalsController.listCorrections);
router.get('/corrections/:id', requirePermission(PERMISSIONS.COMPLAINT_SCREEN), adminCorrectionsWithdrawalsController.getCorrectionById);
router.post('/corrections/:id/review', requirePermission(PERMISSIONS.COMPLAINT_SCREEN), adminCorrectionsWithdrawalsController.reviewCorrection);

// Withdrawals Management (Phase 21)
router.get('/withdrawals', requirePermission(PERMISSIONS.COMPLAINT_SCREEN), adminCorrectionsWithdrawalsController.listWithdrawals);
router.post('/complaints/:id/withdrawal-review', requirePermission(PERMISSIONS.COMPLAINT_SCREEN), adminCorrectionsWithdrawalsController.reviewWithdrawal);

// Join Us Admin Management (Phase 26)
router.get('/join-us', requirePermission(PERMISSIONS.JOIN_US_READ), listJoinUsValidator, adminJoinUsController.list);
router.get('/join-us/:id', requirePermission(PERMISSIONS.JOIN_US_READ), adminJoinUsController.getById);
router.patch('/join-us/:id/status', requirePermission(PERMISSIONS.JOIN_US_READ), updateJoinUsStatusValidator, adminJoinUsController.updateStatus);
router.post('/join-us/:id/notes', requirePermission(PERMISSIONS.JOIN_US_NOTES), addJoinUsNoteValidator, adminJoinUsController.addNote);
router.patch('/join-us/:id/notes/:noteId', requirePermission(PERMISSIONS.JOIN_US_NOTES), updateJoinUsNoteValidator, adminJoinUsController.updateNote);
router.get('/join-us/:id/documents/:documentId', requirePermission(PERMISSIONS.JOIN_US_READ), adminJoinUsController.downloadDocument);
router.post('/join-us/export', requirePermission(PERMISSIONS.JOIN_US_EXPORT), adminJoinUsController.exportData);
router.delete('/join-us/:id', requireSuperAdmin, deleteJoinUsValidator, adminJoinUsController.delete);

// User Management (Section 57)
router.get('/users', requirePermission(PERMISSIONS.USER_READ), listUsersValidator, adminUserController.listUsers);
router.get('/users/:id', requirePermission(PERMISSIONS.USER_READ), getUserByIdValidator, adminUserController.getUserById);
router.patch('/users/:id/status', requirePermission(PERMISSIONS.USER_MANAGE), updateUserStatusValidator, adminUserController.updateUserStatus);

// Notifications & Messages (Phase 22 & 23)
router.post('/users/:id/notifications', requirePermission(PERMISSIONS.NOTIFICATION_SEND), adminNotificationController.sendToUser);
router.get('/users/:id/messages', requirePermission(PERMISSIONS.MESSAGE_READ), adminMessagingController.listUserMessages);
router.post('/users/:id/messages', requirePermission(PERMISSIONS.MESSAGE_SEND), adminMessagingController.sendMessageToUser);

// Contact Inquiries (Public feedback & messages)
router.get('/contact', adminContactController.listMessages);
router.get('/contact/:id', adminContactController.getMessageById);
router.patch('/contact/:id/status', adminContactController.updateStatus);

// Audit Logs

router.get('/audit-logs', requirePermission(PERMISSIONS.AUDIT_READ), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments({}),
    ]);

    sendSuccess(res, 200, logs, 'Audit logs retrieved', { page, limit, total });
  } catch (err) {
    next(err);
  }
});

export default router;
