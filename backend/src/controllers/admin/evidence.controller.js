import { evidenceService } from '../../services/evidence/evidence.service.js';
import { sendSuccess } from '../../utils/response.js';

export const adminEvidenceController = {
  async list(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const { type, reviewStatus, malwareScanStatus, publicStatus, complaintId } = req.query;

      const adminId = req.user?._id || req.auth?.id;
      const accountType = req.user?.accountType || req.auth?.accountType;

      const result = await evidenceService.adminListEvidence({
        adminId,
        accountType,
        page,
        limit,
        type,
        reviewStatus,
        malwareScanStatus,
        publicStatus,
        complaintId,
      });

      sendSuccess(res, 200, result.items, 'Evidence list retrieved', {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { evidenceId } = req.params;
      const adminId = req.user?._id || req.auth?.id;
      const accountType = req.user?.accountType || req.auth?.accountType;

      const result = await evidenceService.adminGetEvidenceById({
        evidenceId,
        adminId,
        accountType,
      });
      sendSuccess(res, 200, result, 'Evidence details retrieved');
    } catch (err) {
      next(err);
    }
  },

  async streamFile(req, res, next) {
    try {
      const { evidenceId } = req.params;
      const adminId = req.user?._id || req.auth?.id;
      const accountType = req.user?.accountType || req.auth?.accountType;

      // Authorize access and ensure no conflict
      await evidenceService.adminGetEvidenceById({
        evidenceId,
        adminId,
        accountType,
      });

      const { stream, mimeType, size, filename } = await evidenceService.streamEvidenceFile(evidenceId);

      res.setHeader('Content-Type', mimeType);
      if (size) res.setHeader('Content-Length', size);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Referrer-Policy', 'no-referrer');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cache-Control', 'private, no-cache');

      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  },

  async review(req, res, next) {
    try {
      const { evidenceId } = req.params;
      const { reviewStatus, malwareScanStatus, notes } = req.body;
      const reviewerId = req.user?._id || req.auth?.id;

      const result = await evidenceService.adminReviewEvidence({
        evidenceId,
        reviewerId,
        reviewStatus,
        malwareScanStatus,
        notes,
      });
      sendSuccess(res, 200, result, 'Evidence review updated');
    } catch (err) {
      next(err);
    }
  },

  async publish(req, res, next) {
    try {
      const { evidenceId } = req.params;
      const { publicStatus, redactionStatus } = req.body;
      const adminId = req.user?._id || req.auth?.id;

      const result = await evidenceService.adminPublishEvidence({
        evidenceId,
        adminId,
        publicStatus,
        redactionStatus,
      });
      sendSuccess(res, 200, result, 'Evidence publication status updated');
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { evidenceId } = req.params;
      const { reason } = req.body;
      const adminId = req.user?._id || req.auth?.id;

      const result = await evidenceService.adminDeleteEvidence({
        evidenceId,
        adminId,
        reason,
      });
      sendSuccess(res, 200, result, 'Evidence deleted');
    } catch (err) {
      next(err);
    }
  },
};
