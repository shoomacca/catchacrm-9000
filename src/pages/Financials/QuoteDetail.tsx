import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext';
import { FileText, Building2, Calendar, ChevronLeft, Receipt, Edit3, Trash2, ExternalLink } from 'lucide-react';

const QuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quotes, accounts, deals, products, services, upsertRecord, deleteRecord } = useCRM();
  const [showConvertModal, setShowConvertModal] = useState(false);

  const quote = useMemo(() => quotes.find(q => q.id === id), [quotes, id]);
  const account = useMemo(() =>
    quote ? accounts.find(a => a.id === quote.accountId) : undefined,
    [quote, accounts]
  );
  const deal = useMemo(() =>
    quote?.dealId ? deals.find(d => d.id === quote.dealId) : undefined,
    [quote, deals]
  );

  if (!quote) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FileText size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-lg font-bold text-slate-400">Quote not found</p>
          <button
            onClick={() => navigate('/financials/ledger/quotes')}
            className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-xl text-sm font-black uppercase"
          >
            Back to Quotes
          </button>
        </div>
      </div>
    );
  }

  const handleConvertToInvoice = () => {
    const invoice: any = {
      invoiceNumber: `INV-${Date.now()}`,
      accountId: quote.accountId,
      dealId: quote.dealId || '',
      quoteId: quote.id,
      status: 'Draft',
      paymentStatus: 'unpaid',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: quote.lineItems,
      subtotal: quote.subtotal,
      taxTotal: quote.taxTotal,
      total: quote.total,
      notes: `Converted from quote ${quote.quoteNumber}. ${quote.notes || ''}`,
      terms: quote.terms || 'Payment due within 30 days.'
    };

    upsertRecord('invoices', invoice);

    // Update quote status
    upsertRecord('quotes', { ...quote, status: 'Accepted' });

    setShowConvertModal(false);
    navigate('/financials/ledger/income');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete quote ${quote.quoteNumber}?`)) {
      deleteRecord('quotes', quote.id);
      navigate('/financials/ledger/quotes');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Sent': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Accepted': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'Declined': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'Expired': return 'bg-amber-100 text-amber-600 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Check if quote is expired
  const isExpired = new Date(quote.expiryDate) < new Date() && quote.status !== 'Accepted';

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/financials/ledger/quotes')}
            className="p-3 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quote Details</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{quote.quoteNumber}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {quote.status !== 'Accepted' && (
            <button
              onClick={() => setShowConvertModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:from-violet-700 hover:to-purple-700 transition-all flex items-center gap-2"
            >
              <Receipt size={16} />
              Convert to Invoice
            </button>
          )}
          <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <Edit3 size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[35px] overflow-hidden shadow-sm">
        {/* Status Banner */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <FileText size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{quote.quoteNumber}</h2>
                <p className="text-violet-100 font-bold mt-1">
                  Issued: {quote.issueDate} • Expires: {quote.expiryDate}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-6 py-2 rounded-full text-[10px] font-black uppercase border ${getStatusColor(quote.status)}`}>
                {isExpired ? 'Expired' : quote.status}
              </span>
              <p className="text-3xl font-black text-white mt-2">${quote.total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-8">
          {/* Bill To & Quote Info */}
          <div className="grid grid-cols-2 gap-8">
            {/* Bill To */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={20} className="text-violet-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Bill To</h3>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <Link
                  to={`/entity/accounts/${account?.id}`}
                  className="text-lg font-black text-slate-900 hover:text-violet-600 transition-colors flex items-center gap-2 group"
                >
                  {account?.name}
                  <ExternalLink size={16} className="text-slate-400 group-hover:text-violet-600" />
                </Link>
                {account?.email && (
                  <p className="text-sm text-slate-600 mt-2">{account.email}</p>
                )}
                {account?.phone && (
                  <p className="text-sm text-slate-600">{account.phone}</p>
                )}
                {account?.address && (
                  <p className="text-sm text-slate-600 mt-2">{account.address}</p>
                )}
              </div>
            </div>

            {/* Quote Details */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={20} className="text-violet-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Quote Details</h3>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Date</span>
                  <span className="text-sm font-black text-slate-900">{quote.issueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Date</span>
                  <span className="text-sm font-black text-slate-900">{quote.expiryDate}</span>
                </div>
                {deal && (
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Linked Deal</span>
                    <Link
                      to={`/entity/deals/${deal.id}`}
                      className="text-sm font-black text-violet-600 hover:text-violet-700 flex items-center gap-1"
                    >
                      {deal.name}
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(quote.status)}`}>
                    {isExpired ? 'Expired' : quote.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Line Items</h3>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[9px] text-slate-400">Description</th>
                    <th className="px-6 py-4 text-center font-black uppercase tracking-widest text-[9px] text-slate-400">Qty</th>
                    <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-[9px] text-slate-400">Unit Price</th>
                    <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-[9px] text-slate-400">Tax %</th>
                    <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-[9px] text-slate-400">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quote.lineItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 font-bold text-slate-900">{item.description}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{item.qty}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">{item.taxRate}%</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">${item.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-96 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-600">Subtotal</span>
                <span className="text-lg font-black text-slate-900">${quote.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-600">Tax</span>
                <span className="text-lg font-black text-slate-900">${quote.taxTotal.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t-2 border-slate-300 flex justify-between items-center">
                <span className="text-base font-black text-slate-900 uppercase tracking-wider">Total</span>
                <span className="text-3xl font-black text-violet-600">${quote.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-2 gap-6">
            {quote.notes && (
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Internal Notes</h3>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{quote.notes}</p>
                </div>
              </div>
            )}
            {quote.terms && (
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Terms & Conditions</h3>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{quote.terms}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Convert to Invoice Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[35px] w-full max-w-lg shadow-2xl animate-slide-up">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8 rounded-t-[35px]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Receipt size={28} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Convert to Invoice</h2>
                  <p className="text-violet-100 font-bold text-sm mt-1">Create invoice from this quote</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Quote</span>
                  <span className="text-sm font-black text-slate-900">{quote.quoteNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Account</span>
                  <span className="text-sm font-black text-slate-900">{account?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total</span>
                  <span className="text-lg font-black text-violet-600">${quote.total.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6">
                This will create a new invoice with all line items from this quote. The quote status will be updated to "Accepted".
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConvertModal(false)}
                  className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvertToInvoice}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/20"
                >
                  Create Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteDetail;
