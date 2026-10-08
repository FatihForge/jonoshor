import { joinUsService } from '../../services/joinUs/joinUs.service.js';
import { sendSuccess } from '../../utils/response.js';

export const publicJoinUsController = {
  async submit(req, res, next) {
    try {
      const files = req.files || (req.file ? [req.file] : []);
      const submission = await joinUsService.submit(req.body, files);

      return sendSuccess(
        res,
        {
          id: submission._id,
          message:
            'আপনার আবেদনটি সফলভাবে গৃহীত হয়েছে। আমাদের টিম পর্যালোচনা করে আপনার সাথে যোগাযোগ করবে।',
        },
        null,
        201
      );
    } catch (err) {
      next(err);
    }
  },
};
