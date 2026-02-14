import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Receipt, Plus, Search, AlertCircle, CheckCircle2, Clock,
  ChevronDown, DollarSign, Edit2, Trash2, Building2, Calendar,
  Fuel, Wrench, Home, Box, Tag, User, ExternalLink, Download,
  ArrowUp, ArrowDown, ArrowUpDown, Upload, BarChart3
} from 'lucide-react';
import { Expense } from '../../types';
import { ExpenseComposer } from '../../components/ExpenseComposer';

type FilterStatus = 'all' | 'pending' | 'paid';
type FilterCategory = 'all' | 'Materials' | 'Fuel' | 'Subbies' | 'Rent' | 'Other';
type SortField = 'date' | 'vendor' | 'amount';
type SortDirection = 'asc' | 'desc';

const ExpensesList: React.FC = () => {
  const {
    expenses,
    users,
    openModal,
    deleteRecord,
    updateRecord,
    settings
  } = useCRM();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showCategoryChart, setShowCategoryChart] = useState(false);
  const [showExpenseComposer, setShowExpenseComposer] = useState(false);

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(exp => exp.status.toLowerCase() === filterStatus);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(exp => exp.category === filterCategory);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(exp => new Date(exp.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(exp => new Date(exp.date) <= new Date(dateTo));
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(exp =>
        exp.vendor.toLowerCase().includes(q) ||
        exp.category.toLowerCase().includes(q) ||
        exp.amount.toString().includes(q)
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
  }, [expenses, filterStatus, filterCategory, searchQuery, dateFrom, dateTo, sortField, sortDirection]);

  // Summary stats
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentExpenses = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo);
    const pending = expenses.filter(e => e.status === 'Pending');
    const paid = expenses.filter(e => e.status === 'Paid');

    const totalAmount = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingAmount = pending.reduce((sum, e) => sum + e.amount, 0);
    const paidAmount = paid.filter(e => new Date(e.date) >= thirtyDaysAgo).reduce((sum, e) => sum + e.amount, 0);

    // Category breakdown
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

    return {
      total: expenses.length,
      pending: pending.length,
      paid: paid.length,
      totalAmount,
      pendingAmount,
      paidAmount,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      byCategory
    };
  }, [expenses]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredExpenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredExpenses.map(e => e.id)));
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
    const headers = ['Date', 'Vendor', 'Category', 'Amount', 'Status', 'Approved By'];
    const rows = filteredExpenses.map(exp => {
      const approver = exp.approvedBy ? users.find(u => u.id === exp.approvedBy)?.name || 'N/A' : 'N/A';
      return [
        new Date(exp.date).toLocaleDateString(),
        exp.vendor,
        exp.category,
        exp.amount.toString(),
        exp.status,
        approver
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.size} selected expense${selectedIds.size !== 1 ? 's' : ''}?`)) {
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

  const handleMarkPaid = (expense: Expense) => {
    updateRecord('expenses', expense.id, { status: 'Paid' });
    setExpandedId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteRecord('expenses', id);
      setExpandedId(null);
    }
  };

  const handleReceiptUpload = (expenseId: string, file: File) => {
    // In a real app, upload to storage and get URL
    const fakeUrl = URL.createObjectURL(file);
    updateRecord('expenses', expenseId, { receiptUrl: fakeUrl });
    alert('Receipt uploaded successfully!');
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      Materials: Wrench,
      Fuel: Fuel,
      Subbies: Building2,
      Rent: Home,
      Other: Box
    };
    return icons[category] || Box;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      Materials: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      Fuel: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
      Subbies: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
      Rent: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
      Other: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' }
    };
    return colors[category] || colors.Other;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-slate-300" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-amber-600" />
    ) : (
      <ArrowDown size={12} className="text-amber-600" />
    );
  };

  const StatusBadge = ({ status }: { status: Expense['status'] }) => {
    const configs: Record<string, { bg: string; text: string; border: string; icon: any; label: string }> = {
      Paid: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: CheckCircle2, label: 'Paid' },
      Pending: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: Clock, label: 'Pending' }
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

  const CategoryBadge = ({ category }: { category: string }) => {
    const Icon = getCategoryIcon(category);
    const colors = getCategoryColor(category);

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${colors.bg} ${colors.text} ${colors.border}`}>
        <Icon size={12} />
        {category}
      </span>
    );
  };

  const currencySymbol = settings?.localization?.currencySymbol || '$';

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Management</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Expenses</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => setShowCategoryChart(!showCategoryChart)}
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            <BarChart3 size={14} /> {showCategoryChart ? 'Hide' : 'Show'} Chart
          </button>
          <button
            onClick={() => setShowExpenseComposer(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-orange-700 hover:to-red-700 transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus size={14} /> New Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={20} className="text-amber-600" />
            <h3 className="text-sm font-black text-slate-700">Total Expenses</h3>
          </div>
          <p className="text-3xl font-black text-amber-600">{currencySymbol}{stats.totalAmount.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            Last 30 days
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={20} className="text-blue-600" />
            <h3 className="text-sm font-black text-slate-700">Pending</h3>
          </div>
          <p className="text-3xl font-black text-blue-600">{stats.pending}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {currencySymbol}{stats.pendingAmount.toLocaleString()} awaiting payment
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <h3 className="text-sm font-black text-slate-700">Paid</h3>
          </div>
          <p className="text-3xl font-black text-emerald-600">{currencySymbol}{stats.paidAmount.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {stats.paid} expenses this month
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <Tag size={20} className="text-slate-600" />
            <h3 className="text-sm font-black text-slate-700">Top Category</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {stats.topCategory ? stats.topCategory.name : '-'}
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {stats.topCategory ? `${currencySymbol}${stats.topCategory.amount.toLocaleString()}` : 'No expenses'}
          </p>
        </div>
      </div>

      {/* Category Breakdown Chart */}
      {showCategoryChart && (
        <div className="bg-white border border-slate-200 p-8 rounded-[35px] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={20} className="text-amber-600" />
            <h2 className="text-lg font-black text-slate-900">Spending by Category</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => {
                const percentage = (amount / stats.totalAmount) * 100;
                const Icon = getCategoryIcon(category);
                const colors = getCategoryColor(category);

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                          <Icon size={14} className={colors.text} />
                        </div>
                        <span className="font-bold text-slate-900">{category}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500 font-medium">{percentage.toFixed(1)}%</span>
                        <span className="font-black text-slate-900">{currencySymbol}{amount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${colors.bg.replace('bg-', 'bg-gradient-to-r from-').replace('-50', '-200')} to-${colors.bg.split('-')[1]}-400 transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Status Filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'paid'] as FilterStatus[]).map(status => (
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
                   `Paid (${stats.paid})`}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="From"
              />
              <span className="text-slate-400">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
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

          {/* Category Quick Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'Materials', 'Fuel', 'Subbies', 'Rent', 'Other'] as FilterCategory[]).map(cat => {
              const Icon = cat === 'all' ? Tag : getCategoryIcon(cat);
              const isActive = filterCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-amber-100 text-amber-700 border border-amber-300'
                      : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={12} />
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 border border-amber-700 p-4 rounded-[25px] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            <span className="text-white font-black">
              {selectedIds.size} expense{selectedIds.size !== 1 ? 's' : ''} selected
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
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all"
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

      {/* Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-[25px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                <th className="px-6 py-5">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredExpenses.length && filteredExpenses.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                </th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] cursor-pointer hover:text-amber-600 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    <SortIcon field="date" />
                  </div>
                </th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] cursor-pointer hover:text-amber-600 transition-colors"
                  onClick={() => handleSort('vendor')}
                >
                  <div className="flex items-center gap-2">
                    Vendor
                    <SortIcon field="vendor" />
                  </div>
                </th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Category</th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] text-right cursor-pointer hover:text-amber-600 transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Amount
                    <SortIcon field="amount" />
                  </div>
                </th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Status</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Approved By</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(expense => {
                const isExpanded = expandedId === expense.id;
                const approver = expense.approvedBy ? users.find(u => u.id === expense.approvedBy) : null;
                const CategoryIcon = getCategoryIcon(expense.category);
                const categoryColors = getCategoryColor(expense.category);

                return (
                  <React.Fragment key={expense.id}>
                    <tr
                      className={`hover:bg-slate-50 transition-all ${isExpanded ? 'bg-amber-50/30' : ''} ${selectedIds.has(expense.id) ? 'bg-amber-50/20' : ''}`}
                    >
                      <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(expense.id)}
                          onChange={() => handleSelectOne(expense.id)}
                          className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : expense.id)}>
                        <span className="font-bold text-slate-900 text-sm">
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : expense.id)}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${categoryColors.bg} flex items-center justify-center`}>
                            <CategoryIcon size={14} className={categoryColors.text} />
                          </div>
                          <span className="font-black text-slate-900">{expense.vendor}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : expense.id)}>
                        <CategoryBadge category={expense.category} />
                      </td>
                      <td className="px-8 py-5 text-right cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : expense.id)}>
                        <span className="font-black text-lg text-slate-900">
                          {currencySymbol}{expense.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : expense.id)}>
                        <StatusBadge status={expense.status} />
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : expense.id)}>
                        {approver ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                              <User size={12} className="text-slate-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-600">{approver.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); openModal('expenses', expense); }}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="px-8 py-0">
                          <div className="py-6 border-b border-slate-200">
                            <div className="bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-[25px] p-6 border border-slate-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                {/* Vendor Details */}
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vendor</p>
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl ${categoryColors.bg} flex items-center justify-center`}>
                                      <Building2 size={18} className={categoryColors.text} />
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900">{expense.vendor}</p>
                                      <p className="text-xs text-slate-500">{expense.category}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Date Info */}
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Date</p>
                                  <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span className="text-sm text-slate-600">{new Date(expense.date).toLocaleDateString()}</span>
                                  </div>
                                </div>

                                {/* Approval Status */}
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Approval</p>
                                  {approver ? (
                                    <div className="flex items-center gap-2 text-emerald-600">
                                      <CheckCircle2 size={16} />
                                      <span className="text-sm font-bold">Approved by {approver.name}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-amber-600">
                                      <Clock size={16} />
                                      <span className="text-sm font-bold">Pending Approval</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Receipt */}
                              <div className="mb-6">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Receipt</p>
                                {expense.receiptUrl ? (
                                  <a
                                    href={expense.receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all"
                                  >
                                    <Receipt size={14} />
                                    View Receipt
                                    <ExternalLink size={12} />
                                  </a>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-medium hover:bg-amber-100 transition-all cursor-pointer">
                                      <Upload size={14} />
                                      Upload Receipt
                                      <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleReceiptUpload(expense.id, file);
                                        }}
                                      />
                                    </label>
                                    <span className="text-xs text-slate-400">No receipt uploaded</span>
                                  </div>
                                )}</div>

                              {/* Actions */}
                              <div className="flex gap-3 flex-wrap">
                                {expense.status === 'Pending' && (
                                  <button
                                    onClick={() => handleMarkPaid(expense)}
                                    className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                                  >
                                    <CheckCircle2 size={14} /> Mark as Paid
                                  </button>
                                )}
                                <button
                                  onClick={() => openModal('expenses', expense)}
                                  className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(expense.id)}
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

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Receipt size={48} className="text-slate-200" />
                      <p className="text-slate-400 font-black uppercase text-xs">No expenses found</p>
                      <p className="text-slate-300 text-sm">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Alert */}
      {stats.pending > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-6 rounded-[35px] flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertCircle size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 mb-1">Pending Expenses</h3>
            <p className="text-sm text-slate-600">
              You have {stats.pending} expense{stats.pending !== 1 ? 's' : ''} totaling{' '}
              <span className="font-bold">{currencySymbol}{stats.pendingAmount.toLocaleString()}</span>{' '}
              awaiting payment.
            </p>
          </div>
        </div>
      )}

      {/* Expense Composer Modal */}
      <ExpenseComposer
        isOpen={showExpenseComposer}
        onClose={() => setShowExpenseComposer(false)}
        mode="create"
      />
    </div>
  );
};

export default ExpensesList;
