import { Router } from 'express';
import { publicEvidenceController } from '../../controllers/public/evidence.controller.js';

const router = Router();

// Public evidence access (no tracking / no access logging per Section 5)
router.get('/:evidenceId', publicEvidenceController.getPublicEvidence);
router.get('/:evidenceId/file', publicEvidenceController.streamPublicFile);

export default router;
