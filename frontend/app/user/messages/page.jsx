'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function UserMessagesPage() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyBody, setReplyBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/v1/user/messages', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const list = d.data || [];
        setConversations(list);
        if (list.length > 0) setActiveConvId(list[0].conversationId);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetch(`/api/v1/user/messages/${activeConvId}`, { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => setMessages(d.data || []))
        .catch(() => {});
    }
  }, [activeConvId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyBody.trim() || !activeConvId) return;
    setSending(true);

    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();

      const res = await fetch(`/api/v1/user/messages/${activeConvId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' },
        body: JSON.stringify({ body: replyBody }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || (isBn ? 'মেসেজ পাঠানো সম্ভব হয়নি।' : 'Could not send message.'));

      setMessages([...messages, data.data]);
      setReplyBody('');
    } catch {
      // handled silently
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#F8FAFF] dark:bg-canvas-dark min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <Link href="/user/dashboard" className="inline-flex items-center gap-1.5 text-brand-blue dark:text-blue-400 font-bold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>{isBn ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}</span>
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            {isBn ? 'এনক্রিপ্টেড কেসওয়ার্ক থ্রেড' : 'Encrypted Caseworker Thread'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[580px]">
          <div className="dossier-card p-4 rounded-2xl flex flex-col space-y-3">
            <div className="font-bold text-sm text-brand-navy dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <MessageSquare className="w-4 h-4 text-brand-blue" />
              <span>{isBn ? 'বার্তা থ্রেড' : 'Message Threads'}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-10 text-slate-400">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</div>
              ) : conversations.length > 0 ? (
                conversations.map((conv) => (
                  <button
                    key={conv.conversationId}
                    onClick={() => setActiveConvId(conv.conversationId)}
                    className={`w-full p-3 rounded-xl text-left transition-colors border ${
                      activeConvId === conv.conversationId
                        ? 'bg-brand-blue text-white border-brand-blue'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-brand-navy dark:text-slate-200 hover:bg-blue-50/50'
                    }`}
                  >
                    <div className="font-mono font-semibold truncate">{conv.conversationId}</div>
                    <div className="text-[11px] opacity-80 truncate mt-1">{conv.lastMessage}</div>
                  </button>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">
                  {isBn ? 'কোনো মেসেজ নেই' : 'No message threads'}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 dossier-card p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.senderType === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-md p-3.5 rounded-2xl leading-relaxed border ${
                    m.senderType === 'user'
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-slate-50 dark:bg-slate-900 text-brand-navy dark:text-slate-200 border-slate-100 dark:border-slate-800'
                  }`}>
                    <p>{m.body}</p>
                    <span className={`text-[10px] font-mono mt-1 block text-right ${m.senderType === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                      {new Date(m.createdAt).toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder={isBn ? 'তদন্ত কর্মকর্তাকে উত্তর লিখুন (অপরিবর্তনযোগ্য)...' : 'Reply to case investigator (immutable log)...'}
                className="editorial-input flex-1 px-4 py-2.5 rounded-full"
              />
              <button type="submit" disabled={sending || !replyBody.trim()} className="px-5 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white font-bold flex items-center gap-1.5 disabled:opacity-50">
                <Send className="w-4 h-4" />
                <span>{isBn ? 'পাঠান' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
