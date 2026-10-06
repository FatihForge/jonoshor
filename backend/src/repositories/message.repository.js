import { Message } from '../models/Message.js';

export const messageRepository = {
  async create(messageData) {
    return await Message.create(messageData);
  },

  async findByConversationId(conversationId, { skip = 0, limit = 50 } = {}) {
    return await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  async findUserConversations(userId) {
    return await Message.distinct('conversationId', {
      $or: [{ senderId: userId }, { recipientId: userId }],
    }).exec();
  },

  async markAsRead(conversationId, recipientId) {
    return await Message.updateMany(
      { conversationId, recipientId, read: false },
      { read: true, readAt: new Date() }
    ).exec();
  },
};
