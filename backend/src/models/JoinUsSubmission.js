import mongoose from 'mongoose';

const joinUsDocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['cv', 'recommendation_letter', 'work_experience_document', 'other'],
      default: 'cv',
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
    },
    checksum: {
      type: String,
      trim: true,
    },
    driveFileId: {
      type: String,
      required: true,
      trim: true,
    },
    storageReference: {
      type: String,
      trim: true,
    },
    scanStatus: {
      type: String,
      enum: ['clean', 'quarantined', 'infected', 'pending'],
      default: 'clean',
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const joinUsNoteSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    adminName: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

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
    documents: [joinUsDocumentSchema],
    submissionStatus: {
      type: String,
      enum: ['submitted', 'reviewed', 'accepted', 'rejected'],
      default: 'submitted',
      index: true,
    },
    adminNotes: {
      type: String,
    },
    notes: [joinUsNoteSchema],
    isDuplicate: {
      type: Boolean,
      default: false,
      index: true,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JoinUsSubmission',
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

joinUsSubmissionSchema.index({ email: 1, submittedAt: -1 });
joinUsSubmissionSchema.index({ submissionStatus: 1, submittedAt: -1 });

export const JoinUsSubmission = mongoose.model('JoinUsSubmission', joinUsSubmissionSchema);
