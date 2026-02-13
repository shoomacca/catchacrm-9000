-- Migration: Add Import/Export Job Tracking Tables
-- Created: 2026-02-13
-- Purpose: Enable tracking of import/export operations for audit and history

-- ============================================
-- IMPORT JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('leads', 'deals', 'accounts', 'contacts', 'tasks', 'campaigns', 'tickets', 'products', 'services', 'invoices', 'jobs')),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  total_rows INTEGER,
  success_rows INTEGER,
  failed_rows INTEGER,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for import_jobs
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org import jobs"
  ON public.import_jobs FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create import jobs in own org"
  ON public.import_jobs FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own org import jobs"
  ON public.import_jobs FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

-- Add indexes for import_jobs
CREATE INDEX idx_import_jobs_org_id ON public.import_jobs(org_id);
CREATE INDEX idx_import_jobs_status ON public.import_jobs(status);
CREATE INDEX idx_import_jobs_created_at ON public.import_jobs(created_at DESC);
CREATE INDEX idx_import_jobs_entity_type ON public.import_jobs(entity_type);

-- ============================================
-- EXPORT JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('leads', 'deals', 'accounts', 'contacts', 'tasks', 'campaigns', 'tickets', 'products', 'services', 'invoices', 'jobs')),
  file_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  row_count INTEGER,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for export_jobs
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org export jobs"
  ON public.export_jobs FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create export jobs in own org"
  ON public.export_jobs FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own org export jobs"
  ON public.export_jobs FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

-- Add indexes for export_jobs
CREATE INDEX idx_export_jobs_org_id ON public.export_jobs(org_id);
CREATE INDEX idx_export_jobs_status ON public.export_jobs(status);
CREATE INDEX idx_export_jobs_created_at ON public.export_jobs(created_at DESC);
CREATE INDEX idx_export_jobs_entity_type ON public.export_jobs(entity_type);

-- ============================================
-- MASS OPERATION JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.mass_operation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('delete', 'update', 'merge')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('leads', 'deals', 'accounts', 'contacts', 'tasks', 'campaigns', 'tickets', 'products', 'services', 'invoices', 'jobs')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  total_records INTEGER,
  processed_records INTEGER,
  failed_records INTEGER,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for mass_operation_jobs
ALTER TABLE public.mass_operation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org mass operation jobs"
  ON public.mass_operation_jobs FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create mass operation jobs in own org"
  ON public.mass_operation_jobs FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own org mass operation jobs"
  ON public.mass_operation_jobs FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

-- Add indexes for mass_operation_jobs
CREATE INDEX idx_mass_operation_jobs_org_id ON public.mass_operation_jobs(org_id);
CREATE INDEX idx_mass_operation_jobs_status ON public.mass_operation_jobs(status);
CREATE INDEX idx_mass_operation_jobs_created_at ON public.mass_operation_jobs(created_at DESC);
CREATE INDEX idx_mass_operation_jobs_entity_type ON public.mass_operation_jobs(entity_type);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for import_jobs
DROP TRIGGER IF EXISTS update_import_jobs_modtime ON public.import_jobs;
CREATE TRIGGER update_import_jobs_modtime
  BEFORE UPDATE ON public.import_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Trigger for export_jobs
DROP TRIGGER IF EXISTS update_export_jobs_modtime ON public.export_jobs;
CREATE TRIGGER update_export_jobs_modtime
  BEFORE UPDATE ON public.export_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Trigger for mass_operation_jobs
DROP TRIGGER IF EXISTS update_mass_operation_jobs_modtime ON public.mass_operation_jobs;
CREATE TRIGGER update_mass_operation_jobs_modtime
  BEFORE UPDATE ON public.mass_operation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.import_jobs IS 'Tracks CSV import operations for audit and history';
COMMENT ON TABLE public.export_jobs IS 'Tracks CSV export operations for audit and history';
COMMENT ON TABLE public.mass_operation_jobs IS 'Tracks bulk operations (delete, update, merge) for audit and history';

COMMENT ON COLUMN public.import_jobs.org_id IS 'Organization ID - enables multi-tenancy';
COMMENT ON COLUMN public.import_jobs.entity_type IS 'Entity being imported (leads, deals, etc.)';
COMMENT ON COLUMN public.import_jobs.file_name IS 'Original filename of the uploaded CSV';
COMMENT ON COLUMN public.import_jobs.status IS 'Job status: pending, running, completed, failed';
COMMENT ON COLUMN public.import_jobs.total_rows IS 'Total rows in the CSV file';
COMMENT ON COLUMN public.import_jobs.success_rows IS 'Successfully imported rows';
COMMENT ON COLUMN public.import_jobs.failed_rows IS 'Failed rows during import';

COMMENT ON COLUMN public.export_jobs.org_id IS 'Organization ID - enables multi-tenancy';
COMMENT ON COLUMN public.export_jobs.entity_type IS 'Entity being exported (leads, deals, etc.)';
COMMENT ON COLUMN public.export_jobs.file_name IS 'Generated filename for the export';
COMMENT ON COLUMN public.export_jobs.status IS 'Job status: pending, running, completed, failed';
COMMENT ON COLUMN public.export_jobs.row_count IS 'Number of rows exported';
