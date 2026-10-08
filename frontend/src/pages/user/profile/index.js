import { userService } from '../../../services/user/userService.js';
import { authService } from '../../../services/auth/authService.js';
import { renderUserNav } from '../../../components/user/UserNav.js';
import { formatDateTime } from '../../../utils/formatters.js';
import { setLanguage, t, isBangla } from '../../../i18n/index.js';

export async function renderUserProfilePage(container) {
  let profile = null;
  let security = null;
  let isLoading = true;
  let isSavingProfile = false;
  let isSavingPassword = false;
  let profileErrorMessage = null;
  let profileSuccessMessage = null;
  let passwordErrorMessage = null;
  let passwordSuccessMessage = null;

  function render() {
    container.innerHTML = `
      <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        ${renderUserNav('profile')}

        <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
          <!-- Page Header -->
          <div class="pb-6 border-b border-slate-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xl shadow-xs" aria-hidden="true">
                👤
              </div>
              <div>
                <h1 class="text-2xl font-bold text-slate-900 tracking-tight">${t('user.profile_title')}</h1>
                <p class="text-xs text-slate-500 mt-0.5">${t('user.profile_desc')}</p>
              </div>
            </div>
          </div>

          ${
            isLoading
              ? `
            <div class="py-24 text-center space-y-4">
              <div class="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" aria-hidden="true"></div>
              <p class="text-xs text-slate-500">${t('common.loading')}</p>
            </div>
          `
              : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Card 1: Personal Profile Details -->
              <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <h2 class="text-base font-bold text-slate-900">${t('user.personal_info')}</h2>
                      <p class="text-xs text-slate-500 mt-0.5">${t('user.personal_info_desc')}</p>
                    </div>
                    <span class="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold uppercase">
                      ${profile?.accountStatus || 'active'}
                    </span>
                  </div>

                  <!-- Profile Alerts -->
                  ${
                    profileSuccessMessage
                      ? `
                    <div class="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs" role="status">
                      ✓ ${profileSuccessMessage}
                    </div>
                  `
                      : ''
                  }
                  ${
                    profileErrorMessage
                      ? `
                    <div class="mt-4 p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs" role="alert">
                      ⚠️ ${profileErrorMessage}
                    </div>
                  `
                      : ''
                  }

                  <form id="profile-form" class="mt-6 space-y-4">
                    <div class="space-y-1">
                      <label for="profile-name" class="text-xs font-bold text-slate-700 block">${t('user.full_name')}</label>
                      <input 
                        type="text" 
                        id="profile-name" 
                        value="${profile?.fullName || ''}" 
                        class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        required 
                      />
                    </div>

                    <div class="space-y-1">
                      <label for="profile-email" class="text-xs font-bold text-slate-700 block">${t('user.email_address')}</label>
                      <div class="relative">
                        <input 
                          type="email" 
                          id="profile-email" 
                          value="${profile?.email || ''}" 
                          class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed font-mono"
                          disabled 
                        />
                        <span class="absolute right-3 top-2.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ${t('user.verified')}
                        </span>
                      </div>
                      <p class="text-[10px] text-slate-500">For security reasons, your email address cannot be modified.</p>
                    </div>

                    <div class="space-y-1">
                      <label for="profile-mobile" class="text-xs font-bold text-slate-700 block">${t('user.contact_mobile')}</label>
                      <input 
                        type="tel" 
                        id="profile-mobile" 
                        value="${profile?.mobile || ''}" 
                        placeholder="01XXXXXXXXX"
                        class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono" 
                      />
                    </div>

                    <div class="space-y-1">
                      <label for="profile-lang" class="text-xs font-bold text-slate-700 block">${t('user.language_preference')}</label>
                      <select 
                        id="profile-lang" 
                        class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      >
                        <option value="en" ${profile?.languagePreference !== 'bn' ? 'selected' : ''}>English</option>
                        <option value="bn" ${profile?.languagePreference === 'bn' ? 'selected' : ''}>Bengali (বাংলা)</option>
                      </select>
                    </div>

                    <div class="pt-4">
                      <button 
                        type="submit" 
                        id="save-profile-btn"
                        class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 ${
                          isSavingProfile ? 'opacity-60 cursor-not-allowed' : ''
                        }"
                        ${isSavingProfile ? 'disabled' : ''}
                      >
                        <span>${isSavingProfile ? t('user.saving') : t('user.save_profile_btn')}</span>
                      </button>
                    </div>
                  </form>
                </div>

                <div class="pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  Account Created: ${formatDateTime(profile?.createdAt)}
                </div>
              </div>

              <!-- Card 2: Security & Password Management -->
              <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
                <div>
                  <div class="pb-4 border-b border-slate-200">
                    <h2 class="text-base font-bold text-slate-900">${t('user.security_credentials')}</h2>
                    <p class="text-xs text-slate-500 mt-0.5">${t('user.security_credentials_desc')}</p>
                  </div>

                  <!-- Security Overview Chips -->
                  <div class="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="text-slate-600">Two-Factor Authentication:</span>
                      <span class="font-mono ${security?.twoFactorEnabled ? 'text-emerald-700' : 'text-slate-500'} font-semibold">
                        ${security?.twoFactorEnabled ? '🛡️ Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-600">Email Verification:</span>
                      <span class="font-mono text-emerald-700 font-semibold">
                        ✓ Verified
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-600">Last Password Change:</span>
                      <span class="font-mono text-slate-700 text-[11px]">
                        ${security?.lastPasswordChange ? formatDateTime(security.lastPasswordChange) : 'Never'}
                      </span>
                    </div>
                  </div>

                  <!-- Password Alerts -->
                  ${
                    passwordSuccessMessage
                      ? `
                    <div class="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs" role="status">
                      ✓ ${passwordSuccessMessage}
                    </div>
                  `
                      : ''
                  }
                  ${
                    passwordErrorMessage
                      ? `
                    <div class="mt-4 p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs" role="alert">
                      ⚠️ ${passwordErrorMessage}
                    </div>
                  `
                      : ''
                  }

                  <!-- Password Change Form -->
                  <form id="password-form" class="mt-6 space-y-4">
                    <div class="space-y-1">
                      <label for="current-password" class="text-xs font-bold text-slate-700 block">${t('user.current_password')}</label>
                      <input 
                        type="password" 
                        id="current-password" 
                        class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono" 
                        required 
                      />
                    </div>

                    <div class="space-y-1">
                      <label for="new-password" class="text-xs font-bold text-slate-700 block">${t('user.new_password')}</label>
                      <input 
                        type="password" 
                        id="new-password" 
                        placeholder="Minimum 8 characters"
                        class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono" 
                        minlength="8" 
                        required 
                      />
                    </div>

                    <div class="space-y-1">
                      <label for="confirm-password" class="text-xs font-bold text-slate-700 block">${t('user.confirm_password')}</label>
                      <input 
                        type="password" 
                        id="confirm-password" 
                        class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono" 
                        minlength="8" 
                        required 
                      />
                    </div>

                    <div class="pt-4">
                      <button 
                        type="submit" 
                        id="save-password-btn"
                        class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs transition flex items-center justify-center gap-2 ${
                          isSavingPassword ? 'opacity-60 cursor-not-allowed' : ''
                        }"
                        ${isSavingPassword ? 'disabled' : ''}
                      >
                        <span>${isSavingPassword ? t('user.updating') : t('user.update_password_btn')}</span>
                      </button>
                    </div>
                  </form>
                </div>

                <div class="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                  * Password updates automatically preserve active session tokens securely.
                </div>
              </div>
            </div>
          `
          }
        </main>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    // Profile form submit
    const profileForm = container.querySelector('#profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = container.querySelector('#profile-name')?.value.trim();
        const mobile = container.querySelector('#profile-mobile')?.value.trim();
        const languagePreference = container.querySelector('#profile-lang')?.value;

        isSavingProfile = true;
        profileErrorMessage = null;
        profileSuccessMessage = null;
        render();

        try {
          const res = await userService.updateProfile({
            fullName,
            mobile,
            languagePreference,
          });

          profile = res.data;
          profileSuccessMessage = isBangla() ? 'আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে।' : 'Your profile was updated successfully.';

          // Update local session
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            authService.setCurrentUser({
              ...currentUser,
              fullName: profile.fullName,
              mobile: profile.mobile,
              languagePreference: profile.languagePreference,
            });
          }

          // Trigger application-wide language change if changed
          if (profile.languagePreference) {
            setLanguage(profile.languagePreference);
          }
        } catch (err) {
          profileErrorMessage = err.message || (isBangla() ? 'প্রোফাইল আপডেট ব্যর্থ হয়েছে।' : 'Failed to update profile.');
        } finally {
          isSavingProfile = false;
          render();
        }
      });
    }

    // Password form submit
    const passwordForm = container.querySelector('#password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = container.querySelector('#current-password')?.value;
        const newPassword = container.querySelector('#new-password')?.value;
        const confirmPassword = container.querySelector('#confirm-password')?.value;

        if (newPassword !== confirmPassword) {
          passwordErrorMessage = 'New password and confirmation password do not match.';
          render();
          return;
        }

        if (newPassword.length < 8) {
          passwordErrorMessage = 'New password must be at least 8 characters long.';
          render();
          return;
        }

        isSavingPassword = true;
        passwordErrorMessage = null;
        passwordSuccessMessage = null;
        render();

        try {
          await userService.updateSecurity({
            currentPassword,
            newPassword,
          });

          passwordSuccessMessage = 'Password changed successfully.';
          const secRes = await userService.getSecurity();
          security = secRes.data;
        } catch (err) {
          passwordErrorMessage = err.message || 'Failed to change password.';
        } finally {
          isSavingPassword = false;
          render();
        }
      });
    }
  }

  async function loadData() {
    isLoading = true;
    profileErrorMessage = null;
    passwordErrorMessage = null;
    render();

    try {
      const [profRes, secRes] = await Promise.all([
        userService.getProfile(),
        userService.getSecurity(),
      ]);

      profile = profRes.data;
      security = secRes.data;
    } catch (err) {
      profileErrorMessage = err.message || 'Failed to load profile details.';
    } finally {
      isLoading = false;
      render();
    }
  }

  await loadData();
}
