-- ADD MISSING COLUMNS - Generated from UI Types
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/anawatvgypmrpbmjfcht/sql/new
-- Generated: 2026-02-11

-- ============================================================
-- organization_users (link table for users and organizations)
-- ============================================================
ALTER TABLE organization_users ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE organization_users ADD COLUMN IF NOT EXISTS org_id UUID NOT NULL;
ALTER TABLE organization_users ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL;
ALTER TABLE organization_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member';
ALTER TABLE organization_users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE organization_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE organization_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add primary key if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organization_users_pkey') THEN
    ALTER TABLE organization_users ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organization_users_org_user_unique') THEN
    ALTER TABLE organization_users ADD CONSTRAINT organization_users_org_user_unique UNIQUE (org_id, user_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_org_id ON organization_users(org_id);

-- ============================================================
-- currencies
-- ============================================================
ALTER TABLE currencies ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE currencies ADD COLUMN IF NOT EXISTS owner_id UUID;

-- ============================================================
-- roles
-- ============================================================
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS color TEXT;

-- ============================================================
-- tactical_queue (Operations tactical queue items)
-- ============================================================
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 50;
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS assignee_id UUID;
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ;
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 0;
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS related_to_type TEXT;
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS related_to_id UUID;
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS related_to_name TEXT;
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]';
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE tactical_queue ADD COLUMN IF NOT EXISTS owner_id UUID;

-- ============================================================
-- warehouse_locations
-- ============================================================
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS warehouse_id UUID;
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'bin';
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS capacity INTEGER;
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS current_count INTEGER DEFAULT 0;
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS is_pickable BOOLEAN DEFAULT true;
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS is_receivable BOOLEAN DEFAULT true;
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS parent_location_id UUID;
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE warehouse_locations ADD COLUMN IF NOT EXISTS owner_id UUID;

-- ============================================================
-- dispatch_alerts
-- ============================================================
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS related_to_type TEXT;
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS related_to_id UUID;
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS is_acknowledged BOOLEAN DEFAULT false;
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS acknowledged_by UUID;
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ;
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS is_dismissed BOOLEAN DEFAULT false;
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE dispatch_alerts ADD COLUMN IF NOT EXISTS owner_id UUID;

-- ============================================================
-- rfqs (Request for Quotes)
-- ============================================================
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS rfq_number TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS supplier_ids UUID[] DEFAULT '{}';
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]';
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS issue_date DATE;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS valid_until DATE;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS purchase_order_id UUID;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS job_id UUID;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS winning_supplier_id UUID;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS awarded_at TIMESTAMPTZ;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS total_value NUMERIC(15,2);
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS terms TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS owner_id UUID;

-- ============================================================
-- supplier_quotes
-- ============================================================
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS quote_number TEXT;
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS rfq_id UUID;
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS supplier_id UUID;
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'received';
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]';
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS subtotal NUMERIC(15,2);
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS tax_total NUMERIC(15,2);
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS total NUMERIC(15,2);
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS received_date DATE;
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS valid_until DATE;
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS evaluation_score INTEGER;
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS evaluation_notes TEXT;
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS owner_id UUID;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tactical_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES (Users can only see their org's data)
-- ============================================================

-- organization_users
DROP POLICY IF EXISTS "organization_users_own_access" ON organization_users;
CREATE POLICY "organization_users_own_access" ON organization_users
  FOR ALL USING (user_id = auth.uid());

-- tactical_queue
DROP POLICY IF EXISTS "tactical_queue_org_access" ON tactical_queue;
CREATE POLICY "tactical_queue_org_access" ON tactical_queue
  FOR ALL USING (
    org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid())
  );

-- warehouse_locations
DROP POLICY IF EXISTS "warehouse_locations_org_access" ON warehouse_locations;
CREATE POLICY "warehouse_locations_org_access" ON warehouse_locations
  FOR ALL USING (
    org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid())
  );

-- dispatch_alerts
DROP POLICY IF EXISTS "dispatch_alerts_org_access" ON dispatch_alerts;
CREATE POLICY "dispatch_alerts_org_access" ON dispatch_alerts
  FOR ALL USING (
    org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid())
  );

-- rfqs
DROP POLICY IF EXISTS "rfqs_org_access" ON rfqs;
CREATE POLICY "rfqs_org_access" ON rfqs
  FOR ALL USING (
    org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid())
  );

-- supplier_quotes
DROP POLICY IF EXISTS "supplier_quotes_org_access" ON supplier_quotes;
CREATE POLICY "supplier_quotes_org_access" ON supplier_quotes
  FOR ALL USING (
    org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid())
  );

-- ============================================================
-- DONE
-- ============================================================
SELECT 'Schema migration complete!' AS result;
