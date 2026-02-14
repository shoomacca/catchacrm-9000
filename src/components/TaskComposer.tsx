import React, { useState } from 'react';
import { X, CheckSquare, Calendar, User, Target, Briefcase, Phone, Clock, AlarmClock } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Task } from '../types';

interface TaskComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Task>;
  taskType?: 'general' | 'call' | 'lead' | 'deal';
  relatedToId?: string;
  relatedToType?: 'leads' | 'deals' | 'contacts' | 'accounts';
  mode?: 'create' | 'edit';
}

export const TaskComposer: React.FC<TaskComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  taskType = 'general',
  relatedToId,
  relatedToType,
  mode = 'create'
}) => {
  const { upsertRecord, users, leads, deals } = useCRM();

  const [title, setTitle] = useState(initialData?.title || (taskType === 'call' ? 'Call Back' : ''));
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [priority, setPriority] = useState(initialData?.priority || 'Medium');
  const [status, setStatus] = useState(initialData?.status || 'To Do');
  const [assigneeId, setAssignedTo] = useState(initialData?.assigneeId || '');
  const [linkedToId, setLinkedToId] = useState(relatedToId || initialData?.relatedToId || '');
  const [linkedToType, setLinkedToType] = useState(relatedToType || initialData?.relatedToType || 'leads');

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    const task: Partial<Task> = {
      ...(initialData?.id && { id: initialData.id }),
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || undefined,
      priority,
      status,
      assigneeId: assigneeId || undefined,
      relatedToId: linkedToId || undefined,
      relatedToType: linkedToId ? linkedToType : undefined,
    };

    upsertRecord('tasks', task);
    onClose();
  };

  if (!isOpen) return null;

  const getHeaderConfig = () => {
    switch (taskType) {
      case 'call':
        return {
          gradient: 'from-emerald-600 to-teal-600',
          icon: <Phone size={28} className="text-white" />,
          title: 'Schedule Call Back',
          subtitle: 'Create a call back reminder'
        };
      case 'lead':
        return {
          gradient: 'from-orange-600 to-amber-600',
          icon: <Target size={28} className="text-white" />,
          title: 'Lead Task',
          subtitle: 'Create a task for this lead'
        };
      case 'deal':
        return {
          gradient: 'from-violet-600 to-purple-600',
          icon: <Briefcase size={28} className="text-white" />,
          title: 'Deal Task',
          subtitle: 'Create a task for this deal'
        };
      default:
        return {
          gradient: 'from-slate-600 to-slate-700',
          icon: <CheckSquare size={28} className="text-white" />,
          title: mode === 'create' ? 'New Task' : 'Edit Task',
          subtitle: mode === 'create' ? 'Create a new task' : 'Update task details'
        };
    }
  };

  const config = getHeaderConfig();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} p-8 relative`}>
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              {config.icon}
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">{config.title}</h2>
              <p className="text-white/80 font-bold text-sm mt-1">{config.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                {taskType === 'call' ? 'Call Subject' : 'Task Title'} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={taskType === 'call' ? 'Follow up on proposal' : 'Complete proposal review'}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Assign To
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={assigneeId}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {!relatedToId && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Link to {linkedToType === 'leads' ? 'Lead' : 'Deal'} (Optional)
                </label>
                <div className="flex gap-3">
                  <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => setLinkedToType('leads')}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        linkedToType === 'leads' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Lead
                    </button>
                    <button
                      onClick={() => setLinkedToType('deals')}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        linkedToType === 'deals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Deal
                    </button>
                  </div>
                  <select
                    value={linkedToId}
                    onChange={(e) => setLinkedToId(e.target.value)}
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  >
                    <option value="">None</option>
                    {linkedToType === 'leads'
                      ? leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)
                      : deals.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                    }
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                {taskType === 'call' ? 'Call Notes' : 'Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder={taskType === 'call' ? 'Notes for the call...' : 'Task details...'}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-8 py-4 bg-gradient-to-r ${config.gradient} text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg`}
          >
            {mode === 'create' ? (taskType === 'call' ? 'Schedule Call' : 'Create Task') : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
