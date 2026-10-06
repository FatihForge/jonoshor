import { complaintService } from '../../../services/complaints/complaintService.js';
import { authService } from '../../../services/auth/authService.js';
import { STATUS_LABELS } from '../../../config/constants.js';
import { renderUserNav } from '../../../components/user/UserNav.js';

export async function renderUserDashboardPage(container) {
  const user = authService.getCurrentUser();
  if (!user) {
    window.location.hash = '#/login';
    return;
  }

  container.innerHTML = `
    ${renderUserNav('dashboard')}
    <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-white">আমার ড্যাশবোর্ড</h1>
          <p class="text-slate-400 text-sm mt-1">স্বাগতম, ${user.fullName} (${user.email})</p>
        </div>
        <a href="#/complaint/new" class="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-sm transition shadow-lg flex items-center gap-2 self-start sm:self-auto">
          <span>+ নতুন অভিযোগ জমা দিন</span>
        </a>
      </div>

      <div id="dashboard-alert" class="hidden mb-6 p-4 rounded-xl text-sm"></div>

      <!-- Complaints List Section -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 class="text-lg font-bold text-white">আমার জমাকৃত অভিযোগসমূহ</h2>
          <span class="text-xs text-slate-400 font-mono" id="complaints-count">লোড হচ্ছে...</span>
        </div>

        <div id="complaints-list" class="divide-y divide-slate-800">
          <div class="p-12 text-center text-slate-500">অভিযোগসমূহ লোড হচ্ছে...</div>
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
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-emerald-950/80 border border-emerald-800 text-emerald-300';
    } else {
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300';
    }
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

  async function loadComplaints() {
    try {
      const res = await complaintService.getMyComplaints();
      const complaints = res.data || [];
      const total = res.meta?.total || complaints.length;

      countEl.textContent = `মোট ${total} টি অভিযোগ`;

      if (complaints.length === 0) {
        listEl.innerHTML = `
          <div class="p-16 text-center">
            <div class="text-4xl mb-3">📝</div>
            <h3 class="text-base font-semibold text-white mb-1">কোনো অভিযোগ জমা দেওয়া হয়নি</h3>
            <p class="text-slate-400 text-sm mb-6">আপনার কোনো অভিযোগ থাকলে তা নিরাপদে জানাতে পারেন।</p>
            <a href="#/complaint/new" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium">
              অভিযোগ দাখিল করুন
            </a>
          </div>
        `;
        return;
      }

      listEl.innerHTML = complaints
        .map((comp) => {
          const statusConfig = STATUS_LABELS[comp.status] || {
            bn: comp.status,
            color: 'bg-slate-800 text-slate-300 border-slate-700',
          };
          const isDraft = comp.status === 'draft';

          return `
          <div class="p-6 hover:bg-slate-850/40 transition">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig.color}">
                  ${statusConfig.bn}
                </span>
                <span class="text-xs text-slate-400 font-mono">আইডি: ${comp._id}</span>
              </div>
              <span class="text-xs text-slate-400">
                ${isDraft ? 'সংরক্ষণের তারিখ: ' : 'জমাদানের তারিখ: '} ${new Date(comp.createdAt).toLocaleDateString('bn-BD')}
              </span>
            </div>

            <h3 class="text-base font-bold text-white mb-2 leading-snug">
              <a href="#/user/complaints/${comp._id}" class="hover:text-emerald-400 transition">
                ${comp.category?.primary || 'অভিযোগ'} — ${comp.location?.districtId || 'বাংলাদেশ'}
              </a>
            </h3>

            <p class="text-slate-400 text-sm mb-4 line-clamp-2">
              ${comp.incident?.description || ''}
            </p>

            <div class="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs">
              <div class="text-slate-400">
                ${
                  isDraft
                    ? '<span class="text-amber-400 font-medium">খসড়া সংরক্ষিত — এখনও দাখিল করা হয়নি</span>'
                    : `সংশোধনী সুযোগ বাকি: <span class="font-semibold text-slate-200">${3 - (comp.correctionCount || 0)} / ৩</span>`
                }
              </div>

              <div class="flex items-center gap-2">
                ${
                  isDraft
                    ? `
                  <a href="#/complaint/new?draftId=${comp._id}" class="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition">
                    ✏️ খসড়া সম্পাদন ও দাখিল
                  </a>
                `
                    : `
                  ${
                    !comp.withdrawal?.requested && comp.status !== 'withdrawn' && comp.status !== 'closed'
                      ? `
                    <button data-withdraw-id="${comp._id}" class="withdraw-btn px-3 py-1.5 rounded bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800 transition">
                      প্রত্যাহার অনুরোধ
                    </button>
                  `
                      : '<span class="text-slate-500 italic text-[11px]">প্রত্যাহার প্রক্রিয়াধীন</span>'
                  }
                  ${
                    (comp.correctionCount || 0) < 3
                      ? `
                    <button data-correct-id="${comp._id}" data-remain="${3 - (comp.correctionCount || 0)}" class="correct-btn px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition">
                      সংশোধনী পাঠান
                    </button>
                  `
                      : ''
                  }
                `
                }
                <a href="#/user/complaints/${comp._id}" class="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium border border-slate-700 transition">
                  বিস্তারিত দেখুন →
                </a>
              </div>
            </div>
          </div>
        `;
        })
        .join('');

      // Attach withdrawal listeners (Proper UI modal instead of prompt)
      listEl.querySelectorAll('.withdraw-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-withdraw-id');
          renderModal(`
            <div class="space-y-4">
              <h3 class="text-base font-bold text-white">অভিযোগ প্রত্যাহারের অনুরোধ</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                সতর্কতা: অভিযোগ প্রত্যাহারের অনুরোধ পর্যালোচনার পর সিদ্ধান্ত নেওয়া হবে; এটি সরাসরি স্থায়ী মুছে ফেলা নয়।
              </p>
              <div>
                <label class="block text-xs text-slate-300 mb-1">প্রত্যাহারের কারণ <span class="text-red-400">*</span></label>
                <textarea id="modal-withdraw-reason" rows="3" placeholder="কেন অভিযোগটি প্রত্যাহার করতে চান লিখুন..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-red-500"></textarea>
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
              await complaintService.requestWithdrawal(id, reason);
              showAlert('অভিযোগ প্রত্যাহারের অনুরোধ সফলভাবে গৃহীত হয়েছে।', 'success');
              await loadComplaints();
            } catch (err) {
              showAlert(err.message || 'প্রত্যাহারের অনুরোধ ব্যর্থ হয়েছে।');
            }
          });
        });
      });

      // Attach correction listeners (Proper UI modal instead of prompt)
      listEl.querySelectorAll('.correct-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-correct-id');
          const remain = btn.getAttribute('data-remain');

          renderModal(`
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-bold text-white">তথ্য সংশোধনের অনুরোধ</h3>
                <span class="text-xs bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full font-mono">বাকি সুযোগ: ${remain}/৩</span>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">
                জমাকৃত তথ্যে কোনো ভুল থাকলে সংশোধনের জন্য অনুরোধ করুন।
              </p>
              <div>
                <label class="block text-xs text-slate-300 mb-1">কী তথ্য সংশোধন করতে চান? <span class="text-red-400">*</span></label>
                <textarea id="modal-correct-changes" rows="3" placeholder="সংশোধিত তথ্য লিখুন..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"></textarea>
              </div>
              <div>
                <label class="block text-xs text-slate-300 mb-1">সংশোধনের কারণ <span class="text-red-400">*</span></label>
                <input type="text" id="modal-correct-reason" placeholder="উদাঃ টাইপিং ভুল, তারিখ সংশোধন" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500" />
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
              await complaintService.requestCorrection(id, changes, reason);
              showAlert('সংশোধনী অনুরোধ সফলভাবে জমা হয়েছে (সর্বোচ্চ ৩ টির মধ্যে গৃহীত)।', 'success');
              await loadComplaints();
            } catch (err) {
              showAlert(err.message || 'সংশোধনী অনুরোধ ব্যর্থ হয়েছে।');
            }
          });
        });
      });
    } catch (err) {
      listEl.innerHTML = `<div class="p-8 text-center text-red-400">তথ্য লোড করতে ব্যর্থ হয়েছে: ${err.message}</div>`;
    }
  }

  await loadComplaints();
}
