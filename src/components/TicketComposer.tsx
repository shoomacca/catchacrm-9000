import React, { useState } from 'react';
import { X, LifeBuoy, AlertCircle, User, Building2, FileText } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Ticket } from '../types';

interface TicketComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Ticket>;
  mode?: 'create' | 'edit';
}

export const TicketComposer: React.FC<TicketComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const { upsertRecord, users, accounts, settings } = useCRM();

  const [subject, setSubject] = useState(initialData?.subject || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [assigneeId, setAssigneeId] = useState(initialData?.assigneeId || '');
  const [accountId, setAccountId] = useState(initialData?.accountId || '');
  const [priority, setPriority] = useState(initialData?.priority || 'Medium');
  const [status, setStatus] = useState(initialData?.status || 'Open');
  const [category, setCategory] = useState(initialData?.category || '');

  const handleSubmit = () => {
    if (!subject.trim()) {
      alert('Please enter a ticket subject');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a ticket description');
      return;
    }

    const ticket: Partial<Ticket> = {
      ...(initialData?.id && { id: initialData.id }),
      subject: subject.trim(),
      description: description.trim(),
      assigneeId: assigneeId || undefined,
      accountId: accountId || undefined,
      priority,
      status,
      category: category || undefined,
      ticketNumber: initialData?.ticketNumber || '',
      requesterId: '',
      slaDeadline: '',
      messages: initialData?.messages || [],
    };

    upsertRecord('tickets', ticket);
    onClose();
  };

  if (!isOpen) return null;

  const statuses = settings.ticketStatuses || ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];
  const priorities = settings.ticketPriorities || ['Low', 'Medium', 'High', 'Urgent'];
  const categories = settings.ticketCategories || ['Technical', 'Billing', 'General', 'Feature Request'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <LifeBuoy size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {mode === 'create' ? 'New Support Ticket' : 'Edit Ticket'}
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">
                {mode === 'create' ? 'Create a new support ticket' : 'Update ticket information'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of the issue"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Detailed description of the issue..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Priority
                </label>
                <div className="relative">
                  <AlertCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                  >
                    {priorities.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Assign To
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Account (Optional)
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                  >
                    <option value="">No Account</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
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
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-red-700 hover:to-orange-700 transition-all shadow-lg shadow-red-500/20"
          >
            {mode === 'create' ? 'Create Ticket' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
