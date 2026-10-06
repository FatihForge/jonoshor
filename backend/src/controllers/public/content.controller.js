import { sendSuccess } from '../../utils/response.js';

const CMS_CONTENT = {
  about: {
    slug: 'about',
    bn: {
      title: 'জনস্বর (JonoShor) সম্পর্কে',
      content: 'জনস্বর হলো মানবাধিকার লঙ্ঘন, নির্যাতন ও বৈষম্যের ঘটনা নিরাপদ ও দায়িত্বশীলভাবে নথিভুক্ত করার স্বাধীন নাগরিক প্ল্যাটফর্ম।',
    },
    en: {
      title: 'About JonoShor',
      content: 'JonoShor is an independent citizen platform dedicated to safely and responsibly documenting human rights violations, abuse, and discrimination.',
    },
  },
  mission: {
    slug: 'mission',
    bn: {
      title: 'আমাদের লক্ষ্য ও উদ্দেশ্য',
      content: 'সত্যের নির্ভরযোগ্য সংরক্ষণ, ক্ষতিগ্রস্তদের মর্যাদা রক্ষা এবং সমাজে ন্যায়বিচার ও স্বচ্ছতা নিশ্চিত করা।',
    },
    en: {
      title: 'Our Mission & Vision',
      content: 'Reliable preservation of truth, protection of victim dignity, and advancing justice and accountability.',
    },
  },
  'how-it-works': {
    slug: 'how-it-works',
    bn: {
      title: 'জনস্বর কীভাবে কাজ করে',
      content: 'অভিযোগ দাখিল → স্ক্রিনিং ও গোপনীয়তা নিশ্চিতকরণ → পেশাদার প্রমাণ যাচাই → আইনি ট্র্যাকিং → জনস্বার্থে নিরাপদ প্রকাশনা।',
    },
    en: {
      title: 'How It Works',
      content: 'Complaint Submission → Screening & Confidentiality → Rigorous Evidence Verification → Legal Tracking → Safe Public Disclosure.',
    },
  },
  safety: {
    slug: 'safety',
    bn: {
      title: 'নিরাপত্তা ও গোপনীয়তা নির্দেশিকা',
      content: 'অভিযোগকারীর পরিচয় সুরক্ষিত রাখা হয়। সংবেদনশীল তথ্য যাচাই ও পর্যালোচনা ছাড়া কখনো জনসমক্ষে প্রকাশ করা হয় না।',
    },
    en: {
      title: 'Safety & Privacy Guidelines',
      content: 'Reporter identities are strictly shielded. Sensitive details are never made public without explicit screening and redaction.',
    },
  },
  terms: {
    slug: 'terms',
    bn: {
      title: 'ব্যবহারের শর্তাবলী',
      content: 'জনস্বর ব্যবহারের শর্তাবলী ও দায়িত্বশীল তথ্য প্রকাশের অঙ্গীকার।',
    },
    en: {
      title: 'Terms of Service',
      content: 'Terms and conditions governing the responsible use and reporting on JonoShor.',
    },
  },
  privacy: {
    slug: 'privacy',
    bn: {
      title: 'গোপনীয়তা নীতি',
      content: 'জনস্বর কোন তথ্য সংরক্ষণ করে এবং কীভাবে তা সুরক্ষিত রাখে তার পূর্ণাঙ্গ বিবরণ।',
    },
    en: {
      title: 'Privacy Policy',
      content: 'Comprehensive overview of data handling, protection measures, and privacy standards at JonoShor.',
    },
  },
};

const FAQS = [
  {
    id: 'faq_1',
    bn: {
      question: 'জনস্বরে অভিযোগ দাখিল করতে কি একাউন্ট তৈরি বাধ্যতামূলক?',
      answer: 'না। যে কেউ অতিথি হিসেবে সর্বোচ্চ ৫টি পর্যন্ত অভিযোগ দাখিল করতে পারেন। অতিরিক্ত সুরক্ষার জন্য নিবন্ধিত একাউন্ট বাঞ্ছনীয়।',
    },
    en: {
      question: 'Is an account mandatory to submit a complaint?',
      answer: 'No. Visitors can submit up to 5 complaints without an account. An account is recommended for ongoing case management.',
    },
  },
  {
    id: 'faq_2',
    bn: {
      question: 'আমার প্রমাণাদি কি সরাসরি জনসমক্ষে চলে যাবে?',
      answer: 'কখনোই নয়। সমস্ত প্রমাণাদি সুরক্ষিত কোয়ারেন্টিনে রাখা হয় এবং স্বাধীন পর্যালোচকদের অনুমোদন ও সুরক্ষামূলক সংস্করণ ছাড়া প্রকাশ করা হয় না।',
    },
    en: {
      question: 'Will my uploaded evidence become public immediately?',
      answer: 'Never. All evidence is held in private quarantined storage and only approved, redacted versions may be made public.',
    },
  },
  {
    id: 'faq_3',
    bn: {
      question: 'পাবলিক রিপোর্টে কি অভিযোগকারীর নাম প্রকাশিত হয়?',
      answer: 'না। অভিযোগকারীর পরিচয় বা রিপোর্টার আইডি কখনো পাবলিক রিপোর্টে দেখানো হয় না।',
    },
    en: {
      question: 'Are reporter names shown on public reports?',
      answer: 'No. Reporter identities and internal IDs are strictly kept private from public reports.',
    },
  },
];

export const publicContentController = {
  getContent(req, res) {
    const { slug } = req.params;
    const item = CMS_CONTENT[slug] || {
      slug,
      bn: { title: slug, content: 'বিষয়বস্তু শীঘ্রই প্রকাশিত হবে।' },
      en: { title: slug, content: 'Content coming soon.' },
    };
    sendSuccess(res, 200, item);
  },

  getAnnouncements(_req, res) {
    sendSuccess(res, 200, [
      {
        id: 'announcement_1',
        title: 'জনস্বর প্ল্যাটফর্মের অফিসিয়াল উন্মোচন',
        date: new Date(),
        content: 'ন্যায্যতা, মানবাধিকার সুরক্ষা ও নির্ভুল তথ্য নথিকরণের জন্য জনস্বর কার্যক্রম শুরু করেছে।',
      },
    ]);
  },

  getFaqs(_req, res) {
    sendSuccess(res, 200, FAQS);
  },
};
