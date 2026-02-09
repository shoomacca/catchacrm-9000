import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, DollarSign, Calendar, FileText, Search } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { LineItem, Invoice } from '../types';

interface BillAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  accountName: string;
  dealId?: string;
  quoteId?: string;
}

export const BillAccountModal: React.FC<BillAccountModalProps> = ({
  isOpen,
  onClose,
  accountId,
  accountName,
  dealId,
  quoteId
}) => {
  const { products, services, upsertRecord } = useCRM();
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Payment due within 30 days. Late payments subject to 1.5% monthly interest.');
  const [searchTerm, setSearchTerm] = useState('');
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  const allItems = useMemo(() => {
    const productItems = products.map(p => ({
      id: p.id,
      type: 'product' as const,
      name: p.name,
      description: p.description,
      category: p.category || 'Product',
      unitPrice: p.unitPrice,
      taxRate: p.taxRate,
      sku: p.sku,
      code: p.code
    }));
    const serviceItems = services.map(s => ({
      id: s.id,
      type: 'service' as const,
      name: s.name,
      description: s.description,
      category: s.category || 'Service',
      unitPrice: s.unitPrice,
      taxRate: s.taxRate,
      code: s.code,
      sku: s.sku
    }));
    return [...productItems, ...serviceItems];
  }, [products, services]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return allItems;
    const term = searchTerm.toLowerCase();
    return allItems.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term) ||
      item.sku?.toLowerCase().includes(term) ||
      item.code?.toLowerCase().includes(term)
    );
  }, [allItems, searchTerm]);

  const addLineItem = (itemId: string, itemType: 'product' | 'service') => {
    const item = allItems.find(i => i.id === itemId && i.type === itemType);
    if (!item) return;

    const newLineItem: LineItem = {
      itemType,
      itemId,
      description: item.name,
      qty: 1,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      lineTotal: item.unitPrice
    };

    setLineItems([...lineItems, newLineItem]);
    setShowItemPicker(false);
    setSearchTerm('');
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    // Recalculate line total
    if (field === 'qty' || field === 'unitPrice') {
      updated[index].lineTotal = updated[index].qty * updated[index].unitPrice;
    }

    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const taxTotal = lineItems.reduce((sum, item) =>
      sum + (item.lineTotal * item.taxRate / 100), 0
    );
    const total = subtotal + taxTotal;
    return { subtotal, taxTotal, total };
  }, [lineItems]);

  const handleSave = () => {
    if (lineItems.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    // Create invoice
    const invoice: Partial<Invoice> = {
      invoiceNumber: `INV-${Date.now()}`,
      accountId,
      dealId,
      quoteId,
      status: 'Draft',
      paymentStatus: 'unpaid',
      issueDate,
      invoiceDate: issueDate,
      dueDate,
      lineItems,
      subtotal: calculations.subtotal,
      taxTotal: calculations.taxTotal,
      total: calculations.total,
      notes,
      terms
    };

    upsertRecord('invoices', invoice);

    // If recurring, create subscription for auto-billing
    if (isRecurring) {
      const subscription: any = {
        accountId,
        name: `${accountName} - Recurring Billing`,
        billingCycle,
        amount: calculations.total,
        status: 'Active',
        startDate: issueDate,
        nextBillingDate: getNextBillingDate(issueDate, billingCycle),
        lineItems, // Store line items for future invoices
        notes: `Auto-generated from invoice. ${notes}`,
        terms
      };

      upsertRecord('subscriptions', subscription);
    }

    onClose();
  };

  // Calculate next billing date based on cycle
  const getNextBillingDate = (startDate: string, cycle: 'monthly' | 'quarterly' | 'yearly'): string => {
    const date = new Date(startDate);
    // Set to 1st of next month/quarter/year
    date.setDate(1);

    if (cycle === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else if (cycle === 'quarterly') {
      date.setMonth(date.getMonth() + 3);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }

    return date.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Bill Account</h2>
              <p className="text-blue-100 font-bold text-sm mt-1">Create invoice for {accountName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-8">
            {/* Dates */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Issue Date
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Recurring Billing */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Recurring Billing</h3>
                  <p className="text-xs text-slate-500 mt-1">Automatically bill this account on a recurring schedule</p>
                </div>
                <button
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    isRecurring ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      isRecurring ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {isRecurring && (
                <div className="space-y-4 animate-slide-up">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                      Billing Cycle
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                          billingCycle === 'monthly'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setBillingCycle('quarterly')}
                        className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                          billingCycle === 'quarterly'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        Quarterly
                      </button>
                      <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                          billingCycle === 'yearly'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        Yearly
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Billing Date</p>
                        <p className="text-sm font-black text-blue-600 mt-1">
                          {getNextBillingDate(issueDate, billingCycle)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recurring Amount</p>
                        <p className="text-sm font-black text-slate-900 mt-1">
                          ${calculations.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-3">
                      Invoices will be automatically generated on the 1st of each {billingCycle === 'monthly' ? 'month' : billingCycle === 'quarterly' ? 'quarter' : 'year'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Line Items
                </label>
                <button
                  onClick={() => setShowItemPicker(!showItemPicker)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                >
                  <Plus size={14} />
                  Add Item
                </button>
              </div>

              {/* Item Picker */}
              {showItemPicker && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-4">
                  <div className="relative mb-4">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search products and services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                    {filteredItems.map(item => (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => addLineItem(item.id, item.type)}
                        className="w-full p-4 bg-white hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-xl transition-all text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm text-slate-900 group-hover:text-blue-600">{item.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                              {item.category} • {item.type}
                              {item.sku && ` • SKU: ${item.sku}`}
                              {item.code && ` • Code: ${item.code}`}
                            </p>
                          </div>
                          <p className="text-lg font-black text-slate-900">${item.unitPrice.toLocaleString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Line Items Table */}
              {lineItems.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-sm font-bold text-slate-400">No items added yet</p>
                  <p className="text-xs text-slate-400 mt-1">Click "Add Item" to add products or services</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateLineItem(index, 'qty', parseFloat(e.target.value))}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                            min="0.01"
                            step="0.01"
                          />
                          <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-1 ml-1">Quantity</p>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value))}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                            min="0"
                            step="0.01"
                          />
                          <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-1 ml-1">Unit Price</p>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.taxRate}
                            onChange={(e) => updateLineItem(index, 'taxRate', parseFloat(e.target.value))}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-1 ml-1">Tax %</p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-lg font-black text-slate-900">${item.lineTotal.toFixed(2)}</p>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => removeLineItem(index)}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals */}
            {lineItems.length > 0 && (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">Subtotal</span>
                    <span className="text-lg font-black text-slate-900">${calculations.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">Tax</span>
                    <span className="text-lg font-black text-slate-900">${calculations.taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-300 flex justify-between items-center">
                    <span className="text-base font-black text-slate-900 uppercase tracking-wider">Total</span>
                    <span className="text-3xl font-black text-blue-600">${calculations.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes & Terms */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Notes (Internal)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all resize-none"
                  placeholder="Internal notes about this invoice..."
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Payment Terms (Customer-Facing)
                </label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={3}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all resize-none"
                  placeholder="Payment terms and conditions..."
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
            onClick={handleSave}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <span className="flex items-center gap-2">
              <DollarSign size={14} />
              Create Invoice
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
