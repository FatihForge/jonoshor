export function showModal({ title, description, contentHtml, confirmText = 'নিশ্চিত করুন', confirmColor = 'bg-emerald-600 hover:bg-emerald-500', onConfirm }) {
  // Remove any existing modal
  const existing = document.getElementById('admin-action-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'admin-action-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in';
  modal.innerHTML = `
    <div class="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
      <div class="flex items-start justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 class="text-lg font-bold text-white">${title}</h3>
          ${description ? `<p class="text-xs text-slate-400 mt-1">${description}</p>` : ''}
        </div>
        <button id="modal-close-btn" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="py-4 space-y-4 text-sm text-slate-200" id="modal-body-container">
        ${contentHtml}
        <div id="modal-error-banner" class="hidden p-3 bg-red-950/70 border border-red-800 rounded-lg text-xs text-red-200"></div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <button id="modal-cancel-btn" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition">
          বাতিল
        </button>
        <button id="modal-confirm-btn" class="px-4 py-2 rounded-lg ${confirmColor} text-white text-sm font-medium shadow-md transition flex items-center gap-2">
          <span id="modal-confirm-spinner" class="hidden w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <span id="modal-confirm-text">${confirmText}</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('#modal-close-btn');
  const cancelBtn = modal.querySelector('#modal-cancel-btn');
  const confirmBtn = modal.querySelector('#modal-confirm-btn');
  const errorBanner = modal.querySelector('#modal-error-banner');
  const spinner = modal.querySelector('#modal-confirm-spinner');

  const closeModal = () => modal.remove();

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  confirmBtn.addEventListener('click', async () => {
    errorBanner.classList.add('hidden');
    errorBanner.textContent = '';
    confirmBtn.disabled = true;
    spinner.classList.remove('hidden');

    try {
      await onConfirm(modal);
      closeModal();
    } catch (err) {
      errorBanner.textContent = err.message || 'অনুরোধটি ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
      errorBanner.classList.remove('hidden');
    } finally {
      confirmBtn.disabled = false;
      spinner.classList.add('hidden');
    }
  });

  return modal;
}
