import { authService } from '../../../services/auth/authService.js';
import { t, isBangla, getLanguage } from '../../../i18n/index.js';

export function renderRegisterPage(container) {
  const isBn = isBangla();

  container.innerHTML = `
    <div class="max-w-md mx-auto py-12 px-4 sm:px-0">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-slate-900 mb-1">${t('auth.register_title')}</h1>
        <p class="text-slate-600 text-sm">${t('auth.register_desc')}</p>
      </div>

      <div id="register-alert" role="alert" aria-live="polite" class="hidden mb-6 p-4 rounded-xl text-sm"></div>

      <form id="register-form" class="space-y-4 bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
        <div>
          <label for="reg-name" class="block text-xs font-semibold text-slate-700 mb-1">${t('auth.full_name_label')} <span class="text-red-600" aria-hidden="true">*</span></label>
          <input type="text" id="reg-name" name="name" required autocomplete="name" placeholder="${isBn ? 'আপনার পূর্ণ নাম' : 'Your full name'}" class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
        </div>

        <div>
          <label for="reg-email" class="block text-xs font-semibold text-slate-700 mb-1">${t('auth.email_label')} <span class="text-red-600" aria-hidden="true">*</span></label>
          <input type="email" id="reg-email" name="email" required autocomplete="email" placeholder="name@domain.com" class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
        </div>

        <div>
          <label for="reg-mobile" class="block text-xs font-semibold text-slate-700 mb-1">${t('auth.mobile_label')}</label>
          <input type="tel" id="reg-mobile" name="mobile" autocomplete="tel" placeholder="017XXXXXXXX" class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
        </div>

        <div>
          <label for="reg-password" class="block text-xs font-semibold text-slate-700 mb-1">${t('auth.password_label')} (${isBn ? 'কমপক্ষে ৮ অক্ষর ও ১টি সংখ্যা' : 'min 8 characters & at least 1 number'}) <span class="text-red-600" aria-hidden="true">*</span></label>
          <input type="password" id="reg-password" name="password" required minlength="8" autocomplete="new-password" placeholder="••••••••" class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
        </div>

        <div>
          <label for="reg-confirm-password" class="block text-xs font-semibold text-slate-700 mb-1">${t('auth.confirm_password_label')} <span class="text-red-600" aria-hidden="true">*</span></label>
          <input type="password" id="reg-confirm-password" name="confirm-password" required minlength="8" autocomplete="new-password" placeholder="••••••••" class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
        </div>

        <button type="submit" id="reg-submit-btn" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-xs">
          ${t('auth.register_btn')}
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

        <!-- Google Registration Button -->
        <a href="/api/v1/auth/google" id="google-register-btn" class="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 rounded-lg text-sm font-medium transition shadow-xs">
          <svg class="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>${t('auth.google_continue')}</span>
        </a>

        <div class="text-center pt-4 border-t border-slate-200 text-xs text-slate-600">
          ${t('auth.have_account')} <a href="#/login" class="text-emerald-700 font-semibold hover:underline">${t('auth.sign_in_btn')}</a>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector('#register-form');
  const alertEl = container.querySelector('#register-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.className = 'hidden';

    const password = container.querySelector('#reg-password').value;
    const confirmPassword = container.querySelector('#reg-confirm-password').value;

    if (password !== confirmPassword) {
      alertEl.textContent = isBn ? 'পাসওয়ার্ড দুটি মিলছে না। পুনরায় যাচাই করুন।' : 'Passwords do not match. Please verify and re-enter.';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700';
      return;
    }

    const email = container.querySelector('#reg-email').value.trim();
    const btn = container.querySelector('#reg-submit-btn');
    btn.disabled = true;
    btn.textContent = t('auth.registering');

    try {
      const regRes = await authService.register({
        fullName: container.querySelector('#reg-name').value.trim(),
        email,
        mobile: container.querySelector('#reg-mobile').value.trim() || undefined,
        password,
        languagePreference: getLanguage(),
      });

      const verificationToken = regRes.data?.verificationToken;

      // Replace registration form with clear email verification instructions
      container.querySelector('#register-form').innerHTML = `
        <div class="text-center py-4">
          <div class="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs" aria-hidden="true">
            ✉️
          </div>
          <h2 class="text-xl font-bold text-slate-900 mb-1">${isBn ? 'নিবন্ধন সফল হয়েছে!' : 'Registration Successful!'}</h2>
          <p class="text-xs text-emerald-700 font-semibold mb-4">${isBn ? 'অনুগ্রহ করে ইমেইল ঠিকানা যাচাই করুন' : 'Please verify your email address'}</p>
          
          <div class="p-4 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-700 text-left mb-6 leading-relaxed">
            ${isBn ? `আমরা <strong class="text-emerald-800">${email}</strong> ঠিকানায় একটি যাচাইকরণ লিংক পাঠিয়েছি। আপনার অ্যাকাউন্টে প্রবেশ করতে অনুগ্রহ করে ইনবক্স চেক করে লিংকে ক্লিক করুন।` : `We sent a verification link to <strong class="text-emerald-800">${email}</strong>. To access your account, please check your inbox and click the link.`}<br/><br/>
            <span class="text-slate-500">${isBn ? 'ইমেইলটি ইনবক্সে না পেলে Spam বা Junk ফোল্ডার পরীক্ষা করুন।' : 'If you do not see the email, check your Spam or Junk folder.'}</span>
          </div>

          <div class="space-y-3">
            <a href="#/login" class="w-full inline-block py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition shadow-xs text-center">
              ${isBn ? 'লগইন পৃষ্ঠায় যান' : 'Go to Sign In'}
            </a>

            <button type="button" id="reg-resend-btn" class="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
              ${t('auth.resend_verification')}
            </button>
            <div id="resend-msg" class="hidden text-xs mt-2" role="status"></div>

            ${
              import.meta.env.DEV && verificationToken
                ? `
              <div class="pt-3 border-t border-slate-200">
                <a href="#/verify-email?token=${encodeURIComponent(verificationToken)}" class="w-full inline-block py-2 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-lg text-xs font-mono transition text-center">
                  ⚡ [Local Dev] Directly Verify Email
                </a>
              </div>
            `
                : ''
            }
          </div>
        </div>
      `;

      const resendBtn = container.querySelector('#reg-resend-btn');
      const resendMsg = container.querySelector('#resend-msg');
      if (resendBtn) {
        resendBtn.addEventListener('click', async () => {
          resendBtn.disabled = true;
          resendBtn.textContent = isBn ? 'পাঠানো হচ্ছে...' : 'Sending...';
          try {
            const res = await authService.resendVerification(email);
            resendMsg.textContent = res.data?.message || (isBn ? 'যাচাইকরণ লিংক পুনরায় পাঠানো হয়েছে।' : 'Verification link resent successfully.');
            resendMsg.className = 'text-xs mt-2 p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800';
          } catch (resendErr) {
            resendMsg.textContent = resendErr.message || (isBn ? 'লিংক পাঠাতে ব্যর্থ হয়েছে।' : 'Failed to send verification link.');
            resendMsg.className = 'text-xs mt-2 p-2 rounded bg-red-50 border border-red-200 text-red-700';
          } finally {
            resendBtn.disabled = false;
            resendBtn.textContent = t('auth.resend_verification');
          }
        });
      }
    } catch (err) {
      alertEl.textContent = err.message || (isBn ? 'নিবন্ধন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Registration failed. Please try again.');
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700';
      btn.disabled = false;
      btn.textContent = t('auth.register_btn');
    }
  });
}
