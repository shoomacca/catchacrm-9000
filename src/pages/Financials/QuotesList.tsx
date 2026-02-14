import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  FileText, Plus, Search, AlertCircle, CheckCircle2, Clock, Send,
  ChevronDown, TrendingUp, FileCheck, Calendar, X, Edit2, Trash2,
  Building2, ArrowRight, Timer, Download, ArrowUpDown, ArrowUp, ArrowDown,
  Trash, Mail
} from 'lucide-react';
import { Quote } from '../../types';
import { QuoteComposer } from '../../components/QuoteComposer';

type FilterStatus = 'all' | 'draft' | 'sent' | 'accepted' | 'expired' | 'declined';
type SortField = 'date' | 'quoteNumber' | 'account' | 'expiry' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc';

const QuotesList: React.FC = () => {
  const {
    quotes,
    accounts,
    invoices,
    
    deleteRecord,
    updateRecord,
    addRecord,
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
  const [showQuoteComposer, setShowQuoteComposer] = useState(false);
  const [editingQuote, setEditingQuote] = useState<any>(null);

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Helper to check if quote is expired
  const isQuoteExpired = (quote: Quote) => {
    return new Date(quote.expiryDate) < new Date() && quote.status !== 'Accepted' && quote.status !== 'Declined';
  };

  // Get effective status (accounting for expired)
  const getEffectiveStatus = (quote: Quote): string => {
    if (isQuoteExpired(quote)) return 'Expired';
    return quote.status;
  };

  // Filter and sort quotes
  const filteredQuotes = useMemo(() => {
    let filtered = [...quotes];

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(q => {
        const effectiveStatus = getEffectiveStatus(q).toLowerCase();
        return effectiveStatus === filterStatus;
      });
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(q => new Date(q.issueDate) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(q => new Date(q.issueDate) <= new Date(dateTo));
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q =>
        q.quoteNumber.toLowerCase().includes(query) ||
        accounts.find(a => a.id === q.accountId)?.name.toLowerCase().includes(query) ||
        q.total.toString().includes(query)
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
        case 'quoteNumber':
          aVal = a.quoteNumber;
          bVal = b.quoteNumber;
          break;
        case 'account':
          aVal = accounts.find(acc => acc.id === a.accountId)?.name || '';
          bVal = accounts.find(acc => acc.id === b.accountId)?.name || '';
          break;
        case 'expiry':
          aVal = new Date(a.expiryDate).getTime();
          bVal = new Date(b.expiryDate).getTime();
          break;
        case 'amount':
          aVal = a.total;
          bVal = b.total;
          break;
        case 'status':
          aVal = getEffectiveStatus(a);
          bVal = getEffectiveStatus(b);
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
  }, [quotes, filterStatus, searchQuery, accounts, sortField, sortDirection, dateFrom, dateTo]);

  // Summary stats
  const stats = useMemo(() => {
    const draft = quotes.filter(q => q.status === 'Draft');
    const sent = quotes.filter(q => q.status === 'Sent' && !isQuoteExpired(q));
    const accepted = quotes.filter(q => q.status === 'Accepted');
    const declined = quotes.filter(q => q.status === 'Declined');
    const expired = quotes.filter(q => isQuoteExpired(q));

    const pipelineValue = sent.reduce((sum, q) => sum + q.total, 0);
    const acceptedValue = accepted.reduce((sum, q) => sum + q.total, 0);
    const expiredValue = expired.reduce((sum, q) => sum + q.total, 0);

    return {
      total: quotes.length,
      draft: draft.length,
      sent: sent.length,
      accepted: accepted.length,
      declined: declined.length,
      expired: expired.length,
      pipelineValue,
      acceptedValue,
      expiredValue
    };
  }, [quotes]);

  const handleSendQuote = (quote: Quote) => {
    updateRecord('quotes', quote.id, { status: 'Sent' });
    setExpandedId(null);
  };

  const handleAcceptQuote = (quote: Quote) => {
    updateRecord('quotes', quote.id, {
      status: 'Accepted',
      acceptedAt: new Date().toISOString()
    });
    setExpandedId(null);
  };

  const handleDeclineQuote = (quote: Quote) => {
    updateRecord('quotes', quote.id, { status: 'Declined' });
    setExpandedId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this quote?')) {
      deleteRecord('quotes', id);
      setExpandedId(null);
    }
  };

  // Convert quote to invoice
  const handleConvertToInvoice = (quote: Quote) => {
    if (confirm('Convert this quote to an invoice?')) {
      const invoiceNumber = `INV-${Date.now()}`;
      const newInvoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber,
        accountId: quote.accountId,
        status: 'Draft' as const,
        issueDate: new Date().toISOString(),
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        lineItems: quote.lineItems,
        subtotal: quote.subtotal,
        taxTotal: quote.taxTotal || 0,
        total: quote.total,
        notes: `Converted from quote ${quote.quoteNumber}`,
        paymentStatus: 'unpaid' as const
      };

      addRecord('invoices', newInvoice);
      updateRecord('quotes', quote.id, { status: 'Accepted', acceptedAt: new Date().toISOString() });
      setExpandedId(null);
      alert(`Invoice ${invoiceNumber} created successfully!`);
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
    if (selectedIds.size === filteredQuotes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuotes.map(q => q.id)));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} quotes?`)) {
      selectedIds.forEach(id => deleteRecord('quotes', id));
      setSelectedIds(new Set());
    }
  };

  const handleBulkSend = () => {
    selectedIds.forEach(id => {
      const quote = quotes.find(q => q.id === id);
      if (quote && quote.status === 'Draft') {
        updateRecord('quotes', id, { status: 'Sent' });
      }
    });
    setSelectedIds(new Set());
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Date', 'Quote #', 'Account', 'Expiry', 'Amount', 'Status'];
    const rows = filteredQuotes.map(q => {
      const account = accounts.find(a => a.id === q.accountId);
      return [
        new Date(q.issueDate).toLocaleDateString(),
        q.quoteNumber,
        account?.name || 'Unknown',
        new Date(q.expiryDate).toLocaleDateString(),
        q.total.toString(),
        getEffectiveStatus(q)
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string): number => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const StatusBadge = ({ quote }: { quote: Quote }) => {
    const effectiveStatus = getEffectiveStatus(quote);
    const configs: Record<string, { bg: string; text: string; border: string; icon: any; label: string }> = {
      Accepted: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: CheckCircle2, label: 'Accepted' },
      Sent: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: Send, label: 'Sent' },
      Draft: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: FileText, label: 'Draft' },
      Expired: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: Clock, label: 'Expired' },
      Declined: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: X, label: 'Declined' },
      Superseded: { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200', icon: FileText, label: 'Superseded' }
    };
    const config = configs[effectiveStatus] || configs.Draft;
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
      ? <ArrowUp size={12} className="text-violet-500" />
      : <ArrowDown size={12} className="text-violet-500" />;
  };

  const currencySymbol = settings?.localization?.currencySymbol || '$';

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Management</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Quotes</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => setShowQuoteComposer(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={14} /> New Quote
          </button>
        </div>
      </div>

      {/* Summary Cards - same as before */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={20} className="text-violet-600" />
            <h3 className="text-sm font-black text-slate-700">Pipeline Value</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">{currencySymbol}{stats.pipelineValue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">
            {stats.sent} quotes pending
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <h3 className="text-sm font-black text-slate-700">Accepted</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">{currencySymbol}{stats.acceptedValue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">
            {stats.accepted} quotes accepted
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Send size={20} className="text-blue-600" />
            <h3 className="text-sm font-black text-slate-700">Awaiting Response</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.sent}</p>
          <p className="text-xs text-slate-500 mt-1">
            Quotes sent to clients
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={20} className="text-amber-600" />
            <h3 className="text-sm font-black text-slate-700">Expired</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.expired}</p>
          <p className="text-xs text-slate-500 mt-1">
            {currencySymbol}{stats.expiredValue.toLocaleString()} value expired
          </p>
        </div>
      </div>

      {/* Filters & Search with Date Range */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'draft', 'sent', 'accepted', 'expired', 'declined'] as FilterStatus[]).map(status => (
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
                 status === 'accepted' ? `Accepted (${stats.accepted})` :
                 status === 'expired' ? `Expired (${stats.expired})` :
                 `Declined (${stats.declined})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="From"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="To"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-[10px] font-bold text-violet-600 hover:text-violet-700 uppercase tracking-wider"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-violet-600 text-white p-4 rounded-[35px] flex items-center justify-between shadow-lg animate-slide-up">
          <span className="text-sm font-bold">{selectedIds.size} quote{selectedIds.size !== 1 ? 's' : ''} selected</span>
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

      {/* Quotes Table */}
      <div className="bg-white border border-slate-200 rounded-[25px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredQuotes.length && filteredQuotes.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-2 focus:ring-violet-500"
                  />
                </th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date <SortIcon field="date" />
                  </div>
                </th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('quoteNumber')}
                >
                  <div className="flex items-center gap-2">
                    Quote # <SortIcon field="quoteNumber" />
                  </div>
                </th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('account')}
                >
                  <div className="flex items-center gap-2">
                    Account <SortIcon field="account" />
                  </div>
                </th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('expiry')}
                >
                  <div className="flex items-center gap-2">
                    Expiry <SortIcon field="expiry" />
                  </div>
                </th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] text-right cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center gap-2 justify-end">
                    Amount <SortIcon field="amount" />
                  </div>
                </th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map(quote => {
                const isExpanded = expandedId === quote.id;
                const account = accounts.find(a => a.id === quote.accountId);
                const daysUntilExpiry = getDaysUntilExpiry(quote.expiryDate);
                const expired = isQuoteExpired(quote);
                const isSelected = selectedIds.has(quote.id);

                return (
                  <React.Fragment key={quote.id}>
                    <tr
                      className={`hover:bg-slate-50 transition-all ${isExpanded ? 'bg-violet-50/30' : ''} ${isSelected ? 'bg-violet-50/20' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(quote.id)}
                          onClick={e => e.stopPropagation()}
                          className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-2 focus:ring-violet-500"
                        />
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : quote.id)}>
                        <span className="font-bold text-slate-900 text-sm">
                          {new Date(quote.issueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : quote.id)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                            <FileText size={14} className="text-violet-600" />
                          </div>
                          <span className="font-black text-slate-900">{quote.quoteNumber}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : quote.id)}>
                        <span className="font-bold text-slate-700">{account?.name || 'Unknown'}</span>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : quote.id)}>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-500">
                            {new Date(quote.expiryDate).toLocaleDateString()}
                          </span>
                          {!expired && quote.status === 'Sent' && (
                            <span className={`text-[10px] font-bold ${daysUntilExpiry <= 3 ? 'text-amber-600' : 'text-slate-400'}`}>
                              {daysUntilExpiry} days left
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : quote.id)}>
                        <span className="font-black text-lg text-slate-900">
                          {currencySymbol}{quote.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : quote.id)}>
                        <StatusBadge quote={quote} />
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); setEditingQuote(quote); setShowQuoteComposer(true); }}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : quote.id)}
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

                    {/* Expanded Row - Continuing from previous implementation but adding Convert to Invoice button */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="px-8 py-0">
                          <div className="py-6 border-b border-slate-200">
                            <div className="bg-gradient-to-br from-slate-50 to-violet-50/30 rounded-[25px] p-6 border border-slate-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                {/* Account Details */}
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Customer</p>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                                      <Building2 size={18} className="text-violet-600" />
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
                                      <span className="text-sm text-slate-600">Issue: {new Date(quote.issueDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Timer size={12} className={expired ? 'text-amber-500' : 'text-slate-400'} />
                                      <span className={`text-sm ${expired ? 'text-amber-600 font-bold' : 'text-slate-600'}`}>
                                        Expiry: {new Date(quote.expiryDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Validity */}
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Validity</p>
                                  {expired ? (
                                    <div className="flex items-center gap-2 text-amber-600">
                                      <AlertCircle size={16} />
                                      <span className="text-sm font-bold">Quote Expired</span>
                                    </div>
                                  ) : quote.status === 'Accepted' ? (
                                    <div className="flex items-center gap-2 text-emerald-600">
                                      <CheckCircle2 size={16} />
                                      <span className="text-sm font-bold">Accepted {quote.acceptedAt ? new Date(quote.acceptedAt).toLocaleDateString() : ''}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <Clock size={16} className={daysUntilExpiry <= 3 ? 'text-amber-500' : 'text-slate-400'} />
                                      <span className={`text-sm ${daysUntilExpiry <= 3 ? 'text-amber-600 font-bold' : 'text-slate-600'}`}>
                                        {daysUntilExpiry} days remaining
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Line Items Preview */}
                              {quote.lineItems && quote.lineItems.length > 0 && (
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
                                        {quote.lineItems.slice(0, 3).map((item, idx) => (
                                          <tr key={idx}>
                                            <td className="px-4 py-2 text-sm font-medium text-slate-700">{item.description}</td>
                                            <td className="px-4 py-2 text-sm text-slate-600 text-right">{item.qty}</td>
                                            <td className="px-4 py-2 text-sm text-slate-600 text-right">{currencySymbol}{item.unitPrice.toLocaleString()}</td>
                                            <td className="px-4 py-2 text-sm font-bold text-slate-900 text-right">{currencySymbol}{item.lineTotal.toLocaleString()}</td>
                                          </tr>
                                        ))}
                                        {quote.lineItems.length > 3 && (
                                          <tr>
                                            <td colSpan={4} className="px-4 py-2 text-center text-xs text-slate-400">
                                              +{quote.lineItems.length - 3} more items
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                      <tfoot className="bg-slate-50">
                                        <tr>
                                          <td colSpan={3} className="px-4 py-2 text-right text-sm font-bold text-slate-700">Total</td>
                                          <td className="px-4 py-2 text-right text-lg font-black text-slate-900">{currencySymbol}{quote.total.toLocaleString()}</td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-3 flex-wrap">
                                {quote.status === 'Draft' && (
                                  <button
                                    onClick={() => handleSendQuote(quote)}
                                    className="flex items-center gap-2 px-5 py-3 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all"
                                  >
                                    <Send size={14} /> Send Quote
                                  </button>
                                )}
                                {quote.status === 'Sent' && !expired && (
                                  <>
                                    <button
                                      onClick={() => handleAcceptQuote(quote)}
                                      className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                                    >
                                      <CheckCircle2 size={14} /> Mark Accepted
                                    </button>
                                    <button
                                      onClick={() => handleDeclineQuote(quote)}
                                      className="flex items-center gap-2 px-5 py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                                    >
                                      <X size={14} /> Mark Declined
                                    </button>
                                  </>
                                )}
                                {quote.status === 'Accepted' && (
                                  <button
                                    onClick={() => handleConvertToInvoice(quote)}
                                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                                  >
                                    <ArrowRight size={14} /> Convert to Invoice
                                  </button>
                                )}
                                <button
                                  onClick={() => { setEditingQuote(quote); setShowQuoteComposer(true); }}
                                  className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(quote.id)}
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

              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={48} className="text-slate-200" />
                      <p className="text-slate-400 font-black uppercase text-xs">No quotes found</p>
                      <p className="text-slate-300 text-sm">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expired Alert */}
      {stats.expired > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-[35px] flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertCircle size={24} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 mb-1">Expired Quotes</h3>
            <p className="text-sm text-slate-600">
              You have {stats.expired} expired quote{stats.expired !== 1 ? 's' : ''} worth{' '}
              <span className="font-bold">{currencySymbol}{stats.expiredValue.toLocaleString()}</span>.
              Consider following up with these customers or creating new quotes.
            </p>
          </div>
        </div>
      )}

      {/* Quote Composer Modal */}
      <QuoteComposer
        isOpen={showQuoteComposer}
        onClose={() => {
          setShowQuoteComposer(false);
          setEditingQuote(null);
        }}
        initialData={editingQuote || undefined}
        mode={editingQuote ? 'edit' : 'create'}
      />
    </div>
  );
};

export default QuotesList;
