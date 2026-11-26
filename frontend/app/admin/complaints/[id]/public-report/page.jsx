'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, ArrowLeft, ShieldCheck, AlertTriangle, CheckCircle2, 
  Send, Globe, UserCheck, Eye, EyeOff, Scale, Building2
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

  // Form State
  const [formData, setFormData] = useState({
    bn: {
      title: '',
      summary: '',
      incidentStory: '',
      legalSummary: '',
      authorityActionSummary: '',
    },
    en: {
      title: '',
      summary: '',
      incidentStory: '',
      legalSummary: '',
      authorityActionSummary: '',
    },
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
      // Fetch complaint
      const cRes = await fetch(`/api/v1/admin/complaints/${id}`, { credentials: 'include' });
      if (!cRes.ok) throw new Error('অভিযোগের তথ্য লোড করতে ব্যর্থ হয়েছে');
      const cData = await cRes.json();
      const comp = cData.data || cData;
      setComplaint(comp);

      // Check if public report already exists
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

      // Pre-populate defaults from verified complaint
      setFormData(prev => ({
        ...prev,
        bn: {
          title: comp.title || '',
          summary: comp.description ? comp.description.slice(0, 200) + '...' : '',
          incidentStory: comp.description || '',
          legalSummary: '',
          authorityActionSummary: '',
        },
        publicAccused: (comp.accused || []).map(a => ({
          name: a.name || 'অজ্ঞাত ব্যক্তি',
          role: a.role || 'অভিযুক্ত',
          organization: a.organization || '',
        })),
        publicVictims: (comp.victims || []).map(v => ({
          name: v.minor || v.isAnonymous ? 'পরিচয় গোপনীয়' : (v.name || 'ভুক্তভোগী'),
          category: v.relationshipToIncident || 'ভুক্তভোগী',
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
      setStatusMsg({ type: 'error', text: 'বাংলা শিরোনাম, সারসংক্ষেপ ও ঘটনার বিবরণ আবশ্যিক' });
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
      if (!res.ok) throw new Error(data.message || 'পাবলিক রিপোর্ট প্রকাশ করতে ব্যর্থ হয়েছে');

      setStatusMsg({ 
        type: 'success', 
        text: isBn ? 'পাবলিক রিপোর্ট সফলভাবে সংরক্ষিত ও প্রকাশিত হয়েছে!' : 'Public report published successfully!' 
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
      publicAccused: [...formData.publicAccused, { name: '', role: 'অভিযুক্ত', organization: '' }]
    });
  };

  const removeAccused = (idx) => {
    setFormData({
      ...formData,
      publicAccused: formData.publicAccused.filter((_, i) => i !== idx)
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
      publicVictims: [...formData.publicVictims, { name: 'পরিচয় গোপনীয়', category: 'ভুক্তভোগী' }]
    });
  };

  const removeVictim = (idx) => {
    setFormData({
      ...formData,
      publicVictims: formData.publicVictims.filter((_, i) => i !== idx)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-dark text-slate-100 flex items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-dark text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/admin/complaints/${id}`}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {isBn ? 'অভিযোগের বিস্তারিত পৃষ্ঠায় ফিরে যান' : 'Back to Complaint Details'}
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300">
            {existingReport ? (isBn ? 'বিদ্যমান রিপোর্ট সম্পাদনা' : 'Editing Existing Report') : (isBn ? 'নতুন পাবলিক রিপোর্ট' : 'New Public Report')}
          </span>
        </div>

        {/* Header Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <FileText className="w-6 h-6" />
                </span>
                <h1 className="text-2xl font-bold text-slate-100">
                  {isBn ? 'পাবলিক রিপোর্ট বিল্ডার ও প্রকাশনা' : 'Public Report Builder & Publisher'}
                </h1>
              </div>
              <p className="text-sm text-slate-400">
                {isBn 
                  ? 'মানবাধিকার আইনি মানদণ্ড অনুযায়ী নিরপেক্ষ ভাষায় জনসমক্ষে প্রকাশের উপযুক্ত রিপোর্ট প্রস্তুত করুন।'
                  : 'Prepare legally sanitized, neutral-language public report according to human rights standards.'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">{isBn ? 'ট্র্যাকিং নম্বর' : 'Tracking Number'}</span>
              <span className="font-mono text-sm text-emerald-400 font-semibold">{complaint?.trackingNumber || id}</span>
            </div>
          </div>
        </div>

        {/* Human Rights Neutrality Alert */}
        <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/20 text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-semibold">{isBn ? 'আইনি নিরপেক্ষতা ও গোপনীয়তার নীতিমালা:' : 'Legal Neutrality & Privacy Rules:'}</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-200/80">
              <li>{isBn ? 'ভুক্তভোগীর পরিচয় সর্বদা সংরক্ষিত রাখুন (প্রয়োজনে "পরিচয় গোপনীয়" রাখুন)।' : 'Always protect victim identity unless explicit public approval exists.'}</li>
              <li>{isBn ? 'অভিযুক্তকে আদালত দোষী সাব্যস্ত না করা পর্যন্ত নিরপেক্ষ ভাষায় "অভিযুক্ত" হিসেবে উল্লেখ করুন।' : 'Refer to accused parties strictly using neutral terminology until official court judgment.'}</li>
              <li>{isBn ? 'প্রমাণিত তথ্যের বাইরে কোনো আনুমানিক বা ভিত্তিহীন তথ্য অন্তর্ভুক্ত করবেন না।' : 'Include only verified facts established during official review.'}</li>
            </ul>
          </div>
        </div>

        {statusMsg.text && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            statusMsg.type === 'error'
              ? 'bg-rose-950/40 border-rose-900/50 text-rose-300'
              : 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
          }`}>
            {statusMsg.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Main Editor Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language Switcher Tabs */}
          <div className="flex gap-2 border-b border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('bn')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'bn'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              {isBn ? 'বাংলা সংস্করণ (আবশ্যক)' : 'Bangla Version (Required)'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('en')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'en'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              {isBn ? 'ইংরেজি সংস্করণ (ঐচ্ছিক)' : 'English Version (Optional)'}
            </button>
          </div>

          {/* Bilingual Editor Content */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-5">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              {activeTab === 'bn' ? 'বাংলা কনটেন্ট বিবরণ' : 'English Content Details'}
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {activeTab === 'bn' ? 'রিপোর্ট শিরোনাম *' : 'Report Title (English)'}
              </label>
              <input
                type="text"
                required={activeTab === 'bn'}
                value={formData[activeTab].title}
                onChange={(e) => setFormData({
                  ...formData,
                  [activeTab]: { ...formData[activeTab], title: e.target.value }
                })}
                placeholder={activeTab === 'bn' ? 'সংক্ষিপ্ত ও সুস্পষ্ট শিরোনাম দিন...' : 'Provide clear and neutral title...'}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {activeTab === 'bn' ? 'সারসংক্ষেপ (সংক্ষিপ্ত সারাংশ) *' : 'Executive Summary *'}
              </label>
              <textarea
                rows={3}
                required={activeTab === 'bn'}
                value={formData[activeTab].summary}
                onChange={(e) => setFormData({
                  ...formData,
                  [activeTab]: { ...formData[activeTab], summary: e.target.value }
                })}
                placeholder={activeTab === 'bn' ? 'ঘটনার মূল নির্যাস ২-৩ বাক্যে লিখুন...' : 'Key factual summary in 2-3 sentences...'}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Incident Story */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {activeTab === 'bn' ? 'ঘটনার বিস্তারিত নিরপেক্ষ বিবরণ *' : 'Detailed Factual Incident Story *'}
              </label>
              <textarea
                rows={8}
                required={activeTab === 'bn'}
                value={formData[activeTab].incidentStory}
                onChange={(e) => setFormData({
                  ...formData,
                  [activeTab]: { ...formData[activeTab], incidentStory: e.target.value }
                })}
                placeholder={activeTab === 'bn' ? 'ঘটনার সময়ানুক্রমিক ও নিরপেক্ষ বিবরণ লিখুন...' : 'Chronological, verified narrative of the event...'}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            {/* Legal Summary & Authority Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {activeTab === 'bn' ? 'আইনি পদক্ষেপের সারসংক্ষেপ (ঐচ্ছিক)' : 'Legal Summary (Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={formData[activeTab].legalSummary}
                  onChange={(e) => setFormData({
                    ...formData,
                    [activeTab]: { ...formData[activeTab], legalSummary: e.target.value }
                  })}
                  placeholder={activeTab === 'bn' ? 'থানায় মামলা বা আদালতের অগ্রগতি...' : 'FIR, court proceedings status...'}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {activeTab === 'bn' ? 'প্রশাসনিক উদ্যোগের সারসংক্ষেপ (ঐচ্ছিক)' : 'Authority Action Summary (Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={formData[activeTab].authorityActionSummary}
                  onChange={(e) => setFormData({
                    ...formData,
                    [activeTab]: { ...formData[activeTab], authorityActionSummary: e.target.value }
                  })}
                  placeholder={activeTab === 'bn' ? 'প্রশাসন বা তদন্ত কমিটির পদক্ষেপ...' : 'Administrative, departmental actions...'}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Legal Status & Case Outcome */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              {isBn ? 'আইনি মামলার সামগ্রিক স্থিতি' : 'Overall Case & Legal Status'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {isBn ? 'মামলার বর্তমান স্ট্যাটাস' : 'Current Case Status'}
                </label>
                <select
                  value={formData.caseStatus}
                  onChange={(e) => setFormData({ ...formData, caseStatus: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
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
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {isBn ? 'আইনি ফলাফল বা নির্দেশ (যদি থাকে)' : 'Legal Outcome / Directive (If Any)'}
                </label>
                <input
                  type="text"
                  value={formData.legalOutcome}
                  onChange={(e) => setFormData({ ...formData, legalOutcome: e.target.value })}
                  placeholder={isBn ? 'উদা: জামিন বাতিল, ক্ষতিপূরণের নির্দেশ...' : 'e.g., Bail cancelled, compensation ordered...'}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Anonymized Victims */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  {isBn ? 'পাবলিক ভুক্তভোগী তালিকা (গোপনীয়তা নিশ্চিতকরণ)' : 'Public Victims (Sanitized)'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isBn ? 'অপ্রাপ্তবয়স্ক ও সংবেদনশীল ব্যক্তিদের পরিচয় "পরিচয় গোপনীয়" রাখুন।' : 'Keep minors and sensitive individuals as "Identity Protected".'}
                </p>
              </div>
              <button
                type="button"
                onClick={addVictim}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
              >
                + {isBn ? 'ভুক্তভোগী যোগ করুন' : 'Add Victim'}
              </button>
            </div>

            {formData.publicVictims.map((v, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => updateVictim(idx, 'name', e.target.value)}
                    placeholder="পরিচয় গোপনীয়"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <input
                    type="text"
                    value={v.category}
                    onChange={(e) => updateVictim(idx, 'category', e.target.value)}
                    placeholder="ভুক্তভোগী / পরিবার"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVictim(idx)}
                  className="text-xs text-rose-400 hover:text-rose-300 p-1.5"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Neutral Accused Persons */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  {isBn ? 'পাবলিক অভিযুক্ত ব্যক্তি / কর্তৃপক্ষ' : 'Public Accused / Entities'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isBn ? 'আইনি নিরপেক্ষতা বজায় রেখে কেবলমাত্র তথ্যপ্রমাণের ভিত্তিতে নাম ও পদবি প্রদান করুন।' : 'Provide verified names and roles while maintaining legal presumption of innocence.'}
                </p>
              </div>
              <button
                type="button"
                onClick={addAccused}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
              >
                + {isBn ? 'অভিযুক্ত যোগ করুন' : 'Add Accused'}
              </button>
            </div>

            {formData.publicAccused.map((a, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 relative">
                <input
                  type="text"
                  value={a.name}
                  onChange={(e) => updateAccused(idx, 'name', e.target.value)}
                  placeholder={isBn ? 'অভিযুক্তের নাম...' : 'Accused name...'}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
                <input
                  type="text"
                  value={a.role}
                  onChange={(e) => updateAccused(idx, 'role', e.target.value)}
                  placeholder={isBn ? 'পদবি / ভূমিকা...' : 'Role / designation...'}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={a.organization}
                    onChange={(e) => updateAccused(idx, 'organization', e.target.value)}
                    placeholder={isBn ? 'প্রতিষ্ঠান / বিভাগ...' : 'Organization...'}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeAccused(idx)}
                    className="text-xs text-rose-400 hover:text-rose-300 p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link
              href={`/admin/complaints/${id}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition text-center"
            >
              {isBn ? 'বাতিল করুন' : 'Cancel'}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {existingReport 
                ? (isBn ? 'পাবলিক রিপোর্ট আপডেট করুন' : 'Update Public Report') 
                : (isBn ? 'অনুমোদন ও পাবলিক রিপোর্ট প্রকাশ করুন' : 'Publish Public Report')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
