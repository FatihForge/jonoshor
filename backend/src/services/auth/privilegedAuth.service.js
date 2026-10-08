import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { adminRepository } from '../../repositories/admin.repository.js';
import { superAdminRepository } from '../../repositories/superAdmin.repository.js';
import { authService } from './auth.service.js';
import { authConfig } from '../../config/auth.js';
import { verifyPassword } from '../../utils/crypto.js';
import {
  UnauthorizedError,
  ValidationError,
  ForbiddenError,
  NotFoundError,
} from '../../utils/errors.js';
import { ACCOUNT_TYPES } from '../../constants/roles.js';

// Configure TOTP window: 1 (allows +/- 1 time step / 30 seconds for clock skew tolerance)
authenticator.options = { window: 1 };

export const privilegedAuthService = {
  /**
   * Admin initial login step (returns temp 2FA token)
   */
  async adminLogin({ email, password }) {
    const admin = await adminRepository.findByEmail(email, true);
    if (!admin) {
      throw new UnauthorizedError('Invalid admin credentials');
    }

    if (admin.accountStatus !== 'active') {
      throw new ForbiddenError(`Admin account is ${admin.accountStatus}`);
    }

    const isValid = await verifyPassword(admin.passwordHash, password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid admin credentials');
    }

    // Generate temporary 2FA token (valid for 5 minutes)
    const temp2FAToken = jwt.sign(
      {
        id: admin._id,
        accountType: ACCOUNT_TYPES.ADMIN,
        twoFactorEnabled: admin.twoFactorEnabled,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '5m' }
    );

    return {
      temp2FAToken,
      requires2FA: true,
      twoFactorEnabled: admin.twoFactorEnabled,
      accountType: ACCOUNT_TYPES.ADMIN,
    };
  },

  /**
   * Super Admin initial login step (returns temp 2FA token)
   */
  async superAdminLogin({ email, password }) {
    const superAdmin = await superAdminRepository.findByEmail(email, true);
    if (!superAdmin) {
      throw new UnauthorizedError('Invalid super admin credentials');
    }

    if (superAdmin.accountStatus !== 'active') {
      throw new ForbiddenError(`Super Admin account is ${superAdmin.accountStatus}`);
    }

    const isValid = await verifyPassword(superAdmin.passwordHash, password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid super admin credentials');
    }

    const temp2FAToken = jwt.sign(
      {
        id: superAdmin._id,
        accountType: ACCOUNT_TYPES.SUPER_ADMIN,
        twoFactorEnabled: superAdmin.twoFactorEnabled,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '5m' }
    );

    return {
      temp2FAToken,
      requires2FA: true,
      twoFactorEnabled: superAdmin.twoFactorEnabled,
      accountType: ACCOUNT_TYPES.SUPER_ADMIN,
    };
  },

  /**
   * Setup 2FA secret for an Admin or SuperAdmin
   */
  async setup2FA(temp2FAToken) {
    const decoded = jwt.verify(temp2FAToken, authConfig.jwt.accessTokenSecret);
    const secret = authenticator.generateSecret();
    const serviceName = 'JonoShor';

    if (decoded.accountType === ACCOUNT_TYPES.ADMIN) {
      const admin = await adminRepository.findById(decoded.id);
      if (!admin) throw new NotFoundError('Admin not found');
      await adminRepository.updateById(admin._id, { twoFactorSecret: secret });
      const otpauth = authenticator.keyuri(admin.email, serviceName, secret);
      return { secret, otpauth };
    } else if (decoded.accountType === ACCOUNT_TYPES.SUPER_ADMIN) {
      const superAdmin = await superAdminRepository.findById(decoded.id);
      if (!superAdmin) throw new NotFoundError('Super Admin not found');
      await superAdminRepository.updateById(superAdmin._id, { twoFactorSecret: secret });
      const otpauth = authenticator.keyuri(superAdmin.email, serviceName, secret);
      return { secret, otpauth };
    }

    throw new ForbiddenError('Invalid account type for 2FA setup');
  },

  /**
   * Complete 2FA verification and establish session
   */
  async verify2FA({ temp2FAToken, totpCode, ip = null, userAgent = null }) {
    let decoded;
    try {
      decoded = jwt.verify(temp2FAToken, authConfig.jwt.accessTokenSecret);
    } catch {
      throw new UnauthorizedError('2FA session expired. Please login again.');
    }

    let account;
    let repository;

    if (decoded.accountType === ACCOUNT_TYPES.ADMIN) {
      repository = adminRepository;
    } else if (decoded.accountType === ACCOUNT_TYPES.SUPER_ADMIN) {
      repository = superAdminRepository;
    } else {
      throw new ForbiddenError('Invalid account type');
    }

    account = await repository.findById(decoded.id, true);
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    if (!account.twoFactorSecret) {
      throw new ValidationError('2FA has not been setup for this account. Please complete setup first.');
    }

    // Verify TOTP code
    const isTotpValid = authenticator.check(totpCode, account.twoFactorSecret);
    if (!isTotpValid) {
      throw new UnauthorizedError('Invalid 2FA code');
    }

    // Mark 2FA as enabled in account if not already
    if (!account.twoFactorEnabled) {
      await repository.updateById(account._id, { twoFactorEnabled: true });
    }

    // Update lastLoginAt
    await repository.updateById(account._id, { lastLoginAt: new Date() });

    // Establish session & tokens
    const { accessToken, refreshToken } = await authService.createTokensAndSession({
      account,
      accountType: decoded.accountType,
      permissions: account.permissions || [],
      ip,
      userAgent,
    });

    return {
      account: {
        id: account._id,
        fullName: account.fullName,
        email: account.email,
        accountType: decoded.accountType,
        permissions: account.permissions || [],
      },
      accessToken,
      refreshToken,
    };
  },

  /**
   * Re-authentication for critical actions
   */
  async reAuthenticate({ accountId, accountType, password, totpCode }) {
    let repository;
    if (accountType === ACCOUNT_TYPES.ADMIN) repository = adminRepository;
    else if (accountType === ACCOUNT_TYPES.SUPER_ADMIN) repository = superAdminRepository;
    else throw new ForbiddenError('Only privileged accounts require critical re-authentication');

    const account = await repository.findById(accountId, true);
    if (!account) throw new NotFoundError('Account not found');

    const isPasswordValid = await verifyPassword(account.passwordHash, password);
    if (!isPasswordValid) throw new UnauthorizedError('Invalid password for re-authentication');

    const isTotpValid = authenticator.check(totpCode, account.twoFactorSecret);
    if (!isTotpValid) throw new UnauthorizedError('Invalid 2FA code for re-authentication');

    // Issue short-lived reAuthToken (5 minutes)
    const reAuthToken = jwt.sign(
      {
        id: account._id,
        accountType,
        purpose: 'critical_reauth',
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '5m' }
    );

    return { reAuthToken };
  },
};
