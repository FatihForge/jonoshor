import { sendError } from '../utils/response.js';

export function notFoundMiddleware(req, res) {
  return sendError(
    res,
    { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` },
    404,
    req.id
  );
}
