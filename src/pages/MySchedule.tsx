import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  CalendarCheck, Clock, Phone, Mail, CheckSquare, Users, AlertCircle,
  ChevronRight, ChevronDown, Filter, Plus, Target, Briefcase, Ticket, Wrench,
  Calendar as CalendarIcon, Bell, Star, MoreHorizontal, Search,
  User, Heart, RefreshCcw, X, SlidersHorizontal, ExternalLink, StickyNote,
  Building2, Edit3
} from 'lucide-react';
import { TaskComposer } from '../components/TaskComposer';
import { TicketComposer } from '../components/TicketComposer';
import { CalendarEventComposer } from '../components/CalendarEventComposer';
import { LeadComposer } from '../components/LeadComposer';

type ViewMode = 'today' | 'week' | 'all';
type FilterType = 'all' | 'tasks' | 'callbacks' | 'followups' | 'meetings' | 'tickets' | 'personal';
type QuickFilter = 'all' | 'overdue' | 'assigned' | 'high-priority';

interface ScheduleItem {
  id: string;
  type: 'task' | 'callback' | 'followup' | 'meeting' | 'ticket' | 'job' | 'personal';
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  relatedTo?: { type: string; name: string; id: string };
  assignedBy?: string;
  assignedTo?: string;
}

const MySchedule: React.FC = () => {
  const navigate = useNavigate();
  const {
    tasks, leads, deals, contacts, accounts, communications, tickets,
    calendarEvents, users, toggleTask, dataSource
  } = useCRM();

  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [filter, setFilter] = useState<FilterType>('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);
  const [showTaskComposer, setShowTaskComposer] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showTicketComposer, setShowTicketComposer] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [showCalendarEventComposer, setShowCalendarEventComposer] = useState(false);
  const [editingCalendarEvent, setEditingCalendarEvent] = useState<any>(null);
  const [showLeadComposer, setShowLeadComposer] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [taskComposerType, setTaskComposerType] = useState<'general' | 'call' | 'lead' | 'deal'>('general');
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const expandedItemRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const currentUserId = 'user-1'; // In real app, get from auth context

  // Close add menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };

    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddMenu]);

  // Close expanded item when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedItemRef.current && !expandedItemRef.current.contains(event.target as Node)) {
        setSelectedItem(null);
      }
    };

    if (selectedItem) {
      // Small delay to prevent immediate close on same click
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [selectedItem]);

  // Build unified schedule from all sources
  const scheduleItems = useMemo(() => {
    const items: ScheduleItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Add tasks
    tasks.forEach(task => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      items.push({
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: (task.priority?.toLowerCase() as any) || 'medium',
        status: task.status === 'Completed' ? 'completed' :
               dueDate && dueDate < today ? 'overdue' : 'pending',
        assignedTo: task.assigneeId,
        relatedTo: task.relatedToType && task.relatedToId ? {
          type: task.relatedToType,
          name: (task.relatedToType === 'leads' ? leads.find(l => l.id === task.relatedToId)?.name :
                task.relatedToType === 'deals' ? deals.find(d => d.id === task.relatedToId)?.name :
                task.relatedToType === 'contacts' ? contacts.find(c => c.id === task.relatedToId)?.name :
                accounts.find(a => a.id === task.relatedToId)?.name) || 'Unknown',
          id: task.relatedToId
        } : undefined
      });
    });

    // Add tickets
    tickets.forEach(ticket => {
      const slaDate = ticket.slaDeadline ? new Date(ticket.slaDeadline) : null;
      if (ticket.status !== 'Resolved' && ticket.status !== 'Closed') {
        items.push({
          id: `ticket-${ticket.id}`,
          type: 'ticket',
          title: ticket.subject,
          description: `${ticket.category} - ${ticket.status}`,
          dueDate: ticket.slaDeadline,
          priority: (ticket.priority?.toLowerCase() as any) || 'medium',
          status: slaDate && slaDate < today ? 'overdue' : 'pending',
          assignedTo: ticket.assigneeId,
          relatedTo: ticket.relatedToType && ticket.relatedToId ? {
            type: ticket.relatedToType,
            name: (ticket.relatedToType === 'contacts' ? contacts.find(c => c.id === ticket.relatedToId)?.name :
                  accounts.find(a => a.id === ticket.relatedToId)?.name) || 'Unknown',
            id: ticket.relatedToId
          } : undefined
        });
      }
    });

    // Add personal and follow-up calendar events
    calendarEvents.forEach(event => {
      if (event.type === 'Personal' || event.type === 'Follow-up') {
        const eventDate = new Date(event.startTime);
        items.push({
          id: `event-${event.id}`,
          type: event.type === 'Personal' ? 'personal' : 'followup',
          title: event.title,
          description: event.description,
          dueDate: event.startTime,
          priority: (event.priority as any) || 'medium',
          status: eventDate < today ? 'overdue' : 'pending'
        });
      }
    });

    // Generate callbacks from leads that need follow-up
    leads.filter(l => l.status === 'Contacted' || l.status === 'Qualified').forEach(lead => {
      items.push({
        id: `callback-${lead.id}`,
        type: 'callback',
        title: `Follow up with ${lead.name}`,
        description: `Lead status: ${lead.status}`,
        priority: lead.status === 'Qualified' ? 'high' : 'medium',
        status: 'pending',
        relatedTo: { type: 'leads', name: lead.name, id: lead.id }
      });
    });

    // Generate email follow-ups from recent inbound communications
    const recentComms = communications.filter(c => c.type === 'Email' && c.direction === 'Inbound');
    recentComms.slice(0, 5).forEach(comm => {
      const entity = comm.relatedToType === 'leads' ? leads.find(l => l.id === comm.relatedToId) :
                     comm.relatedToType === 'contacts' ? contacts.find(c => c.id === comm.relatedToId) :
                     accounts.find(a => a.id === comm.relatedToId);
      if (entity) {
        items.push({
          id: `followup-${comm.id}`,
          type: 'followup',
          title: `Reply to ${entity.name}`,
          description: comm.subject || 'Email requires response',
          priority: 'medium',
          status: 'pending',
          relatedTo: { type: comm.relatedToType || 'contacts', name: entity.name, id: comm.relatedToId || '' }
        });
      }
    });

    // Generate deal follow-ups (meetings)
    deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').forEach(deal => {
      items.push({
        id: `deal-${deal.id}`,
        type: 'meeting',
        title: `Progress ${deal.name}`,
        description: `Stage: ${deal.stage} • Value: $${(deal.amount || 0).toLocaleString()}`,
        priority: (deal.amount || 0) > 10000 ? 'high' : 'medium',
        status: 'pending',
        relatedTo: { type: 'deals', name: deal.name, id: deal.id }
      });
    });

    return items;
  }, [tasks, leads, deals, contacts, accounts, communications, tickets, calendarEvents]);

  // Filter items based on all criteria
  const filteredItems = useMemo(() => {
    let items = [...scheduleItems];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.relatedTo?.name.toLowerCase().includes(query)
      );
    }

    // View mode filter (today/week/all)
    if (viewMode === 'today') {
      items = items.filter(item => {
        if (!item.dueDate) return true; // Include items without due dates
        const itemDate = new Date(item.dueDate);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === today.getTime() || item.status === 'overdue';
      });
    } else if (viewMode === 'week') {
      items = items.filter(item => {
        if (!item.dueDate) return true;
        const itemDate = new Date(item.dueDate);
        return itemDate >= today && itemDate <= weekEnd || item.status === 'overdue';
      });
    }

    // Type filter
    if (filter !== 'all') {
      const typeMap: Record<FilterType, string[]> = {
        all: [],
        tasks: ['task'],
        callbacks: ['callback'],
        followups: ['followup'],
        meetings: ['meeting'],
        tickets: ['ticket'],
        personal: ['personal']
      };
      items = items.filter(item => typeMap[filter].includes(item.type));
    }

    // Quick filter
    if (quickFilter === 'overdue') {
      items = items.filter(item => item.status === 'overdue');
    } else if (quickFilter === 'assigned') {
      items = items.filter(item => item.assignedTo === currentUserId);
    } else if (quickFilter === 'high-priority') {
      items = items.filter(item => item.priority === 'high');
    }

    // Stat box filter (overrides other filters when active)
    if (activeStatFilter) {
      switch (activeStatFilter) {
        case 'pending':
          items = items.filter(item => item.status !== 'completed');
          break;
        case 'overdue':
          items = items.filter(item => item.status === 'overdue');
          break;
        case 'highPriority':
          items = items.filter(item => item.priority === 'high' && item.status !== 'completed');
          break;
        case 'tasks':
          items = items.filter(item => item.type === 'task' && item.status !== 'completed');
          break;
        case 'tickets':
          items = items.filter(item => item.type === 'ticket');
          break;
        case 'completed':
          items = items.filter(item => item.status === 'completed');
          break;
      }
    } else {
      // Filter by completion only if no stat filter is active
      if (!showCompleted) {
        items = items.filter(item => item.status !== 'completed');
      }
    }

    // Sort by priority then status
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    items.sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return items;
  }, [scheduleItems, filter, quickFilter, showCompleted, viewMode, searchQuery, currentUserId, activeStatFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: scheduleItems.filter(i => i.status !== 'completed').length,
    overdue: scheduleItems.filter(i => i.status === 'overdue').length,
    highPriority: scheduleItems.filter(i => i.priority === 'high' && i.status !== 'completed').length,
    completed: scheduleItems.filter(i => i.status === 'completed').length,
    tickets: scheduleItems.filter(i => i.type === 'ticket').length,
    tasks: scheduleItems.filter(i => i.type === 'task' && i.status !== 'completed').length
  }), [scheduleItems]);

  const getTypeIcon = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'task': return CheckSquare;
      case 'callback': return Phone;
      case 'followup': return Mail;
      case 'meeting': return Users;
      case 'ticket': return Ticket;
      case 'job': return Wrench;
      case 'personal': return Heart;
      default: return CheckSquare;
    }
  };

  const getTypeColor = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'task': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'callback': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'followup': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'meeting': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'ticket': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'job': return 'bg-slate-50 text-slate-600 border-slate-100';
      case 'personal': return 'bg-pink-50 text-pink-600 border-pink-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getIconBgColor = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'task': return 'bg-blue-500';
      case 'callback': return 'bg-emerald-500';
      case 'followup': return 'bg-violet-500';
      case 'meeting': return 'bg-amber-500';
      case 'ticket': return 'bg-rose-500';
      case 'job': return 'bg-slate-500';
      case 'personal': return 'bg-pink-500';
      default: return 'bg-slate-500';
    }
  };

  const getPriorityColor = (priority: ScheduleItem['priority']) => {
    switch (priority) {
      case 'high': return 'bg-rose-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-slate-300';
    }
  };

  const handleItemClick = (item: ScheduleItem) => {
    // Toggle - if clicking the same item, collapse it; otherwise expand the new one
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const handleNavigateToRelated = (item: ScheduleItem) => {
    setSelectedItem(null);
    if (item.type === 'ticket') {
      // Navigate to specific ticket
      const ticketId = item.id.replace('ticket-', '');
      navigate(`/tickets/${ticketId}`);
    } else if (item.relatedTo) {
      navigate(`/${item.relatedTo.type}/${item.relatedTo.id}`);
    }
  };

  const handleEditItem = (item: ScheduleItem) => {
    setSelectedItem(null);
    if (item.type === 'task') {
      const taskId = item.id.replace('task-', '');
      const taskData = tasks.find(t => t.id === taskId);
      setEditingTask(taskData);
      setShowTaskComposer(true);
    } else if (item.type === 'ticket') {
      const ticketId = item.id.replace('ticket-', '');
      const ticketData = tickets.find(t => t.id === ticketId);
      setEditingTicket(ticketData);
      setShowTicketComposer(true);
    } else if (item.type === 'personal' || item.type === 'followup' || item.type === 'meeting') {
      const eventId = item.id.replace('event-', '');
      const eventData = calendarEvents.find(e => e.id === eventId);
      setEditingCalendarEvent(eventData);
      setShowCalendarEventComposer(true);
    } else if (item.type === 'callback') {
      // Callbacks are linked to leads
      const leadId = item.id.replace('callback-', '');
      const leadData = leads.find(l => l.id === leadId);
      setEditingLead(leadData);
      setShowLeadComposer(true);
    }
  };

  const handleOpenFullView = (item: ScheduleItem) => {
    setSelectedItem(null);
    if (item.type === 'task') {
      const taskId = item.id.replace('task-', '');
      navigate(`/tasks/${taskId}`);
    } else if (item.type === 'ticket') {
      const ticketId = item.id.replace('ticket-', '');
      navigate(`/tickets/${ticketId}`);
    } else if (item.type === 'personal' || item.type === 'followup' || item.type === 'meeting') {
      navigate('/calendar');
    } else if (item.relatedTo) {
      navigate(`/${item.relatedTo.type}/${item.relatedTo.id}`);
    }
  };

  const handleMarkComplete = (item: ScheduleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'task') {
      const taskId = item.id.replace('task-', '');
      toggleTask(taskId);
    }
  };

  const handleStatClick = (statKey: string) => {
    // Toggle the stat filter - clicking again clears it
    if (activeStatFilter === statKey) {
      setActiveStatFilter(null);
    } else {
      setActiveStatFilter(statKey);
      // Reset other filters when using stat boxes
      setQuickFilter('all');
      setFilter('all');
      setViewMode('all');
    }
  };

  const handleAddNew = (type: string, relatedType?: string) => {
    setShowAddMenu(false);

    switch (type) {
      case 'task':
        setTaskComposerType('general');
        setShowTaskComposer(true);
        break;
      case 'personal':
        setTaskComposerType('general');
        setShowTaskComposer(true);
        break;
      case 'meeting':
        setEditingCalendarEvent({ type: 'Meeting' });
        setShowCalendarEventComposer(true);
        break;
      case 'followup':
        setEditingCalendarEvent({ type: 'Follow-up' });
        setShowCalendarEventComposer(true);
        break;
      case 'callback':
        setTaskComposerType('call');
        setShowTaskComposer(true);
        break;
      case 'reminder':
        setEditingCalendarEvent({ type: 'Reminder' });
        setShowCalendarEventComposer(true);
        break;
      default:
        setTaskComposerType('general');
        setShowTaskComposer(true);
    }
  };

  if (dataSource === 'loading') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Workspace</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">My Schedule</h1>
        </div>
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => handleAddNew('personal')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <Heart size={14} /> Personal
          </button>

          {/* Add New Dropdown */}
          <div ref={addMenuRef} className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus size={14} /> Add New
              <ChevronDown size={12} className={`transition-transform ${showAddMenu ? 'rotate-180' : ''}`} />
            </button>

            {showAddMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-slide-up">
                <div className="p-2">
                  <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">CRM Tasks</p>
                  <button
                    onClick={() => handleAddNew('task')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-all text-left"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CheckSquare size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">General Task</p>
                      <p className="text-[10px] text-slate-400">Basic to-do item</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAddNew('callback')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-50 rounded-xl transition-all text-left"
                  >
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Phone size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Callback</p>
                      <p className="text-[10px] text-slate-400">Schedule a call with lead</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAddNew('followup')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-violet-50 rounded-xl transition-all text-left"
                  >
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Mail size={14} className="text-violet-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Follow-up</p>
                      <p className="text-[10px] text-slate-400">Email or message follow-up</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAddNew('meeting')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-amber-50 rounded-xl transition-all text-left"
                  >
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Users size={14} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Meeting</p>
                      <p className="text-[10px] text-slate-400">Schedule a meeting</p>
                    </div>
                  </button>
                </div>

                <div className="border-t border-slate-100 p-2">
                  <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Personal</p>
                  <button
                    onClick={() => handleAddNew('personal')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-pink-50 rounded-xl transition-all text-left"
                  >
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Heart size={14} className="text-pink-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Personal Event</p>
                      <p className="text-[10px] text-slate-400">Non-work related</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAddNew('reminder')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-all text-left"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Bell size={14} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Reminder</p>
                      <p className="text-[10px] text-slate-400">Quick reminder note</p>
                    </div>
                  </button>
                </div>

                <div className="border-t border-slate-100 p-2 bg-slate-50/50">
                  <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Quick Link</p>
                  <button
                    onClick={() => handleAddNew('task', 'leads')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-amber-50 rounded-xl transition-all text-left"
                  >
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Target size={14} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Lead Task</p>
                      <p className="text-[10px] text-slate-400">Task linked to a lead</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAddNew('task', 'deals')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-violet-50 rounded-xl transition-all text-left"
                  >
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Briefcase size={14} className="text-violet-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Deal Task</p>
                      <p className="text-[10px] text-slate-400">Task linked to a deal</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row - Clickable */}
      <div className="grid grid-cols-6 gap-4">
        <button
          onClick={() => handleStatClick('pending')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
            activeStatFilter === 'pending' ? 'border-blue-500 ring-2 ring-blue-100 shadow-lg' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-slate-900">{stats.total}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Pending</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeStatFilter === 'pending' ? 'bg-blue-500' : 'bg-blue-50'}`}>
              <CalendarCheck size={22} className={activeStatFilter === 'pending' ? 'text-white' : 'text-blue-600'} />
            </div>
          </div>
        </button>
        <button
          onClick={() => handleStatClick('overdue')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
            activeStatFilter === 'overdue' ? 'border-rose-500 ring-2 ring-rose-100 shadow-lg' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-rose-600">{stats.overdue}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Overdue</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeStatFilter === 'overdue' ? 'bg-rose-500' : 'bg-rose-50'}`}>
              <AlertCircle size={22} className={activeStatFilter === 'overdue' ? 'text-white' : 'text-rose-600'} />
            </div>
          </div>
        </button>
        <button
          onClick={() => handleStatClick('highPriority')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
            activeStatFilter === 'highPriority' ? 'border-amber-500 ring-2 ring-amber-100 shadow-lg' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-amber-600">{stats.highPriority}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">High Priority</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeStatFilter === 'highPriority' ? 'bg-amber-500' : 'bg-amber-50'}`}>
              <Star size={22} className={activeStatFilter === 'highPriority' ? 'text-white' : 'text-amber-600'} />
            </div>
          </div>
        </button>
        <button
          onClick={() => handleStatClick('tasks')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
            activeStatFilter === 'tasks' ? 'border-blue-500 ring-2 ring-blue-100 shadow-lg' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-blue-600">{stats.tasks}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Tasks</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeStatFilter === 'tasks' ? 'bg-blue-500' : 'bg-blue-50'}`}>
              <CheckSquare size={22} className={activeStatFilter === 'tasks' ? 'text-white' : 'text-blue-600'} />
            </div>
          </div>
        </button>
        <button
          onClick={() => handleStatClick('tickets')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
            activeStatFilter === 'tickets' ? 'border-rose-500 ring-2 ring-rose-100 shadow-lg' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-rose-600">{stats.tickets}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Tickets</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeStatFilter === 'tickets' ? 'bg-rose-500' : 'bg-rose-50'}`}>
              <Ticket size={22} className={activeStatFilter === 'tickets' ? 'text-white' : 'text-rose-600'} />
            </div>
          </div>
        </button>
        <button
          onClick={() => handleStatClick('completed')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
            activeStatFilter === 'completed' ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-lg' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-emerald-600">{stats.completed}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Completed</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeStatFilter === 'completed' ? 'bg-emerald-500' : 'bg-emerald-50'}`}>
              <CheckSquare size={22} className={activeStatFilter === 'completed' ? 'text-white' : 'text-emerald-600'} />
            </div>
          </div>
        </button>
      </div>

      {/* Active Filter Indicator */}
      {activeStatFilter && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-bold text-slate-500">Filtered by:</span>
          <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase">
            {activeStatFilter === 'highPriority' ? 'High Priority' : activeStatFilter}
          </span>
          <button
            onClick={() => setActiveStatFilter(null)}
            className="p-1 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={14} className="text-slate-400" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white border border-slate-200 rounded-[35px] overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search tasks, tickets, follow-ups..."
                className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
                >
                  <X size={14} className="text-slate-400" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              {[
                { key: 'all', label: 'All Items' },
                { key: 'overdue', label: 'Overdue' },
                { key: 'assigned', label: 'Assigned to Me' },
                { key: 'high-priority', label: 'High Priority' }
              ].map(qf => (
                <button
                  key={qf.key}
                  onClick={() => setQuickFilter(qf.key as QuickFilter)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    quickFilter === qf.key
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {qf.label}
                </button>
              ))}
            </div>

            {/* View Mode & Filters Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 rounded-xl p-1">
                {(['today', 'week', 'all'] as ViewMode[]).map(vm => (
                  <button
                    key={vm}
                    onClick={() => setViewMode(vm)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                      viewMode === vm ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {vm === 'today' ? 'Today' : vm === 'week' ? 'Week' : 'All'}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl transition-all ${
                  showFilters ? 'bg-blue-50 text-blue-600' : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Type Filters (Expandable) */}
          {showFilters && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 animate-slide-up">
              <div className="flex items-center gap-2">
                {([
                  { key: 'all', label: 'All', icon: CalendarCheck },
                  { key: 'tasks', label: 'Tasks', icon: CheckSquare },
                  { key: 'callbacks', label: 'Callbacks', icon: Phone },
                  { key: 'followups', label: 'Follow-ups', icon: Mail },
                  { key: 'meetings', label: 'Meetings', icon: Users },
                  { key: 'tickets', label: 'Tickets', icon: Ticket },
                  { key: 'personal', label: 'Personal', icon: Heart }
                ] as { key: FilterType; label: string; icon: any }[]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      filter === f.key
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <f.icon size={12} /> {f.label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-500">Show Completed</span>
              </label>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="divide-y divide-slate-100">
          {filteredItems.map(item => {
            const TypeIcon = getTypeIcon(item.type);
            const isExpanded = selectedItem?.id === item.id;
            return (
              <div
                key={item.id}
                ref={isExpanded ? expandedItemRef : null}
                className={`transition-all ${isExpanded ? 'bg-slate-50' : ''}`}
              >
                {/* Item Row - Always Visible */}
                <div
                  onClick={() => handleItemClick(item)}
                  className={`px-8 py-5 hover:bg-slate-50 transition-all cursor-pointer group flex items-center gap-4 ${
                    item.status === 'completed' ? 'opacity-50' : ''
                  } ${isExpanded ? 'border-b border-slate-200' : ''}`}
                >
                  {/* Priority indicator */}
                  <div className={`w-1.5 h-12 rounded-full ${getPriorityColor(item.priority)}`} />

                  {/* Checkbox (only for tasks) */}
                  {item.type === 'task' ? (
                    <button
                      onClick={(e) => handleMarkComplete(item, e)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                        item.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-200 hover:border-blue-500'
                      }`}
                    >
                      {item.status === 'completed' && <CheckSquare size={14} />}
                    </button>
                  ) : (
                    <div className={`w-6 h-6 rounded-lg ${getIconBgColor(item.type)} flex items-center justify-center shrink-0`}>
                      <TypeIcon size={12} className="text-white" />
                    </div>
                  )}

                  {/* Type Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getTypeColor(item.type)}`}>
                    <TypeIcon size={18} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                      {item.status === 'overdue' && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rose-100 text-rose-600">
                          Overdue
                        </span>
                      )}
                      {item.priority === 'high' && item.status !== 'overdue' && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-600">
                          High Priority
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors ${
                      item.status === 'completed' ? 'line-through' : ''
                    }`}>
                      {item.title}
                    </p>
                    {item.description && !isExpanded && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>
                    )}
                  </div>

                  {/* Due Date */}
                  {item.dueDate && (
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-black ${item.status === 'overdue' ? 'text-rose-600' : 'text-slate-700'}`}>
                        {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      {item.dueDate.includes('T') && (
                        <p className="text-[10px] font-bold text-slate-400">
                          {new Date(item.dueDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Related Entity */}
                  {item.relatedTo && !isExpanded && (
                    <div className="text-right shrink-0 max-w-[150px]">
                      <p className="text-xs font-black text-slate-700 truncate">{item.relatedTo.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{item.relatedTo.type}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-2 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <MoreHorizontal size={16} className="text-slate-400" />
                    </button>
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-blue-500" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                    )}
                  </div>
                </div>

                {/* Expanded Detail Section */}
                {isExpanded && (
                  <div className="px-8 py-6 bg-slate-50 animate-slide-up">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Left Column - Description & Details */}
                      <div className="col-span-2 space-y-4">
                        {/* Description */}
                        {item.description && (
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
                            <p className="text-sm text-slate-600 bg-white rounded-xl p-4 border border-slate-200">{item.description}</p>
                          </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-3 gap-3">
                          {item.dueDate && (
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                              <div className="flex items-center gap-2 mb-2">
                                <CalendarIcon size={14} className="text-slate-400" />
                                <p className="text-[10px] font-black text-slate-400 uppercase">Due Date</p>
                              </div>
                              <p className={`text-sm font-black ${item.status === 'overdue' ? 'text-rose-600' : 'text-slate-700'}`}>
                                {new Date(item.dueDate).toLocaleDateString('en-US', {
                                  weekday: 'short', month: 'short', day: 'numeric'
                                })}
                              </p>
                              {item.dueDate.includes('T') && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {new Date(item.dueDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          )}
                          <div className="bg-white rounded-xl p-4 border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Star size={14} className="text-slate-400" />
                              <p className="text-[10px] font-black text-slate-400 uppercase">Priority</p>
                            </div>
                            <p className={`text-sm font-black capitalize ${
                              item.priority === 'high' ? 'text-rose-600' :
                              item.priority === 'medium' ? 'text-amber-600' : 'text-slate-500'
                            }`}>
                              {item.priority}
                            </p>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock size={14} className="text-slate-400" />
                              <p className="text-[10px] font-black text-slate-400 uppercase">Status</p>
                            </div>
                            <p className={`text-sm font-black capitalize ${
                              item.status === 'overdue' ? 'text-rose-600' :
                              item.status === 'completed' ? 'text-emerald-600' : 'text-slate-700'
                            }`}>
                              {item.status}
                            </p>
                          </div>
                        </div>

                        {/* Related Entity */}
                        {item.relatedTo && (
                          <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-2xl p-5 border border-blue-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Linked To</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  item.relatedTo.type === 'leads' ? 'bg-amber-100' :
                                  item.relatedTo.type === 'deals' ? 'bg-violet-100' :
                                  item.relatedTo.type === 'contacts' ? 'bg-blue-100' : 'bg-emerald-100'
                                }`}>
                                  {item.relatedTo.type === 'leads' ? <Target size={20} className="text-amber-600" /> :
                                   item.relatedTo.type === 'deals' ? <Briefcase size={20} className="text-violet-600" /> :
                                   item.relatedTo.type === 'contacts' ? <User size={20} className="text-blue-600" /> :
                                   <Building2 size={20} className="text-emerald-600" />}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-900">{item.relatedTo.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">{item.relatedTo.type}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleNavigateToRelated(item)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 rounded-xl text-[10px] font-bold hover:bg-blue-50 transition-all border border-blue-200"
                              >
                                <ExternalLink size={14} /> Open {item.relatedTo.type.slice(0, -1)}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column - Actions */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-2xl p-5 border border-slate-200">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</p>
                          <div className="space-y-2">
                            {item.type === 'task' && (
                              <button
                                onClick={(e) => {
                                  handleMarkComplete(item, e);
                                  setSelectedItem(null);
                                }}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-bold transition-all ${
                                  item.status === 'completed'
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                              >
                                <CheckSquare size={14} />
                                {item.status === 'completed' ? 'Completed' : 'Mark Complete'}
                              </button>
                            )}
                            {item.type === 'ticket' && (
                              <button
                                onClick={() => handleOpenFullView(item)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-bold hover:bg-rose-700 transition-all"
                              >
                                <Ticket size={14} /> View Ticket
                              </button>
                            )}
                            <button
                              onClick={() => handleEditItem(item)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-50 transition-all"
                            >
                              <Edit3 size={14} /> Edit Details
                            </button>
                            <button
                              onClick={() => handleOpenFullView(item)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold hover:bg-blue-100 transition-all"
                            >
                              <ExternalLink size={14} /> Open Full View
                            </button>
                          </div>
                        </div>

                        {/* Close button */}
                        <button
                          onClick={() => setSelectedItem(null)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-slate-600 text-[10px] font-bold transition-all"
                        >
                          <X size={14} /> Close Details
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="p-20 text-center">
              <CalendarCheck size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-sm font-black text-slate-400">No items to show</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery ? 'Try a different search term' :
                 filter === 'all' ? 'Your schedule is clear!' : `No ${filter} found`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Team Activity Section */}
      <div className="bg-white border border-slate-200 rounded-[35px] p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">Team Activity</h2>
            <p className="text-xs text-slate-400 mt-1">See what your team is working on</p>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {users.slice(0, 4).map((user, index) => {
            const userTasks = tasks.filter(t => t.assigneeId === user.id && t.status !== 'Completed').length;
            const progress = Math.min(100, (userTasks / 10) * 100);
            const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500'];
            return (
              <div key={user.id} className="p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 ${colors[index % 4]} rounded-full flex items-center justify-center text-white text-xs font-black`}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-400">{userTasks} tasks pending</p>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full">
                  <div className={`h-full ${colors[index % 4]} rounded-full transition-all`} style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Composers */}
      <TaskComposer
        isOpen={showTaskComposer}
        onClose={() => {
          setShowTaskComposer(false);
          setEditingTask(null);
        }}
        initialData={editingTask || undefined}
        mode={editingTask ? 'edit' : 'create'}
      />

      <TicketComposer
        isOpen={showTicketComposer}
        onClose={() => {
          setShowTicketComposer(false);
          setEditingTicket(null);
        }}
        initialData={editingTicket || undefined}
        mode={editingTicket ? 'edit' : 'create'}
      />

      <CalendarEventComposer
        isOpen={showCalendarEventComposer}
        onClose={() => {
          setShowCalendarEventComposer(false);
          setEditingCalendarEvent(null);
        }}
        initialData={editingCalendarEvent || undefined}
        mode={editingCalendarEvent ? 'edit' : 'create'}
      />

      <LeadComposer
        isOpen={showLeadComposer}
        onClose={() => {
          setShowLeadComposer(false);
          setEditingLead(null);
        }}
        initialData={editingLead || undefined}
        mode={editingLead ? 'edit' : 'create'}
      />
    </div>
  );
};

export default MySchedule;
