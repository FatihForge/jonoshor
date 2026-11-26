import mongoose from 'mongoose';
import { ACCOUNT_STATUS } from '../constants/accountStatus.js';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    mobile: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local',
    },
    authProviderId: {
      type: String,
      sparse: true,
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailVerificationCode: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    mobileVerified: {
      type: Boolean,
      default: false,
    },
    externalLinks: {
      type: [String],
      default: [],
    },
    languagePreference: {
      type: String,
      enum: ['bn', 'en', 'auto'],
      default: 'bn',
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    security: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    accountStatus: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

export const User = mongoose.model('User', userSchema);
