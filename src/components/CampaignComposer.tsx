import React, { useState } from 'react';
import { X, Megaphone, DollarSign, Calendar, Target, TrendingUp } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Campaign } from '../types';

interface CampaignComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Campaign>;
  mode?: 'create' | 'edit';
}

export const CampaignComposer: React.FC<CampaignComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const { upsertRecord } = useCRM();

  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'Email');
  const [budget, setBudget] = useState(initialData?.budget?.toString() || '');
  const [status, setStatus] = useState(initialData?.status || 'Planning');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [targetAudience, setTargetAudience] = useState(initialData?.targetAudience || '');

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a campaign name');
      return;
    }
    if (!budget) {
      alert('Please enter a budget');
      return;
    }

    const campaign: Partial<Campaign> = {
      ...(initialData?.id && { id: initialData.id }),
      name: name.trim(),
      type,
      budget: parseFloat(budget),
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      description: description.trim() || undefined,
      targetAudience: targetAudience.trim() || undefined,
      revenueGenerated: initialData?.revenueGenerated || 0,
    };

    upsertRecord('campaigns', campaign);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Megaphone size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {mode === 'create' ? 'New Campaign' : 'Edit Campaign'}
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">
                {mode === 'create' ? 'Launch a new marketing campaign' : 'Update campaign details'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Campaign Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Q4 Email Blast, Summer Social Campaign, etc."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Campaign Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                >
                  <option value="Email">Email</option>
                  <option value="Social">Social</option>
                  <option value="Search">Search</option>
                  <option value="Event">Event</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Budget *
                </label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="5000"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  End Date
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Target Audience
              </label>
              <div className="relative">
                <Target size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Enterprise customers, SMB leads, etc."
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                />
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
                placeholder="Campaign goals, messaging, strategy..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all resize-none"
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
            className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-pink-700 hover:to-rose-700 transition-all shadow-lg shadow-pink-500/20"
          >
            {mode === 'create' ? 'Launch Campaign' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
