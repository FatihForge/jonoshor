import { reportService } from '../../../services/reports/reportService.js';
import { getLanguage, setLanguage, t, isBangla, translateCategory, translateCaseStatus, formatNumber } from '../../../i18n/index.js';

export async function renderReportDetailsPage(container, reportId) {
  container.innerHTML = `
    <div class="py-16 text-center text-slate-500" role="status" aria-live="polite">
      <div class="inline-block w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" aria-hidden="true"></div>
      <p class="text-sm">${t('common.loading')}</p>
    </div>
  `;

  try {
    const report = await reportService.getReportById(reportId);

    function renderContent() {
      const isBn = isBangla();
      const currentLang = getLanguage();
      const isEn = !isBn;
      
      const content = isEn && report.en ? report.en : (report.bn || report.en);
      const refCode = report._id ? report._id.slice(-6).toUpperCase() : 'REPORT';
      const approvedEvList = Array.isArray(report.approvedEvidence) ? report.approvedEvidence : [];
      const localeCode = isBn ? 'bn-BD' : 'en-US';
      
      const pubDate = new Date(report.publishedAt || report.createdAt).toLocaleDateString(localeCode, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const incDate = report.incidentDate?.startDate
        ? new Date(report.incidentDate.startDate).toLocaleDateString(localeCode, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : (isBn ? 'অজ্ঞাত' : 'Unknown');

      const categoryName = translateCategory(report.category?.primary);
      const caseStatusLabel = translateCaseStatus(report.caseStatus);

      container.innerHTML = `
        <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6">
          <!-- Back button & Lang switch -->
          <div class="flex items-center justify-between mb-6">
            <a href="#/reports" class="text-xs sm:text-sm text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 font-medium">
              ← ${t('report_details.back_to_reports')}
            </a>
            
            ${
              report.en && report.bn
                ? `
              <div class="inline-flex rounded-lg border border-slate-300 p-1 bg-white text-xs font-semibold shadow-xs" role="group" aria-label="Language selection">
                <button type="button" id="lang-en-btn" class="px-3 py-1 rounded ${currentLang === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'} transition">
                  English
                </button>
                <button type="button" id="lang-bn-btn" class="px-3 py-1 rounded ${currentLang === 'bn' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'} transition">
                  বাংলা
                </button>
              </div>
            `
                : ''
            }
          </div>

          <!-- Report Article Card -->
          <article class="p-6 sm:p-10 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-8">
            <!-- Header Badges -->
            <div class="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
              <span class="text-xs px-2.5 py-1 rounded font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
                ${t('reports.doc_ref')} #${refCode}
              </span>
              <span class="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                ${categoryName || (isBn ? 'মানবাধিকার লঙ্ঘন' : 'Human Rights')}
              </span>
              <span class="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-semibold flex items-center gap-1">
                <span aria-hidden="true">✓</span> ${t('report_details.fact_checked')}
              </span>
              <span class="text-xs text-slate-500 ml-auto">
                ${t('report_details.published_on')}: ${pubDate}
              </span>
            </div>

            <!-- Title -->
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              ${content.title}
            </h1>

            <!-- Meta Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span class="block text-slate-500 mb-0.5 font-medium">${t('report_details.location')}</span>
                <span class="font-semibold text-slate-900">
                  📍 ${report.location?.generalLocation || report.location?.districtId || (isBn ? 'বাংলাদেশ' : 'Bangladesh')}
                </span>
              </div>
              <div>
                <span class="block text-slate-500 mb-0.5 font-medium">${t('reports.incident_date')}</span>
                <span class="font-semibold text-slate-900">
                  🗓️ ${incDate}
                </span>
              </div>
              <div>
                <span class="block text-slate-500 mb-0.5 font-medium">${t('report_details.legal_status')}</span>
                <span class="font-semibold text-emerald-800">
                  ⚖️ ${caseStatusLabel}
                </span>
              </div>
            </div>

            <!-- Summary Box -->
            <div class="p-5 rounded-xl bg-emerald-50/60 border-l-4 border-emerald-600">
              <h2 class="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">${t('report_details.summary_heading')}</h2>
              <p class="text-slate-800 leading-relaxed text-sm sm:text-base">${content.summary}</p>
            </div>

            <!-- Incident Narrative -->
            <div class="space-y-3">
              <h2 class="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">${isBn ? 'ঘটনার বিস্তারিত বিবরণ ও ফলাফল' : 'Detailed Incident Narrative & Context'}</h2>
              <div class="text-slate-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                ${content.incidentStory}
              </div>
            </div>

            <!-- Authority Action Summary -->
            ${
              content.authorityActionSummary
                ? `
              <div class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span aria-hidden="true">🏛️</span> ${isBn ? 'আইনশৃঙ্খলা ও কর্তৃপক্ষের গৃহীত পদক্ষেপ' : 'Law Enforcement & Authority Action'}
                </h3>
                <p class="text-slate-700 text-sm leading-relaxed">${content.authorityActionSummary}</p>
              </div>
            `
                : ''
            }

            <!-- Legal Case & Outcome Status -->
            <div class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span aria-hidden="true">⚖️</span> ${t('report_details.legal_heading')}
              </h3>
              <p class="text-slate-700 text-sm leading-relaxed">
                <strong class="text-slate-900">${isBn ? 'বর্তমান অবস্থা' : 'Current Status'}:</strong> ${caseStatusLabel}
              </p>
              ${
                content.legalSummary
                  ? `<p class="text-slate-600 text-xs leading-relaxed italic">${content.legalSummary}</p>`
                  : ''
              }
              ${
                report.legalOutcome
                  ? `
                <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                  <span class="font-bold block mb-1">${isBn ? 'অফিসিয়াল আইনি রায় / নিষ্পত্তি' : 'Official Legal Outcome / Judgment'}:</span>
                  ${report.legalOutcome}
                </div>
              `
                  : ''
              }
              <p class="text-[11px] text-slate-500 pt-1">
                ${
                  isBn
                    ? '* দ্রষ্টব্য: অভিযোগ দাখিল বা সত্যতা যাচাই কোনো আইনি রায় নয়। এটি নিরপেক্ষ মানবাধিকার তথ্যের উন্মুক্ত উপস্থাপন।'
                    : '* Note: Complaint documentation and verification do not constitute a legal verdict. This represents objective civil rights documentation.'
                }
              </p>
            </div>

            <!-- Approved Public Evidence Section -->
            <div class="space-y-4 pt-2">
              <div class="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span aria-hidden="true">📎</span> ${t('report_details.evidence_heading')}
                </h2>
                <span class="text-xs text-slate-500">${formatNumber(approvedEvList.length)} ${isBn ? 'টি উন্মুক্ত প্রমাণ' : 'evidence files'}</span>
              </div>

              ${
                approvedEvList.length === 0
                  ? `
                <div class="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
                  ${t('report_details.evidence_empty')}
                </div>
              `
                  : `
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  ${approvedEvList
                    .map((ev) => {
                      const proxyUrl = ev.publicUrl || `/api/v1/public/evidence/${ev.evidenceId}/file`;
                      const isImage = (ev.type && ev.type.startsWith('image')) || proxyUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i);
                      const isVideo = (ev.type && ev.type.startsWith('video')) || proxyUrl.match(/\.(mp4|webm)$/i);

                      return `
                        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                          <div>
                            <div class="flex items-center justify-between text-xs mb-2">
                              <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                                ${ev.type || 'file'}
                              </span>
                              <span class="text-[10px] text-emerald-800 font-semibold">✓ ${isBn ? 'যাচাইকৃত ক্লিন' : 'Verified Safe'}</span>
                            </div>
                            <span class="text-xs font-semibold text-slate-900 block truncate" title="${ev.title || (isBn ? 'পাবলিক প্রমাণপত্র' : 'Public Evidence')}">
                              ${ev.title || (isBn ? 'পাবলিক প্রমাণপত্র' : 'Public Evidence')}
                            </span>
                          </div>

                          ${
                            isImage
                              ? `
                            <div class="overflow-hidden rounded-lg bg-slate-100 border border-slate-200 h-36 flex items-center justify-center">
                              <img 
                                src="${proxyUrl}" 
                                alt="${ev.title || 'Evidence file'}" 
                                loading="lazy" 
                                referrerpolicy="no-referrer"
                                class="w-full h-full object-cover hover:scale-105 transition"
                              />
                            </div>
                          `
                              : isVideo
                              ? `
                            <div class="rounded-lg bg-black overflow-hidden">
                              <video controls preload="none" referrerpolicy="no-referrer" class="w-full max-h-36">
                                <source src="${proxyUrl}" />
                              </video>
                            </div>
                          `
                              : ''
                          }

                          <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span class="text-[10px] text-slate-500">${isBn ? 'সুরক্ষিত প্রক্সি ফাইল' : 'Protected Proxy File'}</span>
                            <a 
                              href="${proxyUrl}" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              referrerpolicy="no-referrer"
                              class="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1"
                            >
                              <span>${isBn ? 'উন্মুক্ত ফাইল দেখুন' : 'View Evidence'}</span>
                              <span aria-hidden="true">↗</span>
                            </a>
                          </div>
                        </div>
                      `;
                    })
                    .join('')}
                </div>
                <p class="text-[10px] text-slate-500 italic">
                  ${isBn ? '* সমস্ত উন্মুক্ত প্রমাণপত্র নিরপেক্ষ সার্ভার প্রক্সি মাধ্যমে শূন্য-ট্র্যাকিং (Zero Viewer Tracking) নীতিমালার আওতায় প্রদান করা হয়।' : '* All public evidence is served through secure server proxies under a strict zero-viewer-tracking policy.'}
                </p>
              `
              }
            </div>

            <!-- Accused Persons (Sanitized) -->
            ${
              report.publicAccused && report.publicAccused.length > 0
                ? `
              <div class="space-y-3 pt-2">
                <h2 class="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                  ${isBn ? 'অভিযুক্ত ব্যক্তিবর্গ (যাচাইকৃত অংশ)' : 'Accused Parties (Verified Details)'}
                </h2>
                <div class="space-y-2">
                  ${report.publicAccused
                    .map(
                      (acc) => `
                    <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <span class="font-semibold text-slate-900">${acc.name || (isBn ? 'অজ্ঞাত ব্যক্তি' : 'Unidentified Party')}</span>
                      <span class="text-slate-600">${acc.role || (isBn ? 'অভিযুক্ত' : 'Accused')} ${acc.organization ? `(${acc.organization})` : ''}</span>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
                : ''
            }

            <!-- Victims (Anonymized / Protected) -->
            ${
              report.publicVictims && report.publicVictims.length > 0
                ? `
              <div class="space-y-3 pt-2">
                <h2 class="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                  ${isBn ? 'ভুক্তভোগী ব্যক্তিবর্গ (পরিচয় সুরক্ষিত)' : 'Affected Parties (Protected / Redacted)'}
                </h2>
                <div class="space-y-2">
                  ${report.publicVictims
                    .map(
                      (vic) => `
                    <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <span class="font-semibold text-slate-900">${vic.name || (isBn ? 'পরিচয় গোপনীয়' : 'Protected Identity')}</span>
                      <span class="text-slate-600">${vic.category || (isBn ? 'ভুক্তভোগী' : 'Victim')}</span>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
                : ''
            }

            <!-- Footer Documentation Note -->
            <div class="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span>${isBn ? 'নথি আইডি' : 'Document ID'}: #${refCode} (${report._id})</span>
              <span>${isBn ? 'জনস্বর নিরপেক্ষ তদন্ত দল দ্বারা অনুমোদিত ও প্রকাশিত' : 'Verified and released by JonoShor Independent Investigation Team'}</span>
            </div>
          </article>
        </div>
      `;

      // Attach language toggles that synchronize globally
      const bnBtn = container.querySelector('#lang-bn-btn');
      const enBtn = container.querySelector('#lang-en-btn');
      if (bnBtn && enBtn) {
        bnBtn.addEventListener('click', () => {
          if (getLanguage() !== 'bn') {
            setLanguage('bn');
          }
        });
        enBtn.addEventListener('click', () => {
          if (getLanguage() !== 'en') {
            setLanguage('en');
          }
        });
      }
    }

    renderContent();
  } catch (err) {
    container.innerHTML = `
      <div class="max-w-md mx-auto py-16 text-center" role="alert">
        <div class="text-red-700 font-bold mb-2">${t('common.error')}</div>
        <p class="text-slate-600 text-sm mb-6">${err.message || 'The requested report does not exist or has been withdrawn from public access.'}</p>
        <a href="#/reports" class="px-4 py-2 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-lg text-xs font-semibold transition">
          ${t('report_details.back_to_reports')}
        </a>
      </div>
    `;
  }
}
