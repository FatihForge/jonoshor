import { authService } from '../../../services/auth/authService.js';
import { apiRequest } from '../../../services/api/apiClient.js';

export function renderLoginPage(container) {
  let temp2FAToken = null;

  // Extract OAuth error message if redirected back from Google
  const oauthErrors = {
    google_auth_failed: 'গুগল লগইন সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
    google_auth_denied: 'গুগল প্রমাণীকরণ বাতিল করা হয়েছে।',
    unverified_email: 'আপনার গুগল অ্যাকাউন্টের ইমেইল যাচাইকৃত নয়। অনুগ্রহ করে একটি যাচাইকৃত গুগল অ্যাকাউন্ট ব্যবহার করুন।',
    account_suspended: 'আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত রয়েছে। অনুগ্রহ করে সহায়তা দলের সাথে যোগাযোগ করুন।',
    account_blocked: 'আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে। অনুগ্রহ করে সহায়তা দলের সাথে যোগাযোগ করুন।',
    invalid_state: 'নিরাপত্তা যাচাই ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
    missing_code: 'প্রমাণীকরণ কোড পাওয়া যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
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
    <div class="max-w-md mx-auto py-12">
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 mx-auto flex items-center justify-center font-bold text-2xl text-white shadow-lg mb-4">
          জ
        </div>
        <h1 class="text-2xl font-bold text-white mb-1">জনস্বর অ্যাকাউন্টে প্রবেশ করুন</h1>
        <p class="text-slate-400 text-sm">আপনার ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন</p>
      </div>

      <div id="login-alert" class="${initialErrorMsg ? 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300' : 'hidden mb-6 p-4 rounded-xl text-sm'}">
        ${initialErrorMsg || ''}
      </div>

      <!-- Step 1: Credentials Form -->
      <form id="credentials-form" class="space-y-4 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl">
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">ইমেইল ঠিকানা</label>
          <input type="email" id="login-email" required placeholder="name@domain.com" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-medium text-slate-300">পাসওয়ার্ড</label>
            <a href="#/forgot-password" class="text-xs text-emerald-400 hover:text-emerald-300 transition">
              পাসওয়ার্ড ভুলে গেছেন?
            </a>
          </div>
          <input type="password" id="login-password" required placeholder="••••••••" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
        </div>

        <button type="submit" id="login-submit-btn" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition shadow-md">
          লগইন করুন
        </button>

        <!-- Divider -->
        <div class="relative my-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-800"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="bg-slate-900 px-3 text-slate-500">অথবা</span>
          </div>
        </div>

        <!-- Google Login Button -->
        <a href="/api/v1/auth/google" id="google-login-btn" class="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-lg text-sm font-medium transition shadow-sm">
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>Google দিয়ে প্রবেশ করুন</span>
        </a>

        <div class="text-center pt-4 border-t border-slate-800 text-xs text-slate-400">
          অ্যাকাউন্ট নেই? <a href="#/register" class="text-emerald-400 font-medium hover:underline">নতুন অ্যাকাউন্ট খুলুন</a>
        </div>
      </form>

      <!-- Step 2: 2FA Verification Form (Hidden Initially) -->
      <form id="totp-form" class="hidden space-y-4 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl">
        <div class="text-center mb-4">
          <span class="inline-block p-2 rounded-full bg-emerald-950 text-emerald-400 mb-2">🔒</span>
          <h3 class="text-base font-semibold text-white">দ্বিমুখী নিরাপত্তা যাচাই (2FA)</h3>
          <p class="text-xs text-slate-400 mt-1">আপনার প্রমাণীকরণ অ্যাপ (Authenticator App)-এর ৬ ডিজিটের কোডটি লিখুন</p>
        </div>

        <div>
          <input type="text" id="totp-code" maxlength="6" pattern="[0-9]{6}" required placeholder="000000" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-center text-xl tracking-widest font-mono text-emerald-400 focus:outline-none focus:border-emerald-500" />
        </div>

        <button type="submit" id="totp-submit-btn" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition shadow-md">
          যাচাই ও প্রবেশ করুন
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
    btn.textContent = 'যাচাই হচ্ছে...';

    try {
      // First try normal user login
      await authService.login(email, password);
      window.location.hash = '#/user/dashboard';
      window.location.reload();
    } catch (err) {
      // Check if user is blocked due to unverified email
      if (err.code === 'EMAIL_NOT_VERIFIED' || err.message?.includes('যাচাই') || err.message?.toLowerCase().includes('verif')) {
        alertEl.innerHTML = `
          <div class="space-y-2">
            <div>${err.message || 'আপনার ইমেইল ঠিকানাটি এখনও যাচাই করা হয়নি।'}</div>
            <button type="button" id="login-resend-btn" class="mt-1 text-xs text-amber-300 hover:text-amber-200 underline font-semibold">
              ✉️ পুনরায় ভেরিফিকেশন লিঙ্ক পাঠান
            </button>
            <div id="login-resend-status" class="hidden text-xs mt-1"></div>
          </div>
        `;
        alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-amber-950/90 border border-amber-700 text-amber-200';

        const resendBtn = alertEl.querySelector('#login-resend-btn');
        const resendStatus = alertEl.querySelector('#login-resend-status');
        if (resendBtn) {
          resendBtn.addEventListener('click', async () => {
            resendBtn.disabled = true;
            resendBtn.textContent = 'পাঠানো হচ্ছে...';
            try {
              const res = await authService.resendVerification(email);
              resendStatus.textContent = res.data?.message || 'যাচাইকরণ লিঙ্ক পাঠানো হয়েছে। ইনবক্স চেক করুন।';
              resendStatus.className = 'text-xs mt-1 text-emerald-300 font-medium';
            } catch (rErr) {
              resendStatus.textContent = rErr.message || 'লিঙ্ক পাঠাতে ব্যর্থ হয়েছে।';
              resendStatus.className = 'text-xs mt-1 text-red-300 font-medium';
            } finally {
              resendBtn.disabled = false;
              resendBtn.textContent = '✉️ পুনরায় ভেরিফিকেশন লিঙ্ক পাঠান';
            }
          });
        }
        return;
      }

      // If unauthorized, check if it's an admin account requiring 2FA
      try {
        const adminRes = await apiRequest('/auth/admin/login', {
          method: 'POST',
          body: { email, password },
        });

        if (adminRes.data?.requires2FA) {
          temp2FAToken = adminRes.data.temp2FAToken;
          credForm.classList.add('hidden');
          totpForm.classList.remove('hidden');
          return;
        }
      } catch {
        // Not admin either
      }

      alertEl.textContent = err.message || 'ভুল ইমেইল বা পাসওয়ার্ড।';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300';
    } finally {
      btn.disabled = false;
      btn.textContent = 'লগইন করুন';
    }
  });

  totpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.className = 'hidden';
    const totpCode = container.querySelector('#totp-code').value;
    const btn = container.querySelector('#totp-submit-btn');

    btn.disabled = true;
    btn.textContent = 'কোড যাচাই হচ্ছে...';

    try {
      await apiRequest('/auth/admin/2fa/verify', {
        method: 'POST',
        body: { temp2FAToken, totpCode },
      });

      window.location.hash = '#/';
      window.location.reload();
    } catch (err) {
      alertEl.textContent = err.message || 'ভুল ২এফএ কোড।';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300';
    } finally {
      btn.disabled = false;
      btn.textContent = 'যাচাই ও প্রবেশ করুন';
    }
  });
}
