import { authService } from '../../services/auth/authService.js';
import { t, isBangla } from '../../i18n/index.js';

export function renderAdminNav(activeTab = 'dashboard') {
  const user = authService.getCurrentUser();
  const roleName = user?.accountType === 'superAdmin' 
    ? (isBangla() ? 'সুপার অ্যাডমিন' : 'Super Admin') 
    : (isBangla() ? 'অ্যাডমিন' : 'Admin');

  return `
    <header class="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-6">
            <a href="#/admin/dashboard" class="flex items-center gap-2.5" aria-label="${t('admin.console_title')}">
              <span class="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center font-bold text-base text-white shadow-xs" aria-hidden="true">
                J
              </span>
              <div>
                <span class="text-base font-bold text-slate-900 tracking-tight">${t('admin.console_title')}</span>
                <span class="block text-[9px] text-slate-500 uppercase tracking-widest font-mono">${t('admin.control_panel')}</span>
              </div>
            </a>

            <nav class="hidden md:flex items-center gap-1.5" aria-label="Admin navigation">
              <a href="#/admin/dashboard" class="px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }">
                ${t('admin.dashboard')}
              </a>
              <a href="#/admin/complaints" class="px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'complaints'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }">
                ${t('admin.complaints')}
              </a>
              <a href="#/admin/evidence" class="px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'evidence'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }">
                ${t('admin.evidence')}
              </a>
              <a href="#/admin/users" class="px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'users'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }">
                ${t('admin.users')}
              </a>
              <a href="#/admin/join-us" class="px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'join-us'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }">
                ${t('admin.join_us')}
              </a>
            </nav>
          </div>

          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
              ${roleName}
            </span>
            <span class="text-xs text-slate-500 font-mono hidden sm:inline">${user?.email || ''}</span>
            <button id="admin-lang-toggle" type="button" class="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold transition flex items-center gap-1" aria-label="${isBangla() ? 'Switch to English' : 'বাংলায় দেখুন'}">
              <span>🌐</span>
              <span>${isBangla() ? 'English' : 'বাংলা'}</span>
            </button>
            <a href="#/" class="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 transition">
              ${t('admin.public_site')}
            </a>
          </div>
        </div>
      </div>
    </header>
  `;
}
