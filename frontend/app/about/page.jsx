import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'আমাদের লক্ষ্য ও মূলনীতি',
  description: 'জনস্বর (JonoShor) — বাংলাদেশের স্বাধীন মানবাধিকার ডকুমেন্টেশন নাগরিক প্ল্যাটফর্ম।',
};

export default function AboutPage() {
  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-blue-400 block">
            CHARTER & MANDATE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight">
            জনস্বর (JonoShor) কী এবং কেন?
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            ন্যায়বিচার, মানবিক মর্যাদা ও নাগরিকদের নির্ভয়ে কথা বলার অধিকার সুরক্ষার লক্ষ্যে গড়ে ওঠা একটি স্বাধীন নাগরিক প্ল্যাটফর্ম।
          </p>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-10 rounded-3xl space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white">১. প্ল্যাটফর্মের প্রারম্ভিক প্রেক্ষাপট</h2>
            <p>
              বাংলাদেশে মানবাধিকার লঙ্ঘন, নির্যাতন ও নিপীড়নের ঘটনায় বহু সাধারণ মানুষ উপযুক্ত তথ্য সংরক্ষণের অভাবে অথবা নিরাপত্তার ভয়ে কোনো প্রাতিষ্ঠানিক প্রতিকার পান না। জনস্বর হলো একটি প্রযুক্তিগত নিরাপদ আশ্রয়, যেখানে যেকোনো ভুক্তভোগী বা সাক্ষী নিরাপদে ডিজিটাল প্রমাণাদি এনক্রিপ্টেড করে সংরক্ষণ করতে পারেন।
            </p>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white">২. তিনটি অপরিবর্তনীয় মূলনীতি</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#FFF9F0] dark:bg-slate-900 border border-amber-100 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-700 dark:text-amber-400 text-xs">অভিযোগ ≠ অপরাধ</div>
                <p className="text-xs">প্ল্যাটফর্মে দাখিল করা অভিযোগ সরাসরি অপরাধের প্রমাণ নয়; এটি যাচাইয়ের প্রাথমিক সাক্ষ্য।</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#F0F7FF] dark:bg-slate-900 border border-blue-100 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-brand-blue dark:text-blue-400 text-xs">রিপোর্ট ≠ আইনি রায়</div>
                <p className="text-xs">জনস্বর কোনো আদালত নয়। প্রকাশিত রিপোর্ট আইনি আদেশের বিকল্প নয়, বরং সত্য অনুসন্ধানের দলিল।</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#F2FBF7] dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">পরিচয় সর্বদা সুরক্ষিত</div>
                <p className="text-xs">অভিযোগকারীর নাম বা ব্যক্তিগত তথ্য কোনো পাবলিক আর্কাইভে প্রকাশ করা সম্পূর্ণ নিষিদ্ধ।</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white">৩. আমরা কী করি এবং কী করি না</h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <span>আমরা নিরপেক্ষভাবে প্রমাণাদি যাচাই, ম্যালওয়্যার স্ক্যান ও জনস্বার্থে সংরক্ষণ করি।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <span>আমরা কোনো রাজনৈতিক দল বা গোষ্ঠীর হয়ে প্রোপাগান্ডা পরিচালনা করি না।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <span>আমরা কোনো বিচারবহির্ভূত সামাজিক ট্রায়াল বা ক্যাঙ্গারু কোর্ট সমর্থন করি না।</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
