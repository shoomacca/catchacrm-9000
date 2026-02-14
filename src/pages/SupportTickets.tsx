import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  Ticket, Search, Plus, Clock, User, ChevronRight, Filter,
  AlertCircle, CheckCircle2, Circle, Star, Paperclip, MessageSquare,
  Calendar, Tag, MoreHorizontal, ExternalLink, X, Send, StickyNote,
  Inbox, Bell
} from 'lucide-react';
import { TicketComposer } from '../components/TicketComposer';

type TicketType = 'all' | 'Technical' | 'Billing' | 'General' | 'Feature Request' | 'Bug Report';
type TeamFilter = 'all' | 'Support' | 'Sales' | 'Technical' | 'Billing';
type QueueView = 'all' | 'new' | 'mine' | 'unassigned';

const SupportTickets: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, contacts, users, upsertRecord, currentUserId: crmUserId } = useCRM();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TicketType>('all');
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [queueView, setQueueView] = useState<QueueView>('all');
  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showTicketComposer, setShowTicketComposer] = useState(false);
  const [ticketComposerData, setTicketComposerData] = useState<any>(null);
  const [ticketComposerMode, setTicketComposerMode] = useState<'create' | 'edit'>('create');

  const currentUserId = crmUserId;

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Queue stats
  const queueStats = useMemo(() => ({
    all: tickets.length,
    new: tickets.filter(t => t.status === 'Open' && !t.assigneeId).length,
    mine: tickets.filter(t => t.assigneeId === currentUserId && t.status !== 'Resolved').length,
    unassigned: tickets.filter(t => !t.assigneeId && t.status !== 'Resolved').length
  }), [tickets, currentUserId]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];

    // Queue filter
    if (queueView === 'new') {
      filtered = filtered.filter(t => t.status === 'Open' && !t.assigneeId);
    } else if (queueView === 'mine') {
      filtered = filtered.filter(t => t.assigneeId === currentUserId && t.status !== 'Resolved');
    } else if (queueView === 'unassigned') {
      filtered = filtered.filter(t => !t.assigneeId && t.status !== 'Resolved');
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => (t as any).type === typeFilter);
    }
    if (teamFilter !== 'all') {
      filtered = filtered.filter(t => (t as any).team === teamFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.subject.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return filtered;
  }, [tickets, typeFilter, teamFilter, statusFilter, searchQuery, queueView, currentUserId]);

  // Handler for sending a reply
  const handleSendReply = () => {
    if (!selectedTicket || !replyText.trim()) return;

    const newMessage = {
      sender: 'Support Agent',
      text: replyText.trim(),
      time: new Date().toLocaleString()
    };

    const updatedMessages = [...(selectedTicket.messages || []), newMessage];
    upsertRecord('tickets', {
      ...selectedTicket,
      messages: updatedMessages,
      status: selectedTicket.status === 'Open' ? 'In Progress' : selectedTicket.status
    });
    setReplyText('');
  };

  // Handler for adding an internal note
  const handleAddNote = () => {
    if (!selectedTicket || !noteText.trim()) return;

    const newNote = {
      sender: 'Support Agent',
      text: noteText.trim(),
      time: new Date().toLocaleString()
    };

    const updatedNotes = [...(selectedTicket.internalNotes || []), newNote];
    upsertRecord('tickets', { ...selectedTicket, internalNotes: updatedNotes });
    setNoteText('');
    setShowNoteInput(false);
  };

  // Check if ticket is new (created within last 24 hours and unassigned)
  const isNewTicket = (ticket: any) => {
    if (ticket.assigneeId) return false;
    const hoursSinceCreated = (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60);
    return hoursSinceCreated < 24 && ticket.status === 'Open';
  };

  // Get color coding for ticket row
  const getTicketRowColor = (ticket: any) => {
    if (isNewTicket(ticket)) return 'bg-blue-50/50 border-l-4 border-l-blue-500';
    if (ticket.priority === 'Critical') return 'border-l-4 border-l-rose-500';
    if (ticket.priority === 'High') return 'border-l-4 border-l-amber-500';
    return '';
  };

  const getRequesterName = (reqId: string) => {
    const contact = contacts.find(c => c.id === reqId);
    return contact ? contact.name : 'Unknown';
  };

  const getAssigneeName = (assigneeId: string) => {
    const user = users.find(u => u.id === assigneeId);
    return user ? user.name : 'Unassigned';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500';
      case 'High': return 'bg-amber-500';
      case 'Medium': return 'bg-blue-500';
      default: return 'bg-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <Circle size={14} className="text-blue-500" />;
      case 'In Progress': return <Clock size={14} className="text-amber-500" />;
      case 'Waiting': return <AlertCircle size={14} className="text-violet-500" />;
      case 'Resolved': return <CheckCircle2 size={14} className="text-emerald-500" />;
      default: return <Circle size={14} className="text-slate-400" />;
    }
  };

  const getSLAStatus = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff <= 0) return { text: 'Overdue', color: 'text-rose-600 bg-rose-50' };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 4) return { text: `${hours}h left`, color: 'text-amber-600 bg-amber-50' };
    if (hours < 24) return { text: `${hours}h left`, color: 'text-blue-600 bg-blue-50' };
    return { text: `${Math.floor(hours / 24)}d left`, color: 'text-slate-500 bg-slate-50' };
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-0 animate-slide-up max-w-[1600px] mx-auto overflow-hidden">
      {/* Ticket List - Email Style */}
      <div className={`${selectedTicket ? 'w-[450px]' : 'flex-1'} flex flex-col bg-white border border-slate-200 rounded-l-[25px] overflow-hidden transition-all`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Ticket size={20} className="text-blue-600" />
              Support Tickets
            </h2>
            <button
              onClick={() => {
                setTicketComposerData(null);
                setTicketComposerMode('create');
                setShowTicketComposer(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg text-[10px] font-bold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg shadow-red-500/20"
            >
              <Plus size={12} /> New
            </button>
          </div>

          {/* Queue Tabs */}
          <div className="flex gap-1 mb-3 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setQueueView('all')}
              className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                queueView === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All ({queueStats.all})
            </button>
            <button
              onClick={() => setQueueView('new')}
              className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                queueView === 'new' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {queueStats.new > 0 && <Bell size={10} className="text-blue-500" />}
              New ({queueStats.new})
            </button>
            <button
              onClick={() => setQueueView('mine')}
              className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                queueView === 'mine' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Mine ({queueStats.mine})
            </button>
            <button
              onClick={() => setQueueView('unassigned')}
              className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                queueView === 'unassigned' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Unassigned ({queueStats.unassigned})
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search tickets..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TicketType)}
              className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
              <option value="General">General</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Bug Report">Bug Report</option>
            </select>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value as TeamFilter)}
              className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold focus:outline-none"
            >
              <option value="all">All Teams</option>
              <option value="Support">Support</option>
              <option value="Sales">Sales</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting">Waiting</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTickets.map(ticket => {
            const sla = getSLAStatus(ticket.slaDeadline);
            const isSelected = selectedTicketId === ticket.id;
            const isNew = isNewTicket(ticket);
            const hasUnread = ticket.status === 'Open';
            const rowColor = getTicketRowColor(ticket);

            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={`px-4 py-3 border-b border-slate-50 cursor-pointer transition-all ${
                  isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : rowColor || 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Priority Dot + Status Icon */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className={`w-2 h-2 rounded-full ${getPriorityDot(ticket.priority)}`} />
                    {getStatusIcon(ticket.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${hasUnread ? 'font-black text-slate-900' : 'font-medium text-slate-600'}`}>
                        {getRequesterName(ticket.requesterId)}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDate(ticket.createdAt)}</span>
                    </div>
                    <p className={`text-sm truncate mb-1 ${hasUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{ticket.description?.slice(0, 60)}...</p>

                    {/* Tags Row */}
                    <div className="flex items-center gap-2 mt-2">
                      {isNew && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-500 text-white animate-pulse">
                          NEW
                        </span>
                      )}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sla.color}`}>
                        {sla.text}
                      </span>
                      {(ticket as any).type && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {(ticket as any).type}
                        </span>
                      )}
                      {ticket.messages && ticket.messages.length > 0 && (
                        <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                          <MessageSquare size={10} /> {ticket.messages.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredTickets.length === 0 && (
            <div className="p-10 text-center">
              <Ticket size={32} className="mx-auto text-slate-200 mb-3" />
              <p className="text-xs font-bold text-slate-400">No tickets found</p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400">
          {filteredTickets.length} tickets • {tickets.filter(t => t.status === 'Open').length} open
        </div>
      </div>

      {/* Preview Panel - Right Side */}
      {selectedTicket ? (
        <div className="flex-1 flex flex-col bg-white border-y border-r border-slate-200 rounded-r-[25px] overflow-hidden">
          {/* Preview Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${getPriorityDot(selectedTicket.priority)}`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{selectedTicket.priority} Priority</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-bold text-slate-400">#{selectedTicket.id.slice(-6)}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 leading-tight">{selectedTicket.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedTicketId(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Meta Row */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span className="font-bold text-slate-700">{getRequesterName(selectedTicket.requesterId)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-slate-500">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSLAStatus(selectedTicket.slaDeadline).color}`}>
                SLA: {getSLAStatus(selectedTicket.slaDeadline).text}
              </div>
            </div>
          </div>

          {/* Status & Assignment */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Status</p>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => upsertRecord('tickets', { ...selectedTicket, status: e.target.value })}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting">Waiting</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Assigned To</p>
                <select
                  value={selectedTicket.assigneeId || ''}
                  onChange={(e) => upsertRecord('tickets', { ...selectedTicket, assigneeId: e.target.value })}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Type</p>
                <select
                  value={(selectedTicket as any).type || 'General'}
                  onChange={(e) => upsertRecord('tickets', { ...selectedTicket, type: e.target.value })}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="Technical">Technical</option>
                  <option value="Billing">Billing</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Bug Report">Bug Report</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => navigate(`/contacts/${selectedTicket.requesterId}`)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-300 transition-all"
            >
              View Customer <ExternalLink size={12} />
            </button>
          </div>

          {/* Ticket Description */}
          <div className="p-6 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Issue Description</p>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-700 leading-relaxed">{selectedTicket.description}</p>
            </div>
          </div>

          {/* Activity / Updates */}
          <div className="flex-1 p-6 overflow-y-auto">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">Activity & Updates</p>

            <div className="space-y-4">
              {/* Messages */}
              {(selectedTicket.messages || []).map((msg, i) => (
                <div key={i} className="flex gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender}`}
                    className="w-8 h-8 rounded-lg bg-slate-100 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">{msg.sender}</span>
                      <span className="text-[10px] text-slate-400">{msg.time}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-700">
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}

              {/* Internal Notes */}
              {(selectedTicket.internalNotes || []).map((note, i) => (
                <div key={`note-${i}`} className="flex gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${note.sender}`}
                    className="w-8 h-8 rounded-lg bg-amber-100 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">{note.sender}</span>
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Internal</span>
                      <span className="text-[10px] text-slate-400">{note.time}</span>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-slate-700">
                      {note.text}
                    </div>
                  </div>
                </div>
              ))}

              {(!selectedTicket.messages || selectedTicket.messages.length === 0) &&
               (!selectedTicket.internalNotes || selectedTicket.internalNotes.length === 0) && (
                <div className="text-center py-8">
                  <MessageSquare size={24} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400">No activity yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Reply/Note Input Area */}
          <div className="p-4 border-t border-slate-100 bg-white">
            {showNoteInput ? (
              /* Internal Note Input */
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-600">
                  <StickyNote size={14} />
                  <span className="text-xs font-bold">Internal Note (not visible to customer)</span>
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add an internal note..."
                  className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm resize-none focus:outline-none focus:border-amber-400"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { setShowNoteInput(false); setNoteText(''); }}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <StickyNote size={14} /> Save Note
                  </button>
                </div>
              </div>
            ) : (
              /* Reply Input */
              <div className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply to the customer..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-400"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowNoteInput(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all"
                  >
                    <StickyNote size={14} /> Add Note
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => upsertRecord('tickets', { ...selectedTicket, status: 'Resolved' })}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      <CheckCircle2 size={14} /> Resolve
                    </button>
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={14} /> Send Reply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 border-y border-r border-slate-200 rounded-r-[25px]">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Ticket size={28} className="text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-400">Select a ticket to view details</p>
          <p className="text-xs text-slate-400 mt-1">Click on any ticket from the list</p>
        </div>
      )}

      {/* Ticket Composer Modal */}
      <TicketComposer
        isOpen={showTicketComposer}
        onClose={() => {
          setShowTicketComposer(false);
          setTicketComposerData(null);
        }}
        initialData={ticketComposerData}
        mode={ticketComposerMode}
      />
    </div>
  );
};

export default SupportTickets;
