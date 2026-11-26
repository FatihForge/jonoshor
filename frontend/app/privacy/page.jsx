import React from 'react';

export const metadata = {
  title: 'গোপনীয়তা ও ডেটা পলিসি',
  description: 'জনস্বর প্ল্যাটফর্মের তথ্য সুরক্ষা, পরিচয় গোপনীয়তা ও ক্রিপ্টোগ্রাফিক সুরক্ষা নীতিমালা।',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            PRIVACY & PROTECTION
          </span>
          <h1 className="text-3xl font-extrabold text-brand-navy dark:text-white">
            গোপনীয়তা ও ডেটা সংরক্ষণ পলিসি
          </h1>
          <p className="text-xs text-slate-400">সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬</p>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-10 rounded-3xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">১. পরিচয় গোপনীয়তা নীতি (Strict Non-Disclosure)</h2>
            <p>
              জনস্বর প্ল্যাটফর্মে কোনো নাগরিক অভিযোগ দাখিল করলে তার নাম, ইমেইল, মোবাইল বা আইপি অ্যাড্রেস কখনোই পাবলিক ডিরেক্টরি বা সাধারণ দর্শকদের জন্য উন্মুক্ত করা হয় না। আমাদের ডাটাবেজ আর্কিটেকচারে অভিযোগকারীর পরিচয় পৃথক সংরক্ষিত মেটাডাটাতে এনক্রিপ্টেড থাকে।
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">২. সংগৃহীত প্রমাণের নিরাপত্তা</h2>
            <p>
              ব্যবহারকারীর আপলোডকৃত নথি, ছবি বা ভিডিও গুগল ক্লাউডের সুরক্ষিত সার্ভিস অ্যাকাউন্টের মাধ্যমে নিয়ন্ত্রিত হয়। কোনো সরাসরি পাবলিক লিঙ্ক ইন্টারনেটে উন্মুক্ত থাকে না। কেবল অনুমোদিত পর্যালোচক ও প্রমাণ জমাদানকারী স্বয়ংক্রিয় প্রক্সি এন্ডপয়েন্টের মাধ্যমে ফাইল ডাউনলোড করতে পারেন।
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">৩. ব্রাউজার কুকিজ ও ট্র্যাকার বর্জন</h2>
            <p>
              জনস্বর কোনো প্রকার থার্ড-পার্টি কমার্শিয়াল অ্যাড ট্র্যাকার ব্যবহার করে না। শুধুমাত্র সেশন ও সিএসআরএফ (CSRF) সুরক্ষার জন্য প্রয়োজনীয় ক্রিপ্টোগ্রাফিক HttpOnly কুকি ব্যবহৃত হয়।
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
