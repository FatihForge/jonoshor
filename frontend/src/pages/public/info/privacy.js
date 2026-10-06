import { contentService } from '../../../services/content/contentService.js';

export async function renderPrivacyPage(container) {
  const hash = window.location.hash;
  let activeTab = 'privacy';
  if (hash.includes('safety')) activeTab = 'safety';
  else if (hash.includes('terms')) activeTab = 'terms';

  container.innerHTML = `
    <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          প্ল্যাটফর্ম নিরাপত্তা ও মূলনীতি
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          গোপনীয়তা, সুরক্ষা ও ব্যবহারের নীতি
        </h1>
        <p class="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
          জনস্বরে আপনার নিরাপত্তা ও গোপনীয়তা প্রযুক্তিগতভাবে সুরক্ষিত।
        </p>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center justify-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl max-w-md mx-auto mb-10">
        <a href="#/privacy" class="flex-1 py-2 text-center text-xs sm:text-sm font-semibold rounded-lg transition ${
          activeTab === 'privacy'
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-slate-400 hover:text-white'
        }">
          গোপনীয়তা নীতি
        </a>
        <a href="#/safety" class="flex-1 py-2 text-center text-xs sm:text-sm font-semibold rounded-lg transition ${
          activeTab === 'safety'
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-slate-400 hover:text-white'
        }">
          সুরক্ষা নির্দেশিকা
        </a>
        <a href="#/terms" class="flex-1 py-2 text-center text-xs sm:text-sm font-semibold rounded-lg transition ${
          activeTab === 'terms'
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-slate-400 hover:text-white'
        }">
          ব্যবহারের শর্তাবলী
        </a>
      </div>

      <!-- Content Area -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl leading-relaxed text-slate-300 text-sm space-y-6">
        <div id="policy-content">
          <div class="text-center py-8 text-slate-500">নীতিমালা লোড হচ্ছে...</div>
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
        <h2 class="text-xl font-bold text-white mb-4">গোপনীয়তা নীতি (Privacy Policy)</h2>
        <p class="mb-4">
          ${data?.bn?.content || 'জনস্বর আপনার পরিচয় ও ব্যক্তিগত তথ্যের সর্বোচ্চ সুরক্ষা নিশ্চিতে অঙ্গীকারবদ্ধ।'}
        </p>
        <div class="space-y-4 border-t border-slate-800 pt-4">
          <h3 class="text-base font-semibold text-white">১. পরিচয় সুরক্ষা ও অ্যাক্সেস নিয়ন্ত্রণ</h3>
          <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
            অভিযোগকারীর নাম, ইমেইল ও মোবাইল নম্বর ডিফল্টভাবে সম্পূর্ণ গোপন (Private) রাখা হয়। ডাটাবেজে এই তথ্যগুলো কঠোরভাবে সীমাবদ্ধ এবং সাধারণ দর্শনার্থীদের কাছে কখনোই প্রদর্শিত হয় না।
          </p>

          <h3 class="text-base font-semibold text-white">২. জিরো-ট্র্যাকিং নীতি (Zero Tracking)</h3>
          <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
            জনস্বরের উন্মুক্ত পাবলিক রিপোর্ট পরিদর্শনের সময় কোনো বাণিজ্যিক ট্র্যাকার, ফেসবুক পিক্সেল বা ব্যবহারকারীর আচরণ পর্যবেক্ষক কুকি ব্যবহার করা হয় না।
          </p>

          <h3 class="text-base font-semibold text-white">৩. ক্রিপ্টোগ্রাফিক সুরক্ষা</h3>
          <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
            ব্যবহারকারীর সকল পাসওয়ার্ড আধুনিক Argon2id অ্যালগরিদম দ্বারা সুরক্ষিত। সেশন টোকেন নিরাপদ HttpOnly কুকিতে সংরক্ষিত থাকে যাতে XSS আক্রমণ প্রতিহত হয়।
          </p>
        </div>
      `;
    } else if (activeTab === 'safety') {
      contentEl.innerHTML = `
        <h2 class="text-xl font-bold text-white mb-4">সুরক্ষা ও নিরাপত্তা নির্দেশিকা (Safety Guidelines)</h2>
        <p class="mb-4">
          ${data?.bn?.content || 'অভিযোগকারীর সুরক্ষা আমাদের প্রধান অগ্রাধিকার।'}
        </p>
        <div class="space-y-4 border-t border-slate-800 pt-4">
          <h3 class="text-base font-semibold text-white">১. সংবেদনশীল প্রমাণের ক্লাউড স্যানিটাইজেশন</h3>
          <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
            আপলোডকৃত সকল প্রমাণপত্র প্রথমে কোয়ারেন্টাইন প্রক্রিয়ায় জমা হয় এবং ক্ষতিকর উপাদান মুক্ত হওয়ার পরই অভ্যন্তরীণ অনুসন্ধানে অনুমোদিত হয়।
          </p>

          <h3 class="text-base font-semibold text-white">২. অপ্রাপ্তবয়স্ক ও ভিকটিম সুরক্ষা</h3>
          <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
            যেকোনো পাবলিক রিপোর্টে অপ্রাপ্তবয়স্ক (Minors) এবং নির্যাতনের শিকার ব্যক্তিদের চেহারা বা চিহ্নিতকারী তথ্য স্বয়ংক্রিয়ভাবে ঝাপসা বা বাদ রাখা হয়।
          </p>
        </div>
      `;
    } else {
      contentEl.innerHTML = `
        <h2 class="text-xl font-bold text-white mb-4">ব্যবহারের শর্তাবলী (Terms of Service)</h2>
        <p class="mb-4">
          ${data?.bn?.content || 'জনস্বর ব্যবহারের শর্তাবলী ও দায়িত্বশীল তথ্য প্রকাশের অঙ্গীকার।'}
        </p>
        <div class="space-y-4 border-t border-slate-800 pt-4">
          <h3 class="text-base font-semibold text-white">১. সত্য ও বস্তুনিষ্ঠ তথ্য প্রদান</h3>
          <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
            প্ল্যাটফর্মটিতে যেকোনো অভিযোগ দাখিলের ক্ষেত্রে উদ্দেশ্যপ্রণোদিত মিথ্যা, বিভ্রান্তিকর বা হয়রানিমূলক তথ্য প্রদান নিষিদ্ধ।
          </p>

          <h3 class="text-base font-semibold text-white">২. সংশোধন ও প্রত্যাহার অধিকার</h3>
          <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
            অভিযোগকারী আইনি প্রক্রিয়া চলাকালীন যেকোনো অসঙ্গতি থাকলে ৩ বার সংশোধনের আবেদন করতে পারেন এবং উপযুক্ত কারণ দর্শিয়ে প্রত্যাহার চাইতে পারেন।
          </p>
        </div>
      `;
    }
  } catch {
    // Keep baseline fallback
  }
}
