import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Clock, Zap, Target, TrendingUp, Flame, ArrowUp, ArrowDown, Users, CheckCircle, ChevronDown, MessageSquare, FileText, X, Plus, Building2, User, Briefcase, Ticket, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QueueNote {
  text: string;
  addedBy: string;
  addedAt: Date;
}

interface RelatedTo {
  type: 'accounts' | 'contacts' | 'leads' | 'deals' | 'tickets';
  id: string;
  name: string;
}

interface QueueItem {
  id: number;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  priorityScore: number;
  assignee: string;
  slaDeadline: Date;
  createdAt: Date;
  status: 'open' | 'in_progress' | 'escalated';
  escalationLevel: number;
  notes: QueueNote[];
  relatedTo?: RelatedTo;
}

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white border border-slate-200 p-8 rounded-[35px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up">
    <div className="flex justify-between items-start mb-6">
      <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center`}>
        <Icon size={28} className={color.replace('bg-', 'text-')} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${
          trend >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
        }`}>
          {trend >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</h3>
    <p className="text-4xl font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);

const TacticalQueue: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'sla' | 'created'>('priority');
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    relatedType: '' as '' | 'accounts' | 'contacts' | 'leads' | 'deals' | 'tickets',
    relatedName: '',
    slaHours: 4
  });
  const expandedRef = useRef<HTMLDivElement>(null);
  const addModalRef = useRef<HTMLDivElement>(null);

  // Close expanded item on outside click (but not when clicking on another queue item)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if clicking on another queue item (has data-queue-item attribute or is inside one)
      const isClickOnQueueItem = target.closest('[data-queue-item]');

      if (expandedRef.current && !expandedRef.current.contains(target) && !isClickOnQueueItem) {
        setExpandedItemId(null);
        setNoteText('');
      }
    };

    if (expandedItemId !== null) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [expandedItemId]);

  // Mock queue items with realistic SLA deadlines
  const [queueItems, setQueueItems] = useState<QueueItem[]>([
    {
      id: 1,
      title: 'Critical System Outage - Production Database',
      description: 'Multiple users reporting connection failures to primary database',
      priority: 'critical',
      priorityScore: 98,
      assignee: 'Thomas Anderson',
      slaDeadline: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
      status: 'escalated',
      escalationLevel: 2,
      notes: [
        { text: 'Investigating root cause - appears to be connection pool exhaustion', addedBy: 'Thomas Anderson', addedAt: new Date(Date.now() - 30 * 60 * 1000) },
        { text: 'Escalated to L2 - DBA team notified', addedBy: 'Trinity Moss', addedAt: new Date(Date.now() - 15 * 60 * 1000) }
      ],
      relatedTo: { type: 'accounts', id: 'acc-1', name: 'TechCorp Industries' }
    },
    {
      id: 2,
      title: 'High Priority - Customer VIP Account Issue',
      description: 'Enterprise client unable to access billing portal',
      priority: 'high',
      priorityScore: 85,
      assignee: 'Trinity Moss',
      slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      status: 'in_progress',
      escalationLevel: 0,
      notes: [
        { text: 'Customer called - very frustrated, requires immediate attention', addedBy: 'Trinity Moss', addedAt: new Date(Date.now() - 20 * 60 * 1000) }
      ],
      relatedTo: { type: 'contacts', id: 'con-1', name: 'Sarah Mitchell' }
    },
    {
      id: 3,
      title: 'SLA Breach Warning - Payment Gateway Timeout',
      description: 'Intermittent timeouts on payment processing endpoint',
      priority: 'high',
      priorityScore: 82,
      assignee: 'Neo Smith',
      slaDeadline: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      status: 'open',
      escalationLevel: 1,
      notes: [],
      relatedTo: { type: 'deals', id: 'deal-1', name: 'Enterprise Platform Deal' }
    },
    {
      id: 4,
      title: 'Medium Priority - API Rate Limit Adjustment',
      description: 'Client requesting increased API rate limits for campaign',
      priority: 'medium',
      priorityScore: 65,
      assignee: 'Morpheus Jones',
      slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'open',
      escalationLevel: 0,
      notes: [],
      relatedTo: { type: 'leads', id: 'lead-1', name: 'Marcus Chen' }
    },
    {
      id: 5,
      title: 'Low Priority - Documentation Update Request',
      description: 'Update API docs with new authentication flow',
      priority: 'low',
      priorityScore: 35,
      assignee: 'Unassigned',
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      status: 'open',
      escalationLevel: 0,
      notes: [],
      relatedTo: { type: 'tickets', id: 'tick-1', name: 'Support Ticket #1234' }
    },
  ]);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for SLA countdown

    return () => clearInterval(interval);
  }, []);

  // Calculate time remaining for SLA
  const getTimeRemaining = (deadline: Date) => {
    const diff = deadline.getTime() - currentTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (diff < 0) return { text: 'BREACHED', isBreached: true, isUrgent: false };
    if (diff < 15 * 60 * 1000) return { text: `${minutes}m ${seconds}s`, isBreached: false, isUrgent: true };
    if (diff < 60 * 60 * 1000) return { text: `${minutes}min`, isBreached: false, isUrgent: false };
    return { text: `${hours}h ${minutes}m`, isBreached: false, isUrgent: false };
  };

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-rose-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-slate-400';
      default: return 'bg-slate-300';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-rose-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-slate-600';
      default: return 'text-slate-500';
    }
  };

  // Filter and sort
  const filteredItems = queueItems
    .filter(item => filterPriority === 'all' || item.priority === filterPriority)
    .sort((a, b) => {
      if (sortBy === 'priority') return b.priorityScore - a.priorityScore;
      if (sortBy === 'sla') return a.slaDeadline.getTime() - b.slaDeadline.getTime();
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  // Stats
  const criticalCount = queueItems.filter(i => i.priority === 'critical').length;
  const highCount = queueItems.filter(i => i.priority === 'high').length;
  const breachCount = queueItems.filter(i => getTimeRemaining(i.slaDeadline).isBreached).length;
  const escalatedCount = queueItems.filter(i => i.escalationLevel > 0).length;

  // Next SLA breach
  const nextBreach = queueItems
    .filter(i => !getTimeRemaining(i.slaDeadline).isBreached)
    .sort((a, b) => a.slaDeadline.getTime() - b.slaDeadline.getTime())[0];

  // Action handlers
  const handleEscalate = (item: QueueItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setQueueItems(prev => prev.map(i =>
      i.id === item.id
        ? {
            ...i,
            escalationLevel: i.escalationLevel + 1,
            status: 'escalated' as const,
            notes: [
              ...i.notes,
              { text: `Escalated to L${i.escalationLevel + 1}`, addedBy: 'You', addedAt: new Date() }
            ]
          }
        : i
    ));
  };

  const handleAssign = (item: QueueItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const assignees = ['Thomas Anderson', 'Trinity Moss', 'Neo Smith', 'Morpheus Jones'];
    const randomAssignee = assignees[Math.floor(Math.random() * assignees.length)];
    setQueueItems(prev => prev.map(i =>
      i.id === item.id
        ? {
            ...i,
            assignee: randomAssignee,
            status: 'in_progress' as const,
            notes: [
              ...i.notes,
              { text: `Assigned to ${randomAssignee}`, addedBy: 'You', addedAt: new Date() }
            ]
          }
        : i
    ));
  };

  const handleAddNote = (itemId: number) => {
    if (!noteText.trim()) return;
    setQueueItems(prev => prev.map(i =>
      i.id === itemId
        ? {
            ...i,
            notes: [
              ...i.notes,
              { text: noteText.trim(), addedBy: 'You', addedAt: new Date() }
            ]
          }
        : i
    ));
    setNoteText('');
  };

  const toggleExpand = (itemId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
    setNoteText('');
  };

  // Close add modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addModalRef.current && !addModalRef.current.contains(event.target as Node)) {
        setShowAddModal(false);
      }
    };
    if (showAddModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddModal]);

  const handleAddToQueue = () => {
    if (!newItemForm.title.trim()) return;

    const priorityScores = { critical: 95, high: 80, medium: 60, low: 30 };
    const newItem: QueueItem = {
      id: Date.now(),
      title: newItemForm.title,
      description: newItemForm.description,
      priority: newItemForm.priority,
      priorityScore: priorityScores[newItemForm.priority] + Math.floor(Math.random() * 10),
      assignee: 'Unassigned',
      slaDeadline: new Date(Date.now() + newItemForm.slaHours * 60 * 60 * 1000),
      createdAt: new Date(),
      status: 'open',
      escalationLevel: 0,
      notes: [],
      relatedTo: newItemForm.relatedType && newItemForm.relatedName ? {
        type: newItemForm.relatedType,
        id: `${newItemForm.relatedType}-new-${Date.now()}`,
        name: newItemForm.relatedName
      } : undefined
    };

    setQueueItems(prev => [newItem, ...prev]);
    setShowAddModal(false);
    setNewItemForm({
      title: '',
      description: '',
      priority: 'medium',
      relatedType: '',
      relatedName: '',
      slaHours: 4
    });
  };

  const getRelatedIcon = (type: string) => {
    switch (type) {
      case 'accounts': return Building2;
      case 'contacts': return User;
      case 'leads': return Target;
      case 'deals': return Briefcase;
      case 'tickets': return Ticket;
      default: return Building2;
    }
  };

  const getRelatedColor = (type: string) => {
    switch (type) {
      case 'accounts': return 'bg-emerald-100 text-emerald-600';
      case 'contacts': return 'bg-blue-100 text-blue-600';
      case 'leads': return 'bg-amber-100 text-amber-600';
      case 'deals': return 'bg-violet-100 text-violet-600';
      case 'tickets': return 'bg-rose-100 text-rose-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none mb-1">Tactical Queue</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mission Control • Priority Work Items</p>
        </div>
        <div className="flex gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.amount as any)}
            className="bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold text-sm border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="priority">Sort by Priority</option>
            <option value="sla">Sort by SLA</option>
            <option value="created">Sort by Created</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.amount)}
            className="bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold text-sm border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
            <option value="low">Low Only</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            + Add to Queue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Critical Items" value={criticalCount} icon={Flame} color="bg-rose-500" trend={-15} />
        <StatCard label="High Priority" value={highCount} icon={AlertCircle} color="bg-orange-500" trend={5} />
        <StatCard label="SLA Breaches" value={breachCount} icon={Clock} color="bg-yellow-500" trend={0} />
        <StatCard label="Escalated" value={escalatedCount} icon={TrendingUp} color="bg-purple-500" trend={-10} />
      </div>

      {/* Priority Pulse Section */}
      <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-8 rounded-[35px] shadow-xl text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-rose-200">Priority Pulse</h3>
            <p className="text-2xl font-black">
              {criticalCount + highCount === 0 ? 'All Clear' : 'Active Incidents'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-rose-200 text-xs font-bold uppercase mb-1">Next Breach</p>
            <p className="text-2xl font-black">
              {nextBreach ? getTimeRemaining(nextBreach.slaDeadline).text : '—'}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-rose-200 text-xs font-bold uppercase mb-1">Avg Response</p>
            <p className="text-2xl font-black">12min</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-rose-200 text-xs font-bold uppercase mb-1">Team Load</p>
            <p className="text-2xl font-black">{queueItems.filter(i => i.assignee !== 'Unassigned').length}/{queueItems.length}</p>
          </div>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Active Queue ({filteredItems.length} items)</h3>
          <p className="text-xs text-slate-500 font-semibold">Live • Updated {currentTime.toLocaleTimeString()}</p>
        </div>

        {filteredItems.map((item, index) => {
          const timeInfo = getTimeRemaining(item.slaDeadline);
          const priorityColor = getPriorityColor(item.priority);
          const priorityTextColor = getPriorityTextColor(item.priority);
          const isExpanded = expandedItemId === item.id;

          return (
            <div
              key={item.id}
              ref={isExpanded ? expandedRef : null}
              data-queue-item={item.id}
              className={`bg-white border-2 ${
                timeInfo.isBreached ? 'border-rose-500 bg-rose-50' :
                timeInfo.isUrgent ? 'border-orange-500 bg-orange-50' :
                isExpanded ? 'border-blue-400 ring-2 ring-blue-100' :
                'border-slate-200'
              } rounded-[25px] shadow-sm hover:shadow-xl transition-all duration-300 animate-slide-up overflow-hidden`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Main Content - Clickable Header */}
              <div
                className="p-6 cursor-pointer"
                onClick={(e) => toggleExpand(item.id, e)}
              >
                <div className="flex items-start gap-4">
                  {/* Priority Badge */}
                  <div className={`w-16 h-16 ${priorityColor} rounded-2xl flex flex-col items-center justify-center text-white shadow-lg`}>
                    <div className="text-2xl font-black">{item.priorityScore}</div>
                    <div className="text-[8px] font-bold uppercase tracking-wider">Score</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-black text-slate-900">{item.title}</h4>
                          {item.escalationLevel > 0 && (
                            <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              <TrendingUp size={12} />
                              <span className="text-[10px] font-black uppercase">L{item.escalationLevel}</span>
                            </div>
                          )}
                          {item.notes.length > 0 && (
                            <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              <MessageSquare size={12} />
                              <span className="text-[10px] font-black">{item.notes.length}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${priorityColor}`}></div>
                        <span className={`text-xs font-bold uppercase ${priorityTextColor}`}>{item.priority}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600">{item.assignee}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className={timeInfo.isBreached ? 'text-rose-600' : timeInfo.isUrgent ? 'text-orange-600' : 'text-slate-400'} />
                        <span className={`text-xs font-bold uppercase ${
                          timeInfo.isBreached ? 'text-rose-600' :
                          timeInfo.isUrgent ? 'text-orange-600 animate-pulse' :
                          'text-slate-600'
                        }`}>
                          SLA: {timeInfo.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'escalated' ? 'bg-purple-500 animate-pulse' :
                          item.status === 'in_progress' ? 'bg-blue-500' :
                          'bg-slate-400'
                        }`}></div>
                        <span className="text-xs font-semibold text-slate-600 capitalize">{item.status.replace('_', ' ')}</span>
                      </div>
                      {item.relatedTo && (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const RelIcon = getRelatedIcon(item.relatedTo.type);
                            return <RelIcon size={14} className="text-slate-400" />;
                          })()}
                          <span className="text-xs font-semibold text-slate-600">{item.relatedTo.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Expand Button */}
                  <div className="flex flex-col gap-2 items-end">
                    <ChevronDown
                      size={20}
                      className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                    <div className="flex gap-2">
                      {item.escalationLevel < 3 && (
                        <button
                          onClick={(e) => handleEscalate(item, e)}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase active:scale-95 transition-all"
                        >
                          Escalate
                        </button>
                      )}
                      {item.status === 'open' && (
                        <button
                          onClick={(e) => handleAssign(item, e)}
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase active:scale-95 transition-all"
                        >
                          Assign
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Section - Notes & Actions */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-slate-100 bg-slate-50/50">
                  <div className="pt-6">
                    {/* Notes Section */}
                    <div className="mb-6">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FileText size={12} /> Rolling Notes
                      </h5>
                      {item.notes.length > 0 ? (
                        <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                          {item.notes.map((note, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4">
                              <p className="text-sm text-slate-700 mb-2">{note.text}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span className="font-bold">{note.addedBy}</span>
                                <span>•</span>
                                <span>{note.addedAt.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No notes yet. Add the first note below.</p>
                      )}
                    </div>

                    {/* Add Note Input */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.amount)}
                        placeholder="Add a rolling note..."
                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && noteText.trim()) {
                            handleAddNote(item.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddNote(item.id)}
                        disabled={!noteText.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Plus size={14} /> Add Note
                      </button>
                    </div>

                    {/* Related Entity */}
                    {item.relatedTo && (
                      <div className="mb-6">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <ExternalLink size={12} /> Related To
                        </h5>
                        <div className={`flex items-center justify-between p-4 rounded-xl ${getRelatedColor(item.relatedTo.type)} bg-opacity-50`}>
                          <div className="flex items-center gap-3">
                            {(() => {
                              const RelIcon = getRelatedIcon(item.relatedTo.type);
                              return (
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRelatedColor(item.relatedTo.type)}`}>
                                  <RelIcon size={18} />
                                </div>
                              );
                            })()}
                            <div>
                              <p className="text-sm font-black text-slate-900">{item.relatedTo.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase">{item.relatedTo.type}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/${item.relatedTo!.type}/${item.relatedTo!.id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-all border border-slate-200"
                          >
                            <ExternalLink size={12} /> View
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                      <button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        onClick={() => {
                          setQueueItems(prev => prev.filter(i => i.id !== item.id));
                          setExpandedItemId(null);
                        }}
                      >
                        Mark Resolved
                      </button>
                      <button
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
                        onClick={() => setExpandedItemId(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Coming Soon Features */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[35px] shadow-xl text-white">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Coming Features</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <CheckCircle size={20} className="text-yellow-400" />
            <span className="font-semibold">AI-Powered Priority Scoring (ML-based)</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle size={20} className="text-yellow-400" />
            <span className="font-semibold">Automated Escalation Rules Engine</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle size={20} className="text-yellow-400" />
            <span className="font-semibold">SLA Breach Alerts & Notifications (Email/SMS/Slack)</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle size={20} className="text-yellow-400" />
            <span className="font-semibold">Team Workload Balancing & Auto-Assignment</span>
          </li>
        </ul>
      </div>

      {/* Add to Queue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            ref={addModalRef}
            className="bg-white rounded-[35px] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up"
          >
            <div className="p-8 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">Add to Queue</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Create a new tactical queue item</p>
            </div>

            <div className="p-8 space-y-5">
              {/* Title */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Title *</label>
                <input
                  type="text"
                  value={newItemForm.title}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, title: e.target.amount }))}
                  placeholder="Brief description of the issue..."
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
                <textarea
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, description: e.target.amount }))}
                  placeholder="Detailed information..."
                  rows={3}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>

              {/* Priority & SLA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Priority</label>
                  <select
                    value={newItemForm.priority}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, priority: e.target.amount as any }))}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">SLA (Hours)</label>
                  <select
                    value={newItemForm.slaHours}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, slaHours: parseInt(e.target.amount) }))}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>1 Hour</option>
                    <option value={2}>2 Hours</option>
                    <option value={4}>4 Hours</option>
                    <option value={8}>8 Hours</option>
                    <option value={24}>24 Hours</option>
                    <option value={48}>48 Hours</option>
                  </select>
                </div>
              </div>

              {/* Related To */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Related To (Optional)</label>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newItemForm.relatedType}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, relatedType: e.target.amount as any }))}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="">None</option>
                    <option value="accounts">Account</option>
                    <option value="contacts">Contact</option>
                    <option value="leads">Lead</option>
                    <option value="deals">Deal</option>
                    <option value="tickets">Ticket</option>
                  </select>
                  {newItemForm.relatedType && (
                    <input
                      type="text"
                      value={newItemForm.relatedName}
                      onChange={(e) => setNewItemForm(prev => ({ ...prev, relatedName: e.target.amount }))}
                      placeholder={`${newItemForm.relatedType.slice(0, -1)} name...`}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 pt-0 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToQueue}
                disabled={!newItemForm.title.trim()}
                className="flex-1 px-6 py-3.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all"
              >
                Add to Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TacticalQueue;
