import { LegalCase } from '../../models/LegalCase.js';
import { Complaint } from '../../models/Complaint.js';
import { PublicReport } from '../../models/PublicReport.js';
import { auditService } from '../audit/audit.service.js';
import { LEGAL_STATUS } from '../../constants/legalStatus.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

export class LegalService {
  /**
   * Create a legal case linked to a complaint
   */
  async createLegalCase({
    complaintId,
    caseNumber = null,
    caseType,
    authorities = [],
    courts = [],
    currentLegalStatus = LEGAL_STATUS.PENDING,
    outcomes = [],
    officialReferences = [],
    adminId,
  }) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    const legalCase = await LegalCase.create({
      complaintId,
      caseNumber: caseNumber ? caseNumber.trim() : undefined,
      caseType: caseType ? caseType.trim() : undefined,
      authorities: Array.isArray(authorities) ? authorities : [],
      courts: Array.isArray(courts) ? courts : [],
      currentLegalStatus: currentLegalStatus || LEGAL_STATUS.PENDING,
      outcomes: Array.isArray(outcomes) ? outcomes : [],
      officialReferences: Array.isArray(officialReferences) ? officialReferences : [],
      timeline: [],
    });

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'LEGAL_CASE_CREATED',
      entity: 'LegalCase',
      entityId: legalCase._id,
      metadata: { complaintId, caseNumber },
    });

    return legalCase;
  }

  /**
   * Get legal cases for a complaint
   */
  async getComplaintLegalCases(complaintId) {
    return await LegalCase.find({ complaintId }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Update legal case
   */
  async updateLegalCase(id, updateData, adminId) {
    const legalCase = await LegalCase.findById(id);
    if (!legalCase) {
      throw new NotFoundError('Legal case not found');
    }

    if (updateData.caseNumber !== undefined) legalCase.caseNumber = updateData.caseNumber ? updateData.caseNumber.trim() : undefined;
    if (updateData.caseType !== undefined) legalCase.caseType = updateData.caseType;
    if (updateData.authorities !== undefined) legalCase.authorities = updateData.authorities;
    if (updateData.courts !== undefined) legalCase.courts = updateData.courts;
    if (updateData.arrestStatus !== undefined) legalCase.arrestStatus = updateData.arrestStatus;
    if (updateData.bailStatus !== undefined) legalCase.bailStatus = updateData.bailStatus;
    if (updateData.investigationStatus !== undefined) legalCase.investigationStatus = updateData.investigationStatus;
    if (updateData.currentLegalStatus !== undefined) legalCase.currentLegalStatus = updateData.currentLegalStatus;
    if (updateData.outcomes !== undefined) legalCase.outcomes = updateData.outcomes;
    if (updateData.officialReferences !== undefined) legalCase.officialReferences = updateData.officialReferences;
    if (updateData.publicDisclosure !== undefined) legalCase.publicDisclosure = updateData.publicDisclosure;

    await legalCase.save();

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'LEGAL_CASE_UPDATED',
      entity: 'LegalCase',
      entityId: legalCase._id,
      metadata: { updateData },
    });

    return legalCase;
  }

  /**
   * Add a timeline event to a legal case
   */
  async addTimelineEvent(legalCaseId, eventData, adminId) {
    const legalCase = await LegalCase.findById(legalCaseId);
    if (!legalCase) {
      throw new NotFoundError('Legal case not found');
    }

    const newEvent = {
      date: eventData.date ? new Date(eventData.date) : new Date(),
      eventType: eventData.eventType || 'court_session',
      description: eventData.description || '',
      source: eventData.source || '',
      reference: eventData.reference || '',
      verified: Boolean(eventData.verified),
      publicSummary: eventData.publicSummary || '',
    };

    legalCase.timeline.push(newEvent);
    await legalCase.save();

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'LEGAL_TIMELINE_EVENT_ADDED',
      entity: 'LegalCase',
      entityId: legalCase._id,
      metadata: { eventType: eventData.eventType },
    });

    return legalCase;
  }

  /**
   * Update a timeline event in a legal case
   */
  async updateTimelineEvent(legalCaseId, eventId, eventData, adminId) {
    const legalCase = await LegalCase.findById(legalCaseId);
    if (!legalCase) {
      throw new NotFoundError('Legal case not found');
    }

    const event = legalCase.timeline.id(eventId);
    if (!event) {
      throw new NotFoundError('Timeline event not found');
    }

    if (eventData.date !== undefined) event.date = new Date(eventData.date);
    if (eventData.eventType !== undefined) event.eventType = eventData.eventType;
    if (eventData.description !== undefined) event.description = eventData.description;
    if (eventData.source !== undefined) event.source = eventData.source;
    if (eventData.reference !== undefined) event.reference = eventData.reference;
    if (eventData.verified !== undefined) event.verified = Boolean(eventData.verified);
    if (eventData.publicSummary !== undefined) event.publicSummary = eventData.publicSummary;

    await legalCase.save();

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'LEGAL_TIMELINE_EVENT_UPDATED',
      entity: 'LegalCase',
      entityId: legalCase._id,
      metadata: { eventId, eventType: event.eventType },
    });

    return legalCase;
  }

  /**
   * Get authority actions for a complaint
   */
  async getAuthorityActions(complaintId) {
    const complaint = await Complaint.findById(complaintId).select('authorityActions').lean();
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }
    return complaint.authorityActions || [];
  }

  /**
   * Add authority action to complaint
   */
  async addAuthorityAction(complaintId, actionData, adminId) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    if (!Array.isArray(complaint.authorityActions)) {
      complaint.authorityActions = [];
    }

    const newAction = {
      authorityType: actionData.authorityType || actionData.type || 'police',
      authorityName: actionData.authorityName || actionData.name || '',
      action: actionData.action,
      actionDate: actionData.actionDate || actionData.date || new Date(),
      reference: actionData.reference || '',
      verified: Boolean(actionData.verified),
      notes: actionData.notes || '',
      publicSummary: actionData.publicSummary || actionData.action,
    };

    complaint.authorityActions.push(newAction);
    await complaint.save();

    // If verified and has public summary, update public report if one exists
    if (newAction.verified && newAction.publicSummary) {
      await PublicReport.findOneAndUpdate(
        { complaintId: complaint._id },
        {
          authorityActionSummary: newAction.publicSummary,
          $set: {
            'bn.authorityActionSummary': newAction.publicSummary,
            'en.authorityActionSummary': actionData.publicSummaryEn || newAction.publicSummary,
          },
        }
      );
    }

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'AUTHORITY_ACTION_ADDED',
      entity: 'Complaint',
      entityId: complaint._id,
      metadata: { action: actionData.action },
    });

    return complaint.authorityActions[complaint.authorityActions.length - 1];
  }

  /**
   * Update authority action in complaint
   */
  async updateAuthorityAction(complaintId, actionId, updateData, adminId) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    const action = complaint.authorityActions.id(actionId);
    if (!action) {
      throw new NotFoundError('Authority action not found');
    }

    if (updateData.authorityType !== undefined) action.authorityType = updateData.authorityType;
    if (updateData.authorityName !== undefined) action.authorityName = updateData.authorityName;
    if (updateData.action !== undefined) action.action = updateData.action;
    if (updateData.actionDate !== undefined) action.actionDate = new Date(updateData.actionDate);
    if (updateData.reference !== undefined) action.reference = updateData.reference;
    if (updateData.verified !== undefined) action.verified = Boolean(updateData.verified);
    if (updateData.notes !== undefined) action.notes = updateData.notes;
    if (updateData.publicSummary !== undefined) action.publicSummary = updateData.publicSummary;

    await complaint.save();

    if (action.verified && action.publicSummary) {
      await PublicReport.findOneAndUpdate(
        { complaintId: complaint._id },
        {
          authorityActionSummary: action.publicSummary,
          $set: {
            'bn.authorityActionSummary': action.publicSummary,
            'en.authorityActionSummary': updateData.publicSummaryEn || action.publicSummary,
          },
        }
      );
    }

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'AUTHORITY_ACTION_UPDATED',
      entity: 'Complaint',
      entityId: complaint._id,
      metadata: { actionId },
    });

    return action;
  }

  /**
   * User requests a legal update (never auto-verified!)
   */
  async requestLegalUpdate(complaintId, reporterId, claimData) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    if (complaint.reporterId.toString() !== reporterId.toString()) {
      throw new ValidationError('You do not have access to this complaint');
    }

    if (!claimData.claim || !claimData.claim.trim()) {
      throw new ValidationError('A description of the legal update claim is required');
    }

    if (!Array.isArray(complaint.legalUpdateRequests)) {
      complaint.legalUpdateRequests = [];
    }

    complaint.legalUpdateRequests.push({
      claim: claimData.claim.trim(),
      type: claimData.type || 'police',
      name: claimData.name || '',
      reference: claimData.reference || '',
      status: 'pending',
      submittedAt: new Date(),
    });

    await complaint.save();
    return { success: true, message: 'Legal update claim submitted for review' };
  }

  /**
   * Get reporter legal update requests for admin review
   */
  async getLegalUpdateRequests(complaintId) {
    const complaint = await Complaint.findById(complaintId).select('legalUpdateRequests').lean();
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }
    return complaint.legalUpdateRequests || [];
  }

  /**
   * Review reporter legal update request
   */
  async reviewLegalUpdateRequest(complaintId, requestId, reviewData, adminId) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    const reqItem = complaint.legalUpdateRequests.id(requestId);
    if (!reqItem) {
      throw new NotFoundError('Legal update request not found');
    }

    reqItem.status = reviewData.status || 'verified';
    reqItem.adminNotes = reviewData.adminNotes || '';
    reqItem.reviewedAt = new Date();
    reqItem.reviewedBy = adminId;

    if (reviewData.status === 'verified' && reviewData.addToAuthorityActions) {
      complaint.authorityActions.push({
        authorityType: reqItem.type || 'police',
        authorityName: reqItem.name || '',
        action: reqItem.claim,
        actionDate: new Date(),
        reference: reqItem.reference || '',
        verified: true,
        notes: `Verified from user legal update request: ${reqItem.adminNotes || ''}`,
        publicSummary: reviewData.publicSummary || reqItem.claim,
      });
    }

    await complaint.save();

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'LEGAL_UPDATE_REQUEST_REVIEWED',
      entity: 'Complaint',
      entityId: complaint._id,
      metadata: { requestId, status: reqItem.status },
    });

    return reqItem;
  }
}

export const legalService = new LegalService();

