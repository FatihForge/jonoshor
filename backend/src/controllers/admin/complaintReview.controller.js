import { complaintRepository } from '../../repositories/complaint.repository.js';
import { evidenceRepository } from '../../repositories/evidence.repository.js';
import { publicReportRepository } from '../../repositories/publicReport.repository.js';
import { verificationService } from '../../services/verification/verification.service.js';
import { publicationService } from '../../services/publication/publication.service.js';
import { notificationService } from '../../services/notification/notification.service.js';
import { AuditLog } from '../../models/AuditLog.js';
import { COMPLAINT_STATUS } from '../../constants/complaintStatus.js';
import { NOTIFICATION_TYPES } from '../../constants/notificationTypes.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError, ValidationError, ConflictOfInterestError } from '../../utils/errors.js';

export const adminComplaintReviewController = {
  async listComplaints(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const { status, category, districtId, priority } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (category) filter['category.primary'] = category;
      if (districtId) filter['location.districtId'] = districtId;
      if (priority) filter.priority = priority;

      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        complaintRepository.find(filter, { skip, limit }),
        complaintRepository.count(filter),
      ]);

      sendSuccess(res, 200, items, 'Complaints retrieved', { page, limit, total });
    } catch (err) {
      next(err);
    }
  },

  async getComplaintById(req, res, next) {
    try {
      const { id } = req.params;
      const complaint = await complaintRepository.findById(id);
      if (!complaint) {
        throw new NotFoundError('Complaint not found');
      }
      const data = complaint.toObject ? complaint.toObject() : { ...complaint };
      const evidence = await evidenceRepository.findByComplaintId(id);
      data.evidence = evidence || [];

      // Attach public report if already generated/published
      const publicReport = await publicReportRepository.findByComplaintId(id);
      if (publicReport) {
        data.publicReport = publicReport;
        data.publicReportId = publicReport._id;
      }

      sendSuccess(res, 200, data);
    } catch (err) {
      next(err);
    }
  },

  async assignReviewer(req, res, next) {
    try {
      const { id } = req.params;
      const { reviewerId } = req.body;
      const updated = await verificationService.assignReviewer(id, reviewerId, req.user._id);
      sendSuccess(res, 200, updated, 'Reviewer assigned');
    } catch (err) {
      next(err);
    }
  },

  async declareConflict(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const updated = await verificationService.declareConflict(id, req.user._id, reason);
      sendSuccess(res, 200, updated, 'Conflict of interest declared');
    } catch (err) {
      next(err);
    }
  },

  async screenComplaint(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const complaint = await complaintRepository.findById(id);
      if (!complaint) {
        throw new NotFoundError('Complaint not found');
      }

      await complaintRepository.updateStatus(id, status, req.user._id, notes);
      if (notes) {
        await complaintRepository.updateById(id, { 'review.reviewerNotes': notes });
      }

      sendSuccess(res, 200, { status }, 'Screening status updated');
    } catch (err) {
      next(err);
    }
  },

  async requestInformation(req, res, next) {
    try {
      const { id } = req.params;
      const { message, targetUserId } = req.body;
      const complaint = await complaintRepository.findById(id);
      if (!complaint) {
        throw new NotFoundError('Complaint not found');
      }

      // Update status to needs more information
      await complaintRepository.updateStatus(id, COMPLAINT_STATUS.NEEDS_INFORMATION, req.user._id, message);

      if (targetUserId) {
        await notificationService.createNotification({
          recipientId: targetUserId,
          type: NOTIFICATION_TYPES.INFORMATION_REQUEST,
          title: 'Additional Information Requested',
          message: message || 'Staff has requested more details regarding your complaint.',
          targetUrl: `#/complaint/${id}`,
        });
      }

      sendSuccess(res, 200, { success: true }, 'Information requested from user');
    } catch (err) {
      next(err);
    }
  },

  async verifyComplaint(req, res, next) {
    try {
      const { id } = req.params;
      const { decision, reason, notes, assessment } = req.body;
      const updated = await verificationService.recordDecision(id, req.user._id, {
        decision,
        status: COMPLAINT_STATUS.VERIFIED,
        reason,
        notes,
        assessment,
      });
      sendSuccess(res, 200, updated, 'Complaint verified');
    } catch (err) {
      next(err);
    }
  },

  async reviewPublication(req, res, next) {
    try {
      const { id } = req.params;
      const { approved, reason } = req.body;
      const nextStatus = approved ? COMPLAINT_STATUS.PUBLIC_DISCLOSURE_REVIEW : COMPLAINT_STATUS.REJECTED;

      const complaint = await complaintRepository.findById(id);
      if (!complaint) {
        throw new NotFoundError('Complaint not found');
      }

      if (complaint.status !== COMPLAINT_STATUS.VERIFIED && complaint.status !== COMPLAINT_STATUS.PUBLIC_DISCLOSURE_REVIEW) {
        throw new ValidationError('Only verified complaints can proceed to publication review');
      }

      const conflictLog = await AuditLog.findOne({
        actorId: req.user._id,
        action: 'CONFLICT_OF_INTEREST_DECLARED',
        resourceId: complaint._id,
      });
      if (conflictLog || (complaint.review?.conflictOfInterest && complaint.review?.assignedReviewerId?.toString() === req.user._id.toString())) {
        throw new ConflictOfInterestError('Cannot perform publication review on a complaint with declared conflict of interest');
      }

      await complaintRepository.updateStatus(id, nextStatus, req.user._id, reason);
      await complaintRepository.updateById(id, {
        publication: {
          status: approved ? 'approved' : 'rejected',
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
          reason,
        },
      });

      sendSuccess(res, 200, { status: nextStatus }, 'Publication review decision recorded');
    } catch (err) {
      next(err);
    }
  },

  async createPublicReport(req, res, next) {
    try {
      const { id } = req.params;
      const report = await publicationService.publishReport({
        complaintId: id,
        adminId: req.user._id,
        ...req.body,
      });
      sendSuccess(res, 201, report, 'Public report created and published');
    } catch (err) {
      next(err);
    }
  },

  async getPublicReportByComplaintId(req, res, next) {
    try {
      const { id } = req.params;
      const report = await publicReportRepository.findByComplaintId(id);
      sendSuccess(res, 200, report);
    } catch (err) {
      next(err);
    }
  },

  async updatePublicReport(req, res, next) {
    try {
      const { id } = req.params; // reportId
      const report = await publicationService.updatePublicReport(id, req.body, req.user._id);
      sendSuccess(res, 200, report, 'Public report updated');
    } catch (err) {
      next(err);
    }
  },
};
