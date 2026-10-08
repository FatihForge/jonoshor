import { userService } from '../../../services/user/userService.js';
import { renderUserNav } from '../../../components/user/UserNav.js';
import { formatDateTime } from '../../../utils/formatters.js';

const TYPE_CONFIG = {
  complaint_status: {
    icon: '📋',
    label: 'Complaint Status',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  evidence_update: {
    icon: '📁',
    label: 'Evidence Update',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  information_request: {
    icon: '❓',
    label: 'Information Request',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  verification_update: {
    icon: '🛡️',
    label: 'Verification Update',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  authority_update: {
    icon: '🏛️',
    label: 'Authority Action',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  publication_update: {
    icon: '📢',
    label: 'Public Release',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  legal_update: {
    icon: '⚖️',
    label: 'Legal Assistance',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  security: {
    icon: '🔐',
    label: 'Security Notice',
    badgeClass: 'bg-red-50 text-red-800 border-red-200',
  },
  general: {
    icon: '🔔',
    label: 'General Notice',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
  },
};

export async function renderUserNotificationsPage(container) {
  let notifications = [];
  let filterUnread = false;
  let page = 1;
  const limit = 20;
  let totalCount = 0;
  let isLoading = true;
  let errorMessage = null;

  function render() {
    container.innerHTML = `
      <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        ${renderUserNav('notifications')}

        <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <!-- Page Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xl shadow-xs" aria-hidden="true">
                  🔔
                </div>
                <div>
                  <h1 class="text-2xl font-bold text-slate-900 tracking-tight">My Notifications</h1>
                  <p class="text-xs text-slate-500 mt-0.5">Complaint status milestones, investigation updates, and security alerts</p>
                </div>
              </div>
            </div>

            <!-- Filter Controls -->
            <div class="flex items-center gap-2 self-start sm:self-auto">
              <button 
                id="filter-all-btn" 
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  !filterUnread
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }"
              >
                All
              </button>
              <button 
                id="filter-unread-btn" 
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterUnread
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }"
              >
                Unread
              </button>
              <button 
                id="refresh-btn" 
                class="p-2 rounded-lg bg-white border border-slate-300 text-slate-600 hover:text-slate-900 text-xs transition" 
                title="Refresh notifications"
                aria-label="Refresh notifications"
              >
                <svg class="w-4 h-4 ${isLoading ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Error Alert -->
          ${
            errorMessage
              ? `
            <div class="p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-center justify-between" role="alert">
              <span>⚠️ ${errorMessage}</span>
              <button id="dismiss-err-btn" class="text-red-600 hover:text-red-800 font-bold" aria-label="Dismiss alert">✕</button>
            </div>
          `
              : ''
          }

          <!-- Notifications List -->
          ${
            isLoading
              ? `
            <div class="py-20 text-center space-y-3">
              <div class="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" aria-hidden="true"></div>
              <p class="text-xs text-slate-500">Loading notifications...</p>
            </div>
          `
              : notifications.length === 0
              ? `
            <div class="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
              <span class="text-4xl block" aria-hidden="true">📭</span>
              <h3 class="text-base font-bold text-slate-900">No notifications found</h3>
              <p class="text-xs text-slate-500">
                ${filterUnread ? 'You have no unread notifications.' : 'No notifications have been sent to your account yet.'}
              </p>
            </div>
          `
              : `
            <div class="space-y-3">
              ${notifications.map((n) => renderNotificationCard(n)).join('')}
            </div>

            <!-- Pagination info -->
            ${
              totalCount > limit
                ? `
              <div class="flex items-center justify-between pt-4 text-xs text-slate-500 border-t border-slate-200">
                <span>Total notifications: ${totalCount}</span>
                <div class="flex gap-2">
                  <button id="prev-page-btn" ${page <= 1 ? 'disabled' : ''} class="px-3 py-1 rounded bg-white border border-slate-300 disabled:opacity-40">Previous</button>
                  <button id="next-page-btn" ${page * limit >= totalCount ? 'disabled' : ''} class="px-3 py-1 rounded bg-white border border-slate-300 disabled:opacity-40">Next</button>
                </div>
              </div>
            `
                : ''
            }
          `
          }
        </main>
      </div>
    `;

    attachEvents();
  }

  function renderNotificationCard(item) {
    const typeMeta = TYPE_CONFIG[item.type] || TYPE_CONFIG.general;
    const isUnread = !item.read;

    return `
      <div 
        class="p-5 rounded-xl border transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
          isUnread
            ? 'bg-white border-emerald-300 shadow-sm ring-1 ring-emerald-500/20'
            : 'bg-white/80 border-slate-200 hover:bg-white'
        }"
        data-notification-id="${item._id}"
      >
        <div class="flex items-start gap-3.5">
          <div class="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0 mt-0.5" aria-hidden="true">
            ${typeMeta.icon}
          </div>

          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-bold ${isUnread ? 'text-slate-900' : 'text-slate-800'}">
                ${item.title}
              </span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full border ${typeMeta.badgeClass}">
                ${typeMeta.label}
              </span>
              ${
                isUnread
                  ? `
                <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" title="Unread" aria-label="Unread"></span>
              `
                  : ''
              }
            </div>

            <p class="text-xs text-slate-600 leading-relaxed max-w-2xl">
              ${item.message}
            </p>

            <div class="text-[11px] text-slate-500 font-mono pt-1">
              ${formatDateTime(item.createdAt)}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
          ${
            item.targetUrl
              ? `
            <a 
              href="${item.targetUrl}" 
              data-action="navigate" 
              data-id="${item._id}"
              class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition shadow-2xs flex items-center gap-1"
            >
              <span>View Details</span>
              <span class="text-[10px]" aria-hidden="true">↗</span>
            </a>
          `
              : ''
          }

          ${
            isUnread
              ? `
            <button 
              data-action="mark-read" 
              data-id="${item._id}"
              class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition border border-slate-200"
              title="Mark as read"
              aria-label="Mark notification as read"
            >
              ✓ Mark read
            </button>
          `
              : ''
          }
        </div>
      </div>
    `;
  }

  function attachEvents() {
    const filterAllBtn = container.querySelector('#filter-all-btn');
    if (filterAllBtn) {
      filterAllBtn.addEventListener('click', () => {
        if (filterUnread) {
          filterUnread = false;
          page = 1;
          loadNotifications();
        }
      });
    }

    const filterUnreadBtn = container.querySelector('#filter-unread-btn');
    if (filterUnreadBtn) {
      filterUnreadBtn.addEventListener('click', () => {
        if (!filterUnread) {
          filterUnread = true;
          page = 1;
          loadNotifications();
        }
      });
    }

    const refreshBtn = container.querySelector('#refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        loadNotifications();
      });
    }

    const dismissErrBtn = container.querySelector('#dismiss-err-btn');
    if (dismissErrBtn) {
      dismissErrBtn.addEventListener('click', () => {
        errorMessage = null;
        render();
      });
    }

    const prevBtn = container.querySelector('#prev-page-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (page > 1) {
          page--;
          loadNotifications();
        }
      });
    }

    const nextBtn = container.querySelector('#next-page-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (page * limit < totalCount) {
          page++;
          loadNotifications();
        }
      });
    }

    // Mark as read buttons
    const markReadButtons = container.querySelectorAll('button[data-action="mark-read"]');
    markReadButtons.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          await userService.markNotificationAsRead(id);
          const target = notifications.find((n) => n._id === id);
          if (target) {
            target.read = true;
          }
          if (filterUnread) {
            notifications = notifications.filter((n) => n._id !== id);
          }
          render();
        } catch (err) {
          errorMessage = err.message || 'Failed to mark notification as read.';
          render();
        }
      });
    });

    // Navigate links (also marks as read)
    const navLinks = container.querySelectorAll('a[data-action="navigate"]');
    navLinks.forEach((link) => {
      link.addEventListener('click', async () => {
        const id = link.getAttribute('data-id');
        try {
          await userService.markNotificationAsRead(id);
        } catch {
          // Non-blocking navigation
        }
      });
    });
  }

  async function loadNotifications() {
    isLoading = true;
    errorMessage = null;
    render();

    try {
      const res = await userService.getNotifications({
        page,
        limit,
        unread: filterUnread,
      });

      notifications = Array.isArray(res.data) ? res.data : [];
      totalCount = res.meta?.total || notifications.length;
    } catch (err) {
      errorMessage = err.message || 'Failed to load notifications.';
    } finally {
      isLoading = false;
      render();
    }
  }

  await loadNotifications();
}
