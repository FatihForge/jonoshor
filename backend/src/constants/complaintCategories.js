// JonoShor Centralized Complaint Categories Definition
// Provides stable internal enum identifiers and canonical bilingual metadata

export const COMPLAINT_CATEGORIES = {
  ARBITRARY_ARREST_DETENTION: 'arbitrary_arrest_detention',
  ENFORCED_DISAPPEARANCE: 'enforced_disappearance',
  EXTRAJUDICIAL_KILLING: 'extrajudicial_killing',
  TORTURE_CUSTODIAL_ABUSE: 'torture_custodial_abuse',
  FREEDOM_OF_SPEECH_VIOLATION: 'freedom_of_speech_violation',
  POLICE_BRUTALITY: 'police_brutality',
  MINORITY_COMMUNAL_VIOLENCE: 'minority_communal_violence',
  LAND_GRABBING_EVICTION: 'land_grabbing_eviction',
  GENDER_BASED_VIOLENCE: 'gender_based_violence',
  CORRUPTION_EXTORTION: 'corruption_extortion',
  OTHER_CIVIL_RIGHTS_VIOLATION: 'other_civil_rights_violation',
};

export const CATEGORY_DEFINITIONS = [
  {
    id: 'arbitrary_arrest_detention',
    nameEn: 'Arbitrary Arrest & Detention',
    nameBn: 'বেআইনি গ্রেফতার ও আটক',
    legacyAliases: [
      'Unlawful Detention & Torture',
      'বেআইনি আটক ও নির্যাতন',
      'বেআইনি আটক',
      'Arbitrary Arrest & Detention',
    ],
  },
  {
    id: 'enforced_disappearance',
    nameEn: 'Enforced Disappearance',
    nameBn: 'গুম ও অপহরণ',
    legacyAliases: ['Enforced Disappearance', 'গুম ও অপহরণ'],
  },
  {
    id: 'extrajudicial_killing',
    nameEn: 'Extrajudicial Killing',
    nameBn: 'বিচারবহির্ভূত হত্যাকাণ্ড',
    legacyAliases: ['Extrajudicial Killing', 'বিচারবহির্ভূত হত্যাকাণ্ড'],
  },
  {
    id: 'torture_custodial_abuse',
    nameEn: 'Torture & Custodial Abuse',
    nameBn: 'নির্যাতন ও হেফাজতে নিপীড়ন',
    legacyAliases: [
      'Torture & Custodial Abuse',
      'Torture & Custodial Violence',
      'torture_custodial_violence',
      'নির্যাতন ও হেফাজতে নিপীড়ন',
      'হেফাজতে নির্যাতন ও অমানবিক আচরণ',
    ],
  },
  {
    id: 'freedom_of_speech_violation',
    nameEn: 'Freedom of Speech Violation',
    nameBn: 'মতপ্রকাশের স্বাধীনতায় বাধা',
    legacyAliases: [
      'Digital Security & Suppression of Speech',
      'Digital Security & Free Speech Suppression',
      'digital_security_free_speech',
      'Freedom of Speech Violation',
      'মতপ্রকাশের স্বাধীনতায় বাধা',
      'মতপ্রকাশের স্বাধীনতায় বাধা ও সাইবার দমনপীড়ন',
    ],
  },
  {
    id: 'police_brutality',
    nameEn: 'Police Brutality / Harassment',
    nameBn: 'পুলিশি নির্যাতন ও হয়রানি',
    legacyAliases: [
      'Abuse of Police or Institutional Power',
      'police_abuse_power',
      'Police Brutality / Harassment',
      'পুলিশি নির্যাতন ও হয়রানি',
      'পুলিশ বা প্রশাসনিক ক্ষমতার অপব্যবহার',
    ],
  },
  {
    id: 'minority_communal_violence',
    nameEn: 'Minority & Communal Violence',
    nameBn: 'সংখ্যালঘু ও সাম্প্রদায়িক সহিংসতা',
    legacyAliases: [
      'Persecution of Minorities & Marginalized Groups',
      'minority_persecution',
      'Minority & Communal Violence',
      'সংখ্যালঘু ও সাম্প্রদায়িক সহিংসতা',
      'সংখ্যালঘু ও প্রান্তিক জনগোষ্ঠীর ওপর নিপীড়ন',
    ],
  },
  {
    id: 'land_grabbing_eviction',
    nameEn: 'Land Grabbing & Eviction',
    nameBn: 'জমি দখল ও জোরপূর্বক উচ্ছেদ',
    legacyAliases: [
      'Land Grabbing & Coercion',
      'land_grabbing_coercion',
      'Land Grabbing & Eviction',
      'জমি দখল ও জোরপূর্বক উচ্ছেদ',
      'জমি দখল, উচ্ছেদ ও জোরজবরদস্তি',
    ],
  },
  {
    id: 'gender_based_violence',
    nameEn: 'Gender-Based Violence',
    nameBn: 'জেন্ডার ভিত্তিক সহিংসতা',
    legacyAliases: ['Gender-Based Violence', 'জেন্ডার ভিত্তিক সহিংসতা'],
  },
  {
    id: 'labor_rights_violation',
    nameEn: 'Labor Rights Violation',
    nameBn: 'শ্রম অধিকার লঙ্ঘন ও শোষণ',
    legacyAliases: ['Labor Rights Violation', 'labor_rights_violation', 'শ্রম অধিকার লঙ্ঘন ও শোষণ'],
  },
  {
    id: 'corruption_extortion',
    nameEn: 'Corruption & Extortion',
    nameBn: 'দুর্নীতি ও চাঁদাবাজি',
    legacyAliases: ['Corruption & Extortion', 'corruption_extortion', 'দুর্নীতি ও চাঁদাবাজি'],
  },
  {
    id: 'other_civil_rights_violation',
    nameEn: 'Other Civil Rights Violation',
    nameBn: 'অন্যান্য নাগরিক অধিকার লঙ্ঘন',
    legacyAliases: [
      'Other Human Rights Violations',
      'other_human_rights_violations',
      'Other Civil Rights Violation',
      'অন্যান্য মানবাধিকার লঙ্ঘন',
      'অন্যান্য নাগরিক অধিকার লঙ্ঘন',
    ],
  },
];

/**
 * Resolve any input category string (slug, English, or Bangla) to canonical definition
 * @param {string} input
 * @returns {typeof CATEGORY_DEFINITIONS[0] | null}
 */
export function findCategoryDefinition(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim().toLowerCase();

  for (const def of CATEGORY_DEFINITIONS) {
    if (def.id.toLowerCase() === trimmed) return def;
    if (def.nameEn.toLowerCase() === trimmed) return def;
    if (def.nameBn.trim() === input.trim()) return def;
    if (def.legacyAliases.some((alias) => alias.toLowerCase() === trimmed || alias === input.trim())) {
      return def;
    }
  }

  return null;
}

/**
 * Check if a category string is valid
 * @param {string} input
 * @returns {boolean}
 */
export function isValidCategory(input) {
  return findCategoryDefinition(input) !== null;
}

/**
 * Normalize any category string to its stable internal key
 * @param {string} input
 * @returns {string}
 */
export function normalizeCategoryKey(input) {
  const def = findCategoryDefinition(input);
  return def ? def.id : input;
}
