import { contentService } from '../../../services/content/contentService.js';

export async function renderAboutPage(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          আমাদের পরিচয়
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          জনস্বর (JonoShor) সম্পর্কে
        </h1>
        <p class="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          একটি স্বাধীন, নিরপেক্ষ নাগরিক অধিকার সংরক্ষণ ও মানবাধিকার ডকুমেন্টেশন প্ল্যাটফর্ম।
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div class="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
            🎯
          </div>
          <h2 class="text-xl font-bold text-white mb-2">আমাদের মূল উদ্দেশ্য</h2>
          <p class="text-slate-300 text-sm leading-relaxed" id="about-content">
            জনস্বর হলো মানবাধিকার লঙ্ঘন, নির্যাতন ও বৈষম্যের ঘটনা নিরাপদ ও দায়িত্বশীলভাবে নথিভুক্ত করার স্বাধীন নাগরিক প্ল্যাটফর্ম।
          </p>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div class="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800 text-blue-400 flex items-center justify-center font-bold text-lg mb-4">
            🕊️
          </div>
          <h2 class="text-xl font-bold text-white mb-2">আমাদের লক্ষ্য ও দর্শন</h2>
          <p class="text-slate-300 text-sm leading-relaxed" id="mission-content">
            সত্যের নির্ভরযোগ্য সংরক্ষণ, ক্ষতিগ্রস্তদের মর্যাদা রক্ষা এবং সমাজে ন্যায়বিচার ও স্বচ্ছতা নিশ্চিত করা।
          </p>
        </div>
      </div>

      <!-- Core Values -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 mb-12">
        <h2 class="text-xl font-bold text-white mb-6 text-center">আমাদের মূল স্তম্ভসমূহ</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div class="text-emerald-400 font-bold text-base mb-1">১. সম্পূর্ণ গোপনীয়তা</div>
            <p class="text-xs text-slate-400 leading-relaxed">অভিযোগকারীর নাম ও পরিচয় সর্বদা এনক্রিপ্ট রাখা হয়। অনুমোদন ব্যতীত পরিচয় কখনো প্রকাশ করা হয় না।</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div class="text-emerald-400 font-bold text-base mb-1">২. নিরপেক্ষ সত্যতা যাচাই</div>
            <p class="text-xs text-slate-400 leading-relaxed">প্রতিটি অভিযোগ ও প্রমাণ অভিজ্ঞ পর্যবেক্ষকদের দ্বারা দ্বিমুখী যাচাই ও পর্যালোচনা প্রক্রিয়ার মধ্য দিয়ে যায়।</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div class="text-emerald-400 font-bold text-base mb-1">৩. জনস্বার্থে উন্মুক্ত দলিল</div>
            <p class="text-xs text-slate-400 leading-relaxed">যাচাইকৃত রিপোর্টগুলো জনস্বার্থে ও আইনি জবাবদিহিতার জন্য প্রকাশ করা হয়, যা ভবিষ্যৎ প্রজন্মের অধিকারের স্মারক।</p>
          </div>
        </div>
      </div>

      <!-- FAQs Section -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h2 class="text-2xl font-bold text-white mb-6">সাধারণ জিজ্ঞাসাবলী (FAQs)</h2>
        <div id="faqs-list" class="space-y-4">
          <div class="text-center py-6 text-slate-500">প্রশ্নোত্তর লোড হচ্ছে...</div>
        </div>
      </div>
    </div>
  `;

  // Fetch dynamic content from CMS
  try {
    const [aboutData, missionData, faqs] = await Promise.all([
      contentService.getContent('about'),
      contentService.getContent('mission'),
      contentService.getFaqs(),
    ]);

    if (aboutData?.bn?.content) {
      const el = container.querySelector('#about-content');
      if (el) el.textContent = aboutData.bn.content;
    }
    if (missionData?.bn?.content) {
      const el = container.querySelector('#mission-content');
      if (el) el.textContent = missionData.bn.content;
    }

    const faqsContainer = container.querySelector('#faqs-list');
    if (faqsContainer && Array.isArray(faqs) && faqs.length > 0) {
      faqsContainer.innerHTML = faqs
        .map(
          (faq) => `
          <details class="group bg-slate-950/60 border border-slate-800 rounded-xl p-4 transition">
            <summary class="font-semibold text-white cursor-pointer list-none flex items-center justify-between text-sm">
              <span>${faq.bn?.question || faq.question}</span>
              <span class="text-slate-400 transition group-open:rotate-180">▾</span>
            </summary>
            <p class="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
              ${faq.bn?.answer || faq.answer}
            </p>
          </details>
        `
        )
        .join('');
    } else if (faqsContainer) {
      faqsContainer.innerHTML = `
        <details class="group bg-slate-950/60 border border-slate-800 rounded-xl p-4 transition">
          <summary class="font-semibold text-white cursor-pointer list-none flex items-center justify-between text-sm">
            <span>জনস্বরে অভিযোগ জানাতে কি অ্যাকাউন্ট থাকা বাধ্যতামূলক?</span>
            <span class="text-slate-400 transition group-open:rotate-180">▾</span>
          </summary>
          <p class="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
            না, অ্যাকাউন্ট ছাড়াই যেকোনো নাগরিক সর্বোচ্চ ৫টি পর্যন্ত অভিযোগ দাখিল করতে পারেন। ৫টির বেশি অভিযোগ এবং আইনি আপডেট ট্র্যাক করতে একটি নিরাপদ অ্যাকাউন্ট প্রয়োজন।
          </p>
        </details>
        <details class="group bg-slate-950/60 border border-slate-800 rounded-xl p-4 transition">
          <summary class="font-semibold text-white cursor-pointer list-none flex items-center justify-between text-sm">
            <span>আমার ব্যক্তিগত পরিচয় কি প্রকাশ করা হবে?</span>
            <span class="text-slate-400 transition group-open:rotate-180">▾</span>
          </summary>
          <p class="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
            কখনোই নয়। অভিযোগকারীর পরিচয় সর্বদা ডিফল্টভাবে সম্পূর্ণ গোপন (Private) রাখা হয় এবং কোনো পাবলিক রিপোর্টে অভিযোগকারীর তথ্য প্রকাশিত হয় না।
          </p>
        </details>
      `;
    }
  } catch {
    // Graceful fallback to default markup
  }
}
