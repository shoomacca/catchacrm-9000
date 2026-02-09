import React, { useState, useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Target,
  Briefcase, FileText, Calendar, Download, Filter, ChevronRight,
  PieChart, Activity, ArrowUpRight, ArrowDownRight, Package,
  CreditCard, Clock, CheckCircle2, AlertCircle, Zap, Building2,
  Phone, Mail, MessageSquare, ShoppingCart, Percent, Eye
} from 'lucide-react';

type ReportType = 'sales' | 'financial' | 'operations' | 'marketing' | 'customer' | 'pipeline';
type DateRange = '7d' | '30d' | '90d' | 'ytd' | 'custom';

const Reports: React.FC = () => {
  const {
    leads, deals, accounts, contacts, invoices, quotes, tasks, jobs,
    communications, calendarEvents, expenses, settings
  } = useCRM();

  const [activeReport, setActiveReport] = useState<ReportType>('sales');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const currencySymbol = settings?.localization?.currencySymbol || '$';

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Sales Metrics
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
    const convertedLeads = leads.filter(l => l.status === 'Converted').length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(1) : '0';

    const totalDeals = deals.length;
    const wonDeals = deals.filter(d => d.stage === 'Closed Won').length;
    const lostDeals = deals.filter(d => d.stage === 'Closed Lost').length;
    const activeDeals = totalDeals - wonDeals - lostDeals;
    const totalDealValue = deals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const wonDealValue = deals.filter(d => d.stage === 'Closed Won').reduce((sum, d) => sum + (d.amount || 0), 0);
    const winRate = totalDeals > 0 ? (wonDeals / totalDeals * 100).toFixed(1) : '0';
    const avgDealSize = wonDeals > 0 ? (wonDealValue / wonDeals) : 0;

    // Financial Metrics
    const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
    const paidInvoices = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (i.total || 0), 0);
    const pendingInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Draft').reduce((sum, i) => sum + (i.total || 0), 0);
    const overdueInvoices = invoices.filter(i =>
      i.status !== 'Paid' && new Date(i.dueDate) < now
    ).reduce((sum, i) => sum + (i.total || 0), 0);
    const collectionRate = totalInvoiced > 0 ? (paidInvoices / totalInvoiced * 100).toFixed(1) : '0';

    const totalQuotes = quotes.length;
    const acceptedQuotes = quotes.filter(q => q.status === 'Accepted').length;
    const sentQuotes = quotes.filter(q => q.status === 'Sent').length;
    const quoteValue = quotes.reduce((sum, q) => sum + (q.total || 0), 0);
    const quoteAcceptanceRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes * 100).toFixed(1) : '0';

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const paidExpenses = expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
    const profitMargin = (paidInvoices - paidExpenses) / paidInvoices * 100 || 0;

    // Operations Metrics
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : '0';

    const activeJobs = jobs.filter(j => j.status === 'In Progress').length;
    const completedJobs = jobs.filter(j => j.status === 'Completed').length;

    // Customer Metrics
    const totalAccounts = accounts.length;
    const totalContacts = contacts.length;
    const avgContactsPerAccount = totalAccounts > 0 ? (totalContacts / totalAccounts).toFixed(1) : '0';

    // Communication Metrics
    const totalComms = communications.length;
    const emailComms = communications.filter(c => c.type === 'Email').length;
    const callComms = communications.filter(c => c.type === 'Call').length;
    const meetingComms = communications.filter(c => c.type === 'Meeting').length;

    // Pipeline stages
    const dealsByStage = deals.reduce((acc, d) => {
      acc[d.stage] = (acc[d.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const leadsBySource = leads.reduce((acc, l) => {
      const source = l.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      // Sales
      totalLeads, qualifiedLeads, convertedLeads, conversionRate,
      totalDeals, wonDeals, lostDeals, activeDeals, totalDealValue, wonDealValue, winRate, avgDealSize,

      // Financial
      totalInvoiced, paidInvoices, pendingInvoices, overdueInvoices, collectionRate,
      totalQuotes, acceptedQuotes, sentQuotes, quoteValue, quoteAcceptanceRate,
      totalExpenses, paidExpenses, profitMargin,

      // Operations
      completedTasks, totalTasks, pendingTasks, taskCompletionRate,
      activeJobs, completedJobs,

      // Customer
      totalAccounts, totalContacts, avgContactsPerAccount,

      // Communications
      totalComms, emailComms, callComms, meetingComms,

      // Breakdowns
      dealsByStage, leadsBySource
    };
  }, [leads, deals, accounts, contacts, invoices, quotes, tasks, jobs, communications, expenses, dateRange]);

  const reportSections: { [key in ReportType]: { title: string; icon: any; color: string } } = {
    sales: { title: 'Sales Performance', icon: TrendingUp, color: 'blue' },
    financial: { title: 'Financial Summary', icon: DollarSign, color: 'emerald' },
    pipeline: { title: 'Pipeline Analysis', icon: Zap, color: 'violet' },
    operations: { title: 'Operations Overview', icon: Activity, color: 'indigo' },
    customer: { title: 'Customer Insights', icon: Users, color: 'cyan' },
    marketing: { title: 'Marketing Metrics', icon: Target, color: 'amber' }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    setShowExportMenu(false);
    alert(`Exporting ${activeReport} report as ${format.toUpperCase()}...`);
  };

  const MetricCard = ({ title, value, subtitle, trend, trendUp, icon: Icon, color, onClick }: any) => (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br from-${color}-50 to-${color}-50 border border-${color}-100 p-6 rounded-[35px] ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : ''} transition-all`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon size={20} className={`text-${color}-600`} />
        <h3 className="text-sm font-black text-slate-700">{title}</h3>
      </div>
      <p className={`text-3xl font-black text-${color}-600`}>{value}</p>
      {subtitle && (
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
          {subtitle}
        </p>
      )}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          <span className="text-xs font-black">{trend}</span>
          <span className="text-[9px] text-slate-400 ml-1">vs previous</span>
        </div>
      )}
    </div>
  );

  const SimpleBarChart = ({ data, maxValue, color }: { data: { label: string; value: number }[]; maxValue: number; color: string }) => (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600">{item.label}</span>
            <span className="text-sm font-black text-slate-900">{item.amount}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-${color}-400 to-${color}-600 rounded-full transition-all duration-500`}
              style={{ width: `${maxValue > 0 ? (item.amount / maxValue * 100) : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const SimplePieChart = ({ data, total }: { data: { label: string; value: number; color: string }[]; total: number }) => (
    <div className="space-y-3">
      {data.map((item, i) => {
        const percentage = total > 0 ? ((item.amount / total) * 100).toFixed(1) : '0';
        return (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full bg-${item.color}-500`} />
              <span className="text-sm font-bold text-slate-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">{percentage}%</span>
              <span className="text-sm font-black text-slate-900">{item.amount}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-up max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none mb-1">Reports & Analytics</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Business Intelligence Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.amount as DateRange)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="ytd">Year to date</option>
          </select>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
            >
              <Download size={14} /> Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm font-bold text-slate-700"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm font-bold text-slate-700"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white border border-slate-200 rounded-[35px] p-2 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(reportSections) as ReportType[]).map(type => {
            const section = reportSections[type];
            const Icon = section.icon;
            return (
              <button
                key={type}
                onClick={() => setActiveReport(type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeReport === type
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} />
                {section.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sales Report */}
      {activeReport === 'sales' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Leads"
              value={metrics.totalLeads}
              subtitle={`${metrics.qualifiedLeads} qualified, ${metrics.convertedLeads} converted`}
              trend="+12%"
              trendUp={true}
              icon={Target}
              color="blue"
            />
            <MetricCard
              title="Conversion Rate"
              value={`${metrics.conversionRate}%`}
              subtitle="Lead to customer"
              trend="+5%"
              trendUp={true}
              icon={Percent}
              color="emerald"
            />
            <MetricCard
              title="Total Deals"
              value={metrics.totalDeals}
              subtitle={`${metrics.wonDeals} won, ${metrics.lostDeals} lost`}
              icon={Briefcase}
              color="violet"
            />
            <MetricCard
              title="Win Rate"
              value={`${metrics.winRate}%`}
              subtitle="Closed won vs total"
              trend="-2%"
              trendUp={false}
              icon={TrendingUp}
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Pipeline Value</h3>
                <Eye size={20} className="text-slate-400" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                  <span className="text-sm font-bold text-slate-600">Total Pipeline</span>
                  <span className="text-2xl font-black text-blue-600">{currencySymbol}{metrics.totalDealValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl">
                  <span className="text-sm font-bold text-slate-600">Closed Won</span>
                  <span className="text-2xl font-black text-emerald-600">{currencySymbol}{metrics.wonDealValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl">
                  <span className="text-sm font-bold text-slate-600">Avg Deal Size</span>
                  <span className="text-2xl font-black text-violet-600">{currencySymbol}{metrics.avgDealSize.toLocaleString()}</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden mt-4">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.totalDealValue > 0 ? (metrics.wonDealValue / metrics.totalDealValue * 100) : 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 text-center">
                  {metrics.totalDealValue > 0 ? ((metrics.wonDealValue / metrics.totalDealValue * 100).toFixed(1)) : '0'}% of pipeline closed
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Lead Sources</h3>
                <PieChart size={20} className="text-slate-400" />
              </div>
              <SimplePieChart
                data={Object.entries(metrics.leadsBySource).slice(0, 5).map(([source, count], i) => ({
                  label: source,
                  value: count as number,
                  color: ['blue', 'emerald', 'violet', 'amber', 'rose'][i]
                }))}
                total={metrics.totalLeads}
              />
            </div>
          </div>
        </div>
      )}

      {/* Financial Report */}
      {activeReport === 'financial' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Revenue"
              value={`${currencySymbol}${metrics.paidInvoices.toLocaleString()}`}
              subtitle="Received payments"
              trend="+18%"
              trendUp={true}
              icon={DollarSign}
              color="emerald"
            />
            <MetricCard
              title="Outstanding AR"
              value={`${currencySymbol}${metrics.pendingInvoices.toLocaleString()}`}
              subtitle="Awaiting payment"
              icon={Clock}
              color="amber"
            />
            <MetricCard
              title="Overdue"
              value={`${currencySymbol}${metrics.overdueInvoices.toLocaleString()}`}
              subtitle="Past due date"
              trend="-5%"
              trendUp={true}
              icon={AlertCircle}
              color="rose"
            />
            <MetricCard
              title="Collection Rate"
              value={`${metrics.collectionRate}%`}
              subtitle="Revenue collected"
              icon={CheckCircle2}
              color="blue"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Quote Performance</h3>
                <FileText size={20} className="text-slate-400" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Total Quotes</span>
                  <span className="text-2xl font-black text-slate-900">{metrics.totalQuotes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Accepted</span>
                  <span className="text-2xl font-black text-emerald-600">{metrics.acceptedQuotes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Quote Value</span>
                  <span className="text-2xl font-black text-blue-600">{currencySymbol}{metrics.quoteValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-violet-50 rounded-2xl mt-4">
                  <span className="text-sm font-bold text-violet-700">Acceptance Rate</span>
                  <span className="text-2xl font-black text-violet-600">{metrics.quoteAcceptanceRate}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Profitability</h3>
                <TrendingUp size={20} className="text-slate-400" />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-600 mb-1">Revenue</p>
                  <p className="text-3xl font-black text-emerald-600">{currencySymbol}{metrics.paidInvoices.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-600 mb-1">Expenses</p>
                  <p className="text-3xl font-black text-rose-600">{currencySymbol}{metrics.paidExpenses.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-600 mb-1">Net Profit</p>
                  <p className="text-3xl font-black text-blue-600">
                    {currencySymbol}{(metrics.paidInvoices - metrics.paidExpenses).toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between items-center p-4 bg-violet-50 rounded-2xl">
                  <span className="text-sm font-bold text-violet-700">Margin</span>
                  <span className="text-2xl font-black text-violet-600">{metrics.profitMargin.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Analysis */}
      {activeReport === 'pipeline' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Deals"
              value={metrics.activeDeals}
              subtitle="In pipeline"
              icon={Zap}
              color="violet"
            />
            <MetricCard
              title="Won Deals"
              value={metrics.wonDeals}
              subtitle={`${currencySymbol}${metrics.wonDealValue.toLocaleString()} value`}
              icon={CheckCircle2}
              color="emerald"
            />
            <MetricCard
              title="Lost Deals"
              value={metrics.lostDeals}
              subtitle="Closed lost"
              icon={AlertCircle}
              color="rose"
            />
            <MetricCard
              title="Win Rate"
              value={`${metrics.winRate}%`}
              subtitle="Success rate"
              icon={Target}
              color="blue"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Deals by Stage</h3>
              <BarChart3 size={20} className="text-slate-400" />
            </div>
            <SimpleBarChart
              data={Object.entries(metrics.dealsByStage).map(([stage, count]) => ({
                label: stage,
                value: count as number
              }))}
              maxValue={Math.max(...Object.amounts(metrics.dealsByStage) as number[])}
              color="violet"
            />
          </div>
        </div>
      )}

      {/* Operations Report */}
      {activeReport === 'operations' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Tasks"
              value={metrics.totalTasks}
              subtitle={`${metrics.pendingTasks} pending`}
              icon={Activity}
              color="indigo"
            />
            <MetricCard
              title="Completed"
              value={metrics.completedTasks}
              subtitle={`${metrics.taskCompletionRate}% completion rate`}
              trend="+8%"
              trendUp={true}
              icon={CheckCircle2}
              color="emerald"
            />
            <MetricCard
              title="Active Jobs"
              value={metrics.activeJobs}
              subtitle="In progress"
              icon={Briefcase}
              color="blue"
            />
            <MetricCard
              title="Completed Jobs"
              value={metrics.completedJobs}
              subtitle="Finished"
              icon={Package}
              color="violet"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Task Status</h3>
                <Activity size={20} className="text-slate-400" />
              </div>
              <SimplePieChart
                data={[
                  { label: 'Completed', value: metrics.completedTasks, color: 'emerald' },
                  { label: 'In Progress', value: metrics.totalTasks - metrics.completedTasks - metrics.pendingTasks, color: 'blue' },
                  { label: 'Pending', value: metrics.pendingTasks, color: 'amber' }
                ]}
                total={metrics.totalTasks}
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Productivity</h3>
                <TrendingUp size={20} className="text-slate-400" />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-600 mb-1">Completion Rate</p>
                  <p className="text-3xl font-black text-emerald-600">{metrics.taskCompletionRate}%</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-600 mb-1">Active Jobs</p>
                  <p className="text-3xl font-black text-blue-600">{metrics.activeJobs}</p>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                    style={{ width: `${metrics.taskCompletionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Insights */}
      {activeReport === 'customer' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Accounts"
              value={metrics.totalAccounts}
              subtitle="Active customers"
              icon={Building2}
              color="cyan"
            />
            <MetricCard
              title="Total Contacts"
              value={metrics.totalContacts}
              subtitle={`${metrics.avgContactsPerAccount} avg per account`}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Communications"
              value={metrics.totalComms}
              subtitle="Total touchpoints"
              icon={MessageSquare}
              color="violet"
            />
            <MetricCard
              title="Customer LTV"
              value="--"
              subtitle="Coming soon"
              icon={DollarSign}
              color="emerald"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Communication Channels</h3>
                <MessageSquare size={20} className="text-slate-400" />
              </div>
              <SimplePieChart
                data={[
                  { label: 'Email', value: metrics.emailComms, color: 'blue' },
                  { label: 'Calls', value: metrics.callComms, color: 'emerald' },
                  { label: 'Meetings', value: metrics.meetingComms, color: 'violet' }
                ]}
                total={metrics.totalComms}
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Customer Base</h3>
                <Users size={20} className="text-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100">
                  <p className="text-4xl font-black text-cyan-600">{metrics.totalAccounts}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-wider">Accounts</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <p className="text-4xl font-black text-blue-600">{metrics.totalContacts}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-wider">Contacts</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-violet-50 rounded-2xl">
                <p className="text-xs font-bold text-slate-600 text-center">Avg Contacts per Account</p>
                <p className="text-3xl font-black text-violet-600 text-center mt-1">{metrics.avgContactsPerAccount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Metrics */}
      {activeReport === 'marketing' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="New Leads"
              value={metrics.totalLeads}
              subtitle="This period"
              trend="+24%"
              trendUp={true}
              icon={Target}
              color="amber"
            />
            <MetricCard
              title="Qualified Rate"
              value={`${metrics.totalLeads > 0 ? (metrics.qualifiedLeads / metrics.totalLeads * 100).toFixed(1) : '0'}%`}
              subtitle={`${metrics.qualifiedLeads} qualified`}
              icon={CheckCircle2}
              color="emerald"
            />
            <MetricCard
              title="Lead to Customer"
              value={`${metrics.conversionRate}%`}
              subtitle="Conversion rate"
              icon={ArrowUpRight}
              color="blue"
            />
            <MetricCard
              title="Cost Per Lead"
              value="--"
              subtitle="Coming soon"
              icon={DollarSign}
              color="violet"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Lead Funnel</h3>
              <Target size={20} className="text-slate-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl">
                <span className="text-sm font-bold text-amber-700">Total Leads</span>
                <span className="text-2xl font-black text-amber-600">{metrics.totalLeads}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                <span className="text-sm font-bold text-blue-700">Qualified</span>
                <span className="text-2xl font-black text-blue-600">{metrics.qualifiedLeads}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                <span className="text-sm font-bold text-emerald-700">Converted</span>
                <span className="text-2xl font-black text-emerald-600">{metrics.convertedLeads}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
