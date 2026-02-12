import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  Mail, Phone, MessageSquare, Search, Filter, ChevronRight, ChevronDown,
  Send, PhoneIncoming, PhoneOutgoing, MessageCircle, Clock,
  User, Building2, Target, Plus, StickyNote, Reply, Forward,
  Trash2, Archive, ExternalLink, X, Check, ArrowUpRight
} from 'lucide-react';

type CommFilter = 'all' | 'emails' | 'calls' | 'sms';
type TimeFilter = 'today' | 'week' | 'month' | 'all';

const CommsHub: React.FC = () => {
  const navigate = useNavigate();
  const { communications, leads, contacts, accounts, searchQuery, setSearchQuery, upsertRecord } = useCRM();
  const [filter, setFilter] = useState<CommFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState<string | null>(null);

  // Get entity name and link for a communication
  const getEntityInfo = (comm: typeof communications[0]) => {
    if (comm.relatedToType === 'leads') {
      const lead = leads.find(l => l.id === comm.relatedToId);
      return { name: lead?.name || 'Unknown Lead', type: 'Lead', link: `/leads/${comm.relatedToId}`, icon: Target };
    } else if (comm.relatedToType === 'contacts') {
      const contact = contacts.find(c => c.id === comm.relatedToId);
      return { name: contact?.name || 'Unknown Contact', type: 'Contact', link: `/contacts/${comm.relatedToId}`, icon: User };
    } else if (comm.relatedToType === 'accounts') {
      const account = accounts.find(a => a.id === comm.relatedToId);
      return { name: account?.name || 'Unknown Account', type: 'Account', link: `/accounts/${comm.relatedToId}`, icon: Building2 };
    }
    return { name: 'Unknown', type: 'Entity', link: '#', icon: User };
  };

  // Calculate stats
  const stats = useMemo(() => {
    const emails = communications.filter(c => c.type === 'Email');
    const calls = communications.filter(c => c.type === 'Call');
    const sms = communications.filter(c => c.type === 'SMS');
    const inbound = communications.filter(c => c.direction === 'Inbound');
    const outbound = communications.filter(c => c.direction === 'Outbound');

    const today = new Date().toDateString();
    const todayComms = communications.filter(c =>
      new Date(c.createdAt || 0).toDateString() === today
    );

    return {
      total: communications.length,
      emails: emails.length,
      calls: calls.length,
      sms: sms.length,
      inbound: inbound.length,
      outbound: outbound.length,
      today: todayComms.length
    };
  }, [communications]);

  // Filter and sort communications
  const filteredComms = useMemo(() => {
    let filtered = [...communications];

    // Filter by type
    if (filter === 'emails') filtered = filtered.filter(c => c.type === 'Email');
    else if (filter === 'calls') filtered = filtered.filter(c => c.type === 'Call');
    else if (filter === 'sms') filtered = filtered.filter(c => c.type === 'SMS');

    // Filter by time period
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (timeFilter === 'today') {
      filtered = filtered.filter(c => new Date(c.createdAt || 0) >= today);
    } else if (timeFilter === 'week') {
      filtered = filtered.filter(c => new Date(c.createdAt || 0) >= weekAgo);
    } else if (timeFilter === 'month') {
      filtered = filtered.filter(c => new Date(c.createdAt || 0) >= monthAgo);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.subject?.toLowerCase().includes(query) ||
        c.content?.toLowerCase().includes(query) ||
        getEntityInfo(c).name.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [communications, filter, timeFilter, searchQuery, leads, contacts, accounts]);

  // Toggle group collapse
  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  // Group by date
  const groupedComms = useMemo(() => {
    const groups: { [key: string]: typeof filteredComms } = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    filteredComms.forEach(comm => {
      const date = new Date(comm.createdAt || 0).toDateString();
      let groupKey = date;
      if (date === today) groupKey = 'Today';
      else if (date === yesterday) groupKey = 'Yesterday';

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(comm);
    });

    return groups;
  }, [filteredComms]);

  const getCommIcon = (comm: typeof communications[0]) => {
    if (comm.type === 'Email') return comm.direction === 'Inbound' ? Mail : Send;
    if (comm.type === 'Call') return comm.direction === 'Inbound' ? PhoneIncoming : PhoneOutgoing;
    return MessageCircle;
  };

  const getCommColor = (comm: typeof communications[0]) => {
    if (comm.type === 'Email') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (comm.type === 'Call') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    return 'bg-violet-50 text-violet-600 border-violet-100';
  };

  const formatTime = (date: string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatFullDate = (date: string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleToggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
    setShowNoteInput(null);
    setNoteText('');
  };

  const handleAddNote = (comm: any) => {
    if (!noteText.trim()) return;

    const newNote = {
      text: noteText.trim(),
      addedBy: 'You',
      addedAt: new Date().toISOString()
    };

    const updatedNotes = [...(comm.notes || []), newNote];
    upsertRecord('communications', {
      ...comm,
      notes: updatedNotes
    });

    setNoteText('');
    setShowNoteInput(null);
  };

  const handleMarkResolved = (comm: any) => {
    upsertRecord('communications', {
      ...comm,
      status: 'resolved',
      resolvedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unified Inbox</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Communications Hub</h1>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-6 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`bg-white border rounded-2xl p-4 text-left transition-all hover:shadow-lg ${
            filter === 'all' ? 'border-slate-400 ring-2 ring-slate-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-black text-slate-900">{stats.total}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <MessageSquare size={18} />
            </div>
          </div>
        </button>
        <button
          onClick={() => setFilter(filter === 'emails' ? 'all' : 'emails')}
          className={`bg-white border rounded-2xl p-4 text-left transition-all hover:shadow-lg ${
            filter === 'emails' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-black text-blue-600">{stats.emails}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Emails</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Mail size={18} className="text-blue-600" />
            </div>
          </div>
        </button>
        <button
          onClick={() => setFilter(filter === 'calls' ? 'all' : 'calls')}
          className={`bg-white border rounded-2xl p-4 text-left transition-all hover:shadow-lg ${
            filter === 'calls' ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-black text-emerald-600">{stats.calls}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Calls</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Phone size={18} className="text-emerald-600" />
            </div>
          </div>
        </button>
        <button
          onClick={() => setFilter(filter === 'sms' ? 'all' : 'sms')}
          className={`bg-white border rounded-2xl p-4 text-left transition-all hover:shadow-lg ${
            filter === 'sms' ? 'border-violet-400 ring-2 ring-violet-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-black text-violet-600">{stats.sms}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">SMS</p>
            </div>
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <MessageCircle size={18} className="text-violet-600" />
            </div>
          </div>
        </button>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-black">{stats.inbound}</p>
              <p className="text-[9px] font-bold opacity-80 uppercase tracking-wider">Inbound</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <PhoneIncoming size={18} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-black">{stats.outbound}</p>
              <p className="text-[9px] font-bold opacity-80 uppercase tracking-wider">Outbound</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <PhoneOutgoing size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Time Filter */}
      <div className="flex items-center gap-4">
        <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
          {([
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' },
            { key: 'all', label: 'All Time' }
          ] as { key: TimeFilter; label: string }[]).map(tf => (
            <button
              key={tf.key}
              onClick={() => setTimeFilter(tf.key)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                timeFilter === tf.key ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
        {(filter !== 'all' || timeFilter !== 'all') && (
          <button
            onClick={() => { setFilter('all'); setTimeFilter('all'); }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition-all"
          >
            <X size={12} /> Clear All Filters
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white border border-slate-200 rounded-[35px] overflow-hidden shadow-sm">
        {/* Search Bar */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">{filteredComms.length} messages</span>
            <span className="text-[10px] text-slate-300">|</span>
            <span className="text-[10px] font-bold text-slate-400">
              {Object.keys(groupedComms).length} day{Object.keys(groupedComms).length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search communications..."
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold w-80 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Communications List */}
        <div className="divide-y divide-slate-100">
          {Object.entries(groupedComms).map(([date, comms]) => {
            const isCollapsed = collapsedGroups.has(date);
            return (
            <div key={date}>
              <button
                onClick={() => toggleGroupCollapse(date)}
                className="w-full px-8 py-3 bg-slate-50/50 sticky top-0 z-10 flex items-center justify-between hover:bg-slate-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                  />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{date}</p>
                  <span className="px-2 py-0.5 bg-slate-200 rounded-full text-[9px] font-bold text-slate-500">
                    {comms.length}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {isCollapsed ? 'Show' : 'Hide'}
                </span>
              </button>
              {!isCollapsed && comms.map(comm => {
                const entityInfo = getEntityInfo(comm);
                const CommIcon = getCommIcon(comm);
                const EntityIcon = entityInfo.icon;
                const isExpanded = expandedId === comm.id;

                return (
                  <div key={comm.id} className="border-b border-slate-50 last:border-0">
                    {/* Main Row */}
                    <div
                      onClick={(e) => handleToggleExpand(comm.id, e)}
                      className={`px-8 py-5 hover:bg-slate-50 transition-all cursor-pointer group flex items-start gap-4 ${
                        isExpanded ? 'bg-slate-50' : ''
                      }`}
                    >
                      {/* Expand Chevron */}
                      <button className="mt-2.5 text-slate-300 group-hover:text-slate-500 transition-colors">
                        <ChevronRight
                          size={16}
                          className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </button>

                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getCommColor(comm)}`}>
                        <CommIcon size={18} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${getCommColor(comm)}`}>
                            {comm.type}
                          </span>
                          {comm.direction && (
                            <span className={`text-[9px] font-bold uppercase ${
                              comm.direction === 'Inbound' ? 'text-emerald-500' : 'text-blue-500'
                            }`}>
                              {comm.direction}
                            </span>
                          )}
                          {comm.status === 'resolved' && (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-bold">
                              Resolved
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {comm.subject || comm.content?.substring(0, 50) || 'No subject'}
                        </p>
                        {!isExpanded && comm.content && comm.subject && (
                          <p className="text-xs text-slate-500 truncate mt-1">
                            {comm.content.substring(0, 100)}...
                          </p>
                        )}
                        {/* Notes indicator */}
                        {(((comm as any).notes as any[])?.length || 0) > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <StickyNote size={10} className="text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-600">
                              {((comm as any).notes as any[]).length} note{((comm as any).notes as any[]).length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Entity Info */}
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-xs font-black text-slate-700">{entityInfo.name}</p>
                          <div className="flex items-center gap-1 justify-end mt-0.5">
                            <EntityIcon size={10} className="text-slate-400" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{entityInfo.type}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400">{formatTime(comm.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-8 pb-6 bg-slate-50/50 animate-slide-up">
                        <div className="ml-14 space-y-4">
                          {/* Full Content */}
                          <div className="bg-white rounded-2xl border border-slate-200 p-5">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Full Message
                              </p>
                              <p className="text-[10px] font-bold text-slate-400">
                                {formatFullDate(comm.createdAt)}
                              </p>
                            </div>
                            {comm.subject && (
                              <h4 className="text-sm font-black text-slate-900 mb-3">{comm.subject}</h4>
                            )}
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {comm.content || 'No content available'}
                            </p>

                            {/* Call details if applicable */}
                            {comm.type === 'Call' && (
                              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
                                {comm.duration && (
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                                    <p className="text-sm font-black text-slate-700">{comm.duration}</p>
                                  </div>
                                )}
                                {comm.outcome && (
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Outcome</p>
                                    <p className="text-sm font-black text-slate-700">{comm.outcome}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Notes Section */}
                          {(((comm as any).notes as any[])?.length || 0) > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Notes ({((comm as any).notes as any[]).length})
                              </p>
                              {((comm as any).notes as any[]).map((note: any, idx: number) => (
                                <div key={idx} className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                  <p className="text-sm text-amber-900">{note.text}</p>
                                  <p className="text-[10px] font-bold text-amber-600 mt-2">
                                    {note.addedBy} - {new Date(note.addedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Note Input */}
                          {showNoteInput === comm.id ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                              <textarea
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                rows={3}
                                placeholder="Add a note..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                autoFocus
                              />
                              <div className="flex justify-end gap-2 mt-3">
                                <button
                                  onClick={() => { setShowNoteInput(null); setNoteText(''); }}
                                  className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-slate-100 rounded-lg transition-all"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleAddNote(comm)}
                                  disabled={!noteText.trim()}
                                  className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Save Note
                                </button>
                              </div>
                            </div>
                          ) : null}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3 pt-2">
                            <button
                              onClick={() => setShowNoteInput(comm.id)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-bold hover:bg-amber-100 transition-all"
                            >
                              <StickyNote size={14} /> Add Note
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(entityInfo.link);
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold hover:bg-blue-100 transition-all"
                            >
                              <ExternalLink size={14} /> View {entityInfo.type}
                            </button>
                            {comm.type === 'Email' && (
                              <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-200 transition-all">
                                <Reply size={14} /> Reply
                              </button>
                            )}
                            {comm.status !== 'resolved' && (
                              <button
                                onClick={() => handleMarkResolved(comm)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold hover:bg-emerald-100 transition-all"
                              >
                                <Check size={14} /> Mark Resolved
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

          {filteredComms.length === 0 && (
            <div className="p-20 text-center">
              <Mail size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-sm font-black text-slate-400">No communications found</p>
              <p className="text-xs text-slate-400 mt-1">
                Send an email or make a call to see it here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommsHub;
