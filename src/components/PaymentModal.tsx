import React, { useState } from 'react';
import { X, CreditCard, Banknote, Building, FileText, DollarSign } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNumber: string;
  invoiceTotal: number;
  amountPaid: number;
  onRecordPayment: (payment: {
    amount: number;
    method: 'cash' | 'card' | 'bank_transfer' | 'check';
    reference?: string;
    note?: string;
  }) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoiceNumber,
  invoiceTotal,
  amountPaid,
  onRecordPayment,
}) => {
  const remainingBalance = invoiceTotal - amountPaid;
  const [amount, setAmount] = useState(remainingBalance.toFixed(2));
  const [method, setMethod] = useState<'cash' | 'card' | 'bank_transfer' | 'check'>('card');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) return;

    onRecordPayment({
      amount: paymentAmount,
      method,
      reference: reference || undefined,
      note: note || undefined,
    });
    onClose();
  };

  const paymentMethods = [
    { value: 'card', label: 'Card', icon: CreditCard },
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: Building },
    { value: 'check', label: 'Check', icon: FileText },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[35px] w-full max-w-md shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Record Payment</h2>
              <p className="text-emerald-100 text-sm font-medium">{invoiceNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 font-medium">Invoice Total</span>
            <span className="font-bold text-slate-900">${invoiceTotal.toFixed(2)}</span>
          </div>
          {amountPaid > 0 && (
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-slate-600 font-medium">Already Paid</span>
              <span className="font-bold text-emerald-600">-${amountPaid.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
            <span className="text-slate-900 font-bold">Remaining Balance</span>
            <span className="font-black text-lg text-slate-900">${remainingBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Payment Amount
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remainingBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold text-lg"
                required
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setAmount(remainingBalance.toFixed(2))}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Pay Full Amount
              </button>
              <button
                type="button"
                onClick={() => setAmount((remainingBalance / 2).toFixed(2))}
                className="text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Pay Half
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {paymentMethods.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMethod(value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    method === value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-bold uppercase">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Reference Number <span className="text-slate-300">(Optional)</span>
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g., TXN-12345"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-medium"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Note <span className="text-slate-300">(Optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Additional payment notes..."
              rows={2}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-medium resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
