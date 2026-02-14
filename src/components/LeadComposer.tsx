import React, { useState } from 'react';
import { X, Target, Sparkles, Mail, Phone, Building2, User, DollarSign } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Lead } from '../types';

interface LeadComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Lead>;
  mode?: 'create' | 'edit';
}

export const LeadComposer: React.FC<LeadComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const { upsertRecord, settings, users } = useCRM();

  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [company, setCompany] = useState(initialData?.company || '');
  const [source, setSource] = useState(initialData?.source || 'Website');
  const [status, setStatus] = useState(initialData?.status || 'New');
  const [estimatedValue, setEstimatedValue] = useState(initialData?.estimatedValue?.toString() || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || '');

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }

    const lead: Partial<Lead> = {
      ...(initialData?.id && { id: initialData.id }),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company.trim(),
      source,
      status,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : 0,
      notes: notes.trim(),
      assignedTo: assignedTo || undefined,
    };

    upsertRecord('leads', lead);
    onClose();
  };

  if (!isOpen) return null;

  const statuses = settings.leadStatuses || ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
  const sources = ['Website', 'Referral', 'Cold Call', 'Social Media', 'Event', 'Partner', 'Other'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Target size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {mode === 'create' ? 'New Lead' : 'Edit Lead'}
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">
                {mode === 'create' ? 'Add a new lead to your pipeline' : 'Update lead information'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Phone
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Company
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                >
                  {sources.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Estimated Value
                </label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    placeholder="5000"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Assign To
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
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
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add any additional notes about this lead..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
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
            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg shadow-orange-500/20"
          >
            {mode === 'create' ? 'Create Lead' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
