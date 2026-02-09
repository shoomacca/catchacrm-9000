import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MessageSquare, Send, Paperclip, CheckCircle2,
  Inbox, Search, User, Plus, Clock, ShieldAlert, ExternalLink,
  AlertCircle, Loader, CheckCircle, X, ArrowLeft, AlertTriangle,
  Flame, Thermometer, Snowflake
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

type StatusFilter = 'all' | 'New' | 'Open' | 'In Progress' | 'Resolved';
type PriorityFilter = 'all' | 'Critical' | 'High' | 'Medium' | 'Low';
type ViewMode = 'queue' | 'detail';

const TicketManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tickets, openModal, addTicketMessage, updateStatus, currentUserId, users, upsertRecord, contacts, searchQuery, setSearchQuery } = useCRM();
  const [activeTicketId, setActiveTicketId] = useState<string | null>(id || null);
  const [msgInput, setMsgInput] = useState('');
  const [mode, setMode] = useState<'messages' | 'internal'>('messages');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>(id ? 'detail' : 'queue');

  // Stats calculation
  const stats = useMemo(() => {
    const newCount = tickets.filter(t => t.status === 'New').length;
    const openCount = tickets.filter(t => t.status === 'Open').length;
    const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
    const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
    const criticalCount = tickets.filter(t => t.priority === 'Critical' || t.priority === 'High').length;

    // Count overdue tickets
    const overdueCount = tickets.filter(t => {
      if (t.status === 'Resolved') return false;
      return new Date(t.slaDeadline) < new Date();
    }).length;

    return {
      total: tickets.length,
      newCount,
      openCount,
      inProgressCount,
      resolvedCount,
      criticalCount,
      overdueCount
    };
  }, [tickets]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.subject.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
      );
    }

    // Sort: New first, then by SLA deadline (soonest first)
    return filtered.sort((a, b) => {
      // New tickets always on top
      if (a.status === 'New' && b.status !== 'New') return -1;
      if (b.status === 'New' && a.status !== 'New') return 1;
      // Then by SLA deadline
      return new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
    });
  }, [tickets, statusFilter, priorityFilter, searchQuery]);

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeTicketId) return;
    addTicketMessage(activeTicketId, msgInput, mode === 'internal');
    setMsgInput('');
  };

  const handleOpenTicket = (ticketId: string) => {
    setActiveTicketId(ticketId);
    setViewMode('detail');
    // Mark as Open if it was New
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket && ticket.status === 'New') {
      updateStatus('tickets', ticketId, 'Open');
    }
  };

  const getSLARemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff <= 0) return 'OVERDUE';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const isCritical = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return diff < 2 * 3600 * 1000; // Less than 2 hours
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getRequesterName = (reqId: string) => {
    const contact = contacts.find(c => c.id === reqId);
    return contact ? contact.name : reqId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Open': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'In Progress': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'Resolved': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New': return AlertCircle;
      case 'Open': return Inbox;
      case 'In Progress': return Loader;
      case 'Resolved': return CheckCircle;
      default: return Inbox;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'Low': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Critical': return Flame;
      case 'High': return AlertTriangle;
      case 'Medium': return Thermometer;
      case 'Low': return Snowflake;
      default: return Thermometer;
    }
  };

  // Queue View (Card-based)
  if (viewMode === 'queue') {
    return (
      <div className="space-y-6 animate-slide-up max-w-[1600px] mx-auto pb-20">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Center</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Ticket Queue</h1>
          </div>
          <button onClick={() => openModal('tickets')} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2">
            <Plus size={16}/> New Ticket
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-6 gap-4">
          {/* Total */}
          <button
            onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); }}
            className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
              statusFilter === 'all' && priorityFilter === 'all' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Inbox size={18} className="text-slate-500" />
              </div>
            </div>
          </button>

          {/* New */}
          <button
            onClick={() => setStatusFilter(statusFilter === 'New' ? 'all' : 'New')}
            className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg relative ${
              statusFilter === 'New' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
            }`}
          >
            {stats.newCount > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-[10px] font-black text-white">!</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-blue-600">{stats.newCount}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">New</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <AlertCircle size={18} className="text-blue-600" />
              </div>
            </div>
          </button>

          {/* Open */}
          <button
            onClick={() => setStatusFilter(statusFilter === 'Open' ? 'all' : 'Open')}
            className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
              statusFilter === 'Open' ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-amber-600">{stats.openCount}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Open</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Inbox size={18} className="text-amber-600" />
              </div>
            </div>
          </button>

          {/* In Progress */}
          <button
            onClick={() => setStatusFilter(statusFilter === 'In Progress' ? 'all' : 'In Progress')}
            className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
              statusFilter === 'In Progress' ? 'border-purple-400 ring-2 ring-purple-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-purple-600">{stats.inProgressCount}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Loader size={18} className="text-purple-600" />
              </div>
            </div>
          </button>

          {/* Resolved */}
          <button
            onClick={() => setStatusFilter(statusFilter === 'Resolved' ? 'all' : 'Resolved')}
            className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
              statusFilter === 'Resolved' ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-emerald-600">{stats.resolvedCount}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
            </div>
          </button>

          {/* Overdue/Critical */}
          <div className={`rounded-2xl p-5 ${stats.overdueCount > 0 ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white' : 'bg-white border border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-black ${stats.overdueCount > 0 ? 'text-white' : 'text-slate-400'}`}>{stats.overdueCount}</p>
                <p className={`text-[9px] font-bold uppercase tracking-wider ${stats.overdueCount > 0 ? 'text-rose-100' : 'text-slate-400'}`}>Overdue</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.overdueCount > 0 ? 'bg-white/20' : 'bg-slate-100'}`}>
                <Clock size={18} className={stats.overdueCount > 0 ? 'text-white' : 'text-slate-400'} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search tickets..."
              className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.amount)}
            />
          </div>

          {/* Priority Filter */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1">
            {(['all', 'Critical', 'High', 'Medium', 'Low'] as PriorityFilter[]).map(priority => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  priorityFilter === priority ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {priority === 'all' ? 'All Priority' : priority}
              </button>
            ))}
          </div>

          {(statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setSearchQuery(''); }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition-all"
            >
              <X size={12} /> Clear
            </button>
          )}

          <span className="text-xs font-bold text-slate-400">{filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Ticket Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTickets.map(ticket => {
            const overdue = isOverdue(ticket.slaDeadline) && ticket.status !== 'Resolved';
            const critical = isCritical(ticket.slaDeadline) && ticket.status !== 'Resolved';
            const StatusIcon = getStatusIcon(ticket.status);
            const PriorityIcon = getPriorityIcon(ticket.priority);
            const isNew = ticket.status === 'New';

            return (
              <div
                key={ticket.id}
                onClick={() => handleOpenTicket(ticket.id)}
                className={`bg-white border rounded-[24px] p-6 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden ${
                  overdue ? 'border-rose-300 bg-rose-50/30' :
                  isNew ? 'border-blue-300 bg-blue-50/30' :
                  'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* NEW Badge */}
                {isNew && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-1 animate-pulse">
                    <AlertCircle size={10} /> NEW
                  </div>
                )}

                {/* Overdue Badge */}
                {overdue && !isNew && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-1">
                    <Clock size={10} /> OVERDUE
                  </div>
                )}

                {/* Status Badge (if not new or overdue) */}
                {!isNew && !overdue && (
                  <div className="absolute top-5 right-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all ${
                    overdue ? 'bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white' :
                    isNew ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                    'bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white'
                  }`}>
                    <StatusIcon size={24} />
                  </div>
                  <div className="flex-1 min-w-0 pr-16">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">#{ticket.id}</p>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {ticket.subject}
                    </h3>
                  </div>
                </div>

                {/* Description Preview */}
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{ticket.description}</p>

                {/* Priority & Requester */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                    <PriorityIcon size={10} /> {ticket.priority}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <User size={10} />
                    {getRequesterName(ticket.requesterId)}
                  </div>
                </div>

                {/* Footer - SLA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className={overdue ? 'text-rose-500' : critical ? 'text-amber-500' : 'text-slate-400'} />
                    <span className={`text-[10px] font-black uppercase ${
                      overdue ? 'text-rose-600' : critical ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      SLA: {getSLARemaining(ticket.slaDeadline)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <MessageSquare size={10} />
                    {(ticket.messages?.length || 0)} messages
                  </div>
                </div>
              </div>
            );
          })}

          {filteredTickets.length === 0 && (
            <div className="col-span-full py-20 border-2 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center text-slate-400 bg-white">
              <Inbox size={48} strokeWidth={1} className="mb-4 opacity-30" />
              <p className="text-sm font-black">No tickets found</p>
              <p className="text-xs mt-1">Try adjusting your filters or create a new ticket</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detail View (Conversation)
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-slide-up max-w-[1200px] mx-auto overflow-hidden">
      {/* Back Button */}
      <button
        onClick={() => { setViewMode('queue'); setActiveTicketId(null); }}
        className="flex items-center gap-2 text-slate-400 hover:text-blue-600 mb-4 text-sm font-bold transition-colors"
      >
        <ArrowLeft size={16} /> Back to Queue
      </button>

      {/* Main Conversation */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[35px] shadow-sm overflow-hidden">
        {activeTicket ? (
          <>
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                   isOverdue(activeTicket.slaDeadline) && activeTicket.status !== 'Resolved' ? 'bg-rose-600 shadow-rose-100' : 'bg-blue-600 shadow-blue-100'
                 }`}>
                   <MessageSquare size={24} />
                 </div>
                 <div>
                   <div className="flex items-center gap-3 mb-1">
                     <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{activeTicket.subject}</h3>
                     <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${getStatusColor(activeTicket.status)}`}>
                       {activeTicket.status}
                     </span>
                     <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${getPriorityColor(activeTicket.priority)}`}>
                       {activeTicket.priority}
                     </span>
                   </div>
                   <div className="flex items-center gap-3">
                     <button
                        onClick={() => navigate(`/contacts/${activeTicket.requesterId}`)}
                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline flex items-center gap-1"
                     >
                        Requester: {getRequesterName(activeTicket.requesterId)}
                        <ExternalLink size={10} />
                     </button>
                     <div className="h-3 w-[1px] bg-slate-200"></div>
                     <p className={`text-[10px] font-black uppercase tracking-widest ${isCritical(activeTicket.slaDeadline) ? 'text-rose-500' : 'text-slate-400'}`}>
                        SLA: {getSLARemaining(activeTicket.slaDeadline)}
                     </p>
                   </div>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex flex-col items-end mr-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assignee</p>
                    <select
                       value={activeTicket.assigneeId}
                       onChange={(e) => upsertRecord('tickets', { ...activeTicket, assigneeId: e.target.amount })}
                       className="text-[10px] font-black bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 focus:outline-none"
                    >
                       {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                 </div>
                 {activeTicket.status !== 'Resolved' && (
                   <button
                    onClick={() => updateStatus('tickets', activeTicket.id, 'Resolved')}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                   >
                     <CheckCircle2 size={16} /> Resolve
                   </button>
                 )}
              </div>
            </div>

            {/* Sub-Tabs for Threading */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
               <button onClick={() => setMode('messages')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] relative ${mode === 'messages' ? 'text-blue-600 bg-white' : 'text-slate-400 hover:bg-slate-100'}`}>
                 Reply to Customer
                 {mode === 'messages' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"></div>}
               </button>
               <button onClick={() => setMode('internal')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] relative ${mode === 'internal' ? 'text-amber-600 bg-amber-50/20' : 'text-slate-400 hover:bg-slate-100'}`}>
                 Internal Notes
                 {mode === 'internal' && <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500"></div>}
               </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8 bg-slate-50/20">
              <div className="max-w-[90%] mx-auto bg-white p-8 rounded-[40px] border border-slate-100 mb-8 shadow-sm">
                 <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                   <ShieldAlert size={14} /> TICKET DESCRIPTION
                 </p>
                 <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{activeTicket.description}"</p>
              </div>

              {((mode === 'messages' ? activeTicket.messages : activeTicket.internalNotes) || []).map((m, i) => (
                <div key={i} className={`flex ${m.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] group ${m.senderId === currentUserId ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.sender}`} className="w-5 h-5 rounded-md bg-slate-100" />
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.sender}</p>
                    </div>
                    <div className={`p-6 rounded-[30px] text-sm shadow-sm transition-all hover:shadow-md ${
                      m.senderId === currentUserId
                        ? (mode === 'internal' ? 'bg-amber-500 text-white rounded-br-none' : 'bg-blue-600 text-white rounded-br-none')
                        : m.isBot ? 'bg-slate-200 text-slate-500 italic border border-slate-300'
                        : 'bg-white text-slate-900 border border-slate-100 rounded-bl-none'}`}>
                      {m.text}
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 mt-2 px-1">{m.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-8 border-t border-slate-100 bg-white">
              <div className={`rounded-[30px] p-2 flex items-center gap-3 border transition-all ${mode === 'internal' ? 'bg-amber-50 border-amber-200' : 'bg-slate-100 border-slate-200'}`}>
                 <button type="button" className="p-4 text-slate-400 hover:text-blue-600 transition-all"><Paperclip size={22} /></button>
                 <input
                  type="text"
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.amount)}
                  placeholder={mode === 'internal' ? "Add internal note for team..." : "Type your reply to customer..."}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm font-semibold px-2"
                 />
                 <button type="submit" className={`p-4 text-white rounded-[24px] shadow-lg hover:scale-105 active:scale-95 transition-all ${mode === 'internal' ? 'bg-amber-500 shadow-amber-200' : 'bg-blue-600 shadow-blue-200'}`}>
                   <Send size={22} />
                 </button>
              </div>
              <p className="text-[10px] text-center mt-3 text-slate-400 font-medium">
                {mode === 'internal' ? '🔒 Internal notes are only visible to your team' : '📧 This reply will be sent to the customer'}
              </p>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
             <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
               <Inbox size={48} strokeWidth={1} />
             </div>
             <p className="font-black uppercase text-xs tracking-[0.2em]">Select a ticket from the queue</p>
             <button
               onClick={() => setViewMode('queue')}
               className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase"
             >
               View Queue
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketManagement;
