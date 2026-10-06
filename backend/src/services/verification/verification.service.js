import { complaintRepository } from '../../repositories/complaint.repository.js';
import { auditService } from '../audit/audit.service.js';
import { COMPLAINT_STATUS } from '../../constants/complaintStatus.js';
import { NotFoundError, ConflictOfInterestError } from '../../utils/errors.js';

export const verificationService = {
  /**
   * Assign a reviewer to a complaint
   */
  async assignReviewer(complaintId, reviewerAdminId, assignedByAdminId) {
    const complaint = await complaintRepository.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    const updated = await complaintRepository.updateById(complaintId, {
      'review.assignedReviewerId': reviewerAdminId,
      'review.assignedAt': new Date(),
      'review.conflictOfInterest': false,
      status: COMPLAINT_STATUS.SCREENING,
    });

    await auditService.log({
      actorId: assignedByAdminId,
      actorType: 'admin',
      action: 'REVIEWER_ASSIGNED',
      resourceType: 'complaint',
      resourceId: complaintId,
      metadata: { reviewerAdminId },
    });

    return updated;
  },

  /**
   * Declare conflict of interest by assigned reviewer
   */
  async declareConflict(complaintId, reviewerAdminId, reason = '') {
    const complaint = await complaintRepository.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    const updated = await complaintRepository.updateById(complaintId, {
      'review.conflictOfInterest': true,
      'review.reviewerNotes': `Conflict declared: ${reason}`,
      'review.assignedReviewerId': null, // unassign reviewer
      status: COMPLAINT_STATUS.SUBMITTED, // return to queue for reassignment
    });

    await auditService.log({
      actorId: reviewerAdminId,
      actorType: 'admin',
      action: 'CONFLICT_OF_INTEREST_DECLARED',
      resourceType: 'complaint',
      resourceId: complaintId,
      metadata: { reason },
    });

    return updated;
  },

  /**
   * Transition verification decision
   */
  async recordDecision(complaintId, adminId, { decision, status, reason, notes, assessment }) {
    const complaint = await complaintRepository.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    // A conflicted reviewer cannot verify or decide
    if (complaint.review?.conflictOfInterest && complaint.review.assignedReviewerId?.toString() === adminId.toString()) {
      throw new ConflictOfInterestError('Cannot decide on a complaint with declared conflict of interest');
    }

    const updateData = {
      status,
      'review.verificationDecision': decision,
      'review.verificationStatus': status,
      'review.verificationReason': reason,
      'review.reviewerNotes': notes,
      'review.evidenceAssessment': assessment,
      'review.verifiedBy': adminId,
      'review.verifiedAt': new Date(),
    };

    const updated = await complaintRepository.updateById(complaintId, updateData);
    await complaintRepository.updateStatus(complaintId, status, adminId, reason || decision);

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'VERIFICATION_DECISION_RECORDED',
      resourceType: 'complaint',
      resourceId: complaintId,
      metadata: { decision, status },
    });

    return updated;
  },
};
