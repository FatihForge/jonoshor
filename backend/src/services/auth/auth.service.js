import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { userRepository } from '../../repositories/user.repository.js';
import { reporterRepository } from '../../repositories/reporter.repository.js';
import { sessionRepository } from '../../repositories/session.repository.js';
import { refreshTokenRepository } from '../../repositories/refreshToken.repository.js';
import { superAdminRepository } from '../../repositories/superAdmin.repository.js';
import { adminRepository } from '../../repositories/admin.repository.js';
import { privilegedAuthService } from './privilegedAuth.service.js';
import { authConfig } from '../../config/auth.js';
import {
  hashPassword,
  verifyPassword,
  generateRandomToken,
  hashToken,
} from '../../utils/crypto.js';
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
  EmailNotVerifiedError,
} from '../../utils/errors.js';
import { ACCOUNT_TYPES } from '../../constants/roles.js';
import { emailService } from '../notification/email.service.js';
import { ENV } from '../../config/env.js';

export const authService = {
  /**
   * Register a new User
   */
  async register({ fullName, email, password, mobile = null, languagePreference = 'bn' }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(password);

    // Generate secure 6-digit verification code & 24h expiration
    const verificationCode = crypto.randomInt(100000, 1000000).toString();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await userRepository.create({
      fullName,
      email,
      passwordHash,
      mobile,
      languagePreference,
      emailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires,
    });

    // Check if an existing non-user reporter exists with this email or mobile
    // If so, link it to this new account without creating a new reporter record!
    const existingReporter = await reporterRepository.findByEmailOrMobile(email, mobile);
    if (existingReporter && !existingReporter.accountId) {
      await reporterRepository.linkAccount(existingReporter._id, user._id);
    }

    // Generate email verification token (valid for 24 hours)
    const verificationToken = jwt.sign(
      { userId: user._id, type: 'email_verification' },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '24h' }
    );

    // Send verification email asynchronously with both 6-digit code and token
    await emailService.sendVerificationEmail({
      email: user.email,
      fullName: user.fullName,
      token: verificationToken,
      code: verificationCode,
    });

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        emailVerified: user.emailVerified,
        languagePreference: user.languagePreference,
      },
      ...((ENV.NODE_ENV === 'development' || ENV.NODE_ENV === 'test') ? { verificationToken, verificationCode } : {}),
    };
  },

  /**
   * Resend email verification token
   */
  async resendVerification(email) {
    const user = await userRepository.findByEmail(email);
    // Anti-enumeration: Return generic success if user not found or already verified
    if (!user || user.emailVerified) {
      return {
        success: true,
        message: 'যদি এই ইমেইলে কোনো অযাচাইকৃত অ্যাকাউন্ট থাকে, তবে ভেরিফিকেশন কোড পাঠানো হয়েছে।',
      };
    }

    // Generate new 6-digit code
    const verificationCode = crypto.randomInt(100000, 1000000).toString();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await userRepository.updateById(user._id, {
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires,
    });

    const verificationToken = jwt.sign(
      { userId: user._id, type: 'email_verification' },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '24h' }
    );

    await emailService.sendVerificationEmail({
      email: user.email,
      fullName: user.fullName,
      token: verificationToken,
      code: verificationCode,
    });

    return {
      success: true,
      message: 'নতুন ৬-সংখ্যার যাচাইকরণ কোড পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স চেক করুন।',
      ...((ENV.NODE_ENV === 'development' || ENV.NODE_ENV === 'test') ? { verificationToken, verificationCode } : {}),
    };
  },

  /**
   * Verify email via 6-digit code OR token
   */
  async verifyEmail({ token, email, code } = {}) {
    // Mode 1: 6-digit OTP code verification
    if (email && code) {
      const cleanEmail = String(email).trim().toLowerCase();
      const cleanCode = String(code).trim();
      const user = await userRepository.findByEmailWithVerification(cleanEmail);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.emailVerified) {
        return { message: 'Email already verified', alreadyVerified: true };
      }

      if (!user.emailVerificationCode || user.emailVerificationCode !== cleanCode) {
        throw new ValidationError('ভেরিফিকেশন কোডটি সঠিক নয়। (Invalid verification code)');
      }

      if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
        throw new ValidationError('ভেরিফিকেশন কোডের মেয়াদ শেষ হয়ে গেছে। দয়া করে নতুন কোড নিন। (Verification code has expired)');
      }

      await userRepository.updateById(user._id, {
        emailVerified: true,
        $unset: { emailVerificationCode: 1, emailVerificationExpires: 1 },
      });

      return { message: 'Email successfully verified', alreadyVerified: false };
    }

    // Mode 2: JWT token verification (direct link fallback)
    if (token) {
      try {
        const decoded = jwt.verify(token, authConfig.jwt.accessTokenSecret);
        if (decoded.type !== 'email_verification') {
          throw new ValidationError('Invalid verification token');
        }

        const user = await userRepository.findById(decoded.userId);
        if (!user) {
          throw new NotFoundError('User not found');
        }

        if (user.emailVerified) {
          return { message: 'Email already verified', alreadyVerified: true };
        }

        await userRepository.updateById(user._id, {
          emailVerified: true,
          $unset: { emailVerificationCode: 1, emailVerificationExpires: 1 },
        });

        return { message: 'Email successfully verified', alreadyVerified: false };
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          throw new ValidationError('Email verification token has expired. Please request a new one.');
        }
        throw err;
      }
    }

    throw new ValidationError('Either email and 6-digit code or verification token is required');
  },

  /**
   * Login user
   */
  async login({ email, password, ip = null, userAgent = null }) {
    const user = await userRepository.findByEmail(email, true);
    if (user) {
      if (user.accountStatus !== 'active') {
        throw new ForbiddenError(`Account is ${user.accountStatus}. Please contact support.`);
      }

      const isValid = await verifyPassword(user.passwordHash, password);
      if (!isValid) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Enforce email verification (403 Forbidden with EMAIL_NOT_VERIFIED code)
      if (!user.emailVerified) {
        throw new EmailNotVerifiedError(
          'আপনার ইমেইল ঠিকানাটি এখনও যাচাই করা হয়নি। অনুগ্রহ করে আপনার ইনবক্স চেক করে ইমেইল যাচাই সম্পন্ন করুন।'
        );
      }

      // Generate tokens
      const { accessToken, refreshToken } = await this.createTokensAndSession({
        account: user,
        accountType: ACCOUNT_TYPES.USER,
        ip,
        userAgent,
      });

      return {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          emailVerified: user.emailVerified,
          languagePreference: user.languagePreference,
          accountType: ACCOUNT_TYPES.USER,
        },
        accessToken,
        refreshToken,
      };
    }

    // Check if account is Super Admin (delegates to privileged auth with mandatory 2FA)
    const superAdmin = await superAdminRepository.findByEmail(email, true);
    if (superAdmin) {
      return await privilegedAuthService.superAdminLogin({ email, password });
    }

    // Check if account is Admin (delegates to privileged auth with mandatory 2FA)
    const admin = await adminRepository.findByEmail(email, true);
    if (admin) {
      return await privilegedAuthService.adminLogin({ email, password });
    }

    throw new UnauthorizedError('Invalid email or password');
  },

  /**
   * Helper to create access token, refresh token, session, and refresh token records
   */
  async createTokensAndSession({ account, accountType, permissions = [], ip = null, userAgent = null }) {
    // 1. Generate JWT Access Token
    const accessToken = jwt.sign(
      {
        id: account._id,
        email: account.email,
        accountType,
        permissions,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: authConfig.jwt.accessTokenExpiry }
    );

    // 2. Generate Refresh Token
    const rawRefreshToken = generateRandomToken(40);
    const refreshTokenHash = hashToken(rawRefreshToken);

    // 3. Create Session Record
    const rawSessionToken = generateRandomToken(32);
    const sessionTokenHash = hashToken(rawSessionToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = await sessionRepository.create({
      accountId: account._id,
      accountType,
      sessionTokenHash,
      ip,
      userAgent,
      expiresAt,
    });

    // 4. Create Refresh Token Record
    await refreshTokenRepository.create({
      tokenHash: refreshTokenHash,
      accountId: account._id,
      accountType,
      sessionId: session._id,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  },

  /**
   * Rotate Refresh Token
   */
  async refreshAccessToken({ rawRefreshToken, _ip = null, _userAgent = null }) {
    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    const oldTokenHash = hashToken(rawRefreshToken);
    const storedToken = await refreshTokenRepository.findByTokenHash(oldTokenHash);

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Token reuse detection! If token is already revoked, an attacker may have stolen it
    if (storedToken.revokedAt) {
      // Revoke all tokens for this account immediately to protect the user
      await refreshTokenRepository.revokeAllForAccount(storedToken.accountId);
      await sessionRepository.revokeAllForAccount(storedToken.accountId);
      throw new UnauthorizedError('Reused or revoked refresh token detected. Security lockout initiated.');
    }

    // Check expiration
    if (new Date(storedToken.expiresAt).getTime() < Date.now()) {
      throw new UnauthorizedError('Refresh token expired. Please login again.');
    }

    // Fetch account
    let account = null;
    let permissions = [];
    if (storedToken.accountType === ACCOUNT_TYPES.USER) {
      account = await userRepository.findById(storedToken.accountId);
    } else if (storedToken.accountType === ACCOUNT_TYPES.ADMIN) {
      account = await adminRepository.findById(storedToken.accountId);
      permissions = account?.permissions || [];
    } else if (storedToken.accountType === ACCOUNT_TYPES.SUPER_ADMIN) {
      account = await superAdminRepository.findById(storedToken.accountId);
      permissions = account?.permissions || [];
    }

    if (!account || account.accountStatus !== 'active') {
      throw new UnauthorizedError('Account inactive or not found');
    }

    // Generate new refresh token
    const newRawRefreshToken = generateRandomToken(40);
    const newTokenHash = hashToken(newRawRefreshToken);

    // Revoke old token and mark replacedBy
    await refreshTokenRepository.revoke(storedToken._id, newTokenHash);

    // Create new refresh token record attached to same session
    await refreshTokenRepository.create({
      tokenHash: newTokenHash,
      accountId: storedToken.accountId,
      accountType: storedToken.accountType,
      sessionId: storedToken.sessionId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Touch session
    await sessionRepository.touch(storedToken.sessionId);

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        id: account._id,
        email: account.email,
        accountType: storedToken.accountType,
        permissions,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: authConfig.jwt.accessTokenExpiry }
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  },

  /**
   * Logout user by revoking refresh token and associated session
   */
  async logout(rawRefreshToken) {
    if (!rawRefreshToken) return;
    const tokenHash = hashToken(rawRefreshToken);
    const tokenRecord = await refreshTokenRepository.findByTokenHash(tokenHash);
    if (tokenRecord) {
      await refreshTokenRepository.revoke(tokenRecord._id);
      if (tokenRecord.sessionId) {
        await sessionRepository.revoke(tokenRecord.sessionId);
      }
    }
  },

  /**
   * Forgot Password — generates reset token & sends email
   */
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Anti-enumeration: Return generic success without revealing whether email exists
      return {
        success: true,
        message: 'যদি এই ইমেইল ঠিকানাটি নিবন্ধিত থাকে, তবে পাসওয়ার্ড রিসেটের নির্দেশাবলী পাঠানো হয়েছে।',
      };
    }

    const resetToken = jwt.sign(
      { userId: user._id, type: 'password_reset' },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // Send reset instructions to user's registered email
    await emailService.sendPasswordResetEmail({
      email: user.email,
      fullName: user.fullName,
      token: resetToken,
    });

    return {
      success: true,
      message: 'যদি এই ইমেইল ঠিকানাটি নিবন্ধিত থাকে, তবে পাসওয়ার্ড রিসেটের নির্দেশাবলী পাঠানো হয়েছে।',
      ...(ENV.NODE_ENV === 'test' ? { resetToken } : {}),
    };
  },

  /**
   * Reset Password
   */
  async resetPassword({ token, newPassword }) {
    try {
      const decoded = jwt.verify(token, authConfig.jwt.accessTokenSecret);
      if (decoded.type !== 'password_reset') {
        throw new ValidationError('Invalid password reset token');
      }

      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const newPasswordHash = await hashPassword(newPassword);
      await userRepository.updateById(user._id, { passwordHash: newPasswordHash });

      // Revoke all existing sessions and refresh tokens on password change
      await refreshTokenRepository.revokeAllForAccount(user._id);
      await sessionRepository.revokeAllForAccount(user._id);

      return { success: true, message: 'Password has been reset successfully' };
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ValidationError('Password reset token has expired. Please request a new one.');
      }
      throw err;
    }
  },
};
