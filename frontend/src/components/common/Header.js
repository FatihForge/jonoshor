import { authService } from '../../services/auth/authService.js';
import { getLanguage, setLanguage, t } from '../../i18n/index.js';

export function renderHeader(container) {
  const user = authService.getCurrentUser();
  const currentLang = getLanguage();

  container.innerHTML = `
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <a href="#/" class="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 rounded-lg p-1" aria-label="JonoShor Homepage">
        <div class="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-xl text-white shadow-sm" aria-hidden="true">
          J
        </div>
        <div>
          <span class="text-xl font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition">JonoShor</span>
          <span class="block text-[10px] text-slate-500 uppercase tracking-widest -mt-1 font-mono">${t('nav.brand_sub')}</span>
        </div>
      </a>

      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600" aria-label="Main Navigation">
        <a href="#/" class="hover:text-slate-900 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1">${t('nav.home')}</a>
        <a href="#/how-it-works" class="hover:text-slate-900 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1">${t('nav.how_it_works')}</a>
        <a href="#/reports" class="hover:text-slate-900 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1">${t('nav.reports')}</a>
        <a href="#/about" class="hover:text-slate-900 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1">${t('nav.about')}</a>
        <a href="#/contact" class="hover:text-slate-900 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1">${t('nav.contact')}</a>
        <a href="#/complaint/new" class="text-rose-600 hover:text-rose-700 flex items-center gap-1.5 font-semibold focus-visible:ring-2 focus-visible:ring-rose-600 rounded px-1">
          <span class="w-2 h-2 rounded-full bg-rose-600 animate-pulse" aria-hidden="true"></span>
          ${t('nav.submit_complaint')}
        </a>
        <a href="#/join-us" class="hover:text-slate-900 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1">${t('nav.join_us')}</a>
      </nav>

      <!-- Actions & Language Switcher -->
      <div class="flex items-center gap-2.5 sm:gap-3">
        <!-- Language Switcher Pill -->
        <div class="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold" role="group" aria-label="Language Switcher">
          <button 
            type="button" 
            id="lang-btn-bn" 
            class="px-2 py-1 rounded-md transition ${currentLang === 'bn' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}" 
            aria-pressed="${currentLang === 'bn'}"
          >
            বাংলা
          </button>
          <button 
            type="button" 
            id="lang-btn-en" 
            class="px-2 py-1 rounded-md transition ${currentLang === 'en' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}" 
            aria-pressed="${currentLang === 'en'}"
          >
            English
          </button>
        </div>

        ${
          user
            ? `
          ${
            user.accountType === 'superAdmin'
              ? `
            <a href="#/super-admin/dashboard" class="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs sm:text-sm font-semibold border border-purple-200 transition flex items-center gap-1.5 shadow-xs focus-visible:ring-2 focus-visible:ring-purple-600">
              <span aria-hidden="true">👑</span> <span class="hidden sm:inline">${t('nav.super_admin')}</span>
            </a>
          `
              : user.accountType === 'admin'
                ? `
            <a href="#/admin/dashboard" class="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-medium border border-emerald-200 transition shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-600">
              ${t('nav.admin_panel')}
            </a>
          `
                : `
            <a href="#/user/dashboard" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-medium border border-slate-200 transition focus-visible:ring-2 focus-visible:ring-slate-400">
              ${t('nav.dashboard')}
            </a>
          `
          }
          <button id="logout-btn" class="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-medium border border-rose-200 transition focus-visible:ring-2 focus-visible:ring-rose-600">
            ${t('nav.logout')}
          </button>
        `
            : `
          <a href="#/login" class="px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-slate-400">
            ${t('nav.login')}
          </a>
          <a href="#/register" class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium shadow-sm transition focus-visible:ring-2 focus-visible:ring-emerald-600">
            ${t('nav.register')}
          </a>
        `
        }

        <!-- Mobile Navigation Toggle Button -->
        <button id="mobile-menu-btn" aria-label="${t('nav.toggle_menu')}" aria-expanded="false" class="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-600">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Drawer Menu -->
    <div id="mobile-menu-drawer" class="hidden lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 text-sm font-medium text-slate-700 shadow-md">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-slate-500">
        <span>${t('nav.language')}:</span>
        <div class="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
          <button type="button" id="mobile-lang-btn-bn" class="px-2.5 py-1 rounded transition ${currentLang === 'bn' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'}">বাংলা</button>
          <button type="button" id="mobile-lang-btn-en" class="px-2.5 py-1 rounded transition ${currentLang === 'en' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'}">English</button>
        </div>
      </div>
      <a href="#/" class="block py-2 px-3 rounded-lg hover:bg-slate-100 transition">${t('nav.home')}</a>
      <a href="#/how-it-works" class="block py-2 px-3 rounded-lg hover:bg-slate-100 transition">${t('nav.how_it_works')}</a>
      <a href="#/reports" class="block py-2 px-3 rounded-lg hover:bg-slate-100 transition">${t('nav.reports')}</a>
      <a href="#/about" class="block py-2 px-3 rounded-lg hover:bg-slate-100 transition">${t('nav.about')}</a>
      <a href="#/contact" class="block py-2 px-3 rounded-lg hover:bg-slate-100 transition">${t('nav.contact')}</a>
      <a href="#/complaint/new" class="block py-2 px-3 rounded-lg text-rose-600 font-semibold hover:bg-rose-50 transition">${t('nav.submit_complaint')}</a>
      <a href="#/join-us" class="block py-2 px-3 rounded-lg hover:bg-slate-100 transition">${t('nav.join_us')}</a>
    </div>
  `;

  // Language switch handlers
  const wireLangBtn = (selector, targetLang) => {
    const btn = container.querySelector(selector);
    if (btn) {
      btn.addEventListener('click', () => {
        if (getLanguage() !== targetLang) {
          setLanguage(targetLang);
        }
      });
    }
  };

  wireLangBtn('#lang-btn-bn', 'bn');
  wireLangBtn('#lang-btn-en', 'en');
  wireLangBtn('#mobile-lang-btn-bn', 'bn');
  wireLangBtn('#mobile-lang-btn-en', 'en');

  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await authService.logout();
      window.location.hash = '#/';
      window.location.reload();
    });
  }

  const mobileBtn = container.querySelector('#mobile-menu-btn');
  const mobileDrawer = container.querySelector('#mobile-menu-drawer');
  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', () => {
      const isExpanded = mobileBtn.getAttribute('aria-expanded') === 'true';
      mobileBtn.setAttribute('aria-expanded', String(!isExpanded));
      mobileDrawer.classList.toggle('hidden');
    });

    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileDrawer.classList.add('hidden');
      });
    });
  }
}
