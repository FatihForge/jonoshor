import { userService } from '../../../services/user/userService.js';
import { authService } from '../../../services/auth/authService.js';
import { renderUserNav } from '../../../components/user/UserNav.js';
import { formatDateTime } from '../../../utils/formatters.js';

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
      <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        ${renderUserNav('profile')}

        <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
          <!-- Page Header -->
          <div class="pb-6 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-xl shadow-lg">
                👤
              </div>
              <div>
                <h1 class="text-2xl font-bold text-white tracking-tight">প্রোফাইল ও নিরাপত্তা সেটিংস</h1>
                <p class="text-xs text-slate-400 mt-0.5">আপনার ব্যক্তিগত তথ্য, ভাষা পছন্দ এবং অ্যাকাউন্ট নিরাপত্তা নিয়ন্ত্রণ</p>
              </div>
            </div>
          </div>

          ${
            isLoading
              ? `
            <div class="py-24 text-center space-y-4">
              <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p class="text-xs text-slate-400">প্রোফাইল তথ্য লোড হচ্ছে...</p>
            </div>
          `
              : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Card 1: Personal Profile Details -->
              <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <h2 class="text-base font-bold text-white">ব্যক্তিগত তথ্য (Profile Information)</h2>
                      <p class="text-xs text-slate-400 mt-0.5">প্ল্যাটফর্মে আপনার নাম ও যোগাযোগের বিবরণ</p>
                    </div>
                    <span class="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                      ${profile?.accountStatus || 'active'}
                    </span>
                  </div>

                  <!-- Profile Alerts -->
                  ${
                    profileSuccessMessage
                      ? `
                    <div class="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs">
                      ✓ ${profileSuccessMessage}
                    </div>
                  `
                      : ''
                  }
                  ${
                    profileErrorMessage
                      ? `
                    <div class="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
                      ⚠️ ${profileErrorMessage}
                    </div>
                  `
                      : ''
                  }

                  <form id="profile-form" class="mt-6 space-y-4">
                    <div class="space-y-1">
                      <label for="profile-name" class="text-xs font-bold text-slate-300 block">পূর্ণ নাম (Full Name)</label>
                      <input 
                        type="text" 
                        id="profile-name" 
                        value="${profile?.fullName || ''}" 
                        class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        required 
                      />
                    </div>

                    <div class="space-y-1">
                      <label for="profile-email" class="text-xs font-bold text-slate-300 block">ইমেল ঠিকানা (Email Address)</label>
                      <div class="relative">
                        <input 
                          type="email" 
                          id="profile-email" 
                          value="${profile?.email || ''}" 
                          class="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 cursor-not-allowed font-mono"
                          disabled 
                        />
                        <span class="absolute right-3 top-2.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          ভেরিফাইড
                        </span>
                      </div>
                      <p class="text-[10px] text-slate-500">নিরাপত্তার স্বার্থে ইমেল ঠিকানা পরিবর্তনযোগ্য নয়।</p>
                    </div>

                    <div class="space-y-1">
                      <label for="profile-mobile" class="text-xs font-bold text-slate-300 block">মোবাইল নম্বর (Mobile Number)</label>
                      <input 
                        type="tel" 
                        id="profile-mobile" 
                        value="${profile?.mobile || ''}" 
                        placeholder="01XXXXXXXXX"
                        class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono" 
                      />
                    </div>

                    <div class="space-y-1">
                      <label for="profile-lang" class="text-xs font-bold text-slate-300 block">ভাষা পছন্দ (Language Preference)</label>
                      <select 
                        id="profile-lang" 
                        class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="bn" ${profile?.languagePreference === 'bn' ? 'selected' : ''}>বাংলা (Bengali)</option>
                        <option value="en" ${profile?.languagePreference === 'en' ? 'selected' : ''}>English</option>
                      </select>
                    </div>

                    <div class="pt-4">
                      <button 
                        type="submit" 
                        id="save-profile-btn"
                        class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 ${
                          isSavingProfile ? 'opacity-60 cursor-not-allowed' : ''
                        }"
                        ${isSavingProfile ? 'disabled' : ''}
                      >
                        <span>${isSavingProfile ? 'সংরক্ষণ হচ্ছে...' : 'প্রোফাইল পরিবর্তন সংরক্ষণ করুন'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                <div class="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
                  অ্যাকাউন্ট তৈরি: ${formatDateTime(profile?.createdAt)}
                </div>
              </div>

              <!-- Card 2: Security & Password Management -->
              <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
                <div>
                  <div class="pb-4 border-b border-slate-800">
                    <h2 class="text-base font-bold text-white">অ্যাকাউন্ট নিরাপত্তা (Security Settings)</h2>
                    <p class="text-xs text-slate-400 mt-0.5">পাসওয়ার্ড পরিবর্তন ও নিরাপত্তা প্যারামিটার</p>
                  </div>

                  <!-- Security Overview Chips -->
                  <div class="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400">২-ফ্যাক্টর প্রমাণীকরণ:</span>
                      <span class="font-mono ${security?.twoFactorEnabled ? 'text-emerald-400' : 'text-slate-400'} font-semibold">
                        ${security?.twoFactorEnabled ? '🛡️ সক্রিয় (Enabled)' : 'নিষ্ক্রিয় (Disabled)'}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400">ইমেল ভেরিফিকেশন:</span>
                      <span class="font-mono text-emerald-400 font-semibold">
                        ✓ সম্পন্ন
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400">পাসওয়ার্ড পরিবর্তনের তারিখ:</span>
                      <span class="font-mono text-slate-300 text-[11px]">
                        ${security?.lastPasswordChange ? formatDateTime(security.lastPasswordChange) : 'অপরিবর্তিত'}
                      </span>
                    </div>
                  </div>

                  <!-- Password Alerts -->
                  ${
                    passwordSuccessMessage
                      ? `
                    <div class="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs">
                      ✓ ${passwordSuccessMessage}
                    </div>
                  `
                      : ''
                  }
                  ${
                    passwordErrorMessage
                      ? `
                    <div class="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
                      ⚠️ ${passwordErrorMessage}
                    </div>
                  `
                      : ''
                  }

                  <!-- Password Change Form -->
                  <form id="password-form" class="mt-6 space-y-4">
                    <div class="space-y-1">
                      <label for="current-password" class="text-xs font-bold text-slate-300 block">বর্তমান পাসওয়ার্ড (Current Password)</label>
                      <input 
                        type="password" 
                        id="current-password" 
                        class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        required 
                      />
                    </div>

                    <div class="space-y-1">
                      <label for="new-password" class="text-xs font-bold text-slate-300 block">নতুন পাসওয়ার্ড (New Password)</label>
                      <input 
                        type="password" 
                        id="new-password" 
                        placeholder="কমপক্ষে ৮ অক্ষরের শক্তিশালী পাসওয়ার্ড"
                        class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        minlength="8"
                        required 
                      />
                    </div>

                    <div class="space-y-1">
                      <label for="confirm-password" class="text-xs font-bold text-slate-300 block">নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)</label>
                      <input 
                        type="password" 
                        id="confirm-password" 
                        class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        minlength="8"
                        required 
                      />
                    </div>

                    <div class="pt-4">
                      <button 
                        type="submit" 
                        id="save-password-btn"
                        class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2 ${
                          isSavingPassword ? 'opacity-60 cursor-not-allowed' : ''
                        }"
                        ${isSavingPassword ? 'disabled' : ''}
                      >
                        <span>${isSavingPassword ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                <div class="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                  * পাসওয়ার্ড পরিবর্তনের পর স্বয়ংক্রিয়ভাবে সকল সক্রিয় সেশন নিরাপদ থাকবে।
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
          profileSuccessMessage = 'আপনার প্রোফাইল তথ্য সফলভাবে হালনাগাদ করা হয়েছে।';

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
        } catch (err) {
          profileErrorMessage = err.message || 'প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে।';
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
          passwordErrorMessage = 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না।';
          render();
          return;
        }

        if (newPassword.length < 8) {
          passwordErrorMessage = 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।';
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

          passwordSuccessMessage = 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।';
          // Reload security
          const secRes = await userService.getSecurity();
          security = secRes.data;
        } catch (err) {
          passwordErrorMessage = err.message || 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে।';
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
      profileErrorMessage = err.message || 'প্রোফাইল তথ্য লোড করতে সমস্যা হয়েছে।';
    } finally {
      isLoading = false;
      render();
    }
  }

  await loadData();
}
