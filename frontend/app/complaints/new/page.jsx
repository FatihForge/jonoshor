'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';

export default function NewComplaintWizardPage() {
  const [step, setStep] = useState(1);
  const [districts, setDistricts] = useState([]);

  const [formData, setFormData] = useState({
    category: 'torture_and_custodial_abuse',
    secondaryCategories: [],
    incidentDate: '',
    datePrecision: 'exact',
    ongoing: false,
    description: '',
    divisionId: 'dhaka',
    districtId: 'dhaka_district',
    upazilaId: '',
    freeTextLocation: '',
    accusedName: '',
    accusedRole: '',
    accusedOrg: '',
    victimName: '',
    victimAgeCategory: 'adult',
    victimGender: 'male',
    victimMinor: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/v1/public/districts')
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setDistricts(d.data);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const payload = {
        category: { primary: formData.category, secondary: formData.secondaryCategories },
        incident: {
          startDate: formData.incidentDate || new Date().toISOString(),
          datePrecision: formData.datePrecision,
          ongoing: formData.ongoing,
          description: formData.description,
        },
        location: {
          divisionId: formData.divisionId,
          districtId: formData.districtId,
          upazilaId: formData.upazilaId,
          freeTextLocation: formData.freeTextLocation,
        },
        accused: formData.accusedName
          ? [{ name: formData.accusedName, role: formData.accusedRole, organization: formData.accusedOrg, visibility: 'private' }]
          : [],
        victims: formData.victimName
          ? [{ name: formData.victimName, ageCategory: formData.victimAgeCategory, gender: formData.victimGender, minor: formData.victimMinor, identityVisibility: 'private' }]
          : [],
      };

      const res = await fetch('/api/v1/public/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'অভিযোগ দাখিল সম্পন্ন করা যায়নি।');

      setSubmittedId(data.data?._id || 'COMPLAINT_REGISTERED');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const stepsMeta = [
    { num: 1, code: '০১', label: 'ঘটনার বিবরণ' },
    { num: 2, code: '০২', label: 'ভৌগোলিক স্থান' },
    { num: 3, code: '০৩', label: 'সংশ্লিষ্ট পক্ষসমূহ' },
  ];

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8">
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-brand-blue dark:text-blue-400 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>জিরো-লিকেজ এনক্রিপ্টেড অভিযোগ দাখিল</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white">
            মানবাধিকার লঙ্ঘনের অভিযোগ দাখিল
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            আপনার ব্যক্তিগত পরিচয় সম্পূর্ণ আলাদা এনক্রিপ্টেড স্তরে সুরক্ষিত থাকবে এবং জনসমক্ষে কখনোই প্রকাশ করা হবে না।
          </p>
        </div>

        {!submittedId && (
          <div className="grid grid-cols-3 gap-3">
            {stepsMeta.map((s) => (
              <div
                key={s.num}
                className={`p-3.5 rounded-2xl border text-center text-xs transition-all ${
                  step === s.num
                    ? 'bg-brand-blue border-brand-blue text-white font-bold shadow-md shadow-blue-600/20'
                    : step > s.num
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <span className="font-mono text-[10px] opacity-80 block">ধাপ {s.code}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="dossier-card-elevated p-6 sm:p-10 rounded-3xl space-y-6">
          {submittedId ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-brand-navy dark:text-white">
                অভিযোগ সফলভাবে নিবন্ধিত হয়েছে!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                অভিযোগটি স্বাধীন পর্যবেক্ষকদের যাচাই কিউতে যুক্ত হয়েছে। আপনার পরিচয় সম্পূর্ণ গোপন রেখেই সত্যতা যাচাই প্রক্রিয়া শুরু হবে।
              </p>
              <div className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-full font-mono text-xs text-brand-blue dark:text-blue-400 font-bold">
                REF ID: {submittedId}
              </div>
              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <Link href="/" className="px-6 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-xs font-bold shadow-md">
                  হোম পেজে ফিরুন
                </Link>
                <Link href="/reports" className="px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-brand-navy dark:text-white">
                  যাচাইকৃত আর্কাইভ দেখুন
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-base font-bold text-brand-navy dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                    ধাপ ১: অভিযোগের ধরন ও ঘটনার বিবরণ
                  </h2>

                  <div>
                    <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">মানবাধিকার লঙ্ঘনের মূল ক্যাটাগরি *</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="editorial-input px-3.5 py-2.5">
                      <option value="torture_and_custodial_abuse">হেফাজতে নির্যাতন ও শারীরিক নিপীড়ন</option>
                      <option value="unlawful_detention">বেআইনি আটক ও নিরাপত্তা হেফাজতে রাখা</option>
                      <option value="freedom_of_speech_suppression">মতপ্রকাশের স্বাধীনতা ও সাংবাদিকতায় বাধা</option>
                      <option value="extortion_and_police_harassment">চাঁদাবাজি ও পুলিশি হয়রানি</option>
                      <option value="land_grabbing_and_eviction">জমি দখল ও জোরপূর্বক উচ্ছেদ</option>
                      <option value="other">অন্যান্য নাগরিক অধিকার লঙ্ঘন</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">ঘটনার তারিখ *</label>
                      <input type="date" required value={formData.incidentDate} onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })} className="editorial-input px-3.5 py-2.5 font-mono" />
                    </div>
                    <div>
                      <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">তারিখের যথার্থতা</label>
                      <select value={formData.datePrecision} onChange={(e) => setFormData({ ...formData, datePrecision: e.target.value })} className="editorial-input px-3.5 py-2.5">
                        <option value="exact">সুনির্দিষ্ট (Exact Date)</option>
                        <option value="approximate">আনুমানিক (Approximate)</option>
                        <option value="range">নির্দিষ্ট সময়ব্যাপী (Date Range)</option>
                        <option value="ongoing">চলমান ঘটনা (Ongoing Incident)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">ঘটনার বিস্তারিত বিবরণ *</label>
                    <textarea required rows={6} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="কোথায়, কীভাবে এবং কাদের দ্বারা ঘটনাটি সংঘটিত হয়েছিল তা যথাসম্ভব নিরপেক্ষভাবে লিখুন..." className="editorial-input px-3.5 py-2.5 leading-relaxed" />
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.description.trim()) { setError('অনুগ্রহ করে ঘটনার বিবরণ লিখুন।'); return; }
                        setError(null); setStep(2);
                      }}
                      className="px-6 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                    >
                      <span>পরবর্তী ধাপ: স্থান</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-base font-bold text-brand-navy dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                    ধাপ ২: ঘটনার ভৌগোলিক অবস্থান
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">বিভাগ *</label>
                      <select value={formData.divisionId} onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })} className="editorial-input px-3.5 py-2.5">
                        <option value="dhaka">ঢাকা বিভাগ</option>
                        <option value="chattogram">চট্টগ্রাম বিভাগ</option>
                        <option value="rajshahi">রাজশাহী বিভাগ</option>
                        <option value="khulna">খুলনা বিভাগ</option>
                        <option value="barishal">বরিশাল বিভাগ</option>
                        <option value="sylhet">সিলেট বিভাগ</option>
                        <option value="rangpur">রংপুর বিভাগ</option>
                        <option value="mymensingh">ময়মনসিংহ বিভাগ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">জেলা *</label>
                      <select value={formData.districtId} onChange={(e) => setFormData({ ...formData, districtId: e.target.value })} className="editorial-input px-3.5 py-2.5">
                        {districts.length > 0 ? (
                          districts.map((d) => <option key={d.districtId || d.name} value={d.districtId || d.name}>{d.nameBn || d.name}</option>)
                        ) : (
                          <option value="dhaka_district">ঢাকা (Dhaka)</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-brand-navy dark:text-slate-200 font-semibold mb-1.5">সুনির্দিষ্ট স্থান / থানা / এলাকা</label>
                    <input type="text" value={formData.freeTextLocation} onChange={(e) => setFormData({ ...formData, freeTextLocation: e.target.value })} placeholder="যেমন: ধানমন্ডি ২৭ নম্বর মোড়, ঢাকা" className="editorial-input px-3.5 py-2.5" />
                  </div>

                  <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" onClick={() => setStep(1)} className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                      <ArrowLeft className="w-4 h-4" />
                      <span>পূর্ববর্তী</span>
                    </button>
                    <button type="button" onClick={() => setStep(3)} className="px-6 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold flex items-center gap-1.5 shadow-md">
                      <span>পরবর্তী ধাপ: পক্ষসমূহ</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-base font-bold text-brand-navy dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                    ধাপ ৩: অভিযুক্ত ও ভুক্তভোগীর তথ্য (গোপন ও সংরক্ষিত)
                  </h2>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="font-bold text-brand-navy dark:text-white">অভিযুক্ত ব্যক্তি বা প্রাতিষ্ঠানিক পরিচয়</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" value={formData.accusedName} onChange={(e) => setFormData({ ...formData, accusedName: e.target.value })} placeholder="অভিযুক্তের নাম বা পদবি" className="editorial-input px-3.5 py-2" />
                      <input type="text" value={formData.accusedOrg} onChange={(e) => setFormData({ ...formData, accusedOrg: e.target.value })} placeholder="সংশ্লিষ্ট সংস্থা / থানা / দপ্তর" className="editorial-input px-3.5 py-2" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F2FBF7] dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 space-y-3">
                    <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>ভুক্তভোগীর তথ্য (জনসমক্ষে সম্পূর্ণ গোপন থাকবে)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" value={formData.victimName} onChange={(e) => setFormData({ ...formData, victimName: e.target.value })} placeholder="ভুক্তভোগীর নাম (গোপন থাকবে)" className="editorial-input px-3.5 py-2" />
                      <select value={formData.victimGender} onChange={(e) => setFormData({ ...formData, victimGender: e.target.value })} className="editorial-input px-3.5 py-2">
                        <option value="male">পুরুষ</option>
                        <option value="female">নারী</option>
                        <option value="other">অন্যান্য</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>অভিযোগ জমা দেওয়ার পূর্বে নিশ্চিত হোন যে আপনার প্রদত্ত তথ্য সত্য ও বাস্তব সাক্ষ্যের ওপর ভিত্তি করে লেখা।</span>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" onClick={() => setStep(2)} className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                      <ArrowLeft className="w-4 h-4" />
                      <span>পূর্ববর্তী</span>
                    </button>
                    <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50">
                      {submitting ? <span>এনক্রিপ্ট ও জমা হচ্ছে...</span> : <span>অভিযোগ চূড়ান্ত দাখিল করুন</span>}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
