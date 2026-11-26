import { User } from '../../models/User.js';
import { sessionRepository } from '../../repositories/session.repository.js';
import { refreshTokenRepository } from '../../repositories/refreshToken.repository.js';
import { hashPassword, verifyPassword } from '../../utils/crypto.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

export const userProfileController = {
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user._id).select('-passwordHash -security').lean();
      if (!user) {
        throw new NotFoundError('User not found');
      }
      sendSuccess(res, 200, user);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { fullName, mobile, languagePreference } = req.body;
      const user = await User.findById(req.user._id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (fullName) user.fullName = fullName.trim();
      if (mobile !== undefined) user.mobile = mobile?.trim();
      if (languagePreference && ['bn', 'en', 'auto'].includes(languagePreference)) {
        user.languagePreference = languagePreference;
      }

      await user.save();
      const sanitized = user.toObject();
      delete sanitized.passwordHash;
      delete sanitized.security;

      sendSuccess(res, 200, sanitized, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async getSecurity(req, res, next) {
    try {
      const user = await User.findById(req.user._id).lean();
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Return permitted security settings without active session viewer (Section 17)
      sendSuccess(res, 200, {
        email: user.email,
        emailVerified: user.emailVerified,
        twoFactorEnabled: Boolean(user.twoFactorSecret || user.twoFactorEnabled),
        lastPasswordChange: user.security?.passwordChangedAt,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateSecurity(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id).select('+passwordHash');
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (currentPassword && newPassword) {
        const isMatch = await verifyPassword(user.passwordHash, currentPassword);
        if (!isMatch) {
          throw new ValidationError('Current password is incorrect');
        }

        if (newPassword.length < 8) {
          throw new ValidationError('New password must be at least 8 characters long');
        }

        user.passwordHash = await hashPassword(newPassword);
        if (!user.security) user.security = {};
        user.security.passwordChangedAt = new Date();

        // Revoke existing sessions and refresh tokens after password change
        await Promise.all([
          sessionRepository.revokeAllForAccount(user._id),
          refreshTokenRepository.revokeAllForAccount(user._id),
        ]);
      }

      await user.save();
      sendSuccess(res, 200, { success: true }, 'Security settings updated');
    } catch (err) {
      next(err);
    }
  },
};
