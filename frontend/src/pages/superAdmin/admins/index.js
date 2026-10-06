import { superAdminService } from '../../../services/superAdmin/superAdminService.js';
import { renderSuperAdminNav } from '../../../components/superAdmin/SuperAdminNav.js';
import { getAccountStatusBadge } from '../../../components/admin/StatusBadge.js';
import { formatDate, formatDateTime } from '../../../utils/formatters.js';
import { showModal } from '../../../components/admin/ActionModal.js';
import { showReAuthModal } from '../../../components/superAdmin/ReAuthModal.js';

// Granular permissions grouped by domain
const PERMISSION_GROUPS = [
  {
    group: 'অভিযোগ পর্যালোচনা (Complaints)',
    permissions: [
      { id: 'complaint.read', label: 'অভিযোগ পাঠ (Read)' },
      { id: 'complaint.review', label: 'অভিযোগ পর্যালোচনা (Review)' },
      { id: 'complaint.assign', label: 'পর্যালোচক নিয়োগ (Assign)' },
      { id: 'complaint.screen', label: 'বাছাইকরণ (Screen)' },
      { id: 'complaint.verify', label: 'যাচাইকরণ সিদ্ধান্ত (Verify)' },
      { id: 'complaint.publish', label: 'প্রকাশনা অনুমোদন (Publish)' },
    ],
  },
  {
    group: 'প্রমাণ ব্যবস্থাপনা (Evidence)',
    permissions: [
      { id: 'evidence.read', label: 'প্রমাণ পাঠ (Read)' },
      { id: 'evidence.review', label: 'প্রমাণ পর্যালোচনা (Review)' },
      { id: 'evidence.publish', label: 'প্রমাণ প্রকাশনা (Publish)' },
      { id: 'evidence.delete', label: 'প্রমাণ অপসারণ (Delete)' },
    ],
  },
  {
    group: 'আইনি ও কর্তৃপক্ষ ট্র্যাকিং (Legal)',
    permissions: [
      { id: 'legal.read', label: 'আইনি কেস পাঠ (Read)' },
      { id: 'legal.create', label: 'আইনি রেকর্ড তৈরি (Create)' },
      { id: 'legal.update', label: 'টাইমলাইন হালনাগাদ (Update)' },
    ],
  },
  {
    group: 'ব্যবহারকারী ব্যবস্থাপনা (User)',
    permissions: [
      { id: 'user.read', label: 'ব্যবহারকারী প্রোফাইল পাঠ (Read)' },
      { id: 'user.manage', label: 'অ্যাকাউন্ট অবস্থা পরিবর্তন (Manage)' },
    ],
  },
  {
    group: 'যুক্ত হোন আবেদন (Join Us)',
    permissions: [
      { id: 'joinUs.read', label: 'আবেদন পাঠ (Read)' },
      { id: 'joinUs.notes', label: 'মন্তব্য যুক্তকরণ (Notes)' },
      { id: 'joinUs.export', label: 'ডাটা এক্সপোর্ট (Export)' },
      { id: 'joinUs.delete', label: 'আবেদন মুছে ফেলা (Delete)' },
    ],
  },
  {
    group: 'বার্তা ও নোটিফিকেশন (Messaging)',
    permissions: [
      { id: 'notification.send', label: 'নোটিফিকেশন প্রেরণ (Send)' },
      { id: 'message.read', label: 'বার্তা পাঠ (Read)' },
      { id: 'message.send', label: 'বার্তা প্রেরণ (Send)' },
    ],
  },
  {
    group: 'অডিট ও নিরাপত্তা পরিদর্শন (Audit)',
    permissions: [
      { id: 'audit.read', label: 'অডিট লগ পাঠ (Read)' },
      { id: 'security.read', label: 'নিরাপত্তা লগ পাঠ (Read)' },
    ],
  },
];

export async function renderSuperAdminAdminsPage(container) {
  let currentPage = 1;
  const limit = 20;

  container.innerHTML = `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      ${renderSuperAdminNav('admins')}

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/40">
          <div>
            <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>অ্যাডমিন অ্যাকাউন্ট ব্যবস্থাপনা</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                Admin Governance
              </span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">
              প্ল্যাটফর্মের সকল অনুমোদিত অ্যাডমিন তালিকা, স্ট্যাটাস পরিবর্তন এবং সুনির্দিষ্ট দানাদার অনুমতি (RBAC) নিয়ন্ত্রণ।
            </p>
          </div>
          <div class="flex items-center gap-2.5">
            <button id="refresh-admins-btn" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 text-xs font-semibold border border-purple-900/60 shadow-lg transition flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              রিফ্রেশ
            </button>
            <button id="create-admin-btn" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-950/60 transition flex items-center gap-1.5">
              <span class="text-sm font-bold">+</span>
              <span>নতুন অ্যাডমিন তৈরি</span>
            </button>
          </div>
        </div>

        <!-- Success Toast Banner -->
        <div id="sa-admins-success-banner" class="hidden p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 flex items-center justify-between shadow-lg">
          <div class="flex items-center gap-2">
            <span class="text-emerald-400 font-bold text-sm">✓</span>
            <span id="sa-admins-success-text">কার্যক্রম সফল হয়েছে।</span>
          </div>
          <button id="close-success-banner-btn" class="text-emerald-400 hover:text-emerald-200 font-bold text-sm ml-4">✕</button>
        </div>

        <!-- Main State Containers -->
        <div id="sa-admins-loading" class="py-20 text-center">
          <div class="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-400 text-sm">অ্যাডমিন তালিকা লোড হচ্ছে...</p>
        </div>

        <div id="sa-admins-error" class="hidden py-16 text-center"></div>

        <div id="sa-admins-table-container" class="hidden space-y-4">
          <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-850/80 text-slate-400">
                  <th class="px-4 py-3 font-semibold">রেফারেন্স / আইডি</th>
                  <th class="px-4 py-3 font-semibold">নাম ও ইমেইল</th>
                  <th class="px-4 py-3 font-semibold">মোবাইল</th>
                  <th class="px-4 py-3 font-semibold">অবস্থা</th>
                  <th class="px-4 py-3 font-semibold">অনুমতিসমূহ (RBAC)</th>
                  <th class="px-4 py-3 font-semibold">তৈরি ও শেষ লগইন</th>
                  <th class="px-4 py-3 font-semibold text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody id="sa-admins-table-body" class="divide-y divide-slate-800/80 text-slate-300">
                <!-- Rows injected dynamically -->
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div id="sa-admins-empty" class="hidden py-16 text-center rounded-2xl border border-slate-800 bg-slate-900">
            <div class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
              👥
            </div>
            <p class="text-sm font-semibold text-slate-300">কোনো অ্যাডমিন অ্যাকাউন্ট পাওয়া যায়নি</p>
            <p class="text-xs text-slate-500 mt-1">সুপার অ্যাডমিন হিসেবে আপনি নতুন অ্যাডমিন তৈরি করতে পারেন।</p>
          </div>

          <!-- Pagination Bar -->
          <div id="sa-admins-pagination" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-400">
            <span id="sa-pagination-info">পৃষ্ঠা ১</span>
            <div class="flex items-center gap-2">
              <button id="sa-prev-page-btn" class="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                ← পূর্ববর্তী
              </button>
              <button id="sa-next-page-btn" class="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                পরবর্তী →
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

      paginationInfo.textContent = `পৃষ্ঠা ${currentPage} / ${totalPages} (মোট ${total} জন অ্যাডমিন)`;
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
          const lastLogin = adm.lastLoginAt ? formatDateTime(adm.lastLoginAt) : 'লগইন হয়নি';

          return `
            <tr class="hover:bg-slate-850/40 transition">
              <td class="px-4 py-3 font-mono text-[11px] text-slate-400">
                <span class="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/80 text-purple-300 font-bold">
                  #${refCode}
                </span>
                <span class="block text-[10px] text-slate-500 mt-1 select-all font-mono">${adm._id}</span>
              </td>
              <td class="px-4 py-3 font-medium text-white">
                <div class="text-slate-100 font-semibold">${adm.fullName || 'নামবিহীন'}</div>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5">${adm.email}</div>
              </td>
              <td class="px-4 py-3 text-slate-300 font-mono text-xs">
                ${adm.mobile || '—'}
              </td>
              <td class="px-4 py-3">
                ${getAccountStatusBadge(adm.accountStatus)}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1.5 flex-wrap max-w-xs">
                  <span class="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-purple-300 border border-slate-700 font-mono font-bold">
                    ${permsCount}টি অনুমতি
                  </span>
                  ${
                    permsCount > 0
                      ? `<span class="text-[10px] text-slate-500 truncate max-w-[140px]" title="${(adm.permissions || []).join(', ')}">
                          ${(adm.permissions || []).slice(0, 2).join(', ')}${permsCount > 2 ? '...' : ''}
                        </span>`
                      : '<span class="text-[10px] text-slate-500">কোনো অনুমতি নেই</span>'
                  }
                </div>
              </td>
              <td class="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">
                <div>নিবন্ধন: ${regDate}</div>
                <div class="text-[10px] text-slate-500 font-mono mt-0.5">শেষ: ${lastLogin}</div>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button data-action="edit-profile" data-id="${adm._id}" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition">
                    প্রোফাইল ও অবস্থা
                  </button>
                  <button data-action="edit-perms" data-id="${adm._id}" class="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 font-medium text-xs border border-purple-800/80 transition flex items-center gap-1">
                    <span>অনুমতি</span>
                    <span class="text-[10px]">🔒</span>
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
        <div class="max-w-md mx-auto p-6 rounded-2xl bg-slate-900 border border-red-900/60 text-center">
          <p class="text-sm font-semibold text-red-400 mb-2">তালিকা লোড করা যায়নি</p>
          <p class="text-xs text-slate-400 mb-4">${err?.message || 'অনুরোধ ব্যর্থ হয়েছে'}</p>
          <button id="retry-admins-btn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl transition">
            পুনরায় চেষ্টা করুন
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
      <div class="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[11px] font-bold text-purple-300 block mb-1">${grp.group}</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          ${grp.permissions.map((p) => `
            <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
              <input type="checkbox" name="create-perm" value="${p.id}" class="rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-900"/>
              <span class="text-[11px]">${p.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');

    const contentHtml = `
      <div class="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">পূর্ণ নাম <span class="text-rose-400">*</span></label>
          <input type="text" id="create-admin-name" required placeholder="যেমন: সাজ্জাদ হোসেন" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"/>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">ইমেইল ঠিকানা <span class="text-rose-400">*</span></label>
          <input type="email" id="create-admin-email" required placeholder="admin@jonoshor.org" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"/>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">প্রাথমিক পাসওয়ার্ড <span class="text-rose-400">*</span></label>
          <input type="password" id="create-admin-password" required placeholder="কমপক্ষে ৮ অক্ষরের শক্তিশালী পাসওয়ার্ড" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"/>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">মোবাইল নম্বর (ঐচ্ছিক)</label>
          <input type="tel" id="create-admin-mobile" placeholder="০১৭xxxxxxxx" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"/>
        </div>

        <div class="pt-2 border-t border-slate-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-white">প্রারম্ভিক অনুমতিসমূহ (Initial RBAC Permissions)</span>
            <div class="flex items-center gap-2 text-[10px]">
              <button type="button" id="select-all-create-perms" class="text-purple-400 hover:underline">সব নির্বাচন</button>
              <span>•</span>
              <button type="button" id="clear-all-create-perms" class="text-slate-400 hover:underline">সব বাতিল</button>
            </div>
          </div>
          <div class="space-y-2">
            ${permissionsHtml}
          </div>
        </div>
      </div>
    `;

    const modal = showModal({
      title: 'নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি',
      description: 'প্ল্যাটফর্মে নতুন প্রশাসনিক সদস্য যুক্ত করুন ও অনুমতি নির্ধারণ করুন।',
      contentHtml,
      confirmText: 'অ্যাকাউন্ট তৈরি করুন',
      confirmColor: 'bg-purple-600 hover:bg-purple-500',
      onConfirm: async (modalEl) => {
        const name = modalEl.querySelector('#create-admin-name').value.trim();
        const email = modalEl.querySelector('#create-admin-email').value.trim();
        const password = modalEl.querySelector('#create-admin-password').value;
        const mobile = modalEl.querySelector('#create-admin-mobile').value.trim();

        if (!name || !email || !password) {
          throw new Error('নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক');
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

        showSuccess(`অ্যাডমিন '${name}' সফলভাবে তৈরি করা হয়েছে।`);
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
          <label class="block text-xs font-semibold text-slate-300 mb-1">পূর্ণ নাম <span class="text-rose-400">*</span></label>
          <input type="text" id="edit-admin-name" value="${admin.fullName || ''}" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"/>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">ইমেইল ঠিকানা</label>
          <input type="text" disabled value="${admin.email}" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono cursor-not-allowed"/>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">মোবাইল নম্বর</label>
          <input type="tel" id="edit-admin-mobile" value="${admin.mobile || ''}" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"/>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">অ্যাকাউন্ট অবস্থা (Status) <span class="text-rose-400">*</span></label>
          <select id="edit-admin-status" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500">
            <option value="active" ${admin.accountStatus === 'active' ? 'selected' : ''}>সক্রিয় (Active) — স্বাভাবিক প্রশাসনিক প্রবেশাধিকার</option>
            <option value="suspended" ${admin.accountStatus === 'suspended' ? 'selected' : ''}>সাময়িক স্থগিত (Suspended) — লগইন ও কার্যক্রম সাময়িক স্থগিত</option>
            <option value="blocked" ${admin.accountStatus === 'blocked' ? 'selected' : ''}>অবরুদ্ধ (Blocked) — অ্যাকাউন্ট নিষিদ্ধ</option>
          </select>
        </div>
      </div>
    `;

    showModal({
      title: 'অ্যাডমিন প্রোফাইল ও অবস্থা হালনাগাদ',
      description: `${admin.fullName} (#${admin._id.slice(-6).toUpperCase()}) এর তথ্য পরিবর্তন`,
      contentHtml,
      confirmText: 'হালনাগাদ সংরক্ষণ করুন',
      confirmColor: 'bg-purple-600 hover:bg-purple-500',
      onConfirm: async (modalEl) => {
        const fullName = modalEl.querySelector('#edit-admin-name').value.trim();
        const mobile = modalEl.querySelector('#edit-admin-mobile').value.trim();
        const accountStatus = modalEl.querySelector('#edit-admin-status').value;

        await superAdminService.updateAdmin(admin._id, {
          fullName,
          mobile,
          accountStatus,
        });

        showSuccess(`অ্যাডমিন '${fullName}' এর তথ্য সফলভাবে হালনাগাদ করা হয়েছে।`);
        await loadAdmins();
      },
    });
  }

  // 2. Edit Permissions (Protected by Re-Authentication)
  function handleEditPermissions(admin) {
    const currentPerms = new Set(admin.permissions || []);

    const permissionsHtml = PERMISSION_GROUPS.map((grp) => `
      <div class="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
        <span class="text-[11px] font-bold text-purple-300 block mb-1">${grp.group}</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          ${grp.permissions.map((p) => {
            const isChecked = currentPerms.has(p.id) ? 'checked' : '';
            return `
              <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                <input type="checkbox" name="edit-perm" value="${p.id}" ${isChecked} class="rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-900"/>
                <span class="text-[11px]">${p.label}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    const contentHtml = `
      <div class="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
        <div class="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-300 leading-relaxed">
          🔒 <strong>নিরাপত্তা নীতি:</strong> প্রশাসনিক অনুমতি পরিবর্তন একটি সংবেদনশীল ও বিশেষাধিকারপ্রাপ্ত কার্য। এটি সংরক্ষণের সময় পাসওয়ার্ড ও ২-ফ্যাক্টর অথেনটিকেটর কোড (Re-Auth) দ্বারা চূড়ান্ত প্রমাণীকরণ আবশ্যক।
        </div>

        <div class="flex items-center justify-between pt-1">
          <span class="text-xs font-semibold text-white">অনুমতি নির্বাচন (RBAC Matrix)</span>
          <div class="flex items-center gap-2 text-[10px]">
            <button type="button" id="select-all-edit-perms" class="text-purple-400 hover:underline">সব নির্বাচন</button>
            <span>•</span>
            <button type="button" id="clear-all-edit-perms" class="text-slate-400 hover:underline">সব বাতিল</button>
          </div>
        </div>

        <div class="space-y-2">
          ${permissionsHtml}
        </div>
      </div>
    `;

    const modal = showModal({
      title: 'অ্যাডমিন অনুমতি ব্যবস্থাপনা (Permissions RBAC)',
      description: `${admin.fullName} (${admin.email}) এর অনুমতি সমন্বয়`,
      contentHtml,
      confirmText: 'অনুমতি পরিবর্তন এগিয়ে নিন →',
      confirmColor: 'bg-purple-600 hover:bg-purple-500',
      onConfirm: async (modalEl) => {
        const checkedBoxes = Array.from(modalEl.querySelectorAll('input[name="edit-perm"]:checked'));
        const newPermissions = checkedBoxes.map((cb) => cb.value);

        // Prompt Re-Authentication Modal for password + 2FA
        return new Promise((resolve, reject) => {
          showReAuthModal({
            title: 'অনুমতি পরিবর্তনের জন্য ২-ফ্যাক্টর পুনঃপ্রমাণীকরণ',
            description: `${admin.fullName}-এর নতুন ${newPermissions.length}টি অনুমতি কার্যকর করতে পাসওয়ার্ড ও 2FA কোড প্রদান করুন।`,
            onSuccess: async (reAuthToken) => {
              try {
                await superAdminService.updatePermissions(admin._id, {
                  permissions: newPermissions,
                  reAuthToken,
                });

                showSuccess(`অ্যাডমিন '${admin.fullName}' এর অনুমতি সফলভাবে হালনাগাদ করা হয়েছে।`);
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
