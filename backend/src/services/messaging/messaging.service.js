import { Message } from '../../models/Message.js';
import { ForbiddenError, ValidationError } from '../../utils/errors.js';

export class MessagingService {
  /**
   * Send a message (Immutable: no editing or deletion permitted per Section 33 & Phase 23)
   */
  async sendMessage({
    conversationId,
    complaintId = null,
    senderId,
    senderType,
    recipientId,
    body,
    attachmentEvidenceIds = [],
  }) {
    if (!body || !body.trim()) {
      throw new ValidationError('Message body cannot be empty');
    }

    if (!recipientId && conversationId) {
      const prior = await Message.findOne({
        conversationId,
        senderId: { $ne: senderId },
      }).sort({ createdAt: -1 });
      if (prior) {
        recipientId = prior.senderId;
        if (!complaintId) complaintId = prior.complaintId;
      }
    }

    if (!recipientId) {
      throw new ValidationError('Recipient ID is required');
    }

    // Generate or use conversationId
    const convId = conversationId || `conv_${[senderId.toString(), recipientId.toString()].sort().join('_')}`;

    const message = await Message.create({
      conversationId: convId,
      complaintId,
      senderId,
      senderType,
      recipientId,
      body: body.trim(),
      attachmentEvidenceIds,
      read: false,
    });

    return message;
  }

  /**
   * Get messages in a conversation
   */
  async getConversation(conversationId, accessorId) {
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    // Check if accessor is either sender or recipient in at least one message
    const hasAccess = messages.some(
      (m) => m.senderId.toString() === accessorId.toString() || m.recipientId.toString() === accessorId.toString()
    );

    if (messages.length > 0 && !hasAccess) {
      throw new ForbiddenError('You do not have access to this conversation');
    }

    // Mark messages to this user as read
    await Message.updateMany(
      { conversationId, recipientId: accessorId, read: false },
      { read: true, readAt: new Date() }
    );

    return messages;
  }

  /**
   * List conversations for user
   */
  async listUserConversations(userId) {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { recipientId: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    // Group by conversationId
    const convMap = new Map();
    for (const msg of messages) {
      if (!convMap.has(msg.conversationId)) {
        convMap.set(msg.conversationId, {
          conversationId: msg.conversationId,
          lastMessage: msg.body,
          lastMessageAt: msg.createdAt,
          complaintId: msg.complaintId,
          unread: !msg.read && msg.recipientId.toString() === userId.toString(),
        });
      }
    }

    return Array.from(convMap.values());
  }

  /**
   * Admin lists messages with a specific user
   */
  async listAdminUserMessages(userId) {
    return await Message.find({
      $or: [{ senderId: userId }, { recipientId: userId }],
    })
      .sort({ createdAt: 1 })
      .lean();
  }
}

export const messagingService = new MessagingService();
