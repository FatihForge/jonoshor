// Language Detection & Localization State Manager
import { translations } from './translations.js';

const STORAGE_KEY = 'jonoshor_lang';

/**
 * Detect default language based on user preference, location, and environment signals
 * @param {Object} user - Logged in user profile (optional)
 * @returns {'bn' | 'en'}
 */
export function detectLanguage(user = null) {
  // 1. Explicit user-selected language in localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'bn') {
      return saved;
    }
  } catch (_e) {
    void _e;
  }

  // 2. Existing saved user profile preference
  if (user?.languagePreference === 'en' || user?.languagePreference === 'bn') {
    return user.languagePreference;
  }

  // 3. Bangladesh environmental & geolocation signals:
  // Check timezone: Asia/Dhaka
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone === 'Asia/Dhaka') {
      return 'bn';
    }
  } catch (_e) {
    void _e;
  }

  // Check browser language signals: bn, bn-BD, bn-IN
  try {
    const nav = typeof window !== 'undefined' ? window.navigator : (typeof globalThis !== 'undefined' ? globalThis.navigator : null);
    if (nav) {
      const navLangs = nav.languages || [nav.language || ''];
      const isBengali = navLangs.some((lang) => {
        const lower = String(lang).toLowerCase();
        return lower.startsWith('bn') || lower.includes('bangla') || lower.includes('bengali');
      });
      if (isBengali) {
        return 'bn';
      }
    }
  } catch (_e) {
    void _e;
  }

  // 4. Fallback for international visitors outside Bangladesh
  return 'en';
}

/**
 * Check whether user has an explicit saved language preference in localStorage
 * @returns {boolean}
 */
export function hasExplicitSelection() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'bn';
  } catch (_e) {
    void _e;
    return false;
  }
}

let currentLanguage = detectLanguage();

/**
 * Get currently active language code ('bn' or 'en')
 * @returns {'bn' | 'en'}
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * Check if the active language is Bangla
 * @returns {boolean}
 */
export function isBangla() {
  return currentLanguage === 'bn';
}

/**
 * Set active language explicitly, optionally persist choice, and notify listeners
 * @param {'bn' | 'en'} lang
 * @param {boolean} persist - Whether to persist to localStorage (default true)
 */
export function setLanguage(lang, persist = true) {
  if (lang !== 'en' && lang !== 'bn') return;
  const changed = currentLanguage !== lang;
  currentLanguage = lang;

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_e) {
      void _e;
    }
  }

  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
  }

  if (changed && typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
    window.dispatchEvent(new window.CustomEvent('languageChanged', { detail: { language: lang } }));
  }
}

/**
 * Retrieve translation for a key path like 'nav.home' or 'common.save'
 * @param {string} path - Dot-separated path (e.g. 'nav.home')
 * @param {string|Object} fallback - Optional fallback text or params object
 * @param {Object} [params] - Optional interpolation params e.g. { count: 5 }
 * @returns {string}
 */
export function t(path, fallback = '', params = null) {
  let interpolationParams = params;
  let fallbackText = fallback;

  if (typeof fallback === 'object' && fallback !== null) {
    interpolationParams = fallback;
    fallbackText = '';
  }

  const parts = path.split('.');
  let node = translations;
  for (const part of parts) {
    if (node && typeof node === 'object' && part in node) {
      node = node[part];
    } else {
      node = null;
      break;
    }
  }

  let text = '';
  if (node && typeof node === 'object') {
    text = node[currentLanguage] || node.en || node.bn || fallbackText;
    if (!text) {
      const leaf = parts[parts.length - 1] || path;
      text = leaf.replace(/_/g, ' ');
    }
  } else if (typeof node === 'string') {
    text = node;
  } else {
    if (fallbackText) {
      text = fallbackText;
    } else {
      const leaf = parts[parts.length - 1] || path;
      text = leaf.replace(/_/g, ' ');
    }
  }

  if (interpolationParams && typeof interpolationParams === 'object') {
    for (const [key, val] of Object.entries(interpolationParams)) {
      text = text.replaceAll(`{${key}}`, String(val));
    }
  }

  return text;
}

/**
 * Translate complaint violation category name
 * @param {string} category
 * @param {string} [targetLang]
 * @returns {string}
 */
export function translateCategory(category, targetLang = currentLanguage) {
  if (!category) return '';
  const lang = targetLang || currentLanguage;
  const item = translations.categories?.[category];
  if (item) {
    return item[lang] || item.en || category;
  }
  return category;
}

/**
 * Translate case legal status
 * @param {string} status
 * @param {string} [targetLang]
 * @returns {string}
 */
export function translateCaseStatus(status, targetLang = currentLanguage) {
  if (!status) return t('common.unspecified');
  const lang = targetLang || currentLanguage;
  const item = translations.case_statuses?.[status];
  if (item) {
    return item[lang] || item.en || status;
  }
  return status;
}

/**
 * Translate complaint workflow status
 * @param {string} status
 * @param {string} [targetLang]
 * @returns {string}
 */
export function translateComplaintStatus(status, targetLang = currentLanguage) {
  if (!status) return '';
  const lang = targetLang || currentLanguage;
  const item = translations.complaint_statuses?.[status];
  if (item) {
    return item[lang] || item.en || status;
  }
  return status;
}

/**
 * Localize numbers in Bangla (e.g. 123 -> ১২৩)
 * @param {number|string} num
 * @param {string} [targetLang]
 * @returns {string}
 */
export function formatNumber(num, targetLang = currentLanguage) {
  if (num === null || num === undefined) return '';
  const str = String(num);
  const lang = targetLang || currentLanguage;
  if (lang !== 'bn') return str;
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[0-9]/g, (d) => bnDigits[Number(d)] || d);
}

// Initial sync with document HTML tag
if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLanguage;
}

// Multi-Tab Synchronization Listener
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && (event.newValue === 'en' || event.newValue === 'bn')) {
      if (event.newValue !== currentLanguage) {
        setLanguage(event.newValue, false);
      }
    }
  });
}
