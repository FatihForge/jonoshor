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
    <div class="min-h-screen bg-slate-50 text-slate-900">
      ${renderAdminNav('users')}

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>User Directory & Management</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                Citizen Accounts
              </span>
            </h1>
            <p class="text-xs text-slate-500 mt-1">
              Registered citizen accounts, verification states, and administrative account moderation.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button id="refresh-users-btn" class="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300 transition flex items-center gap-1.5 shadow-2xs">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <label for="filter-user-status" class="text-xs font-medium text-slate-700">Account Status:</label>
            <select id="filter-user-status" class="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <div id="users-count-summary" class="text-xs text-slate-500 font-mono">
            —
          </div>
        </div>

        <!-- Main State Containers -->
        <div id="users-loading" class="py-20 text-center" role="status">
          <div class="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true"></div>
          <p class="text-slate-500 text-sm">Loading users directory...</p>
        </div>

        <div id="users-error" class="hidden py-16 text-center" role="alert"></div>

        <div id="users-permission-denied" class="hidden max-w-lg mx-auto my-12 p-8 rounded-2xl bg-white border border-amber-300 text-center shadow-sm">
          <div class="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 class="text-lg font-bold text-slate-900 mb-2">Permission Required</h2>
          <p class="text-xs text-slate-600 mb-4">You require the <code class="px-1.5 py-0.5 rounded bg-slate-100 text-amber-800 font-mono text-[11px]">user.read</code> permission to view citizen account directories.</p>
          <a href="#/admin/dashboard" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition inline-block">
            Return to Dashboard
          </a>
        </div>

        <div id="users-table-container" class="hidden space-y-4">
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table class="w-full text-left text-xs border-collapse text-slate-700">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th scope="col" class="px-4 py-3 font-semibold">Reference / ID</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Name</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Email / Mobile</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Registration Date</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Last Updated</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" class="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody id="users-table-body" class="divide-y divide-slate-100">
                <!-- Rows injected dynamically -->
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div id="users-empty" class="hidden py-16 text-center rounded-xl border border-slate-200 bg-white">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400" aria-hidden="true">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <p class="text-sm font-semibold text-slate-800">No users found</p>
            <p class="text-xs text-slate-500 mt-1">No user accounts match the selected filter criteria.</p>
          </div>

          <!-- Pagination Bar -->
          <div id="users-pagination" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
            <span id="pagination-info">Page 1</span>
            <div class="flex items-center gap-2">
              <button id="prev-page-btn" class="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                ← Previous
              </button>
              <button id="next-page-btn" class="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                Next →
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

      countSummary.textContent = `Total: ${total} users`;
      paginationInfo.textContent = `Showing page ${currentPage} of ${totalPages} (${total} total)`;

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
            ? '<span class="text-emerald-600 ml-1 font-bold" title="Email verified">✓</span>'
            : '';
          const mobileText = u.mobile
            ? `<div class="text-[11px] text-slate-500 mt-0.5">📞 ${u.mobile}</div>`
            : '';

          return `
            <tr class="hover:bg-slate-50/80 transition">
              <td class="px-4 py-3 font-mono text-[11px] text-slate-600">
                <span class="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                  #${refCode}
                </span>
                <span class="block text-[10px] text-slate-400 mt-1 font-mono select-all">${u._id}</span>
              </td>
              <td class="px-4 py-3 font-medium text-slate-900">
                <a href="#/admin/users/${u._id}" class="hover:text-emerald-700 transition">
                  ${u.fullName || 'Unnamed'}
                </a>
                <span class="block text-[10px] text-slate-500 font-mono mt-0.5">
                  Provider: ${u.authProvider || 'local'}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-700">
                <div class="flex items-center">
                  <span>${u.email || '—'}</span>
                  ${emailVerifiedIcon}
                </div>
                ${mobileText}
              </td>
              <td class="px-4 py-3 text-slate-600 whitespace-nowrap">
                ${regDate}
              </td>
              <td class="px-4 py-3 text-slate-500 whitespace-nowrap">
                ${updateDate}
              </td>
              <td class="px-4 py-3">
                ${getAccountStatusBadge(u.accountStatus)}
              </td>
              <td class="px-4 py-3 text-right">
                <a href="#/admin/users/${u._id}" class="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium transition text-xs border border-emerald-200">
                  <span>Details</span>
                  <span aria-hidden="true">→</span>
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
          <div class="max-w-md mx-auto p-6 rounded-xl bg-white border border-red-300 text-center shadow-xs">
            <p class="text-sm font-semibold text-red-700 mb-2">Failed to load users</p>
            <p class="text-xs text-slate-600 mb-4">${err?.message || 'Unexpected error'}</p>
            <button id="retry-users-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded-lg border border-slate-300 transition">
              Try Again
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
