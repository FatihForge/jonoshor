import { t } from '../../i18n/index.js';
import { API_BASE } from '../../config/constants.js';

const SOCIAL_ICONS = {
  facebook: '🌐',
  linkedin: '💼',
  youtube: '▶️',
  x: '✖️',
  twitter: '🐦',
  link: '🔗',
};

export async function renderFooter(container) {
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
    // Graceful fallback to default links
  }

  const socialLinksHtml = socialLinks.length > 0
    ? `
      <div class="mt-4">
        <h5 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">${t('footer.connect')}</h5>
        <div class="flex items-center gap-2 flex-wrap">
          ${socialLinks.map((item) => `
            <a 
              href="${item.url}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-emerald-600"
              aria-label="${item.name} (Opens in new tab)"
            >
              <span aria-hidden="true">${SOCIAL_ICONS[item.icon] || '🔗'}</span>
              <span>${item.name}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `
    : '';

  container.innerHTML = `
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div class="md:col-span-2">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center font-bold text-white text-sm" aria-hidden="true">J</div>
            <span class="text-lg font-bold text-slate-900">JonoShor (জনস্বর)</span>
          </div>
          <p class="text-slate-600 text-sm max-w-md leading-relaxed">
            ${t('footer.about_text')}
          </p>
          ${socialLinksHtml}
        </div>

        <div>
          <h4 class="text-slate-900 text-sm font-semibold mb-3">${t('footer.important_links')}</h4>
          <ul class="space-y-2 text-sm text-slate-600">
            <li><a href="#/how-it-works" class="hover:text-emerald-700 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded">${t('nav.how_it_works')}</a></li>
            <li><a href="#/reports" class="hover:text-emerald-700 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded">${t('nav.reports')}</a></li>
            <li><a href="#/complaint/new" class="hover:text-emerald-700 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded">${t('nav.submit_complaint')}</a></li>
            <li><a href="#/about" class="hover:text-emerald-700 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded">${t('nav.about')}</a></li>
            <li><a href="#/contact" class="hover:text-emerald-700 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded">${t('nav.contact')}</a></li>
            <li><a href="#/join-us" class="hover:text-emerald-700 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded">${t('nav.join_us')}</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-slate-900 text-sm font-semibold mb-3">${t('footer.safety_policy')}</h4>
          <ul class="space-y-2 text-sm text-slate-600">
            <li><a href="#/privacy" class="hover:text-emerald-700 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded">${t('footer.privacy')}</a></li>
            <li><a href="#/safety" class="hover:text-emerald-700 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded">${t('footer.guidelines')}</a></li>
            <li><a href="#/terms" class="hover:text-emerald-700 transition focus-visible:ring-2 focus-visible:ring-emerald-600 rounded">${t('footer.terms')}</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-slate-200 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>${t('footer.copyright')}</p>
        <p>${t('footer.motto')}</p>
      </div>
    </div>
  `;
}
