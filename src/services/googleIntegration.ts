/**
 * Google Integration Service
 *
 * Frontend helpers for Google OAuth flow. All functions call Supabase Edge Functions
 * which read per-org credentials from the database at runtime.
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

async function callEdgeFunction(
  functionName: string,
  body: Record<string, unknown>,
  requiresAuth = true
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = await getAccessToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(data.error || `Edge function ${functionName} failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Start Google OAuth flow.
 * Calls google-oauth-start Edge Function which reads org's Google credentials,
 * then redirects the browser to Google's consent screen.
 */
export async function connectGoogle(
  type: 'user' | 'org',
  purpose: string,
  orgId: string
): Promise<void> {
  const data = await callEdgeFunction('google-oauth-start', {
    type,
    purpose,
    org_id: orgId,
  });

  if (!data.url) {
    throw new Error('No OAuth URL returned from server');
  }

  // Redirect to Google's consent screen
  window.location.href = data.url;
}

/**
 * Refresh an expired Google access token.
 * Returns the new access_token and expires_at.
 */
export async function refreshGoogleToken(
  integrationId: string,
  table: 'user_integrations' | 'org_email_accounts'
): Promise<{ access_token: string; expires_at: string; needs_reconnect?: boolean }> {
  return callEdgeFunction('google-token-refresh', {
    integration_id: integrationId,
    table,
  });
}

/**
 * Disconnect a Google integration.
 * Revokes the token at Google and deletes the integration record.
 */
export async function disconnectGoogle(
  integrationId: string,
  table: 'user_integrations' | 'org_email_accounts'
): Promise<{ success: boolean }> {
  return callEdgeFunction('google-disconnect', {
    integration_id: integrationId,
    table,
  });
}
