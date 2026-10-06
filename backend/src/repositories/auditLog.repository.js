import { AuditLog } from '../models/AuditLog.js';

export const auditLogRepository = {
  async create(logData) {
    return await AuditLog.create(logData);
  },

  async find(filter = {}, { skip = 0, limit = 50, sort = { timestamp: -1 } } = {}) {
    return await AuditLog.find(filter).sort(sort).skip(skip).limit(limit).exec();
  },

  async count(filter = {}) {
    return await AuditLog.countDocuments(filter).exec();
  },
};
