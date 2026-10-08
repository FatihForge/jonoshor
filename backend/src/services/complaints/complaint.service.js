import { complaintRepository } from '../../repositories/complaint.repository.js';
import { reporterRepository } from '../../repositories/reporter.repository.js';
import { reporterService } from '../reporter/reporter.service.js';
import { correctionRequestRepository } from '../../repositories/correctionRequest.repository.js';
import { publicReportRepository } from '../../repositories/publicReport.repository.js';
import { auditService } from '../audit/audit.service.js';
import { locationService } from '../locations/location.service.js';
import { normalizeCategoryKey, isValidCategory } from '../../constants/complaintCategories.js';
import { buildSecurityIdentifiers } from '../../utils/securityIdentifiers.js';
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
  async createComplaint({
    user = null,
    complaintData,
    ip = null,
    userAgent = null,
    req = null,
    anonymousSubmissionId = null,
  }) {
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

    // Category resolution and validation
    const primaryCategory = normalizeCategoryKey(
      complaintData.category?.primary || (isDraft ? 'other_human_rights_violations' : null)
    );
    if (!isDraft) {
      if (!primaryCategory || !isValidCategory(primaryCategory)) {
        throw new ValidationError('A valid primary complaint category is required');
      }
    }

    // Secondary categories normalization
    const secondaryCategories = Array.isArray(complaintData.category?.secondary)
      ? complaintData.category.secondary
          .map((c) => normalizeCategoryKey(c))
          .filter((c) => isValidCategory(c) && c !== primaryCategory)
      : [];

    // Date precision and incident date validation
    const datePrecision = complaintData.incident?.datePrecision || 'exact';
    const validPrecisions = ['exact', 'approximate', 'unknown', 'range'];
    if (!validPrecisions.includes(datePrecision)) {
      throw new ValidationError('Invalid incident date precision specified');
    }

    if (!isDraft) {
      if (datePrecision !== 'unknown') {
        if (!complaintData.incident?.startDate) {
          throw new ValidationError('Incident start date is required');
        }
        const startDate = new Date(complaintData.incident.startDate);
        if (isNaN(startDate.getTime())) {
          throw new ValidationError('Invalid incident start date format');
        }
        if (startDate > new Date()) {
          throw new ValidationError('Incident start date cannot be in the future');
        }
        if (complaintData.incident?.endDate) {
          const endDate = new Date(complaintData.incident.endDate);
          if (isNaN(endDate.getTime())) {
            throw new ValidationError('Invalid incident end date format');
          }
          if (endDate < startDate) {
            throw new ValidationError('Incident end date cannot be earlier than start date');
          }
        }
      }

      // Location validation
      if (!complaintData.location?.divisionId) {
        throw new ValidationError('Division is required for submission');
      }
      if (!complaintData.location?.districtId) {
        throw new ValidationError('District is required for submission');
      }
      await locationService.validateHierarchy({
        divisionId: complaintData.location?.divisionId,
        districtId: complaintData.location?.districtId,
        upazilaId: complaintData.location?.upazilaId,
      });
    }

    // Construct rich security identifiers metadata across all signals
    const builtSecurityIdentifiers = buildSecurityIdentifiers({
      req,
      ip,
      userAgent,
      location: complaintData.location,
      anonymousSubmissionId,
      source: isUser ? 'user_portal' : 'public_web',
      securityEvents: [
        {
          event: isDraft ? 'DRAFT_CREATED' : 'COMPLAINT_SUBMISSION_INITIATED',
          timestamp: new Date(),
        },
      ],
    });

    // 1. Resolve persistent Reporter record
    const reporter = await reporterService.findOrCreateReporter({
      accountId: isUser ? user.id : null,
      email,
      mobile,
      reporterType: submissionType,
      identityVisibility: complaintData.identityVisibility || 'private',
      securityIdentifiers: builtSecurityIdentifiers,
    });

    // 2. Enforce 5-complaint non-user limit across IP, browser signals, security signals, and reporter identity
    if (!isUser && !isDraft) {
      await reporterService.validateNonUserLimit({
        reporter,
        ip: builtSecurityIdentifiers.ip,
        securityIdentifiers: builtSecurityIdentifiers,
      });
    }

    const initialStatus = isDraft ? COMPLAINT_STATUS.DRAFT : COMPLAINT_STATUS.SUBMITTED;
    const initialNote = isDraft ? 'Complaint draft saved' : 'Initial complaint submission';

    // 3. Create Complaint record
    const newComplaint = await complaintRepository.create({
      reporterId: reporter._id,
      submissionType,
      category: {
        primary: primaryCategory,
        secondary: secondaryCategories,
      },
      incident: {
        startDate: complaintData.incident?.startDate || (isDraft ? new Date() : undefined),
        endDate: complaintData.incident?.endDate,
        datePrecision,
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
      securityIdentifiers: builtSecurityIdentifiers,
    });

    // 4. If non-user submission, increment their complaint counter & update securityIdentifiers
    if (!isUser && !isDraft) {
      await reporterService.recordSubmission(reporter._id, builtSecurityIdentifiers);
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
      const primaryCat = normalizeCategoryKey(updateData.category?.primary || complaint.category?.primary);
      if (!primaryCat || !isValidCategory(primaryCat)) {
        throw new ValidationError('A valid primary category is required for submission');
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
      const upzId = updateData.location?.upazilaId !== undefined ? updateData.location.upazilaId : complaint.location?.upazilaId;
      await locationService.validateHierarchy({
        divisionId: divId,
        districtId: distId,
        upazilaId: upzId,
      });
    }

    const fieldsToUpdate = {};
    if (updateData.category) {
      if (updateData.category.primary !== undefined) {
        fieldsToUpdate['category.primary'] = normalizeCategoryKey(updateData.category.primary);
      }
      if (updateData.category.secondary !== undefined) {
        fieldsToUpdate['category.secondary'] = Array.isArray(updateData.category.secondary)
          ? updateData.category.secondary.map((c) => normalizeCategoryKey(c)).filter(Boolean)
          : [];
      }
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
