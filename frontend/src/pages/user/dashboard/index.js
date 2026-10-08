import { complaintService } from '../../../services/complaints/complaintService.js';
import { authService } from '../../../services/auth/authService.js';
import { STATUS_LABELS } from '../../../config/constants.js';
import { renderUserNav } from '../../../components/user/UserNav.js';
import { t, isBangla, translateCategory, translateComplaintStatus, formatNumber } from '../../../i18n/index.js';

export async function renderUserDashboardPage(container) {
  const user = authService.getCurrentUser();
  const isBn = isBangla();

  if (!user) {
    window.location.hash = '#/login';
    return;
  }

  container.innerHTML = `
    ${renderUserNav('dashboard')}
    <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">${t('user.dashboard_title')}</h1>
          <p class="text-slate-600 text-sm mt-1">${t('user.welcome')}, ${user.fullName || (isBn ? 'নাগরিক' : 'User')} (${user.email})</p>
        </div>
        <a href="#/complaint/new" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-sm flex items-center gap-2 self-start sm:self-auto">
          <span>${t('user.file_complaint_btn')}</span>
        </a>
      </div>

      <div id="dashboard-alert" role="alert" class="hidden mb-6 p-4 rounded-xl text-sm" aria-live="polite"></div>

      <!-- Complaints List Section -->
      <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div class="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900">${t('user.my_complaints')}</h2>
          <span class="text-xs text-slate-500 font-mono" id="complaints-count">${t('common.loading')}</span>
        </div>

        <div id="complaints-list" class="divide-y divide-slate-200">
          <div class="p-12 text-center text-slate-500">${t('common.loading')}</div>
        </div>
      </div>
    </div>

    <!-- Modals Container -->
    <div id="dashboard-modal-container"></div>
  `;

  const listEl = container.querySelector('#complaints-list');
  const countEl = container.querySelector('#complaints-count');
  const alertEl = container.querySelector('#dashboard-alert');
  const modalContainer = container.querySelector('#dashboard-modal-container');

  function showAlert(msg, type = 'error') {
    alertEl.textContent = msg;
    if (type === 'success') {
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-emerald-50 border border-emerald-300 text-emerald-800';
    } else {
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-300 text-red-800';
    }
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderModal(contentHtml) {
    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in" role="dialog" aria-modal="true">
        <div class="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl relative">
          ${contentHtml}
        </div>
      </div>
    `;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { once: true });
    modalContainer.querySelector('#modal-cancel-btn')?.addEventListener('click', closeModal);
  }

  function closeModal() {
    modalContainer.innerHTML = '';
  }

  async function loadComplaints() {
    try {
      const res = await complaintService.getMyComplaints();
      const complaints = res.data || [];
      const total = res.meta?.total || complaints.length;

      countEl.textContent = isBn ? `মোট: ${formatNumber(total)}টি অভিযোগ` : `Total: ${total} complaints`;

      if (complaints.length === 0) {
        listEl.innerHTML = `
          <div class="p-16 text-center">
            <div class="text-4xl mb-3" aria-hidden="true">📝</div>
            <h3 class="text-base font-semibold text-slate-900 mb-1">${t('user.no_complaints_title')}</h3>
            <p class="text-slate-600 text-sm mb-6">${t('user.no_complaints_desc')}</p>
            <a href="#/complaint/new" class="inline-flex px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm">
              ${t('user.file_complaint_btn')}
            </a>
          </div>
        `;
        return;
      }

      const localeCode = isBn ? 'bn-BD' : 'en-US';

      listEl.innerHTML = complaints
        .map((comp) => {
          const statusConfig = STATUS_LABELS[comp.status] || {
            en: comp.status,
            bn: comp.status,
            color: 'bg-slate-100 text-slate-700 border-slate-300',
          };
          const isDraft = comp.status === 'draft';
          const statusText = translateComplaintStatus(comp.status) || (isBn ? statusConfig.bn : statusConfig.en) || comp.status;
          const categoryName = translateCategory(comp.category?.primary);

          return `
          <div class="p-6 hover:bg-slate-50 transition">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig.color}">
                  ${statusText}
                </span>
                <span class="text-xs text-slate-500 font-mono">ID: ${comp._id}</span>
              </div>
              <span class="text-xs text-slate-500">
                ${isDraft ? (isBn ? 'সংরক্ষিত: ' : 'Saved on: ') : (isBn ? 'দাখিলকৃত: ' : 'Filed on: ')} ${new Date(comp.createdAt).toLocaleDateString(localeCode)}
              </span>
            </div>

            <h3 class="text-base font-bold text-slate-900 mb-2 leading-snug">
              <a href="#/user/complaints/${comp._id}" class="hover:text-emerald-700 transition">
                ${categoryName || (isBn ? 'অভিযোগ' : 'Complaint')} — ${comp.location?.districtId || (isBn ? 'বাংলাদেশ' : 'Bangladesh')}
              </a>
            </h3>

            <p class="text-slate-600 text-sm mb-4 line-clamp-2">
              ${comp.incident?.description || ''}
            </p>

            <div class="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
              <div class="text-slate-500">
                ${
                  isDraft
                    ? `<span class="text-amber-700 font-medium">${isBn ? 'খসড়া সংরক্ষিত — এখনো দাখিল করা হয়নি' : 'Draft saved — not yet submitted'}</span>`
                    : (isBn ? `সংশোধন বাকি: <span class="font-semibold text-slate-800">${formatNumber(3 - (comp.correctionCount || 0))} / ৩</span>` : `Corrections remaining: <span class="font-semibold text-slate-800">${3 - (comp.correctionCount || 0)} / 3</span>`)
                }
              </div>

              <div class="flex items-center gap-2">
                ${
                  isDraft
                    ? `
                  <a href="#/complaint/new?draftId=${comp._id}" class="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium transition shadow-xs">
                    ✏️ ${isBn ? 'সম্পাদনা ও দাখিল করুন' : 'Edit & Submit Draft'}
                  </a>
                `
                    : `
                  ${
                    !comp.withdrawal?.requested && comp.status !== 'withdrawn' && comp.status !== 'closed'
                      ? `
                    <button data-withdraw-id="${comp._id}" class="withdraw-btn px-3 py-1.5 rounded bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 hover:border-red-300 transition">
                      ${isBn ? 'প্রত্যাহারের আবেদন' : 'Request Withdrawal'}
                    </button>
                  `
                      : `<span class="text-slate-400 italic text-[11px]">${isBn ? 'প্রত্যাহারের আবেদন বিবেচনাধীন' : 'Withdrawal pending review'}</span>`
                  }
                  ${
                    (comp.correctionCount || 0) < 3
                      ? `
                    <button data-correct-id="${comp._id}" data-remain="${3 - (comp.correctionCount || 0)}" class="correct-btn px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition">
                      ${isBn ? 'সংশোধনের আবেদন' : 'Request Correction'}
                    </button>
                  `
                      : ''
                  }
                `
                }
                <a href="#/user/complaints/${comp._id}" class="px-3 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium border border-emerald-200 transition">
                  ${t('common.view_details')} →
                </a>
              </div>
            </div>
          </div>
        `;
        })
        .join('');

      // Attach withdrawal listeners (Proper UI modal)
      listEl.querySelectorAll('.withdraw-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-withdraw-id');
          renderModal(`
            <div class="space-y-4">
              <h3 id="modal-title" class="text-base font-bold text-slate-900">${isBn ? 'অভিযোগ প্রত্যাহারের আবেদন' : 'Request Complaint Withdrawal'}</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                ${isBn ? 'সতর্কতা: প্রত্যাহারের আবেদন তদন্তকারী কর্মকর্তাদের দ্বারা পর্যালোচিত হবে; তদন্তের বিশুদ্ধতা রক্ষার্থে তাৎক্ষণিক মুছে ফেলা হয় না।' : 'Notice: Withdrawal requests are reviewed by case administrators; records are not instantly deleted to preserve investigation integrity.'}
              </p>
              <div>
                <label for="modal-withdraw-reason" class="block text-xs font-medium text-slate-700 mb-1">${isBn ? 'প্রত্যাহারের কারণ' : 'Reason for Withdrawal'} <span class="text-red-500">*</span></label>
                <textarea id="modal-withdraw-reason" rows="3" placeholder="${isBn ? 'প্রত্যাহারের সুনির্দিষ্ট কারণ লিখুন...' : 'Provide reasons for withdrawing this complaint...'}" class="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"></textarea>
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <button type="button" id="modal-cancel-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">${t('common.cancel')}</button>
                <button type="button" id="modal-withdraw-confirm" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs">${isBn ? 'আবেদন জমা দিন' : 'Submit Request'}</button>
              </div>
            </div>
          `);

          modalContainer.querySelector('#modal-withdraw-confirm').addEventListener('click', async () => {
            const reason = modalContainer.querySelector('#modal-withdraw-reason').value.trim();
            if (!reason) {
              alert(isBn ? 'অনুগ্রহ করে প্রত্যাহারের কারণ লিখুন।' : 'Please specify a reason for withdrawal.');
              return;
            }
            closeModal();
            try {
              await complaintService.requestWithdrawal(id, reason);
              showAlert(isBn ? 'প্রত্যাহারের আবেদন সফলভাবে জমা হয়েছে।' : 'Withdrawal request submitted successfully.', 'success');
              await loadComplaints();
            } catch (err) {
              showAlert(err.message || (isBn ? 'প্রত্যাহারের আবেদন ব্যর্থ হয়েছে।' : 'Failed to submit withdrawal request.'));
            }
          });
        });
      });

      // Attach correction listeners (Proper UI modal)
      listEl.querySelectorAll('.correct-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-correct-id');
          const remain = btn.getAttribute('data-remain');

          renderModal(`
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 id="modal-title" class="text-base font-bold text-slate-900">${isBn ? 'অভিযোগ সংশোধনের আবেদন' : 'Request Complaint Correction'}</h3>
                <span class="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-mono">${isBn ? `বাকি: ${formatNumber(remain)}/৩` : `Remaining: ${remain}/3`}</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                ${isBn ? 'দাখিলকৃত কোনো তথ্যে ভুল থাকলে পর্যালোচনার জন্য সংশোধনী জমা দিন।' : 'If any submitted details contain factual errors, submit a request for review.'}
              </p>
              <div>
                <label for="modal-correct-changes" class="block text-xs font-medium text-slate-700 mb-1">${isBn ? 'প্রয়োজনীয় সংশোধন' : 'Requested Corrections'} <span class="text-red-500">*</span></label>
                <textarea id="modal-correct-changes" rows="3" placeholder="${isBn ? 'কী কী সংশোধন প্রয়োজন তা বিস্তারিত লিখুন...' : 'Describe the corrections needed...'}" class="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"></textarea>
              </div>
              <div>
                <label for="modal-correct-reason" class="block text-xs font-medium text-slate-700 mb-1">${isBn ? 'সংশোধনের কারণ' : 'Reason for Correction'} <span class="text-red-500">*</span></label>
                <input type="text" id="modal-correct-reason" placeholder="${isBn ? 'যেমন: টাইপিং ভুল, তারিখের অমিল' : 'e.g. Typographical error, date correction'}" class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <button type="button" id="modal-cancel-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">${t('common.cancel')}</button>
                <button type="button" id="modal-correct-confirm" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs">${isBn ? 'সংশোধন জমা দিন' : 'Submit Correction'}</button>
              </div>
            </div>
          `);

          modalContainer.querySelector('#modal-correct-confirm').addEventListener('click', async () => {
            const changes = modalContainer.querySelector('#modal-correct-changes').value.trim();
            const reason = modalContainer.querySelector('#modal-correct-reason').value.trim();
            if (!changes || !reason) {
              alert(isBn ? 'উভয় ঘর পূরণ করা আবশ্যক।' : 'Both fields are required.');
              return;
            }
            closeModal();
            try {
              await complaintService.requestCorrection(id, changes, reason);
              showAlert(isBn ? 'সংশোধনের আবেদন সফলভাবে জমা হয়েছে (সর্বোচ্চ ৩ বার সুযোগ)।' : 'Correction request submitted successfully (up to 3 requests allowed).', 'success');
              await loadComplaints();
            } catch (err) {
              showAlert(err.message || (isBn ? 'সংশোধনের আবেদন ব্যর্থ হয়েছে।' : 'Failed to submit correction request.'));
            }
          });
        });
      });
    } catch (err) {
      listEl.innerHTML = `<div class="p-8 text-center text-red-600">${t('common.error')}: ${err.message}</div>`;
    }
  }

  await loadComplaints();
}
