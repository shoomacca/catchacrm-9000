import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
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
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    // 2. Parse request
    const { integration_id, table } = await req.json();

    if (!integration_id || !table) {
      return new Response(
        JSON.stringify({ error: 'integration_id and table are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['user_integrations', 'org_email_accounts'].includes(table)) {
      return new Response(
        JSON.stringify({ error: 'table must be user_integrations or org_email_accounts' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Fetch integration record
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: integration, error: fetchError } = await adminClient
      .from(table)
      .select('*')
      .eq('id', integration_id)
      .single();

    if (fetchError || !integration) {
      return new Response(
        JSON.stringify({ error: 'Integration record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Permission check
    if (table === 'user_integrations') {
      if (integration.user_id !== user.id) {
        // Check if user is admin in the org
        const { data: userRecord } = await adminClient
          .from('users')
          .select('role')
          .eq('id', user.id)
          .eq('org_id', integration.org_id)
          .single();

        if (userRecord?.role !== 'admin') {
          return new Response(
            JSON.stringify({ error: 'You can only refresh your own integration tokens' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // 5. Check for refresh token
    if (!integration.refresh_token) {
      return new Response(
        JSON.stringify({ error: 'No refresh token — user must reconnect', needs_reconnect: true }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Read org's Google credentials
    const { data: googleConfig, error: configError } = await adminClient
      .from('company_integrations')
      .select('config')
      .eq('org_id', integration.org_id)
      .eq('provider', 'google')
      .eq('is_active', true)
      .single();

    if (configError || !googleConfig?.config?.client_id) {
      return new Response(
        JSON.stringify({ error: 'Google credentials not found for this organization' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { client_id, client_secret } = googleConfig.config;

    // 7. Refresh the token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id,
        client_secret,
        refresh_token: integration.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenRes.json();

    // 8. Handle refresh failure
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Token refresh failed:', tokenData);

      // Mark integration as inactive
      await adminClient
        .from(table)
        .update({ is_active: false })
        .eq('id', integration_id);

      return new Response(
        JSON.stringify({
          error: 'Token refresh failed — user must reconnect',
          needs_reconnect: true,
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 9. Update stored tokens
    const newExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    await adminClient
      .from(table)
      .update({
        access_token: tokenData.access_token,
        token_expires_at: newExpiresAt,
        is_active: true,
      })
      .eq('id', integration_id);

    // 10. Return new token
    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        expires_at: newExpiresAt,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('google-token-refresh error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
