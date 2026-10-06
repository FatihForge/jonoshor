import { authService } from '../../../services/auth/authService.js';

export function renderRegisterPage(container) {
  container.innerHTML = `
    <div class="max-w-md mx-auto py-12">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-white mb-1">জনস্বরে নতুন অ্যাকাউন্ট তৈরি করুন</h1>
        <p class="text-slate-400 text-sm">আপনার অভিযোগ ও তথ্য নিরাপদে ট্র্যাক করতে নিবন্ধন করুন</p>
      </div>

      <div id="register-alert" class="hidden mb-6 p-4 rounded-xl text-sm"></div>

      <form id="register-form" class="space-y-4 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl">
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">পূর্ণ নাম <span class="text-red-400">*</span></label>
          <input type="text" id="reg-name" required placeholder="আপনার পূর্ণ নাম" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">ইমেইল ঠিকানা <span class="text-red-400">*</span></label>
          <input type="email" id="reg-email" required placeholder="name@domain.com" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">মোবাইল নম্বর (ঐচ্ছিক)</label>
          <input type="tel" id="reg-mobile" placeholder="017XXXXXXXX" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর ও একটি সংখ্যা) <span class="text-red-400">*</span></label>
          <input type="password" id="reg-password" required minlength="8" placeholder="••••••••" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">পাসওয়ার্ড নিশ্চিত করুন <span class="text-red-400">*</span></label>
          <input type="password" id="reg-confirm-password" required minlength="8" placeholder="••••••••" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
        </div>

        <button type="submit" id="reg-submit-btn" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition shadow-md">
          অ্যাকাউন্ট খুলুন
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

        <!-- Google Registration Button -->
        <a href="/api/v1/auth/google" id="google-register-btn" class="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-lg text-sm font-medium transition shadow-sm">
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>Google দিয়ে এগিয়ে যান</span>
        </a>

        <div class="text-center pt-4 border-t border-slate-800 text-xs text-slate-400">
          ইতিমধ্যে অ্যাকাউন্ট আছে? <a href="#/login" class="text-emerald-400 font-medium hover:underline">লগইন করুন</a>
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
      alertEl.textContent = 'পাসওয়ার্ড দুটি মিলছে না। দয়া করে যাচাই করে লিখুন।';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300';
      return;
    }

    const email = container.querySelector('#reg-email').value.trim();
    const btn = container.querySelector('#reg-submit-btn');
    btn.disabled = true;
    btn.textContent = 'নিবন্ধন হচ্ছে...';

    try {
      const regRes = await authService.register({
        fullName: container.querySelector('#reg-name').value.trim(),
        email,
        mobile: container.querySelector('#reg-mobile').value.trim() || undefined,
        password,
      });

      const verificationToken = regRes.data?.verificationToken;

      // Replace registration form with clear email verification instructions
      container.querySelector('#register-form').innerHTML = `
        <div class="text-center py-4">
          <div class="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-emerald-950/50">
            ✉️
          </div>
          <h3 class="text-xl font-bold text-white mb-2">নিবন্ধন সফল হয়েছে!</h3>
          <p class="text-xs text-emerald-400 font-semibold mb-4">অনুগ্রহ করে আপনার ইমেইল যাচাই করুন</p>
          
          <div class="p-4 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-300 text-left mb-6 leading-relaxed">
            আমরা <strong class="text-emerald-400">${email}</strong> ঠিকানায় একটি যাচাইকরণ লিঙ্ক পাঠিয়েছি। অ্যাকাউন্টে প্রবেশ করতে অনুগ্রহ করে আপনার ইমেইল ইনবক্স চেক করে লিঙ্কে ক্লিক করুন।<br/><br/>
            <span class="text-slate-400">মেইল না পেলে স্প্যাম (Spam) বা জাঙ্ক (Junk) ফোল্ডার চেক করুন।</span>
          </div>

          <div class="space-y-3">
            <a href="#/login" class="w-full inline-block py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition shadow-md">
              লগইন পেজে যান
            </a>

            <button type="button" id="reg-resend-btn" class="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition">
              পুনরায় লিঙ্ক পাঠান
            </button>
            <div id="resend-msg" class="hidden text-xs mt-2"></div>

            ${
              verificationToken
                ? `
              <div class="pt-3 border-t border-slate-800">
                <a href="#/verify-email?token=${encodeURIComponent(verificationToken)}" class="w-full inline-block py-2 px-3 bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-300 rounded-lg text-xs font-mono transition">
                  ⚡ [লোকাল টেস্ট] সরাসরি ইমেইল ভেরিফাই করুন
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
          resendBtn.textContent = 'পাঠানো হচ্ছে...';
          try {
            const res = await authService.resendVerification(email);
            resendMsg.textContent = res.data?.message || 'যাচাইকরণ লিঙ্ক পুনরায় পাঠানো হয়েছে।';
            resendMsg.className = 'text-xs mt-2 p-2 rounded bg-emerald-950 border border-emerald-800 text-emerald-300';
          } catch (resendErr) {
            resendMsg.textContent = resendErr.message || 'লিঙ্ক পাঠাতে ব্যর্থ হয়েছে।';
            resendMsg.className = 'text-xs mt-2 p-2 rounded bg-red-950 border border-red-800 text-red-300';
          } finally {
            resendBtn.disabled = false;
            resendBtn.textContent = 'পুনরায় লিঙ্ক পাঠান';
          }
        });
      }
    } catch (err) {
      alertEl.textContent = err.message || 'নিবন্ধন ব্যর্থ হয়েছে।';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300';
      btn.disabled = false;
      btn.textContent = 'অ্যাকাউন্ট খুলুন';
    }
  });
}
