import { reporterRepository } from '../../repositories/reporter.repository.js';
import { userRepository } from '../../repositories/user.repository.js';
import { AccountRequiredError, ValidationError } from '../../utils/errors.js';
import { SUBMISSION_TYPES } from '../../constants/complaintStatus.js';

export const reporterService = {
  /**
   * Find or create persistent reporter record
   */
  async findOrCreateReporter({
    accountId = null,
    email = null,
    mobile = null,
    reporterType = SUBMISSION_TYPES.USER,
    identityVisibility = 'private',
    securityIdentifiers = {},
  }) {
    // 1. Look up by accountId if registered user
    if (accountId) {
      const existingByAccount = await reporterRepository.findByAccountId(accountId);
      if (existingByAccount) {
        return existingByAccount;
      }

      // If registered user, resolve contact from user record if not provided
      if (!email && !mobile) {
        const user = await userRepository.findById(accountId);
        if (user) {
          email = user.email;
          mobile = mobile || user.mobile;
        }
      }
    }

    // 2. Look up by contact email or mobile
    if (email || mobile) {
      const existingByContact = await reporterRepository.findByEmailOrMobile(email, mobile);
      if (existingByContact) {
        // If user is now logged in, link account without creating duplicate reporter
        if (accountId && !existingByContact.accountId) {
          return await reporterRepository.linkAccount(existingByContact._id, accountId);
        }
        return existingByContact;
      }
    }

    // 3. Validate contact requirement: at least email or mobile required
    if (!email && !mobile) {
      throw new ValidationError('A valid contact method (email or mobile) is required');
    }

    // 4. Create new persistent reporter
    return await reporterRepository.create({
      reporterType,
      accountId,
      contact: {
        email: email ? email.toLowerCase() : undefined,
        mobile: mobile || undefined,
      },
      identityVisibility,
      nonUserComplaintCount: 0,
      securityIdentifiers,
    });
  },

  /**
   * Enforce non-user maximum 5-complaints limit
   */
  async validateNonUserLimit(reporter) {
    if (reporter.reporterType === SUBMISSION_TYPES.NON_USER) {
      if (reporter.nonUserComplaintCount >= 5) {
        throw new AccountRequiredError(
          'Non-user complaint limit reached (maximum 5 complaints). You must register or log in to submit further complaints.'
        );
      }
    }
  },

  /**
   * Increment non-user complaint count after successful submission
   */
  async recordSubmission(reporterId) {
    return await reporterRepository.incrementComplaintCount(reporterId);
  },
};
