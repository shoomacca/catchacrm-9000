import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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
      to,
      body,
      from_number_id,
      purpose,
      contact_id,
      contact_name,
      deal_id,
      ticket_id,
      campaign_id,
    } = await req.json();

    // 3. Validate required fields
    if (!org_id || !to || !body) {
      return new Response(
        JSON.stringify({ error: 'org_id, to, and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Read Twilio credentials from company_integrations using service role
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: twilioConfig, error: configError } = await adminClient
      .from('company_integrations')
      .select('config')
      .eq('org_id', org_id)
      .eq('provider', 'twilio')
      .eq('is_active', true)
      .single();

    if (configError || !twilioConfig?.config?.account_sid || !twilioConfig?.config?.auth_token) {
      return new Response(
        JSON.stringify({ error: 'Twilio not configured. Admin must set up SMS in Settings.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { account_sid, auth_token } = twilioConfig.config;

    // 5. Determine the FROM number
    let fromNumber: string | null = null;
    let smsNumberId: string | null = null;

    if (from_number_id) {
      // Look up specific number
      const { data: numRecord } = await adminClient
        .from('sms_numbers')
        .select('id, phone_number')
        .eq('id', from_number_id)
        .eq('org_id', org_id)
        .eq('is_active', true)
        .single();

      if (numRecord) {
        fromNumber = numRecord.phone_number;
        smsNumberId = numRecord.id;
      }
    } else if (purpose) {
      // Find number by purpose, prefer default
      const { data: numRecords } = await adminClient
        .from('sms_numbers')
        .select('id, phone_number, is_default')
        .eq('org_id', org_id)
        .eq('purpose', purpose)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .limit(1);

      if (numRecords && numRecords.length > 0) {
        fromNumber = numRecords[0].phone_number;
        smsNumberId = numRecords[0].id;
      }
    }

    if (!fromNumber) {
      // Fallback: find any default number for the org
      const { data: defaultNum } = await adminClient
        .from('sms_numbers')
        .select('id, phone_number')
        .eq('org_id', org_id)
        .eq('is_default', true)
        .eq('is_active', true)
        .limit(1);

      if (defaultNum && defaultNum.length > 0) {
        fromNumber = defaultNum[0].phone_number;
        smsNumberId = defaultNum[0].id;
      }
    }

    if (!fromNumber) {
      return new Response(
        JSON.stringify({ error: 'No SMS number configured. Add a phone number in Settings.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Build status callback URL
    const appUrl = Deno.env.get('APP_URL') || supabaseUrl;
    const statusCallback = `${supabaseUrl}/functions/v1/sms-status-webhook`;

    // 7. Call Twilio REST API to send SMS
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`;
    const twilioAuth = btoa(`${account_sid}:${auth_token}`);

    const formBody = new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: body,
      StatusCallback: statusCallback,
    });

    const twilioRes = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString(),
    });

    const twilioData = await twilioRes.json();

    // 8. Build SMS message record
    const messageRecord: Record<string, unknown> = {
      org_id,
      direction: 'outbound',
      from_number: fromNumber,
      to_number: to,
      body,
      sms_number_id: smsNumberId,
      contact_id: contact_id || null,
      contact_name: contact_name || null,
      deal_id: deal_id || null,
      ticket_id: ticket_id || null,
      campaign_id: campaign_id || null,
      segments: Math.ceil(body.length / 160) || 1,
      sent_by: user.id,
    };

    if (twilioRes.ok) {
      messageRecord.status = 'sent';
      messageRecord.twilio_sid = twilioData.sid;
    } else {
      messageRecord.status = 'failed';
      messageRecord.error_message = twilioData.message || `Twilio error: ${twilioData.code}`;
    }

    // 9. Insert into sms_messages
    const { data: insertedMsg, error: insertError } = await adminClient
      .from('sms_messages')
      .insert(messageRecord)
      .select('id')
      .single();

    if (!twilioRes.ok) {
      return new Response(
        JSON.stringify({
          error: twilioData.message || 'Failed to send SMS',
          twilio_code: twilioData.code,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_id: insertedMsg?.id,
        twilio_sid: twilioData.sid,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('sms-send error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
