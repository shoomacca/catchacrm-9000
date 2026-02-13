import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // 1. Parse Twilio status webhook fields
    const formData = await req.formData();
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const errorCode = formData.get('ErrorCode') as string;
    const errorMessage = formData.get('ErrorMessage') as string;

    if (!messageSid || !messageStatus) {
      return new Response('OK', { status: 200 });
    }

    // 2. Map Twilio status to our status
    const statusMap: Record<string, string> = {
      queued: 'queued',
      sending: 'queued',
      sent: 'sent',
      delivered: 'delivered',
      undelivered: 'failed',
      failed: 'failed',
    };
    const mappedStatus = statusMap[messageStatus] || messageStatus;

    // 3. Update the sms_messages record
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const updates: Record<string, unknown> = {
      status: mappedStatus,
      updated_at: new Date().toISOString(),
    };

    if (errorMessage || errorCode) {
      updates.error_message = errorMessage || `Error code: ${errorCode}`;
    }

    const { error } = await adminClient
      .from('sms_messages')
      .update(updates)
      .eq('twilio_sid', messageSid);

    if (error) {
      console.error('sms-status-webhook: Failed to update message:', error);
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('sms-status-webhook error:', err);
    return new Response('OK', { status: 200 });
  }
});
