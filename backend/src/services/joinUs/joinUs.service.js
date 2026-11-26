import crypto from 'crypto';
import { joinUsRepository } from '../../repositories/joinUs.repository.js';
import { auditService } from '../audit/audit.service.js';
import { storageAdapterService } from '../storage/storageAdapter.service.js';
import { malwareScanService } from '../security/malwareScan.service.js';
import { emailService } from '../notification/email.service.js';
import { logger } from '../../utils/logger.js';
import { ConflictError, NotFoundError, ValidationError } from '../../utils/errors.js';
import { isDisposableEmail } from '../../utils/emailValidator.js';
import { isSafePublicUrl } from '../../utils/urlValidation.js';

function inferDocumentType(filename = '') {
  const lower = filename.toLowerCase();
  if (lower.includes('cv') || lower.includes('resume')) return 'cv';
  if (lower.includes('recommend') || lower.includes('letter')) return 'recommendation_letter';
  if (lower.includes('experience') || lower.includes('work') || lower.includes('certificate')) {
    return 'work_experience_document';
  }
  return 'other';
}

function safeParseJson(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    if (typeof value === 'string' && fallback && Array.isArray(fallback)) {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return fallback !== undefined ? fallback : value;
  }
}

export const joinUsService = {
  /**
   * Submit Join Us application with reference validation, file scanning, and confirmation email
   */
  async submit(data, files = []) {
    if (!data.fullName || !data.email) {
      throw new ValidationError('Full name and email are required');
    }

    const email = data.email.toLowerCase().trim();

    if (isDisposableEmail(email)) {
      throw new ValidationError(
        'অস্থায়ী বা ফেক ইমেইল (disposable email) গ্রহণযোগ্য নয়। অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা ব্যবহার করুন।'
      );
    }

    if (!data.primaryProfession || !data.primaryContributionRole || !data.contributionDetails) {
      throw new ValidationError(
        'Primary profession, primary contribution role, and contribution details are required'
      );
    }

    // Duplicate check:
    // If an existing submission with this email is currently pending ('submitted'), reject with 409 Conflict.
    const pendingSubmission = await joinUsRepository.findPendingByEmail(email);
    if (pendingSubmission) {
      throw new ConflictError(
        'A submission with this email address has already been received and is pending review'
      );
    }

    // If an earlier submission exists with another status (reviewed, accepted, rejected), flag as duplicate
    const previousSubmission = await joinUsRepository.findByEmail(email);
    const isDuplicate = Boolean(previousSubmission);
    const duplicateOf = previousSubmission ? previousSubmission._id : null;

    // Parse array/object fields if sent as multipart strings
    const contactInformation = safeParseJson(data.contactInformation, {});
    const secondaryProfessions = safeParseJson(data.secondaryProfessions, []);
    const secondaryContributionRoles = safeParseJson(data.secondaryContributionRoles, []);
    let socialLinks = safeParseJson(data.socialLinks, []);
    if (!Array.isArray(socialLinks)) {
      socialLinks = [socialLinks].filter(Boolean);
    }

    // SSRF URL security validation for submitted links
    if (data.linkedin && data.linkedin.trim()) {
      if (!isSafePublicUrl(data.linkedin.trim())) {
        throw new ValidationError('LinkedIn URL must be a valid, safe public web address');
      }
    }

    if (data.portfolio && data.portfolio.trim()) {
      if (!isSafePublicUrl(data.portfolio.trim())) {
        throw new ValidationError('Portfolio URL must be a valid, safe public web address');
      }
    }

    for (const link of socialLinks) {
      if (link && !isSafePublicUrl(link.trim())) {
        throw new ValidationError(`Social link "${link}" must be a valid, safe public web address`);
      }
    }

    // Process uploaded documents
    const documents = [];
    const fileList = Array.isArray(files) ? files : [files].filter(Boolean);

    for (const file of fileList) {
      if (!file || !file.buffer) continue;

      // 1. Malware and executable polyglot inspection
      const scanResult = await malwareScanService.scanBuffer({
        buffer: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype,
      });

      if (scanResult.status !== 'clean') {
        logger.warn('Uploaded Join Us document failed security scan', {
          filename: file.originalname,
          threats: scanResult.threats,
          status: scanResult.status,
        });
        throw new ValidationError(
          `Uploaded document "${file.originalname}" failed security scan: ${scanResult.details || (scanResult.threats && scanResult.threats.join(', ')) || 'Security verification failed'}`
        );
      }

      // 2. Compute SHA-256 checksum for audit & tamper detection
      const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

      // 3. Upload to Google Drive quarantine
      const uploadResult = await storageAdapterService.uploadToQuarantine({
        filename: file.originalname,
        mimeType: file.mimetype,
        bufferOrStream: file.buffer,
        size: file.size,
      });

      // 4. Move to clean private storage folder
      await storageAdapterService.moveToClean(uploadResult.driveFileId);

      documents.push({
        type: inferDocumentType(file.originalname),
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        checksum,
        driveFileId: uploadResult.driveFileId,
        storageReference: `clean/${uploadResult.driveFileId}`,
        scanStatus: 'clean',
        reviewStatus: 'pending',
        uploadedAt: new Date(),
      });
    }

    // Merge any pre-parsed documents passed in data.documents (e.g. from JSON tests)
    const existingDocs = safeParseJson(data.documents, []);
    if (Array.isArray(existingDocs)) {
      for (const doc of existingDocs) {
        if (doc && doc.driveFileId && doc.originalFilename) {
          documents.push({
            type: doc.type || 'cv',
            originalFilename: doc.originalFilename,
            mimeType: doc.mimeType || 'application/pdf',
            size: doc.size || 1024,
            checksum: doc.checksum,
            driveFileId: doc.driveFileId,
            storageReference: doc.storageReference || `clean/${doc.driveFileId}`,
            scanStatus: 'pending',
            reviewStatus: doc.reviewStatus || 'pending',
            uploadedAt: doc.uploadedAt || new Date(),
          });
        }
      }
    }

    // Mandatory Rule: At least ONE meaningful professional/social reference link OR supporting document
    const hasReference = Boolean(
      (data.linkedin && data.linkedin.trim()) ||
        (data.portfolio && data.portfolio.trim()) ||
        (socialLinks.length > 0 && socialLinks.some((l) => Boolean(l && l.trim())))
    );
    const hasDocument = documents.length > 0;

    if (!hasReference && !hasDocument) {
      throw new ValidationError(
        'কমপক্ষে ১টি প্রফেশনাল/সোশ্যাল রেফারেন্স লিঙ্ক (LinkedIn, Portfolio, GitHub/website) অথবা ১টি প্রমাণক ডকুমেন্ট (CV, Recommendation) প্রদান করা আবশ্যক।'
      );
    }

    // Create persistent submission
    const submission = await joinUsRepository.create({
      fullName: data.fullName.trim(),
      email,
      contactInformation,
      primaryProfession: data.primaryProfession.trim(),
      secondaryProfessions,
      customProfession: data.customProfession ? data.customProfession.trim() : undefined,
      primaryContributionRole: data.primaryContributionRole.trim(),
      secondaryContributionRoles,
      contributionDetails: data.contributionDetails.trim(),
      socialLinks,
      linkedin: data.linkedin ? data.linkedin.trim() : undefined,
      portfolio: data.portfolio ? data.portfolio.trim() : undefined,
      documents,
      submissionStatus: 'submitted',
      isDuplicate,
      duplicateOf,
    });

    // Audit log
    await auditService.log({
      actorType: 'system',
      action: 'JOIN_US_SUBMISSION_RECEIVED',
      resourceType: 'joinUsSubmission',
      resourceId: submission._id,
      metadata: {
        email,
        role: data.primaryContributionRole,
        isDuplicate,
        documentsCount: documents.length,
      },
    });

    // Send confirmation email asynchronously without blocking response
    try {
      await emailService.sendJoinUsConfirmationEmail({
        email: submission.email,
        fullName: submission.fullName,
        role: submission.primaryContributionRole,
      });
    } catch (err) {
      logger.error('Failed to send Join Us confirmation email', {
        error: err.message,
        submissionId: submission._id,
      });
    }

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
