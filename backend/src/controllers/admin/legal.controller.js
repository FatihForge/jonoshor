import { legalService } from '../../services/legal/legal.service.js';
import { sendSuccess } from '../../utils/response.js';

export const adminLegalController = {
  async createCase(req, res, next) {
    try {
      const { id } = req.params;
      const result = await legalService.createLegalCase({
        complaintId: id,
        ...req.body,
        adminId: req.user._id,
      });
      sendSuccess(res, 201, result, 'Legal case created');
    } catch (err) {
      next(err);
    }
  },

  async getCases(req, res, next) {
    try {
      const { id } = req.params;
      const result = await legalService.getComplaintLegalCases(id);
      sendSuccess(res, 200, result);
    } catch (err) {
      next(err);
    }
  },

  async updateCase(req, res, next) {
    try {
      const { id } = req.params;
      const result = await legalService.updateLegalCase(id, req.body, req.user._id);
      sendSuccess(res, 200, result, 'Legal case updated');
    } catch (err) {
      next(err);
    }
  },

  async addTimeline(req, res, next) {
    try {
      const { id } = req.params;
      const result = await legalService.addTimelineEvent(id, req.body, req.user._id);
      sendSuccess(res, 201, result, 'Timeline event recorded');
    } catch (err) {
      next(err);
    }
  },

  async addAuthorityAction(req, res, next) {
    try {
      const { id } = req.params;
      const result = await legalService.addAuthorityAction(id, req.body, req.user._id);
      sendSuccess(res, 201, result, 'Authority action recorded');
    } catch (err) {
      next(err);
    }
  },
};
