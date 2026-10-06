import mongoose from 'mongoose';
import { LEGAL_STATUS } from '../constants/legalStatus.js';

const legalCaseSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: [true, 'Complaint reference is required'],
      index: true,
    },
    caseNumber: {
      type: String,
      trim: true,
    },
    caseType: {
      type: String,
      trim: true,
    },
    authorities: [
      {
        type: { type: String, trim: true },
        name: { type: String, trim: true },
        reference: { type: String, trim: true },
      },
    ],
    courts: [
      {
        name: { type: String, trim: true },
        location: { type: String, trim: true },
        reference: { type: String, trim: true },
      },
    ],
    arrestStatus: { type: String, trim: true },
    bailStatus: { type: String, trim: true },
    investigationStatus: { type: String, trim: true },
    currentLegalStatus: {
      type: String,
      enum: Object.values(LEGAL_STATUS),
      default: LEGAL_STATUS.NO_LEGAL_CASE,
      index: true,
    },
    outcomes: [
      {
        type: { type: String, trim: true },
        date: { type: Date },
        description: { type: String },
        source: { type: String, trim: true },
        reference: { type: String, trim: true },
        verified: { type: Boolean, default: false },
      },
    ],
    officialReferences: {
      type: [String],
      default: [],
    },
    timeline: [
      {
        date: { type: Date },
        eventType: { type: String, trim: true },
        description: { type: String },
        source: { type: String, trim: true },
        reference: { type: String, trim: true },
        verified: { type: Boolean, default: false },
        publicSummary: { type: String },
      },
    ],
    publicDisclosure: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      approvedAt: { type: Date },
      redactions: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
    collection: 'legalCases',
  }
);

export const LegalCase = mongoose.model('LegalCase', legalCaseSchema);
