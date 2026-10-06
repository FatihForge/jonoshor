import { complaintService } from '../../services/complaints/complaint.service.js';
import { sendSuccess } from '../../utils/response.js';

export const publicComplaintController = {
  async submitComplaint(req, res, next) {
    try {
      const complaint = await complaintService.createComplaint({
        user: null, // visitor flow
        complaintData: req.body,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return sendSuccess(
        res,
        {
          id: complaint._id,
          status: complaint.status,
          message: 'অভিযোগটি সফলভাবে গৃহীত হয়েছে। এটি পর্যালোচনার জন্য জমা হয়েছে।',
        },
        null,
        201
      );
    } catch (err) {
      next(err);
    }
  },
};
