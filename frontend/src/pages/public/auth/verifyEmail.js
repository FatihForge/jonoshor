// Email Verification Page
import { authService } from '../../../services/auth/authService.js';
import { t, isBangla } from '../../../i18n/index.js';

export async function renderVerifyEmailPage(container) {
  const isBn = isBangla();

  // Extract token from URL hash (e.g., #/verify-email?token=abc...)
  const hash = window.location.hash || '';
  const queryString = hash.includes('?') ? hash.split('?')[1] : '';
  const urlParams = new URLSearchParams(queryString);
  const token = urlParams.get('token');

  container.innerHTML = `
    <div class="max-w-md mx-auto my-12 p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
      <div class="text-center mb-6">
        <div id="verify-icon" class="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs" aria-hidden="true">
          ✉️
        </div>
        <h1 id="verify-title" class="text-2xl font-bold text-slate-900 mb-2">${t('auth.verify_email_title')}</h1>
        <p id="verify-subtitle" class="text-sm text-slate-600">${isBn ? 'আপনার জনস্বর অ্যাকাউন্টের নিরাপত্তা নিশ্চিতকরণ' : 'Securing your JonoShor account'}</p>
      </div>

      <div id="verify-status-area">
        ${
          token
            ? `
          <div class="text-center py-6">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600 mb-4" role="status" aria-label="Loading"></div>
            <p class="text-sm text-slate-700">${isBn ? 'ইমেইল যাচাই করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...' : 'Verifying your email, please wait a moment...'}</p>
          </div>
        `
            : `
          <div class="space-y-4">
            <div class="p-4 rounded-xl text-sm bg-amber-50 border border-amber-200 text-amber-800" role="alert">
              ${isBn ? 'কোনো যাচাইকরণ টোকেন পাওয়া যায়নি। ইমেইলের লিংকে ক্লিক করুন অথবা নতুন লিংকের জন্য অনুরোধ করুন।' : 'No verification token was found. Please click the link sent to your email or request a new verification link below.'}
            </div>

            <form id="resend-form" class="space-y-4 pt-2">
              <div>
                <label for="resend-email" class="block text-xs font-semibold text-slate-700 mb-1">${isBn ? 'নিবন্ধিত ইমেইল ঠিকানা' : 'Registered Email Address'}</label>
                <input 
                  type="email" 
                  id="resend-email" 
                  name="email"
                  required 
                  autocomplete="email"
                  placeholder="name@example.com" 
                  class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                />
              </div>

              <div id="resend-alert" class="hidden" role="alert"></div>

              <button 
                type="submit" 
                id="resend-btn"
                class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition shadow-xs"
              >
                ${t('auth.resend_verification')}
              </button>
            </form>
          </div>
        `
        }
      </div>

      <div class="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-600 flex items-center justify-center gap-4">
        <a href="#/login" class="text-emerald-700 hover:underline font-semibold">${isBn ? 'লগইন পৃষ্ঠায় যান' : 'Go to Sign In'}</a>
        <span aria-hidden="true">•</span>
        <a href="#/register" class="text-slate-600 hover:underline">${t('auth.create_account')}</a>
      </div>
    </div>
  `;

  const statusArea = container.querySelector('#verify-status-area');
  const iconEl = container.querySelector('#verify-icon');
  const titleEl = container.querySelector('#verify-title');
  const subtitleEl = container.querySelector('#verify-subtitle');

  // If token is available, attempt immediate verification
  if (token) {
    try {
      const res = await authService.verifyEmail(token);
      iconEl.className = 'w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs';
      iconEl.innerHTML = '✅';
      titleEl.textContent = isBn ? 'ইমেইল সফলভাবে যাচাইকৃত!' : 'Email Successfully Verified!';
      subtitleEl.textContent = isBn ? 'আপনার জনস্বর অ্যাকাউন্ট এখন সক্রিয়' : 'Your JonoShor account is now active and ready';

      statusArea.innerHTML = `
        <div class="p-4 rounded-xl text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 mb-6 text-center leading-relaxed" role="status">
          ${res.data?.message || (isBn ? 'অভিনন্দন! আপনার ইমেইল ঠিকানা সফলভাবে যাচাই করা হয়েছে।' : 'Congratulations! Your email has been verified. You can now access all features of your account.')}
        </div>

        <a 
          href="#/login" 
          class="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition shadow-xs"
        >
          <span>${isBn ? 'অ্যাকাউন্টে সাইন ইন করুন' : 'Sign In to Account'}</span>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </a>
      `;
    } catch (err) {
      iconEl.className = 'w-16 h-16 rounded-2xl bg-red-50 border border-red-300 text-red-600 flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs';
      iconEl.innerHTML = '⚠️';
      titleEl.textContent = isBn ? 'যাচাইকরণ ব্যর্থ হয়েছে' : 'Verification Failed';
      subtitleEl.textContent = isBn ? 'লিংকটির মেয়াদ শেষ অথবা অকার্যকর' : 'The link may have expired or is invalid';

      statusArea.innerHTML = `
        <div class="p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700 mb-6 text-center" role="alert">
          ${err.message || (isBn ? 'যাচাইকরণ লিংকটি অকার্যকর বা মেয়াদোত্তীর্ণ।' : 'The verification link is invalid or has expired.')}
        </div>

        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
          <h2 class="text-xs font-semibold text-slate-800 mb-2">${isBn ? 'নতুন যাচাইকরণ লিংকের জন্য আবেদন করুন' : 'Request a new verification link'}</h2>
          <form id="resend-form" class="space-y-3">
            <label for="resend-email" class="sr-only">Registered Email Address</label>
            <input 
              type="email" 
              id="resend-email" 
              name="email"
              required 
              autocomplete="email"
              placeholder="${isBn ? 'আপনার নিবন্ধিত ইমেইল লিখুন' : 'Enter your registered email'}" 
              class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
            />
            <div id="resend-alert" class="hidden" role="alert"></div>
            <button 
              type="submit" 
              id="resend-btn"
              class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
            >
              ${isBn ? 'লিংক পুনরায় পাঠান' : 'Resend Link'}
            </button>
          </form>
        </div>
      `;

      attachResendHandler(statusArea);
    }
  } else {
    attachResendHandler(statusArea);
  }

  function attachResendHandler(scope) {
    const resendForm = scope.querySelector('#resend-form');
    if (!resendForm) return;

    resendForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = scope.querySelector('#resend-email').value.trim();
      const alertEl = scope.querySelector('#resend-alert');
      const btn = scope.querySelector('#resend-btn');

      btn.disabled = true;
      btn.textContent = isBn ? 'পাঠানো হচ্ছে...' : 'Sending...';
      alertEl.className = 'hidden';

      try {
        const res = await authService.resendVerification(email);
        alertEl.textContent = res.data?.message || (isBn ? 'আপনার ইমেইলে যাচাইকরণ লিংক পাঠানো হয়েছে।' : 'Verification link has been sent to your email. Please check your inbox.');
        alertEl.className = 'p-3 rounded-lg text-xs bg-emerald-50 border border-emerald-200 text-emerald-800';
        resendForm.reset();
      } catch (resendErr) {
        alertEl.textContent = resendErr.message || (isBn ? 'লিংক পাঠাতে সমস্যা হয়েছে।' : 'Failed to send verification link.');
        alertEl.className = 'p-3 rounded-lg text-xs bg-red-50 border border-red-200 text-red-700';
      } finally {
        btn.disabled = false;
        btn.textContent = isBn ? 'লিংক পুনরায় পাঠান' : 'Resend Link';
      }
    });
  }
}
