import React from 'react';
import { ShieldAlert, AlertOctagon } from 'lucide-react';

export const metadata = {
  title: 'হুইসেলব্লোয়ার ও তথ্যদাতার নিরাপত্তা গাইড',
  description: 'উচ্চ ঝুঁকির পরিস্থিতিতে নাগরিক অভিযোগ ও তথ্য জমাদানের ডিজিটাল নিরাপত্তা নির্দেশিকা।',
};

export default function SafetyPage() {
  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ডিজিটাল নিরাপত্তা নির্দেশনা</span>
          </div>
          <h1 className="text-3xl font-extrabold text-brand-navy dark:text-white">
            তথ্যদাতার ব্যক্তিগত নিরাপত্তা ও সতর্কতা
          </h1>
        </div>

        <div className="dossier-card-elevated p-6 sm:p-10 rounded-3xl space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200">
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              যদি আপনি কোনো প্রভাবশালী ব্যক্তি, আইনপ্রয়োগকারী সংস্থা বা অপরাধী চক্রের বিরুদ্ধে অভিযোগ দাখিল করেন, তবে আপনার ব্যক্তিগত ডিজিটাল নিরাপত্তা নিশ্চিত করা সর্বাগ্রে প্রয়োজন।
            </p>
          </div>

          <section className="space-y-2 pt-2">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">১. পাবলিক বা অফিসিয়াল ডিভাইস পরিহার করুন</h2>
            <p>
              আপনার কর্মস্থলের কম্পিউটার, অফিস ওয়াইফাই বা কারও ব্যক্তিগত ফোন ব্যবহার করে সংবেদনশীল অভিযোগ দাখিল করবেন না। এতে লোকাল ক্যাশ বা নেটওয়ার্ক লগ থেকে আপনার তথ্য শনাক্ত হওয়ার ঝুঁকি থাকে।
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">২. ইনকগনিটো ব্রাউজিং ও ভিপিএন ব্যবহার</h2>
            <p>
              অভিযোগ দাখিলের সময় প্রাইভেট বা ইনকগনিটো মোড অন করুন এবং বিশ্বস্ত ভিপিএন বা টর ব্রাউজার (Tor Browser) ব্যবহার করার পরামর্শ দেওয়া হচ্ছে।
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-brand-navy dark:text-white">৩. ছবির মেটাডাটা (EXIF Data) স্ক্রাবিং</h2>
            <p>
              স্মার্টফোনে তোলা ছবিতে স্বয়ংক্রিয়ভাবে জিপিএস লোকেশন ও ক্যামেরা মডেল সেভ থাকে। আমাদের ব্যাকএন্ড সিস্টেম স্বয়ংক্রিয়ভাবে মেটাডাটা স্ক্রাব করলেও, আপনি চাইলে ছবি আপলোডের আগে ক্যামেরা লোকেশন পারমিশন বন্ধ রাখতে পারেন।
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
