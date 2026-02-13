/**
 * Stripe Service
 *
 * Frontend helpers for Stripe payment operations. Calls the stripe-create-payment
 * Edge Function which reads per-org Stripe credentials from the database at runtime.
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
 * Create a Stripe PaymentIntent via the stripe-create-payment Edge Function.
 * Returns the client_secret needed by Stripe.js to complete payment on the frontend.
 */
export async function createStripePayment(params: {
  orgId: string;
  amount: number;
  currency?: string;
  description?: string;
  contactId?: string;
  contactName?: string;
  contactEmail?: string;
  dealId?: string;
  invoiceId?: string;
  metadata?: Record<string, string>;
}): Promise<{ clientSecret: string; transactionId: string }> {
  const token = await getAccessToken();

  const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-create-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      org_id: params.orgId,
      amount: params.amount,
      currency: params.currency || 'aud',
      description: params.description,
      contact_id: params.contactId,
      contact_name: params.contactName,
      contact_email: params.contactEmail,
      deal_id: params.dealId,
      invoice_id: params.invoiceId,
      metadata: params.metadata,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Stripe payment creation failed: ${res.status}`);
  }

  return {
    clientSecret: data.client_secret,
    transactionId: data.transaction_id,
  };
}
