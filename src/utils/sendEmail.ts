/**
 * Email Sending Utility
 *
 * Handles sending emails via Gmail API through Supabase Edge Function
 */

import { supabase } from '../lib/supabase';
import { getCurrentOrgId } from '../services/supabaseData';

export interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded
  mimeType?: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  threadId?: string;
  error?: string;
  details?: any;
}

/**
 * Send an email via Gmail API using the gmail-send Edge Function
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResponse> {
  try {
    const organizationId = await getCurrentOrgId();

    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        error: 'Not authenticated. Please sign in to send emails.',
      };
    }

    // Call the gmail-send Edge Function
    const { data, error } = await supabase.functions.invoke('gmail-send', {
      body: {
        ...params,
        organizationId,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
        details: error,
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Unknown error occurred',
        details: data.details,
      };
    }

    return {
      success: true,
      messageId: data.messageId,
      threadId: data.threadId,
    };
  } catch (error: any) {
    console.error('Send email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Initiate Gmail OAuth flow
 * Opens a popup window for the user to authorize Gmail access
 *
 * @returns Promise that resolves with the authorization code
 */
export function initiateGmailOAuth(): Promise<string> {
  return new Promise((resolve, reject) => {
    // This would typically open a popup window to Google's OAuth consent screen
    // The actual implementation would depend on your OAuth configuration

    // For now, this is a placeholder that instructs users to set up OAuth
    reject(new Error('Gmail OAuth setup required. Please configure Gmail OAuth credentials in your Supabase project settings.'));
  });
}

/**
 * Check if Gmail is configured for the current organization
 */
export async function isGmailConfigured(): Promise<boolean> {
  try {
    const orgId = await getCurrentOrgId();
    const { data: org } = await supabase
      .from('organizations')
      .select('gmail_email, gmail_refresh_token')
      .eq('id', orgId)
      .single();

    return !!(org?.gmail_email && org?.gmail_refresh_token);
  } catch (error) {
    console.error('Error checking Gmail configuration:', error);
    return false;
  }
}

/**
 * Get configured Gmail email address for the current organization
 */
export async function getGmailEmail(): Promise<string | null> {
  try {
    const orgId = await getCurrentOrgId();
    const { data: org } = await supabase
      .from('organizations')
      .select('gmail_email')
      .eq('id', orgId)
      .single();

    return org?.gmail_email || null;
  } catch (error) {
    console.error('Error getting Gmail email:', error);
    return null;
  }
}
