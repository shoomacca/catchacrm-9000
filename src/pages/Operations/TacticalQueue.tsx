import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AlertCircle, Clock, Zap, Target, TrendingUp, Flame, ArrowUp, ArrowDown, Users, CheckCircle, ChevronDown, MessageSquare, FileText, X, Plus, Building2, User, Briefcase, Ticket, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext';
import { TacticalQueueItem, TacticalQueueNote } from '../../types';

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
  const { tacticalQueue, users, upsertRecord, deleteRecord } = useCRM();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'sla' | 'created'>('priority');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    relatedType: '' as '' | 'accounts' | 'contacts' | 'leads' | 'deals' | 'tickets' | 'jobs',
    relatedName: '',
    slaHours: 4
  });
  const expandedRef = useRef<HTMLDivElement>(null);
  const addModalRef = useRef<HTMLDivElement>(null);

  // Close expanded item on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
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

  // Real-time clock updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate time remaining for SLA
  const getTimeRemaining = (deadline?: string) => {
    if (!deadline) return { text: 'No SLA', isBreached: false, isUrgent: false };

    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - currentTime.getTime();
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

  // Get user name by ID
  const getUserName = (userId?: string) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  // Filter and sort queue items
  const filteredItems = useMemo(() => {
    return tacticalQueue
      .filter(item => item.status !== 'resolved' && item.status !== 'closed')
      .filter(item => filterPriority === 'all' || item.priority === filterPriority)
      .sort((a, b) => {
        if (sortBy === 'priority') return (b.priorityScore || 50) - (a.priorityScore || 50);
        if (sortBy === 'sla') {
          const aTime = a.slaDeadline ? new Date(a.slaDeadline).getTime() : Infinity;
          const bTime = b.slaDeadline ? new Date(b.slaDeadline).getTime() : Infinity;
          return aTime - bTime;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tacticalQueue, filterPriority, sortBy]);

  // Stats
  const criticalCount = tacticalQueue.filter(i => i.priority === 'critical' && i.status !== 'resolved').length;
  const highCount = tacticalQueue.filter(i => i.priority === 'high' && i.status !== 'resolved').length;
  const breachCount = tacticalQueue.filter(i => getTimeRemaining(i.slaDeadline).isBreached && i.status !== 'resolved').length;
  const escalatedCount = tacticalQueue.filter(i => i.escalationLevel > 0 && i.status !== 'resolved').length;

  // Next SLA breach
  const nextBreach = tacticalQueue
    .filter(i => !getTimeRemaining(i.slaDeadline).isBreached && i.status !== 'resolved' && i.slaDeadline)
    .sort((a, b) => new Date(a.slaDeadline!).getTime() - new Date(b.slaDeadline!).getTime())[0];

  // Action handlers
  const handleEscalate = (item: TacticalQueueItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const newNote: TacticalQueueNote = {
      text: `Escalated to L${item.escalationLevel + 1}`,
      addedBy: 'You',
      addedAt: new Date().toISOString()
    };
    upsertRecord('tacticalQueue', {
      ...item,
      escalationLevel: item.escalationLevel + 1,
      status: 'escalated',
      notes: [...(item.notes || []), newNote]
    });
  };

  const handleAssign = (item: TacticalQueueItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const availableUsers = users.filter(u => u.role !== 'admin');
    if (availableUsers.length === 0) return;

    const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
    const newNote: TacticalQueueNote = {
      text: `Assigned to ${randomUser.name}`,
      addedBy: 'You',
      addedAt: new Date().toISOString()
    };
    upsertRecord('tacticalQueue', {
      ...item,
      assigneeId: randomUser.id,
      status: 'in_progress',
      notes: [...(item.notes || []), newNote]
    });
  };

  const handleAddNote = (item: TacticalQueueItem) => {
    if (!noteText.trim()) return;
    const newNote: TacticalQueueNote = {
      text: noteText.trim(),
      addedBy: 'You',
      addedAt: new Date().toISOString()
    };
    upsertRecord('tacticalQueue', {
      ...item,
      notes: [...(item.notes || []), newNote]
    });
    setNoteText('');
  };

  const handleResolve = (item: TacticalQueueItem) => {
    upsertRecord('tacticalQueue', {
      ...item,
      status: 'resolved',
      resolvedAt: new Date().toISOString()
    });
    setExpandedItemId(null);
  };

  const toggleExpand = (itemId: string, e: React.MouseEvent) => {
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
    const newItem: Partial<TacticalQueueItem> = {
      title: newItemForm.title,
      description: newItemForm.description,
      priority: newItemForm.priority,
      priorityScore: priorityScores[newItemForm.priority] + Math.floor(Math.random() * 10),
      status: 'open',
      escalationLevel: 0,
      slaDeadline: new Date(Date.now() + newItemForm.slaHours * 60 * 60 * 1000).toISOString(),
      notes: [],
      relatedToType: newItemForm.relatedType || undefined,
      relatedToName: newItemForm.relatedName || undefined,
    };

    upsertRecord('tacticalQueue', newItem);
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

  const getRelatedIcon = (type?: string) => {
    switch (type) {
      case 'accounts': return Building2;
      case 'contacts': return User;
      case 'leads': return Target;
      case 'deals': return Briefcase;
      case 'tickets': return Ticket;
      default: return Building2;
    }
  };

  const getRelatedColor = (type?: string) => {
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
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold text-sm border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="priority">Sort by Priority</option>
            <option value="sla">Sort by SLA</option>
            <option value="created">Sort by Created</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
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
            <p className="text-2xl font-black">{tacticalQueue.filter(i => i.assigneeId && i.status !== 'resolved').length}/{filteredItems.length}</p>
          </div>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Active Queue ({filteredItems.length} items)</h3>
          <p className="text-xs text-slate-500 font-semibold">Live • Updated {currentTime.toLocaleTimeString()}</p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[25px] p-12 text-center">
            <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
            <h3 className="text-xl font-black text-slate-900 mb-2">Queue is Clear!</h3>
            <p className="text-slate-500">No active items in the tactical queue. Great work!</p>
          </div>
        ) : (
          filteredItems.map((item, index) => {
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
                      <div className="text-2xl font-black">{item.priorityScore || 50}</div>
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
                            {(item.notes?.length || 0) > 0 && (
                              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                <MessageSquare size={12} />
                                <span className="text-[10px] font-black">{item.notes?.length || 0}</span>
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
                          <span className="text-xs font-semibold text-slate-600">{getUserName(item.assigneeId)}</span>
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
                        {item.relatedToName && (
                          <div className="flex items-center gap-2">
                            {(() => {
                              const RelIcon = getRelatedIcon(item.relatedToType);
                              return <RelIcon size={14} className="text-slate-400" />;
                            })()}
                            <span className="text-xs font-semibold text-slate-600">{item.relatedToName}</span>
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
                        {(item.notes?.length || 0) > 0 ? (
                          <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                            {item.notes?.map((note, idx) => (
                              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4">
                                <p className="text-sm text-slate-700 mb-2">{note.text}</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <span className="font-bold">{note.addedBy}</span>
                                  <span>•</span>
                                  <span>{new Date(note.addedAt).toLocaleString()}</span>
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
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add a rolling note..."
                          className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && noteText.trim()) {
                              handleAddNote(item);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddNote(item)}
                          disabled={!noteText.trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <Plus size={14} /> Add Note
                        </button>
                      </div>

                      {/* Related Entity */}
                      {item.relatedToName && item.relatedToType && (
                        <div className="mt-6">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ExternalLink size={12} /> Related To
                          </h5>
                          <div className={`flex items-center justify-between p-4 rounded-xl ${getRelatedColor(item.relatedToType)} bg-opacity-50`}>
                            <div className="flex items-center gap-3">
                              {(() => {
                                const RelIcon = getRelatedIcon(item.relatedToType);
                                return (
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRelatedColor(item.relatedToType)}`}>
                                    <RelIcon size={18} />
                                  </div>
                                );
                              })()}
                              <div>
                                <p className="text-sm font-black text-slate-900">{item.relatedToName}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">{item.relatedToType}</p>
                              </div>
                            </div>
                            {item.relatedToId && (
                              <button
                                onClick={() => navigate(`/${item.relatedToType}/${item.relatedToId}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-all border border-slate-200"
                              >
                                <ExternalLink size={12} /> View
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                        <button
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                          onClick={() => handleResolve(item)}
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
          })
        )}
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
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the issue..."
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
                <textarea
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, description: e.target.value }))}
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
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, priority: e.target.value as any }))}
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
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, slaHours: parseInt(e.target.value) }))}
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
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, relatedType: e.target.value as any }))}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="">None</option>
                    <option value="accounts">Account</option>
                    <option value="contacts">Contact</option>
                    <option value="leads">Lead</option>
                    <option value="deals">Deal</option>
                    <option value="tickets">Ticket</option>
                    <option value="jobs">Job</option>
                  </select>
                  {newItemForm.relatedType && (
                    <input
                      type="text"
                      value={newItemForm.relatedName}
                      onChange={(e) => setNewItemForm(prev => ({ ...prev, relatedName: e.target.value }))}
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
