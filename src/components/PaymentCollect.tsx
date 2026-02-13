import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, DollarSign, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useCRM } from '../context/CRMContext';
import { createStripePayment } from '../services/stripeService';
import { createPayPalOrder, capturePayPalOrder } from '../services/paypalService';
import type { PaymentTransaction } from '../types';

interface PaymentCollectProps {
  orgId: string;
  amount: number;
  currency?: string;
  description?: string;
  contactId?: string;
  contactName?: string;
  contactEmail?: string;
  dealId?: string;
  invoiceId?: string;
  onSuccess: (transaction: Partial<PaymentTransaction>) => void;
  onError: (error: string) => void;
}

// Stripe card form (inside Elements provider)
const StripeCardForm: React.FC<{
  clientSecret: string;
  transactionId: string;
  amount: number;
  currency: string;
  onSuccess: PaymentCollectProps['onSuccess'];
  onError: PaymentCollectProps['onError'];
}> = ({ clientSecret, transactionId, amount, currency, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const card = elements.getElement(CardElement);
    if (!card) { setProcessing(false); return; }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess({
        id: transactionId,
        provider: 'stripe',
        amount,
        currency,
        status: 'succeeded',
        provider_transaction_id: paymentIntent.id,
        payment_method: 'card',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <CardElement options={{
          style: {
            base: {
              fontSize: '14px',
              fontFamily: 'inherit',
              color: '#1e293b',
              '::placeholder': { color: '#94a3b8' },
            },
          },
        }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {processing ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : `Pay ${currency.toUpperCase()} $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

export const PaymentCollect: React.FC<PaymentCollectProps> = ({
  orgId,
  amount,
  currency = 'aud',
  description,
  contactId,
  contactName,
  contactEmail,
  dealId,
  invoiceId,
  onSuccess,
  onError,
}) => {
  const { companyIntegrations, settings } = useCRM();
  const [activeMethod, setActiveMethod] = useState<'stripe' | 'paypal' | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [paypalTransactionId, setPaypalTransactionId] = useState<string | null>(null);
  const isDarkMode = settings.branding?.theme === 'dark';

  // Find active payment configs
  const stripeConfig = useMemo(
    () => companyIntegrations.find(i => i.provider === 'stripe' && i.is_active),
    [companyIntegrations]
  );
  const paypalConfig = useMemo(
    () => companyIntegrations.find(i => i.provider === 'paypal' && i.is_active),
    [companyIntegrations]
  );

  const stripePublishableKey = stripeConfig?.config?.publishable_key || stripeConfig?.config?.publicKey;
  const paypalClientId = paypalConfig?.config?.client_id || paypalConfig?.config?.clientId;
  const paypalMode = paypalConfig?.config?.mode || 'sandbox';

  const hasStripe = !!stripePublishableKey;
  const hasPayPal = !!paypalClientId;

  // Auto-select if only one method
  useEffect(() => {
    if (hasStripe && !hasPayPal) setActiveMethod('stripe');
    else if (hasPayPal && !hasStripe) setActiveMethod('paypal');
  }, [hasStripe, hasPayPal]);

  // Initialize Stripe when selected
  useEffect(() => {
    if (activeMethod === 'stripe' && stripePublishableKey && !clientSecret) {
      setLoadingStripe(true);
      setStripePromise(loadStripe(stripePublishableKey));

      createStripePayment({
        orgId, amount, currency, description,
        contactId, contactName, contactEmail, dealId, invoiceId,
      })
        .then(res => {
          setClientSecret(res.clientSecret);
          setTransactionId(res.transactionId);
        })
        .catch(err => onError(err.message))
        .finally(() => setLoadingStripe(false));
    }
  }, [activeMethod, stripePublishableKey, orgId, amount, currency, description, contactId, contactName, contactEmail, dealId, invoiceId, clientSecret, onError]);

  if (!hasStripe && !hasPayPal) {
    return (
      <div className={`p-8 text-center rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <AlertCircle size={32} className="mx-auto text-amber-500 mb-3" />
        <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>No payment methods configured</p>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Admin must set up Stripe or PayPal in Settings → Integrations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Payment method tabs */}
      {hasStripe && hasPayPal && (
        <div className="flex gap-2">
          <button
            onClick={() => setActiveMethod('stripe')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border ${
              activeMethod === 'stripe'
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                : isDarkMode
                  ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CreditCard size={16} /> Pay with Card
          </button>
          <button
            onClick={() => setActiveMethod('paypal')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border ${
              activeMethod === 'paypal'
                ? 'bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-500/20'
                : isDarkMode
                  ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <DollarSign size={16} /> PayPal
          </button>
        </div>
      )}

      {/* Stripe Card Form */}
      {activeMethod === 'stripe' && (
        <div>
          {loadingStripe ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-blue-500" />
              <span className="ml-2 text-xs font-bold text-slate-500">Loading payment form...</span>
            </div>
          ) : clientSecret && stripePromise && transactionId ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripeCardForm
                clientSecret={clientSecret}
                transactionId={transactionId}
                amount={amount}
                currency={currency}
                onSuccess={onSuccess}
                onError={onError}
              />
            </Elements>
          ) : null}
        </div>
      )}

      {/* PayPal Buttons */}
      {activeMethod === 'paypal' && paypalClientId && (
        <PayPalScriptProvider options={{
          clientId: paypalClientId,
          currency: currency.toUpperCase(),
          intent: 'capture',
        }}>
          <PayPalButtons
            style={{ layout: 'vertical', shape: 'rect', label: 'pay' }}
            createOrder={async () => {
              try {
                const res = await createPayPalOrder({
                  orgId, amount, currency, description,
                  contactId, contactName: contactName, dealId, invoiceId,
                });
                setPaypalTransactionId(res.transactionId);
                return res.orderId;
              } catch (err: any) {
                onError(err.message);
                throw err;
              }
            }}
            onApprove={async (data) => {
              if (!paypalTransactionId) return;
              try {
                const res = await capturePayPalOrder({
                  orgId,
                  orderId: data.orderID,
                  transactionId: paypalTransactionId,
                });
                if (res.success) {
                  onSuccess({
                    id: paypalTransactionId,
                    provider: 'paypal',
                    amount,
                    currency,
                    status: 'succeeded',
                    provider_transaction_id: data.orderID,
                    payment_method: 'paypal',
                  });
                } else {
                  onError(res.error || 'PayPal capture failed');
                }
              } catch (err: any) {
                onError(err.message);
              }
            }}
            onError={(err) => {
              onError(typeof err === 'string' ? err : 'PayPal payment failed');
            }}
          />
        </PayPalScriptProvider>
      )}
    </div>
  );
};

export default PaymentCollect;
