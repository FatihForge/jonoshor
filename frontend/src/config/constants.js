export const API_BASE = '/api/v1';

export const COMPLAINT_CATEGORIES = [
  'Unlawful Detention & Torture',
  'Extrajudicial Killing',
  'Enforced Disappearance',
  'Digital Security & Suppression of Speech',
  'Abuse of Police or Institutional Power',
  'Persecution of Minorities & Marginalized Groups',
  'Land Grabbing & Coercion',
  'Labor Rights Violation',
  'Other Human Rights Violations',
];

export const STATUS_LABELS = {
  draft: { en: 'Draft', bn: 'খসড়া (অপ্রকাশিত)', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  submitted: { en: 'Submitted', bn: 'জমা হয়েছে', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  screening: { en: 'Screening', bn: 'প্রাথমিক যাচাই', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  needs_information: { en: 'Needs Information', bn: 'অতিরিক্ত তথ্য প্রয়োজন', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  evidence_review: { en: 'Evidence Review', bn: 'প্রমাণ পর্যালোচনা', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  verification: { en: 'Under Verification', bn: 'সরেজমিন যাচাই', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  verified: { en: 'Verified', bn: 'যাচাইকৃত', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  published: { en: 'Published Report', bn: 'প্রকাশিত রিপোর্ট', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  rejected: { en: 'Rejected', bn: 'অননুমোদিত', color: 'bg-red-50 text-red-800 border-red-200' },
  withdrawn: { en: 'Withdrawn', bn: 'প্রত্যাহারকৃত', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  closed: { en: 'Closed', bn: 'নিষ্পন্ন', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};
