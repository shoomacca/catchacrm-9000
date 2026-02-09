-- ============================================
-- CatchaCRM Flash UI - Schema Migration
-- Adds CRM tables and columns for Matrix data
-- Apply via: Supabase Dashboard → SQL Editor
-- ============================================

-- Add missing columns to accounts
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS revenue DECIMAL(12,2);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS employees INTEGER;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS description TEXT;

-- Add missing columns to contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  phone TEXT,
  status TEXT DEFAULT 'new',
  source TEXT,
  estimated_value DECIMAL(12,2),
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',
  notes TEXT,
  score INTEGER DEFAULT 0,
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_select_own_org" ON leads;
CREATE POLICY "leads_select_own_org" ON leads
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "leads_insert_own_org" ON leads;
CREATE POLICY "leads_insert_own_org" ON leads
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "leads_update_own_org" ON leads;
CREATE POLICY "leads_update_own_org" ON leads
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "leads_delete_own_org" ON leads;
CREATE POLICY "leads_delete_own_org" ON leads
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- Create deals table (replacement for opportunities)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12,2),
  stage TEXT DEFAULT 'qualification',
  probability INTEGER DEFAULT 50,
  expected_close_date DATE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  assigned_to UUID,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deals_select_own_org" ON deals;
CREATE POLICY "deals_select_own_org" ON deals
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "deals_insert_own_org" ON deals;
CREATE POLICY "deals_insert_own_org" ON deals
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "deals_update_own_org" ON deals;
CREATE POLICY "deals_update_own_org" ON deals
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "deals_delete_own_org" ON deals;
CREATE POLICY "deals_delete_own_org" ON deals
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  assigned_to UUID,
  related_entity_type TEXT,
  related_entity_id UUID,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select_own_org" ON tasks;
CREATE POLICY "tasks_select_own_org" ON tasks
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "tasks_insert_own_org" ON tasks;
CREATE POLICY "tasks_insert_own_org" ON tasks
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "tasks_update_own_org" ON tasks;
CREATE POLICY "tasks_update_own_org" ON tasks
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "tasks_delete_own_org" ON tasks;
CREATE POLICY "tasks_delete_own_org" ON tasks
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  target_audience TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaigns_select_own_org" ON campaigns;
CREATE POLICY "campaigns_select_own_org" ON campaigns
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "campaigns_insert_own_org" ON campaigns;
CREATE POLICY "campaigns_insert_own_org" ON campaigns
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "campaigns_update_own_org" ON campaigns;
CREATE POLICY "campaigns_update_own_org" ON campaigns
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "campaigns_delete_own_org" ON campaigns;
CREATE POLICY "campaigns_delete_own_org" ON campaigns
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  category TEXT,
  assigned_to UUID,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tickets_select_own_org" ON tickets;
CREATE POLICY "tickets_select_own_org" ON tickets
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "tickets_insert_own_org" ON tickets;
CREATE POLICY "tickets_insert_own_org" ON tickets
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "tickets_update_own_org" ON tickets;
CREATE POLICY "tickets_update_own_org" ON tickets
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "tickets_delete_own_org" ON tickets;
CREATE POLICY "tickets_delete_own_org" ON tickets
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'scheduled',
  priority TEXT DEFAULT 'medium',
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  assigned_crew UUID,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jobs_select_own_org" ON jobs;
CREATE POLICY "jobs_select_own_org" ON jobs
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "jobs_insert_own_org" ON jobs;
CREATE POLICY "jobs_insert_own_org" ON jobs
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "jobs_update_own_org" ON jobs;
CREATE POLICY "jobs_update_own_org" ON jobs
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "jobs_delete_own_org" ON jobs;
CREATE POLICY "jobs_delete_own_org" ON jobs
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- Create crews table
CREATE TABLE IF NOT EXISTS crews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  members INTEGER DEFAULT 0,
  leader TEXT,
  status TEXT DEFAULT 'active',
  specialty TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crews_select_own_org" ON crews;
CREATE POLICY "crews_select_own_org" ON crews
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "crews_insert_own_org" ON crews;
CREATE POLICY "crews_insert_own_org" ON crews
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "crews_update_own_org" ON crews;
CREATE POLICY "crews_update_own_org" ON crews
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "crews_delete_own_org" ON crews;
CREATE POLICY "crews_delete_own_org" ON crews
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  model TEXT,
  status TEXT DEFAULT 'available',
  location TEXT,
  value DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "equipment_select_own_org" ON equipment;
CREATE POLICY "equipment_select_own_org" ON equipment
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "equipment_insert_own_org" ON equipment;
CREATE POLICY "equipment_insert_own_org" ON equipment
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "equipment_update_own_org" ON equipment;
CREATE POLICY "equipment_update_own_org" ON equipment
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "equipment_delete_own_org" ON equipment;
CREATE POLICY "equipment_delete_own_org" ON equipment
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- Create zones table
CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'active',
  description TEXT,
  coordinates TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "zones_select_own_org" ON zones;
CREATE POLICY "zones_select_own_org" ON zones
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "zones_insert_own_org" ON zones;
CREATE POLICY "zones_insert_own_org" ON zones
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "zones_update_own_org" ON zones;
CREATE POLICY "zones_update_own_org" ON zones
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "zones_delete_own_org" ON zones;
CREATE POLICY "zones_delete_own_org" ON zones
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- Add missing columns to calendar_events
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS location TEXT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration complete! All CRM tables created.';
END $$;
