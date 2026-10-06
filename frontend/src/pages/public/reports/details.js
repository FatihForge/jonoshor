import { reportService } from '../../../services/reports/reportService.js';

export async function renderReportDetailsPage(container, reportId) {
  container.innerHTML = `
    <div class="py-16 text-center text-slate-500">
      <div class="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="text-sm">রিপোর্ট লোড হচ্ছে...</p>
    </div>
  `;

  const CASE_STATUS_MAP = {
    under_investigation: { bn: 'তদন্তাধীন', label: 'তদন্ত চলমান রয়েছে' },
    case_filed: { bn: 'মামলা দায়েরকৃত', label: 'থানা বা আদালতে মামলা দায়ের হয়েছে' },
    trial: { bn: 'বিচারিক পর্যায়ে', label: 'আদালতে বিচার কার্যক্রম চলছে' },
    no_legal_case: { bn: 'কোনো মামলা নেই', label: 'এখনও কোনো আইনি মামলা দায়ের করা হয়নি' },
    unknown: { bn: 'অনির্ধারিত', label: 'আইনি মামলার বর্তমান অবস্থা নিশ্চিত নয়' },
    resolved: { bn: 'নিষ্পত্তিকৃত', label: 'আইনগত প্রক্রিয়ায় নিষ্পত্তি হয়েছে' },
    closed: { bn: 'সমাপ্ত', label: 'মামলা সমাপ্ত ঘোষণা করা হয়েছে' },
  };

  try {
    const report = await reportService.getReportById(reportId);
    let currentLang = 'bn'; // 'bn' or 'en'

    function renderContent() {
      const content = currentLang === 'en' && report.en ? report.en : report.bn;
      const caseInfo = CASE_STATUS_MAP[report.caseStatus] || {
        bn: report.caseStatus || 'অনির্ধারিত',
        label: report.caseStatus || 'আইনি তথ্য নেই',
      };
      const refCode = report._id ? report._id.slice(-6).toUpperCase() : 'REPORT';
      const approvedEvList = Array.isArray(report.approvedEvidence) ? report.approvedEvidence : [];

      container.innerHTML = `
        <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6">
          <!-- Back button & Lang switch -->
          <div class="flex items-center justify-between mb-6">
            <a href="#/reports" class="text-xs sm:text-sm text-slate-400 hover:text-white transition flex items-center gap-1.5 font-medium">
              ← সকল পাবলিক রিপোর্টে ফিরে যান
            </a>
            
            ${
              report.en
                ? `
              <div class="inline-flex rounded-lg border border-slate-800 p-1 bg-slate-900 text-xs font-medium">
                <button id="lang-bn-btn" class="px-3 py-1 rounded ${currentLang === 'bn' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'} transition">
                  বাংলা
                </button>
                <button id="lang-en-btn" class="px-3 py-1 rounded ${currentLang === 'en' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'} transition">
                  English
                </button>
              </div>
            `
                : ''
            }
          </div>

          <!-- Report Article Card -->
          <article class="p-6 sm:p-10 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8">
            <!-- Header Badges -->
            <div class="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
              <span class="text-xs px-2.5 py-1 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                নথি #${refCode}
              </span>
              <span class="text-xs px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                ${report.category?.primary || 'মানবাধিকার লঙ্ঘন'}
              </span>
              <span class="text-xs px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-medium flex items-center gap-1">
                <span>✓</span> সত্যতা যাচাইকৃত
              </span>
              <span class="text-xs text-slate-400 ml-auto">
                প্রকাশের তারিখ: ${new Date(report.publishedAt || report.createdAt).toLocaleDateString('bn-BD')}
              </span>
            </div>

            <!-- Title -->
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              ${content.title}
            </h1>

            <!-- Meta Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
              <div>
                <span class="block text-slate-400 mb-0.5">ঘটনাস্থল (সাধারণ অবস্থান)</span>
                <span class="font-medium text-slate-200">
                  📍 ${report.location?.generalLocation || report.location?.districtId || 'বাংলাদেশ'}
                </span>
              </div>
              <div>
                <span class="block text-slate-400 mb-0.5">ঘটনার সময়কাল</span>
                <span class="font-medium text-slate-200">
                  🗓️ ${report.incidentDate?.startDate ? new Date(report.incidentDate.startDate).toLocaleDateString('bn-BD') : 'অজ্ঞাত'}
                </span>
              </div>
              <div>
                <span class="block text-slate-400 mb-0.5">আইনি মামলার অবস্থা</span>
                <span class="font-medium text-emerald-400">
                  ⚖️ ${caseInfo.bn}
                </span>
              </div>
            </div>

            <!-- Summary Box -->
            <div class="p-5 rounded-xl bg-slate-950/50 border-l-4 border-emerald-500">
              <h2 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">ঘটনার সারসংক্ষেপ</h2>
              <p class="text-slate-200 leading-relaxed text-sm sm:text-base">${content.summary}</p>
            </div>

            <!-- Incident Narrative -->
            <div class="space-y-3">
              <h2 class="text-lg font-bold text-white border-b border-slate-800/80 pb-2">ঘটনার বিস্তারিত বিবরণ ও ফলাফল</h2>
              <div class="text-slate-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                ${content.incidentStory}
              </div>
            </div>

            <!-- Authority Action Summary -->
            ${
              content.authorityActionSummary
                ? `
              <div class="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h3 class="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span>🏛️</span> আইনশৃঙ্খলা ও কর্তৃপক্ষের গৃহীত পদক্ষেপ
                </h3>
                <p class="text-slate-300 text-sm leading-relaxed">${content.authorityActionSummary}</p>
              </div>
            `
                : ''
            }

            <!-- Legal Case & Outcome Status -->
            <div class="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h3 class="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span>⚖️</span> আইনি প্রেক্ষাপট ও বিচারিক অবস্থা
              </h3>
              <p class="text-slate-300 text-sm leading-relaxed">
                <strong class="text-slate-100">বর্তমান অবস্থা:</strong> ${caseInfo.label} (${caseInfo.bn})
              </p>
              ${
                content.legalSummary
                  ? `<p class="text-slate-400 text-xs leading-relaxed italic">${content.legalSummary}</p>`
                  : ''
              }
              ${
                report.legalOutcome
                  ? `
                <div class="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs">
                  <span class="font-bold block mb-1">অফিসিয়াল আইনি রায় / নিষ্পত্তি:</span>
                  ${report.legalOutcome}
                </div>
              `
                  : ''
              }
              <p class="text-[11px] text-slate-500 pt-1">
                * দ্রষ্টব্য: অভিযোগ দাখিল বা সত্যতা যাচাই কোনো আইনি রায় নয়। এটি নিরপেক্ষ মানবাধিকার তথ্যের উন্মুক্ত উপস্থাপন।
              </p>
            </div>

            <!-- Approved Public Evidence Section -->
            <div class="space-y-4 pt-2">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 class="text-base font-bold text-white flex items-center gap-2">
                  <span>📎</span> অনুমোদিত পাবলিক প্রমাণাদি
                </h2>
                <span class="text-xs text-slate-400">মোট ${approvedEvList.length} টি উন্মুক্ত প্রমাণ</span>
              </div>

              ${
                approvedEvList.length === 0
                  ? `
                <div class="p-6 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center text-slate-500 text-xs">
                  এই প্রতিবেদনের জন্য আলাদা কোনো পাবলিক প্রমাণপত্র উন্মুক্ত করা হয়নি।
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
                        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                          <div>
                            <div class="flex items-center justify-between text-xs mb-2">
                              <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                                ${ev.type || 'ফাইল'}
                              </span>
                              <span class="text-[10px] text-emerald-400 font-medium">✓ যাচাইকৃত ক্লিন</span>
                            </div>
                            <span class="text-xs font-semibold text-slate-200 block truncate" title="${ev.title || 'পাবলিক প্রমাণপত্র'}">
                              ${ev.title || 'পাবলিক প্রমাণপত্র'}
                            </span>
                          </div>

                          ${
                            isImage
                              ? `
                            <div class="overflow-hidden rounded-lg bg-slate-900 border border-slate-800 h-36 flex items-center justify-center">
                              <img 
                                src="${proxyUrl}" 
                                alt="${ev.title || 'প্রমাণপত্র ছবি'}" 
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

                          <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <span class="text-[10px] text-slate-500">সুরক্ষিত প্রক্সি ফাইল</span>
                            <a 
                              href="${proxyUrl}" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              referrerpolicy="no-referrer"
                              class="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
                            >
                              <span>উন্মুক্ত ফাইল দেখুন</span>
                              <span>↗</span>
                            </a>
                          </div>
                        </div>
                      `;
                    })
                    .join('')}
                </div>
                <p class="text-[10px] text-slate-500 italic">
                  * সমস্ত উন্মুক্ত প্রমাণপত্র নিরপেক্ষ সার্ভার প্রক্সি মাধ্যমে শূন্য-ট্র্যাকিং (Zero Viewer Tracking) নীতিমালার আওতায় প্রদান করা হয়।
                </p>
              `
              }
            </div>

            <!-- Accused Persons (Sanitized) -->
            ${
              report.publicAccused && report.publicAccused.length > 0
                ? `
              <div class="space-y-3 pt-2">
                <h2 class="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                  অভিযুক্ত ব্যক্তিবর্গ (যাচাইকৃত অংশ)
                </h2>
                <div class="space-y-2">
                  ${report.publicAccused
                    .map(
                      (acc) => `
                    <div class="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between">
                      <span class="font-semibold text-slate-200">${acc.name || 'অজ্ঞাত ব্যক্তি'}</span>
                      <span class="text-slate-400">${acc.role || 'অভিযুক্ত'} ${acc.organization ? `(${acc.organization})` : ''}</span>
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
                <h2 class="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                  ভুক্তভোগী ব্যক্তিবর্গ
                </h2>
                <div class="space-y-2">
                  ${report.publicVictims
                    .map(
                      (vic) => `
                    <div class="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between">
                      <span class="font-semibold text-slate-200">${vic.name || 'পরিচয় গোপনীয়'}</span>
                      <span class="text-slate-400">${vic.category || 'ভুক্তভোগী'}</span>
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
            <div class="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <span>নথি আইডি: #${refCode} (${report._id})</span>
              <span>জনস্বর নিরপেক্ষ তদন্ত দল দ্বারা অনুমোদিত ও প্রকাশিত</span>
            </div>
          </article>
        </div>
      `;

      // Attach language toggles
      const bnBtn = container.querySelector('#lang-bn-btn');
      const enBtn = container.querySelector('#lang-en-btn');
      if (bnBtn && enBtn) {
        bnBtn.addEventListener('click', () => {
          currentLang = 'bn';
          renderContent();
        });
        enBtn.addEventListener('click', () => {
          currentLang = 'en';
          renderContent();
        });
      }
    }

    renderContent();
  } catch (err) {
    container.innerHTML = `
      <div class="max-w-md mx-auto py-16 text-center">
        <div class="text-red-400 font-semibold mb-2">রিপোর্টটি পাওয়া যায়নি</div>
        <p class="text-slate-400 text-sm mb-6">${err.message || 'অনুরোধকৃত রিপোর্টটি বিদ্যমান নেই অথবা প্রকাশনা প্রত্যাহার করা হয়েছে।'}</p>
        <a href="#/reports" class="px-4 py-2 bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-lg text-xs font-semibold transition">
          সকল রিপোর্টে ফিরুন
        </a>
      </div>
    `;
  }
}
