import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  function redirectWithError(error: string): Response {
    return Response.redirect(
      `${appUrl}/settings?tab=INTEGRATIONS&google_error=${encodeURIComponent(error)}`,
      302
    );
  }

  function redirectWithSuccess(type: string, purpose?: string): Response {
    const params = new URLSearchParams({ tab: 'INTEGRATIONS', google_success: type });
    if (purpose) params.set('purpose', purpose);
    return Response.redirect(`${appUrl}/settings?${params.toString()}`, 302);
  }

  try {
    // 1. Extract params
    const code = url.searchParams.get('code');
    const stateParam = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return redirectWithError(error);
    }

    if (!code || !stateParam) {
      return redirectWithError('Missing code or state parameter');
    }

    // 2. Decode state
    let state: { user_id: string; org_id: string; type: string; purpose: string };
    try {
      state = JSON.parse(atob(stateParam));
    } catch {
      return redirectWithError('Invalid state parameter');
    }

    if (!state.user_id || !state.org_id || !state.type) {
      return redirectWithError('Incomplete state parameter');
    }

    // 3. Read org's Google credentials
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: googleConfig, error: configError } = await adminClient
      .from('company_integrations')
      .select('config')
      .eq('org_id', state.org_id)
      .eq('provider', 'google')
      .eq('is_active', true)
      .single();

    if (configError || !googleConfig?.config?.client_id) {
      return redirectWithError('Google credentials not found for this organization');
    }

    const { client_id, client_secret, redirect_uri } = googleConfig.config;

    // 4. Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      return redirectWithError(tokenData.error_description || 'Token exchange failed');
    }

    const { access_token, refresh_token, expires_in } = tokenData;
    const token_expires_at = new Date(Date.now() + expires_in * 1000).toISOString();
    const scopes = (tokenData.scope || '').split(' ');

    // 5. Fetch Google user info
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userInfo = await userInfoRes.json();
    const connectedEmail = userInfo.email || '';
    const displayName = userInfo.name || connectedEmail;

    // 6. Store tokens based on type
    if (state.type === 'user') {
      const { error: upsertError } = await adminClient
        .from('user_integrations')
        .upsert(
          {
            user_id: state.user_id,
            org_id: state.org_id,
            provider: 'google',
            connected_email: connectedEmail,
            access_token,
            refresh_token,
            token_expires_at,
            scopes,
            is_active: true,
            last_synced_at: new Date().toISOString(),
            sync_config: { sync_gmail: true, sync_calendar: true },
          },
          { onConflict: 'org_id,user_id,provider' }
        );

      if (upsertError) {
        console.error('user_integrations upsert error:', upsertError);
        return redirectWithError('Failed to save Google connection');
      }

      return redirectWithSuccess('user');
    }

    if (state.type === 'org') {
      const { error: upsertError } = await adminClient
        .from('org_email_accounts')
        .upsert(
          {
            org_id: state.org_id,
            email: connectedEmail,
            display_name: displayName,
            purpose: state.purpose || 'billing',
            provider: 'google',
            access_token,
            refresh_token,
            token_expires_at,
            scopes,
            is_active: true,
            is_default: false,
            created_by: state.user_id,
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: 'org_id,email,purpose' }
        );

      if (upsertError) {
        console.error('org_email_accounts upsert error:', upsertError);
        return redirectWithError('Failed to save org email connection');
      }

      return redirectWithSuccess('org', state.purpose);
    }

    return redirectWithError('Invalid type in state');
  } catch (err) {
    console.error('google-oauth-callback error:', err);
    return redirectWithError(err.message || 'Internal server error');
  }
});
