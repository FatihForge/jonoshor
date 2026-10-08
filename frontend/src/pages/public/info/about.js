import { contentService } from '../../../services/content/contentService.js';
import { t, getLanguage } from '../../../i18n/index.js';

export async function renderAboutPage(container) {
  const currentLang = getLanguage();

  container.innerHTML = `
    <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
          ${t('about.badge')}
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          ${t('about.title')}
        </h1>
        <p class="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          ${t('about.subtitle')}
        </p>
      </div>

      <!-- Purpose, Mission & Vision Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <!-- Purpose Card -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4" aria-hidden="true">
            🎯
          </div>
          <h2 class="text-lg font-bold text-slate-900 mb-2">${t('about.purpose_title')}</h2>
          <p class="text-slate-600 text-sm leading-relaxed flex-1" id="about-content">
            ${t('about.purpose_desc')}
          </p>
        </div>

        <!-- Mission Card -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg mb-4" aria-hidden="true">
            🕊️
          </div>
          <h2 class="text-lg font-bold text-slate-900 mb-2">${t('about.mission_title')}</h2>
          <p class="text-slate-600 text-sm leading-relaxed flex-1" id="mission-content">
            ${t('about.mission_desc')}
          </p>
        </div>

        <!-- Vision Card -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div class="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-lg mb-4" aria-hidden="true">
            🔭
          </div>
          <h2 class="text-lg font-bold text-slate-900 mb-2">${t('about.vision_title')}</h2>
          <p class="text-slate-600 text-sm leading-relaxed flex-1" id="vision-content">
            ${t('about.vision_desc')}
          </p>
        </div>
      </div>

      <!-- Core Values / Pillars -->
      <div class="bg-white border border-slate-200 rounded-2xl p-8 mb-12 shadow-sm">
        <h2 class="text-xl font-bold text-slate-900 mb-6 text-center">
          ${currentLang === 'bn' ? 'আমাদের মূল স্তম্ভসমূহ' : 'Our Core Pillars'}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div class="text-emerald-800 font-bold text-sm mb-1">${t('about.pillar1_title')}</div>
            <p class="text-xs text-slate-600 leading-relaxed">${t('about.pillar1_desc')}</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div class="text-emerald-800 font-bold text-sm mb-1">${t('about.pillar2_title')}</div>
            <p class="text-xs text-slate-600 leading-relaxed">${t('about.pillar2_desc')}</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div class="text-emerald-800 font-bold text-sm mb-1">${t('about.pillar3_title')}</div>
            <p class="text-xs text-slate-600 leading-relaxed">${t('about.pillar3_desc')}</p>
          </div>
        </div>
      </div>

      <!-- FAQs Section -->
      <div class="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900 mb-6">${t('about.faqs_title')}</h2>
        <div id="faqs-list" class="space-y-4">
          <div class="text-center py-6 text-slate-500">${t('common.loading')}</div>
        </div>
      </div>
    </div>
  `;

  // Fetch dynamic content from CMS if configured
  try {
    const [aboutData, missionData, faqs] = await Promise.all([
      contentService.getContent('about'),
      contentService.getContent('mission'),
      contentService.getFaqs(),
    ]);

    if (aboutData?.[currentLang]?.content || aboutData?.en?.content) {
      const el = container.querySelector('#about-content');
      if (el) el.textContent = aboutData[currentLang]?.content || aboutData.en?.content;
    }
    if (missionData?.[currentLang]?.content || missionData?.en?.content) {
      const el = container.querySelector('#mission-content');
      if (el) el.textContent = missionData[currentLang]?.content || missionData.en?.content;
    }

    const faqsContainer = container.querySelector('#faqs-list');
    if (faqsContainer && Array.isArray(faqs) && faqs.length > 0) {
      faqsContainer.innerHTML = faqs
        .map(
          (faq) => `
          <details class="group bg-slate-50 border border-slate-200 rounded-xl p-4 transition">
            <summary class="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between text-sm">
              <span>${faq[currentLang]?.question || faq.en?.question || faq.question || faq.bn?.question}</span>
              <span class="text-slate-500 transition group-open:rotate-180" aria-hidden="true">▾</span>
            </summary>
            <p class="mt-3 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-3">
              ${faq[currentLang]?.answer || faq.en?.answer || faq.answer || faq.bn?.answer}
            </p>
          </details>
        `
        )
        .join('');
    } else if (faqsContainer) {
      faqsContainer.innerHTML = `
        <details class="group bg-slate-50 border border-slate-200 rounded-xl p-4 transition">
          <summary class="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between text-sm">
            <span>${currentLang === 'bn' ? 'অভিযোগ জমা দিতে কি অ্যাকাউন্ট তৈরি বাধ্যতামূলক?' : 'Is an account required to submit a complaint?'}</span>
            <span class="text-slate-500 transition group-open:rotate-180" aria-hidden="true">▾</span>
          </summary>
          <p class="mt-3 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-3">
            ${currentLang === 'bn' ? 'না। যেকোনো নাগরিক কোনো অ্যাকাউন্ট না খুলেই ৫টি অভিযোগ সরাসরি বেনামে দাখিল করতে পারেন। অতিরিক্ত অভিযোগ ও রিয়েল-টাইম কেস ট্র্যাকিংয়ের জন্য বিনামূল্যে অ্যাকাউন্ট খোলা যায়।' : 'No. Any citizen can submit up to 5 complaints without registering an account. To submit more complaints and receive real-time case updates, creating a free account is recommended.'}
          </p>
        </details>
        <details class="group bg-slate-50 border border-slate-200 rounded-xl p-4 transition">
          <summary class="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between text-sm">
            <span>${currentLang === 'bn' ? 'অভিযোগকারীর ব্যক্তিগত তথ্য কি জনসমক্ষে প্রকাশ করা হয়?' : 'Will my personal identity ever be publicly disclosed?'}</span>
            <span class="text-slate-500 transition group-open:rotate-180" aria-hidden="true">▾</span>
          </summary>
          <p class="mt-3 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-3">
            ${currentLang === 'bn' ? 'কখনোই না। তথ্য প্রদানকারীর পরিচয় সম্পূর্ণ গোপন রাখা হয় এবং পাবলিক রিপোর্টে কখনো কোনো ব্যক্তিগত পরিচয় প্রকাশ করা হয় না।' : 'Never. Whistleblower and reporter information is strictly confidential and protected by default. Complainant details are never included in public reports.'}
          </p>
        </details>
      `;
    }
  } catch {
    // Graceful fallback to default markup
  }
}
