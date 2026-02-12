import React, { useState, useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import { InventoryItem, WarehouseLocation } from '../types';
import {
  Warehouse as WarehouseIcon,
  MapPin,
  Package,
  TrendingUp,
  BarChart3,
  Boxes,
  Search,
  Plus,
  Download,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  Navigation,
  AlertCircle,
} from 'lucide-react';

type SortField = 'name' | 'warehouseQty' | 'category';
type SortDirection = 'asc' | 'desc';
type LocationType = 'zone' | 'aisle' | 'rack' | 'bin' | 'floor';

const WarehousePage: React.FC = () => {
  const { inventoryItems, warehouseLocations, upsertRecord } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'inventory' | 'locations'>('inventory');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Use warehouse locations from CRMContext (falls back to demo data if empty)
  const locations = useMemo(() => {
    if (warehouseLocations.length > 0) {
      return warehouseLocations;
    }
    // Default demo locations if none exist
    return [
      { id: 'BLDG-001', name: 'Main Warehouse', type: 'floor' as const, capacity: 10000, currentCount: 6500, isActive: true, isPickable: true, isReceivable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'ZONE-001', name: 'Zone A - Medical', type: 'zone' as const, capacity: 2000, currentCount: 1200, parentLocationId: 'BLDG-001', isActive: true, isPickable: true, isReceivable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'ZONE-002', name: 'Zone B - Technology', type: 'zone' as const, capacity: 3000, currentCount: 2800, parentLocationId: 'BLDG-001', isActive: true, isPickable: true, isReceivable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'ZONE-003', name: 'Zone C - Weapons', type: 'zone' as const, capacity: 2000, currentCount: 1500, parentLocationId: 'BLDG-001', isActive: true, isPickable: true, isReceivable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'ZONE-004', name: 'Zone D - Communications', type: 'zone' as const, capacity: 3000, currentCount: 1000, parentLocationId: 'BLDG-001', isActive: true, isPickable: true, isReceivable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ] as WarehouseLocation[];
  }, [warehouseLocations]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalLocations = locations.length;
    const activeSKUs = inventoryItems.length;
    const movementsToday = 0; // Mock
    const totalCapacity = locations.reduce((sum, loc) => sum + (loc.capacity || 0), 0);
    const totalStock = locations.reduce((sum, loc) => sum + (loc.currentCount || 0), 0);
    const capacityUsed = totalCapacity > 0 ? Math.round((totalStock / totalCapacity) * 100) : 0;

    return { totalLocations, activeSKUs, movementsToday, capacityUsed };
  }, [inventoryItems, locations]);

  // Filter and sort inventory
  const filteredItems = useMemo(() => {
    let filtered = inventoryItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'warehouseQty') {
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
  }, [inventoryItems, searchTerm, sortField, sortDirection]);

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
      <ArrowUp size={14} className="text-blue-600" />
    ) : (
      <ArrowDown size={14} className="text-blue-600" />
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
    if (viewMode === 'inventory') {
      if (selectedIds.size === filteredItems.length) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set(filteredItems.map((item) => item.id)));
      }
    } else {
      if (selectedIds.size === locations.length) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set(locations.map((loc) => loc.id)));
      }
    }
  };

  const exportToCSV = () => {
    if (viewMode === 'inventory') {
      const headers = ['Name', 'SKU', 'Category', 'Qty', 'Reorder Point', 'Unit Price'];
      const rows = filteredItems.map((item) => [
        item.name,
        item.sku,
        item.category,
        item.warehouseQty,
        item.reorderPoint,
        `$${item.unitPrice.toLocaleString()}`,
      ]);

      const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `warehouse-inventory-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      const headers = ['Location', 'Type', 'Capacity', 'Current Stock', 'Utilization'];
      const rows = locations.map((loc) => [
        loc.name,
        loc.type,
        loc.capacity || 0,
        loc.currentCount || 0,
        `${loc.capacity ? Math.round(((loc.currentCount || 0) / loc.capacity) * 100) : 0}%`,
      ]);

      const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `warehouse-locations-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'floor':
        return Building2;
      case 'zone':
      case 'aisle':
        return Navigation;
      case 'rack':
      case 'bin':
        return Boxes;
      default:
        return Building2;
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-emerald-600 bg-emerald-100';
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Warehouse</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all"
          >
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
            <Plus size={16} />
            {viewMode === 'inventory' ? 'Stock Movement' : 'Add Location'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Locations</p>
          <p className="text-3xl font-black text-slate-900">{stats.totalLocations}</p>
          <p className="text-xs text-slate-500 mt-1">Warehouse zones</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active SKUs</p>
          <p className="text-3xl font-black text-slate-900">{stats.activeSKUs}</p>
          <p className="text-xs text-slate-500 mt-1">Items tracked</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Movements Today</p>
          <p className="text-3xl font-black text-slate-900">{stats.movementsToday}</p>
          <p className="text-xs text-slate-500 mt-1">Stock changes</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Capacity Used</p>
          <p className="text-3xl font-black text-slate-900">{stats.capacityUsed}%</p>
          <p className="text-xs text-slate-500 mt-1">Space utilized</p>
        </div>
      </div>

      {/* View Mode Selector & Search */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('inventory')}
              className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                viewMode === 'inventory'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <Package size={16} />
              Inventory
            </button>
            <button
              onClick={() => setViewMode('locations')}
              className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                viewMode === 'locations'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <MapPin size={16} />
              Locations
            </button>
          </div>

          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={viewMode === 'inventory' ? 'Search items, SKU, category...' : 'Search locations...'}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Inventory View */}
      {viewMode === 'inventory' && (
        <>
        <div className="bg-white border border-slate-200 rounded-[25px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-5 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                      Item Name
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    SKU
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('category')}
                      className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                      Category
                      {getSortIcon('category')}
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('warehouseQty')}
                      className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                      Qty
                      {getSortIcon('warehouseQty')}
                    </button>
                  </th>
                  <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Location
                  </th>
                  <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
            <tbody>
              {filteredItems.map((item) => (
                <React.Fragment key={item.id}>
                  <tr className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-slate-900">{item.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-slate-900">{item.sku}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-wider rounded-full border border-blue-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-slate-900">{item.warehouseQty}</span>
                      {item.warehouseQty <= item.reorderPoint && (
                        <span className="ml-2 text-red-600">
                          <AlertCircle size={16} className="inline" />
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-500">Zone A-01</span>
                    </td>
                    <td className="p-4">
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-all"
                        >
                          {expandedRows.has(item.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {expandedRows.has(item.id) && (
                      <tr className="bg-slate-50">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Reorder Point</p>
                              <p className="text-2xl font-black text-slate-900">{item.reorderPoint}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Unit Price</p>
                              <p className="text-2xl font-black text-slate-900">${item.unitPrice.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Value</p>
                              <p className="text-2xl font-black text-slate-900">
                                ${(item.warehouseQty * item.unitPrice).toLocaleString()}
                              </p>
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

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Boxes size={40} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Items Found</h3>
              <p className="text-slate-500">No inventory items match your search.</p>
            </div>
          )}
        </>
      )}

      {/* Locations View */}
      {viewMode === 'locations' && (
        <div className="bg-white border border-slate-200 rounded-[25px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-5 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === locations.length && locations.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Location
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Type
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Capacity
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Current Stock
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Utilization
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locations.map((location) => {
                  const Icon = getLocationIcon(location.type);
                  const utilization = location.capacity ? Math.round(((location.currentCount || 0) / location.capacity) * 100) : 0;
                  return (
                    <tr key={location.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(location.id)}
                          onChange={() => toggleSelect(location.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Icon size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <span className="font-black text-slate-900 block">{location.name}</span>
                            {location.code && <span className="text-xs text-slate-400">{location.code}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          {location.type}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-slate-900 font-semibold">{(location.capacity || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-slate-900 font-black text-lg">{(location.currentCount || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getUtilizationColor(utilization)}`}>
                          {utilization}%
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
      )}

      {/* Selection Actions */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-slide-up">
          <span className="font-bold">{selectedIds.size} selected</span>
          <div className="flex gap-3">
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold transition-all">
              Move Items
            </button>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold transition-all">
              Cycle Count
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

export default WarehousePage;
