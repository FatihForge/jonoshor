import { messagingService } from '../../services/messaging/messaging.service.js';
import { sendSuccess } from '../../utils/response.js';

export const userMessagingController = {
  async listConversations(req, res, next) {
    try {
      const conversations = await messagingService.listUserConversations(req.user._id);
      sendSuccess(res, 200, conversations);
    } catch (err) {
      next(err);
    }
  },

  async getConversation(req, res, next) {
    try {
      const { conversationId } = req.params;
      const messages = await messagingService.getConversation(conversationId, req.user._id);
      sendSuccess(res, 200, messages);
    } catch (err) {
      next(err);
    }
  },

  async reply(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { body, complaintId, recipientId, attachmentEvidenceIds } = req.body;
      const message = await messagingService.sendMessage({
        conversationId,
        complaintId,
        senderId: req.user._id,
        senderType: 'user',
        recipientId,
        body,
        attachmentEvidenceIds,
      });
      sendSuccess(res, 201, message, 'Message sent');
    } catch (err) {
      next(err);
    }
  },
};
