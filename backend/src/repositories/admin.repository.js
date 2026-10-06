import { Admin } from '../models/Admin.js';

export const adminRepository = {
  async create(adminData) {
    return await Admin.create(adminData);
  },

  async findById(id, includeSecret = false) {
    const query = Admin.findById(id);
    if (includeSecret) {
      query.select('+passwordHash +twoFactorSecret');
    }
    return await query.exec();
  },

  async findByEmail(email, includeSecret = false) {
    const query = Admin.findOne({ email: email.toLowerCase() });
    if (includeSecret) {
      query.select('+passwordHash +twoFactorSecret');
    }
    return await query.exec();
  },

  async updateById(id, updateData) {
    return await Admin.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  },

  async find(filter = {}, { skip = 0, limit = 20, sort = { createdAt: -1 } } = {}) {
    return await Admin.find(filter).sort(sort).skip(skip).limit(limit).exec();
  },

  async count(filter = {}) {
    return await Admin.countDocuments(filter).exec();
  },
};
