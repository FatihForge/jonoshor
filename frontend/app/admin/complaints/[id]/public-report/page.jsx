'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText, ArrowLeft, AlertTriangle, CheckCircle2,
  Send, Globe, UserCheck, Scale, Building2
} from 'lucide-react';
import { useLanguage } from '../../../../components/LanguageContext';

export default function PublicReportBuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [existingReport, setExistingReport] = useState(null);
  const [activeTab, setActiveTab] = useState('bn');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    bn: { title: '', summary: '', incidentStory: '', legalSummary: '', authorityActionSummary: '' },
    en: { title: '', summary: '', incidentStory: '', legalSummary: '', authorityActionSummary: '' },
    caseStatus: 'under_review',
    legalOutcome: '',
    publicAccused: [],
    publicVictims: [],
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const cRes = await fetch(`/api/v1/admin/complaints/${id}`, { credentials: 'include' });
      if (!cRes.ok) throw new Error(isBn ? 'অভিযোগের তথ্য লোড করতে ব্যর্থ হয়েছে' : 'Failed to load complaint details');
      const cData = await cRes.json();
      const comp = cData.data || cData;
      setComplaint(comp);

      const rRes = await fetch(`/api/v1/admin/complaints/${id}/public-report`, { credentials: 'include' });
      if (rRes.ok) {
        const rData = await rRes.json();
        if (rData.data) {
          const rep = rData.data;
          setExistingReport(rep);
          setFormData({
            bn: {
              title: rep.bn?.title || '',
              summary: rep.bn?.summary || '',
              incidentStory: rep.bn?.incidentStory || '',
              legalSummary: rep.bn?.legalSummary || '',
              authorityActionSummary: rep.bn?.authorityActionSummary || '',
            },
            en: {
              title: rep.en?.title || '',
              summary: rep.en?.summary || '',
              incidentStory: rep.en?.incidentStory || '',
              legalSummary: rep.en?.legalSummary || '',
              authorityActionSummary: rep.en?.authorityActionSummary || '',
            },
            caseStatus: rep.caseStatus || 'under_review',
            legalOutcome: rep.legalOutcome || '',
            publicAccused: rep.publicAccused || [],
            publicVictims: rep.publicVictims || [],
          });
          return;
        }
      }

      setFormData((prev) => ({
        ...prev,
        bn: {
          title: comp.title || '',
          summary: comp.incident?.description ? comp.incident.description.slice(0, 200) + '...' : '',
          incidentStory: comp.incident?.description || '',
          legalSummary: '',
          authorityActionSummary: '',
        },
        publicAccused: (comp.accused || []).map((a) => ({
          name: a.name || (isBn ? 'অজ্ঞাত ব্যক্তি' : 'Unknown Individual'),
          role: a.role || (isBn ? 'অভিযুক্ত' : 'Accused'),
          organization: a.organization || '',
        })),
        publicVictims: (comp.victims || []).map((v) => ({
          name: v.minor || v.isAnonymous ? (isBn ? 'পরিচয় গোপনীয়' : 'Identity Protected') : (v.name || (isBn ? 'ভুক্তভোগী' : 'Victim')),
          category: v.relationshipToIncident || (isBn ? 'ভুক্তভোগী' : 'Victim'),
        })),
      }));
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getCsrfToken = async () => {
    try {
      const res = await fetch('/api/v1/csrf-token', { credentials: 'include' });
      const data = await res.json();
      return data.csrfToken;
    } catch {
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bn.title || !formData.bn.summary || !formData.bn.incidentStory) {
      setStatusMsg({
        type: 'error',
        text: isBn ? 'বাংলা শিরোনাম, সারসংক্ষেপ ও ঘটনার বিবরণ আবশ্যিক' : 'Bangla title, summary, and incident story are required',
      });
      return;
    }

    try {
      setSubmitting(true);
      setStatusMsg({ type: '', text: '' });
      const csrfToken = await getCsrfToken();

      const url = existingReport
        ? `/api/v1/admin/public-reports/${existingReport._id}`
        : `/api/v1/admin/complaints/${id}/public-report`;
      const method = existingReport ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error?.message || (isBn ? 'পাবলিক রিপোর্ট প্রকাশ করতে ব্যর্থ হয়েছে' : 'Failed to publish public report'));

      setStatusMsg({
        type: 'success',
        text: isBn ? 'পাবলিক রিপোর্ট সফলভাবে সংরক্ষিত ও প্রকাশিত হয়েছে!' : 'Public report published successfully!',
      });

      setTimeout(() => {
        router.push(`/admin/complaints/${id}`);
      }, 1500);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const updateAccused = (idx, field, val) => {
    const list = [...formData.publicAccused];
    list[idx] = { ...list[idx], [field]: val };
    setFormData({ ...formData, publicAccused: list });
  };

  const addAccused = () => {
    setFormData({
      ...formData,
      publicAccused: [...formData.publicAccused, { name: '', role: isBn ? 'অভিযুক্ত' : 'Accused', organization: '' }],
    });
  };

  const removeAccused = (idx) => {
    setFormData({
      ...formData,
      publicAccused: formData.publicAccused.filter((_, i) => i !== idx),
    });
  };

  const updateVictim = (idx, field, val) => {
    const list = [...formData.publicVictims];
    list[idx] = { ...list[idx], [field]: val };
    setFormData({ ...formData, publicVictims: list });
  };

  const addVictim = () => {
    setFormData({
      ...formData,
      publicVictims: [...formData.publicVictims, { name: isBn ? 'পরিচয় গোপনীয়' : 'Identity Protected', category: isBn ? 'ভুক্তভোগী' : 'Victim' }],
    });
  };

  const removeVictim = (idx) => {
    setFormData({
      ...formData,
      publicVictims: formData.publicVictims.filter((_, i) => i !== idx),
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-xs text-slate-400">
        {isBn ? 'লোড হচ্ছে...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-6 text-xs">
        <div className="flex items-center justify-between">
          <Link
            href={`/admin/complaints/${id}`}
            className="inline-flex items-center gap-2 text-brand-blue dark:text-blue-400 font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {isBn ? 'অভিযোগের বিস্তারিত পৃষ্ঠায় ফিরে যান' : 'Back to Complaint Details'}
          </Link>
          <span className="font-mono text-[11px] px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold">
            {existingReport ? (isBn ? 'রিপোর্ট সম্পাদনা' : 'EDITING REPORT') : (isBn ? 'নতুন পাবলিক রিপোর্ট' : 'NEW PUBLIC REPORT')}
          </span>
        </div>

        <div className="dossier-card-elevated p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-navy dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-blue" />
              <span>{isBn ? 'পাবলিক রিপোর্ট বিল্ডার ও প্রকাশনা' : 'Public Report Builder & Publisher'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {isBn
                ? 'মানবাধিকার আইনি মানদণ্ড অনুযায়ী নিরপেক্ষ ভাষায় জনসমক্ষে প্রকাশের উপযুক্ত রিপোর্ট প্রস্তুত করুন।'
                : 'Prepare legally sanitized, neutral-language public report according to human rights standards.'}
            </p>
          </div>
          <div className="md:text-right">
            <span className="font-mono text-[10px] text-slate-400 block uppercase">Reference</span>
            <span className="font-mono text-sm text-brand-navy dark:text-white font-bold">{complaint?.trackingNumber || id}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">{isBn ? 'আইনি নিরপেক্ষতা ও গোপনীয়তার নীতিমালা:' : 'Legal Neutrality & Privacy Rules:'}</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>{isBn ? 'ভুক্তভোগীর পরিচয় সর্বদা সংরক্ষিত রাখুন (প্রয়োজনে "পরিচয় গোপনীয়" রাখুন)।' : 'Always protect victim identity unless explicit public approval exists.'}</li>
              <li>{isBn ? 'অভিযুক্তকে আদালত দোষী সাব্যস্ত না করা পর্যন্ত নিরপেক্ষ ভাষায় "অভিযুক্ত" হিসেবে উল্লেখ করুন।' : 'Refer to accused parties strictly using neutral terminology until official court judgment.'}</li>
            </ul>
          </div>
        </div>

        {statusMsg.text && (
          <div className={`p-4 rounded-xl border flex items-center gap-2 ${
            statusMsg.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          }`}>
            {statusMsg.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('bn')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'bn'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              {isBn ? 'বাংলা সংস্করণ (আবশ্যক)' : 'Bangla Version (Required)'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('en')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'en'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              {isBn ? 'ইংরেজি সংস্করণ (ঐচ্ছিক)' : 'English Version (Optional)'}
            </button>
          </div>

          <div className="dossier-card p-6 rounded-3xl space-y-5">
            <h2 className="text-base font-bold text-brand-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FileText className="w-4 h-4 text-brand-blue" />
              {activeTab === 'bn' ? (isBn ? 'বাংলা কনটেন্ট বিবরণ' : 'Bangla Content Details') : (isBn ? 'ইংরেজি কনটেন্ট বিবরণ' : 'English Content Details')}
            </h2>

            <div>
              <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
                {activeTab === 'bn' ? (isBn ? 'রিপোর্ট শিরোনাম (বাংলা) *' : 'Report Title (Bangla) *') : (isBn ? 'রিপোর্ট শিরোনাম (ইংরেজি)' : 'Report Title (English)')}
              </label>
              <input
                type="text"
                required={activeTab === 'bn'}
                value={formData[activeTab].title}
                onChange={(e) => setFormData({ ...formData, [activeTab]: { ...formData[activeTab], title: e.target.value } })}
                className="editorial-input px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
                {activeTab === 'bn' ? (isBn ? 'সারসংক্ষেপ (বাংলা) *' : 'Executive Summary (Bangla) *') : (isBn ? 'সারসংক্ষেপ (ইংরেজি)' : 'Executive Summary (English)')}
              </label>
              <textarea
                rows={3}
                required={activeTab === 'bn'}
                value={formData[activeTab].summary}
                onChange={(e) => setFormData({ ...formData, [activeTab]: { ...formData[activeTab], summary: e.target.value } })}
                className="editorial-input px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
                {activeTab === 'bn' ? (isBn ? 'ঘটনার বিস্তারিত নিরপেক্ষ বিবরণ *' : 'Detailed Factual Incident Story (Bangla) *') : (isBn ? 'ঘটনার বিবরণ (ইংরেজি)' : 'Detailed Factual Incident Story (English)')}
              </label>
              <textarea
                rows={8}
                required={activeTab === 'bn'}
                value={formData[activeTab].incidentStory}
                onChange={(e) => setFormData({ ...formData, [activeTab]: { ...formData[activeTab], incidentStory: e.target.value } })}
                className="editorial-input px-3.5 py-2.5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
                  {activeTab === 'bn' ? (isBn ? 'আইনি পদক্ষেপের সারসংক্ষেপ' : 'Legal Summary (Bangla)') : (isBn ? 'আইনি পদক্ষেপ (ইংরেজি)' : 'Legal Summary (English)')}
                </label>
                <textarea
                  rows={3}
                  value={formData[activeTab].legalSummary}
                  onChange={(e) => setFormData({ ...formData, [activeTab]: { ...formData[activeTab], legalSummary: e.target.value } })}
                  className="editorial-input px-3.5 py-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
                  {activeTab === 'bn' ? (isBn ? 'প্রশাসনিক উদ্যোগের সারসংক্ষেপ' : 'Authority Action Summary (Bangla)') : (isBn ? 'প্রশাসনিক উদ্যোগ (ইংরেজি)' : 'Authority Action Summary (English)')}
                </label>
                <textarea
                  rows={3}
                  value={formData[activeTab].authorityActionSummary}
                  onChange={(e) => setFormData({ ...formData, [activeTab]: { ...formData[activeTab], authorityActionSummary: e.target.value } })}
                  className="editorial-input px-3.5 py-2.5"
                />
              </div>
            </div>
          </div>

          <div className="dossier-card p-6 rounded-3xl space-y-4">
            <h2 className="text-base font-bold text-brand-navy dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-brand-blue" />
              {isBn ? 'আইনি মামলার সামগ্রিক স্থিতি' : 'Overall Case & Legal Status'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
                  {isBn ? 'মামলার বর্তমান স্ট্যাটাস' : 'Current Case Status'}
                </label>
                <select
                  value={formData.caseStatus}
                  onChange={(e) => setFormData({ ...formData, caseStatus: e.target.value })}
                  className="editorial-input px-3.5 py-2.5"
                >
                  <option value="under_review">{isBn ? 'তদন্তাধীন / পর্যালোচনায়' : 'Under Investigation / Review'}</option>
                  <option value="fir_filed">{isBn ? 'এফআইআর / মামলা দায়েরকৃত' : 'FIR / Case Filed'}</option>
                  <option value="chargesheet_submitted">{isBn ? 'চার্জশিট দাখিলকৃত' : 'Charge Sheet Submitted'}</option>
                  <option value="trial_ongoing">{isBn ? 'বিচারকার্য চলমান' : 'Trial Ongoing'}</option>
                  <option value="resolved">{isBn ? 'নিষ্পত্তিকৃত / রায় প্রদত্ত' : 'Resolved / Judgment Delivered'}</option>
                  <option value="dismissed">{isBn ? 'খারিজকৃত' : 'Dismissed'}</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
                  {isBn ? 'আইনি ফলাফল বা নির্দেশ' : 'Legal Outcome'}
                </label>
                <input
                  type="text"
                  value={formData.legalOutcome}
                  onChange={(e) => setFormData({ ...formData, legalOutcome: e.target.value })}
                  className="editorial-input px-3.5 py-2.5"
                />
              </div>
            </div>
          </div>

          <div className="dossier-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-brand-navy dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                {isBn ? 'পাবলিক ভুক্তভোগী তালিকা (গোপনীয়তা সংরক্ষিত)' : 'Public Victims (Sanitized)'}
              </h2>
              <button
                type="button"
                onClick={addVictim}
                className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-brand-navy dark:text-white font-semibold rounded-full"
              >
                + {isBn ? 'যোগ করুন' : 'Add'}
              </button>
            </div>
            {formData.publicVictims.map((v, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <input
                  type="text"
                  value={v.name}
                  onChange={(e) => updateVictim(idx, 'name', e.target.value)}
                  placeholder={isBn ? 'নাম বা ছদ্মনাম' : 'Name or pseudonym'}
                  className="editorial-input flex-1 px-3 py-1.5"
                />
                <input
                  type="text"
                  value={v.category}
                  onChange={(e) => updateVictim(idx, 'category', e.target.value)}
                  placeholder={isBn ? 'ধরন' : 'Category'}
                  className="editorial-input sm:w-48 px-3 py-1.5"
                />
                <button type="button" onClick={() => removeVictim(idx)} className="text-rose-600 font-bold px-2">
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="dossier-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-brand-navy dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" />
                {isBn ? 'পাবলিক অভিযুক্ত ব্যক্তি / কর্তৃপক্ষ' : 'Public Accused / Entities'}
              </h2>
              <button
                type="button"
                onClick={addAccused}
                className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-brand-navy dark:text-white font-semibold rounded-full"
              >
                + {isBn ? 'যোগ করুন' : 'Add'}
              </button>
            </div>
            {formData.publicAccused.map((a, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <input
                  type="text"
                  value={a.name}
                  onChange={(e) => updateAccused(idx, 'name', e.target.value)}
                  placeholder={isBn ? 'নাম' : 'Name'}
                  className="editorial-input px-3 py-1.5"
                />
                <input
                  type="text"
                  value={a.role}
                  onChange={(e) => updateAccused(idx, 'role', e.target.value)}
                  placeholder={isBn ? 'পদবি' : 'Role'}
                  className="editorial-input px-3 py-1.5"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={a.organization}
                    onChange={(e) => updateAccused(idx, 'organization', e.target.value)}
                    placeholder={isBn ? 'প্রতিষ্ঠান' : 'Organization'}
                    className="editorial-input flex-1 px-3 py-1.5"
                  />
                  <button type="button" onClick={() => removeAccused(idx)} className="text-rose-600 font-bold px-2">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              href={`/admin/complaints/${id}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-navy dark:text-white font-semibold text-center"
            >
              {isBn ? 'বাতিল করুন' : 'Cancel'}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
            >
              {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              {existingReport ? (isBn ? 'রিপোর্ট আপডেট করুন' : 'Update Report') : (isBn ? 'পাবলিক রিপোর্ট প্রকাশ করুন' : 'Publish Report')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
