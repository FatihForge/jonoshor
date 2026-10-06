import { notificationService } from '../../services/notification/notification.service.js';
import { sendSuccess } from '../../utils/response.js';

export const userNotificationController = {
  async list(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const unreadOnly = req.query.unread === 'true';

      const result = await notificationService.getUserNotifications(req.user._id, {
        unreadOnly,
        page,
        limit,
      });

      sendSuccess(res, 200, result.items, 'Notifications retrieved', {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const result = await notificationService.markAsRead(id, req.user._id);
      sendSuccess(res, 200, result, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  },
};
