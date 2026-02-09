import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Search, Plus, Download, AlertCircle, TrendingDown,
  DollarSign, BarChart3, ArrowUp, ArrowDown, ArrowUpDown, Box
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

type SortField = 'name' | 'stock' | 'value';
type SortDirection = 'asc' | 'desc';

const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { inventoryItems, openModal } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Calculate summary stats
  const stats = useMemo(() => {
    const items = inventoryItems || [];
    const totalValue = items.reduce((sum, item) => sum + (item.unitPrice * item.warehouseQty), 0);
    const lowStock = items.filter(item => item.warehouseQty <= item.reorderPoint).length;
    const outOfStock = items.filter(item => item.warehouseQty === 0).length;
    const inStock = items.filter(item => item.warehouseQty > item.reorderPoint).length;

    return {
      total: items.length,
      totalValue,
      lowStock,
      outOfStock,
      inStock,
      avgValue: items.length > 0 ? totalValue / items.length : 0
    };
  }, [inventoryItems]);

  // Filter and sort inventory
  const filteredItems = useMemo(() => {
    let filtered = inventoryItems || [];

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aVal, bVal;

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
          aVal = a.unitPrice * a.warehouseQty;
          bVal = b.unitPrice * b.warehouseQty;
          break;
        default:
          aVal = '';
          bVal = '';
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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-slate-300" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-slate-600" />
    ) : (
      <ArrowDown size={12} className="text-slate-600" />
    );
  };

  const getStockStatus = (item: any) => {
    if (item.warehouseQty === 0) return { label: 'Out of Stock', color: 'rose' };
    if (item.warehouseQty <= item.reorderPoint) return { label: 'Low Stock', color: 'amber' };
    return { label: 'In Stock', color: 'emerald' };
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const exportToCSV = () => {
    const itemsToExport = selectedItems.size > 0
      ? filteredItems.filter(item => selectedItems.has(item.id))
      : filteredItems;

    const headers = ['ID', 'Name', 'SKU', 'Category', 'Stock', 'Reorder Point', 'Unit Price', 'Total Value'];
    const rows = itemsToExport.map(item => [
      item.id,
      item.name,
      item.sku || '',
      item.category || '',
      item.warehouseQty,
      item.reorderPoint,
      item.unitPrice,
      (item.unitPrice * item.warehouseQty).toFixed(2)
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Inventory</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all"
          >
            <Download size={16} />
            Export {selectedItems.size > 0 ? `(${selectedItems.size})` : ''}
          </button>
          <button
            onClick={() => openModal('inventoryItems')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Items</p>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">SKUs tracked</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Value</p>
          <p className="text-3xl font-black text-slate-900">${Math.round(stats.totalValue).toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Inventory assets</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Low Stock</p>
          <p className="text-3xl font-black text-slate-900">{stats.lowStock}</p>
          <p className="text-xs text-slate-500 mt-1">
            {stats.lowStock > 0 ? 'Need reordering' : 'All items stocked'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Out of Stock</p>
          <p className="text-3xl font-black text-slate-900">{stats.outOfStock}</p>
          <p className="text-xs text-slate-500 mt-1">
            {stats.outOfStock > 0 ? 'Urgent attention' : 'All items available'}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search inventory by name, SKU, or category..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedItems.size > 0 && (
        <div className="bg-slate-900 text-white p-4 rounded-[25px] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-wide">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white/20 hover:bg-white/30 transition-all">
                Create PO
              </button>
              <button className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white/20 hover:bg-white/30 transition-all">
                Adjust Stock
              </button>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white/20 hover:bg-white/30 transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-[25px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-6 py-5 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                />
              </th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Item
                  <SortIcon field="name" />
                </div>
              </th>
              <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
              <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors"
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center gap-2">
                  Stock
                  <SortIcon field="stock" />
                </div>
              </th>
              <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th
                className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors"
                onClick={() => handleSort('value')}
              >
                <div className="flex items-center gap-2">
                  Total Value
                  <SortIcon field="value" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item);
              const totalValue = item.unitPrice * item.warehouseQty;
              const isExpanded = expandedId === item.id;

              return (
                <React.Fragment key={item.id}>
                  <tr
                    className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{item.name}</span>
                        <span className="text-xs text-slate-400">ID: {item.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-slate-900">{item.sku || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-slate-900">{item.category || 'General'}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{item.warehouseQty}</span>
                        <span className="text-xs text-slate-500">Reorder: {item.reorderPoint}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 bg-${stockStatus.color}-50 text-${stockStatus.color}-700 text-[9px] font-black uppercase tracking-wider rounded-full border border-${stockStatus.color}-200`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">${totalValue.toFixed(2)}</span>
                        <span className="text-xs text-slate-500">${item.unitPrice.toFixed(2)}/unit</span>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="px-8 py-0">
                        <div className="py-6 border-b border-slate-200">
                          <div className="bg-gradient-to-br from-slate-50 to-slate-100/30 rounded-[25px] p-6 border border-slate-200">
                            <div className="grid grid-cols-4 gap-6 mb-6">
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Supplier</p>
                                <p className="text-sm font-bold text-slate-900">{item.supplier || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Restocked</p>
                                <p className="text-sm font-bold text-slate-900">{item.lastRestocked || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</p>
                                <p className="text-sm font-bold text-slate-900">{item.location || 'Warehouse'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unit Cost</p>
                                <p className="text-sm font-bold text-slate-900">${item.unitPrice.toFixed(2)}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/inventory/${item.id}`);
                                }}
                                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide shadow-md active:scale-95 transition-all"
                              >
                                View Details
                              </button>
                              <button className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide border border-slate-200 active:scale-95 transition-all">
                                Adjust Stock
                              </button>
                              <button className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-[20px] text-xs font-bold uppercase tracking-wide border border-slate-200 active:scale-95 transition-all">
                                Create PO
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
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={40} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No inventory items found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'Add your first inventory item to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      {stats.lowStock > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-[25px] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertCircle size={24} className="text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Low Stock Alert</h4>
                <p className="text-sm text-slate-600">{stats.lowStock} item{stats.lowStock !== 1 ? 's' : ''} need{stats.lowStock === 1 ? 's' : ''} reordering</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
              Create Purchase Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
