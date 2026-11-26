import { Router } from 'express';
import { userComplaintController } from '../../controllers/user/complaint.controller.js';
import { userEvidenceController } from '../../controllers/user/evidence.controller.js';
import { userLegalController } from '../../controllers/user/legal.controller.js';
import { createComplaintValidator } from '../../validators/complaints/complaint.validator.js';
import { complaintSubmissionRateLimiter } from '../../middlewares/rateLimit.middleware.js';

import { uploadMiddleware } from '../../middlewares/upload.middleware.js';
import { noSqlSanitizerMiddleware } from '../../middlewares/security.middleware.js';

const optionalUploadSingle = (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    return uploadMiddleware.single('file')(req, res, next);
  }
  next();
};

const router = Router();

router.post('/', complaintSubmissionRateLimiter, createComplaintValidator, userComplaintController.createComplaint);
router.get('/', userComplaintController.getMyComplaints);
router.get('/:id', userComplaintController.getMyComplaintById);
router.patch('/:id', userComplaintController.updateComplaint);
router.post('/:id/withdraw', userComplaintController.requestWithdrawal);
router.post('/:id/corrections', userComplaintController.requestCorrection);
router.post('/:id/legal-update-request', userLegalController.requestUpdate);

// Evidence routes (Phase 13)
router.post('/:id/evidence/upload-session', userEvidenceController.createUploadSession);
router.post('/:id/evidence/complete', optionalUploadSingle, noSqlSanitizerMiddleware, userEvidenceController.completeUpload);
router.post('/:id/evidence/external', userEvidenceController.addExternalLink);
router.get('/:id/evidence', userEvidenceController.listEvidence);
router.get('/:id/evidence/:evidenceId/download', userEvidenceController.downloadEvidence);

export default router;
