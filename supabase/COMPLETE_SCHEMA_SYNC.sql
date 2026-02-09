-- ============================================
-- CatchaCRM - Complete Schema Sync
-- Audit Date: 2026-02-09
-- Purpose: Add all missing tables and fields to match frontend types.ts
-- ============================================

-- ============================================
-- SECTION 1: MISSING TABLES
-- These tables exist in frontend types.ts but not in database
-- ============================================

-- 1.1 Organization Users (User-Org Mapping for Multi-tenancy)
CREATE TABLE IF NOT EXISTS organization_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'manager', 'member'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_org_id ON organization_users(org_id);
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_organization_users" ON organization_users;
CREATE POLICY "allow_all_organization_users" ON organization_users FOR ALL USING (true);

-- 1.2 Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Active', -- 'Active', 'Paused', 'Cancelled'
  billing_cycle TEXT DEFAULT 'monthly', -- 'one-off', 'monthly', 'quarterly', 'yearly', 'custom'
  next_bill_date DATE,
  start_date DATE,
  end_date DATE,
  items JSONB, -- Array of line items
  auto_generate_invoice BOOLEAN DEFAULT true,
  last_invoice_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_account_id ON subscriptions(account_id);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_subscriptions" ON subscriptions;
CREATE POLICY "allow_all_subscriptions" ON subscriptions FOR ALL USING (true);

-- 1.3 Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_type TEXT,
  file_size TEXT,
  url TEXT,
  related_to_type TEXT,
  related_to_id UUID,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_documents_org_id ON documents(org_id);
CREATE INDEX IF NOT EXISTS idx_documents_related_to ON documents(related_to_type, related_to_id);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_documents" ON documents;
CREATE POLICY "allow_all_documents" ON documents FOR ALL USING (true);

-- 1.4 Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'urgent'
  read BOOLEAN DEFAULT false,
  link TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON notifications(org_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_notifications" ON notifications;
CREATE POLICY "allow_all_notifications" ON notifications FOR ALL USING (true);

-- 1.5 Conversations (Team Chat)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  participant_ids UUID[],
  name TEXT,
  is_system BOOLEAN DEFAULT false,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_conversations_org_id ON conversations(org_id);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_conversations" ON conversations;
CREATE POLICY "allow_all_conversations" ON conversations FOR ALL USING (true);

-- 1.6 Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id UUID,
  sender_id UUID,
  content TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_org_id ON chat_messages(org_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_chat_messages" ON chat_messages;
CREATE POLICY "allow_all_chat_messages" ON chat_messages FOR ALL USING (true);

-- 1.7 Referral Rewards (Marketing)
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  referrer_id UUID,
  referred_lead_id UUID,
  reward_amount DECIMAL(12,2),
  status TEXT DEFAULT 'Active', -- 'Active', 'Pending Payout', 'Paid', 'Cancelled'
  payout_date DATE,
  notes TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_org_id ON referral_rewards(org_id);
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_referral_rewards" ON referral_rewards;
CREATE POLICY "allow_all_referral_rewards" ON referral_rewards FOR ALL USING (true);

-- 1.8 Inbound Forms (Marketing)
CREATE TABLE IF NOT EXISTS inbound_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT, -- 'Contact', 'Lead', 'Quote Request', 'Support'
  fields JSONB, -- Array of form fields
  submit_button_text TEXT DEFAULT 'Submit',
  success_message TEXT,
  target_campaign_id UUID,
  submission_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  status TEXT DEFAULT 'Active', -- 'Active', 'Inactive', 'Draft'
  embed_code TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_inbound_forms_org_id ON inbound_forms(org_id);
ALTER TABLE inbound_forms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_inbound_forms" ON inbound_forms;
CREATE POLICY "allow_all_inbound_forms" ON inbound_forms FOR ALL USING (true);

-- 1.9 Chat Widgets (Marketing)
CREATE TABLE IF NOT EXISTS chat_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  page TEXT,
  bubble_color TEXT,
  welcome_message TEXT,
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'Active',
  routing_user_id UUID,
  conversations INTEGER DEFAULT 0,
  avg_response_time INTEGER,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_chat_widgets_org_id ON chat_widgets(org_id);
ALTER TABLE chat_widgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_chat_widgets" ON chat_widgets;
CREATE POLICY "allow_all_chat_widgets" ON chat_widgets FOR ALL USING (true);

-- 1.10 Calculators (Marketing)
CREATE TABLE IF NOT EXISTS calculators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT, -- 'ROI', 'Repayment', 'SolarYield'
  base_rate DECIMAL(10,4),
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'Active',
  usage_count INTEGER DEFAULT 0,
  lead_conversion_rate DECIMAL(5,2),
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_calculators_org_id ON calculators(org_id);
ALTER TABLE calculators ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_calculators" ON calculators;
CREATE POLICY "allow_all_calculators" ON calculators FOR ALL USING (true);

-- 1.11 Automation Workflows
CREATE TABLE IF NOT EXISTS automation_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger JSONB, -- WorkflowTrigger object
  nodes JSONB, -- Array of WorkflowNode
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  category TEXT, -- 'Sales', 'Operations', 'Logistics', 'System'
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_org_id ON automation_workflows(org_id);
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_automation_workflows" ON automation_workflows;
CREATE POLICY "allow_all_automation_workflows" ON automation_workflows FOR ALL USING (true);

-- 1.12 Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  method TEXT DEFAULT 'POST', -- 'GET', 'POST', 'PUT', 'DELETE'
  headers JSONB,
  is_active BOOLEAN DEFAULT true,
  trigger_event TEXT,
  last_triggered_at TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_webhooks_org_id ON webhooks(org_id);
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_webhooks" ON webhooks;
CREATE POLICY "allow_all_webhooks" ON webhooks FOR ALL USING (true);

-- 1.13 Industry Templates
CREATE TABLE IF NOT EXISTS industry_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_entity TEXT,
  industry TEXT,
  sections JSONB, -- Array of LayoutSection
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_industry_templates_org_id ON industry_templates(org_id);
ALTER TABLE industry_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_industry_templates" ON industry_templates;
CREATE POLICY "allow_all_industry_templates" ON industry_templates FOR ALL USING (true);

-- ============================================
-- SECTION 2: MISSING FIELDS ON EXISTING TABLES
-- ============================================

-- 2.1 Add owner_id to existing tables (for permission checks)
DO $$
BEGIN
  -- Accounts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'owner_id') THEN
    ALTER TABLE accounts ADD COLUMN owner_id UUID;
  END IF;

  -- Leads
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'owner_id') THEN
    ALTER TABLE leads ADD COLUMN owner_id UUID;
  END IF;

  -- Deals
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'owner_id') THEN
    ALTER TABLE deals ADD COLUMN owner_id UUID;
  END IF;

  -- Contacts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'owner_id') THEN
    ALTER TABLE contacts ADD COLUMN owner_id UUID;
  END IF;

  -- Tasks
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'owner_id') THEN
    ALTER TABLE tasks ADD COLUMN owner_id UUID;
  END IF;
END $$;

-- 2.2 Add missing fields to accounts table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'address') THEN
    ALTER TABLE accounts ADD COLUMN address JSONB;
  END IF;
END $$;

-- 2.3 Add missing fields to leads table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'address') THEN
    ALTER TABLE leads ADD COLUMN address JSONB;
  END IF;
END $$;

-- 2.4 Add missing fields to contacts table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'address') THEN
    ALTER TABLE contacts ADD COLUMN address JSONB;
  END IF;
END $$;

-- 2.5 Add missing fields to organizations table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'plan') THEN
    ALTER TABLE organizations ADD COLUMN plan TEXT DEFAULT 'free';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'subscription_status') THEN
    ALTER TABLE organizations ADD COLUMN subscription_status TEXT DEFAULT 'active';
  END IF;
END $$;

-- ============================================
-- SECTION 3: DEMO ORGANIZATION SETUP
-- ============================================

-- Ensure demo organization exists
INSERT INTO organizations (id, name, slug, plan, subscription_status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Organization',
  'demo',
  'enterprise',
  'active'
) ON CONFLICT (id) DO UPDATE SET
  name = 'Demo Organization',
  plan = 'enterprise',
  subscription_status = 'active';

-- Create demo user if not exists
INSERT INTO users (id, org_id, name, email, role, avatar, created_at, updated_at, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Demo User',
  'demo@catchacrm.com',
  'admin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  NOW(),
  NOW(),
  'system'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SECTION 4: VERIFICATION QUERY
-- ============================================

-- Run this to verify all tables exist:
DO $$
DECLARE
  expected_tables TEXT[] := ARRAY[
    'organizations', 'organization_users', 'users',
    'accounts', 'contacts', 'leads', 'deals',
    'tasks', 'calendar_events', 'campaigns', 'communications', 'tickets',
    'invoices', 'quotes', 'products', 'services', 'subscriptions', 'expenses', 'bank_transactions',
    'jobs', 'crews', 'zones', 'equipment', 'inventory_items', 'purchase_orders', 'warehouses',
    'referral_rewards', 'inbound_forms', 'chat_widgets', 'calculators', 'reviews',
    'automation_workflows', 'webhooks', 'industry_templates',
    'notifications', 'documents', 'audit_log', 'conversations', 'chat_messages'
  ];
  tbl TEXT;
  missing_tables TEXT[] := ARRAY[]::TEXT[];
  found_count INTEGER := 0;
BEGIN
  FOREACH tbl IN ARRAY expected_tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      found_count := found_count + 1;
    ELSE
      missing_tables := array_append(missing_tables, tbl);
    END IF;
  END LOOP;

  RAISE NOTICE '============================================';
  RAISE NOTICE 'SCHEMA AUDIT RESULTS';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Expected tables: %', array_length(expected_tables, 1);
  RAISE NOTICE 'Found tables: %', found_count;
  RAISE NOTICE 'Missing tables: %', COALESCE(array_length(missing_tables, 1), 0);

  IF array_length(missing_tables, 1) > 0 THEN
    RAISE NOTICE 'MISSING: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE '✅ ALL TABLES PRESENT!';
  END IF;
  RAISE NOTICE '============================================';
END $$;

-- List all tables with row counts for verification
SELECT
  t.table_name,
  CASE WHEN c.reltuples >= 0 THEN c.reltuples::bigint ELSE 0 END as approx_row_count
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;
