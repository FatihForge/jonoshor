import { Permission } from '../models/Permission.js';

export const permissionRepository = {
  async create(permissionData) {
    return await Permission.create(permissionData);
  },

  async findByKey(key) {
    return await Permission.findOne({ key }).exec();
  },

  async find(filter = {}) {
    return await Permission.find(filter).exec();
  },

  async updateByKey(key, updateData) {
    return await Permission.findOneAndUpdate({ key }, updateData, { new: true }).exec();
  },
};
