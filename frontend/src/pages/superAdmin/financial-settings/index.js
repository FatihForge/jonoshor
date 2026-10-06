import { superAdminService } from '../../../services/superAdmin/superAdminService.js';
import { renderSuperAdminNav } from '../../../components/superAdmin/SuperAdminNav.js';
import { formatDateTime } from '../../../utils/formatters.js';
import { showModal } from '../../../components/admin/ActionModal.js';
import { showReAuthModal } from '../../../components/superAdmin/ReAuthModal.js';

const FINANCIAL_FIELDS = [
  {
    group: 'bank',
    groupTitle: '🏦 ব্যাংক একাউন্ট ও লিগ্যাল ট্রাস্ট (Bank Destination & Legal Trust)',
    groupDescription: 'লিগ্যাল ডিফেন্স ফান্ড ও প্রাতিষ্ঠানিক অনুদান জমার অফিসিয়াল ব্যাংক হিসাব বিবরণ',
    fields: [
      {
        key: 'bank_name',
        label: 'ব্যাংকের নাম (Bank Name)',
        description: 'তহবিল গ্রহণকারী তফসিলি ব্যাংকের নাম',
        type: 'string',
        placeholder: 'যেমন: Dhaka Bank Limited',
      },
      {
        key: 'bank_account_title',
        label: 'অ্যাকাউন্ট টাইটেল (Account Title)',
        description: 'অফিসিয়াল ট্রাস্ট বা আইনি ফান্ড একাউন্টের নাম',
        type: 'string',
        placeholder: 'যেমন: JonoShor Legal Defense Trust',
      },
      {
        key: 'bank_account_number',
        label: 'অ্যাকাউন্ট নম্বর (Account Number)',
        description: 'তহবিল ডিপোজিটের ডেডিকেটেড ব্যাংক একাউন্ট নম্বর',
        type: 'string',
        placeholder: 'যেমন: 215.100.009876',
      },
      {
        key: 'bank_routing_number',
        label: 'ব্যাংক রাউটিং নম্বর (Routing Number)',
        description: 'ইলেকট্রনিক ফান্ড ট্রান্সফারের ৯-সংখ্যার রাউটিং নম্বর',
        type: 'string',
        placeholder: 'যেমন: 085261728',
      },
    ],
  },
  {
    group: 'mfs',
    groupTitle: '📱 মোবাইল ফাইন্যান্সিয়াল সার্ভিস (Mobile Financial Services)',
    groupDescription: 'নাগরিক অনুদান সংগ্রহের অফিসিয়াল ভেরিফাইড মার্চেন্ট ওয়ালেট নম্বর',
    fields: [
      {
        key: 'bkash_merchant_number',
        label: 'বিকাশ মার্চেন্ট নম্বর (bKash Merchant)',
        description: 'পেমেন্ট গেটওয়ে অথবা মার্চেন্ট পেমেন্ট গ্রহণকারী বিকাশ নম্বর',
        type: 'string',
        placeholder: '01XXXXXXXXX',
      },
      {
        key: 'nagad_merchant_number',
        label: 'নগদ মার্চেন্ট নম্বর (Nagad Merchant)',
        description: 'মার্চেন্ট পেমেন্ট গ্রহণকারী নগদ একাউন্ট নম্বর',
        type: 'string',
        placeholder: '01XXXXXXXXX',
      },
    ],
  },
  {
    group: 'rules',
    groupTitle: '⚙️ অনুদান ও তহবিল পলিসি (Donation & Policy Rules)',
    groupDescription: 'নাগরিক অনুদান সক্রিয়করণ ও ন্যূনতম জমার সীমা নির্ধারণ',
    fields: [
      {
        key: 'donation_enabled',
        label: 'অনলাইন অনুদান সক্রিয় (Enable Donations)',
        description: 'পাবলিক পোর্টাল থেকে নাগরিক অনুদান গ্রহণ অনুমোদন',
        type: 'boolean',
      },
      {
        key: 'min_donation_bdt',
        label: 'সর্বনিম্ন অনুদান (BDT) (Min Donation Amount)',
        description: 'এককালীন সর্বনিম্ন গ্রহণযোগ্য অনুদানের পরিমাণ (টাকায়)',
        type: 'number',
        min: 10,
        max: 100000,
      },
    ],
  },
];

export async function renderSuperAdminFinancialSettingsPage(container) {
  let settingsMap = {};
  let rawSettingsList = [];
  let isLoading = true;
  let errorMessage = null;
  let successMessage = null;

  function render() {
    container.innerHTML = `
      <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        ${renderSuperAdminNav('financial-settings')}

        <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <!-- Page Header -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-xl shadow-lg">
                  💰
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h1 class="text-2xl font-bold text-white tracking-tight">আর্থিক কনফিগারেশন সেটিংস</h1>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold uppercase tracking-wider">
                      Super Admin Only
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 mt-0.5">
                    আইনি প্রতিরক্ষা তহবিল, ব্যাংক অ্যাকাউন্ট ও অনুদান গন্তব্য কনফিগারেশন পরিচালনা
                  </p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button id="refresh-financial-btn" class="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-2 shadow-sm">
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
              <button id="dismiss-fin-success-btn" class="text-emerald-400 hover:text-emerald-200">✕</button>
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
              <button id="dismiss-fin-error-btn" class="text-red-400 hover:text-red-200">✕</button>
            </div>
          `
              : ''
          }

          <!-- Financial Security Protocol Callout (Section 72) -->
          <div class="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs flex items-start gap-3 shadow-inner">
            <span class="text-lg mt-0.5">🔒</span>
            <div class="space-y-1">
              <p class="font-bold text-amber-100">আর্থিক নিরাপত্তা প্রোটোকল (Section 72):</p>
              <p class="text-amber-300/80 leading-relaxed">
                আর্থিক গন্তব্য ও ব্যাংক বিবরণ পরিবর্তন সর্বোচ্চ সংবেদনশীল প্রশাসনিক অপারেশন। সাধারণ অ্যাডমিন এই তথ্য দেখতে বা পরিবর্তন করতে পারে না। প্রতিটি পরিবর্তনের জন্য সুপার অ্যাডমিনের পাসওয়ার্ড ও ২-ফ্যাক্টর প্রমাণীকরণ (TOTP) বাধ্যতামূলক এবং অপরিবর্তনযোগ্য অডিট লগে নিবন্ধিত হয়।
              </p>
            </div>
          </div>

          <!-- Content Form -->
          ${
            isLoading
              ? `
            <div class="py-24 text-center space-y-4">
              <div class="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p class="text-xs text-slate-400">আর্থিক কনফিগারেশন লোড হচ্ছে...</p>
            </div>
          `
              : renderFinancialForm()
          }
        </main>
      </div>
    `;

    attachEvents();
  }

  function renderFinancialForm() {
    return `
      <form id="financial-settings-form" class="space-y-8">
        ${FINANCIAL_FIELDS.map((section) => {
          return `
            <div class="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div class="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 class="text-base font-bold text-white">${section.groupTitle}</h2>
                  <p class="text-xs text-slate-400 mt-0.5">${section.groupDescription}</p>
                </div>
              </div>

              <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                ${section.fields.map((f) => renderFieldInput(f)).join('')}
              </div>
            </div>
          `;
        }).join('')}

        <!-- Save Button Bar -->
        <div class="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div class="text-xs text-slate-400 space-y-0.5">
            <div><span class="text-white font-semibold">সংরক্ষণ পদ্ধতি:</span> পরিবর্তন নিশ্চিত করার পর ২-ফ্যাক্টর প্রমাণীকরণ (TOTP) যাচাই করা হবে।</div>
            <div class="text-[11px] text-slate-500">সর্বশেষ পরিবর্তন: ${rawSettingsList[0]?.updatedAt ? formatDateTime(rawSettingsList[0].updatedAt) : 'সিস্টেম প্রিসেট'}</div>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button 
              type="reset" 
              id="reset-form-btn" 
              class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              রিসেট
            </button>
            <button 
              type="submit" 
              id="save-financial-btn" 
              class="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/40 transition flex items-center justify-center gap-2"
            >
              <span>🔒 আর্থিক কনফিগারেশন সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      </form>
    `;
  }

  function renderFieldInput(field) {
    const currentVal = settingsMap[field.key] !== undefined ? settingsMap[field.key] : '';
    const rawSetting = rawSettingsList.find((s) => s.key === field.key);
    const isMasked = rawSetting?.isMasked || (typeof currentVal === 'string' && currentVal.includes('••••'));

    if (field.type === 'boolean') {
      const isChecked = Boolean(currentVal);
      return `
        <div class="md:col-span-2 p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-4">
          <div class="space-y-0.5">
            <label class="text-xs font-bold text-white block">${field.label}</label>
            <p class="text-[11px] text-slate-400">${field.description}</p>
          </div>

          <label class="relative inline-flex items-center cursor-pointer shrink-0">
            <input type="checkbox" name="${field.key}" id="input-${field.key}" class="sr-only peer" ${isChecked ? 'checked' : ''} />
            <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            <span id="label-${field.key}" class="ml-3 text-xs font-mono font-medium ${isChecked ? 'text-amber-300' : 'text-slate-500'}">
              ${isChecked ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Disabled)'}
            </span>
          </label>
        </div>
      `;
    }

    return `
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label for="input-${field.key}" class="text-xs font-bold text-slate-200">
            ${field.label}
          </label>
          <span class="text-[10px] font-mono text-slate-500">${field.key}</span>
        </div>
        <p class="text-[11px] text-slate-400">${field.description}</p>

        <div class="relative">
          <input 
            type="${field.type === 'number' ? 'number' : 'text'}" 
            name="${field.key}" 
            id="input-${field.key}" 
            value="${isMasked ? '••••••••' : currentVal}" 
            placeholder="${field.placeholder || ''}" 
            ${field.min !== undefined ? `min="${field.min}"` : ''} 
            ${field.max !== undefined ? `max="${field.max}"` : ''} 
            class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
          />
          ${
            isMasked
              ? `
            <span class="absolute right-3 top-2.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
              Masked Secret
            </span>
          `
              : ''
          }
        </div>
      </div>
    `;
  }

  function attachEvents() {
    const refreshBtn = container.querySelector('#refresh-financial-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        await loadSettings();
      });
    }

    const dismissSuccessBtn = container.querySelector('#dismiss-fin-success-btn');
    if (dismissSuccessBtn) {
      dismissSuccessBtn.addEventListener('click', () => {
        successMessage = null;
        render();
      });
    }

    const dismissErrorBtn = container.querySelector('#dismiss-fin-error-btn');
    if (dismissErrorBtn) {
      dismissErrorBtn.addEventListener('click', () => {
        errorMessage = null;
        render();
      });
    }

    // Toggle label updater
    const boolInputs = container.querySelectorAll('input[type="checkbox"]');
    boolInputs.forEach((chk) => {
      chk.addEventListener('change', () => {
        const lbl = container.querySelector(`#label-${chk.name}`);
        if (lbl) {
          lbl.textContent = chk.checked ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Disabled)';
          lbl.className = `ml-3 text-xs font-mono font-medium ${chk.checked ? 'text-amber-300' : 'text-slate-500'}`;
        }
      });
    });

    // Form submit
    const form = container.querySelector('#financial-settings-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const updatedSettings = [];

        // Collect fields
        FINANCIAL_FIELDS.forEach((section) => {
          section.fields.forEach((field) => {
            if (field.type === 'boolean') {
              const chk = form.querySelector(`input[name="${field.key}"]`);
              updatedSettings.push({
                key: field.key,
                value: Boolean(chk?.checked),
              });
            } else if (field.type === 'number') {
              const val = formData.get(field.key);
              const numVal = Number(val);
              if (isNaN(numVal)) {
                errorMessage = `'${field.label}' এ একটি সঠিক সংখ্যাসূচক মান প্রদান করুন।`;
                render();
                return;
              }
              if (field.min !== undefined && numVal < field.min) {
                errorMessage = `'${field.label}' এর মান সর্বনিম্ন ${field.min} হতে হবে।`;
                render();
                return;
              }
              updatedSettings.push({
                key: field.key,
                value: numVal,
              });
            } else {
              const val = (formData.get(field.key) || '').trim();
              if (val.length > 0) {
                updatedSettings.push({
                  key: field.key,
                  value: val,
                });
              }
            }
          });
        });

        // Confirmation Modal
        showModal({
          title: 'আর্থিক কনফিগারেশন পরিবর্তন নিশ্চিতকরণ',
          description: 'আপনি কি নিশ্চিতভাবে এই আর্থিক গন্তব্য ও পলিসি পরিবর্তন সংরক্ষণ করতে চান?',
          contentHtml: `
            <div class="space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono max-h-60 overflow-y-auto">
              ${updatedSettings
                .map((s) => {
                  const safeVal = typeof s.value === 'string' && s.value.includes('••••') ? '••••••••' : String(s.value);
                  return `
                  <div class="flex justify-between py-1 border-b border-slate-900 last:border-0">
                    <span class="text-slate-400">${s.key}:</span>
                    <span class="text-amber-300 font-bold">${safeVal}</span>
                  </div>
                `;
                })
                .join('')}
            </div>
            <p class="text-xs text-amber-300 mt-2">
              * পরিবর্তন অনুমোদনের জন্য পরবর্তী ধাপে আপনার ২-ফ্যাক্টর প্রমাণীকরণ (TOTP) কোড প্রয়োজন হবে।
            </p>
          `,
          confirmText: 'পরবর্তী ধাপ (২-ফ্যাক্টর যাচাই)',
          confirmColor: 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold',
          onConfirm: async () => {
            return new Promise((resolve, reject) => {
              showReAuthModal({
                title: 'আর্থিক সেটিংস হালনাগাদে ২-ফ্যাক্টর পুনঃপ্রমাণীকরণ',
                description: 'আর্থিক গন্তব্য পরিবর্তন অনুমোদন করতে সুপার অ্যাডমিন পাসওয়ার্ড ও 2FA কোড প্রদান করুন।',
                onSuccess: async (reAuthToken) => {
                  try {
                    await superAdminService.updateFinancialSettings({
                      settings: updatedSettings,
                      reAuthToken,
                    });

                    successMessage = 'আর্থিক কনফিগারেশন সেটিংস সফলভাবে হালনাগাদ করা হয়েছে।';
                    await loadSettings();
                    resolve();
                  } catch (err) {
                    errorMessage = err.message || 'আর্থিক সেটিংস হালনাগাদ করতে ব্যর্থ হয়েছে।';
                    render();
                    reject(err);
                  }
                },
              });
            });
          },
        });
      });
    }
  }

  async function loadSettings() {
    isLoading = true;
    errorMessage = null;
    render();

    try {
      const res = await superAdminService.getFinancialSettings();
      rawSettingsList = Array.isArray(res.data) ? res.data : [];
      settingsMap = {};
      rawSettingsList.forEach((item) => {
        settingsMap[item.key] = item.value;
      });
    } catch (err) {
      errorMessage = err.message || 'আর্থিক সেটিংস লোড করতে ব্যর্থ হয়েছে।';
    } finally {
      isLoading = false;
      render();
    }
  }

  await loadSettings();
}
