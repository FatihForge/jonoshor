import { JoinUsSubmission } from '../../models/JoinUsSubmission.js';
import { auditService } from '../audit/audit.service.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

export class JoinUsAdminService {
  /**
   * List Join Us submissions for authorized Admin/SuperAdmin
   */
  async listSubmissions({ status, profession, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (status) filter.submissionStatus = status;
    if (profession) filter.primaryProfession = profession;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      JoinUsSubmission.find(filter)
        .select('-adminNotes') // hide internal notes in summary list
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JoinUsSubmission.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Get single Join Us submission with internal details
   */
  async getSubmissionById(id) {
    const submission = await JoinUsSubmission.findById(id).lean();
    if (!submission) {
      throw new NotFoundError('Join Us submission not found');
    }
    return submission;
  }

  /**
   * Add internal administrative notes
   */
  async addAdminNote(id, note, adminId) {
    const submission = await JoinUsSubmission.findById(id);
    if (!submission) {
      throw new NotFoundError('Join Us submission not found');
    }

    submission.adminNotes = note;
    await submission.save();

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'JOIN_US_NOTE_ADDED',
      entity: 'JoinUsSubmission',
      entityId: submission._id,
      metadata: { noteLength: note.length },
    });

    return submission;
  }

  /**
   * Export Join Us submissions (Audit logged per Section 61)
   */
  async exportSubmissions(adminId) {
    const submissions = await JoinUsSubmission.find({}).sort({ submittedAt: -1 }).lean();

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'JOIN_US_DATA_EXPORTED',
      entity: 'JoinUsSubmission',
      metadata: { exportCount: submissions.length },
    });

    return submissions;
  }

  /**
   * Delete Join Us submission (Super Admin only per Section 62)
   */
  async deleteSubmission(id, superAdminId, reason) {
    const submission = await JoinUsSubmission.findById(id);
    if (!submission) {
      throw new NotFoundError('Join Us submission not found');
    }

    if (!reason) {
      throw new ValidationError('Reason is mandatory for deleting Join Us submissions');
    }

    await JoinUsSubmission.findByIdAndDelete(id);

    await auditService.log({
      actorId: superAdminId,
      actorType: 'superAdmin',
      action: 'JOIN_US_DELETED',
      entity: 'JoinUsSubmission',
      entityId: id,
      metadata: { reason },
    });

    return { success: true, message: 'Join Us submission deleted successfully' };
  }
}

export const joinUsAdminService = new JoinUsAdminService();
