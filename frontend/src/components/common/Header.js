import { authService } from '../../services/auth/authService.js';

export function renderHeader(container) {
  const user = authService.getCurrentUser();

  container.innerHTML = `
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <a href="#/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-emerald-950/50">
          জ
        </div>
        <div>
          <span class="text-xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition">জনস্বর</span>
          <span class="block text-[10px] text-slate-400 uppercase tracking-widest -mt-1 font-mono">JonoShor</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <a href="#/" class="hover:text-white transition">হোম</a>
        <a href="#/how-it-works" class="hover:text-white transition">কীভাবে কাজ করে</a>
        <a href="#/reports" class="hover:text-white transition">রিপোর্টসমূহ</a>
        <a href="#/about" class="hover:text-white transition">আমাদের সম্পর্কে</a>
        <a href="#/complaint/new" class="hover:text-white transition text-red-400 hover:text-red-300 flex items-center gap-1.5 font-semibold">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          অভিযোগ দাখিল
        </a>
        <a href="#/join-us" class="hover:text-white transition">যুক্ত হোন</a>
      </nav>

      <div class="flex items-center gap-3">
        ${
          user
            ? `
          ${
            ['admin', 'superAdmin'].includes(user.accountType)
              ? `
            <a href="#/admin/dashboard" class="px-3.5 py-1.5 rounded-md bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-sm font-medium border border-emerald-800/80 transition">
              এডমিন প্যানেল
            </a>
          `
              : `
            <a href="#/user/dashboard" class="px-3.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition">
              ড্যাশবোর্ড
            </a>
          `
          }
          <button id="logout-btn" class="px-3.5 py-1.5 rounded-md bg-red-950/50 hover:bg-red-900/60 text-red-300 text-sm font-medium border border-red-800/60 transition">
            লগআউট
          </button>
        `
            : `
          <a href="#/login" class="px-3.5 py-1.5 rounded-md text-slate-300 hover:text-white text-sm font-medium transition">
            লগইন
          </a>
          <a href="#/register" class="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium shadow-md shadow-emerald-950/40 transition">
            নিবন্ধন
          </a>
        `
        }
      </div>
    </div>
  `;

  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await authService.logout();
      window.location.hash = '#/';
      window.location.reload();
    });
  }
}
