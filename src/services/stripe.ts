/**
 * Stripe Billing Service
 *
 * Handles per-seat subscription billing via Stripe.
 *
 * Note: Most Stripe operations happen server-side.
 * This client is for client-side operations only (checkout, portal).
 */

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

class StripeService {
  private stripe: any = null;
  private enabled: boolean;

  constructor() {
    this.enabled = !!STRIPE_PUBLISHABLE_KEY;

    if (!this.enabled) {
      console.warn('[Stripe] Service not configured. Set VITE_STRIPE_PUBLISHABLE_KEY.');
    }
  }

  /**
   * Initialize Stripe.js (lazy load)
   */
  private async initStripe() {
    if (this.stripe) return this.stripe;

    if (!this.enabled) {
      throw new Error('Stripe not configured');
    }

    // @ts-ignore - Stripe loaded from CDN
    if (typeof Stripe === 'undefined') {
      throw new Error('Stripe.js not loaded. Add <script src="https://js.stripe.com/v3/"></script> to index.html');
    }

    // @ts-ignore
    this.stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    return this.stripe;
  }

  /**
   * Check if Stripe is configured
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Redirect to Stripe Checkout for subscription
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await this.initStripe();
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error('[Stripe] Checkout redirect failed:', error);
      throw error;
    }
  }

  /**
   * Redirect to Stripe Customer Portal
   */
  async redirectToPortal(portalUrl: string): Promise<void> {
    window.location.href = portalUrl;
  }

  /**
   * Create Payment Method (for saved cards)
   */
  async createPaymentMethod(cardElement: any): Promise<any> {
    const stripe = await this.initStripe();
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error('[Stripe] Payment method creation failed:', error);
      throw error;
    }

    return paymentMethod;
  }

  /**
   * Confirm Payment Intent
   */
  async confirmPayment(clientSecret: string, paymentMethod: any): Promise<any> {
    const stripe = await this.initStripe();
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod,
    });

    if (error) {
      console.error('[Stripe] Payment confirmation failed:', error);
      throw error;
    }

    return paymentIntent;
  }
}

// Export singleton instance
export const stripeService = new StripeService();
