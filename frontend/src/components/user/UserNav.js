import { authService } from '../../services/auth/authService.js';
import { t } from '../../i18n/index.js';

export function renderUserNav(activeTab = 'dashboard') {
  const user = authService.getCurrentUser();

  return `
    <div class="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-14">
          <nav class="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar" aria-label="User navigation">
            <a href="#/user/dashboard" class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'dashboard'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }">
              ${t('user.nav_complaints')}
            </a>
            <a href="#/user/notifications" class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'notifications'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }">
              ${t('user.nav_notifications')}
            </a>
            <a href="#/user/messages" class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'messages'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }">
              ${t('user.nav_messages')}
            </a>
            <a href="#/user/profile" class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'profile'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }">
              ${t('user.nav_profile')}
            </a>
          </nav>

          <div class="hidden sm:flex items-center gap-3 shrink-0">
            <span class="text-xs text-slate-500 font-mono">${user?.email || ''}</span>
            <a href="#/complaint/new" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition shadow-xs flex items-center gap-1.5">
              <span>${t('user.nav_new_complaint')}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}
