import { ContactSubmission } from '../models/ContactSubmission.js';

export class ContactRepository {
  async create(data) {
    const submission = new ContactSubmission(data);
    return await submission.save();
  }

  async findById(id) {
    return await ContactSubmission.findById(id).exec();
  }

  async list({ page = 1, limit = 20, status } = {}) {
    const query = {};
    if (status && ['new', 'read', 'archived', 'replied'].includes(status)) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      ContactSubmission.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContactSubmission.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateStatus(id, { status, adminNotes }) {
    const update = {};
    if (status) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    return await ContactSubmission.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
  }
}

export const contactRepository = new ContactRepository();
