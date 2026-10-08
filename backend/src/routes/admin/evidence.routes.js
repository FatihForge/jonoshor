import { Router } from 'express';
import { adminEvidenceController } from '../../controllers/admin/evidence.controller.js';
import { requirePermission } from '../../middlewares/permission.middleware.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.get('/', requirePermission(PERMISSIONS.EVIDENCE_READ), adminEvidenceController.list);
router.get('/:evidenceId', requirePermission(PERMISSIONS.EVIDENCE_READ), adminEvidenceController.getById);
router.get('/:evidenceId/file', requirePermission(PERMISSIONS.EVIDENCE_READ), adminEvidenceController.streamFile);
router.get('/:evidenceId/download', requirePermission(PERMISSIONS.EVIDENCE_READ), adminEvidenceController.streamFile);

router.post('/:evidenceId/review', requirePermission(PERMISSIONS.EVIDENCE_REVIEW), adminEvidenceController.review);
router.post('/:evidenceId/publication', requirePermission(PERMISSIONS.EVIDENCE_PUBLISH), adminEvidenceController.publish);
router.patch('/:evidenceId/publish', requirePermission(PERMISSIONS.EVIDENCE_PUBLISH), adminEvidenceController.publish);
router.patch('/:evidenceId/publication', requirePermission(PERMISSIONS.EVIDENCE_PUBLISH), adminEvidenceController.publish);
router.post('/:evidenceId/redaction', requirePermission(PERMISSIONS.EVIDENCE_PUBLISH), adminEvidenceController.publish);
router.post('/:evidenceId/delete', requirePermission(PERMISSIONS.EVIDENCE_DELETE), adminEvidenceController.delete);

export default router;
