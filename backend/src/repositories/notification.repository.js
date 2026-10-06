import { Notification } from '../models/Notification.js';

export const notificationRepository = {
  async create(notificationData) {
    return await Notification.create(notificationData);
  },

  async findByRecipient(recipientId, { skip = 0, limit = 20, unreadOnly = false } = {}) {
    const filter = { recipientId };
    if (unreadOnly) filter.read = false;
    return await Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },

  async countUnread(recipientId) {
    return await Notification.countDocuments({ recipientId, read: false }).exec();
  },

  async markAsRead(id, recipientId) {
    return await Notification.findOneAndUpdate(
      { _id: id, recipientId },
      { read: true, readAt: new Date() },
      { new: true }
    ).exec();
  },

  async markAllAsRead(recipientId) {
    return await Notification.updateMany(
      { recipientId, read: false },
      { read: true, readAt: new Date() }
    ).exec();
  },
};
