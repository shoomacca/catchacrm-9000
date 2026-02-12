import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { RefreshCcw, Plus, Calendar, DollarSign, Building2, Clock, CheckCircle, Pause, X, Search, TrendingUp, AlertTriangle, LayoutGrid, List, ChevronRight } from 'lucide-react';

type StatusFilter = 'all' | 'Active' | 'Paused' | 'Cancelled';
type CycleFilter = 'all' | 'monthly' | 'yearly' | 'weekly';
type ViewMode = 'grid' | 'list';
type DueFilter = 'all' | 'due-soon';

const SubscriptionsList: React.FC = () => {
  const { subscriptions, accounts, openModal, searchQuery, setSearchQuery } = useCRM();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [cycleFilter, setCycleFilter] = useState<CycleFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [dueFilter, setDueFilter] = useState<DueFilter>('all');

  // Stats calculation
  const stats = useMemo(() => {
    const activeCount = subscriptions.filter(s => s.status === 'Active').length;
    const pausedCount = subscriptions.filter(s => s.status === 'Paused').length;
    const totalMRR = subscriptions
      .filter(s => s.status === 'Active')
      .reduce((sum, sub) => {
        const amount = sub.items.reduce((a, b) => a + (b.qty * b.unitPrice), 0);
        if (sub.billingCycle === 'yearly') return sum + (amount / 12);
        if (sub.billingCycle === 'weekly') return sum + (amount * 4.33);
        return sum + amount;
      }, 0);
    const totalARR = totalMRR * 12;

    // Find subscriptions due soon (next 7 days)
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueSoon = subscriptions.filter(s => {
      if (s.status !== 'Active') return false;
      const nextBill = new Date(s.nextBillDate);
      return nextBill >= today && nextBill <= weekFromNow;
    }).length;

    return { activeCount, pausedCount, totalMRR, totalARR, dueSoon, total: subscriptions.length };
  }, [subscriptions]);

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    let filtered = [...subscriptions];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Cycle filter
    if (cycleFilter !== 'all') {
      filtered = filtered.filter(s => s.billingCycle === cycleFilter);
    }

    // Due filter (show only subscriptions due this week)
    if (dueFilter === 'due-soon') {
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(s => {
        if (s.status !== 'Active') return false;
        const nextBill = new Date(s.nextBillDate);
        return nextBill >= today && nextBill <= weekFromNow;
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        accounts.find(a => a.id === s.accountId)?.name.toLowerCase().includes(query)
      );
    }

    // Sort by next bill date (soonest first)
    return filtered.sort((a, b) => new Date(a.nextBillDate).getTime() - new Date(b.nextBillDate).getTime());
  }, [subscriptions, statusFilter, cycleFilter, dueFilter, searchQuery, accounts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Paused': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return CheckCircle;
      case 'Paused': return Pause;
      case 'Cancelled': return X;
      default: return RefreshCcw;
    }
  };

  const isDueSoon = (nextBillDate: string) => {
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextBill = new Date(nextBillDate);
    return nextBill >= today && nextBill <= weekFromNow;
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recurring Revenue</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Subscriptions</h1>
        </div>
        <div className="flex gap-3">
          {/* View Toggle */}
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                viewMode === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid size={14} /> Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List size={14} /> List
            </button>
          </div>
          <button onClick={() => openModal('subscriptions')} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2">
            <Plus size={16}/> New Plan
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total */}
        <button
          onClick={() => { setStatusFilter('all'); setCycleFilter('all'); setDueFilter('all'); }}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            statusFilter === 'all' && cycleFilter === 'all' && dueFilter === 'all' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-900">{stats.total}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Plans</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <RefreshCcw size={18} className="text-slate-500" />
            </div>
          </div>
        </button>

        {/* Active */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'Active' ? 'all' : 'Active')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            statusFilter === 'Active' ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-emerald-600">{stats.activeCount}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
          </div>
        </button>

        {/* MRR */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black">${Math.round(stats.totalMRR).toLocaleString()}</p>
              <p className="text-[9px] font-bold opacity-80 uppercase tracking-wider">Monthly MRR</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
        </div>

        {/* ARR */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black">${Math.round(stats.totalARR).toLocaleString()}</p>
              <p className="text-[9px] font-bold opacity-80 uppercase tracking-wider">Annual ARR</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
        </div>

        {/* Due Soon */}
        <button
          onClick={() => setDueFilter(dueFilter === 'due-soon' ? 'all' : 'due-soon')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            dueFilter === 'due-soon' ? 'border-amber-400 ring-2 ring-amber-100' : stats.dueSoon > 0 ? 'border-amber-200' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-black ${stats.dueSoon > 0 ? 'text-amber-600' : 'text-slate-600'}`}>{stats.dueSoon}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Due This Week</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.dueSoon > 0 ? 'bg-amber-50' : 'bg-slate-100'}`}>
              <AlertTriangle size={18} className={stats.dueSoon > 0 ? 'text-amber-600' : 'text-slate-400'} />
            </div>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search subscriptions..."
            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Cycle Filter */}
        <div className="flex bg-white border border-slate-200 rounded-xl p-1">
          {(['all', 'monthly', 'yearly', 'weekly'] as CycleFilter[]).map(cycle => (
            <button
              key={cycle}
              onClick={() => setCycleFilter(cycle)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                cycleFilter === cycle ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {cycle === 'all' ? 'All Cycles' : cycle}
            </button>
          ))}
        </div>

        {(statusFilter !== 'all' || cycleFilter !== 'all' || dueFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => { setStatusFilter('all'); setCycleFilter('all'); setDueFilter('all'); setSearchQuery(''); }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition-all"
          >
            <X size={12} /> Clear
          </button>
        )}

        <span className="text-xs font-bold text-slate-400">{filteredSubscriptions.length} subscription{filteredSubscriptions.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Subscription Content */}
      {viewMode === 'list' ? (
        /* List View */
        <div className="bg-white border border-slate-200 rounded-[25px] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Subscription</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Account</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Status</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Cycle</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Next Bill</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px] text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscriptions.map(sub => {
                const account = accounts.find(a => a.id === sub.accountId);
                const amount = sub.items.reduce((a, b) => a + (b.qty * b.unitPrice), 0);
                const dueSoon = isDueSoon(sub.nextBillDate);
                const StatusIcon = getStatusIcon(sub.status);

                return (
                  <tr
                    key={sub.id}
                    onClick={() => openModal('subscriptions', sub)}
                    className={`hover:bg-slate-50 transition-all cursor-pointer group ${dueSoon && sub.status === 'Active' ? 'bg-amber-50/30' : ''}`}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          sub.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                          sub.status === 'Paused' ? 'bg-amber-100 text-amber-600' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          <StatusIcon size={18} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{sub.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sub.items.length} item{sub.items.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-400" />
                        <span className="font-bold text-slate-600">{account?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                      {dueSoon && sub.status === 'Active' && (
                        <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-600 rounded-lg text-[8px] font-black uppercase">
                          Due Soon
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-slate-500 uppercase">{sub.billingCycle}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-sm font-bold ${dueSoon ? 'text-amber-600' : 'text-slate-600'}`}>
                        {new Date(sub.nextBillDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div>
                          <p className="font-black text-blue-600">${amount.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-slate-400">/{sub.billingCycle}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredSubscriptions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-slate-300 font-black uppercase text-xs">
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View - Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubscriptions.map(sub => {
            const account = accounts.find(a => a.id === sub.accountId);
            const amount = sub.items.reduce((a, b) => a + (b.qty * b.unitPrice), 0);
            const StatusIcon = getStatusIcon(sub.status);
            const dueSoon = isDueSoon(sub.nextBillDate);

            return (
              <div
                key={sub.id}
                onClick={() => openModal('subscriptions', sub)}
                className={`bg-white border rounded-[24px] p-6 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden ${
                  dueSoon && sub.status === 'Active' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Due Soon Badge */}
                {dueSoon && sub.status === 'Active' && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-amber-100 text-amber-600 rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                    <AlertTriangle size={10} /> Due Soon
                  </div>
                )}

                {/* Status Badge (if not due soon) */}
                {(!dueSoon || sub.status !== 'Active') && (
                  <div className="absolute top-5 right-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all ${
                    sub.status === 'Active' ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
                    sub.status === 'Paused' ? 'bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white' :
                    'bg-slate-100 text-slate-400 group-hover:bg-slate-600 group-hover:text-white'
                  }`}>
                    <StatusIcon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {sub.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Building2 size={10} />
                      <span className="truncate">{account?.name || 'Unknown Account'}</span>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-5">
                  <p className="text-3xl font-black text-blue-600">${amount.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">/{sub.billingCycle}</p>
                </div>

                {/* Next Bill & Items */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Calendar size={10} /> Next Bill
                    </p>
                    <p className={`text-sm font-bold ${dueSoon ? 'text-amber-600' : 'text-slate-700'}`}>
                      {new Date(sub.nextBillDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1 justify-end">
                      <Clock size={10} /> Items
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {sub.items.length} item{sub.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSubscriptions.length === 0 && (
            <div className="col-span-full py-20 border-2 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center text-slate-400 bg-white">
              <RefreshCcw size={48} strokeWidth={1} className="mb-4 opacity-30" />
              <p className="text-sm font-black">No subscriptions found</p>
              <p className="text-xs mt-1">Try adjusting your filters or create a new plan</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionsList;