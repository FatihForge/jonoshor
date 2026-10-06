// Email Verification Page
import { authService } from '../../../services/auth/authService.js';

export async function renderVerifyEmailPage(container) {
  // Extract token from URL hash (e.g., #/verify-email?token=abc...)
  const hash = window.location.hash || '';
  const queryString = hash.includes('?') ? hash.split('?')[1] : '';
  const urlParams = new URLSearchParams(queryString);
  const token = urlParams.get('token');

  container.innerHTML = `
    <div class="max-w-md mx-auto my-12 p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
      <div class="text-center mb-6">
        <div id="verify-icon" class="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
          ✉️
        </div>
        <h2 id="verify-title" class="text-2xl font-bold text-white mb-2">ইমেইল যাচাইকরণ</h2>
        <p id="verify-subtitle" class="text-sm text-slate-400">আপনার জনস্বর অ্যাকাউন্টের নিরাপত্তা নিশ্চিতকরণ</p>
      </div>

      <div id="verify-status-area">
        ${
          token
            ? `
          <div class="text-center py-6">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
            <p class="text-sm text-slate-300">আপনার ইমেইল যাচাই করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
          </div>
        `
            : `
          <div class="space-y-4">
            <div class="p-4 rounded-xl text-sm bg-amber-950/80 border border-amber-800 text-amber-300">
              কোনো যাচাইকরণ টোকেন পাওয়া যায়নি। আপনার ইনবক্সে পাঠানো লিঙ্কে ক্লিক করুন অথবা নিচে আপনার ইমেইল লিখে নতুন লিঙ্ক চান।
            </div>

            <form id="resend-form" class="space-y-4 pt-2">
              <div>
                <label for="resend-email" class="block text-xs font-semibold text-slate-300 mb-1">নিবন্ধিত ইমেইল ঠিকানা</label>
                <input 
                  type="email" 
                  id="resend-email" 
                  required 
                  placeholder="name@example.com" 
                  class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div id="resend-alert" class="hidden"></div>

              <button 
                type="submit" 
                id="resend-btn"
                class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition shadow-md"
              >
                নতুন ভেরিফিকেশন লিঙ্ক পাঠান
              </button>
            </form>
          </div>
        `
        }
      </div>

      <div class="mt-8 pt-4 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-4">
        <a href="#/login" class="text-emerald-400 hover:underline font-medium">লগইন পেজে যান</a>
        <span>•</span>
        <a href="#/register" class="text-slate-400 hover:underline">নতুন অ্যাকাউন্ট খুলুন</a>
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
      iconEl.className = 'w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-emerald-950/50';
      iconEl.innerHTML = '✅';
      titleEl.textContent = 'ইমেইল সফলভাবে যাচাই হয়েছে!';
      subtitleEl.textContent = 'আপনার জনস্বর অ্যাকাউন্ট এখন সম্পূর্ণ সক্রিয়';

      statusArea.innerHTML = `
        <div class="p-4 rounded-xl text-sm bg-emerald-950/80 border border-emerald-800 text-emerald-300 mb-6 text-center leading-relaxed">
          ${res.data?.message || 'অভিনন্দন! আপনার ইমেইল সফলভাবে নিশ্চিত করা হয়েছে। আপনি এখন আপনার অ্যাকাউন্ট ব্যবহার করতে পারেন।'}
        </div>

        <a 
          href="#/login" 
          class="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-emerald-900/30"
        >
          <span>অ্যাকাউন্টে লগইন করুন</span>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </a>
      `;
    } catch (err) {
      iconEl.className = 'w-16 h-16 rounded-2xl bg-red-950 border border-red-700 text-red-400 flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-red-950/50';
      iconEl.innerHTML = '⚠️';
      titleEl.textContent = 'যাচাইকরণ ব্যর্থ হয়েছে';
      subtitleEl.textContent = 'লিঙ্কটি মেয়াদোত্তীর্ণ বা অকার্যকর হতে পারে';

      statusArea.innerHTML = `
        <div class="p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300 mb-6 text-center">
          ${err.message || 'যাচাইকরণ লিঙ্কটি সঠিক নয় বা মেয়াদ শেষ হয়ে গেছে।'}
        </div>

        <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800 mb-4">
          <h4 class="text-xs font-semibold text-slate-300 mb-2">নতুন যাচাইকরণ লিঙ্ক চান?</h4>
          <form id="resend-form" class="space-y-3">
            <input 
              type="email" 
              id="resend-email" 
              required 
              placeholder="আপনার নিবন্ধিত ইমেইল লিখুন" 
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
            <div id="resend-alert" class="hidden"></div>
            <button 
              type="submit" 
              id="resend-btn"
              class="w-full py-2 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition"
            >
              পুনরায় লিঙ্ক পাঠান
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
      btn.textContent = 'পাঠানো হচ্ছে...';
      alertEl.className = 'hidden';

      try {
        const res = await authService.resendVerification(email);
        alertEl.textContent = res.data?.message || 'যাচাইকরণ লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স চেক করুন।';
        alertEl.className = 'p-3 rounded-lg text-xs bg-emerald-950 border border-emerald-800 text-emerald-300';
        resendForm.reset();
      } catch (resendErr) {
        alertEl.textContent = resendErr.message || 'লিঙ্ক পাঠাতে ব্যর্থ হয়েছে।';
        alertEl.className = 'p-3 rounded-lg text-xs bg-red-950 border border-red-800 text-red-300';
      } finally {
        btn.disabled = false;
        btn.textContent = 'পুনরায় লিঙ্ক পাঠান';
      }
    });
  }
}
