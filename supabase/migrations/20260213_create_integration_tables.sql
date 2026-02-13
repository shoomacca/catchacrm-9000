-- Migration: Create Integration Tables
-- Created: 2026-02-13
-- Purpose: Add tables for Google Workspace, SMS, Payments, and Google Maps integrations

-- ============================================
-- Table 1: company_integrations
-- Stores org-level integration configs (Stripe, PayPal, Google Maps, Twilio)
-- ============================================

CREATE TABLE IF NOT EXISTS company_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal', 'google_maps', 'twilio')),
  is_active BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  UNIQUE(org_id, provider)
);

ALTER TABLE company_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_integrations_org_select" ON company_integrations FOR SELECT
  USING (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "company_integrations_org_insert" ON company_integrations FOR INSERT
  WITH CHECK (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "company_integrations_org_update" ON company_integrations FOR UPDATE
  USING (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "company_integrations_org_delete" ON company_integrations FOR DELETE
  USING (org_id IN (SELECT public.user_org_ids()));

COMMENT ON TABLE company_integrations IS 'Organization-level integration configurations for external services';
COMMENT ON COLUMN company_integrations.provider IS 'Integration provider: stripe, paypal, google_maps, twilio';
COMMENT ON COLUMN company_integrations.config IS 'JSONB configuration object with provider-specific keys (API keys, tokens, etc.)';

-- ============================================
-- Table 2: user_integrations
-- Stores per-user OAuth tokens (Google Workspace)
-- ============================================

CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'google',
  connected_email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  sync_config JSONB DEFAULT '{"sync_calendar": true, "sync_gmail": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id, provider)
);

ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_integrations_own_or_admin_select" ON user_integrations FOR SELECT
  USING (user_id = auth.uid() OR org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "user_integrations_own_insert" ON user_integrations FOR INSERT
  WITH CHECK (user_id = auth.uid() AND org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "user_integrations_own_update" ON user_integrations FOR UPDATE
  USING (user_id = auth.uid() OR org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "user_integrations_own_delete" ON user_integrations FOR DELETE
  USING (user_id = auth.uid() OR org_id IN (SELECT public.user_org_ids()));

COMMENT ON TABLE user_integrations IS 'Per-user OAuth integrations (e.g., Google Workspace for individual Gmail and Calendar)';
COMMENT ON COLUMN user_integrations.sync_config IS 'User preferences for what to sync (calendar, gmail, etc.)';

-- ============================================
-- Table 3: org_email_accounts
-- Stores org-level email accounts with their purposes (billing, support, info, ops)
-- ============================================

CREATE TABLE IF NOT EXISTS org_email_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  purpose TEXT NOT NULL CHECK (purpose IN ('billing', 'support', 'info', 'operations', 'marketing')),
  provider TEXT DEFAULT 'google' CHECK (provider IN ('google', 'microsoft')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  calendar_id TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  UNIQUE(org_id, email, purpose)
);

ALTER TABLE org_email_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_email_accounts_org_select" ON org_email_accounts FOR SELECT
  USING (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "org_email_accounts_org_insert" ON org_email_accounts FOR INSERT
  WITH CHECK (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "org_email_accounts_org_update" ON org_email_accounts FOR UPDATE
  USING (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "org_email_accounts_org_delete" ON org_email_accounts FOR DELETE
  USING (org_id IN (SELECT public.user_org_ids()));

COMMENT ON TABLE org_email_accounts IS 'Organization-level email accounts for different business functions';
COMMENT ON COLUMN org_email_accounts.purpose IS 'Business function: billing, support, info, operations, marketing';
COMMENT ON COLUMN org_email_accounts.is_default IS 'Whether this is the default account for its purpose';

-- ============================================
-- Table 4: sms_numbers
-- Stores org-level SMS phone numbers with their purposes
-- ============================================

CREATE TABLE IF NOT EXISTS sms_numbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  display_name TEXT,
  purpose TEXT NOT NULL CHECK (purpose IN ('general', 'marketing', 'campaigns', 'support', 'operations')),
  provider TEXT DEFAULT 'twilio' CHECK (provider IN ('twilio', 'messagebird', 'vonage')),
  provider_sid TEXT,
  capabilities JSONB DEFAULT '{"sms": true, "mms": false, "voice": false}',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  UNIQUE(org_id, phone_number)
);

ALTER TABLE sms_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sms_numbers_org_select" ON sms_numbers FOR SELECT
  USING (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "sms_numbers_org_insert" ON sms_numbers FOR INSERT
  WITH CHECK (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "sms_numbers_org_update" ON sms_numbers FOR UPDATE
  USING (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "sms_numbers_org_delete" ON sms_numbers FOR DELETE
  USING (org_id IN (SELECT public.user_org_ids()));

COMMENT ON TABLE sms_numbers IS 'Organization-level SMS phone numbers for different purposes';
COMMENT ON COLUMN sms_numbers.purpose IS 'Phone number purpose: general, marketing, campaigns, support, operations';
COMMENT ON COLUMN sms_numbers.capabilities IS 'JSONB object indicating SMS, MMS, and voice capabilities';
COMMENT ON COLUMN sms_numbers.is_default IS 'Whether this is the default number for its purpose';

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX idx_company_integrations_org_provider ON company_integrations(org_id, provider);
CREATE INDEX idx_user_integrations_org_user ON user_integrations(org_id, user_id);
CREATE INDEX idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX idx_org_email_accounts_org_purpose ON org_email_accounts(org_id, purpose);
CREATE INDEX idx_org_email_accounts_email ON org_email_accounts(email);
CREATE INDEX idx_sms_numbers_org_purpose ON sms_numbers(org_id, purpose);
CREATE INDEX idx_sms_numbers_phone ON sms_numbers(phone_number);

-- ============================================
-- Verification
-- ============================================

-- Verify tables created
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('company_integrations', 'user_integrations', 'org_email_accounts', 'sms_numbers')
  ) THEN
    RAISE NOTICE 'Integration tables created successfully';
  ELSE
    RAISE EXCEPTION 'Failed to create one or more integration tables';
  END IF;
END $$;
