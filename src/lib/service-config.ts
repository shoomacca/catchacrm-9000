/**
 * Service Configuration
 *
 * Centralized configuration and health checks for all services.
 */

export interface ServiceStatus {
  name: string;
  enabled: boolean;
  configured: boolean;
  message?: string;
}

export const getServiceStatus = (): ServiceStatus[] => {
  return [
    {
      name: 'Supabase',
      enabled: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
      configured: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
      message: import.meta.env.VITE_SUPABASE_URL ? 'Connected' : 'Missing VITE_SUPABASE_URL',
    },
    {
      name: 'n8n',
      enabled: !!(import.meta.env.N8N_API_URL && import.meta.env.N8N_API_KEY),
      configured: !!(import.meta.env.N8N_API_URL && import.meta.env.N8N_API_KEY),
      message: import.meta.env.N8N_API_URL ? 'Connected' : 'Optional - Set N8N_API_URL to enable',
    },
    {
      name: 'Stripe',
      enabled: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      configured: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      message: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
        ? 'Connected'
        : 'Optional - Set VITE_STRIPE_PUBLISHABLE_KEY to enable',
    },
    {
      name: 'PayPal',
      enabled: !!import.meta.env.PAYPAL_CLIENT_ID,
      configured: !!import.meta.env.PAYPAL_CLIENT_ID,
      message: import.meta.env.PAYPAL_CLIENT_ID
        ? 'Connected'
        : 'Optional - Set PAYPAL_CLIENT_ID to enable',
    },
    {
      name: 'Gemini AI',
      enabled: !!import.meta.env.VITE_GEMINI_API_KEY,
      configured: !!import.meta.env.VITE_GEMINI_API_KEY,
      message: import.meta.env.VITE_GEMINI_API_KEY
        ? 'Connected'
        : 'Optional - Set VITE_GEMINI_API_KEY to enable',
    },
  ];
};

export const checkRequiredServices = (): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  if (!import.meta.env.VITE_SUPABASE_URL) {
    missing.push('VITE_SUPABASE_URL');
  }

  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    missing.push('VITE_SUPABASE_ANON_KEY');
  }

  return {
    valid: missing.length === 0,
    missing,
  };
};
