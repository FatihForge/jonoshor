import { securityLogRepository } from '../../repositories/securityLog.repository.js';
import { logger } from '../../utils/logger.js';

export const securityLogService = {
  async log({
    eventType,
    accountId = null,
    ip = null,
    userAgent = null,
    deviceInfo = {},
    riskSignal = null,
    actionTaken = null,
    requestId = null,
    metadata = {},
  }) {
    try {
      const sanitizedMeta = { ...metadata };
      delete sanitizedMeta.password;
      delete sanitizedMeta.passwordHash;
      delete sanitizedMeta.token;

      return await securityLogRepository.create({
        eventType,
        accountId,
        ip,
        userAgent,
        deviceInfo,
        riskSignal,
        actionTaken,
        requestId,
        metadata: sanitizedMeta,
        timestamp: new Date(),
      });
    } catch (err) {
      logger.error('Failed to write security log:', err);
    }
  },
};
