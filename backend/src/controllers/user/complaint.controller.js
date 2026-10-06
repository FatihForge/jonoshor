import { complaintService } from '../../services/complaints/complaint.service.js';
import { sendSuccess } from '../../utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/pagination.js';

export const userComplaintController = {
  async createComplaint(req, res, next) {
    try {
      const complaint = await complaintService.createComplaint({
        user: req.auth,
        complaintData: req.body,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return sendSuccess(res, { complaint }, null, 201);
    } catch (err) {
      next(err);
    }
  },

  async getMyComplaints(req, res, next) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query);
      const { complaints, total } = await complaintService.getUserComplaints(req.auth.id, { skip, limit });
      const meta = buildPaginationMeta(total, page, limit);

      return sendSuccess(res, complaints, meta);
    } catch (err) {
      next(err);
    }
  },

  async getMyComplaintById(req, res, next) {
    try {
      const { id } = req.params;
      const complaint = await complaintService.getUserComplaintById(id, req.auth.id);
      return sendSuccess(res, complaint);
    } catch (err) {
      next(err);
    }
  },

  async updateComplaint(req, res, next) {
    try {
      const { id } = req.params;
      const complaint = await complaintService.updateUserComplaint(id, req.auth.id, req.body, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return sendSuccess(res, { complaint });
    } catch (err) {
      next(err);
    }
  },

  async requestWithdrawal(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await complaintService.requestWithdrawal(id, req.auth.id, reason);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async requestCorrection(req, res, next) {
    try {
      const { id } = req.params;
      const { requestedChanges, reason } = req.body;
      const result = await complaintService.requestCorrection({
        complaintId: id,
        userId: req.auth.id,
        requestedChanges,
        reason,
      });
      return sendSuccess(res, result, null, 201);
    } catch (err) {
      next(err);
    }
  },
};
