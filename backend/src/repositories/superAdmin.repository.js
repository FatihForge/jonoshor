import { SuperAdmin } from '../models/SuperAdmin.js';

export const superAdminRepository = {
  async create(superAdminData) {
    return await SuperAdmin.create(superAdminData);
  },

  async findById(id, includeSecret = false) {
    const query = SuperAdmin.findById(id);
    if (includeSecret) {
      query.select('+passwordHash +twoFactorSecret');
    }
    return await query.exec();
  },

  async findByEmail(email, includeSecret = false) {
    const query = SuperAdmin.findOne({ email: email.toLowerCase() });
    if (includeSecret) {
      query.select('+passwordHash +twoFactorSecret');
    }
    return await query.exec();
  },

  async updateById(id, updateData) {
    return await SuperAdmin.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  },

  async find(filter = {}) {
    return await SuperAdmin.find(filter).exec();
  },

  async count(filter = {}) {
    return await SuperAdmin.countDocuments(filter).exec();
  },
};
