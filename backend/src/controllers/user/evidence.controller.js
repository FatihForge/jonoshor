import { evidenceService } from '../../services/evidence/evidence.service.js';
import { complaintService } from '../../services/complaints/complaint.service.js';
import { Evidence } from '../../models/Evidence.js';
import { MALWARE_SCAN_STATUS } from '../../constants/evidenceStatus.js';
import { sendSuccess } from '../../utils/response.js';
import { ForbiddenError, NotFoundError } from '../../utils/errors.js';

export const userEvidenceController = {
  async createUploadSession(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id || req.user.id;
      // Object ownership verification
      await complaintService.getUserComplaintById(id, userId);

      const { type, originalFilename, mimeType, size, sha256 } = req.body;
      const result = await evidenceService.createUploadSession({
        complaintId: id,
        uploaderId: userId,
        type,
        originalFilename,
        mimeType,
        size,
        sha256,
      });

      sendSuccess(res, result, null, 201);
    } catch (err) {
      next(err);
    }
  },

  async completeUpload(req, res, next) {
    try {
      const { id } = req.params;
      const { evidenceId, sha256 } = req.body;
      const userId = req.user?._id || req.user?.id;
      const userRole = req.user?.accountType;

      const buffer = req.file ? req.file.buffer : null;
      const result = await evidenceService.completeUpload({
        complaintId: id,
        evidenceId,
        sha256,
        buffer,
        userId,
        userRole,
      });
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async addExternalLink(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id || req.user.id;
      await complaintService.getUserComplaintById(id, userId);

      const { url, sourceType } = req.body;
      const result = await evidenceService.addExternalLink({
        complaintId: id,
        uploaderId: userId,
        url,
        sourceType,
      });

      sendSuccess(res, result, null, 201);
    } catch (err) {
      next(err);
    }
  },

  async listEvidence(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id || req.user.id;
      await complaintService.getUserComplaintById(id, userId);

      const result = await evidenceService.getUserEvidence(id);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Protected download stream for authenticated user
   */
  async downloadEvidence(req, res, next) {
    try {
      const { id, evidenceId } = req.params;
      const userId = req.user._id || req.user.id;
      await complaintService.getUserComplaintById(id, userId);

      const evidenceRecord = await Evidence.findById(evidenceId);
      if (!evidenceRecord || evidenceRecord.deletionStatus?.deleted) {
        throw new NotFoundError('Evidence not found');
      }

      if (evidenceRecord.complaintId && evidenceRecord.complaintId.toString() !== id.toString()) {
        throw new ForbiddenError('Evidence does not belong to the specified complaint');
      }

      if (evidenceRecord.malwareScanStatus === MALWARE_SCAN_STATUS.MALICIOUS) {
        throw new ForbiddenError('Cannot download evidence flagged as malicious');
      }

      const { stream, mimeType, size, filename } = await evidenceService.streamEvidenceFile(evidenceId);

      res.setHeader('Content-Type', mimeType);
      if (size) res.setHeader('Content-Length', size);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  },
};
