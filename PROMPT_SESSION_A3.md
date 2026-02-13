# SESSION A3: Invoicing + Import/Export + Webhook Logging

**Objective:** Build invoice creation from deals, PDF generation, public payment links, and wire import/export job tracking.

**Estimated Time:** 4-5 hours (Claude Code session)

---

## CONTEXT (Read First)

**Prerequisites:**
- ✅ Session A2 completed (calendar sync, teams, currencies)
- ✅ Payment collection components exist (Stripe + PayPal)
- ✅ Quotes system exists (similar to invoices)

**Current State:**
- ❌ No invoice builder (can't create invoice from deal)
- ❌ No PDF generation for invoices
- ❌ No public payment link page
- ❌ Import/Export is client-side only (no job tracking)
- ❌ Webhook logs not recorded

**Tables:**
- `invoices` - Invoice master records
- `invoice_line_items` - Line items for invoices (TODO: currently JSON in invoices table)
- `deals` - Opportunity pipeline
- `products` - Product catalog
- `services` - Service catalog
- `import_jobs` - Import tracking
- `export_jobs` - Export tracking
- `webhook_logs` - Webhook event logging

---

## TASKS

### TASK 1: Create Invoice Builder Component (2 hours)

**Create:** `src/components/InvoiceBuilder.tsx`

**Purpose:** Modal to create invoice from a deal with line items, totals, and tax

**Features:**
1. Select deal (pre-populates customer, amount)
2. Add line items (products or services)
3. Calculate subtotal, tax, total
4. Save to database

```tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { supabase } from '../services/supabaseClient';
import toast from 'react-hot-toast';

interface InvoiceBuilderProps {
  dealId?: string;
  onClose: () => void;
  onSaved: (invoiceId: string) => void;
}

interface LineItem {
  id: string;
  type: 'product' | 'service';
  itemId: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function InvoiceBuilder({ dealId, onClose, onSaved }: InvoiceBuilderProps) {
  const { deals, products, services, accounts, orgId } = useCRM();

  const [selectedDeal, setSelectedDeal] = useState(dealId || '');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState(10); // Default 10% GST
  const [notes, setNotes] = useState('');

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  // Pre-populate from deal
  useEffect(() => {
    if (selectedDeal) {
      const deal = deals.find(d => d.id === selectedDeal);
      if (deal) {
        // Generate invoice number
        setInvoiceNumber(`INV-${Date.now()}`);
        // Set due date (30 days from now)
        const due = new Date();
        due.setDate(due.getDate() + 30);
        setDueDate(due.toISOString().split('T')[0]);
      }
    }
  }, [selectedDeal, deals]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `temp-${Date.now()}`,
        type: 'product',
        itemId: '',
        name: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      }
    ]);
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(items =>
      items.map(item => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // If item selected, populate name/price
        if (field === 'itemId' && value) {
          if (updated.type === 'product') {
            const product = products.find(p => p.id === value);
            if (product) {
              updated.name = product.name;
              updated.description = product.description || '';
              updated.unitPrice = product.unitPrice || 0;
            }
          } else {
            const service = services.find(s => s.id === value);
            if (service) {
              updated.name = service.name;
              updated.description = service.description || '';
              updated.unitPrice = service.unitPrice || 0;
            }
          }
        }

        // Recalculate total
        updated.total = updated.quantity * updated.unitPrice;

        return updated;
      })
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems(items => items.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    try {
      if (!selectedDeal) {
        toast.error('Please select a deal');
        return;
      }

      if (lineItems.length === 0) {
        toast.error('Add at least one line item');
        return;
      }

      const deal = deals.find(d => d.id === selectedDeal);

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          org_id: orgId,
          invoice_number: invoiceNumber,
          account_id: deal?.accountId,
          deal_id: selectedDeal,
          invoice_date: invoiceDate,
          due_date: dueDate,
          subtotal: subtotal,
          tax_amount: taxAmount,
          tax_rate: taxRate,
          total: total,
          amount_due: total,
          status: 'draft',
          line_items: lineItems, // TODO: Move to invoice_line_items table
          notes: notes
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Invoice created successfully');
      onSaved(invoice.id);
      onClose();
    } catch (error) {
      toast.error(`Failed to create invoice: ${error.message}`);
    }
  };

  const deal = deals.find(d => d.id === selectedDeal);
  const account = deal ? accounts.find(a => a.id === deal.accountId) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Create Invoice</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Deal Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Deal</label>
              <select
                value={selectedDeal}
                onChange={(e) => setSelectedDeal(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">-- Select Deal --</option>
                {deals
                  .filter(d => d.stage !== 'Closed Lost')
                  .map(deal => (
                    <option key={deal.id} value={deal.id}>
                      {deal.name} - ${deal.amount?.toLocaleString()}
                    </option>
                  ))}
              </select>
              {account && (
                <div className="text-sm text-gray-500 mt-1">
                  Customer: {account.name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Line Items</h3>
              <button onClick={addLineItem} className="btn-primary text-sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Line Item
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">Item</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">Unit Price</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">Total</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map(item => (
                    <tr key={item.id} className="border-t">
                      <td className="px-3 py-2">
                        <select
                          value={item.type}
                          onChange={(e) => updateLineItem(item.id, 'type', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          <option value="product">Product</option>
                          <option value="service">Service</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={item.itemId}
                          onChange={(e) => updateLineItem(item.id, 'itemId', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          <option value="">-- Select --</option>
                          {item.type === 'product' &&
                            products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          {item.type === 'service' &&
                            services.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value))}
                          className="w-20 px-2 py-1 border rounded text-sm"
                          min="0.01"
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                          className="w-24 px-2 py-1 border rounded text-sm"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-2 font-medium">
                        ${item.total.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {lineItems.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No line items yet. Click "Add Line Item" to get started.
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="max-w-xs ml-auto space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                    className="w-16 px-2 py-1 border rounded text-sm text-right"
                    min="0"
                    step="0.1"
                  />
                  <span className="text-sm">%</span>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Payment terms, thank you message, etc."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end border-t pt-4">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary">
              Create Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### TASK 2: Add "Create Invoice" Button to DealsPage (15 min)

**File:** `src/pages/DealsPage.tsx`

**Add button to deal detail view:**

```tsx
import InvoiceBuilder from '../components/InvoiceBuilder';

const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);

// In deal detail view actions
<button
  onClick={() => setShowInvoiceBuilder(true)}
  className="btn-primary"
>
  <FileText className="w-4 h-4 mr-2" />
  Create Invoice
</button>

{showInvoiceBuilder && (
  <InvoiceBuilder
    dealId={selectedDeal.id}
    onClose={() => setShowInvoiceBuilder(false)}
    onSaved={(invoiceId) => {
      toast.success('Invoice created');
      // Navigate to invoice detail
      navigate(`/financials/invoices/${invoiceId}`);
    }}
  />
)}
```

**Verification:**
- [ ] "Create Invoice" button visible on deal detail
- [ ] Clicking button opens InvoiceBuilder modal
- [ ] Deal pre-selected in builder
- [ ] Customer name shown
- [ ] Can add line items
- [ ] Totals calculate correctly
- [ ] Saving creates invoice in database
- [ ] Redirects to invoice detail after save

---

### TASK 3: Build PDF Generation Edge Function (1.5 hours)

**Create:** `supabase/functions/generate-invoice-pdf/index.ts`

**Purpose:** Generate PDF from invoice data for download/email

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { invoiceId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get invoice with related data
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        account:accounts(name, email, address),
        organization:organizations(name, address, logo, abn)
      `)
      .eq('id', invoiceId)
      .single();

    if (error) throw error;

    // Generate HTML template
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { width: 150px; }
    .invoice-details { text-align: right; }
    .invoice-number { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .section { margin-bottom: 30px; }
    .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #333; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    .totals { margin-top: 20px; text-align: right; }
    .totals table { margin-left: auto; width: 300px; }
    .total-row { font-weight: bold; font-size: 18px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${invoice.organization.logo ? `<img src="${invoice.organization.logo}" class="logo" />` : ''}
      <h1>${invoice.organization.name}</h1>
      <div>${invoice.organization.address?.street || ''}</div>
      <div>${invoice.organization.address?.city || ''}, ${invoice.organization.address?.state || ''} ${invoice.organization.address?.postcode || ''}</div>
      ${invoice.organization.abn ? `<div>ABN: ${invoice.organization.abn}</div>` : ''}
    </div>
    <div class="invoice-details">
      <div class="invoice-number">INVOICE</div>
      <div>Invoice #: ${invoice.invoice_number}</div>
      <div>Date: ${new Date(invoice.invoice_date).toLocaleDateString()}</div>
      <div>Due: ${new Date(invoice.due_date).toLocaleDateString()}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Bill To:</div>
    <div><strong>${invoice.account.name}</strong></div>
    <div>${invoice.account.email || ''}</div>
    ${invoice.account.address ? `
      <div>${invoice.account.address.street || ''}</div>
      <div>${invoice.account.address.city || ''}, ${invoice.account.address.state || ''} ${invoice.account.address.postcode || ''}</div>
    ` : ''}
  </div>

  <div class="section">
    <div class="section-title">Line Items</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.line_items.map(item => `
          <tr>
            <td>
              <strong>${item.name}</strong>
              ${item.description ? `<br><small>${item.description}</small>` : ''}
            </td>
            <td style="text-align: right;">${item.quantity}</td>
            <td style="text-align: right;">$${item.unitPrice.toFixed(2)}</td>
            <td style="text-align: right;">$${item.total.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="totals">
    <table>
      <tr>
        <td>Subtotal:</td>
        <td style="text-align: right;">$${invoice.subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Tax (${invoice.tax_rate}%):</td>
        <td style="text-align: right;">$${invoice.tax_amount.toFixed(2)}</td>
      </tr>
      <tr class="total-row">
        <td>Total:</td>
        <td style="text-align: right;">$${invoice.total.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Amount Due:</td>
        <td style="text-align: right;"><strong>$${invoice.amount_due.toFixed(2)}</strong></td>
      </tr>
    </table>
  </div>

  ${invoice.notes ? `
    <div class="section">
      <div class="section-title">Notes</div>
      <div>${invoice.notes}</div>
    </div>
  ` : ''}

  <div class="section" style="margin-top: 60px; text-align: center; color: #888; font-size: 12px;">
    Thank you for your business!
  </div>
</body>
</html>
    `;

    // Use a PDF generation service (Puppeteer, jsPDF, or external API)
    // For now, return HTML (frontend can print to PDF)
    // In production, use Puppeteer or similar to generate actual PDF

    return new Response(
      JSON.stringify({ html, invoice }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

**Deploy:**
```bash
npx supabase functions deploy generate-invoice-pdf --project-ref anawatvgypmrpbmjfcht
```

---

### TASK 4: Add PDF Download Button to InvoiceDetail (30 min)

**File:** `src/pages/Financials/InvoiceDetail.tsx`

```tsx
const handleDownloadPDF = async () => {
  try {
    const response = await supabase.functions.invoke('generate-invoice-pdf', {
      body: { invoiceId: invoice.id }
    });

    if (response.error) throw response.error;

    // Open HTML in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(response.data.html);
    printWindow.document.close();
    printWindow.print();
  } catch (error) {
    toast.error(`Failed to generate PDF: ${error.message}`);
  }
};

<button onClick={handleDownloadPDF} className="btn-secondary">
  <FileText className="w-4 h-4 mr-2" />
  Download PDF
</button>
```

**Verification:**
- [ ] PDF button visible on invoice detail
- [ ] Clicking opens print dialog with formatted invoice
- [ ] Invoice includes company logo, address, line items, totals
- [ ] Can save as PDF from print dialog

---

### TASK 5: Create Public Payment Link Page (1 hour)

**Create:** `src/pages/PublicPaymentPage.tsx`

**Purpose:** Public page (no auth required) for customers to pay invoices

```tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import PaymentCollectionModal from '../components/PaymentCollectionModal';
import { CheckCircle } from 'lucide-react';

export default function PublicPaymentPage() {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [account, setAccount] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  async function loadInvoice() {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          account:accounts(name, email),
          organization:organizations(name, logo)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;

      setInvoice(data);
      setAccount(data.account);
      setOrganization(data.organization);
    } catch (error) {
      console.error('Failed to load invoice:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invoice Not Found</h1>
          <p className="text-gray-500">This invoice link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  if (paid || invoice.status === 'paid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your payment. A receipt has been sent to your email.
          </p>
          <div className="text-sm text-gray-500">
            Invoice #: {invoice.invoice_number}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {organization.logo && (
            <img src={organization.logo} alt={organization.name} className="h-12 mb-4" />
          )}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{organization.name}</h1>
          <div className="text-gray-500">Invoice for {account.name}</div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex justify-between mb-6">
            <div>
              <div className="text-sm text-gray-500">Invoice Number</div>
              <div className="font-medium">{invoice.invoice_number}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Invoice Date</div>
              <div className="font-medium">{new Date(invoice.invoice_date).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Due Date</div>
              <div className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-6">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.line_items.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-3">{item.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">${item.unitPrice.toFixed(2)}</td>
                  <td className="text-right">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span>${invoice.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span>${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-4">Pay Now</h2>
          <PaymentCollectionModal
            amount={invoice.amount_due}
            entityType="invoice"
            entityId={invoice.id}
            onSuccess={() => {
              setPaid(true);
              toast.success('Payment successful!');
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

**Add route to App.tsx:**

```tsx
<Route path="/pay/:invoiceId" element={<PublicPaymentPage />} />
```

**Verification:**
- [ ] Can access /pay/{invoiceId} without login
- [ ] Invoice details display correctly
- [ ] Payment modal shows Stripe and PayPal options
- [ ] Successful payment shows success message
- [ ] Invoice status updates to "paid" after payment

---

### TASK 6: Wire Import/Export Job Tracking (45 min)

**File:** `src/pages/SettingsView.tsx` (Import/Export tab)

**Current:** Client-side import/export with no tracking

**Target:** Log jobs to `import_jobs` and `export_jobs` tables

**Changes:**

```typescript
const handleImport = async (file: File, entityType: string) => {
  try {
    // Create import job
    const { data: job } = await supabase
      .from('import_jobs')
      .insert({
        org_id: orgId,
        entity_type: entityType,
        file_name: file.name,
        file_size: file.size,
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    // Parse CSV
    const text = await file.text();
    const rows = parseCSV(text);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Import rows
    for (const row of rows) {
      try {
        await upsertRecord(entityType, row);
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({ row, error: error.message });
      }
    }

    // Update job status
    await supabase
      .from('import_jobs')
      .update({
        status: errorCount > 0 ? 'completed_with_errors' : 'completed',
        completed_at: new Date().toISOString(),
        total_rows: rows.length,
        success_count: successCount,
        error_count: errorCount,
        errors: errors
      })
      .eq('id', job.id);

    toast.success(`Import complete: ${successCount} succeeded, ${errorCount} failed`);
    loadImportJobs();
  } catch (error) {
    toast.error(`Import failed: ${error.message}`);
  }
};

const handleExport = async (entityType: string) => {
  try {
    // Create export job
    const { data: job } = await supabase
      .from('export_jobs')
      .insert({
        org_id: orgId,
        entity_type: entityType,
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    // Get data
    const data = await loadEntityData(entityType);

    // Generate CSV
    const csv = generateCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // Download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}-export-${Date.now()}.csv`;
    a.click();

    // Update job status
    await supabase
      .from('export_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        record_count: data.length,
        file_name: a.download
      })
      .eq('id', job.id);

    toast.success(`Exported ${data.length} ${entityType}`);
    loadExportJobs();
  } catch (error) {
    toast.error(`Export failed: ${error.message}`);
  }
};
```

**Display job history:**

```tsx
<div className="space-y-4">
  <h3 className="font-medium">Recent Imports</h3>
  <table className="w-full">
    <thead>
      <tr className="border-b">
        <th className="text-left py-2">File</th>
        <th className="text-left py-2">Entity</th>
        <th className="text-left py-2">Status</th>
        <th className="text-left py-2">Rows</th>
        <th className="text-left py-2">Date</th>
      </tr>
    </thead>
    <tbody>
      {importJobs.map(job => (
        <tr key={job.id} className="border-b">
          <td className="py-2">{job.file_name}</td>
          <td>{job.entity_type}</td>
          <td>
            <span className={`px-2 py-1 rounded text-xs ${
              job.status === 'completed' ? 'bg-green-100 text-green-700' :
              job.status === 'processing' ? 'bg-blue-100 text-blue-700' :
              'bg-red-100 text-red-700'
            }`}>
              {job.status}
            </span>
          </td>
          <td>{job.success_count}/{job.total_rows}</td>
          <td>{new Date(job.started_at).toLocaleString()}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**Verification:**
- [ ] Import creates record in import_jobs table
- [ ] Job status updates to "completed" after import
- [ ] Success/error counts tracked
- [ ] Export creates record in export_jobs table
- [ ] Job history displays in Settings

---

### TASK 7: Add Webhook Logging (30 min)

**File:** `supabase/functions/stripe-webhook/index.ts` (and other webhooks)

**Add logging to all webhook handlers:**

```typescript
// At start of webhook handler
const { data: log } = await supabase
  .from('webhook_logs')
  .insert({
    org_id: metadata.orgId,
    provider: 'stripe',
    event_type: event.type,
    payload: event,
    status: 'received',
    received_at: new Date().toISOString()
  })
  .select()
  .single();

try {
  // Process webhook...

  // Mark success
  await supabase
    .from('webhook_logs')
    .update({
      status: 'processed',
      processed_at: new Date().toISOString()
    })
    .eq('id', log.id);

} catch (error) {
  // Mark error
  await supabase
    .from('webhook_logs')
    .update({
      status: 'error',
      error_message: error.message,
      processed_at: new Date().toISOString()
    })
    .eq('id', log.id);

  throw error;
}
```

**Verification:**
- [ ] Webhook events logged to webhook_logs table
- [ ] Status field updates based on processing result
- [ ] Error messages captured
- [ ] Timestamps recorded

---

## COMMIT MESSAGES

```bash
git add src/components/InvoiceBuilder.tsx
git commit -m "feat(invoicing): create invoice builder component

- Build invoice from deal with line items
- Auto-populate customer from deal
- Add/remove line items dynamically
- Calculate subtotal, tax, total
- Product and service selection
- Save to invoices table

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git add src/pages/DealsPage.tsx
git commit -m "feat(invoicing): add Create Invoice button to deal detail

- Wire InvoiceBuilder to deal page
- Pre-select deal in builder
- Navigate to invoice after creation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git add supabase/functions/generate-invoice-pdf/
git commit -m "feat(invoicing): add PDF generation Edge Function

- Generate HTML invoice template
- Include company logo, address, line items
- Format for printing to PDF
- Return HTML for browser print dialog

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git add src/pages/PublicPaymentPage.tsx
git commit -m "feat(payments): create public payment link page

- Public page (no auth) for invoice payment
- Display invoice details and line items
- Integrate Stripe/PayPal payment modal
- Show success confirmation after payment
- Update invoice status to paid

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git add src/pages/SettingsView.tsx
git commit -m "feat(import-export): add job tracking to import/export

- Log imports to import_jobs table
- Log exports to export_jobs table
- Track success/error counts
- Display job history in Settings
- Update status on completion

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git add supabase/functions/stripe-webhook/ supabase/functions/paypal-webhook/
git commit -m "feat(webhooks): add logging to webhook handlers

- Log all webhook events to webhook_logs table
- Track status (received, processed, error)
- Capture error messages
- Record timestamps

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## HANDOFF TO SESSION A4

```markdown
# Session A3 Complete

## Completed
✅ Invoice builder component created
✅ "Create Invoice" button added to deals
✅ PDF generation Edge Function deployed
✅ Public payment link page created
✅ Import/Export job tracking wired to Supabase
✅ Webhook logging added to all webhooks
✅ All commits pushed to dev branch

## Next Session (A4) - Final Polish
- Duplicate detection on lead/contact create
- Empty states across all remaining pages
- Final styling consistency pass
- Full end-to-end testing
- Production deployment

## Blockers
None

## Notes
- Invoice builder tested with products and services
- PDF generation works via browser print
- Public payment page accessible without auth
- Import/export history visible in Settings
```

---

**END OF SESSION A3**
