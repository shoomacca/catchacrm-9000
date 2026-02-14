import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  Mail, Phone, MessageSquare, Search, Send, X, User, Building2, Target
} from 'lucide-react';
import { EmailComposer } from '../components/EmailComposer';
import { SMSComposer } from '../components/SMSComposer';
import { Communication, EntityType } from '../types';

type QuickComposeMode = 'email' | 'sms';

interface ContactWithComms {
  id: string;
  name: string;
  type: EntityType;
  email?: string;
  phone?: string;
  lastCommDate: string;
  lastMessage: string;
  unreadCount: number;
  communications: Communication[];
}

const CommsHub: React.FC = () => {
  const navigate = useNavigate();
  const { communications, leads, contacts, accounts, upsertRecord, currentUser } = useCRM();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickComposeMode, setQuickComposeMode] = useState<QuickComposeMode>('email');
  const [quickEmailSubject, setQuickEmailSubject] = useState('');
  const [quickEmailBody, setQuickEmailBody] = useState('');
  const [quickSmsBody, setQuickSmsBody] = useState('');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showSMSComposer, setShowSMSComposer] = useState(false);

  // Get entity details by ID and type
  const getEntity = (type: EntityType, id: string) => {
    if (type === 'leads') return leads.find(l => l.id === id);
    if (type === 'contacts') return contacts.find(c => c.id === id);
    if (type === 'accounts') return accounts.find(a => a.id === id);
    return null;
  };

  // Group communications by contact
  const contactsWithComms = useMemo<ContactWithComms[]>(() => {
    const grouped = new Map<string, ContactWithComms>();

    communications.forEach(comm => {
      if (!comm.relatedToType || !comm.relatedToId) return;

      const entity = getEntity(comm.relatedToType, comm.relatedToId);
      if (!entity) return;

      const key = `${comm.relatedToType}-${comm.relatedToId}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          id: comm.relatedToId,
          name: entity.name || 'Unknown',
          type: comm.relatedToType,
          email: entity.email,
          phone: entity.phone,
          lastCommDate: comm.createdAt || '',
          lastMessage: comm.content?.substring(0, 60) || comm.subject || '',
          unreadCount: 0, // Mock - in real app, track read status
          communications: []
        });
      }

      const contact = grouped.get(key)!;
      contact.communications.push(comm);

      // Update last message if this comm is more recent
      if (comm.createdAt && comm.createdAt > contact.lastCommDate) {
        contact.lastCommDate = comm.createdAt;
        contact.lastMessage = comm.content?.substring(0, 60) || comm.subject || '';
      }
    });

    return Array.from(grouped.values())
      .sort((a, b) => new Date(b.lastCommDate).getTime() - new Date(a.lastCommDate).getTime());
  }, [communications, leads, contacts, accounts]);

  // Filter contacts by search
  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contactsWithComms;
    const query = searchQuery.toLowerCase();
    return contactsWithComms.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query)
    );
  }, [contactsWithComms, searchQuery]);

  // Selected contact details
  const selectedContact = useMemo(() => {
    return filteredContacts.find(c => `${c.type}-${c.id}` === selectedContactId) || null;
  }, [filteredContacts, selectedContactId]);

  // Sorted communications for selected contact (chronological)
  const selectedComms = useMemo(() => {
    if (!selectedContact) return [];
    return [...selectedContact.communications].sort((a, b) =>
      new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );
  }, [selectedContact]);

  const getCommIcon = (type: string) => {
    if (type === 'Email') return Mail;
    if (type === 'Call') return Phone;
    if (type === 'SMS') return MessageSquare;
    return MessageSquare;
  };

  const getEntityIcon = (type: EntityType) => {
    if (type === 'leads') return Target;
    if (type === 'contacts') return User;
    if (type === 'accounts') return Building2;
    return User;
  };

  const handleSendQuickEmail = () => {
    if (!selectedContact || !quickEmailSubject || !quickEmailBody) {
      alert('Please fill in subject and message');
      return;
    }

    const communication: Partial<Communication> = {
      type: 'Email',
      subject: quickEmailSubject,
      content: quickEmailBody,
      direction: 'Outbound',
      relatedToType: selectedContact.type,
      relatedToId: selectedContact.id,
      outcome: 'answered',
      metadata: {
        to: selectedContact.email || '',
      }
    };

    upsertRecord('communications', communication);
    setQuickEmailSubject('');
    setQuickEmailBody('');
    alert('Email sent successfully! (Mock mode)');
  };

  const handleSendQuickSMS = () => {
    if (!selectedContact || !quickSmsBody) {
      alert('Please enter a message');
      return;
    }

    const communication: Partial<Communication> = {
      type: 'SMS',
      subject: 'SMS Message',
      content: quickSmsBody,
      direction: 'Outbound',
      relatedToType: selectedContact.type,
      relatedToId: selectedContact.id,
      outcome: 'answered',
      metadata: {
        to: selectedContact.phone || '',
        characterCount: quickSmsBody.length,
        segments: Math.ceil(quickSmsBody.length / 160)
      }
    };

    upsertRecord('communications', communication);
    setQuickSmsBody('');
    alert('SMS sent successfully! (Mock mode)');
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col animate-slide-up">
      {/* Header */}
      <div className="pb-6">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unified Inbox</p>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Communications Hub</h1>
      </div>

      {/* Main Layout: Left Panel + Right Panel */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* LEFT PANEL: Contact List */}
        <div className="w-96 flex flex-col bg-white border border-slate-200 rounded-[35px] overflow-hidden shadow-sm">
          {/* Search Bar */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredContacts.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-sm font-black text-slate-400">No conversations yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Send your first email or SMS from a contact page
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredContacts.map(contact => {
                  const isSelected = selectedContactId === `${contact.type}-${contact.id}`;
                  const EntityIcon = getEntityIcon(contact.type);

                  return (
                    <button
                      key={`${contact.type}-${contact.id}`}
                      onClick={() => setSelectedContactId(`${contact.type}-${contact.id}`)}
                      className={`w-full p-4 text-left hover:bg-slate-50 transition-all ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <EntityIcon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-black text-slate-900 truncate">{contact.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">
                              {new Date(contact.lastCommDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{contact.lastMessage}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <EntityIcon size={10} className="text-slate-400" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              {contact.type.replace('s', '')}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[9px] font-bold text-slate-400">
                              {contact.communications.length} message{contact.communications.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Conversation Thread */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[35px] overflow-hidden shadow-sm">
          {!selectedContact ? (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={64} className="mx-auto text-slate-200 mb-4" />
                <p className="text-lg font-black text-slate-400">Select a conversation</p>
                <p className="text-sm text-slate-400 mt-1">Choose a contact to view messages</p>
              </div>
            </div>
          ) : (
            <>
              {/* Conversation Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      {getEntityIcon(selectedContact.type)({ size: 24 })}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">{selectedContact.name}</h2>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {selectedContact.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} /> {selectedContact.email}
                          </span>
                        )}
                        {selectedContact.phone && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1">
                              <Phone size={12} /> {selectedContact.phone}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/${selectedContact.type}/${selectedContact.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                  >
                    View Profile
                  </button>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30">
                {selectedComms.map((comm) => {
                  const CommIcon = getCommIcon(comm.type);
                  const isOutbound = comm.direction === 'Outbound';

                  return (
                    <div
                      key={comm.id}
                      className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          isOutbound
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-900'
                        } rounded-2xl p-4 shadow-sm`}
                      >
                        {/* Message Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <CommIcon size={14} className={isOutbound ? 'text-white/80' : 'text-slate-400'} />
                          <span className={`text-[9px] font-black uppercase tracking-wider ${
                            isOutbound ? 'text-white/80' : 'text-slate-400'
                          }`}>
                            {comm.type}
                          </span>
                          <span className={isOutbound ? 'text-white/60' : 'text-slate-300'}>•</span>
                          <span className={`text-[9px] font-bold ${
                            isOutbound ? 'text-white/60' : 'text-slate-400'
                          }`}>
                            {new Date(comm.createdAt || 0).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* Email Subject */}
                        {comm.type === 'Email' && comm.subject && (
                          <p className={`text-sm font-black mb-2 ${
                            isOutbound ? 'text-white' : 'text-slate-900'
                          }`}>
                            {comm.subject}
                          </p>
                        )}

                        {/* Message Content */}
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          isOutbound ? 'text-white/95' : 'text-slate-700'
                        }`}>
                          {comm.content}
                        </p>

                        {/* Call Details */}
                        {comm.type === 'Call' && (comm.duration || comm.outcome) && (
                          <div className="mt-2 pt-2 border-t border-white/20 flex gap-4 text-xs">
                            {comm.duration && (
                              <span className={isOutbound ? 'text-white/80' : 'text-slate-500'}>
                                Duration: {comm.duration}
                              </span>
                            )}
                            {comm.outcome && (
                              <span className={isOutbound ? 'text-white/80' : 'text-slate-500'}>
                                {comm.outcome}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Compose Area */}
              <div className="border-t border-slate-200 bg-white p-6">
                {/* Mode Toggle */}
                <div className="flex bg-slate-100 rounded-xl p-1 gap-1 mb-4 w-fit">
                  <button
                    onClick={() => setQuickComposeMode('email')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                      quickComposeMode === 'email'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Mail size={14} /> Email
                  </button>
                  <button
                    onClick={() => setQuickComposeMode('sms')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                      quickComposeMode === 'sms'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <MessageSquare size={14} /> SMS
                  </button>
                </div>

                {/* Email Compose */}
                {quickComposeMode === 'email' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Subject"
                      value={quickEmailSubject}
                      onChange={(e) => setQuickEmailSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <div className="flex gap-3">
                      <textarea
                        placeholder="Type your email message..."
                        value={quickEmailBody}
                        onChange={(e) => setQuickEmailBody(e.target.value)}
                        rows={3}
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                      <button
                        onClick={handleSendQuickEmail}
                        disabled={!quickEmailSubject || !quickEmailBody}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed self-end"
                      >
                        <div className="flex items-center gap-2">
                          <Send size={14} />
                          Send
                        </div>
                      </button>
                    </div>
                    <button
                      onClick={() => setShowEmailComposer(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      Use full email composer (templates, attachments, etc.)
                    </button>
                  </div>
                )}

                {/* SMS Compose */}
                {quickComposeMode === 'sms' && (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <textarea
                          placeholder="Type your SMS message..."
                          value={quickSmsBody}
                          onChange={(e) => setQuickSmsBody(e.target.value)}
                          rows={3}
                          maxLength={480}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">
                            {quickSmsBody.length}/160 ({Math.ceil(quickSmsBody.length / 160) || 1} segment{Math.ceil(quickSmsBody.length / 160) !== 1 ? 's' : ''})
                          </span>
                          <button
                            onClick={() => setShowSMSComposer(true)}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                          >
                            Use templates
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={handleSendQuickSMS}
                        disabled={!quickSmsBody}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed self-end"
                      >
                        <div className="flex items-center gap-2">
                          <Send size={14} />
                          Send
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEmailComposer && selectedContact && (
        <EmailComposer
          isOpen={showEmailComposer}
          onClose={() => setShowEmailComposer(false)}
          recipientType={selectedContact.type}
          recipientId={selectedContact.id}
          recipientName={selectedContact.name}
          recipientEmail={selectedContact.email}
        />
      )}

      {showSMSComposer && selectedContact && (
        <SMSComposer
          isOpen={showSMSComposer}
          onClose={() => setShowSMSComposer(false)}
          recipientType={selectedContact.type}
          recipientId={selectedContact.id}
          recipientName={selectedContact.name}
          recipientPhone={selectedContact.phone}
        />
      )}
    </div>
  );
};

export default CommsHub;
