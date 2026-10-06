import { adminComplaintService } from '../../../services/admin/adminComplaintService.js';
import { renderAdminNav } from '../../../components/admin/AdminNav.js';
import { getStatusBadge, getPriorityBadge, getSensitivityBadge } from '../../../components/admin/StatusBadge.js';
import { showModal } from '../../../components/admin/ActionModal.js';
import { formatDate, formatDateTime, formatBytes } from '../../../utils/formatters.js';

export async function renderAdminComplaintDetailsPage(container, complaintId) {
  container.innerHTML = `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      ${renderAdminNav('complaints')}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="details-loading" class="py-20 text-center">
          <div class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-xs text-slate-400">অভিযোগের বিস্তারিত তথ্য লোড হচ্ছে...</p>
        </div>
        <div id="details-content" class="hidden space-y-6"></div>
        <div id="details-error" class="hidden py-16 text-center"></div>
      </main>
    </div>
  `;

  const loadingEl = container.querySelector('#details-loading');
  const contentEl = container.querySelector('#details-content');
  const errorEl = container.querySelector('#details-error');

  async function loadDetails() {
    loadingEl.classList.remove('hidden');
    contentEl.classList.add('hidden');
    errorEl.classList.add('hidden');

    try {
      const res = await adminComplaintService.getComplaintById(complaintId);
      const comp = res?.data;
      if (!comp) {
        throw new Error('অভিযোগ পাওয়া যায়নি');
      }

      renderComplaintUI(comp);
      loadingEl.classList.add('hidden');
      contentEl.classList.remove('hidden');
    } catch (err) {
      loadingEl.classList.add('hidden');
      errorEl.innerHTML = `
        <div class="max-w-md mx-auto p-6 bg-red-950/60 border border-red-800 rounded-xl text-center">
          <h3 class="text-base font-bold text-red-200 mb-2">অভিযোগ তথ্য লোড করা যায়নি</h3>
          <p class="text-xs text-red-300/80 mb-4">${err.message || 'অনুমতি নেই বা রেকর্ডটি পাওয়া যায়নি।'}</p>
          <a href="#/admin/complaints" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-block transition">
            অভিযোগ তালিকায় ফিরে যান
          </a>
        </div>
      `;
      errorEl.classList.remove('hidden');
    }
  }

  function renderComplaintUI(comp) {
    const isConflict = comp.review?.conflictOfInterest;
    const assignedReviewer = comp.review?.assignedReviewerId;
    const evidenceList = comp.evidence || [];
    const statusHistory = comp.statusHistory || [];
    const accusedList = comp.accused || [];
    const victimsList = comp.victims || [];
    const authorityActions = comp.authorityActions || [];
    const reporter = comp.reporterId || {};

    contentEl.innerHTML = `
      <!-- Top Navigation & Actions Bar -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <a href="#/admin/complaints" class="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-xl font-bold text-white font-mono">#${String(comp._id)}</h1>
              ${getStatusBadge(comp.status)}
              ${getPriorityBadge(comp.priority)}
              ${getSensitivityBadge(comp.sensitivity)}
            </div>
            <p class="text-xs text-slate-400 mt-1">
              দাখিল: ${formatDateTime(comp.createdAt)} | আপডেট: ${formatDateTime(comp.updatedAt)}
            </p>
          </div>
        </div>

        <!-- Workflow Review Action Buttons -->
        <div class="flex flex-wrap items-center gap-2" id="action-buttons-group">
          <!-- Assign Reviewer -->
          <button id="btn-assign-reviewer" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition">
            রিভিউয়ার নিয়োগ
          </button>

          <!-- Screening -->
          <button id="btn-screen" class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition">
            বাছাইকরণ / স্ক্রিনিং
          </button>

          <!-- Request Information -->
          <button id="btn-req-info" class="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow transition">
            তথ্য চাওয়া
          </button>

          <!-- Verification -->
          <button id="btn-verify" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition">
            যাচাইকরণ
          </button>

          <!-- Publication Review (Visible for verified / public disclosure review) -->
          ${
            comp.status === 'verified' || comp.status === 'public_disclosure_review'
              ? `
            <button id="btn-public-disclosure" class="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow transition flex items-center gap-1.5">
              <span>📢 প্রকাশনা পর্যালোচনা</span>
            </button>
          `
              : ''
          }

          ${
            comp.status === 'published'
              ? `
            <a href="#/reports/${comp.publicReportId || ''}" target="_blank" class="px-3.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold transition flex items-center gap-1.5">
              <span>✓ উন্মুক্ত পাবলিক রিপোর্ট দেখুন →</span>
            </a>
          `
              : ''
          }

          <!-- Declare Conflict -->
          <button id="btn-conflict" class="px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold transition">
            স্বার্থের দ্বন্দ্ব
          </button>
        </div>
      </div>

      <!-- Conflict Warning Banner if declared -->
      ${
        isConflict
          ? `
        <div class="p-4 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs flex items-center gap-3">
          <svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div>
            <strong class="font-bold">সতর্কবার্তা:</strong> এই অভিযোগে পর্যালোচকের স্বার্থের দ্বন্দ্ব (Conflict of Interest) ঘোষিত হয়েছে। অভিযোগটি পুনরায় বরাদ্দ না হওয়া পর্যন্ত পূর্ববর্তী পর্যালোচনা স্থগিত থাকবে।
          </div>
        </div>
      `
          : ''
      }

      <!-- Main Layout: Left 2/3 Content, Right 1/3 Review Status -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 1. Incident Info -->
          <div class="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 class="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>ঘটনার বিবরণ (Incident Details)</span>
              <span class="text-xs font-normal text-emerald-400">${comp.category?.primary || ''}</span>
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span class="text-slate-400 block mb-1">প্রাথমিক ক্যাটেগরি</span>
                <span class="font-semibold text-slate-200 text-sm">${comp.category?.primary || '—'}</span>
              </div>
              <div>
                <span class="text-slate-400 block mb-1">দ্বিতীয় পর্যায়ের ক্যাটেগরি</span>
                <span class="text-slate-300">${comp.category?.secondary?.join(', ') || 'কোনোটি নয়'}</span>
              </div>
              <div>
                <span class="text-slate-400 block mb-1">ঘটনার তারিখ ও সময়</span>
                <span class="text-slate-200">${formatDate(comp.incident?.startDate)} ${comp.incident?.endDate ? `থেকে ${formatDate(comp.incident.endDate)}` : ''}</span>
                ${comp.incident?.ongoing ? '<span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">ঘটনা এখনো চলমান</span>' : ''}
              </div>
              <div>
                <span class="text-slate-400 block mb-1">ঘটনার স্থান</span>
                <span class="text-slate-200 font-medium">
                  ${comp.location?.upazilaId ? `${comp.location.upazilaId}, ` : ''}
                  ${comp.location?.districtId || ''}, 
                  ${comp.location?.divisionId || ''}
                </span>
                ${comp.location?.freeTextLocation ? `<span class="block text-slate-400 mt-1">${comp.location.freeTextLocation}</span>` : ''}
              </div>
            </div>

            <div class="pt-2">
              <span class="text-slate-400 text-xs block mb-2">ঘটনার বিস্তারিত বর্ণনা:</span>
              <div class="p-4 rounded-lg bg-slate-950 border border-slate-800/80 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                ${comp.incident?.description || 'কোনো বর্ণনা পাওয়া যায়নি।'}
              </div>
            </div>
          </div>

          <!-- 2. Attached Evidence -->
          <div class="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 class="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>সংযুক্ত প্রমাণাদি (Attached Evidence)</span>
              <span class="text-xs text-slate-400">মোট ${evidenceList.length} টি ফাইল</span>
            </h2>

            ${
              evidenceList.length === 0
                ? `
              <div class="p-6 text-center text-slate-500 text-xs">
                এই অভিযোগে এখনও কোনো প্রমাণ সংযুক্ত করা হয়নি।
              </div>
            `
                : `
              <div class="divide-y divide-slate-800">
                ${evidenceList
                  .map(
                    (ev) => `
                  <div class="py-3.5 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded bg-slate-800 flex items-center justify-center text-slate-400">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                        </svg>
                      </div>
                      <div>
                        <span class="text-xs font-semibold text-slate-200 block">${ev.originalFilename || 'ফাইল'}</span>
                        <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>${ev.type || 'অজ্ঞাত'}</span>
                          <span>•</span>
                          <span>${formatBytes(ev.size)}</span>
                          <span>•</span>
                          <span>আপলোড: ${formatDate(ev.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-medium ${
                        ev.malwareScanStatus === 'clean'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : ev.malwareScanStatus === 'infected'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }">
                        ম্যালওয়্যার স্ক্যান: ${ev.malwareScanStatus || 'পেন্ডিং'}
                      </span>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
            }
          </div>

          <!-- 3. Accused & Victims Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Accused Persons -->
            <div class="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 class="text-sm font-bold text-white border-b border-slate-800 pb-2">
                অভিযুক্তদের তালিকা (${accusedList.length})
              </h3>
              ${
                accusedList.length === 0
                  ? `<p class="text-xs text-slate-500 py-3">কোনো অভিযুক্ত ব্যক্তি বা সত্তা তালিকাভুক্ত নেই।</p>`
                  : `
                <div class="space-y-3 text-xs">
                  ${accusedList
                    .map(
                      (acc) => `
                    <div class="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span class="font-bold text-slate-200 block">${acc.name || 'অজ্ঞাত ব্যক্তি'} ${acc.alias ? `(${acc.alias})` : ''}</span>
                      <span class="text-slate-400 text-[11px] block mt-0.5">${acc.role || acc.profession || ''} ${acc.organization ? `— ${acc.organization}` : ''}</span>
                      ${acc.mobile ? `<span class="text-slate-400 text-[11px] block mt-0.5">মোবাইল: ${acc.mobile}</span>` : ''}
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
              }
            </div>

            <!-- Victims -->
            <div class="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 class="text-sm font-bold text-white border-b border-slate-800 pb-2">
                ভুক্তভোগীদের বিবরণ (${victimsList.length})
              </h3>
              ${
                victimsList.length === 0
                  ? `<p class="text-xs text-slate-500 py-3">নির্দিষ্ট কোনো ভুক্তভোগীর তথ্য লিপিবদ্ধ নেই।</p>`
                  : `
                <div class="space-y-3 text-xs">
                  ${victimsList
                    .map(
                      (vic) => `
                    <div class="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-200">${vic.name || 'নাম গোপন'}</span>
                        ${vic.minor ? '<span class="px-1.5 py-0.5 rounded text-[9px] bg-red-950 text-red-300 border border-red-800 font-semibold">নাবালক/নাবালিকা</span>' : ''}
                      </div>
                      <span class="text-slate-400 text-[11px] block mt-0.5">বয়স: ${vic.age || vic.ageCategory || '—'} | লিঙ্গ: ${vic.gender || '—'}</span>
                      ${vic.relationshipToIncident ? `<span class="text-slate-400 text-[11px] block mt-0.5">সম্পর্ক: ${vic.relationshipToIncident}</span>` : ''}
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
              }
            </div>
          </div>
        </div>

        <!-- Right Column: Review State & Reporter Details -->
        <div class="space-y-6">
          <!-- Review State Box -->
          <div class="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 class="text-sm font-bold text-white border-b border-slate-800 pb-3">
              পর্যালোচনা অবস্থা ও নিয়োগ
            </h2>
            <div class="space-y-3 text-xs">
              <div>
                <span class="text-slate-400 block mb-1">বর্তমান স্ট্যাটাস</span>
                <div>${getStatusBadge(comp.status)}</div>
              </div>
              <div>
                <span class="text-slate-400 block mb-1">নিযুক্ত রিভিউয়ার</span>
                <span class="font-mono text-slate-200 font-medium text-xs">
                  ${assignedReviewer ? `#${String(assignedReviewer)}` : '<span class="text-slate-500 font-normal">এখনো কোনো রিভিউয়ার নিযুক্ত হননি</span>'}
                </span>
                ${comp.review?.assignedAt ? `<span class="text-[10px] text-slate-500 block mt-0.5">নিয়োগ: ${formatDateTime(comp.review.assignedAt)}</span>` : ''}
              </div>

              ${
                comp.review?.reviewerNotes
                  ? `
                <div>
                  <span class="text-slate-400 block mb-1">পর্যালোচকের অভ্যন্তরীণ মন্তব্য:</span>
                  <div class="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs italic">
                    ${comp.review.reviewerNotes}
                  </div>
                </div>
              `
                  : ''
              }

              ${
                comp.review?.verificationDecision
                  ? `
                <div>
                  <span class="text-slate-400 block mb-1">যাচাইকরণ সিদ্ধান্ত:</span>
                  <span class="font-semibold text-emerald-400">${comp.review.verificationDecision}</span>
                  ${comp.review.verificationReason ? `<p class="text-slate-400 mt-1">${comp.review.verificationReason}</p>` : ''}
                </div>
              `
                  : ''
              }
            </div>
          </div>

          <!-- Reporter Details Box -->
          <div class="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 class="text-sm font-bold text-white border-b border-slate-800 pb-3">
              রিপোর্টার সম্পর্কিত তথ্য
            </h2>
            <div class="space-y-3 text-xs">
              <div>
                <span class="text-slate-400 block mb-1">সাবমিশন ধরন</span>
                <span class="font-medium text-slate-200">${comp.submissionType === 'user' ? 'নিবন্ধিত ইউজার' : 'সাধারণ নাগরিক (নন-ইউজার)'}</span>
              </div>

              ${
                reporter.isAnonymous
                  ? `
                <div class="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-amber-200 text-xs">
                  <span class="font-bold block mb-1">বেনামী রিপোর্ট</span>
                  রিপোর্টার জনসম্মুখে তার পরিচয় গোপন রাখার অনুরোধ জানিয়েছেন।
                </div>
              `
                  : ''
              }

              ${
                reporter.contact?.email
                  ? `
                <div>
                  <span class="text-slate-400 block mb-0.5">যোগাযোগের ইমেইল</span>
                  <span class="text-slate-200 font-mono">${reporter.contact.email}</span>
                </div>
              `
                  : ''
              }

              ${
                reporter.contact?.mobile
                  ? `
                <div>
                  <span class="text-slate-400 block mb-0.5">যোগাযোগের মোবাইল</span>
                  <span class="text-slate-200 font-mono">${reporter.contact.mobile}</span>
                </div>
              `
                  : ''
              }
            </div>
          </div>

          <!-- Workflow History Timeline -->
          <div class="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 class="text-sm font-bold text-white border-b border-slate-800 pb-3">
              ওয়ার্কফ্লো ইতিহাস (${statusHistory.length})
            </h2>

            ${
              statusHistory.length === 0
                ? `<p class="text-xs text-slate-500">কোনো হিস্ট্রি রেকর্ড নেই।</p>`
                : `
              <div class="relative border-l border-slate-800 ml-2 space-y-4 text-xs">
                ${statusHistory
                  .map(
                    (h) => `
                  <div class="relative pl-4">
                    <span class="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-800 border border-slate-700"></span>
                    <span class="font-semibold text-slate-200 block">${h.status}</span>
                    <span class="text-[10px] text-slate-500 block">${formatDateTime(h.changedAt)}</span>
                    ${h.note ? `<p class="text-[11px] text-slate-400 mt-1 italic">${h.note}</p>` : ''}
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
            }
          </div>

          <!-- Authority Actions if any -->
          ${
            authorityActions.length > 0
              ? `
            <div class="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h2 class="text-sm font-bold text-white border-b border-slate-800 pb-2">আইনি পদক্ষেপ</h2>
              <div class="space-y-2 text-xs">
                ${authorityActions
                  .map(
                    (act) => `
                  <div class="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span class="font-bold text-slate-200 block">${act.authorityName || 'কর্তৃপক্ষ'}</span>
                    <span class="text-slate-400">${act.action || ''} (${formatDate(act.actionDate)})</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;

    setupActionModals(comp);
  }

  function setupActionModals(comp) {
    // 1. Assign Reviewer
    const assignBtn = container.querySelector('#btn-assign-reviewer');
    if (assignBtn) {
      assignBtn.addEventListener('click', () => {
        showModal({
          title: 'রিভিউয়ার নিয়োগ (Assign Reviewer)',
          description: 'অভিযোগটি তদন্ত ও পর্যালোচনার জন্য একজন এডমিন বা রিভিউয়ারের আইডি প্রদান করুন।',
          contentHtml: `
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">রিভিউয়ার এডমিন আইডি *</label>
              <input id="input-reviewer-id" type="text" placeholder="যেমন: 64b8f... (Admin ObjectId)" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"/>
              <p class="text-[11px] text-slate-500 mt-1.5">রিভিউয়ার নিয়োগ দিলে অভিযোগটির স্ট্যাটাস 'স্ক্রিনিং' এ স্থানান্তরিত হবে।</p>
            </div>
          `,
          confirmText: 'নিয়োগ নিশ্চিত করুন',
          confirmColor: 'bg-emerald-600 hover:bg-emerald-500',
          onConfirm: async (modal) => {
            const reviewerId = modal.querySelector('#input-reviewer-id').value.trim();
            if (!reviewerId) {
              throw new Error('রিভিউয়ার আইডি প্রদান আবশ্যক');
            }
            await adminComplaintService.assignReviewer(comp._id, reviewerId);
            await loadDetails();
          },
        });
      });
    }

    // 2. Screening
    const screenBtn = container.querySelector('#btn-screen');
    if (screenBtn) {
      screenBtn.addEventListener('click', () => {
        showModal({
          title: 'বাছাইকরণ সিদ্ধান্ত (Screening Decision)',
          description: 'অভিযোগের প্রাথমিক স্ক্রিনিং সম্পন্ন করে পরবর্তী ধাপে প্রেরণ করুন বা প্রত্যাখ্যান করুন।',
          contentHtml: `
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">পরবর্তী স্ট্যাটাস নির্বাচন করুন *</label>
                <select id="input-screen-status" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500">
                  <option value="screening">স্ক্রিনিং চলমান (Screening)</option>
                  <option value="evidence_review">প্রমাণ পর্যালোচনায় প্রেরণ (Evidence Review)</option>
                  <option value="verification">যাচাইকরণে প্রেরণ (Verification)</option>
                  <option value="rejected">প্রত্যাখ্যান (Rejected)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">স্ক্রিনিং নোট / কারণ</label>
                <textarea id="input-screen-notes" rows="3" placeholder="প্রাথমিক পর্যালোচনার পর্যবেক্ষণ বা সিদ্ধান্তের কারণ লিখুন..." class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"></textarea>
              </div>
            </div>
          `,
          confirmText: 'সিদ্ধান্ত সংরক্ষণ করুন',
          confirmColor: 'bg-blue-600 hover:bg-blue-500',
          onConfirm: async (modal) => {
            const status = modal.querySelector('#input-screen-status').value;
            const notes = modal.querySelector('#input-screen-notes').value.trim();
            await adminComplaintService.screenComplaint(comp._id, { status, notes });
            await loadDetails();
          },
        });
      });
    }

    // 3. Request Information
    const reqInfoBtn = container.querySelector('#btn-req-info');
    if (reqInfoBtn) {
      reqInfoBtn.addEventListener('click', () => {
        showModal({
          title: 'অতিরিক্ত তথ্য চাওয়া (Request Information)',
          description: 'অভিযোগকারীর নিকট থেকে কোনো স্পষ্টীকরণ বা প্রমাণের ঘাটতি সম্পর্কে তথ্য আহ্বান করুন।',
          contentHtml: `
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">বার্তার বিষয়বস্তু *</label>
              <textarea id="input-req-msg" rows="4" placeholder="অভিযোগকারীর কাছে কী ধরনের অতিরিক্ত তথ্য প্রয়োজন তা বিস্তারিত লিখুন..." class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"></textarea>
            </div>
          `,
          confirmText: 'অনুরোধ পাঠান',
          confirmColor: 'bg-orange-600 hover:bg-orange-500',
          onConfirm: async (modal) => {
            const message = modal.querySelector('#input-req-msg').value.trim();
            if (!message) {
              throw new Error('বার্তার বিবরণ প্রদান আবশ্যক');
            }
            const targetUserId = comp.reporterId?.accountId || undefined;
            await adminComplaintService.requestInformation(comp._id, { message, targetUserId });
            await loadDetails();
          },
        });
      });
    }

    // 4. Verify Complaint
    const verifyBtn = container.querySelector('#btn-verify');
    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => {
        showModal({
          title: 'অভিযোগ যাচাইকরণ (Verify Complaint)',
          description: 'সংযুক্ত প্রমাণাদি ও তথ্য অনুসন্ধানের ভিত্তিতে যাচাইকরণের চূড়ান্ত মূল্যায়ন রেকর্ড করুন।',
          contentHtml: `
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">যাচাইকরণ সিদ্ধান্ত *</label>
                <select id="input-verify-decision" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500">
                  <option value="verified">যাচাইকৃত (Verified - সত্যতা প্রমাণিত)</option>
                  <option value="partially_verified">আংশিক প্রমাণিত (Partially Verified)</option>
                  <option value="unverified">প্রমাণিত হয়নি (Unverified)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">সিদ্ধান্তের যৌক্তিক কারণ *</label>
                <textarea id="input-verify-reason" rows="2" placeholder="কেন এই সিদ্ধান্তে আসা হলো তার সারসংক্ষেপ লিখুন..." class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"></textarea>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">প্রমাণের মূল্যায়ন (Evidence Assessment)</label>
                <textarea id="input-verify-assessment" rows="2" placeholder="প্রমাণসমূহের গ্রহণযোগ্যতা ও নির্ভুলতার মূল্যায়ন..." class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"></textarea>
              </div>
            </div>
          `,
          confirmText: 'যাচাইকরণ সম্পন্ন করুন',
          confirmColor: 'bg-emerald-600 hover:bg-emerald-500',
          onConfirm: async (modal) => {
            const decision = modal.querySelector('#input-verify-decision').value;
            const reason = modal.querySelector('#input-verify-reason').value.trim();
            const assessment = modal.querySelector('#input-verify-assessment').value.trim();

            if (!reason) {
              throw new Error('সিদ্ধান্তের কারণ উল্লেখ করা আবশ্যক');
            }

            await adminComplaintService.verifyComplaint(comp._id, {
              decision,
              reason,
              assessment,
              notes: reason,
            });
            await loadDetails();
          },
        });
      });
    }

    // 5. Declare Conflict
    const conflictBtn = container.querySelector('#btn-conflict');
    if (conflictBtn) {
      conflictBtn.addEventListener('click', () => {
        showModal({
          title: 'স্বার্থের দ্বন্দ্ব ঘোষণা (Declare Conflict of Interest)',
          description: 'আপনি যদি এই অভিযোগকারী, অভিযুক্ত বা ঘটনার সাথে ব্যক্তিগত বা পেশাগতভাবে সম্পৃক্ত থাকেন, তবে স্বার্থের দ্বন্দ্ব ঘোষণা করুন।',
          contentHtml: `
            <div>
              <label class="block text-xs font-semibold text-rose-300 mb-1">স্বার্থের দ্বন্দ্বের কারণ *</label>
              <textarea id="input-conflict-reason" rows="3" placeholder="স্বার্থের দ্বন্দ্বের সুনির্দিষ্ট কারণ উল্লেখ করুন..." class="w-full bg-slate-950 border border-rose-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"></textarea>
              <p class="text-[11px] text-rose-400 mt-2">ঘোষণা দিলে আপনাকে এই অভিযোগের রিভিউয়ার থেকে সরিয়ে দেওয়া হবে এবং অভিযোগটি পুনর্বণ্টনের জন্য কিউতে পাঠানো হবে।</p>
            </div>
          `,
          confirmText: 'দ্বন্দ্ব ঘোষণা নিশ্চিত করুন',
          confirmColor: 'bg-rose-700 hover:bg-rose-600',
          onConfirm: async (modal) => {
            const reason = modal.querySelector('#input-conflict-reason').value.trim();
            if (!reason) {
              throw new Error('কারণ উল্লেখ করা আবশ্যক');
            }
            await adminComplaintService.declareConflict(comp._id, reason);
            await loadDetails();
          },
        });
      });
    }

    // 6. Publication Disclosure Review
    const pubBtn = container.querySelector('#btn-public-disclosure');
    if (pubBtn) {
      pubBtn.addEventListener('click', () => {
        const defaultTitle = `${comp.location?.districtId ? comp.location.districtId + '-এ ' : ''}${comp.category?.primary || 'মানবাধিকার লঙ্ঘন'} সংক্রান্ত ঘটনা`;
        const defaultSummary = comp.incident?.description
          ? comp.incident.description.slice(0, 180) + '...'
          : 'ঘটনার প্রাথমিক সত্যতা সরেজমিনে নিশ্চিত করা হয়েছে।';
        const defaultStory = comp.incident?.description || '';

        showModal({
          title: 'পাবলিক প্রকাশনা অনুমোদন (Public Disclosure Review)',
          description: 'যাচাইকৃত অভিযোগটি জনসম্মুখে প্রকাশের জন্য শুধুমাত্র অনুমোদিত ও নিরাপদ তথ্য দিয়ে পাবলিক রিপোর্ট তৈরি করুন। সংবেদনশীল তথ্য ও পরিচয় গোপন রাখা হবে।',
          contentHtml: `
            <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">পাবলিক রিপোর্ট শিরোনাম (বাংলা) *</label>
                <input id="input-pub-title" type="text" value="${defaultTitle}" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1">সারসংক্ষেপ (বাংলা) *</label>
                <textarea id="input-pub-summary" rows="2" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500">${defaultSummary}</textarea>
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1">ঘটনার বিস্তারিত বিবরণ (পাবলিক নিরাপদ প্রতিবেদন) *</label>
                <textarea id="input-pub-story" rows="4" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500">${defaultStory}</textarea>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-300 mb-1">কর্তৃপক্ষের পদক্ষেপের সারসংক্ষেপ</label>
                  <input id="input-pub-authority" type="text" placeholder="পুলিশ বা প্রশাসনের গৃহীত ব্যবস্থা..." class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-300 mb-1">আইনি মামলার অবস্থা</label>
                  <select id="input-pub-case-status" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500">
                    <option value="under_investigation">তদন্তাধীন (Under Investigation)</option>
                    <option value="case_filed">মামলা দায়েরকৃত (Case Filed)</option>
                    <option value="trial">বিচারিক পর্যায়ে (Trial)</option>
                    <option value="no_legal_case">কোনো মামলা নেই (No Legal Case)</option>
                    <option value="unknown">অনির্ধারিত (Unknown)</option>
                    <option value="resolved">নিষ্পত্তিকৃত (Resolved)</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1">আইনি সারসংক্ষেপ ও সরকারি রেফারেন্স</label>
                <input id="input-pub-legal" type="text" placeholder="মামলা নম্বর বা আদালতের রেফারেন্স (যদি থাকে)..." class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500" />
              </div>
              <div class="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p class="font-bold text-slate-300">🔒 স্বয়ংক্রিয় সুরক্ষা ও প্রকাশনা নীতিমালা:</p>
                <p>• অভিযোগকারীর পরিচয় শতভাগ সুরক্ষিত থাকবে এবং কোনো ব্যক্তিগত তথ্য প্রকাশিত হবে না।</p>
                <p>• অপ্রাপ্তবয়স্ক ভুক্তভোগীদের নাম স্বয়ংক্রিয়ভাবে 'পরিচয় গোপনীয়' হিসেবে সংরক্ষিত থাকবে।</p>
                <p>• শুধুমাত্র ম্যালওয়্যার স্ক্যান উত্তীর্ণ ও এডমিন কর্তৃক 'approved_public' চিহ্নিত প্রমাণপত্রসমূহ যুক্ত হবে।</p>
              </div>
            </div>
          `,
          confirmText: 'অনুমোদন ও প্রকাশনা নিশ্চিত করুন',
          confirmColor: 'bg-emerald-600 hover:bg-emerald-500',
          onConfirm: async (modal) => {
            const title = modal.querySelector('#input-pub-title').value.trim();
            const summary = modal.querySelector('#input-pub-summary').value.trim();
            const story = modal.querySelector('#input-pub-story').value.trim();
            const authority = modal.querySelector('#input-pub-authority').value.trim();
            const legalSummary = modal.querySelector('#input-pub-legal').value.trim();
            const caseStatus = modal.querySelector('#input-pub-case-status').value;

            if (!title || !summary || !story) {
              throw new Error('বাংলা শিরোনাম, সারসংক্ষেপ ও বিবরণ আবশ্যক');
            }

            await adminComplaintService.createPublicReport(comp._id, {
              bn: {
                title,
                summary,
                incidentStory: story,
                authorityActionSummary: authority,
                legalSummary,
              },
              authorityActionSummary: authority,
              legalSummary,
              caseStatus,
            });

            await loadDetails();
          },
        });
      });
    }
  }

  await loadDetails();
}
