// Validation script for i18n translation coverage and fallback safety
import { translations } from './src/i18n/translations.js';
import { t, isBangla, formatNumber, translateCategory, translateCaseStatus } from './src/i18n/index.js';

let errors = 0;
let totalKeys = 0;

function checkObject(obj, prefix = '') {
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !('en' in val) && !('bn' in val)) {
      checkObject(val, fullKey);
    } else if (val && typeof val === 'object') {
      totalKeys++;
      if (typeof val.en !== 'string' || val.en.trim() === '') {
        console.error(`❌ [Missing English]: ${fullKey}`);
        errors++;
      }
      if (typeof val.bn !== 'string' || val.bn.trim() === '') {
        console.error(`❌ [Missing Bangla]: ${fullKey}`);
        errors++;
      }
    } else {
      console.error(`❌ [Invalid Structure]: ${fullKey} is not a bilingual object`);
      errors++;
    }
  }
}

console.log('--- Checking Bilingual Dictionary Coverage ---');
checkObject(translations);
console.log(`Audited ${totalKeys} translation keys across all categories.`);

if (errors > 0) {
  console.error(`Found ${errors} translation key issues!`);
  process.exit(1);
} else {
  console.log('✅ All keys have complete and valid [en] and [bn] translations!');
}

console.log('\n--- Checking Fallback Safety ---');
// 1. Missing key fallback
const fallback1 = t('non_existent.nested.key');
if (fallback1 !== 'key') {
  console.error(`Fallback failed for nonexistent key, got: ${fallback1}`);
  process.exit(1);
}
console.log(`✅ Safe fallback for missing key: "${fallback1}"`);

// 2. Bangla number formatting
const bnNum = formatNumber(12345, 'bn');
if (bnNum !== '১২৩৪৫') {
  console.error(`Bengali number formatting failed: ${bnNum}`);
  process.exit(1);
}
console.log(`✅ Bengali number formatting: 12345 -> ${bnNum}`);

const enNum = formatNumber(12345, 'en');
if (enNum !== '12345') {
  console.error(`English number formatting failed: ${enNum}`);
  process.exit(1);
}
console.log(`✅ English number formatting: 12345 -> ${enNum}`);

// 3. Category translation helper
const catBn = translateCategory('Arbitrary Arrest & Detention', 'bn');
if (catBn !== 'বেআইনি গ্রেফতার ও আটক') {
  console.error(`Category translation failed: ${catBn}`);
  process.exit(1);
}
console.log(`✅ Category translation: "Arbitrary Arrest & Detention" -> "${catBn}"`);

// 4. Case status translation helper
const statusBn = translateCaseStatus('under_investigation', 'bn');
if (statusBn !== 'তদন্তাধীন') {
  console.error(`Case status translation failed: ${statusBn}`);
  process.exit(1);
}
console.log(`✅ Case status translation: "under_investigation" -> "${statusBn}"`);

console.log('\n🎉 ALL I18N TESTS PASSED SUCCESSFULLY!');
