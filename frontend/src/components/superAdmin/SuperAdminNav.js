import { authService } from '../../services/auth/authService.js';
import { t, isBangla } from '../../i18n/index.js';

export function renderSuperAdminNav(activeTab = 'dashboard') {
  const user = authService.getCurrentUser();

  return `
    <header class="bg-white border-b border-purple-200 sticky top-0 z-30 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-6">
            <a href="#/super-admin/dashboard" class="flex items-center gap-2.5 group" aria-label="${t('super_admin.console_title')}">
              <span class="w-8 h-8 rounded-lg bg-purple-700 flex items-center justify-center font-bold text-base text-white shadow-xs" aria-hidden="true">
                👑
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-base font-extrabold text-slate-900 tracking-tight">${t('super_admin.console_title')}</span>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold uppercase tracking-wider">
                    Root Console
                  </span>
                </div>
                <span class="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">${t('super_admin.executive_panel')}</span>
              </div>
            </a>

            <nav class="hidden md:flex items-center gap-1.5" aria-label="Super Admin navigation">
              <a href="#/super-admin/dashboard" class="px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-purple-50 text-purple-900 border border-purple-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }">
                ${t('super_admin.dashboard')}
              </a>
              <a href="#/super-admin/admins" class="px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'admins'
                  ? 'bg-purple-50 text-purple-900 border border-purple-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }">
                ${t('super_admin.admins')}
              </a>
              <a href="#/super-admin/security" class="px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'security'
                  ? 'bg-purple-50 text-purple-900 border border-purple-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }">
                ${t('super_admin.security')}
              </a>
              <a href="#/super-admin/system-settings" class="px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'system-settings' || activeTab === 'system'
                  ? 'bg-purple-50 text-purple-900 border border-purple-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }">
                ${t('super_admin.system_settings')}
              </a>
              <a href="#/super-admin/financial-settings" class="px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'financial-settings' || activeTab === 'financial'
                  ? 'bg-purple-50 text-purple-900 border border-purple-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }">
                ${t('super_admin.financial')}
              </a>
            </nav>
          </div>

          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-500" aria-hidden="true"></span>
              ${isBangla() ? 'সুপার অ্যাডমিন' : 'Super Admin'}
            </span>
            <span class="text-xs text-slate-500 hidden lg:inline font-mono">${user?.email || ''}</span>
            <button id="super-admin-lang-toggle" type="button" class="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-purple-200 text-slate-700 font-bold transition flex items-center gap-1" aria-label="${isBangla() ? 'Switch to English' : 'বাংলায় দেখুন'}">
              <span>🌐</span>
              <span>${isBangla() ? 'English' : 'বাংলা'}</span>
            </button>
            <div class="flex items-center gap-2 border-l border-slate-200 pl-3">
              <a href="#/admin/dashboard" class="text-xs text-slate-600 hover:text-emerald-700 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 hover:border-emerald-300 transition flex items-center gap-1">
                <span>${t('nav.admin_panel')}</span>
                <span class="text-[10px]" aria-hidden="true">↗</span>
              </a>
              <a href="#/" class="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 hover:bg-slate-200 transition">
                ${t('admin.public_site')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;
}
