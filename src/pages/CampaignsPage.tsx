import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  Megaphone, Plus, TrendingUp, DollarSign, Target, Users,
  ChevronRight, LayoutGrid, List, Calendar, BarChart3,
  Mail, Share2, Search as SearchIcon, Ticket, Filter, Play, Pause,
  CheckCircle2, XCircle, Clock, Percent, AlertTriangle, Download
} from 'lucide-react';
import { exportCampaigns } from '../utils/csvExport';

type ViewMode = 'cards' | 'list';
type TypeFilter = 'all' | 'email' | 'social' | 'search' | 'event' | 'referral';
type StatusFilter = 'all' | 'Planning' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';

const CampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const { campaigns, leads, openModal, searchQuery, setSearchQuery } = useCRM();

  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<'roi' | 'budget' | 'date' | 'name'>('date');

  // Calculate stats
  const stats = useMemo(() => {
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const totalLeads = campaigns.reduce((sum, c) => sum + (c.leadsGenerated || 0), 0);
    const active = campaigns.filter(c => c.status === 'Active');
    const avgCPL = totalLeads > 0 ? totalSpent / totalLeads : 0;
    const overallROI = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;

    return {
      total: campaigns.length,
      active: active.length,
      totalBudget,
      totalSpent,
      totalRevenue,
      totalLeads,
      avgCPL,
      overallROI
    };
  }, [campaigns]);

  // Type breakdown
  const typeBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    campaigns.forEach(c => {
      const type = (c.type || 'other').toLowerCase();
      breakdown[type] = (breakdown[type] || 0) + 1;
    });
    return Object.entries(breakdown)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [campaigns]);

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type.toLowerCase() === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'roi') {
        const spentA = a.spent ?? 0;
        const spentB = b.spent ?? 0;
        const roiA = spentA > 0 ? ((a.revenue || 0) - spentA) / spentA : 0;
        const roiB = spentB > 0 ? ((b.revenue || 0) - spentB) / spentB : 0;
        return roiB - roiA;
      }
      if (sortBy === 'budget') return (b.budget || 0) - (a.budget || 0);
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [campaigns, searchQuery, typeFilter, statusFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Paused': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Completed': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Planning': return <Clock size={14} />;
      case 'Active': return <Play size={14} />;
      case 'Paused': return <Pause size={14} />;
      case 'Completed': return <CheckCircle2 size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail size={14} className="text-blue-500" />;
      case 'social': return <Share2 size={14} className="text-violet-500" />;
      case 'search': return <SearchIcon size={14} className="text-emerald-500" />;
      case 'event': return <Ticket size={14} className="text-orange-500" />;
      case 'referral': return <Users size={14} className="text-pink-500" />;
      default: return <Megaphone size={14} className="text-slate-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-700';
      case 'social': return 'bg-violet-100 text-violet-700';
      case 'search': return 'bg-emerald-100 text-emerald-700';
      case 'event': return 'bg-orange-100 text-orange-700';
      case 'referral': return 'bg-pink-100 text-pink-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getCampaignROI = (campaign: typeof campaigns[0]) => {
    if (!campaign.spent || campaign.spent === 0) return 0;
    return ((campaign.revenue || 0) - campaign.spent) / campaign.spent * 100;
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-slide-up pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            <Megaphone size={14} className="text-violet-500" />
            <span>Marketing Campaigns</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-1">Campaigns</h1>
          <p className="text-sm text-slate-500 font-semibold">Manage marketing campaigns and track ROI</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportCampaigns(filteredCampaigns)}
            className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => openModal('campaigns')}
            className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> New Campaign
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard label="Total Campaigns" value={stats.total} icon={Megaphone} color="bg-violet-500" />
        <StatCard label="Active" value={stats.active} icon={Play} color="bg-emerald-500" />
        <StatCard label="Total Budget" value={`$${(stats.totalBudget / 1000).toFixed(0)}K`} icon={DollarSign} color="bg-blue-500" />
        <StatCard label="Revenue" value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard label="Avg CPL" value={`$${stats.avgCPL.toFixed(2)}`} icon={Target} color="bg-orange-500" />
        <StatCard label="Overall ROI" value={`${stats.overallROI.toFixed(0)}%`} icon={Percent} color={stats.overallROI >= 0 ? 'bg-emerald-500' : 'bg-rose-500'} />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Type Filters */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'email', 'social', 'search', 'event', 'referral'] as TypeFilter[]).map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                typeFilter === type
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type !== 'all' && getTypeIcon(type)}
              {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              {type !== 'all' && typeBreakdown.find(t => t.type === type) && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${typeFilter === type ? 'bg-white/20' : 'bg-slate-200'}`}>
                  {typeBreakdown.find(t => t.type === type)?.count || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* View Mode & Status Filter */}
        <div className="flex gap-3 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-violet-500"
          >
            <option value="date">Newest First</option>
            <option value="roi">Highest ROI</option>
            <option value="budget">Highest Budget</option>
            <option value="name">Name A-Z</option>
          </select>

          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white shadow text-violet-600' : 'text-slate-400'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-violet-600' : 'text-slate-400'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm font-bold text-slate-500">
        Showing {filteredCampaigns.length} of {campaigns.length} campaigns
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign, index) => {
            const roi = getCampaignROI(campaign);
            return (
              <div
                key={campaign.id}
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
                className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group animate-slide-up"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 ${getTypeColor(campaign.type)}`}>
                    {getTypeIcon(campaign.type)}
                    {campaign.type}
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border flex items-center gap-1.5 ${getStatusColor(campaign.status)}`}>
                    {getStatusIcon(campaign.status)}
                    {campaign.status}
                  </div>
                </div>

                {/* Name & Description */}
                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-violet-600 transition-colors">
                  {campaign.name}
                </h3>
                {campaign.description && (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6">{campaign.description}</p>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Budget</p>
                    <p className="text-lg font-black text-slate-900">${(campaign.budget || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Spent</p>
                    <p className="text-lg font-black text-slate-900">${(campaign.spent || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Leads</p>
                    <p className="text-lg font-black text-slate-900">{campaign.leadsGenerated || 0}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${roi >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${roi >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>ROI</p>
                    <p className={`text-lg font-black ${roi >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{roi.toFixed(0)}%</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={14} />
                    {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'No start date'}
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'list' && (
        <div className="bg-white border border-slate-200 rounded-[35px] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Campaign</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Type</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Status</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Budget</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Spent</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Leads</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Revenue</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">ROI</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaigns.map((campaign, index) => {
                const roi = getCampaignROI(campaign);
                return (
                  <tr
                    key={campaign.id}
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-black text-slate-900">{campaign.name}</p>
                        {campaign.description && (
                          <p className="text-xs text-slate-400 line-clamp-1">{campaign.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${getTypeColor(campaign.type)}`}>
                        {campaign.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 w-fit ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">${(campaign.budget || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">${(campaign.spent || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{campaign.leadsGenerated || 0}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">${(campaign.revenue || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${roi >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {roi.toFixed(0)}%
                      </span>
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
      )}

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[35px]">
          <Megaphone size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-black text-slate-900 mb-2">No Campaigns Found</h3>
          <p className="text-sm text-slate-500 mb-6">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first campaign to get started'}
          </p>
          <button
            onClick={() => openModal('campaigns')}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-violet-500/20 transition-all"
          >
            Create Campaign
          </button>
        </div>
      )}
    </div>
  );
};

// Stat Card Component - Flash UI Standard
const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
      </div>
      <div className={`w-12 h-12 ${color.replace('bg-', 'bg-')} bg-opacity-10 rounded-xl flex items-center justify-center`}>
        <Icon size={22} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
  </div>
);

export default CampaignsPage;
