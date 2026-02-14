import React, { useState } from 'react';
import { X, Gift, DollarSign, Calendar, FileText, UserCheck } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { ReferralReward } from '../types';

interface ReferralRewardComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<ReferralReward>;
  mode?: 'create' | 'edit';
}

export const ReferralRewardComposer: React.FC<ReferralRewardComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const { upsertRecord, contacts } = useCRM();

  const [referrerId, setReferrerId] = useState(initialData?.referrerId || '');
  const [referredLeadId, setReferredLeadId] = useState(initialData?.referredLeadId || '');
  const [rewardAmount, setRewardAmount] = useState(initialData?.rewardAmount?.toString() || '');
  const [status, setStatus] = useState(initialData?.status || 'Active');
  const [payoutDate, setPayoutDate] = useState(initialData?.payoutDate || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = () => {
    if (!referrerId) {
      alert('Please select a referrer');
      return;
    }
    if (!referredLeadId) {
      alert('Please select a referred lead');
      return;
    }
    if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
      alert('Please enter a valid reward amount');
      return;
    }

    const reward: Partial<ReferralReward> = {
      ...(initialData?.id && { id: initialData.id }),
      referrerId,
      referredLeadId,
      rewardAmount: parseFloat(rewardAmount),
      status: status as any,
      payoutDate: payoutDate || undefined,
      notes: notes.trim() || undefined,
    };

    upsertRecord('referralRewards', reward);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gift size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {mode === 'create' ? 'New Referral Reward' : 'Edit Referral Reward'}
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">
                {mode === 'create' ? 'Create new reward' : 'Update reward details'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Referrer *
                </label>
                <div className="relative">
                  <UserCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={referrerId}
                    onChange={(e) => setReferrerId(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
                    required
                  >
                    <option value="">Select Referrer</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Referred Lead *
                </label>
                <select
                  value={referredLeadId}
                  onChange={(e) => setReferredLeadId(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
                  required
                >
                  <option value="">Select Lead</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Reward Amount *
                </label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
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
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Pending Payout">Pending Payout</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Payout Date
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={payoutDate}
                  onChange={(e) => setPayoutDate(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Notes
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-4 top-4 text-slate-400" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional notes about this reward..."
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all resize-none"
                />
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
            className="px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg shadow-rose-500/20"
          >
            {mode === 'create' ? 'Create Reward' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
