import mongoose from 'mongoose';

const correctionRequestSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: [true, 'Complaint reference is required'],
      index: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Requester ID is required'],
      index: true,
    },
    requestedChanges: {
      type: String,
      required: [true, 'Requested changes description is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for correction is required'],
    },
    supportingEvidence: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected'],
      default: 'submitted',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    reviewedAt: {
      type: Date,
    },
    decisionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'correctionRequests',
  }
);

export const CorrectionRequest = mongoose.model('CorrectionRequest', correctionRequestSchema);
