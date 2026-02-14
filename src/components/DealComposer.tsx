import React, { useState } from 'react';
import { X, Briefcase, DollarSign, Calendar, User, Building2, Target, Percent } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Deal } from '../types';

interface DealComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Deal>;
  mode?: 'create' | 'edit';
}

export const DealComposer: React.FC<DealComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const { upsertRecord, settings, users, accounts, leads } = useCRM();

  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [stage, setStage] = useState(initialData?.stage || 'Prospecting');
  const [probability, setProbability] = useState(initialData?.probability?.toString() || '50');
  const [accountId, setAccountId] = useState(initialData?.accountId || '');
  const [leadId, setLeadId] = useState(initialData?.leadId || '');
  const [assigneeId, setAssignedTo] = useState(initialData?.assigneeId || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a deal name');
      return;
    }
    if (!amount) {
      alert('Please enter a deal amount');
      return;
    }

    const deal: Partial<Deal> = {
      ...(initialData?.id && { id: initialData.id }),
      name: name.trim(),
      amount: parseFloat(amount),
      stage,
      probability: parseFloat(probability),
      accountId: accountId || undefined,
      leadId: leadId || undefined,
      assigneeId: assigneeId || undefined,
      description: description.trim(),
    };

    upsertRecord('deals', deal);
    onClose();
  };

  if (!isOpen) return null;

  const stageOptions = settings.dealStages || ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  const stages = Array.isArray(stageOptions)
    ? stageOptions.map(s => typeof s === 'string' ? s : s.label)
    : ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Briefcase size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {mode === 'create' ? 'New Deal' : 'Edit Deal'}
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">
                {mode === 'create' ? 'Add a new deal to your pipeline' : 'Update deal information'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Deal Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Q4 Enterprise Deal"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Amount *
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50000"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                >
                  {stages.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Probability
                </label>
                <div className="relative">
                  <Percent size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={probability}
                    onChange={(e) => setProbability(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Account
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  >
                    <option value="">No Account</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Lead
                </label>
                <div className="relative">
                  <Target size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  >
                    <option value="">No Lead</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
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
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
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
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Add details about this deal..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all resize-none"
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
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/20"
          >
            {mode === 'create' ? 'Create Deal' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
