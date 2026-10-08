import { contactService } from '../../services/contact/contact.service.js';
import { sendSuccess } from '../../utils/response.js';

export class PublicContactController {
  async submitContact(req, res, next) {
    try {
      const { name, email, phone, message } = req.body;
      const ip = req.ip || req.connection?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const submission = await contactService.submitContact({
        name,
        email,
        phone,
        message,
        ip,
        userAgent,
      });

      sendSuccess(
        res,
        201,
        {
          id: submission._id,
          createdAt: submission.createdAt,
        },
        'Your message has been sent successfully. Our team will review your inquiry shortly.'
      );
    } catch (err) {
      next(err);
    }
  }
}

export const publicContactController = new PublicContactController();
