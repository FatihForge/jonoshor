import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Account ID is required'],
      index: true,
    },
    accountType: {
      type: String,
      enum: ['user', 'admin', 'superAdmin'],
      required: true,
      index: true,
    },
    sessionTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    refreshTokenReference: {
      type: String,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    deviceInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'sessions',
  }
);

export const Session = mongoose.model('Session', sessionSchema);
