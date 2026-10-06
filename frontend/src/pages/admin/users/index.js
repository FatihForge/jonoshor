import { adminUserService } from '../../../services/admin/adminUserService.js';
import { renderAdminNav } from '../../../components/admin/AdminNav.js';
import { getAccountStatusBadge } from '../../../components/admin/StatusBadge.js';
import { formatDate, formatDateTime } from '../../../utils/formatters.js';
import { authService } from '../../../services/auth/authService.js';

export async function renderAdminUsersPage(container) {
  let currentPage = 1;
  const limit = 20;
  let currentStatus = '';

  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = currentUser?.accountType === 'superAdmin';
  const hasUserReadPermission = isSuperAdmin || (Array.isArray(currentUser?.permissions) && currentUser.permissions.includes('user.read'));

  container.innerHTML = `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      ${renderAdminNav('users')}

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>ব্যবহারকারী ব্যবস্থাপনা</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                User Management
              </span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">
              নিবন্ধিত নাগরিকদের অ্যাকাউন্ট প্রোফাইল ও অ্যাকাউন্ট অবস্থা (সক্রিয়, সাময়িক স্থগিত, অবরুদ্ধ) পর্যবেক্ষণ।
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button id="refresh-users-btn" class="px-3.5 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/80 transition flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              রিফ্রেশ করুন
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <label class="text-xs font-medium text-slate-400">অ্যাকাউন্ট অবস্থা:</label>
            <select id="filter-user-status" class="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
              <option value="">সকল অবস্থা (All)</option>
              <option value="active">সক্রিয় (Active)</option>
              <option value="suspended">সাময়িক স্থগিত (Suspended)</option>
              <option value="blocked">অবরুদ্ধ (Blocked)</option>
            </select>
          </div>
          <div id="users-count-summary" class="text-xs text-slate-400 font-mono">
            —
          </div>
        </div>

        <!-- Main State Containers -->
        <div id="users-loading" class="py-20 text-center">
          <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-400 text-sm">ব্যবহারকারী তালিকা লোড হচ্ছে...</p>
        </div>

        <div id="users-error" class="hidden py-16 text-center"></div>

        <div id="users-permission-denied" class="hidden max-w-lg mx-auto my-12 p-8 rounded-2xl bg-slate-900 border border-amber-900/60 text-center shadow-xl">
          <div class="w-12 h-12 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 class="text-lg font-bold text-white mb-2">অনুমতি সীমাবদ্ধ (Permission Required)</h2>
          <p class="text-xs text-slate-400 mb-4">ব্যবহারকারী তালিকা দেখার জন্য আপনার <code class="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px]">user.read</code> অনুমতি প্রয়োজন।</p>
          <a href="#/admin/dashboard" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition inline-block">
            ড্যাশবোর্ডে ফিরুন
          </a>
        </div>

        <div id="users-table-container" class="hidden space-y-4">
          <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-lg">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-850/60 text-slate-400">
                  <th class="px-4 py-3 font-semibold">রেফারেন্স / আইডি</th>
                  <th class="px-4 py-3 font-semibold">নাম</th>
                  <th class="px-4 py-3 font-semibold">ইমেইল / মোবাইল</th>
                  <th class="px-4 py-3 font-semibold">নিবন্ধন তারিখ</th>
                  <th class="px-4 py-3 font-semibold">সর্বশেষ আপডেট</th>
                  <th class="px-4 py-3 font-semibold">অবস্থা</th>
                  <th class="px-4 py-3 font-semibold text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody id="users-table-body" class="divide-y divide-slate-800/80 text-slate-300">
                <!-- Rows injected dynamically -->
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div id="users-empty" class="hidden py-16 text-center rounded-xl border border-slate-800 bg-slate-900">
            <div class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <p class="text-sm font-semibold text-slate-300">কোন ব্যবহারকারী পাওয়া যায়নি</p>
            <p class="text-xs text-slate-500 mt-1">নির্বাচিত ফিল্টারের অধীনে কোনো রেকর্ড বিদ্যমান নেই।</p>
          </div>

          <!-- Pagination Bar -->
          <div id="users-pagination" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-400">
            <span id="pagination-info">পৃষ্ঠা ১</span>
            <div class="flex items-center gap-2">
              <button id="prev-page-btn" class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                ← পূর্ববর্তী
              </button>
              <button id="next-page-btn" class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                পরবর্তী →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  const loadingEl = container.querySelector('#users-loading');
  const errorEl = container.querySelector('#users-error');
  const permDeniedEl = container.querySelector('#users-permission-denied');
  const tableContainerEl = container.querySelector('#users-table-container');
  const tbodyEl = container.querySelector('#users-table-body');
  const emptyEl = container.querySelector('#users-empty');
  const filterStatusEl = container.querySelector('#filter-user-status');
  const refreshBtn = container.querySelector('#refresh-users-btn');
  const prevBtn = container.querySelector('#prev-page-btn');
  const nextBtn = container.querySelector('#next-page-btn');
  const paginationInfo = container.querySelector('#pagination-info');
  const countSummary = container.querySelector('#users-count-summary');

  async function loadUsers() {
    if (!hasUserReadPermission) {
      loadingEl.classList.add('hidden');
      permDeniedEl.classList.remove('hidden');
      return;
    }

    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    permDeniedEl.classList.add('hidden');
    tableContainerEl.classList.add('hidden');

    try {
      const res = await adminUserService.listUsers({
        page: currentPage,
        limit,
        status: currentStatus || undefined,
      });

      const users = res?.data || [];
      const meta = res?.meta || {};
      const total = meta.total ?? users.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      loadingEl.classList.add('hidden');
      tableContainerEl.classList.remove('hidden');

      countSummary.textContent = `মোট: ${total} জন`;
      paginationInfo.textContent = `পৃষ্ঠা ${currentPage} / ${totalPages} (মোট ${total} জন)`;

      prevBtn.disabled = currentPage <= 1;
      nextBtn.disabled = currentPage >= totalPages;

      if (users.length === 0) {
        tbodyEl.innerHTML = '';
        emptyEl.classList.remove('hidden');
        return;
      }

      emptyEl.classList.add('hidden');
      tbodyEl.innerHTML = users
        .map((u) => {
          const refCode = u._id ? u._id.slice(-6).toUpperCase() : 'USER';
          const regDate = formatDate(u.createdAt);
          const updateDate = u.updatedAt ? formatDateTime(u.updatedAt) : '—';
          const emailVerifiedIcon = u.emailVerified
            ? '<span class="text-emerald-400 ml-1" title="ইমেইল যাচাইকৃত">✓</span>'
            : '';
          const mobileText = u.mobile
            ? `<div class="text-[11px] text-slate-400 mt-0.5">📞 ${u.mobile}</div>`
            : '';

          return `
            <tr class="hover:bg-slate-850/40 transition">
              <td class="px-4 py-3 font-mono text-[11px] text-slate-400">
                <span class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  #${refCode}
                </span>
                <span class="block text-[10px] text-slate-500 mt-1 font-mono select-all">${u._id}</span>
              </td>
              <td class="px-4 py-3 font-medium text-white">
                <a href="#/admin/users/${u._id}" class="hover:text-emerald-400 transition">
                  ${u.fullName || 'নামবিহীন'}
                </a>
                <span class="block text-[10px] text-slate-500 font-mono mt-0.5">
                  প্রোভাইডার: ${u.authProvider || 'local'}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-300">
                <div class="flex items-center">
                  <span>${u.email || '—'}</span>
                  ${emailVerifiedIcon}
                </div>
                ${mobileText}
              </td>
              <td class="px-4 py-3 text-slate-400 whitespace-nowrap">
                ${regDate}
              </td>
              <td class="px-4 py-3 text-slate-400 whitespace-nowrap">
                ${updateDate}
              </td>
              <td class="px-4 py-3">
                ${getAccountStatusBadge(u.accountStatus)}
              </td>
              <td class="px-4 py-3 text-right">
                <a href="#/admin/users/${u._id}" class="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-medium transition text-xs border border-slate-700/80">
                  <span>বিবরণ</span>
                  <span>→</span>
                </a>
              </td>
            </tr>
          `;
        })
        .join('');
    } catch (err) {
      loadingEl.classList.add('hidden');
      const isForbidden = err?.status === 403 || err?.message?.includes('permission') || err?.message?.includes('403');
      if (isForbidden) {
        permDeniedEl.classList.remove('hidden');
      } else {
        errorEl.classList.remove('hidden');
        errorEl.innerHTML = `
          <div class="max-w-md mx-auto p-6 rounded-xl bg-slate-900 border border-red-900/60 text-center">
            <p class="text-sm font-semibold text-red-400 mb-2">তালিকা লোড করতে সমস্যা হয়েছে</p>
            <p class="text-xs text-slate-400 mb-4">${err?.message || 'অপ্রত্যাশিত ত্রুটি ঘটেছে'}</p>
            <button id="retry-users-btn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition">
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        `;
        const retryBtn = errorEl.querySelector('#retry-users-btn');
        if (retryBtn) retryBtn.addEventListener('click', loadUsers);
      }
    }
  }

  // Event Listeners
  filterStatusEl.addEventListener('change', (e) => {
    currentStatus = e.target.value;
    currentPage = 1;
    loadUsers();
  });

  refreshBtn.addEventListener('click', () => {
    loadUsers();
  });

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadUsers();
    }
  });

  nextBtn.addEventListener('click', () => {
    currentPage++;
    loadUsers();
  });

  await loadUsers();
}
