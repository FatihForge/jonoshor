export function getStatusBadge(status) {
  const map = {
    submitted: { label: 'Submitted', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    screening: { label: 'Screening', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    needs_information: { label: 'Needs Info', color: 'bg-orange-50 text-orange-800 border-orange-200' },
    evidence_review: { label: 'Evidence Review', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    verification: { label: 'Under Verification', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    verified: { label: 'Verified', color: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold' },
    authority_referral: { label: 'Referred to Authority', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
    public_disclosure_review: { label: 'Disclosure Review', color: 'bg-teal-50 text-teal-800 border-teal-200' },
    published: { label: 'Published', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold' },
    withheld: { label: 'Withheld', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
    rejected: { label: 'Rejected', color: 'bg-red-50 text-red-800 border-red-200' },
    withdrawn: { label: 'Withdrawn', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    resolved: { label: 'Resolved', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    closed: { label: 'Closed', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    suspended: { label: 'Suspended', color: 'bg-rose-50 text-rose-800 border-rose-200' },
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  const item = map[status] || { label: status || 'Unknown', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.color}">${item.label}</span>`;
}

export function getAccountStatusBadge(status) {
  const map = {
    active: { label: 'Active', color: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold' },
    suspended: { label: 'Suspended', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    blocked: { label: 'Blocked', color: 'bg-red-50 text-red-800 border-red-200 font-bold' },
  };

  const item = map[status] || { label: status || 'Unknown', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.color}">${item.label}</span>`;
}

export function getPriorityBadge(priority) {
  const map = {
    urgent: { label: 'Urgent', color: 'bg-red-50 text-red-800 border-red-200 font-semibold' },
    high: { label: 'High', color: 'bg-orange-50 text-orange-800 border-orange-200' },
    normal: { label: 'Normal', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    low: { label: 'Low', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  };

  const p = typeof priority === 'object' ? priority?.level : priority;
  const item = map[p] || { label: p || 'Normal', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}

export function getSensitivityBadge(sensitivity) {
  const map = {
    critical: { label: 'Critical', color: 'bg-rose-50 text-rose-800 border-rose-200 font-semibold' },
    high: { label: 'High Sensitivity', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    medium: { label: 'Medium', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    low: { label: 'Low', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  };

  const s = typeof sensitivity === 'object' ? sensitivity?.level : sensitivity;
  const item = map[s] || { label: s || 'Medium', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}

export function getMalwareStatusBadge(status) {
  const map = {
    clean: { label: 'Clean', color: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold' },
    pending: { label: 'Pending Scan', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    malicious: { label: 'Malicious', color: 'bg-red-50 text-red-800 border-red-200 font-bold' },
    failed: { label: 'Scan Failed', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  };
  const item = map[status] || { label: status || 'Unknown', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}

export function getEvidenceReviewBadge(status) {
  const map = {
    reviewed: { label: 'Reviewed', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    under_review: { label: 'Under Review', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    pending: { label: 'Pending Review', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    rejected: { label: 'Rejected', color: 'bg-red-50 text-red-800 border-red-200' },
  };
  const item = map[status] || { label: status || 'Unknown', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}

export function getPublicStatusBadge(status) {
  const map = {
    approved_public: { label: 'Public Approved', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-medium' },
    private: { label: 'Private', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    withheld: { label: 'Withheld', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  };
  const item = map[status] || { label: status || 'Private', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}

export function getRedactionBadge(status) {
  const map = {
    none: { label: 'No Redaction', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    required: { label: 'Redaction Required', color: 'bg-orange-50 text-orange-800 border-orange-200 font-medium' },
    completed: { label: 'Redacted', color: 'bg-teal-50 text-teal-800 border-teal-200 font-medium' },
  };
  const item = map[status] || { label: status || 'none', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}

export function getUploadStatusBadge(status) {
  const map = {
    stored: { label: 'Stored', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    uploaded: { label: 'Uploaded', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    quarantined: { label: 'Quarantined', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    rejected: { label: 'Rejected', color: 'bg-red-50 text-red-800 border-red-200' },
    deleted: { label: 'Deleted', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    initiated: { label: 'Initiated', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    uploading: { label: 'Uploading...', color: 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse' },
  };
  const item = map[status] || { label: status || 'Unknown', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}

export function getEvidenceTypeBadge(type) {
  const map = {
    image: { label: 'Image', color: 'text-purple-800 bg-purple-50 border-purple-200' },
    pdf: { label: 'PDF', color: 'text-red-800 bg-red-50 border-red-200' },
    video: { label: 'Video', color: 'text-blue-800 bg-blue-50 border-blue-200' },
    audio: { label: 'Audio', color: 'text-amber-800 bg-amber-50 border-amber-200' },
    document: { label: 'Document', color: 'text-cyan-800 bg-cyan-50 border-cyan-200' },
    external_link: { label: 'External Link', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
  };
  const item = map[type] || { label: type || 'File', color: 'text-slate-700 bg-slate-100 border-slate-200' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}
