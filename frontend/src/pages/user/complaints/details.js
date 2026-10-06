import { complaintService } from '../../../services/complaints/complaintService.js';
import { evidenceService } from '../../../services/evidence/evidenceService.js';
import { authService } from '../../../services/auth/authService.js';
import { STATUS_LABELS } from '../../../config/constants.js';

export async function renderComplaintDetailsPage(container, complaintId) {
  const user = authService.getCurrentUser();
  if (!user) {
    window.location.hash = '#/login';
    return;
  }

  container.innerHTML = `
    <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div id="details-alert" class="hidden mb-6 p-4 rounded-xl text-sm"></div>

      <div class="mb-6 flex items-center justify-between">
        <a href="#/user/dashboard" class="text-sm text-slate-400 hover:text-white transition flex items-center gap-1.5 font-medium">
          ← আমার ড্যাশবোর্ডে ফিরুন
        </a>
        <div id="header-action-zone"></div>
      </div>

      <div id="complaint-loading" class="p-16 text-center text-slate-500">
        অভিযোগের তথ্য লোড হচ্ছে...
      </div>

      <div id="complaint-content" class="hidden space-y-6"></div>
    </div>

    <!-- Modals Container -->
    <div id="modal-container"></div>
  `;

  const alertEl = container.querySelector('#details-alert');
  const loadingEl = container.querySelector('#complaint-loading');
  const contentEl = container.querySelector('#complaint-content');
  const headerActionZone = container.querySelector('#header-action-zone');
  const modalContainer = container.querySelector('#modal-container');

  function showAlert(msg, type = 'error') {
    alertEl.textContent = msg;
    if (type === 'success') {
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-emerald-950/80 border border-emerald-800 text-emerald-300';
    } else {
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300';
    }
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '০ B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  async function loadData() {
    try {
      const compRes = await complaintService.getMyComplaintById(complaintId);
      const complaint = compRes.data || compRes;

      let evidenceList = [];
      try {
        evidenceList = await evidenceService.listEvidence(complaintId);
      } catch (e) {
        console.warn('Could not load evidence:', e);
      }

      renderComplaintUI(complaint, evidenceList);
    } catch (err) {
      loadingEl.innerHTML = `
        <div class="p-12 text-center text-red-400">
          <p class="font-bold mb-2">অভিযোগের তথ্য পাওয়া যায়নি</p>
          <p class="text-sm text-slate-400 mb-4">${err.message || 'অননুমোদিত এক্সেস অথবা অভিযোগটি বিদ্যমান নেই।'}</p>
          <a href="#/user/dashboard" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold">
            ড্যাশবোর্ডে ফিরে যান
          </a>
        </div>
      `;
    }
  }

  function renderComplaintUI(complaint, evidenceList) {
    loadingEl.classList.add('hidden');
    contentEl.classList.remove('hidden');

    const statusConfig = STATUS_LABELS[complaint.status] || {
      bn: complaint.status,
      color: 'bg-slate-800 text-slate-300 border-slate-700',
    };

    const isDraft = complaint.status === 'draft';

    // Header actions
    if (isDraft) {
      headerActionZone.innerHTML = `
        <a href="#/complaint/new?draftId=${complaint._id}" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition flex items-center gap-1.5 shadow-md">
          ✏️ খসড়া সম্পাদনা ও দাখিল
        </a>
      `;
    } else {
      headerActionZone.innerHTML = '';
    }

    contentEl.innerHTML = `
      <!-- Status Banner -->
      <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-semibold px-3 py-1 rounded-full border ${statusConfig.color}">
              ${statusConfig.bn}
            </span>
            <span class="text-xs text-slate-400 font-mono">আইডি: ${complaint._id}</span>
          </div>
          <h1 class="text-2xl font-bold text-white">
            ${complaint.category?.primary || 'মানবাধিকার লঙ্ঘন অভিযোগ'}
          </h1>
          <p class="text-xs text-slate-400 mt-1">
            জমাদান: ${new Date(complaint.createdAt).toLocaleDateString('bn-BD', { dateStyle: 'long' })}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          ${
            !isDraft && !complaint.withdrawal?.requested && complaint.status !== 'withdrawn' && complaint.status !== 'closed'
              ? `
            <button id="open-withdraw-modal" class="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800 text-xs font-medium transition">
              প্রত্যাহার অনুরোধ
            </button>
          `
              : ''
          }
          ${
            !isDraft && (complaint.correctionCount || 0) < 3
              ? `
            <button id="open-correct-modal" class="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition">
              তথ্য সংশোধনী (${3 - (complaint.correctionCount || 0)}/৩)
            </button>
          `
              : ''
          }
          ${
            !isDraft
              ? `
            <button id="open-legal-modal" class="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition">
              ⚖️ আইনি আপডেট
            </button>
          `
              : ''
          }
        </div>
      </div>

      ${
        isDraft
          ? `
        <div class="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-sm flex items-center justify-between">
          <div>
            <strong>এটি একটি সংরক্ষিত অপ্রকাশিত খসড়া।</strong> তথ্য সম্পূর্ণ করে জমা দেওয়ার আগ পর্যন্ত এটি শুধুমাত্র আপনার জন্যই সংরক্ষিত থাকবে।
          </div>
          <a href="#/complaint/new?draftId=${complaint._id}" class="ml-4 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs font-semibold whitespace-nowrap">
            সম্পাদনা করুন
          </a>
        </div>
      `
          : ''
      }

      ${
        complaint.withdrawal?.requested
          ? `
        <div class="p-4 rounded-xl bg-slate-800/70 border border-slate-700 text-slate-300 text-sm">
          <strong>প্রত্যাহারের অনুরোধ বিবেচনাধীন:</strong> ${complaint.withdrawal.reason || 'কারণ উল্লেখ করা হয়নি'}
          <span class="block text-xs text-slate-400 mt-1">অনুরোধের তারিখ: ${new Date(complaint.withdrawal.requestedAt).toLocaleDateString('bn-BD')}</span>
        </div>
      `
          : ''
      }

      <!-- Canonical Public Report Banner (Public/User Consistency) -->
      ${
        complaint.status === 'published' || complaint.publicReportId
          ? `
        <div class="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 shadow-xl space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/60 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 class="text-sm font-bold text-emerald-300">
                এই অভিযোগটি নিরপেক্ষভাবে যাচাইপূর্বক উন্মুক্ত পাবলিক রিপোর্ট হিসেবে প্রকাশিত হয়েছে
              </h2>
            </div>
            <a 
              href="#/reports/${complaint.publicReportId || ''}" 
              target="_blank" 
              class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow transition flex items-center gap-1.5"
            >
              <span>উন্মুক্ত পাবলিক পাতায় দেখুন</span>
              <span>↗</span>
            </a>
          </div>

          <div class="space-y-2 text-xs">
            <h3 class="text-base font-bold text-white">
              ${complaint.publicReport?.title || 'যাচাইকৃত পাবলিক প্রতিবেদন'}
            </h3>
            <p class="text-slate-300 leading-relaxed">
              ${complaint.publicReport?.summary || ''}
            </p>
            <div class="flex flex-wrap items-center gap-4 text-slate-400 pt-2">
              <span>প্রকাশনার তারিখ: ${new Date(complaint.publicReport?.publishedAt || complaint.updatedAt).toLocaleDateString('bn-BD')}</span>
              <span>আইনি অবস্থা: ${complaint.publicReport?.caseStatus || 'তদন্তাধীন'}</span>
              <span>অনুমোদিত পাবলিক প্রমাণ: ${complaint.publicReport?.approvedEvidence?.length || 0} টি</span>
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- Grid of Details -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Details (2 cols) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Incident Story -->
          <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 class="text-base font-bold text-white mb-3">ঘটনার বিবরণ</h2>
            <p class="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">${complaint.incident?.description || 'কোনো বিবরণ প্রদান করা হয়নি।'}</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800 text-xs">
              <div>
                <span class="text-slate-400 block mb-0.5">ঘটনার তারিখ:</span>
                <span class="text-slate-200 font-medium">
                  ${complaint.incident?.startDate ? new Date(complaint.incident.startDate).toLocaleDateString('bn-BD') : 'অজানা'}
                  ${complaint.incident?.endDate ? ` — ${new Date(complaint.incident.endDate).toLocaleDateString('bn-BD')}` : ''}
                </span>
              </div>
              <div>
                <span class="text-slate-400 block mb-0.5">বর্তমান অবস্থা:</span>
                <span class="text-slate-200 font-medium">
                  ${complaint.incident?.ongoing ? '⚠️ ঘটনাটি এখনও চলমান রয়েছে' : 'সম্পন্ন হয়েছে'}
                </span>
              </div>
            </div>
          </div>

          <!-- Accused & Victims -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <h3 class="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                <span>👤 অভিযুক্তের তথ্য</span>
              </h3>
              ${
                complaint.accused && complaint.accused.length > 0
                  ? complaint.accused
                      .map(
                        (a) => `
                    <div class="text-xs space-y-1 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-2">
                      <p class="font-bold text-slate-200">${a.name || 'নাম অজ্ঞাত'}</p>
                      ${a.role ? `<p class="text-slate-400">ভূমিকা: ${a.role}</p>` : ''}
                      ${a.organization ? `<p class="text-slate-400">প্রতিষ্ঠান: ${a.organization}</p>` : ''}
                      ${a.location ? `<p class="text-slate-400">অবস্থান: ${a.location}</p>` : ''}
                    </div>
                  `
                      )
                      .join('')
                  : '<p class="text-xs text-slate-500">কোনো অভিযুক্তের তথ্য যুক্ত করা হয়নি।</p>'
              }
            </div>

            <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <h3 class="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                <span>🛡️ ভিকটিম / ক্ষতিগ্রস্তের তথ্য</span>
              </h3>
              ${
                complaint.victims && complaint.victims.length > 0
                  ? complaint.victims
                      .map(
                        (v) => `
                    <div class="text-xs space-y-1 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-2">
                      <p class="font-bold text-slate-200">${v.name || 'নাম অজ্ঞাত'}</p>
                      ${v.ageCategory ? `<p class="text-slate-400">শ্রেণি: ${v.ageCategory}</p>` : ''}
                      ${v.relationshipToIncident ? `<p class="text-slate-400">সম্পর্ক: ${v.relationshipToIncident}</p>` : ''}
                    </div>
                  `
                      )
                      .join('')
                  : '<p class="text-xs text-slate-500">কোনো ভিকটিমের তথ্য যুক্ত করা হয়নি।</p>'
              }
            </div>
          </div>

          <!-- Evidence List & Upload Section -->
          <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-bold text-white flex items-center gap-2">
                <span>📁 প্রমাণাদি ও সংযুক্তি</span>
                <span class="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-normal">
                  ${evidenceList.length} টি
                </span>
              </h2>
            </div>

            <!-- Evidence List -->
            <div class="space-y-3 mb-6" id="evidence-items-container">
              ${
                evidenceList.length === 0
                  ? `
                <div class="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  <p class="text-sm mb-1">কোনো প্রমাণপত্র এখনও আপলোড করা হয়নি</p>
                  <p class="text-xs text-slate-600">নিচে ফর্ম ব্যবহার করে ছবি, নথি বা ভিডিও যুক্ত করুন।</p>
                </div>
              `
                  : evidenceList
                      .map((ev) => {
                        const isLink = ev.type === 'external_link';
                        return `
                    <div class="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div class="flex items-center gap-3 overflow-hidden">
                        <span class="text-xl">${isLink ? '🔗' : '📄'}</span>
                        <div class="truncate">
                          <p class="font-medium text-slate-200 truncate">
                            ${isLink ? ev.external?.url : ev.originalFilename || 'প্রমাণপত্র'}
                          </p>
                          <div class="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                            <span>${ev.type}</span>
                            ${ev.size ? `<span>• ${formatBytes(ev.size)}</span>` : ''}
                            <span>• ${ev.malwareScanStatus === 'clean' ? '<span class="text-emerald-400">নিরাপদ (Clean)</span>' : '<span class="text-amber-400">যাচাই হচ্ছে</span>'}</span>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center gap-2 shrink-0">
                        ${
                          ev.downloadUrl
                            ? `
                          <a href="${ev.downloadUrl}" target="_blank" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium rounded-lg transition">
                            ডাউনলোড / দেখুন
                          </a>
                        `
                            : isLink
                            ? `
                          <a href="${ev.external?.url}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium rounded-lg transition">
                            লিঙ্ক খুলুন
                          </a>
                        `
                            : ''
                        }
                      </div>
                    </div>
                  `;
                      })
                      .join('')
              }
            </div>

            <!-- Upload Box (Google Drive Session Flow) -->
            <div class="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-4">
              <h4 class="text-xs font-semibold text-slate-300">নতুন প্রমাণ আপলোড করুন</h4>
              
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-[11px] text-slate-400 mb-1">প্রমাণের ধরন</label>
                  <select id="new-ev-type" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none">
                    <option value="image">ছবি (Image)</option>
                    <option value="pdf">পিডিএফ (PDF)</option>
                    <option value="document">নথি (Document)</option>
                    <option value="video">ভিডিও (Video)</option>
                    <option value="audio">অডিও (Audio)</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-[11px] text-slate-400 mb-1">ফাইল নির্বাচন করুন (সর্বোচ্চ ১০০ মেগাবাইট)</label>
                  <input type="file" id="new-ev-file" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer" />
                </div>
              </div>

              <div class="flex items-center justify-between pt-1">
                <span id="upload-status-text" class="text-xs text-slate-400"></span>
                <button type="button" id="upload-evidence-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-md flex items-center gap-1.5">
                  <span>আপলোড ও স্ক্যান</span>
                </button>
              </div>

              <!-- External URL alternative -->
              <details class="text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <summary class="cursor-pointer hover:text-slate-200 font-medium">অথবা অনলাইন নিউজ / সোশ্যাল লিঙ্ক যুক্ত করুন</summary>
                <div class="mt-3 space-y-2">
                  <input type="url" id="new-ev-url" placeholder="https://example.com/news-report" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200" />
                  <div class="flex justify-end">
                    <button type="button" id="add-link-btn" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium">
                      লিঙ্ক যুক্ত করুন
                    </button>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        <!-- Sidebar (Location + Timeline) (1 col) -->
        <div class="space-y-6">
          <!-- Location Details -->
          <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
            <h3 class="text-sm font-bold text-white">ঘটনাস্থলের অবস্থান</h3>
            <div class="text-xs space-y-2">
              <div>
                <span class="text-slate-500 block">বিভাগ:</span>
                <span class="text-slate-200 font-medium capitalize">${complaint.location?.divisionId || 'নির্দিষ্ট নয়'}</span>
              </div>
              <div>
                <span class="text-slate-500 block">জেলা:</span>
                <span class="text-slate-200 font-medium capitalize">${complaint.location?.districtId || 'নির্দিষ্ট নয়'}</span>
              </div>
              ${
                complaint.location?.upazilaId
                  ? `
                <div>
                  <span class="text-slate-500 block">উপজেলা / থানা:</span>
                  <span class="text-slate-200 font-medium">${complaint.location.upazilaId}</span>
                </div>
              `
                  : ''
              }
              ${
                complaint.location?.freeTextLocation
                  ? `
                <div>
                  <span class="text-slate-500 block">নির্দিষ্ট এলাকা:</span>
                  <span class="text-slate-200 font-medium">${complaint.location.freeTextLocation}</span>
                </div>
              `
                  : ''
              }
            </div>
          </div>

          <!-- Status History Timeline -->
          <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
            <h3 class="text-sm font-bold text-white mb-4">অগ্রগতির টাইমলাইন</h3>
            <div class="space-y-4 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-800">
              ${
                complaint.statusHistory && complaint.statusHistory.length > 0
                  ? complaint.statusHistory
                      .map((h) => {
                        const cfg = STATUS_LABELS[h.status] || { bn: h.status, color: 'bg-slate-800 text-slate-300' };
                        return `
                    <div class="relative pl-6 text-xs">
                      <div class="absolute left-1 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-slate-900"></div>
                      <p class="font-bold text-slate-200">${cfg.bn}</p>
                      <span class="text-[11px] text-slate-500 block">
                        ${new Date(h.changedAt).toLocaleDateString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      ${h.note ? `<p class="text-slate-400 text-[11px] mt-0.5">${h.note}</p>` : ''}
                    </div>
                  `;
                      })
                      .join('')
                  : '<p class="text-xs text-slate-500 pl-6">কোনো ইতিহাস উপলব্ধ নেই।</p>'
              }
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach Event Listeners
    setupActions(complaint);
  }

  function setupActions(complaint) {
    // 1. Evidence Upload Action
    const uploadBtn = container.querySelector('#upload-evidence-btn');
    const fileInput = container.querySelector('#new-ev-file');
    const typeSelect = container.querySelector('#new-ev-type');
    const statusText = container.querySelector('#upload-status-text');

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
          showAlert('অনুগ্রহ করে একটি ফাইল নির্বাচন করুন।');
          return;
        }

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'আপলোড ও স্ক্যান হচ্ছে...';
        statusText.textContent = 'ধাপ ১/২: আপলোড সেশন প্রস্তুত হচ্ছে...';

        try {
          // 1. Create upload session
          const sessionRes = await evidenceService.createUploadSession(complaintId, {
            type: typeSelect.value,
            originalFilename: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
          });

          const sessionData = sessionRes.data || sessionRes;
          const evidenceId = sessionData.evidenceId;

          statusText.textContent = 'ধাপ ২/২: নিরাপদ স্টোরেজে পাঠানো ও ম্যালওয়্যার স্ক্যান হচ্ছে...';

          // 2. Complete upload with binary file buffer
          await evidenceService.completeUpload(complaintId, {
            evidenceId,
            file,
          });

          showAlert('প্রমাণপত্র সফলভাবে আপলোড ও স্ক্যান সম্পন্ন হয়েছে!', 'success');
          fileInput.value = '';
          statusText.textContent = '';
          await loadData();
        } catch (err) {
          showAlert(err.message || 'প্রমাণপত্র আপলোড করতে ব্যর্থ হয়েছে।');
          statusText.textContent = 'ব্যর্থ হয়েছে';
        } finally {
          uploadBtn.disabled = false;
          uploadBtn.textContent = 'আপলোড ও স্ক্যান';
        }
      });
    }

    // 2. External Link Action
    const addLinkBtn = container.querySelector('#add-link-btn');
    const urlInput = container.querySelector('#new-ev-url');
    if (addLinkBtn && urlInput) {
      addLinkBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) {
          showAlert('অনুগ্রহ করে একটি বৈধ লিঙ্ক লিখুন।');
          return;
        }

        addLinkBtn.disabled = true;
        try {
          await evidenceService.addExternalLink(complaintId, {
            url,
            sourceType: 'news_or_social',
          });
          showAlert('অনলাইন লিঙ্ক সফলভাবে যুক্ত হয়েছে!', 'success');
          urlInput.value = '';
          await loadData();
        } catch (err) {
          showAlert(err.message || 'লিঙ্ক যুক্ত করতে ব্যর্থ হয়েছে।');
        } finally {
          addLinkBtn.disabled = false;
        }
      });
    }

    // 3. Withdrawal Modal
    const openWithdrawBtn = container.querySelector('#open-withdraw-modal');
    if (openWithdrawBtn) {
      openWithdrawBtn.addEventListener('click', () => {
        renderModal(`
          <div class="space-y-4">
            <h3 class="text-base font-bold text-white">অভিযোগ প্রত্যাহারের অনুরোধ</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              সতর্কতা: অভিযোগ প্রত্যাহারের অনুরোধ রিভিউ করার পর সিদ্ধান্ত নেওয়া হবে; এটি স্বয়ংক্রিয় স্থায়ী মুছে ফেলা নয়।
            </p>
            <div>
              <label class="block text-xs text-slate-300 mb-1">প্রত্যাহারের কারণ <span class="text-red-400">*</span></label>
              <textarea id="modal-withdraw-reason" rows="3" placeholder="কেন অভিযোগটি প্রত্যাহার করতে চান তা সংক্ষেপে লিখুন..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-red-500"></textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" id="modal-cancel-btn" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold">বাতিল</button>
              <button type="button" id="modal-withdraw-confirm" class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold">অনুরোধ জমা দিন</button>
            </div>
          </div>
        `);

        modalContainer.querySelector('#modal-withdraw-confirm').addEventListener('click', async () => {
          const reason = modalContainer.querySelector('#modal-withdraw-reason').value.trim();
          if (!reason) {
            alert('অনুগ্রহ করে প্রত্যাহারের কারণ লিখুন।');
            return;
          }
          closeModal();
          try {
            await complaintService.requestWithdrawal(complaintId, reason);
            showAlert('প্রত্যাহারের অনুরোধ সফলভাবে জমা হয়েছে।', 'success');
            await loadData();
          } catch (err) {
            showAlert(err.message || 'প্রত্যাহারের অনুরোধ ব্যর্থ হয়েছে।');
          }
        });
      });
    }

    // 4. Correction Modal
    const openCorrectBtn = container.querySelector('#open-correct-modal');
    if (openCorrectBtn) {
      openCorrectBtn.addEventListener('click', () => {
        const remaining = 3 - (complaint.correctionCount || 0);
        renderModal(`
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white">তথ্য সংশোধনের অনুরোধ</h3>
              <span class="text-xs bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full font-mono">বাকি সুযোগ: ${remaining}/৩</span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">
              অভিযোগ জমা দেওয়ার পর কোনো তথ্য অনিচ্ছাকৃত ভুল থাকলে সংশোধনের অনুরোধ করতে পারেন।
            </p>
            <div>
              <label class="block text-xs text-slate-300 mb-1">কী তথ্য সংশোধন করতে চান? <span class="text-red-400">*</span></label>
              <textarea id="modal-correct-changes" rows="3" placeholder="সঠিক তথ্য বিস্তারিত লিখুন..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"></textarea>
            </div>
            <div>
              <label class="block text-xs text-slate-300 mb-1">সংশোধনের কারণ <span class="text-red-400">*</span></label>
              <input type="text" id="modal-correct-reason" placeholder="উদাঃ টাইপিং ভুল, নতুন তথ্য পাওয়া গেছে" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500" />
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" id="modal-cancel-btn" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold">বাতিল</button>
              <button type="button" id="modal-correct-confirm" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold">সংশোধনী পাঠান</button>
            </div>
          </div>
        `);

        modalContainer.querySelector('#modal-correct-confirm').addEventListener('click', async () => {
          const changes = modalContainer.querySelector('#modal-correct-changes').value.trim();
          const reason = modalContainer.querySelector('#modal-correct-reason').value.trim();
          if (!changes || !reason) {
            alert('উভয় ক্ষেত্র পূরণ করা আবশ্যক।');
            return;
          }
          closeModal();
          try {
            await complaintService.requestCorrection(complaintId, changes, reason);
            showAlert('তথ্য সংশোধনের অনুরোধ সফলভাবে গৃহীত হয়েছে।', 'success');
            await loadData();
          } catch (err) {
            showAlert(err.message || 'সংশোধনী অনুরোধ ব্যর্থ হয়েছে।');
          }
        });
      });
    }

    // 5. Legal Update Modal
    const openLegalBtn = container.querySelector('#open-legal-modal');
    if (openLegalBtn) {
      openLegalBtn.addEventListener('click', () => {
        renderModal(`
          <div class="space-y-4">
            <h3 class="text-base font-bold text-white">আইনি বা প্রাতিষ্ঠানিক পদক্ষেপের তথ্য প্রদান</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              ঘটনার প্রেক্ষিতে কোনো জিডি, মামলা বা কোনো সরকারি দপ্তরে অভিযোগ করা হয়ে থাকলে সেই তথ্য দিন। মানবাধিকার টিম এটি যাচাই করবে।
            </p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-slate-300 mb-1">কর্তৃপক্ষের ধরন</label>
                <select id="modal-legal-type" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                  <option value="police">পুলিশ / থানা</option>
                  <option value="court">আদালত</option>
                  <option value="human_rights_commission">মানবাধিকার কমিশন</option>
                  <option value="administrative">প্রশাসনিক দপ্তর</option>
                  <option value="other">অন্যান্য</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-slate-300 mb-1">দপ্তর বা প্রতিষ্ঠানের নাম</label>
                <input type="text" id="modal-legal-name" placeholder="উদাঃ ধানমন্ডি থানা" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200" />
              </div>
            </div>
            <div>
              <label class="block text-xs text-slate-300 mb-1">গৃহীত পদক্ষেপ / দাবি <span class="text-red-400">*</span></label>
              <textarea id="modal-legal-claim" rows="2" placeholder="জিডি দায়ের হয়েছে / এফআইআর গ্রহণ করা হয়েছে..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200"></textarea>
            </div>
            <div>
              <label class="block text-xs text-slate-300 mb-1">মামলা নম্বর বা রেফারেন্স</label>
              <input type="text" id="modal-legal-ref" placeholder="জিডি নং ১২৩৪, মামলা নং ৫৬/২৪" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200" />
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" id="modal-cancel-btn" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold">বাতিল</button>
              <button type="button" id="modal-legal-confirm" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold">আপডেট জমা দিন</button>
            </div>
          </div>
        `);

        modalContainer.querySelector('#modal-legal-confirm').addEventListener('click', async () => {
          const type = modalContainer.querySelector('#modal-legal-type').value;
          const name = modalContainer.querySelector('#modal-legal-name').value.trim();
          const claim = modalContainer.querySelector('#modal-legal-claim').value.trim();
          const reference = modalContainer.querySelector('#modal-legal-ref').value.trim();
          if (!claim) {
            alert('গৃহীত পদক্ষেপের বিবরণ প্রদান করা আবশ্যক।');
            return;
          }
          closeModal();
          try {
            await complaintService.requestLegalUpdate(complaintId, { type, name, claim, reference });
            showAlert('আইনি পদক্ষেপের আপডেট সফলভাবে দাখিল হয়েছে। রিভিউ প্রক্রিয়ার পর হালনাগাদ হবে।', 'success');
            await loadData();
          } catch (err) {
            showAlert(err.message || 'আপডেট জমা দিতে ব্যর্থ হয়েছে।');
          }
        });
      });
    }
  }

  function renderModal(contentHtml) {
    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
          ${contentHtml}
        </div>
      </div>
    `;
    modalContainer.querySelector('#modal-cancel-btn')?.addEventListener('click', closeModal);
  }

  function closeModal() {
    modalContainer.innerHTML = '';
  }

  // Initial load
  await loadData();
}
