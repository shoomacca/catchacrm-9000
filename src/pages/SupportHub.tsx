import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  Ticket, Inbox, Search, Plus, Clock, AlertTriangle, CheckCircle2, User,
  MessageSquare, Send, Paperclip, MoreHorizontal, ChevronRight, Filter,
  Zap, Timer, Users, TrendingUp, XCircle, PauseCircle, PlayCircle,
  ArrowUpCircle, Copy, ExternalLink, History, Star, Tag, RefreshCcw
} from 'lucide-react';

type StatusFilter = 'all' | 'Open' | 'In Progress' | 'Waiting' | 'Resolved';
type PriorityFilter = 'all' | 'Critical' | 'High' | 'Medium' | 'Low';

interface CannedResponse {
  id: string;
  name: string;
  content: string;
  category: string;
}

const SupportHub: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, openModal, addTicketMessage, updateStatus, currentUserId, users, upsertRecord, contacts } = useCRM();

  const [activeTicketId, setActiveTicketId] = useState<string | null>(tickets.length > 0 ? tickets[0].id : null);
  const [msgInput, setMsgInput] = useState('');
  const [mode, setMode] = useState<'messages' | 'internal'>('messages');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCannedResponses, setShowCannedResponses] = useState(false);

  // Canned responses library
  const cannedResponses: CannedResponse[] = [
    { id: '1', name: 'Greeting', category: 'General', content: 'Hi there! Thank you for reaching out to our support team. I\'d be happy to help you with this.' },
    { id: '2', name: 'Need More Info', category: 'General', content: 'To better assist you, could you please provide some additional details about the issue you\'re experiencing?' },
    { id: '3', name: 'Escalating', category: 'Status', content: 'I\'m escalating this to our senior team for further investigation. You\'ll hear back from us within 24 hours.' },
    { id: '4', name: 'Resolution', category: 'Closing', content: 'I\'m glad we could resolve this for you! If you have any other questions, don\'t hesitate to reach out.' },
    { id: '5', name: 'Follow-up', category: 'General', content: 'Just following up on this ticket. Have you had a chance to try the solution we provided?' },
    { id: '6', name: 'Waiting on Customer', category: 'Status', content: 'We\'re waiting for additional information from you. Please reply when you get a chance so we can continue assisting you.' },
  ];

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  // Calculate stats
  const stats = useMemo(() => {
    const open = tickets.filter(t => t.status === 'Open').length;
    const inProgress = tickets.filter(t => t.status === 'In Progress').length;
    const overdue = tickets.filter(t => new Date(t.slaDeadline) < new Date() && t.status !== 'Resolved').length;
    const resolvedToday = tickets.filter(t => {
      if (t.status !== 'Resolved') return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(t.updatedAt || t.createdAt) >= today;
    }).length;
    const avgResponseTime = '2.4h'; // Would calculate from real data

    return { open, inProgress, overdue, resolvedToday, avgResponseTime, total: tickets.length };
  }, [tickets]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.subject.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
      );
    }

    // Sort by SLA deadline (most urgent first), then by priority
    const priorityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    filtered.sort((a, b) => {
      const aOverdue = new Date(a.slaDeadline) < new Date();
      const bOverdue = new Date(b.slaDeadline) < new Date();
      if (aOverdue && !bOverdue) return -1;
      if (bOverdue && !aOverdue) return 1;
      return new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
    });

    return filtered;
  }, [tickets, statusFilter, priorityFilter, searchQuery]);

  // Get customer's other tickets
  const customerTickets = useMemo(() => {
    if (!activeTicket) return [];
    return tickets.filter(t => t.requesterId === activeTicket.requesterId && t.id !== activeTicket.id).slice(0, 3);
  }, [activeTicket, tickets]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeTicketId) return;
    addTicketMessage(activeTicketId, msgInput, mode === 'internal');
    setMsgInput('');
    setShowCannedResponses(false);
  };

  const useCannedResponse = (response: CannedResponse) => {
    setMsgInput(response.content);
    setShowCannedResponses(false);
  };

  const getSLARemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff <= 0) return 'OVERDUE';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    return `${hours}h ${mins}m`;
  };

  const getSLAColor = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff <= 0) return 'text-rose-600 bg-rose-50';
    if (diff < 2 * 3600 * 1000) return 'text-amber-600 bg-amber-50';
    return 'text-slate-500 bg-slate-50';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'High': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'Medium': return 'bg-blue-100 text-blue-600 border-blue-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-500';
      case 'In Progress': return 'bg-amber-500';
      case 'Waiting': return 'bg-violet-500';
      case 'Resolved': return 'bg-emerald-500';
      default: return 'bg-slate-400';
    }
  };

  const getRequesterName = (reqId: string) => {
    const contact = contacts.find(c => c.id === reqId);
    return contact ? contact.name : 'Unknown';
  };

  const handleStatusChange = (newStatus: string) => {
    if (!activeTicket) return;
    upsertRecord('tickets', { ...activeTicket, status: newStatus });
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1600px] mx-auto pb-20">
      {/* Header with Stats */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Service</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Support Hub</h1>
        </div>
        <button
          onClick={() => openModal('tickets')}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={14} /> New Ticket
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-blue-600">{stats.open}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Open</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Inbox size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-amber-600">{stats.inProgress}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">In Progress</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <PlayCircle size={20} className="text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-rose-600">{stats.overdue}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Overdue</p>
            </div>
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="text-rose-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-emerald-600">{stats.resolvedToday}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Resolved Today</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-violet-600">{stats.avgResponseTime}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Avg Response</p>
            </div>
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <Timer size={20} className="text-violet-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 h-[calc(100vh-20rem)]">
        {/* Ticket List */}
        <div className="w-[380px] flex flex-col bg-white border border-slate-200 rounded-[25px] overflow-hidden shrink-0">
          {/* Filters */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.amount)}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.amount as StatusFilter)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting">Waiting</option>
                <option value="Resolved">Resolved</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.amount as PriorityFilter)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold focus:outline-none"
              >
                <option value="all">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex border-b border-slate-100">
            {(['all', 'Open', 'In Progress', 'Waiting', 'Resolved'] as StatusFilter[]).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 py-3 text-[9px] font-black uppercase tracking-wider transition-all ${
                  statusFilter === status
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {status === 'all' ? 'All' : status === 'In Progress' ? 'Active' : status}
              </button>
            ))}
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredTickets.map(ticket => {
              const isOverdue = new Date(ticket.slaDeadline) < new Date();
              return (
                <div
                  key={ticket.id}
                  onClick={() => setActiveTicketId(ticket.id)}
                  className={`p-4 cursor-pointer border-b border-slate-50 transition-all ${
                    activeTicketId === ticket.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`} />
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">#{ticket.id.slice(-6)}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 truncate mb-2">{ticket.subject}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <User size={10} />
                      <span className="font-bold">{getRequesterName(ticket.requesterId)}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${getSLAColor(ticket.slaDeadline)}`}>
                      {isOverdue ? '⚠️ ' : '⏱️ '}{getSLARemaining(ticket.slaDeadline)}
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredTickets.length === 0 && (
              <div className="p-10 text-center">
                <Inbox size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-xs font-bold text-slate-400">No tickets found</p>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Detail */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[25px] overflow-hidden">
          {activeTicket ? (
            <>
              {/* Ticket Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getPriorityColor(activeTicket.priority)}`}>
                      <Ticket size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{activeTicket.subject}</h3>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-mono text-slate-400">#{activeTicket.id.slice(-6)}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${getPriorityColor(activeTicket.priority)}`}>
                          {activeTicket.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${getSLAColor(activeTicket.slaDeadline)}`}>
                          SLA: {getSLARemaining(activeTicket.slaDeadline)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Quick Actions */}
                    <button
                      onClick={() => handleStatusChange('In Progress')}
                      className="p-2 hover:bg-amber-50 rounded-lg transition-all group"
                      title="Start Working"
                    >
                      <PlayCircle size={18} className="text-slate-400 group-hover:text-amber-600" />
                    </button>
                    <button
                      onClick={() => handleStatusChange('Waiting')}
                      className="p-2 hover:bg-violet-50 rounded-lg transition-all group"
                      title="Set Waiting"
                    >
                      <PauseCircle size={18} className="text-slate-400 group-hover:text-violet-600" />
                    </button>
                    <button className="p-2 hover:bg-rose-50 rounded-lg transition-all group" title="Escalate">
                      <ArrowUpCircle size={18} className="text-slate-400 group-hover:text-rose-600" />
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <button
                      onClick={() => handleStatusChange('Resolved')}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 transition-all"
                    >
                      <CheckCircle2 size={14} /> Resolve
                    </button>
                  </div>
                </div>

                {/* Requester & Assignee Row */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/contacts/${activeTicket.requesterId}`)}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-all"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User size={14} className="text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-slate-400 font-bold">Requester</p>
                      <p className="text-xs font-black text-slate-900">{getRequesterName(activeTicket.requesterId)}</p>
                    </div>
                    <ExternalLink size={12} className="text-slate-300 ml-2" />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold">Assigned to</p>
                      <select
                        value={activeTicket.assigneeId || ''}
                        onChange={(e) => upsertRecord('tickets', { ...activeTicket, assigneeId: e.target.amount })}
                        className="text-xs font-black bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Unassigned</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Type Tabs */}
              <div className="flex border-b border-slate-100">
                <button
                  onClick={() => setMode('messages')}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                    mode === 'messages'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
                      : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  💬 Customer Thread
                </button>
                <button
                  onClick={() => setMode('internal')}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                    mode === 'internal'
                      ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/30'
                      : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  🔒 Internal Notes
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-50/30">
                {/* Original Description */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Ticket size={12} /> Original Request
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">{activeTicket.description}</p>
                </div>

                {/* Message Thread */}
                {((mode === 'messages' ? activeTicket.messages : activeTicket.internalNotes) || []).map((m, i) => (
                  <div key={i} className={`flex ${m.senderId === currentUserId ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div className={`max-w-[70%] ${m.senderId === currentUserId ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.sender}`} className="w-5 h-5 rounded-md" />
                        <span className="text-[9px] font-bold text-slate-400">{m.sender}</span>
                        <span className="text-[9px] text-slate-300">{m.time}</span>
                      </div>
                      <div className={`p-4 rounded-2xl text-sm ${
                        m.senderId === currentUserId
                          ? mode === 'internal'
                            ? 'bg-amber-500 text-white rounded-br-sm'
                            : 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className="p-4 border-t border-slate-100 bg-white">
                {/* Canned Responses */}
                {showCannedResponses && (
                  <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Quick Replies</p>
                    <div className="grid grid-cols-3 gap-2">
                      {cannedResponses.map(response => (
                        <button
                          key={response.id}
                          onClick={() => useCannedResponse(response)}
                          className="text-left p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-all"
                        >
                          <p className="text-[10px] font-black text-slate-900">{response.name}</p>
                          <p className="text-[9px] text-slate-400 truncate">{response.content.slice(0, 40)}...</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCannedResponses(!showCannedResponses)}
                    className={`p-3 rounded-xl transition-all ${showCannedResponses ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:text-blue-600'}`}
                    title="Canned Responses"
                  >
                    <Zap size={18} />
                  </button>
                  <button type="button" className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-all">
                    <Paperclip size={18} />
                  </button>
                  <div className={`flex-1 flex items-center rounded-xl border transition-all ${
                    mode === 'internal' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input
                      type="text"
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.amount)}
                      placeholder={mode === 'internal' ? "Add internal note..." : "Type your reply..."}
                      className="flex-1 px-4 py-3 bg-transparent text-sm font-medium focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!msgInput.trim()}
                    className={`p-3 rounded-xl text-white transition-all disabled:opacity-50 ${
                      mode === 'internal' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                <Inbox size={40} className="text-slate-200" />
              </div>
              <p className="text-sm font-bold text-slate-400">Select a ticket to view details</p>
            </div>
          )}
        </div>

        {/* Customer Context Panel */}
        {activeTicket && (
          <div className="w-[280px] flex flex-col bg-white border border-slate-200 rounded-[25px] overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Customer Context</h4>
            </div>

            {/* Customer Info */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <User size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{getRequesterName(activeTicket.requesterId)}</p>
                  <p className="text-[10px] text-slate-400">Customer</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/contacts/${activeTicket.requesterId}`)}
                className="w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                View Full Profile →
              </button>
            </div>

            {/* Previous Tickets */}
            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <History size={12} /> Previous Tickets
              </p>
              {customerTickets.length > 0 ? (
                <div className="space-y-2">
                  {customerTickets.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTicketId(t.id)}
                      className="w-full text-left p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
                    >
                      <p className="text-xs font-bold text-slate-900 truncate">{t.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(t.status)}`} />
                        <span className="text-[9px] font-bold text-slate-400">{t.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No previous tickets</p>
              )}
            </div>

            {/* Tags Section */}
            <div className="p-4 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Tag size={12} /> Tags
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[9px] font-bold">support</span>
                <span className="px-2 py-1 bg-violet-50 text-violet-600 rounded text-[9px] font-bold">billing</span>
                <button className="px-2 py-1 bg-slate-50 text-slate-400 rounded text-[9px] font-bold hover:bg-slate-100">+ Add</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportHub;
