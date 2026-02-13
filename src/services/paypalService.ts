/**
 * PayPal Service
 *
 * Frontend helpers for PayPal payment operations. Calls the paypal-create-order
 * and paypal-capture-order Edge Functions which read per-org PayPal credentials
 * from the database at runtime.
 */

import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

async function getAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated. Please sign in first.');
  }
  return session.access_token;
}

/**
 * Create a PayPal order via the paypal-create-order Edge Function.
 * Returns the order_id needed by PayPal JS SDK to render buttons.
 */
export async function createPayPalOrder(params: {
  orgId: string;
  amount: number;
  currency?: string;
  description?: string;
  contactId?: string;
  contactName?: string;
  dealId?: string;
  invoiceId?: string;
}): Promise<{ orderId: string; transactionId: string }> {
  const token = await getAccessToken();

  const res = await fetch(`${SUPABASE_URL}/functions/v1/paypal-create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      org_id: params.orgId,
      amount: params.amount,
      currency: params.currency || 'AUD',
      description: params.description,
      contact_id: params.contactId,
      contact_name: params.contactName,
      deal_id: params.dealId,
      invoice_id: params.invoiceId,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `PayPal order creation failed: ${res.status}`);
  }

  return {
    orderId: data.order_id,
    transactionId: data.transaction_id,
  };
}

/**
 * Capture (finalize) a PayPal payment after the customer approves.
 */
export async function capturePayPalOrder(params: {
  orgId: string;
  orderId: string;
  transactionId: string;
}): Promise<{ success: boolean; status: string; error?: string }> {
  const token = await getAccessToken();

  const res = await fetch(`${SUPABASE_URL}/functions/v1/paypal-capture-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      org_id: params.orgId,
      order_id: params.orderId,
      transaction_id: params.transactionId,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, status: 'failed', error: data.error || `Capture failed: ${res.status}` };
  }

  return {
    success: data.success,
    status: data.status,
  };
}
