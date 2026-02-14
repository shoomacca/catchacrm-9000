import React, { useState } from 'react';
import { X, FileText, Building2, Calendar, DollarSign, FileCheck } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Invoice } from '../types';

interface InvoiceComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Invoice>;
  mode?: 'create' | 'edit';
}

export const InvoiceComposer: React.FC<InvoiceComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const { upsertRecord, accounts } = useCRM();

  const [accountId, setAccountId] = useState(initialData?.accountId || '');
  const [issueDate, setIssueDate] = useState(initialData?.issueDate || initialData?.invoiceDate || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [status, setStatus] = useState(initialData?.status || 'Draft');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = () => {
    if (!accountId) {
      alert('Please select an account');
      return;
    }
    if (!issueDate) {
      alert('Please select an issue date');
      return;
    }
    if (!dueDate) {
      alert('Please select a due date');
      return;
    }

    const invoice: Partial<Invoice> = {
      ...(initialData?.id && { id: initialData.id }),
      accountId,
      issueDate,
      invoiceDate: issueDate,
      dueDate,
      status,
      paymentStatus: 'unpaid',
      notes: notes.trim() || undefined,
      invoiceNumber: initialData?.invoiceNumber || '',
      lineItems: initialData?.lineItems || [],
      subtotal: initialData?.subtotal || 0,
      taxTotal: initialData?.taxTotal || 0,
      total: initialData?.total || 0,
    };

    upsertRecord('invoices', invoice);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 relative">
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
              <h2 className="text-3xl font-black text-white tracking-tight">
                {mode === 'create' ? 'New Invoice' : 'Edit Invoice'}
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">
                {mode === 'create' ? 'Create a new invoice' : 'Update invoice details'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Account *
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Issue Date *
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Due Date *
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Status
              </label>
              <div className="relative">
                <FileCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Payment terms, special instructions..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all resize-none"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-blue-900">
                💡 <strong>Tip:</strong> Line items and amounts can be added after creating the invoice in the invoice detail view.
              </p>
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
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/20"
          >
            {mode === 'create' ? 'Create Invoice' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
