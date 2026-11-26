import React from 'react';
import { ShieldAlert, AlertOctagon, Lock, EyeOff } from 'lucide-react';

export const metadata = {
  title: 'হুইসেলব্লোয়ার ও তথ্যদাতার নিরাপত্তা গাইড',
  description: 'উচ্চ ঝুঁকির পরিস্থিতিতে নাগরিক অভিযোগ ও তথ্য জমাদানের ডিজিটাল নিরাপত্তা নির্দেশিকা।',
};

export default function SafetyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8 text-sm text-brand-slate leading-relaxed">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-crimson/10 border border-brand-crimson/30 text-brand-crimson text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>ডিজিটাল নিরাপত্তা নির্দেশনা</span>
        </div>
        <h1 className="text-3xl font-extrabold text-brand-text">তথ্যদাতার ব্যক্তিগত নিরাপত্তা ও সতর্কতা</h1>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-canvas-border space-y-6">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-crimson/10 border border-brand-crimson/30 text-xs text-brand-text">
          <AlertOctagon className="w-5 h-5 text-brand-crimson shrink-0 mt-0.5" />
          <p>
            যদি আপনি কোনো প্রভাবশালী ব্যক্তি, আইনপ্রয়োগকারী সংস্থা বা অপরাধী চক্রের বিরুদ্ধে অভিযোগ দাখিল করেন, তবে আপনার ব্যক্তিগত ডিজিটাল নিরাপত্তা নিশ্চিত করা সর্বাগ্রে প্রয়োজন।
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-brand-text">১. পাবলিক বা অফিসিয়াল ডিভাইস পরিহার করুন</h2>
          <p>
            আপনার কর্মস্থলের কম্পিউটার, অফিস ওয়াইফাই বা কারও ব্যক্তিগত ফোন ব্যবহার করে সংবেদনশীল অভিযোগ দাখিল করবেন না। এতে লোকাল ক্যাশ বা নেটওয়ার্ক লগ থেকে আপনার তথ্য শনাক্ত হওয়ার ঝুঁকি থাকে।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-brand-text">২. ইনকগনিটো ব্রাউজিং ও ভিপিএন ব্যবহার</h2>
          <p>
            অভিযোগ দাখিলের সময় প্রাইভেট বা ইনকগনিটো মোড অন করুন এবং বিশ্বস্ত ভিপিএন বা টর ব্রাউজার (Tor Browser) ব্যবহার করার পরামর্শ দেওয়া হচ্ছে।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-brand-text">৩. ছবির মেটাডাটা (EXIF Data) স্ক্রাবিং</h2>
          <p>
            স্মার্টফোনে তোলা ছবিতে স্বয়ংক্রিয়ভাবে জিপিএস লোকেশন ও ক্যামেরা মডেল সেভ থাকে। আমাদের ব্যাকএন্ড সিস্টেম স্বয়ংক্রিয়ভাবে মেটাডাটা স্ক্রাব করলেও, আপনি চাইলে ছবি আপলোডের আগে ক্যামেরা লোকেশন পারমিশন বন্ধ রাখতে পারেন।
          </p>
        </section>
      </div>
    </div>
  );
}
