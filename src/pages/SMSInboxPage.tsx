import React, { useState, useMemo } from 'react';
import { MessageSquare, Plus, Search, Phone } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { SMSConversation } from '../components/SMSConversation';
import { sendSMS, formatPhoneE164 } from '../services/smsService';
import { getCurrentOrgId } from '../services/supabaseData';
import type { SmsMessage } from '../types';

interface ConversationThread {
  phoneNumber: string;
  contactId?: string;
  contactName?: string;
  lastMessage: SmsMessage;
  messageCount: number;
  unreadCount: number;
}

const SMSInboxPage: React.FC = () => {
  const { smsMessages, contacts, leads, settings } = useCRM();
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [composePhone, setComposePhone] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeSending, setComposeSending] = useState(false);
  const isDarkMode = settings.branding?.theme === 'dark';

  // Group messages into conversation threads by phone number
  const threads = useMemo(() => {
    const threadMap = new Map<string, ConversationThread>();

    // Sort messages by date (newest first for quick lookup)
    const sorted = [...smsMessages].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    for (const msg of sorted) {
      // Determine the "other party" phone number
      const otherPhone = msg.direction === 'inbound' ? msg.from_number : msg.to_number;
      const cleanPhone = formatPhoneE164(otherPhone);

      if (!threadMap.has(cleanPhone)) {
        threadMap.set(cleanPhone, {
          phoneNumber: otherPhone,
          contactId: msg.contact_id || undefined,
          contactName: msg.contact_name || undefined,
          lastMessage: msg,
          messageCount: 1,
          unreadCount: msg.direction === 'inbound' && msg.status === 'received' ? 1 : 0,
        });
      } else {
        const thread = threadMap.get(cleanPhone)!;
        thread.messageCount++;
        if (msg.direction === 'inbound' && msg.status === 'received') {
          thread.unreadCount++;
        }
        // Fill contact info if missing
        if (!thread.contactName && msg.contact_name) {
          thread.contactName = msg.contact_name;
          thread.contactId = msg.contact_id || undefined;
        }
      }
    }

    return Array.from(threadMap.values());
  }, [smsMessages]);

  // Filter threads by search
  const filteredThreads = useMemo(() => {
    if (!searchFilter.trim()) return threads;
    const q = searchFilter.toLowerCase();
    return threads.filter(t =>
      t.phoneNumber.includes(q) ||
      (t.contactName && t.contactName.toLowerCase().includes(q)) ||
      t.lastMessage.body.toLowerCase().includes(q)
    );
  }, [threads, searchFilter]);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleComposeSend = async () => {
    if (!composePhone.trim() || !composeBody.trim()) return;
    setComposeSending(true);
    try {
      const orgId = await getCurrentOrgId();
      const result = await sendSMS({
        orgId,
        to: formatPhoneE164(composePhone),
        body: composeBody.trim(),
      });
      if (result.success) {
        setShowCompose(false);
        setComposePhone('');
        setComposeBody('');
        // Select the new conversation
        setSelectedPhone(formatPhoneE164(composePhone));
      } else {
        alert(result.error || 'Failed to send SMS');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send SMS');
    } finally {
      setComposeSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-130px)]">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <MessageSquare size={24} className="text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>SMS Inbox</h1>
            <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {threads.length} conversation{threads.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="px-5 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Plus size={14} /> New SMS
        </button>
      </div>

      {/* Main Layout: Sidebar + Conversation */}
      <div className={`flex rounded-[35px] overflow-hidden border shadow-sm h-[calc(100%-80px)] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {/* Left: Conversation List */}
        <div className={`w-80 border-r flex flex-col shrink-0 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          {/* Search */}
          <div className={`p-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search conversations..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare size={32} className="mx-auto text-slate-300 mb-3" />
                <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {searchFilter ? 'No matching conversations' : 'No SMS conversations yet'}
                </p>
              </div>
            ) : (
              filteredThreads.map(thread => {
                const isSelected = selectedPhone === formatPhoneE164(thread.phoneNumber);
                return (
                  <button
                    key={thread.phoneNumber}
                    onClick={() => {
                      setSelectedPhone(formatPhoneE164(thread.phoneNumber));
                      setSelectedThread(thread);
                    }}
                    className={`w-full text-left p-4 border-b transition-colors ${
                      isSelected
                        ? isDarkMode ? 'bg-blue-900/30 border-slate-600' : 'bg-blue-50 border-blue-100'
                        : isDarkMode ? 'hover:bg-slate-700/50 border-slate-700' : 'hover:bg-slate-50 border-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {thread.contactName || 'Unknown'}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">{thread.phoneNumber}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <span className="text-[10px] text-slate-400">{formatTime(thread.lastMessage.createdAt)}</span>
                        {thread.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {thread.lastMessage.direction === 'outbound' && <span className="text-slate-400">You: </span>}
                      {thread.lastMessage.body}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Conversation View */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedPhone && selectedThread ? (
            <SMSConversation
              contactPhone={selectedThread.phoneNumber}
              contactId={selectedThread.contactId}
              contactName={selectedThread.contactName}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <MessageSquare size={36} className="text-slate-300" />
              </div>
              <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Select a conversation</p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Choose from the list or start a new message</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose New SMS Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCompose(false)}>
          <div className="bg-white rounded-[35px] p-10 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className={`text-xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>New SMS</h3>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Recipient Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" value={composePhone} onChange={e => setComposePhone(e.target.value)} placeholder="+61 4XX XXX XXX" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Message</label>
                <textarea value={composeBody} onChange={e => setComposeBody(e.target.value)} rows={4} placeholder="Type your message..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 resize-none" />
                <p className="text-[10px] text-slate-400 mt-1 ml-1">{composeBody.length}/160 ({Math.ceil(composeBody.length / 160) || 1} segment{Math.ceil(composeBody.length / 160) !== 1 ? 's' : ''})</p>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button disabled={composeSending || !composePhone || !composeBody} onClick={handleComposeSend} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50">
                {composeSending ? 'Sending...' : 'Send SMS'}
              </button>
              <button onClick={() => setShowCompose(false)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMSInboxPage;
