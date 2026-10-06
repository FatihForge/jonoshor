import { Upazila } from '../models/Upazila.js';

export const upazilaRepository = {
  async create(upazilaData) {
    return await Upazila.create(upazilaData);
  },

  async insertMany(upazilas) {
    return await Upazila.insertMany(upazilas);
  },

  async findById(id) {
    return await Upazila.findById(id).exec();
  },

  async findByDistrict(districtId) {
    return await Upazila.find({ districtId, active: true }).sort({ nameEn: 1 }).exec();
  },

  async count() {
    return await Upazila.countDocuments().exec();
  },
};
