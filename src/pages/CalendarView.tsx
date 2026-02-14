import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Plus, Clock, User, Target, MapPin, MoreHorizontal,
  LayoutGrid, List, Maximize2, Minimize2, CheckSquare,
  Ticket as TicketIcon, Briefcase, CalendarDays, Heart,
  Mail, Phone, RefreshCcw, X, ExternalLink, Building2,
  AlertCircle, Edit3, Trash2, Check
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { EntityType } from '../types';
import { EventComposer } from '../components/EventComposer';

type ViewMode = 'month' | 'week' | 'day';
type EventFilter = 'all' | 'meetings' | 'tasks' | 'personal' | 'followups' | 'tickets' | 'milestones';

const CalendarView: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, deals, tickets, calendarEvents, communications, leads, contacts, accounts, users, openModal, upsertRecord, deleteRecord, toggleTask, updateStatus } = useCRM();

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [showNewEventMenu, setShowNewEventMenu] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [dayMenuDate, setDayMenuDate] = useState<Date | null>(null);
  const [dayMenuPosition, setDayMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [isEditingPopup, setIsEditingPopup] = useState(false);
  const [popupEdits, setPopupEdits] = useState<any>({});
  const [showEventComposer, setShowEventComposer] = useState(false);
  const [eventComposerData, setEventComposerData] = useState<any>(null);
  const [eventComposerMode, setEventComposerMode] = useState<'create' | 'edit'>('create');
  const newEventMenuRef = useRef<HTMLDivElement>(null);
  const dayMenuRef = useRef<HTMLDivElement>(null);

  // Close new event menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (newEventMenuRef.current && !newEventMenuRef.current.contains(event.target as Node)) {
        setShowNewEventMenu(false);
      }
    };

    if (showNewEventMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNewEventMenu]);

  // Close day menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dayMenuRef.current && !dayMenuRef.current.contains(event.target as Node)) {
        setDayMenuDate(null);
        setDayMenuPosition(null);
      }
    };

    if (dayMenuDate) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [dayMenuDate]);

  // Navigation Logic
  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + direction);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + (direction * 7));
    else newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const setToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  // Event type configurations
  const eventConfig = {
    calendarEvents: { color: 'bg-blue-600', icon: CalendarIcon, label: 'Meeting' },
    tasks: { color: 'bg-emerald-500', icon: CheckSquare, label: 'Task' },
    deals: { color: 'bg-amber-500', icon: Briefcase, label: 'Milestone' },
    tickets: { color: 'bg-rose-500', icon: TicketIcon, label: 'Ticket SLA' },
    personal: { color: 'bg-pink-500', icon: Heart, label: 'Personal' },
    followup: { color: 'bg-violet-500', icon: Mail, label: 'Follow-up' }
  };

  // Unified Event Aggregator
  const allEvents = useMemo(() => {
    const items: any[] = [];

    // Calendar Events (Meetings, Calls, Personal, Follow-ups)
    calendarEvents.forEach(e => {
      let config = eventConfig.calendarEvents;
      if (e.type === 'Personal') config = eventConfig.personal;
      else if (e.type === 'Follow-up') config = eventConfig.followup;
      else if (e.type === 'Call') config = { color: 'bg-emerald-600', icon: Phone, label: 'Call' };

      items.push({
        ...e,
        type: 'calendarEvents',
        eventType: e.type,
        date: e.startTime,
        color: config.color,
        icon: config.icon,
        label: config.label
      });
    });

    // Tasks
    tasks.forEach(t => {
      if (t.dueDate) {
        items.push({
          ...t,
          type: 'tasks',
          eventType: 'Task',
          date: t.dueDate,
          color: eventConfig.tasks.color,
          icon: eventConfig.tasks.icon,
          label: 'Task'
        });
      }
    });

    // Deals (Milestones - expected close dates)
    deals.forEach(d => {
      if (d.expectedCloseDate) {
        items.push({
          ...d,
          type: 'deals',
          eventType: 'Milestone',
          date: d.expectedCloseDate,
          color: eventConfig.deals.color,
          icon: eventConfig.deals.icon,
          label: 'Milestone'
        });
      }
    });

    // Tickets (SLA deadlines)
    tickets.forEach(t => {
      if (t.slaDeadline) {
        items.push({
          ...t,
          type: 'tickets',
          eventType: 'Ticket SLA',
          date: t.slaDeadline,
          color: eventConfig.tickets.color,
          icon: eventConfig.tickets.icon,
          label: 'Ticket SLA'
        });
      }
    });

    return items;
  }, [tasks, deals, tickets, calendarEvents]);

  // Filter events based on selected filter
  const filteredEvents = useMemo(() => {
    if (eventFilter === 'all') return allEvents;

    return allEvents.filter(evt => {
      switch (eventFilter) {
        case 'meetings':
          return evt.type === 'calendarEvents' && (evt.eventType === 'Meeting' || evt.eventType === 'Call' || evt.eventType === 'Internal');
        case 'tasks':
          return evt.type === 'tasks';
        case 'personal':
          return evt.eventType === 'Personal';
        case 'followups':
          return evt.eventType === 'Follow-up';
        case 'tickets':
          return evt.type === 'tickets';
        case 'milestones':
          return evt.type === 'deals';
        default:
          return true;
      }
    });
  }, [allEvents, eventFilter]);

  // View Calculation Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];

    // Get the first day of the month
    const firstDay = new Date(year, month, 1);

    // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    // Convert to Monday-based (1 = Monday, 7 = Sunday)
    let firstDayOfWeek = firstDay.getDay();
    if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Sunday becomes 7

    // Calculate how many days back to go to get to Monday
    const daysToGoBack = firstDayOfWeek - 1;

    // Start from the Monday of the week containing the 1st
    const startDate = new Date(year, month, 1 - daysToGoBack);

    // Generate 42 days (6 weeks) to ensure we cover the whole month
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const isCurrentMonth = currentDate.getMonth() === month;

      days.push({
        date: currentDate,
        isCurrentMonth
      });
    }

    return days;
  };

  const getWeekDays = (date: Date) => {
    const day = date.getDay() || 7;
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - day + 1, 12, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i, 12, 0, 0, 0);
    });
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, item: any) => {
    e.dataTransfer.setData('itemId', item.id);
    e.dataTransfer.setData('itemType', item.type);
    e.dataTransfer.setData('originalDate', item.date);
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('itemId');
    const itemType = e.dataTransfer.getData('itemType') as EntityType;
    const originalDateStr = e.dataTransfer.getData('originalDate');

    const originalDate = new Date(originalDateStr);
    const newDate = new Date(targetDate);

    // Preserve time if it's a timestamp
    if (originalDateStr.includes('T')) {
      newDate.setHours(originalDate.getHours());
      newDate.setMinutes(originalDate.getMinutes());
    }

    const item = allEvents.find(evt => evt.id === itemId && evt.type === itemType);
    if (!item) return;

    const dateKeyMap: Record<string, string> = {
      calendarEvents: 'startTime',
      tasks: 'dueDate',
      deals: 'expectedCloseDate',
      tickets: 'slaDeadline'
    };

    upsertRecord(itemType, {
      ...item,
      [dateKeyMap[itemType]]: newDate.toISOString()
    });
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const getDayEvents = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(evt => evt.date && evt.date.startsWith(dateStr));
  };

  const handleCreateEvent = (eventType: string) => {
    setShowNewEventMenu(false);
    if (eventType === 'Task') {
      // Open tasks modal for tasks
      openModal('tasks', {});
    } else {
      setEventComposerData({ type: eventType });
      setEventComposerMode('create');
      setShowEventComposer(true);
    }
  };

  const handleCreateEventForDate = (eventType: string) => {
    if (dayMenuDate) {
      // Set the start time to 9:00 AM on the selected date by default
      const startTime = new Date(dayMenuDate);
      startTime.setHours(9, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);

      setDayMenuDate(null);
      setDayMenuPosition(null);

      if (eventType === 'Task') {
        // Open tasks modal with the due date set
        openModal('tasks', {
          dueDate: dayMenuDate.toISOString().split('T')[0]
        });
      } else {
        setEventComposerData({
          type: eventType,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        });
        setEventComposerMode('create');
        setShowEventComposer(true);
      }
    }
  };

  const handleDayClick = (e: React.MouseEvent, date: Date) => {
    e.stopPropagation();

    const menuWidth = 240;
    const menuHeight = 380;
    const padding = 10;

    // Use clientX/clientY for viewport coordinates since menu uses position: fixed
    const clickX = e.clientX;
    const clickY = e.clientY;

    // Calculate viewport constraints
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Position horizontally - smart placement based on available space
    let x: number;
    const spaceOnRight = viewportWidth - clickX;
    const spaceOnLeft = clickX;

    if (spaceOnRight >= menuWidth + padding) {
      // Enough space on right - position to the right of click
      x = clickX + padding;
    } else if (spaceOnLeft >= menuWidth + padding) {
      // Not enough on right, use left
      x = clickX - menuWidth - padding;
    } else {
      // Constrain to viewport - align to right edge with padding
      x = viewportWidth - menuWidth - padding;
    }

    // Ensure menu doesn't go off-screen horizontally
    if (x < padding) x = padding;
    if (x + menuWidth > viewportWidth - padding) {
      x = viewportWidth - menuWidth - padding;
    }

    // Position vertically - smart placement based on available space
    let y: number;
    const spaceBelow = viewportHeight - clickY;
    const spaceAbove = clickY;

    if (spaceBelow >= menuHeight + padding) {
      // Enough space below - position below click
      y = clickY + padding;
    } else if (spaceAbove >= menuHeight + padding) {
      // Not enough below, use above
      y = clickY - menuHeight - padding;
    } else {
      // Not enough space either side - center vertically
      y = (viewportHeight / 2) - (menuHeight / 2);
    }

    // Ensure menu doesn't go off-screen vertically
    if (y < padding) y = padding;
    if (y + menuHeight > viewportHeight - padding) {
      y = viewportHeight - menuHeight - padding;
    }

    setDayMenuPosition({ x, y });
    setDayMenuDate(date);
  };

  const handleEventClick = (e: React.MouseEvent, evt: any) => {
    e.stopPropagation(); // Prevent day menu from opening
    setSelectedEvent(evt);
  };

  const closeEventPopup = () => {
    setSelectedEvent(null);
    setIsEditingPopup(false);
    setPopupEdits({});
  };

  // Start inline editing in popup
  const startPopupEdit = () => {
    if (selectedEvent) {
      setPopupEdits({
        location: selectedEvent.location || '',
        description: selectedEvent.description || selectedEvent.notes || '',
        attendees: selectedEvent.attendees || [],
        status: selectedEvent.status || '',
        priority: selectedEvent.priority || '',
        assigneeId: selectedEvent.assigneeId || ''
      });
      setIsEditingPopup(true);
    }
  };

  // Save inline edits
  const savePopupEdits = () => {
    if (!selectedEvent) return;

    const updatedEvent = {
      ...selectedEvent,
      location: popupEdits.location || '',
      description: popupEdits.description || '',
      notes: popupEdits.description || '',
      attendees: popupEdits.attendees || [],
      status: popupEdits.status || selectedEvent.status || '',
      priority: popupEdits.priority || selectedEvent.priority || '',
      assigneeId: popupEdits.assigneeId || selectedEvent.assigneeId || ''
    };

    // Remove the computed properties before saving
    const { color, icon, label, eventType, date, ...cleanEvent } = updatedEvent;

    upsertRecord(selectedEvent.type, cleanEvent);
    setSelectedEvent(updatedEvent);
    setIsEditingPopup(false);
  };

  // Get related entity info for popup
  const getRelatedEntityInfo = (evt: any) => {
    const relations: any[] = [];

    if (evt.type === 'tasks') {
      if (evt.relatedToType && evt.relatedToId) {
        const relatedType = evt.relatedToType.toLowerCase();
        let relatedEntity = null;
        let entityName = '';

        if (relatedType === 'deals') {
          relatedEntity = deals.find(d => d.id === evt.relatedToId);
          entityName = relatedEntity?.name || '';
        } else if (relatedType === 'leads') {
          relatedEntity = leads.find(l => l.id === evt.relatedToId);
          entityName = relatedEntity?.name || '';
        } else if (relatedType === 'accounts') {
          relatedEntity = accounts.find(a => a.id === evt.relatedToId);
          entityName = relatedEntity?.name || '';
        } else if (relatedType === 'contacts') {
          relatedEntity = contacts.find(c => c.id === evt.relatedToId);
          entityName = relatedEntity?.name || '';
        } else if (relatedType === 'tickets') {
          relatedEntity = tickets.find(t => t.id === evt.relatedToId);
          entityName = relatedEntity?.subject || '';
        }

        if (relatedEntity) {
          relations.push({
            type: relatedType,
            id: evt.relatedToId,
            name: entityName,
            icon: relatedType === 'deals' ? Briefcase : relatedType === 'leads' ? Target : relatedType === 'accounts' ? Building2 : relatedType === 'contacts' ? User : TicketIcon
          });
        }
      }
    } else if (evt.type === 'deals') {
      const account = accounts.find(a => a.id === evt.accountId);
      if (account) {
        relations.push({ type: 'accounts', id: evt.accountId, name: account.name, icon: Building2 });
      }
      const contact = contacts.find(c => c.id === evt.contactId);
      if (contact) {
        relations.push({ type: 'contacts', id: evt.contactId, name: contact.name, icon: User });
      }
    } else if (evt.type === 'tickets') {
      const account = accounts.find(a => a.id === evt.accountId);
      if (account) {
        relations.push({ type: 'accounts', id: evt.accountId, name: account.name, icon: Building2 });
      }
      const requester = contacts.find(c => c.id === evt.requesterId);
      if (requester) {
        relations.push({ type: 'contacts', id: evt.requesterId, name: requester.name, icon: User });
      }
    } else if (evt.type === 'calendarEvents') {
      if (evt.relatedToType && evt.relatedToId) {
        const relatedType = evt.relatedToType.toLowerCase();
        let relatedEntity = null;
        let entityName = '';

        if (relatedType === 'deals') {
          relatedEntity = deals.find(d => d.id === evt.relatedToId);
          entityName = relatedEntity?.name || '';
        } else if (relatedType === 'leads') {
          relatedEntity = leads.find(l => l.id === evt.relatedToId);
          entityName = relatedEntity?.name || '';
        } else if (relatedType === 'accounts') {
          relatedEntity = accounts.find(a => a.id === evt.relatedToId);
          entityName = relatedEntity?.name || '';
        } else if (relatedType === 'contacts') {
          relatedEntity = contacts.find(c => c.id === evt.relatedToId);
          entityName = relatedEntity?.name || '';
        }

        if (relatedEntity) {
          relations.push({
            type: relatedType,
            id: evt.relatedToId,
            name: entityName,
            icon: relatedType === 'deals' ? Briefcase : relatedType === 'leads' ? Target : relatedType === 'accounts' ? Building2 : User
          });
        }
      }
    }

    return relations;
  };

  // Action handlers for popup
  const handleCompleteTask = (taskId: string) => {
    toggleTask(taskId);
    closeEventPopup();
  };

  const handleResolveTicket = (ticketId: string) => {
    updateStatus('tickets', ticketId, 'Resolved');
    closeEventPopup();
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const renderMonthView = () => {
    const monthDays = getDaysInMonth(currentDate);
    return (
      <div className="grid grid-cols-7 border-l border-t border-slate-100 bg-white rounded-[30px] overflow-hidden">
        {dayNames.map(name => (
          <div key={name} className="p-4 border-r border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 text-center bg-slate-50/50">
            {name}
          </div>
        ))}
        {monthDays.map(({ date, isCurrentMonth }, i) => {
          const dayEvents = getDayEvents(date);
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div
              key={i}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, date)}
              onClick={(e) => handleDayClick(e, date)}
              className={`min-h-[140px] p-2 border-r border-b border-slate-100 transition-colors cursor-pointer hover:bg-blue-50/50 ${!isCurrentMonth ? 'bg-slate-50/30' : 'bg-white'} ${isToday ? 'bg-blue-50/30' : ''}`}
            >
              <div className="flex justify-between items-center mb-2 px-1">
                <span className={`text-xs font-black ${isToday ? 'w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center' : isCurrentMonth ? 'text-slate-900' : 'text-slate-300'}`}>
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{dayEvents.length}</span>
                )}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 4).map((evt, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, evt)}
                    onClick={(e) => handleEventClick(e, evt)}
                    className={`${evt.color} px-2 py-1 rounded-lg text-white text-[9px] font-bold truncate cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm`}
                  >
                    {evt.title || evt.name || evt.subject}
                  </div>
                ))}
                {dayEvents.length > 4 && (
                  <button
                    onClick={() => { setCurrentDate(date); setViewMode('day'); }}
                    className="w-full text-center text-[8px] font-black text-slate-400 uppercase hover:text-blue-600 transition-colors"
                  >
                    + {dayEvents.length - 4} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    return (
      <div className="flex flex-col bg-white rounded-[40px] overflow-hidden border border-slate-200">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
          {weekDays.map((date, i) => {
            const isToday = new Date().toDateString() === date.toDateString();
            return (
              <div key={i} className={`p-6 text-center border-r border-slate-100 last:border-r-0 ${isToday ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 relative z-10' : ''}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isToday ? 'text-blue-100' : 'text-slate-400'}`}>{dayNames[i]}</p>
                <p className={`text-2xl font-black ${isToday ? 'text-white' : 'text-slate-900'}`}>{date.getDate()}</p>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[600px]">
          {weekDays.map((date, i) => {
            const dayEvents = getDayEvents(date);
            return (
              <div
                key={i}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, date)}
                onClick={(e) => handleDayClick(e, date)}
                className="p-3 space-y-4 bg-white hover:bg-slate-50/30 transition-colors cursor-pointer"
              >
                {dayEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, evt)}
                    onClick={(e) => handleEventClick(e, evt)}
                    className={`p-3 ${evt.color} rounded-2xl text-white shadow-lg group cursor-pointer hover:scale-[1.02] active:scale-95 transition-all`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <evt.icon size={14} className="opacity-80" />
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-80">
                        {evt.date.includes('T') ? new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                      </span>
                    </div>
                    <p className="text-[10px] font-black leading-tight mb-1 truncate">{evt.title || evt.name || evt.subject}</p>
                    <p className="text-[8px] font-bold opacity-80 uppercase">{evt.label}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getDayEvents(currentDate);
    const sorted = dayEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm min-h-[600px]">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-[28px] flex flex-col items-center justify-center text-white shadow-xl shadow-blue-100">
            <span className="text-[10px] font-black uppercase">{currentDate.toLocaleDateString('en-US', { month: 'short' })}</span>
            <span className="text-3xl font-black">{currentDate.getDate()}</span>
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{currentDate.toLocaleDateString('en-US', { weekday: 'long' })}</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{dayEvents.length} items scheduled for today</p>
          </div>
        </div>

        <div className="space-y-6">
          {sorted.map((evt, idx) => (
            <div
              key={idx}
              onClick={(e) => handleEventClick(e, evt)}
              className="group flex gap-8 items-start hover:translate-x-2 transition-all cursor-pointer"
            >
              <div className="w-24 pt-2 text-right">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {evt.date.includes('T') ? new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                </span>
              </div>
              <div className="flex-1 p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center justify-between group-hover:shadow-md transition-all">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 ${evt.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    <evt.icon size={22} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">{evt.title || evt.name || evt.subject}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{evt.label}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
          {dayEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-40 text-slate-300">
              <CalendarDays size={64} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">No activities for this day</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Handle editing the event
  const handleEditEvent = () => {
    if (!selectedEvent) return;
    if (selectedEvent.type === 'calendarEvents') {
      setEventComposerData(selectedEvent);
      setEventComposerMode('edit');
      setShowEventComposer(true);
    } else if (selectedEvent.type === 'tasks') {
      openModal('tasks', selectedEvent);
    } else if (selectedEvent.type === 'deals') {
      openModal('deals', selectedEvent);
    } else if (selectedEvent.type === 'tickets') {
      openModal('tickets', selectedEvent);
    }
    closeEventPopup();
  };

  // Handle deleting a calendar event
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    setShowDeleteConfirm(true);
  };
  const confirmDeleteEvent = () => {
    if (!selectedEvent) return;
    const entityType = selectedEvent.type as EntityType;
    deleteRecord(entityType, selectedEvent.id);
    setShowDeleteConfirm(false);
    closeEventPopup();
  };

  // Event Popup Modal - Enhanced with more features
  const renderEventPopup = () => {
    if (!selectedEvent) return null;

    const relations = getRelatedEntityInfo(selectedEvent);
    const EventIcon = selectedEvent.icon;

    // Get attendees/assignees info - use users list first
    const getAttendees = () => {
      if (selectedEvent.type === 'calendarEvents' && selectedEvent.attendees) {
        return selectedEvent.attendees;
      }
      if (selectedEvent.assigneeId) {
        // Check users first, then contacts, then leads
        const assignee = users.find(u => u.id === selectedEvent.assigneeId) ||
                        contacts.find(c => c.id === selectedEvent.assigneeId) ||
                        leads.find(l => l.id === selectedEvent.assigneeId);
        return assignee ? [{ name: assignee.name, id: assignee.id }] : [];
      }
      return [];
    };

    const attendees = getAttendees();
    const currentAssignee = users.find(u => u.id === selectedEvent.assigneeId);

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={closeEventPopup}
        />
        {/* Modal - Larger size */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[32px] shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className={`${selectedEvent.color} p-8 text-white`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <EventIcon size={32} />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">{selectedEvent.label}</p>
                  <h3 className="text-2xl font-black">{selectedEvent.title || selectedEvent.name || selectedEvent.subject}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEditEvent}
                  className="p-2.5 hover:bg-white/20 rounded-xl transition-colors"
                  title="Edit"
                >
                  <Edit3 size={20} />
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="p-2.5 hover:bg-red-500/30 rounded-xl transition-colors"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
                <button onClick={closeEventPopup} className="p-2.5 hover:bg-white/20 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Content - Two Column Layout */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-5">
                {/* Date/Time */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Clock size={18} className="text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    {selectedEvent.date.includes('T') && (
                      <p className="text-sm text-slate-600 mt-0.5">
                        {new Date(selectedEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {selectedEvent.endTime && ` - ${new Date(selectedEvent.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <MapPin size={18} className="text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                    {isEditingPopup ? (
                      <input
                        type="text"
                        value={popupEdits.location || ''}
                        onChange={(e) => setPopupEdits((prev: any) => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter location..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : selectedEvent.location ? (
                      <p
                        className="text-sm font-bold text-slate-900 cursor-pointer hover:text-blue-600"
                        onClick={startPopupEdit}
                      >
                        {selectedEvent.location}
                      </p>
                    ) : (
                      <button
                        onClick={startPopupEdit}
                        className="text-sm text-blue-600 font-bold hover:text-blue-700"
                      >
                        + Add location
                      </button>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <AlertCircle size={18} className="text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    {isEditingPopup && selectedEvent.type === 'tasks' ? (
                      <select
                        value={popupEdits.status || selectedEvent.status || 'Pending'}
                        onChange={(e) => setPopupEdits((prev: any) => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : selectedEvent.type === 'tasks' ? (
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${selectedEvent.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {selectedEvent.status || (selectedEvent.completed ? 'Completed' : 'Pending')}
                      </span>
                    ) : selectedEvent.type === 'tickets' ? (
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                        selectedEvent.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' :
                        selectedEvent.status === 'New' ? 'bg-blue-100 text-blue-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {selectedEvent.status}
                      </span>
                    ) : selectedEvent.type === 'deals' ? (
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-violet-100 text-violet-600">
                        {selectedEvent.stage}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-100 text-blue-600">
                        {selectedEvent.eventType}
                      </span>
                    )}
                  </div>
                </div>

                {/* Priority for tasks */}
                {(selectedEvent.priority || selectedEvent.type === 'tasks') && (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Target size={18} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                      {isEditingPopup && selectedEvent.type === 'tasks' ? (
                        <select
                          value={popupEdits.priority || selectedEvent.priority || 'Medium'}
                          onChange={(e) => setPopupEdits((prev: any) => ({ ...prev, priority: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                          selectedEvent.priority === 'High' || selectedEvent.priority === 'high' ? 'bg-rose-100 text-rose-600' :
                          selectedEvent.priority === 'Medium' || selectedEvent.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {selectedEvent.priority || 'Medium'}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Value for deals */}
                {selectedEvent.type === 'deals' && selectedEvent.amount && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Briefcase size={18} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Deal Value</p>
                      <span className="text-xl font-black text-emerald-700">${selectedEvent.amount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                {/* Description */}
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
                  {isEditingPopup ? (
                    <textarea
                      value={popupEdits.description || ''}
                      onChange={(e) => setPopupEdits((prev: any) => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter description..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
                    />
                  ) : (selectedEvent.description || selectedEvent.notes) ? (
                    <p
                      className="text-sm text-slate-600 leading-relaxed cursor-pointer hover:text-blue-600"
                      onClick={startPopupEdit}
                    >
                      {selectedEvent.description || selectedEvent.notes}
                    </p>
                  ) : (
                    <button
                      onClick={startPopupEdit}
                      className="text-sm text-blue-600 font-bold hover:text-blue-700"
                    >
                      + Add description
                    </button>
                  )}
                </div>

                {/* Team Members / Attendees */}
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {selectedEvent.type === 'calendarEvents' ? 'Attendees' : 'Assigned To'}
                    </p>
                    {!isEditingPopup && (
                      <button
                        onClick={startPopupEdit}
                        className="text-[9px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                      >
                        + Change
                      </button>
                    )}
                  </div>
                  {isEditingPopup ? (
                    <div className="space-y-3">
                      {/* User Assignment Dropdown */}
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Assign To User</label>
                        <select
                          value={popupEdits.assigneeId || selectedEvent.assigneeId || ''}
                          onChange={(e) => setPopupEdits((prev: any) => ({ ...prev, assigneeId: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select User...</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                          ))}
                        </select>
                      </div>
                      {/* Additional Attendees (for calendar events) */}
                      {selectedEvent.type === 'calendarEvents' && (
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Additional Attendees</label>
                          <input
                            type="text"
                            value={Array.isArray(popupEdits.attendees) ? popupEdits.attendees.map((a: any) => a.name || a).join(', ') : popupEdits.attendees || ''}
                            onChange={(e) => setPopupEdits((prev: any) => ({ ...prev, attendees: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))}
                            placeholder="Names separated by commas..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  ) : currentAssignee ? (
                    <div className="flex items-center gap-3 p-2 bg-white rounded-xl">
                      <img src={currentAssignee.avatar} className="w-8 h-8 rounded-full" alt={currentAssignee.name} />
                      <div>
                        <span className="text-sm font-bold text-slate-700">{currentAssignee.name}</span>
                        <p className="text-[9px] text-slate-400 uppercase">{currentAssignee.role}</p>
                      </div>
                    </div>
                  ) : attendees.length > 0 ? (
                    <div className="space-y-2">
                      {attendees.map((attendee: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-xl">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={14} className="text-blue-600" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">{attendee.name || attendee}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Not assigned</p>
                  )}
                </div>

                {/* Related Entities */}
                {relations.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-violet-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Related To</p>
                    <div className="space-y-2">
                      {relations.map((rel, i) => (
                        <button
                          key={i}
                          onClick={() => { closeEventPopup(); navigate(`/${rel.type}/${rel.id}`); }}
                          className="w-full flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-blue-50 transition-colors group"
                        >
                          <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <rel.icon size={16} className="text-slate-500 group-hover:text-blue-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{rel.type}</p>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600">{rel.name}</p>
                          </div>
                          <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions - Enhanced */}
          <div className="p-6 pt-0 border-t border-slate-100 mt-4">
            <div className="flex gap-3">
              {isEditingPopup ? (
                <>
                  <button
                    onClick={() => { setIsEditingPopup(false); setPopupEdits({}); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button
                    onClick={savePopupEdits}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                  >
                    <Check size={16} /> Save Changes
                  </button>
                </>
              ) : (
                <>
                  {selectedEvent.type === 'tasks' && selectedEvent.status !== 'Completed' && !selectedEvent.completed && (
                    <button
                      onClick={() => handleCompleteTask(selectedEvent.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                    >
                      <Check size={16} /> Mark Complete
                    </button>
                  )}
                  {selectedEvent.type === 'tickets' && selectedEvent.status !== 'Resolved' && (
                    <button
                      onClick={() => handleResolveTicket(selectedEvent.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                    >
                      <Check size={16} /> Resolve Ticket
                    </button>
                  )}
                  <button
                    onClick={startPopupEdit}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    <Edit3 size={16} /> Quick Edit
                  </button>
                  <button
                    onClick={handleEditEvent}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    <Edit3 size={16} /> Full Edit
                  </button>
                  <button
                    onClick={() => { closeEventPopup(); navigate(`/${selectedEvent.type}/${selectedEvent.id}`); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink size={16} /> Full View
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-white rounded-[35px] p-8 max-w-sm shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Delete Event</h3>
                  <p className="text-xs text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete "<span className="font-bold">{selectedEvent?.title || selectedEvent?.name || selectedEvent?.subject}</span>"?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={confirmDeleteEvent} className="flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20">Delete</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1600px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Timeline Management</p>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">My Calendar</h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* View Switcher */}
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'month' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={14} /> Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'week' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <CalendarDays size={14} /> Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'day' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={14} /> Day
            </button>
          </div>

          {/* Date Nav */}
          <div className="flex items-center gap-3">
            <button
              onClick={setToday}
              className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              Today
            </button>
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
              <button onClick={() => navigateDate(-1)} className="p-2 text-slate-400 hover:text-slate-900 transition-all"><ChevronLeft size={18} /></button>
              <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-900 min-w-[140px] text-center">
                {viewMode === 'month' ? currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' }) :
                  viewMode === 'week' ? `${getWeekDays(currentDate)[0].toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${getWeekDays(currentDate)[6].toLocaleDateString([], { month: 'short', day: 'numeric' })}` :
                    currentDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <button onClick={() => navigateDate(1)} className="p-2 text-slate-400 hover:text-slate-900 transition-all"><ChevronRight size={18} /></button>
            </div>

            {/* New Event Button with Dropdown */}
            <div className="relative" ref={newEventMenuRef}>
              <button
                onClick={() => setShowNewEventMenu(!showNewEventMenu)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Plus size={16} /> New Event
              </button>
              {showNewEventMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                  <button
                    onClick={() => handleCreateEvent('Meeting')}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <CalendarIcon size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Meeting</p>
                      <p className="text-[9px] text-slate-400">Schedule a meeting</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleCreateEvent('Call')}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Phone size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Call</p>
                      <p className="text-[9px] text-slate-400">Schedule a call</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleCreateEvent('Personal')}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                      <Heart size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Personal</p>
                      <p className="text-[9px] text-slate-400">Personal reminder</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleCreateEvent('Follow-up')}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
                      <Mail size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Follow-up</p>
                      <p className="text-[9px] text-slate-400">Follow-up reminder</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleCreateEvent('Task')}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <CheckSquare size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Task</p>
                      <p className="text-[9px] text-slate-400">Create a task</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleCreateEvent('Deadline')}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <Target size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Deadline</p>
                      <p className="text-[9px] text-slate-400">Set a deadline</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3">
        {[
          { key: 'all', label: 'All Events', color: 'bg-slate-900' },
          { key: 'meetings', label: 'Meetings', color: 'bg-blue-600' },
          { key: 'tasks', label: 'Tasks', color: 'bg-emerald-500' },
          { key: 'personal', label: 'Personal', color: 'bg-pink-500' },
          { key: 'followups', label: 'Follow-ups', color: 'bg-violet-500' },
          { key: 'tickets', label: 'Ticket SLA', color: 'bg-rose-500' },
          { key: 'milestones', label: 'Milestones', color: 'bg-amber-500' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setEventFilter(f.key as EventFilter)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              eventFilter === f.key
                ? `${f.color} text-white shadow-lg`
                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${f.color}`}></div>
            {f.label}
          </button>
        ))}
      </div>

      <div className="animate-slide-up">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 px-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meetings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Follow-ups</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket SLA</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Milestones</span>
        </div>
      </div>

      {/* Event Popup */}
      {renderEventPopup()}

      {/* Day Click Menu - Create Event for Selected Day */}
      {dayMenuDate && dayMenuPosition && (
        <div
          ref={dayMenuRef}
          className="fixed bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 w-60 animate-slide-up"
          style={{ left: dayMenuPosition.x, top: dayMenuPosition.y }}
        >
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Create Event For</p>
            <p className="text-sm font-black text-slate-900">
              {dayMenuDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="py-1">
            <button
              onClick={() => handleCreateEventForDate('Meeting')}
              className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center gap-3 transition-all"
            >
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <CalendarIcon size={12} className="text-white" />
              </div>
              <span className="text-xs font-bold text-slate-700">Meeting</span>
            </button>
            <button
              onClick={() => handleCreateEventForDate('Call')}
              className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 flex items-center gap-3 transition-all"
            >
              <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Phone size={12} className="text-white" />
              </div>
              <span className="text-xs font-bold text-slate-700">Call</span>
            </button>
            <button
              onClick={() => handleCreateEventForDate('Personal')}
              className="w-full px-4 py-2.5 text-left hover:bg-pink-50 flex items-center gap-3 transition-all"
            >
              <div className="w-7 h-7 bg-pink-500 rounded-lg flex items-center justify-center">
                <Heart size={12} className="text-white" />
              </div>
              <span className="text-xs font-bold text-slate-700">Personal</span>
            </button>
            <button
              onClick={() => handleCreateEventForDate('Follow-up')}
              className="w-full px-4 py-2.5 text-left hover:bg-violet-50 flex items-center gap-3 transition-all"
            >
              <div className="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center">
                <Mail size={12} className="text-white" />
              </div>
              <span className="text-xs font-bold text-slate-700">Follow-up</span>
            </button>
            <button
              onClick={() => handleCreateEventForDate('Task')}
              className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 flex items-center gap-3 transition-all"
            >
              <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
                <CheckSquare size={12} className="text-white" />
              </div>
              <span className="text-xs font-bold text-slate-700">Task</span>
            </button>
            <button
              onClick={() => handleCreateEventForDate('Deadline')}
              className="w-full px-4 py-2.5 text-left hover:bg-amber-50 flex items-center gap-3 transition-all"
            >
              <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
                <Target size={12} className="text-white" />
              </div>
              <span className="text-xs font-bold text-slate-700">Deadline</span>
            </button>
          </div>
          <div className="px-4 py-2 border-t border-slate-100">
            <button
              onClick={() => { setDayMenuDate(null); setDayMenuPosition(null); setCurrentDate(dayMenuDate); setViewMode('day'); }}
              className="w-full text-center text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700"
            >
              View Full Day →
            </button>
          </div>
        </div>
      )}

      <EventComposer
        isOpen={showEventComposer}
        onClose={() => {
          setShowEventComposer(false);
          setEventComposerData(null);
        }}
        initialData={eventComposerData}
        initialDate={eventComposerData?.startTime}
        mode={eventComposerMode}
      />
    </div>
  );
};

export default CalendarView;
