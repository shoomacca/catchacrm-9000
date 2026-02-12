import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext';
import {
  Package, RefreshCcw, Plus, Search, LayoutGrid, List, Filter,
  DollarSign, TrendingUp, AlertTriangle, Archive, CheckCircle,
  ChevronDown, MoreVertical, Edit3, Copy, ToggleLeft, ToggleRight,
  Tag, Clock, Users, Box, Barcode, X
} from 'lucide-react';

const ItemsCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, services, openModal, searchQuery, setSearchQuery } = useCRM();

  // Read tab from URL query param, default to 'products'
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState<'products' | 'services'>(
    tabParam === 'services' ? 'services' : 'products'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Product types: physical items that can be stocked/shipped
  const productTypes = ['Physical Item', 'Digital Product', 'Consumable', 'Equipment', 'Raw Material'];

  // Service types: subscriptions, licenses, professional services
  const serviceTypes = ['Subscription', 'License', 'Maintenance Contract', 'Professional Service', 'Support Package', 'One-Time Service'];

  // Sync tab state with URL params
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab === 'products' || urlTab === 'services') {
      setTab(urlTab);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (newTab: 'products' | 'services') => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
    setCategoryFilter('all'); // Reset category when changing tabs
    setTypeFilter('all'); // Reset type when changing tabs
  };

  // Get unique categories
  const categories = useMemo(() => {
    const items = tab === 'products' ? products : services;
    const cats = new Set(items.map(item => item.category).filter(Boolean));
    return ['all', ...Array.from(cats)] as string[];
  }, [tab, products, services]);

  // Stats calculation
  const stats = useMemo(() => {
    if (tab === 'products') {
      const totalProducts = products.length;
      const activeProducts = products.filter(p => p.isActive).length;
      const totalValue = products.reduce((sum, p) => sum + (p.unitPrice * (p.stockLevel || 0)), 0);
      const lowStock = products.filter(p => p.stockLevel !== undefined && p.reorderPoint !== undefined && p.stockLevel <= p.reorderPoint).length;
      return [
        { label: 'Total Products', value: totalProducts, icon: Package, color: 'blue' },
        { label: 'Active Products', value: activeProducts, icon: CheckCircle, color: 'emerald' },
        { label: 'Inventory Value', value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: 'purple' },
        { label: 'Low Stock Alerts', value: lowStock, icon: AlertTriangle, color: lowStock > 0 ? 'amber' : 'slate' }
      ];
    } else {
      const totalServices = services.length;
      const activeServices = services.filter(s => s.isActive).length;
      const avgPrice = services.length > 0 ? services.reduce((sum, s) => sum + s.unitPrice, 0) / services.length : 0;
      const recurring = services.filter(s => s.billingCycle !== 'one-off').length;
      return [
        { label: 'Total Services', value: totalServices, icon: RefreshCcw, color: 'violet' },
        { label: 'Active Services', value: activeServices, icon: CheckCircle, color: 'emerald' },
        { label: 'Avg Price', value: `$${avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'blue' },
        { label: 'Recurring', value: recurring, icon: Clock, color: 'purple' }
      ];
    }
  }, [tab, products, services]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = tab === 'products' ? [...products] : [...services];

    // Search filter
    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tab === 'products' && (item as any).sku?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      items = items.filter(item => item.category === categoryFilter);
    }

    // Type filter (based on itemType field or inferred)
    if (typeFilter !== 'all') {
      items = items.filter(item => (item as any).itemType === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      items = items.filter(item => statusFilter === 'active' ? item.isActive : !item.isActive);
    }

    // Price range filter
    if (priceRange !== 'all') {
      items = items.filter(item => {
        if (priceRange === 'low') return item.unitPrice < 100;
        if (priceRange === 'mid') return item.unitPrice >= 100 && item.unitPrice < 500;
        if (priceRange === 'high') return item.unitPrice >= 500;
        return true;
      });
    }

    // Sort
    items.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return b.unitPrice - a.unitPrice;
      if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
      return 0;
    });

    return items;
  }, [tab, products, services, searchQuery, categoryFilter, statusFilter, priceRange, sortBy]);

  const handleQuickAction = (action: string, item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(null);

    if (action === 'edit') {
      openModal(tab, item);
    } else if (action === 'duplicate') {
      const newItem = { ...item, id: undefined, name: `${item.name} (Copy)` };
      openModal(tab, newItem);
    }
  };

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    slate: 'bg-slate-50 text-slate-400 border-slate-100'
  };

  const iconColorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    violet: 'bg-violet-500',
    slate: 'bg-slate-400'
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Management</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Products & Services</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Tab Toggle */}
          <div className="flex bg-white border border-slate-200 rounded-[24px] p-1.5 shadow-sm">
            <button
              onClick={() => handleTabChange('products')}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                tab === 'products'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Package size={14} /> Products
            </button>
            <button
              onClick={() => handleTabChange('services')}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                tab === 'services'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <RefreshCcw size={14} /> Services
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${iconColorMap[stat.color]} flex items-center justify-center shadow-lg`}>
                <stat.icon size={22} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-[25px] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={`Search ${tab}...`}
                className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters & View Toggle */}
            <div className="flex items-center gap-3">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  showFilters
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Filter size={14} /> Filters
                {(categoryFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all' || priceRange !== 'all') && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>

              {/* View Toggle */}
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                >
                  <List size={16} />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 focus:outline-none cursor-pointer"
              >
                <option value="name">Sort: Name</option>
                <option value="price">Sort: Price</option>
                <option value="category">Sort: Category</option>
              </select>

              {/* Add Button */}
              <button
                onClick={() => openModal(tab as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                  tab === 'products'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                    : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700'
                }`}
              >
                <Plus size={14}/> Add {tab === 'products' ? 'Product' : 'Service'}
              </button>
            </div>
          </div>

          {/* Filter Row (Expandable) */}
          {showFilters && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200 animate-slide-up">
              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Package size={14} className="text-slate-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  {(tab === 'products' ? productTypes : serviceTypes).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-slate-400" />
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Prices</option>
                  <option value="low">Under $100</option>
                  <option value="mid">$100 - $500</option>
                  <option value="high">$500+</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(typeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all' || priceRange !== 'all') && (
                <button
                  onClick={() => {
                    setTypeFilter('all');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setPriceRange('all');
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <X size={14} /> Clear All
                </button>
              )}
            </div>
          )}
        </div>

        {/* Items Grid/List */}
        <div className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map(item => {
                const isProduct = tab === 'products';
                const product = item as any;
                const service = item as any;
                const hasLowStock = isProduct && product.stockLevel !== undefined && product.reorderPoint !== undefined && product.stockLevel <= product.reorderPoint;

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/financials/catalog/${tab}/${item.id}`)}
                    className={`relative bg-slate-50 border rounded-[24px] p-6 hover:bg-white hover:shadow-lg transition-all cursor-pointer group ${
                      !item.isActive ? 'opacity-60 border-slate-200' : 'border-slate-100 hover:border-blue-300'
                    }`}
                  >
                    {/* Status Badge */}
                    {!item.isActive && (
                      <div className="absolute top-4 right-4 px-2 py-1 bg-slate-200 text-slate-500 rounded-lg text-[9px] font-black uppercase">
                        Inactive
                      </div>
                    )}

                    {/* Low Stock Badge */}
                    {hasLowStock && item.isActive && (
                      <div className="absolute top-4 right-4 px-2 py-1 bg-amber-100 text-amber-600 rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                        <AlertTriangle size={10} /> Low Stock
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.isActive && !hasLowStock && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === item.id ? null : item.id);
                            }}
                            className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-all"
                          >
                            <MoreVertical size={14} className="text-slate-500" />
                          </button>
                          {activeDropdown === item.id && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-10">
                              <button
                                onClick={(e) => handleQuickAction('edit', item, e)}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Edit3 size={12} /> Edit
                              </button>
                              <button
                                onClick={(e) => handleQuickAction('duplicate', item, e)}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Copy size={12} /> Duplicate
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Icon & Main Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all ${
                        isProduct
                          ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                          : 'bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white'
                      }`}>
                        {isProduct ? <Package size={24} /> : <RefreshCcw size={24} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-black text-slate-900 truncate">{item.name}</h3>
                        {item.category && (
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                        )}
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 mb-4">
                      {isProduct && product.sku && (
                        <span className="flex items-center gap-1">
                          <Barcode size={10} /> {product.sku}
                        </span>
                      )}
                      {!isProduct && service.billingCycle && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-600 rounded-lg uppercase">
                          {service.billingCycle}
                        </span>
                      )}
                      {isProduct && product.stockLevel !== undefined && (
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                          hasLowStock ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          <Box size={10} /> {product.stockLevel} in stock
                        </span>
                      )}
                      {!isProduct && service.durationHours !== undefined && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {service.durationHours}h {service.durationMinutes || 0}m
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-end justify-between pt-4 border-t border-slate-200">
                      <div>
                        <p className="text-2xl font-black text-slate-900">${item.unitPrice.toLocaleString()}</p>
                        {item.costPrice !== undefined && (
                          <p className="text-[9px] font-bold text-emerald-500 uppercase">
                            {((item.unitPrice - item.costPrice) / item.costPrice * 100).toFixed(0)}% margin
                          </p>
                        )}
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{item.taxRate}% tax</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {filteredItems.map(item => {
                const isProduct = tab === 'products';
                const product = item as any;
                const service = item as any;
                const hasLowStock = isProduct && product.stockLevel !== undefined && product.reorderPoint !== undefined && product.stockLevel <= product.reorderPoint;

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/financials/catalog/${tab}/${item.id}`)}
                    className={`flex items-center justify-between bg-slate-50 border rounded-2xl p-5 hover:bg-white hover:shadow-lg transition-all cursor-pointer group ${
                      !item.isActive ? 'opacity-60 border-slate-200' : 'border-slate-100 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-all ${
                        isProduct
                          ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                          : 'bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white'
                      }`}>
                        {isProduct ? <Package size={20} /> : <RefreshCcw size={20} />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-900">{item.name}</h3>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                          {item.category && <span>{item.category}</span>}
                          {isProduct && product.sku && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Barcode size={10} /> {product.sku}</span>
                            </>
                          )}
                          {!isProduct && service.billingCycle && (
                            <>
                              <span>•</span>
                              <span className="uppercase">{service.billingCycle}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-3">
                      {!item.isActive && (
                        <span className="px-3 py-1.5 bg-slate-200 text-slate-500 rounded-lg text-[9px] font-black uppercase">
                          Inactive
                        </span>
                      )}
                      {hasLowStock && item.isActive && (
                        <span className="px-3 py-1.5 bg-amber-100 text-amber-600 rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                          <AlertTriangle size={10} /> Low Stock
                        </span>
                      )}
                      {isProduct && product.stockLevel !== undefined && !hasLowStock && (
                        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black">
                          {product.stockLevel} in stock
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right ml-6">
                      <p className="text-lg font-black text-slate-900">${item.unitPrice.toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{item.taxRate}% tax</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleQuickAction('edit', item, e)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit3 size={16} className="text-slate-400 hover:text-blue-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="py-20 text-center">
              <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 ${
                tab === 'products' ? 'bg-blue-50' : 'bg-violet-50'
              }`}>
                {tab === 'products' ? (
                  <Package size={40} className="text-blue-300" />
                ) : (
                  <RefreshCcw size={40} className="text-violet-300" />
                )}
              </div>
              <p className="text-lg font-bold text-slate-600 mb-2">No {tab} found</p>
              <p className="text-sm text-slate-400 mb-6">
                {searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all' || priceRange !== 'all'
                  ? 'Try adjusting your filters'
                  : `Add your first ${tab === 'products' ? 'product' : 'service'} to get started`
                }
              </p>
              {!searchQuery && typeFilter === 'all' && categoryFilter === 'all' && statusFilter === 'all' && priceRange === 'all' && (
                <button
                  onClick={() => openModal(tab as any)}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg ${
                    tab === 'products'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                  }`}
                >
                  <Plus size={14}/> Add {tab === 'products' ? 'Product' : 'Service'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

export default ItemsCatalog;
