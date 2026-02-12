-- ============================================================
-- COMPLETE SCHEMA REBUILD FROM UI TYPES
-- ============================================================
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/anawatvgypmrpbmjfcht/sql/new
-- This DROPS all tables and recreates them from scratch
-- ============================================================

-- Disable triggers temporarily
SET session_replication_role = replica;

-- ============================================================
-- DROP ALL EXISTING TABLES (in dependency order)
-- ============================================================

DROP TABLE IF EXISTS supplier_quotes CASCADE;
DROP TABLE IF EXISTS rfqs CASCADE;
DROP TABLE IF EXISTS dispatch_alerts CASCADE;
DROP TABLE IF EXISTS warehouse_locations CASCADE;
DROP TABLE IF EXISTS tactical_queue CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS api_logs CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS automation_workflows CASCADE;
DROP TABLE IF EXISTS calculators CASCADE;
DROP TABLE IF EXISTS chat_widgets CASCADE;
DROP TABLE IF EXISTS inbound_forms CASCADE;
DROP TABLE IF EXISTS referral_rewards CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS industry_templates CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS currencies CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS bank_transactions CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS crews CASCADE;
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organization_users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- ============================================================
-- CREATE TABLES FROM UI TYPES (in dependency order)
-- ============================================================

-- 1. organizations (root table)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  user_limit INTEGER DEFAULT 5,
  storage_limit_gb INTEGER DEFAULT 10,
  api_calls_per_day INTEGER DEFAULT 1000,
  current_user_count INTEGER DEFAULT 0,
  current_storage_bytes BIGINT DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. organization_users (link table)
CREATE TABLE organization_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- 3. roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  color TEXT,
  parent_role_id UUID REFERENCES roles(id),
  hierarchy_level INTEGER DEFAULT 0,
  can_view_all_data BOOLEAN DEFAULT false,
  can_modify_all_data BOOLEAN DEFAULT false,
  portal_type TEXT DEFAULT 'internal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 4. users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'agent',
  avatar TEXT,
  manager_id UUID REFERENCES users(id),
  team TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 5. warehouses
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 6. accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  address JSONB,
  revenue NUMERIC(15,2),
  status TEXT DEFAULT 'Active',
  type TEXT,
  commission_rate NUMERIC(5,2),
  custom_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);

-- 7. contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id),
  email TEXT,
  phone TEXT,
  mobile TEXT,
  title TEXT,
  avatar TEXT,
  company TEXT,
  department TEXT,
  is_primary BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Active',
  address JSONB,
  custom_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);

-- 8. leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'New',
  source TEXT,
  campaign_id UUID,
  account_id UUID REFERENCES accounts(id),
  estimated_value NUMERIC(15,2) DEFAULT 0,
  avatar TEXT,
  score INTEGER DEFAULT 0,
  address JSONB,
  last_contact_date TIMESTAMPTZ,
  notes TEXT,
  commission_rate NUMERIC(5,2),
  temperature TEXT,
  assigned_to UUID REFERENCES users(id),
  converted_to_deal_id UUID,
  converted_at TIMESTAMPTZ,
  converted_by UUID,
  custom_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);

-- 9. deals
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id),
  contact_id UUID REFERENCES contacts(id),
  amount NUMERIC(15,2) DEFAULT 0,
  stage TEXT DEFAULT 'Discovery',
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  assignee_id UUID REFERENCES users(id),
  avatar TEXT,
  stage_entry_date TIMESTAMPTZ,
  campaign_id UUID,
  commission_rate NUMERIC(5,2),
  commission_amount NUMERIC(15,2),
  notes TEXT,
  lead_id UUID REFERENCES leads(id),
  won_at TIMESTAMPTZ,
  created_account_id UUID,
  created_contact_id UUID,
  custom_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);

-- 10. tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES users(id),
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Open',
  priority TEXT DEFAULT 'Medium',
  related_to_id UUID,
  related_to_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);

-- 11. calendar_events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  type TEXT DEFAULT 'Meeting',
  location TEXT,
  related_to_type TEXT,
  related_to_id UUID,
  priority TEXT,
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);

-- 12. campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Email',
  budget NUMERIC(15,2) DEFAULT 0,
  spent NUMERIC(15,2) DEFAULT 0,
  revenue NUMERIC(15,2) DEFAULT 0,
  revenue_generated NUMERIC(15,2) DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Planning',
  start_date DATE,
  end_date DATE,
  description TEXT,
  expected_cpl NUMERIC(15,2),
  target_audience TEXT,
  template_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);

-- 13. tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  requester_id UUID,
  account_id UUID REFERENCES accounts(id),
  assignee_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'Open',
  priority TEXT DEFAULT 'Medium',
  sla_deadline TIMESTAMPTZ,
  messages JSONB DEFAULT '[]',
  internal_notes JSONB DEFAULT '[]',
  custom_data JSONB DEFAULT '{}',
  related_to_id UUID,
  related_to_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);

-- 14. communications
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  direction TEXT DEFAULT 'Outbound',
  related_to_type TEXT NOT NULL,
  related_to_id UUID NOT NULL,
  outcome TEXT,
  next_step TEXT,
  next_follow_up_date TIMESTAMPTZ,
  duration INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);

-- 15. crews
CREATE TABLE crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  leader_id UUID REFERENCES users(id),
  member_ids UUID[] DEFAULT '{}',
  color TEXT,
  specialty TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 16. zones
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  region TEXT,
  description TEXT,
  color TEXT,
  type TEXT,
  status TEXT DEFAULT 'Active',
  coordinates JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 17. jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_number TEXT NOT NULL,
  name TEXT,
  subject TEXT NOT NULL,
  description TEXT,
  account_id UUID REFERENCES accounts(id),
  assignee_id UUID REFERENCES users(id),
  crew_id UUID REFERENCES crews(id),
  job_type TEXT DEFAULT 'Service',
  status TEXT DEFAULT 'Scheduled',
  priority TEXT DEFAULT 'Medium',
  zone TEXT,
  estimated_duration INTEGER,
  scheduled_date TIMESTAMPTZ,
  scheduled_end_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  job_fields JSONB DEFAULT '[]',
  swms_signed BOOLEAN DEFAULT false,
  completion_signature TEXT,
  evidence_photos TEXT[] DEFAULT '{}',
  bom JSONB DEFAULT '[]',
  invoice_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);

-- 18. equipment
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  purchase_price NUMERIC(15,2),
  model TEXT,
  status TEXT DEFAULT 'Available',
  value NUMERIC(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 19. inventory_items
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  warehouse_qty INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  category TEXT DEFAULT 'Material',
  unit_price NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 20. purchase_orders
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  po_number TEXT NOT NULL,
  supplier_id UUID REFERENCES accounts(id),
  account_id UUID REFERENCES accounts(id),
  status TEXT DEFAULT 'Draft',
  items JSONB DEFAULT '[]',
  total NUMERIC(15,2) DEFAULT 0,
  linked_job_id UUID REFERENCES jobs(id),
  expected_delivery DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 21. bank_transactions
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT,
  amount NUMERIC(15,2) NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'unmatched',
  match_confidence TEXT DEFAULT 'none',
  matched_to_id UUID,
  matched_to_type TEXT,
  reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID,
  bank_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 22. expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  category TEXT DEFAULT 'Other',
  date DATE NOT NULL,
  status TEXT DEFAULT 'Pending',
  receipt_url TEXT,
  approved_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 23. currencies
CREATE TABLE currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  iso_code TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  conversion_rate NUMERIC(15,6) DEFAULT 1.0,
  decimal_places INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  is_corporate BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 24. products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  code TEXT,
  description TEXT,
  category TEXT,
  type TEXT,
  unit_price NUMERIC(15,2) DEFAULT 0,
  cost_price NUMERIC(15,2),
  tax_rate NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  stock_level INTEGER,
  reorder_point INTEGER,
  reorder_quantity INTEGER,
  specifications TEXT,
  images JSONB DEFAULT '[]',
  dimensions JSONB,
  weight JSONB,
  manufacturer TEXT,
  supplier TEXT,
  supplier_sku TEXT,
  warranty_months INTEGER,
  warranty_details TEXT,
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 25. services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  sku TEXT,
  description TEXT,
  category TEXT,
  type TEXT,
  billing_cycle TEXT DEFAULT 'one-off',
  unit_price NUMERIC(15,2) DEFAULT 0,
  cost_price NUMERIC(15,2),
  tax_rate NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  duration_hours INTEGER,
  duration_minutes INTEGER,
  prerequisites TEXT,
  deliverables TEXT,
  skills_required JSONB DEFAULT '[]',
  crew_size INTEGER,
  equipment_needed JSONB DEFAULT '[]',
  sla_response_hours INTEGER,
  sla_completion_days INTEGER,
  quality_checklist JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 26. quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  deal_id UUID REFERENCES deals(id),
  account_id UUID REFERENCES accounts(id),
  status TEXT DEFAULT 'Draft',
  issue_date DATE,
  expiry_date DATE,
  line_items JSONB DEFAULT '[]',
  subtotal NUMERIC(15,2) DEFAULT 0,
  tax_total NUMERIC(15,2) DEFAULT 0,
  total NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  terms TEXT,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID,
  superseded_by UUID,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 27. invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
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
  line_items JSONB DEFAULT '[]',
  subtotal NUMERIC(15,2) DEFAULT 0,
  tax_total NUMERIC(15,2) DEFAULT 0,
  total NUMERIC(15,2) DEFAULT 0,
  amount_paid NUMERIC(15,2) DEFAULT 0,
  balance_due NUMERIC(15,2),
  late_fee_rate NUMERIC(5,2),
  notes TEXT,
  terms TEXT,
  credits JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 28. subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  billing_cycle TEXT DEFAULT 'monthly',
  next_bill_date DATE,
  start_date DATE,
  end_date DATE,
  items JSONB DEFAULT '[]',
  auto_generate_invoice BOOLEAN DEFAULT true,
  last_invoice_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 29. payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),
  amount NUMERIC(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  method TEXT,
  status TEXT DEFAULT 'Pending',
  transaction_id TEXT,
  reference_number TEXT,
  reference TEXT,
  notes TEXT,
  processed_by UUID,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 30. audit_log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  metadata JSONB DEFAULT '{}',
  batch_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 31. documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  name TEXT,
  file_type TEXT,
  file_size TEXT,
  url TEXT,
  file_url TEXT,
  related_to_type TEXT NOT NULL,
  related_to_id UUID NOT NULL,
  content_text TEXT,
  embedding FLOAT[] DEFAULT '{}',
  processing_status TEXT DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  uploaded_by UUID,
  version INTEGER DEFAULT 1,
  parent_document_id UUID,
  description TEXT,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 32. notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  content TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  link TEXT,
  action_url TEXT,
  user_id UUID,
  related_to_type TEXT,
  related_to_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 33. conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  participant_ids UUID[] DEFAULT '{}',
  participants UUID[] DEFAULT '{}',
  name TEXT,
  is_system BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'direct',
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 34. chat_messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 35. industry_templates
CREATE TABLE industry_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  industry TEXT NOT NULL,
  sections JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 36. reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  content TEXT,
  platform TEXT DEFAULT 'Google',
  status TEXT DEFAULT 'New',
  replied BOOLEAN DEFAULT false,
  reply_content TEXT,
  replied_at TIMESTAMPTZ,
  job_id UUID REFERENCES jobs(id),
  account_id UUID REFERENCES accounts(id),
  sentiment TEXT DEFAULT 'Neutral',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 37. referral_rewards
CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL,
  referred_lead_id UUID REFERENCES leads(id),
  reward_amount NUMERIC(15,2) NOT NULL,
  status TEXT DEFAULT 'Active',
  payout_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 38. inbound_forms
CREATE TABLE inbound_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  fields JSONB DEFAULT '[]',
  submit_button_text TEXT DEFAULT 'Submit',
  success_message TEXT DEFAULT 'Thank you!',
  target_campaign_id UUID,
  submission_count INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2),
  status TEXT DEFAULT 'Active',
  embed_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 39. chat_widgets
CREATE TABLE chat_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  page TEXT,
  bubble_color TEXT DEFAULT '#0000FF',
  welcome_message TEXT DEFAULT 'Hi! How can I help?',
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'Active',
  routing_user_id UUID REFERENCES users(id),
  conversations INTEGER DEFAULT 0,
  avg_response_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 40. calculators
CREATE TABLE calculators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  base_rate NUMERIC(15,4),
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'Active',
  usage_count INTEGER DEFAULT 0,
  lead_conversion_rate NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 41. automation_workflows
CREATE TABLE automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger JSONB NOT NULL,
  nodes JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  category TEXT DEFAULT 'System',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 42. webhooks
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  method TEXT DEFAULT 'POST',
  headers JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  trigger_event TEXT NOT NULL,
  last_triggered_at TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 43. tactical_queue
CREATE TABLE tactical_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  priority_score INTEGER DEFAULT 50,
  status TEXT DEFAULT 'open',
  assignee_id UUID REFERENCES users(id),
  sla_deadline TIMESTAMPTZ,
  escalation_level INTEGER DEFAULT 0,
  related_to_type TEXT,
  related_to_id UUID,
  related_to_name TEXT,
  notes JSONB DEFAULT '[]',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 44. warehouse_locations
CREATE TABLE warehouse_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id),
  name TEXT NOT NULL,
  code TEXT,
  type TEXT DEFAULT 'bin',
  description TEXT,
  capacity INTEGER,
  current_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_pickable BOOLEAN DEFAULT true,
  is_receivable BOOLEAN DEFAULT true,
  parent_location_id UUID REFERENCES warehouse_locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 45. dispatch_alerts
CREATE TABLE dispatch_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  related_to_type TEXT,
  related_to_id UUID,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 46. rfqs
CREATE TABLE rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rfq_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  supplier_ids UUID[] DEFAULT '{}',
  line_items JSONB DEFAULT '[]',
  issue_date DATE,
  due_date DATE,
  valid_until DATE,
  purchase_order_id UUID,
  job_id UUID REFERENCES jobs(id),
  winning_supplier_id UUID,
  awarded_at TIMESTAMPTZ,
  total_value NUMERIC(15,2),
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- 47. supplier_quotes
CREATE TABLE supplier_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  quote_number TEXT,
  rfq_id UUID REFERENCES rfqs(id),
  supplier_id UUID NOT NULL REFERENCES accounts(id),
  status TEXT DEFAULT 'received',
  line_items JSONB DEFAULT '[]',
  subtotal NUMERIC(15,2),
  tax_total NUMERIC(15,2),
  total NUMERIC(15,2),
  received_date DATE,
  valid_until DATE,
  evaluation_score INTEGER,
  evaluation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);

-- ============================================================
-- CREATE INDEXES
-- ============================================================

CREATE INDEX idx_organization_users_user_id ON organization_users(user_id);
CREATE INDEX idx_organization_users_org_id ON organization_users(org_id);
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_accounts_org_id ON accounts(org_id);
CREATE INDEX idx_contacts_org_id ON contacts(org_id);
CREATE INDEX idx_contacts_account_id ON contacts(account_id);
CREATE INDEX idx_leads_org_id ON leads(org_id);
CREATE INDEX idx_deals_org_id ON deals(org_id);
CREATE INDEX idx_deals_account_id ON deals(account_id);
CREATE INDEX idx_tasks_org_id ON tasks(org_id);
CREATE INDEX idx_tickets_org_id ON tickets(org_id);
CREATE INDEX idx_jobs_org_id ON jobs(org_id);
CREATE INDEX idx_jobs_crew_id ON jobs(crew_id);
CREATE INDEX idx_invoices_org_id ON invoices(org_id);
CREATE INDEX idx_invoices_account_id ON invoices(account_id);

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculators ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tactical_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- ============================================================
-- REBUILD COMPLETE
-- ============================================================
SELECT 'Schema rebuild complete! 47 tables created.' AS result;
