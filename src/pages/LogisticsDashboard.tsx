import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, TrendingUp, TrendingDown, AlertTriangle, FileText,
  Wrench, DollarSign, ShoppingCart, CheckCircle2, Clock,
  Download, Search, ChevronDown, Edit2, ArrowUp, ArrowDown,
  ArrowUpDown, Box, Truck
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

type SortField = 'name' | 'stock' | 'value';
type SortDirection = 'asc' | 'desc';

const LogisticsDashboard: React.FC = () => {
  const { inventoryItems, equipment, purchaseOrders, jobs, expenses, settings } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeTab, setActiveTab] = useState<'inventory' | 'equipment' | 'pos'>('inventory');

  const currencySymbol = settings?.localization?.currencySymbol || '$';

  // Inventory Statistics
  const inventoryStats = useMemo(() => {
    const lowStock = inventoryItems.filter(item => item.warehouseQty <= item.reorderPoint);
    const outOfStock = inventoryItems.filter(item => item.warehouseQty === 0);
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.warehouseQty * item.unitPrice), 0);
    const assets = inventoryItems.filter(item => item.category === 'Asset');
    const materials = inventoryItems.filter(item => item.category === 'Material');

    return {
      total: inventoryItems.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      totalValue,
      assets: assets.length,
      materials: materials.length
    };
  }, [inventoryItems]);

  // Equipment Statistics
  const equipmentStats = useMemo(() => {
    const needsService = equipment.filter(e => {
      if (!e.nextServiceDate) return false;
      const nextService = new Date(e.nextServiceDate);
      const today = new Date();
      const daysUntil = Math.ceil((nextService.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7;
    });

    const damaged = equipment.filter(e => e.condition === 'Damaged' || e.condition === 'Poor');
    const assigned = equipment.filter(e => e.assignedTo);
    const excellent = equipment.filter(e => e.condition === 'Excellent').length;
    const good = equipment.filter(e => e.condition === 'Good').length;
    const fair = equipment.filter(e => e.condition === 'Fair').length;
    const poor = equipment.filter(e => e.condition === 'Poor' || e.condition === 'Damaged').length;

    return {
      total: equipment.length,
      needsService: needsService.length,
      damaged: damaged.length,
      assigned: assigned.length,
      excellent,
      good,
      fair,
      poor,
      utilization: equipment.length > 0 ? ((assigned.length / equipment.length) * 100).toFixed(0) : '0'
    };
  }, [equipment]);

  // Purchase Order Statistics
  const poStats = useMemo(() => {
    const draft = purchaseOrders.filter(po => po.status === 'Draft');
    const ordered = purchaseOrders.filter(po => po.status === 'Ordered');
    const dispatched = purchaseOrders.filter(po => po.status === 'Dispatched');
    const delivered = purchaseOrders.filter(po => po.status === 'Delivered');
    const totalValue = purchaseOrders.reduce((sum, po) => sum + po.total, 0);
    const pendingValue = purchaseOrders
      .filter(po => po.status !== 'Delivered')
      .reduce((sum, po) => sum + po.total, 0);

    return {
      total: purchaseOrders.length,
      draft: draft.length,
      ordered: ordered.length,
      dispatched: dispatched.length,
      delivered: delivered.length,
      totalValue,
      pendingValue
    };
  }, [purchaseOrders]);

  // Logistics Expenses (last 30 days)
  const recentExpenses = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const logisticsExpenses = expenses.filter(e =>
      ['Materials', 'Fuel'].includes(e.category) &&
      new Date(e.date) >= thirtyDaysAgo
    );
    return logisticsExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Filter and sort inventory
  const filteredItems = useMemo(() => {
    let filtered = [...inventoryItems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'stock':
          aVal = a.warehouseQty;
          bVal = b.warehouseQty;
          break;
        case 'value':
          aVal = a.warehouseQty * a.unitPrice;
          bVal = b.warehouseQty * b.unitPrice;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [inventoryItems, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
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
    const headers = ['SKU', 'Name', 'Category', 'Stock', 'Reorder Point', 'Unit Price', 'Total Value'];
    const rows = filteredItems.map(item => [
      item.sku || 'N/A',
      item.name,
      item.category || 'N/A',
      item.warehouseQty.toString(),
      item.reorderPoint.toString(),
      item.unitPrice.toString(),
      (item.warehouseQty * item.unitPrice).toString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logistics-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStockStatus = (item: any) => {
    if (item.warehouseQty === 0) return { label: 'Out of Stock', color: 'rose' };
    if (item.warehouseQty <= item.reorderPoint) return { label: 'Low Stock', color: 'amber' };
    return { label: 'In Stock', color: 'emerald' };
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-slate-300" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-emerald-600" />
    ) : (
      <ArrowDown size={12} className="text-emerald-600" />
    );
  };

  return (
    <div className="space-y-8 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none mb-1">Logistics Hub</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Inventory & Supply Chain Management</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            <Download size={14} /> Export CSV
          </button>
          <Link
            to="/inventory/new"
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Package size={14} /> New Item
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={20} className="text-emerald-600" />
            <h3 className="text-sm font-black text-slate-700">Inventory Value</h3>
          </div>
          <p className="text-3xl font-black text-emerald-600">{currencySymbol}{(inventoryStats.totalValue / 1000).toFixed(1)}K</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {inventoryStats.total} items in stock
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={20} className="text-amber-600" />
            <h3 className="text-sm font-black text-slate-700">Low Stock Items</h3>
          </div>
          <p className="text-3xl font-black text-amber-600">{inventoryStats.lowStock}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {inventoryStats.outOfStock > 0 ? `${inventoryStats.outOfStock} out of stock` : 'All in stock'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <Wrench size={20} className="text-blue-600" />
            <h3 className="text-sm font-black text-slate-700">Equipment Units</h3>
          </div>
          <p className="text-3xl font-black text-blue-600">{equipmentStats.total}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {equipmentStats.utilization}% utilization
          </p>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-6 rounded-[35px]">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart size={20} className="text-violet-600" />
            <h3 className="text-sm font-black text-slate-700">Active POs</h3>
          </div>
          <p className="text-3xl font-black text-violet-600">{poStats.ordered + poStats.dispatched}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            {currencySymbol}{(poStats.pendingValue / 1000).toFixed(1)}K pending
          </p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inventory Breakdown */}
        <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Package size={20} className="text-emerald-600" />
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Inventory Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
              <span className="text-sm font-bold text-blue-700">Assets</span>
              <span className="text-2xl font-black text-blue-600">{inventoryStats.assets}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl">
              <span className="text-sm font-bold text-emerald-700">Materials</span>
              <span className="text-2xl font-black text-emerald-600">{inventoryStats.materials}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl">
              <span className="text-sm font-bold text-amber-700">Low Stock</span>
              <span className="text-2xl font-black text-amber-600">{inventoryStats.lowStock}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl">
              <span className="text-sm font-bold text-rose-700">Out of Stock</span>
              <span className="text-2xl font-black text-rose-600">{inventoryStats.outOfStock}</span>
            </div>
          </div>
        </div>

        {/* Equipment Condition */}
        <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Wrench size={20} className="text-blue-600" />
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Equipment Condition</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
              <span className="text-sm font-bold text-emerald-600">Excellent</span>
              <span className="text-xl font-black text-emerald-600">{equipmentStats.excellent}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
              <span className="text-sm font-bold text-blue-600">Good</span>
              <span className="text-xl font-black text-blue-600">{equipmentStats.good}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl">
              <span className="text-sm font-bold text-amber-600">Fair</span>
              <span className="text-xl font-black text-amber-600">{equipmentStats.fair}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl">
              <span className="text-sm font-bold text-rose-600">Poor/Damaged</span>
              <span className="text-xl font-black text-rose-600">{equipmentStats.poor}</span>
            </div>
          </div>
        </div>

        {/* Purchase Orders */}
        <div className="bg-white border border-slate-200 rounded-[35px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <FileText size={20} className="text-violet-600" />
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Purchase Orders</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="text-sm font-bold text-slate-600">Draft</span>
              <span className="text-xl font-black text-slate-900">{poStats.draft}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-violet-50 rounded-2xl">
              <span className="text-sm font-bold text-violet-600">Ordered</span>
              <span className="text-xl font-black text-violet-600">{poStats.ordered}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
              <span className="text-sm font-bold text-blue-600">Dispatched</span>
              <span className="text-xl font-black text-blue-600">{poStats.dispatched}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
              <span className="text-sm font-bold text-emerald-600">Delivered</span>
              <span className="text-xl font-black text-emerald-600">{poStats.delivered}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 p-6 rounded-[35px] shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 border border-emerald-700 p-4 rounded-[25px] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            <span className="text-white font-black">
              {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all backdrop-blur-sm">
              Create PO
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

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-[45px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                <th className="px-6 py-5">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">SKU</th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Name
                    <SortIcon field="name" />
                  </div>
                </th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Category</th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] text-right cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Stock
                    <SortIcon field="stock" />
                  </div>
                </th>
                <th
                  className="px-8 py-5 font-black uppercase tracking-widest text-[9px] text-right cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => handleSort('value')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Value
                    <SortIcon field="value" />
                  </div>
                </th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Status</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[9px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => {
                const isExpanded = expandedId === item.id;
                const stockStatus = getStockStatus(item);
                const itemValue = item.warehouseQty * item.unitPrice;

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`hover:bg-slate-50 transition-all ${isExpanded ? 'bg-emerald-50/30' : ''} ${selectedIds.has(item.id) ? 'bg-emerald-50/20' : ''}`}
                    >
                      <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => handleSelectOne(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                        <span className="font-bold text-sm text-slate-600">{item.sku || 'N/A'}</span>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Package size={14} className="text-emerald-600" />
                          </div>
                          <span className="font-black text-slate-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border bg-slate-50 text-slate-600 border-slate-200">
                          {item.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                        <span className="font-black text-lg text-slate-900">{item.warehouseQty}</span>
                      </td>
                      <td className="px-8 py-5 text-right cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                        <span className="font-black text-lg text-slate-900">{currencySymbol}{itemValue.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border bg-${stockStatus.color}-50 text-${stockStatus.color}-600 border-${stockStatus.color}-200`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/inventory/${item.id}`}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                            title="View"
                          >
                            <Edit2 size={14} />
                          </Link>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform cursor-pointer ${isExpanded ? 'rotate-180' : ''}`}
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="px-8 py-0">
                          <div className="py-6 border-b border-slate-200">
                            <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-[25px] p-6 border border-slate-200">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Unit Price</p>
                                  <p className="text-xl font-black text-slate-900">{currencySymbol}{item.unitPrice.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reorder Point</p>
                                  <p className="text-xl font-black text-slate-900">{item.reorderPoint}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Value</p>
                                  <p className="text-xl font-black text-emerald-600">{currencySymbol}{itemValue.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</p>
                                  <p className="text-sm font-bold text-slate-900">{item.category || 'Uncategorized'}</p>
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

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package size={48} className="text-slate-200" />
                      <p className="text-slate-400 font-black uppercase text-xs">No items found</p>
                      <p className="text-slate-300 text-sm">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      {inventoryStats.lowStock > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-[35px] flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={24} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 mb-1">Low Stock Alert</h3>
            <p className="text-sm text-slate-600">
              You have {inventoryStats.lowStock} item{inventoryStats.lowStock !== 1 ? 's' : ''} that need reordering.
              {inventoryStats.outOfStock > 0 && (
                <span className="font-bold text-rose-600"> {inventoryStats.outOfStock} out of stock!</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsDashboard;
