import { t } from '../../../i18n/index.js';
import { API_BASE } from '../../../config/constants.js';
import { apiRequest } from '../../../services/api/apiClient.js';


export async function renderContactPage(container) {
  let socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com/jonoshor', icon: 'facebook' },
    { name: 'LinkedIn', url: 'https://linkedin.com/company/jonoshor', icon: 'linkedin' },
    { name: 'YouTube', url: 'https://youtube.com/@jonoshor', icon: 'youtube' },
    { name: 'X / Twitter', url: 'https://x.com/jonoshor', icon: 'x' },
  ];

  try {
    const res = await fetch(`${API_BASE}/public/social-links`);
    const data = await res.json();
    if (data?.success && Array.isArray(data.data)) {
      socialLinks = data.data;
    }
  } catch {
    // Keep fallback
  }

  container.innerHTML = `
    <div class="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
          ${t('contact.badge')}
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          ${t('contact.title')}
        </h1>
        <p class="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          ${t('contact.subtitle')}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Contact Form Card (8 cols) -->
        <div class="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div id="contact-success-banner" class="hidden p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-3" role="status" aria-live="polite">
            <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl mx-auto" aria-hidden="true">
              ✓
            </div>
            <h3 class="text-base font-bold text-emerald-900">${t('contact.success_title')}</h3>
            <p class="text-xs sm:text-sm text-emerald-800 leading-relaxed">${t('contact.success_desc')}</p>
            <button type="button" id="contact-reset-btn" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition mt-2 focus-visible:ring-2 focus-visible:ring-emerald-600">
              ${t('contact.send_another')}
            </button>
          </div>

          <form id="contact-form" class="space-y-5" novalidate>
            <div>
              <h2 class="text-xl font-bold text-slate-900 mb-1">${t('contact.form_title')}</h2>
              <p class="text-xs text-slate-500 mb-4">${t('contact.form_desc')}</p>
            </div>

            <div id="contact-error-banner" class="hidden p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs" role="alert">
              <span id="contact-error-text"></span>
            </div>

            <div>
              <label for="contact-name" class="block text-xs font-semibold text-slate-700 mb-1">
                ${t('contact.name_label')} <span class="text-rose-600">*</span>
              </label>
              <input 
                type="text" 
                id="contact-name" 
                name="name" 
                required 
                maxlength="100"
                placeholder="${t('contact.name_placeholder')}"
                class="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label for="contact-email" class="block text-xs font-semibold text-slate-700 mb-1">
                ${t('contact.email_label')} <span class="text-rose-600">*</span>
              </label>
              <input 
                type="email" 
                id="contact-email" 
                name="email" 
                required 
                maxlength="150"
                placeholder="${t('contact.email_placeholder')}"
                class="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 font-mono"
              />
            </div>

            <div>
              <label for="contact-phone" class="block text-xs font-semibold text-slate-700 mb-1">
                ${t('contact.phone_label')}
              </label>
              <input 
                type="tel" 
                id="contact-phone" 
                name="phone" 
                maxlength="30"
                placeholder="${t('contact.phone_placeholder')}"
                class="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 font-mono"
              />
            </div>

            <div>
              <label for="contact-message" class="block text-xs font-semibold text-slate-700 mb-1">
                ${t('contact.message_label')} <span class="text-rose-600">*</span>
              </label>
              <textarea 
                id="contact-message" 
                name="message" 
                required 
                rows="5"
                minlength="10"
                maxlength="3000"
                placeholder="${t('contact.message_placeholder')}"
                class="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 leading-relaxed"
              ></textarea>
            </div>

            <button 
              type="submit" 
              id="contact-submit-btn" 
              class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <span id="contact-btn-text">${t('contact.submit_btn')}</span>
            </button>
          </form>
        </div>

        <!-- Information & Social Links Sidebar (5 cols) -->
        <div class="lg:col-span-5 space-y-6">
          <!-- Institutional Channels Card -->
          <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-emerald-700 text-lg" aria-hidden="true">🏛️</span>
              <h3 class="text-base font-bold text-slate-900">${t('contact.channels_title')}</h3>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              ${t('contact.channels_desc')}
            </p>

            <div class="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <span class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">${t('contact.email_support')}</span>
                <a href="mailto:support@jonoshor.org" class="text-xs sm:text-sm font-mono font-medium text-emerald-800 hover:text-emerald-900 hover:underline">
                  support@jonoshor.org
                </a>
              </div>
            </div>
          </div>

          <!-- Social Platforms Card -->
          <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-blue-600 text-lg" aria-hidden="true">🌐</span>
              <h3 class="text-base font-bold text-slate-900">${t('contact.social_title')}</h3>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              ${t('contact.social_desc')}
            </p>

            <div class="space-y-2 pt-1">
              ${socialLinks.map((item) => `
                <a 
                  href="${item.url}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition focus-visible:ring-2 focus-visible:ring-emerald-600"
                  aria-label="${item.name} (Opens in new tab)"
                >
                  <span class="flex items-center gap-2">
                    <span aria-hidden="true">${item.icon === 'facebook' ? '🌐' : item.icon === 'linkedin' ? '💼' : item.icon === 'youtube' ? '▶️' : '✖️'}</span>
                    <span>${item.name}</span>
                  </span>
                  <span class="text-slate-400" aria-hidden="true">↗</span>
                </a>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach form logic
  const form = container.querySelector('#contact-form');
  const successBanner = container.querySelector('#contact-success-banner');
  const errorBanner = container.querySelector('#contact-error-banner');
  const errorText = container.querySelector('#contact-error-text');
  const submitBtn = container.querySelector('#contact-submit-btn');
  const btnText = container.querySelector('#contact-btn-text');
  const resetBtn = container.querySelector('#contact-reset-btn');

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      successBanner.classList.add('hidden');
      form.classList.remove('hidden');
      errorBanner.classList.add('hidden');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBanner.classList.add('hidden');

      const name = form.querySelector('#contact-name').value.trim();
      const email = form.querySelector('#contact-email').value.trim();
      const phone = form.querySelector('#contact-phone').value.trim();
      const message = form.querySelector('#contact-message').value.trim();

      if (!name || name.length < 2) {
        errorText.textContent = 'Please provide your full name (minimum 2 characters).';
        errorBanner.classList.remove('hidden');
        return;
      }

      if (!email || !email.includes('@')) {
        errorText.textContent = 'Please provide a valid email address.';
        errorBanner.classList.remove('hidden');
        return;
      }

      if (!message || message.length < 10) {
        errorText.textContent = 'Message must be at least 10 characters long.';
        errorBanner.classList.remove('hidden');
        return;
      }

      submitBtn.disabled = true;
      btnText.textContent = t('contact.sending');

      try {
        const data = await apiRequest('/public/contact', {
          method: 'POST',
          body: {
            name,
            email,
            phone: phone || undefined,
            message,
          },
        });

        if (!data || !data.success) {
          throw new Error(data?.error?.message || 'Failed to submit contact message.');
        }

        form.classList.add('hidden');
        successBanner.classList.remove('hidden');
        window.scrollTo({ top: form.offsetTop - 50, behavior: 'smooth' });
      } catch (err) {

        errorText.textContent = err.message || 'An error occurred while sending your message. Please try again.';
        errorBanner.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        btnText.textContent = t('contact.submit_btn');
      }
    });
  }
}
