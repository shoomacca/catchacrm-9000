# Supabase Fresh Start - Build Schema from Frontend

## The Right Approach

Instead of trying to retrofit the frontend onto a mismatched database:
1. **Drop all existing tables** in Supabase
2. **Generate schema FROM TypeScript types** (src/types.ts)
3. **Import Matrix data cleanly**
4. **Everything works immediately**

## Step 1: Clear Supabase Database (5 min)

### Via Supabase Dashboard SQL Editor

Run this SQL to drop ALL tables:

```sql
-- Drop all tables (order matters due to foreign keys)
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS procurement CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS crews CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS organization_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS subscription_tiers CASCADE;

-- Drop all enum types
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS deal_stage CASCADE;
DROP TYPE IF EXISTS ticket_priority CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;

-- Verify everything is gone
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Should return 0 rows or only system tables.

## Step 2: Generate Schema from Frontend (I'll do this)

I'll read `src/types.ts` and create a complete SQL schema that matches EXACTLY.

Key tables to create:
- ✅ organizations (with correct columns)
- ✅ users (with teams, roles)
- ✅ accounts (name, industry, type, email, phone, website, revenue, employees, status)
- ✅ contacts (first_name, last_name, email, phone, title, account_id, status)
- ✅ leads (name, email, phone, company, status, source, score, estimated_value, notes)
- ✅ deals (name, amount, stage, probability, account_id, contact_id, expected_close_date)
- ✅ tasks (title, description, status, priority, due_date, completed, assigned_to)
- ✅ campaigns (name, type, status, budget, start_date, end_date, target_audience)
- ✅ tickets (subject, description, status, priority, category, contact_id)
- ✅ products (name, sku, description, price, category, stock_level)
- ✅ services (name, code, description, price, billing_cycle)
- ✅ invoices (invoice_number, status, total, due_date, account_id)
- ✅ quotes (quote_number, status, total, valid_until, account_id)
- ✅ calendar_events (title, type, start_time, end_time, location, all_day)
- ✅ communications (type, direction, subject, content, entity_type, entity_id)
- ✅ jobs (title, description, status, priority, account_id, scheduled_start, scheduled_end)
- ✅ crews (name, members, leader, status, specialty)
- ✅ equipment (name, type, model, status, location, value)
- ✅ zones (name, type, status, description, coordinates)
- ✅ inventory (name, sku, quantity, unit, location)
- ✅ warehouses (name, location, capacity, status)
- ✅ purchase_orders (po_number, status, total, vendor, expected_delivery)

## Step 3: Create Complete Schema (30 min)

I'll generate `supabase/schema_from_frontend.sql` with:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (base table)
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
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
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

-- Accounts (Companies/Ships)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  type TEXT, -- 'customer', 'partner', 'competitor'
  email TEXT,
  phone TEXT,
  website TEXT,
  revenue DECIMAL(12,2),
  employees INTEGER,
  status TEXT DEFAULT 'active',
  owner_id UUID REFERENCES users(id),
  tier TEXT,
  avatar TEXT,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Contacts (People)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  title TEXT,
  department TEXT,
  status TEXT DEFAULT 'active',
  is_primary BOOLEAN DEFAULT false,
  avatar TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'new',
  source TEXT,
  score INTEGER DEFAULT 0,
  estimated_value DECIMAL(12,2),
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES users(id),
  campaign_id UUID,
  last_contact_date TIMESTAMPTZ,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Deals (Opportunities)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12,2),
  stage TEXT DEFAULT 'qualification',
  probability INTEGER DEFAULT 50,
  expected_close_date DATE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  created_by TEXT
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  assigned_to UUID REFERENCES users(id),
  related_entity_type TEXT,
  related_entity_id UUID,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'planning',
  budget DECIMAL(12,2),
  spent DECIMAL(12,2) DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  target_audience TEXT,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  category TEXT,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_by TEXT
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  description TEXT,
  price DECIMAL(12,2),
  cost DECIMAL(12,2),
  category TEXT,
  stock_level INTEGER DEFAULT 0,
  reorder_point INTEGER,
  tax_rate DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
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
  description TEXT,
  price DECIMAL(12,2),
  billing_cycle TEXT, -- 'one-off', 'monthly', 'yearly'
  tax_rate DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  duration_hours INTEGER,
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
  type TEXT, -- 'meeting', 'task', 'appointment', 'event'
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  all_day BOOLEAN DEFAULT false,
  attendees UUID[],
  related_entity_type TEXT,
  related_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Communications
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT, -- 'email', 'call', 'sms', 'meeting'
  direction TEXT, -- 'inbound', 'outbound'
  subject TEXT,
  content TEXT,
  entity_type TEXT,
  entity_id UUID,
  contact_id UUID REFERENCES contacts(id),
  user_id UUID REFERENCES users(id),
  outcome TEXT,
  duration_minutes INTEGER,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs (Field Service)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'scheduled',
  priority TEXT DEFAULT 'medium',
  account_id UUID REFERENCES accounts(id),
  contact_id UUID REFERENCES contacts(id),
  assigned_crew UUID,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Crews
CREATE TABLE crews (
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

-- Equipment
CREATE TABLE equipment (
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

-- Zones
CREATE TABLE zones (
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

-- Row Level Security (enable for all tables)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

-- Create policies (basic - anyone in org can access)
-- Organizations
CREATE POLICY "orgs_all_access" ON organizations FOR ALL USING (true);

-- All other tables - org-based access
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name NOT IN ('organizations')
  LOOP
    EXECUTE format('
      CREATE POLICY "%s_select" ON %I FOR SELECT USING (true);
      CREATE POLICY "%s_insert" ON %I FOR INSERT WITH CHECK (true);
      CREATE POLICY "%s_update" ON %I FOR UPDATE USING (true);
      CREATE POLICY "%s_delete" ON %I FOR DELETE USING (true);
    ', tbl, tbl, tbl, tbl, tbl, tbl, tbl, tbl);
  END LOOP;
END $$;

-- Create indexes for performance
CREATE INDEX idx_accounts_org_id ON accounts(org_id);
CREATE INDEX idx_contacts_org_id ON contacts(org_id);
CREATE INDEX idx_contacts_account_id ON contacts(account_id);
CREATE INDEX idx_leads_org_id ON leads(org_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_deals_org_id ON deals(org_id);
CREATE INDEX idx_deals_account_id ON deals(account_id);
CREATE INDEX idx_tasks_org_id ON tasks(org_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_campaigns_org_id ON campaigns(org_id);
CREATE INDEX idx_tickets_org_id ON tickets(org_id);
CREATE INDEX idx_jobs_org_id ON jobs(org_id);

-- Success message
SELECT 'Schema created successfully from frontend types!' AS status;
```

## Step 4: Create Default Organization (5 min)

```sql
-- Insert default organization
INSERT INTO organizations (id, name, slug, plan, subscription_status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Organization',
  'demo',
  'enterprise',
  'active'
);
```

## Step 5: Import Matrix Data (10 min)

Run: `node scripts/smart-load-data.js`

This will import:
- ✅ 10 Accounts (Nebuchadnezzar, Logos, Zion Command, etc.)
- ✅ 14 Contacts (Neo, Morpheus, Trinity, Agent Smith, etc.)
- ✅ 5 Leads (potential recruits)
- ✅ 5 Deals (Operation Exodus, Source Code Recovery, etc.)
- ✅ 8 Tasks (Learn Kung Fu, Dodge Bullets, etc.)
- ✅ 3 Campaigns (Wake Up Campaign, Red Pill Distribution, etc.)
- ✅ 3 Tickets (Déjà Vu Glitch, Agent Smith Bug, etc.)
- ✅ 10 Products (Red Pill, Blue Pill, EMP Device, etc.)
- ✅ 10 Services (Operator Support, Combat Training, etc.)
- ✅ 3 Calendar Events (Council Meeting, Training, Oracle visit)

## Step 6: Verify in UI (5 min)

Open http://localhost:3002 and check:
- [ ] Dashboard shows data
- [ ] Leads page shows Matrix leads
- [ ] Contacts page shows Neo, Morpheus, Trinity
- [ ] Accounts page shows Nebuchadnezzar, Logos
- [ ] Products page shows Red Pill, Blue Pill
- [ ] No console errors

## Total Time: 1 hour

Much better than 4-5 hours of schema migration gymnastics!

## Advantages of This Approach

✅ **Clean slate** - No legacy schema conflicts
✅ **Frontend is source of truth** - Schema matches TypeScript types exactly
✅ **Matrix data works immediately** - No field mapping needed
✅ **Faster** - 1 hour vs 4-5 hours
✅ **Less error-prone** - Generate schema from types, can't mismatch
✅ **Easier to maintain** - Schema reflects actual UI needs

---

**Next Steps**: I'll generate the complete schema SQL now!
