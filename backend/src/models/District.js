import mongoose from 'mongoose';

const districtSchema = new mongoose.Schema(
  {
    divisionId: {
      type: String,
      required: [true, 'Division ID is required'],
      index: true,
    },
    nameBn: {
      type: String,
      required: [true, 'Bangla name is required'],
      trim: true,
    },
    nameEn: {
      type: String,
      required: [true, 'English name is required'],
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: false,
    collection: 'districts',
  }
);

districtSchema.index({ divisionId: 1, active: 1 });

export const District = mongoose.model('District', districtSchema);
