import { authService } from '../../../services/auth/authService.js';

export function renderForgotPasswordPage(container) {
  container.innerHTML = `
    <div class="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 mx-auto flex items-center justify-center font-bold text-2xl text-white shadow-lg mb-4">
          জ
        </div>
        <h1 class="text-2xl font-bold text-white mb-1">পাসওয়ার্ড পুনরুদ্ধার</h1>
        <p class="text-slate-400 text-sm">আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল ঠিকানা প্রদান করুন</p>
      </div>

      <div id="forgot-alert" class="hidden mb-6 p-4 rounded-xl text-sm"></div>

      <!-- Request Form -->
      <form id="forgot-form" class="space-y-4 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl">
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">ইমেইল ঠিকানা</label>
          <input 
            type="email" 
            id="forgot-email" 
            required 
            placeholder="name@domain.com" 
            class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono" 
          />
        </div>

        <button 
          type="submit" 
          id="forgot-submit-btn" 
          class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition shadow-md flex items-center justify-center gap-2"
        >
          <span>রিসেট লিঙ্ক পাঠান</span>
        </button>

        <div class="text-center pt-4 border-t border-slate-800 text-xs text-slate-400">
          মনে পড়েছে? <a href="#/login" class="text-emerald-400 font-medium hover:underline">লগইন পৃষ্ঠায় ফিরে যান</a>
        </div>
      </form>

      <!-- Success Card (Hidden Initially) -->
      <div id="forgot-success-card" class="hidden space-y-4 bg-slate-900 border border-emerald-800/80 p-6 md:p-8 rounded-2xl shadow-xl text-center">
        <div class="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl mb-2">
          ✉️
        </div>
        <h3 class="text-lg font-bold text-white">রিসেট নির্দেশাবলী পাঠানো হয়েছে</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          যদি এই ইমেইল ঠিকানাটি জনস্বর অ্যাকাউন্টে নিবন্ধিত থাকে, তবে পাসওয়ার্ড রিসেটের নির্দেশাবলী পাঠানো হয়েছে। অনুগ্রহ করে আপনার ইনবক্স (বা স্প্যাম ফোল্ডার) চেক করুন।
        </p>
        <p class="text-[11px] text-slate-500 leading-relaxed">
          * নিরাপত্তার স্বার্থে ইমেইল ঠিকানার অভ্যন্তরীণ অস্তিত্ব সংক্রান্ত কোনো তথ্য প্রকাশ করা হয় না।
        </p>

        <!-- Direct Dev/Test Helper if token returned in response -->
        <div id="dev-token-container" class="hidden pt-3 border-t border-slate-800">
          <p class="text-[10px] text-slate-400 mb-2">সরাসরি রিসেট লিঙ্ক (পরীক্ষণ বা টেস্টের জন্য):</p>
          <a id="dev-reset-link" href="#" class="inline-block px-4 py-2 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-mono hover:bg-emerald-900 transition">
            পাসওয়ার্ড রিসেট ফর্মে যান ↗
          </a>
        </div>

        <div class="pt-4 border-t border-slate-800">
          <a href="#/login" class="inline-block px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition">
            লগইন পৃষ্ঠায় ফিরে যান
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
      alertEl.textContent = 'অনুগ্রহ করে সঠিক ইমেইল ঠিকানা প্রদান করুন।';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `
      <span class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
      <span>অনুরোধ পাঠানো হচ্ছে...</span>
    `;

    try {
      const res = await authService.forgotPassword(email);

      form.classList.add('hidden');
      successCard.classList.remove('hidden');

      // If token is returned by API (e.g., test/dev environment), provide direct link for easy navigation
      if (res.data?.resetToken) {
        devResetLink.href = `#/reset-password?token=${encodeURIComponent(res.data.resetToken)}`;
        devTokenContainer.classList.remove('hidden');
      }
    } catch (err) {
      alertEl.textContent = err.message || 'পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300';
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span>রিসেট লিঙ্ক পাঠান</span>`;
    }
  });
}
