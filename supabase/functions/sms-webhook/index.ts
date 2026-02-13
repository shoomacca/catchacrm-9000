import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // 1. Parse Twilio webhook fields (application/x-www-form-urlencoded)
    const formData = await req.formData();
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;
    const numMedia = parseInt(formData.get('NumMedia') as string || '0', 10);

    if (!from || !to || !messageSid) {
      console.warn('sms-webhook: Missing required fields', { from, to, messageSid });
      return twimlResponse();
    }

    // Collect media URLs
    const mediaUrls: string[] = [];
    for (let i = 0; i < numMedia; i++) {
      const url = formData.get(`MediaUrl${i}`) as string;
      if (url) mediaUrls.push(url);
    }

    // 2. Use service role to query DB
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 3. Look up which org owns the TO number
    // Strip whitespace/formatting from the number for matching
    const cleanTo = to.replace(/\s/g, '');
    const { data: smsNumberRecord, error: lookupError } = await adminClient
      .from('sms_numbers')
      .select('id, org_id')
      .eq('phone_number', cleanTo)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (lookupError || !smsNumberRecord) {
      console.warn(`sms-webhook: No org found for number ${cleanTo}`);
      return twimlResponse();
    }

    const orgId = smsNumberRecord.org_id;
    const smsNumberId = smsNumberRecord.id;

    // 4. Try to match FROM number to a contact/lead
    let contactId: string | null = null;
    let contactName: string | null = null;
    const cleanFrom = from.replace(/\s/g, '');

    // Check contacts first
    const { data: contactMatch } = await adminClient
      .from('contacts')
      .select('id, name')
      .eq('org_id', orgId)
      .or(`phone.eq.${cleanFrom},mobile.eq.${cleanFrom}`)
      .limit(1);

    if (contactMatch && contactMatch.length > 0) {
      contactId = contactMatch[0].id;
      contactName = contactMatch[0].name;
    } else {
      // Check leads
      const { data: leadMatch } = await adminClient
        .from('leads')
        .select('id, name')
        .eq('org_id', orgId)
        .eq('phone', cleanFrom)
        .limit(1);

      if (leadMatch && leadMatch.length > 0) {
        contactId = leadMatch[0].id;
        contactName = leadMatch[0].name;
      }
    }

    // 5. Insert inbound SMS message record
    const { error: insertError } = await adminClient
      .from('sms_messages')
      .insert({
        org_id: orgId,
        direction: 'inbound',
        from_number: from,
        to_number: to,
        body: body || '',
        status: 'received',
        twilio_sid: messageSid,
        sms_number_id: smsNumberId,
        contact_id: contactId,
        contact_name: contactName,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
      });

    if (insertError) {
      console.error('sms-webhook: Failed to insert message:', insertError);
    }

    // 6. Return empty TwiML (no auto-reply)
    return twimlResponse();
  } catch (err) {
    console.error('sms-webhook error:', err);
    return twimlResponse();
  }
});

function twimlResponse(): Response {
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    }
  );
}
