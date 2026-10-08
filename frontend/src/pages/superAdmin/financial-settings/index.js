import { superAdminService } from '../../../services/superAdmin/superAdminService.js';
import { renderSuperAdminNav } from '../../../components/superAdmin/SuperAdminNav.js';
import { formatDateTime } from '../../../utils/formatters.js';
import { showModal } from '../../../components/admin/ActionModal.js';
import { showReAuthModal } from '../../../components/superAdmin/ReAuthModal.js';

const FINANCIAL_FIELDS = [
  {
    group: 'bank',
    groupTitle: '🏦 Bank Account & Legal Defense Trust',
    groupDescription: 'Official banking details for institutional legal defense funds and trust deposits',
    fields: [
      {
        key: 'bank_name',
        label: 'Bank Name',
        description: 'Scheduled bank holding depository funds',
        type: 'string',
        placeholder: 'e.g. Dhaka Bank Limited',
      },
      {
        key: 'bank_account_title',
        label: 'Account Title',
        description: 'Official trust or legal fund entity name',
        type: 'string',
        placeholder: 'e.g. JonoShor Legal Defense Trust',
      },
      {
        key: 'bank_account_number',
        label: 'Account Number',
        description: 'Dedicated depository bank account number',
        type: 'string',
        placeholder: 'e.g. 215.100.009876',
      },
      {
        key: 'bank_routing_number',
        label: 'Bank Routing Number',
        description: '9-digit electronic fund transfer routing number',
        type: 'string',
        placeholder: 'e.g. 085261728',
      },
    ],
  },
  {
    group: 'mfs',
    groupTitle: '📱 Mobile Financial Services (MFS)',
    groupDescription: 'Verified merchant wallet numbers for civic donations and support',
    fields: [
      {
        key: 'bkash_merchant_number',
        label: 'bKash Merchant Number',
        description: 'Verified bKash merchant payment collection number',
        type: 'string',
        placeholder: '01XXXXXXXXX',
      },
      {
        key: 'nagad_merchant_number',
        label: 'Nagad Merchant Number',
        description: 'Verified Nagad merchant payment collection number',
        type: 'string',
        placeholder: '01XXXXXXXXX',
      },
    ],
  },
  {
    group: 'rules',
    groupTitle: '⚙️ Contribution & Fund Policy Rules',
    groupDescription: 'Donation collection controls and minimum contribution thresholds',
    fields: [
      {
        key: 'donation_enabled',
        label: 'Enable Public Donations',
        description: 'Permit voluntary citizen contributions on the public portal',
        type: 'boolean',
      },
      {
        key: 'min_donation_bdt',
        label: 'Minimum Contribution (BDT)',
        description: 'Minimum allowable single contribution amount in BDT',
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
      <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        ${renderSuperAdminNav('financial-settings')}

        <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <!-- Page Header -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shadow-sm" aria-hidden="true">
                  💰
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Financial Configuration Settings</h1>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold uppercase tracking-wider">
                      Super Admin Only
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Configure institutional legal defense trust accounts, payment gateways, and fund policies
                  </p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button id="refresh-financial-btn" class="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500/20" aria-label="Refresh financial configurations">
                <svg class="w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <!-- Alert Banners -->
          ${
            successMessage
              ? `
            <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 shadow-sm" role="status" aria-live="polite">
              <div class="flex items-center gap-2.5">
                <span class="text-base text-emerald-600 font-bold" aria-hidden="true">✓</span>
                <span>${successMessage}</span>
              </div>
              <button id="dismiss-fin-success-btn" class="text-emerald-700 hover:text-emerald-900 font-bold" aria-label="Dismiss">✕</button>
            </div>
          `
              : ''
          }

          ${
            errorMessage
              ? `
            <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 shadow-sm" role="alert">
              <div class="flex items-center gap-2.5">
                <span class="text-base text-rose-600 font-bold" aria-hidden="true">⚠️</span>
                <span>${errorMessage}</span>
              </div>
              <button id="dismiss-fin-error-btn" class="text-rose-700 hover:text-rose-900 font-bold" aria-label="Dismiss">✕</button>
            </div>
          `
              : ''
          }

          <!-- Financial Security Protocol Callout (Section 72) -->
          <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-sm">
            <span class="text-lg mt-0.5" aria-hidden="true">🔒</span>
            <div class="space-y-1">
              <p class="font-bold text-amber-900">Financial Security Governance (Section 72):</p>
              <p class="text-amber-800 leading-relaxed">
                Modifying institutional financial destinations and trust accounts is a high-sensitivity executive operation. Standard administrators cannot view or modify these parameters. Updates require Super Admin password confirmation and Two-Factor Authentication (TOTP).
              </p>
            </div>
          </div>

          <!-- Content Form -->
          ${
            isLoading
              ? `
            <div class="py-24 text-center space-y-4" role="status" aria-live="polite">
              <div class="w-10 h-10 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" aria-hidden="true"></div>
              <p class="text-xs text-slate-500">Loading financial configuration...</p>
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
            <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 class="text-sm font-bold text-slate-900">${section.groupTitle}</h2>
                  <p class="text-xs text-slate-500 mt-0.5">${section.groupDescription}</p>
                </div>
              </div>

              <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                ${section.fields.map((f) => renderFieldInput(f)).join('')}
              </div>
            </div>
          `;
        }).join('')}

        <!-- Save Button Bar -->
        <div class="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div class="text-xs text-slate-500 space-y-0.5">
            <div><span class="text-slate-900 font-semibold">Security Protocol:</span> Changes will be committed after Two-Factor Authentication (TOTP) verification.</div>
            <div class="text-[11px] text-slate-400">Last updated: ${rawSettingsList[0]?.updatedAt ? formatDateTime(rawSettingsList[0].updatedAt) : 'System default'}</div>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button 
              type="reset" 
              id="reset-form-btn" 
              class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Reset
            </button>
            <button 
              type="submit" 
              id="save-financial-btn" 
              class="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <span>🔒 Save Financial Configuration</span>
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
        <div class="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
          <div class="space-y-0.5">
            <label for="input-${field.key}" class="text-xs font-bold text-slate-900 block">${field.label}</label>
            <p class="text-[11px] text-slate-500">${field.description}</p>
          </div>

          <label class="relative inline-flex items-center cursor-pointer shrink-0">
            <input type="checkbox" name="${field.key}" id="input-${field.key}" class="sr-only peer" ${isChecked ? 'checked' : ''} />
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            <span id="label-${field.key}" class="ml-3 text-xs font-mono font-medium ${isChecked ? 'text-amber-800' : 'text-slate-500'}">
              ${isChecked ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>
      `;
    }

    return `
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label for="input-${field.key}" class="text-xs font-bold text-slate-800">
            ${field.label}
          </label>
          <span class="text-[10px] font-mono text-slate-400">${field.key}</span>
        </div>
        <p class="text-[11px] text-slate-500">${field.description}</p>

        <div class="relative">
          <input 
            type="${field.type === 'number' ? 'number' : 'text'}" 
            name="${field.key}" 
            id="input-${field.key}" 
            value="${isMasked ? '••••••••' : currentVal}" 
            placeholder="${field.placeholder || ''}" 
            ${field.min !== undefined ? `min="${field.min}"` : ''} 
            ${field.max !== undefined ? `max="${field.max}"` : ''} 
            class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
          />
          ${
            isMasked
              ? `
            <span class="absolute right-3 top-2.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono">
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
          lbl.textContent = chk.checked ? 'Enabled' : 'Disabled';
          lbl.className = `ml-3 text-xs font-mono font-medium ${chk.checked ? 'text-amber-800' : 'text-slate-500'}`;
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
                errorMessage = `Please enter a valid numeric value for '${field.label}'.`;
                render();
                return;
              }
              if (field.min !== undefined && numVal < field.min) {
                errorMessage = `'${field.label}' must be at least ${field.min}.`;
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
          title: 'Confirm Financial Configuration Update',
          description: 'Are you sure you want to update these institutional accounts and policy settings?',
          contentHtml: `
            <div class="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono max-h-60 overflow-y-auto">
              ${updatedSettings
                .map((s) => {
                  const safeVal = typeof s.value === 'string' && s.value.includes('••••') ? '••••••••' : String(s.value);
                  return `
                  <div class="flex justify-between py-1 border-b border-slate-200 last:border-0">
                    <span class="text-slate-500">${s.key}:</span>
                    <span class="text-amber-700 font-bold">${safeVal}</span>
                  </div>
                `;
                })
                .join('')}
            </div>
            <p class="text-xs text-amber-800 mt-2">
              * Two-Factor Authentication (TOTP) is required in the next step to execute this change.
            </p>
          `,
          confirmText: 'Proceed to 2FA Verification →',
          confirmColor: 'bg-amber-600 hover:bg-amber-700 text-white font-bold',
          onConfirm: async () => {
            return new Promise((resolve, reject) => {
              showReAuthModal({
                title: 'Executive Financial Re-Authentication',
                description: 'Provide your Super Admin password and 2FA code to apply updates to institutional financial settings.',
                onSuccess: async (reAuthToken) => {
                  try {
                    await superAdminService.updateFinancialSettings({
                      settings: updatedSettings,
                      reAuthToken,
                    });

                    successMessage = 'Financial configuration settings updated successfully.';
                    await loadSettings();
                    resolve();
                  } catch (err) {
                    errorMessage = err.message || 'Failed to update financial settings.';
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
      errorMessage = err.message || 'Failed to load financial settings.';
    } finally {
      isLoading = false;
      render();
    }
  }

  await loadSettings();
}
