-- Fix Missing Columns (based on audit)
-- Run this in Supabase SQL Editor

-- users: missing owner_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS owner_id UUID;

-- leads: missing account_id, temperature
ALTER TABLE leads ADD COLUMN IF NOT EXISTS account_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS temperature TEXT;

-- deals: missing assigned_to, notes
ALTER TABLE deals ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS notes TEXT;

-- campaigns: missing owner_id
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS owner_id UUID;

-- tasks: missing assigned_to, related_entity_id, related_entity_type
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS related_entity_id UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS related_entity_type TEXT;

-- tickets: missing assigned_to, resolved_at, owner_id
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS owner_id UUID;

-- calendar_events: missing owner_id
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS owner_id UUID;

-- communications: missing duration, owner_id
ALTER TABLE communications ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS owner_id UUID;

-- products: missing owner_id
ALTER TABLE products ADD COLUMN IF NOT EXISTS owner_id UUID;

-- services: missing 7 columns
ALTER TABLE services ADD COLUMN IF NOT EXISTS skills_required JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS crew_size INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS equipment_needed JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sla_response_hours INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sla_completion_days INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS quality_checklist JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS owner_id UUID;

-- quotes: missing valid_until, owner_id
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS valid_until DATE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS owner_id UUID;

-- invoices: missing owner_id
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Check remaining tables and add missing columns
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS reconciled_by TEXT;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS bank_reference TEXT;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE crews ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE crews ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE zones ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE equipment ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE chat_widgets ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE chat_widgets ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE calculators ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE calculators ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE industry_templates ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE industry_templates ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE documents ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS created_by TEXT;

SELECT 'All missing columns added successfully!';
