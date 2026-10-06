import { Evidence } from '../models/Evidence.js';

export const evidenceRepository = {
  async create(evidenceData) {
    return await Evidence.create(evidenceData);
  },

  async findById(id) {
    return await Evidence.findById(id).exec();
  },

  async findByComplaintId(complaintId) {
    return await Evidence.find({
      complaintId,
      'deletionStatus.deleted': false,
    }).exec();
  },

  async findPublicByComplaintId(complaintId) {
    return await Evidence.find({
      complaintId,
      publicStatus: 'approved_public',
      'deletionStatus.deleted': false,
    }).exec();
  },

  async updateById(id, updateData) {
    return await Evidence.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  },

  async markDeleted(id) {
    return await Evidence.findByIdAndUpdate(
      id,
      { 'deletionStatus.deleted': true, 'uploadStatus': 'deleted' },
      { new: true }
    ).exec();
  },
};
