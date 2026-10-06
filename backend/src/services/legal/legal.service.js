import { LegalCase } from '../../models/LegalCase.js';
import { Complaint } from '../../models/Complaint.js';
import { PublicReport } from '../../models/PublicReport.js';
import { auditService } from '../audit/audit.service.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

export class LegalService {
  /**
   * Create a legal case linked to a complaint
   */
  async createLegalCase({
    complaintId,
    caseNumber,
    caseType,
    authorities = [],
    courts = [],
    currentLegalStatus,
    adminId,
  }) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    const legalCase = await LegalCase.create({
      complaintId,
      caseNumber,
      caseType,
      authorities,
      courts,
      currentLegalStatus: currentLegalStatus || 'gd_filed',
      officialReferences: [],
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

    Object.assign(legalCase, updateData);
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

    legalCase.timeline.push({
      date: eventData.date || new Date(),
      eventType: eventData.eventType,
      description: eventData.description,
      source: eventData.source,
      reference: eventData.reference,
      verified: !!eventData.verified,
      publicSummary: eventData.publicSummary,
    });

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
   * Add authority action to complaint
   */
  async addAuthorityAction(complaintId, actionData, adminId) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    if (!complaint.legal) {
      complaint.legal = { authorities: [] };
    }
    if (!Array.isArray(complaint.legal.authorities)) {
      complaint.legal.authorities = [];
    }

    complaint.legal.authorities.push({
      type: actionData.authorityType || actionData.type || 'police',
      name: actionData.authorityName || actionData.name || '',
      action: actionData.action,
      date: actionData.date || new Date(),
      reference: actionData.reference,
      verified: !!actionData.verified,
      publicSummary: actionData.publicSummary || actionData.action,
    });

    await complaint.save();

    // If there is an existing public report, optionally update the authorityActionSummary
    if (actionData.publicSummary) {
      await PublicReport.findOneAndUpdate(
        { complaintId: complaint._id },
        {
          authorityActionSummary: actionData.publicSummary,
          $set: {
            'bn.authorityActionSummary': actionData.publicSummary,
            'en.authorityActionSummary': actionData.publicSummaryEn || actionData.publicSummary,
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

    return complaint;
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

    // Record user claim as unverified authority / legal item
    if (!complaint.legal) complaint.legal = { authorities: [] };
    if (!Array.isArray(complaint.legal.authorities)) complaint.legal.authorities = [];

    complaint.legal.authorities.push({
      type: claimData.type || 'other',
      name: claimData.name || '',
      action: claimData.claim,
      date: new Date(),
      reference: claimData.reference || '',
      verified: false, // Rule: Reporter-provided claims are NEVER auto-verified!
      publicSummary: '',
    });

    await complaint.save();
    return { success: true, message: 'Legal update claim submitted for review' };
  }
}

export const legalService = new LegalService();
