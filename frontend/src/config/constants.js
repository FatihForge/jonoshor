export const API_BASE = '/api/v1';

export const COMPLAINT_CATEGORIES = [
  'arbitrary_arrest_detention',
  'enforced_disappearance',
  'extrajudicial_killing',
  'torture_custodial_violence',
  'digital_security_free_speech',
  'police_abuse_power',
  'minority_persecution',
  'land_grabbing_coercion',
  'labor_rights_violation',
  'corruption_extortion',
  'other_human_rights_violations',
];

export const CATEGORY_DEFINITIONS = [
  { key: 'arbitrary_arrest_detention', bn: 'বেআইনি বা অযৌক্তিক আটক ও হয়রানি', en: 'Arbitrary Arrest & Detention' },
  { key: 'enforced_disappearance', bn: 'গুম বা বলপ্রয়োগপূর্বক অন্তর্ধান', en: 'Enforced Disappearance' },
  { key: 'extrajudicial_killing', bn: 'বিচারবহির্ভূত হত্যাকাণ্ড', en: 'Extrajudicial Killing' },
  { key: 'torture_custodial_violence', bn: 'হেফাজতে নির্যাতন ও অমানবিক আচরণ', en: 'Torture & Custodial Violence' },
  { key: 'digital_security_free_speech', bn: 'মতপ্রকাশের স্বাধীনতায় বাধা ও সাইবার দমনপীড়ন', en: 'Digital Security & Free Speech Suppression' },
  { key: 'police_abuse_power', bn: 'পুলিশ বা প্রশাসনিক ক্ষমতার অপব্যবহার', en: 'Abuse of Police or Institutional Power' },
  { key: 'minority_persecution', bn: 'সংখ্যালঘু ও প্রান্তিক জনগোষ্ঠীর ওপর নিপীড়ন', en: 'Persecution of Minorities & Marginalized Groups' },
  { key: 'land_grabbing_coercion', bn: 'জমি দখল, উচ্ছেদ ও জোরজবরদস্তি', en: 'Land Grabbing & Coercion' },
  { key: 'labor_rights_violation', bn: 'শ্রম অধিকার লঙ্ঘন ও শোষণ', en: 'Labor Rights Violation' },
  { key: 'corruption_extortion', bn: 'দুর্নীতি ও চাঁদাবাজি', en: 'Corruption & Extortion' },
  { key: 'other_human_rights_violations', bn: 'অন্যান্য মানবাধিকার লঙ্ঘন', en: 'Other Human Rights Violations' },
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
