export const API_BASE = '/api/v1';

export const COMPLAINT_CATEGORIES = [
  'বেআইনি আটক ও নির্যাতন',
  'বিচারবহির্ভূত হত্যাকাণ্ড',
  'গুম ও নিখোঁজ',
  'ডিজিটাল নিরাপত্তা ও মতপ্রকাশে বাধা',
  'পুলিশি বা প্রাতিষ্ঠানিক ক্ষমতার অপব্যবহার',
  'সংখ্যালঘু ও অনগ্রসর জনগোষ্ঠীর ওপর নিপীড়ন',
  'ভূমি দখল ও বলপ্রয়োগ',
  'শ্রম অধিকার লঙ্ঘন',
  'অন্যান্য মানবাধিকার লঙ্ঘন',
];

export const STATUS_LABELS = {
  draft: { bn: 'খসড়া (অপ্রকাশিত)', color: 'bg-amber-950/70 text-amber-300 border-amber-700/60' },
  submitted: { bn: 'জমা হয়েছে', color: 'bg-blue-900/60 text-blue-300 border-blue-700' },
  screening: { bn: 'প্রাথমিক যাচাই', color: 'bg-yellow-900/60 text-yellow-300 border-yellow-700' },
  needs_information: { bn: 'অতিরিক্ত তথ্য প্রয়োজন', color: 'bg-orange-900/60 text-orange-300 border-orange-700' },
  evidence_review: { bn: 'প্রমাণ পর্যালোচনা', color: 'bg-purple-900/60 text-purple-300 border-purple-700' },
  verification: { bn: 'সরেজমিন যাচাই', color: 'bg-indigo-900/60 text-indigo-300 border-indigo-700' },
  verified: { bn: 'যাচাইকৃত', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-700' },
  published: { bn: 'প্রকাশিত রিপোর্ট', color: 'bg-emerald-800 text-white border-emerald-600' },
  rejected: { bn: 'অননুমোদিত', color: 'bg-red-900/60 text-red-300 border-red-700' },
  withdrawn: { bn: 'প্রত্যাহারকৃত', color: 'bg-slate-800 text-slate-400 border-slate-700' },
  closed: { bn: 'নিষ্পন্ন', color: 'bg-slate-800 text-slate-300 border-slate-700' },
};
