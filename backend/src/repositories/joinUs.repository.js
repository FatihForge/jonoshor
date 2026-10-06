import { JoinUsSubmission } from '../models/JoinUsSubmission.js';

export const joinUsRepository = {
  async create(submissionData) {
    return await JoinUsSubmission.create(submissionData);
  },

  async findById(id) {
    return await JoinUsSubmission.findById(id).exec();
  },

  async findByEmail(email) {
    if (!email) return null;
    return await JoinUsSubmission.findOne({ email: email.toLowerCase() }).exec();
  },

  async find(filter = {}, { skip = 0, limit = 20, sort = { submittedAt: -1 } } = {}) {
    return await JoinUsSubmission.find(filter).sort(sort).skip(skip).limit(limit).exec();
  },

  async count(filter = {}) {
    return await JoinUsSubmission.countDocuments(filter).exec();
  },

  async updateById(id, updateData) {
    return await JoinUsSubmission.findByIdAndUpdate(id, updateData, { new: true }).exec();
  },

  async deleteById(id) {
    return await JoinUsSubmission.findByIdAndDelete(id).exec();
  },
};
