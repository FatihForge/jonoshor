import { districtRepository } from '../../repositories/district.repository.js';
import { upazilaRepository } from '../../repositories/upazila.repository.js';
import { BANGLADESH_DIVISIONS } from '../../data/bangladeshGeoData.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

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

  async validateHierarchy({ divisionId, districtId, upazilaId } = {}) {
    if (!divisionId && !districtId && !upazilaId) {
      return true;
    }

    let normDivision = divisionId ? divisionId.toString().toLowerCase().trim() : null;
    if (normDivision) {
      const validDiv = BANGLADESH_DIVISIONS.find(
        (d) => d.id === normDivision || d.nameEn.toLowerCase() === normDivision
      );
      if (!validDiv) {
        throw new ValidationError('Invalid division specified');
      }
      normDivision = validDiv.id;
    }

    let districtDoc = null;
    if (districtId) {
      const distStr = districtId.toString().trim();
      const mongoose = (await import('mongoose')).default;
      if (mongoose.Types.ObjectId.isValid(distStr)) {
        districtDoc = await districtRepository.findById(distStr);
      }
      if (!districtDoc) {
        const found = (await import('../../data/bangladeshGeoData.js')).BANGLADESH_DISTRICTS.find(
          (d) => d.id === distStr.toLowerCase() || d.nameEn.toLowerCase() === distStr.toLowerCase()
        );
        if (found) {
          districtDoc = found;
        }
      }

      if (!districtDoc) {
        throw new ValidationError('Invalid district specified');
      }

      const distDivId = districtDoc.divisionId ? districtDoc.divisionId.toLowerCase() : '';
      if (normDivision && distDivId && distDivId !== normDivision) {
        throw new ValidationError('Selected district does not belong to the specified division');
      }
    }

    if (upazilaId) {
      if (!districtId) {
        throw new ValidationError('District is required when specifying an upazila');
      }
      const upzStr = upazilaId.toString().trim();
      const mongoose = (await import('mongoose')).default;
      let upazilaDoc = null;
      if (mongoose.Types.ObjectId.isValid(upzStr)) {
        upazilaDoc = await upazilaRepository.findById(upzStr);
      }
      if (!upazilaDoc) {
        const { SAMPLE_UPAZILAS } = await import('../../data/bangladeshGeoData.js');
        const found = SAMPLE_UPAZILAS.find(
          (u) =>
            u.nameEn.toLowerCase() === upzStr.toLowerCase() ||
            u.nameBn === upzStr ||
            (u._id && u._id.toString() === upzStr)
        );
        if (found) {
          upazilaDoc = found;
        }
      }

      if (upazilaDoc && districtDoc) {
        const upzDistId = upazilaDoc.districtId ? upazilaDoc.districtId.toString().toLowerCase() : '';
        const targetDistId = districtDoc.id ? districtDoc.id.toString().toLowerCase() : (districtDoc._id ? districtDoc._id.toString().toLowerCase() : '');
        const targetDistNameEn = districtDoc.nameEn ? districtDoc.nameEn.toLowerCase() : '';

        const matches = (
          upzDistId === targetDistId ||
          upzDistId === targetDistNameEn ||
          upzDistId === districtId.toString().toLowerCase()
        );

        if (!matches) {
          throw new ValidationError('Selected upazila does not belong to the specified district');
        }
      }
    }

    return true;
  },
};

