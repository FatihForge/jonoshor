import { authService } from '../../../services/auth/authService.js';
import { apiRequest } from '../../../services/api/apiClient.js';
import { t, isBangla } from '../../../i18n/index.js';

export function renderLoginPage(container) {
  let temp2FAToken = null;
  let targetAccountType = 'user';
  const isBn = isBangla();

  // Extract OAuth error message if redirected back from Google
  const oauthErrors = {
    google_auth_failed: isBn ? 'গুগল সাইন-ইন সম্পন্ন করা সম্ভব হয়নি। আবার চেষ্টা করুন।' : 'Google sign-in could not be completed. Please try again.',
    google_auth_denied: isBn ? 'গুগল প্রমাণীকরণ বাতিল করা হয়েছে।' : 'Google authentication was cancelled.',
    unverified_email: isBn ? 'আপনার গুগল ইমেইল যাচাইকৃত নয়। একটি যাচাইকৃত অ্যাকাউন্ট ব্যবহার করুন।' : 'Your Google account email is not verified. Please use a verified Google account.',
    account_suspended: isBn ? 'আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত। সহায়তায় যোগাযোগ করুন।' : 'Your account is currently suspended. Please contact platform support.',
    account_blocked: isBn ? 'আপনার অ্যাকাউন্ট ব্লক করা হয়েছে। সহায়তায় যোগাযোগ করুন।' : 'Your account has been blocked. Please contact platform support.',
    invalid_state: isBn ? 'নিরাপত্তা যাচাই ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Security validation failed. Please try again.',
    missing_code: isBn ? 'প্রমাণীকরণ কোড পাওয়া যায়নি। আবার চেষ্টা করুন।' : 'Authentication code was missing. Please try again.',
  };

  let initialErrorMsg = null;
  const hash = window.location.hash || '';
  const hashQueryIdx = hash.indexOf('?');
  if (hashQueryIdx !== -1) {
    const params = new URLSearchParams(hash.substring(hashQueryIdx));
    const errCode = params.get('error');
    if (errCode && oauthErrors[errCode]) {
      initialErrorMsg = oauthErrors[errCode];
    }
  }
  if (!initialErrorMsg) {
    const searchParams = new URLSearchParams(window.location.search);
    const errCode = searchParams.get('error');
    if (errCode && oauthErrors[errCode]) {
      initialErrorMsg = oauthErrors[errCode];
    }
  }

  container.innerHTML = `
    <div class="max-w-md mx-auto py-12 px-4 sm:px-0">
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-emerald-600 mx-auto flex items-center justify-center font-bold text-2xl text-white shadow-xs mb-4" aria-hidden="true">
          J
        </div>
        <h1 class="text-2xl font-bold text-slate-900 mb-1">${t('auth.sign_in_title')}</h1>
        <p class="text-slate-600 text-sm">${t('auth.sign_in_desc')}</p>
      </div>

      <div id="login-alert" role="alert" aria-live="polite" class="${initialErrorMsg ? 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700' : 'hidden mb-6 p-4 rounded-xl text-sm'}">
        ${initialErrorMsg || ''}
      </div>

      <!-- Step 1: Credentials Form -->
      <form id="credentials-form" class="space-y-4 bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
        <div>
          <label for="login-email" class="block text-xs font-semibold text-slate-700 mb-1">${t('auth.email_label')}</label>
          <input type="email" id="login-email" name="email" required autocomplete="email" placeholder="name@domain.com" class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="login-password" class="block text-xs font-semibold text-slate-700">${t('auth.password_label')}</label>
            <a href="#/forgot-password" class="text-xs text-emerald-700 hover:text-emerald-800 font-medium transition">
              ${t('auth.forgot_password')}
            </a>
          </div>
          <input type="password" id="login-password" name="password" required autocomplete="current-password" placeholder="••••••••" class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
        </div>

        <button type="submit" id="login-submit-btn" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-xs">
          ${t('auth.sign_in_btn')}
        </button>

        <!-- Divider -->
        <div class="relative my-4" aria-hidden="true">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-200"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="bg-white px-3 text-slate-500">${t('common.or')}</span>
          </div>
        </div>

        <!-- Google Login Button -->
        <a href="/api/v1/auth/google" id="google-login-btn" class="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 rounded-lg text-sm font-medium transition shadow-xs">
          <svg class="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>${t('auth.google_continue')}</span>
        </a>

        <div class="text-center pt-4 border-t border-slate-200 text-xs text-slate-600">
          ${t('auth.no_account')} <a href="#/register" class="text-emerald-700 font-semibold hover:underline">${t('auth.create_account')}</a>
        </div>
      </form>

      <!-- Step 2: 2FA Verification Form (Hidden Initially) -->
      <form id="totp-form" class="hidden space-y-4 bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
        <div class="text-center mb-4">
          <span class="inline-block p-2 rounded-full bg-emerald-50 text-emerald-700 mb-2" aria-hidden="true">🔒</span>
          <h2 class="text-base font-semibold text-slate-900">${t('auth.two_fa_title')}</h2>
          <p class="text-xs text-slate-600 mt-1">${t('auth.two_fa_desc')}</p>
        </div>

        <div>
          <label for="totp-code" class="sr-only">6-digit security code</label>
          <input type="text" id="totp-code" maxlength="6" pattern="[0-9]{6}" required placeholder="000000" class="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-center text-xl tracking-widest font-mono text-emerald-700 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
        </div>

        <button type="submit" id="totp-submit-btn" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-xs">
          ${t('auth.two_fa_btn')}
        </button>
      </form>
    </div>
  `;

  const credForm = container.querySelector('#credentials-form');
  const totpForm = container.querySelector('#totp-form');
  const alertEl = container.querySelector('#login-alert');

  credForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.className = 'hidden';
    const email = container.querySelector('#login-email').value;
    const password = container.querySelector('#login-password').value;
    const btn = container.querySelector('#login-submit-btn');

    btn.disabled = true;
    btn.textContent = t('auth.signing_in');

    try {
      // First try normal login (supports user directly, returns requires2FA for admin/superAdmin)
      const loginRes = await authService.login(email, password);

      if (loginRes.data?.requires2FA) {
        temp2FAToken = loginRes.data.temp2FAToken;
        targetAccountType = loginRes.data.accountType || 'superAdmin';
        credForm.classList.add('hidden');
        totpForm.classList.remove('hidden');
        return;
      }

      window.location.hash = '#/user/dashboard';
      window.location.reload();
    } catch (err) {
      // Check if user is blocked due to unverified email
      if (err.code === 'EMAIL_NOT_VERIFIED' || err.message?.includes('যাচাই') || err.message?.toLowerCase().includes('verif')) {
        alertEl.innerHTML = `
          <div class="space-y-2">
            <div>${err.message || (isBn ? 'আপনার ইমেইল ঠিকানা এখনো যাচাই করা হয়নি।' : 'Your email address has not been verified yet.')}</div>
            <button type="button" id="login-resend-btn" class="mt-1 text-xs text-amber-900 hover:text-amber-800 underline font-semibold">
              ✉️ ${t('auth.resend_verification')}
            </button>
            <div id="login-resend-status" class="hidden text-xs mt-1"></div>
          </div>
        `;
        alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-amber-50 border border-amber-200 text-amber-800';

        const resendBtn = alertEl.querySelector('#login-resend-btn');
        const resendStatus = alertEl.querySelector('#login-resend-status');
        if (resendBtn) {
          resendBtn.addEventListener('click', async () => {
            resendBtn.disabled = true;
            resendBtn.textContent = isBn ? 'পাঠানো হচ্ছে...' : 'Sending...';
            try {
              const res = await authService.resendVerification(email);
              resendStatus.textContent = res.data?.message || (isBn ? 'যাচাইকরণ লিংক পাঠানো হয়েছে। ইনবক্স দেখুন।' : 'Verification link sent. Please check your inbox.');
              resendStatus.className = 'text-xs mt-1 text-emerald-700 font-medium';
            } catch (rErr) {
              resendStatus.textContent = rErr.message || (isBn ? 'যাচাইকরণ লিংক পাঠাতে ব্যর্থ হয়েছে।' : 'Failed to send verification link.');
              resendStatus.className = 'text-xs mt-1 text-red-700 font-medium';
            } finally {
              resendBtn.disabled = false;
              resendBtn.textContent = `✉️ ${t('auth.resend_verification')}`;
            }
          });
        }
        return;
      }

      // Fallback check: super-admin direct login
      try {
        const saRes = await apiRequest('/auth/super-admin/login', {
          method: 'POST',
          body: { email, password },
        });

        if (saRes.data?.requires2FA) {
          temp2FAToken = saRes.data.temp2FAToken;
          targetAccountType = 'superAdmin';
          credForm.classList.add('hidden');
          totpForm.classList.remove('hidden');
          return;
        }
      } catch {
        // Not superAdmin
      }

      // Fallback check: admin direct login
      try {
        const adminRes = await apiRequest('/auth/admin/login', {
          method: 'POST',
          body: { email, password },
        });

        if (adminRes.data?.requires2FA) {
          temp2FAToken = adminRes.data.temp2FAToken;
          targetAccountType = 'admin';
          credForm.classList.add('hidden');
          totpForm.classList.remove('hidden');
          return;
        }
      } catch {
        // Not admin either
      }

      alertEl.textContent = err.message || (isBn ? 'ভুল ইমেইল বা পাসওয়ার্ড।' : 'Invalid email or password.');
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700';
    } finally {
      btn.disabled = false;
      btn.textContent = t('auth.sign_in_btn');
    }
  });

  totpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.className = 'hidden';
    const totpCode = container.querySelector('#totp-code').value;
    const btn = container.querySelector('#totp-submit-btn');

    btn.disabled = true;
    btn.textContent = t('auth.verifying');

    try {
      const verifyRes = await authService.verify2FA(temp2FAToken, totpCode, targetAccountType);

      await authService.getMe();

      const accType = verifyRes.data?.account?.accountType || targetAccountType;
      if (accType === 'superAdmin') {
        window.location.hash = '#/super-admin/dashboard';
      } else if (accType === 'admin') {
        window.location.hash = '#/admin/dashboard';
      } else {
        window.location.hash = '#/user/dashboard';
      }
      window.location.reload();
    } catch (err) {
      alertEl.textContent = err.message || (isBn ? 'ভুল 2FA প্রমাণীকরণ কোড।' : 'Invalid 2FA authentication code.');
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700';
    } finally {
      btn.disabled = false;
      btn.textContent = t('auth.two_fa_btn');
    }
  });
}
