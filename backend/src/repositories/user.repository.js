import { User } from '../models/User.js';

export const userRepository = {
  async create(userData) {
    return await User.create(userData);
  },

  async findById(id, includePassword = false) {
    const query = User.findById(id);
    if (includePassword) {
      query.select('+passwordHash');
    }
    return await query.exec();
  },

  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+passwordHash');
    }
    return await query.exec();
  },

  async findByEmailWithVerification(email) {
    return await User.findOne({ email: email.toLowerCase() })
      .select('+emailVerificationCode +emailVerificationExpires')
      .exec();
  },

  async findByAuthProviderId(provider, providerId) {
    return await User.findOne({ authProvider: provider, authProviderId: providerId }).exec();
  },

  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  },

  async find(filter = {}, { skip = 0, limit = 20, sort = { createdAt: -1 } } = {}) {
    return await User.find(filter).sort(sort).skip(skip).limit(limit).exec();
  },

  async count(filter = {}) {
    return await User.countDocuments(filter).exec();
  },

  async findAdminSafe(filter = {}, { skip = 0, limit = 20, sort = { createdAt: -1 } } = {}) {
    return await User.find(filter)
      .select('-passwordHash -authProviderId -twoFactorSecret -twoFactorRecoveryCodes -refreshTokenHash -security -__v')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  },

  async findByIdAdminSafe(id) {
    return await User.findById(id)
      .select('-passwordHash -authProviderId -twoFactorSecret -twoFactorRecoveryCodes -refreshTokenHash -security -__v')
      .lean();
  },
};
