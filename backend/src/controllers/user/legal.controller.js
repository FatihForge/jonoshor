import { legalService } from '../../services/legal/legal.service.js';
import { complaintService } from '../../services/complaints/complaint.service.js';
import { sendSuccess } from '../../utils/response.js';

export const userLegalController = {
  async requestUpdate(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id || req.user.id;
      const complaint = await complaintService.getUserComplaintById(id, userId);
      const reporterId = complaint.reporterId?._id || complaint.reporterId;
      const result = await legalService.requestLegalUpdate(id, reporterId, req.body);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};
