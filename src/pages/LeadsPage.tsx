import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  Target, Plus, TrendingUp, Clock, Calendar,
  ChevronRight, LayoutGrid, List, Users, AlertTriangle,
  Star, Filter, Search, Phone, Mail, MessageSquare,
  Flame, Thermometer, Snowflake, ArrowRight, RefreshCcw,
  Building2, User, Zap, CheckCircle2, XCircle, Download, Upload
} from 'lucide-react';
import { exportLeads, triggerCSVImport } from '../utils/csvExport';
import BulkActionsBar from '../components/BulkActionsBar';

type ViewMode = 'cards' | 'list';
type LeadTemp = 'hot' | 'warm' | 'cold' | 'all';

const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { leads, accounts, contacts, campaigns, settings, openModal, searchQuery, setSearchQuery, upsertRecord, updateStatus, deleteRecord, users } = useCRM();

  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [tempFilter, setTempFilter] = useState<LeadTemp>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'name' | 'value'>('score');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  // Get unique sources from leads
  const sources = useMemo(() => {
    const sourceSet = new Set(leads.map(l => l.source || 'Direct'));
    return Array.from(sourceSet);
  }, [leads]);

  // Calculate lead temperature based on engagement and recency
  const getLeadTemperature = (lead: any): 'hot' | 'warm' | 'cold' => {
    const daysSinceContact = lead.lastContactDate
      ? Math.ceil((Date.now() - new Date(lead.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    const score = lead.score || 0;

    if (score >= 80 || (lead.status === 'Qualified' && daysSinceContact < 7)) return 'hot';
    if (score >= 50 || daysSinceContact < 14) return 'warm';
    return 'cold';
  };

  // Calculate stats
  const stats = useMemo(() => {
    const hotLeads = leads.filter(l => getLeadTemperature(l) === 'hot');
    const warmLeads = leads.filter(l => getLeadTemperature(l) === 'warm');
    const coldLeads = leads.filter(l => getLeadTemperature(l) === 'cold');
    const qualified = leads.filter(l => l.status === 'Qualified');
    const converted = leads.filter(l => l.status === 'Converted');
    const lost = leads.filter(l => l.status === 'Lost');
    const conversionRate = leads.length > 0
      ? (converted.length / leads.length) * 100 : 0;
    const avgScore = leads.length > 0
      ? leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length : 0;
    const totalValue = leads.reduce((sum, l) => sum + (l.estimatedValue || l.amount || 0), 0);

    return {
      total: leads.length,
      hot: hotLeads.length,
      warm: warmLeads.length,
      cold: coldLeads.length,
      qualified: qualified.length,
      converted: converted.length,
      lost: lost.length,
      conversionRate,
      avgScore,
      totalValue
    };
  }, [leads]);

  // Source breakdown
  const sourceBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    leads.forEach(l => {
      const source = l.source || 'Direct';
      breakdown[source] = (breakdown[source] || 0) + 1;
    });
    return Object.entries(breakdown)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(query) ||
        l.email?.toLowerCase().includes(query) ||
        l.company?.toLowerCase().includes(query) ||
        l.phone?.toLowerCase().includes(query)
      );
    }

    if (tempFilter !== 'all') {
      filtered = filtered.filter(l => getLeadTemperature(l) === tempFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(l => l.status === statusFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(l => (l.source || 'Direct') === sourceFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'value') return (b.estimatedValue || b.amount || 0) - (a.estimatedValue || a.amount || 0);
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [leads, searchQuery, tempFilter, statusFilter, sourceFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Contacted': return 'bg-violet-50 text-violet-600 border-violet-200';
      case 'Qualified': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Converted': return 'bg-emerald-600 text-white border-emerald-700';
      case 'Lost': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getTempIcon = (temp: 'hot' | 'warm' | 'cold') => {
    switch (temp) {
      case 'hot': return <Flame size={14} className="text-rose-500" />;
      case 'warm': return <Thermometer size={14} className="text-amber-500" />;
      case 'cold': return <Snowflake size={14} className="text-blue-400" />;
    }
  };

  const getTempColor = (temp: 'hot' | 'warm' | 'cold') => {
    switch (temp) {
      case 'hot': return 'bg-rose-50 border-rose-200';
      case 'warm': return 'bg-amber-50 border-amber-200';
      case 'cold': return 'bg-blue-50 border-blue-200';
    }
  };

  const getDaysSince = (date: string) => {
    if (!date) return null;
    const days = Math.ceil((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const getCampaignName = (campaignId?: string) => {
    if (!campaignId) return null;
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.name || null;
  };

  // Bulk actions
  const handleSelectAll = () => {
    setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
  };

  const handleDeselectAll = () => {
    setSelectedLeads(new Set());
  };

  const handleToggleSelect = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleBulkDelete = () => {
    selectedLeads.forEach(leadId => {
      deleteRecord('leads', leadId);
    });
    setSelectedLeads(new Set());
  };

  const handleBulkStatusUpdate = (status: string) => {
    selectedLeads.forEach(leadId => {
      updateStatus('leads', leadId, status);
    });
    setSelectedLeads(new Set());
  };

  const handleBulkAssign = (userId: string) => {
    selectedLeads.forEach(leadId => {
      upsertRecord('leads', { id: leadId, assignedTo: userId });
    });
    setSelectedLeads(new Set());
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1800px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Pipeline</p>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Leads</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
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
            onClick={() => triggerCSVImport({
              columnMapping: {
                'Full Name': 'name',
                'Email Address': 'email',
                'Phone Number': 'phone',
                'Company Name': 'company',
                'Lead Status': 'status',
                'Lead Source': 'source',
                'Estimated Value': 'estimatedValue',
                'Lead Score': 'score'
              },
              parser: {
                estimatedValue: (v) => parseFloat(v.replace(/[$,]/g, '')) || 0,
                score: (v) => parseInt(v) || 0
              }
            }, (result) => {
              if (result.success) {
                result.data.forEach((lead: any) => {
                  upsertRecord('leads', {
                    ...lead,
                    id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${lead.name || 'User'}`
                  });
                });
                alert(`Successfully imported ${result.data.length} leads!${result.skipped > 0 ? `\nSkipped ${result.skipped} empty rows.` : ''}`);
              } else {
                alert(`Import failed:\n${result.errors.join('\n')}`);
              }
            })}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <Upload size={14} /> Import
          </button>
          <button
            onClick={() => exportLeads(filteredLeads)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => openModal('leads')}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={14} /> New Lead
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-6 gap-4">
        <button
          onClick={() => { setTempFilter('all'); setStatusFilter('all'); setSourceFilter('all'); }}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            tempFilter === 'all' && statusFilter === 'all' && sourceFilter === 'all' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-900">{stats.total}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Leads</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Target size={22} className="text-blue-600" />
            </div>
          </div>
        </button>
        <button
          onClick={() => setTempFilter(tempFilter === 'hot' ? 'all' : 'hot')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            tempFilter === 'hot' ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-rose-600">{stats.hot}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Hot Leads</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <Flame size={22} className="text-rose-500" />
            </div>
          </div>
        </button>
        <button
          onClick={() => setTempFilter(tempFilter === 'warm' ? 'all' : 'warm')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            tempFilter === 'warm' ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-amber-600">{stats.warm}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Warm Leads</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Thermometer size={22} className="text-amber-500" />
            </div>
          </div>
        </button>
        <button
          onClick={() => setTempFilter(tempFilter === 'cold' ? 'all' : 'cold')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            tempFilter === 'cold' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-blue-500">{stats.cold}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Cold Leads</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Snowflake size={22} className="text-blue-400" />
            </div>
          </div>
        </button>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-emerald-600">{stats.conversionRate.toFixed(0)}%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Conversion</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={22} className="text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-violet-600">{stats.avgScore.toFixed(0)}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Avg Score</p>
            </div>
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
              <Star size={22} className="text-violet-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Source Breakdown + Insights */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Lead Sources</h3>
          <div className="flex flex-wrap gap-2">
            {sourceBreakdown.slice(0, 6).map(({ source, count }) => (
              <button
                key={source}
                onClick={() => setSourceFilter(sourceFilter === source ? 'all' : source)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  sourceFilter === source
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {source} <span className="ml-1 opacity-60">({count})</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="opacity-80" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Qualified</span>
          </div>
          <p className="text-3xl font-black">{stats.qualified}</p>
          <p className="text-xs font-bold opacity-70 mt-1">Ready to convert</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="opacity-80" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Est. Value</span>
          </div>
          <p className="text-3xl font-black">${(stats.totalValue / 1000).toFixed(0)}k</p>
          <p className="text-xs font-bold opacity-70 mt-1">Pipeline potential</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search leads..."
            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.amount)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.amount)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.amount as any)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
        >
          <option value="score">Sort by Score</option>
          <option value="value">Sort by Value</option>
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
        </select>
        {(tempFilter !== 'all' || statusFilter !== 'all' || sourceFilter !== 'all') && (
          <button
            onClick={() => { setTempFilter('all'); setStatusFilter('all'); setSourceFilter('all'); }}
            className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <RefreshCcw size={14} /> Clear Filters
          </button>
        )}
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-3 gap-4">
          {filteredLeads.map((lead) => {
            const temp = getLeadTemperature(lead);
            const score = lead.score || 0;

            return (
              <div
                key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className={`bg-white border rounded-2xl p-5 cursor-pointer hover:shadow-xl transition-all group ${getTempColor(temp)}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden">
                      <img
                        src={lead.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.id}`}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {lead.name}
                      </h4>
                      {lead.company && (
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Building2 size={10} /> {lead.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/80">
                    {getTempIcon(temp)}
                    <span className="text-[10px] font-bold text-slate-600">{score}</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {lead.email && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <Mail size={12} className="text-slate-400" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <Phone size={12} className="text-slate-400" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                </div>

                {/* Status & Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                    {lead.source && (
                      <span className="px-2 py-0.5 bg-slate-100 rounded">{lead.source}</span>
                    )}
                    {lead.lastContactDate && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {getDaysSince(lead.lastContactDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Value if present */}
                {(lead.estimatedValue || lead.amount) && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-base font-black text-blue-600">
                      ${((lead.estimatedValue || lead.amount || 0)).toLocaleString()}
                      <span className="text-[10px] font-bold text-slate-400 ml-1">est. value</span>
                    </p>
                  </div>
                )}
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
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                    onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Lead</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Campaign</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Contact</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => {
                const temp = getLeadTemperature(lead);
                return (
                  <tr
                    key={lead.id}
                    onClick={(e) => {
                      // Don't navigate if clicking checkbox
                      if ((e.target as HTMLElement).tagName !== 'INPUT') {
                        navigate(`/leads/${lead.id}`);
                      }
                    }}
                    className={`hover:bg-slate-50 cursor-pointer transition-all group ${
                      temp === 'hot' ? 'bg-rose-50/30' : temp === 'warm' ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => handleToggleSelect(lead.id)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden">
                          <img
                            src={lead.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.id}`}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                            {lead.name}
                          </p>
                          {lead.company && (
                            <p className="text-[10px] font-bold text-slate-400">{lead.company}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {lead.email && (
                          <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                            <Mail size={10} /> {lead.email}
                          </p>
                        )}
                        {lead.phone && (
                          <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                            <Phone size={10} /> {lead.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTempIcon(temp)}
                        <span className="text-sm font-black text-slate-700">{lead.score || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600">
                        {lead.source || 'Direct'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const campaignName = getCampaignName(lead.campaignId);
                        return campaignName ? (
                          <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-[10px] font-bold">
                            {campaignName}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      {lead.notes ? (
                        <span className="text-xs font-medium text-slate-500" title={lead.notes}>
                          {lead.notes.length > 50 ? `${lead.notes.slice(0, 50)}...` : lead.notes}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {lead.lastContactDate ? (
                        <span className="text-xs font-bold text-slate-500">
                          {getDaysSince(lead.lastContactDate)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {(lead.estimatedValue || lead.amount) ? (
                        <p className="text-sm font-black text-blue-600">
                          ${((lead.estimatedValue || lead.amount || 0)).toLocaleString()}
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

          {filteredLeads.length === 0 && (
            <div className="py-16 text-center">
              <Target size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-sm font-bold text-slate-400">No leads found</p>
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedLeads.size}
        totalCount={filteredLeads.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBulkDelete={handleBulkDelete}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkAssign={handleBulkAssign}
        statusOptions={settings.leadStatuses || ['New', 'Contacted', 'Qualified', 'Converted', 'Lost']}
        users={users}
      />
    </div>
  );
};

export default LeadsPage;
