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

  async updateTimeline(req, res, next) {
    try {
      const { id, eventId } = req.params;
      const result = await legalService.updateTimelineEvent(id, eventId, req.body, req.user._id);
      sendSuccess(res, 200, result, 'Timeline event updated');
    } catch (err) {
      next(err);
    }
  },

  async getAuthorityActions(req, res, next) {
    try {
      const { id } = req.params;
      const result = await legalService.getAuthorityActions(id);
      sendSuccess(res, 200, result);
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

  async updateAuthorityAction(req, res, next) {
    try {
      const { id, actionId } = req.params;
      const result = await legalService.updateAuthorityAction(id, actionId, req.body, req.user._id);
      sendSuccess(res, 200, result, 'Authority action updated');
    } catch (err) {
      next(err);
    }
  },

  async getLegalUpdateRequests(req, res, next) {
    try {
      const { id } = req.params;
      const result = await legalService.getLegalUpdateRequests(id);
      sendSuccess(res, 200, result);
    } catch (err) {
      next(err);
    }
  },

  async reviewLegalUpdateRequest(req, res, next) {
    try {
      const { id, requestId } = req.params;
      const result = await legalService.reviewLegalUpdateRequest(id, requestId, req.body, req.user._id);
      sendSuccess(res, 200, result, 'Legal update request reviewed');
    } catch (err) {
      next(err);
    }
  },
};
