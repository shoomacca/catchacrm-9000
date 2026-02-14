import React, { useState, useMemo } from 'react';
import { X, RefreshCw, Building, Calendar, Plus, Trash2, DollarSign } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Subscription } from '../types';

interface SubscriptionComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Subscription>;
  mode?: 'create' | 'edit';
}

export const SubscriptionComposer: React.FC<SubscriptionComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const { upsertRecord, accounts } = useCRM();

  const [accountId, setAccountId] = useState(initialData?.accountId || '');
  const [name, setName] = useState(initialData?.name || '');
  const [status, setStatus] = useState(initialData?.status || 'Active');
  const [billingCycle, setBillingCycle] = useState(initialData?.billingCycle || 'monthly');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [nextBillDate, setNextBillDate] = useState(initialData?.nextBillDate || '');
  const [autoGenerateInvoice, setAutoGenerateInvoice] = useState(initialData?.autoGenerateInvoice ?? true);
  const [items, setItems] = useState(initialData?.items || [{ itemType: 'service' as const, itemId: '', description: '', qty: 1, unitPrice: 0, taxRate: 10 }]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const lineTotal = item.qty * item.unitPrice;
      const taxAmount = lineTotal * (item.taxRate / 100);
      return sum + lineTotal + taxAmount;
    }, 0);
  }, [items]);

  const handleSubmit = () => {
    if (!accountId) {
      alert('Please select an account');
      return;
    }
    if (!name.trim()) {
      alert('Please enter a subscription name');
      return;
    }
    if (!startDate) {
      alert('Please select a start date');
      return;
    }
    if (!nextBillDate) {
      alert('Please select next bill date');
      return;
    }

    const subscription: Partial<Subscription> = {
      ...(initialData?.id && { id: initialData.id }),
      accountId,
      name: name.trim(),
      status: status as any,
      billingCycle: billingCycle as any,
      startDate,
      endDate: endDate || undefined,
      nextBillDate,
      autoGenerateInvoice,
      items: items as any,
    };

    upsertRecord('subscriptions', subscription);
    onClose();
  };

  const addItem = () => {
    setItems([...items, { itemType: 'service' as const, itemId: '', description: '', qty: 1, unitPrice: 0, taxRate: 10 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <RefreshCw size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {mode === 'create' ? 'New Subscription' : 'Edit Subscription'}
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">
                {mode === 'create' ? 'Create recurring subscription' : 'Update subscription details'}
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
                  Account *
                </label>
                <div className="relative">
                  <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Subscription Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Monthly Service Plan"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Billing Cycle
                </label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenerateInvoice}
                    onChange={(e) => setAutoGenerateInvoice(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-bold text-slate-700">Auto-generate invoices</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  End Date
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Next Bill Date *
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={nextBillDate}
                    onChange={(e) => setNextBillDate(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Subscription Items
                </label>
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold hover:bg-green-100 transition-all"
                >
                  <Plus size={14} />
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-green-500"
                      />
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                        placeholder="Qty"
                        min="1"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-green-500"
                      />
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="Price"
                        step="0.01"
                        min="0"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-green-500"
                      />
                      <input
                        type="number"
                        value={item.taxRate}
                        onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                        placeholder="Tax %"
                        step="0.1"
                        min="0"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-end gap-4 p-4 bg-green-50 rounded-2xl border border-green-200">
              <span className="text-sm font-black text-slate-700 uppercase">Total (incl. tax):</span>
              <div className="flex items-center gap-2">
                <DollarSign size={20} className="text-green-600" />
                <span className="text-2xl font-black text-green-600">{total.toFixed(2)}</span>
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
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-green-700 hover:to-teal-700 transition-all shadow-lg shadow-green-500/20"
          >
            {mode === 'create' ? 'Create Subscription' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
