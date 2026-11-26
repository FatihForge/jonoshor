import { publicReportRepository } from '../../repositories/publicReport.repository.js';
import { complaintRepository } from '../../repositories/complaint.repository.js';
import { auditService } from '../audit/audit.service.js';
import { Evidence } from '../../models/Evidence.js';
import { LegalCase } from '../../models/LegalCase.js';
import { AuditLog } from '../../models/AuditLog.js';
import { COMPLAINT_STATUS } from '../../constants/complaintStatus.js';
import { EVIDENCE_PUBLIC_STATUS, MALWARE_SCAN_STATUS } from '../../constants/evidenceStatus.js';
import { NotFoundError, ValidationError, ConflictOfInterestError } from '../../utils/errors.js';

export const publicationService = {
  /**
   * Create or update a sanitized Public Report from a verified complaint
   */
  async publishReport({
    complaintId,
    bn,
    en = null,
    adminId,
    publicAccused = [],
    publicVictims = [],
    authorityActionSummary = '',
    legalSummary = '',
    caseStatus = 'under_review',
    legalOutcome = '',
    approvedEvidence = [],
  }) {
    const complaint = await complaintRepository.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    if (complaint.status !== COMPLAINT_STATUS.VERIFIED && complaint.status !== COMPLAINT_STATUS.PUBLIC_DISCLOSURE_REVIEW) {
      throw new ValidationError('Only verified complaints can be published as public reports');
    }

    // Check conflict of interest
    if (adminId) {
      const conflictLog = await AuditLog.findOne({
        actorId: adminId,
        action: 'CONFLICT_OF_INTEREST_DECLARED',
        resourceId: complaint._id,
      });
      if (conflictLog || (complaint.review?.conflictOfInterest && complaint.review?.assignedReviewerId?.toString() === adminId.toString())) {
        throw new ConflictOfInterestError('Cannot publish report for a complaint with declared conflict of interest');
      }
    }

    if (!bn || !bn.title || !bn.summary || !bn.incidentStory) {
      throw new ValidationError('Bangla title, summary, and incident story are required for publication');
    }

    // 1. Associate only clean, approved public evidence
    const cleanPublicEvidence = await Evidence.find({
      complaintId: complaint._id,
      publicStatus: EVIDENCE_PUBLIC_STATUS.APPROVED_PUBLIC,
      malwareScanStatus: MALWARE_SCAN_STATUS.CLEAN,
      'deletionStatus.deleted': { $ne: true },
    }).lean();

    let safeApprovedEvidence = cleanPublicEvidence.map((ev) => ({
      evidenceId: ev._id,
      type: ev.type,
      publicUrl: ev.driveFileId ? `/api/v1/public/evidence/${ev._id}/file` : (ev.external?.url || null),
      title: ev.originalFilename || ev.type || 'Approved Public Evidence',
    }));

    if (Array.isArray(approvedEvidence) && approvedEvidence.length > 0) {
      const allowedIds = new Set(cleanPublicEvidence.map((ev) => ev._id.toString()));
      safeApprovedEvidence = safeApprovedEvidence.filter((ev) =>
        allowedIds.has(ev.evidenceId.toString())
      );
    }

    // 2. Anonymize/protect victims (respect minor protections & privacy decisions)
    const rawVictims = publicVictims && publicVictims.length > 0 ? publicVictims : (complaint.victims || []);
    const sanitizedVictims = rawVictims.map((v) => ({
      name:
        v.minor || v.isAnonymous || v.sensitivePerson || (v.identityVisibility && v.identityVisibility !== 'public_approved')
          ? 'পরিচয় গোপনীয়'
          : (v.name || 'ভুক্তভোগী'),
      category: v.category || v.relationshipToIncident || 'ভুক্তভোগী',
    }));

    // 3. Sanitize accused info (neutral terms; never label as convicted criminal without official outcome)
    const rawAccused =
      publicAccused && publicAccused.length > 0
        ? publicAccused
        : (complaint.accused || []).filter((acc) => acc.visibility === 'public_approved');
    const sanitizedAccused = rawAccused.map((acc) => ({
      name: acc.name || 'অজ্ঞাত ব্যক্তি',
      role: acc.role || 'অভিযুক্ত ব্যক্তি',
      organization: acc.organization || '',
    }));

    // 4. Determine legal status & outcomes
    let determinedCaseStatus = caseStatus || 'unknown';
    let determinedLegalSummary = legalSummary || '';
    let determinedLegalOutcome = legalOutcome || '';

    const legalCase = await LegalCase.findOne({ complaintId: complaint._id }).sort({ updatedAt: -1 });
    if (legalCase) {
      if (!caseStatus || caseStatus === 'under_review') {
        determinedCaseStatus = legalCase.currentLegalStatus || 'unknown';
      }
      if (!determinedLegalOutcome && legalCase.outcomes?.length > 0) {
        const verifiedOutcome = legalCase.outcomes.find((o) => o.verified) || legalCase.outcomes[0];
        if (verifiedOutcome) {
          determinedLegalOutcome = verifiedOutcome.description || '';
        }
      }
    } else if (complaint.legal?.hasLegalCase === false) {
      determinedCaseStatus = 'no_legal_case';
    }

    // 5. Determine authority action summary
    const determinedAuthoritySummary =
      authorityActionSummary ||
      (complaint.authorityActions && complaint.authorityActions.length > 0
        ? complaint.authorityActions
            .filter((a) => a.verified === true)
            .map((a) => `${a.authorityName}: ${a.action}`)
            .join('; ')
        : '');

    // Prepare public sanitized payload (zero internal notes, zero reviewer IDs, zero risk flags)
    const reportData = {
      complaintId: complaint._id,
      bn: {
        title: bn.title,
        summary: bn.summary,
        incidentStory: bn.incidentStory,
        legalSummary: bn.legalSummary || determinedLegalSummary,
        authorityActionSummary: bn.authorityActionSummary || determinedAuthoritySummary,
      },
      en: en ? {
        title: en.title,
        summary: en.summary,
        incidentStory: en.incidentStory,
        legalSummary: en.legalSummary || determinedLegalSummary,
        authorityActionSummary: en.authorityActionSummary || determinedAuthoritySummary,
      } : undefined,
      category: {
        primary: complaint.category.primary,
        secondary: complaint.category.secondary,
      },
      location: {
        divisionId: complaint.location.divisionId,
        districtId: complaint.location.districtId,
        upazilaId: complaint.location.upazilaId,
        generalLocation: complaint.location.freeTextLocation,
      },
      incidentDate: {
        startDate: complaint.incident.startDate,
        endDate: complaint.incident.endDate,
        precision: complaint.incident.datePrecision,
      },
      verificationStatus: 'verified',
      evidenceStatus: safeApprovedEvidence.length > 0 ? 'approved' : 'reviewed',
      publicAccused: sanitizedAccused,
      publicVictims: sanitizedVictims,
      authorityActionSummary: determinedAuthoritySummary,
      legalSummary: determinedLegalSummary,
      caseStatus: determinedCaseStatus,
      legalOutcome: determinedLegalOutcome,
      approvedEvidence: safeApprovedEvidence,
      publicationStatus: 'published',
      publishedAt: new Date(),
    };

    let report = await publicReportRepository.findByComplaintId(complaint._id);
    if (report) {
      report = await publicReportRepository.updateById(report._id, reportData);
    } else {
      report = await publicReportRepository.create(reportData);
    }

    // Update complaint status to published
    await complaintRepository.updateStatus(complaint._id, COMPLAINT_STATUS.PUBLISHED, adminId, 'Published as public report');
    await complaintRepository.updateById(complaint._id, {
      publication: {
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reason: 'Verification completed and disclosure approved',
      },
    });

    // Audit log
    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'REPORT_PUBLISHED',
      resourceType: 'publicReport',
      resourceId: report._id,
      metadata: { complaintId: complaint._id },
    });

    return report;
  },

  /**
   * List approved public reports with search/filtering
   */
  async getPublicReports({
    category = null,
    districtId = null,
    upazilaId = null,
    keyword = null,
    dateFrom = null,
    dateTo = null,
    verificationStatus = null,
    caseStatus = null,
    skip = 0,
    limit = 20,
    sort = { publishedAt: -1 },
  } = {}) {
    const filter = {};
    if (category) filter['category.primary'] = category;
    if (districtId) filter['location.districtId'] = districtId;
    if (upazilaId) filter['location.upazilaId'] = upazilaId;
    if (verificationStatus) filter['verificationStatus'] = verificationStatus;
    if (caseStatus) filter['caseStatus'] = caseStatus;

    if (dateFrom || dateTo) {
      filter['incidentDate.startDate'] = {};
      if (dateFrom) filter['incidentDate.startDate'].$gte = new Date(dateFrom);
      if (dateTo) filter['incidentDate.startDate'].$lte = new Date(dateTo);
    }

    if (keyword && keyword.trim()) {
      const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { 'bn.title': { $regex: escaped, $options: 'i' } },
        { 'bn.summary': { $regex: escaped, $options: 'i' } },
        { 'bn.incidentStory': { $regex: escaped, $options: 'i' } },
        { 'en.title': { $regex: escaped, $options: 'i' } },
        { 'en.summary': { $regex: escaped, $options: 'i' } },
        { 'location.generalLocation': { $regex: escaped, $options: 'i' } },
      ];
    }

    const reports = await publicReportRepository.findPublished(filter, { skip, limit, sort });
    const total = await publicReportRepository.countPublished(filter);

    return { reports, total };
  },

  /**
   * Get single public report by ID (supports reportId or complaintId)
   */
  async getPublicReportById(id) {
    let report = await publicReportRepository.findById(id);
    if (!report && typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) {
      report = await publicReportRepository.findByComplaintId(id);
    }
    if (!report || report.publicationStatus !== 'published') {
      throw new NotFoundError('Public report not found');
    }
    return report;
  },

  /**
   * Update existing public report
   */
  async updatePublicReport(id, updateData, adminId) {
    const report = await publicReportRepository.findById(id);
    if (!report) {
      throw new NotFoundError('Public report not found');
    }

    if (adminId) {
      const conflictLog = await AuditLog.findOne({
        actorId: adminId,
        action: 'CONFLICT_OF_INTEREST_DECLARED',
        resourceId: report.complaintId,
      });
      if (conflictLog) {
        throw new ConflictOfInterestError('Cannot update report for a complaint with declared conflict of interest');
      }
    }

    // Only allow public-safe fields to be updated
    const allowedFields = [
      'bn', 'en', 'category', 'location', 'incidentDate',
      'publicAccused', 'publicVictims', 'authorityActionSummary',
      'legalSummary', 'caseStatus', 'legalOutcome', 'publicationStatus'
    ];
    const safeUpdate = {};
    for (const key of Object.keys(updateData)) {
      if (allowedFields.includes(key)) {
        safeUpdate[key] = updateData[key];
      }
    }

    const updated = await publicReportRepository.updateById(id, safeUpdate);

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'PUBLIC_REPORT_UPDATED',
      resourceType: 'publicReport',
      resourceId: id,
      metadata: { updateData: safeUpdate },
    });

    return updated;
  },
};
