import { authService } from '../../../services/auth/authService.js';
import { t, isBangla } from '../../../i18n/index.js';

export function renderForgotPasswordPage(container) {
  const isBn = isBangla();

  container.innerHTML = `
    <div class="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-emerald-600 mx-auto flex items-center justify-center font-bold text-2xl text-white shadow-xs mb-4" aria-hidden="true">
          J
        </div>
        <h1 class="text-2xl font-bold text-slate-900 mb-1">${t('auth.forgot_title')}</h1>
        <p class="text-slate-600 text-sm">${t('auth.forgot_desc')}</p>
      </div>

      <div id="forgot-alert" role="alert" aria-live="polite" class="hidden mb-6 p-4 rounded-xl text-sm"></div>

      <!-- Request Form -->
      <form id="forgot-form" class="space-y-4 bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
        <div>
          <label for="forgot-email" class="block text-xs font-semibold text-slate-700 mb-1">${t('auth.email_label')}</label>
          <input 
            type="email" 
            id="forgot-email" 
            name="email"
            required 
            autocomplete="email"
            placeholder="name@domain.com" 
            class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono" 
          />
        </div>

        <button 
          type="submit" 
          id="forgot-submit-btn" 
          class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-xs flex items-center justify-center gap-2"
        >
          <span>${t('auth.send_reset_btn')}</span>
        </button>

        <div class="text-center pt-4 border-t border-slate-200 text-xs text-slate-600">
          ${isBn ? 'পাসওয়ার্ড মনে পড়েছে?' : 'Remembered your password?'} <a href="#/login" class="text-emerald-700 font-semibold hover:underline">${t('auth.back_to_sign_in')}</a>
        </div>
      </form>

      <!-- Success Card (Hidden Initially) -->
      <div id="forgot-success-card" class="hidden space-y-4 bg-white border border-emerald-200 p-6 md:p-8 rounded-2xl shadow-sm text-center" role="status">
        <div class="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl mb-2" aria-hidden="true">
          ✉️
        </div>
        <h2 class="text-lg font-bold text-slate-900">${isBn ? 'রিসেট নির্দেশিকা পাঠানো হয়েছে' : 'Reset Instructions Sent'}</h2>
        <p class="text-xs text-slate-600 leading-relaxed">
          ${isBn ? 'যদি এই ইমেইলটি কোনো সক্রিয় জনস্বর অ্যাকাউন্টের সাথে যুক্ত থাকে, তবে পাসওয়ার্ড পরিবর্তনের নির্দেশিকা পাঠানো হয়েছে। ইনবক্স বা স্প্যাম ফোল্ডার পরীক্ষা করুন।' : 'If this email is associated with a JonoShor account, password reset instructions have been dispatched. Please check your inbox (or spam folder).'}
        </p>
        <p class="text-[11px] text-slate-500 leading-relaxed">
          ${isBn ? '* নিরাপত্তা ও গোপনীয়তা রক্ষার স্বার্থে অ্যাকাউন্টের অস্তিত্ব প্রকাশ করা হয় না।' : '* For security and privacy reasons, the system does not disclose account registration existence.'}
        </p>

        ${
          import.meta.env.DEV
            ? `
        <!-- Direct Dev/Test Helper if token returned in response -->
        <div id="dev-token-container" class="hidden pt-3 border-t border-slate-200">
          <p class="text-[10px] text-slate-500 mb-2">Direct Reset Link (Local Testing):</p>
          <a id="dev-reset-link" href="#" class="inline-block px-4 py-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-xs font-mono hover:bg-purple-100 transition">
            Open Reset Password Form ↗
          </a>
        </div>
        `
            : ''
        }

        <div class="pt-4 border-t border-slate-200">
          <a href="#/login" class="inline-block px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
            ${t('auth.back_to_sign_in')}
          </a>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#forgot-form');
  const alertEl = container.querySelector('#forgot-alert');
  const successCard = container.querySelector('#forgot-success-card');
  const devTokenContainer = container.querySelector('#dev-token-container');
  const devResetLink = container.querySelector('#dev-reset-link');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.className = 'hidden';

    const email = container.querySelector('#forgot-email').value.trim();
    const btn = container.querySelector('#forgot-submit-btn');

    if (!email) {
      alertEl.textContent = isBn ? 'সঠিক ইমেইল ঠিকানা প্রদান করুন।' : 'Please enter a valid email address.';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>${t('auth.sending_reset')}</span>
    `;

    try {
      const res = await authService.forgotPassword(email);

      form.classList.add('hidden');
      successCard.classList.remove('hidden');

      if (import.meta.env.DEV && res.data?.resetToken && devResetLink && devTokenContainer) {
        devResetLink.href = `#/reset-password?token=${encodeURIComponent(res.data.resetToken)}`;
        devTokenContainer.classList.remove('hidden');
      }
    } catch (err) {
      alertEl.textContent = err.message || (isBn ? 'রিসেট অনুরোধ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Failed to process request. Please try again.');
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700';
      btn.disabled = false;
      btn.innerHTML = `<span>${t('auth.send_reset_btn')}</span>`;
    }
  });
}
