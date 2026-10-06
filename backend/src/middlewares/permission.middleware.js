import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import { ACCOUNT_TYPES } from '../constants/roles.js';

export function requirePermission(permission) {
  return (req, _res, next) => {
    if (!req.auth) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // SuperAdmin has full administrative authority by default unless explicitly restricted
    if (req.auth.accountType === ACCOUNT_TYPES.SUPER_ADMIN) {
      return next();
    }

    const permissions = req.auth.permissions || [];
    if (!permissions.includes(permission)) {
      return next(new ForbiddenError(`Missing required permission: ${permission}`));
    }

    next();
  };
}
