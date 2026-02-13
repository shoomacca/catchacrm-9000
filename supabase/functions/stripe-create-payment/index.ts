import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse request body
    const {
      org_id,
      amount,
      currency = 'aud',
      description,
      contact_id,
      contact_name,
      contact_email,
      deal_id,
      invoice_id,
      metadata = {},
    } = await req.json();

    // 3. Validate required fields
    if (!org_id || !amount) {
      return new Response(
        JSON.stringify({ error: 'org_id and amount are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Read Stripe credentials from company_integrations using service role
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: stripeConfig, error: configError } = await adminClient
      .from('company_integrations')
      .select('config')
      .eq('org_id', org_id)
      .eq('provider', 'stripe')
      .eq('is_active', true)
      .single();

    if (configError || !stripeConfig?.config?.secret_key) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured. Admin must set up Stripe in Settings.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { secret_key } = stripeConfig.config;

    // 5. Create Stripe PaymentIntent
    const amountInCents = Math.round(amount * 100);

    const params = new URLSearchParams({
      amount: String(amountInCents),
      currency,
    });

    if (description) params.append('description', description);
    if (contact_email) params.append('receipt_email', contact_email);
    if (org_id) params.append('metadata[org_id]', org_id);
    if (contact_id) params.append('metadata[contact_id]', contact_id);
    if (deal_id) params.append('metadata[deal_id]', deal_id);
    if (invoice_id) params.append('metadata[invoice_id]', invoice_id);

    for (const [key, value] of Object.entries(metadata)) {
      params.append(`metadata[${key}]`, String(value));
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret_key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const paymentIntent = await stripeRes.json();

    if (!stripeRes.ok) {
      return new Response(
        JSON.stringify({
          error: paymentIntent.error?.message || 'Failed to create payment intent',
          stripe_code: paymentIntent.error?.code,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Insert record into payment_transactions
    const { data: inserted, error: insertError } = await adminClient
      .from('payment_transactions')
      .insert({
        org_id,
        provider: 'stripe',
        amount,
        currency,
        status: 'pending',
        description: description || null,
        provider_transaction_id: paymentIntent.id,
        provider_response: paymentIntent,
        contact_id: contact_id || null,
        contact_name: contact_name || null,
        deal_id: deal_id || null,
        invoice_id: invoice_id || null,
        payment_method: paymentIntent.payment_method || null,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('stripe-create-payment: Failed to insert transaction:', insertError);
    }

    // 7. Return client secret and transaction ID
    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        transaction_id: inserted?.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('stripe-create-payment error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
