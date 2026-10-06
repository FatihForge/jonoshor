import { messagingService } from '../../services/messaging/messaging.service.js';
import { sendSuccess } from '../../utils/response.js';

export const adminMessagingController = {
  async listUserMessages(req, res, next) {
    try {
      const { id } = req.params; // user id
      const messages = await messagingService.listAdminUserMessages(id);
      sendSuccess(res, 200, messages);
    } catch (err) {
      next(err);
    }
  },

  async sendMessageToUser(req, res, next) {
    try {
      const { id } = req.params; // recipient user id
      const { body, complaintId, conversationId, attachmentEvidenceIds } = req.body;
      const message = await messagingService.sendMessage({
        conversationId,
        complaintId,
        senderId: req.user._id,
        senderType: 'admin',
        recipientId: id,
        body,
        attachmentEvidenceIds,
      });
      sendSuccess(res, 201, message, 'Message sent to user');
    } catch (err) {
      next(err);
    }
  },
};
