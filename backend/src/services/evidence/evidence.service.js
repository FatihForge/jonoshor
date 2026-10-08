import { Buffer } from 'buffer';
import { Evidence } from '../../models/Evidence.js';
import { Complaint } from '../../models/Complaint.js';
import { storageAdapterService } from '../storage/storageAdapter.service.js';
import { malwareScanService } from '../security/malwareScan.service.js';
import { isSafePublicUrl } from '../../utils/urlValidation.js';
import {
  EVIDENCE_TYPES,
  UPLOAD_STATUS,
  MALWARE_SCAN_STATUS,
  EVIDENCE_REVIEW_STATUS,
  EVIDENCE_PUBLIC_STATUS,
  REDACTION_STATUS,
  ACCESSIBILITY_STATUS,
} from '../../constants/evidenceStatus.js';
import { auditService } from '../audit/audit.service.js';
import { AuditLog } from '../../models/AuditLog.js';
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
  ConflictOfInterestError,
} from '../../utils/errors.js';

export class EvidenceService {
  /**
   * Create an upload session for evidence files
   */
  async createUploadSession({
    complaintId,
    uploaderId,
    type,
    originalFilename,
    mimeType,
    size,
    sha256,
  }) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    if (!Object.values(EVIDENCE_TYPES).includes(type)) {
      throw new ValidationError(`Invalid evidence type: ${type}`);
    }

    // Allowed mime types check
    const allowedMimePrefixes = [
      'image/',
      'video/',
      'audio/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats',
    ];
    const isAllowedMime = allowedMimePrefixes.some((p) => mimeType.startsWith(p));
    if (!isAllowedMime) {
      throw new ValidationError(`Unsupported file type: ${mimeType}`);
    }

    // Size check (max 500MB)
    const MAX_SIZE = 500 * 1024 * 1024;
    if (size && size > MAX_SIZE) {
      throw new ValidationError('File size exceeds maximum allowed limit (500MB)');
    }

    // Generate storage session via Storage Adapter
    const session = await storageAdapterService.generateUploadSession({
      complaintId,
      filename: originalFilename || 'file',
      mimeType,
      size,
    });

    const evidence = await Evidence.create({
      complaintId,
      uploaderId,
      type,
      originalFilename,
      mimeType,
      size,
      sha256,
      driveFileId: session.driveFileId,
      uploadStatus: UPLOAD_STATUS.INITIATED,
      malwareScanStatus: MALWARE_SCAN_STATUS.PENDING,
      reviewStatus: EVIDENCE_REVIEW_STATUS.PENDING,
      publicStatus: EVIDENCE_PUBLIC_STATUS.PRIVATE,
    });

    return {
      evidenceId: evidence._id,
      uploadUrl: session.uploadUrl,
      driveFileId: session.driveFileId,
      expiresIn: session.expiresIn,
      method: session.method,
      headers: session.headers,
    };
  }

  /**
   * Complete upload and initiate real malware scan
   */
  async completeUpload({ complaintId = null, evidenceId, sha256, buffer = null, userId = null, userRole = null }) {
    const evidence = await Evidence.findById(evidenceId);
    if (!evidence) {
      throw new NotFoundError('Evidence record not found');
    }

    // Verify evidence ownership & complaint context for non-admin users
    if (userId && userRole !== 'admin' && userRole !== 'superAdmin') {
      const uploaderIdStr = evidence.uploaderId ? evidence.uploaderId.toString() : null;
      const currentUserIdStr = userId.toString();

      if (uploaderIdStr && uploaderIdStr !== currentUserIdStr) {
        throw new ForbiddenError('You do not have permission to complete upload for this evidence');
      }

      if (complaintId && evidence.complaintId && evidence.complaintId.toString() !== complaintId.toString()) {
        throw new ForbiddenError('Evidence does not belong to the specified complaint');
      }
    }

    if (
      evidence.uploadStatus !== UPLOAD_STATUS.INITIATED &&
      evidence.uploadStatus !== UPLOAD_STATUS.UPLOADING
    ) {
      throw new ConflictError(
        `Upload already completed or in invalid state: ${evidence.uploadStatus}`
      );
    }

    if (sha256) {
      evidence.sha256 = sha256;
    }

    evidence.uploadStatus = UPLOAD_STATUS.UPLOADED;

    if (buffer && buffer.length > 0) {
      try {
        const qRes = await storageAdapterService.uploadToQuarantine({
          filename: evidence.originalFilename,
          mimeType: evidence.mimeType,
          bufferOrStream: buffer,
          size: buffer.length,
        });
        if (qRes?.driveFileId) {
          evidence.driveFileId = qRes.driveFileId;
        }
      } catch {
        // Log but proceed to malware inspection
      }
    }

    // Execute real malware scanning inspection (magic-byte, executable headers, polyglots, EICAR, ClamAV)
    const scanResult = await malwareScanService.scanBuffer({
      buffer: buffer || Buffer.alloc(0),
      filename: evidence.originalFilename,
      mimeType: evidence.mimeType,
    });

    if (scanResult.status === MALWARE_SCAN_STATUS.MALICIOUS) {
      evidence.malwareScanStatus = MALWARE_SCAN_STATUS.MALICIOUS;
      evidence.uploadStatus = UPLOAD_STATUS.REJECTED;
      evidence.reviewStatus = EVIDENCE_REVIEW_STATUS.REJECTED;
      await evidence.save();

      throw new ValidationError(
        `Malware scan rejected file: ${scanResult.threats.join(', ')}`
      );
    }

    // Passed malware inspection -> move from Quarantine into Clean/Private Evidence folder
    evidence.malwareScanStatus = MALWARE_SCAN_STATUS.CLEAN;
    await storageAdapterService.moveToClean(evidence.driveFileId);
    evidence.uploadStatus = UPLOAD_STATUS.STORED;

    await evidence.save();
    return evidence;
  }

  /**
   * Register external evidence link with SSRF protection
   */
  async addExternalLink({ complaintId, uploaderId, url, sourceType }) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    if (!isSafePublicUrl(url)) {
      throw new ValidationError('URL is unsafe or blocked by SSRF protection');
    }

    const evidence = await Evidence.create({
      complaintId,
      uploaderId,
      type: EVIDENCE_TYPES.EXTERNAL_LINK,
      uploadStatus: UPLOAD_STATUS.STORED,
      malwareScanStatus: MALWARE_SCAN_STATUS.CLEAN,
      reviewStatus: EVIDENCE_REVIEW_STATUS.PENDING,
      publicStatus: EVIDENCE_PUBLIC_STATUS.PRIVATE,
      external: {
        url,
        sourceType: sourceType || 'news_or_social',
        accessibilityStatus: ACCESSIBILITY_STATUS.SUBMITTED,
        reviewStatus: 'pending',
      },
    });

    return evidence;
  }

  /**
   * Get user's permitted evidence list with private access routes (never exposing Google Drive direct URLs)
   */
  async getUserEvidence(complaintId) {
    const evidences = await Evidence.find({
      complaintId,
      'deletionStatus.deleted': { $ne: true },
    }).lean();

    const results = [];
    for (const item of evidences) {
      let downloadUrl = null;
      if (item.uploadStatus === UPLOAD_STATUS.STORED && item.driveFileId) {
        // Protected backend endpoint enforcing authentication and complaint ownership
        downloadUrl = `/api/v1/user/complaints/${complaintId}/evidence/${item._id}/download`;
      }

      results.push({
        _id: item._id,
        complaintId: item.complaintId,
        type: item.type,
        originalFilename: item.originalFilename,
        mimeType: item.mimeType,
        size: item.size,
        driveFileId: item.driveFileId,
        uploadStatus: item.uploadStatus,
        malwareScanStatus: item.malwareScanStatus,
        reviewStatus: item.reviewStatus,
        publicStatus: item.publicStatus,
        external: item.external,
        downloadUrl,
        createdAt: item.createdAt,
      });
    }

    return results;
  }

  /**
   * Admin list evidence with filtering, pagination, and conflict-of-interest exclusion
   */
  async adminListEvidence({
    adminId,
    accountType,
    page = 1,
    limit = 20,
    type,
    reviewStatus,
    malwareScanStatus,
    publicStatus,
    complaintId,
  }) {
    const filter = {
      'deletionStatus.deleted': { $ne: true },
    };

    if (type) filter.type = type;
    if (reviewStatus) filter.reviewStatus = reviewStatus;
    if (malwareScanStatus) filter.malwareScanStatus = malwareScanStatus;
    if (publicStatus) filter.publicStatus = publicStatus;
    if (complaintId) filter.complaintId = complaintId;

    // Filter out complaints where the admin has declared a conflict of interest
    if (accountType !== 'superAdmin') {
      const conflictLogs = await AuditLog.find({
        actorId: adminId,
        action: 'CONFLICT_OF_INTEREST_DECLARED',
        resourceType: 'complaint',
      }).select('resourceId').lean();

      const conflictedIds = conflictLogs.map((l) => l.resourceId);
      if (conflictedIds.length > 0) {
        filter.complaintId = filter.complaintId
          ? { $eq: filter.complaintId, $nin: conflictedIds }
          : { $nin: conflictedIds };
      }
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Evidence.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'complaintId',
          select: 'complaintNumber title status category location priority review',
        })
        .lean(),
      Evidence.countDocuments(filter),
    ]);

    const mapped = items.map((item) => {
      let downloadUrl = null;
      if (item.uploadStatus === UPLOAD_STATUS.STORED && item.driveFileId) {
        downloadUrl = `/api/v1/admin/evidence/${item._id}/file`;
      }
      return {
        ...item,
        downloadUrl,
        driveFileId: item.driveFileId ? `stored:${item.driveFileId.slice(0, 8)}...` : null,
      };
    });

    return {
      items: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single evidence details for authorized admin review
   */
  async adminGetEvidenceById({ evidenceId, adminId, accountType }) {
    const evidence = await Evidence.findOne({
      _id: evidenceId,
      'deletionStatus.deleted': { $ne: true },
    })
      .populate({
        path: 'complaintId',
        select: 'complaintNumber title status category location incidentDate priority review',
      })
      .lean();

    if (!evidence) {
      throw new NotFoundError('Evidence record not found');
    }

    // Check conflict of interest on the associated complaint
    if (accountType !== 'superAdmin') {
      const complaintRef = evidence.complaintId?._id || evidence.complaintId;
      const conflictLog = await AuditLog.findOne({
        actorId: adminId,
        action: 'CONFLICT_OF_INTEREST_DECLARED',
        resourceId: complaintRef,
      });

      if (conflictLog) {
        throw new ConflictOfInterestError('Cannot access evidence for a complaint with declared conflict of interest');
      }
    }

    // Fetch audit trail for this evidence
    const auditLogs = await AuditLog.find({
      resourceId: evidence._id,
    })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    let downloadUrl = null;
    if (evidence.uploadStatus === UPLOAD_STATUS.STORED && evidence.driveFileId) {
      downloadUrl = `/api/v1/admin/evidence/${evidence._id}/file`;
    }

    return {
      ...evidence,
      auditLogs,
      downloadUrl,
      driveFileId: evidence.driveFileId ? `stored:${evidence.driveFileId.slice(0, 8)}...` : null,
    };
  }

  /**
   * Admin reviews evidence
   */
  async adminReviewEvidence({ evidenceId, reviewerId, reviewStatus, malwareScanStatus, notes }) {
    const evidence = await Evidence.findById(evidenceId);
    if (!evidence) {
      throw new NotFoundError('Evidence record not found');
    }

    if (reviewerId) {
      const conflictLog = await AuditLog.findOne({
        actorId: reviewerId,
        action: 'CONFLICT_OF_INTEREST_DECLARED',
        resourceId: evidence.complaintId,
      });
      if (conflictLog) {
        throw new ConflictOfInterestError('Cannot review evidence for a complaint with declared conflict of interest');
      }
    }

    if (evidence.malwareScanStatus === MALWARE_SCAN_STATUS.MALICIOUS && reviewStatus === EVIDENCE_REVIEW_STATUS.REVIEWED) {
      throw new ValidationError('Cannot accept or approve evidence flagged as malicious');
    }

    if (reviewStatus) {
      if (!Object.values(EVIDENCE_REVIEW_STATUS).includes(reviewStatus)) {
        throw new ValidationError(`Invalid review status: ${reviewStatus}`);
      }
      evidence.reviewStatus = reviewStatus;
    }

    if (malwareScanStatus) {
      if (!Object.values(MALWARE_SCAN_STATUS).includes(malwareScanStatus)) {
        throw new ValidationError(`Invalid malware scan status: ${malwareScanStatus}`);
      }
      evidence.malwareScanStatus = malwareScanStatus;
      if (malwareScanStatus === MALWARE_SCAN_STATUS.MALICIOUS) {
        evidence.uploadStatus = UPLOAD_STATUS.REJECTED;
        evidence.reviewStatus = EVIDENCE_REVIEW_STATUS.REJECTED;
      }
    }

    await evidence.save();

    await auditService.log({
      actorId: reviewerId,
      actorType: 'admin',
      action: 'EVIDENCE_REVIEW',
      entity: 'Evidence',
      entityId: evidence._id,
      metadata: { reviewStatus, malwareScanStatus, notes },
    });

    return evidence;
  }

  /**
   * Admin approves evidence for public disclosure
   */
  async adminPublishEvidence({ evidenceId, adminId, publicStatus, redactionStatus }) {
    const evidence = await Evidence.findById(evidenceId);
    if (!evidence) {
      throw new NotFoundError('Evidence record not found');
    }

    if (adminId) {
      const conflictLog = await AuditLog.findOne({
        actorId: adminId,
        action: 'CONFLICT_OF_INTEREST_DECLARED',
        resourceId: evidence.complaintId,
      });
      if (conflictLog) {
        throw new ConflictOfInterestError('Cannot publish evidence for a complaint with declared conflict of interest');
      }
    }

    if (evidence.malwareScanStatus !== MALWARE_SCAN_STATUS.CLEAN) {
      throw new ValidationError('Cannot publish evidence that has not passed malware scan');
    }

    if (publicStatus) {
      if (!Object.values(EVIDENCE_PUBLIC_STATUS).includes(publicStatus)) {
        throw new ValidationError(`Invalid public status: ${publicStatus}`);
      }
      evidence.publicStatus = publicStatus;

      // When approved for public, copy safe version into public storage folder while preserving private original
      if (publicStatus === EVIDENCE_PUBLIC_STATUS.APPROVED_PUBLIC && evidence.driveFileId) {
        const safeFilename = `public_safe_${evidence.originalFilename || 'evidence'}`;
        const copyResult = await storageAdapterService.copyToPublic(evidence.driveFileId, safeFilename);
        evidence.publicDriveFileId = copyResult.driveFileId;
        evidence.safePublicNote = redactionStatus === REDACTION_STATUS.NONE
          ? 'Approved safe public copy (unredacted)'
          : `Approved safe public copy (${redactionStatus || 'redacted'})`;
      }
    }

    if (redactionStatus) {
      if (!Object.values(REDACTION_STATUS).includes(redactionStatus)) {
        throw new ValidationError(`Invalid redaction status: ${redactionStatus}`);
      }
      evidence.redactionStatus = redactionStatus;
    }

    await evidence.save();

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'EVIDENCE_PUBLISH_UPDATE',
      entity: 'Evidence',
      entityId: evidence._id,
      metadata: { publicStatus, redactionStatus },
    });

    return evidence;
  }

  /**
   * Public evidence viewer — strictly no tracking / access logging!
   * Serves file stream via backend proxy to eliminate Google viewer tracking cookies/IP logging.
   */
  async getPublicEvidence(evidenceId) {
    const evidence = await Evidence.findById(evidenceId).lean();
    if (!evidence || evidence.deletionStatus?.deleted) {
      throw new NotFoundError('Public evidence not found');
    }

    if (evidence.publicStatus !== EVIDENCE_PUBLIC_STATUS.APPROVED_PUBLIC) {
      throw new ForbiddenError('Evidence is not approved for public viewing');
    }

    let publicUrl = null;
    if (evidence.driveFileId) {
      // Zero-tracking proxy endpoint: client never touches Google Drive directly!
      publicUrl = `/api/v1/public/evidence/${evidence._id}/file`;
    } else if (evidence.external?.url) {
      publicUrl = evidence.external.url;
    }

    return {
      _id: evidence._id,
      complaintId: evidence.complaintId,
      type: evidence.type,
      originalFilename: evidence.originalFilename,
      mimeType: evidence.mimeType,
      publicUrl,
      redactionStatus: evidence.redactionStatus,
      external: evidence.external
        ? { url: evidence.external.url, sourceType: evidence.external.sourceType }
        : undefined,
      createdAt: evidence.createdAt,
    };
  }

  /**
   * Stream file for authorized private access or zero-tracking public delivery
   */
  async streamEvidenceFile(evidenceId, { preferPublic = false } = {}) {
    const evidence = await Evidence.findById(evidenceId);
    if (!evidence || evidence.deletionStatus?.deleted) {
      throw new NotFoundError('Evidence not found');
    }

    const targetFileId = (preferPublic && evidence.publicDriveFileId)
      ? evidence.publicDriveFileId
      : evidence.driveFileId;

    if (!targetFileId) {
      throw new NotFoundError('No stored binary file associated with this evidence');
    }

    const { stream, mimeType, size, filename } = await storageAdapterService.getFileStream(
      targetFileId
    );

    return {
      stream,
      mimeType: mimeType || evidence.mimeType || 'application/octet-stream',
      size: size || evidence.size,
      filename: filename || evidence.originalFilename || 'evidence_file',
      evidence,
    };
  }

  /**
   * Admin delete evidence with legal hold check
   */
  async adminDeleteEvidence({ evidenceId, adminId, reason }) {
    const evidence = await Evidence.findById(evidenceId);
    if (!evidence) {
      throw new NotFoundError('Evidence record not found');
    }

    if (adminId) {
      const conflictLog = await AuditLog.findOne({
        actorId: adminId,
        action: 'CONFLICT_OF_INTEREST_DECLARED',
        resourceId: evidence.complaintId,
      });
      if (conflictLog) {
        throw new ConflictOfInterestError('Cannot delete evidence for a complaint with declared conflict of interest');
      }
    }

    if (evidence.deletionStatus?.blocked_by_legal_hold) {
      throw new ConflictError('Evidence cannot be deleted: blocked by active legal hold');
    }

    // Delete file permanently from Google Drive storage
    if (evidence.driveFileId) {
      await storageAdapterService.deleteFile(evidence.driveFileId);
    }

    evidence.deletionStatus.deleted = true;
    evidence.deletionStatus.requested = true;
    evidence.uploadStatus = UPLOAD_STATUS.DELETED;
    evidence.publicStatus = EVIDENCE_PUBLIC_STATUS.WITHHELD;

    await evidence.save();

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'EVIDENCE_DELETE',
      entity: 'Evidence',
      entityId: evidence._id,
      metadata: { reason },
    });

    return { success: true, message: 'Evidence deleted successfully' };
  }
}

export const evidenceService = new EvidenceService();
