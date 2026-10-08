import mongoose from 'mongoose';
import { COMPLAINT_STATUS, DATE_PRECISION, SUBMISSION_TYPES } from '../constants/complaintStatus.js';
import { SENSITIVITY_LEVELS, PRIORITY_LEVELS } from '../constants/accountStatus.js';
import { AUTHORITY_TYPES } from '../constants/legalStatus.js';

const complaintSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reporter',
      required: [true, 'Reporter reference is required'],
      index: true,
    },
    submissionType: {
      type: String,
      enum: Object.values(SUBMISSION_TYPES),
      required: true,
      index: true,
    },
    category: {
      primary: {
        type: String,
        required: [function () { return this.status !== COMPLAINT_STATUS.DRAFT; }, 'Primary category is required'],
        index: true,
      },
      secondary: {
        type: [String],
        default: [],
      },
    },
    incident: {
      startDate: {
        type: Date,
        required: [function () { return this.status !== COMPLAINT_STATUS.DRAFT; }, 'Incident start date is required'],
      },
      endDate: {
        type: Date,
      },
      datePrecision: {
        type: String,
        enum: Object.values(DATE_PRECISION),
        default: DATE_PRECISION.EXACT,
      },
      ongoing: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        required: [function () { return this.status !== COMPLAINT_STATUS.DRAFT; }, 'Incident description is required'],
      },
    },
    location: {
      divisionId: {
        type: String,
        required: [function () { return this.status !== COMPLAINT_STATUS.DRAFT; }, 'Division is required'],
        index: true,
      },
      districtId: {
        type: String,
        required: [function () { return this.status !== COMPLAINT_STATUS.DRAFT; }, 'District is required'],
        index: true,
      },
      upazilaId: {
        type: String,
        index: true,
      },
      freeTextLocation: {
        type: String,
      },
    },
    accused: [
      {
        name: { type: String, trim: true },
        alias: { type: String, trim: true },
        fatherName: { type: String, trim: true },
        profession: { type: String, trim: true },
        role: { type: String, trim: true },
        organization: { type: String, trim: true },
        location: { type: String, trim: true },
        mobile: { type: String, trim: true },
        socialId: { type: String, trim: true },
        otherIdentifiers: { type: String, trim: true },
        visibility: {
          type: String,
          enum: ['private', 'public_approved', 'redacted'],
          default: 'private',
        },
      },
    ],
    victims: [
      {
        name: { type: String, trim: true },
        age: { type: Number },
        ageCategory: {
          type: String,
          enum: ['minor', 'adult', 'senior', 'unknown'],
          default: 'adult',
        },
        gender: {
          type: String,
          enum: ['male', 'female', 'other', 'prefer_not_to_say'],
        },
        relationshipToIncident: { type: String, trim: true },
        minor: { type: Boolean, default: false },
        sensitivePerson: { type: Boolean, default: false },
        identityVisibility: {
          type: String,
          enum: ['private', 'redacted', 'public_approved'],
          default: 'private',
        },
      },
    ],
    sensitivity: {
      level: {
        type: String,
        enum: Object.values(SENSITIVITY_LEVELS),
        default: SENSITIVITY_LEVELS.MEDIUM,
      },
      determinedBy: { type: String, default: 'system' },
    },
    priority: {
      level: {
        type: String,
        enum: Object.values(PRIORITY_LEVELS),
        default: PRIORITY_LEVELS.NORMAL,
      },
      determinedBy: { type: String, default: 'system' },
    },
    riskFlags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      default: COMPLAINT_STATUS.SUBMITTED,
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId },
        changedAt: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    review: {
      assignedReviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        index: true,
      },
      assignedAt: { type: Date },
      verificationStatus: { type: String },
      verificationDecision: { type: String },
      verificationReason: { type: String },
      evidenceAssessment: { type: String },
      corroborationAssessment: { type: String },
      conflictOfInterest: { type: Boolean, default: false },
      reviewerNotes: { type: String },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      verifiedAt: { type: Date },
    },
    authorityActions: [
      {
        authorityType: {
          type: String,
          enum: Object.values(AUTHORITY_TYPES),
        },
        authorityName: { type: String, trim: true },
        action: { type: String, trim: true },
        actionDate: { type: Date },
        reference: { type: String, trim: true },
        verified: { type: Boolean, default: false },
        notes: { type: String },
        publicSummary: { type: String },
      },
    ],
    publication: {
      status: {
        type: String,
        enum: ['not_reviewed', 'approved', 'withheld'],
        default: 'not_reviewed',
      },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      reviewedAt: { type: Date },
      reason: { type: String },
    },
    withdrawal: {
      requested: { type: Boolean, default: false },
      requestedAt: { type: Date },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      reviewedAt: { type: Date },
      decision: { type: String },
      reason: { type: String },
    },
    correctionCount: {
      type: Number,
      default: 0,
      max: 3,
    },
    securityIdentifiers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      select: false,
    },
  },
  {
    timestamps: true,
    collection: 'complaints',
  }
);

// Indexes for query performance
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ 'location.districtId': 1, status: 1 });
complaintSchema.index({ 'category.primary': 1, status: 1 });
complaintSchema.index({ 'securityIdentifiers.ip': 1 });
complaintSchema.index({ 'securityIdentifiers.anonymousSubmissionId': 1 });

export const Complaint = mongoose.model('Complaint', complaintSchema);
