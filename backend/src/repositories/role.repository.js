import { Role } from '../models/Role.js';

export const roleRepository = {
  async create(roleData) {
    return await Role.create(roleData);
  },

  async findById(id) {
    return await Role.findById(id).exec();
  },

  async findByName(name) {
    return await Role.findOne({ name }).exec();
  },

  async find(filter = {}) {
    return await Role.find(filter).exec();
  },

  async updateById(id, updateData) {
    return await Role.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  },
};
