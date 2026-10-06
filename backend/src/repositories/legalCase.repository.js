import { LegalCase } from '../models/LegalCase.js';

export const legalCaseRepository = {
  async create(caseData) {
    return await LegalCase.create(caseData);
  },

  async findById(id) {
    return await LegalCase.findById(id).exec();
  },

  async findByComplaintId(complaintId) {
    return await LegalCase.find({ complaintId }).exec();
  },

  async updateById(id, updateData) {
    return await LegalCase.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  },

  async addTimelineEvent(id, timelineEvent) {
    return await LegalCase.findByIdAndUpdate(
      id,
      { $push: { timeline: timelineEvent } },
      { new: true }
    ).exec();
  },
};
