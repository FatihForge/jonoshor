import { ForbiddenError, NotFoundError } from '../utils/errors.js';

/**
 * Creates an ownership verification middleware using a repository lookup
 */
export function requireOwnership({ getResourceById, getOwnerId, paramName = 'id' }) {
  return async (req, _res, next) => {
    try {
      const resourceId = req.params[paramName];
      const resource = await getResourceById(resourceId);

      if (!resource) {
        return next(new NotFoundError('Requested resource not found'));
      }

      const ownerId = getOwnerId(resource);
      const currentUserId = req.auth?.id;

      if (!ownerId || ownerId.toString() !== currentUserId?.toString()) {
        return next(new ForbiddenError('You do not have permission to access or modify this resource'));
      }

      req.resource = resource;
      next();
    } catch (err) {
      next(err);
    }
  };
}
