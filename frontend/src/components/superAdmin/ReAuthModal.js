import { superAdminService } from '../../services/superAdmin/superAdminService.js';

/**
 * Re-authentication modal for critical operations
 * Prompts Super Admin for password and 2FA TOTP code, then obtains short-lived critical reAuthToken.
 */
export function showReAuthModal({
  title = 'Critical Action Re-Authentication',
  description = 'Verify your Super Admin password and 2FA authenticator code to execute this sensitive operation.',
  onSuccess,
}) {
  const existing = document.getElementById('superadmin-reauth-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'superadmin-reauth-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'reauth-title');
  modal.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl relative text-slate-800" role="document">
      <!-- Header -->
      <div class="flex items-start justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-lg" aria-hidden="true">
            🔒
          </div>
          <div>
            <h3 id="reauth-title" class="text-base font-bold text-slate-900">${title}</h3>
            <p class="text-[11px] text-slate-500 mt-0.5">${description}</p>
          </div>
        </div>
        <button id="reauth-close-btn" aria-label="Close dialog" class="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition focus-visible:ring-2 focus-visible:ring-purple-600">
          ✕
        </button>
      </div>

      <!-- Body / Form -->
      <form id="reauth-form" class="py-4 space-y-4">
        <div>
          <label for="reauth-password" class="block text-xs font-semibold text-slate-700 mb-1">
            Super Admin Password <span class="text-rose-600">*</span>
          </label>
          <input
            type="password"
            id="reauth-password"
            required
            placeholder="Enter your current password"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
          />
        </div>

        <div>
          <label for="reauth-totp" class="block text-xs font-semibold text-slate-700 mb-1">
            2-Factor Authenticator Code (TOTP) <span class="text-rose-600">*</span>
          </label>
          <input
            type="text"
            id="reauth-totp"
            required
            maxlength="6"
            pattern="[0-9]{6}"
            placeholder="6-digit code (e.g. 123456)"
            class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono tracking-widest text-center text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
          />
        </div>

        <div id="reauth-error-banner" role="alert" aria-live="assertive" class="hidden p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
          <span class="text-red-600 font-bold" aria-hidden="true">⚠️</span>
          <span id="reauth-error-text">Re-authentication failed.</span>
        </div>

        <div class="p-3 bg-purple-50 border border-purple-200 rounded-lg text-[11px] text-purple-900 leading-relaxed">
          🛡️ This re-authentication token is valid for 5 minutes and strictly authorized for this action only.
        </div>

        <!-- Footer Buttons -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            id="reauth-cancel-btn"
            class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="reauth-submit-btn"
            class="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-purple-600"
          >
            <span id="reauth-spinner" class="hidden w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" aria-hidden="true"></span>
            <span id="reauth-btn-text">Verify & Execute</span>
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

  const closeModal = () => {
    document.removeEventListener('keydown', handleKeyDown);
    modal.remove();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Focus password field on open
  setTimeout(() => passwordInput?.focus(), 50);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.classList.add('hidden');
    errorText.textContent = '';
    submitBtn.disabled = true;
    spinner.classList.remove('hidden');
    btnText.textContent = 'Verifying...';

    const password = passwordInput.value.trim();
    const totpCode = totpInput.value.trim();

    try {
      const res = await superAdminService.reAuthenticate({ password, totpCode });
      const reAuthToken = res?.data?.reAuthToken;
      if (!reAuthToken) {
        throw new Error('Re-authentication token was not issued');
      }

      closeModal();
      if (typeof onSuccess === 'function') {
        await onSuccess(reAuthToken);
      }
    } catch (err) {
      errorText.textContent = err?.message || 'Re-authentication failed. Please enter the correct password and 2FA code.';
      errorBanner.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      spinner.classList.add('hidden');
      btnText.textContent = 'Verify & Execute';
    }
  });

  return modal;
}
