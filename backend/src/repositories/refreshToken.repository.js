import { RefreshToken } from '../models/RefreshToken.js';

export const refreshTokenRepository = {
  async create(tokenData) {
    return await RefreshToken.create(tokenData);
  },

  async findByTokenHash(tokenHash) {
    return await RefreshToken.findOne({ tokenHash }).exec();
  },

  async revoke(id, replacedBy = null) {
    return await RefreshToken.findByIdAndUpdate(
      id,
      { revokedAt: new Date(), replacedBy },
      { new: true }
    ).exec();
  },

  async revokeAllForAccount(accountId) {
    return await RefreshToken.updateMany({ accountId, revokedAt: null }, { revokedAt: new Date() }).exec();
  },

  async revokeBySessionId(sessionId) {
    return await RefreshToken.updateMany({ sessionId, revokedAt: null }, { revokedAt: new Date() }).exec();
  },
};
