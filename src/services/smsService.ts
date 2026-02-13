/**
 * SMS Service
 *
 * Frontend helpers for SMS operations. Calls the sms-send Edge Function
 * which reads per-org Twilio credentials from the database at runtime.
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

/**
 * Send an SMS via the sms-send Edge Function.
 */
export async function sendSMS(params: {
  orgId: string;
  to: string;
  body: string;
  fromNumberId?: string;
  purpose?: string;
  contactId?: string;
  contactName?: string;
  dealId?: string;
  ticketId?: string;
  campaignId?: string;
}): Promise<{ success: boolean; messageId?: string; twilioSid?: string; error?: string }> {
  try {
    const token = await getAccessToken();

    const res = await fetch(`${SUPABASE_URL}/functions/v1/sms-send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        org_id: params.orgId,
        to: params.to,
        body: params.body,
        from_number_id: params.fromNumberId,
        purpose: params.purpose,
        contact_id: params.contactId,
        contact_name: params.contactName,
        deal_id: params.dealId,
        ticket_id: params.ticketId,
        campaign_id: params.campaignId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || `SMS send failed: ${res.status}` };
    }

    return {
      success: true,
      messageId: data.message_id,
      twilioSid: data.twilio_sid,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send SMS',
    };
  }
}

/**
 * Format a phone number to E.164 format.
 * Handles common Australian and US formats.
 */
export function formatPhoneE164(phone: string, defaultCountryCode = '+61'): string {
  // Strip all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Already in E.164 format
  if (cleaned.startsWith('+') && cleaned.length >= 10) {
    return cleaned;
  }

  // Remove leading +
  cleaned = cleaned.replace(/^\+/, '');

  // Australian mobile: 04XX -> +614XX
  if (cleaned.startsWith('0') && defaultCountryCode === '+61') {
    return '+61' + cleaned.substring(1);
  }

  // US: 10-digit -> +1XXXXXXXXXX
  if (cleaned.length === 10 && defaultCountryCode === '+1') {
    return '+1' + cleaned;
  }

  // If it starts with country code already (e.g., 61...)
  if (cleaned.startsWith('61') && cleaned.length >= 11) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return '+' + cleaned;
  }

  // Default: prepend country code
  return defaultCountryCode + cleaned;
}
