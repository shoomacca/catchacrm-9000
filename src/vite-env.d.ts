/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;

  // n8n
  readonly VITE_N8N_API_URL: string;
  readonly VITE_N8N_API_KEY: string;

  // Stripe
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly STRIPE_SECRET_KEY: string;
  readonly STRIPE_WEBHOOK_SECRET: string;

  // PayPal
  readonly VITE_PAYPAL_CLIENT_ID: string;
  readonly VITE_PAYPAL_CLIENT_SECRET: string;
  readonly VITE_PAYPAL_MODE: string;

  // AI Services
  readonly VITE_GEMINI_API_KEY: string;

  // Application
  readonly VITE_APP_URL: string;
  readonly NODE_ENV: string;

  // Email
  readonly SMTP_HOST: string;
  readonly SMTP_PORT: string;
  readonly SMTP_USER: string;
  readonly SMTP_PASSWORD: string;
  readonly SMTP_FROM: string;

  // VoIP
  readonly VOIP_PROVIDER_API_KEY: string;
  readonly VOIP_PROVIDER_URL: string;

  // SMS/WhatsApp
  readonly TWILIO_ACCOUNT_SID: string;
  readonly TWILIO_AUTH_TOKEN: string;
  readonly TWILIO_PHONE_NUMBER: string;

  // Demo
  readonly DEMO_ACCOUNT_RESET_INTERVAL: string;
  readonly DEMO_ACCOUNT_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
