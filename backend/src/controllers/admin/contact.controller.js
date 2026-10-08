import { contactService } from '../../services/contact/contact.service.js';
import { sendSuccess } from '../../utils/response.js';

export class AdminContactController {
  async listMessages(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const status = req.query.status;

      const result = await contactService.listMessages({ page, limit, status });
      sendSuccess(res, 200, result.items, 'Contact messages retrieved', {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }

  async getMessageById(req, res, next) {
    try {
      const { id } = req.params;
      const message = await contactService.getMessageById(id);
      sendSuccess(res, 200, message, 'Contact message retrieved');
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      const updated = await contactService.updateMessageStatus(id, { status, adminNotes });
      sendSuccess(res, 200, updated, 'Contact message status updated');
    } catch (err) {
      next(err);
    }
  }
}

export const adminContactController = new AdminContactController();
