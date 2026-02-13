import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  DollarSign, RefreshCcw, Clock, ArrowUpRight, FileText,
  TrendingUp, CreditCard, AlertCircle, Building2, Wallet,
  Receipt, ArrowRightLeft, Plus, ChevronDown, Calendar, Mail, User
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

const FinancialHub: React.FC = () => {
  const {
    invoices, quotes, subscriptions, accounts, openModal,
    bankTransactions, expenses, financialStats, dataSource
  } = useCRM();
  const navigate = useNavigate();
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);

  // Close expanded invoice when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedRef.current && !expandedRef.current.contains(event.target as Node)) {
        setExpandedInvoiceId(null);
      }
    };

    if (expandedInvoiceId) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [expandedInvoiceId]);

  const enhancedFinancialStats = useMemo(() => {
    // Invoice statistics
    const paidInvoices = invoices.filter(i => i.status === 'Paid');
    const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
    const draftInvoices = invoices.filter(i => i.status === 'Draft');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Quote statistics
    const pendingQuotes = quotes.filter(q => q.status === 'Sent');
    const acceptedQuotes = quotes.filter(q => q.status === 'Accepted');
    const totalQuotesPipeline = pendingQuotes.reduce((sum, q) => sum + q.total, 0);

    // Subscription statistics
    const activeSubscriptions = subscriptions.filter(s => s.status === 'Active');
    const pausedSubscriptions = subscriptions.filter(s => s.status === 'Paused');
    const totalMRR = activeSubscriptions.reduce((sum, s) => {
      const subTotal = (s.items || []).reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
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
        totalPipeline: totalQuotesPipeline
      },
      subscriptions: {
        active: activeSubscriptions.length,
        paused: pausedSubscriptions.length,
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

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);

  if (dataSource === 'loading') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-slide-up pb-20">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none mb-1">Finance Pulse</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Revenue, Banking & Expense Analytics</p>
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
          value={`$${enhancedFinancialStats.invoices.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="text-emerald-600"
          onClick={() => navigate('/financials/ledger/income')}
        />
        <MetricCard
          label="MRR"
          value={`$${Math.round(enhancedFinancialStats.subscriptions.mrr).toLocaleString()}`}
          icon={RefreshCcw}
          color="text-blue-600"
          onClick={() => navigate('/financials/billing')}
        />
        <MetricCard
          label="Quote Pipeline"
          value={`$${enhancedFinancialStats.quotes.totalPipeline.toLocaleString()}`}
          icon={FileText}
          color="text-violet-600"
          onClick={() => navigate('/financials/ledger/quotes')}
        />
        <MetricCard
          label="Overdue"
          value={`$${enhancedFinancialStats.invoices.totalOverdue.toLocaleString()}`}
          icon={AlertCircle}
          color="text-rose-600"
          alert={enhancedFinancialStats.invoices.overdue > 0}
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
          <p className="text-3xl font-black text-slate-900">{enhancedFinancialStats.banking.unreconciled}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            ${enhancedFinancialStats.banking.unreconciledAmount.toLocaleString()} Unmatched
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <ArrowRightLeft size={20} className="text-blue-600" />
            <h3 className="text-sm font-black text-slate-700">Cash Flow (30d)</h3>
          </div>
          <p className={`text-3xl font-black ${enhancedFinancialStats.banking.netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {enhancedFinancialStats.banking.netCashFlow >= 0 ? '+' : '-'}${Math.abs(enhancedFinancialStats.banking.netCashFlow).toLocaleString()}
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            In: ${enhancedFinancialStats.banking.inflows.toLocaleString()} • Out: ${enhancedFinancialStats.banking.outflows.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <Receipt size={20} className="text-amber-600" />
            <h3 className="text-sm font-black text-slate-700">Expenses (30d)</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">${enhancedFinancialStats.expenses.total.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {enhancedFinancialStats.expenses.count} Transactions • {enhancedFinancialStats.expenses.pending} Pending
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
                ${enhancedFinancialStats.invoices.totalRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {enhancedFinancialStats.invoices.paid} paid invoices
            </p>
          </div>

          <div className="space-y-4">
            <StatusRow
              label="Paid Invoices"
              value={enhancedFinancialStats.invoices.paid}
              color="emerald"
            />
            <StatusRow
              label="Overdue"
              value={enhancedFinancialStats.invoices.overdue}
              color="rose"
            />
            <StatusRow
              label="Draft"
              value={enhancedFinancialStats.invoices.draft}
              color="slate"
            />
          </div>

          {enhancedFinancialStats.invoices.overdue > 0 && (
            <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-[20px] flex items-start gap-3">
              <AlertCircle size={18} className="text-rose-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Collections Required</p>
                <p className="text-[10px] font-semibold text-slate-600 mt-1">
                  ${enhancedFinancialStats.invoices.totalOverdue.toLocaleString()} outstanding from {enhancedFinancialStats.invoices.overdue} invoices
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
                ${Math.round(enhancedFinancialStats.subscriptions.mrr).toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {enhancedFinancialStats.subscriptions.active} active subscriptions
            </p>
          </div>

          <div className="space-y-4">
            <StatusRow
              label="Active"
              value={enhancedFinancialStats.subscriptions.active}
              color="emerald"
            />
            <StatusRow
              label="Paused"
              value={enhancedFinancialStats.subscriptions.paused}
              color="amber"
            />
            <StatusRow
              label="Annual Run Rate"
              value={`$${Math.round(enhancedFinancialStats.subscriptions.arr).toLocaleString()}`}
              color="blue"
            />
          </div>

          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-[20px] flex items-start gap-3">
            <TrendingUp size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">Predictable Revenue</p>
              <p className="text-[10px] font-semibold text-slate-600 mt-1">
                ${Math.round(enhancedFinancialStats.subscriptions.arr).toLocaleString()} ARR from recurring contracts
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
                ${enhancedFinancialStats.quotes.totalPipeline.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {enhancedFinancialStats.quotes.pending} quotes awaiting response
            </p>
          </div>

          <div className="space-y-4">
            <StatusRow
              label="Pending Response"
              value={enhancedFinancialStats.quotes.pending}
              color="blue"
            />
            <StatusRow
              label="Accepted"
              value={enhancedFinancialStats.quotes.accepted}
              color="emerald"
            />
            <StatusRow
              label="Total Value"
              value={`$${enhancedFinancialStats.quotes.totalPipeline.toLocaleString()}`}
              color="violet"
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
                {enhancedFinancialStats.banking.unreconciled}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              ${enhancedFinancialStats.banking.unreconciledAmount.toLocaleString()} needs matching
            </p>
          </div>

          <div className="space-y-4">
            <StatusRow
              label="Cash Inflows (30d)"
              value={`$${enhancedFinancialStats.banking.inflows.toLocaleString()}`}
              color="emerald"
            />
            <StatusRow
              label="Cash Outflows (30d)"
              value={`$${enhancedFinancialStats.banking.outflows.toLocaleString()}`}
              color="rose"
            />
            <StatusRow
              label="Net Cash Flow"
              value={`$${enhancedFinancialStats.banking.netCashFlow.toLocaleString()}`}
              color={enhancedFinancialStats.banking.netCashFlow >= 0 ? 'emerald' : 'rose'}
            />
          </div>

          {enhancedFinancialStats.banking.unreconciled > 0 && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-[20px] flex items-start gap-3">
              <Wallet size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Reconciliation Pending</p>
                <p className="text-[10px] font-semibold text-slate-600 mt-1">
                  {enhancedFinancialStats.banking.unreconciled} transactions need to be matched
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transaction Activity */}
      <div className="bg-white border border-slate-200 p-10 rounded-[45px] shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black flex items-center gap-2">
            <CreditCard size={20} className="text-blue-600" />
            Recent Invoice Activity
          </h3>
          <Link to="/financials/ledger/income" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/20 text-slate-400 border-b border-slate-100">
                <th className="px-8 py-4 font-black uppercase tracking-widest text-[9px]">Invoice</th>
                <th className="px-8 py-4 font-black uppercase tracking-widest text-[9px]">Account</th>
                <th className="px-8 py-4 font-black uppercase tracking-widest text-[9px]">Date</th>
                <th className="px-8 py-4 font-black uppercase tracking-widest text-[9px]">Status</th>
                <th className="px-8 py-4 font-black uppercase tracking-widest text-[9px] text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInvoices.map(inv => {
                const isExpanded = expandedInvoiceId === inv.id;
                const account = accounts.find(a => a.id === inv.accountId);
                return (
                  <React.Fragment key={inv.id}>
                    <tr
                      className={`hover:bg-slate-50 transition-all cursor-pointer group ${isExpanded ? 'bg-blue-50/50' : ''}`}
                      onClick={() => setExpandedInvoiceId(isExpanded ? null : inv.id)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-slate-400" />
                          <span className="font-black text-slate-900 text-sm">{inv.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-600">
                        {account?.name}
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-600">{inv.issueDate}</td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : inv.status === 'Overdue'
                              ? 'bg-rose-50 text-rose-600 border-rose-100'
                              : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-black text-slate-900">${inv.total.toLocaleString()}</span>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="px-8 py-0">
                          <div ref={expandedRef} className="py-6 border-b border-slate-200">
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-[25px] p-6 border border-slate-200">
                              {/* Invoice Details Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account</p>
                                  <div className="flex items-center gap-2">
                                    <Building2 size={14} className="text-blue-600" />
                                    <span className="font-bold text-slate-900">{account?.name || 'N/A'}</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                                  <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-emerald-600" />
                                    <span className="font-bold text-slate-900">{inv.issueDate}</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                                  <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-amber-600" />
                                    <span className="font-bold text-slate-900">{inv.dueDate}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Line Items */}
                              {inv.lineItems && inv.lineItems.length > 0 && (
                                <div className="mb-6">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Line Items</p>
                                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    {inv.lineItems.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center px-4 py-3 border-b border-slate-100 last:border-0">
                                        <div>
                                          <span className="font-bold text-slate-900">{item.description}</span>
                                          <span className="text-xs text-slate-400 ml-2">× {item.qty}</span>
                                        </div>
                                        <span className="font-black text-slate-900">${(item.qty * item.unitPrice).toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Summary & Actions */}
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="bg-slate-100 px-4 py-2 rounded-xl">
                                    <span className="text-[10px] font-black text-slate-500 uppercase">Subtotal:</span>
                                    <span className="ml-2 font-black text-slate-900">${inv.subtotal?.toLocaleString() || inv.total.toLocaleString()}</span>
                                  </div>
                                  {inv.taxTotal > 0 && (
                                    <div className="bg-slate-100 px-4 py-2 rounded-xl">
                                      <span className="text-[10px] font-black text-slate-500 uppercase">Tax:</span>
                                      <span className="ml-2 font-black text-slate-900">${inv.taxTotal.toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div className="bg-emerald-100 px-4 py-2 rounded-xl">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase">Total:</span>
                                    <span className="ml-2 font-black text-emerald-700">${inv.total.toLocaleString()}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openModal('invoices', inv);
                                    }}
                                    className="px-5 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                                  >
                                    Edit Invoice
                                  </button>
                                  {inv.status !== 'Paid' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Would mark as paid in real app
                                        alert('Mark as paid functionality coming soon!');
                                      }}
                                      className="px-5 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                                    >
                                      Mark Paid
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {recentInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-300 font-black uppercase text-xs">
                    No recent invoices
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialHub;
