import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  Briefcase, Plus, DollarSign, TrendingUp, Clock, Calendar,
  ChevronRight, LayoutGrid, List, Target, Users, AlertTriangle,
  Star, Filter, Search, MoreHorizontal, ArrowUp, ArrowDown,
  Award, Hourglass, Zap, X, GripVertical, Download
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { exportDeals } from '../utils/csvExport';
import { DealComposer } from '../components/DealComposer';

type ViewMode = 'pipeline' | 'cards' | 'list';

const DealsPage: React.FC = () => {
  const navigate = useNavigate();
  const { deals, accounts, contacts, users, settings, openModal, upsertRecord, searchQuery, setSearchQuery } = useCRM();

  const [viewMode, setViewMode] = useState<ViewMode>('pipeline');
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);
  const [showDealComposer, setShowDealComposer] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'value' | 'date' | 'name'>('value');

  const stages = settings.dealStages || [
    { label: 'Discovery', color: 'bg-blue-500' },
    { label: 'Proposal', color: 'bg-violet-500' },
    { label: 'Negotiation', color: 'bg-amber-500' },
    { label: 'Closed Won', color: 'bg-emerald-500' },
    { label: 'Closed Lost', color: 'bg-red-500' }
  ];

  // Calculate stats
  const stats = useMemo(() => {
    const openDeals = deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');
    const wonDeals = deals.filter(d => d.stage === 'Closed Won');
    const lostDeals = deals.filter(d => d.stage === 'Closed Lost');

    const totalPipeline = openDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const wonValue = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const avgDealSize = openDeals.length > 0 ? totalPipeline / openDeals.length : 0;
    const winRate = (wonDeals.length + lostDeals.length) > 0
      ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 : 0;

    return {
      totalPipeline,
      openDeals: openDeals.length,
      wonValue,
      avgDealSize,
      winRate
    };
  }, [deals]);

  // Get deal insights
  const insights = useMemo(() => {
    const openDeals = deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');

    // Sort by value for biggest
    const sortedByValue = [...openDeals].sort((a, b) => (b.amount || 0) - (a.amount || 0));

    // Sort by created date for oldest/newest
    const sortedByDate = [...openDeals].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Deals closing soon (within 7 days)
    const closingSoon = openDeals.filter(d => {
      if (!d.expectedCloseDate) return false;
      const daysUntil = Math.ceil((new Date(d.expectedCloseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 7;
    });

    // High value deals (top 20% by value)
    const valueThreshold = sortedByValue.length > 0 ? (sortedByValue[0]?.amount || 0) * 0.5 : 0;
    const highValue = openDeals.filter(d => (d.amount || 0) >= valueThreshold);

    return {
      biggest: sortedByValue[0],
      oldest: sortedByDate[0],
      newest: sortedByDate[sortedByDate.length - 1],
      closingSoon,
      highValue,
      stale: openDeals.filter(d => {
        const daysSinceCreated = Math.ceil((Date.now() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceCreated > 30 && d.stage !== 'Closed Won' && d.stage !== 'Closed Lost';
      })
    };
  }, [deals]);

  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    let filtered = [...deals];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query)
      );
    }

    if (stageFilter !== 'all') {
      filtered = filtered.filter(d => d.stage === stageFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'value') return (b.amount || 0) - (a.amount || 0);
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [deals, searchQuery, stageFilter, sortBy]);

  // Get deals by stage
  const getDealsByStage = (stageName: string) => {
    return filteredDeals.filter(d => d.stage === stageName);
  };

  // Drag handlers
  const handleDragStart = (dealId: string) => {
    setDraggedDeal(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageName: string) => {
    if (draggedDeal) {
      const deal = deals.find(d => d.id === draggedDeal);
      if (deal && deal.stage !== stageName) {
        upsertRecord('deals', { ...deal, stage: stageName });
      }
      setDraggedDeal(null);
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.name || 'No Account';
  };

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || 'No Contact';
  };

  const getAssignee = (assigneeId: string) => {
    return users.find(u => u.id === assigneeId);
  };

  const getDaysInStage = (deal: any) => {
    const created = new Date(deal.createdAt);
    const now = new Date();
    return Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStageColor = (stageName: string) => {
    const stage = stages.find(s => s.label === stageName);
    return stage?.color || 'bg-slate-500';
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1800px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Pipeline</p>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Deals</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                viewMode === 'pipeline' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid size={14} /> Pipeline
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                viewMode === 'cards' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid size={14} /> Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List size={14} /> List
            </button>
          </div>
          <button
            onClick={() => exportDeals(filteredDeals)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => setShowDealComposer(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/20"
          >
            <Plus size={14} /> New Deal
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-900">${(stats.totalPipeline / 1000).toFixed(0)}k</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Pipeline Value</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <DollarSign size={22} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-900">{stats.openDeals}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Open Deals</p>
            </div>
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
              <Briefcase size={22} className="text-violet-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-emerald-600">${(stats.wonValue / 1000).toFixed(0)}k</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Won Value</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Award size={22} className="text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-900">${(stats.avgDealSize / 1000).toFixed(0)}k</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Avg Deal Size</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={22} className="text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-900">{stats.winRate.toFixed(0)}%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Win Rate</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <Target size={22} className="text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Deal Insights */}
      <div className="grid grid-cols-4 gap-4">
        {insights.biggest && (
          <div
            onClick={() => navigate(`/deals/${insights.biggest.id}`)}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white cursor-pointer hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <Award size={16} className="opacity-80" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Biggest Deal</span>
            </div>
            <p className="text-lg font-black truncate">{insights.biggest.name}</p>
            <p className="text-2xl font-black mt-1">${((insights.biggest.amount || 0) / 1000).toFixed(0)}k</p>
          </div>
        )}
        {insights.oldest && (
          <div
            onClick={() => navigate(`/deals/${insights.oldest.id}`)}
            className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white cursor-pointer hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <Hourglass size={16} className="opacity-80" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Oldest Deal</span>
            </div>
            <p className="text-lg font-black truncate">{insights.oldest.name}</p>
            <p className="text-sm font-bold opacity-80 mt-1">{getDaysInStage(insights.oldest)} days old</p>
          </div>
        )}
        {insights.newest && (
          <div
            onClick={() => navigate(`/deals/${insights.newest.id}`)}
            className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white cursor-pointer hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="opacity-80" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Newest Deal</span>
            </div>
            <p className="text-lg font-black truncate">{insights.newest.name}</p>
            <p className="text-sm font-bold opacity-80 mt-1">${((insights.newest.amount || 0) / 1000).toFixed(0)}k</p>
          </div>
        )}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Needs Attention</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Closing Soon</span>
              <span className="text-xs font-black text-amber-600">{insights.closingSoon.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Stale ({'>'}30 days)</span>
              <span className="text-xs font-black text-rose-600">{insights.stale.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">High Value</span>
              <span className="text-xs font-black text-blue-600">{insights.highValue.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search deals..."
            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
        >
          <option value="all">All Stages</option>
          {stages.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
        >
          <option value="value">Sort by Value</option>
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[600px]">
          {stages.filter(s => s.label !== 'Closed Lost').map((stage) => {
            const stageDeals = getDealsByStage(stage.label);
            const stageValue = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

            return (
              <div
                key={stage.label}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.label)}
                className={`flex-shrink-0 w-[320px] bg-slate-50 rounded-[28px] border-2 transition-all ${
                  draggedDeal ? 'border-dashed border-blue-300' : 'border-transparent'
                }`}
              >
                {/* Stage Header */}
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{stage.label}</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{stageDeals.length}</span>
                  </div>
                  <p className="text-lg font-black text-slate-900">${(stageValue / 1000).toFixed(0)}k</p>
                </div>

                {/* Deals */}
                <div className="p-3 space-y-3">
                  {stageDeals.map((deal) => {
                    const days = getDaysInStage(deal);
                    const isStale = days > 30;

                    return (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={() => handleDragStart(deal.id)}
                        onClick={() => navigate(`/deals/${deal.id}`)}
                        className={`bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-all group ${
                          isStale ? 'border-amber-200' : 'border-slate-100'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical size={14} className="text-slate-300 cursor-grab" />
                          </div>
                          {isStale && (
                            <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              {days}d
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {deal.name}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 mb-3">
                          {getAccountName(deal.accountId)}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          <span className="text-base font-black text-blue-600">
                            ${((deal.amount || 0) / 1000).toFixed(0)}k
                          </span>
                          {deal.expectedCloseDate && (
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(deal.expectedCloseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {stageDeals.length === 0 && (
                    <div className="py-8 text-center">
                      <Briefcase size={24} className="mx-auto text-slate-200 mb-2" />
                      <p className="text-xs text-slate-400">No deals</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Closed Lost Column - Collapsed */}
          <div className="flex-shrink-0 w-[120px] bg-rose-50/50 rounded-[28px] border-2 border-transparent">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Lost</h3>
              </div>
              <p className="text-lg font-black text-rose-600">{getDealsByStage('Closed Lost').length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-3 gap-4">
          {filteredDeals.map((deal) => {
            const days = getDaysInStage(deal);
            const isStale = days > 30;
            const stageColor = getStageColor(deal.stage);

            return (
              <div
                key={deal.id}
                onClick={() => navigate(`/deals/${deal.id}`)}
                className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-xl transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${stageColor}20` }}
                    >
                      <Briefcase size={20} style={{ color: stageColor }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {deal.name}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400">
                        {getAccountName(deal.accountId)}
                      </p>
                    </div>
                  </div>
                  {isStale && (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                      {days}d old
                    </span>
                  )}
                </div>

                {/* Stage Badge */}
                <div className="mb-4">
                  <span
                    className="px-3 py-1.5 rounded-lg text-[10px] font-black text-white"
                    style={{ backgroundColor: stageColor }}
                  >
                    {deal.stage}
                  </span>
                </div>

                {/* Value */}
                <div className="mb-4">
                  <p className="text-2xl font-black text-blue-600">
                    ${((deal.amount || 0)).toLocaleString()}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {deal.expectedCloseDate && (
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Close Date</p>
                      <p className="text-xs font-black text-slate-700">
                        {new Date(deal.expectedCloseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Age</p>
                    <p className={`text-xs font-black ${isStale ? 'text-amber-600' : 'text-slate-700'}`}>
                      {days} days
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {deal.contactId && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Users size={12} />
                        <span>{getContactName(deal.contactId)}</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredDeals.length === 0 && viewMode === 'cards' && (
        <div className="bg-white border border-slate-200 rounded-[35px]">
          <EmptyState
            icon={<Briefcase size={28} className="text-slate-400" />}
            title="No deals found"
            description="Try adjusting your filters or create a new deal."
          />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white border border-slate-200 rounded-[35px] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Deal</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Account</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Stage</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Assignee</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Close Date</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Age</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeals.map((deal) => {
                const days = getDaysInStage(deal);
                return (
                  <tr
                    key={deal.id}
                    onClick={() => navigate(`/deals/${deal.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-all group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Briefcase size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                            {deal.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">#{deal.id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-600">{getAccountName(deal.accountId)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-black text-white"
                        style={{ backgroundColor: getStageColor(deal.stage) }}
                      >
                        {deal.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-900">${((deal.amount || 0)).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const assignee = getAssignee(deal.assigneeId);
                        return assignee ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={assignee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignee.id}`}
                              className="w-6 h-6 rounded-full"
                              alt=""
                            />
                            <span className="text-xs font-bold text-slate-600">{assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      {deal.expectedCloseDate ? (
                        <p className="text-xs font-bold text-slate-600">
                          {new Date(deal.expectedCloseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold ${days > 30 ? 'text-amber-600' : 'text-slate-500'}`}>
                        {days}d
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ChevronRight size={16} className="text-slate-300" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredDeals.length === 0 && (
            <EmptyState
              icon={<Briefcase size={28} className="text-slate-400" />}
              title="No deals found"
              description="Try adjusting your filters or create a new deal."
            />
          )}
        </div>
      )}

      {/* Deal Composer Modal */}
      <DealComposer
        isOpen={showDealComposer}
        onClose={() => setShowDealComposer(false)}
        mode="create"
      />
    </div>
  );
};

export default DealsPage;
