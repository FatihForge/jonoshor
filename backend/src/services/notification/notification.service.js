import { Notification } from '../../models/Notification.js';
import { NotFoundError } from '../../utils/errors.js';

export class NotificationService {
  /**
   * Create a safe system or admin notification
   * Note: sensitive complaint details are never included in message body (Section 32 / Phase 22)
   */
  async createNotification({
    recipientId,
    recipientType = 'user',
    type,
    title,
    message,
    targetUrl = '',
  }) {
    return await Notification.create({
      recipientId,
      recipientType,
      type,
      title,
      message,
      targetUrl,
      read: false,
    });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(recipientId, { unreadOnly = false, page = 1, limit = 20 } = {}) {
    const filter = { recipientId };
    if (unreadOnly) filter.read = false;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, recipientId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipientId,
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }
}

export const notificationService = new NotificationService();
