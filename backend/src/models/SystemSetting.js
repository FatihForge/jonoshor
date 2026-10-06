import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Setting key is required'],
      unique: true,
      trim: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'security', 'financial', 'complaint'],
      default: 'general',
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: 'systemSettings',
  }
);

export const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
