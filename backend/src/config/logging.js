import winston from 'winston';
import { ENV } from './env.js';

const sensitiveKeys = ['password', 'passwordHash', 'token', 'refreshToken', 'accessToken', 'secret', 'authorization'];

const maskSensitiveData = winston.format((info) => {
  const mask = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const cloned = Array.isArray(obj) ? [...obj] : { ...obj };
    for (const key of Object.keys(cloned)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        cloned[key] = '[REDACTED]';
      } else if (typeof cloned[key] === 'object') {
        cloned[key] = mask(cloned[key]);
      }
    }
    return cloned;
  };

  return mask(info);
});

export const logger = winston.createLogger({
  level: ENV.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    maskSensitiveData(),
    winston.format.errors({ stack: true }),
    ENV.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ level, message, timestamp, stack, requestId, ...meta }) => {
            const reqId = requestId ? `[${requestId}] ` : '';
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} ${level}: ${reqId}${message}${metaStr}${stack ? `\n${stack}` : ''}`;
          })
        )
  ),
  transports: [
    new winston.transports.Console(),
  ],
});
