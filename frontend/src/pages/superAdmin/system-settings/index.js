import { superAdminService } from '../../../services/superAdmin/superAdminService.js';
import { renderSuperAdminNav } from '../../../components/superAdmin/SuperAdminNav.js';
import { formatDateTime } from '../../../utils/formatters.js';
import { showModal } from '../../../components/admin/ActionModal.js';
import { showReAuthModal } from '../../../components/superAdmin/ReAuthModal.js';

// Setting metadata mapping for rich UX labels and descriptions
const SETTING_META = {
  platform_name: {
    label: 'Platform Name',
    description: 'Publicly visible platform title across citizen and admin portals',
    type: 'string',
  },
  organization_legal_name: {
    label: 'Organization Legal Name',
    description: 'Official registered entity or civil trust name',
    type: 'string',
  },
  support_email: {
    label: 'Support Email Address',
    description: 'Official email address for citizen inquiries and institutional support',
    type: 'string',
  },
  allow_user_registration: {
    label: 'Allow Citizen Registration',
    description: 'Enable or disable public user self-registration',
    type: 'boolean',
  },
  maintenance_mode: {
    label: 'System Maintenance Mode',
    description: 'Temporarily closes public platform and displays maintenance advisory',
    type: 'boolean',
    warning: true,
  },
  enforce_2fa_for_admins: {
    label: 'Enforce 2FA for Administrators',
    description: 'Require Two-Factor Authentication (TOTP) for all administrative logins',
    type: 'boolean',
  },
  session_inactivity_timeout_minutes: {
    label: 'Session Inactivity Timeout (Minutes)',
    description: 'Automatic session expiration after period of inactivity',
    type: 'number',
    min: 5,
    max: 1440,
  },
  max_failed_login_attempts: {
    label: 'Max Failed Login Attempts',
    description: 'Threshold of failed password attempts before temporary security lockout',
    type: 'number',
    min: 3,
    max: 20,
  },
  rate_limiting_enabled: {
    label: 'API Rate Limiting',
    description: 'Automated request throttling to prevent brute-force attacks and abuse',
    type: 'boolean',
  },
  anonymous_submission_allowed: {
    label: 'Allow Anonymous Complaints',
    description: 'Allow citizens to lodge complaints with complete reporter anonymity',
    type: 'boolean',
  },
  max_evidence_files_per_complaint: {
    label: 'Max Evidence Files Per Complaint',
    description: 'Maximum number of evidence files allowed per complaint submission',
    type: 'number',
    min: 1,
    max: 50,
  },
  max_file_size_mb: {
    label: 'Max File Size (MB)',
    description: 'Maximum permitted file size per evidence attachment in megabytes',
    type: 'number',
    min: 1,
    max: 100,
  },
  require_admin_verification_before_publish: {
    label: 'Require Verification Before Publishing',
    description: 'Enforce administrative verification review prior to public report disclosure',
    type: 'boolean',
  },
};

const CATEGORY_NAMES = {
  general: {
    title: '🌐 General Platform Settings',
    subtitle: 'Platform identity, organizational metadata, and operational parameters',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  security: {
    title: '🛡️ Security & Access Control',
    subtitle: 'Administrator authentication, 2FA enforcement, and session policies',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  complaint: {
    title: '📋 Complaint & Verification Parameters',
    subtitle: 'Submission rules, attachment file limits, and verification requirements',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

const DEFAULT_SOCIAL_ITEMS = [
  { id: 'facebook', name: 'Facebook', url: 'https://facebook.com/jonoshor', icon: 'facebook', enabled: true, order: 1 },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com/company/jonoshor', icon: 'linkedin', enabled: true, order: 2 },
  { id: 'youtube', name: 'YouTube', url: 'https://youtube.com/@jonoshor', icon: 'youtube', enabled: true, order: 3 },
  { id: 'x', name: 'X / Twitter', url: 'https://x.com/jonoshor', icon: 'x', enabled: true, order: 4 },
];

export async function renderSuperAdminSystemSettingsPage(container) {
  let settingsList = [];
  let socialLinksState = [];
  let isLoading = true;
  let errorMessage = null;
  let successMessage = null;

  function render() {
    container.innerHTML = `
      <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        ${renderSuperAdminNav('system-settings')}

        <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <!-- Page Header -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-xl shadow-sm" aria-hidden="true">
                  ⚙️
                </div>
                <div>
                  <h1 class="text-2xl font-bold text-slate-900 tracking-tight">System Configuration Settings</h1>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Configure operational, security, social platforms, and complaint parameters for JonoShor
                  </p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button id="refresh-settings-btn" class="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20" aria-label="Refresh settings">
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
              <button id="dismiss-success-btn" class="text-emerald-700 hover:text-emerald-900 font-bold" aria-label="Dismiss">✕</button>
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
              <button id="dismiss-error-btn" class="text-rose-700 hover:text-rose-900 font-bold" aria-label="Dismiss">✕</button>
            </div>
          `
              : ''
          }

          <!-- Security Policy Banner -->
          <div class="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-3 shadow-sm">
            <span class="text-lg mt-0.5" aria-hidden="true">🔐</span>
            <div>
              <p class="font-bold text-purple-900">High-Privilege Security Protocol (Section 71):</p>
              <p class="text-purple-700 mt-0.5 leading-relaxed">
                Applying updates to platform configuration requires Super Admin password confirmation and Two-Factor Authentication (TOTP). All changes are recorded in the immutable audit trail.
              </p>
            </div>
          </div>

          <!-- Content Area -->
          ${
            isLoading
              ? `
            <div class="py-24 text-center space-y-4" role="status" aria-live="polite">
              <div class="w-10 h-10 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" aria-hidden="true"></div>
              <p class="text-xs text-slate-500">Loading system configurations...</p>
            </div>
          `
              : renderSettingsCategories()
          }
        </main>
      </div>
    `;

    attachEvents();
  }

  function renderSocialLinksCard() {
    return `
      <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="social-links-management-card">
        <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Official Social & Platform Links</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono font-semibold">
                Super Admin Governed
              </span>
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Configure official platform links displayed in public footer and contact channels. Disabled links disappear publicly.
            </p>
          </div>
          <button 
            type="button" 
            id="add-social-link-btn" 
            class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-purple-600"
          >
            <span>+ Add Platform</span>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th scope="col" class="px-3 py-2.5 font-semibold">Platform Name</th>
                  <th scope="col" class="px-3 py-2.5 font-semibold">Profile / Page URL</th>
                  <th scope="col" class="px-3 py-2.5 font-semibold">Icon</th>
                  <th scope="col" class="px-3 py-2.5 font-semibold text-center">Order</th>
                  <th scope="col" class="px-3 py-2.5 font-semibold text-center">Status</th>
                  <th scope="col" class="px-3 py-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody id="social-links-table-body" class="divide-y divide-slate-100 text-slate-700">
                ${socialLinksState
                  .map(
                    (link, idx) => `
                  <tr class="hover:bg-slate-50/60 transition" data-index="${idx}">
                    <td class="px-3 py-2.5">
                      <input 
                        type="text" 
                        class="social-input-name w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500" 
                        value="${link.name || ''}" 
                        placeholder="Platform"
                      />
                    </td>
                    <td class="px-3 py-2.5">
                      <input 
                        type="url" 
                        class="social-input-url w-full min-w-[200px] px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500" 
                        value="${link.url || ''}" 
                        placeholder="https://..."
                      />
                    </td>
                    <td class="px-3 py-2.5">
                      <select class="social-input-icon px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500">
                        <option value="facebook" ${link.icon === 'facebook' ? 'selected' : ''}>Facebook</option>
                        <option value="linkedin" ${link.icon === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
                        <option value="youtube" ${link.icon === 'youtube' ? 'selected' : ''}>YouTube</option>
                        <option value="x" ${link.icon === 'x' || link.icon === 'twitter' ? 'selected' : ''}>X / Twitter</option>
                        <option value="link" ${link.icon === 'link' ? 'selected' : ''}>Website / Link</option>
                      </select>
                    </td>
                    <td class="px-3 py-2.5 text-center">
                      <input 
                        type="number" 
                        min="1" 
                        max="99" 
                        class="social-input-order w-14 text-center px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500" 
                        value="${link.order || idx + 1}"
                      />
                    </td>
                    <td class="px-3 py-2.5 text-center">
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="social-input-enabled sr-only peer" ${link.enabled ? 'checked' : ''} />
                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </td>
                    <td class="px-3 py-2.5 text-right">
                      <button type="button" data-delete-index="${idx}" class="text-rose-600 hover:text-rose-800 font-medium text-xs px-2 py-1 rounded hover:bg-rose-50 transition" aria-label="Remove platform">
                        Remove
                      </button>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-500">
              * Requires 2FA Re-Authentication to commit updates.
            </span>
            <button 
              type="button" 
              id="save-social-links-btn" 
              class="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-purple-600"
            >
              <span>🔒 Save Social Links Configuration</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderSettingsCategories() {
    const categories = ['general', 'security', 'complaint'];

    return `
      <div class="space-y-8">
        <!-- Social Links Governance Card -->
        ${renderSocialLinksCard()}

        ${categories
          .map((catKey) => {
            const catMeta = CATEGORY_NAMES[catKey] || {
              title: catKey.toUpperCase(),
              subtitle: 'Configuration settings',
              badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
            };

            const catSettings = settingsList.filter((s) => s.category === catKey && s.key !== 'social_links');

            return `
            <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 class="text-sm font-bold text-slate-900">${catMeta.title}</h2>
                  <p class="text-xs text-slate-500 mt-0.5">${catMeta.subtitle}</p>
                </div>
                <span class="text-[11px] font-mono px-2.5 py-1 rounded-full border ${catMeta.badgeClass} font-semibold">
                  ${catSettings.length} Settings
                </span>
              </div>

              <div class="divide-y divide-slate-100">
                ${
                  catSettings.length === 0
                    ? `
                  <div class="p-6 text-center text-xs text-slate-500">
                    No configuration parameters found in this category.
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
      description: 'System parameter',
      type: typeof setting.value === 'boolean' ? 'boolean' : typeof setting.value === 'number' ? 'number' : 'string',
    };

    const isBool = meta.type === 'boolean' || typeof setting.value === 'boolean';
    const isNum = meta.type === 'number' || typeof setting.value === 'number';

    return `
      <div class="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/60 transition group" data-setting-key="${setting.key}">
        <div class="max-w-xl space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-slate-900">${meta.label}</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
              ${setting.key}
            </span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 font-semibold">
              v${setting.version || 1}
            </span>
            ${
              meta.warning && setting.value === true
                ? `
              <span class="text-[10px] px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold animate-pulse">
                Active: Caution
              </span>
            `
                : ''
            }
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">${meta.description}</p>
          <div class="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
            <span>Last modified: ${formatDateTime(setting.updatedAt)}</span>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          ${
            isBool
              ? `
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="input-${setting.key}" class="sr-only peer" ${setting.value ? 'checked' : ''} />
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              <span id="label-${setting.key}" class="ml-3 text-xs font-mono font-medium ${setting.value ? 'text-purple-700' : 'text-slate-500'}">
                ${setting.value ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          `
              : isNum
              ? `
            <div class="flex items-center gap-2">
              <label for="input-${setting.key}" class="sr-only">${meta.label}</label>
              <input 
                type="number" 
                id="input-${setting.key}" 
                value="${setting.value}" 
                ${meta.min !== undefined ? `min="${meta.min}"` : ''} 
                ${meta.max !== undefined ? `max="${meta.max}"` : ''} 
                class="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
          `
              : `
            <div class="w-64 sm:w-80">
              <label for="input-${setting.key}" class="sr-only">${meta.label}</label>
              <input 
                type="text" 
                id="input-${setting.key}" 
                value="${setting.value || ''}" 
                class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
          `
          }

          <button 
            data-save-key="${setting.key}" 
            data-category="${setting.category}"
            class="px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <span>Save</span>
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
            lbl.textContent = chk.checked ? 'Enabled' : 'Disabled';
            lbl.className = `ml-3 text-xs font-mono font-medium ${chk.checked ? 'text-purple-700' : 'text-slate-500'}`;
          });
        }
      }
    });

    // Add social link button
    const addSocialBtn = container.querySelector('#add-social-link-btn');
    if (addSocialBtn) {
      addSocialBtn.addEventListener('click', () => {
        socialLinksState.push({
          id: `custom_${Date.now()}`,
          name: 'New Platform',
          url: 'https://',
          icon: 'link',
          enabled: true,
          order: socialLinksState.length + 1,
        });
        render();
      });
    }

    // Delete social link buttons
    const deleteButtons = container.querySelectorAll('button[data-delete-index]');
    deleteButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-delete-index'), 10);
        if (!isNaN(idx) && idx >= 0 && idx < socialLinksState.length) {
          socialLinksState.splice(idx, 1);
          render();
        }
      });
    });

    // Save Social Links button
    const saveSocialBtn = container.querySelector('#save-social-links-btn');
    if (saveSocialBtn) {
      saveSocialBtn.addEventListener('click', async () => {
        // Collect current values from table inputs
        const rows = container.querySelectorAll('#social-links-table-body tr');
        const updated = [];

        rows.forEach((row, idx) => {
          const name = row.querySelector('.social-input-name')?.value.trim() || 'Platform';
          const url = row.querySelector('.social-input-url')?.value.trim() || '';
          const icon = row.querySelector('.social-input-icon')?.value || 'link';
          const order = parseInt(row.querySelector('.social-input-order')?.value, 10) || idx + 1;
          const enabled = Boolean(row.querySelector('.social-input-enabled')?.checked);

          updated.push({
            id: socialLinksState[idx]?.id || name.toLowerCase().replace(/[^a-z0-9]/g, ''),
            name,
            url,
            icon,
            order,
            enabled,
          });
        });

        // Prompt confirmation & ReAuth modal
        showModal({
          title: 'Confirm Social Links Update',
          description: `Update official public social platforms configuration (${updated.length} entries)?`,
          contentHtml: `
            <div class="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono max-h-48 overflow-y-auto">
              ${updated
                .map((l) => `
                <div class="flex items-center justify-between py-1 border-b border-slate-200 last:border-0">
                  <span class="text-slate-700 font-bold">${l.name} (${l.icon}):</span>
                  <span class="${l.enabled ? 'text-emerald-700 font-semibold' : 'text-slate-400'}">${l.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              `)
                .join('')}
            </div>
            <p class="text-xs text-purple-700 mt-2">
              * Two-Factor Authentication (TOTP) verification is required to commit changes.
            </p>
          `,
          confirmText: 'Proceed to 2FA Verification →',
          confirmColor: 'bg-purple-700 hover:bg-purple-800 text-white',
          onConfirm: async () => {
            return new Promise((resolve, reject) => {
              showReAuthModal({
                title: 'Executive Re-Authentication',
                description: 'Provide your Super Admin password and 2FA code to commit social platforms configuration.',
                onSuccess: async (reAuthToken) => {
                  try {
                    await superAdminService.updateSystemSetting('social_links', {
                      value: updated,
                      category: 'general',
                      reAuthToken,
                    });

                    socialLinksState = updated;
                    successMessage = 'Official social platform links updated successfully.';
                    await loadSettings();
                    resolve();
                  } catch (err) {
                    errorMessage = err.message || 'Failed to update social platform links.';
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

    // Save individual system setting buttons
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
            errorMessage = 'Please provide a valid numeric value.';
            render();
            return;
          }
          if (meta.min !== undefined && newValue < meta.min) {
            errorMessage = `Value must be at least ${meta.min}.`;
            render();
            return;
          }
          if (meta.max !== undefined && newValue > meta.max) {
            errorMessage = `Value cannot exceed ${meta.max}.`;
            render();
            return;
          }
        } else {
          newValue = inputEl.value.trim();
          if (!newValue) {
            errorMessage = 'Setting value cannot be empty.';
            render();
            return;
          }
        }

        // Show confirmation modal
        showModal({
          title: 'Confirm Configuration Change',
          description: `Are you sure you want to update '${meta.label || key}'?`,
          contentHtml: `
            <div class="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono">
              <div class="flex justify-between">
                <span class="text-slate-500">Parameter Key:</span>
                <span class="text-slate-900 font-semibold">${key}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Previous Value:</span>
                <span class="text-amber-700">${String(setting.value)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">New Value:</span>
                <span class="text-emerald-700 font-bold">${String(newValue)}</span>
              </div>
            </div>
            <p class="text-xs text-purple-700 mt-2">
              * Two-Factor Authentication (TOTP) is required in the next step to execute this change.
            </p>
          `,
          confirmText: 'Proceed to 2FA Verification →',
          confirmColor: 'bg-purple-700 hover:bg-purple-800 text-white',
          onConfirm: async () => {
            return new Promise((resolve, reject) => {
              showReAuthModal({
                title: 'Executive Re-Authentication',
                description: `Confirm password and 2FA code to apply update to '${key}'.`,
                onSuccess: async (reAuthToken) => {
                  try {
                    await superAdminService.updateSystemSetting(key, {
                      value: newValue,
                      category,
                      reAuthToken,
                    });

                    successMessage = `Setting '${meta.label || key}' was updated successfully.`;
                    await loadSettings();
                    resolve();
                  } catch (err) {
                    errorMessage = err.message || 'Failed to update setting.';
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

      const socialSetting = settingsList.find((s) => s.key === 'social_links');
      if (socialSetting && Array.isArray(socialSetting.value)) {
        socialLinksState = JSON.parse(JSON.stringify(socialSetting.value));
      } else {
        socialLinksState = JSON.parse(JSON.stringify(DEFAULT_SOCIAL_ITEMS));
      }
    } catch (err) {
      errorMessage = err.message || 'Failed to load system configurations.';
    } finally {
      isLoading = false;
      render();
    }
  }

  await loadSettings();
}
