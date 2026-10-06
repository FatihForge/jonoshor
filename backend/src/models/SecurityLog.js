import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    ip: {
      type: String,
      index: true,
    },
    userAgent: {
      type: String,
    },
    deviceInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    riskSignal: {
      type: String,
    },
    actionTaken: {
      type: String,
    },
    requestId: {
      type: String,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: false,
    collection: 'securityLogs',
  }
);

securityLogSchema.index({ timestamp: -1 });

export const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);
