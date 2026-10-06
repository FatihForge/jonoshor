import { PublicReport } from '../models/PublicReport.js';

export const publicReportRepository = {
  async create(reportData) {
    return await PublicReport.create(reportData);
  },

  async findById(id) {
    return await PublicReport.findById(id).exec();
  },

  async findByComplaintId(complaintId) {
    return await PublicReport.findOne({ complaintId }).exec();
  },

  async findPublished(filter = {}, { skip = 0, limit = 20, sort = { publishedAt: -1 } } = {}) {
    const finalFilter = {
      ...filter,
      publicationStatus: 'published',
    };
    return await PublicReport.find(finalFilter).sort(sort).skip(skip).limit(limit).exec();
  },

  async countPublished(filter = {}) {
    const finalFilter = {
      ...filter,
      publicationStatus: 'published',
    };
    return await PublicReport.countDocuments(finalFilter).exec();
  },

  async updateById(id, updateData) {
    return await PublicReport.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  },
};
