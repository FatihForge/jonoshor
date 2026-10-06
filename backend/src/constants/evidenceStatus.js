export const EVIDENCE_TYPES = {
  IMAGE: 'image',
  PDF: 'pdf',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  EXTERNAL_LINK: 'external_link',
};

export const UPLOAD_STATUS = {
  INITIATED: 'initiated',
  UPLOADING: 'uploading',
  UPLOADED: 'uploaded',
  QUARANTINED: 'quarantined',
  REJECTED: 'rejected',
  STORED: 'stored',
  DELETED: 'deleted',
};

export const MALWARE_SCAN_STATUS = {
  PENDING: 'pending',
  CLEAN: 'clean',
  MALICIOUS: 'malicious',
  FAILED: 'failed',
};

export const EVIDENCE_REVIEW_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  REVIEWED: 'reviewed',
  REJECTED: 'rejected',
};

export const EVIDENCE_PUBLIC_STATUS = {
  PRIVATE: 'private',
  APPROVED_PUBLIC: 'approved_public',
  WITHHELD: 'withheld',
};

export const REDACTION_STATUS = {
  NONE: 'none',
  REQUIRED: 'required',
  COMPLETED: 'completed',
};

export const ACCESSIBILITY_STATUS = {
  SUBMITTED: 'submitted',
  ACCESSIBLE: 'accessible',
  INACCESSIBLE: 'inaccessible',
  NEEDS_REVIEW: 'needs_review',
};

export const DELETION_STATUS = {
  REQUESTED: 'requested',
  DELETED: 'deleted',
  BLOCKED_BY_LEGAL_HOLD: 'blocked_by_legal_hold',
};
