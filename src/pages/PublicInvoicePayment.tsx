/**
 * Public Invoice Payment Page
 *
 * Allows customers to pay invoices via a secure public link (no auth required)
 * URL: /invoice/pay/:paymentToken
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, AlertCircle, FileText, Calendar, Building2, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PaymentCollect from '../components/PaymentCollect';
import type { Invoice, Account } from '../types';

interface InvoiceData {
  invoice: Invoice;
  account: Account;
  organization: {
    id: string;
    name: string;
    logo_url?: string;
    email?: string;
    phone?: string;
  };
}

const PublicInvoicePayment: React.FC = () => {
  const { paymentToken } = useParams<{ paymentToken: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentToken) {
      setError('Invalid payment link');
      setLoading(false);
      return;
    }

    fetchInvoiceData();
  }, [paymentToken]);

  const fetchInvoiceData = async () => {
    try {
      // Fetch invoice by payment_token (public access - no auth required)
      const { data: invoiceRow, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('payment_token', paymentToken)
        .single();

      if (invoiceError || !invoiceRow) {
        setError('Invoice not found or payment link is invalid');
        setLoading(false);
        return;
      }

      // Check if invoice is already paid
      if (invoiceRow.status === 'Paid') {
        setPaymentSuccess(true);
        setLoading(false);
        return;
      }

      // Fetch account details
      const { data: accountRow, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', invoiceRow.accountId)
        .single();

      if (accountError || !accountRow) {
        setError('Unable to load invoice details');
        setLoading(false);
        return;
      }

      // Fetch organization details
      const { data: orgRow, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, logo_url, email, phone')
        .eq('id', invoiceRow.organizationId)
        .single();

      if (orgError || !orgRow) {
        setError('Unable to load organization details');
        setLoading(false);
        return;
      }

      setInvoiceData({
        invoice: invoiceRow as Invoice,
        account: accountRow as Account,
        organization: orgRow,
      });
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching invoice:', err);
      setError('Failed to load invoice. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (transaction: any) => {
    if (!invoiceData) return;

    try {
      // Mark invoice as paid
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          status: 'Paid',
          paymentStatus: 'paid',
          paidAt: new Date().toISOString(),
        })
        .eq('id', invoiceData.invoice.id);

      if (updateError) {
        console.error('Error updating invoice:', updateError);
        setPaymentError('Payment received but failed to update invoice. Please contact support.');
        return;
      }

      setPaymentSuccess(true);
    } catch (err: any) {
      console.error('Error handling payment success:', err);
      setPaymentError('Payment received but failed to update invoice. Please contact support.');
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setPaymentError(errorMessage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <Loader2 size={48} className="mx-auto text-blue-600 animate-spin mb-4" />
          <p className="text-lg font-bold text-slate-700">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <AlertCircle size={48} className="mx-auto text-rose-600 mb-4" />
          <h1 className="text-2xl font-black text-slate-900 mb-2">Unable to Load Invoice</h1>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-600 mb-6">
            Thank you for your payment. Invoice {invoiceData?.invoice.invoiceNumber} has been marked as paid.
          </p>
          {invoiceData?.organization.email && (
            <p className="text-xs text-slate-500">
              A receipt has been sent to your email address.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return null;
  }

  const { invoice, account, organization } = invoiceData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              {organization.logo_url && (
                <img
                  src={organization.logo_url}
                  alt={organization.name}
                  className="w-16 h-16 object-contain bg-white rounded-xl p-2"
                />
              )}
              <div>
                <h1 className="text-3xl font-black">{organization.name}</h1>
                {organization.email && (
                  <p className="text-blue-100 text-sm">{organization.email}</p>
                )}
              </div>
            </div>
            <div className="border-t border-blue-400 pt-4">
              <p className="text-blue-100 text-sm font-bold mb-1">Invoice Payment</p>
              <p className="text-2xl font-black">Invoice #{invoice.invoiceNumber}</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Building2 size={14} className="text-blue-600" /> Bill To
                </h3>
                <p className="text-lg font-black text-slate-900">{account.name}</p>
                {account.email && (
                  <p className="text-sm text-slate-600 mt-1">{account.email}</p>
                )}
              </div>

              <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Calendar size={14} className="text-emerald-600" /> Invoice Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Issue Date:</span>
                    <span className="font-bold text-slate-900">
                      {new Date(invoice.issueDate).toLocaleDateString('en-AU')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Due Date:</span>
                    <span className="font-bold text-slate-900">
                      {new Date(invoice.dueDate).toLocaleDateString('en-AU')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Summary */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText size={14} className="text-purple-600" /> Invoice Items
              </h3>
              <div className="space-y-3">
                {invoice.lineItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{item.description}</p>
                      <p className="text-xs text-slate-500">
                        {item.qty} × ${item.unitPrice.toFixed(2)} + {item.taxRate}% GST
                      </p>
                    </div>
                    <p className="text-base font-black text-slate-900">
                      ${(item.lineTotal * (1 + item.taxRate / 100)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-bold text-slate-900">${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">GST (10%):</span>
                  <span className="font-bold text-slate-900">${invoice.taxTotal.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t-2 border-blue-300 flex justify-between items-center">
                  <span className="text-lg font-black text-slate-900 uppercase">Total Amount:</span>
                  <span className="text-3xl font-black text-blue-600">${invoice.total.toFixed(2)} AUD</span>
                </div>
              </div>
            </div>

            {/* Payment Error */}
            {paymentError && (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} className="text-rose-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-rose-900">Payment Error</p>
                    <p className="text-sm text-rose-700 mt-1">{paymentError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Section */}
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-emerald-600" /> Complete Payment
              </h3>
              <PaymentCollect
                orgId={organization.id}
                amount={invoice.total}
                currency="aud"
                description={`Payment for Invoice ${invoice.invoiceNumber}`}
                contactId={account.id}
                contactName={account.name}
                contactEmail={account.email}
                invoiceId={invoice.id}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-600">
          <p>
            Questions about this invoice? Contact {organization.name}
            {organization.email && (
              <span> at <a href={`mailto:${organization.email}`} className="text-blue-600 hover:underline">{organization.email}</a></span>
            )}
            {organization.phone && <span> or call {organization.phone}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicInvoicePayment;
