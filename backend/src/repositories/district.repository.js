import { District } from '../models/District.js';

export const districtRepository = {
  async create(districtData) {
    return await District.create(districtData);
  },

  async insertMany(districts) {
    return await District.insertMany(districts);
  },

  async findById(id) {
    return await District.findById(id).exec();
  },

  async findAllActive() {
    return await District.find({ active: true }).sort({ nameEn: 1 }).exec();
  },

  async findByDivision(divisionId) {
    return await District.find({ divisionId, active: true }).sort({ nameEn: 1 }).exec();
  },

  async count() {
    return await District.countDocuments().exec();
  },
};
