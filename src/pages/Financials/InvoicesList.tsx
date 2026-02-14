import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  FileText, Plus, Search, AlertCircle, CheckCircle2, Clock, Send,
  ChevronDown, DollarSign, CreditCard, Receipt, Edit2, Trash2, Eye,
  Calendar, User, Building2, Download, ArrowUpDown, ArrowUp, ArrowDown,
  Trash, Mail
} from 'lucide-react';
import { Invoice } from '../../types';
import { InvoiceComposer } from '../../components/InvoiceComposer';

type FilterStatus = 'all' | 'draft' | 'sent' | 'paid' | 'overdue';
type SortField = 'date' | 'invoiceNumber' | 'account' | 'dueDate' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc';

const InvoicesList: React.FC = () => {
  const {
    invoices,
    accounts,
    openModal,
    deleteRecord,
    updateRecord,
    settings
  } = useCRM();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showInvoiceComposer, setShowInvoiceComposer] = useState(false);

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(inv => inv.status.toLowerCase() === filterStatus);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(inv => new Date(inv.issueDate) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(inv => new Date(inv.issueDate) <= new Date(dateTo));
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        accounts.find(a => a.id === inv.accountId)?.name.toLowerCase().includes(q) ||
        inv.total.toString().includes(q)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortField) {
        case 'date':
          aVal = new Date(a.issueDate).getTime();
          bVal = new Date(b.issueDate).getTime();
          break;
        case 'invoiceNumber':
          aVal = a.invoiceNumber;
          bVal = b.invoiceNumber;
          break;
        case 'account':
          aVal = accounts.find(acc => acc.id === a.accountId)?.name || '';
          bVal = accounts.find(acc => acc.id === b.accountId)?.name || '';
          break;
        case 'dueDate':
          aVal = new Date(a.dueDate).getTime();
          bVal = new Date(b.dueDate).getTime();
          break;
        case 'amount':
          aVal = a.total;
          bVal = b.total;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          aVal = new Date(a.issueDate).getTime();
          bVal = new Date(b.issueDate).getTime();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [invoices, filterStatus, searchQuery, accounts, sortField, sortDirection, dateFrom, dateTo]);

  // Summary stats
  const stats = useMemo(() => {
    const paid = invoices.filter(i => i.status === 'Paid');
    const sent = invoices.filter(i => i.status === 'Sent');
    const draft = invoices.filter(i => i.status === 'Draft');
    const overdue = invoices.filter(i => i.status === 'Overdue');

    const totalRevenue = paid.reduce((sum, i) => sum + i.total, 0);
    const outstandingAmount = [...sent, ...overdue].reduce((sum, i) => sum + i.total, 0);
    const overdueAmount = overdue.reduce((sum, i) => sum + i.total, 0);

    return {
      total: invoices.length,
      paid: paid.length,
      sent: sent.length,
      draft: draft.length,
      overdue: overdue.length,
      totalRevenue,
      outstandingAmount,
      overdueAmount
    };
  }, [invoices]);

  const handleSendInvoice = (invoice: Invoice) => {
    updateRecord('invoices', invoice.id, {
      status: 'Sent',
      sentAt: new Date().toISOString()
    });
    setExpandedId(null);
  };

  const handleMarkPaid = (invoice: Invoice) => {
    updateRecord('invoices', invoice.id, {
      status: 'Paid',
      paymentStatus: 'paid',
      paidAt: new Date().toISOString()
    });
    setExpandedId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteRecord('invoices', id);
      setExpandedId(null);
    }
  };

  // Bulk selection handlers
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredInvoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredInvoices.map(inv => inv.id)));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} invoices?`)) {
      selectedIds.forEach(id => deleteRecord('invoices', id));
      setSelectedIds(new Set());
    }
  };

  const handleBulkSend = () => {
    selectedIds.forEach(id => {
      const invoice = invoices.find(i => i.id === id);
      if (invoice && invoice.status === 'Draft') {
        updateRecord('invoices', id, { status: 'Sent', sentAt: new Date().toISOString() });
      }
    });
    setSelectedIds(new Set());
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Date', 'Invoice #', 'Account', 'Due Date', 'Amount', 'Status'];
    const rows = filteredInvoices.map(inv => {
      const account = accounts.find(a => a.id === inv.accountId);
      return [
        new Date(inv.issueDate).toLocaleDateString(),
        inv.invoiceNumber,
        account?.name || 'Unknown',
        new Date(inv.dueDate).toLocaleDateString(),
        inv.total.toString(),
        inv.status
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const StatusBadge = ({ status }: { status: Invoice['status'] }) => {
    const configs: Record<string, { bg: string; text: string; border: string; icon: any; label: string }> = {
      Paid: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: CheckCircle2, label: 'Paid' },
      Sent: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: Send, label: 'Sent' },
      Draft: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: FileText, label: 'Draft' },
      Overdue: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: AlertCircle, label: 'Overdue' },
      Cancelled: { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200', icon: AlertCircle, label: 'Cancelled' }
    };
    const config = configs[status] || configs.Draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${config.bg} ${config.text} ${config.border}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-slate-300" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp size={12} className="text-blue-500" />
      : <ArrowDown size={12} className="text-blue-500" />;
  };

  const currencySymbol = settings?.localization?.currencySymbol || '$';

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Management</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Invoices</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => setShowInvoiceComposer(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={16} />
            Add Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={20} className="text-emerald-600" />
            <h3 className="text-sm font-black text-slate-700">Total Revenue</h3>
          </div>
          <p className="text-3xl font-black text-emerald-600">{currencySymbol}{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {stats.paid} invoices paid
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={20} className="text-amber-600" />
            <h3 className="text-sm font-black text-slate-700">Outstanding</h3>
          </div>
          <p className="text-3xl font-black text-amber-600">{currencySymbol}{stats.outstandingAmount.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {stats.sent + stats.overdue} invoices pending
          </p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle size={20} className="text-rose-600" />
            <h3 className="text-sm font-black text-slate-700">Overdue</h3>
          </div>
          <p className="text-3xl font-black text-rose-600">{currencySymbol}{stats.overdueAmount.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {stats.overdue} invoices overdue
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={20} className="text-slate-600" />
            <h3 className="text-sm font-black text-slate-700">Drafts</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.draft}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            Awaiting send
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 p-6 rounded-[35px] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'draft', 'sent', 'paid', 'overdue'] as FilterStatus[]).map(status => (
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
                 status === 'draft' ? `Draft (${stats.draft})` :
                 status === 'sent' ? `Sent (${stats.sent})` :
                 status === 'paid' ? `Paid (${stats.paid})` :
                 `Overdue (${stats.overdue})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex gap-3 items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Range:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="From"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="To"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-600 text-white p-4 rounded-[35px] flex items-center justify-between shadow-lg animate-slide-up">
          <span className="text-sm font-bold">{selectedIds.size} invoice{selectedIds.size !== 1 ? 's' : ''} selected</span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkSend}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all"
            >
              <Mail size={14} /> Send Selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all"
            >
              <Trash size={14} /> Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-[25px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredInvoices.length && filteredInvoices.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </th>
                <th
                  className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date <SortIcon field="date" />
                  </div>
                </th>
                <th
                  className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('invoiceNumber')}
                >
                  <div className="flex items-center gap-2">
                    Invoice # <SortIcon field="invoiceNumber" />
                  </div>
                </th>
                <th
                  className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('account')}
                >
                  <div className="flex items-center gap-2">
                    Account <SortIcon field="account" />
                  </div>
                </th>
                <th
                  className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center gap-2">
                    Due Date <SortIcon field="dueDate" />
                  </div>
                </th>
                <th
                  className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center gap-2 justify-end">
                    Amount <SortIcon field="amount" />
                  </div>
                </th>
                <th
                  className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status <SortIcon field="status" />
                  </div>
                </th>
                <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map(invoice => {
                const isExpanded = expandedId === invoice.id;
                const account = accounts.find(a => a.id === invoice.accountId);
                const isSelected = selectedIds.has(invoice.id);

                return (
                  <React.Fragment key={invoice.id}>
                    <tr
                      className={`hover:bg-slate-50 transition-all ${isExpanded ? 'bg-blue-50/30' : ''} ${isSelected ? 'bg-blue-50/20' : ''}`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(invoice.id)}
                          onClick={e => e.stopPropagation()}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : invoice.id)}>
                        <span className="text-sm font-bold text-slate-900">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : invoice.id)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <FileText size={14} className="text-blue-600" />
                          </div>
                          <span className="text-sm font-bold text-slate-900">{invoice.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : invoice.id)}>
                        <span className="text-sm font-bold text-slate-900">{account?.name || 'Unknown'}</span>
                      </td>
                      <td className="p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : invoice.id)}>
                        <span className="text-sm font-bold text-slate-900">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4 text-right cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : invoice.id)}>
                        <span className="text-sm font-bold text-slate-900">
                          {currencySymbol}{invoice.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : invoice.id)}>
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); openModal('invoices', invoice); }}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : invoice.id)}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="px-8 py-0">
                          <div className="py-6 border-b border-slate-200">
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-[25px] p-6 border border-slate-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                {/* Bill To */}
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</p>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                      <Building2 size={18} className="text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900">{account?.name || 'Unknown'}</p>
                                      <p className="text-xs text-slate-500">{account?.industry || ''}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Dates */}
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dates</p>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Calendar size={12} className="text-slate-400" />
                                      <span className="text-sm text-slate-600">Issue: {new Date(invoice.issueDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock size={12} className="text-slate-400" />
                                      <span className="text-sm text-slate-600">Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Payment Info */}
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment</p>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <CreditCard size={12} className="text-slate-400" />
                                      <span className="text-sm text-slate-600">Status: {invoice.paymentStatus || 'unpaid'}</span>
                                    </div>
                                    {invoice.paidAt && (
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        <span className="text-sm text-slate-600">Paid: {new Date(invoice.paidAt).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Line Items Preview */}
                              {invoice.lineItems && invoice.lineItems.length > 0 && (
                                <div className="mb-6">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Line Items</p>
                                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                          <th className="px-4 py-2 text-left">Item</th>
                                          <th className="px-4 py-2 text-right">Qty</th>
                                          <th className="px-4 py-2 text-right">Price</th>
                                          <th className="px-4 py-2 text-right">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {invoice.lineItems.slice(0, 3).map((item, idx) => (
                                          <tr key={idx}>
                                            <td className="px-4 py-2 text-sm font-medium text-slate-700">{item.description}</td>
                                            <td className="px-4 py-2 text-sm text-slate-600 text-right">{item.qty}</td>
                                            <td className="px-4 py-2 text-sm text-slate-600 text-right">{currencySymbol}{item.unitPrice.toLocaleString()}</td>
                                            <td className="px-4 py-2 text-sm font-bold text-slate-900 text-right">{currencySymbol}{item.lineTotal.toLocaleString()}</td>
                                          </tr>
                                        ))}
                                        {invoice.lineItems.length > 3 && (
                                          <tr>
                                            <td colSpan={4} className="px-4 py-2 text-center text-xs text-slate-400">
                                              +{invoice.lineItems.length - 3} more items
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                      <tfoot className="bg-slate-50">
                                        <tr>
                                          <td colSpan={3} className="px-4 py-2 text-right text-sm font-bold text-slate-700">Total</td>
                                          <td className="px-4 py-2 text-right text-lg font-black text-slate-900">{currencySymbol}{invoice.total.toLocaleString()}</td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-3 flex-wrap">
                                {invoice.status === 'Draft' && (
                                  <button
                                    onClick={() => handleSendInvoice(invoice)}
                                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                                  >
                                    <Send size={14} /> Send Invoice
                                  </button>
                                )}
                                {(invoice.status === 'Sent' || invoice.status === 'Overdue') && (
                                  <button
                                    onClick={() => handleMarkPaid(invoice)}
                                    className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                                  >
                                    <CheckCircle2 size={14} /> Record Payment
                                  </button>
                                )}
                                <button
                                  onClick={() => openModal('invoices', invoice)}
                                  className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(invoice.id)}
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

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={48} className="text-slate-200" />
                      <p className="text-slate-400 font-black uppercase text-xs">No invoices found</p>
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
            <h3 className="font-black text-slate-900 mb-1">Overdue Invoices</h3>
            <p className="text-sm text-slate-600">
              You have {stats.overdue} overdue invoice{stats.overdue !== 1 ? 's' : ''} totaling{' '}
              <span className="font-bold">{currencySymbol}{stats.overdueAmount.toLocaleString()}</span>.
              Follow up with these customers to collect payment.
            </p>
          </div>
        </div>
      )}

      {/* Invoice Composer Modal */}
      <InvoiceComposer
        isOpen={showInvoiceComposer}
        onClose={() => setShowInvoiceComposer(false)}
        mode="create"
      />
    </div>
  );
};

export default InvoicesList;
