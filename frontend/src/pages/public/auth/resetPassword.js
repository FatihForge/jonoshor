import { authService } from '../../../services/auth/authService.js';
import { t, isBangla } from '../../../i18n/index.js';

function extractResetToken() {
  // 1. Search in URL query string (?token=...)
  const urlParams = new URLSearchParams(window.location.search);
  const queryToken = urlParams.get('token');
  if (queryToken) return queryToken;

  // 2. Search in hash query string (#/reset-password?token=...)
  const hash = window.location.hash || '';
  const hashQueryIndex = hash.indexOf('?');
  if (hashQueryIndex !== -1) {
    const hashParams = new URLSearchParams(hash.substring(hashQueryIndex + 1));
    const hashToken = hashParams.get('token');
    if (hashToken) return hashToken;
  }

  // 3. Search in path format (#/reset-password/:token)
  if (hash.startsWith('#/reset-password/')) {
    const part = hash.replace('#/reset-password/', '').split('?')[0];
    if (part) return decodeURIComponent(part);
  }

  return null;
}

export function renderResetPasswordPage(container) {
  const token = extractResetToken();
  const isBn = isBangla();

  container.innerHTML = `
    <div class="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-emerald-600 mx-auto flex items-center justify-center font-bold text-2xl text-white shadow-xs mb-4" aria-hidden="true">
          J
        </div>
        <h1 class="text-2xl font-bold text-slate-900 mb-1">${t('auth.reset_title')}</h1>
        <p class="text-slate-600 text-sm">${t('auth.reset_desc')}</p>
      </div>

      <div id="reset-alert" role="alert" aria-live="polite" class="hidden mb-6 p-4 rounded-xl text-sm"></div>

      ${
        !token
          ? `
        <!-- Missing Token Warning -->
        <div class="bg-white border border-amber-200 p-6 md:p-8 rounded-2xl shadow-sm text-center space-y-4" role="alert">
          <div class="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto text-2xl" aria-hidden="true">
            ⚠️
          </div>
          <h2 class="text-base font-bold text-slate-900">${isBn ? 'রিসেট টোকেন অনুপস্থিত' : 'Reset Token Missing'}</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            ${isBn ? 'পাসওয়ার্ড রিসেট লিংকটি অসম্পূর্ণ বা অকার্যকর। আপনার ইমেইলে প্রেরিত সম্পূর্ণ লিংকটি ব্যবহার করুন বা নতুন লিংকের আবেদন করুন।' : 'The password reset link is invalid or incomplete. Please use the complete link provided in your email or request a new one.'}
          </p>
          <div class="pt-2">
            <a href="#/forgot-password" class="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition">
              ${isBn ? 'নতুন রিসেট লিংকের আবেদন করুন' : 'Request New Reset Link'}
            </a>
          </div>
        </div>
      `
          : `
        <!-- Reset Password Form -->
        <form id="reset-form" class="space-y-4 bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="reset-new-password" class="block text-xs font-semibold text-slate-700">${t('auth.new_password_label')}</label>
              <button type="button" id="toggle-pwd-btn" class="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium transition" aria-label="Toggle password visibility">
                ${isBn ? 'দেখান' : 'Show'}
              </button>
            </div>
            <input 
              type="password" 
              id="reset-new-password" 
              name="newPassword"
              required 
              minlength="8"
              autocomplete="new-password"
              placeholder="${isBn ? 'কমপক্ষে ৮ অক্ষর ও ১টি সংখ্যা' : 'Minimum 8 characters & at least 1 number'}" 
              class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono" 
            />
          </div>

          <div>
            <label for="reset-confirm-password" class="block text-xs font-semibold text-slate-700 mb-1">${t('auth.confirm_password_label')}</label>
            <input 
              type="password" 
              id="reset-confirm-password" 
              name="confirmPassword"
              required 
              minlength="8"
              autocomplete="new-password"
              placeholder="${isBn ? 'একই পাসওয়ার্ড পুনরায় দিন' : 'Re-enter same password'}" 
              class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono" 
            />
          </div>

          <!-- Requirements Hint -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600" aria-live="polite">
            <div class="font-semibold text-slate-800">${isBn ? 'পাসওয়ার্ডের শর্তাবলী:' : 'Password Requirements:'}</div>
            <div id="rule-length" class="flex items-center gap-1.5 text-slate-500">
              <span aria-hidden="true">•</span> <span>${isBn ? 'কমপক্ষে ৮টি অক্ষর' : 'At least 8 characters'}</span>
            </div>
            <div id="rule-digit" class="flex items-center gap-1.5 text-slate-500">
              <span aria-hidden="true">•</span> <span>${isBn ? 'কমপক্ষে একটি সংখ্যা (০-৯)' : 'At least one number (0-9)'}</span>
            </div>
            <div id="rule-match" class="flex items-center gap-1.5 text-slate-500">
              <span aria-hidden="true">•</span> <span>${isBn ? 'পাসওয়ার্ড দুটি মিলেছে' : 'Passwords match'}</span>
            </div>
          </div>

          <button 
            type="submit" 
            id="reset-submit-btn" 
            class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-xs flex items-center justify-center gap-2"
          >
            <span>${t('auth.update_password_btn')}</span>
          </button>

          <div class="text-center pt-4 border-t border-slate-200 text-xs text-slate-600">
            <a href="#/login" class="text-slate-600 hover:text-slate-900 transition">${t('auth.back_to_sign_in')}</a>
          </div>
        </form>

        <!-- Success Card (Hidden Initially) -->
        <div id="reset-success-card" class="hidden space-y-4 bg-white border border-emerald-200 p-6 md:p-8 rounded-2xl shadow-sm text-center" role="status">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl mb-2" aria-hidden="true">
            ✓
          </div>
          <h2 class="text-lg font-bold text-slate-900">${isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' : 'Password Updated Successfully!'}</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            ${isBn ? 'আপনার অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তিত হয়েছে। এখন আপনি নতুন পাসওয়ার্ড দিয়ে সাইন ইন করতে পারেন।' : 'Your account password has been updated. You can now log in using your new credentials.'}
          </p>
          <div class="pt-4 border-t border-slate-200">
            <a href="#/login" class="inline-block w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-xs">
              ${t('auth.sign_in_btn')}
            </a>
          </div>
        </div>
      `
      }
    </div>
  `;

  if (!token) return;

  const form = container.querySelector('#reset-form');
  const alertEl = container.querySelector('#reset-alert');
  const successCard = container.querySelector('#reset-success-card');
  const newPwdInput = container.querySelector('#reset-new-password');
  const confirmPwdInput = container.querySelector('#reset-confirm-password');
  const toggleBtn = container.querySelector('#toggle-pwd-btn');

  // Show/Hide password toggle
  let isPasswordVisible = false;
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isPasswordVisible = !isPasswordVisible;
      const type = isPasswordVisible ? 'text' : 'password';
      newPwdInput.type = type;
      confirmPwdInput.type = type;
      toggleBtn.textContent = isPasswordVisible ? (isBn ? 'লুকান' : 'Hide') : (isBn ? 'দেখান' : 'Show');
    });
  }

  // Live validator feedback
  function updateRuleHints() {
    const val = newPwdInput.value;
    const confirmVal = confirmPwdInput.value;

    const lengthValid = val.length >= 8;
    const digitValid = /\d/.test(val);
    const matchValid = val.length > 0 && val === confirmVal;

    const ruleLength = container.querySelector('#rule-length');
    const ruleDigit = container.querySelector('#rule-digit');
    const ruleMatch = container.querySelector('#rule-match');

    if (ruleLength) {
      ruleLength.className = `flex items-center gap-1.5 ${lengthValid ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`;
    }
    if (ruleDigit) {
      ruleDigit.className = `flex items-center gap-1.5 ${digitValid ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`;
    }
    if (ruleMatch) {
      ruleMatch.className = `flex items-center gap-1.5 ${matchValid ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`;
    }
  }

  newPwdInput.addEventListener('input', updateRuleHints);
  confirmPwdInput.addEventListener('input', updateRuleHints);

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.className = 'hidden';

    const newPassword = newPwdInput.value;
    const confirmPassword = confirmPwdInput.value;
    const btn = container.querySelector('#reset-submit-btn');

    if (newPassword.length < 8) {
      alertEl.textContent = isBn ? 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।' : 'New password must be at least 8 characters long.';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700';
      return;
    }

    if (!/\d/.test(newPassword)) {
      alertEl.textContent = isBn ? 'পাসওয়ার্ডে কমপক্ষে একটি সংখ্যা থাকতে হবে।' : 'Password must include at least one number.';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700';
      return;
    }

    if (newPassword !== confirmPassword) {
      alertEl.textContent = isBn ? 'পাসওয়ার্ড দুটি মিলছে না।' : 'Passwords do not match.';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `
      <span class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" aria-hidden="true"></span>
      <span>${t('auth.updating_password')}</span>
    `;

    try {
      await authService.resetPassword(token, newPassword);

      form.classList.add('hidden');
      successCard.classList.remove('hidden');
    } catch (err) {
      const isExpired = err.message && (err.message.includes('expired') || err.message.includes('Invalid'));
      if (isExpired) {
        alertEl.innerHTML = `
          <div>
            <p class="font-bold">⚠️ ${isBn ? 'রিসেট লিংকটির মেয়াদ উত্তীর্ণ বা অকার্যকর।' : 'The reset link is invalid or has expired.'}</p>
            <p class="mt-1 text-xs">${isBn ? 'অনুগ্রহ করে নতুন রিসেট লিংকের আবেদন করুন।' : 'Please request a new reset link to proceed.'}</p>
            <a href="#/forgot-password" class="mt-2 inline-block text-xs font-semibold underline text-red-700 hover:text-red-800">
              ${isBn ? 'নতুন লিংকের জন্য এখানে ক্লিক করুন →' : 'Click here to request a new link →'}
            </a>
          </div>
        `;
      } else {
        alertEl.textContent = err.message || (isBn ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' : 'Failed to update password. Please try again.');
      }
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700';
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span>${t('auth.update_password_btn')}</span>`;
    }
  });
}
