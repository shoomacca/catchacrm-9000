import React, { useState, useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import { Account, RFQ, SupplierQuote } from '../types';
import {
  ShoppingCart,
  Building2,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  Download,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  DollarSign,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'suppliers' | 'rfqs' | 'quotes';
type SortField = 'name' | 'industry' | 'tier';
type SortDirection = 'asc' | 'desc';
type LocalRFQStatus = 'Draft' | 'Sent' | 'Quoted' | 'Awarded' | 'Closed';

const ProcurementPage: React.FC = () => {
  const { accounts, rfqs: crmRfqs, supplierQuotes: crmQuotes, upsertRecord, deleteRecord } = useCRM();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('suppliers');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Default demo data for RFQs
  const defaultRfqs = [
    { id: 'RFQ-001', rfqNumber: 'RFQ-2026-001', title: 'EMP Capacitors Bulk Order', supplierId: 'ACC-HAMMER', status: 'quoted' as const, totalValue: 75000, dueDate: '2026-02-15', createdAt: '2026-02-01', lineItems: [{}, {}, {}] },
    { id: 'RFQ-002', rfqNumber: 'RFQ-2026-002', title: 'Communications Equipment', supplierId: 'ACC-LOGOS', status: 'sent' as const, totalValue: 120000, dueDate: '2026-02-20', createdAt: '2026-02-05', lineItems: [{}, {}, {}, {}, {}] },
    { id: 'RFQ-003', rfqNumber: 'RFQ-2026-003', title: 'Neural Interface Plugs', supplierId: 'ACC-NEBUCHADNEZZAR', status: 'draft' as const, totalValue: 45000, dueDate: '2026-02-25', createdAt: '2026-02-08', lineItems: [{}, {}] },
  ];

  // Default demo data for quotes
  const defaultQuotes = [
    { id: 'QTE-001', rfqId: 'RFQ-001', supplierId: 'ACC-HAMMER', total: 72000, deliveryDays: 14, validUntil: '2026-02-28', evaluationNotes: 'Bulk discount applied' },
    { id: 'QTE-002', rfqId: 'RFQ-001', supplierId: 'ACC-LOGOS', total: 78000, deliveryDays: 10, validUntil: '2026-02-28', evaluationNotes: 'Express delivery available' },
  ];

  // Use CRM data or fallback to defaults
  const rfqs = useMemo(() => {
    if (crmRfqs.length > 0) {
      return crmRfqs;
    }
    return defaultRfqs as any[];
  }, [crmRfqs]);

  const quotes = useMemo(() => {
    if (crmQuotes.length > 0) {
      return crmQuotes;
    }
    return defaultQuotes as any[];
  }, [crmQuotes]);

  // Filter suppliers (accounts that are suppliers)
  const suppliers = useMemo(() => {
    return accounts.filter((acc) => acc.tier === 'Gold' || acc.tier === 'Silver' || acc.tier === 'Bronze');
  }, [accounts]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeSuppliers = suppliers.length;
    const openRFQs = rfqs.filter((rfq: any) => rfq.status === 'sent' || rfq.status === 'quoted' || rfq.status === 'Sent' || rfq.status === 'Quoted').length;
    const pendingQuotes = quotes.filter((q: any) => q.status === 'received' || !q.status).length;
    const thisMonthSpend = rfqs
      .filter((rfq: any) => rfq.status === 'awarded')
      .reduce((sum: number, rfq: any) => sum + (rfq.totalValue || rfq.value || 0), 0);

    return { activeSuppliers, openRFQs, pendingQuotes, thisMonthSpend };
  }, [suppliers, rfqs, quotes]);

  // Filter and sort suppliers
  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers.filter((supplier) => {
      const matchesSearch =
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.industry.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [suppliers, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-slate-400" />;
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="text-indigo-600" />
    ) : (
      <ArrowDown size={14} className="text-indigo-600" />
    );
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (viewMode === 'suppliers') {
      if (selectedIds.size === filteredSuppliers.length) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set(filteredSuppliers.map((s) => s.id)));
      }
    } else if (viewMode === 'rfqs') {
      if (selectedIds.size === rfqs.length) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set(rfqs.map((r) => r.id)));
      }
    }
  };

  const exportToCSV = () => {
    if (viewMode === 'suppliers') {
      const headers = ['Name', 'Industry', 'Tier', 'Website', 'Employee Count'];
      const rows = filteredSuppliers.map((s) => [s.name, s.industry, s.tier, s.website, s.employeeCount]);
      const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suppliers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else if (viewMode === 'rfqs') {
      const headers = ['RFQ Number', 'Title', 'Status', 'Value', 'Due Date', 'Items'];
      const rows = rfqs.map((r: any) => [r.rfqNumber, r.title, r.status, r.totalValue || r.value || 0, r.dueDate || '', r.lineItems?.length || r.items || 0]);
      const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rfqs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const getRFQStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    const config: Record<string, { bg: string; text: string; icon: any }> = {
      draft: { bg: 'bg-slate-100', text: 'text-slate-700', icon: FileText },
      sent: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      quoted: { bg: 'bg-purple-100', text: 'text-purple-700', icon: DollarSign },
      awarded: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
      closed: { bg: 'bg-slate-100', text: 'text-slate-600', icon: CheckCircle2 },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle },
    };

    const { bg, text, icon: Icon } = config[normalizedStatus] || config.draft;

    return (
      <span className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  const getTierBadge = (tier: string) => {
    const config = {
      Gold: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      Silver: { bg: 'bg-slate-200', text: 'text-slate-700' },
      Bronze: { bg: 'bg-orange-100', text: 'text-orange-700' },
    };

    const { bg, text } = config[tier as keyof typeof config] || { bg: 'bg-slate-100', text: 'text-slate-600' };

    return <span className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-bold uppercase`}>{tier}</span>;
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = accounts.find((acc) => acc.id === supplierId);
    return supplier?.name || supplierId;
  };

  const needsAttention = stats.openRFQs + stats.pendingQuotes;

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Procurement</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all"
          >
            <Download size={16} />
            Export
          </button>
          <button
            disabled
            title="Coming soon"
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all opacity-50 cursor-not-allowed"
          >
            <Plus size={16} />
            {viewMode === 'suppliers' ? 'Add Supplier' : 'New RFQ'}
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {needsAttention > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{needsAttention} Items Needing Attention</p>
            <p className="text-sm text-slate-600">
              {stats.openRFQs > 0 && `${stats.openRFQs} open RFQ${stats.openRFQs !== 1 ? 's' : ''}`}
              {stats.openRFQs > 0 && stats.pendingQuotes > 0 && ' • '}
              {stats.pendingQuotes > 0 && `${stats.pendingQuotes} quote${stats.pendingQuotes !== 1 ? 's' : ''} to review`}
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Suppliers</p>
          <p className="text-3xl font-black text-slate-900">{stats.activeSuppliers}</p>
          <p className="text-xs text-slate-500 mt-1">Vendor partners</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Open RFQs</p>
          <p className="text-3xl font-black text-slate-900">{stats.openRFQs}</p>
          <p className="text-xs text-slate-500 mt-1">Active requests</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending Quotes</p>
          <p className="text-3xl font-black text-slate-900">{stats.pendingQuotes}</p>
          <p className="text-xs text-slate-500 mt-1">Awaiting review</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Month Spend</p>
          <p className="text-3xl font-black text-slate-900">${stats.thisMonthSpend.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Current period</p>
        </div>
      </div>

      {/* View Mode Selector & Search */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {(['suppliers', 'rfqs', 'quotes'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all capitalize flex items-center gap-2 ${
                  viewMode === mode
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {mode === 'suppliers' && <Building2 size={16} />}
                {mode === 'rfqs' && <FileText size={16} />}
                {mode === 'quotes' && <DollarSign size={16} />}
                {mode}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={
                viewMode === 'suppliers'
                  ? 'Search suppliers, industry...'
                  : viewMode === 'rfqs'
                  ? 'Search RFQs...'
                  : 'Search quotes...'
              }
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Suppliers View */}
      {viewMode === 'suppliers' && (
        <>
        <div className="bg-white border border-slate-200 rounded-[25px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-5 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredSuppliers.length && filteredSuppliers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-5 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                    >
                      Supplier Name
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-left">
                    <button
                      onClick={() => handleSort('industry')}
                      className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                    >
                      Industry
                      {getSortIcon('industry')}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-left">
                    <button
                      onClick={() => handleSort('tier')}
                      className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                    >
                      Tier
                      {getSortIcon('tier')}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Performance
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map((supplier) => (
                  <React.Fragment key={supplier.id}>
                    <tr className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(supplier.id)}
                          onChange={() => toggleSelect(supplier.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => navigate(`/accounts/${supplier.id}`)}
                          className="font-black text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          {supplier.name}
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-slate-900 font-semibold">{supplier.industry}</span>
                      </td>
                      <td className="px-6 py-5">{getTierBadge(supplier.tier)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="ml-2 text-sm text-slate-600 font-semibold">5.0</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => toggleExpand(supplier.id)}
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2 rounded-lg transition-all"
                        >
                          {expandedRows.has(supplier.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {expandedRows.has(supplier.id) && (
                      <tr className="bg-slate-50">
                        <td colSpan={6} className="px-6 py-6">
                          <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Website</p>
                              <a href={supplier.website} className="text-sm font-semibold text-indigo-600 hover:underline">
                                {supplier.website}
                              </a>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Employees</p>
                              <p className="text-lg font-black text-slate-900">{supplier.employeeCount}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">On-Time Rate</p>
                              <p className="text-lg font-black text-emerald-600">98%</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Avg Lead Time</p>
                              <p className="text-lg font-black text-slate-900">14 days</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 size={40} className="text-indigo-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Suppliers Found</h3>
              <p className="text-slate-500 mb-6">Add your first supplier to get started.</p>
              <button
                disabled
                title="Coming soon"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all opacity-50 cursor-not-allowed"
              >
                Add Supplier
              </button>
            </div>
          )}
        </>
      )}

      {/* RFQs View */}
      {viewMode === 'rfqs' && (
        <>
        <div className="bg-white border border-slate-200 rounded-[25px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-5 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === rfqs.length && rfqs.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    RFQ Number
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Title
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Supplier
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Value
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Due Date
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rfqs.map((rfq: any) => (
                  <tr key={rfq.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(rfq.id)}
                        onChange={() => toggleSelect(rfq.id)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-black text-indigo-600">{rfq.rfqNumber}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-900 font-semibold">{rfq.title}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-700">{getSupplierName(rfq.supplierId || rfq.supplierIds?.[0])}</span>
                    </td>
                    <td className="px-6 py-5">{getRFQStatusBadge(rfq.status)}</td>
                    <td className="px-6 py-5">
                      <span className="text-slate-900 font-black text-lg">${(rfq.totalValue || rfq.value || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-600 text-sm">{rfq.dueDate ? new Date(rfq.dueDate).toLocaleDateString() : '—'}</span>
                    </td>
                    <td className="px-6 py-5">
                      <button className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2 rounded-lg transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rfqs.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={40} className="text-purple-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No RFQs Found</h3>
              <p className="text-slate-500 mb-6">Create your first RFQ to request quotes from suppliers.</p>
              <button
                disabled
                title="Coming soon"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all opacity-50 cursor-not-allowed"
              >
                Create RFQ
              </button>
            </div>
          )}
        </>
      )}

      {/* Quotes View */}
      {viewMode === 'quotes' && (
        <div className="bg-white border border-slate-200 rounded-[45px] shadow-sm overflow-hidden p-8">
          <div className="space-y-4">
            {quotes.map((quote: any) => (
              <div key={quote.id} className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">{getSupplierName(quote.supplierId)}</h3>
                    <p className="text-sm text-slate-600">For RFQ: {quote.rfqId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-indigo-600">${(quote.total || quote.amount || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Delivery</p>
                    <p className="font-bold text-slate-900">{quote.deliveryDays || '—'} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Valid Until</p>
                    <p className="font-bold text-slate-900">{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      quote.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                      quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {quote.status ? quote.status.charAt(0).toUpperCase() + quote.status.slice(1) : 'Pending Review'}
                    </span>
                  </div>
                </div>
                {(quote.evaluationNotes || quote.notes) && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-700">{quote.evaluationNotes || quote.notes}</p>
                  </div>
                )}
              </div>
            ))}

            {quotes.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign size={40} className="text-orange-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No Quotes Found</h3>
                <p className="text-slate-500">Quotes will appear here once suppliers respond to your RFQs.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selection Actions */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-slide-up">
          <span className="font-bold">{selectedIds.size} selected</span>
          <div className="flex gap-3">
            <button
              disabled
              title="Coming soon"
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold transition-all opacity-50 cursor-not-allowed"
            >
              Send RFQ
            </button>
            <button
              disabled
              title="Coming soon"
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold transition-all opacity-50 cursor-not-allowed"
            >
              Export
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementPage;
