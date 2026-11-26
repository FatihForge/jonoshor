import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Scale, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'আমাদের লক্ষ্য ও মূলনীতি',
  description: 'জনস্বর (JonoShor) — বাংলাদেশের স্বাধীন মানবাধিকার ডকুমেন্টেশন নাগরিক প্ল্যাটফর্ম।',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-block px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-semibold">
          আমাদের অঙ্গীকার
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-text tracking-tight">
          জনস্বর (JonoShor) কী এবং কেন?
        </h1>
        <p className="text-sm text-brand-slate leading-relaxed">
          ন্যায়বিচার, মানবিক মর্যাদা ও নাগরিকদের নির্ভয়ে কথা বলার অধিকার সুরক্ষার লক্ষ্যে গড়ে ওঠা একটি স্বাধীন নাগরিক উদ্যোগ।
        </p>
      </div>

      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-canvas-border space-y-8 text-sm text-brand-slate leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-brand-text">১. প্ল্যাটফর্মের প্রারম্ভিক প্রেক্ষাপট</h2>
          <p>
            বাংলাদেশে মানবাধিকার লঙ্ঘন, নির্যাতন ও নিপীড়নের ঘটনায় বহু সাধারণ মানুষ উপযুক্ত তথ্য সংরক্ষণের অভাবে অথবা নিরাপত্তার ভয়ে কোনো প্রাতিষ্ঠানিক প্রতিকার পান না। জনস্বর হলো একটি প্রযুক্তিগত নিরাপদ আশ্রয়, যেখানে যেকোনো ভুক্তভোগী বা সাক্ষী নিরাপদে ডিজিটাল প্রমাণাদি এনক্রিপ্টেড করে সংরক্ষণ করতে পারেন।
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-brand-text">২. তিনটি অপরিবর্তনীয় মূলনীতি</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border space-y-2">
              <div className="font-bold text-brand-amber">অভিযোগ ≠ অপরাধ</div>
              <p className="text-xs">প্ল্যাটফর্মে দাখিল করা অভিযোগ সরাসরি অপরাধের প্রমাণ নয়; এটি যাচাইয়ের প্রাথমিক সাক্ষ্য।</p>
            </div>
            <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border space-y-2">
              <div className="font-bold text-brand-blue">রিপোর্ট ≠ আইনি রায়</div>
              <p className="text-xs">জনস্বর কোনো আদালত নয়। প্রকাশিত রিপোর্ট আইনি আদেশের বিকল্প নয়, বরং সত্য অনুসন্ধানের দলিল।</p>
            </div>
            <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border space-y-2">
              <div className="font-bold text-brand-emerald">পরিচয় সম্পূর্ণ সুরক্ষিত</div>
              <p className="text-xs">অভিযোগকারীর নাম বা ব্যক্তিগত তথ্য কোনো পাবলিক আর্কাইভে প্রকাশ করা সম্পূর্ণ নিষিদ্ধ।</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-brand-text">৩. আমরা কী করি এবং কী করি না</h2>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
              <span>আমরা নিরপেক্ষভাবে প্রমাণাদি যাচাই, ম্যালওয়্যার স্ক্যান ও জনস্বার্থে সংরক্ষণ করি।</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
              <span>আমরা কোনো রাজনৈতিক দল বা গোষ্ঠীর হয়ে প্রোপাগান্ডা পরিচালনা করি না।</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
              <span>আমরা কোনো বিচারবহির্ভূত সামাজিক ট্রায়াল বা ক্যাঙ্গারু কোর্ট সমর্থন করি না।</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
