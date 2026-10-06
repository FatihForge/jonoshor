// JonoShor Frontend Application Entry & Router
import './style.css';
import { fetchCsrfToken } from './services/api/apiClient.js';
import { authService } from './services/auth/authService.js';
import { renderHeader } from './components/common/Header.js';
import { renderFooter } from './components/common/Footer.js';

import { renderHomePage } from './pages/public/home/index.js';
import { renderReportsPage } from './pages/public/reports/index.js';
import { renderReportDetailsPage } from './pages/public/reports/details.js';
import { renderAboutPage } from './pages/public/info/about.js';
import { renderHowItWorksPage } from './pages/public/info/howItWorks.js';
import { renderPrivacyPage } from './pages/public/info/privacy.js';
import { renderNewComplaintPage } from './pages/public/complaint/new.js';
import { renderJoinUsPage } from './pages/public/joinUs/index.js';
import { renderLoginPage } from './pages/public/auth/login.js';
import { renderRegisterPage } from './pages/public/auth/register.js';
import { renderVerifyEmailPage } from './pages/public/auth/verifyEmail.js';
import { renderForgotPasswordPage } from './pages/public/auth/forgotPassword.js';
import { renderResetPasswordPage } from './pages/public/auth/resetPassword.js';
import { renderUserDashboardPage } from './pages/user/dashboard/index.js';
import { renderUserNotificationsPage } from './pages/user/notifications/index.js';
import { renderUserMessagesPage } from './pages/user/messages/index.js';
import { renderUserProfilePage } from './pages/user/profile/index.js';
import { renderComplaintDetailsPage } from './pages/user/complaints/details.js';
import { renderAdminDashboardPage } from './pages/admin/dashboard/index.js';
import { renderAdminComplaintsPage } from './pages/admin/complaints/index.js';
import { renderAdminComplaintDetailsPage } from './pages/admin/complaints/details.js';
import { renderAdminEvidencePage } from './pages/admin/evidence/index.js';
import { renderAdminUsersPage } from './pages/admin/users/index.js';
import { renderAdminUserDetailsPage } from './pages/admin/users/details.js';
import { renderSuperAdminDashboardPage } from './pages/superAdmin/dashboard/index.js';
import { renderSuperAdminAdminsPage } from './pages/superAdmin/admins/index.js';
import { renderSuperAdminSecurityPage } from './pages/superAdmin/security/index.js';
import { renderSuperAdminSystemSettingsPage } from './pages/superAdmin/system-settings/index.js';
import { renderSuperAdminFinancialSettingsPage } from './pages/superAdmin/financial-settings/index.js';

async function route() {
  const hash = window.location.hash || '#/';
  const mainContent = document.getElementById('main-content');
  const headerContainer = document.getElementById('site-header');
  const footerContainer = document.getElementById('site-footer');

  if (headerContainer) renderHeader(headerContainer);
  if (footerContainer) renderFooter(footerContainer);

  if (!mainContent) return;

  // Scroll to top on navigation
  window.scrollTo(0, 0);

  // Admin Access Verification helper
  function checkAdminAccess() {
    const user = authService.getCurrentUser();
    if (!user || !['admin', 'superAdmin'].includes(user.accountType)) {
      mainContent.innerHTML = `
        <div class="max-w-md mx-auto my-20 p-8 rounded-2xl bg-slate-900 border border-red-900/60 text-center shadow-2xl">
          <div class="w-12 h-12 rounded-full bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-white mb-2">প্রশাসনিক প্রবেশাধিকার সীমাবদ্ধ (403)</h2>
          <p class="text-sm text-slate-400 mb-6">এই পৃষ্ঠাটি শুধুমাত্র অনুমোদিত অ্যাডমিন এবং সুপার অ্যাডমিনদের জন্য সংরক্ষিত।</p>
          <a href="#/login" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition inline-block">
            লগইন করুন
          </a>
        </div>
      `;
      return false;
    }
    return true;
  }

  // Super Admin Access Verification helper
  function checkSuperAdminAccess() {
    const user = authService.getCurrentUser();
    if (!user || user.accountType !== 'superAdmin') {
      mainContent.innerHTML = `
        <div class="max-w-md mx-auto my-20 p-8 rounded-2xl bg-slate-900 border border-purple-900/60 text-center shadow-2xl">
          <div class="w-12 h-12 rounded-full bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            👑
          </div>
          <h2 class="text-xl font-bold text-white mb-2">সুপার অ্যাডমিন প্রবেশাধিকার সংরক্ষিত (403)</h2>
          <p class="text-xs text-slate-400 mb-6">এই প্রশাসনিক কনসোলটি শুধুমাত্র প্ল্যাটফর্মের প্রধান নির্বাহী (Super Admin)-দের জন্য সংরক্ষিত। সাধারণ ব্যবহারকারী বা অ্যাডমিনদের এখানে প্রবেশাধিকার নেই।</p>
          <div class="flex items-center justify-center gap-3">
            <a href="#/login" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition">
              লগইন করুন
            </a>
            <a href="#/" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition">
              হোমপেজে ফিরুন
            </a>
          </div>
        </div>
      `;
      return false;
    }
    return true;
  }


  // Router matching
  if (hash === '#/' || hash === '') {
    await renderHomePage(mainContent);
  } else if (hash === '#/reports') {
    await renderReportsPage(mainContent);
  } else if (hash.startsWith('#/reports/')) {
    const reportId = hash.replace('#/reports/', '');
    await renderReportDetailsPage(mainContent, reportId);
  } else if (hash === '#/about' || hash === '#/mission') {
    await renderAboutPage(mainContent);
  } else if (hash === '#/how-it-works') {
    await renderHowItWorksPage(mainContent);
  } else if (hash === '#/privacy' || hash === '#/safety' || hash === '#/terms') {
    await renderPrivacyPage(mainContent);
  } else if (hash === '#/complaint/new' || hash.startsWith('#/complaint/new?')) {
    await renderNewComplaintPage(mainContent);
  } else if (hash.startsWith('#/user/complaints/') || hash.startsWith('#/complaints/')) {
    const complaintId = hash.replace('#/user/complaints/', '').replace('#/complaints/', '').split('?')[0];
    await renderComplaintDetailsPage(mainContent, complaintId);
  } else if (hash === '#/join-us') {
    renderJoinUsPage(mainContent);
  } else if (hash === '#/login') {
    renderLoginPage(mainContent);
  } else if (hash === '#/register') {
    renderRegisterPage(mainContent);
  } else if (hash === '#/verify-email' || hash.startsWith('#/verify-email?') || hash.startsWith('#/verify-email/')) {
    await renderVerifyEmailPage(mainContent);
  } else if (hash === '#/forgot-password' || hash.startsWith('#/forgot-password?')) {
    renderForgotPasswordPage(mainContent);
  } else if (hash === '#/reset-password' || hash.startsWith('#/reset-password?') || hash.startsWith('#/reset-password/')) {
    renderResetPasswordPage(mainContent);
  } else if (hash === '#/user' || hash === '#/user/' || hash === '#/app' || hash === '#/app/') {
    window.location.hash = '#/user/dashboard';
  } else if (hash === '#/user/dashboard' || hash.startsWith('#/user/dashboard?')) {
    const user = authService.getCurrentUser();
    if (!user) {
      window.location.hash = '#/login';
    } else {
      await renderUserDashboardPage(mainContent);
    }
  } else if (hash === '#/user/notifications' || hash.startsWith('#/user/notifications?')) {
    const user = authService.getCurrentUser();
    if (!user) {
      window.location.hash = '#/login';
    } else {
      await renderUserNotificationsPage(mainContent);
    }
  } else if (hash === '#/user/messages' || hash.startsWith('#/user/messages?')) {
    const user = authService.getCurrentUser();
    if (!user) {
      window.location.hash = '#/login';
    } else {
      await renderUserMessagesPage(mainContent);
    }
  } else if (hash === '#/user/profile' || hash.startsWith('#/user/profile?')) {
    const user = authService.getCurrentUser();
    if (!user) {
      window.location.hash = '#/login';
    } else {
      await renderUserProfilePage(mainContent);
    }
  } else if (hash === '#/admin' || hash === '#/admin/') {
    if (checkAdminAccess()) {
      window.location.hash = '#/admin/dashboard';
    }
  } else if (hash === '#/admin/dashboard') {
    if (checkAdminAccess()) {
      await renderAdminDashboardPage(mainContent);
    }
  } else if (hash === '#/admin/complaints' || hash.startsWith('#/admin/complaints?')) {
    if (checkAdminAccess()) {
      await renderAdminComplaintsPage(mainContent);
    }
  } else if (hash.startsWith('#/admin/complaints/')) {
    if (checkAdminAccess()) {
      const complaintId = hash.replace('#/admin/complaints/', '').split('?')[0];
      await renderAdminComplaintDetailsPage(mainContent, complaintId);
    }
  } else if (hash === '#/admin/evidence' || hash.startsWith('#/admin/evidence?')) {
    if (checkAdminAccess()) {
      await renderAdminEvidencePage(mainContent);
    }
  } else if (hash === '#/admin/users' || hash.startsWith('#/admin/users?')) {
    if (checkAdminAccess()) {
      await renderAdminUsersPage(mainContent);
    }
  } else if (hash.startsWith('#/admin/users/')) {
    if (checkAdminAccess()) {
      const userId = hash.replace('#/admin/users/', '').split('?')[0];
      await renderAdminUserDetailsPage(mainContent, userId);
    }
  } else if (hash === '#/super-admin' || hash === '#/super-admin/') {
    if (checkSuperAdminAccess()) {
      window.location.hash = '#/super-admin/dashboard';
    }
  } else if (hash === '#/super-admin/dashboard' || hash.startsWith('#/super-admin/dashboard?')) {
    if (checkSuperAdminAccess()) {
      await renderSuperAdminDashboardPage(mainContent);
    }
  } else if (hash === '#/super-admin/admins' || hash.startsWith('#/super-admin/admins?')) {
    if (checkSuperAdminAccess()) {
      await renderSuperAdminAdminsPage(mainContent);
    }
  } else if (hash === '#/super-admin/security' || hash.startsWith('#/super-admin/security?')) {
    if (checkSuperAdminAccess()) {
      await renderSuperAdminSecurityPage(mainContent);
    }
  } else if (hash === '#/super-admin/system-settings' || hash.startsWith('#/super-admin/system-settings?')) {
    if (checkSuperAdminAccess()) {
      await renderSuperAdminSystemSettingsPage(mainContent);
    }
  } else if (hash === '#/super-admin/financial-settings' || hash.startsWith('#/super-admin/financial-settings?')) {
    if (checkSuperAdminAccess()) {
      await renderSuperAdminFinancialSettingsPage(mainContent);
    }
  } else {
    mainContent.innerHTML = `
      <div class="text-center py-20">
        <h2 class="text-3xl font-extrabold text-white mb-2">পৃষ্ঠাটি পাওয়া যায়নি (404)</h2>
        <p class="text-slate-400 text-sm mb-6">আপনি যে লিঙ্কটি খুঁজছেন তা বিদ্যমান নেই বা সরানো হয়েছে।</p>
        <a href="#/" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition">
          হোমপেজে ফিরে যান
        </a>
      </div>
    `;
  }
}

async function initApp() {
  try {
    await fetchCsrfToken();
  } catch {
    // Guest visitor or CSRF endpoint not yet available
  }

  try {
    await authService.getMe();
  } catch {
    // Guest visitor
  }

  window.addEventListener('hashchange', route);
  await route();
}

document.addEventListener('DOMContentLoaded', initApp);
