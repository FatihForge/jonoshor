import { CorrectionRequest } from '../../models/CorrectionRequest.js';
import { Complaint } from '../../models/Complaint.js';
import { COMPLAINT_STATUS } from '../../constants/complaintStatus.js';
import { auditService } from '../audit/audit.service.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

export class CorrectionsWithdrawalsService {
  /**
   * List correction requests for admin review
   */
  async listCorrections({ status = null, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      CorrectionRequest.find(filter)
        .populate('complaintId', 'trackingNumber category status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CorrectionRequest.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Get single correction request
   */
  async getCorrectionById(id) {
    const item = await CorrectionRequest.findById(id)
      .populate('complaintId')
      .lean();
    if (!item) {
      throw new NotFoundError('Correction request not found');
    }
    return item;
  }

  /**
   * Review correction request (approve or reject)
   */
  async reviewCorrection({ id, adminId, status, decisionReason }) {
    const request = await CorrectionRequest.findById(id);
    if (!request) {
      throw new NotFoundError('Correction request not found');
    }

    if (!['approved', 'rejected'].includes(status)) {
      throw new ValidationError("Status must be 'approved' or 'rejected'");
    }

    request.status = status;
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    request.decisionReason = decisionReason;
    await request.save();

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'CORRECTION_REVIEWED',
      entity: 'CorrectionRequest',
      entityId: request._id,
      metadata: { status, decisionReason, complaintId: request.complaintId },
    });

    return request;
  }

  /**
   * List complaints with requested withdrawal
   */
  async listWithdrawals({ page = 1, limit = 20 } = {}) {
    const filter = {
      'withdrawal.requested': true,
      status: { $ne: COMPLAINT_STATUS.WITHDRAWN },
    };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Complaint.find(filter)
        .select('trackingNumber category location incident status withdrawal createdAt')
        .sort({ 'withdrawal.requestedAt': -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Review withdrawal request (transition to Withdrawn or restore)
   */
  async reviewWithdrawal({ complaintId, adminId, approved, decisionReason }) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    if (!complaint.withdrawal?.requested) {
      throw new ValidationError('No active withdrawal request on this complaint');
    }

    if (approved) {
      complaint.status = COMPLAINT_STATUS.WITHDRAWN;
      complaint.withdrawal.decision = 'approved';
      complaint.withdrawal.reviewedBy = adminId;
      complaint.withdrawal.reviewedAt = new Date();
      complaint.withdrawal.reason = decisionReason || complaint.withdrawal.reason;
    } else {
      complaint.withdrawal.requested = false;
      complaint.withdrawal.decision = 'rejected';
      complaint.withdrawal.reviewedBy = adminId;
      complaint.withdrawal.reviewedAt = new Date();
      if (decisionReason) {
        complaint.withdrawal.reason = decisionReason;
      }
    }

    await complaint.save();

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: approved ? 'WITHDRAWAL_APPROVED' : 'WITHDRAWAL_REJECTED',
      entity: 'Complaint',
      entityId: complaint._id,
      metadata: { approved, decisionReason },
    });

    return complaint;
  }
}

export const correctionsWithdrawalsService = new CorrectionsWithdrawalsService();
