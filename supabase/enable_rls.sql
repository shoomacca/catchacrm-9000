-- ============================================
-- Enable RLS on All Tenant Tables
-- ============================================
-- This script enables Row Level Security (RLS) on all CRM tables
-- and creates policies for multi-tenant data isolation.
--
-- Policy: Users can only access records where org_id matches
-- one of their organization memberships in organization_users.
-- ============================================

-- Helper function to check if current user has access to an org
CREATE OR REPLACE FUNCTION auth.user_has_org_access(check_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_users
    WHERE user_id = auth.uid()
    AND org_id = check_org_id
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CORE TABLES
-- ============================================

-- Organizations (special case - users can see orgs they belong to)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "organizations_access" ON organizations;
CREATE POLICY "organizations_access" ON organizations FOR ALL USING (
  id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_org_isolation" ON users;
CREATE POLICY "users_org_isolation" ON users FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "accounts_org_isolation" ON accounts;
CREATE POLICY "accounts_org_isolation" ON accounts FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contacts_org_isolation" ON contacts;
CREATE POLICY "contacts_org_isolation" ON contacts FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "leads_org_isolation" ON leads;
CREATE POLICY "leads_org_isolation" ON leads FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Deals
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deals_org_isolation" ON deals;
CREATE POLICY "deals_org_isolation" ON deals FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- ============================================
-- TASK & COMMUNICATION TABLES
-- ============================================

-- Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tasks_org_isolation" ON tasks;
CREATE POLICY "tasks_org_isolation" ON tasks FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Calendar Events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "calendar_events_org_isolation" ON calendar_events;
CREATE POLICY "calendar_events_org_isolation" ON calendar_events FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Communications
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "communications_org_isolation" ON communications;
CREATE POLICY "communications_org_isolation" ON communications FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conversations_org_isolation" ON conversations;
CREATE POLICY "conversations_org_isolation" ON conversations FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Chat Messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat_messages_org_isolation" ON chat_messages;
CREATE POLICY "chat_messages_org_isolation" ON chat_messages FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tickets_org_isolation" ON tickets;
CREATE POLICY "tickets_org_isolation" ON tickets FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campaigns_org_isolation" ON campaigns;
CREATE POLICY "campaigns_org_isolation" ON campaigns FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- ============================================
-- FINANCIAL TABLES
-- ============================================

-- Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoices_org_isolation" ON invoices;
CREATE POLICY "invoices_org_isolation" ON invoices FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Quotes
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quotes_org_isolation" ON quotes;
CREATE POLICY "quotes_org_isolation" ON quotes FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_org_isolation" ON products;
CREATE POLICY "products_org_isolation" ON products FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "services_org_isolation" ON services;
CREATE POLICY "services_org_isolation" ON services FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subscriptions_org_isolation" ON subscriptions;
CREATE POLICY "subscriptions_org_isolation" ON subscriptions FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "expenses_org_isolation" ON expenses;
CREATE POLICY "expenses_org_isolation" ON expenses FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Bank Transactions
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bank_transactions_org_isolation" ON bank_transactions;
CREATE POLICY "bank_transactions_org_isolation" ON bank_transactions FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- ============================================
-- FIELD SERVICE TABLES
-- ============================================

-- Jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "jobs_org_isolation" ON jobs;
CREATE POLICY "jobs_org_isolation" ON jobs FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Crews
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crews_org_isolation" ON crews;
CREATE POLICY "crews_org_isolation" ON crews FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Zones
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "zones_org_isolation" ON zones;
CREATE POLICY "zones_org_isolation" ON zones FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Equipment
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "equipment_org_isolation" ON equipment;
CREATE POLICY "equipment_org_isolation" ON equipment FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Inventory Items
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inventory_items_org_isolation" ON inventory_items;
CREATE POLICY "inventory_items_org_isolation" ON inventory_items FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Purchase Orders
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "purchase_orders_org_isolation" ON purchase_orders;
CREATE POLICY "purchase_orders_org_isolation" ON purchase_orders FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Warehouses
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "warehouses_org_isolation" ON warehouses;
CREATE POLICY "warehouses_org_isolation" ON warehouses FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- ============================================
-- MARKETING TABLES
-- ============================================

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_org_isolation" ON reviews;
CREATE POLICY "reviews_org_isolation" ON reviews FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Referral Rewards
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "referral_rewards_org_isolation" ON referral_rewards;
CREATE POLICY "referral_rewards_org_isolation" ON referral_rewards FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Inbound Forms
ALTER TABLE inbound_forms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inbound_forms_org_isolation" ON inbound_forms;
CREATE POLICY "inbound_forms_org_isolation" ON inbound_forms FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Chat Widgets
ALTER TABLE chat_widgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat_widgets_org_isolation" ON chat_widgets;
CREATE POLICY "chat_widgets_org_isolation" ON chat_widgets FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Calculators
ALTER TABLE calculators ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "calculators_org_isolation" ON calculators;
CREATE POLICY "calculators_org_isolation" ON calculators FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- ============================================
-- SYSTEM TABLES
-- ============================================

-- Automation Workflows
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "automation_workflows_org_isolation" ON automation_workflows;
CREATE POLICY "automation_workflows_org_isolation" ON automation_workflows FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Webhooks
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "webhooks_org_isolation" ON webhooks;
CREATE POLICY "webhooks_org_isolation" ON webhooks FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Industry Templates
ALTER TABLE industry_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "industry_templates_org_isolation" ON industry_templates;
CREATE POLICY "industry_templates_org_isolation" ON industry_templates FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_org_isolation" ON notifications;
CREATE POLICY "notifications_org_isolation" ON notifications FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "documents_org_isolation" ON documents;
CREATE POLICY "documents_org_isolation" ON documents FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- Audit Log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_log_org_isolation" ON audit_log;
CREATE POLICY "audit_log_org_isolation" ON audit_log FOR ALL USING (
  org_id IN (SELECT org_id FROM organization_users WHERE user_id = auth.uid() AND active = true)
);

-- ============================================
-- DEMO MODE BYPASS
-- ============================================
-- Allow access to demo org data for unauthenticated users
-- Demo org ID: 00000000-0000-0000-0000-000000000001

-- Create policy for demo access on all tables
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'organizations', 'users', 'accounts', 'contacts', 'leads', 'deals',
    'tasks', 'calendar_events', 'communications', 'conversations', 'chat_messages',
    'tickets', 'campaigns', 'invoices', 'quotes', 'products', 'services',
    'subscriptions', 'expenses', 'bank_transactions', 'jobs', 'crews', 'zones',
    'equipment', 'inventory_items', 'purchase_orders', 'warehouses',
    'reviews', 'referral_rewards', 'inbound_forms', 'chat_widgets', 'calculators',
    'automation_workflows', 'webhooks', 'industry_templates', 'notifications',
    'documents', 'audit_log'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- Drop existing demo policy if it exists
    EXECUTE format('DROP POLICY IF EXISTS "%s_demo_access" ON %I', tbl, tbl);

    -- Create demo access policy (read-only for demo org)
    BEGIN
      EXECUTE format(
        'CREATE POLICY "%s_demo_access" ON %I FOR SELECT USING (org_id = ''00000000-0000-0000-0000-000000000001''::uuid)',
        tbl, tbl
      );
    EXCEPTION WHEN others THEN
      -- Skip if policy creation fails (e.g., table doesn't exist)
      RAISE NOTICE 'Could not create demo policy for %: %', tbl, SQLERRM;
    END;
  END LOOP;
END $$;

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify RLS is enabled on all tables:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
