import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

    // 3. Fetch the integration record
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

    // Permission check: user must own the record or be an admin
    if (table === 'user_integrations' && integration.user_id !== user.id) {
      const { data: userRecord } = await adminClient
        .from('users')
        .select('role')
        .eq('id', user.id)
        .eq('org_id', integration.org_id)
        .single();

      if (userRecord?.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'You can only disconnect your own integration' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4. Revoke the token at Google (best effort)
    if (integration.access_token) {
      try {
        await fetch(
          `https://oauth2.googleapis.com/revoke?token=${integration.access_token}`,
          { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
      } catch (revokeErr) {
        console.warn('Google token revocation failed (non-fatal):', revokeErr);
      }
    }

    // 5. Delete the integration record
    const { error: deleteError } = await adminClient
      .from(table)
      .delete()
      .eq('id', integration_id);

    if (deleteError) {
      console.error('Failed to delete integration record:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to remove integration record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('google-disconnect error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
