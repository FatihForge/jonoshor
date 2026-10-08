import { contactRepository } from '../../repositories/contact.repository.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError } from '../../utils/errors.js';

export class ContactService {
  async submitContact({ name, email, phone, message, ip, userAgent }) {
    const submission = await contactRepository.create({
      name,
      email,
      phone: phone || '',
      message,
      ip: ip || '',
      userAgent: userAgent || '',
    });

    logger.info(`New contact message received from ${email} (ID: ${submission._id})`);
    return submission;
  }

  async listMessages({ page, limit, status }) {
    return await contactRepository.list({ page, limit, status });
  }

  async getMessageById(id) {
    const msg = await contactRepository.findById(id);
    if (!msg) {
      throw new NotFoundError('Contact message not found');
    }
    return msg;
  }

  async updateMessageStatus(id, { status, adminNotes }) {
    const updated = await contactRepository.updateStatus(id, { status, adminNotes });
    if (!updated) {
      throw new NotFoundError('Contact message not found');
    }
    return updated;
  }
}

export const contactService = new ContactService();
