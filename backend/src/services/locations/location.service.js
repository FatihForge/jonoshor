import { districtRepository } from '../../repositories/district.repository.js';
import { upazilaRepository } from '../../repositories/upazila.repository.js';
import { BANGLADESH_DIVISIONS } from '../../data/bangladeshGeoData.js';
import { NotFoundError } from '../../utils/errors.js';

export const locationService = {
  getDivisions() {
    return BANGLADESH_DIVISIONS;
  },

  async getDistricts(divisionId = null) {
    if (divisionId) {
      return await districtRepository.findByDivision(divisionId);
    }
    return await districtRepository.findAllActive();
  },

  async getDistrictById(districtId) {
    const district = await districtRepository.findById(districtId);
    if (!district) {
      throw new NotFoundError('District not found');
    }
    return district;
  },

  async getUpazilasByDistrict(districtId) {
    if (!districtId) return [];
    let upazilas = await upazilaRepository.findByDistrict(districtId);
    if (!upazilas || upazilas.length === 0) {
      if (/^[0-9a-fA-F]{24}$/.test(districtId)) {
        try {
          const district = await districtRepository.findById(districtId);
          if (district) {
            const slug = district.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '');
            upazilas = await upazilaRepository.findByDistrict(slug);
            if (!upazilas || upazilas.length === 0) {
              upazilas = await upazilaRepository.findByDistrict(district.nameEn.toLowerCase());
            }
          }
        } catch {
          // District not found by ObjectId
        }
      }
    }
    return upazilas || [];
  },
};
