import { userService } from '../../../services/user/userService.js';
import { renderUserNav } from '../../../components/user/UserNav.js';
import { formatDateTime } from '../../../utils/formatters.js';

const TYPE_CONFIG = {
  complaint_status: {
    icon: '📋',
    label: 'অভিযোগ অবস্থা',
    badgeClass: 'bg-blue-950 text-blue-300 border-blue-800',
  },
  evidence_update: {
    icon: '📁',
    label: 'প্রমাণপত্র আপডেট',
    badgeClass: 'bg-indigo-950 text-indigo-300 border-indigo-800',
  },
  information_request: {
    icon: '❓',
    label: 'তথ্য আহ্বান',
    badgeClass: 'bg-amber-950 text-amber-300 border-amber-800',
  },
  verification_update: {
    icon: '🛡️',
    label: 'ভেরিফিকেশন',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  },
  authority_update: {
    icon: '🏛️',
    label: 'কর্তৃপক্ষের পদক্ষেপ',
    badgeClass: 'bg-purple-950 text-purple-300 border-purple-800',
  },
  publication_update: {
    icon: '📢',
    label: 'পাবলিক প্রকাশনা',
    badgeClass: 'bg-teal-950 text-teal-300 border-teal-800',
  },
  legal_update: {
    icon: '⚖️',
    label: 'আইনি সহায়তা',
    badgeClass: 'bg-rose-950 text-rose-300 border-rose-800',
  },
  security: {
    icon: '🔐',
    label: 'নিরাপত্তা বার্তা',
    badgeClass: 'bg-red-950 text-red-300 border-red-800',
  },
  general: {
    icon: '🔔',
    label: 'সাধারণ বার্তা',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
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
      <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        ${renderUserNav('notifications')}

        <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <!-- Page Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-xl shadow-lg">
                  🔔
                </div>
                <div>
                  <h1 class="text-2xl font-bold text-white tracking-tight">আমার নোটিফিকেশনসমূহ</h1>
                  <p class="text-xs text-slate-400 mt-0.5">অভিযোগের অগ্রগতি, তদন্তের ফলাফল ও গুরুত্বপূর্ণ নিরাপত্তা আপডেট</p>
                </div>
              </div>
            </div>

            <!-- Filter Controls -->
            <div class="flex items-center gap-2 self-start sm:self-auto">
              <button 
                id="filter-all-btn" 
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  !filterUnread
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }"
              >
                সকল
              </button>
              <button 
                id="filter-unread-btn" 
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterUnread
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }"
              >
                অপঠিত
              </button>
              <button 
                id="refresh-btn" 
                class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs transition" 
                title="রিফ্রেশ"
              >
                <svg class="w-4 h-4 ${isLoading ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Error Alert -->
          ${
            errorMessage
              ? `
            <div class="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center justify-between">
              <span>⚠️ ${errorMessage}</span>
              <button id="dismiss-err-btn" class="text-red-400 hover:text-red-200">✕</button>
            </div>
          `
              : ''
          }

          <!-- Notifications List -->
          ${
            isLoading
              ? `
            <div class="py-20 text-center space-y-3">
              <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p class="text-xs text-slate-400">নোটিফিকেশন লোড হচ্ছে...</p>
            </div>
          `
              : notifications.length === 0
              ? `
            <div class="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
              <span class="text-4xl block">📭</span>
              <h3 class="text-base font-bold text-white">কোনো নোটিফিকেশন পাওয়া যায়নি</h3>
              <p class="text-xs text-slate-400">
                ${filterUnread ? 'আপনার কোনো অপঠিত নোটিফিকেশন নেই।' : 'আপনার অ্যাকাউন্টে এখনো কোনো নোটিফিকেশন পাঠানো হয়নি।'}
              </p>
            </div>
          `
              : `
            <div class="space-y-3">
              ${notifications.map((n) => renderNotificationCard(n)).join('')}
            </div>

            <!-- Pagination info if needed -->
            ${
              totalCount > limit
                ? `
              <div class="flex items-center justify-between pt-4 text-xs text-slate-400 border-t border-slate-800">
                <span>মোট নোটিফিকেশন: ${totalCount} টি</span>
                <div class="flex gap-2">
                  <button id="prev-page-btn" ${page <= 1 ? 'disabled' : ''} class="px-3 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40">পূর্ববর্তী</button>
                  <button id="next-page-btn" ${page * limit >= totalCount ? 'disabled' : ''} class="px-3 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40">পরবর্তী</button>
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
            ? 'bg-slate-900/95 border-emerald-800/80 shadow-md ring-1 ring-emerald-500/20'
            : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70'
        }"
        data-notification-id="${item._id}"
      >
        <div class="flex items-start gap-3.5">
          <div class="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0 mt-0.5">
            ${typeMeta.icon}
          </div>

          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-bold ${isUnread ? 'text-white' : 'text-slate-200'}">
                ${item.title}
              </span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full border ${typeMeta.badgeClass}">
                ${typeMeta.label}
              </span>
              ${
                isUnread
                  ? `
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="অপঠিত"></span>
              `
                  : ''
              }
            </div>

            <p class="text-xs text-slate-300 leading-relaxed max-w-2xl">
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
              class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow flex items-center gap-1"
            >
              <span>বিস্তারিত দেখুন</span>
              <span class="text-[10px]">↗</span>
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
              class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              title="পঠিত চিহ্নিত করুন"
            >
              ✓ পঠিত
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
          errorMessage = err.message || 'পঠিত চিহ্নিত করতে ব্যর্থ হয়েছে।';
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
      errorMessage = err.message || 'নোটিফিকেশন লোড করতে ব্যর্থ হয়েছে।';
    } finally {
      isLoading = false;
      render();
    }
  }

  await loadNotifications();
}
