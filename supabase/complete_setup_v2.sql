-- ============================================
-- CatchaCRM NG v11 - Complete Schema
-- Multi-tenant CRM with strict RLS isolation
-- Created: 2026-01-23
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE: Organizations (Tenant table)
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  org_type TEXT NOT NULL DEFAULT 'standard', -- standard, reseller, wholesale
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  max_seats INTEGER DEFAULT 5,
  active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "org_select_own" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_insert_system" ON organizations
  FOR INSERT WITH CHECK (false); -- Only via service role

CREATE POLICY "org_update_own" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- CORE: Organization Users (User-Org mapping)
-- ============================================

CREATE TABLE IF NOT EXISTS organization_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users
  role TEXT NOT NULL DEFAULT 'user', -- owner, admin, manager, user, readonly
  active BOOLEAN DEFAULT true,
  invited_by UUID,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_users
CREATE POLICY "org_users_select_own_org" ON organization_users
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_users_insert_admin" ON organization_users
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "org_users_update_admin" ON organization_users
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "org_users_delete_admin" ON organization_users
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- CORE: Contacts (People)
-- ============================================

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  title TEXT,
  account_id UUID, -- References accounts table
  owner_id UUID NOT NULL, -- References auth.users
  lead_source TEXT,
  lead_status TEXT DEFAULT 'new',
  lead_score INTEGER DEFAULT 0,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts
CREATE POLICY "contacts_select_own_org" ON contacts
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "contacts_insert_own_org" ON contacts
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "contacts_update_own_org" ON contacts
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "contacts_delete_own_org" ON contacts
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- CORE: Accounts (Companies)
-- ============================================

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  employee_count INTEGER,
  annual_revenue NUMERIC,
  parent_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL,
  billing_address JSONB,
  shipping_address JSONB,
  account_type TEXT DEFAULT 'prospect',
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts
CREATE POLICY "accounts_select_own_org" ON accounts
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "accounts_insert_own_org" ON accounts
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "accounts_update_own_org" ON accounts
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "accounts_delete_own_org" ON accounts
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

-- Add account_id FK to contacts after accounts table exists
ALTER TABLE contacts ADD CONSTRAINT fk_contacts_account
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL;

-- ============================================
-- CORE: Opportunities (Deals)
-- ============================================

CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  amount NUMERIC,
  stage TEXT NOT NULL DEFAULT 'prospecting',
  probability INTEGER DEFAULT 0,
  close_date DATE,
  owner_id UUID NOT NULL,
  lead_source TEXT,
  next_step TEXT,
  description TEXT,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for opportunities
CREATE POLICY "opportunities_select_own_org" ON opportunities
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "opportunities_insert_own_org" ON opportunities
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "opportunities_update_own_org" ON opportunities
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "opportunities_delete_own_org" ON opportunities
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- CORE: Activities (Timeline)
-- ============================================

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- call, email, meeting, task, note
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  owner_id UUID NOT NULL,
  assigned_to UUID,
  related_to_type TEXT, -- contact, account, opportunity
  related_to_id UUID,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activities
CREATE POLICY "activities_select_own_org" ON activities
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "activities_insert_own_org" ON activities
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "activities_update_own_org" ON activities
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "activities_delete_own_org" ON activities
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- CORE: Products
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  product_family TEXT,
  list_price NUMERIC,
  cost NUMERIC,
  active BOOLEAN DEFAULT true,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "products_select_own_org" ON products
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "products_insert_own_org" ON products
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "products_update_own_org" ON products
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "products_delete_own_org" ON products
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- CORE: Quotes
-- ============================================

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  quote_number TEXT UNIQUE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft',
  total_amount NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  valid_until DATE,
  owner_id UUID NOT NULL,
  line_items JSONB DEFAULT '[]',
  terms TEXT,
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotes
CREATE POLICY "quotes_select_own_org" ON quotes
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "quotes_insert_own_org" ON quotes
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "quotes_update_own_org" ON quotes
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "quotes_delete_own_org" ON quotes
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- GLOBAL: Subscription Tiers
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  max_seats INTEGER,
  price_per_seat NUMERIC,
  features JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_tiers (global read)
CREATE POLICY "subscription_tiers_select_all" ON subscription_tiers
  FOR SELECT USING (true);

CREATE POLICY "subscription_tiers_insert_system" ON subscription_tiers
  FOR INSERT WITH CHECK (false); -- Only via service role

-- ============================================
-- CORE: Audit Log (for governance)
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_log (admins only)
CREATE POLICY "audit_log_select_admin" ON audit_log
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "audit_log_insert_system" ON audit_log
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- INDEXES for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_org_users_user_id ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_org_users_org_id ON organization_users(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_org_id ON accounts(org_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_org_id ON opportunities(org_id);
CREATE INDEX IF NOT EXISTS idx_activities_org_id ON activities(org_id);
CREATE INDEX IF NOT EXISTS idx_products_org_id ON products(org_id);
CREATE INDEX IF NOT EXISTS idx_quotes_org_id ON quotes(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_org_id ON audit_log(org_id);

-- ============================================
-- FUNCTIONS for updated_at triggers
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_users_updated_at BEFORE UPDATE ON organization_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETE
-- ============================================

COMMENT ON TABLE organizations IS 'Multi-tenant organizations with hierarchical support';
COMMENT ON TABLE organization_users IS 'User-organization membership and roles';
COMMENT ON TABLE contacts IS 'CRM contacts/leads';
COMMENT ON TABLE accounts IS 'CRM accounts/companies';
COMMENT ON TABLE opportunities IS 'CRM deals/opportunities';
COMMENT ON TABLE activities IS 'Timeline activities and tasks';
COMMENT ON TABLE products IS 'Product catalog';
COMMENT ON TABLE quotes IS 'CPQ quotes';
COMMENT ON TABLE subscription_tiers IS 'Global subscription tier definitions';
COMMENT ON TABLE audit_log IS 'Audit trail for governance';
