import mongoose from 'mongoose';

const joinUsSubmissionSchema = new mongoose.Schema(
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
      trim: true,
      lowercase: true,
      index: true,
    },
    contactInformation: {
      mobile: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    primaryProfession: {
      type: String,
      required: [true, 'Primary profession is required'],
      trim: true,
    },
    secondaryProfessions: {
      type: [String],
      default: [],
    },
    customProfession: {
      type: String,
      trim: true,
    },
    primaryContributionRole: {
      type: String,
      required: [true, 'Primary contribution role is required'],
      trim: true,
    },
    secondaryContributionRoles: {
      type: [String],
      default: [],
    },
    contributionDetails: {
      type: String,
      required: [true, 'Contribution details are required'],
    },
    socialLinks: {
      type: [String],
      default: [],
    },
    linkedin: {
      type: String,
      trim: true,
    },
    portfolio: {
      type: String,
      trim: true,
    },
    documents: [
      {
        type: { type: String, enum: ['cv', 'recommendation_letter', 'work_experience_document', 'other'] },
        driveFileId: { type: String, trim: true },
        originalFilename: { type: String },
      },
    ],
    submissionStatus: {
      type: String,
      enum: ['submitted', 'reviewed', 'accepted', 'rejected'],
      default: 'submitted',
      index: true,
    },
    adminNotes: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'joinUsSubmissions',
  }
);

export const JoinUsSubmission = mongoose.model('JoinUsSubmission', joinUsSubmissionSchema);
