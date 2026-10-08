import mongoose from 'mongoose';
import {
  EVIDENCE_TYPES,
  UPLOAD_STATUS,
  MALWARE_SCAN_STATUS,
  EVIDENCE_REVIEW_STATUS,
  EVIDENCE_PUBLIC_STATUS,
  REDACTION_STATUS,
  ACCESSIBILITY_STATUS,
} from '../constants/evidenceStatus.js';

const evidenceSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: [true, 'Complaint reference is required'],
      index: true,
    },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(EVIDENCE_TYPES),
      required: [true, 'Evidence type is required'],
    },
    originalFilename: {
      type: String,
      trim: true,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    size: {
      type: Number,
    },
    driveFileId: {
      type: String,
      trim: true,
      index: true,
    },
    publicDriveFileId: {
      type: String,
      trim: true,
      index: true,
    },
    safePublicNote: {
      type: String,
      trim: true,
    },
    sha256: {
      type: String,
      trim: true,
      index: true,
    },
    uploadStatus: {
      type: String,
      enum: Object.values(UPLOAD_STATUS),
      default: UPLOAD_STATUS.INITIATED,
      index: true,
    },
    malwareScanStatus: {
      type: String,
      enum: Object.values(MALWARE_SCAN_STATUS),
      default: MALWARE_SCAN_STATUS.PENDING,
      index: true,
    },
    reviewStatus: {
      type: String,
      enum: Object.values(EVIDENCE_REVIEW_STATUS),
      default: EVIDENCE_REVIEW_STATUS.PENDING,
      index: true,
    },
    publicStatus: {
      type: String,
      enum: Object.values(EVIDENCE_PUBLIC_STATUS),
      default: EVIDENCE_PUBLIC_STATUS.PRIVATE,
      index: true,
    },
    redactionStatus: {
      type: String,
      enum: Object.values(REDACTION_STATUS),
      default: REDACTION_STATUS.NONE,
    },
    deletionStatus: {
      requested: { type: Boolean, default: false },
      deleted: { type: Boolean, default: false },
      blocked_by_legal_hold: { type: Boolean, default: false },
    },
    external: {
      url: { type: String, trim: true },
      sourceType: { type: String, trim: true },
      accessibilityStatus: {
        type: String,
        enum: Object.values(ACCESSIBILITY_STATUS),
        default: ACCESSIBILITY_STATUS.SUBMITTED,
      },
      reviewStatus: { type: String, default: 'pending' },
      checkedAt: { type: Date },
      checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    },
  },
  {
    timestamps: true,
    collection: 'evidence',
  }
);

export const Evidence = mongoose.model('Evidence', evidenceSchema);
