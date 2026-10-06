export function renderFooter(container) {
  container.innerHTML = `
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div class="md:col-span-2">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">জ</div>
            <span class="text-lg font-bold text-white">জনস্বর (JonoShor)</span>
          </div>
          <p class="text-slate-400 text-sm max-w-md leading-relaxed">
            জনস্বর একটি নিরপেক্ষ, নাগরিক অধিকার সংরক্ষণ ও মানবাধিকার ডকুমেন্টেশন প্ল্যাটফর্ম। গোপনীয়তা ও নিরাপত্তার সর্বোচ্চ সুরক্ষা বজায় রেখে অবিচার নথিভুক্ত করাই আমাদের মূল অঙ্গীকার।
          </p>
        </div>

        <div>
          <h4 class="text-white text-sm font-semibold mb-3">গুরুত্বপূর্ণ লিংক</h4>
          <ul class="space-y-2 text-sm text-slate-400">
            <li><a href="#/how-it-works" class="hover:text-emerald-400 transition">কীভাবে কাজ করে</a></li>
            <li><a href="#/reports" class="hover:text-emerald-400 transition">প্রকাশিত রিপোর্টসমূহ</a></li>
            <li><a href="#/complaint/new" class="hover:text-emerald-400 transition">অভিযোগ জানান</a></li>
            <li><a href="#/about" class="hover:text-emerald-400 transition">আমাদের লক্ষ্য ও উদ্দেশ্য</a></li>
            <li><a href="#/join-us" class="hover:text-emerald-400 transition">স্বেচ্ছাসেবক হিসেবে যুক্ত হোন</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white text-sm font-semibold mb-3">নিরাপত্তা ও নীতিমালা</h4>
          <ul class="space-y-2 text-sm text-slate-400">
            <li><a href="#/privacy" class="hover:text-emerald-400 transition">তথ্য ও পরিচয় গোপনীয়তা নীতি</a></li>
            <li><a href="#/safety" class="hover:text-emerald-400 transition">সুরক্ষা ও যাচাই নির্দেশিকা</a></li>
            <li><a href="#/terms" class="hover:text-emerald-400 transition">ব্যবহারের শর্তাবলী</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-slate-800/80 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>© 2026 জনস্বর (JonoShor)। সর্বস্বত্ব সংরক্ষিত।</p>
        <p>নাগরিক অধিকার ও সত্যের দলিল।</p>
      </div>
    </div>
  `;
}
