import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { ENV } from '../config/env.js';

export function errorMiddleware(err, req, res, _next) {
  const requestId = req?.id || null;

  // Log error with requestId
  logger.error(`${err.name || 'Error'}: ${err.message}`, {
    requestId,
    stack: ENV.NODE_ENV !== 'production' ? err.stack : undefined,
    url: req?.originalUrl,
    method: req?.method,
  });

  if (err instanceof AppError) {
    return sendError(res, err, err.statusCode, requestId, err.details);
  }

  // Handle express-validator, JWT, and Mongoose known errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, { code: 'UNAUTHORIZED', message: 'Invalid or expired token' }, 401, requestId);
  }

  if (err.name === 'CastError') {
    return sendError(res, { code: 'INVALID_ID', message: 'Invalid resource identifier' }, 400, requestId);
  }

  // Generic 500 error — do not expose stack trace or internal messages to client
  const fallbackError = {
    code: 'INTERNAL_SERVER_ERROR',
    message: ENV.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  };

  return sendError(res, fallbackError, 500, requestId);
}
