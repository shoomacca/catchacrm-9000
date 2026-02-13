-- Migration: Create custom_objects table for blueprint/custom entity definitions
-- This table stores custom entity definitions when a blueprint is activated

-- Create custom_objects table if not exists
CREATE TABLE IF NOT EXISTS custom_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Entity Definition
  entity_type TEXT NOT NULL, -- e.g., "properties", "showings", "installations"
  name TEXT NOT NULL, -- singular name, e.g., "Property"
  name_plural TEXT NOT NULL, -- plural name, e.g., "Properties"
  icon TEXT, -- emoji icon

  -- Schema Definition (JSONB for flexibility)
  fields_schema JSONB NOT NULL DEFAULT '[]', -- array of field definitions
  relation_to TEXT[] DEFAULT '{}', -- array of entity types this relates to

  -- Features
  has_timeline BOOLEAN DEFAULT false,
  has_documents BOOLEAN DEFAULT false,
  has_workflow BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),

  -- Ensure unique entity_type per org
  UNIQUE(org_id, entity_type)
);

-- Enable RLS
ALTER TABLE custom_objects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view custom objects in their org"
  ON custom_objects FOR SELECT
  USING (org_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create custom objects in their org"
  ON custom_objects FOR INSERT
  WITH CHECK (org_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update custom objects in their org"
  ON custom_objects FOR UPDATE
  USING (org_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete custom objects in their org"
  ON custom_objects FOR DELETE
  USING (org_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  ));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_objects_org_id ON custom_objects(org_id);
CREATE INDEX IF NOT EXISTS idx_custom_objects_entity_type ON custom_objects(org_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_custom_objects_active ON custom_objects(org_id, is_active);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_custom_objects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_objects_timestamp
  BEFORE UPDATE ON custom_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_objects_updated_at();
