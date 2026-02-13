import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Building2, Mail, Phone, DollarSign, Calendar, FileText,
  Download, Send, CheckCircle2, XCircle, Clock, Edit3, Trash2, Printer,
  CreditCard, Package, MapPin
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import PaymentModal from '../../components/PaymentModal';
import { supabase } from '../../lib/supabase';
import { getCurrentOrgId } from '../../services/supabaseData';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, accounts, deals, quotes, products, services, openModal, deleteRecord, recordPayment } = useCRM();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orgDetails, setOrgDetails] = useState<any>(null);

  const invoice = useMemo(() => invoices.find(inv => inv.id === id), [invoices, id]);
  const account = useMemo(() => accounts.find(a => a.id === invoice?.accountId), [accounts, invoice]);
  const deal = useMemo(() => deals.find(d => d.id === invoice?.dealId), [deals, invoice]);
  const quote = useMemo(() => quotes.find(q => q.id === invoice?.quoteId), [quotes, invoice]);

  // Load organization details
  useEffect(() => {
    const loadOrgDetails = async () => {
      try {
        const orgId = await getCurrentOrgId();
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();

        if (org) {
          setOrgDetails(org);
        }
      } catch (error) {
        console.error('Error loading organization details:', error);
      }
    };

    loadOrgDetails();
  }, []);

  // Calculate if invoice is overdue
  const isOverdue = invoice && invoice.status !== 'Paid' && new Date(invoice.dueDate) < new Date();

  if (!invoice) {
    return (
      <div className="p-20 text-center">
        <p className="text-xl font-black text-slate-900">Invoice not found</p>
        <button
          onClick={() => navigate('/financials/ledger/income')}
          className="mt-4 text-blue-600 hover:underline font-bold"
        >
          Return to Income Ledger
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Overdue':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'Draft':
        return 'bg-slate-50 text-slate-500 border-slate-200';
      case 'Sent':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-400 border-slate-200';
    }
  };

  const getItemDetails = (item: typeof invoice.lineItems[0]) => {
    if (item.itemType === 'product') {
      const product = products.find(p => p.id === item.itemId);
      return { name: product?.name || item.description, sku: product?.sku };
    } else {
      const service = services.find(s => s.id === item.itemId);
      return { name: service?.name || item.description, code: service?.code };
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto animate-slide-up pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/financials/ledger/income')}
            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">
              <span>Invoice</span>
              <span className="text-slate-200">/</span>
              <span className="text-blue-600">{invoice.invoiceNumber}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              {account?.name || 'Unknown Account'}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
            title="Print Invoice"
          >
            <Printer size={18} />
          </button>
          <button
            onClick={() => {
              // Generate printable view and trigger browser's save as PDF
              const printWindow = window.open('', '_blank');
              if (printWindow) {
                printWindow.document.write(`
                  <html>
                    <head>
                      <title>Invoice ${invoice.invoiceNumber}</title>
                      <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                        .invoice-number { font-size: 24px; font-weight: bold; color: #1e3a8a; }
                        .status { padding: 8px 16px; border-radius: 8px; font-weight: bold; }
                        .status-paid { background: #dcfce7; color: #166534; }
                        .status-sent { background: #dbeafe; color: #1e40af; }
                        .status-overdue { background: #fee2e2; color: #991b1b; }
                        .status-draft { background: #f1f5f9; color: #64748b; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                        th { background: #f8fafc; font-size: 11px; text-transform: uppercase; color: #64748b; }
                        .total-row { font-size: 18px; font-weight: bold; }
                        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; }
                      </style>
                    </head>
                    <body>
                      <div class="header">
                        <div>
                          <div class="invoice-number">${invoice.invoiceNumber}</div>
                          <div>Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}</div>
                          <div>Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</div>
                        </div>
                        <div class="status status-${invoice.status.toLowerCase()}">${invoice.status}</div>
                      </div>
                      <div><strong>Bill To:</strong> ${account?.name || 'N/A'}</div>
                      <table>
                        <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Total</th></tr></thead>
                        <tbody>
                          ${invoice.lineItems.map(item => `
                            <tr>
                              <td>${item.description}</td>
                              <td>${item.qty}</td>
                              <td>$${item.unitPrice.toFixed(2)}</td>
                              <td>${item.taxRate}%</td>
                              <td>$${item.lineTotal.toFixed(2)}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                      <div class="footer">
                        <div>Subtotal: $${invoice.subtotal.toFixed(2)}</div>
                        <div>Tax: $${invoice.taxTotal.toFixed(2)}</div>
                        <div class="total-row">Total: $${invoice.total.toFixed(2)}</div>
                      </div>
                      <script>window.print(); window.onafterprint = function() { window.close(); };</script>
                    </body>
                  </html>
                `);
                printWindow.document.close();
              }
            }}
            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all"
            title="Download as PDF (Print to PDF)"
          >
            <Download size={18} />
          </button>
          <button
            onClick={() => {
              // Copy invoice details to clipboard for email
              const emailBody = `Invoice ${invoice.invoiceNumber}\n\nBill To: ${account?.name || 'N/A'}\nIssue Date: ${new Date(invoice.issueDate).toLocaleDateString()}\nDue Date: ${new Date(invoice.dueDate).toLocaleDateString()}\nTotal: $${invoice.total.toFixed(2)}\nStatus: ${invoice.status}`;
              const mailtoLink = `mailto:${account?.email || ''}?subject=Invoice ${invoice.invoiceNumber}&body=${encodeURIComponent(emailBody)}`;
              window.open(mailtoLink, '_self');
            }}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
            title="Email Invoice"
          >
            <Send size={18} /> Email Invoice
          </button>
          <button
            onClick={() => deleteRecord('invoices', invoice.id)}
            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => openModal('invoices', invoice)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Edit3 size={18} /> Edit Invoice
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white border border-slate-200 rounded-[45px] shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-12 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-black mb-2">{invoice.invoiceNumber}</h2>
              <p className="text-blue-100 font-bold">
                {invoice.status === 'Paid' ? 'Payment Received' : invoice.status}
              </p>
            </div>
            <div className={`px-6 py-3 rounded-2xl border-2 font-black text-lg ${getStatusColor(invoice.status)}`}>
              {invoice.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-12 space-y-12">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bill To */}
            <div className="bg-slate-50 border border-slate-100 rounded-[30px] p-8">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Building2 size={14} className="text-blue-600" /> Bill To
              </h3>
              {account ? (
                <div className="space-y-3">
                  <Link
                    to={`/accounts/${account.id}`}
                    className="text-xl font-black text-slate-900 hover:text-blue-600 transition-colors block"
                  >
                    {account.name}
                  </Link>
                  {account.email && (
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} className="text-slate-400" /> {account.email}
                    </p>
                  )}
                  {account.phone && (
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={14} className="text-slate-400" /> {account.phone}
                    </p>
                  )}
                  {account.billingAddress && (
                    <p className="text-sm text-slate-600 mt-4">
                      {account.billingAddress.street}<br />
                      {account.billingAddress.suburb}, {account.billingAddress.state} {account.billingAddress.postcode}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-400">Account information not available</p>
              )}
            </div>

            {/* Invoice Details */}
            <div className="bg-slate-50 border border-slate-100 rounded-[30px] p-8">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FileText size={14} className="text-emerald-600" /> Invoice Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Date</span>
                  <span className="text-sm font-bold text-slate-900">
                    {new Date(invoice.issueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</span>
                  <span className="text-sm font-bold text-slate-900">
                    {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {invoice.paidAt && (
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid On</span>
                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                      <CheckCircle2 size={14} />
                      {new Date(invoice.paidAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {deal && (
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Deal</span>
                    <Link
                      to={`/deals/${deal.id}`}
                      className="text-sm font-bold text-blue-600 hover:underline"
                    >
                      {deal.name}
                    </Link>
                  </div>
                )}
                {quote && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Quote</span>
                    <span className="text-sm font-bold text-slate-900">{quote.quoteNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Package size={14} className="text-purple-600" /> Line Items
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-[30px] overflow-hidden">
              {/* Header */}
              <div className="bg-slate-100 px-8 py-4 grid grid-cols-12 gap-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-right">Quantity</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-1 text-right">Tax</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Items */}
              {invoice.lineItems.map((item, index) => {
                const details = getItemDetails(item);
                return (
                  <div
                    key={index}
                    className="px-8 py-6 grid grid-cols-12 gap-4 border-b border-slate-200 last:border-0 hover:bg-white transition-colors"
                  >
                    <div className="col-span-5">
                      <p className="text-sm font-black text-slate-900">{details.name}</p>
                      {(details.sku || details.code) && (
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
                          {item.itemType === 'product' ? `SKU: ${details.sku}` : `Code: ${details.code}`}
                        </p>
                      )}
                      {item.description !== details.name && (
                        <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-sm font-bold text-slate-900">{item.qty}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-sm font-bold text-slate-900">${item.unitPrice.toFixed(2)}</p>
                    </div>
                    <div className="col-span-1 text-right">
                      <p className="text-sm font-bold text-slate-900">{item.taxRate}%</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-base font-black text-slate-900">${item.lineTotal.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}

              {/* Totals */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 px-8 py-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-600">Subtotal</span>
                  <span className="font-black text-slate-900">${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-600">Tax</span>
                  <span className="font-black text-slate-900">${invoice.taxTotal.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-slate-300 flex justify-between items-center">
                  <span className="text-lg font-black text-slate-900 uppercase tracking-wider">Total</span>
                  <span className="text-3xl font-black text-blue-600">${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {invoice.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-[30px] p-8">
                  <h3 className="text-[11px] font-black text-amber-800 uppercase tracking-widest mb-4">
                    Internal Notes
                  </h3>
                  <p className="text-sm text-amber-900 whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div className="bg-blue-50 border border-blue-200 rounded-[30px] p-8">
                  <h3 className="text-[11px] font-black text-blue-800 uppercase tracking-widest mb-4">
                    Payment Terms
                  </h3>
                  <p className="text-sm text-blue-900 whitespace-pre-line">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* Payment Status Banner */}
          {invoice.status !== 'Paid' && (
            <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-[30px] p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
                  {invoice.status === 'Overdue' ? (
                    <XCircle size={24} className="text-rose-600" />
                  ) : (
                    <Clock size={24} className="text-orange-600" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900">
                    {invoice.status === 'Overdue'
                      ? 'Payment Overdue'
                      : invoice.status === 'Sent'
                      ? 'Payment Pending'
                      : 'Draft Invoice'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {invoice.status === 'Overdue'
                      ? `Due ${Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                      : invoice.status === 'Sent'
                      ? `Due ${new Date(invoice.dueDate).toLocaleDateString()}`
                      : 'This invoice has not been sent yet'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
              >
                <CreditCard size={16} /> Record Payment
              </button>
            </div>
          )}

          {invoice.status === 'Paid' && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-[30px] p-8 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={24} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">Payment Received</p>
                <p className="text-sm text-slate-600">
                  This invoice was paid on {new Date(invoice.paidAt!).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Payment History */}
          {invoice.credits && invoice.credits.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-[30px] p-8">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CreditCard size={14} className="text-emerald-600" /> Payment History
              </h3>
              <div className="space-y-3">
                {invoice.credits.map((credit, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{credit.reason}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(credit.appliedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className="text-lg font-black text-emerald-600">+${credit.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoiceNumber={invoice.invoiceNumber}
        invoiceTotal={invoice.total}
        amountPaid={(invoice.credits || []).reduce((sum, c) => sum + c.amount, 0)}
        onRecordPayment={(payment) => {
          recordPayment(invoice.id, payment);
        }}
      />
    </div>
  );
};

export default InvoiceDetail;
