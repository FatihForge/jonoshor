import { Reporter } from '../models/Reporter.js';

export const reporterRepository = {
  async create(reporterData) {
    return await Reporter.create(reporterData);
  },

  async findById(id, includeSecurityIdentifiers = false) {
    const query = Reporter.findById(id);
    if (includeSecurityIdentifiers) {
      query.select('+securityIdentifiers');
    }
    return await query.exec();
  },

  async findByAccountId(accountId) {
    return await Reporter.findOne({ accountId }).exec();
  },

  async findByEmailOrMobile(email, mobile) {
    const conditions = [];
    if (email) conditions.push({ 'contact.email': email.toLowerCase() });
    if (mobile) conditions.push({ 'contact.mobile': mobile });
    if (conditions.length === 0) return null;
    return await Reporter.findOne({ $or: conditions }).exec();
  },

  async linkAccount(reporterId, accountId) {
    return await Reporter.findByIdAndUpdate(
      reporterId,
      { accountId, reporterType: 'user' },
      { new: true }
    ).exec();
  },

  async incrementComplaintCount(reporterId, securityIdentifiers = null) {
    const update = { $inc: { nonUserComplaintCount: 1 } };
    if (securityIdentifiers) {
      update.$set = {
        'securityIdentifiers.timestamp': securityIdentifiers.timestamp,
        'securityIdentifiers.ip': securityIdentifiers.ip,
        'securityIdentifiers.approximateArea': securityIdentifiers.approximateArea,
        'securityIdentifiers.browserSessionIdentifiers': securityIdentifiers.browserSessionIdentifiers,
        'securityIdentifiers.anonymousSubmissionId': securityIdentifiers.anonymousSubmissionId,
        'securityIdentifiers.source': securityIdentifiers.source,
      };
      if (Array.isArray(securityIdentifiers.securityEvents) && securityIdentifiers.securityEvents.length > 0) {
        update.$push = {
          'securityIdentifiers.securityEvents': { $each: securityIdentifiers.securityEvents },
        };
      }
    }
    return await Reporter.findByIdAndUpdate(reporterId, update, { new: true }).exec();
  },
};
