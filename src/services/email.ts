/**
 * Email Service
 *
 * Handles email notifications and campaigns.
 *
 * Note: Actual email sending happens server-side via SMTP or n8n workflows.
 * This service provides a client-side API to trigger email operations.
 */

import { ApiClient } from '../lib/api-client';

const API_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

interface EmailPayload {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string; // base64
  }>;
}

class EmailService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient(`${API_URL}/api`);
  }

  /**
   * Send a single email
   */
  async sendEmail(payload: EmailPayload): Promise<any> {
    try {
      return await this.client.post('/email/send', payload);
    } catch (error) {
      console.error('[Email] Send failed:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails (campaign)
   */
  async sendBulkEmail(
    recipients: string[],
    subject: string,
    body: string,
    html?: string
  ): Promise<any> {
    try {
      return await this.client.post('/email/bulk', {
        recipients,
        subject,
        body,
        html,
      });
    } catch (error) {
      console.error('[Email] Bulk send failed:', error);
      throw error;
    }
  }

  /**
   * Send email via template
   */
  async sendTemplatedEmail(
    to: string | string[],
    templateId: string,
    variables: Record<string, any>
  ): Promise<any> {
    try {
      return await this.client.post('/email/template', {
        to,
        templateId,
        variables,
      });
    } catch (error) {
      console.error('[Email] Template send failed:', error);
      throw error;
    }
  }

  /**
   * Get email delivery status
   */
  async getEmailStatus(emailId: string): Promise<any> {
    try {
      return await this.client.get(`/email/status/${emailId}`);
    } catch (error) {
      console.error('[Email] Status check failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
