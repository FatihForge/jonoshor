import { joinUsAdminService } from '../../services/joinUs/joinUsAdmin.service.js';
import { sendSuccess } from '../../utils/response.js';

export const adminJoinUsController = {
  async list(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const { status, profession } = req.query;

      const result = await joinUsAdminService.listSubmissions({
        status,
        profession,
        page,
        limit,
      });

      sendSuccess(res, 200, result.items, 'Join Us submissions retrieved', {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await joinUsAdminService.getSubmissionById(id);
      sendSuccess(res, 200, result);
    } catch (err) {
      next(err);
    }
  },

  async addNote(req, res, next) {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const result = await joinUsAdminService.addAdminNote(id, note, req.user._id);
      sendSuccess(res, 200, result, 'Internal note added');
    } catch (err) {
      next(err);
    }
  },

  async exportData(req, res, next) {
    try {
      const result = await joinUsAdminService.exportSubmissions(req.user._id);
      sendSuccess(res, 200, result, 'Join Us submissions exported');
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await joinUsAdminService.deleteSubmission(id, req.user._id, reason);
      sendSuccess(res, 200, result);
    } catch (err) {
      next(err);
    }
  },
};
