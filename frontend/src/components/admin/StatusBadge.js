export function getStatusBadge(status) {
  const map = {
    submitted: { label: 'দাখিলকৃত', color: 'bg-amber-950/80 text-amber-300 border-amber-800/60' },
    screening: { label: 'বাছাইকরণ', color: 'bg-blue-950/80 text-blue-300 border-blue-800/60' },
    needs_information: { label: 'তথ্য প্রয়োজন', color: 'bg-orange-950/80 text-orange-300 border-orange-800/60' },
    evidence_review: { label: 'প্রমাণ পর্যালোচনা', color: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60' },
    verification: { label: 'যাচাইকরণাধীন', color: 'bg-purple-950/80 text-purple-300 border-purple-800/60' },
    verified: { label: 'যাচাইকৃত', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60' },
    authority_referral: { label: 'কর্তৃপক্ষে প্রেরণ', color: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60' },
    public_disclosure_review: { label: 'প্রকাশনা পর্যালোচনা', color: 'bg-teal-950/80 text-teal-300 border-teal-800/60' },
    published: { label: 'প্রকাশিত', color: 'bg-green-950/80 text-green-300 border-green-800/60' },
    withheld: { label: 'স্থগিত', color: 'bg-yellow-950/80 text-yellow-300 border-yellow-800/60' },
    rejected: { label: 'প্রত্যাখ্যাত', color: 'bg-red-950/80 text-red-300 border-red-800/60' },
    withdrawn: { label: 'প্রত্যাহারকৃত', color: 'bg-slate-800 text-slate-300 border-slate-700' },
    resolved: { label: 'নিষ্পত্তিকৃত', color: 'bg-emerald-900/60 text-emerald-200 border-emerald-700/60' },
    closed: { label: 'বন্ধ', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
    suspended: { label: 'সাসপেন্ড', color: 'bg-rose-950/80 text-rose-300 border-rose-800/60' },
    draft: { label: 'খসড়া', color: 'bg-slate-800 text-slate-400 border-slate-700' },
  };

  const item = map[status] || { label: status || 'অজ্ঞাত', color: 'bg-slate-800 text-slate-300 border-slate-700' };
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.color}">${item.label}</span>`;
}

export function getAccountStatusBadge(status) {
  const map = {
    active: { label: 'সক্রিয় (Active)', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    suspended: { label: 'সাময়িক স্থগিত (Suspended)', color: 'bg-amber-950 text-amber-300 border-amber-800' },
    blocked: { label: 'অবরুদ্ধ (Blocked)', color: 'bg-red-950 text-red-300 border-red-800 font-bold' },
  };

  const item = map[status] || { label: status || 'অজ্ঞাত', color: 'bg-slate-800 text-slate-400 border-slate-700' };
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.color}">${item.label}</span>`;
}


export function getPriorityBadge(priority) {
  const map = {
    urgent: { label: 'জরুরি', color: 'bg-red-950 text-red-300 border-red-800' },
    high: { label: 'উচ্চ', color: 'bg-orange-950 text-orange-300 border-orange-800' },
    normal: { label: 'সাধারণ', color: 'bg-slate-800 text-slate-300 border-slate-700' },
    low: { label: 'নিম্ন', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
  };

  const p = typeof priority === 'object' ? priority?.level : priority;
  const item = map[p] || { label: p || 'সাধারণ', color: 'bg-slate-800 text-slate-300 border-slate-700' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}

export function getSensitivityBadge(sensitivity) {
  const map = {
    critical: { label: 'মারাত্মক সংবেদনশীল', color: 'bg-rose-950 text-rose-300 border-rose-800' },
    high: { label: 'উচ্চ সংবেদনশীল', color: 'bg-amber-950 text-amber-300 border-amber-800' },
    medium: { label: 'মাঝারি', color: 'bg-slate-800 text-slate-300 border-slate-700' },
    low: { label: 'নিম্ন', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
  };

  const s = typeof sensitivity === 'object' ? sensitivity?.level : sensitivity;
  const item = map[s] || { label: s || 'মাঝারি', color: 'bg-slate-800 text-slate-300 border-slate-700' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}

export function getMalwareStatusBadge(status) {
  const map = {
    clean: { label: 'নিরাপদ (Clean)', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    pending: { label: 'স্ক্যান অপেক্ষমাণ', color: 'bg-amber-950 text-amber-300 border-amber-800' },
    malicious: { label: 'ক্ষতিকারক (Malicious)', color: 'bg-red-950 text-red-300 border-red-800 font-bold' },
    failed: { label: 'স্ক্যান ব্যর্থ (Failed)', color: 'bg-rose-950 text-rose-300 border-rose-800' },
  };
  const item = map[status] || { label: status || 'অজ্ঞাত', color: 'bg-slate-800 text-slate-400 border-slate-700' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}

export function getEvidenceReviewBadge(status) {
  const map = {
    reviewed: { label: 'গৃহীত / পর্যালোচিত', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    under_review: { label: 'পর্যালোচনাধীন', color: 'bg-indigo-950 text-indigo-300 border-indigo-800' },
    pending: { label: 'পর্যালোচনা অপেক্ষমাণ', color: 'bg-amber-950 text-amber-300 border-amber-800' },
    rejected: { label: 'প্রত্যাখ্যাত', color: 'bg-red-950 text-red-300 border-red-800' },
  };
  const item = map[status] || { label: status || 'অজ্ঞাত', color: 'bg-slate-800 text-slate-400 border-slate-700' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}

export function getPublicStatusBadge(status) {
  const map = {
    approved_public: { label: 'উন্মুক্ত (Public Approved)', color: 'bg-emerald-900/90 text-emerald-200 border-emerald-700 font-medium' },
    private: { label: 'গোপনীয় (Private)', color: 'bg-slate-800 text-slate-400 border-slate-700' },
    withheld: { label: 'স্থগিত (Withheld)', color: 'bg-amber-950 text-amber-300 border-amber-800' },
  };
  const item = map[status] || { label: status || 'প্রাইভেট', color: 'bg-slate-800 text-slate-400 border-slate-700' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}

export function getRedactionBadge(status) {
  const map = {
    none: { label: 'রিডাকশন অপ্রয়োজনীয়', color: 'bg-slate-800 text-slate-400 border-slate-700' },
    required: { label: 'রিডাকশন আবশ্যক', color: 'bg-orange-950 text-orange-300 border-orange-800 font-medium' },
    completed: { label: 'রিডাকশন সম্পন্ন', color: 'bg-teal-950 text-teal-300 border-teal-800 font-medium' },
  };
  const item = map[status] || { label: status || 'none', color: 'bg-slate-800 text-slate-400 border-slate-700' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}

export function getUploadStatusBadge(status) {
  const map = {
    stored: { label: 'সংরক্ষিত (Stored)', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    uploaded: { label: 'আপলোডকৃত', color: 'bg-blue-950 text-blue-300 border-blue-800' },
    quarantined: { label: 'কোয়ারেন্টাইন', color: 'bg-amber-950 text-amber-300 border-amber-800' },
    rejected: { label: 'বাতিলকৃত', color: 'bg-red-950 text-red-300 border-red-800' },
    deleted: { label: 'মুছে ফেলা', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
    initiated: { label: 'শুরু হয়েছে', color: 'bg-slate-800 text-slate-400 border-slate-700' },
    uploading: { label: 'আপলোড হচ্ছে...', color: 'bg-blue-950 text-blue-300 border-blue-800 animate-pulse' },
  };
  const item = map[status] || { label: status || 'অজ্ঞাত', color: 'bg-slate-800 text-slate-400 border-slate-700' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}

export function getEvidenceTypeBadge(type) {
  const map = {
    image: { label: 'ছবি (Image)', color: 'text-purple-300 bg-purple-950/60 border-purple-800/50' },
    pdf: { label: 'পিডিএফ (PDF)', color: 'text-red-300 bg-red-950/60 border-red-800/50' },
    video: { label: 'ভিডিও (Video)', color: 'text-blue-300 bg-blue-950/60 border-blue-800/50' },
    audio: { label: 'অডিও (Audio)', color: 'text-yellow-300 bg-yellow-950/60 border-yellow-800/50' },
    document: { label: 'ডকুমেন্ট', color: 'text-cyan-300 bg-cyan-950/60 border-cyan-800/50' },
    external_link: { label: 'বহিঃস্থ লিঙ্ক', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/50' },
  };
  const item = map[type] || { label: type || 'ফাইল', color: 'text-slate-300 bg-slate-800 border-slate-700' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.color}">${item.label}</span>`;
}
