import { authService } from '../../../services/auth/authService.js';

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

  container.innerHTML = `
    <div class="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 mx-auto flex items-center justify-center font-bold text-2xl text-white shadow-lg mb-4">
          জ
        </div>
        <h1 class="text-2xl font-bold text-white mb-1">নতুন পাসওয়ার্ড নির্ধারণ</h1>
        <p class="text-slate-400 text-sm">আপনার অ্যাকাউন্টের জন্য নতুন ও শক্তিশালী পাসওয়ার্ড সেট করুন</p>
      </div>

      <div id="reset-alert" class="hidden mb-6 p-4 rounded-xl text-sm"></div>

      ${
        !token
          ? `
        <!-- Missing Token Warning -->
        <div class="bg-slate-900 border border-amber-800/80 p-6 md:p-8 rounded-2xl shadow-xl text-center space-y-4">
          <div class="w-12 h-12 bg-amber-950 text-amber-400 rounded-full flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>
          <h3 class="text-base font-bold text-white">রিসেট টোকেন পাওয়া যায়নি</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            পাসওয়ার্ড রিসেট লিঙ্কটি অসম্পূর্ণ অথবা টোকেনটি অনুপস্থিত। অনুগ্রহ করে ইমেইলে পাওয়া সম্পূর্ণ লিঙ্কটি ব্যবহার করুন অথবা পুনরায় নতুন লিঙ্কের অনুরোধ করুন।
          </p>
          <div class="pt-2">
            <a href="#/forgot-password" class="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition">
              নতুন রিসেট লিঙ্কের অনুরোধ করুন
            </a>
          </div>
        </div>
      `
          : `
        <!-- Reset Password Form -->
        <form id="reset-form" class="space-y-4 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl">
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-medium text-slate-300">নতুন পাসওয়ার্ড</label>
              <button type="button" id="toggle-pwd-btn" class="text-[11px] text-emerald-400 hover:text-emerald-300 transition">
                দেখান
              </button>
            </div>
            <input 
              type="password" 
              id="reset-new-password" 
              required 
              minlength="8"
              placeholder="কমপক্ষে ৮ অক্ষর ও একটি সংখ্যা" 
              class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono" 
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
            <input 
              type="password" 
              id="reset-confirm-password" 
              required 
              minlength="8"
              placeholder="পুনরায় একই পাসওয়ার্ড লিখুন" 
              class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono" 
            />
          </div>

          <!-- Requirements Hint -->
          <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1 text-[11px] text-slate-400">
            <div class="font-medium text-slate-300">পাসওয়ার্ডের শর্তাবলী:</div>
            <div id="rule-length" class="flex items-center gap-1.5 text-slate-500">
              <span>•</span> <span>কমপক্ষে ৮টি অক্ষর</span>
            </div>
            <div id="rule-digit" class="flex items-center gap-1.5 text-slate-500">
              <span>•</span> <span>অন্তত একটি সংখ্যা (০-৯)</span>
            </div>
            <div id="rule-match" class="flex items-center gap-1.5 text-slate-500">
              <span>•</span> <span>উভয় পাসওয়ার্ডের মিল</span>
            </div>
          </div>

          <button 
            type="submit" 
            id="reset-submit-btn" 
            class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition shadow-md flex items-center justify-center gap-2"
          >
            <span>পাসওয়ার্ড পরিবর্তন করুন</span>
          </button>

          <div class="text-center pt-4 border-t border-slate-800 text-xs text-slate-400">
            <a href="#/login" class="text-slate-400 hover:text-white transition">লগইন পৃষ্ঠায় ফিরে যান</a>
          </div>
        </form>

        <!-- Success Card (Hidden Initially) -->
        <div id="reset-success-card" class="hidden space-y-4 bg-slate-900 border border-emerald-800/80 p-6 md:p-8 rounded-2xl shadow-xl text-center">
          <div class="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl mb-2">
            ✓
          </div>
          <h3 class="text-lg font-bold text-white">পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            আপনার অ্যাকাউন্টের পাসওয়ার্ড হালনাগাদ করা হয়েছে। এখন নতুন পাসওয়ার্ড ব্যবহার করে সরাসরি অ্যাকাউন্টে প্রবেশ করতে পারবেন।
          </p>
          <div class="pt-4 border-t border-slate-800">
            <a href="#/login" class="inline-block w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-sm transition shadow-md">
              লগইন করুন
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
      toggleBtn.textContent = isPasswordVisible ? 'লুকান' : 'দেখান';
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
      ruleLength.className = `flex items-center gap-1.5 ${lengthValid ? 'text-emerald-400' : 'text-slate-500'}`;
    }
    if (ruleDigit) {
      ruleDigit.className = `flex items-center gap-1.5 ${digitValid ? 'text-emerald-400' : 'text-slate-500'}`;
    }
    if (ruleMatch) {
      ruleMatch.className = `flex items-center gap-1.5 ${matchValid ? 'text-emerald-400' : 'text-slate-500'}`;
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
      alertEl.textContent = 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300';
      return;
    }

    if (!/\d/.test(newPassword)) {
      alertEl.textContent = 'পাসওয়ার্ডে অন্তত একটি সংখ্যা (digit) থাকতে হবে।';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300';
      return;
    }

    if (newPassword !== confirmPassword) {
      alertEl.textContent = 'উভয় পাসওয়ার্ড একই হতে হবে।';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `
      <span class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
      <span>পাসওয়ার্ড পরিবর্তন হচ্ছে...</span>
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
            <p class="font-bold">⚠️ রিসেট লিঙ্কটি অকার্যকর বা এর মেয়াদ উত্তীর্ণ হয়েছে।</p>
            <p class="mt-1 text-xs">অনুগ্রহ করে নতুন রিসেট লিঙ্কের অনুরোধ করুন।</p>
            <a href="#/forgot-password" class="mt-2 inline-block text-xs font-semibold underline text-red-200 hover:text-white">
              নতুন লিঙ্ক অনুরোধ করতে এখানে চাপুন →
            </a>
          </div>
        `;
      } else {
        alertEl.textContent = err.message || 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে।';
      }
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300';
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span>পাসওয়ার্ড পরিবর্তন করুন</span>`;
    }
  });
}
