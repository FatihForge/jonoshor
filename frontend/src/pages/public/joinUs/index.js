import { apiRequest } from '../../../services/api/apiClient.js';

export function renderJoinUsPage(container) {
  container.innerHTML = `
    <div class="max-w-2xl mx-auto py-8">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-extrabold text-white mb-2">জনস্বর টিমে যুক্ত হোন</h1>
        <p class="text-slate-400 text-sm max-w-lg mx-auto">
          আইনি সহায়তা, মানবাধিকার যাচাই, অনুবাদ বা গবেষণায় আপনার পেশাগত দক্ষতা দিয়ে ন্যায়বিচার প্রতিষ্ঠায় ভূমিকা রাখুন।
        </p>
      </div>

      <div id="join-alert" class="hidden mb-6 p-4 rounded-xl text-sm"></div>

      <form id="join-form" class="space-y-6 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl">
        <div>
          <label class="block text-sm font-medium text-slate-200 mb-2">পূর্ণ নাম <span class="text-red-400">*</span></label>
          <input type="text" id="join-name" required placeholder="আপনার পূর্ণ নাম" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-200 mb-2">ইমেইল ঠিকানা <span class="text-red-400">*</span></label>
            <input type="email" id="join-email" required placeholder="example@domain.com" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-200 mb-2">মোবাইল নম্বর <span class="text-red-400">*</span></label>
            <input type="tel" id="join-mobile" required placeholder="017XXXXXXXX" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-200 mb-2">প্রধান পেশা <span class="text-red-400">*</span></label>
            <select id="join-profession" required class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
              <option value="">পেশা নির্বাচন করুন</option>
              <option value="আইনজীবী / আইন গবেষক">আইনজীবী / আইন গবেষক</option>
              <option value="মানবাধিকার কর্মী">মানবাধিকার কর্মী</option>
              <option value="সাংবাদিক / অনুসন্ধানী প্রতিবেদক">সাংবাদিক / অনুসন্ধানী প্রতিবেদক</option>
              <option value="চিকিৎসক / মনোবিজ্ঞানী">চিকিৎসক / মনোবিজ্ঞানী</option>
              <option value="সফটওয়্যার প্রকৌশলী / আইটি বিশেষজ্ঞ">সফটওয়্যার প্রকৌশলী / আইটি বিশেষজ্ঞ</option>
              <option value="অনুবাদক (বাংলা ও ইংরেজি)">অনুবাদক (বাংলা ও ইংরেজি)</option>
              <option value="বিশ্ববিদ্যালয় শিক্ষার্থী / গবেষক">বিশ্ববিদ্যালয় শিক্ষার্থী / গবেষক</option>
              <option value="অন্যান্য">অন্যান্য</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-200 mb-2">যে ভূমিকায় অবদান রাখতে চান <span class="text-red-400">*</span></label>
            <select id="join-role" required class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
              <option value="">ভূমিকা নির্বাচন করুন</option>
              <option value="সরেজমিন অভিযোগ যাচাই ও অনুসন্ধান">সরেজমিন অভিযোগ যাচাই ও অনুসন্ধান</option>
              <option value="আইনি পরামর্শ ও ড্রাফটিং সহায়তা">আইনি পরামর্শ ও ড্রাফটিং সহায়তা</option>
              <option value="রিপোর্ট অনুবাদ ও সম্পাদনা">রিপোর্ট অনুবাদ ও সম্পাদনা</option>
              <option value="ভিকটিম সাপোর্ট ও কাউন্সেলিং">ভিকটিম সাপোর্ট ও কাউন্সেলিং</option>
              <option value="সাইবার নিরাপত্তা ও প্ল্যাটফর্ম সাপোর্ট">সাইবার নিরাপত্তা ও প্ল্যাটফর্ম সাপোর্ট</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-200 mb-2">আপনার অভিজ্ঞতা ও আগ্রহের বিবরণ <span class="text-red-400">*</span></label>
          <textarea id="join-details" required rows="4" placeholder="আপনার পেশাগত অভিজ্ঞতা এবং কীভাবে জনস্বরে যুক্ত হতে চান সংক্ষেপে লিখুন..." class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"></textarea>
        </div>

        <div>
          <button type="submit" id="join-submit-btn" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-950/40 transition">
            আবেদন জমা দিন
          </button>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector('#join-form');
  const alertEl = container.querySelector('#join-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#join-submit-btn');
    btn.disabled = true;
    btn.textContent = 'জমা হচ্ছে...';
    alertEl.className = 'hidden';

    try {
      const res = await apiRequest('/public/join-us', {
        method: 'POST',
        body: {
          fullName: container.querySelector('#join-name').value,
          email: container.querySelector('#join-email').value,
          primaryProfession: container.querySelector('#join-profession').value,
          primaryContributionRole: container.querySelector('#join-role').value,
          contributionDetails: container.querySelector('#join-details').value,
          contactInformation: {
            mobile: container.querySelector('#join-mobile').value,
          },
        },
      });

      alertEl.textContent = res.data?.message || 'আপনার আবেদন সফলভাবে গৃহীত হয়েছে!';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-emerald-950/80 border border-emerald-800 text-emerald-300';
      form.reset();
    } catch (err) {
      alertEl.textContent = err.message || 'আবেদন জমা দিতে ব্যর্থ হয়েছে।';
      alertEl.className = 'mb-6 p-4 rounded-xl text-sm bg-red-950/80 border border-red-800 text-red-300';
    } finally {
      btn.disabled = false;
      btn.textContent = 'আবেদন জমা দিন';
    }
  });
}
