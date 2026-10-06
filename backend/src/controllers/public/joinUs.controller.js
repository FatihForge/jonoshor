import { joinUsService } from '../../services/joinUs/joinUs.service.js';
import { sendSuccess } from '../../utils/response.js';

export const publicJoinUsController = {
  async submit(req, res, next) {
    try {
      const submission = await joinUsService.submit(req.body);
      return sendSuccess(
        res,
        {
          id: submission._id,
          message: 'আপনার আবেদনটি সফলভাবে গৃহীত হয়েছে। পর্যালোচনার পর আমাদের পক্ষ থেকে যোগাযোগ করা হবে।',
        },
        null,
        201
      );
    } catch (err) {
      next(err);
    }
  },
};
