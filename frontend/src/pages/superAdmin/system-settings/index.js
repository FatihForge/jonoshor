import { superAdminService } from '../../../services/superAdmin/superAdminService.js';
import { renderSuperAdminNav } from '../../../components/superAdmin/SuperAdminNav.js';
import { formatDateTime } from '../../../utils/formatters.js';
import { showModal } from '../../../components/admin/ActionModal.js';
import { showReAuthModal } from '../../../components/superAdmin/ReAuthModal.js';

// Setting metadata mapping for rich UX labels and descriptions
const SETTING_META = {
  platform_name: {
    label: 'প্ল্যাটফর্মের নাম (Platform Name)',
    description: 'নাগরিক ও জনসাধারণের দৃশ্যমান মূল প্ল্যাটফর্ম টাইটেল',
    type: 'string',
  },
  organization_legal_name: {
    label: 'আইনি সত্ত্বার নাম (Organization Legal Name)',
    description: 'ট্রাস্ট ও নাগরিক উদ্যোগের অফিশিয়াল রেজিস্টার্ড নাম',
    type: 'string',
  },
  support_email: {
    label: 'প্রাতিষ্ঠানিক সাপোর্ট ইমেল (Support Email)',
    description: 'ব্যবহারকারী সহায়তা ও সাধারণ যোগাযোগের অফিসিয়াল ইমেল',
    type: 'string',
  },
  allow_user_registration: {
    label: 'নাগরিক স্ব-নিবন্ধন অনুমোদন (Allow User Registration)',
    description: 'সাধারণ নাগরিকদের নতুন অ্যাকাউন্ট খোলার অনুমতি সক্রিয়/নিষ্ক্রিয়',
    type: 'boolean',
  },
  maintenance_mode: {
    label: 'রক্ষণাবেক্ষণ মোড (Maintenance Mode)',
    description: 'প্ল্যাটফর্ম সাময়িক বন্ধ করে রক্ষণাবেক্ষণ বার্তা প্রদর্শন (জরুরি অবস্থা ব্যতীত ব্যবহার অনুচিত)',
    type: 'boolean',
    warning: true,
  },
  enforce_2fa_for_admins: {
    label: 'অ্যাডমিনদের জন্য বাধ্যতামূলক 2FA (Enforce 2FA for Admins)',
    description: 'সকল অ্যাডমিনিস্ট্রেটরের লগইনের জন্য ২-ফ্যাক্টর প্রমাণীকরণ বাধ্যতামূলক করা',
    type: 'boolean',
  },
  session_inactivity_timeout_minutes: {
    label: 'সেশন নিষ্ক্রিয়তার সময়সীমা (Session Timeout - Minutes)',
    description: 'ব্যবহারকারী কোনো কার্যকলাপ না করলে স্বয়ংক্রিয় লগআউট সময়',
    type: 'number',
    min: 5,
    max: 1440,
  },
  max_failed_login_attempts: {
    label: 'সর্বোচ্চ ব্যর্থ লগইন প্রচেষ্টা (Max Failed Logins)',
    description: 'অ্যাকাউন্ট সাময়িক লক করার পূর্বে অনুমোদিত ভুল পাসওয়ার্ড প্রচেষ্টা',
    type: 'number',
    min: 3,
    max: 20,
  },
  rate_limiting_enabled: {
    label: 'এপিআই রেট লিমিটিং (API Rate Limiting)',
    description: 'ব্রুট-ফোর্স ও ডিডিওএস প্রতিরোধক স্বয়ংক্রিয় রিকোয়েস্ট থ্রোটলিং',
    type: 'boolean',
  },
  anonymous_submission_allowed: {
    label: 'বেনামী অভিযোগ গ্রহণ (Allow Anonymous Complaints)',
    description: 'নাগরিকদের পরিচয় গোপন রেখে সরাসরি অভিযোগ দাখিলের সুযোগ প্রদান',
    type: 'boolean',
  },
  max_evidence_files_per_complaint: {
    label: 'অভিযোগ প্রতি সর্বোচ্চ ফাইল (Max Files Per Complaint)',
    description: 'একটি একক অভিযোগে সর্বোচ্চ কতটি প্রমাণ সংযুক্ত করা যাবে',
    type: 'number',
    min: 1,
    max: 50,
  },
  max_file_size_mb: {
    label: 'ফাইলের সর্বোচ্চ আকার (Max File Size - MB)',
    description: 'প্রতিটি প্রমাণ ফাইলের অনুমোদিত সর্বোচ্চ সাইজ (মেগাবাইট)',
    type: 'number',
    min: 1,
    max: 100,
  },
  require_admin_verification_before_publish: {
    label: 'প্রকাশের পূর্বে অ্যাডমিন ভেরিফিকেশন (Require Verification)',
    description: 'পাবলিক ডিসক্লোজার তৈরির পূর্বে বাধ্যতামূলক প্রশাসনিক অনুমোদন',
    type: 'boolean',
  },
};

const CATEGORY_NAMES = {
  general: {
    title: '🌐 সাধারণ প্ল্যাটফর্ম সেটিংস (General Platform Settings)',
    subtitle: 'প্ল্যাটফর্মের নাম, প্রাতিষ্ঠানিক তথ্য এবং প্রাথমিক পরিচালনা কনফিগারেশন',
    badgeClass: 'bg-blue-950 text-blue-300 border-blue-800',
  },
  security: {
    title: '🛡️ নিরাপত্তা ও অ্যাক্সেস কন্ট্রোল (Security & Access Control)',
    subtitle: 'অ্যাডমিন ও ব্যবহারকারীদের নিরাপত্তা নীতি, ২-ফ্যাক্টর বাধ্যবাধকতা ও সেশন পলিসি',
    badgeClass: 'bg-purple-950 text-purple-300 border-purple-800',
  },
  complaint: {
    title: '📋 অভিযোগ ও প্রমাণ যাচাই সেটিংস (Complaint & Verification)',
    subtitle: 'অভিযোগ গ্রহণের নিয়মাবলী, আপলোড সীমাবদ্ধতা ও ভেরিফিকেশন প্যারামিটার',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  },
};

export async function renderSuperAdminSystemSettingsPage(container) {
  let settingsList = [];
  let isLoading = true;
  let errorMessage = null;
  let successMessage = null;

  function render() {
    container.innerHTML = `
      <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        ${renderSuperAdminNav('system-settings')}

        <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <!-- Page Header -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-xl shadow-lg">
                  ⚙️
                </div>
                <div>
                  <h1 class="text-2xl font-bold text-white tracking-tight">সিস্টেম কনফিগারেশন সেটিংস</h1>
                  <p class="text-xs text-slate-400 mt-0.5">
                    জনস্বর প্ল্যাটফর্মের অপারেশনাল, নিরাপত্তা ও অভিযোগ প্রসেসিং প্যারামিটার পরিচালনা
                  </p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button id="refresh-settings-btn" class="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-2 shadow-sm">
                <svg class="w-4 h-4 ${isLoading ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>রিফ্রেশ</span>
              </button>
            </div>
          </div>

          <!-- Alert Banners -->
          ${
            successMessage
              ? `
            <div class="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fade-in">
              <div class="flex items-center gap-2.5">
                <span class="text-base">✓</span>
                <span>${successMessage}</span>
              </div>
              <button id="dismiss-success-btn" class="text-emerald-400 hover:text-emerald-200">✕</button>
            </div>
          `
              : ''
          }

          ${
            errorMessage
              ? `
            <div class="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center justify-between gap-3 animate-fade-in">
              <div class="flex items-center gap-2.5">
                <span class="text-base">⚠️</span>
                <span>${errorMessage}</span>
              </div>
              <button id="dismiss-error-btn" class="text-red-400 hover:text-red-200">✕</button>
            </div>
          `
              : ''
          }

          <!-- Security Policy Banner -->
          <div class="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-200 text-xs flex items-start gap-3">
            <span class="text-lg mt-0.5">🔐</span>
            <div>
              <p class="font-bold text-purple-100">উচ্চ-নিরাপত্তা প্রশাসনিক কার্যবিধি (Section 71 Policy):</p>
              <p class="text-purple-300/80 mt-0.5 leading-relaxed">
                সিস্টেমের যেকোনো গুরুত্বপূর্ণ কনফিগারেশন পরিবর্তনের জন্য সুপার অ্যাডমিনের পাসওয়ার্ড ও ২-ফ্যাক্টর প্রমাণীকরণ (TOTP কোড) বাধ্যতামূলক। সকল পরিবর্তন অপরিবর্তনযোগ্য অডিট লগে বিস্তারিত সংরক্ষিত হয়।
              </p>
            </div>
          </div>

          <!-- Content Area -->
          ${
            isLoading
              ? `
            <div class="py-24 text-center space-y-4">
              <div class="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p class="text-xs text-slate-400">সিস্টেম কনফিগারেশন লোড হচ্ছে...</p>
            </div>
          `
              : renderSettingsCategories()
          }
        </main>
      </div>
    `;

    attachEvents();
  }

  function renderSettingsCategories() {
    const categories = ['general', 'security', 'complaint'];

    return `
      <div class="space-y-8">
        ${categories
          .map((catKey) => {
            const catMeta = CATEGORY_NAMES[catKey] || {
              title: catKey.toUpperCase(),
              subtitle: 'কনফিগারেশন সেটিংস',
              badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
            };

            const catSettings = settingsList.filter((s) => s.category === catKey);

            return `
            <div class="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div class="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 class="text-base font-bold text-white">${catMeta.title}</h2>
                  <p class="text-xs text-slate-400 mt-0.5">${catMeta.subtitle}</p>
                </div>
                <span class="text-[11px] font-mono px-2.5 py-1 rounded-full border ${catMeta.badgeClass} font-semibold">
                  ${catSettings.length} সেটিংস
                </span>
              </div>

              <div class="divide-y divide-slate-800/80">
                ${
                  catSettings.length === 0
                    ? `
                  <div class="p-6 text-center text-xs text-slate-500">
                    এই ক্যাটাগরিতে কোনো কনফিগারেশন প্যারামিটার পাওয়া যায়নি।
                  </div>
                `
                    : catSettings.map((s) => renderSettingRow(s)).join('')
                }
              </div>
            </div>
          `;
          })
          .join('')}
      </div>
    `;
  }

  function renderSettingRow(setting) {
    const meta = SETTING_META[setting.key] || {
      label: setting.key,
      description: 'সিস্টেম প্যারামিটার',
      type: typeof setting.value === 'boolean' ? 'boolean' : typeof setting.value === 'number' ? 'number' : 'string',
    };

    const isBool = meta.type === 'boolean' || typeof setting.value === 'boolean';
    const isNum = meta.type === 'number' || typeof setting.value === 'number';

    return `
      <div class="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-800/20 transition group" data-setting-key="${setting.key}">
        <div class="max-w-xl space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-white">${meta.label}</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
              ${setting.key}
            </span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-semibold">
              v${setting.version || 1}
            </span>
            ${
              meta.warning && setting.value === true
                ? `
              <span class="text-[10px] px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-300 font-bold animate-pulse">
                সতর্কতা: সক্রিয়
              </span>
            `
                : ''
            }
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">${meta.description}</p>
          <div class="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
            <span>সর্বশেষ পরিবর্তন: ${formatDateTime(setting.updatedAt)}</span>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          ${
            isBool
              ? `
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="input-${setting.key}" class="sr-only peer" ${setting.value ? 'checked' : ''} />
              <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              <span id="label-${setting.key}" class="ml-3 text-xs font-mono font-medium ${setting.value ? 'text-purple-300' : 'text-slate-500'}">
                ${setting.value ? 'সক্রিয় (Enabled)' : 'নিষ্ক্রিয় (Disabled)'}
              </span>
            </label>
          `
              : isNum
              ? `
            <div class="flex items-center gap-2">
              <input 
                type="number" 
                id="input-${setting.key}" 
                value="${setting.value}" 
                ${meta.min !== undefined ? `min="${meta.min}"` : ''} 
                ${meta.max !== undefined ? `max="${meta.max}"` : ''} 
                class="w-28 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          `
              : `
            <div class="w-64 sm:w-80">
              <input 
                type="text" 
                id="input-${setting.key}" 
                value="${setting.value || ''}" 
                class="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          `
          }

          <button 
            data-save-key="${setting.key}" 
            data-category="${setting.category}"
            class="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition shadow-md flex items-center gap-1.5 shrink-0"
          >
            <span>সংরক্ষণ</span>
          </button>
        </div>
      </div>
    `;
  }

  function attachEvents() {
    const refreshBtn = container.querySelector('#refresh-settings-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        await loadSettings();
      });
    }

    const dismissSuccessBtn = container.querySelector('#dismiss-success-btn');
    if (dismissSuccessBtn) {
      dismissSuccessBtn.addEventListener('click', () => {
        successMessage = null;
        render();
      });
    }

    const dismissErrorBtn = container.querySelector('#dismiss-error-btn');
    if (dismissErrorBtn) {
      dismissErrorBtn.addEventListener('click', () => {
        errorMessage = null;
        render();
      });
    }

    // Toggle label updater
    settingsList.forEach((s) => {
      const isBool = SETTING_META[s.key]?.type === 'boolean' || typeof s.value === 'boolean';
      if (isBool) {
        const chk = container.querySelector(`#input-${s.key}`);
        const lbl = container.querySelector(`#label-${s.key}`);
        if (chk && lbl) {
          chk.addEventListener('change', () => {
            lbl.textContent = chk.checked ? 'সক্রিয় (Enabled)' : 'নিষ্ক্রিয় (Disabled)';
            lbl.className = `ml-3 text-xs font-mono font-medium ${chk.checked ? 'text-purple-300' : 'text-slate-500'}`;
          });
        }
      }
    });

    // Save buttons
    const saveButtons = container.querySelectorAll('button[data-save-key]');
    saveButtons.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const key = btn.getAttribute('data-save-key');
        const category = btn.getAttribute('data-category');
        const setting = settingsList.find((s) => s.key === key);
        if (!setting) return;

        const inputEl = container.querySelector(`#input-${key}`);
        if (!inputEl) return;

        const meta = SETTING_META[key] || {};
        const isBool = meta.type === 'boolean' || typeof setting.value === 'boolean';
        const isNum = meta.type === 'number' || typeof setting.value === 'number';

        let newValue;
        if (isBool) {
          newValue = inputEl.checked;
        } else if (isNum) {
          newValue = Number(inputEl.value);
          if (isNaN(newValue)) {
            errorMessage = 'অনুগ্রহ করে সঠিক সংখ্যাসূচক মান প্রদান করুন।';
            render();
            return;
          }
          if (meta.min !== undefined && newValue < meta.min) {
            errorMessage = `মান সর্বনিম্ন ${meta.min} হতে হবে।`;
            render();
            return;
          }
          if (meta.max !== undefined && newValue > meta.max) {
            errorMessage = `মান সর্বোচ্চ ${meta.max} হতে পারবে।`;
            render();
            return;
          }
        } else {
          newValue = inputEl.value.trim();
          if (!newValue) {
            errorMessage = 'সেটিং মান ফাঁকা রাখা যাবে না।';
            render();
            return;
          }
        }

        // Show confirmation modal
        showModal({
          title: 'সিস্টেম সেটিং পরিবর্তন নিশ্চিতকরণ',
          description: `'${meta.label || key}' সেটিংটির মান পরিবর্তন করতে আপনি কি নিশ্চিত?`,
          contentHtml: `
            <div class="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono">
              <div class="flex justify-between">
                <span class="text-slate-400">প্যারামিটার কি:</span>
                <span class="text-white">${key}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">পূর্ববর্তী মান:</span>
                <span class="text-amber-400">${String(setting.value)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">নতুন মান:</span>
                <span class="text-emerald-400 font-bold">${String(newValue)}</span>
              </div>
            </div>
            <p class="text-xs text-purple-300 mt-2">
              * পরিবর্তন সম্পন্ন করতে পরবর্তী ধাপে আপনার ২-ফ্যাক্টর প্রমাণীকরণ (TOTP) কোড প্রয়োজন হবে।
            </p>
          `,
          confirmText: 'পরবর্তী ধাপ (২-ফ্যাক্টর যাচাই)',
          confirmColor: 'bg-purple-600 hover:bg-purple-500',
          onConfirm: async () => {
            return new Promise((resolve, reject) => {
              showReAuthModal({
                title: 'সেটিং হালনাগাদে ২-ফ্যাক্টর পুনঃপ্রমাণীকরণ',
                description: `'${key}' সেটিং আপডেট অনুমোদন করতে পাসওয়ার্ড ও 2FA কোড প্রদান করুন।`,
                onSuccess: async (reAuthToken) => {
                  try {
                    await superAdminService.updateSystemSetting(key, {
                      value: newValue,
                      category,
                      reAuthToken,
                    });

                    successMessage = `সেটিং '${meta.label || key}' সফলভাবে হালনাগাদ করা হয়েছে।`;
                    await loadSettings();
                    resolve();
                  } catch (err) {
                    errorMessage = err.message || 'সেটিং হালনাগাদ করতে ব্যর্থ হয়েছে।';
                    render();
                    reject(err);
                  }
                },
              });
            });
          },
        });
      });
    });
  }

  async function loadSettings() {
    isLoading = true;
    errorMessage = null;
    render();

    try {
      const res = await superAdminService.getSystemSettings();
      settingsList = Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      errorMessage = err.message || 'সিস্টেম সেটিংস লোড করতে ব্যর্থ হয়েছে।';
    } finally {
      isLoading = false;
      render();
    }
  }

  await loadSettings();
}
