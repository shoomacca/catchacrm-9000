-- Migration: Add Webhook Config and Logs Tables
-- Created: 2026-02-13
-- Purpose: Enable webhook configuration and delivery logging

-- ============================================
-- WEBHOOK_CONFIGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,

  -- Authentication
  auth_type TEXT DEFAULT 'none' CHECK (auth_type IN ('none', 'basic', 'bearer', 'api_key')),
  auth_username TEXT,
  auth_password TEXT,
  auth_token TEXT,
  auth_api_key TEXT,
  auth_api_key_header TEXT DEFAULT 'X-API-Key',

  -- Custom headers
  custom_headers JSONB,

  -- Retry configuration
  timeout_ms INTEGER DEFAULT 30000,
  retry_enabled BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  retry_delay_ms INTEGER DEFAULT 1000,
  verify_ssl BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,

  -- Ensure one config per webhook
  UNIQUE(webhook_id, org_id)
);

-- Add RLS policies for webhook_configs
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org webhook configs"
  ON public.webhook_configs FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create webhook configs in own org"
  ON public.webhook_configs FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own org webhook configs"
  ON public.webhook_configs FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own org webhook configs"
  ON public.webhook_configs FOR DELETE
  USING (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

-- Add indexes for webhook_configs
CREATE INDEX idx_webhook_configs_org_id ON public.webhook_configs(org_id);
CREATE INDEX idx_webhook_configs_webhook_id ON public.webhook_configs(webhook_id);

-- ============================================
-- WEBHOOK_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,

  -- Request details
  request_url TEXT NOT NULL,
  request_method TEXT NOT NULL,
  request_headers JSONB,
  request_body JSONB,

  -- Response details
  response_status INTEGER,
  response_body JSONB,
  response_time_ms INTEGER,

  -- Status
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamp
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);

-- Add RLS policies for webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org webhook logs"
  ON public.webhook_logs FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create webhook logs in own org"
  ON public.webhook_logs FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

-- Add indexes for webhook_logs
CREATE INDEX idx_webhook_logs_org_id ON public.webhook_logs(org_id);
CREATE INDEX idx_webhook_logs_webhook_id ON public.webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_triggered_at ON public.webhook_logs(triggered_at DESC);
CREATE INDEX idx_webhook_logs_success ON public.webhook_logs(success);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Trigger for webhook_configs
DROP TRIGGER IF EXISTS update_webhook_configs_modtime ON public.webhook_configs;
CREATE TRIGGER update_webhook_configs_modtime
  BEFORE UPDATE ON public.webhook_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Trigger for webhook_logs
DROP TRIGGER IF EXISTS update_webhook_logs_modtime ON public.webhook_logs;
CREATE TRIGGER update_webhook_logs_modtime
  BEFORE UPDATE ON public.webhook_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.webhook_configs IS 'Stores webhook configuration including auth and retry settings';
COMMENT ON TABLE public.webhook_logs IS 'Logs all webhook delivery attempts for audit and debugging';

COMMENT ON COLUMN public.webhook_configs.auth_type IS 'Authentication method: none, basic, bearer, api_key';
COMMENT ON COLUMN public.webhook_configs.retry_enabled IS 'Whether to retry failed webhook deliveries';
COMMENT ON COLUMN public.webhook_configs.retry_count IS 'Number of retry attempts for failed deliveries';
COMMENT ON COLUMN public.webhook_configs.verify_ssl IS 'Whether to verify SSL certificates';

COMMENT ON COLUMN public.webhook_logs.request_url IS 'The URL that was called';
COMMENT ON COLUMN public.webhook_logs.success IS 'Whether the delivery succeeded (HTTP 200-299)';
COMMENT ON COLUMN public.webhook_logs.response_time_ms IS 'Response time in milliseconds';
COMMENT ON COLUMN public.webhook_logs.triggered_at IS 'When the webhook was triggered';
