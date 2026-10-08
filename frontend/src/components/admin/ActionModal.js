export function showModal({ title, description, contentHtml, confirmText = 'Confirm', confirmColor = 'bg-emerald-600 hover:bg-emerald-700', onConfirm }) {
  // Remove any existing modal
  const existing = document.getElementById('admin-action-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'admin-action-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modal-title');
  modal.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-xl relative text-slate-800" role="document">
      <div class="flex items-start justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 id="modal-title" class="text-lg font-bold text-slate-900">${title}</h3>
          ${description ? `<p class="text-xs text-slate-500 mt-1">${description}</p>` : ''}
        </div>
        <button id="modal-close-btn" aria-label="Close modal" class="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition focus-visible:ring-2 focus-visible:ring-emerald-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="py-4 space-y-4 text-sm text-slate-700" id="modal-body-container">
        ${contentHtml}
        <div id="modal-error-banner" role="alert" aria-live="assertive" class="hidden p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700"></div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <button id="modal-cancel-btn" class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-slate-400">
          Cancel
        </button>
        <button id="modal-confirm-btn" class="px-4 py-2 rounded-lg ${confirmColor} text-white text-sm font-medium shadow-sm transition flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-600">
          <span id="modal-confirm-spinner" class="hidden w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" aria-hidden="true"></span>
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

  confirmBtn.addEventListener('click', async () => {
    errorBanner.classList.add('hidden');
    errorBanner.textContent = '';
    confirmBtn.disabled = true;
    spinner.classList.remove('hidden');

    try {
      await onConfirm(modal);
      closeModal();
    } catch (err) {
      errorBanner.textContent = err.message || 'Request failed. Please try again.';
      errorBanner.classList.remove('hidden');
    } finally {
      confirmBtn.disabled = false;
      spinner.classList.add('hidden');
    }
  });

  // Accessible auto-focus
  setTimeout(() => {
    const firstInput = modal.querySelector('input, select, textarea, button:not(#modal-close-btn)');
    if (firstInput) firstInput.focus();
  }, 50);

  return modal;
}
