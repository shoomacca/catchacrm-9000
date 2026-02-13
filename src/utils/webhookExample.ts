/**
 * Webhook Integration Examples
 *
 * This file demonstrates how to use the webhook logging and configuration functions.
 * These examples can be integrated into your event handlers, automation triggers, etc.
 */

import { Webhook } from '../types';
import { triggerWebhook, saveWebhookConfig, getWebhookLogs } from '../services/supabaseData';

/**
 * Example: Trigger a webhook when a lead is created
 */
export async function onLeadCreated(lead: any, webhook: Webhook) {
  if (!webhook.isActive || webhook.triggerEvent !== 'lead.created') {
    return;
  }

  const payload = {
    event: 'lead.created',
    timestamp: new Date().toISOString(),
    data: lead,
  };

  const { success, log } = await triggerWebhook(webhook, payload);

  if (success) {
    console.log('Webhook delivered successfully:', log);
  } else {
    console.error('Webhook delivery failed:', log?.error_message);
  }
}

/**
 * Example: Trigger a webhook when a deal is won
 */
export async function onDealWon(deal: any, webhook: Webhook) {
  if (!webhook.isActive || webhook.triggerEvent !== 'deal.won') {
    return;
  }

  const payload = {
    event: 'deal.won',
    timestamp: new Date().toISOString(),
    data: deal,
  };

  await triggerWebhook(webhook, payload);
}

/**
 * Example: Configure webhook authentication
 */
export async function configureWebhookAuth(webhookId: string) {
  // Example: Save webhook config with Bearer token auth
  await saveWebhookConfig({
    webhook_id: webhookId,
    auth_type: 'bearer',
    auth_token: 'your-secret-token-here',
    retry_enabled: true,
    retry_count: 3,
    timeout_ms: 30000,
  });
}

/**
 * Example: Get webhook delivery history
 */
export async function getWebhookHistory(webhookId: string) {
  const logs = await getWebhookLogs(webhookId, 50);

  console.log(`Webhook has ${logs.length} delivery attempts`);

  const successful = logs.filter(log => log.success).length;
  const failed = logs.filter(log => !log.success).length;

  console.log(`Success rate: ${successful}/${logs.length} (${((successful / logs.length) * 100).toFixed(1)}%)`);

  return logs;
}

/**
 * Example: Trigger all active webhooks for an event
 */
export async function triggerWebhooksForEvent(
  eventType: string,
  eventData: any,
  allWebhooks: Webhook[]
) {
  const activeWebhooks = allWebhooks.filter(
    wh => wh.isActive && wh.triggerEvent === eventType
  );

  console.log(`Triggering ${activeWebhooks.length} webhooks for event: ${eventType}`);

  const results = await Promise.allSettled(
    activeWebhooks.map(webhook =>
      triggerWebhook(webhook, {
        event: eventType,
        timestamp: new Date().toISOString(),
        data: eventData,
      })
    )
  );

  const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - succeeded;

  console.log(`Webhook results: ${succeeded} succeeded, ${failed} failed`);

  return results;
}
