-- =====================================================
-- MISSING TABLES MIGRATION
-- Creates tables for modules that currently use mock data
-- Generated: 2026-02-11
-- =====================================================

-- =====================================================
-- 1. TACTICAL QUEUE TABLE
-- Used by: src/pages/Operations/TacticalQueue.tsx
-- Purpose: Priority work items with SLA tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS tactical_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core fields
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  priority_score INTEGER DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'escalated', 'resolved', 'closed')),

  -- Assignment & SLA
  assignee_id UUID REFERENCES users(id),
  sla_deadline TIMESTAMPTZ,
  escalation_level INTEGER DEFAULT 0,

  -- Related entity
  related_to_type TEXT CHECK (related_to_type IN ('accounts', 'contacts', 'leads', 'deals', 'tickets', 'jobs')),
  related_to_id UUID,
  related_to_name TEXT,

  -- Notes stored as JSONB array
  notes JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  owner_id UUID REFERENCES users(id)
);

-- RLS Policy
ALTER TABLE tactical_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tactical_queue_org_isolation" ON tactical_queue
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Index for performance
CREATE INDEX idx_tactical_queue_org ON tactical_queue(org_id);
CREATE INDEX idx_tactical_queue_priority ON tactical_queue(priority, priority_score DESC);
CREATE INDEX idx_tactical_queue_sla ON tactical_queue(sla_deadline) WHERE status NOT IN ('resolved', 'closed');


-- =====================================================
-- 2. WAREHOUSE LOCATIONS TABLE
-- Used by: src/pages/WarehousePage.tsx
-- Purpose: Specific locations within warehouses (zones, aisles, bins)
-- =====================================================
CREATE TABLE IF NOT EXISTS warehouse_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core fields
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT, -- e.g., "A-01-03" for Aisle A, Rack 01, Bin 03
  type TEXT DEFAULT 'bin' CHECK (type IN ('zone', 'aisle', 'rack', 'bin', 'floor')),

  -- Location details
  description TEXT,
  capacity INTEGER, -- Max items this location can hold
  current_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_pickable BOOLEAN DEFAULT true, -- Can items be picked from here?
  is_receivable BOOLEAN DEFAULT true, -- Can items be received here?

  -- Hierarchy
  parent_location_id UUID REFERENCES warehouse_locations(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  owner_id UUID REFERENCES users(id)
);

-- RLS Policy
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "warehouse_locations_org_isolation" ON warehouse_locations
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Index
CREATE INDEX idx_warehouse_locations_warehouse ON warehouse_locations(warehouse_id);
CREATE INDEX idx_warehouse_locations_code ON warehouse_locations(code);


-- =====================================================
-- 3. DISPATCH ALERTS TABLE
-- Used by: src/pages/Logistics/DispatchMatrix.tsx
-- Purpose: Real-time alerts for field operations
-- =====================================================
CREATE TABLE IF NOT EXISTS dispatch_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core fields
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent', 'critical')),

  -- Related entity
  related_to_type TEXT CHECK (related_to_type IN ('jobs', 'crews', 'equipment', 'zones')),
  related_to_id UUID,

  -- Alert status
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,

  -- Auto-dismiss
  expires_at TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  owner_id UUID REFERENCES users(id)
);

-- RLS Policy
ALTER TABLE dispatch_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dispatch_alerts_org_isolation" ON dispatch_alerts
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Index
CREATE INDEX idx_dispatch_alerts_org ON dispatch_alerts(org_id);
CREATE INDEX idx_dispatch_alerts_active ON dispatch_alerts(created_at DESC)
  WHERE is_dismissed = false AND is_acknowledged = false;


-- =====================================================
-- 4. RFQS (Request for Quotes) TABLE
-- Used by: src/pages/ProcurementPage.tsx
-- Purpose: Procurement RFQs sent to suppliers
-- =====================================================
CREATE TABLE IF NOT EXISTS rfqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core fields
  rfq_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'evaluating', 'awarded', 'closed', 'cancelled')),

  -- Suppliers (can send to multiple)
  supplier_ids UUID[], -- Array of account IDs

  -- Items requested
  line_items JSONB DEFAULT '[]'::jsonb, -- [{name, qty, specs, ...}]

  -- Dates
  issue_date DATE,
  due_date DATE, -- Response due date
  valid_until DATE,

  -- Linked entities
  purchase_order_id UUID REFERENCES purchase_orders(id), -- If awarded
  job_id UUID REFERENCES jobs(id), -- Related job if applicable

  -- Evaluation
  winning_supplier_id UUID REFERENCES accounts(id),
  awarded_at TIMESTAMPTZ,
  total_value NUMERIC(12,2),

  -- Notes
  notes TEXT,
  terms TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  owner_id UUID REFERENCES users(id)
);

-- RLS Policy
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rfqs_org_isolation" ON rfqs
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Index
CREATE INDEX idx_rfqs_org ON rfqs(org_id);
CREATE INDEX idx_rfqs_status ON rfqs(status);
CREATE INDEX idx_rfqs_number ON rfqs(rfq_number);


-- =====================================================
-- 5. SUPPLIER QUOTES TABLE (responses to RFQs)
-- Used by: src/pages/ProcurementPage.tsx
-- Purpose: Quotes received from suppliers in response to RFQs
-- =====================================================
CREATE TABLE IF NOT EXISTS supplier_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core fields
  quote_number TEXT,
  rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES accounts(id),

  -- Status
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'under_review', 'accepted', 'rejected', 'expired')),

  -- Pricing
  line_items JSONB DEFAULT '[]'::jsonb, -- [{name, qty, unit_price, total}]
  subtotal NUMERIC(12,2),
  tax_total NUMERIC(12,2),
  total NUMERIC(12,2),

  -- Dates
  received_date DATE,
  valid_until DATE,

  -- Evaluation
  evaluation_score INTEGER, -- 0-100
  evaluation_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  owner_id UUID REFERENCES users(id)
);

-- RLS Policy
ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "supplier_quotes_org_isolation" ON supplier_quotes
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Index
CREATE INDEX idx_supplier_quotes_rfq ON supplier_quotes(rfq_id);
CREATE INDEX idx_supplier_quotes_supplier ON supplier_quotes(supplier_id);


-- =====================================================
-- SUMMARY OF NEW TABLES
-- =====================================================
-- 1. tactical_queue      - Priority work items with SLA tracking
-- 2. warehouse_locations - Locations within warehouses
-- 3. dispatch_alerts     - Real-time field operations alerts
-- 4. rfqs                - Request for Quotes (procurement)
-- 5. supplier_quotes     - Quotes received from suppliers
-- =====================================================
