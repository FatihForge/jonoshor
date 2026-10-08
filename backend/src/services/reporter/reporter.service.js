import { reporterRepository } from '../../repositories/reporter.repository.js';
import { userRepository } from '../../repositories/user.repository.js';
import { AccountRequiredError, ValidationError } from '../../utils/errors.js';
import { SUBMISSION_TYPES } from '../../constants/complaintStatus.js';
import { Complaint } from '../../models/Complaint.js';
import { SecurityLog } from '../../models/SecurityLog.js';

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
   * Enforce non-user maximum 5-complaints limit across:
   * 1. Reporter Identity (reporter.nonUserComplaintCount)
   * 2. IP Address signals (complaints count by IP)
   * 3. Browser / session signals (anonymous submission ID)
   * 4. Device / browser fingerprint signals
   */
  async validateNonUserLimit(reporterOrOptions, maybeSecurityIdentifiers = {}) {
    let reporter = reporterOrOptions;
    let secIdentifiers = maybeSecurityIdentifiers;
    let ip = secIdentifiers?.ip || null;

    if (reporterOrOptions && reporterOrOptions.reporter) {
      reporter = reporterOrOptions.reporter;
      secIdentifiers = reporterOrOptions.securityIdentifiers || maybeSecurityIdentifiers;
      ip = reporterOrOptions.ip || secIdentifiers?.ip;
    }

    if (!reporter || reporter.reporterType !== SUBMISSION_TYPES.NON_USER) {
      return;
    }

    // 1. Reporter Identity Signal: Reporter's persistent nonUserComplaintCount
    const reporterCount = reporter.nonUserComplaintCount || 0;
    if (reporterCount >= 5) {
      await this._logLimitExceeded({
        reporter,
        reason: 'REPORTER_IDENTITY_LIMIT',
        ip,
        securityIdentifiers: secIdentifiers,
        counts: { reporterCount },
      });
      throw new AccountRequiredError(
        'Non-user complaint limit reached (maximum 5 complaints). You must register or log in to submit further complaints.'
      );
    }

    // 2. IP Address Signal: Count non-user complaints from this IP
    if (ip) {
      const ipVariants = [ip, `::ffff:${ip}`, ip.replace(/^::ffff:/, '')].filter(Boolean);
      const countByIp = await Complaint.countDocuments({
        submissionType: SUBMISSION_TYPES.NON_USER,
        'securityIdentifiers.ip': { $in: ipVariants },
      });

      if (countByIp >= 5) {
        await this._logLimitExceeded({
          reporter,
          reason: 'IP_ADDRESS_LIMIT',
          ip,
          securityIdentifiers: secIdentifiers,
          counts: { countByIp, reporterCount },
        });
        throw new AccountRequiredError(
          'Non-user complaint limit reached (maximum 5 complaints). You must register or log in to submit further complaints.'
        );
      }
    }

    // 3. Browser / Session Signal: Anonymous submission ID
    const anonSubId = secIdentifiers?.anonymousSubmissionId;
    if (anonSubId) {
      const countByAnonId = await Complaint.countDocuments({
        submissionType: SUBMISSION_TYPES.NON_USER,
        'securityIdentifiers.anonymousSubmissionId': anonSubId,
      });

      if (countByAnonId >= 5) {
        await this._logLimitExceeded({
          reporter,
          reason: 'BROWSER_SESSION_LIMIT',
          ip,
          securityIdentifiers: secIdentifiers,
          counts: { countByAnonId, reporterCount },
        });
        throw new AccountRequiredError(
          'Non-user complaint limit reached (maximum 5 complaints). You must register or log in to submit further complaints.'
        );
      }
    }

    // 4. Browser / Device Fingerprint Signal
    const fingerprint = secIdentifiers?.browserSessionIdentifiers?.sessionFingerprint;
    if (fingerprint) {
      const countByFingerprint = await Complaint.countDocuments({
        submissionType: SUBMISSION_TYPES.NON_USER,
        'securityIdentifiers.browserSessionIdentifiers.sessionFingerprint': fingerprint,
      });

      if (countByFingerprint >= 5) {
        await this._logLimitExceeded({
          reporter,
          reason: 'DEVICE_FINGERPRINT_LIMIT',
          ip,
          securityIdentifiers: secIdentifiers,
          counts: { countByFingerprint, reporterCount },
        });
        throw new AccountRequiredError(
          'Non-user complaint limit reached (maximum 5 complaints). You must register or log in to submit further complaints.'
        );
      }
    }
  },

  async _logLimitExceeded({ reporter, reason, ip, securityIdentifiers = {}, counts = {} }) {
    try {
      await SecurityLog.create({
        eventType: 'NON_USER_LIMIT_EXCEEDED',
        ip: ip || securityIdentifiers?.ip,
        userAgent: securityIdentifiers?.browserSessionIdentifiers?.userAgent,
        riskSignal: `5_LIMIT_EXCEEDED:${reason}`,
        actionTaken: 'BLOCKED_403_ACCOUNT_REQUIRED',
        metadata: {
          reporterId: reporter?._id,
          contactEmail: reporter?.contact?.email,
          contactMobile: reporter?.contact?.mobile,
          reason,
          counts,
          approximateArea: securityIdentifiers?.approximateArea,
          anonymousSubmissionId: securityIdentifiers?.anonymousSubmissionId,
          source: securityIdentifiers?.source,
        },
      });
    } catch {
      // SecurityLog write error should not mask AccountRequiredError
    }
  },

  /**
   * Increment non-user complaint count after successful submission
   */
  async recordSubmission(reporterId, securityIdentifiers = null) {
    return await reporterRepository.incrementComplaintCount(reporterId, securityIdentifiers);
  },
};
