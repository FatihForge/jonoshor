import { t } from '../../../i18n/index.js';

export async function renderHowItWorksPage(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <!-- Header Banner -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
          ${t('how_it_works.badge')}
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          ${t('how_it_works.title')}
        </h1>
        <p class="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          ${t('how_it_works.subtitle')}
        </p>
      </div>

      <!-- Step by Step Procedures (Public & Mission-Oriented) -->
      <div class="space-y-6 mb-12">
        <!-- Step 1 -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start shadow-xs">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xl shrink-0" aria-hidden="true">
            1
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-bold text-slate-900 mb-2">${t('how_it_works.step1_title')}</h2>
            <p class="text-sm text-slate-600 leading-relaxed mb-3">
              ${t('how_it_works.step1_desc')}
            </p>
            <div class="inline-flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              <span aria-hidden="true">🔒</span>
              <span>${t('how_it_works.step1_note')}</span>
            </div>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start shadow-xs">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center font-bold text-xl shrink-0" aria-hidden="true">
            2
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-bold text-slate-900 mb-2">${t('how_it_works.step2_title')}</h2>
            <p class="text-sm text-slate-600 leading-relaxed mb-3">
              ${t('how_it_works.step2_desc')}
            </p>
            <div class="inline-flex items-center gap-2 text-xs font-medium text-blue-800 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              <span aria-hidden="true">📎</span>
              <span>${t('how_it_works.step2_note')}</span>
            </div>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start shadow-xs">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center font-bold text-xl shrink-0" aria-hidden="true">
            3
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-bold text-slate-900 mb-2">${t('how_it_works.step3_title')}</h2>
            <p class="text-sm text-slate-600 leading-relaxed mb-3">
              ${t('how_it_works.step3_desc')}
            </p>
            <div class="inline-flex items-center gap-2 text-xs font-medium text-purple-800 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
              <span aria-hidden="true">⚖️</span>
              <span>${t('how_it_works.step3_note')}</span>
            </div>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start shadow-xs">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-xl shrink-0" aria-hidden="true">
            4
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-bold text-slate-900 mb-2">${t('how_it_works.step4_title')}</h2>
            <p class="text-sm text-slate-600 leading-relaxed mb-3">
              ${t('how_it_works.step4_desc')}
            </p>
            <div class="inline-flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
              <span aria-hidden="true">🌐</span>
              <span>${t('how_it_works.step4_note')}</span>
            </div>
          </div>
        </div>

        <!-- Step 5 -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start shadow-xs">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xl shrink-0" aria-hidden="true">
            5
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-bold text-slate-900 mb-2">${t('how_it_works.step5_title')}</h2>
            <p class="text-sm text-slate-600 leading-relaxed mb-3">
              ${t('how_it_works.step5_desc')}
            </p>
            <div class="inline-flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              <span aria-hidden="true">🏛️</span>
              <span>${t('how_it_works.step5_note')}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Callout -->
      <div class="text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h2 class="text-xl font-bold text-slate-900 mb-2">${t('how_it_works.cta_title')}</h2>
        <p class="text-slate-600 text-sm mb-6">${t('how_it_works.cta_desc')}</p>
        <div class="flex items-center justify-center gap-4 flex-wrap">
          <a href="#/complaint/new" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-600">
            ${t('how_it_works.btn_submit')}
          </a>
          <a href="#/reports" class="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 rounded-xl text-sm transition shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-600">
            ${t('how_it_works.btn_reports')}
          </a>
        </div>
      </div>
    </div>
  `;
}
