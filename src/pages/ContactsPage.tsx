import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  Users, Plus, TrendingUp, Clock, Calendar,
  ChevronRight, LayoutGrid, List, Building2, AlertTriangle,
  Star, Filter, Search, Phone, Mail, MessageSquare,
  Activity, RefreshCcw, Briefcase, UserCheck, UserX,
  Zap, CheckCircle2, ArrowUpRight, Globe, MapPin, Download
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { exportContacts } from '../utils/csvExport';

type ViewMode = 'grid' | 'list';

const ContactsPage: React.FC = () => {
  const navigate = useNavigate();
  const { contacts, accounts, deals, leads, settings, openModal, searchQuery, setSearchQuery } = useCRM();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activityFilter, setActivityFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'activity' | 'name' | 'date'>('activity');

  // Get unique roles
  const roles = useMemo(() => {
    const roleSet = new Set(contacts.map(c => c.role || c.title || 'Contact'));
    return Array.from(roleSet);
  }, [contacts]);

  // Calculate activity level based on interactions
  const getActivityLevel = (contact: any): 'high' | 'medium' | 'low' | 'none' => {
    const daysSinceContact = contact.lastActivityDate || contact.lastContactDate
      ? Math.ceil((Date.now() - new Date(contact.lastActivityDate || contact.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    const interactions = contact.interactionCount || 0;

    if (daysSinceContact < 7 && interactions > 5) return 'high';
    if (daysSinceContact < 14 && interactions > 2) return 'medium';
    if (daysSinceContact < 30) return 'low';
    return 'none';
  };

  // Get related entities count
  const getRelatedCounts = (contact: any) => {
    const relatedDeals = deals.filter(d => d.contactId === contact.id);
    const relatedLeads = leads.filter(l => l.accountId === contact.accountId);
    const account = accounts.find(a => a.id === contact.accountId);
    return {
      deals: relatedDeals.length,
      leads: relatedLeads.length,
      account,
      totalValue: relatedDeals.reduce((sum, d) => sum + (d.amount || 0), 0)
    };
  };

  // Calculate stats
  const stats = useMemo(() => {
    const active = contacts.filter(c => getActivityLevel(c) !== 'none');
    const inactive = contacts.filter(c => getActivityLevel(c) === 'none');
    const highActivity = contacts.filter(c => getActivityLevel(c) === 'high');
    const withDeals = contacts.filter(c => deals.some(d => d.contactId === c.id));
    const withAccounts = contacts.filter(c => c.accountId);
    const totalInteractions = contacts.reduce((sum, c) => sum + (c.interactionCount || 0), 0);

    return {
      total: contacts.length,
      active: active.length,
      inactive: inactive.length,
      highActivity: highActivity.length,
      withDeals: withDeals.length,
      withAccounts: withAccounts.length,
      avgInteractions: contacts.length > 0 ? (totalInteractions / contacts.length).toFixed(1) : '0'
    };
  }, [contacts, deals]);

  // Filter and sort contacts
  const filteredContacts = useMemo(() => {
    let filtered = [...contacts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.role?.toLowerCase().includes(query) ||
        c.title?.toLowerCase().includes(query)
      );
    }

    if (activityFilter !== 'all') {
      if (activityFilter === 'active') {
        filtered = filtered.filter(c => getActivityLevel(c) !== 'none');
      } else {
        filtered = filtered.filter(c => getActivityLevel(c) === 'none');
      }
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(c => (c.role || c.title || 'Contact') === roleFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'activity') {
        const levels = { high: 3, medium: 2, low: 1, none: 0 };
        return levels[getActivityLevel(b)] - levels[getActivityLevel(a)];
      }
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [contacts, searchQuery, activityFilter, roleFilter, sortBy]);

  const getActivityColor = (level: 'high' | 'medium' | 'low' | 'none') => {
    switch (level) {
      case 'high': return 'bg-emerald-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-slate-400';
      case 'none': return 'bg-slate-200';
    }
  };

  const getActivityBadge = (level: 'high' | 'medium' | 'low' | 'none') => {
    switch (level) {
      case 'high': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'low': return 'bg-slate-50 text-slate-500 border-slate-200';
      case 'none': return 'bg-rose-50 text-rose-400 border-rose-200';
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

  return (
    <div className="space-y-6 animate-slide-up max-w-[1800px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relationship Management</p>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Contacts</h1>
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
            onClick={() => exportContacts(filteredContacts)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => openModal('contacts')}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={14} /> New Contact
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-6 gap-4">
        <button
          onClick={() => { setActivityFilter('all'); setRoleFilter('all'); }}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            activityFilter === 'all' && roleFilter === 'all' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-900">{stats.total}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Contacts</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users size={22} className="text-blue-600" />
            </div>
          </div>
        </button>
        <button
          onClick={() => setActivityFilter(activityFilter === 'active' ? 'all' : 'active')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            activityFilter === 'active' ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-emerald-600">{stats.active}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <UserCheck size={22} className="text-emerald-600" />
            </div>
          </div>
        </button>
        <button
          onClick={() => setActivityFilter(activityFilter === 'inactive' ? 'all' : 'inactive')}
          className={`bg-white border rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
            activityFilter === 'inactive' ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-rose-500">{stats.inactive}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Inactive</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <UserX size={22} className="text-rose-400" />
            </div>
          </div>
        </button>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-amber-600">{stats.highActivity}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">High Activity</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Activity size={22} className="text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-violet-600">{stats.withDeals}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">With Deals</p>
            </div>
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
              <Briefcase size={22} className="text-violet-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-700">{stats.avgInteractions}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Avg Interactions</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <MessageSquare size={22} className="text-slate-500" />
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
            placeholder="Search contacts..."
            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
        >
          <option value="all">All Roles</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
        >
          <option value="activity">Sort by Activity</option>
          <option value="date">Sort by Date Added</option>
          <option value="name">Sort by Name</option>
        </select>
        {(activityFilter !== 'all' || roleFilter !== 'all') && (
          <button
            onClick={() => { setActivityFilter('all'); setRoleFilter('all'); }}
            className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <RefreshCcw size={14} /> Clear
          </button>
        )}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-4 gap-4">
          {filteredContacts.map((contact) => {
            const activity = getActivityLevel(contact);
            const related = getRelatedCounts(contact);

            return (
              <div
                key={contact.id}
                onClick={() => navigate(`/contacts/${contact.id}`)}
                className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-xl transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden">
                        <img
                          src={contact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.id}`}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      {/* Activity indicator dot */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getActivityColor(activity)}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {contact.name}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400">
                        {contact.role || contact.title || 'Contact'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Link */}
                {related.account && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-slate-50 rounded-lg">
                    <Building2 size={12} className="text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-600 truncate">{related.account.name}</span>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <Mail size={12} className="text-slate-400" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <Phone size={12} className="text-slate-400" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                </div>

                {/* Activity & Relations */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${getActivityBadge(activity)}`}>
                      {activity === 'none' ? 'Inactive' : activity}
                    </span>
                    {contact.lastActivityDate && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {getDaysSince(contact.lastActivityDate)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    {related.deals > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-600 rounded">
                        <Briefcase size={10} /> {related.deals}
                      </span>
                    )}
                  </div>
                </div>

                {/* Value if deals present */}
                {related.totalValue > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-base font-black text-blue-600">
                      ${related.totalValue.toLocaleString()}
                      <span className="text-[10px] font-bold text-slate-400 ml-1">in deals</span>
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
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Account</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Activity</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Contact</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Deals</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.map((contact) => {
                const activity = getActivityLevel(contact);
                const related = getRelatedCounts(contact);

                return (
                  <tr
                    key={contact.id}
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-all group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden">
                            <img
                              src={contact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.id}`}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getActivityColor(activity)}`} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                            {contact.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">{contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600">
                        {contact.role || contact.title || 'Contact'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {related.account ? (
                        <div className="flex items-center gap-2">
                          <Building2 size={12} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-600">{related.account.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${getActivityBadge(activity)}`}>
                        {activity === 'none' ? 'Inactive' : activity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {contact.lastActivityDate ? (
                        <span className="text-xs font-bold text-slate-500">
                          {getDaysSince(contact.lastActivityDate)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {related.deals > 0 ? (
                        <span className="px-2 py-1 bg-violet-50 text-violet-600 rounded text-[10px] font-bold">
                          {related.deals}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {related.totalValue > 0 ? (
                        <p className="text-sm font-black text-blue-600">
                          ${related.totalValue.toLocaleString()}
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

          {filteredContacts.length === 0 && (
            <EmptyState
              icon={<Users size={28} className="text-slate-400" />}
              title="No contacts found"
              description="Try adjusting your filters or create a new contact."
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
