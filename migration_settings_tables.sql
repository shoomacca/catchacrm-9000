-- ============================================
-- MIGRATION: Settings Tables
-- ============================================
-- Purpose: Create/update company_settings and crm_settings tables for Supabase persistence
-- Date: 2026-02-12
--
-- These tables replace localStorage for settings persistence.
-- ============================================

-- ============================================
-- 1. CREATE company_settings TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS company_settings (
  org_id uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,

  -- Organization Profile
  organization jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Localization
  localization jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Branding
  branding jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_settings
DROP POLICY IF EXISTS "Users can view their org's company settings" ON company_settings;
CREATE POLICY "Users can view their org's company settings"
ON company_settings
FOR SELECT
USING (org_id IN (SELECT user_org_ids()));

DROP POLICY IF EXISTS "Users can insert their org's company settings" ON company_settings;
CREATE POLICY "Users can insert their org's company settings"
ON company_settings
FOR INSERT
WITH CHECK (org_id IN (SELECT user_org_ids()));

DROP POLICY IF EXISTS "Users can update their org's company settings" ON company_settings;
CREATE POLICY "Users can update their org's company settings"
ON company_settings
FOR UPDATE
USING (org_id IN (SELECT user_org_ids()));

DROP POLICY IF EXISTS "Users can delete their org's company settings" ON company_settings;
CREATE POLICY "Users can delete their org's company settings"
ON company_settings
FOR DELETE
USING (org_id IN (SELECT user_org_ids()));

-- ============================================
-- 2. CREATE crm_settings TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS crm_settings (
  org_id uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,

  -- Feature Modules
  modules jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Access Control
  roles jsonb NOT NULL DEFAULT '[]'::jsonb,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  teams jsonb NOT NULL DEFAULT '[]'::jsonb,
  crews jsonb NOT NULL DEFAULT '[]'::jsonb,
  field_level_security jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Integrations
  integrations jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Automation
  automation jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Sales Domain Config
  pipelines jsonb NOT NULL DEFAULT '[]'::jsonb,
  lead_scoring jsonb NOT NULL DEFAULT '[]'::jsonb,
  lost_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  quote_validity_days integer NOT NULL DEFAULT 30,
  payment_terms text NOT NULL DEFAULT 'Net 30',

  -- Financial Domain Config
  tax_engine jsonb NOT NULL DEFAULT '[]'::jsonb,
  ledger_mapping jsonb NOT NULL DEFAULT '[]'::jsonb,
  numbering_series jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Field Operations Config
  job_templates jsonb NOT NULL DEFAULT '[]'::jsonb,
  zones jsonb NOT NULL DEFAULT '[]'::jsonb,
  inventory_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  scheduling jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Marketing Config
  review_platforms jsonb NOT NULL DEFAULT '[]'::jsonb,
  referral_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  sender_profiles jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Diagnostics
  diagnostics jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Backward Compatibility Fields
  lead_statuses jsonb NOT NULL DEFAULT '[]'::jsonb,
  lead_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  deal_stages jsonb NOT NULL DEFAULT '[]'::jsonb,
  ticket_statuses jsonb NOT NULL DEFAULT '[]'::jsonb,
  ticket_priorities jsonb NOT NULL DEFAULT '[]'::jsonb,
  ticket_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  task_statuses jsonb NOT NULL DEFAULT '[]'::jsonb,
  task_priorities jsonb NOT NULL DEFAULT '[]'::jsonb,
  sla_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  default_assignments jsonb NOT NULL DEFAULT '{}'::jsonb,
  industries jsonb NOT NULL DEFAULT '[]'::jsonb,
  tiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  account_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  deal_loss_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  required_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  validation_rules jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Industry Blueprint System
  active_industry text NOT NULL DEFAULT 'general',
  industry_blueprints jsonb NOT NULL DEFAULT '{}'::jsonb,
  custom_entities jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE crm_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_settings
DROP POLICY IF EXISTS "Users can view their org's CRM settings" ON crm_settings;
CREATE POLICY "Users can view their org's CRM settings"
ON crm_settings
FOR SELECT
USING (org_id IN (SELECT user_org_ids()));

DROP POLICY IF EXISTS "Users can insert their org's CRM settings" ON crm_settings;
CREATE POLICY "Users can insert their org's CRM settings"
ON crm_settings
FOR INSERT
WITH CHECK (org_id IN (SELECT user_org_ids()));

DROP POLICY IF EXISTS "Users can update their org's CRM settings" ON crm_settings;
CREATE POLICY "Users can update their org's CRM settings"
ON crm_settings
FOR UPDATE
USING (org_id IN (SELECT user_org_ids()));

DROP POLICY IF EXISTS "Users can delete their org's CRM settings" ON crm_settings;
CREATE POLICY "Users can delete their org's CRM settings"
ON crm_settings
FOR DELETE
USING (org_id IN (SELECT user_org_ids()));

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_company_settings_org_id ON company_settings(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_settings_org_id ON crm_settings(org_id);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check tables exist
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('company_settings', 'crm_settings')
ORDER BY table_name;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('company_settings', 'crm_settings');

-- Check policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('company_settings', 'crm_settings')
ORDER BY tablename, policyname;
