import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const TIMESTAMP_TOLERANCE_SECONDS = 300; // 5 minutes

async function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string
): Promise<boolean> {
  // Parse the Stripe-Signature header for t= and v1= values
  const parts = signatureHeader.split(',');
  let timestamp = '';
  let signature = '';

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') timestamp = value;
    if (key === 'v1') signature = value;
  }

  if (!timestamp || !signature) {
    return false;
  }

  // Check timestamp is within tolerance
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > TIMESTAMP_TOLERANCE_SECONDS) {
    return false;
  }

  // Compute expected signature using HMAC-SHA256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${rawBody}`));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return expected === signature;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight (included for consistency)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Read the raw request body
    const rawBody = await req.text();

    // 2. Get Stripe signature header
    const signatureHeader = req.headers.get('Stripe-Signature');
    if (!signatureHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Stripe-Signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Get org_id from URL query params
    const url = new URL(req.url);
    const org_id = url.searchParams.get('org_id');
    if (!org_id) {
      return new Response(
        JSON.stringify({ error: 'Missing org_id query parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Create service role client for DB operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 5. Read Stripe config to get webhook_secret
    const { data: stripeConfig, error: configError } = await adminClient
      .from('company_integrations')
      .select('config')
      .eq('org_id', org_id)
      .eq('provider', 'stripe')
      .eq('is_active', true)
      .single();

    if (configError || !stripeConfig?.config?.webhook_secret) {
      return new Response(
        JSON.stringify({ error: 'Stripe webhook not configured for this organization' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { webhook_secret } = stripeConfig.config;

    // 6. Verify webhook signature
    const isValid = await verifyStripeSignature(rawBody, signatureHeader, webhook_secret);
    if (!isValid) {
      console.warn('stripe-webhook: Invalid signature for org_id:', org_id);
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Parse the event
    const event = JSON.parse(rawBody);
    const eventType = event.type;
    const eventObject = event.data?.object;

    if (!eventObject) {
      return new Response(
        JSON.stringify({ error: 'Invalid event structure' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Handle event types
    if (eventType === 'payment_intent.succeeded') {
      // Extract receipt_url from charges if available
      const receiptUrl = eventObject.charges?.data?.[0]?.receipt_url
        || eventObject.latest_charge?.receipt_url
        || null;

      await adminClient
        .from('payment_transactions')
        .update({
          status: 'succeeded',
          receipt_url: receiptUrl,
          payment_method: eventObject.payment_method || null,
          provider_response: eventObject,
          updated_at: new Date().toISOString(),
        })
        .eq('provider_transaction_id', eventObject.id)
        .eq('org_id', org_id);

    } else if (eventType === 'payment_intent.payment_failed') {
      const errorMessage = eventObject.last_payment_error?.message
        || 'Payment failed';

      await adminClient
        .from('payment_transactions')
        .update({
          status: 'failed',
          error_message: errorMessage,
          provider_response: eventObject,
          updated_at: new Date().toISOString(),
        })
        .eq('provider_transaction_id', eventObject.id)
        .eq('org_id', org_id);

    } else if (eventType === 'charge.refunded') {
      // For charge events, the payment_intent ID is in event.data.object.payment_intent
      const paymentIntentId = eventObject.payment_intent;

      if (paymentIntentId) {
        await adminClient
          .from('payment_transactions')
          .update({
            status: 'refunded',
            provider_response: eventObject,
            updated_at: new Date().toISOString(),
          })
          .eq('provider_transaction_id', paymentIntentId)
          .eq('org_id', org_id);
      }
    }

    // 9. Return success
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('stripe-webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
