import { userAdminService } from '../../services/admin/userAdmin.service.js';
import { sendSuccess } from '../../utils/response.js';

export const adminUserController = {
  /**
   * GET /api/v1/admin/users
   */
  async listUsers(req, res, next) {
    try {
      const page = req.query.page;
      const limit = req.query.limit;
      const status = req.query.status || req.query.accountStatus;

      const result = await userAdminService.listUsers({ page, limit, status });

      sendSuccess(res, 200, result.items, 'Users retrieved successfully', {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/admin/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userAdminService.getUserById(id);
      sendSuccess(res, 200, user, 'User retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/admin/users/:id/status
   */
  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const status = req.body.status || req.body.accountStatus;
      const { reason } = req.body;

      const updatedUser = await userAdminService.updateUserStatus({
        targetUserId: id,
        status,
        reason,
        actor: req.auth || req.user,
        ip: req.ip,
        userAgent: req.headers ? req.headers['user-agent'] : undefined,
        requestId: req.headers ? req.headers['x-request-id'] : undefined,
      });

      sendSuccess(res, 200, updatedUser, 'User status updated successfully');
    } catch (err) {
      next(err);
    }
  },
};
