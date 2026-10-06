import mongoose from 'mongoose';

const upazilaSchema = new mongoose.Schema(
  {
    districtId: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'District reference is required'],
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
    collection: 'upazilas',
  }
);

upazilaSchema.index({ districtId: 1, active: 1 });

export const Upazila = mongoose.model('Upazila', upazilaSchema);
