// Gmail Send Edge Function
// Sends emails via Gmail API with OAuth 2.0 token refresh

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64 encoded
    mimeType?: string;
  }>;
  organizationId: string;
}

interface GmailTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { to, subject, body, attachments, organizationId }: EmailRequest = await req.json();

    // Validate input
    if (!to || !subject || !body || !organizationId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, body, organizationId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get organization's Gmail credentials
    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select('gmail_email, gmail_refresh_token')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      return new Response(
        JSON.stringify({ error: 'Organization not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!org.gmail_email || !org.gmail_refresh_token) {
      return new Response(
        JSON.stringify({ error: 'Gmail OAuth not configured for this organization. Please connect Gmail in Settings.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OAuth credentials from environment
    const clientId = Deno.env.get('GMAIL_CLIENT_ID');
    const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: 'Gmail OAuth credentials not configured on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Refresh access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: org.gmail_refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token refresh failed:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to refresh Gmail access token. Please reconnect Gmail in Settings.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData: GmailTokenResponse = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Construct RFC 2822 email message
    const boundary = '----=_Part_' + Math.random().toString(36).substring(2);
    let message = [
      `From: ${org.gmail_email}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      body,
      '',
    ].join('\r\n');

    // Add attachments
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        message += [
          `--${boundary}`,
          `Content-Type: ${attachment.mimeType || 'application/pdf'}; name="${attachment.filename}"`,
          'Content-Transfer-Encoding: base64',
          `Content-Disposition: attachment; filename="${attachment.filename}"`,
          '',
          attachment.content,
          '',
        ].join('\r\n');
      }
    }

    message += `--${boundary}--`;

    // Encode message in base64url format
    const encodedMessage = btoa(message)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email via Gmail API
    const sendResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json();
      console.error('Gmail send failed:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to send email via Gmail', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sendData = await sendResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        messageId: sendData.id,
        threadId: sendData.threadId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in gmail-send function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
