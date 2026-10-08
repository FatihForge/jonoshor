import { JoinUsSubmission } from '../../models/JoinUsSubmission.js';
import { auditService } from '../audit/audit.service.js';
import { storageAdapterService } from '../storage/storageAdapter.service.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export class JoinUsAdminService {
  /**
   * List Join Us submissions for authorized Admin/SuperAdmin
   */
  async listSubmissions({ status, profession, isDuplicate, search, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (status) filter.submissionStatus = status;
    if (profession) filter.primaryProfession = profession;
    if (isDuplicate !== undefined && isDuplicate !== null && isDuplicate !== '') {
      filter.isDuplicate = isDuplicate === 'true' || isDuplicate === true;
    }
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { primaryContributionRole: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      JoinUsSubmission.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JoinUsSubmission.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Get single Join Us submission with full details (for authorized Admin/SuperAdmin)
   */
  async getSubmissionById(id) {
    const submission = await JoinUsSubmission.findById(id).lean();
    if (!submission) {
      throw new NotFoundError('Join Us submission not found');
    }
    return submission;
  }

  /**
   * Update submission review status
   */
  async updateStatus(id, adminId, { status, adminNotes }) {
    const submission = await JoinUsSubmission.findById(id);
    if (!submission) {
      throw new NotFoundError('Join Us submission not found');
    }

    const validStatuses = ['submitted', 'reviewed', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    submission.submissionStatus = status;

    if (adminNotes) {
      submission.adminNotes = adminNotes;
      submission.notes.push({
        adminId,
        adminName: 'Admin',
        content: `[Status changed to ${status}] ${adminNotes}`,
        createdAt: new Date(),
      });
    }

    await submission.save();

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'JOIN_US_STATUS_UPDATED',
      resourceType: 'joinUsSubmission',
      resourceId: submission._id,
      metadata: { status, hasNotes: Boolean(adminNotes) },
    });

    return submission;
  }

  /**
   * Add internal administrative note
   */
  async addAdminNote(id, note, adminId, adminName = 'Admin') {
    const submission = await JoinUsSubmission.findById(id);
    if (!submission) {
      throw new NotFoundError('Join Us submission not found');
    }

    submission.adminNotes = note;
    submission.notes.push({
      adminId,
      adminName,
      content: note,
      createdAt: new Date(),
    });

    await submission.save();

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'JOIN_US_NOTE_ADDED',
      resourceType: 'joinUsSubmission',
      resourceId: submission._id,
      metadata: { noteLength: note.length },
    });

    return submission;
  }

  /**
   * Update an existing internal administrative note
   */
  async updateAdminNote(id, noteId, updatedContent, adminId) {
    const submission = await JoinUsSubmission.findById(id);
    if (!submission) {
      throw new NotFoundError('Join Us submission not found');
    }

    const note = submission.notes.id(noteId);
    if (!note) {
      throw new NotFoundError('Admin note not found in this submission');
    }

    note.content = updatedContent;
    await submission.save();

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'JOIN_US_NOTE_UPDATED',
      resourceType: 'joinUsSubmission',
      resourceId: submission._id,
      metadata: { noteId },
    });

    return submission;
  }

  /**
   * Stream / proxy submitted document safely without exposing raw Google Drive URLs
   * IDOR protected: verifies document belongs strictly to this Join Us submission
   */
  async getDocumentStream(id, documentId, adminUser) {
    const submission = await JoinUsSubmission.findById(id);
    if (!submission) {
      throw new NotFoundError('Join Us submission not found');
    }

    const doc = submission.documents.id(documentId);
    if (!doc) {
      throw new NotFoundError('Requested document not found in this submission');
    }

    if (doc.scanStatus === 'infected' || doc.scanStatus === 'quarantined') {
      throw new ValidationError(
        `Document cannot be accessed because it is flagged as ${doc.scanStatus}`
      );
    }

    const fileResult = await storageAdapterService.getFileStream(doc.driveFileId);

    // Audit document access
    await auditService.log({
      actorId: adminUser._id || adminUser.id,
      actorType: adminUser.accountType || 'admin',
      action: 'JOIN_US_DOCUMENT_ACCESSED',
      resourceType: 'joinUsSubmission',
      resourceId: submission._id,
      metadata: {
        documentId: doc._id,
        filename: doc.originalFilename,
        mimeType: doc.mimeType,
      },
    });

    return {
      stream: fileResult.stream,
      mimeType: doc.mimeType || fileResult.mimeType || 'application/octet-stream',
      originalFilename: doc.originalFilename,
      size: doc.size || fileResult.size,
    };
  }

  /**
   * Export Join Us submissions (Audit logged per PRD / Security Sec 64)
   */
  async exportSubmissions(adminId) {
    const submissions = await JoinUsSubmission.find({})
      .select('-__v')
      .sort({ submittedAt: -1 })
      .lean();

    // Sanitize output to prevent leaking internal storage details
    const sanitized = submissions.map((sub) => ({
      _id: sub._id,
      fullName: sub.fullName,
      email: sub.email,
      contactInformation: sub.contactInformation,
      primaryProfession: sub.primaryProfession,
      secondaryProfessions: sub.secondaryProfessions,
      customProfession: sub.customProfession,
      primaryContributionRole: sub.primaryContributionRole,
      secondaryContributionRoles: sub.secondaryContributionRoles,
      contributionDetails: sub.contributionDetails,
      socialLinks: sub.socialLinks,
      linkedin: sub.linkedin,
      portfolio: sub.portfolio,
      submissionStatus: sub.submissionStatus,
      isDuplicate: sub.isDuplicate,
      documentsCount: (sub.documents || []).length,
      submittedAt: sub.submittedAt,
    }));

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'JOIN_US_DATA_EXPORTED',
      resourceType: 'joinUsSubmission',
      metadata: { exportCount: sanitized.length },
    });

    return sanitized;
  }

  /**
   * Delete Join Us submission (Super Admin only per PRD / Security Sec 65)
   */
  async deleteSubmission(id, superAdminId, reason) {
    const submission = await JoinUsSubmission.findById(id);
    if (!submission) {
      throw new NotFoundError('Join Us submission not found');
    }

    if (!reason || !reason.trim()) {
      throw new ValidationError('Reason is mandatory for deleting Join Us submissions');
    }

    // Clean up uploaded files in cloud storage
    for (const doc of submission.documents || []) {
      if (doc.driveFileId) {
        try {
          await storageAdapterService.deleteFile(doc.driveFileId);
        } catch (err) {
          logger.warn('Failed to delete file from storage during Join Us removal', {
            driveFileId: doc.driveFileId,
            error: err.message,
          });
        }
      }
    }

    await JoinUsSubmission.findByIdAndDelete(id);

    await auditService.log({
      actorId: superAdminId,
      actorType: 'superAdmin',
      action: 'JOIN_US_DELETED',
      resourceType: 'joinUsSubmission',
      resourceId: id,
      metadata: { reason },
    });

    return { success: true, message: 'Join Us submission deleted successfully' };
  }
}

export const joinUsAdminService = new JoinUsAdminService();
