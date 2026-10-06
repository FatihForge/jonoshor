import { complaintRepository } from '../../repositories/complaint.repository.js';
import { reporterRepository } from '../../repositories/reporter.repository.js';
import { reporterService } from '../reporter/reporter.service.js';
import { correctionRequestRepository } from '../../repositories/correctionRequest.repository.js';
import { publicReportRepository } from '../../repositories/publicReport.repository.js';
import { auditService } from '../audit/audit.service.js';
import {
  COMPLAINT_STATUS,
  SUBMISSION_TYPES,
} from '../../constants/complaintStatus.js';
import {
  NotFoundError,
  ForbiddenError,
  CorrectionLimitReachedError,
  ValidationError,
} from '../../utils/errors.js';

export const complaintService = {
  /**
   * Submit a new complaint (handles both User and Non-User flows)
   */
  async createComplaint({ user = null, complaintData, ip = null, userAgent = null }) {
    const isUser = Boolean(user && user.id);
    const isDraft = isUser && Boolean(complaintData.isDraft || complaintData.status === 'draft');
    const submissionType = isUser ? SUBMISSION_TYPES.USER : SUBMISSION_TYPES.NON_USER;

    // Contact info resolution
    let email = complaintData.contact?.email;
    let mobile = complaintData.contact?.mobile;

    if (isUser) {
      email = user.email;
      mobile = mobile || user.mobile;
    }

    if (!isDraft && !email && !mobile) {
      throw new ValidationError('A valid contact method (email or mobile) is required for submission');
    }

    // 1. Resolve persistent Reporter record
    const reporter = await reporterService.findOrCreateReporter({
      accountId: isUser ? user.id : null,
      email,
      mobile,
      reporterType: submissionType,
      identityVisibility: complaintData.identityVisibility || 'private',
      securityIdentifiers: { ip, userAgent },
    });

    // 2. Enforce 5-complaint non-user limit (only for non-users submitting)
    if (!isUser) {
      await reporterService.validateNonUserLimit(reporter);
    }

    const initialStatus = isDraft ? COMPLAINT_STATUS.DRAFT : COMPLAINT_STATUS.SUBMITTED;
    const initialNote = isDraft ? 'Complaint draft saved' : 'Initial complaint submission';

    // 3. Create Complaint record
    const newComplaint = await complaintRepository.create({
      reporterId: reporter._id,
      submissionType,
      category: {
        primary: complaintData.category?.primary || (isDraft ? 'অন্যান্য মানবাধিকার লঙ্ঘন' : undefined),
        secondary: complaintData.category?.secondary || [],
      },
      incident: {
        startDate: complaintData.incident?.startDate || (isDraft ? new Date() : undefined),
        endDate: complaintData.incident?.endDate,
        datePrecision: complaintData.incident?.datePrecision || 'exact',
        ongoing: Boolean(complaintData.incident?.ongoing),
        description: complaintData.incident?.description || (isDraft ? 'খসড়া বিবরণ' : undefined),
      },
      location: {
        divisionId: complaintData.location?.divisionId || (isDraft ? 'dhaka' : undefined),
        districtId: complaintData.location?.districtId || (isDraft ? 'dhaka' : undefined),
        upazilaId: complaintData.location?.upazilaId,
        freeTextLocation: complaintData.location?.freeTextLocation,
      },
      accused: complaintData.accused || [],
      victims: complaintData.victims || [],
      sensitivity: { level: 'medium', determinedBy: 'system' },
      priority: { level: 'normal', determinedBy: 'system' },
      riskFlags: [],
      status: initialStatus,
      statusHistory: [
        {
          status: initialStatus,
          changedAt: new Date(),
          note: initialNote,
        },
      ],
      correctionCount: 0,
    });

    // 4. If non-user submission, increment their complaint counter
    if (!isUser && !isDraft) {
      await reporterService.recordSubmission(reporter._id);
    }

    // 5. Audit log
    await auditService.log({
      actorId: isUser ? user.id : null,
      actorType: isUser ? 'user' : 'system',
      action: isDraft ? 'COMPLAINT_DRAFT_SAVED' : 'COMPLAINT_SUBMITTED',
      resourceType: 'complaint',
      resourceId: newComplaint._id,
      ip,
      userAgent,
      metadata: { submissionType, districtId: complaintData.location?.districtId },
    });

    return newComplaint;
  },

  /**
   * Get complaints submitted by a registered user
   */
  async getUserComplaints(userId, { skip = 0, limit = 20 } = {}) {
    const reporter = await reporterRepository.findByAccountId(userId);
    if (!reporter) {
      return { complaints: [], total: 0 };
    }

    const complaints = await complaintRepository.findByReporterId(reporter._id, { skip, limit });
    const total = await complaintRepository.count({ reporterId: reporter._id });

    return { complaints, total };
  },

  /**
   * Get single complaint with ownership check and sanitize sensitive internal fields
   */
  async getUserComplaintById(complaintId, userId) {
    const complaint = await complaintRepository.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    // Ownership check: reporter must be linked to this user's accountId
    const reporterAccountId = complaint.reporterId?.accountId?.toString();
    if (reporterAccountId !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to view this complaint');
    }

    const compObj = complaint.toObject ? complaint.toObject() : { ...complaint };
    // Strip sensitive internal reviewer notes, reviewer IDs, and security identifiers
    if (compObj.review) {
      delete compObj.review.reviewerNotes;
      delete compObj.review.assignedReviewerId;
      delete compObj.review.verifiedBy;
    }
    if (compObj.reporterId && typeof compObj.reporterId === 'object') {
      delete compObj.reporterId.securityIdentifiers;
      delete compObj.reporterId.notes;
    }
    delete compObj.riskFlags;
    delete compObj.sensitivity;

    // Attach canonical public report if published for Public/User consistency
    const publicReport = await publicReportRepository.findByComplaintId(complaint._id);
    if (publicReport && publicReport.publicationStatus === 'published') {
      compObj.publicReportId = publicReport._id;
      compObj.publicReport = {
        _id: publicReport._id,
        title: publicReport.bn?.title,
        summary: publicReport.bn?.summary,
        publishedAt: publicReport.publishedAt,
        caseStatus: publicReport.caseStatus,
        approvedEvidence: publicReport.approvedEvidence || [],
      };
    }

    return compObj;
  },

  /**
   * Update or submit an existing draft complaint
   */
  async updateUserComplaint(complaintId, userId, updateData, { ip = null, userAgent = null } = {}) {
    const complaint = await complaintRepository.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    const reporterAccountId = complaint.reporterId?.accountId?.toString();
    if (reporterAccountId !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to modify this complaint');
    }

    if (complaint.status !== COMPLAINT_STATUS.DRAFT) {
      throw new ForbiddenError('Only draft complaints can be edited directly. For submitted complaints, please request a correction.');
    }

    const isSubmitting = updateData.action === 'submit' || updateData.status === 'submitted' || (!updateData.isDraft && updateData.action !== 'save_draft');

    if (isSubmitting) {
      const primaryCat = updateData.category?.primary || complaint.category?.primary;
      if (!primaryCat) {
        throw new ValidationError('Primary category is required for submission');
      }
      const sDate = updateData.incident?.startDate || complaint.incident?.startDate;
      if (!sDate) {
        throw new ValidationError('Incident start date is required for submission');
      }
      const desc = updateData.incident?.description || complaint.incident?.description;
      if (!desc || desc.trim().length < 20) {
        throw new ValidationError('Incident description must be at least 20 characters');
      }
      const divId = updateData.location?.divisionId || complaint.location?.divisionId;
      if (!divId) {
        throw new ValidationError('Division is required for submission');
      }
      const distId = updateData.location?.districtId || complaint.location?.districtId;
      if (!distId) {
        throw new ValidationError('District is required for submission');
      }
    }

    const fieldsToUpdate = {};
    if (updateData.category) {
      if (updateData.category.primary !== undefined) fieldsToUpdate['category.primary'] = updateData.category.primary;
      if (updateData.category.secondary !== undefined) fieldsToUpdate['category.secondary'] = updateData.category.secondary;
    }
    if (updateData.incident) {
      if (updateData.incident.startDate !== undefined) fieldsToUpdate['incident.startDate'] = updateData.incident.startDate;
      if (updateData.incident.endDate !== undefined) fieldsToUpdate['incident.endDate'] = updateData.incident.endDate;
      if (updateData.incident.datePrecision !== undefined) fieldsToUpdate['incident.datePrecision'] = updateData.incident.datePrecision;
      if (updateData.incident.ongoing !== undefined) fieldsToUpdate['incident.ongoing'] = Boolean(updateData.incident.ongoing);
      if (updateData.incident.description !== undefined) fieldsToUpdate['incident.description'] = updateData.incident.description;
    }
    if (updateData.location) {
      if (updateData.location.divisionId !== undefined) fieldsToUpdate['location.divisionId'] = updateData.location.divisionId;
      if (updateData.location.districtId !== undefined) fieldsToUpdate['location.districtId'] = updateData.location.districtId;
      if (updateData.location.upazilaId !== undefined) fieldsToUpdate['location.upazilaId'] = updateData.location.upazilaId;
      if (updateData.location.freeTextLocation !== undefined) fieldsToUpdate['location.freeTextLocation'] = updateData.location.freeTextLocation;
    }
    if (updateData.accused !== undefined) {
      fieldsToUpdate.accused = updateData.accused;
    }
    if (updateData.victims !== undefined) {
      fieldsToUpdate.victims = updateData.victims;
    }

    if (isSubmitting) {
      fieldsToUpdate.status = COMPLAINT_STATUS.SUBMITTED;
    }

    const updated = await complaintRepository.updateById(complaint._id, fieldsToUpdate);

    if (isSubmitting) {
      await complaintRepository.updateStatus(complaint._id, COMPLAINT_STATUS.SUBMITTED, userId, 'Draft submitted by user');
      await auditService.log({
        actorId: userId,
        actorType: 'user',
        action: 'COMPLAINT_SUBMITTED',
        resourceType: 'complaint',
        resourceId: complaint._id,
        ip,
        userAgent,
        metadata: { submissionType: SUBMISSION_TYPES.USER },
      });
    }

    return updated;
  },

  /**
   * Request withdrawal of complaint by user
   */
  async requestWithdrawal(complaintId, userId, reason) {
    const complaint = await this.getUserComplaintById(complaintId, userId);

    const updated = await complaintRepository.updateById(complaint._id, {
      withdrawal: {
        requested: true,
        requestedAt: new Date(),
        reason,
      },
    });

    return updated;
  },

  /**
   * Request correction (max 3 requests)
   */
  async requestCorrection({ complaintId, userId, requestedChanges, reason }) {
    const complaint = await this.getUserComplaintById(complaintId, userId);

    if (complaint.correctionCount >= 3) {
      throw new CorrectionLimitReachedError('Correction limit reached (maximum 3 requests allowed)');
    }

    const correction = await correctionRequestRepository.create({
      complaintId: complaint._id,
      requesterId: userId,
      requestedChanges,
      reason,
      status: 'submitted',
    });

    await complaintRepository.incrementCorrectionCount(complaint._id);

    return correction;
  },
};
