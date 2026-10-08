import { superAdminService } from '../../../services/superAdmin/superAdminService.js';
import { renderSuperAdminNav } from '../../../components/superAdmin/SuperAdminNav.js';
import { getAccountStatusBadge } from '../../../components/admin/StatusBadge.js';
import { formatDate, formatDateTime } from '../../../utils/formatters.js';
import { showModal } from '../../../components/admin/ActionModal.js';
import { showReAuthModal } from '../../../components/superAdmin/ReAuthModal.js';

// Granular permissions grouped by domain
const PERMISSION_GROUPS = [
  {
    group: 'Complaints Management',
    permissions: [
      { id: 'complaint.read', label: 'Read Complaints' },
      { id: 'complaint.review', label: 'Review Complaints' },
      { id: 'complaint.assign', label: 'Assign Reviewers' },
      { id: 'complaint.screen', label: 'Initial Screening' },
      { id: 'complaint.verify', label: 'Verification Decision' },
      { id: 'complaint.publish', label: 'Approve Publication' },
    ],
  },
  {
    group: 'Evidence Management',
    permissions: [
      { id: 'evidence.read', label: 'Read Evidence' },
      { id: 'evidence.review', label: 'Review Evidence' },
      { id: 'evidence.publish', label: 'Publish Evidence' },
      { id: 'evidence.delete', label: 'Delete Evidence' },
    ],
  },
  {
    group: 'Legal & Authority Tracking',
    permissions: [
      { id: 'legal.read', label: 'Read Legal Cases' },
      { id: 'legal.create', label: 'Create Legal Record' },
      { id: 'legal.update', label: 'Update Timeline' },
    ],
  },
  {
    group: 'User Management',
    permissions: [
      { id: 'user.read', label: 'Read User Profiles' },
      { id: 'user.manage', label: 'Manage Account Status' },
    ],
  },
  {
    group: 'Volunteer Applications (Join Us)',
    permissions: [
      { id: 'joinUs.read', label: 'Read Applications' },
      { id: 'joinUs.notes', label: 'Add Internal Notes' },
      { id: 'joinUs.export', label: 'Export Data' },
      { id: 'joinUs.delete', label: 'Delete Application' },
    ],
  },
  {
    group: 'Messaging & Notifications',
    permissions: [
      { id: 'notification.send', label: 'Send Notifications' },
      { id: 'message.read', label: 'Read Messages' },
      { id: 'message.send', label: 'Send Messages' },
    ],
  },
  {
    group: 'Audit & Security Logs',
    permissions: [
      { id: 'audit.read', label: 'Read Audit Logs' },
      { id: 'security.read', label: 'Read Security Logs' },
    ],
  },
];

export async function renderSuperAdminAdminsPage(container) {
  let currentPage = 1;
  const limit = 20;

  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 text-slate-900">
      ${renderSuperAdminNav('admins')}

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Administrator Directory</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono font-semibold">
                Admin Governance
              </span>
            </h1>
            <p class="text-xs text-slate-500 mt-1">
              Platform administrator roster, account status management, and granular role-based permissions (RBAC).
            </p>
          </div>
          <div class="flex items-center gap-2.5">
            <button id="refresh-admins-btn" class="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20" aria-label="Refresh administrator directory">
              <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span>Refresh</span>
            </button>
            <button id="create-admin-btn" class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20">
              <span class="text-sm font-bold" aria-hidden="true">+</span>
              <span>New Administrator</span>
            </button>
          </div>
        </div>

        <!-- Success Toast Banner -->
        <div id="sa-admins-success-banner" class="hidden p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-sm" role="status" aria-live="polite">
          <div class="flex items-center gap-2">
            <span class="text-emerald-600 font-bold text-sm" aria-hidden="true">✓</span>
            <span id="sa-admins-success-text">Operation completed successfully.</span>
          </div>
          <button id="close-success-banner-btn" class="text-emerald-700 hover:text-emerald-900 font-bold text-sm ml-4" aria-label="Dismiss banner">✕</button>
        </div>

        <!-- Main State Containers -->
        <div id="sa-admins-loading" class="py-20 text-center" role="status" aria-live="polite">
          <div class="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true"></div>
          <p class="text-slate-500 text-sm">Loading administrator directory...</p>
        </div>

        <div id="sa-admins-error" class="hidden py-16 text-center" role="alert"></div>

        <div id="sa-admins-table-container" class="hidden space-y-4">
          <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th scope="col" class="px-4 py-3 font-semibold">Reference / ID</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Name & Email</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Mobile</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Permissions (RBAC)</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Created & Last Login</th>
                  <th scope="col" class="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="sa-admins-table-body" class="divide-y divide-slate-100 text-slate-700">
                <!-- Rows injected dynamically -->
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div id="sa-admins-empty" class="hidden py-16 text-center rounded-2xl border border-slate-200 bg-white">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              👥
            </div>
            <p class="text-sm font-semibold text-slate-900">No administrators found</p>
            <p class="text-xs text-slate-500 mt-1">As Super Admin, you can provision new administrator accounts.</p>
          </div>

          <!-- Pagination Bar -->
          <div id="sa-admins-pagination" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
            <span id="sa-pagination-info">Page 1</span>
            <div class="flex items-center gap-2">
              <button id="sa-prev-page-btn" class="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition">
                ← Previous
              </button>
              <button id="sa-next-page-btn" class="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition">
                Next →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  const loadingEl = container.querySelector('#sa-admins-loading');
  const errorEl = container.querySelector('#sa-admins-error');
  const tableContainerEl = container.querySelector('#sa-admins-table-container');
  const tbodyEl = container.querySelector('#sa-admins-table-body');
  const emptyEl = container.querySelector('#sa-admins-empty');
  const refreshBtn = container.querySelector('#refresh-admins-btn');
  const createBtn = container.querySelector('#create-admin-btn');
  const prevBtn = container.querySelector('#sa-prev-page-btn');
  const nextBtn = container.querySelector('#sa-next-page-btn');
  const paginationInfo = container.querySelector('#sa-pagination-info');

  const successBanner = container.querySelector('#sa-admins-success-banner');
  const successText = container.querySelector('#sa-admins-success-text');
  const closeSuccessBtn = container.querySelector('#close-success-banner-btn');

  closeSuccessBtn.addEventListener('click', () => successBanner.classList.add('hidden'));

  function showSuccess(msg) {
    successText.textContent = msg;
    successBanner.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  let adminsCache = [];

  async function loadAdmins() {
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    tableContainerEl.classList.add('hidden');

    try {
      const res = await superAdminService.listAdmins({ page: currentPage, limit });
      const admins = res?.data || [];
      const meta = res?.meta || {};
      const total = meta.total ?? admins.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      adminsCache = admins;

      loadingEl.classList.add('hidden');
      tableContainerEl.classList.remove('hidden');

      paginationInfo.textContent = `Page ${currentPage} of ${totalPages} (${total} total administrators)`;
      prevBtn.disabled = currentPage <= 1;
      nextBtn.disabled = currentPage >= totalPages;

      if (admins.length === 0) {
        tbodyEl.innerHTML = '';
        emptyEl.classList.remove('hidden');
        return;
      }

      emptyEl.classList.add('hidden');
      tbodyEl.innerHTML = admins
        .map((adm) => {
          const refCode = adm._id ? adm._id.slice(-6).toUpperCase() : 'ADMIN';
          const permsCount = Array.isArray(adm.permissions) ? adm.permissions.length : 0;
          const regDate = formatDate(adm.createdAt);
          const lastLogin = adm.lastLoginAt ? formatDateTime(adm.lastLoginAt) : 'Never';

          return `
            <tr class="hover:bg-slate-50/80 transition">
              <td class="px-4 py-3 font-mono text-[11px] text-slate-500">
                <span class="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 font-bold">
                  #${refCode}
                </span>
                <span class="block text-[10px] text-slate-400 mt-1 select-all font-mono">${adm._id}</span>
              </td>
              <td class="px-4 py-3 font-medium text-slate-900">
                <div class="text-slate-900 font-semibold">${adm.fullName || 'Unnamed'}</div>
                <div class="text-[11px] text-slate-500 font-mono mt-0.5">${adm.email}</div>
              </td>
              <td class="px-4 py-3 text-slate-600 font-mono text-xs">
                ${adm.mobile || '—'}
              </td>
              <td class="px-4 py-3">
                ${getAccountStatusBadge(adm.accountStatus)}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1.5 flex-wrap max-w-xs">
                  <span class="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-purple-700 border border-slate-200 font-mono font-bold">
                    ${permsCount} Permissions
                  </span>
                  ${
                    permsCount > 0
                      ? `<span class="text-[10px] text-slate-500 truncate max-w-[140px]" title="${(adm.permissions || []).join(', ')}">
                          ${(adm.permissions || []).slice(0, 2).join(', ')}${permsCount > 2 ? '...' : ''}
                        </span>`
                      : '<span class="text-[10px] text-slate-400">No permissions</span>'
                  }
                </div>
              </td>
              <td class="px-4 py-3 text-slate-500 text-[11px] whitespace-nowrap">
                <div>Created: ${regDate}</div>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">Last login: ${lastLogin}</div>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button data-action="edit-profile" data-id="${adm._id}" class="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-purple-500/20">
                    Profile & Status
                  </button>
                  <button data-action="edit-perms" data-id="${adm._id}" class="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium text-xs border border-purple-200 transition flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-purple-500/20">
                    <span>Permissions</span>
                    <span class="text-[10px]" aria-hidden="true">🔒</span>
                  </button>
                </div>
              </td>
            </tr>
          `;
        })
        .join('');
    } catch (err) {
      loadingEl.classList.add('hidden');
      errorEl.classList.remove('hidden');
      errorEl.innerHTML = `
        <div class="max-w-md mx-auto p-6 rounded-2xl bg-white border border-rose-200 text-center shadow-sm">
          <p class="text-sm font-semibold text-rose-700 mb-2">Failed to load administrator directory</p>
          <p class="text-xs text-slate-500 mb-4">${err?.message || 'Request failed'}</p>
          <button id="retry-admins-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition">
            Retry
          </button>
        </div>
      `;
      const retryBtn = errorEl.querySelector('#retry-admins-btn');
      if (retryBtn) retryBtn.addEventListener('click', loadAdmins);
    }
  }

  // Handle Create Admin Modal
  createBtn.addEventListener('click', () => {
    const permissionsHtml = PERMISSION_GROUPS.map((grp) => `
      <div class="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <span class="text-[11px] font-bold text-purple-800 block mb-1">${grp.group}</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          ${grp.permissions.map((p) => `
            <label class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
              <input type="checkbox" name="create-perm" value="${p.id}" class="rounded border-slate-300 text-purple-600 focus:ring-purple-500"/>
              <span class="text-[11px]">${p.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');

    const contentHtml = `
      <div class="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <label for="create-admin-name" class="block text-xs font-semibold text-slate-700 mb-1">Full Name <span class="text-rose-600">*</span></label>
          <input type="text" id="create-admin-name" required placeholder="e.g. Sazzad Hossain" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"/>
        </div>

        <div>
          <label for="create-admin-email" class="block text-xs font-semibold text-slate-700 mb-1">Email Address <span class="text-rose-600">*</span></label>
          <input type="email" id="create-admin-email" required placeholder="admin@jonoshor.org" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-mono"/>
        </div>

        <div>
          <label for="create-admin-password" class="block text-xs font-semibold text-slate-700 mb-1">Initial Password <span class="text-rose-600">*</span></label>
          <input type="password" id="create-admin-password" required placeholder="Minimum 8 characters with strong complexity" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"/>
        </div>

        <div>
          <label for="create-admin-mobile" class="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (Optional)</label>
          <input type="tel" id="create-admin-mobile" placeholder="+88017xxxxxxxx" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-mono"/>
        </div>

        <div class="pt-2 border-t border-slate-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-slate-900">Initial RBAC Permissions</span>
            <div class="flex items-center gap-2 text-[10px]">
              <button type="button" id="select-all-create-perms" class="text-purple-700 hover:underline">Select All</button>
              <span class="text-slate-300">•</span>
              <button type="button" id="clear-all-create-perms" class="text-slate-500 hover:underline">Clear All</button>
            </div>
          </div>
          <div class="space-y-2">
            ${permissionsHtml}
          </div>
        </div>
      </div>
    `;

    const modal = showModal({
      title: 'Provision New Administrator',
      description: 'Create an administrator account and assign granular role-based permissions.',
      contentHtml,
      confirmText: 'Create Administrator',
      confirmColor: 'bg-purple-700 hover:bg-purple-800 text-white',
      onConfirm: async (modalEl) => {
        const name = modalEl.querySelector('#create-admin-name').value.trim();
        const email = modalEl.querySelector('#create-admin-email').value.trim();
        const password = modalEl.querySelector('#create-admin-password').value;
        const mobile = modalEl.querySelector('#create-admin-mobile').value.trim();

        if (!name || !email || !password) {
          throw new Error('Name, email, and password are required.');
        }

        const checkedBoxes = Array.from(modalEl.querySelectorAll('input[name="create-perm"]:checked'));
        const permissions = checkedBoxes.map((cb) => cb.value);

        await superAdminService.createAdmin({
          fullName: name,
          email,
          password,
          mobile: mobile || undefined,
          permissions,
        });

        showSuccess(`Administrator '${name}' was provisioned successfully.`);
        await loadAdmins();
      },
    });

    const selectAllBtn = modal.querySelector('#select-all-create-perms');
    const clearAllBtn = modal.querySelector('#clear-all-create-perms');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        modal.querySelectorAll('input[name="create-perm"]').forEach((cb) => (cb.checked = true));
      });
    }
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        modal.querySelectorAll('input[name="create-perm"]').forEach((cb) => (cb.checked = false));
      });
    }
  });

  // Table Action Event Delegation
  tbodyEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const adminId = btn.dataset.id;
    const admin = adminsCache.find((a) => a._id === adminId);
    if (!admin) return;

    if (action === 'edit-profile') {
      handleEditProfile(admin);
    } else if (action === 'edit-perms') {
      handleEditPermissions(admin);
    }
  });

  // 1. Edit Profile & Account Status
  function handleEditProfile(admin) {
    const contentHtml = `
      <div class="space-y-4">
        <div>
          <label for="edit-admin-name" class="block text-xs font-semibold text-slate-700 mb-1">Full Name <span class="text-rose-600">*</span></label>
          <input type="text" id="edit-admin-name" value="${admin.fullName || ''}" required class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"/>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <input type="text" disabled value="${admin.email}" class="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 font-mono cursor-not-allowed"/>
        </div>

        <div>
          <label for="edit-admin-mobile" class="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
          <input type="tel" id="edit-admin-mobile" value="${admin.mobile || ''}" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-mono"/>
        </div>

        <div>
          <label for="edit-admin-status" class="block text-xs font-semibold text-slate-700 mb-1">Account Status <span class="text-rose-600">*</span></label>
          <select id="edit-admin-status" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600">
            <option value="active" ${admin.accountStatus === 'active' ? 'selected' : ''}>Active — Normal administrative operational access</option>
            <option value="suspended" ${admin.accountStatus === 'suspended' ? 'selected' : ''}>Suspended — Temporary login and operations freeze</option>
            <option value="blocked" ${admin.accountStatus === 'blocked' ? 'selected' : ''}>Blocked — Permanent account revocation</option>
          </select>
        </div>
      </div>
    `;

    showModal({
      title: 'Update Administrator Profile & Status',
      description: `Modifying settings for ${admin.fullName} (#${admin._id.slice(-6).toUpperCase()})`,
      contentHtml,
      confirmText: 'Save Changes',
      confirmColor: 'bg-purple-700 hover:bg-purple-800 text-white',
      onConfirm: async (modalEl) => {
        const fullName = modalEl.querySelector('#edit-admin-name').value.trim();
        const mobile = modalEl.querySelector('#edit-admin-mobile').value.trim();
        const accountStatus = modalEl.querySelector('#edit-admin-status').value;

        await superAdminService.updateAdmin(admin._id, {
          fullName,
          mobile,
          accountStatus,
        });

        showSuccess(`Administrator '${fullName}' was successfully updated.`);
        await loadAdmins();
      },
    });
  }

  // 2. Edit Permissions (Protected by Re-Authentication)
  function handleEditPermissions(admin) {
    const currentPerms = new Set(admin.permissions || []);

    const permissionsHtml = PERMISSION_GROUPS.map((grp) => `
      <div class="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <span class="text-[11px] font-bold text-purple-800 block mb-1">${grp.group}</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          ${grp.permissions.map((p) => {
            const isChecked = currentPerms.has(p.id) ? 'checked' : '';
            return `
              <label class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
                <input type="checkbox" name="edit-perm" value="${p.id}" ${isChecked} class="rounded border-slate-300 text-purple-600 focus:ring-purple-500"/>
                <span class="text-[11px]">${p.label}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    const contentHtml = `
      <div class="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
        <div class="p-3 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-800 leading-relaxed">
          🔒 <strong>Security Policy:</strong> Modifying administrative permissions is a high-privilege action. Saving updates requires password confirmation and Two-Factor Authentication (2FA) verification.
        </div>

        <div class="flex items-center justify-between pt-1">
          <span class="text-xs font-semibold text-slate-900">RBAC Permission Matrix</span>
          <div class="flex items-center gap-2 text-[10px]">
            <button type="button" id="select-all-edit-perms" class="text-purple-700 hover:underline">Select All</button>
            <span class="text-slate-300">•</span>
            <button type="button" id="clear-all-edit-perms" class="text-slate-500 hover:underline">Clear All</button>
          </div>
        </div>

        <div class="space-y-2">
          ${permissionsHtml}
        </div>
      </div>
    `;

    const modal = showModal({
      title: 'Administrator Permission Matrix (RBAC)',
      description: `Configure access privileges for ${admin.fullName} (${admin.email})`,
      contentHtml,
      confirmText: 'Proceed to Authentication →',
      confirmColor: 'bg-purple-700 hover:bg-purple-800 text-white',
      onConfirm: async (modalEl) => {
        const checkedBoxes = Array.from(modalEl.querySelectorAll('input[name="edit-perm"]:checked'));
        const newPermissions = checkedBoxes.map((cb) => cb.value);

        // Prompt Re-Authentication Modal for password + 2FA
        return new Promise((resolve, reject) => {
          showReAuthModal({
            title: 'Executive Re-Authentication Required',
            description: `Provide your password and 2FA authenticator code to apply ${newPermissions.length} permissions to ${admin.fullName}.`,
            onSuccess: async (reAuthToken) => {
              try {
                await superAdminService.updatePermissions(admin._id, {
                  permissions: newPermissions,
                  reAuthToken,
                });

                showSuccess(`Permissions for '${admin.fullName}' were successfully updated.`);
                await loadAdmins();
                resolve();
              } catch (err) {
                reject(err);
              }
            },
          });
        });
      },
    });

    const selectAllBtn = modal.querySelector('#select-all-edit-perms');
    const clearAllBtn = modal.querySelector('#clear-all-edit-perms');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        modal.querySelectorAll('input[name="edit-perm"]').forEach((cb) => (cb.checked = true));
      });
    }
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        modal.querySelectorAll('input[name="edit-perm"]').forEach((cb) => (cb.checked = false));
      });
    }
  }

  // General Controls
  refreshBtn.addEventListener('click', loadAdmins);

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadAdmins();
    }
  });

  nextBtn.addEventListener('click', () => {
    currentPage++;
    loadAdmins();
  });

  await loadAdmins();
}
