import { notificationService } from '../../services/notification/notification.service.js';
import { sendSuccess } from '../../utils/response.js';

export const adminNotificationController = {
  async sendToUser(req, res, next) {
    try {
      const { id } = req.params; // target user id
      const { type, title, message, targetUrl } = req.body;
      const result = await notificationService.createNotification({
        recipientId: id,
        recipientType: 'user',
        type: type || 'admin_update',
        title,
        message,
        targetUrl,
      });
      sendSuccess(res, 201, result, 'Notification sent to user');
    } catch (err) {
      next(err);
    }
  },
};
