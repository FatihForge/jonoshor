import { authService } from '../../services/auth/authService.js';

export function renderUserNav(activeTab = 'dashboard') {
  const user = authService.getCurrentUser();

  return `
    <div class="bg-slate-900 border-b border-slate-800 sticky top-16 z-20 shadow-md">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-14">
          <nav class="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
            <a href="#/user/dashboard" class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'dashboard'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }">
              📋 অভিযোগসমূহ
            </a>
            <a href="#/user/notifications" class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'notifications'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }">
              🔔 নোটিফিকেশন
            </a>
            <a href="#/user/messages" class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'messages'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }">
              💬 বার্তা
            </a>
            <a href="#/user/profile" class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'profile'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }">
              👤 প্রোফাইল ও নিরাপত্তা
            </a>
          </nav>

          <div class="hidden sm:flex items-center gap-3 shrink-0">
            <span class="text-xs text-slate-400 font-mono">${user?.email || ''}</span>
            <a href="#/complaint/new" class="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-xs transition shadow flex items-center gap-1.5">
              <span>+ নতুন অভিযোগ</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}
