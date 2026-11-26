'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';

export default function UserMessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyBody, setReplyBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/v1/user/messages', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const list = d.data || [];
        setConversations(list);
        if (list.length > 0) {
          setActiveConvId(list[0].conversationId);
        }
      })
      .catch((err) => setError(err.message))
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
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken || '',
        },
        body: JSON.stringify({ body: replyBody }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'মেসেজ পাঠানো সম্ভব হয়নি।');

      setMessages([...messages, data.data]);
      setReplyBody('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6 text-xs">
      <div>
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-1.5 text-brand-slate hover:text-brand-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ড্যাশবোর্ডে ফিরুন</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="glass-panel p-4 rounded-2xl border border-canvas-border flex flex-col space-y-3">
          <div className="font-bold text-sm text-brand-text flex items-center gap-2 pb-2 border-b border-canvas-border">
            <MessageSquare className="w-4 h-4 text-brand-blue" />
            <span>বার্তা থ্রেড</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv.conversationId}
                  onClick={() => setActiveConvId(conv.conversationId)}
                  className={`w-full p-3 rounded-xl text-left transition-colors border ${
                    activeConvId === conv.conversationId
                      ? 'bg-canvas-card border-brand-blue/40 text-brand-text'
                      : 'border-canvas-border/40 text-brand-slate hover:bg-canvas-card'
                  }`}
                >
                  <div className="font-semibold truncate">{conv.conversationId}</div>
                  <div className="text-[11px] text-brand-slate/80 truncate mt-1">{conv.lastMessage}</div>
                </button>
              ))
            ) : (
              <div className="text-center py-10 text-brand-slate">কোনো মেসেজ নেই</div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="md:col-span-2 glass-panel p-4 rounded-2xl border border-canvas-border flex flex-col justify-between">
          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.senderType === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md p-3 rounded-2xl leading-relaxed ${
                    m.senderType === 'user'
                      ? 'bg-brand-emerald/20 text-brand-text border border-brand-emerald/30'
                      : 'bg-canvas-card text-brand-text border border-canvas-border'
                  }`}
                >
                  <p>{m.body}</p>
                  <span className="text-[10px] text-brand-slate mt-1 block text-right">
                    {new Date(m.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-canvas-border flex gap-2">
            <input
              type="text"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="তদন্ত কর্মকর্তাকে উত্তর লিখুন (অপরিবর্তনযোগ্য)..."
              className="flex-1 px-3.5 py-2.5 bg-canvas-card border border-canvas-border rounded-xl text-brand-text focus:outline-none focus:border-brand-blue"
            />
            <button
              type="submit"
              disabled={sending || !replyBody.trim()}
              className="px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>পাঠান</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
