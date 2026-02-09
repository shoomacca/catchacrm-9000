import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext';
import {
  Gift, Users, TrendingUp, DollarSign, Link2, Copy, Check,
  ChevronRight, Star, Target, Award, Plus, Search, Filter,
  ExternalLink, Mail, Clock, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

type StatusFilter = 'all' | 'Active' | 'Pending Payout' | 'Paid' | 'Cancelled';

const ReferralEngine: React.FC = () => {
  const navigate = useNavigate();
  const { contacts, accounts, referralRewards, leads, deals, settings, openModal, users } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    const activeReferrers = referralRewards.filter(r => r.status === 'Active').length;
    const pendingPayouts = referralRewards.filter(r => r.status === 'Pending Payout');
    const totalPendingValue = pendingPayouts.reduce((sum, r) => sum + r.rewardAmount, 0);
    const paidRewards = referralRewards.filter(r => r.status === 'Paid');
    const totalPaid = paidRewards.reduce((sum, r) => sum + r.rewardAmount, 0);
    const conversionRate = referralRewards.length > 0
      ? (paidRewards.length / referralRewards.length) * 100
      : 0;

    return {
      activeReferrers,
      pendingPayoutsCount: pendingPayouts.length,
      totalPendingValue,
      totalPaid,
      conversionRate,
      totalRewards: referralRewards.length
    };
  }, [referralRewards]);

  // Get unique referrers (contacts who have made referrals)
  const referrers = useMemo(() => {
    const referrerIds = new Set(referralRewards.map(r => r.referrerId));
    return contacts.filter(c => referrerIds.has(c.id)).map(contact => {
      const contactRewards = referralRewards.filter(r => r.referrerId === contact.id);
      const totalReferred = contactRewards.length;
      const totalEarned = contactRewards
        .filter(r => r.status === 'Paid')
        .reduce((sum, r) => sum + r.rewardAmount, 0);
      const pendingAmount = contactRewards
        .filter(r => r.status === 'Pending Payout')
        .reduce((sum, r) => sum + r.rewardAmount, 0);

      return {
        ...contact,
        totalReferred,
        totalEarned,
        pendingAmount,
        referralLink: `${window.location.origin}/ref/${contact.name.toLowerCase().replace(/\s+/g, '-')}`
      };
    }).sort((a, b) => b.totalEarned - a.totalEarned);
  }, [contacts, referralRewards]);

  // Filter referral rewards
  const filteredRewards = useMemo(() => {
    let filtered = [...referralRewards];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reward => {
        const referrer = contacts.find(c => c.id === reward.referrerId);
        const lead = leads.find(l => l.id === reward.referredLeadId);
        return referrer?.name.toLowerCase().includes(query) ||
               lead?.name.toLowerCase().includes(query) ||
               lead?.company.toLowerCase().includes(query);
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [referralRewards, searchQuery, statusFilter, contacts, leads]);

  const copyReferralLink = (link: string, contactId: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(contactId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Pending Payout': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <Clock size={14} />;
      case 'Pending Payout': return <AlertCircle size={14} />;
      case 'Paid': return <CheckCircle2 size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marketing</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Referral Program</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('referralRewards')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={16} />
            Create Reward
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Referrers</p>
          <p className="text-3xl font-black text-slate-900">{stats.activeReferrers}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending Payouts</p>
          <p className="text-3xl font-black text-slate-900">{stats.pendingPayoutsCount}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending Value</p>
          <p className="text-3xl font-black text-slate-900">${stats.totalPendingValue.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Paid</p>
          <p className="text-3xl font-black text-slate-900">${stats.totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Conversion</p>
          <p className="text-3xl font-black text-slate-900">{stats.conversionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Top Referrers */}
      <div className="bg-white border border-slate-200 rounded-[25px] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900">Top Referrers</h2>
            <p className="text-sm text-slate-500 mt-1">Your most valuable advocates</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-100 rounded-xl">
            <Award size={16} className="text-violet-600" />
            <span className="text-xs font-bold text-violet-600">Leaderboard</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {referrers.slice(0, 10).map((referrer, index) => (
            <div
              key={referrer.id}
              className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group"
              onClick={() => navigate(`/contacts/${referrer.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank Badge */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
                    index === 0 ? 'bg-amber-100 text-amber-600' :
                    index === 1 ? 'bg-slate-200 text-slate-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    #{index + 1}
                  </div>

                  {/* Avatar & Info */}
                  <img src={referrer.avatar} alt={referrer.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-black text-slate-900 group-hover:text-violet-600 transition-colors">
                        {referrer.name}
                      </h3>
                      {index < 3 && <Star size={14} className="text-amber-500 fill-amber-500" />}
                    </div>
                    <p className="text-xs text-slate-400">
                      {referrer.totalReferred} referrals • ${referrer.totalEarned.toLocaleString()} earned
                      {referrer.pendingAmount > 0 && ` • $${referrer.pendingAmount.toLocaleString()} pending`}
                    </p>
                  </div>
                </div>

                {/* Referral Link */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                    <Link2 size={14} className="text-slate-400" />
                    <code className="text-xs font-mono text-slate-600">
                      .../{referrer.name.toLowerCase().replace(/\s+/g, '-').slice(0, 15)}
                    </code>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyReferralLink(referrer.referralLink, referrer.id);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    {copiedLink === referrer.id ? (
                      <Check size={16} className="text-emerald-500" />
                    ) : (
                      <Copy size={16} className="text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(referrer.referralLink, '_blank');
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <ExternalLink size={16} className="text-slate-400" />
                  </button>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {referrers.length === 0 && (
          <div className="p-20 text-center">
            <Users size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-sm font-bold text-slate-400">No referrers yet</p>
            <p className="text-xs text-slate-400 mt-2">Create referral rewards to get started</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search referrals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(['all', 'Active', 'Pending Payout', 'Paid', 'Cancelled'] as StatusFilter[]).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Referral Rewards List */}
      <div className="bg-white border border-slate-200 rounded-[25px] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900">Referral History</h2>
          <p className="text-sm text-slate-500 mt-1">All referral rewards and their status</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Referrer</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Referred Lead</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Status</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Reward</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredRewards.map((reward, index) => {
                const referrer = contacts.find(c => c.id === reward.referrerId);
                const lead = leads.find(l => l.id === reward.referredLeadId);

                return (
                  <tr
                    key={reward.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => openModal('referralRewards', reward)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={referrer?.avatar || ''} alt={referrer?.name || 'Unknown'} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="text-sm font-black text-slate-900">{referrer?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{referrer?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-black text-slate-900">{lead?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{lead?.company || ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border flex items-center gap-1 w-fit ${getStatusColor(reward.status)}`}>
                        {getStatusIcon(reward.status)}
                        {reward.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-900">${reward.rewardAmount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{new Date(reward.createdAt).toLocaleDateString()}</p>
                      {reward.payoutDate && (
                        <p className="text-xs text-slate-400">Paid: {new Date(reward.payoutDate).toLocaleDateString()}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <ChevronRight size={18} className="text-slate-300" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRewards.length === 0 && (
          <div className="p-20 text-center">
            <Gift size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-sm font-bold text-slate-400">No referral rewards found</p>
            <p className="text-xs text-slate-400 mt-2">
              {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first referral reward'}
            </p>
          </div>
        )}
      </div>

      {/* Referral Program Settings */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-[25px] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Program Settings</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Referrer Reward:</span>
                <span className="font-black text-slate-900">${settings.referralSettings.referrerReward}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Referee Discount:</span>
                <span className="font-black text-slate-900">${settings.referralSettings.refereeDiscount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Min Purchase:</span>
                <span className="font-black text-slate-900">${settings.referralSettings.minPurchaseForReward}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all"
          >
            <Filter size={16} />
            Configure
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralEngine;
