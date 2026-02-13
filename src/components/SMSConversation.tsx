import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Check, CheckCheck, AlertCircle, ChevronDown, Phone } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { sendSMS, formatPhoneE164 } from '../services/smsService';
import { getCurrentOrgId } from '../services/supabaseData';
import type { SmsMessage, SmsNumber } from '../types';

interface SMSConversationProps {
  contactPhone?: string;
  contactId?: string;
  contactName?: string;
  dealId?: string;
  ticketId?: string;
  orgId?: string;
}

export const SMSConversation: React.FC<SMSConversationProps> = ({
  contactPhone,
  contactId,
  contactName,
  dealId,
  ticketId,
  orgId: propOrgId,
}) => {
  const { smsMessages, smsNumbers, settings } = useCRM();
  const [message, setMessage] = useState('');
  const [selectedNumberId, setSelectedNumberId] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const isDarkMode = settings.branding?.theme === 'dark';

  // Filter messages for this conversation
  const conversationMessages = useMemo(() => {
    if (!contactPhone && !contactId) return [];

    return smsMessages
      .filter(msg => {
        if (contactId && msg.contact_id === contactId) return true;
        if (contactPhone) {
          const cleanPhone = formatPhoneE164(contactPhone);
          const cleanFrom = formatPhoneE164(msg.from_number);
          const cleanTo = formatPhoneE164(msg.to_number);
          return cleanFrom === cleanPhone || cleanTo === cleanPhone;
        }
        return false;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [smsMessages, contactPhone, contactId]);

  // Auto-scroll to bottom
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length]);

  // Set default number
  useEffect(() => {
    if (smsNumbers.length > 0 && !selectedNumberId) {
      const defaultNum = smsNumbers.find(n => n.is_default && n.is_active) || smsNumbers.find(n => n.is_active);
      if (defaultNum) setSelectedNumberId(defaultNum.id);
    }
  }, [smsNumbers, selectedNumberId]);

  const activeNumbers = smsNumbers.filter(n => n.is_active);

  const handleSend = async () => {
    if (!message.trim() || !contactPhone || sending) return;
    setSending(true);
    setSendError(null);

    try {
      const orgId = propOrgId || await getCurrentOrgId();
      const result = await sendSMS({
        orgId,
        to: formatPhoneE164(contactPhone),
        body: message.trim(),
        fromNumberId: selectedNumberId || undefined,
        contactId,
        contactName,
        dealId,
        ticketId,
      });

      if (result.success) {
        setMessage('');
      } else {
        setSendError(result.error || 'Failed to send');
      }
    } catch (err: any) {
      setSendError(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charCount = message.length;
  const segmentCount = Math.ceil(charCount / 160) || 1;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const statusIcon = (status: SmsMessage['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCheck size={12} className="text-blue-500" />;
      case 'sent':
        return <Check size={12} className="text-slate-400" />;
      case 'failed':
        return <AlertCircle size={12} className="text-rose-500" />;
      default:
        return null;
    }
  };

  if (!contactPhone) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
        <Phone size={48} className="text-slate-300 mb-4" />
        <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No phone number on file</p>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Add a phone number to send SMS</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
        <div>
          <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {contactName || contactPhone}
          </p>
          {contactName && <p className="text-[10px] text-slate-400 font-mono">{contactPhone}</p>}
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isDarkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
          {conversationMessages.length} message{conversationMessages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Message Thread */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px] custom-scrollbar ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50/50'}`}>
        {conversationMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>No messages yet</p>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Send the first message to start the conversation</p>
          </div>
        ) : (
          conversationMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                msg.direction === 'outbound'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : isDarkMode
                    ? 'bg-slate-700 text-slate-200 rounded-bl-md'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-bl-md'
              }`}>
                <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                <div className={`flex items-center gap-1.5 mt-1 ${msg.direction === 'outbound' ? 'justify-end' : ''}`}>
                  <span className={`text-[10px] ${msg.direction === 'outbound' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {formatTime(msg.createdAt)}
                  </span>
                  {msg.direction === 'outbound' && statusIcon(msg.status)}
                </div>
                {msg.status === 'failed' && msg.error_message && (
                  <p className="text-[10px] text-rose-300 mt-1">{msg.error_message}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={threadEndRef} />
      </div>

      {/* Compose Bar */}
      <div className={`border-t p-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-100'}`}>
        {sendError && (
          <div className="mb-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
            <AlertCircle size={14} /> {sendError}
          </div>
        )}
        <div className="flex items-end gap-2">
          {/* From Number Selector */}
          {activeNumbers.length > 1 && (
            <select
              value={selectedNumberId}
              onChange={e => setSelectedNumberId(e.target.value)}
              className={`px-2 py-2 text-[10px] font-bold rounded-xl border ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
              title="Send from"
            >
              {activeNumbers.map(n => (
                <option key={n.id} value={n.id}>
                  {n.display_name || n.phone_number} ({n.purpose})
                </option>
              ))}
            </select>
          )}
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className={`w-full px-4 py-2.5 rounded-2xl text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              } border`}
              style={{ maxHeight: '100px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            <Send size={16} />
          </button>
        </div>
        {charCount > 0 && (
          <p className={`text-[10px] mt-1.5 ml-1 ${charCount > 160 ? 'text-amber-500' : 'text-slate-400'}`}>
            {charCount}/160 ({segmentCount} segment{segmentCount !== 1 ? 's' : ''})
          </p>
        )}
      </div>
    </div>
  );
};

export default SMSConversation;
