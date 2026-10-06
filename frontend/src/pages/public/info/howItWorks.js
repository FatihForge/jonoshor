import { contentService } from '../../../services/content/contentService.js';

export async function renderHowItWorksPage(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          কার্যপদ্ধতি ও ধাপসমূহ
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          জনস্বর কীভাবে কাজ করে
        </h1>
        <p class="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed" id="how-it-works-subtitle">
          অভিযোগ দাখিল → স্ক্রিনিং ও গোপনীয়তা নিশ্চিতকরণ → পেশাদার প্রমাণ যাচাই → আইনি ট্র্যাকিং → জনস্বার্থে নিরাপদ প্রকাশনা।
        </p>
      </div>

      <!-- Step by Step Timeline -->
      <div class="space-y-6 mb-12">
        <!-- Step 1 -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div class="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0">
            ১
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-white mb-2">অভিযোগ দাখিল (Submission)</h3>
            <p class="text-sm text-slate-300 leading-relaxed mb-3">
              অ্যাকাউন্ট খুলে অথবা সরাসরি নন-ইউজার হিসেবে ঘটনার তারিখ, স্থান (বিভাগ, জেলা, উপজেলা), ক্যাটাগরি এবং বিস্তারিত বিবরণ প্রদান করে অভিযোগ জমা দেওয়া যায়।
            </p>
            <div class="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-900/60">
              🔒 সুরক্ষা: রেট-লিমিট ও টেম্পোরারি মেইল ব্লকিং সক্রিয়
            </div>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div class="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xl shrink-0">
            ২
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-white mb-2">সংবেদনশীল প্রমাণাদি আপলোড (Evidence Upload)</h3>
            <p class="text-sm text-slate-300 leading-relaxed mb-3">
              ছবি, অডিও, ভিডিও বা নথি ক্লাউডে আপলোড করা হয়। প্রতিটি ফাইল প্রথমে স্বয়ংক্রিয়ভাবে কোয়ারেন্টাইন ফোল্ডারে যায় এবং ম্যালওয়্যার স্ক্যান সম্পন্নের পরই অভ্যন্তরীণ যাচাই সিস্টেমে অন্তর্ভুক্ত হয়।
            </p>
            <div class="inline-flex items-center gap-2 text-xs font-mono text-blue-400 bg-blue-950/50 px-2.5 py-1 rounded-md border border-blue-900/60">
              🛡️ ড্রাইভে সরাসরি প্রবেশাধিকার নিষিদ্ধ • প্রাইভেট প্রক্সি স্টোরেজ
            </div>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div class="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-xl shrink-0">
            ৩
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-white mb-2">নিরপেক্ষ মানবাধিকার পর্যবেক্ষণ (Review & Verification)</h3>
            <p class="text-sm text-slate-300 leading-relaxed mb-3">
              নিবেদিত পর্যালোচক ও মানবাধিকার গবেষকরা তথ্যসমূহ যাচাই করেন। পর্যালোচকের কোনো স্বার্থের সংঘাত (Conflict of Interest) থাকলে তাৎক্ষণিকভাবে অভিযোগটি অন্য স্বাধীন পর্যবেক্ষকের কাছে হস্তান্তর করা হয়।
            </p>
            <div class="inline-flex items-center gap-2 text-xs font-mono text-purple-400 bg-purple-950/50 px-2.5 py-1 rounded-md border border-purple-900/60">
              ⚖️ দ্বিমুখী সততা নিশ্চিতকরণ এবং সম্পূর্ণ অডিট লগ
            </div>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div class="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xl shrink-0">
            ৪
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-white mb-2">আইনি আপডেট ও প্রত্যাহার অধিকার (Tracking & Rights)</h3>
            <p class="text-sm text-slate-300 leading-relaxed mb-3">
              ব্যবহারকারী তার ড্যাশবোর্ড থেকে মামলার অগ্রগতি ও আইনি নোটিশ যোগ করতে পারেন, প্রয়োজনে সর্বোচ্চ ৩ বার তথ্যের সংশোধন চাইতে পারেন বা উপযুক্ত কারণ দর্শিয়ে অভিযোগ প্রত্যাহারের আবেদন করতে পারেন।
            </p>
            <div class="inline-flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-950/50 px-2.5 py-1 rounded-md border border-amber-900/60">
              📝 নাগরিকের পূর্ণ নিয়ন্ত্রণ ও স্বচ্ছ মেসেজিং
            </div>
          </div>
        </div>

        <!-- Step 5 -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div class="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0">
            ৫
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-white mb-2">জনস্বার্থে প্রকাশনা (Public Disclosure)</h3>
            <p class="text-sm text-slate-300 leading-relaxed mb-3">
              কেবলমাত্র পূর্ণরূপে যাচাইকৃত অভিযোগগুলো ভিকটিমের সুরক্ষা বজায় রেখে এবং সংবেদনশীল ব্যক্তিগত অংশবিশেষ গোপন করে জনসাধারণের অবগতির জন্য পাবলিক রিপোর্টে রূপান্তর করা হয়।
            </p>
            <div class="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-900/60">
              🌐 জিরো-ট্র্যাকিং পাবলিক পোর্টাল
            </div>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="text-center p-8 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border border-emerald-900/40 rounded-2xl">
        <h3 class="text-xl font-bold text-white mb-2">সত্য নথিভুক্ত করতে প্রস্তুত?</h3>
        <p class="text-slate-400 text-sm mb-6">আপনার একটি সঠিক তথ্য সমাজের একটি বড় অন্যায়ের বিরুদ্ধে দাঁড়াতে সাহায্য করতে পারে।</p>
        <div class="flex items-center justify-center gap-4 flex-wrap">
          <a href="#/complaint/new" class="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-sm transition shadow-lg">
            অভিযোগ দাখিল করুন
          </a>
          <a href="#/reports" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition">
            প্রকাশিত রিপোর্ট দেখুন
          </a>
        </div>
      </div>
    </div>
  `;

  try {
    const data = await contentService.getContent('how-it-works');
    if (data?.bn?.content) {
      const el = container.querySelector('#how-it-works-subtitle');
      if (el) el.textContent = data.bn.content;
    }
  } catch {
    // Keep fallback
  }
}
