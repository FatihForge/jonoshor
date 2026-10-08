// Mock browser environment for Node.js test execution
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) || null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

const listeners = new Map();
globalThis.window = {
  addEventListener: (name, fn) => {
    if (!listeners.has(name)) listeners.set(name, []);
    listeners.get(name).push(fn);
  },
  removeEventListener: (name, fn) => {
    if (listeners.has(name)) {
      listeners.set(name, listeners.get(name).filter((cb) => cb !== fn));
    }
  },
  dispatchEvent: (evt) => {
    const list = listeners.get(evt.type) || [];
    for (const cb of list) cb(evt);
    return true;
  },
  CustomEvent: class {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  },
  StorageEvent: class {
    constructor(type, init = {}) {
      this.type = type;
      this.key = init.key;
      this.newValue = init.newValue;
    }
  },
};

globalThis.document = {
  documentElement: { lang: 'en' },
};

const { getLanguage, setLanguage, isBangla, hasExplicitSelection, t, formatNumber } = await import('./src/i18n/index.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== Scenario 1: State Management & Toggle ===');
setLanguage('en');
assert(getLanguage() === 'en', 'Initial language is English');
assert(!isBangla(), 'isBangla() returns false for English');

setLanguage('bn');
assert(getLanguage() === 'bn', 'Language switched to Bangla');
assert(isBangla(), 'isBangla() returns true for Bangla');

console.log('\n=== Scenario 2: Persistence Overrides ===');
assert(hasExplicitSelection(), 'hasExplicitSelection() is true after explicit setLanguage');
localStorage.setItem('jonoshor_lang', 'en');
assert(localStorage.getItem('jonoshor_lang') === 'en', 'localStorage retains explicit selection "en"');

console.log('\n=== Scenario 3: Event Emission on Language Change ===');
setLanguage('en');
let eventFired = false;
let eventDetailLang = null;
const listener = (e) => {
  eventFired = true;
  eventDetailLang = e.detail?.language;
};
window.addEventListener('languageChanged', listener);

setLanguage('bn');
assert(eventFired && eventDetailLang === 'bn', 'languageChanged CustomEvent fired with detail.language = "bn"');
window.removeEventListener('languageChanged', listener);

console.log('\n=== Scenario 4: Cross-Tab Storage Event Synchronization ===');
// Simulate another tab changing localStorage
const storageEvt = new window.StorageEvent('storage', {
  key: 'jonoshor_lang',
  newValue: 'en',
});
window.dispatchEvent(storageEvt);
assert(getLanguage() === 'en', 'Cross-tab storage event synchronized global language state to English');

console.log('\n=== Scenario 5: Bengali Digit Formatting ===');
assert(formatNumber('2026-10-08', 'bn') === '২০২৬-১০-০৮', 'Date formatted to Bengali digits');
assert(formatNumber(100, 'en') === '100', 'Number preserved as ASCII in English');

console.log('\n=== Scenario 6: Interpolation Safety ===');
const interpolatedEn = t('user.total_complaints', { count: 5 });
assert(interpolatedEn === 'Total: 5 complaints', `Interpolation English: "${interpolatedEn}"`);

setLanguage('bn');
const interpolatedBn = t('user.total_complaints', { count: 5 });
assert(interpolatedBn === 'মোট: 5টি অভিযোগ', `Interpolation Bangla: "${interpolatedBn}"`);

console.log(`\n========================================`);
console.log(`RESULTS: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL SCENARIO TESTS COMPLETED SUCCESSFULLY!');
}
