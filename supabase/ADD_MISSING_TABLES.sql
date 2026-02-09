-- ============================================
-- ADD MISSING TABLES
-- These tables are required by UI modules but missing from schema
-- Run this AFTER FULL_RESET.sql
-- ============================================

-- ============================================
-- MARKETING MODULE TABLES
-- ============================================

-- Referral Rewards (for Referral Engine)
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  referrer_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  referred_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  reward_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'Active', -- 'Active', 'Pending Payout', 'Paid', 'Cancelled'
  payout_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Inbound Forms (for Inbound Engine)
CREATE TABLE IF NOT EXISTS inbound_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT, -- 'Contact', 'Lead', 'Quote Request', 'Support'
  fields JSONB DEFAULT '[]',
  submit_button_text TEXT DEFAULT 'Submit',
  success_message TEXT DEFAULT 'Thank you for your submission!',
  target_campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  submission_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  status TEXT DEFAULT 'Active', -- 'Active', 'Inactive', 'Draft'
  embed_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Chat Widgets (for Inbound Engine)
CREATE TABLE IF NOT EXISTS chat_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  page TEXT,
  bubble_color TEXT DEFAULT '#8B5CF6',
  welcome_message TEXT DEFAULT 'Hi! How can we help you today?',
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'Active', -- 'Active', 'Inactive'
  routing_user_id UUID REFERENCES users(id),
  conversations INTEGER DEFAULT 0,
  avg_response_time INTEGER, -- seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Calculators (for Inbound Engine)
CREATE TABLE IF NOT EXISTS calculators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'ROI', 'Repayment', 'SolarYield'
  base_rate DECIMAL(10,4),
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'Active', -- 'Active', 'Inactive'
  usage_count INTEGER DEFAULT 0,
  lead_conversion_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- FINANCIAL MODULE TABLES
-- ============================================

-- Subscriptions (for Billing)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Active', -- 'Active', 'Paused', 'Cancelled'
  billing_cycle TEXT DEFAULT 'monthly', -- 'one-off', 'monthly', 'quarterly', 'yearly', 'custom'
  next_bill_date DATE,
  start_date DATE,
  end_date DATE,
  items JSONB DEFAULT '[]',
  auto_generate_invoice BOOLEAN DEFAULT true,
  last_invoice_id UUID,
  mrr DECIMAL(12,2), -- Monthly Recurring Revenue
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Payments (for payment tracking)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  method TEXT, -- 'card', 'bank_transfer', 'cash', 'check', 'other'
  status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded'
  reference TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  stripe_payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- COMMUNICATION MODULE TABLES
-- ============================================

-- Conversations (for Team Chat)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  participant_ids UUID[] DEFAULT '{}',
  name TEXT, -- For named group channels
  is_system BOOLEAN DEFAULT false, -- For mandatory system channels
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Chat Messages (for Team Chat)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Ticket Messages (for Support Tickets)
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_name TEXT,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  is_bot BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- SYSTEM MODULE TABLES
-- ============================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'urgent'
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Documents (file attachments)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_type TEXT,
  file_size TEXT,
  url TEXT,
  related_to_type TEXT,
  related_to_id UUID,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Automation Workflows
CREATE TABLE IF NOT EXISTS automation_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger JSONB, -- WorkflowTrigger
  nodes JSONB DEFAULT '[]', -- WorkflowNode[]
  is_active BOOLEAN DEFAULT false,
  execution_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  category TEXT, -- 'Sales', 'Operations', 'Logistics', 'System'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Webhooks
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Industry Templates
CREATE TABLE IF NOT EXISTS industry_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_entity TEXT,
  industry TEXT,
  sections JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- ADD is_default COLUMN TO WAREHOUSES
-- ============================================

ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- ============================================
-- ENABLE RLS ON NEW TABLES
-- ============================================

ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculators ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Allow all for development)
-- ============================================

CREATE POLICY "allow_all_referral_rewards" ON referral_rewards FOR ALL USING (true);
CREATE POLICY "allow_all_inbound_forms" ON inbound_forms FOR ALL USING (true);
CREATE POLICY "allow_all_chat_widgets" ON chat_widgets FOR ALL USING (true);
CREATE POLICY "allow_all_calculators" ON calculators FOR ALL USING (true);
CREATE POLICY "allow_all_subscriptions" ON subscriptions FOR ALL USING (true);
CREATE POLICY "allow_all_payments" ON payments FOR ALL USING (true);
CREATE POLICY "allow_all_conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "allow_all_chat_messages" ON chat_messages FOR ALL USING (true);
CREATE POLICY "allow_all_ticket_messages" ON ticket_messages FOR ALL USING (true);
CREATE POLICY "allow_all_notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "allow_all_documents" ON documents FOR ALL USING (true);
CREATE POLICY "allow_all_automation_workflows" ON automation_workflows FOR ALL USING (true);
CREATE POLICY "allow_all_webhooks" ON webhooks FOR ALL USING (true);
CREATE POLICY "allow_all_industry_templates" ON industry_templates FOR ALL USING (true);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_referral_rewards_org_id ON referral_rewards(org_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer_id ON referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_inbound_forms_org_id ON inbound_forms(org_id);
CREATE INDEX IF NOT EXISTS idx_chat_widgets_org_id ON chat_widgets(org_id);
CREATE INDEX IF NOT EXISTS idx_calculators_org_id ON calculators(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_account_id ON subscriptions(account_id);
CREATE INDEX IF NOT EXISTS idx_payments_org_id ON payments(org_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_conversations_org_id ON conversations(org_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_org_id ON chat_messages(org_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_org_id ON ticket_messages(org_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON notifications(org_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_org_id ON documents(org_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_org_id ON automation_workflows(org_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_org_id ON webhooks(org_id);
CREATE INDEX IF NOT EXISTS idx_industry_templates_org_id ON industry_templates(org_id);

-- ============================================
-- COMPLETE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Missing tables added successfully!';
  RAISE NOTICE '📊 New tables: 14';
  RAISE NOTICE '🔒 RLS enabled on all new tables';
  RAISE NOTICE '🎯 Ready for seed data!';
END $$;
