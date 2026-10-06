import { reportService } from '../../../services/reports/reportService.js';

export async function renderHomePage(container) {
  container.innerHTML = `
    <!-- Hero Section -->
    <section class="py-16 md:py-24 text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent pointer-events-none"></div>
      
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-medium mb-6">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        মানবাধিকার ও নাগরিক ন্যায়বিচার নিশ্চিতকরণে নিবেদিত
      </div>

      <h1 class="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
        অন্যায় ও অবিচারের বিরুদ্ধে <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">জনগণের স্বাধীন স্বর</span>
      </h1>

      <p class="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        জনস্বর (JonoShor) প্ল্যাটফর্মে আপনার ওপর ঘটে যাওয়া অবিচার ও মানবাধিকার লঙ্ঘনের ঘটনা নিরাপদে জমা দিন। সম্পূর্ণ নিরপেক্ষ যাচাইয়ের মাধ্যমে সত্য প্রতিষ্ঠিত হবে।
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="#/complaint/new" class="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-xl shadow-red-950/50 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
          <span>অভিযোগ দাখিল করুন</span>
          <span>→</span>
        </a>
        <a href="#/reports" class="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium rounded-lg border border-slate-700 transition">
          পাবলিক রিপোর্ট দেখুন
        </a>
      </div>
    </section>

    <!-- Stats & Trust (Live Backend Statistics) -->
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 mb-16 border-y border-slate-800/80">
      <div class="text-center p-4">
        <div class="text-3xl font-extrabold text-white" id="stat-complaints">...</div>
        <div class="text-xs text-slate-400 mt-1">দাখিলকৃত অভিযোগ</div>
      </div>
      <div class="text-center p-4">
        <div class="text-3xl font-extrabold text-emerald-400" id="stat-verified">...</div>
        <div class="text-xs text-slate-400 mt-1">যাচাইকৃত উন্মুক্ত রিপোর্ট</div>
      </div>
      <div class="text-center p-4">
        <div class="text-3xl font-extrabold text-blue-400" id="stat-districts">৬৪</div>
        <div class="text-xs text-slate-400 mt-1">জেলায় বিস্তৃত নেটওয়ার্ক</div>
      </div>
      <div class="text-center p-4">
        <div class="text-3xl font-extrabold text-purple-400" id="stat-transparency">১০০%</div>
        <div class="text-xs text-slate-400 mt-1">নিরপেক্ষ যাচাই ও প্রবেশাধিকার</div>
      </div>
    </section>

    <!-- 3 Core Pillars -->
    <section class="mb-16">
      <div class="text-center max-w-xl mx-auto mb-10">
        <h2 class="text-2xl font-bold text-white mb-2">প্ল্যাটফর্ম যেভাবে কাজ করে</h2>
        <p class="text-slate-400 text-sm">অভিযোগ গ্রহণ থেকে সত্য যাচাই ও প্রকাশ পর্যন্ত ধাপে ধাপে স্বচ্ছ প্রক্রিয়া</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
          <div class="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold mb-4">১</div>
          <h3 class="text-lg font-semibold text-white mb-2">নিরাপদ অভিযোগ দাখিল</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            রেজিস্টার্ড বা নন-ইউজার হিসেবে অভিযোগের বিস্তারিত, প্রমাণপত্র ও তথ্য সাবমিট করুন। পরিচয় সর্বোচ্চ সুরক্ষায় সংরক্ষিত থাকবে।
          </p>
        </div>

        <div class="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
          <div class="w-10 h-10 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-bold mb-4">২</div>
          <h3 class="text-lg font-semibold text-white mb-2">নিরপেক্ষ মানবাধিকার যাচাই</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            স্বতন্ত্র তদন্তকারী ও মানবাধিকার কর্মকর্তাদের দ্বারা দালিলিক প্রমাণ, আইনি রেফারেন্স ও সত্যতা সূক্ষ্মভাবে যাচাই করা হয়।
          </p>
        </div>

        <div class="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
          <div class="w-10 h-10 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 font-bold mb-4">৩</div>
          <h3 class="text-lg font-semibold text-white mb-2">স্বচ্ছ পাবলিক ডকুমেন্টেশন</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            যাচাইকৃত সত্য পাবলিক রিপোর্ট আকারে বাংলা ও ইংরেজিতে প্রকাশ করা হয়, যা দেশীয় ও আন্তর্জাতিক ন্যায়বিচারে ভূমিকা রাখে।
          </p>
        </div>
      </div>
    </section>

    <!-- Recent Reports Preview -->
    <section class="mb-16">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-white">সর্বশেষ যাচাইকৃত রিপোর্টসমূহ</h2>
          <p class="text-slate-400 text-sm mt-1">সম্প্রতি প্রকাশিত ও উন্মুক্ত মানবাধিকার ঘটনাবলী</p>
        </div>
        <a href="#/reports" class="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition">
          সব রিপোর্ট দেখুন →
        </a>
      </div>

      <div id="recent-reports-container" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-6 rounded-xl bg-slate-900/50 border border-slate-800 text-center py-12 text-slate-500">
          রিপোর্ট লোড হচ্ছে...
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
      statComplaintsEl.textContent = compCount > 0 ? `${compCount.toLocaleString('bn-BD')}` : '০';
    }
    if (statVerifiedEl) {
      const verifiedCount = stats.verifiedReports || 0;
      statVerifiedEl.textContent = `${verifiedCount.toLocaleString('bn-BD')}`;
    }
    if (statDistrictsEl) {
      const distCount = stats.districts && stats.districts.length > 0 ? stats.districts.length : 64;
      statDistrictsEl.textContent = `${distCount.toLocaleString('bn-BD')}`;
    }
  } catch (err) {
    console.warn('Failed to load live statistics:', err);
    const statComplaintsEl = container.querySelector('#stat-complaints');
    const statVerifiedEl = container.querySelector('#stat-verified');
    if (statComplaintsEl) statComplaintsEl.textContent = '০';
    if (statVerifiedEl) statVerifiedEl.textContent = '০';
  }

  // Fetch and display latest reports
  try {
    const res = await reportService.getReports({ limit: 4 });
    const reports = res.data || [];
    const containerEl = container.querySelector('#recent-reports-container');

    if (reports.length === 0) {
      containerEl.innerHTML = `
        <div class="col-span-full p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400">
          বর্তমানে কোনো পাবলিক রিপোর্ট সংরক্ষিত নেই। নতুন যাচাইকৃত রিপোর্ট প্রকাশের সাথে সাথে এখানে প্রদর্শিত হবে।
        </div>
      `;
    } else {
      containerEl.innerHTML = reports
        .map(
          (report) => `
          <div class="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-2 mb-3">
                <span class="text-xs px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
                  ${report.category?.primary || 'মানবাধিকার'}
                </span>
                <span class="text-xs text-slate-400">
                  ${new Date(report.publishedAt || report.createdAt).toLocaleDateString('bn-BD')}
                </span>
              </div>
              <h3 class="text-lg font-bold text-white mb-2 leading-snug hover:text-emerald-400 transition">
                <a href="#/reports/${report._id}">${report.bn?.title || 'রিপোর্ট শিরোনাম'}</a>
              </h3>
              <p class="text-slate-400 text-sm line-clamp-3 mb-4">
                ${report.bn?.summary || ''}
              </p>
            </div>
            <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span class="text-xs text-slate-400">জেলা: ${report.location?.districtId || 'বাংলাদেশ'}</span>
              <a href="#/reports/${report._id}" class="text-xs font-semibold text-emerald-400 hover:underline">
                বিস্তারিত পড়ুন →
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
