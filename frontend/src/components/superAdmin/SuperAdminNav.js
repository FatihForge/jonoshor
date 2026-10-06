import { authService } from '../../services/auth/authService.js';

export function renderSuperAdminNav(activeTab = 'dashboard') {
  const user = authService.getCurrentUser();

  return `
    <header class="bg-gradient-to-r from-slate-950 via-purple-950/40 to-slate-950 border-b border-purple-900/40 sticky top-0 z-30 shadow-2xl backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-6">
            <a href="#/super-admin/dashboard" class="flex items-center gap-2.5 group">
              <span class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-base text-white shadow-lg shadow-purple-950/50 group-hover:scale-105 transition">
                👑
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-base font-extrabold text-white tracking-tight">জনস্বর সুপার অ্যাডমিন</span>
                  <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 font-semibold uppercase tracking-wider">
                    Root Console
                  </span>
                </div>
                <span class="block text-[9px] text-purple-300/70 font-mono tracking-widest uppercase">Executive Governance & Security</span>
              </div>
            </a>

            <nav class="hidden md:flex items-center gap-1.5">
              <a href="#/super-admin/dashboard" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-purple-950/90 text-purple-300 border border-purple-700/80 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }">
                ড্যাশবোর্ড
              </a>
              <a href="#/super-admin/admins" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'admins'
                  ? 'bg-purple-950/90 text-purple-300 border border-purple-700/80 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }">
                অ্যাডমিন ব্যবস্থাপনা
              </a>
              <a href="#/super-admin/security" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'security'
                  ? 'bg-purple-950/90 text-purple-300 border border-purple-700/80 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }">
                নিরাপত্তা ও অডিট
              </a>
              <a href="#/super-admin/system-settings" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'system-settings' || activeTab === 'system'
                  ? 'bg-purple-950/90 text-purple-300 border border-purple-700/80 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }">
                সিস্টেম সেটিংস
              </a>
              <a href="#/super-admin/financial-settings" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'financial-settings' || activeTab === 'financial'
                  ? 'bg-purple-950/90 text-purple-300 border border-purple-700/80 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }">
                আর্থিক সেটিংস
              </a>
            </nav>
          </div>

          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-950/90 text-purple-200 border border-purple-700/60 shadow-inner">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
              সুপার অ্যাডমিন
            </span>
            <span class="text-xs text-slate-400 hidden lg:inline font-mono">${user?.email || ''}</span>
            <div class="flex items-center gap-2 border-l border-slate-800 pl-3">
              <a href="#/admin/dashboard" class="text-xs text-slate-400 hover:text-emerald-400 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-emerald-800/60 transition flex items-center gap-1">
                <span>অ্যাডমিন প্যানেল</span>
                <span class="text-[10px]">↗</span>
              </a>
              <a href="#/" class="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition">
                মূল সাইট
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;
}
