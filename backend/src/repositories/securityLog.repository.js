import { SecurityLog } from '../models/SecurityLog.js';

export const securityLogRepository = {
  async create(logData) {
    return await SecurityLog.create(logData);
  },

  async find(filter = {}, { skip = 0, limit = 50, sort = { timestamp: -1 } } = {}) {
    return await SecurityLog.find(filter).sort(sort).skip(skip).limit(limit).exec();
  },

  async count(filter = {}) {
    return await SecurityLog.countDocuments(filter).exec();
  },
};
