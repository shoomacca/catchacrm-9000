-- ============================================
-- CatchaCRM - COMPLETE SCHEMA SYNC
-- Generated from types.ts on 2026-02-11
-- This creates ALL tables with ALL fields matching the frontend
-- Run this ONCE to fully sync the database schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Organizations (multi-tenant root)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'agent', -- 'admin', 'manager', 'agent', 'technician'
  avatar TEXT,
  manager_id UUID,
  team TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- SALES MODULE
-- ============================================

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  employee_count INTEGER,
  avatar TEXT,
  tier TEXT,
  email TEXT,
  city TEXT,
  state TEXT,
  logo TEXT,
  address JSONB, -- {street, suburb, state, postcode, country}
  commission_rate DECIMAL(5,2),
  custom_data JSONB,
  status TEXT DEFAULT 'Active',
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,
  title TEXT,
  avatar TEXT,
  company TEXT,
  address JSONB,
  is_primary BOOLEAN DEFAULT false,
  custom_data JSONB,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'new',
  source TEXT,
  campaign_id UUID,
  account_id UUID,
  estimated_value DECIMAL(12,2),
  avatar TEXT,
  score INTEGER DEFAULT 0,
  temperature TEXT, -- 'cold', 'warm', 'hot'
  address JSONB,
  last_contact_date DATE,
  notes TEXT,
  commission_rate DECIMAL(5,2),
  converted_to_deal_id UUID,
  converted_at TIMESTAMPTZ,
  converted_by TEXT,
  custom_data JSONB,
  assigned_to UUID,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Deals
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  amount DECIMAL(12,2),
  stage TEXT DEFAULT 'discovery',
  probability DECIMAL(5,2),
  expected_close_date DATE,
  assignee_id UUID,
  assigned_to UUID,
  avatar TEXT,
  stage_entry_date DATE,
  campaign_id UUID,
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(12,2),
  lead_id UUID,
  won_at TIMESTAMPTZ,
  created_account_id UUID,
  created_contact_id UUID,
  notes TEXT,
  custom_data JSONB,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
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
  expected_cpl DECIMAL(10,2),
  target_audience TEXT,
  template_id UUID,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- OPERATIONS MODULE
-- ============================================

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID,
  assigned_to UUID,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  related_to_id UUID,
  related_to_type TEXT,
  related_entity_id UUID,
  related_entity_type TEXT,
  completed BOOLEAN DEFAULT false,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_number TEXT,
  subject TEXT NOT NULL,
  description TEXT,
  requester_id UUID,
  account_id UUID,
  assignee_id UUID,
  assigned_to UUID,
  status TEXT DEFAULT 'Open',
  priority TEXT DEFAULT 'Medium',
  sla_deadline TIMESTAMPTZ,
  messages JSONB DEFAULT '[]',
  internal_notes JSONB DEFAULT '[]',
  custom_data JSONB,
  related_to_id UUID,
  related_to_type TEXT,
  resolved_at TIMESTAMPTZ,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  type TEXT, -- 'Meeting', 'Call', 'Internal', 'Deadline', 'Personal', 'Follow-up'
  location TEXT,
  related_to_type TEXT,
  related_to_id UUID,
  priority TEXT,
  is_all_day BOOLEAN DEFAULT false,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Communications
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT, -- 'Email', 'Call', 'SMS', 'Note'
  subject TEXT,
  content TEXT,
  direction TEXT, -- 'Inbound', 'Outbound'
  related_to_type TEXT,
  related_to_id UUID,
  outcome TEXT,
  duration TEXT,
  next_step TEXT,
  next_follow_up_date DATE,
  metadata JSONB,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- FINANCIAL MODULE
-- ============================================

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  code TEXT,
  description TEXT,
  category TEXT,
  type TEXT,
  unit_price DECIMAL(12,2),
  cost_price DECIMAL(12,2),
  tax_rate DECIMAL(5,2) DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  stock_level INTEGER,
  reorder_point INTEGER,
  reorder_quantity INTEGER,
  specifications TEXT,
  images JSONB,
  dimensions JSONB,
  weight JSONB,
  manufacturer TEXT,
  supplier TEXT,
  supplier_sku TEXT,
  warranty_months INTEGER,
  warranty_details TEXT,
  tags JSONB,
  custom_fields JSONB,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  sku TEXT,
  description TEXT,
  category TEXT,
  type TEXT,
  billing_cycle TEXT DEFAULT 'one-off',
  unit_price DECIMAL(12,2),
  cost_price DECIMAL(12,2),
  tax_rate DECIMAL(5,2) DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  duration_hours INTEGER,
  duration_minutes INTEGER,
  prerequisites TEXT,
  deliverables TEXT,
  skills_required JSONB,
  crew_size INTEGER,
  equipment_needed JSONB,
  sla_response_hours INTEGER,
  sla_completion_days INTEGER,
  quality_checklist JSONB,
  images JSONB,
  tags JSONB,
  custom_fields JSONB,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  quote_number TEXT,
  deal_id UUID,
  account_id UUID,
  status TEXT DEFAULT 'Draft',
  issue_date DATE,
  expiry_date DATE,
  valid_until DATE,
  line_items JSONB DEFAULT '[]',
  subtotal DECIMAL(12,2),
  tax_total DECIMAL(12,2),
  total DECIMAL(12,2),
  notes TEXT,
  terms TEXT,
  accepted_at TIMESTAMPTZ,
  accepted_by TEXT,
  superseded_by UUID,
  version INTEGER DEFAULT 1,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number TEXT,
  account_id UUID,
  deal_id UUID,
  quote_id UUID,
  status TEXT DEFAULT 'Draft',
  payment_status TEXT DEFAULT 'unpaid',
  issue_date DATE,
  invoice_date DATE,
  due_date DATE,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  line_items JSONB DEFAULT '[]',
  subtotal DECIMAL(12,2),
  tax_total DECIMAL(12,2),
  total DECIMAL(12,2),
  notes TEXT,
  terms TEXT,
  credits JSONB,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Subscriptions (NO mrr column - matches types.ts)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  billing_cycle TEXT DEFAULT 'monthly',
  next_bill_date DATE,
  start_date DATE,
  end_date DATE,
  items JSONB DEFAULT '[]',
  auto_generate_invoice BOOLEAN DEFAULT true,
  last_invoice_id UUID,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Bank Transactions
CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE,
  description TEXT,
  amount DECIMAL(12,2),
  type TEXT, -- 'Credit', 'Debit'
  status TEXT DEFAULT 'unmatched',
  match_confidence TEXT DEFAULT 'none',
  matched_to_id UUID,
  matched_to_type TEXT,
  reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  reconciled_by TEXT,
  bank_reference TEXT,
  notes TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  vendor TEXT,
  amount DECIMAL(12,2),
  category TEXT,
  date DATE,
  status TEXT DEFAULT 'Pending',
  receipt_url TEXT,
  approved_by TEXT,
  notes TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- FIELD SERVICES MODULE
-- ============================================

-- Crews
CREATE TABLE IF NOT EXISTS crews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  leader_id UUID,
  member_ids UUID[],
  color TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Zones
CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  region TEXT,
  description TEXT,
  color TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  job_number TEXT,
  name TEXT,
  subject TEXT,
  description TEXT,
  account_id UUID,
  assignee_id UUID,
  crew_id UUID,
  job_type TEXT, -- 'Install', 'Service', 'Emergency', 'Inspection', 'Audit'
  status TEXT DEFAULT 'Scheduled',
  priority TEXT DEFAULT 'Medium',
  zone TEXT,
  estimated_duration INTEGER,
  scheduled_date DATE,
  scheduled_end_date DATE,
  completed_at TIMESTAMPTZ,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  job_fields JSONB,
  swms_signed BOOLEAN DEFAULT false,
  completion_signature TEXT,
  evidence_photos JSONB,
  bom JSONB,
  invoice_id UUID,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  barcode TEXT,
  condition TEXT, -- 'Excellent', 'Good', 'Fair', 'Poor', 'Damaged'
  location TEXT,
  assigned_to UUID,
  last_service_date DATE,
  next_service_date DATE,
  purchase_date DATE,
  purchase_price DECIMAL(12,2),
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  warehouse_qty INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  category TEXT, -- 'Asset', 'Material'
  unit_price DECIMAL(12,2),
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  po_number TEXT,
  supplier_id UUID,
  account_id UUID,
  status TEXT DEFAULT 'Draft',
  items JSONB DEFAULT '[]',
  total DECIMAL(12,2),
  linked_job_id UUID,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- MARKETING MODULE
-- ============================================

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  author_name TEXT,
  rating INTEGER,
  content TEXT,
  platform TEXT, -- 'Google', 'Facebook', 'Yelp', 'Trustpilot', 'Internal'
  status TEXT DEFAULT 'New',
  replied BOOLEAN DEFAULT false,
  reply_content TEXT,
  replied_at TIMESTAMPTZ,
  job_id UUID,
  account_id UUID,
  sentiment TEXT, -- 'Positive', 'Neutral', 'Negative'
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Referral Rewards
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  referrer_id UUID,
  referred_lead_id UUID,
  reward_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'Active',
  payout_date DATE,
  notes TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Inbound Forms
CREATE TABLE IF NOT EXISTS inbound_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  fields JSONB DEFAULT '[]',
  submit_button_text TEXT DEFAULT 'Submit',
  success_message TEXT DEFAULT 'Thank you!',
  target_campaign_id UUID,
  submission_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  status TEXT DEFAULT 'Active',
  embed_code TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Chat Widgets
CREATE TABLE IF NOT EXISTS chat_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  page TEXT,
  bubble_color TEXT DEFAULT '#3B82F6',
  welcome_message TEXT DEFAULT 'Hi! How can we help?',
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

-- Calculators
CREATE TABLE IF NOT EXISTS calculators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'ROI', 'Repayment', 'SolarYield'
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

-- ============================================
-- AUTOMATION MODULE
-- ============================================

-- Automation Workflows
CREATE TABLE IF NOT EXISTS automation_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger JSONB,
  nodes JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  category TEXT, -- 'Sales', 'Operations', 'Logistics', 'System'
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  method TEXT DEFAULT 'POST',
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

-- Industry Templates
CREATE TABLE IF NOT EXISTS industry_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_entity TEXT,
  industry TEXT,
  sections JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- COMMUNICATION MODULE
-- ============================================

-- Conversations (Team Chat)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  participant_ids UUID[],
  name TEXT,
  is_system BOOLEAN DEFAULT false,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id UUID,
  sender_id UUID,
  content TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- SYSTEM MODULE
-- ============================================

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
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

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  link TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT,
  entity_id UUID,
  action TEXT,
  previous_value TEXT,
  new_value TEXT,
  metadata JSONB,
  batch_id UUID,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Payments (for invoice payments)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID,
  amount DECIMAL(12,2),
  method TEXT, -- 'cash', 'card', 'bank_transfer', 'check'
  reference TEXT,
  note TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Ticket Messages (separate table for ticket thread)
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID,
  sender TEXT,
  sender_id UUID,
  text TEXT,
  is_me BOOLEAN DEFAULT false,
  is_bot BOOLEAN DEFAULT false,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_accounts_org_id ON accounts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_account_id ON contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON leads(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_org_id ON deals(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_account_id ON deals(account_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tickets_org_id ON tickets(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_account_id ON invoices(account_id);
CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_jobs_account_id ON jobs(account_id);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_communications_org_id ON communications(org_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_org_id ON calendar_events(org_id);

-- ============================================
-- ROW LEVEL SECURITY (Permissive for Demo)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculators ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for demo (allow all for now)
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'organizations', 'users', 'accounts', 'contacts', 'leads', 'deals',
    'campaigns', 'tasks', 'tickets', 'calendar_events', 'communications',
    'products', 'services', 'quotes', 'invoices', 'subscriptions',
    'bank_transactions', 'expenses', 'crews', 'zones', 'jobs', 'equipment',
    'inventory_items', 'purchase_orders', 'reviews', 'referral_rewards',
    'inbound_forms', 'chat_widgets', 'calculators', 'automation_workflows',
    'webhooks', 'industry_templates', 'conversations', 'chat_messages',
    'documents', 'notifications', 'audit_log', 'payments', 'ticket_messages',
    'warehouses'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "allow_all_%s" ON %I', t, t);
    EXECUTE format('CREATE POLICY "allow_all_%s" ON %I FOR ALL USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- ============================================
-- DEMO ORGANIZATION
-- ============================================

-- Insert demo organization if it doesn't exist
INSERT INTO organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Organization', 'demo')
ON CONFLICT (id) DO NOTHING;

SELECT 'Schema sync complete! All tables created with full field support.';
