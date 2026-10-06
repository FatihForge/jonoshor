import { publicationService } from '../../services/publication/publication.service.js';
import { sendSuccess } from '../../utils/response.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/pagination.js';

export const publicReportController = {
  async listReports(req, res, next) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query);
      const {
        category,
        districtId,
        district,
        upazilaId,
        upazila,
        keyword,
        q,
        dateFrom,
        dateTo,
        verificationStatus,
        caseStatus,
        legalStatus,
      } = req.query;

      const { reports, total } = await publicationService.getPublicReports({
        category,
        districtId: districtId || district || null,
        upazilaId: upazilaId || upazila || null,
        keyword: keyword || q || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        verificationStatus: verificationStatus || null,
        caseStatus: caseStatus || legalStatus || null,
        skip,
        limit,
      });

      // Zero-tracking security header
      res.setHeader('Referrer-Policy', 'no-referrer');

      const meta = buildPaginationMeta(total, page, limit);
      return sendSuccess(res, reports, meta);
    } catch (err) {
      next(err);
    }
  },

  async getReportById(req, res, next) {
    try {
      const { id } = req.params;
      const report = await publicationService.getPublicReportById(id);

      // Zero-tracking security header
      res.setHeader('Referrer-Policy', 'no-referrer');

      return sendSuccess(res, report);
    } catch (err) {
      next(err);
    }
  },
};
