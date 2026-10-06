import { locationService } from '../../services/locations/location.service.js';
import { sendSuccess } from '../../utils/response.js';

export const locationController = {
  getDivisions(_req, res, next) {
    try {
      const divisions = locationService.getDivisions();
      return sendSuccess(res, divisions);
    } catch (err) {
      next(err);
    }
  },

  async getDistricts(req, res, next) {
    try {
      const { divisionId } = req.query;
      const districts = await locationService.getDistricts(divisionId);
      return sendSuccess(res, districts);
    } catch (err) {
      next(err);
    }
  },

  async getDistrictById(req, res, next) {
    try {
      const { districtId } = req.params;
      const district = await locationService.getDistrictById(districtId);
      return sendSuccess(res, district);
    } catch (err) {
      next(err);
    }
  },

  async getUpazilas(req, res, next) {
    try {
      const { districtId } = req.params;
      const upazilas = await locationService.getUpazilasByDistrict(districtId);
      return sendSuccess(res, upazilas);
    } catch (err) {
      next(err);
    }
  },
};
