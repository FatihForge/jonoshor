import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, CheckCircle2, Lock, Eye, FileText } from 'lucide-react';

export const metadata = {
  title: '৫-ধাপের যাচাই পদ্ধতি ও কাজের ধারা',
  description: 'কীভাবে একটি নাগরিক অভিযোগ সত্যতা যাচাই প্রক্রিয়ার মধ্য দিয়ে যায়।',
};

export default function HowItWorksPage() {
  const steps = [
    {
      num: '০১',
      title: 'নাগরিকের অভিযোগ দাখিল (Submission & Seeding)',
      desc: 'সাধারণ নাগরিক বা ভুক্তভোগী অনলাইনের মাধ্যমে ঘটনার স্থান, তারিখ, বিবরণ এবং প্রমাণাদি জমা দেন। কোনো অ্যাকাউন্ট ছাড়াই ৫টি অভিযোগ জমা দেওয়ার সুযোগ রয়েছে। তথ্য জমার সময় ক্লায়েন্ট থেকে সার্ভারে এন্ড-টু-এন্ড ট্রাফিক সুরক্ষিত থাকে।',
    },
    {
      num: '০২',
      title: 'কোয়ারেন্টাইন ক্লাউড ও ম্যালওয়্যার স্ক্যান (Quarantine Scan)',
      desc: 'আপলোডকৃত সব ভিডিও, অডিও ও ছবি সরাসরি মূল ডেটাবেজ বা স্টোরেজে যুক্ত হয় না। গুগল ড্রাইভের সুরক্ষিত Quarantine ফোল্ডারে জমা হয়ে স্বয়ংক্রিয়ভাবে অ্যান্টিভাইরাস ও ম্যালওয়্যার স্ক্যান সম্পন্ন হয়। ফাইল নিরাপদ ঘোষিত হলে Clean ফোল্ডারে স্থানান্তরিত হয়।',
    },
    {
      num: '০৩',
      title: 'স্বাধীন পর্যবেক্ষক দ্বারা সত্যতা যাচাই (Independent Verification)',
      desc: 'তদন্তকারী কর্মকর্তা বা মানবাধিকার পর্যবেক্ষক প্রমাণের সত্যতা, ঘটনার পারিপার্শ্বিক অবস্থা এবং স্থানীয় তথ্যের সাথে মেলাবেন। যদি কোনো কর্মকর্তার ব্যক্তিগত স্বার্থের সংঘাত (Conflict of Interest) থাকে, তবে তিনি কেসটি ফিরিয়ে দেন এবং অন্য নিরপেক্ষ পর্যালোচক দায়িত্ব পান।',
    },
    {
      num: '০৪',
      title: 'নিরপেক্ষ প্রতিবেদন ও তথ্য গোপনকরণ (Sanitization & Redaction)',
      desc: 'সত্যতা প্রমাণিত হলে ভুক্তভোগী ও অপ্রাপ্তবয়স্কদের নাম পরিচয় সম্পূর্ণ আড়াল করে একটি জনস্বার্থ প্রতিবেদন প্রস্তুত করা হয়। আদালতে বিচারাধীন ব্যক্তির বিষয়ে মানহানিকর বা চূড়ান্ত অপরাধী শব্দ পরিহার করে কেবল যাচাইকৃত তথ্য রাখা হয়।',
    },
    {
      num: '০৫',
      title: 'জনস্বার্থে উন্মুক্তকরণ ও আইনি ট্র্যাকিং (Public Disclosure & Legal Follow-up)',
      desc: 'চূড়ান্ত অনুমোদনের পর প্রতিবেদনটি পাবলিক আর্কাইভে যুক্ত হয়। পরবর্তীতে কোনো মামলা হলে বা আইনি রায় এলে তা প্রতিবেদনের সাথে হালনাগাদ হিসেবে যুক্ত হতে থাকে।',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-text">৫-ধাপের নিরপেক্ষ যাচাই পদ্ধতি</h1>
        <p className="text-sm text-brand-slate">
          প্রযুক্তি ও মানবাধিকার নীতিমালার সমন্বয়ে গড়ে ওঠা স্বচ্ছ যাচাই ও প্রকাশনা পাইপলাইন।
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((s, i) => (
          <div key={i} className="glass-panel p-6 sm:p-8 rounded-2xl border border-canvas-border flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald font-black text-xl flex items-center justify-center shrink-0">
              {s.num}
            </div>
            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-brand-text">{s.title}</h2>
              <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
