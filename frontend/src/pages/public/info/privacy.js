import { contentService } from '../../../services/content/contentService.js';
import { t, isBangla } from '../../../i18n/index.js';

export async function renderPrivacyPage(container) {
  const hash = window.location.hash;
  const isBn = isBangla();
  let activeTab = 'privacy';
  if (hash.includes('safety')) activeTab = 'safety';
  else if (hash.includes('terms')) activeTab = 'terms';

  container.innerHTML = `
    <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
          ${t('privacy.badge')}
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          ${t('privacy.title')}
        </h1>
        <p class="text-slate-600 text-sm md:text-base max-w-xl mx-auto">
          ${t('privacy.subtitle')}
        </p>
      </div>

      <!-- Navigation Tabs -->
      <nav class="flex items-center justify-center gap-2 p-1 bg-slate-100 border border-slate-200 rounded-xl max-w-md mx-auto mb-10" aria-label="Policy sections">
        <a href="#/privacy" class="flex-1 py-2 text-center text-xs sm:text-sm font-semibold rounded-lg transition ${
          activeTab === 'privacy'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }">
          ${t('privacy.tab_privacy')}
        </a>
        <a href="#/safety" class="flex-1 py-2 text-center text-xs sm:text-sm font-semibold rounded-lg transition ${
          activeTab === 'safety'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }">
          ${t('privacy.tab_safety')}
        </a>
        <a href="#/terms" class="flex-1 py-2 text-center text-xs sm:text-sm font-semibold rounded-lg transition ${
          activeTab === 'terms'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }">
          ${t('privacy.tab_terms')}
        </a>
      </nav>

      <!-- Content Area -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm leading-relaxed text-slate-700 text-sm space-y-6">
        <div id="policy-content">
          <div class="text-center py-8 text-slate-500">${t('privacy.loading_policy')}</div>
        </div>
      </div>
    </div>
  `;

  const contentEl = container.querySelector('#policy-content');

  try {
    const slug = activeTab === 'terms' ? 'terms' : activeTab === 'safety' ? 'safety' : 'privacy';
    const data = await contentService.getContent(slug);

    if (activeTab === 'privacy') {
      contentEl.innerHTML = `
        <h2 class="text-xl font-bold text-slate-900 mb-4">${isBn ? 'গোপনীয়তা ও তথ্য সুরক্ষা নীতি' : 'Privacy & Identity Protection Policy'}</h2>
        <p class="mb-4 text-slate-600 leading-relaxed">
          ${
            (isBn ? data?.bn?.content : data?.en?.content) ||
            (isBn
              ? 'জনস্বর প্রতিটি নাগরিক ও তথ্য প্রদানকারীর সর্বোচ্চ নিরাপত্তা এবং গোপনীয়তা বজায় রাখতে প্রতিশ্রুতিবদ্ধ।'
              : 'JonoShor is committed to preserving the highest standards of whistleblower safety and identity confidentiality.')
          }
        </p>
        <div class="space-y-4 border-t border-slate-200 pt-4">
          <h3 class="text-base font-semibold text-slate-900">${isBn ? '১. পরিচয় সুরক্ষা ও এক্সেস নিয়ন্ত্রণ' : '1. Identity Protection & Access Control'}</h3>
          <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">
            ${
              isBn
                ? 'অভিযোগকারীর নাম, ইমেইল ও ফোন নম্বর ডিফল্টভাবে সম্পূর্ণ গোপন থাকে। ব্যক্তিগত তথ্যের এক্সেস কঠোরভাবে নিয়ন্ত্রিত এবং তা কখনো জনসমক্ষে প্রকাশ করা হয় না।'
                : 'Complainant names, email addresses, and phone numbers are strictly private by default. Access to identifying records is restricted and never displayed to public visitors.'
            }
          </p>

          <h3 class="text-base font-semibold text-slate-900">${isBn ? '২. শূন্য-ট্র্যাকিং নীতি (Zero Tracking)' : '2. Zero-Tracking Policy'}</h3>
          <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">
            ${
              isBn
                ? 'জনস্বর উন্মুক্ত রিপোর্ট পরিদর্শনে কোনো বাণিজ্যিক ট্র্যাকিং, বিজ্ঞাপন বা নজরদারিমূলক কুকিজ ব্যবহার করা হয় না।'
                : 'Visiting JonoShor public reports involves zero commercial tracking, zero advertising scripts, and zero third-party behavioral analytics cookies.'
            }
          </p>

          <h3 class="text-base font-semibold text-slate-900">${isBn ? '৩. নিরাপদ ও সুরক্ষিত ডেটা সংরক্ষণ' : '3. Cryptographic & Session Safeguards'}</h3>
          <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">
            ${
              isBn
                ? 'সমস্ত পাসওয়ার্ড ও সেশন সুরক্ষিত এনক্রিপশনের মাধ্যমে সংরক্ষিত থাকে যাতে কোনো অননুমোদিত পক্ষ তথ্যে প্রবেশ করতে না পারে।'
                : 'All accounts and sessions are protected with industry-standard cryptographic isolation to prevent unauthorized access.'
            }
          </p>
        </div>
      `;
    } else if (activeTab === 'safety') {
      contentEl.innerHTML = `
        <h2 class="text-xl font-bold text-slate-900 mb-4">${isBn ? 'নিরাপত্তা ও সত্যতা যাচাইয়ের নির্দেশিকা' : 'Safety & Verification Guidelines'}</h2>
        <p class="mb-4 text-slate-600 leading-relaxed">
          ${
            (isBn ? data?.bn?.content : data?.en?.content) ||
            (isBn
              ? 'তথ্য পর্যালোচনা ও রিপোর্ট প্রকাশের প্রতিটি পদক্ষেপে ভুক্তভোগীর জীবন ও নাগরিক নিরাপত্তাই আমাদের সর্বোচ্চ অগ্রাধিকার।'
              : 'Complainant and victim safety is our foremost priority during evidence processing and public reporting.')
          }
        </p>
        <div class="space-y-4 border-t border-slate-200 pt-4">
          <h3 class="text-base font-semibold text-slate-900">${isBn ? '১. সংবেদনশীল তথ্য ও ভুক্তভোগী সুরক্ষা' : '1. Sensitive Data & Victim Safeguards'}</h3>
          <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">
            ${
              isBn
                ? 'যেকোনো পাবলিক রিপোর্টে অপ্রাপ্তবয়স্ক ও ঝুঁকিগ্রস্ত ভুক্তভোগীদের নাম, চেহারা ও ব্যক্তিগত সংবেদনশীল তথ্য ঢেকে রাখা বা সম্পূর্ণ গোপন রাখা হয়।'
                : 'Public reports redact identifying details, faces, and sensitive attributes of vulnerable complainants and witnesses to prevent retaliation.'
            }
          </p>

          <h3 class="text-base font-semibold text-slate-900">${isBn ? '২. প্রমাণাদির নিরপেক্ষ সত্যতা অনুসন্ধান' : '2. Impartial Corroboration'}</h3>
          <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">
            ${
              isBn
                ? 'দাখিলকৃত প্রমাণাদি একাধিক স্বতন্ত্র সূত্র ও পেশাদার মূল্যায়নের মাধ্যমে যাচাই করা হয় যাতে তথ্যের নির্ভুলতা বজায় থাকে।'
                : 'Uploaded evidence undergoes multi-stage factual verification to maintain evidentiary credibility.'
            }
          </p>
        </div>
      `;
    } else {
      contentEl.innerHTML = `
        <h2 class="text-xl font-bold text-slate-900 mb-4">${isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms of Use'}</h2>
        <p class="mb-4 text-slate-600 leading-relaxed">
          ${
            (isBn ? data?.bn?.content : data?.en?.content) ||
            (isBn
              ? 'জনস্বর প্ল্যাটফর্ম দায়িত্বশীলভাবে ব্যবহারের জন্য প্রয়োজনীয় শর্তাবলী ও নীতিমালা।'
              : 'Terms governing the responsible use and civil documentation on the JonoShor platform.')
          }
        </p>
        <div class="space-y-4 border-t border-slate-200 pt-4">
          <h3 class="text-base font-semibold text-slate-900">${isBn ? '১. সত্য ও বস্তুনিষ্ঠ তথ্য দাখিল' : '1. Truthful & Objective Submission'}</h3>
          <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">
            ${
              isBn
                ? 'ব্যক্তিগত ক্ষোভ বা কাউকে ইচ্ছাকৃতভাবে হেয় করার উদ্দেশ্যে মিথ্যা বা বানোয়াট তথ্য দাখিল করা সম্পূর্ণ নিষিদ্ধ।'
                : 'Submitting fabricated claims or deliberately misleading information for malicious harassment is strictly prohibited.'
            }
          </p>

          <h3 class="text-base font-semibold text-slate-900">${isBn ? '২. সংশোধন ও প্রত্যাহার অধিকার' : '2. Revision & Withdrawal Rights'}</h3>
          <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">
            ${
              isBn
                ? 'অভিযোগকারী যুক্তিসঙ্গত কারণে অতিরিক্ত তথ্য সংযোজন বা মামলা প্রত্যাহারের আবেদন করার সুযোগ পান।'
                : 'Complainants can submit factual revisions or request withdrawal under appropriate procedural guidelines.'
            }
          </p>
        </div>
      `;
    }
  } catch {
    // Keep baseline fallback
  }
}
