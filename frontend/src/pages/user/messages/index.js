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
      <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        ${renderUserNav('messages')}

        <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <!-- Page Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xl shadow-xs" aria-hidden="true">
                  💬
                </div>
                <div>
                  <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Messages & Inquiries</h1>
                  <p class="text-xs text-slate-500 mt-0.5">Secure, direct communications with case investigators and administrators</p>
                </div>
              </div>
            </div>

            <button id="refresh-convs-btn" class="p-2 rounded-lg bg-white border border-slate-300 text-slate-600 hover:text-slate-900 text-xs transition self-start sm:self-auto" title="Refresh conversations" aria-label="Refresh conversations">
              <svg class="w-4 h-4 ${isLoadingConversations ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <!-- Alert Banners -->
          ${
            errorMessage
              ? `
            <div class="p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-center justify-between" role="alert">
              <span>⚠️ ${errorMessage}</span>
              <button id="dismiss-err-btn" class="text-red-600 hover:text-red-800 font-bold" aria-label="Dismiss alert">✕</button>
            </div>
          `
              : ''
          }

          ${
            successMessage
              ? `
            <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between" role="status">
              <span>✓ ${successMessage}</span>
              <button id="dismiss-succ-btn" class="text-emerald-700 hover:text-emerald-900 font-bold" aria-label="Dismiss message">✕</button>
            </div>
          `
              : ''
          }

          <!-- Messaging Layout: 2 Columns on desktop -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[550px]">
            <!-- Left: Conversations List (5 cols) -->
            <div class="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50">
              <div class="p-4 border-b border-slate-200 flex items-center justify-between">
                <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Conversations</span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  ${conversations.length} total
                </span>
              </div>

              <div class="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[500px]">
                ${
                  isLoadingConversations
                    ? `
                  <div class="p-8 text-center text-xs text-slate-500">Loading conversations...</div>
                `
                    : conversations.length === 0
                    ? `
                  <div class="p-8 text-center space-y-2">
                    <span class="text-3xl block" aria-hidden="true">✉️</span>
                    <p class="text-xs font-semibold text-slate-800">No active conversations</p>
                    <p class="text-[11px] text-slate-500 leading-relaxed">
                      Inquiries from the investigation team regarding your cases will appear here.
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
                              ? 'bg-emerald-50 border-l-4 border-emerald-600'
                              : 'hover:bg-slate-100/70'
                          }"
                        >
                          <div class="flex items-center justify-between gap-2">
                            <span class="text-xs font-bold text-slate-900 truncate">
                              ${conv.complaintId ? 'Complaint Inquiry' : 'Administrative Message'}
                            </span>
                            ${
                              conv.unread
                                ? `
                              <span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-600 text-white font-bold">
                                New
                              </span>
                            `
                                : ''
                            }
                          </div>

                          <p class="text-xs text-slate-600 truncate">
                            ${conv.lastMessage || 'No previous messages'}
                          </p>

                          <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                            <span>${formatDateTime(conv.lastMessageAt)}</span>
                            ${conv.complaintId ? `<span class="text-slate-500 font-mono">ID: ${String(conv.complaintId).slice(-6)}</span>` : ''}
                          </div>
                        </button>
                      `;
                        })
                        .join('')
                }
              </div>
            </div>

            <!-- Right: Active Conversation Thread (7 cols) -->
            <div class="md:col-span-7 flex flex-col bg-white">
              ${
                !selectedConversationId
                  ? `
                <div class="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <span class="text-4xl" aria-hidden="true">💬</span>
                  <h3 class="text-sm font-bold text-slate-800">Select a Conversation</h3>
                  <p class="text-xs text-slate-500 max-w-sm">
                    Choose a thread from the list on the left to read messages and submit replies.
                  </p>
                </div>
              `
                  : `
                <!-- Thread Header -->
                <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div class="space-y-0.5">
                    <span class="text-xs font-bold text-slate-900 block">Message Thread</span>
                    <span class="text-[10px] font-mono text-slate-500 truncate block">
                      ${selectedConversationId}
                    </span>
                  </div>

                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    Immutable Record
                  </span>
                </div>

                <!-- Messages Stream -->
                <div id="messages-container" class="flex-1 p-5 overflow-y-auto space-y-4 max-h-[360px]">
                  ${
                    isLoadingMessages
                      ? `
                    <div class="py-12 text-center text-xs text-slate-500">Loading messages...</div>
                  `
                      : activeMessages.length === 0
                      ? `
                    <div class="py-12 text-center text-xs text-slate-500">No messages found in this thread.</div>
                  `
                      : activeMessages.map((m) => renderMessageBubble(m)).join('')
                  }
                </div>

                <!-- Reply Input Area -->
                <div class="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                  <div class="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>* Messages are permanently logged for audit and legal record compliance.</span>
                  </div>

                  <form id="reply-form" class="space-y-3">
                    <label for="reply-body-input" class="sr-only">Reply Message</label>
                    <textarea 
                      id="reply-body-input" 
                      rows="3" 
                      placeholder="Type your response or additional information here..." 
                      class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none"
                      required
                    ></textarea>

                    <div class="flex items-center justify-end gap-3">
                      <button 
                        type="submit" 
                        id="send-reply-btn"
                        class="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-2 ${
                          isSendingReply ? 'opacity-60 cursor-not-allowed' : ''
                        }"
                        ${isSendingReply ? 'disabled' : ''}
                      >
                        <span>${isSendingReply ? 'Sending...' : 'Send Reply'}</span>
                        <span aria-hidden="true">➤</span>
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
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              🛡️ Admin
            </span>
          `
              : `
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
              👤 You
            </span>
          `
          }
          <span class="text-[10px] text-slate-400 font-mono">${formatDateTime(msg.createdAt)}</span>
        </div>

        <div class="max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
          isAdmin
            ? 'bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200'
            : 'bg-emerald-600 text-white rounded-tr-sm shadow-xs'
        }">
          <p class="whitespace-pre-wrap">${msg.body}</p>

          ${
            msg.attachmentEvidenceIds && msg.attachmentEvidenceIds.length > 0
              ? `
            <div class="mt-2 pt-2 border-t ${isAdmin ? 'border-slate-200 text-slate-600' : 'border-emerald-500/60 text-emerald-100'} text-[10px]">
              <span>Attached Evidence Items: ${msg.attachmentEvidenceIds.length}</span>
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

          successMessage = 'Message sent successfully.';
          await loadConversationMessages(selectedConversationId);
          await loadConversations(false);
        } catch (err) {
          errorMessage = err.message || 'Failed to send message.';
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

      setTimeout(() => {
        const msgContainer = container.querySelector('#messages-container');
        if (msgContainer) {
          msgContainer.scrollTop = msgContainer.scrollHeight;
        }
      }, 50);
    } catch (err) {
      errorMessage = err.message || 'Failed to load conversation messages.';
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
      errorMessage = err.message || 'Failed to load conversations list.';
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
