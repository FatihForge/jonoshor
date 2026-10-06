import { Session } from '../models/Session.js';

export const sessionRepository = {
  async create(sessionData) {
    return await Session.create(sessionData);
  },

  async findById(id) {
    return await Session.findById(id).exec();
  },

  async findByTokenHash(sessionTokenHash) {
    return await Session.findOne({ sessionTokenHash, revokedAt: null, expiresAt: { $gt: new Date() } }).exec();
  },

  async touch(id) {
    return await Session.findByIdAndUpdate(id, { lastActiveAt: new Date() }).exec();
  },

  async revoke(id) {
    return await Session.findByIdAndUpdate(id, { revokedAt: new Date() }, { new: true }).exec();
  },

  async revokeAllForAccount(accountId) {
    return await Session.updateMany({ accountId, revokedAt: null }, { revokedAt: new Date() }).exec();
  },
};
