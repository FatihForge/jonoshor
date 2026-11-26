'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const DICTIONARY = {
  bn: {
    siteTitle: 'জনস্বর',
    tagline: 'নথিভুক্ত করুন। যাচাই করুন। সুরক্ষা দিন। প্রকাশ করুন।',
    principles: 'অভিযোগ ≠ প্রমাণিত অপরাধ | যাচাইকৃত রিপোর্ট ≠ আইনি রায় | পরিচয় সর্বদা সুরক্ষিত',
    navHome: 'হোম',
    navReports: 'যাচাইকৃত রিপোর্ট',
    navSubmitComplaint: 'অভিযোগ দাখিল',
    navStats: 'পরিসংখ্যান',
    navJoinUs: 'যুক্ত হোন',
    navAbout: 'আমাদের লক্ষ্য',
    navLogin: 'সাইন ইন',
    navRegister: 'অ্যাকাউন্ট তৈরি',
    navDashboard: 'ড্যাশবোর্ড',
    navAdmin: 'অ্যাডমিন পোর্টাল',
    navSuperAdmin: 'সুপার অ্যাডমিন',
    navLogout: 'সাইন আউট',
    verifiedReportsTitle: 'যাচাইকৃত মানবাধিকার লঙ্ঘন ও নাগরিক অভিযোগের জনস্বার্থ রেকর্ড',
    verifiedReportsSub: 'প্রতিটি প্রকাশনা বহুস্তরীয় যাচাই, কোয়ারেন্টাইন নিরাপত্তা স্ক্যান এবং নিরপেক্ষ পর্যালোচনা সম্পন্ন।',
    anonymousNotice: 'আপনার পরিচয় সম্পূর্ণ এনক্রিপ্টেড ও সুরক্ষিত। কোনো পাবলিক রিপোর্টে অভিযোগকারীর নাম প্রকাশ করা হয় না।',
  },
  en: {
    siteTitle: 'JonoShor',
    tagline: 'Document. Verify. Protect. Inform.',
    principles: 'Complaint ≠ Proven Crime | Verified Report ≠ Legal Outcome | Identity Always Protected',
    navHome: 'Home',
    navReports: 'Verified Reports',
    navSubmitComplaint: 'Submit Complaint',
    navStats: 'Statistics',
    navJoinUs: 'Join Us',
    navAbout: 'Our Mission',
    navLogin: 'Sign In',
    navRegister: 'Register',
    navDashboard: 'Dashboard',
    navAdmin: 'Admin Portal',
    navSuperAdmin: 'Super Admin',
    navLogout: 'Sign Out',
    verifiedReportsTitle: 'Public Voice & Human Rights Verified Public Documentation',
    verifiedReportsSub: 'All reports undergo rigorous multi-stage verification, quarantine malware scanning, and legal scrutiny.',
    anonymousNotice: 'Citizen reporter identity is always protected by default. Raw complaints are never publicly published.',
  },
};

export function LanguageProvider({ children, initialLang = 'bn' }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    const saved = localStorage.getItem('jonoshor_lang');
    if (saved && (saved === 'bn' || saved === 'en')) {
      if (saved !== lang) {
        setLang(saved);
        document.documentElement.lang = saved;
      }
      document.cookie = `jonoshor_lang=${saved}; path=/; max-age=31536000; SameSite=Lax`;
    } else if (initialLang && (initialLang === 'bn' || initialLang === 'en')) {
      localStorage.setItem('jonoshor_lang', initialLang);
    }
  }, []);

  const toggleLanguage = (newLang) => {
    const target = typeof newLang === 'string' && (newLang === 'bn' || newLang === 'en')
      ? newLang
      : lang === 'bn'
      ? 'en'
      : 'bn';
    setLang(target);
    localStorage.setItem('jonoshor_lang', target);
    document.cookie = `jonoshor_lang=${target}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = target;
  };

  const t = DICTIONARY[lang] || DICTIONARY.bn;

  return (
    <LanguageContext.Provider value={{ lang, language: lang, setLang: toggleLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return { lang: 'bn', language: 'bn', t: DICTIONARY.bn, toggleLanguage: () => {} };
  }
  return context;
}
