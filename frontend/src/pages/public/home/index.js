import { reportService } from '../../../services/reports/reportService.js';
import { getLanguage, t } from '../../../i18n/index.js';

export async function renderHomePage(container) {
  const isBn = getLanguage() === 'bn';

  container.innerHTML = `
    <!-- Hero Section -->
    <section class="py-16 md:py-24 text-center relative overflow-hidden">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold mb-6">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true"></span>
        ${isBn ? 'মানবাধিকার ও ন্যায়বিচারের নির্ভরযোগ্য উন্মুক্ত তথ্যশালা' : 'Dedicated to Civil Rights & Verifiable Justice'}
      </div>

      <h1 class="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
        ${
          isBn
            ? 'অন্যায় ও নিপীড়নের বিরুদ্ধে <br /><span class="text-emerald-700">স্বাধীন নাগরিক কণ্ঠস্বর</span>'
            : 'The Independent Voice <br /><span class="text-emerald-700">Against Injustice</span>'
        }
      </h1>

      <p class="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
        ${
          isBn
            ? 'জনস্বর (JonoShor) মানবাধিকার লঙ্ঘন ও প্রশাসনিক নিপীড়নের ঘটনা নির্ভয়ে, নিরাপদে ও নিরপেক্ষভাবে নথিভুক্ত এবং উন্মুক্ত করার একটি স্বাধীন নাগরিক প্ল্যাটফর্ম।'
            : 'JonoShor (জনস্বর) provides a secure, verified platform to document human rights violations and administrative injustice with uncompromising whistleblower privacy.'
        }
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="#/complaint/new" class="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-600">
          <span>${t('nav.submit_complaint')}</span>
          <span aria-hidden="true">→</span>
        </a>
        <a href="#/reports" class="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-300 transition shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-600">
          ${t('nav.reports')}
        </a>
      </div>
    </section>

    <!-- Stats & Trust (Live Backend Statistics) -->
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 mb-16 border-y border-slate-200 bg-white rounded-xl shadow-xs" aria-label="Platform Statistics">
      <div class="text-center p-4">
        <div class="text-3xl font-extrabold text-slate-900" id="stat-complaints">...</div>
        <div class="text-xs text-slate-600 mt-1 font-medium">${isBn ? 'দাখিলকৃত অভিযোগ' : 'Submitted Complaints'}</div>
      </div>
      <div class="text-center p-4">
        <div class="text-3xl font-extrabold text-emerald-700" id="stat-verified">...</div>
        <div class="text-xs text-slate-600 mt-1 font-medium">${isBn ? 'যাচাইকৃত পাবলিক রিপোর্ট' : 'Verified Public Reports'}</div>
      </div>
      <div class="text-center p-4">
        <div class="text-3xl font-extrabold text-blue-700" id="stat-districts">64</div>
        <div class="text-xs text-slate-600 mt-1 font-medium">${isBn ? 'আওতাভুক্ত জেলা' : 'Districts Covered'}</div>
      </div>
      <div class="text-center p-4">
        <div class="text-3xl font-extrabold text-purple-700" id="stat-transparency">100%</div>
        <div class="text-xs text-slate-600 mt-1 font-medium">${isBn ? 'সত্যতা যাচাইয়ের হার' : 'Fact-Checked Verification'}</div>
      </div>
    </section>

    <!-- 3 Core Pillars -->
    <section class="mb-16">
      <div class="text-center max-w-xl mx-auto mb-10">
        <h2 class="text-2xl font-bold text-slate-900 mb-2">${isBn ? 'প্ল্যাটফর্মের মূল ধাপসমূহ' : 'How the Platform Works'}</h2>
        <p class="text-slate-600 text-sm">${isBn ? 'অভিযোগ দাখিল থেকে শুরু করে নিরপেক্ষ সত্যতা যাচাই ও উন্মুক্ত প্রতিবেদন প্রকাশের স্বচ্ছ পরিক্রমা' : 'A transparent, multi-step process from incident documentation to verified publication'}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-xs">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold mb-4" aria-hidden="true">1</div>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">${isBn ? 'নিরাপদ অভিযোগ দাখিল' : 'Secure Incident Submission'}</h3>
          <p class="text-slate-600 text-sm leading-relaxed">
            ${isBn ? 'রেজিস্ট্রেশনের মাধ্যমে বা সম্পূর্ণ বেনামে যেকোনো নাগরিক ঘটনার বিবরণ ও প্রাসঙ্গিক প্রমাণপত্র দাখিল করতে পারেন।' : 'Submit incident accounts, supporting evidence, and timelines as a registered user or anonymously. Reporter safety and confidentiality are protected by design.'}
          </p>
        </div>

        <div class="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-xs">
          <div class="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold mb-4" aria-hidden="true">2</div>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">${isBn ? 'নিরপেক্ষ তথ্য অনুসন্ধান' : 'Independent Fact Verification'}</h3>
          <p class="text-slate-600 text-sm leading-relaxed">
            ${isBn ? 'নিরপেক্ষ অনুসন্ধান দল নথিপত্র পর্যালোচনা করে এবং তথ্যের সত্যতা যাচাইয়ের মাধ্যমে নিরপেক্ষতা নিশ্চিত করে।' : 'Independent investigators and rights officers review documentation, cross-reference evidence, and verify factual details according to legal standards.'}
          </p>
        </div>

        <div class="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-xs">
          <div class="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold mb-4" aria-hidden="true">3</div>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">${isBn ? 'উন্মুক্ত পাবলিক রেকর্ড' : 'Public Record Documentation'}</h3>
          <p class="text-slate-600 text-sm leading-relaxed">
            ${isBn ? 'যাচাইকৃত রিপোর্টগুলো উন্মুক্ত নাগরিক রিপোর্ট হিসেবে প্রকাশ করা হয়, যা আইনি লড়াই ও সামাজিক জবাবদিহিতার ঐতিহাসিক দলিল হিসেবে ভূমিকা রাখে।' : 'Verified findings are published in public reports, creating an immutable historical record to support legal redress and civic accountability.'}
          </p>
        </div>
      </div>
    </section>

    <!-- Recent Reports Preview -->
    <section class="mb-16">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">${isBn ? 'সাম্প্রতিক যাচাইকৃত রিপোর্টসমূহ' : 'Latest Verified Reports'}</h2>
          <p class="text-slate-600 text-sm mt-1">${isBn ? 'জনস্বার্থে সম্প্রতি প্রকাশিত নিরপেক্ষ মানবাধিকার প্রতিবেদন' : 'Recently published public-interest human rights records'}</p>
        </div>
        <a href="#/reports" class="text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition">
          ${isBn ? 'সকল রিপোর্ট দেখুন →' : 'View All Reports →'}
        </a>
      </div>

      <div id="recent-reports-container" class="grid grid-cols-1 md:grid-cols-2 gap-6" aria-live="polite">
        <div class="p-6 rounded-xl bg-white border border-slate-200 text-center py-12 text-slate-500 shadow-xs">
          ${isBn ? 'রিপোর্ট লোড হচ্ছে...' : 'Loading verified reports...'}
        </div>
      </div>
    </section>
  `;

  // Fetch and display live statistics
  try {
    const stats = await reportService.getStatistics();
    const statComplaintsEl = container.querySelector('#stat-complaints');
    const statVerifiedEl = container.querySelector('#stat-verified');
    const statDistrictsEl = container.querySelector('#stat-districts');

    if (statComplaintsEl) {
      const compCount = stats.totalComplaints || 0;
      statComplaintsEl.textContent = `${compCount.toLocaleString('en-US')}`;
    }
    if (statVerifiedEl) {
      const verifiedCount = stats.verifiedReports || 0;
      statVerifiedEl.textContent = `${verifiedCount.toLocaleString('en-US')}`;
    }
    if (statDistrictsEl) {
      const distCount = stats.districts && stats.districts.length > 0 ? stats.districts.length : 64;
      statDistrictsEl.textContent = `${distCount.toLocaleString('en-US')}`;
    }
  } catch (err) {
    console.warn('Failed to load live statistics:', err);
    const statComplaintsEl = container.querySelector('#stat-complaints');
    const statVerifiedEl = container.querySelector('#stat-verified');
    if (statComplaintsEl) statComplaintsEl.textContent = '0';
    if (statVerifiedEl) statVerifiedEl.textContent = '0';
  }

  // Fetch and display latest reports
  try {
    const res = await reportService.getReports({ limit: 4 });
    const reports = res.data || [];
    const containerEl = container.querySelector('#recent-reports-container');

    if (reports.length === 0) {
      containerEl.innerHTML = `
        <div class="col-span-full p-8 rounded-xl bg-white border border-slate-200 text-center text-slate-600 shadow-xs">
          ${isBn ? 'এখনো কোনো পাবলিক রিপোর্ট প্রকাশিত হয়নি। নতুন যাচাইকৃত রিপোর্ট এখানে স্বয়ংক্রিয়ভাবে দৃশ্যমান হবে।' : 'No public reports published yet. Newly verified reports will appear here automatically.'}
        </div>
      `;
    } else {
      containerEl.innerHTML = reports
        .map(
          (report) => `
          <div class="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between shadow-xs">
            <div>
              <div class="flex items-center justify-between gap-2 mb-3">
                <span class="text-xs px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  ${report.category?.primary || (isBn ? 'মানবাধিকার' : 'Human Rights')}
                </span>
                <span class="text-xs text-slate-500 font-medium">
                  ${new Date(report.publishedAt || report.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2 leading-snug hover:text-emerald-700 transition">
                <a href="#/reports/${report._id}">
                  ${isBn ? (report.bn?.title || report.en?.title || 'রিপোর্ট সারসংক্ষেপ') : (report.en?.title || report.bn?.title || 'Report Summary')}
                </a>
              </h3>
              <p class="text-slate-600 text-sm line-clamp-3 mb-4">
                ${isBn ? (report.bn?.summary || report.en?.summary || '') : (report.en?.summary || report.bn?.summary || '')}
              </p>
            </div>
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span class="text-xs text-slate-500">${isBn ? 'জেলা' : 'District'}: ${report.location?.districtId || (isBn ? 'সারাদেশ' : 'Nationwide')}</span>
              <a href="#/reports/${report._id}" class="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                ${isBn ? 'সম্পূর্ণ রিপোর্ট পড়ুন →' : 'Read Full Report →'}
              </a>
            </div>
          </div>
        `
        )
        .join('');
    }
  } catch (err) {
    console.error('Failed to load recent reports:', err);
  }
}
