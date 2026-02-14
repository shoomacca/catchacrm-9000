import React, { useState } from 'react';
import { X, Package, Hash, DollarSign, Tag, MapPin, Calendar, TrendingDown } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { InventoryItem } from '../types';

interface InventoryItemComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<InventoryItem>;
  mode?: 'create' | 'edit';
}

export const InventoryItemComposer: React.FC<InventoryItemComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const { upsertRecord } = useCRM();

  const [name, setName] = useState(initialData?.name || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [category, setCategory] = useState(initialData?.category || 'Material');
  const [warehouseQty, setWarehouseQty] = useState(initialData?.warehouseQty?.toString() || '0');
  const [reorderPoint, setReorderPoint] = useState(initialData?.reorderPoint?.toString() || '10');
  const [unitPrice, setUnitPrice] = useState(initialData?.unitPrice?.toString() || '');
  const [supplier, setSupplier] = useState(initialData?.supplier || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [lastRestocked, setLastRestocked] = useState(initialData?.lastRestocked || '');

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter an item name');
      return;
    }
    if (!sku.trim()) {
      alert('Please enter a SKU');
      return;
    }
    if (!unitPrice || parseFloat(unitPrice) < 0) {
      alert('Please enter a valid unit price');
      return;
    }

    const item: Partial<InventoryItem> = {
      ...(initialData?.id && { id: initialData.id }),
      name: name.trim(),
      sku: sku.trim(),
      category,
      warehouseQty: parseInt(warehouseQty),
      reorderPoint: parseInt(reorderPoint),
      unitPrice: parseFloat(unitPrice),
      supplier: supplier.trim() || undefined,
      location: location.trim() || undefined,
      lastRestocked: lastRestocked || undefined,
    };

    upsertRecord('inventoryItems', item);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Package size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {mode === 'create' ? 'New Inventory Item' : 'Edit Inventory Item'}
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">
                {mode === 'create' ? 'Add item to inventory' : 'Update item details'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Inventory item name"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  SKU *
                </label>
                <div className="relative">
                  <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SKU-001"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Category
                </label>
                <div className="relative">
                  <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  >
                    <option value="Asset">Asset</option>
                    <option value="Material">Material</option>
                    <option value="Medical">Medical</option>
                    <option value="Weapons">Weapons</option>
                    <option value="Communications">Communications</option>
                    <option value="Technology">Technology</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Unit Price *
                </label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Warehouse Quantity
                </label>
                <input
                  type="number"
                  value={warehouseQty}
                  onChange={(e) => setWarehouseQty(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Reorder Point
                </label>
                <div className="relative">
                  <TrendingDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(e.target.value)}
                    placeholder="10"
                    min="0"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Supplier
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Supplier name"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Location
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Warehouse A, Aisle 3"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Last Restocked
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={lastRestocked}
                  onChange={(e) => setLastRestocked(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg shadow-teal-500/20"
          >
            {mode === 'create' ? 'Create Item' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
