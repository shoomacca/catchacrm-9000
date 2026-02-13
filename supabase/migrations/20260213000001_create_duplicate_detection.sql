-- Migration: Create duplicate detection tables
-- This migration creates tables for duplicate detection rules and matching logs

-- Create duplicate_rules table
CREATE TABLE IF NOT EXISTS duplicate_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Rule Configuration
  entity_type TEXT NOT NULL, -- 'leads', 'contacts', 'accounts'
  name TEXT NOT NULL,
  description TEXT,

  -- Matching Fields (JSONB array of field names to match on)
  match_fields JSONB NOT NULL DEFAULT '[]', -- e.g., ["email"], ["phone"], ["first_name", "last_name"]
  match_logic TEXT DEFAULT 'OR', -- 'OR' or 'AND' - how to combine multiple match_fields

  -- Rule Status
  is_active BOOLEAN DEFAULT true,
  priority INT DEFAULT 0, -- Higher priority rules check first

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),

  -- Ensure unique rule names per org and entity type
  UNIQUE(org_id, entity_type, name)
);

-- Create matching_rules table (logs of duplicate matches)
CREATE TABLE IF NOT EXISTS matching_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Match Details
  entity_type TEXT NOT NULL,
  record_id TEXT NOT NULL, -- ID of the new record being created
  duplicate_record_id TEXT NOT NULL, -- ID of the existing duplicate record

  -- Match Information
  matched_on JSONB NOT NULL DEFAULT '{}', -- Fields that matched, e.g., {"email": "test@test.com"}
  rule_id UUID REFERENCES duplicate_rules(id),
  confidence_score DECIMAL(3,2) DEFAULT 1.0, -- 0.0 to 1.0

  -- User Decision
  user_action TEXT, -- 'create_anyway', 'view_duplicate', 'cancelled', 'merged'
  user_id UUID REFERENCES users(id),
  action_at TIMESTAMPTZ,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Indexes for performance
  CONSTRAINT matching_rules_org_entity_idx UNIQUE(org_id, entity_type, record_id, duplicate_record_id)
);

-- Enable RLS
ALTER TABLE duplicate_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for duplicate_rules
CREATE POLICY "Users can view duplicate rules in their org"
  ON duplicate_rules FOR SELECT
  USING (org_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create duplicate rules in their org"
  ON duplicate_rules FOR INSERT
  WITH CHECK (org_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update duplicate rules in their org"
  ON duplicate_rules FOR UPDATE
  USING (org_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete duplicate rules in their org"
  ON duplicate_rules FOR DELETE
  USING (org_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  ));

-- RLS Policies for matching_rules
CREATE POLICY "Users can view matching rules in their org"
  ON matching_rules FOR SELECT
  USING (org_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create matching rules in their org"
  ON matching_rules FOR INSERT
  WITH CHECK (org_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update matching rules in their org"
  ON matching_rules FOR UPDATE
  USING (org_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_duplicate_rules_org_entity ON duplicate_rules(org_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_duplicate_rules_active ON duplicate_rules(org_id, is_active);
CREATE INDEX IF NOT EXISTS idx_matching_rules_org_entity ON matching_rules(org_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_matching_rules_record ON matching_rules(org_id, record_id);

-- Add updated_at trigger for duplicate_rules
CREATE OR REPLACE FUNCTION update_duplicate_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_duplicate_rules_timestamp
  BEFORE UPDATE ON duplicate_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_duplicate_rules_updated_at();

-- Insert default duplicate detection rules
-- These will be inserted with a placeholder org_id that should be replaced per org

-- Note: In production, these should be inserted when an org is created
-- For now, this migration creates the schema only
