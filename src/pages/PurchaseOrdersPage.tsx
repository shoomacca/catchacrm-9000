import React, { useState, useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import { PurchaseOrder, POStatus } from '../types';
import {
  Package,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  Truck,
  Search,
  Plus,
  Download,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type SortField = 'poNumber' | 'total' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const PurchaseOrdersPage: React.FC = () => {
  const { purchaseOrders, accounts, openModal } = useCRM();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<POStatus | 'All'>('All');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Calculate summary statistics
  const stats = useMemo(() => {
    const total = purchaseOrders.length;
    const draft = purchaseOrders.filter((po) => po.status === 'Draft').length;
    const ordered = purchaseOrders.filter((po) => po.status === 'Ordered').length;
    const dispatched = purchaseOrders.filter((po) => po.status === 'Dispatched').length;
    const delivered = purchaseOrders.filter((po) => po.status === 'Delivered').length;
    const totalValue = purchaseOrders.reduce((sum, po) => sum + po.total, 0);

    return { total, draft, ordered, dispatched, delivered, totalValue };
  }, [purchaseOrders]);

  // Filter and sort
  const filteredPOs = useMemo(() => {
    let filtered = purchaseOrders.filter((po) => {
      const matchesSearch =
        po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplierId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortField === 'total') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [purchaseOrders, searchTerm, statusFilter, sortField, sortDirection]);

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
      <ArrowUp size={14} className="text-orange-600" />
    ) : (
      <ArrowDown size={14} className="text-orange-600" />
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
    if (selectedIds.size === filteredPOs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPOs.map((po) => po.id)));
    }
  };

  const exportToCSV = () => {
    const headers = ['PO Number', 'Supplier', 'Status', 'Total', 'Items', 'Created'];
    const rows = filteredPOs.map((po) => [
      po.poNumber,
      po.supplierId,
      po.status,
      `$${po.total.toLocaleString()}`,
      po.items.length,
      new Date(po.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: POStatus) => {
    const config = {
      Draft: { bg: 'bg-slate-100', text: 'text-slate-700', icon: FileText },
      Ordered: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      Dispatched: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Truck },
      Delivered: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
    };

    const { bg, text, icon: Icon } = config[status];

    return (
      <span className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = accounts.find((acc) => acc.id === supplierId);
    return supplier?.name || supplierId;
  };

  // Count POs needing attention (Draft or Ordered)
  const needsAttention = stats.draft + stats.ordered;

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Purchase Orders</h1>
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
            onClick={() => openModal('purchaseOrders')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={16} />
            New PO
          </button>
        </div>
      </div>

      {/* Alert Banner - Needs Attention */}
      {needsAttention > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900">
              {needsAttention} Purchase Order{needsAttention !== 1 ? 's' : ''} Needing Action
            </p>
            <p className="text-sm text-slate-600">
              {stats.draft > 0 && `${stats.draft} draft PO${stats.draft !== 1 ? 's' : ''} to finalize`}
              {stats.draft > 0 && stats.ordered > 0 && ' • '}
              {stats.ordered > 0 && `${stats.ordered} order${stats.ordered !== 1 ? 's' : ''} to track`}
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total POs</p>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">All orders</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Draft</p>
          <p className="text-3xl font-black text-slate-900">{stats.draft}</p>
          <p className="text-xs text-slate-500 mt-1">In progress</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ordered</p>
          <p className="text-3xl font-black text-slate-900">{stats.ordered}</p>
          <p className="text-xs text-slate-500 mt-1">Submitted</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dispatched</p>
          <p className="text-3xl font-black text-slate-900">{stats.dispatched}</p>
          <p className="text-xs text-slate-500 mt-1">In transit</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Delivered</p>
          <p className="text-3xl font-black text-slate-900">{stats.delivered}</p>
          <p className="text-xs text-slate-500 mt-1">Completed</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Value</p>
          <p className="text-3xl font-black text-slate-900">${(stats.totalValue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-slate-500 mt-1">All POs</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {(['All', 'Draft', 'Ordered', 'Dispatched', 'Delivered'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search PO number, supplier..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-[25px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-5 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredPOs.length && filteredPOs.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('poNumber')}
                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    PO Number
                    {getSortIcon('poNumber')}
                  </button>
                </th>
                <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Supplier
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Status
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('total')}
                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Total
                    {getSortIcon('total')}
                  </button>
                </th>
                <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Items
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Created
                    {getSortIcon('createdAt')}
                  </button>
                </th>
                <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
          <tbody>
            {filteredPOs.map((po) => (
              <React.Fragment key={po.id}>
                <tr className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                  <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(po.id)}
                        onChange={() => toggleSelect(po.id)}
                        className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => navigate(`/purchase-orders/${po.id}`)}
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {po.poNumber}
                    </button>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-slate-900">{getSupplierName(po.supplierId)}</span>
                  </td>
                  <td className="p-4">{getStatusBadge(po.status)}</td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-slate-900">${po.total.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-500">{po.items.length} items</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-500">{new Date(po.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="p-4">
                      <button
                        onClick={() => toggleExpand(po.id)}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-2 rounded-lg transition-all"
                      >
                        {expandedRows.has(po.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedRows.has(po.id) && (
                    <tr className="bg-slate-50">
                      <td colSpan={8} className="px-6 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Items List */}
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 mb-3">
                              Order Items
                            </h4>
                            <div className="space-y-2">
                              {po.items.map((item, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                  <div>
                                    <p className="font-bold text-slate-900">{item.name}</p>
                                    <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-black text-slate-900">${item.price.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Details */}
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 mb-3">
                              Order Details
                            </h4>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                              {po.linkedJobId && (
                                <div className="flex justify-between">
                                  <span className="text-slate-600 text-sm">Linked Job:</span>
                                  <span className="font-bold text-slate-900">{po.linkedJobId}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-slate-600 text-sm">Created By:</span>
                                <span className="font-bold text-slate-900">{po.createdBy}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600 text-sm">Last Updated:</span>
                                <span className="font-bold text-slate-900">{new Date(po.updatedAt).toLocaleDateString()}</span>
                              </div>
                              <div className="pt-3 border-t border-slate-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600 font-bold">Total:</span>
                                  <span className="text-2xl font-black text-orange-600">${po.total.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
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

        {filteredPOs.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={40} className="text-orange-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Purchase Orders Found</h3>
            <p className="text-slate-500 mb-6">Create your first purchase order to get started.</p>
            <button
              onClick={() => openModal('purchaseOrders')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              Create Purchase Order
            </button>
          </div>
        )}

      {/* Selection Actions */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-slide-up">
          <span className="font-bold">{selectedIds.size} selected</span>
          <div className="flex gap-3">
            <button disabled title="Coming soon" className="bg-white/20 px-4 py-2 rounded-lg font-bold transition-all opacity-50 cursor-not-allowed">
              Update Status
            </button>
            <button disabled title="Coming soon" className="bg-white/20 px-4 py-2 rounded-lg font-bold transition-all opacity-50 cursor-not-allowed">
              Export Selected
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

export default PurchaseOrdersPage;
