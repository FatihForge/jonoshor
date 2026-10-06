import { Complaint } from '../models/Complaint.js';

export const complaintRepository = {
  async create(complaintData) {
    return await Complaint.create(complaintData);
  },

  async findById(id) {
    return await Complaint.findById(id).populate('reporterId').exec();
  },

  async findByReporterId(reporterId, { skip = 0, limit = 20, sort = { createdAt: -1 } } = {}) {
    return await Complaint.find({ reporterId }).sort(sort).skip(skip).limit(limit).exec();
  },

  async find(filter = {}, { skip = 0, limit = 20, sort = { createdAt: -1 } } = {}) {
    return await Complaint.find(filter).sort(sort).skip(skip).limit(limit).exec();
  },

  async count(filter = {}) {
    return await Complaint.countDocuments(filter).exec();
  },

  async updateById(id, updateData) {
    return await Complaint.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  },

  async updateStatus(id, newStatus, changedBy, note = '') {
    return await Complaint.findByIdAndUpdate(
      id,
      {
        $set: { status: newStatus },
        $push: {
          statusHistory: {
            status: newStatus,
            changedBy,
            changedAt: new Date(),
            note,
          },
        },
      },
      { new: true }
    ).exec();
  },

  async incrementCorrectionCount(id) {
    return await Complaint.findByIdAndUpdate(
      id,
      { $inc: { correctionCount: 1 } },
      { new: true }
    ).exec();
  },
};
