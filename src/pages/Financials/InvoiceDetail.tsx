import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Building2, Mail, Phone, DollarSign, Calendar, FileText,
  Download, Send, CheckCircle2, XCircle, Clock, Edit3, Trash2, Printer,
  CreditCard, Package, MapPin, Loader2
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import PaymentModal from '../../components/PaymentModal';
import { InvoiceComposer } from '../../components/InvoiceComposer';
import { supabase } from '../../lib/supabase';
import { getCurrentOrgId } from '../../services/supabaseData';
import { generateInvoicePDF } from '../../utils/invoicePdf';
import { sendEmail, isGmailConfigured } from '../../utils/sendEmail';
import jsPDF from 'jspdf';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, accounts, deals, quotes, products, services, deleteRecord, recordPayment } = useCRM();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceComposer, setShowInvoiceComposer] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [orgDetails, setOrgDetails] = useState<any>(null);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  // Handle email invoice with PDF attachment
  const handleEmailInvoice = async () => {
    if (!invoice || !account || !orgDetails) return;

    // Clear previous status
    setEmailStatus(null);

    // Check if recipient has email
    if (!account.email) {
      setEmailStatus({
        type: 'error',
        message: 'Customer email address not found. Please add an email to the account first.',
      });
      return;
    }

    // Check if Gmail is configured
    const gmailConfigured = await isGmailConfigured();
    if (!gmailConfigured) {
      setEmailStatus({
        type: 'error',
        message: 'Gmail is not configured. Please set up Gmail OAuth in Settings > Business Details.',
      });
      return;
    }

    setIsEmailSending(true);

    try {
      // Generate PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      // Helper function for wrapped text
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.4);
      };

      // Company header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(orgDetails.name || 'Your Company', margin, yPos + 5);

      doc.setFontSize(22);
      doc.setTextColor(41, 128, 185);
      doc.text('TAX INVOICE', pageWidth - margin - 60, yPos + 5);
      yPos += 15;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);

      if (orgDetails.abn) {
        doc.text(`ABN: ${orgDetails.abn}`, margin, yPos);
        yPos += 5;
      }

      if (orgDetails.address_line1) doc.text(orgDetails.address_line1, margin, yPos), yPos += 5;
      if (orgDetails.address_line2) doc.text(orgDetails.address_line2, margin, yPos), yPos += 5;

      const cityLine = [orgDetails.city, orgDetails.state, orgDetails.postcode].filter(Boolean).join(', ');
      if (cityLine) doc.text(cityLine, margin, yPos), yPos += 5;
      if (orgDetails.phone) doc.text(`Phone: ${orgDetails.phone}`, margin, yPos), yPos += 5;
      if (orgDetails.email) doc.text(`Email: ${orgDetails.email}`, margin, yPos), yPos += 5;

      // Invoice details (right side)
      yPos = margin + 15;
      const invoiceDetailsX = pageWidth - margin - 55;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice Number:', invoiceDetailsX, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.invoiceNumber, invoiceDetailsX + 35, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Issue Date:', invoiceDetailsX, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(invoice.issueDate).toLocaleDateString('en-AU'), invoiceDetailsX + 35, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Due Date:', invoiceDetailsX, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(invoice.dueDate).toLocaleDateString('en-AU'), invoiceDetailsX + 35, yPos);
      yPos = Math.max(yPos + 10, 75);

      // Bill To
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('BILL TO:', margin, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.text(account.name, margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      if (account.email) doc.text(account.email, margin, yPos), yPos += 5;
      if (account.phone) doc.text(account.phone, margin, yPos), yPos += 5;
      yPos += 10;

      // Line items table
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      const colX = {
        description: margin,
        qty: pageWidth - 120,
        unitPrice: pageWidth - 95,
        taxRate: pageWidth - 70,
        amount: pageWidth - margin - 30
      };

      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('DESCRIPTION', colX.description, yPos);
      doc.text('QTY', colX.qty, yPos);
      doc.text('PRICE', colX.unitPrice, yPos);
      doc.text('TAX', colX.taxRate, yPos);
      doc.text('AMOUNT', colX.amount, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      invoice.lineItems.forEach((item, index) => {
        doc.text(item.description, colX.description, yPos);
        doc.text(String(item.qty), colX.qty, yPos);
        doc.text(`$${item.unitPrice.toFixed(2)}`, colX.unitPrice, yPos);
        doc.text(`${item.taxRate}%`, colX.taxRate, yPos);
        doc.text(`$${item.lineTotal.toFixed(2)}`, colX.amount, yPos, { align: 'right' });
        yPos += 7;
        if (index < invoice.lineItems.length - 1) {
          doc.setDrawColor(230, 230, 230);
          doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
        }
      });

      yPos += 5;

      // Totals
      const totalsX = pageWidth - margin - 60;
      doc.setDrawColor(200, 200, 200);
      doc.line(totalsX - 5, yPos, pageWidth - margin, yPos);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Subtotal:', totalsX, yPos);
      doc.text(`$${invoice.subtotal.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });
      yPos += 7;
      doc.text('GST (10%):', totalsX, yPos);
      doc.text(`$${invoice.taxTotal.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });
      yPos += 7;
      doc.setDrawColor(0, 0, 0);
      doc.line(totalsX - 5, yPos - 2, pageWidth - margin, yPos - 2);
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('TOTAL:', totalsX, yPos);
      doc.text(`$${invoice.total.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });

      // Get PDF as base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const filename = `${invoice.invoiceNumber}.pdf`;

      // Prepare email body
      const emailBody = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #2563eb;">Invoice ${invoice.invoiceNumber}</h2>
            <p>Dear ${account.name},</p>
            <p>Please find attached invoice <strong>${invoice.invoiceNumber}</strong> for your records.</p>
            <table style="border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px; font-weight: bold;">Invoice Number:</td>
                <td style="padding: 8px;">${invoice.invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Issue Date:</td>
                <td style="padding: 8px;">${new Date(invoice.issueDate).toLocaleDateString('en-AU')}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Due Date:</td>
                <td style="padding: 8px;">${new Date(invoice.dueDate).toLocaleDateString('en-AU')}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Total Amount:</td>
                <td style="padding: 8px; font-size: 18px; color: #2563eb;"><strong>$${invoice.total.toFixed(2)} AUD</strong></td>
              </tr>
            </table>
            ${orgDetails.bank_name ? `
              <h3 style="color: #2563eb; margin-top: 30px;">Payment Details</h3>
              <table style="border-collapse: collapse;">
                <tr><td style="padding: 4px; font-weight: bold;">Bank:</td><td style="padding: 4px;">${orgDetails.bank_name}</td></tr>
                ${orgDetails.bank_bsb ? `<tr><td style="padding: 4px; font-weight: bold;">BSB:</td><td style="padding: 4px;">${orgDetails.bank_bsb}</td></tr>` : ''}
                ${orgDetails.bank_account_number ? `<tr><td style="padding: 4px; font-weight: bold;">Account Number:</td><td style="padding: 4px;">${orgDetails.bank_account_number}</td></tr>` : ''}
                ${orgDetails.bank_account_name ? `<tr><td style="padding: 4px; font-weight: bold;">Account Name:</td><td style="padding: 4px;">${orgDetails.bank_account_name}</td></tr>` : ''}
              </table>
            ` : ''}
            <p style="margin-top: 30px;">If you have any questions about this invoice, please don't hesitate to contact us.</p>
            <p>Thank you for your business!</p>
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              ${orgDetails.name}<br/>
              ${orgDetails.email ? `${orgDetails.email}<br/>` : ''}
              ${orgDetails.phone ? `${orgDetails.phone}` : ''}
            </p>
          </body>
        </html>
      `;

      // Send email
      const result = await sendEmail({
        to: account.email,
        subject: `Invoice ${invoice.invoiceNumber} from ${orgDetails.name}`,
        body: emailBody,
        attachments: [
          {
            filename,
            content: pdfBase64,
            mimeType: 'application/pdf',
          },
        ],
      });

      setIsEmailSending(false);

      if (result.success) {
        setEmailStatus({
          type: 'success',
          message: `Invoice sent successfully to ${account.email}`,
        });
        // Auto-clear success message after 5 seconds
        setTimeout(() => setEmailStatus(null), 5000);
      } else {
        setEmailStatus({
          type: 'error',
          message: result.error || 'Failed to send invoice. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      setIsEmailSending(false);
      setEmailStatus({
        type: 'error',
        message: error.message || 'Failed to send invoice. Please try again.',
      });
    }
  };

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
      {/* Email Status Toast */}
      {emailStatus && (
        <div
          className={`fixed top-4 right-4 z-50 ${
            emailStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          } border-2 rounded-2xl p-6 shadow-lg max-w-md animate-slide-up`}
        >
          <div className="flex items-start gap-4">
            {emailStatus.type === 'success' ? (
              <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle size={24} className="text-rose-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-bold text-sm">{emailStatus.message}</p>
              {emailStatus.type === 'error' && (
                <button
                  onClick={() => setEmailStatus(null)}
                  className="text-xs underline mt-2 hover:no-underline"
                >
                  Dismiss
                </button>
              )}
            </div>
            <button
              onClick={() => setEmailStatus(null)}
              className="text-slate-400 hover:text-slate-600 flex-shrink-0"
            >
              <XCircle size={18} />
            </button>
          </div>
        </div>
      )}

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
              if (orgDetails) {
                generateInvoicePDF(invoice, account, orgDetails);
              } else {
                alert('Loading organization details... Please try again in a moment.');
              }
            }}
            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all"
            title="Download PDF"
          >
            <Download size={18} />
          </button>
          <button
            onClick={handleEmailInvoice}
            disabled={isEmailSending}
            className={`flex items-center gap-2 ${
              isEmailSending ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 active:scale-95'
            } text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-purple-500/20 transition-all`}
            title="Email Invoice"
          >
            {isEmailSending ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send size={18} /> Email Invoice
              </>
            )}
          </button>
          <button
            onClick={() => deleteRecord('invoices', invoice.id)}
            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => { setEditingInvoice(invoice); setShowInvoiceComposer(true); }}
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
          {/* Company Header */}
          {orgDetails && (
            <div className="flex items-start justify-between pb-8 border-b border-slate-200">
              <div className="flex items-start gap-6">
                {orgDetails.logo_url && (
                  <img
                    src={orgDetails.logo_url}
                    alt={orgDetails.name}
                    className="w-20 h-20 object-contain rounded-xl border border-slate-200"
                  />
                )}
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{orgDetails.name}</h3>
                  {orgDetails.abn && (
                    <p className="text-xs font-bold text-slate-500 mb-3">
                      ABN: {orgDetails.abn}
                    </p>
                  )}
                  <div className="space-y-1 text-sm text-slate-600">
                    {orgDetails.address_line1 && (
                      <>
                        <p>{orgDetails.address_line1}</p>
                        {orgDetails.address_line2 && <p>{orgDetails.address_line2}</p>}
                        <p>
                          {[orgDetails.city, orgDetails.state, orgDetails.postcode].filter(Boolean).join(', ')}
                          {orgDetails.country && `, ${orgDetails.country}`}
                        </p>
                      </>
                    )}
                    {orgDetails.phone && (
                      <p className="flex items-center gap-2 mt-3">
                        <Phone size={12} className="text-slate-400" /> {orgDetails.phone}
                      </p>
                    )}
                    {orgDetails.email && (
                      <p className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-400" /> {orgDetails.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

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

          {/* Bank Details */}
          {orgDetails && (orgDetails.bank_name || orgDetails.bank_bsb || orgDetails.bank_account_number) && (
            <div className="bg-slate-50 border border-slate-200 rounded-[30px] p-8">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Building2 size={14} className="text-blue-600" /> Bank Details for Payment
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {orgDetails.bank_name && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bank Name</p>
                    <p className="text-sm font-bold text-slate-900">{orgDetails.bank_name}</p>
                  </div>
                )}
                {orgDetails.bank_bsb && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">BSB</p>
                    <p className="text-sm font-bold text-slate-900">{orgDetails.bank_bsb}</p>
                  </div>
                )}
                {orgDetails.bank_account_number && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Account Number</p>
                    <p className="text-sm font-bold text-slate-900">{orgDetails.bank_account_number}</p>
                  </div>
                )}
                {orgDetails.bank_account_name && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Account Name</p>
                    <p className="text-sm font-bold text-slate-900">{orgDetails.bank_account_name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms || (orgDetails?.invoice_notes) || (orgDetails?.invoice_footer)) && (
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
              {orgDetails?.invoice_notes && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-[30px] p-8">
                  <h3 className="text-[11px] font-black text-indigo-800 uppercase tracking-widest mb-4">
                    Invoice Notes
                  </h3>
                  <p className="text-sm text-indigo-900 whitespace-pre-line">{orgDetails.invoice_notes}</p>
                </div>
              )}
              {orgDetails?.invoice_footer && (
                <div className="bg-slate-50 border border-slate-200 rounded-[30px] p-8">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Footer
                  </h3>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{orgDetails.invoice_footer}</p>
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

      <InvoiceComposer
        isOpen={showInvoiceComposer}
        onClose={() => {
          setShowInvoiceComposer(false);
          setEditingInvoice(null);
        }}
        initialData={editingInvoice || undefined}
        mode={editingInvoice ? 'edit' : 'create'}
      />
    </div>
  );
};

export default InvoiceDetail;
