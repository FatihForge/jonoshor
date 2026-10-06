import { userService } from '../../../services/user/userService.js';
import { renderUserNav } from '../../../components/user/UserNav.js';
import { formatDateTime } from '../../../utils/formatters.js';

export async function renderUserMessagesPage(container, initialConversationId = null) {
  let conversations = [];
  let selectedConversationId = initialConversationId;
  let activeMessages = [];
  let isLoadingConversations = true;
  let isLoadingMessages = false;
  let isSendingReply = false;
  let errorMessage = null;
  let successMessage = null;

  function render() {
    container.innerHTML = `
      <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        ${renderUserNav('messages')}

        <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <!-- Page Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-xl shadow-lg">
                  💬
                </div>
                <div>
                  <h1 class="text-2xl font-bold text-white tracking-tight">বার্তা ও প্রশাসনিক যোগাযোগ</h1>
                  <p class="text-xs text-slate-400 mt-0.5">তদন্তকারী অ্যাডমিন দলের সাথে নিরাপদ ও সরাসরি মেসেজিং কথোপকথন</p>
                </div>
              </div>
            </div>

            <button id="refresh-convs-btn" class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs transition self-start sm:self-auto" title="রিফ্রেশ">
              <svg class="w-4 h-4 ${isLoadingConversations ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <!-- Alert Banners -->
          ${
            errorMessage
              ? `
            <div class="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center justify-between">
              <span>⚠️ ${errorMessage}</span>
              <button id="dismiss-err-btn" class="text-red-400 hover:text-red-200">✕</button>
            </div>
          `
              : ''
          }

          ${
            successMessage
              ? `
            <div class="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between">
              <span>✓ ${successMessage}</span>
              <button id="dismiss-succ-btn" class="text-emerald-400 hover:text-emerald-200">✕</button>
            </div>
          `
              : ''
          }

          <!-- Messaging Layout: 2 Columns on desktop -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl min-h-[550px]">
            <!-- Left: Conversations List (5 cols) -->
            <div class="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col bg-slate-900/40">
              <div class="p-4 border-b border-slate-800 flex items-center justify-between">
                <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">কথোপকথনসমূহ</span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  ${conversations.length} টি
                </span>
              </div>

              <div class="flex-1 overflow-y-auto divide-y divide-slate-800/80 max-h-[500px]">
                ${
                  isLoadingConversations
                    ? `
                  <div class="p-8 text-center text-xs text-slate-500">কথোপকথন লোড হচ্ছে...</div>
                `
                    : conversations.length === 0
                    ? `
                  <div class="p-8 text-center space-y-2">
                    <span class="text-3xl block">✉️</span>
                    <p class="text-xs font-semibold text-slate-300">কোনো কথোপকথন নেই</p>
                    <p class="text-[11px] text-slate-500 leading-relaxed">
                      অভিযোগ সংক্রান্ত প্রয়োজনে অ্যাডমিন দল থেকে বার্তা পাঠানো হলে এখানে প্রদর্শিত হবে।
                    </p>
                  </div>
                `
                    : conversations
                        .map((conv) => {
                          const isSelected = conv.conversationId === selectedConversationId;
                          return `
                        <button 
                          data-conv-id="${conv.conversationId}"
                          class="w-full text-left p-4 transition flex flex-col gap-1.5 ${
                            isSelected
                              ? 'bg-indigo-950/60 border-l-4 border-indigo-500'
                              : 'hover:bg-slate-800/40'
                          }"
                        >
                          <div class="flex items-center justify-between gap-2">
                            <span class="text-xs font-bold text-white truncate">
                              ${conv.complaintId ? 'অভিযোগ সংক্রান্ত বার্তা' : 'প্রশাসনিক যোগাযোগ'}
                            </span>
                            ${
                              conv.unread
                                ? `
                              <span class="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500 text-white font-bold">
                                নতুন
                              </span>
                            `
                                : ''
                            }
                          </div>

                          <p class="text-xs text-slate-300 truncate">
                            ${conv.lastMessage || 'কোনো পূর্ববর্তী বার্তা নেই'}
                          </p>

                          <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                            <span>${formatDateTime(conv.lastMessageAt)}</span>
                            ${conv.complaintId ? `<span class="text-slate-400 font-mono">ID: ${String(conv.complaintId).slice(-6)}</span>` : ''}
                          </div>
                        </button>
                      `;
                        })
                        .join('')
                }
              </div>
            </div>

            <!-- Right: Active Conversation Thread (7 cols) -->
            <div class="md:col-span-7 flex flex-col bg-slate-950/40">
              ${
                !selectedConversationId
                  ? `
                <div class="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <span class="text-4xl">💬</span>
                  <h3 class="text-sm font-bold text-slate-300">একটি কথোপকথন নির্বাচন করুন</h3>
                  <p class="text-xs text-slate-500 max-w-sm">
                    বামপাশের তালিকা থেকে যেকোনো মেসেজ থ্রেড বেছে নিয়ে বিস্তারিত বার্তা দেখুন এবং উত্তর দিন।
                  </p>
                </div>
              `
                  : `
                <!-- Thread Header -->
                <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                  <div class="space-y-0.5">
                    <span class="text-xs font-bold text-white block">মেসেজ থ্রেড</span>
                    <span class="text-[10px] font-mono text-slate-500 truncate block">
                      ${selectedConversationId}
                    </span>
                  </div>

                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    অপরিবর্তনযোগ্য (Immutable)
                  </span>
                </div>

                <!-- Messages Stream -->
                <div id="messages-container" class="flex-1 p-5 overflow-y-auto space-y-4 max-h-[360px]">
                  ${
                    isLoadingMessages
                      ? `
                    <div class="py-12 text-center text-xs text-slate-500">বার্তা লোড হচ্ছে...</div>
                  `
                      : activeMessages.length === 0
                      ? `
                    <div class="py-12 text-center text-xs text-slate-500">এই থ্রেডে কোনো বার্তা পাওয়া যায়নি।</div>
                  `
                      : activeMessages.map((m) => renderMessageBubble(m)).join('')
                  }
                </div>

                <!-- Reply Input Area -->
                <div class="p-4 border-t border-slate-800 bg-slate-900/80 space-y-3">
                  <div class="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>* বার্তা পাঠানোর পর তা মুছে ফেলা বা পরিবর্তন করা যায় না (Section 33)।</span>
                  </div>

                  <form id="reply-form" class="space-y-3">
                    <textarea 
                      id="reply-body-input" 
                      rows="3" 
                      placeholder="আপনার উত্তর বা প্রয়োজনীয় তথ্য লিখুন..." 
                      class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                      required
                    ></textarea>

                    <div class="flex items-center justify-end gap-3">
                      <button 
                        type="submit" 
                        id="send-reply-btn"
                        class="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition flex items-center gap-2 ${
                          isSendingReply ? 'opacity-60 cursor-not-allowed' : ''
                        }"
                        ${isSendingReply ? 'disabled' : ''}
                      >
                        <span>${isSendingReply ? 'পাঠানো হচ্ছে...' : 'উত্তর পাঠান'}</span>
                        <span>➤</span>
                      </button>
                    </div>
                  </form>
                </div>
              `
              }
            </div>
          </div>
        </main>
      </div>
    `;

    attachEvents();
  }

  function renderMessageBubble(msg) {
    const isAdmin = msg.senderType === 'admin';

    return `
      <div class="flex flex-col ${isAdmin ? 'items-start' : 'items-end'} space-y-1">
        <div class="flex items-center gap-2">
          ${
            isAdmin
              ? `
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              🛡️ অ্যাডমিন
            </span>
          `
              : `
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              👤 আপনি
            </span>
          `
          }
          <span class="text-[10px] text-slate-500 font-mono">${formatDateTime(msg.createdAt)}</span>
        </div>

        <div class="max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
          isAdmin
            ? 'bg-slate-800/90 text-slate-100 rounded-tl-sm border border-slate-700'
            : 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
        }">
          <p class="whitespace-pre-wrap">${msg.body}</p>

          ${
            msg.attachmentEvidenceIds && msg.attachmentEvidenceIds.length > 0
              ? `
            <div class="mt-2 pt-2 border-t border-slate-700/60 text-[10px] text-slate-300">
              <span>সংযুক্ত প্রমাণপত্র: ${msg.attachmentEvidenceIds.length} টি</span>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
  }

  function attachEvents() {
    const refreshBtn = container.querySelector('#refresh-convs-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        loadConversations();
      });
    }

    const dismissErrBtn = container.querySelector('#dismiss-err-btn');
    if (dismissErrBtn) {
      dismissErrBtn.addEventListener('click', () => {
        errorMessage = null;
        render();
      });
    }

    const dismissSuccBtn = container.querySelector('#dismiss-succ-btn');
    if (dismissSuccBtn) {
      dismissSuccBtn.addEventListener('click', () => {
        successMessage = null;
        render();
      });
    }

    // Select conversation
    const convButtons = container.querySelectorAll('button[data-conv-id]');
    convButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const convId = btn.getAttribute('data-conv-id');
        if (convId !== selectedConversationId) {
          selectedConversationId = convId;
          render();
          loadConversationMessages(convId);
        }
      });
    });

    // Reply form
    const replyForm = container.querySelector('#reply-form');
    if (replyForm) {
      replyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = container.querySelector('#reply-body-input');
        const text = input ? input.value.trim() : '';
        if (!text) return;

        isSendingReply = true;
        errorMessage = null;
        render();

        try {
          await userService.replyMessage(selectedConversationId, {
            body: text,
          });

          successMessage = 'বার্তা সফলভাবে পাঠানো হয়েছে।';
          await loadConversationMessages(selectedConversationId);
          await loadConversations(false);
        } catch (err) {
          errorMessage = err.message || 'বার্তা পাঠাতে ব্যর্থ হয়েছে।';
        } finally {
          isSendingReply = false;
          render();
        }
      });
    }
  }

  async function loadConversationMessages(convId) {
    isLoadingMessages = true;
    errorMessage = null;
    render();

    try {
      const res = await userService.getConversation(convId);
      activeMessages = Array.isArray(res.data) ? res.data : [];

      // Auto scroll to bottom
      setTimeout(() => {
        const msgContainer = container.querySelector('#messages-container');
        if (msgContainer) {
          msgContainer.scrollTop = msgContainer.scrollHeight;
        }
      }, 50);
    } catch (err) {
      errorMessage = err.message || 'মেসেজ লোড করতে ব্যর্থ হয়েছে।';
    } finally {
      isLoadingMessages = false;
      render();
    }
  }

  async function loadConversations(selectFirst = true) {
    isLoadingConversations = true;
    errorMessage = null;
    render();

    try {
      const res = await userService.listConversations();
      conversations = Array.isArray(res.data) ? res.data : [];

      if (selectFirst && !selectedConversationId && conversations.length > 0) {
        selectedConversationId = conversations[0].conversationId;
        await loadConversationMessages(selectedConversationId);
        return;
      }
    } catch (err) {
      errorMessage = err.message || 'কথোপকথন তালিকা লোড করতে ব্যর্থ হয়েছে।';
    } finally {
      isLoadingConversations = false;
      render();
    }
  }

  await loadConversations();
  if (selectedConversationId) {
    await loadConversationMessages(selectedConversationId);
  }
}
