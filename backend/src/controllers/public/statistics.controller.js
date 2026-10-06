import { Complaint } from '../../models/Complaint.js';
import { PublicReport } from '../../models/PublicReport.js';
import { LegalCase } from '../../models/LegalCase.js';
import { sendSuccess } from '../../utils/response.js';

export const publicStatisticsController = {
  async getStatistics(_req, res, next) {
    try {
      const [totalComplaints, verifiedReports, categoryStats, districtStats, legalStats] = await Promise.all([
        Complaint.countDocuments({}),
        PublicReport.countDocuments({ publicationStatus: 'published' }),
        PublicReport.aggregate([
          { $match: { publicationStatus: 'published' } },
          { $group: { _id: '$category.primary', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        PublicReport.aggregate([
          { $match: { publicationStatus: 'published' } },
          { $group: { _id: '$location.districtId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        LegalCase.aggregate([
          { $group: { _id: '$currentLegalStatus', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

      const statistics = {
        totalComplaints,
        verifiedReports,
        categories: categoryStats.map((c) => ({ category: c._id, count: c.count })),
        districts: districtStats.map((d) => ({ districtId: d._id, count: d.count })),
        legalStatuses: legalStats.map((l) => ({ status: l._id, count: l.count })),
      };

      sendSuccess(res, 200, statistics, 'Public statistics retrieved');
    } catch (err) {
      next(err);
    }
  },
};
