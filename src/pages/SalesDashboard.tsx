import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp, Briefcase, Target, DollarSign,
  ArrowUpRight, ArrowDownRight, Activity, Calendar,
  FileText, CreditCard, RefreshCw, AlertCircle, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useCRM } from '../context/CRMContext';
import { formatCurrency } from '../utils/formatters';

const MetricCard = ({ label, value, icon: Icon, color, alert, onClick }: any) => (
  <div
    onClick={onClick}
    className={`bg-white border ${alert ? 'border-amber-300 shadow-amber-100' : 'border-slate-200'} p-8 rounded-[35px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group`}
  >
    {alert && (
      <div className="absolute top-3 right-3">
        <AlertCircle size={16} className="text-amber-500" />
      </div>
    )}
    <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon size={24} className={color} />
    </div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-900">{value}</p>
  </div>
);

const StatusRow = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full bg-${color}-500`} />
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </div>
    <span className="text-lg font-black text-slate-900">{value}</span>
  </div>
);

const SalesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    salesStats, leads, deals, invoices, quotes, subscriptions, expenses, settings, dataSource
  } = useCRM();

  const financialStats = useMemo(() => {
    // Invoices stats
    const paidInvoices = invoices.filter(i => i.status === 'Paid');
    const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Quotes stats
    const pendingQuotes = quotes.filter(q => q.status === 'Sent').length;
    const acceptedQuotes = quotes.filter(q => q.status === 'Accepted').length;
    const totalQuotesValue = quotes
      .filter(q => q.status === 'Sent' || q.status === 'Accepted')
      .reduce((sum, q) => sum + q.total, 0);

    // Subscriptions stats
    const activeSubscriptions = subscriptions.filter(s => s.status === 'Active');
    const monthlyRecurring = activeSubscriptions
      .filter(s => s.billingCycle === 'Monthly')
      .reduce((sum, s) => sum + s.items.reduce((acc, item) => acc + item.qty * item.unitPrice, 0), 0);
    const totalMRR = activeSubscriptions.reduce((sum, s) => {
      const subTotal = s.items.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
      if (s.billingCycle === 'Monthly') return sum + subTotal;
      if (s.billingCycle === 'Yearly') return sum + (subTotal / 12);
      return sum;
    }, 0);

    // Expenses (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentExpenses = expenses.filter(e => {
      const expDate = new Date(e.date);
      return expDate >= thirtyDaysAgo;
    });
    const totalExpenses = recentExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      invoices: {
        paid: paidInvoices.length,
        overdue: overdueInvoices.length,
        totalPaid,
        totalOverdue
      },
      quotes: {
        pending: pendingQuotes,
        accepted: acceptedQuotes,
        totalValue: totalQuotesValue
      },
      subscriptions: {
        active: activeSubscriptions.length,
        mrr: totalMRR,
        monthlyOnly: monthlyRecurring
      },
      expenses: {
        count: recentExpenses.length,
        total: totalExpenses
      }
    };
  }, [invoices, quotes, subscriptions, expenses]);

  const formattedPipeline = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(salesStats.pipelineValue);
  const formattedWeighted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(salesStats.weightedValue);

  const stageData = [
    { name: 'Discovery', value: deals.filter(d => d.stage === 'Discovery').length },
    { name: 'Proposal', value: deals.filter(d => d.stage === 'Proposal').length },
    { name: 'Negotiation', value: deals.filter(d => d.stage === 'Negotiation').length },
    { name: 'Won', value: deals.filter(d => d.stage === 'Closed Won').length },
  ];

  if (dataSource === 'loading') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none mb-1">Sales Hub</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Live Revenue Control Center</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/calendar')}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Calendar size={14} /> Schedule View
          </button>
        </div>
      </div>

      {/* Primary Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Pipeline Value"
          value={formattedPipeline}
          icon={TrendingUp}
          color="text-blue-600"
          onClick={() => navigate('/deals')}
        />
        <MetricCard
          label="Active Deals"
          value={salesStats.activeDealsCount}
          icon={Briefcase}
          color="text-violet-600"
          onClick={() => navigate('/deals')}
        />
        <MetricCard
          label="Qualified Leads"
          value={leads.filter(l => l.status === 'Qualified').length}
          icon={Target}
          color="text-pink-600"
          onClick={() => navigate('/leads')}
        />
        <MetricCard
          label="Weighted Forecast"
          value={formattedWeighted}
          icon={DollarSign}
          color="text-amber-500"
          onClick={() => navigate('/deals')}
        />
      </div>

      {/* Financial Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard size={20} className="text-emerald-600" />
            <h3 className="text-sm font-black text-slate-700">MRR</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {formatCurrency(financialStats.subscriptions.mrr, settings)}
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {financialStats.subscriptions.active} Active Subscriptions
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={20} className="text-blue-600" />
            <h3 className="text-sm font-black text-slate-700">Quotes Pending</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">{financialStats.quotes.pending}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {formatCurrency(financialStats.quotes.totalValue, settings)} Total Value
          </p>
        </div>

        <div className={`bg-gradient-to-br ${financialStats.invoices.overdue > 0 ? 'from-amber-50 to-orange-50 border-amber-200' : 'from-slate-50 to-gray-50 border-slate-100'} border p-6 rounded-[35px]`}>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle size={20} className={financialStats.invoices.overdue > 0 ? 'text-amber-600' : 'text-slate-600'} />
            <h3 className="text-sm font-black text-slate-700">Overdue Invoices</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">{financialStats.invoices.overdue}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {formatCurrency(financialStats.invoices.totalOverdue, settings)} Outstanding
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Activity size={24} className="text-blue-600" />
              Deal Distribution by Stage
            </h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} dy={15} />
                <YAxis stroke="#64748b" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} dx={-15} />
                <Tooltip
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'black', fontSize: '10px', color: '#1e293b' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} onClick={() => navigate('/deals')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm flex flex-col items-center">
          <h3 className="text-xl font-black mb-10 self-start">Historical Win Rate</h3>
          <div className="h-[250px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Won', value: salesStats.winRate || 1 },
                    { name: 'Loss/Other', value: (100 - salesStats.winRate) || 99 },
                  ]}
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#f1f5f9" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CONVERSION</p>
              <p className="text-5xl font-black text-slate-900 tracking-tighter">{Math.round(salesStats.winRate)}%</p>
            </div>
          </div>
          <div className="mt-10 space-y-4 w-full">
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              Calculated based on real outcome data across all historical closed records.
            </p>
            <button
              onClick={() => navigate('/deals')}
              className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[25px] text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all tracking-widest"
            >
              Audit Pipeline Quality
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Status */}
        <div className="bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Invoice Status
            </h3>
            <Link to="/invoices" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-[25px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-slate-700">Total Collected</span>
              <span className="text-2xl font-black text-slate-900">
                ${financialStats.invoices.totalPaid}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {financialStats.invoices.paid} paid invoices
            </p>
          </div>

          <div className="space-y-4">
            <StatusRow
              label="Paid Invoices"
              value={financialStats.invoices.paid}
              color="emerald"
            />
            <StatusRow
              label="Overdue"
              value={financialStats.invoices.overdue}
              color="rose"
            />
            <StatusRow
              label="Outstanding Amount"
              value={formatCurrency(financialStats.invoices.totalOverdue, settings)}
              color="amber"
            />
          </div>

          {financialStats.invoices.overdue > 0 && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-[20px] flex items-start gap-3">
              <Clock size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Collections Required</p>
                <p className="text-[10px] font-semibold text-slate-600 mt-1">
                  {financialStats.invoices.overdue} invoices past due
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Revenue */}
        <div className="bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <RefreshCw size={20} className="text-emerald-600" />
              Recurring Revenue
            </h3>
            <Link to="/subscriptions" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-[25px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-slate-700">Monthly Recurring</span>
              <span className="text-2xl font-black text-slate-900">
                ${financialStats.subscriptions.mrr}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {financialStats.subscriptions.active} active subscriptions
            </p>
          </div>

          <div className="space-y-4">
            <StatusRow
              label="Active Subscriptions"
              value={financialStats.subscriptions.active}
              color="emerald"
            />
            <StatusRow
              label="Annual MRR"
              value={formatCurrency(financialStats.subscriptions.mrr * 12, settings)}
              color="blue"
            />
            <StatusRow
              label="Pending Quotes"
              value={financialStats.quotes.pending}
              color="amber"
            />
          </div>

          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-[20px] flex items-start gap-3">
            <TrendingUp size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">Predictable Revenue</p>
              <p className="text-[10px] font-semibold text-slate-600 mt-1">
                ${(financialStats.subscriptions.mrr * 12)} ARR locked in
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Deals Section */}
      <div className="bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black flex items-center gap-2">
            <Briefcase size={20} className="text-violet-600" />
            High-Value Opportunities
          </h3>
          <Link to="/deals" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View Pipeline <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals
            .filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost' && d.amount != null)
            .sort((a, b) => (b.amount || 0) - (a.amount || 0))
            .slice(0, 6)
            .map((deal) => (
              <Link
                key={deal.id}
                to={`/deals/${deal.id}`}
                className="block group p-6 border border-slate-100 rounded-[25px] hover:border-blue-200 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                      {deal.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {deal.stage}
                    </p>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-black text-slate-900">
                      ${(deal.amount || 0)}
                    </p>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1">
                      {deal.probability || 0}% prob
                    </p>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
