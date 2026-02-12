import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  Building2, Plus, TrendingUp, Clock, Calendar,
  ChevronRight, LayoutGrid, List, Users, AlertTriangle,
  Star, Filter, Search, Phone, Mail, MessageSquare,
  DollarSign, RefreshCcw, Briefcase, Target, Activity,
  Zap, CheckCircle2, ArrowUpRight, Globe, MapPin,
  Award, TrendingDown, Crown, Download
} from 'lucide-react';
import { exportAccounts } from '../utils/csvExport';

type ViewMode = 'grid' | 'list';
type EngagementLevel = 'champion' | 'engaged' | 'casual' | 'dormant';

const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { accounts, contacts, deals, leads, invoices, users, settings, openModal, searchQuery, setSearchQuery } = useCRM();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [engagementFilter, setEngagementFilter] = useState<EngagementLevel | 'all'>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'revenue' | 'engagement' | 'name' | 'deals'>('revenue');

  // Get unique industries
  const industries = useMemo(() => {
    const industrySet = new Set(accounts.map(a => a.industry || 'Other'));
    return Array.from(industrySet);
  }, [accounts]);

  // Calculate engagement level based on activity and revenue
  const getEngagementLevel = (account: any): EngagementLevel => {
    const relatedDeals = deals.filter(d => d.accountId === account.id);
    const wonDeals = relatedDeals.filter(d => d.stage === 'Closed Won');
    const relatedInvoices = invoices?.filter(i => i.accountId === account.id) || [];
    const totalRevenue = relatedInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
    const activeDeals = relatedDeals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');

    const daysSinceActivity = account.lastActivityDate
      ? Math.ceil((Date.now() - new Date(account.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Champion: High revenue, active deals, recent activity
    if ((totalRevenue > 50000 || wonDeals.length >= 3) && daysSinceActivity < 30) return 'champion';
    // Engaged: Active deals or recent activity
    if (activeDeals.length > 0 || daysSinceActivity < 14) return 'engaged';
    // Casual: Some history but not very active
    if (relatedDeals.length > 0 || daysSinceActivity < 60) return 'casual';
    // Dormant: No recent activity
    return 'dormant';
  };

  // Get account metrics
  const getAccountMetrics = (account: any) => {
    const relatedDeals = deals.filter(d => d.accountId === account.id);
    const wonDeals = relatedDeals.filter(d => d.stage === 'Closed Won');
    const openDeals = relatedDeals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');
    const relatedContacts = contacts.filter(c => c.accountId === account.id);
    const relatedLeads = leads.filter(l => l.accountId === account.id);
    const relatedInvoices = invoices?.filter(i => i.accountId === account.id) || [];

    const totalRevenue = relatedInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
    const pipelineValue = openDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const wonValue = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

    return {
      totalDeals: relatedDeals.length,
      wonDeals: wonDeals.length,
      openDeals: openDeals.length,
      contacts: relatedContacts.length,
      leads: relatedLeads.length,
      revenue: totalRevenue,
      pipelineValue,
      wonValue
    };
  };

  // Calculate stats
  const stats = useMemo(() => {
    const champions = accounts.filter(a => getEngagementLevel(a) === 'champion');
    const engaged = accounts.filter(a => getEngagementLevel(a) === 'engaged');
    const casual = accounts.filter(a => getEngagementLevel(a) === 'casual');
    const dormant = accounts.filter(a => getEngagementLevel(a) === 'dormant');

    const totalRevenue = accounts.reduce((sum, a) => {
      const metrics = getAccountMetrics(a);
      return sum + metrics.revenue;
    }, 0);

    const totalPipeline = accounts.reduce((sum, a) => {
      const metrics = getAccountMetrics(a);
      return sum + metrics.pipelineValue;
    }, 0);

    const totalContacts = accounts.reduce((sum, a) => {
      const metrics = getAccountMetrics(a);
      return sum + metrics.contacts;
    }, 0);

    return {
      total: accounts.length,
      champions: champions.length,
      engaged: engaged.length,
      casual: casual.length,
      dormant: dormant.length,
      revenue: totalRevenue,
      pipeline: totalPipeline,
      contacts: totalContacts
    };
  }, [accounts, deals, invoices, contacts]);

  // Filter and sort accounts
  const filteredAccounts = useMemo(() => {
    let filtered = [...accounts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.industry?.toLowerCase().includes(query) ||
        a.website?.toLowerCase().includes(query)
      );
    }

    if (engagementFilter !== 'all') {
      filtered = filtered.filter(a => getEngagementLevel(a) === engagementFilter);
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(a => (a.industry || 'Other') === industryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'revenue') {
        return getAccountMetrics(b).revenue - getAccountMetrics(a).revenue;
      }
      if (sortBy === 'deals') {
        return getAccountMetrics(b).totalDeals - getAccountMetrics(a).totalDeals;
      }
      if (sortBy === 'engagement') {
        const levels: Record<EngagementLevel, number> = { champion: 4, engaged: 3, casual: 2, dormant: 1 };
        return levels[getEngagementLevel(b)] - levels[getEngagementLevel(a)];
      }
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [accounts, searchQuery, engagementFilter, industryFilter, sortBy, deals, invoices]);

  const getEngagementColor = (level: EngagementLevel) => {
    switch (level) {
      case 'champion': return 'bg-amber-500';
      case 'engaged': return 'bg-emerald-500';
      case 'casual': return 'bg-blue-400';
      case 'dormant': return 'bg-slate-300';
    }
  };

  const getEngagementBadge = (level: EngagementLevel) => {
    switch (level) {
      case 'champion': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'engaged': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'casual': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'dormant': return 'bg-slate-50 text-slate-400 border-slate-200';
    }
  };

  const getEngagementIcon = (level: EngagementLevel) => {
    switch (level) {
      case 'champion': return <Crown size={12} className="text-amber-500" />;
      case 'engaged': return <Zap size={12} className="text-emerald-500" />;
      case 'casual': return <Activity size={12} className="text-blue-400" />;
      case 'dormant': return <TrendingDown size={12} className="text-slate-400" />;
    }
  };

  const getDaysSince = (date: string) => {
    if (!date) return null;
    const days = Math.ceil((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const getOwner = (ownerId?: string) => {
    if (!ownerId) return null;
    return users.find(u => u.id === ownerId);
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1800px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Relationships</p>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Accounts</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                viewMode === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid size={14} /> Grid
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
            onClick={() => exportAccounts(filteredAccounts)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => openModal('accounts')}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={14} /> New Account
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-6 gap-4">
        <button
          onClick={() => { setEngagementFilter('all'); setIndustryFilter('all'); }}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            engagementFilter === 'all' && industryFilter === 'all' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-900">{stats.total}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Accounts</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Building2 size={22} className="text-blue-600" />
            </div>
          </div>
        </button>
        <button
          onClick={() => setEngagementFilter(engagementFilter === 'champion' ? 'all' : 'champion')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            engagementFilter === 'champion' ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-amber-600">{stats.champions}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Champions</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Crown size={22} className="text-amber-500" />
            </div>
          </div>
        </button>
        <button
          onClick={() => setEngagementFilter(engagementFilter === 'engaged' ? 'all' : 'engaged')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            engagementFilter === 'engaged' ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-emerald-600">{stats.engaged}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Engaged</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Zap size={22} className="text-emerald-600" />
            </div>
          </div>
        </button>
        <button
          onClick={() => setEngagementFilter(engagementFilter === 'dormant' ? 'all' : 'dormant')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            engagementFilter === 'dormant' ? 'border-slate-400 ring-2 ring-slate-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-500">{stats.dormant}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Dormant</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <TrendingDown size={22} className="text-slate-400" />
            </div>
          </div>
        </button>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black">${(stats.revenue / 1000).toFixed(0)}k</p>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider mt-1">Total Revenue</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign size={22} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black">${(stats.pipeline / 1000).toFixed(0)}k</p>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider mt-1">Pipeline Value</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Briefcase size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Industry Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Filter by Industry</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIndustryFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              industryFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Industries
          </button>
          {industries.slice(0, 8).map((industry) => {
            const count = accounts.filter(a => (a.industry || 'Other') === industry).length;
            return (
              <button
                key={industry}
                onClick={() => setIndustryFilter(industryFilter === industry ? 'all' : industry)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  industryFilter === industry
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {industry} <span className="ml-1 opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search accounts..."
            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
        >
          <option value="revenue">Sort by Revenue</option>
          <option value="deals">Sort by Deals</option>
          <option value="engagement">Sort by Engagement</option>
          <option value="name">Sort by Name</option>
        </select>
        {(engagementFilter !== 'all' || industryFilter !== 'all') && (
          <button
            onClick={() => { setEngagementFilter('all'); setIndustryFilter('all'); }}
            className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <RefreshCcw size={14} /> Clear
          </button>
        )}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-3 gap-4">
          {filteredAccounts.map((account) => {
            const engagement = getEngagementLevel(account);
            const metrics = getAccountMetrics(account);

            return (
              <div
                key={account.id}
                onClick={() => navigate(`/accounts/${account.id}`)}
                className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-xl transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
                        {account.logo ? (
                          <img src={account.logo} className="w-full h-full object-cover rounded-xl" alt="" />
                        ) : (
                          <Building2 size={24} className="text-slate-400" />
                        )}
                      </div>
                      {engagement === 'champion' && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                          <Crown size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {account.name}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400">
                        {account.industry || 'Other'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border flex items-center gap-1 ${getEngagementBadge(engagement)}`}>
                    {getEngagementIcon(engagement)}
                    {engagement}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-black text-slate-900">{metrics.contacts}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Contacts</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-black text-violet-600">{metrics.openDeals}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Open Deals</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-black text-emerald-600">{metrics.wonDeals}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Won</p>
                  </div>
                </div>

                {/* Website & Location */}
                <div className="space-y-2 mb-4">
                  {account.website && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <Globe size={12} className="text-slate-400" />
                      <span className="truncate">{account.website}</span>
                    </div>
                  )}
                  {(account.city || account.state) && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <MapPin size={12} className="text-slate-400" />
                      <span>{[account.city, account.state].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Revenue Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    {metrics.revenue > 0 ? (
                      <p className="text-base font-black text-emerald-600">
                        ${(metrics.revenue / 1000).toFixed(0)}k
                        <span className="text-[10px] font-bold text-slate-400 ml-1">revenue</span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">No revenue yet</p>
                    )}
                  </div>
                  {metrics.pipelineValue > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-black text-violet-600">
                        ${(metrics.pipelineValue / 1000).toFixed(0)}k
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">Pipeline</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white border border-slate-200 rounded-[35px] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Account</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Industry</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employees</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Owner</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Engagement</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Contacts</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Deals</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Pipeline</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((account) => {
                const engagement = getEngagementLevel(account);
                const metrics = getAccountMetrics(account);

                return (
                  <tr
                    key={account.id}
                    onClick={() => navigate(`/accounts/${account.id}`)}
                    className={`hover:bg-slate-50 cursor-pointer transition-all group ${
                      engagement === 'champion' ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            {account.logo ? (
                              <img src={account.logo} className="w-full h-full object-cover rounded-xl" alt="" />
                            ) : (
                              <Building2 size={18} className="text-slate-400" />
                            )}
                          </div>
                          {engagement === 'champion' && (
                            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                              <Crown size={8} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                            {account.name}
                          </p>
                          {account.website && (
                            <p className="text-[10px] font-bold text-slate-400">{account.website}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600">
                        {account.industry || 'Other'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {account.employeeCount ? (
                        <span className="text-sm font-bold text-slate-700">
                          {account.employeeCount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const owner = getOwner(account.ownerId);
                        return owner ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={owner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${owner.id}`}
                              className="w-6 h-6 rounded-full"
                              alt=""
                            />
                            <span className="text-xs font-bold text-slate-600">{owner.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border flex items-center gap-1 w-fit ${getEngagementBadge(engagement)}`}>
                        {getEngagementIcon(engagement)}
                        {engagement}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Users size={12} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">{metrics.contacts}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-violet-600">{metrics.openDeals}</span>
                        <span className="text-[10px] text-slate-400">open</span>
                        {metrics.wonDeals > 0 && (
                          <>
                            <span className="text-slate-200">|</span>
                            <span className="text-sm font-bold text-emerald-600">{metrics.wonDeals}</span>
                            <span className="text-[10px] text-slate-400">won</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {metrics.revenue > 0 ? (
                        <p className="text-sm font-black text-emerald-600">
                          ${metrics.revenue.toLocaleString()}
                        </p>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {metrics.pipelineValue > 0 ? (
                        <p className="text-sm font-black text-violet-600">
                          ${metrics.pipelineValue.toLocaleString()}
                        </p>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <ChevronRight size={16} className="text-slate-300" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAccounts.length === 0 && (
            <div className="py-16 text-center">
              <Building2 size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-sm font-bold text-slate-400">No accounts found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
