import React from 'react';

export const metadata = {
  title: '৫-ধাপের যাচাই পদ্ধতি ও কাজের ধারা',
  description: 'কীভাবে একটি নাগরিক অভিযোগ সত্যতা যাচাই প্রক্রিয়ার মধ্য দিয়ে যায়।',
};

export default function HowItWorksPage() {
  const steps = [
    {
      num: '০১',
      title: 'নাগরিকের অভিযোগ দাখিল (Submission & Separation)',
      desc: 'সাধারণ নাগরিক বা ভুক্তভোগী অনলাইনের মাধ্যমে ঘটনার স্থান, তারিখ, বিবরণ এবং প্রমাণাদি জমা দেন। কোনো অ্যাকাউন্ট ছাড়াই ৫টি অভিযোগ জমা দেওয়ার সুযোগ রয়েছে। তথ্য জমার সময় পরিচয় ও ঘটনার বিবরণ পৃথকভাবে এনক্রিপ্ট হয়।',
    },
    {
      num: '০২',
      title: 'কোয়ারেন্টাইন ক্লাউড ও ম্যালওয়্যার স্ক্যান (Quarantine Scan)',
      desc: 'আপলোডকৃত সব ভিডিও, অডিও ও ছবি সরাসরি মূল ডেটাবেজে যুক্ত হয় না। সুরক্ষিত Quarantine ফোল্ডারে জমা হয়ে স্বয়ংক্রিয়ভাবে অ্যান্টিভাইরাস ও SHA-256 হ্যাশ যাচাই সম্পন্ন হয়। ফাইল নিরাপদ ঘোষিত হলে Clean ভল্টে স্থানান্তরিত হয়।',
    },
    {
      num: '০৩',
      title: 'স্বাধীন পর্যবেক্ষক দ্বারা সত্যতা যাচাই (Independent Verification)',
      desc: 'তদন্তকারী কর্মকর্তা বা মানবাধিকার পর্যবেক্ষক প্রমাণের সত্যতা, ঘটনার পারিপার্শ্বিক অবস্থা এবং স্থানীয় তথ্যের সাথে মেলাবেন। কোনো কর্মকর্তার ব্যক্তিগত স্বার্থের সংঘাত (Conflict of Interest) থাকলে তিনি কেসটি ফিরিয়ে দেন।',
    },
    {
      num: '০৪',
      title: 'নিরপেক্ষ প্রতিবেদন ও তথ্য গোপনকরণ (Sanitization & Redaction)',
      desc: 'সত্যতা প্রমাণিত হলে ভুক্তভোগী ও অপ্রাপ্তবয়স্কদের নাম পরিচয় সম্পূর্ণ আড়াল করে একটি জনস্বার্থ প্রতিবেদন প্রস্তুত করা হয়। আদালতে বিচারাধীন ব্যক্তির বিষয়ে মানহানিকর শব্দ পরিহার করে কেবল যাচাইকৃত তথ্য রাখা হয়।',
    },
    {
      num: '০৫',
      title: 'জনস্বার্থে উন্মুক্তকরণ ও আইনি ট্র্যাকিং (Public Disclosure)',
      desc: 'চূড়ান্ত অনুমোদনের পর প্রতিবেদনটি পাবলিক আর্কাইভে যুক্ত হয়। পরবর্তীতে কোনো মামলা হলে বা আইনি রায় এলে তা প্রতিবেদনের সাথে হালনাগাদ হিসেবে যুক্ত হতে থাকে।',
    },
  ];

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            VERIFICATION METHODOLOGY
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white">
            ৫-ধাপের নিরপেক্ষ যাচাই পদ্ধতি
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            প্রযুক্তি ও মানবাধিকার নীতিমালার সমন্বয়ে গড়ে ওঠা স্বচ্ছ যাচাই ও প্রকাশনা পাইপলাইন।
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((s) => (
            <div key={s.num} className="dossier-card p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-brand-blue dark:text-blue-400 font-extrabold text-lg flex items-center justify-center shrink-0">
                {s.num}
              </div>
              <div className="space-y-2">
                <h2 className="text-base sm:text-lg font-bold text-brand-navy dark:text-white">{s.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
