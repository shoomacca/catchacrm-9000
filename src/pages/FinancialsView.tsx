import React, { useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  Plus, DollarSign, Download, TrendingUp, TrendingDown,
  FileText, RefreshCcw, CreditCard, AlertCircle,
  ArrowUpRight, Building2, Wallet, Receipt, ArrowRightLeft
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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

const FinancialsView: React.FC = () => {
  const {
    invoices, quotes, subscriptions, accounts, openModal,
    bankTransactions, expenses, salesStats
  } = useCRM();
  const navigate = useNavigate();

  const financialStats = useMemo(() => {
    // Invoice statistics
    const paidInvoices = invoices.filter(i => i.status === 'Paid');
    const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
    const draftInvoices = invoices.filter(i => i.status === 'Draft');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Quote statistics
    const pendingQuotes = quotes.filter(q => q.status === 'Sent');
    const acceptedQuotes = quotes.filter(q => q.status === 'Accepted');
    const declinedQuotes = quotes.filter(q => q.status === 'Declined');
    const totalQuotesPipeline = pendingQuotes.reduce((sum, q) => sum + q.total, 0);

    // Subscription statistics
    const activeSubscriptions = subscriptions.filter(s => s.status === 'Active');
    const pausedSubscriptions = subscriptions.filter(s => s.status === 'Paused');
    const cancelledSubscriptions = subscriptions.filter(s => s.status === 'Cancelled');
    const totalMRR = activeSubscriptions.reduce((sum, s) => {
      const subTotal = s.items.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
      if (s.billingCycle === 'Monthly') return sum + subTotal;
      if (s.billingCycle === 'Yearly') return sum + (subTotal / 12);
      return sum;
    }, 0);

    // Bank transaction statistics
    const unreconciledTransactions = bankTransactions.filter(t => !t.reconciled);
    const totalUnreconciled = unreconciledTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const inflows = bankTransactions.filter(t => t.type === 'Credit').reduce((sum, t) => sum + t.amount, 0);
    const outflows = bankTransactions.filter(t => t.type === 'Debit').reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Expense statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentExpenses = expenses.filter(e => {
      const expDate = new Date(e.date);
      return expDate >= thirtyDaysAgo;
    });
    const totalExpenses = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = expenses.filter(e => e.status === 'Pending').length;

    return {
      invoices: {
        paid: paidInvoices.length,
        overdue: overdueInvoices.length,
        draft: draftInvoices.length,
        totalRevenue,
        totalOverdue
      },
      quotes: {
        pending: pendingQuotes.length,
        accepted: acceptedQuotes.length,
        declined: declinedQuotes.length,
        totalPipeline: totalQuotesPipeline
      },
      subscriptions: {
        active: activeSubscriptions.length,
        paused: pausedSubscriptions.length,
        cancelled: cancelledSubscriptions.length,
        mrr: totalMRR,
        arr: totalMRR * 12
      },
      banking: {
        unreconciled: unreconciledTransactions.length,
        unreconciledAmount: totalUnreconciled,
        inflows,
        outflows,
        netCashFlow: inflows - outflows
      },
      expenses: {
        count: recentExpenses.length,
        total: totalExpenses,
        pending: pendingExpenses
      }
    };
  }, [invoices, quotes, subscriptions, bankTransactions, expenses]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': case 'Accepted': case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Overdue': case 'Declined': case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Draft': return 'bg-slate-50 text-slate-500 border-slate-100';
      case 'Sent': case 'Paused': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-400';
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-slide-up pb-20">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none mb-1">Financial Hub</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Revenue, Banking & Expense Management</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('quotes')}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all hover:bg-slate-800"
          >
            <FileText size={14} /> New Quote
          </button>
          <button
            onClick={() => openModal('invoices')}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700"
          >
            <Plus size={14} /> Create Invoice
          </button>
        </div>
      </div>

      {/* Primary Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Revenue"
          value={`$${financialStats.invoices.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="text-emerald-600"
          onClick={() => navigate('/financials/ledger/income')}
        />
        <MetricCard
          label="MRR"
          value={`$${financialStats.subscriptions.mrr.toLocaleString()}`}
          icon={RefreshCcw}
          color="text-blue-600"
          onClick={() => navigate('/financials/billing')}
        />
        <MetricCard
          label="Quote Pipeline"
          value={`$${financialStats.quotes.totalPipeline.toLocaleString()}`}
          icon={FileText}
          color="text-violet-600"
          onClick={() => navigate('/financials/ledger/quotes')}
        />
        <MetricCard
          label="Overdue"
          value={`$${financialStats.invoices.totalOverdue.toLocaleString()}`}
          icon={AlertCircle}
          color="text-rose-600"
          alert={financialStats.invoices.overdue > 0}
          onClick={() => navigate('/financials/ledger/income')}
        />
      </div>

      {/* Financial Modules Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <Building2 size={20} className="text-emerald-600" />
            <h3 className="text-sm font-black text-slate-700">Bank Reconciliation</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">{financialStats.banking.unreconciled}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            ${financialStats.banking.unreconciledAmount.toLocaleString()} Unmatched
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <ArrowRightLeft size={20} className="text-blue-600" />
            <h3 className="text-sm font-black text-slate-700">Cash Flow (30d)</h3>
          </div>
          <p className={`text-3xl font-black ${financialStats.banking.netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {financialStats.banking.netCashFlow >= 0 ? '+' : '-'}${Math.abs(financialStats.banking.netCashFlow).toLocaleString()}
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            In: ${financialStats.banking.inflows.toLocaleString()} • Out: ${financialStats.banking.outflows.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <Receipt size={20} className="text-amber-600" />
            <h3 className="text-sm font-black text-slate-700">Expenses (30d)</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">${financialStats.expenses.total.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {financialStats.expenses.count} Transactions • {financialStats.expenses.pending} Pending
          </p>
        </div>
      </div>

      {/* Revenue & Subscriptions Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Status */}
        <div className="bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Invoice Pipeline
            </h3>
            <Link to="/financials/ledger/income" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-[25px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-slate-700">Total Collected</span>
              <span className="text-2xl font-black text-slate-900">
                ${financialStats.invoices.totalRevenue.toLocaleString()}
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
              label="Draft"
              value={financialStats.invoices.draft}
              color="slate"
            />
          </div>

          {financialStats.invoices.overdue > 0 && (
            <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-[20px] flex items-start gap-3">
              <AlertCircle size={18} className="text-rose-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Collections Required</p>
                <p className="text-[10px] font-semibold text-slate-600 mt-1">
                  ${financialStats.invoices.totalOverdue.toLocaleString()} outstanding from {financialStats.invoices.overdue} invoices
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Revenue */}
        <div className="bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <RefreshCcw size={20} className="text-blue-600" />
              Recurring Revenue
            </h3>
            <Link to="/financials/billing" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-[25px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-slate-700">Monthly Recurring</span>
              <span className="text-2xl font-black text-slate-900">
                ${financialStats.subscriptions.mrr.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {financialStats.subscriptions.active} active subscriptions
            </p>
          </div>

          <div className="space-y-4">
            <StatusRow
              label="Active"
              value={financialStats.subscriptions.active}
              color="emerald"
            />
            <StatusRow
              label="Paused"
              value={financialStats.subscriptions.paused}
              color="amber"
            />
            <StatusRow
              label="Cancelled"
              value={financialStats.subscriptions.cancelled}
              color="slate"
            />
          </div>

          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-[20px] flex items-start gap-3">
            <TrendingUp size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">Annual Revenue Forecast</p>
              <p className="text-[10px] font-semibold text-slate-600 mt-1">
                ${financialStats.subscriptions.arr.toLocaleString()} ARR from recurring contracts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Pipeline & Banking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quote Pipeline */}
        <div className="bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <FileText size={20} className="text-violet-600" />
              Quote Pipeline
            </h3>
            <Link to="/financials/ledger/quotes" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-[25px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-slate-700">Pipeline Value</span>
              <span className="text-2xl font-black text-slate-900">
                ${financialStats.quotes.totalPipeline.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {financialStats.quotes.pending} quotes awaiting response
            </p>
          </div>

          <div className="space-y-4">
            <StatusRow
              label="Pending Response"
              value={financialStats.quotes.pending}
              color="blue"
            />
            <StatusRow
              label="Accepted"
              value={financialStats.quotes.accepted}
              color="emerald"
            />
            <StatusRow
              label="Declined"
              value={financialStats.quotes.declined}
              color="rose"
            />
          </div>
        </div>

        {/* Bank Reconciliation */}
        <div className="bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Building2 size={20} className="text-emerald-600" />
              Bank Reconciliation
            </h3>
            <Link to="/financials/bank-feed" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View Feed <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-[25px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-slate-700">Unreconciled</span>
              <span className="text-2xl font-black text-slate-900">
                {financialStats.banking.unreconciled}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              ${financialStats.banking.unreconciledAmount.toLocaleString()} needs matching
            </p>
          </div>

          <div className="space-y-4">
            <StatusRow
              label="Cash Inflows (30d)"
              value={`$${financialStats.banking.inflows.toLocaleString()}`}
              color="emerald"
            />
            <StatusRow
              label="Cash Outflows (30d)"
              value={`$${financialStats.banking.outflows.toLocaleString()}`}
              color="rose"
            />
            <StatusRow
              label="Net Cash Flow"
              value={`$${financialStats.banking.netCashFlow.toLocaleString()}`}
              color={financialStats.banking.netCashFlow >= 0 ? 'emerald' : 'rose'}
            />
          </div>

          {financialStats.banking.unreconciled > 0 && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-[20px] flex items-start gap-3">
              <Wallet size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Reconciliation Pending</p>
                <p className="text-[10px] font-semibold text-slate-600 mt-1">
                  {financialStats.banking.unreconciled} transactions need to be matched
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black flex items-center gap-2">
            <CreditCard size={20} className="text-blue-600" />
            Recent Financial Activity
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recent Invoices */}
          {invoices.slice(0, 3).map((invoice) => (
            <Link
              key={invoice.id}
              to={`/financials/ledger/income/${invoice.id}`}
              className="block group p-6 border border-slate-100 rounded-[25px] hover:border-blue-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <FileText size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {invoice.issueDate}
                  </p>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
                <p className="text-lg font-black text-slate-900">
                  ${invoice.total.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialsView;
