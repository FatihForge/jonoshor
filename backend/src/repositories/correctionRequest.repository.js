import { CorrectionRequest } from '../models/CorrectionRequest.js';

export const correctionRequestRepository = {
  async create(correctionData) {
    return await CorrectionRequest.create(correctionData);
  },

  async findById(id) {
    return await CorrectionRequest.findById(id).exec();
  },

  async findByComplaintId(complaintId) {
    return await CorrectionRequest.find({ complaintId }).exec();
  },

  async countByComplaintId(complaintId) {
    return await CorrectionRequest.countDocuments({ complaintId }).exec();
  },

  async updateById(id, updateData) {
    return await CorrectionRequest.findByIdAndUpdate(id, updateData, { new: true }).exec();
  },
};
