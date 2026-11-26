import React from 'react';

export const metadata = {
  title: 'ব্যবহারের শর্তাবলী ও আইনি দায়মুক্তি',
  description: 'জনস্বর ব্যবহারের আইনি শর্তাবলী ও দায়মুক্তি দলিল।',
};

export default function TermsPage() {
  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            TERMS & DISCLAIMERS
          </span>
          <h1 className="text-3xl font-extrabold text-brand-navy dark:text-white">
            ব্যবহারের শর্তাবলী ও আইনি দায়মুক্তি
          </h1>
          <p className="text-xs text-slate-400">সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬</p>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-10 rounded-3xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">১. প্ল্যাটফর্মের আইনি অবস্থান</h2>
            <p>
              জনস্বর কোনো আদালত, ট্রাইব্যুনাল বা আইনি কর্তৃপক্ষ নয়। এই প্ল্যাটফর্মে প্রকাশিত কোনো প্রতিবেদন কাউকে অপরাধী হিসেবে চূড়ান্ত রায় প্রদান করে না। এটি শুধুমাত্র নাগরিক সাক্ষ্য ও সংগৃহীত প্রমাণের ভিত্তিতে একটি মানবাধিকার তথ্য রেকর্ড।
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">২. মিথ্যা বা বিদ্বেষমূলক তথ্যের দায়</h2>
            <p>
              কোনো ব্যক্তি বা গোষ্ঠীকে অন্যায়ভাবে হেয় প্রতিপন্ন করার উদ্দেশ্যে ইচ্ছাকৃত বানোয়াট তথ্য বা জাল প্রমাণ জমা দিলে তার অভিযোগ সরাসরি বাতিল করা হবে এবং প্ল্যাটফর্ম থেকে তার বিরুদ্ধে প্রতিরোধমূলক ব্যবস্থা নেওয়া হবে।
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">৩. আইনি সহায়তা ও সীমাবদ্ধতা</h2>
            <p>
              জনস্বর ভুক্তভোগীদের সাথে স্বেচ্ছাসেবী আইনজীবীদের যোগাযোগের সুযোগ করে দেয়, তবে আদালত কক্ষে মামলা জেতার কোনো বাণিজ্যিক গ্যারান্টি প্ল্যাটফর্ম প্রদান করে না।
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
