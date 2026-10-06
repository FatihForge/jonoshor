import { auditLogRepository } from '../../repositories/auditLog.repository.js';
import { logger } from '../../utils/logger.js';

export const auditService = {
  async log({
    actorId = null,
    actorType,
    action,
    resourceType,
    resourceId = null,
    entity,
    entityId = null,
    previousValue = null,
    newValue = null,
    ip = null,
    userAgent = null,
    requestId = null,
    metadata = {},
  }) {
    try {
      // Sensitive fields must never be stored in audit logs
      const sanitizedMeta = { ...metadata };
      delete sanitizedMeta.password;
      delete sanitizedMeta.passwordHash;
      delete sanitizedMeta.token;
      delete sanitizedMeta.secret;

      return await auditLogRepository.create({
        actorId,
        actorType,
        action,
        resourceType: resourceType || entity || 'system',
        resourceId: resourceId || entityId || null,
        previousValue,
        newValue,
        ip,
        userAgent,
        requestId,
        metadata: sanitizedMeta,
        timestamp: new Date(),
      });
    } catch (err) {
      logger.error('Failed to write audit log:', err);
    }
  },
};
