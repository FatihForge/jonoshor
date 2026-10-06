import mongoose from 'mongoose';

const localizedContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    incidentStory: { type: String, required: true },
    legalSummary: { type: String },
    authorityActionSummary: { type: String },
  },
  { _id: false }
);

const publicReportSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: [true, 'Complaint reference is required'],
      unique: true,
      index: true,
    },
    bn: {
      type: localizedContentSchema,
      required: true,
    },
    en: {
      type: localizedContentSchema,
    },
    category: {
      primary: { type: String, required: true, index: true },
      secondary: { type: [String], default: [] },
    },
    location: {
      divisionId: { type: String, required: true, index: true },
      districtId: { type: String, required: true, index: true },
      upazilaId: { type: String, index: true },
      generalLocation: { type: String },
    },
    incidentDate: {
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      precision: { type: String, default: 'exact' },
    },
    verificationStatus: {
      type: String,
      required: true,
      index: true,
    },
    evidenceStatus: {
      type: String,
    },
    publicAccused: [
      {
        name: { type: String, trim: true },
        role: { type: String, trim: true },
        organization: { type: String, trim: true },
      },
    ],
    publicVictims: [
      {
        name: { type: String, trim: true },
        category: { type: String, trim: true },
      },
    ],
    authorityActionSummary: { type: String },
    legalSummary: { type: String },
    caseStatus: { type: String },
    legalOutcome: { type: String },
    approvedEvidence: [
      {
        evidenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evidence' },
        type: { type: String },
        publicUrl: { type: String },
        title: { type: String },
      },
    ],
    publicationStatus: {
      type: String,
      enum: ['published', 'withheld', 'archived'],
      default: 'published',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'publicReports',
  }
);

// Search indexes
publicReportSchema.index({ 'location.districtId': 1, publicationStatus: 1 });
publicReportSchema.index({ 'category.primary': 1, publicationStatus: 1 });
publicReportSchema.index({ publishedAt: -1 });

export const PublicReport = mongoose.model('PublicReport', publicReportSchema);
