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
    const { org_id, order_id, transaction_id } = await req.json();

    // 3. Validate required fields
    if (!org_id || !order_id || !transaction_id) {
      return new Response(
        JSON.stringify({ error: 'org_id, order_id, and transaction_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Read PayPal credentials from company_integrations using service role
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: paypalConfig, error: configError } = await adminClient
      .from('company_integrations')
      .select('config')
      .eq('org_id', org_id)
      .eq('provider', 'paypal')
      .eq('is_active', true)
      .single();

    if (configError || !paypalConfig?.config?.client_id || !paypalConfig?.config?.client_secret) {
      return new Response(
        JSON.stringify({ error: 'PayPal not configured' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { client_id, client_secret, mode } = paypalConfig.config;

    // 5. Determine PayPal base URL based on mode
    const baseUrl = mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    // 6. Get PayPal access token
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${client_id}:${client_secret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with PayPal', details: tokenData }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { access_token } = tokenData;

    // 7. Capture the PayPal order
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${order_id}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureRes.json();
    const captureSucceeded = captureRes.status === 201 || captureData.status === 'COMPLETED';

    // 8. Update payment_transactions based on capture result
    if (captureSucceeded) {
      const { error: updateError } = await adminClient
        .from('payment_transactions')
        .update({
          status: 'succeeded',
          provider_response: captureData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction_id)
        .eq('org_id', org_id);

      if (updateError) {
        console.error('Failed to update payment_transactions on success:', updateError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: captureData.status,
          capture: captureData,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 9. Capture failed - update transaction with error
    const errorMessage = captureData.message
      || captureData.details?.[0]?.description
      || 'PayPal capture failed';

    const { error: updateError } = await adminClient
      .from('payment_transactions')
      .update({
        status: 'failed',
        error_message: errorMessage,
        provider_response: captureData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction_id)
      .eq('org_id', org_id);

    if (updateError) {
      console.error('Failed to update payment_transactions on failure:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        status: captureData.status || 'FAILED',
        error: errorMessage,
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('paypal-capture-order error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
