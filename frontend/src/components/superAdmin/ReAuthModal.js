import { superAdminService } from '../../services/superAdmin/superAdminService.js';

/**
 * Re-authentication modal for critical operations
 * Prompts Super Admin for password and 2FA TOTP code, then obtains short-lived critical reAuthToken.
 */
export function showReAuthModal({
  title = 'গুরুত্বপূর্ণ সিদ্ধান্তের জন্য পুনঃপ্রমাণীকরণ (Re-Authentication)',
  description = 'এই সংবেদনশীল প্রশাসনিক পরিবর্তনটি কার্যকর করতে আপনার পাসওয়ার্ড এবং ২-ফ্যাক্টর (2FA) কোড যাচাই করুন।',
  onSuccess,
}) {
  const existing = document.getElementById('superadmin-reauth-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'superadmin-reauth-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in';
  modal.innerHTML = `
    <div class="bg-slate-900 border border-purple-700/60 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
      <!-- Header -->
      <div class="flex items-start justify-between pb-3 border-b border-slate-800">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-purple-950 border border-purple-700 text-purple-300 flex items-center justify-center font-bold text-lg">
            🔒
          </div>
          <div>
            <h3 class="text-base font-bold text-white">${title}</h3>
            <p class="text-[11px] text-slate-400 mt-0.5">${description}</p>
          </div>
        </div>
        <button id="reauth-close-btn" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
          ✕
        </button>
      </div>

      <!-- Body / Form -->
      <form id="reauth-form" class="py-4 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            সুপার অ্যাডমিন পাসওয়ার্ড <span class="text-rose-400">*</span>
          </label>
          <input
            type="password"
            id="reauth-password"
            required
            placeholder="আপনার অ্যাকাউন্টের বর্তমান পাসওয়ার্ড"
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            ২-ফ্যাক্টর অথেনটিকেটর কোড (TOTP Code) <span class="text-rose-400">*</span>
          </label>
          <input
            type="text"
            id="reauth-totp"
            required
            maxlength="6"
            pattern="[0-9]{6}"
            placeholder="৬ ডিজিটের কোড (যেমন: 123456)"
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-center text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div id="reauth-error-banner" class="hidden p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-start gap-2">
          <span class="text-red-400 font-bold">⚠️</span>
          <span id="reauth-error-text">যাচাইকরণ ব্যর্থ হয়েছে।</span>
        </div>

        <div class="p-3 bg-purple-950/40 border border-purple-800/40 rounded-xl text-[11px] text-purple-300/90 leading-relaxed">
          🛡️ এই পুনঃপ্রমাণীকরণ টোকেনটি স্বল্পমেয়াদী (৫ মিনিট) এবং শুধুমাত্র এই নির্দিষ্ট ক্রিয়াকলাপের জন্য প্রযোজ্য হবে।
        </div>

        <!-- Footer Buttons -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            type="button"
            id="reauth-cancel-btn"
            class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            বাতিল
          </button>
          <button
            type="submit"
            id="reauth-submit-btn"
            class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-950/60 transition flex items-center gap-2"
          >
            <span id="reauth-spinner" class="hidden w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            <span id="reauth-btn-text">যাচাই করে কার্যকর করুন</span>
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('#reauth-close-btn');
  const cancelBtn = modal.querySelector('#reauth-cancel-btn');
  const form = modal.querySelector('#reauth-form');
  const passwordInput = modal.querySelector('#reauth-password');
  const totpInput = modal.querySelector('#reauth-totp');
  const errorBanner = modal.querySelector('#reauth-error-banner');
  const errorText = modal.querySelector('#reauth-error-text');
  const submitBtn = modal.querySelector('#reauth-submit-btn');
  const spinner = modal.querySelector('#reauth-spinner');
  const btnText = modal.querySelector('#reauth-btn-text');

  const closeModal = () => modal.remove();

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Focus password
  passwordInput.focus();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.classList.add('hidden');
    errorText.textContent = '';
    submitBtn.disabled = true;
    spinner.classList.remove('hidden');
    btnText.textContent = 'যাচাই করা হচ্ছে...';

    const password = passwordInput.value.trim();
    const totpCode = totpInput.value.trim();

    try {
      const res = await superAdminService.reAuthenticate({ password, totpCode });
      const reAuthToken = res?.data?.reAuthToken;
      if (!reAuthToken) {
        throw new Error('পুনঃপ্রমাণীকরণ টোকেন ইস্যু করা যায়নি');
      }

      closeModal();
      if (typeof onSuccess === 'function') {
        await onSuccess(reAuthToken);
      }
    } catch (err) {
      errorText.textContent = err?.message || 'পুনঃপ্রমাণীকরণ ব্যর্থ হয়েছে। সঠিক পাসওয়ার্ড ও 2FA কোড প্রদান করুন।';
      errorBanner.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      spinner.classList.add('hidden');
      btnText.textContent = 'যাচাই করে কার্যকর করুন';
    }
  });

  return modal;
}
