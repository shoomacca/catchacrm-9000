/**
 * PayPal Billing Service
 *
 * Handles PayPal subscription billing as an alternative to Stripe.
 *
 * Note: Most PayPal operations happen server-side.
 * This client is for client-side PayPal button rendering.
 */

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
const PAYPAL_MODE = import.meta.env.VITE_PAYPAL_MODE || 'sandbox';

class PayPalService {
  private paypal: any = null;
  private enabled: boolean;

  constructor() {
    this.enabled = !!PAYPAL_CLIENT_ID;

    if (!this.enabled) {
      console.warn('[PayPal] Service not configured. Set VITE_PAYPAL_CLIENT_ID.');
    }
  }

  /**
   * Initialize PayPal SDK (lazy load)
   */
  private async initPayPal() {
    if (this.paypal) return this.paypal;

    if (!this.enabled) {
      throw new Error('PayPal not configured');
    }

    // @ts-ignore - PayPal loaded from CDN
    if (typeof paypal === 'undefined') {
      throw new Error('PayPal SDK not loaded. Add script to index.html');
    }

    // @ts-ignore
    this.paypal = paypal;
    return this.paypal;
  }

  /**
   * Check if PayPal is configured
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Render PayPal subscription button
   */
  async renderSubscriptionButton(
    containerId: string,
    planId: string,
    onApprove: (data: any) => void,
    onError: (error: any) => void
  ): Promise<void> {
    const paypal = await this.initPayPal();

    paypal
      .Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe',
        },
        createSubscription: (data: any, actions: any) => {
          return actions.subscription.create({
            plan_id: planId,
          });
        },
        onApprove: (data: any, actions: any) => {
          onApprove(data);
        },
        onError: (error: any) => {
          console.error('[PayPal] Subscription error:', error);
          onError(error);
        },
      })
      .render(`#${containerId}`);
  }

  /**
   * Render PayPal one-time payment button
   */
  async renderPaymentButton(
    containerId: string,
    amount: string,
    currency: string,
    onApprove: (data: any) => void,
    onError: (error: any) => void
  ): Promise<void> {
    const paypal = await this.initPayPal();

    paypal
      .Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount,
                  currency_code: currency,
                },
              },
            ],
          });
        },
        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture();
          onApprove(order);
        },
        onError: (error: any) => {
          console.error('[PayPal] Payment error:', error);
          onError(error);
        },
      })
      .render(`#${containerId}`);
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    if (!this.enabled) {
      throw new Error('PayPal not configured');
    }

    // This requires server-side API call
    // Client-side SDK doesn't expose subscription details
    console.warn('[PayPal] getSubscription must be called from server');
    return null;
  }
}

// Export singleton instance
export const paypalService = new PayPalService();
