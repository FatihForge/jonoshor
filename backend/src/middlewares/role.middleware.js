import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import { ACCOUNT_TYPES } from '../constants/roles.js';

export function requireAccountType(...allowedTypes) {
  return (req, _res, next) => {
    if (!req.auth) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedTypes.includes(req.auth.accountType)) {
      return next(new ForbiddenError(`Access forbidden for account type '${req.auth.accountType}'`));
    }

    next();
  };
}

export const requireUser = requireAccountType(ACCOUNT_TYPES.USER);
export const requireAdmin = requireAccountType(ACCOUNT_TYPES.ADMIN);
export const requireSuperAdmin = requireAccountType(ACCOUNT_TYPES.SUPER_ADMIN);
export const requireAdminOrSuperAdmin = requireAccountType(ACCOUNT_TYPES.ADMIN, ACCOUNT_TYPES.SUPER_ADMIN);
