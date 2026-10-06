import mongoose from 'mongoose';

const reporterSchema = new mongoose.Schema(
  {
    reporterType: {
      type: String,
      enum: ['user', 'non_user'],
      required: [true, 'Reporter type is required'],
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      sparse: true,
      index: true,
    },
    contact: {
      type: {
        email: {
          type: String,
          trim: true,
          lowercase: true,
        },
        mobile: {
          type: String,
          trim: true,
        },
      },
      validate: {
        validator: function (val) {
          return Boolean(val && (val.email || val.mobile));
        },
        message: 'At least one contact method (email or mobile) is required',
      },
      required: true,
    },
    identityVisibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
    },
    nonUserComplaintCount: {
      type: Number,
      default: 0,
    },
    securityIdentifiers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      select: false, // Hidden from normal responses
    },
  },
  {
    timestamps: true,
    collection: 'reporters',
  }
);

export const Reporter = mongoose.model('Reporter', reporterSchema);
