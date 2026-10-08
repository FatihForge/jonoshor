import { complaintService } from '../../services/complaints/complaint.service.js';
import { sendSuccess } from '../../utils/response.js';
import { generateRandomToken } from '../../utils/crypto.js';

export const publicComplaintController = {
  async submitComplaint(req, res, next) {
    try {
      let anonSubId = req.cookies?.['anon_sub_id'] || req.headers?.['x-submission-id'];
      if (!anonSubId) {
        anonSubId = generateRandomToken(16);
        res.cookie('anon_sub_id', anonSubId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });
      }

      const complaint = await complaintService.createComplaint({
        user: null, // visitor flow
        complaintData: req.body,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        req,
        anonymousSubmissionId: anonSubId,
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
