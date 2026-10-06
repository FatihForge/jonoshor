import { Router } from 'express';
import { publicReportController } from '../../controllers/public/report.controller.js';

const router = Router();

router.get('/', publicReportController.listReports);
router.get('/:id', publicReportController.getReportById);

export default router;
