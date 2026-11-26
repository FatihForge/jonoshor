'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, ShieldAlert, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, MapPin, Calendar, Lock } from 'lucide-react';

export default function NewComplaintWizardPage() {
  const [step, setStep] = useState(1);
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);

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
      .catch(() => {})
      .finally(() => setLoadingDistricts(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const payload = {
        category: {
          primary: formData.category,
          secondary: formData.secondaryCategories,
        },
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
          ? [
              {
                name: formData.accusedName,
                role: formData.accusedRole,
                organization: formData.accusedOrg,
                visibility: 'private',
              },
            ]
          : [],
        victims: formData.victimName
          ? [
              {
                name: formData.victimName,
                ageCategory: formData.victimAgeCategory,
                gender: formData.victimGender,
                minor: formData.victimMinor,
                identityVisibility: 'private',
              },
            ]
          : [],
      };

      const res = await fetch('/api/v1/public/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'অভিযোগ দাখিল সম্পন্ন করা যায়নি।');
      }

      setSubmittedId(data.data?._id || 'COMPLAINT_REGISTERED');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
      {/* Wizard Header */}
      <div className="space-y-3 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>নিরাপদ নাগরিক অভিযোগ পোর্টাল</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
          মানবাধিকার লঙ্ঘনের অভিযোগ দাখিল
        </h1>
        <p className="text-xs text-brand-slate">
          ধাপ {step} / ৩: আপনার তথ্য সম্পূর্ণ গোপন ও ক্রিপ্টোগ্রাফিকভাবে সুরক্ষিত থাকবে।
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-canvas-border space-y-6">
        {submittedId ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-14 h-14 rounded-full bg-brand-emerald/20 border border-brand-emerald/40 text-brand-emerald flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-brand-text">অভিযোগ সফলভাবে নিবন্ধিত হয়েছে!</h2>
            <p className="text-xs text-brand-slate max-w-md mx-auto leading-relaxed">
              অভিযোগটি নিরপেক্ষ পর্যবেক্ষকদের কিউতে যুক্ত হয়েছে। আপনার পরিচয় গোপন রেখেই সত্যতা যাচাই প্রক্রিয়া শুরু হবে।
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl bg-brand-emerald text-white text-xs font-bold shadow-md"
              >
                হোম পেজে ফিরুন
              </Link>
              <Link
                href="/reports"
                className="px-5 py-2.5 rounded-xl border border-canvas-border text-xs text-brand-slate hover:text-brand-text"
              >
                যাচাইকৃত রিপোর্ট দেখুন
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {error && (
              <div className="p-3.5 rounded-xl bg-brand-crimson/10 border border-brand-crimson/30 text-brand-crimson text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Category & Incident Story */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-brand-emerald pb-2 border-b border-canvas-border">
                  ধাপ ১: অভিযোগের ধরন ও ঘটনার বিবরণ
                </h3>

                <div>
                  <label className="block text-brand-text font-medium mb-1.5">মানবাধিকার লঙ্ঘনের মূল ক্যাটাগরি *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
                  >
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
                    <label className="block text-brand-text font-medium mb-1.5">ঘটনার তারিখ *</label>
                    <input
                      type="date"
                      required
                      value={formData.incidentDate}
                      onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-text font-medium mb-1.5">তারিখের যথার্থতা</label>
                    <select
                      value={formData.datePrecision}
                      onChange={(e) => setFormData({ ...formData, datePrecision: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
                    >
                      <option value="exact">সুনির্দিষ্ট (Exact Date)</option>
                      <option value="approximate">আনুমানিক (Approximate)</option>
                      <option value="range">নির্দিষ্ট সময়ব্যাপী (Date Range)</option>
                      <option value="ongoing">চলমান ঘটনা (Ongoing Incident)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-brand-text font-medium mb-1.5">ঘটনার বিস্তারিত বিবরণ *</label>
                  <textarea
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="কোথায়, কীভাবে এবং কাদের দ্বারা ঘটনাটি সংঘটিত হয়েছিল তা যথাসম্ভব নিরপেক্ষভাবে লিখুন..."
                    className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.description.trim()) {
                        setError('অনুগ্রহ করে ঘটনার বিবরণ লিখুন।');
                        return;
                      }
                      setError(null);
                      setStep(2);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <span>পরবর্তী ধাপ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location Information */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-brand-emerald pb-2 border-b border-canvas-border">
                  ধাপ ২: ঘটনার ভৌগোলিক অবস্থান
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brand-text font-medium mb-1.5">বিভাগ *</label>
                    <select
                      value={formData.divisionId}
                      onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
                    >
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
                    <label className="block text-brand-text font-medium mb-1.5">জেলা *</label>
                    <select
                      value={formData.districtId}
                      onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
                    >
                      {districts.map((d) => (
                        <option key={d.districtId || d.name} value={d.districtId || d.name}>
                          {d.nameBn || d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-brand-text font-medium mb-1.5">সুনির্দিষ্ট স্থান / থানা / এলাকা</label>
                  <input
                    type="text"
                    value={formData.freeTextLocation}
                    onChange={(e) => setFormData({ ...formData, freeTextLocation: e.target.value })}
                    placeholder="যেমন: ধানমন্ডি ২৭ নম্বর মোড়, ঢাকা"
                    className="w-full px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl border border-canvas-border text-brand-slate hover:text-brand-text flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>পূর্ববর্তী</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <span>পরবর্তী ধাপ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Accused, Victims & Final Submission */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-brand-emerald pb-2 border-b border-canvas-border">
                  ধাপ ৩: অভিযুক্ত ও ভুক্তভোগীর তথ্য (ঐচ্ছিক কিন্তু সহায়ক)
                </h3>

                <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border space-y-3">
                  <div className="font-semibold text-brand-text">অভিযুক্ত ব্যক্তি বা সংস্থা</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={formData.accusedName}
                      onChange={(e) => setFormData({ ...formData, accusedName: e.target.value })}
                      placeholder="অভিযুক্তের নাম বা পরিচয়"
                      className="px-3.5 py-2 bg-canvas-subtle border border-canvas-border rounded-lg text-brand-text focus:outline-none"
                    />
                    <input
                      type="text"
                      value={formData.accusedOrg}
                      onChange={(e) => setFormData({ ...formData, accusedOrg: e.target.value })}
                      placeholder="প্রতিষ্ঠান বা থানা"
                      className="px-3.5 py-2 bg-canvas-subtle border border-canvas-border rounded-lg text-brand-text focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-canvas-card border border-canvas-border space-y-3">
                  <div className="font-semibold text-brand-text">ভুক্তভোগী ব্যক্তি (সর্বদা সুরক্ষিত)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={formData.victimName}
                      onChange={(e) => setFormData({ ...formData, victimName: e.target.value })}
                      placeholder="ভুক্তভোগীর নাম (গোপন থাকবে)"
                      className="px-3.5 py-2 bg-canvas-subtle border border-canvas-border rounded-lg text-brand-text focus:outline-none"
                    />
                    <select
                      value={formData.victimGender}
                      onChange={(e) => setFormData({ ...formData, victimGender: e.target.value })}
                      className="px-3.5 py-2 bg-canvas-subtle border border-canvas-border rounded-lg text-brand-text focus:outline-none"
                    >
                      <option value="male">পুরুষ</option>
                      <option value="female">নারী</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-canvas-border">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 rounded-xl border border-canvas-border text-brand-slate hover:text-brand-text flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>পূর্ববর্তী</span>
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white font-bold flex items-center gap-2 shadow-lg shadow-brand-emerald/20 disabled:opacity-50"
                  >
                    {submitting ? <span>জমা দেওয়া হচ্ছে...</span> : <span>অভিযোগ চূড়ান্ত জমা দিন</span>}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
