-- ============================================
-- CatchaCRM Flash UI - Complete Schema Update
-- All features from the Flash UI integrated
-- Date: 2026-02-08
-- ============================================

-- ============================================
-- CRM CORE TABLES
-- ============================================

-- LEADS (enhanced)
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

CREATE POLICY "leads_select_own_org" ON leads
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "leads_insert_own_org" ON leads
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "leads_update_own_org" ON leads
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "leads_delete_own_org" ON leads
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- DEALS (renamed from opportunities)
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

CREATE POLICY "deals_select_own_org" ON deals
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "deals_insert_own_org" ON deals
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "deals_update_own_org" ON deals
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "deals_delete_own_org" ON deals
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- TASKS
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

CREATE POLICY "tasks_select_own_org" ON tasks
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "tasks_insert_own_org" ON tasks
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "tasks_update_own_org" ON tasks
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "tasks_delete_own_org" ON tasks
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- ============================================
-- MARKETING & CAMPAIGNS
-- ============================================

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'email',
  budget DECIMAL(12,2),
  status TEXT DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  description TEXT,
  target_audience TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_select_own_org" ON campaigns
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "campaigns_insert_own_org" ON campaigns
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "campaigns_update_own_org" ON campaigns
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "campaigns_delete_own_org" ON campaigns
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- ============================================
-- SUPPORT & TICKETS
-- ============================================

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  assigned_to UUID,
  requester_id UUID,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  sla_deadline TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tickets_select_own_org" ON tickets
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "tickets_insert_own_org" ON tickets
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "tickets_update_own_org" ON tickets
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "tickets_delete_own_org" ON tickets
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- ============================================
-- FIELD SERVICES & JOBS
-- ============================================

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  job_type TEXT,
  status TEXT DEFAULT 'scheduled',
  priority TEXT DEFAULT 'medium',
  zone TEXT,
  scheduled_date DATE,
  crew_id UUID,
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_select_own_org" ON jobs
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "jobs_insert_own_org" ON jobs
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "jobs_update_own_org" ON jobs
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "jobs_delete_own_org" ON jobs
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS crews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  team_lead UUID,
  members UUID[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crews_select_own_org" ON crews
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "crews_insert_own_org" ON crews
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "crews_update_own_org" ON crews
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "crews_delete_own_org" ON crews
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- ============================================
-- LOGISTICS & SUPPLY CHAIN
-- ============================================

CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  region TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "zones_select_own_org" ON zones
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "zones_insert_own_org" ON zones
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "zones_update_own_org" ON zones
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "zones_delete_own_org" ON zones
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  serial_number TEXT,
  status TEXT DEFAULT 'available',
  assigned_to UUID,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "equipment_select_own_org" ON equipment
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "equipment_insert_own_org" ON equipment
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "equipment_update_own_org" ON equipment
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "equipment_delete_own_org" ON equipment
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'units',
  warehouse_location TEXT,
  reorder_point INTEGER DEFAULT 0,
  unit_cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_select_own_org" ON inventory
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "inventory_insert_own_org" ON inventory
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "inventory_update_own_org" ON inventory
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "inventory_delete_own_org" ON inventory
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  po_number TEXT UNIQUE NOT NULL,
  supplier_name TEXT NOT NULL,
  total_amount DECIMAL(12,2),
  status TEXT DEFAULT 'draft',
  order_date DATE,
  expected_delivery DATE,
  line_items JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchase_orders_select_own_org" ON purchase_orders
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "purchase_orders_insert_own_org" ON purchase_orders
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "purchase_orders_update_own_org" ON purchase_orders
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "purchase_orders_delete_own_org" ON purchase_orders
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  capacity INTEGER,
  status TEXT DEFAULT 'active',
  manager_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "warehouses_select_own_org" ON warehouses
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "warehouses_insert_own_org" ON warehouses
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "warehouses_update_own_org" ON warehouses
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "warehouses_delete_own_org" ON warehouses
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS procurement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  request_id TEXT UNIQUE NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  requested_by UUID,
  status TEXT DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE procurement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "procurement_select_own_org" ON procurement
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "procurement_insert_own_org" ON procurement
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "procurement_update_own_org" ON procurement
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "procurement_delete_own_org" ON procurement
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- ============================================
-- FINANCIALS
-- ============================================

-- Services table (for billing)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(10,2),
  tax_rate DECIMAL(5,2) DEFAULT 0,
  billing_cycle TEXT DEFAULT 'one-time',
  category TEXT,
  sku TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_select_own_org" ON services
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "services_insert_own_org" ON services
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "services_update_own_org" ON services
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "services_delete_own_org" ON services
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  line_items JSONB DEFAULT '[]',
  subtotal DECIMAL(12,2),
  tax DECIMAL(12,2),
  total DECIMAL(12,2),
  status TEXT DEFAULT 'draft',
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_own_org" ON invoices
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "invoices_insert_own_org" ON invoices
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "invoices_update_own_org" ON invoices
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "invoices_delete_own_org" ON invoices
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- ============================================
-- CALENDAR & EVENTS
-- ============================================

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'meeting',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  attendees UUID[],
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calendar_events_select_own_org" ON calendar_events
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "calendar_events_insert_own_org" ON calendar_events
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "calendar_events_update_own_org" ON calendar_events
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "calendar_events_delete_own_org" ON calendar_events
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- ============================================
-- COMMUNICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- email, sms, call, note
  subject TEXT,
  body TEXT,
  direction TEXT, -- inbound, outbound
  related_entity_type TEXT,
  related_entity_id UUID,
  from_address TEXT,
  to_address TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "communications_select_own_org" ON communications
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "communications_insert_own_org" ON communications
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "communications_update_own_org" ON communications
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "communications_delete_own_org" ON communications
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- ============================================
-- USERS TABLE (for CRM users, distinct from auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'agent',
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_org" ON users
  FOR SELECT USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "users_insert_own_org" ON users
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "users_update_own_org" ON users
  FOR UPDATE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

CREATE POLICY "users_delete_own_org" ON users
  FOR DELETE USING (org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid()));

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_leads_org_id ON leads(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

CREATE INDEX IF NOT EXISTS idx_deals_org_id ON deals(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_account_id ON deals(account_id);

CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_tickets_org_id ON tickets(org_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);

CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_account_id ON invoices(account_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

CREATE INDEX IF NOT EXISTS idx_calendar_events_org_id ON calendar_events(org_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON crews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procurement_updated_at BEFORE UPDATE ON procurement FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
