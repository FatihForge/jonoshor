import mongoose from 'mongoose';
import { User } from '../../models/User.js';
import { Admin } from '../../models/Admin.js';
import { SuperAdmin } from '../../models/SuperAdmin.js';
import { userRepository } from '../../repositories/user.repository.js';
import { auditService } from '../audit/audit.service.js';
import { ACCOUNT_STATUS } from '../../constants/accountStatus.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../utils/errors.js';

/**
 * Strips all sensitive authentication, credentials, and internal security fields
 * before returning user data to an admin caller.
 */
export function sanitizeUserForAdmin(userDoc) {
  if (!userDoc) return null;
  const user = typeof userDoc.toObject === 'function' ? userDoc.toObject() : { ...userDoc };

  delete user.passwordHash;
  delete user.authProviderId;
  delete user.twoFactorSecret;
  delete user.twoFactorRecoveryCodes;
  delete user.refreshTokenHash;
  delete user.security;
  delete user.__v;

  return user;
}

export const userAdminService = {
  /**
   * List users with pagination and optional status filter
   */
  async listUsers({ page = 1, limit = 20, status = null } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status) {
      if (!Object.values(ACCOUNT_STATUS).includes(status)) {
        throw new ValidationError(`Invalid status filter. Allowed: ${Object.values(ACCOUNT_STATUS).join(', ')}`);
      }
      filter.accountStatus = status;
    }

    const [items, total] = await Promise.all([
      userRepository.findAdminSafe(filter, { skip, limit: limitNum, sort: { createdAt: -1 } }),
      userRepository.count(filter),
    ]);

    return {
      items: items.map(sanitizeUserForAdmin),
      page: pageNum,
      limit: limitNum,
      total,
    };
  },

  /**
   * Get single user by ID with admin-safe representation
   */
  async getUserById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError('User not found');
    }

    const user = await userRepository.findByIdAdminSafe(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return sanitizeUserForAdmin(user);
  },

  /**
   * Update user status (active, suspended, blocked) with audit logging and boundary protections
   */
  async updateUserStatus({ targetUserId, status, reason, actor, ip, userAgent, requestId }) {
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      throw new NotFoundError('User not found');
    }

    if (!status || !Object.values(ACCOUNT_STATUS).includes(status)) {
      throw new ValidationError(`Status must be one of: ${Object.values(ACCOUNT_STATUS).join(', ')}`);
    }

    const actorId = actor?._id || actor?.id;

    // Self-modification prevention: Admin cannot modify their own account status here
    if (actorId && actorId.toString() === targetUserId.toString()) {
      throw new ForbiddenError('Admins cannot modify their own account status through this endpoint');
    }

    // Role boundary protection: Verify target user is not Admin or SuperAdmin
    const [isAdmin, isSuperAdmin] = await Promise.all([
      Admin.exists({ _id: targetUserId }),
      SuperAdmin.exists({ _id: targetUserId }),
    ]);

    if (isAdmin || isSuperAdmin) {
      throw new ForbiddenError('Admin or Super Admin accounts cannot be managed through User Management API');
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const previousStatus = user.accountStatus;
    user.accountStatus = status;
    await user.save();

    await auditService.log({
      actorId,
      actorType: actor?.accountType || 'admin',
      action: 'USER_STATUS_UPDATED',
      resourceType: 'user',
      resourceId: user._id,
      previousValue: { accountStatus: previousStatus },
      newValue: { accountStatus: status },
      ip,
      userAgent,
      requestId,
      metadata: {
        targetUserId: user._id,
        targetEmail: user.email,
        previousStatus,
        newStatus: status,
        reason: reason ? String(reason).trim() : undefined,
      },
    });

    return sanitizeUserForAdmin(user);
  },
};
