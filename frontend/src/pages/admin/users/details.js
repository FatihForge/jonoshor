import { adminUserService } from '../../../services/admin/adminUserService.js';
import { renderAdminNav } from '../../../components/admin/AdminNav.js';
import { getAccountStatusBadge } from '../../../components/admin/StatusBadge.js';
import { formatDateTime } from '../../../utils/formatters.js';
import { showModal } from '../../../components/admin/ActionModal.js';
import { authService } from '../../../services/auth/authService.js';

export async function renderAdminUserDetailsPage(container, userId) {
  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = currentUser?.accountType === 'superAdmin';
  const hasUserReadPermission = isSuperAdmin || (Array.isArray(currentUser?.permissions) && currentUser.permissions.includes('user.read'));
  const hasUserManagePermission = isSuperAdmin || (Array.isArray(currentUser?.permissions) && currentUser.permissions.includes('user.manage'));

  const isSelf = currentUser?._id === userId || currentUser?.id === userId;

  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 text-slate-900">
      ${renderAdminNav('users')}

      <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Breadcrumb / Back button -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <a href="#/admin/users" class="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 transition">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Users Directory
          </a>
          <span class="text-xs text-slate-500 font-mono">ID: ${userId}</span>
        </div>

        <!-- Success Toast Banner -->
        <div id="user-details-success-banner" class="hidden p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center justify-between shadow-xs" role="status">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span id="user-details-success-text">Account status updated successfully.</span>
          </div>
          <button id="close-success-banner-btn" class="text-emerald-700 hover:text-emerald-900 text-sm font-bold ml-4" aria-label="Dismiss banner">✕</button>
        </div>

        <!-- State Containers -->
        <div id="user-details-loading" class="py-20 text-center" role="status">
          <div class="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true"></div>
          <p class="text-slate-500 text-sm">Loading user account profile...</p>
        </div>

        <div id="user-details-error" class="hidden py-16 text-center" role="alert"></div>

        <div id="user-details-permission-denied" class="hidden max-w-lg mx-auto my-12 p-8 rounded-2xl bg-white border border-amber-300 text-center shadow-xs">
          <div class="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 class="text-lg font-bold text-slate-900 mb-2">Permission Required</h2>
          <p class="text-xs text-slate-600 mb-4">You require the <code class="px-1.5 py-0.5 rounded bg-slate-100 text-amber-800 font-mono text-[11px]">user.read</code> permission to inspect user profiles.</p>
          <a href="#/admin/users" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition inline-block">
            Return to Directory
          </a>
        </div>

        <div id="user-details-content" class="hidden space-y-6">
          <!-- Top Profile Banner -->
          <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-xs shrink-0" aria-hidden="true">
                <span id="user-avatar-initial">?</span>
              </div>
              <div>
                <div class="flex items-center gap-2.5 flex-wrap">
                  <h1 id="user-full-name" class="text-xl font-bold text-slate-900 leading-snug">Loading user...</h1>
                  <span id="user-status-badge"></span>
                </div>
                <p id="user-email-line" class="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <span id="user-email">—</span>
                  <span id="user-email-verified-tag"></span>
                </p>
                <div class="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-mono">
                  <span>Registered: <span id="user-created-at" class="text-slate-700">—</span></span>
                  <span>•</span>
                  <span>Updated: <span id="user-updated-at" class="text-slate-700">—</span></span>
                </div>
              </div>
            </div>

            <!-- Action Area -->
            <div class="flex items-center gap-3 shrink-0">
              <button id="open-status-modal-btn" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Change Account Status
              </button>
            </div>
          </div>

          <!-- Information Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Account & Contact Details -->
            <div class="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-600" aria-hidden="true"></span>
                Contact & Identity Information
              </h2>

              <dl class="space-y-3 text-xs">
                <div>
                  <dt class="text-slate-500">Full Name</dt>
                  <dd id="info-full-name" class="text-slate-900 font-medium mt-0.5">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">Email Address</dt>
                  <dd id="info-email" class="text-slate-900 font-mono mt-0.5 flex items-center gap-2">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">Mobile Number</dt>
                  <dd id="info-mobile" class="text-slate-900 font-mono mt-0.5 flex items-center gap-2">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">Authentication Provider</dt>
                  <dd id="info-auth-provider" class="text-slate-900 font-mono mt-0.5 capitalize">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">Language Preference</dt>
                  <dd id="info-language" class="text-slate-900 mt-0.5">—</dd>
                </div>
              </dl>
            </div>

            <!-- Security & Platform Status -->
            <div class="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-indigo-600" aria-hidden="true"></span>
                Platform & Moderation State
              </h2>

              <dl class="space-y-3 text-xs">
                <div>
                  <dt class="text-slate-500">Account Status</dt>
                  <dd id="info-account-status" class="mt-1">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">User ID</dt>
                  <dd id="info-user-id" class="text-slate-800 font-mono select-all bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block mt-0.5">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">Account Created</dt>
                  <dd id="info-created-at" class="text-slate-900 mt-0.5">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">Last Profile Update</dt>
                  <dd id="info-updated-at" class="text-slate-900 mt-0.5">—</dd>
                </div>
                <div>
                  <dt class="text-slate-500">External Web Links</dt>
                  <dd id="info-external-links" class="text-slate-600 mt-0.5">None attached</dd>
                </div>
              </dl>

              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span class="font-semibold text-slate-800 block">🔒 Security Standard:</span>
                <p>Password hashes, session tokens, and security secrets are strictly shielded from administrative interfaces.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  const loadingEl = container.querySelector('#user-details-loading');
  const errorEl = container.querySelector('#user-details-error');
  const permDeniedEl = container.querySelector('#user-details-permission-denied');
  const contentEl = container.querySelector('#user-details-content');
  const successBanner = container.querySelector('#user-details-success-banner');
  const successText = container.querySelector('#user-details-success-text');
  const closeSuccessBtn = container.querySelector('#close-success-banner-btn');

  const avatarInitial = container.querySelector('#user-avatar-initial');
  const fullNameEl = container.querySelector('#user-full-name');
  const statusBadgeEl = container.querySelector('#user-status-badge');
  const emailEl = container.querySelector('#user-email');
  const emailVerifiedTag = container.querySelector('#user-email-verified-tag');
  const createdAtTop = container.querySelector('#user-created-at');
  const updatedAtTop = container.querySelector('#user-updated-at');
  const statusModalBtn = container.querySelector('#open-status-modal-btn');

  const infoFullName = container.querySelector('#info-full-name');
  const infoEmail = container.querySelector('#info-email');
  const infoMobile = container.querySelector('#info-mobile');
  const infoAuthProvider = container.querySelector('#info-auth-provider');
  const infoLanguage = container.querySelector('#info-language');
  const infoAccountStatus = container.querySelector('#info-account-status');
  const infoUserId = container.querySelector('#info-user-id');
  const infoCreatedAt = container.querySelector('#info-created-at');
  const infoUpdatedAt = container.querySelector('#info-updated-at');
  const infoExternalLinks = container.querySelector('#info-external-links');

  closeSuccessBtn.addEventListener('click', () => {
    successBanner.classList.add('hidden');
  });

  let loadedUserData = null;

  async function fetchUserDetails() {
    if (!hasUserReadPermission) {
      loadingEl.classList.add('hidden');
      permDeniedEl.classList.remove('hidden');
      return;
    }

    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    permDeniedEl.classList.add('hidden');
    contentEl.classList.add('hidden');

    try {
      const res = await adminUserService.getUserById(userId);
      const user = res?.data;
      if (!user) {
        throw new Error('User record not found');
      }

      loadedUserData = user;

      // Populate UI
      avatarInitial.textContent = (user.fullName || 'U').charAt(0).toUpperCase();
      fullNameEl.textContent = user.fullName || 'Unnamed User';
      statusBadgeEl.innerHTML = getAccountStatusBadge(user.accountStatus);
      emailEl.textContent = user.email || '—';

      if (user.emailVerified) {
        emailVerifiedTag.innerHTML = `
          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
            ✓ Verified
          </span>
        `;
      } else {
        emailVerifiedTag.innerHTML = `
          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
            Unverified
          </span>
        `;
      }

      createdAtTop.textContent = formatDateTime(user.createdAt);
      updatedAtTop.textContent = user.updatedAt ? formatDateTime(user.updatedAt) : '—';

      infoFullName.textContent = user.fullName || '—';
      infoEmail.innerHTML = `
        <span>${user.email || '—'}</span>
        ${user.emailVerified ? '<span class="text-emerald-700 text-xs">✓ Verified</span>' : '<span class="text-amber-700 text-xs">(Unverified)</span>'}
      `;

      infoMobile.innerHTML = user.mobile
        ? `<span>${user.mobile}</span> ${user.mobileVerified ? '<span class="text-emerald-700 text-xs">✓ Verified</span>' : '<span class="text-amber-700 text-xs">(Unverified)</span>'}`
        : '<span class="text-slate-400">Not provided</span>';

      infoAuthProvider.textContent = user.authProvider || 'local';
      infoLanguage.textContent = user.languagePreference === 'bn' ? 'Bengali (bn)' : user.languagePreference === 'en' ? 'English (en)' : 'Default (auto)';
      infoAccountStatus.innerHTML = getAccountStatusBadge(user.accountStatus);
      infoUserId.textContent = user._id || userId;
      infoCreatedAt.textContent = formatDateTime(user.createdAt);
      infoUpdatedAt.textContent = user.updatedAt ? formatDateTime(user.updatedAt) : '—';

      if (Array.isArray(user.externalLinks) && user.externalLinks.length > 0) {
        infoExternalLinks.innerHTML = user.externalLinks
          .map((link) => `<a href="${encodeURI(link)}" target="_blank" rel="noopener noreferrer" class="text-emerald-700 hover:underline block truncate">${link}</a>`)
          .join('');
      } else {
        infoExternalLinks.textContent = 'None attached';
      }

      // Check manage permissions & self-modification
      if (!hasUserManagePermission) {
        statusModalBtn.disabled = true;
        statusModalBtn.classList.add('opacity-50', 'cursor-not-allowed');
        statusModalBtn.title = 'Requires user.manage permission';
      } else if (isSelf) {
        statusModalBtn.disabled = true;
        statusModalBtn.classList.add('opacity-50', 'cursor-not-allowed');
        statusModalBtn.title = 'Administrators cannot alter their own account status';
      } else {
        statusModalBtn.disabled = false;
        statusModalBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        statusModalBtn.title = 'Change account status';
      }

      loadingEl.classList.add('hidden');
      contentEl.classList.remove('hidden');
    } catch (err) {
      loadingEl.classList.add('hidden');
      const isForbidden = err?.status === 403 || err?.message?.includes('permission') || err?.message?.includes('403');
      if (isForbidden) {
        permDeniedEl.classList.remove('hidden');
      } else {
        errorEl.classList.remove('hidden');
        errorEl.innerHTML = `
          <div class="max-w-md mx-auto p-6 rounded-xl bg-white border border-red-300 text-center shadow-xs">
            <p class="text-sm font-semibold text-red-700 mb-2">Failed to load user details</p>
            <p class="text-xs text-slate-600 mb-4">${err?.message || 'Unexpected error'}</p>
            <a href="#/admin/users" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs rounded-lg transition inline-block">
              Return to Directory
            </a>
          </div>
        `;
      }
    }
  }

  // Handle Status Update Modal
  statusModalBtn.addEventListener('click', () => {
    if (!hasUserManagePermission || isSelf) {
      return;
    }

    const currentStatus = loadedUserData?.accountStatus || 'active';

    const contentHtml = `
      <div class="space-y-4">
        <div>
          <label for="modal-status-select" class="block text-xs font-semibold text-slate-700 mb-1.5">New Account Status <span class="text-red-500">*</span></label>
          <select id="modal-status-select" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600">
            <option value="active" ${currentStatus === 'active' ? 'selected' : ''}>Active — Normal platform access</option>
            <option value="suspended" ${currentStatus === 'suspended' ? 'selected' : ''}>Suspended — Temporary login & submission block</option>
            <option value="blocked" ${currentStatus === 'blocked' ? 'selected' : ''}>Blocked — Permanent restriction</option>
          </select>
        </div>

        <div>
          <label for="modal-status-reason" class="block text-xs font-semibold text-slate-700 mb-1.5">Administrative Reason <span class="text-slate-400 text-[11px]">(Optional, max 500 chars)</span></label>
          <textarea id="modal-status-reason" rows="3" maxlength="500" placeholder="State reason or policy infraction..." class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 resize-none"></textarea>
        </div>

        <div class="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
          ⚠️ <strong>Notice:</strong> This moderation action is permanently logged to system audit logs with your administrator identity.
        </div>
      </div>
    `;

    showModal({
      title: 'Update User Account Status',
      description: `Modify status for ${loadedUserData?.fullName || 'User'} (#${(userId || '').slice(-6).toUpperCase()})`,
      contentHtml,
      confirmText: 'Save Status',
      confirmColor: 'bg-emerald-600 hover:bg-emerald-700',
      onConfirm: async (modalEl) => {
        const selectEl = modalEl.querySelector('#modal-status-select');
        const reasonEl = modalEl.querySelector('#modal-status-reason');

        const newStatus = selectEl.value;
        const reason = reasonEl.value.trim();

        const updateRes = await adminUserService.updateUserStatus(userId, {
          status: newStatus,
          reason: reason || undefined,
        });

        if (updateRes?.data) {
          loadedUserData = updateRes.data;
          statusBadgeEl.innerHTML = getAccountStatusBadge(updateRes.data.accountStatus);
          infoAccountStatus.innerHTML = getAccountStatusBadge(updateRes.data.accountStatus);
          if (updateRes.data.updatedAt) {
            updatedAtTop.textContent = formatDateTime(updateRes.data.updatedAt);
            infoUpdatedAt.textContent = formatDateTime(updateRes.data.updatedAt);
          }
        }

        successText.textContent = `User account status successfully updated to '${newStatus}'.`;
        successBanner.classList.remove('hidden');
      },
    });
  });

  await fetchUserDetails();
}
