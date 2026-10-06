import { authService } from '../../services/auth/authService.js';

export function renderAdminNav(activeTab = 'dashboard') {
  const user = authService.getCurrentUser();
  const roleName = user?.accountType === 'superAdmin' ? 'সুপার অ্যাডমিন' : 'অ্যাডমিন';

  return `
    <header class="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-6">
            <a href="#/admin/dashboard" class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center font-bold text-base text-white shadow">
                জ
              </span>
              <div>
                <span class="text-base font-bold text-white tracking-tight">জনস্বর এডমিন</span>
                <span class="block text-[9px] text-slate-400 uppercase tracking-widest font-mono">Control Panel</span>
              </div>
            </a>

            <nav class="hidden md:flex items-center gap-2">
              <a href="#/admin/dashboard" class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }">
                ড্যাশবোর্ড
              </a>
              <a href="#/admin/complaints" class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'complaints'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }">
                অভিযোগ পর্যালোচনা
              </a>
              <a href="#/admin/evidence" class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'evidence'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }">
                প্রমাণ পর্যালোচনা
              </a>
              <a href="#/admin/users" class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'users'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }">
                ব্যবহারকারী
              </a>
            </nav>
          </div>

          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ${roleName}
            </span>
            <span class="text-xs text-slate-400 hidden sm:inline">${user?.email || ''}</span>
            <a href="#/" class="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition">
              মূল সাইট
            </a>
          </div>
        </div>
      </div>
    </header>
  `;
}
