import { Router } from 'express';
import { locationController } from '../../controllers/public/location.controller.js';

const router = Router();

router.get('/divisions', locationController.getDivisions);
router.get('/districts', locationController.getDistricts);
router.get('/districts/:districtId', locationController.getDistrictById);
router.get('/districts/:districtId/upazilas', locationController.getUpazilas);

export default router;
