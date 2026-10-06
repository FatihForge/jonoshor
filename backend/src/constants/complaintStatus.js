export const COMPLAINT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  SCREENING: 'screening',
  NEEDS_INFORMATION: 'needs_information',
  EVIDENCE_REVIEW: 'evidence_review',
  VERIFICATION: 'verification',
  VERIFIED: 'verified',
  AUTHORITY_REFERRAL: 'authority_referral',
  PUBLIC_DISCLOSURE_REVIEW: 'public_disclosure_review',
  PUBLISHED: 'published',
  WITHHELD: 'withheld',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
};

export const SUBMISSION_TYPES = {
  USER: 'user',
  NON_USER: 'non_user',
};

export const DATE_PRECISION = {
  EXACT: 'exact',
  APPROXIMATE: 'approximate',
  UNKNOWN: 'unknown',
  RANGE: 'range',
  ONGOING: 'ongoing',
};

export const RISK_FLAGS = {
  SPAM_SUSPECTED: 'spam_suspected',
  DUPLICATE_SUSPECTED: 'duplicate_suspected',
  MALICIOUS_CONTENT: 'malicious_content',
  URGENT_SAFETY: 'urgent_safety',
  HIGH_RISK_VICTIM: 'high_risk_victim',
  LEGAL_SENSITIVITY: 'legal_sensitivity',
};
