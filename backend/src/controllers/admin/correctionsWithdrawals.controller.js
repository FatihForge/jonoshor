import { correctionsWithdrawalsService } from '../../services/review/correctionsWithdrawals.service.js';
import { sendSuccess } from '../../utils/response.js';

export const adminCorrectionsWithdrawalsController = {
  async listCorrections(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const { status } = req.query;

      const result = await correctionsWithdrawalsService.listCorrections({ status, page, limit });
      sendSuccess(res, 200, result.items, 'Corrections retrieved', {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (err) {
      next(err);
    }
  },

  async getCorrectionById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await correctionsWithdrawalsService.getCorrectionById(id);
      sendSuccess(res, 200, result);
    } catch (err) {
      next(err);
    }
  },

  async reviewCorrection(req, res, next) {
    try {
      const { id } = req.params;
      const { status, decisionReason } = req.body;
      const result = await correctionsWithdrawalsService.reviewCorrection({
        id,
        adminId: req.user._id,
        status,
        decisionReason,
      });
      sendSuccess(res, 200, result, 'Correction review saved');
    } catch (err) {
      next(err);
    }
  },

  async listWithdrawals(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;

      const result = await correctionsWithdrawalsService.listWithdrawals({ page, limit });
      sendSuccess(res, 200, result.items, 'Withdrawals retrieved', {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (err) {
      next(err);
    }
  },

  async reviewWithdrawal(req, res, next) {
    try {
      const { id } = req.params; // complaintId
      const { approved, decisionReason } = req.body;
      const result = await correctionsWithdrawalsService.reviewWithdrawal({
        complaintId: id,
        adminId: req.user._id,
        approved,
        decisionReason,
      });
      sendSuccess(res, 200, result, 'Withdrawal review completed');
    } catch (err) {
      next(err);
    }
  },
};
