import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Users, Target, Briefcase, Activity, Inbox,
  DollarSign, Calendar, MessageSquare, AlertCircle, CheckCircle,
  Clock, ArrowRight, Building2, Phone, Mail, Star, Flame,
  BarChart3, PieChart, Zap, ShieldAlert
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPie, Pie, Cell
} from 'recharts';
import { useCRM } from '../context/CRMContext';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { leads, deals, contacts, accounts, tickets, invoices, subscriptions, communications, users, currentUserId } = useCRM();

  // Calculate real stats
  const stats = useMemo(() => {
    // Leads
    const hotLeads = leads.filter(l => l.temperature === 'Hot').length;
    const newLeads = leads.filter(l => l.status === 'New').length;

    // Deals
    const activeDeals = deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').length;
    const pipelineValue = deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')
      .reduce((sum, d) => sum + d.amount, 0);
    const wonDeals = deals.filter(d => d.stage === 'Closed Won').length;

    // Tickets
    const newTickets = tickets.filter(t => t.status === 'New').length;
    const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    const overdueTickets = tickets.filter(t => {
      if (t.status === 'Resolved') return false;
      return new Date(t.slaDeadline) < new Date();
    }).length;

    // Invoices
    const pendingInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').length;
    const overdueInvoices = invoices.filter(i => i.status === 'Overdue').length;
    const totalAR = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue')
      .reduce((sum, inv) => sum + inv.items.reduce((a, b) => a + (b.qty * b.unitPrice), 0), 0);

    // Subscriptions
    const activeSubs = subscriptions.filter(s => s.status === 'Active').length;
    const mrr = subscriptions
      .filter(s => s.status === 'Active')
      .reduce((sum, sub) => {
        const amount = sub.items.reduce((a, b) => a + (b.qty * b.unitPrice), 0);
        if (sub.billingCycle === 'yearly') return sum + (amount / 12);
        if (sub.billingCycle === 'weekly') return sum + (amount * 4.33);
        return sum + amount;
      }, 0);

    return {
      totalLeads: leads.length,
      hotLeads,
      newLeads,
      totalDeals: deals.length,
      activeDeals,
      pipelineValue,
      wonDeals,
      totalContacts: contacts.length,
      totalAccounts: accounts.length,
      newTickets,
      openTickets,
      overdueTickets,
      pendingInvoices,
      overdueInvoices,
      totalAR,
      activeSubs,
      mrr
    };
  }, [leads, deals, contacts, accounts, tickets, invoices, subscriptions]);

  // Pipeline stage data for chart
  const pipelineData = useMemo(() => {
    const stages = ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'];
    return stages.map(stage => ({
      name: stage.replace('Closed ', ''),
      value: deals.filter(d => d.stage === stage).reduce((sum, d) => sum + d.amount, 0),
      count: deals.filter(d => d.stage === stage).length
    }));
  }, [deals]);

  // Lead source data for pie chart
  const leadSourceData = useMemo(() => {
    const sources = ['Website', 'Referral', 'Social', 'Email', 'Event'];
    return sources.map((source, i) => ({
      name: source,
      value: leads.filter(l => l.source === source).length || Math.floor(Math.random() * 5) + 1
    })).filter(s => s.amount > 0);
  }, [leads]);

  // Recent activity from communications
  const recentActivity = useMemo(() => {
    return [...communications]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(comm => {
        const contact = contacts.find(c => c.id === comm.contactId);
        return {
          ...comm,
          contactName: contact?.name || 'Unknown Contact',
          accountName: accounts.find(a => a.id === contact?.accountId)?.name
        };
      });
  }, [communications, contacts, accounts]);

  // Current user
  const currentUser = users.find(u => u.id === currentUserId);

  return (
    <div className="space-y-6 animate-slide-up max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Command Center</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Operator'}
          </h1>
          <p className="text-sm text-slate-500 mt-2">Here's what's happening in Zion today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/schedule')} className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
            <Calendar size={14}/> My Schedule
          </button>
          <button onClick={() => navigate('/tickets')} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2">
            <Inbox size={14}/> Support Queue
          </button>
        </div>
      </div>

      {/* Alert Banner (if there are urgent items) */}
      {(stats.overdueTickets > 0 || stats.overdueInvoices > 0) && (
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="font-black text-lg">Attention Required</p>
              <p className="text-rose-100 text-sm">
                {stats.overdueTickets > 0 && `${stats.overdueTickets} overdue ticket${stats.overdueTickets > 1 ? 's' : ''}`}
                {stats.overdueTickets > 0 && stats.overdueInvoices > 0 && ' • '}
                {stats.overdueInvoices > 0 && `${stats.overdueInvoices} overdue invoice${stats.overdueInvoices > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/tickets')} className="bg-white text-rose-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all">
            View Now
          </button>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {/* Hot Leads */}
        <button
          onClick={() => navigate('/leads')}
          className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:shadow-lg hover:border-orange-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
              <Flame size={22} className="text-orange-600 group-hover:text-white transition-colors" />
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.hotLeads}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hot Leads</p>
          <p className="text-xs text-slate-500 mt-1">{stats.totalLeads} total leads</p>
        </button>

        {/* Active Deals */}
        <button
          onClick={() => navigate('/deals')}
          className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:shadow-lg hover:border-purple-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
              <Briefcase size={22} className="text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.activeDeals}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Deals</p>
          <p className="text-xs text-slate-500 mt-1">{stats.wonDeals} won this month</p>
        </button>

        {/* Pipeline Value */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={22} />
            </div>
            <Star size={16} className="text-white/50" />
          </div>
          <p className="text-3xl font-black">${(stats.pipelineValue / 1000).toFixed(0)}K</p>
          <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Pipeline Value</p>
          <p className="text-xs text-blue-200 mt-1">{stats.totalDeals} total opportunities</p>
        </div>

        {/* MRR */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign size={22} />
            </div>
            <Zap size={16} className="text-white/50" />
          </div>
          <p className="text-3xl font-black">${Math.round(stats.mrr).toLocaleString()}</p>
          <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">Monthly MRR</p>
          <p className="text-xs text-emerald-200 mt-1">{stats.activeSubs} active subscriptions</p>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-6 gap-4">
        {/* Accounts */}
        <button onClick={() => navigate('/accounts')} className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{stats.totalAccounts}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Accounts</p>
            </div>
          </div>
        </button>

        {/* Contacts */}
        <button onClick={() => navigate('/contacts')} className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{stats.totalContacts}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Contacts</p>
            </div>
          </div>
        </button>

        {/* New Tickets */}
        <button onClick={() => navigate('/tickets')} className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all relative">
          {stats.newTickets > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-[9px] font-black text-white">{stats.newTickets}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Inbox size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{stats.openTickets}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Open Tickets</p>
            </div>
          </div>
        </button>

        {/* Pending Invoices */}
        <button onClick={() => navigate('/billing')} className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{stats.pendingInvoices}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Pending Invoices</p>
            </div>
          </div>
        </button>

        {/* AR Total */}
        <button onClick={() => navigate('/billing')} className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
              <Clock size={18} className="text-rose-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">${(stats.totalAR / 1000).toFixed(1)}K</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">AR Outstanding</p>
            </div>
          </div>
        </button>

        {/* Communications */}
        <button onClick={() => navigate('/comms')} className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <MessageSquare size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{communications.length}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Communications</p>
            </div>
          </div>
        </button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Pipeline Chart */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BarChart3 size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Pipeline by Stage</h3>
                <p className="text-xs text-slate-400">Deal values across your sales funnel</p>
              </div>
            </div>
            <button onClick={() => navigate('/deals')} className="text-[10px] font-bold text-blue-600 hover:underline">
              View All Deals
            </button>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <PieChart size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Lead Sources</h3>
              <p className="text-xs text-slate-400">Where your leads come from</p>
            </div>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {leadSourceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {leadSourceData.map((source, i) => (
              <div key={source.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                {source.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Activity size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Recent Activity</h3>
                <p className="text-xs text-slate-400">Latest communications and updates</p>
              </div>
            </div>
            <button onClick={() => navigate('/comms')} className="text-[10px] font-bold text-blue-600 hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activity.type === 'Email' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'Call' ? 'bg-emerald-100 text-emerald-600' :
                  activity.type === 'SMS' ? 'bg-purple-100 text-purple-600' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {activity.type === 'Email' ? <Mail size={18} /> :
                   activity.type === 'Call' ? <Phone size={18} /> :
                   <MessageSquare size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    <span className="text-blue-600">{activity.contactName}</span>
                    {activity.accountName && <span className="text-slate-400 font-normal"> • {activity.accountName}</span>}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{activity.subject || activity.summary}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{activity.date}</p>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${
                  activity.direction === 'Inbound' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {activity.direction}
                </span>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400">
                <MessageSquare size={32} strokeWidth={1} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Quick Actions</h3>
              <p className="text-xs text-slate-400">Jump to common tasks</p>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => navigate('/leads')} className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all text-left group">
              <Target size={18} className="text-slate-400 group-hover:text-blue-600" />
              <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Add New Lead</span>
              <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-blue-500" />
            </button>
            <button onClick={() => navigate('/deals')} className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all text-left group">
              <Briefcase size={18} className="text-slate-400 group-hover:text-purple-600" />
              <span className="text-sm font-bold text-slate-700 group-hover:text-purple-700">Create Deal</span>
              <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-purple-500" />
            </button>
            <button onClick={() => navigate('/tickets')} className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-amber-50 hover:border-amber-200 border border-transparent transition-all text-left group">
              <Inbox size={18} className="text-slate-400 group-hover:text-amber-600" />
              <span className="text-sm font-bold text-slate-700 group-hover:text-amber-700">Open Ticket</span>
              <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-amber-500" />
            </button>
            <button onClick={() => navigate('/billing')} className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition-all text-left group">
              <DollarSign size={18} className="text-slate-400 group-hover:text-emerald-600" />
              <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">New Invoice</span>
              <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-emerald-500" />
            </button>
            <button onClick={() => navigate('/schedule')} className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-all text-left group">
              <Calendar size={18} className="text-slate-400 group-hover:text-indigo-600" />
              <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">Schedule Task</span>
              <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-indigo-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
