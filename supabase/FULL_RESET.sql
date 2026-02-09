-- ============================================
-- DROP ALL EXISTING TABLES
-- WARNING: This will delete ALL data!
-- ============================================

-- Drop all tables (order matters due to foreign keys)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bank_transactions CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS crews CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organization_users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS subscription_tiers CASCADE;
DROP TABLE IF EXISTS activities CASCADE;

-- Drop any custom types
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS deal_stage CASCADE;
DROP TYPE IF EXISTS ticket_priority CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS job_type CASCADE;
DROP TYPE IF EXISTS po_status CASCADE;

-- Verify everything is gone
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

  RAISE NOTICE '============================================';
  RAISE NOTICE 'Tables remaining in public schema: %', table_count;

  IF table_count = 0 THEN
    RAISE NOTICE '✅ All tables dropped successfully!';
    RAISE NOTICE '📋 Ready to create fresh schema';
  ELSE
    RAISE NOTICE '⚠️  Some tables still exist';
    RAISE NOTICE 'Run: SELECT table_name FROM information_schema.tables WHERE table_schema = ''public'';';
  END IF;
  RAISE NOTICE '============================================';
END $$;
-- ============================================
-- CatchaCRM - Fresh Schema from Frontend Types
-- Generated from: src/types.ts
-- Date: 2026-02-08
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Organizations (base tenant table)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  user_limit INTEGER DEFAULT 5,
  storage_limit_gb INTEGER DEFAULT 10,
  api_calls_per_day INTEGER DEFAULT 1000,
  current_user_count INTEGER DEFAULT 0,
  current_storage_bytes BIGINT DEFAULT 0,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL, -- 'admin', 'manager', 'agent', 'technician'
  team TEXT,
  manager_id UUID REFERENCES users(id),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- CRM ENTITIES
-- ============================================

-- Accounts (Companies)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  employee_count INTEGER,
  avatar TEXT,
  tier TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  logo TEXT,
  revenue DECIMAL(12,2),
  status TEXT DEFAULT 'active',
  type TEXT DEFAULT 'customer', -- 'customer', 'partner', 'competitor'
  owner_id UUID REFERENCES users(id),
  commission_rate DECIMAL(5,2),
  custom_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  title TEXT,
  avatar TEXT,
  company TEXT, -- Denormalized for quick access
  department TEXT,
  is_primary BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  custom_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'new',
  source TEXT,
  campaign_id UUID,
  estimated_value DECIMAL(12,2),
  avatar TEXT,
  score INTEGER DEFAULT 0,
  address_street TEXT,
  address_suburb TEXT,
  address_state TEXT,
  address_postcode TEXT,
  address_country TEXT,
  last_contact_date TIMESTAMPTZ,
  notes TEXT,
  commission_rate DECIMAL(5,2),
  converted_to_deal_id UUID,
  converted_at TIMESTAMPTZ,
  converted_by TEXT,
  custom_data JSONB,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Deals (Opportunities)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  amount DECIMAL(12,2),
  stage TEXT DEFAULT 'qualification',
  probability INTEGER DEFAULT 50,
  expected_close_date DATE,
  assignee_id UUID REFERENCES users(id),
  avatar TEXT,
  stage_entry_date TIMESTAMPTZ,
  campaign_id UUID,
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(12,2),
  lead_id UUID, -- Origin lead
  won_at TIMESTAMPTZ,
  created_account_id UUID,
  created_contact_id UUID,
  custom_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES users(id),
  due_date DATE,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  related_to_id UUID,
  related_to_type TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Calendar Events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  type TEXT, -- 'Meeting', 'Call', 'Internal', 'Deadline', 'Personal', 'Follow-up'
  location TEXT,
  related_to_type TEXT,
  related_to_id UUID,
  priority TEXT,
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT, -- 'Email', 'Social', 'Search', 'Event', 'Referral'
  budget DECIMAL(12,2),
  spent DECIMAL(12,2) DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Planning',
  start_date DATE,
  end_date DATE,
  description TEXT,
  expected_cpl DECIMAL(12,2),
  target_audience TEXT,
  template_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Communications
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT, -- 'Email', 'Call', 'SMS', 'Note'
  subject TEXT,
  content TEXT,
  direction TEXT, -- 'Inbound', 'Outbound'
  related_to_type TEXT,
  related_to_id UUID,
  outcome TEXT,
  next_step TEXT,
  next_follow_up_date DATE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_number TEXT UNIQUE,
  subject TEXT NOT NULL,
  description TEXT,
  requester_id UUID,
  account_id UUID REFERENCES accounts(id),
  assignee_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  sla_deadline TIMESTAMPTZ,
  messages JSONB,
  internal_notes JSONB,
  custom_data JSONB,
  related_to_id UUID,
  related_to_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- PRODUCTS & SERVICES
-- ============================================

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  code TEXT,
  description TEXT,
  category TEXT,
  type TEXT,
  unit_price DECIMAL(12,2),
  cost_price DECIMAL(12,2),
  tax_rate DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  stock_level INTEGER,
  reorder_point INTEGER,
  reorder_quantity INTEGER,
  specifications TEXT,
  images TEXT[],
  dimensions JSONB,
  weight JSONB,
  manufacturer TEXT,
  supplier TEXT,
  supplier_sku TEXT,
  warranty_months INTEGER,
  warranty_details TEXT,
  tags TEXT[],
  custom_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  sku TEXT,
  description TEXT,
  category TEXT,
  type TEXT,
  billing_cycle TEXT DEFAULT 'one-off', -- 'one-off', 'monthly', 'quarterly', 'yearly'
  unit_price DECIMAL(12,2),
  cost_price DECIMAL(12,2),
  tax_rate DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  duration_hours INTEGER,
  duration_minutes INTEGER,
  prerequisites TEXT,
  deliverables TEXT,
  sla_hours INTEGER,
  requires_equipment BOOLEAN DEFAULT false,
  equipment_list TEXT[],
  certification_required TEXT,
  images TEXT[],
  tags TEXT[],
  custom_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- FINANCIAL
-- ============================================

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  quote_number TEXT UNIQUE,
  deal_id UUID REFERENCES deals(id),
  account_id UUID REFERENCES accounts(id),
  status TEXT DEFAULT 'Draft',
  issue_date DATE,
  expiry_date DATE,
  line_items JSONB,
  subtotal DECIMAL(12,2),
  tax_total DECIMAL(12,2),
  total DECIMAL(12,2),
  notes TEXT,
  terms TEXT,
  accepted_at TIMESTAMPTZ,
  accepted_by TEXT,
  superseded_by UUID,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE,
  account_id UUID REFERENCES accounts(id),
  deal_id UUID REFERENCES deals(id),
  quote_id UUID REFERENCES quotes(id),
  status TEXT DEFAULT 'Draft',
  payment_status TEXT DEFAULT 'unpaid',
  issue_date DATE,
  invoice_date DATE,
  due_date DATE,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  line_items JSONB,
  subtotal DECIMAL(12,2),
  tax_total DECIMAL(12,2),
  total DECIMAL(12,2),
  amount_paid DECIMAL(12,2) DEFAULT 0,
  balance_due DECIMAL(12,2),
  notes TEXT,
  terms TEXT,
  late_fee_rate DECIMAL(5,2),
  credits JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- FIELD SERVICE
-- ============================================

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_number TEXT UNIQUE,
  name TEXT,
  subject TEXT,
  description TEXT,
  account_id UUID REFERENCES accounts(id),
  assignee_id UUID REFERENCES users(id),
  crew_id UUID,
  job_type TEXT,
  status TEXT DEFAULT 'Scheduled',
  priority TEXT DEFAULT 'medium',
  zone TEXT,
  estimated_duration INTEGER,
  scheduled_date DATE,
  scheduled_end_date DATE,
  completed_at TIMESTAMPTZ,
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  job_fields JSONB,
  swms_signed BOOLEAN DEFAULT false,
  completion_signature TEXT,
  evidence_photos TEXT[],
  bom JSONB,
  invoice_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Crews
CREATE TABLE crews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  leader_id UUID REFERENCES users(id),
  member_ids UUID[],
  color TEXT,
  specialty TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Zones
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  region TEXT,
  description TEXT,
  color TEXT,
  type TEXT,
  status TEXT DEFAULT 'active',
  coordinates TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Equipment
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  barcode TEXT,
  condition TEXT DEFAULT 'Good',
  location TEXT,
  assigned_to UUID REFERENCES users(id),
  last_service_date DATE,
  next_service_date DATE,
  purchase_date DATE,
  purchase_price DECIMAL(12,2),
  model TEXT,
  status TEXT DEFAULT 'available',
  value DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Inventory Items
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  warehouse_qty INTEGER DEFAULT 0,
  reorder_point INTEGER,
  category TEXT,
  unit_price DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Warehouses
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  capacity INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Purchase Orders
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  po_number TEXT UNIQUE,
  supplier_id UUID,
  account_id UUID REFERENCES accounts(id),
  status TEXT DEFAULT 'Draft',
  items JSONB,
  total DECIMAL(12,2),
  linked_job_id UUID,
  expected_delivery DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- SUPPORTING TABLES
-- ============================================

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor TEXT,
  amount DECIMAL(12,2),
  category TEXT,
  date DATE,
  status TEXT DEFAULT 'Pending',
  receipt_url TEXT,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Bank Transactions
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE,
  description TEXT,
  amount DECIMAL(12,2),
  type TEXT,
  status TEXT DEFAULT 'unmatched',
  match_confidence TEXT,
  matched_to_id UUID,
  matched_to_type TEXT,
  reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID REFERENCES users(id),
  bank_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_name TEXT,
  rating INTEGER,
  content TEXT,
  platform TEXT,
  status TEXT DEFAULT 'New',
  replied BOOLEAN DEFAULT false,
  reply_content TEXT,
  replied_at TIMESTAMPTZ,
  job_id UUID,
  account_id UUID REFERENCES accounts(id),
  sentiment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT,
  entity_id UUID,
  action TEXT,
  previous_value TEXT,
  new_value TEXT,
  metadata JSONB,
  batch_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Allow all operations (temporarily - for development)
CREATE POLICY "allow_all_orgs" ON organizations FOR ALL USING (true);
CREATE POLICY "allow_all_users" ON users FOR ALL USING (true);
CREATE POLICY "allow_all_accounts" ON accounts FOR ALL USING (true);
CREATE POLICY "allow_all_contacts" ON contacts FOR ALL USING (true);
CREATE POLICY "allow_all_leads" ON leads FOR ALL USING (true);
CREATE POLICY "allow_all_deals" ON deals FOR ALL USING (true);
CREATE POLICY "allow_all_tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "allow_all_calendar_events" ON calendar_events FOR ALL USING (true);
CREATE POLICY "allow_all_campaigns" ON campaigns FOR ALL USING (true);
CREATE POLICY "allow_all_communications" ON communications FOR ALL USING (true);
CREATE POLICY "allow_all_tickets" ON tickets FOR ALL USING (true);
CREATE POLICY "allow_all_products" ON products FOR ALL USING (true);
CREATE POLICY "allow_all_services" ON services FOR ALL USING (true);
CREATE POLICY "allow_all_quotes" ON quotes FOR ALL USING (true);
CREATE POLICY "allow_all_invoices" ON invoices FOR ALL USING (true);
CREATE POLICY "allow_all_jobs" ON jobs FOR ALL USING (true);
CREATE POLICY "allow_all_crews" ON crews FOR ALL USING (true);
CREATE POLICY "allow_all_zones" ON zones FOR ALL USING (true);
CREATE POLICY "allow_all_equipment" ON equipment FOR ALL USING (true);
CREATE POLICY "allow_all_inventory_items" ON inventory_items FOR ALL USING (true);
CREATE POLICY "allow_all_warehouses" ON warehouses FOR ALL USING (true);
CREATE POLICY "allow_all_purchase_orders" ON purchase_orders FOR ALL USING (true);
CREATE POLICY "allow_all_expenses" ON expenses FOR ALL USING (true);
CREATE POLICY "allow_all_bank_transactions" ON bank_transactions FOR ALL USING (true);
CREATE POLICY "allow_all_reviews" ON reviews FOR ALL USING (true);
CREATE POLICY "allow_all_audit_log" ON audit_log FOR ALL USING (true);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_accounts_org_id ON accounts(org_id);
CREATE INDEX idx_contacts_org_id ON contacts(org_id);
CREATE INDEX idx_contacts_account_id ON contacts(account_id);
CREATE INDEX idx_leads_org_id ON leads(org_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_deals_org_id ON deals(org_id);
CREATE INDEX idx_deals_account_id ON deals(account_id);
CREATE INDEX idx_tasks_org_id ON tasks(org_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_campaigns_org_id ON campaigns(org_id);
CREATE INDEX idx_tickets_org_id ON tickets(org_id);
CREATE INDEX idx_products_org_id ON products(org_id);
CREATE INDEX idx_services_org_id ON services(org_id);
CREATE INDEX idx_jobs_org_id ON jobs(org_id);
CREATE INDEX idx_invoices_org_id ON invoices(org_id);
CREATE INDEX idx_invoices_account_id ON invoices(account_id);

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default organization
INSERT INTO organizations (id, name, slug, plan, subscription_status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Organization',
  'demo',
  'enterprise',
  'active'
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Schema created successfully from frontend types!';
  RAISE NOTICE '📊 Tables created: 25+';
  RAISE NOTICE '🔒 RLS enabled on all tables';
  RAISE NOTICE '🎯 Ready to import Matrix data!';
END $$;
