import { joinUsRepository } from '../../repositories/joinUs.repository.js';
import { auditService } from '../audit/audit.service.js';
import { ConflictError, NotFoundError, ValidationError } from '../../utils/errors.js';

export const joinUsService = {
  /**
   * Submit Join Us application
   */
  async submit(data) {
    if (!data.fullName || !data.email) {
      throw new ValidationError('Full name and email are required');
    }

    const existing = await joinUsRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('A submission with this email address has already been received');
    }

    if (!data.primaryProfession || !data.primaryContributionRole || !data.contributionDetails) {
      throw new ValidationError('Profession, contribution role, and contribution details are required');
    }

    const submission = await joinUsRepository.create({
      fullName: data.fullName,
      email: data.email,
      contactInformation: data.contactInformation || {},
      primaryProfession: data.primaryProfession,
      secondaryProfessions: data.secondaryProfessions || [],
      customProfession: data.customProfession,
      primaryContributionRole: data.primaryContributionRole,
      secondaryContributionRoles: data.secondaryContributionRoles || [],
      contributionDetails: data.contributionDetails,
      socialLinks: data.socialLinks || [],
      linkedin: data.linkedin,
      portfolio: data.portfolio,
      documents: data.documents || [],
      submissionStatus: 'submitted',
    });

    await auditService.log({
      actorType: 'system',
      action: 'JOIN_US_SUBMISSION_RECEIVED',
      resourceType: 'joinUsSubmission',
      resourceId: submission._id,
      metadata: { email: data.email, role: data.primaryContributionRole },
    });

    return submission;
  },

  async listSubmissions({ status = null, skip = 0, limit = 20 } = {}) {
    const filter = {};
    if (status) filter.submissionStatus = status;

    const submissions = await joinUsRepository.find(filter, { skip, limit });
    const total = await joinUsRepository.count(filter);

    return { submissions, total };
  },

  async getSubmissionById(id) {
    const submission = await joinUsRepository.findById(id);
    if (!submission) {
      throw new NotFoundError('Join Us submission not found');
    }
    return submission;
  },

  async updateStatus(id, adminId, { status, adminNotes }) {
    const submission = await joinUsRepository.findById(id);
    if (!submission) {
      throw new NotFoundError('Join Us submission not found');
    }

    const updateData = {};
    if (status) updateData.submissionStatus = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updated = await joinUsRepository.updateById(id, updateData);

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      action: 'JOIN_US_STATUS_UPDATED',
      resourceType: 'joinUsSubmission',
      resourceId: id,
      metadata: { status },
    });

    return updated;
  },
};
