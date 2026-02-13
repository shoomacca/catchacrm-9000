-- ============================================
-- FIX #2: Apply RLS Policies
-- ============================================
-- Date: 2026-02-12
-- Purpose: Ensure all USED tables have proper RLS policies
-- Impact: None - all USED tables already have RLS enabled
--
-- Review DATABASE_AUDIT.md before running.
-- ============================================

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that user_org_ids() function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'user_org_ids'
  ) THEN
    RAISE EXCEPTION 'user_org_ids() function does not exist. Cannot apply RLS policies.';
  END IF;
END $$;

-- ============================================
-- RLS STATUS - CURRENT STATE
-- ============================================
-- All 48 USED tables: RLS ENABLED ✅
-- 2 ORPHANED tables with RLS DISABLED:
--   - api_logs_y2026m01 (partitioned, orphaned)
--   - audit_logs (duplicate of audit_log, orphaned)

-- ============================================
-- ORPHANED TABLES - RLS DISABLED
-- ============================================

-- These tables have RLS disabled but are ORPHANED (not used in code).
-- RECOMMENDATION: DROP these tables instead of enabling RLS.
-- See fix_3_drop_orphaned_tables.sql

-- api_logs_y2026m01
-- ALTER TABLE api_logs_y2026m01 ENABLE ROW LEVEL SECURITY;

-- audit_logs (duplicate of audit_log)
-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- EXAMPLE RLS POLICY (for reference)
-- ============================================
-- This is the standard RLS policy pattern used across all USED tables.
-- ALL USED TABLES already have these policies applied.
--
-- CREATE POLICY "Users can view their org's records"
-- ON [table_name]
-- FOR SELECT
-- USING (org_id IN (SELECT user_org_ids()));
--
-- CREATE POLICY "Users can create records in their org"
-- ON [table_name]
-- FOR INSERT
-- WITH CHECK (org_id IN (SELECT user_org_ids()));
--
-- CREATE POLICY "Users can update their org's records"
-- ON [table_name]
-- FOR UPDATE
-- USING (org_id IN (SELECT user_org_ids()));
--
-- CREATE POLICY "Users can delete their org's records"
-- ON [table_name]
-- FOR DELETE
-- USING (org_id IN (SELECT user_org_ids()));

-- ============================================
-- VERIFY RLS POLICIES EXIST
-- ============================================

-- Check RLS policies on all USED tables
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'accounts', 'contacts', 'leads', 'deals', 'tasks', 'tickets', 'campaigns',
  'users', 'calendar_events', 'invoices', 'quotes', 'products', 'services',
  'subscriptions', 'payments', 'communications', 'conversations',
  'chat_messages', 'chat_widgets', 'documents', 'notifications',
  'ticket_messages', 'crews', 'jobs', 'zones', 'equipment',
  'inventory_items', 'warehouses', 'warehouse_locations',
  'dispatch_alerts', 'tactical_queue', 'bank_transactions',
  'expenses', 'purchase_orders', 'currencies', 'reviews',
  'referral_rewards', 'inbound_forms', 'calculators',
  'automation_workflows', 'webhooks', 'industry_templates',
  'rfqs', 'supplier_quotes', 'audit_log', 'roles',
  'organizations', 'organization_users'
)
ORDER BY tablename, policyname;

-- ============================================
-- SUMMARY
-- ============================================
-- ✅ NO ACTION REQUIRED
-- All USED tables already have RLS enabled with proper policies.
-- The 2 tables with RLS disabled (api_logs_y2026m01, audit_logs)
-- are ORPHANED and should be dropped via fix_3_drop_orphaned_tables.sql.
