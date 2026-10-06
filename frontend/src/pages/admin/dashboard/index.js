import { adminComplaintService } from '../../../services/admin/adminComplaintService.js';
import { renderAdminNav } from '../../../components/admin/AdminNav.js';
import { getStatusBadge } from '../../../components/admin/StatusBadge.js';
import { formatDate } from '../../../utils/formatters.js';

export async function renderAdminDashboardPage(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      ${renderAdminNav('dashboard')}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="dashboard-loading" class="py-20 text-center">
          <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-400 text-sm">ড্যাশবোর্ড তথ্য লোড হচ্ছে...</p>
        </div>
        <div id="dashboard-content" class="hidden space-y-8"></div>
        <div id="dashboard-error" class="hidden py-16 text-center"></div>
      </main>
    </div>
  `;

  const loadingEl = container.querySelector('#dashboard-loading');
  const contentEl = container.querySelector('#dashboard-content');
  const errorEl = container.querySelector('#dashboard-error');

  try {
    const [metricsRes, recentComplaintsRes] = await Promise.all([
      adminComplaintService.getDashboard(),
      adminComplaintService.listComplaints({ page: 1, limit: 5 }),
    ]);

    const counts = metricsRes?.data?.counts || {};
    const recentItems = recentComplaintsRes?.data || [];

    contentEl.innerHTML = `
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 class="text-2xl font-bold text-white tracking-tight">প্রশাসনিক ড্যাশবোর্ড</h1>
          <p class="text-sm text-slate-400 mt-1">অভিযোগ পর্যালোচনা পাইপলাইন এবং কার্যনির্বাহী সংক্ষিপ্ত পরিসংখ্যান</p>
        </div>
        <div>
          <a href="#/admin/complaints" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-emerald-950/40 transition">
            সকল অভিযোগ পর্যালোচনা
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Metric Cards Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- 1. Total -->
        <a href="#/admin/complaints" class="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition block group">
          <span class="text-xs font-medium text-slate-400 block mb-1">মোট অভিযোগ</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-emerald-400 transition">${counts.total || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">সর্বমোট রেকর্ডকৃত অভিযোগ</span>
        </a>

        <!-- 2. Submitted (New) -->
        <a href="#/admin/complaints?status=submitted" class="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-600/50 transition block group">
          <span class="text-xs font-medium text-amber-400 block mb-1">দাখিলকৃত (নতুন)</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-amber-300">${counts.submitted || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">বাছাইকরণের অপেক্ষায়</span>
        </a>

        <!-- 3. In Review -->
        <a href="#/admin/complaints?status=screening" class="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-600/50 transition block group">
          <span class="text-xs font-medium text-blue-400 block mb-1">পর্যালোচনায় রয়েছে</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-blue-300">${counts.pendingReview || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">স্ক্রিনিং / যাচাইয়াধীন</span>
        </a>

        <!-- 4. Needs Info -->
        <a href="#/admin/complaints?status=needs_information" class="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-orange-600/50 transition block group">
          <span class="text-xs font-medium text-orange-400 block mb-1">তথ্য প্রয়োজন</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-orange-300">${counts.needsInformation || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">নাগরিকের জবাবের অপেক্ষায়</span>
        </a>

        <!-- 5. Verified -->
        <a href="#/admin/complaints?status=verified" class="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-600/50 transition block group">
          <span class="text-xs font-medium text-emerald-400 block mb-1">যাচাইকৃত</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-emerald-300">${counts.verified || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">সত্যতা প্রমাণিত অভিযোগ</span>
        </a>

        <!-- 6. Published -->
        <a href="#/admin/complaints?status=published" class="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-600/50 transition block group">
          <span class="text-xs font-medium text-teal-400 block mb-1">প্রকাশিত</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-teal-300">${counts.published || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">পাবলিক রিপোর্টে অন্তর্ভুক্ত</span>
        </a>

        <!-- 7. Rejected -->
        <a href="#/admin/complaints?status=rejected" class="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-600/50 transition block group">
          <span class="text-xs font-medium text-red-400 block mb-1">প্রত্যাখ্যাত</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-red-300">${counts.rejected || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">ভিত্তিহীন / নীতি বহির্ভূত</span>
        </a>

        <!-- 8. High Priority -->
        <a href="#/admin/complaints?priority=high" class="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-600/50 transition block group">
          <span class="text-xs font-medium text-rose-400 block mb-1">উচ্চ অগ্রাধিকার</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-rose-300">${counts.highPriority || 0}</span>
          <span class="text-[11px] text-slate-500 block mt-2">জরুরি বা বিশেষ নজরদারি</span>
        </a>
      </div>

      <!-- Recent Complaints Section -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 class="text-base font-bold text-white">সাম্প্রতিক অভিযোগসমূহ</h2>
          <a href="#/admin/complaints" class="text-xs text-emerald-400 hover:text-emerald-300 font-medium">সবগুলো দেখুন →</a>
        </div>

        ${
          recentItems.length === 0
            ? `
          <div class="p-8 text-center text-slate-500 text-sm">
            বর্তমানে কোনো অভিযোগ পাওয়া যায়নি।
          </div>
        `
            : `
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-300">
              <thead class="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="px-6 py-3">রেফারেন্স</th>
                  <th class="px-6 py-3">ক্যাটেগরি</th>
                  <th class="px-6 py-3">স্থান</th>
                  <th class="px-6 py-3">স্ট্যাটাস</th>
                  <th class="px-6 py-3">তারিখ</th>
                  <th class="px-6 py-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                ${recentItems
                  .map(
                    (comp) => `
                  <tr class="hover:bg-slate-800/40 transition">
                    <td class="px-6 py-4 font-mono text-xs text-slate-300 font-medium">
                      #${String(comp._id).slice(-8)}
                    </td>
                    <td class="px-6 py-4 font-medium text-white">
                      ${comp.category?.primary || 'অনির্দিষ্ট'}
                    </td>
                    <td class="px-6 py-4 text-xs text-slate-400">
                      ${comp.location?.districtId || ''} ${comp.location?.divisionId ? `(${comp.location.divisionId})` : ''}
                    </td>
                    <td class="px-6 py-4">
                      ${getStatusBadge(comp.status)}
                    </td>
                    <td class="px-6 py-4 text-xs text-slate-400">
                      ${formatDate(comp.createdAt)}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <a href="#/admin/complaints/${comp._id}" class="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition">
                        পর্যালোচনা
                      </a>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
        }
      </div>
    `;

    loadingEl.classList.add('hidden');
    contentEl.classList.remove('hidden');
  } catch (err) {
    loadingEl.classList.add('hidden');
    errorEl.innerHTML = `
      <div class="max-w-md mx-auto p-6 bg-red-950/60 border border-red-800 rounded-xl text-center">
        <svg class="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <h3 class="text-base font-bold text-red-200 mb-1">অ্যাক্সেস অস্বীকৃত বা ত্রুটি</h3>
        <p class="text-xs text-red-300/80 mb-4">${err.message || 'ড্যাশবোর্ড তথ্য লোড করা যায়নি। অনুমতি নেই বা অধিবেশন শেষ হয়েছে।'}</p>
        <a href="#/login" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-block transition">
          লগইন পৃষ্ঠায় যান
        </a>
      </div>
    `;
    errorEl.classList.remove('hidden');
  }
}
