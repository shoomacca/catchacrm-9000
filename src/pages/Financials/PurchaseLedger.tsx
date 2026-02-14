import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Receipt, Plus, Search, AlertCircle, CheckCircle2, Clock,
  ChevronDown, DollarSign, Edit2, Trash2, Building2, Calendar,
  FileText, Download, ArrowUp, ArrowDown, ArrowUpDown, Upload,
  User, Package, TrendingDown, CreditCard
} from 'lucide-react';
import { Expense } from '../../types';
import { ExpenseComposer } from '../../components/ExpenseComposer';

type FilterStatus = 'all' | 'pending' | 'paid' | 'overdue';
type SortField = 'date' | 'vendor' | 'amount';
type SortDirection = 'asc' | 'desc';

const PurchaseLedger: React.FC = () => {
  const {
    expenses,
    accounts,
    users,
    deleteRecord,
    updateRecord,
    settings
  } = useCRM();

  const [showExpenseComposer, setShowExpenseComposer] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filter to only bills/vendor expenses (Purchase Ledger = Accounts Payable)
  const bills = useMemo(() => {
    return expenses.filter(e =>
      e.category === 'Materials' ||
      e.category === 'Subbies' ||
      e.category === 'Rent' ||
      e.category === 'Other' ||
      e.vendor
    );
  }, [expenses]);

  // Filter and sort bills
  const filteredBills = useMemo(() => {
    let filtered = [...bills];

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'overdue') {
        filtered = filtered.filter(b => b.status === 'Pending' && new Date(b.date) < new Date());
      } else {
        filtered = filtered.filter(b => b.status.toLowerCase() === filterStatus);
      }
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(b => new Date(b.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(b => new Date(b.date) <= new Date(dateTo));
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.vendor.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.amount.toString().includes(q)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortField) {
        case 'date':
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case 'vendor':
          aVal = a.vendor.toLowerCase();
          bVal = b.vendor.toLowerCase();
          break;
        case 'amount':
          aVal = a.amount;
          bVal = b.amount;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [bills, filterStatus, searchQuery, dateFrom, dateTo, sortField, sortDirection]);

  // Summary stats
  const stats = useMemo(() => {
    const pending = bills.filter(b => b.status === 'Pending');
    const paid = bills.filter(b => b.status === 'Paid');
    const overdue = bills.filter(b => b.status === 'Pending' && new Date(b.date) < new Date());

    const totalPayables = pending.reduce((sum, b) => sum + b.amount, 0);
    const overdueAmount = overdue.reduce((sum, b) => sum + b.amount, 0);
    const paidThisMonth = paid.filter(b => {
      const billDate = new Date(b.date);
      const now = new Date();
      return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
    }).reduce((sum, b) => sum + b.amount, 0);

    return {
      total: bills.length,
      pending: pending.length,
      paid: paid.length,
      overdue: overdue.length,
      totalPayables,
      overdueAmount,
      paidThisMonth
    };
  }, [bills]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredBills.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBills.map(b => b.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Vendor', 'Category', 'Amount', 'Status', 'Due Date'];
    const rows = filteredBills.map(bill => {
      return [
        new Date(bill.date).toLocaleDateString(),
        bill.vendor,
        bill.category,
        bill.amount.toString(),
        bill.status,
        new Date(bill.date).toLocaleDateString()
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.size} selected bill${selectedIds.size !== 1 ? 's' : ''}?`)) {
      selectedIds.forEach(id => deleteRecord('expenses', id));
      setSelectedIds(new Set());
      setExpandedId(null);
    }
  };

  const handleBulkMarkPaid = () => {
    selectedIds.forEach(id => updateRecord('expenses', id, { status: 'Paid' }));
    setSelectedIds(new Set());
    setExpandedId(null);
  };

  const handleMarkPaid = (bill: Expense) => {
    updateRecord('expenses', bill.id, { status: 'Paid' });
    setExpandedId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this bill?')) {
      deleteRecord('expenses', id);
      setExpandedId(null);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-slate-300" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-rose-600" />
    ) : (
      <ArrowDown size={12} className="text-rose-600" />
    );
  };

  const StatusBadge = ({ status, date }: { status: Expense['status']; date: string }) => {
    const isOverdue = status === 'Pending' && new Date(date) < new Date();

    const configs: Record<string, { bg: string; text: string; border: string; icon: any; label: string }> = {
      Paid: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: CheckCircle2, label: 'Paid' },
      Pending: isOverdue
        ? { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: AlertCircle, label: 'Overdue' }
        : { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: Clock, label: 'Pending' }
    };

    const config = configs[status] || configs.Pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${config.bg} ${config.text} ${config.border}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const currencySymbol = settings?.localization?.currencySymbol || '$';

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-slide-up pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none mb-1">Purchase Ledger</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Accounts Payable & Vendor Bills</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => { setEditingExpense({ category: 'Materials' }); setShowExpenseComposer(true); }}
            className="flex items-center gap-2 px-5 py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20"
          >
            <Plus size={14} /> New Bill
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard size={20} className="text-rose-600" />
            <h3 className="text-sm font-black text-slate-700">Total Payables</h3>
          </div>
          <p className="text-3xl font-black text-rose-600">{currencySymbol}{stats.totalPayables.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {stats.pending} bills pending payment
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle size={20} className="text-orange-600" />
            <h3 className="text-sm font-black text-slate-700">Overdue</h3>
          </div>
          <p className="text-3xl font-black text-orange-600">{stats.overdue}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {currencySymbol}{stats.overdueAmount.toLocaleString()} past due
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <h3 className="text-sm font-black text-slate-700">Paid This Month</h3>
          </div>
          <p className="text-3xl font-black text-emerald-600">{currencySymbol}{stats.paidThisMonth.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {stats.paid} bills paid
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <Package size={20} className="text-blue-600" />
            <h3 className="text-sm font-black text-slate-700">Total Bills</h3>
          </div>
          <p className="text-3xl font-black text-blue-600">{stats.total}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            All time records
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 p-6 rounded-[35px] shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Status Filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'overdue', 'paid'] as FilterStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterStatus === status
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'all' ? `All (${stats.total})` :
                   status === 'pending' ? `Pending (${stats.pending})` :
                   status === 'overdue' ? `Overdue (${stats.overdue})` :
                   `Paid (${stats.paid})`}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search bills..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="flex gap-3 items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Range:</span>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="From"
              />
              <span className="text-slate-400">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="To"
              />
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-gradient-to-r from-rose-600 to-red-600 border border-rose-700 p-4 rounded-[25px] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            <span className="text-white font-black">
              {selectedIds.size} bill{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkMarkPaid}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all backdrop-blur-sm"
            >
              <CheckCircle2 size={14} /> Mark Paid
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-rose-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-900 transition-all"
            >
              <Trash2 size={14} /> Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all backdrop-blur-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Bills Table */}
      <div className="bg-white border border-slate-200 rounded-[45px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                <th className="px-6 py-5">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredBills.length && filteredBills.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] cursor-pointer hover:text-rose-600 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    <SortIcon field="date" />
                  </div>
                </th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] cursor-pointer hover:text-rose-600 transition-colors"
                  onClick={() => handleSort('vendor')}
                >
                  <div className="flex items-center gap-2">
                    Vendor
                    <SortIcon field="vendor" />
                  </div>
                </th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Category</th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] text-right cursor-pointer hover:text-rose-600 transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Amount
                    <SortIcon field="amount" />
                  </div>
                </th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Status</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map(bill => {
                const isExpanded = expandedId === bill.id;
                const isOverdue = bill.status === 'Pending' && new Date(bill.date) < new Date();

                return (
                  <React.Fragment key={bill.id}>
                    <tr
                      className={`hover:bg-slate-50 transition-all ${isExpanded ? 'bg-rose-50/30' : ''} ${selectedIds.has(bill.id) ? 'bg-rose-50/20' : ''}`}
                    >
                      <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(bill.id)}
                          onChange={() => handleSelectOne(bill.id)}
                          className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : bill.id)}>
                        <span className={`font-bold text-sm ${isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>
                          {new Date(bill.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : bill.id)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <Building2 size={14} className="text-slate-500" />
                          </div>
                          <span className="font-black text-slate-900">{bill.vendor}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : bill.id)}>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border bg-slate-50 text-slate-600 border-slate-200">
                          {bill.category}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : bill.id)}>
                        <span className="font-black text-lg text-slate-900">
                          {currencySymbol}{bill.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : bill.id)}>
                        <StatusBadge status={bill.status} date={bill.date} />
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); setEditingExpense(bill); setShowExpenseComposer(true); }}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform cursor-pointer ${isExpanded ? 'rotate-180' : ''}`}
                            onClick={() => setExpandedId(isExpanded ? null : bill.id)}
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="px-8 py-0">
                          <div className="py-6 border-b border-slate-200">
                            <div className="bg-gradient-to-br from-slate-50 to-rose-50/30 rounded-[25px] p-6 border border-slate-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                {/* Vendor Details */}
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vendor</p>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                      <Building2 size={18} className="text-slate-600" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900">{bill.vendor}</p>
                                      <p className="text-xs text-slate-500">{bill.category}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Date Info */}
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bill Date</p>
                                  <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span className="text-sm text-slate-600">{new Date(bill.date).toLocaleDateString()}</span>
                                  </div>
                                  {isOverdue && (
                                    <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1">
                                      <AlertCircle size={12} />
                                      Overdue
                                    </p>
                                  )}
                                </div>

                                {/* Amount */}
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Amount Due</p>
                                  <p className="text-2xl font-black text-rose-600">
                                    {currencySymbol}{bill.amount.toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {/* Receipt */}
                              {bill.receiptUrl && (
                                <div className="mb-6">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice/Receipt</p>
                                  <a
                                    href={bill.receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all"
                                  >
                                    <FileText size={14} />
                                    View Document
                                  </a>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-3 flex-wrap">
                                {bill.status === 'Pending' && (
                                  <button
                                    onClick={() => handleMarkPaid(bill)}
                                    className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                                  >
                                    <CheckCircle2 size={14} /> Mark as Paid
                                  </button>
                                )}
                                <button
                                  onClick={() => { setEditingExpense(bill); setShowExpenseComposer(true); }}
                                  className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(bill.id)}
                                  className="flex items-center gap-2 px-5 py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Receipt size={48} className="text-slate-200" />
                      <p className="text-slate-400 font-black uppercase text-xs">No bills found</p>
                      <p className="text-slate-300 text-sm">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overdue Alert */}
      {stats.overdue > 0 && (
        <div className="bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 p-6 rounded-[35px] flex items-start gap-4">
          <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertCircle size={24} className="text-rose-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 mb-1">Overdue Bills</h3>
            <p className="text-sm text-slate-600">
              You have {stats.overdue} bill{stats.overdue !== 1 ? 's' : ''} totaling{' '}
              <span className="font-bold text-rose-600">{currencySymbol}{stats.overdueAmount.toLocaleString()}</span>{' '}
              past their due date.
            </p>
          </div>
        </div>
      )}

      {/* Expense Composer Modal */}
      <ExpenseComposer
        isOpen={showExpenseComposer}
        onClose={() => {
          setShowExpenseComposer(false);
          setEditingExpense(null);
        }}
        initialData={editingExpense || undefined}
        mode={editingExpense ? 'edit' : 'create'}
      />
    </div>
  );
};

export default PurchaseLedger;
