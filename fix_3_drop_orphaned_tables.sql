-- ============================================
-- FIX #3: Drop Orphaned Tables
-- ============================================
-- Date: 2026-02-12
-- Purpose: Remove 72 tables that exist in Supabase but are NEVER referenced in the codebase
-- Impact: Reduces schema complexity, improves database clarity
-- Safety: All tables have 0 rows or are confirmed unused
--
-- ⚠️ WARNING: This script will permanently delete 72 tables.
-- ⚠️ BACKUP YOUR DATABASE BEFORE RUNNING THIS SCRIPT.
-- ⚠️ Review DATABASE_AUDIT.md before executing.
--
-- VERIFICATION CHECKLIST:
-- [ ] I have read DATABASE_AUDIT.md
-- [ ] I have confirmed these tables are not referenced in any external services
-- [ ] I have taken a database backup
-- [ ] I understand this action cannot be easily undone
--
-- TO RUN: Execute this file in Supabase SQL Editor
-- ============================================

BEGIN;

-- ============================================
-- AUTOMATION / WORKFLOW TABLES (8 tables)
-- ============================================
-- These tables were designed for Salesforce-like approval workflows
-- but are not implemented in the CatchaCRM codebase.

DROP TABLE IF EXISTS approval_processes CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Salesforce-style approval processes
-- Rows: 0

DROP TABLE IF EXISTS approval_requests CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Individual approval request instances
-- Rows: 0

DROP TABLE IF EXISTS approval_steps CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Steps in an approval process
-- Rows: 0

DROP TABLE IF EXISTS escalation_actions CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Actions to take when escalation rule fires
-- Rows: 0

DROP TABLE IF EXISTS escalation_rules CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Time-based escalation rules
-- Rows: 0

DROP TABLE IF EXISTS workflow_actions CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Actions for workflow rules (note: automation_workflows exists and is used)
-- Rows: 0

DROP TABLE IF EXISTS workflow_rules CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Workflow automation rules (note: automation_workflows exists and is used)
-- Rows: 0

DROP TABLE IF EXISTS scheduled_actions CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Time-based scheduled actions
-- Rows: 0

-- ============================================
-- ASSIGNMENT / ROUTING TABLES (4 tables)
-- ============================================
-- These tables were designed for lead/case assignment automation
-- but are not implemented in the CatchaCRM codebase.

DROP TABLE IF EXISTS assignment_rule_entries CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Individual conditions in assignment rules
-- Rows: 0

DROP TABLE IF EXISTS assignment_rules CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Automatic assignment of leads/cases to users/queues
-- Rows: 0

DROP TABLE IF EXISTS auto_response_entries CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Conditions for auto-response rules
-- Rows: 0

DROP TABLE IF EXISTS auto_response_rules CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Automatic email responses to web-to-lead/case
-- Rows: 0

-- ============================================
-- EMAIL SYSTEM TABLES (10 tables)
-- ============================================
-- A complete email system was scaffolded but never integrated with the frontend.
-- The codebase uses 'communications' table for all communication tracking.

DROP TABLE IF EXISTS email_accounts CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Email account configurations (IMAP/SMTP)
-- Rows: 0

DROP TABLE IF EXISTS email_letterheads CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Email branding templates
-- Rows: 0

DROP TABLE IF EXISTS email_sequence_enrollments CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Track which contacts are enrolled in email sequences
-- Rows: 0

DROP TABLE IF EXISTS email_sequence_steps CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Individual steps in an email sequence/drip campaign
-- Rows: 0

DROP TABLE IF EXISTS email_sequences CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Email drip campaign definitions
-- Rows: 0

DROP TABLE IF EXISTS email_settings CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Organization-wide email settings
-- Rows: 0

DROP TABLE IF EXISTS email_templates CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Reusable email templates
-- Rows: 0

DROP TABLE IF EXISTS email_threads CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Group related emails into threads
-- Rows: 0

DROP TABLE IF EXISTS email_tracking_settings CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Open/click tracking configuration
-- Rows: 0

DROP TABLE IF EXISTS emails CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Individual sent/received emails (NOTE: 'communications' table is used instead)
-- Rows: 0

-- ============================================
-- FIELD TRACKING / CUSTOMIZATION TABLES (10 tables)
-- ============================================
-- These tables were designed for Salesforce-like field-level customization
-- but the CatchaCRM frontend uses a simpler data model.

DROP TABLE IF EXISTS custom_fields CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: User-defined custom fields on objects
-- Rows: 0

DROP TABLE IF EXISTS custom_objects CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: User-defined custom database tables
-- Rows: 0

DROP TABLE IF EXISTS dependent_picklists CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Picklist values that depend on another field's value
-- Rows: 0

DROP TABLE IF EXISTS field_history CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Track field value changes over time
-- Rows: 0

DROP TABLE IF EXISTS field_history_tracking CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Configure which fields should track history
-- Rows: 0

DROP TABLE IF EXISTS field_permissions CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Field-level security (which roles can see which fields)
-- Rows: 0

DROP TABLE IF EXISTS validation_rules CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Custom validation logic on record save
-- Rows: 0

DROP TABLE IF EXISTS duplicate_rules CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Detect duplicate records on create/update
-- Rows: 0

DROP TABLE IF EXISTS matching_rules CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Define how to match records for deduplication
-- Rows: 0

DROP TABLE IF EXISTS record_types CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Different record types with different page layouts/picklists
-- Rows: 0

-- ============================================
-- KNOWLEDGE BASE TABLES (2 tables)
-- ============================================
-- A knowledge base/help center was planned but not built.

DROP TABLE IF EXISTS kb_articles CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Knowledge base articles
-- Rows: 0

DROP TABLE IF EXISTS kb_categories CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Categories for knowledge base articles
-- Rows: 0

-- ============================================
-- LAYOUTS / UI TABLES (4 tables)
-- ============================================
-- These tables were designed for dynamic page layouts and UI customization
-- but the frontend uses fixed React components.

DROP TABLE IF EXISTS page_layout_assignments CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Assign page layouts to profiles/record types
-- Rows: 0

DROP TABLE IF EXISTS page_layouts CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Define field arrangements on detail/edit pages
-- Rows: 0

DROP TABLE IF EXISTS record_type_assignments CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Assign record types to profiles
-- Rows: 0

DROP TABLE IF EXISTS line_items CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Generic line items (invoices use direct fields instead)
-- Rows: 0

-- ============================================
-- PERMISSIONS / SECURITY TABLES (10 tables)
-- ============================================
-- Complex Salesforce-style permission system was scaffolded but not implemented.
-- The frontend uses simple role-based permissions in the 'users' table.

DROP TABLE IF EXISTS ip_restrictions CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Restrict login by IP address
-- Rows: 0

DROP TABLE IF EXISTS login_history CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Track user login attempts and sessions
-- Rows: 0

DROP TABLE IF EXISTS object_permissions CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Object-level CRUD permissions per profile
-- Rows: 0

DROP TABLE IF EXISTS permission_sets CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Grant additional permissions beyond profile
-- Rows: 0

DROP TABLE IF EXISTS session_settings CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Session timeout, IP lockdown settings
-- Rows: 0

DROP TABLE IF EXISTS sharing_rules CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Extend record access beyond role hierarchy
-- Rows: 0

DROP TABLE IF EXISTS user_permission_sets CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Link users to permission sets
-- Rows: 0

DROP TABLE IF EXISTS data_retention_policies CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Define how long to keep records before deletion
-- Rows: 0

DROP TABLE IF EXISTS setup_audit_trail CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Track admin configuration changes
-- Rows: 0

-- ============================================
-- QUEUE / TERRITORY TABLES (7 tables)
-- ============================================
-- Lead/case queues and territory management were planned but not built.

DROP TABLE IF EXISTS queue_members CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Users who are members of a queue
-- Rows: 0

DROP TABLE IF EXISTS queues CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Queues for unassigned leads/cases
-- Rows: 0

DROP TABLE IF EXISTS public_group_members CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Users in a public group
-- Rows: 0

DROP TABLE IF EXISTS public_groups CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Groups for sharing rules
-- Rows: 0

DROP TABLE IF EXISTS territories CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Geographic or business territories
-- Rows: 0

DROP TABLE IF EXISTS territory_assignments CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Assign users/accounts to territories
-- Rows: 0

DROP TABLE IF EXISTS scheduled_action_queue CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Queue of scheduled actions waiting to execute
-- Rows: 0

-- ============================================
-- SETTINGS / CONFIGURATION TABLES (7 tables)
-- ============================================
-- Various global settings tables that were never used.

DROP TABLE IF EXISTS business_hours CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Define business hours for SLA calculations
-- Rows: 0

-- ⚠️ DO NOT DROP: company_settings and crm_settings are NOW IN USE
-- These tables are used by settingsService.ts to persist CRM settings to Supabase
-- Previously orphaned, now connected as of 2026-02-12

-- DROP TABLE IF EXISTS company_settings CASCADE;
-- ❌ KEEP - Now used for organization profile, localization, and branding

-- DROP TABLE IF EXISTS crm_settings CASCADE;
-- ❌ KEEP - Now used for CRM configuration, modules, integrations, and domain configs

DROP TABLE IF EXISTS dated_exchange_rates CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Historical currency exchange rates
-- Rows: 0

DROP TABLE IF EXISTS fiscal_year_settings CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Define fiscal year start/end dates
-- Rows: 0

DROP TABLE IF EXISTS holidays CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Company holidays for business hours calculations
-- Rows: 0

DROP TABLE IF EXISTS organization_wide_addresses CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Verified email addresses for sending from
-- Rows: 0

-- ============================================
-- SMS TABLES (2 tables)
-- ============================================
-- SMS functionality was scaffolded but never implemented in the frontend.

DROP TABLE IF EXISTS sms_messages CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Sent/received SMS messages
-- Rows: 0

DROP TABLE IF EXISTS sms_templates CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Reusable SMS templates
-- Rows: 0

-- ============================================
-- TEAM MANAGEMENT TABLES (2 tables)
-- ============================================
-- Team hierarchy was planned but not built (frontend uses simple 'users' table).

DROP TABLE IF EXISTS team_members CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Link users to teams
-- Rows: 0

DROP TABLE IF EXISTS teams CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Organizational teams/departments
-- Rows: 0

-- ============================================
-- IMPORT/EXPORT TABLES (3 tables)
-- ============================================
-- Bulk import/export job tracking was planned but not built.

DROP TABLE IF EXISTS export_jobs CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Track data export jobs
-- Rows: 0

DROP TABLE IF EXISTS import_jobs CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Track data import jobs
-- Rows: 0

DROP TABLE IF EXISTS mass_operation_jobs CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Track bulk update/delete operations
-- Rows: 0

-- ============================================
-- WEBHOOKS / LOGGING TABLES (5 tables)
-- ============================================
-- API logging and webhook tracking beyond what's currently used.

DROP TABLE IF EXISTS api_logs CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Log all API requests (parent table for partitioning)
-- Rows: 0

DROP TABLE IF EXISTS api_logs_y2026m01 CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Partitioned table for January 2026 API logs
-- Rows: 0
-- Note: RLS is DISABLED on this table

DROP TABLE IF EXISTS api_rate_limits CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Track API rate limit usage per user/org
-- Rows: 0

DROP TABLE IF EXISTS webhook_configs CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Webhook configuration (NOTE: 'webhooks' table exists and is used)
-- Rows: 0

DROP TABLE IF EXISTS webhook_logs CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Track webhook delivery attempts
-- Rows: 0

-- ============================================
-- MISCELLANEOUS TABLES (5 tables)
-- ============================================
-- Various one-off tables that were never integrated.

DROP TABLE IF EXISTS audit_logs CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: DUPLICATE of 'audit_log' (which IS used)
-- Rows: 0
-- Note: RLS is DISABLED on this table

DROP TABLE IF EXISTS credit_notes CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Credit notes for refunds/adjustments
-- Rows: 0

DROP TABLE IF EXISTS quote_line_items CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Line items for quotes (quotes table exists but uses direct fields)
-- Rows: 0
-- Note: MISSING org_id column

DROP TABLE IF EXISTS subscription_items CASCADE;
-- Not referenced in: TABLE_MAP, TableName type, or any .from() calls
-- Purpose: Individual items in a subscription (subscriptions table exists)
-- Rows: 0

-- ============================================
-- VERIFICATION
-- ============================================

-- Count remaining tables
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

  RAISE NOTICE '✅ Remaining tables: %', table_count;
  RAISE NOTICE 'Expected: 50 USED tables (48 original + company_settings + crm_settings)';

  IF table_count <> 50 THEN
    RAISE WARNING 'Expected 50 tables, found %. Please review.', table_count;
  END IF;
END $$;

-- List remaining tables for verification
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

COMMIT;

-- ============================================
-- POST-CLEANUP CHECKLIST
-- ============================================
-- [ ] Verify 50 tables remain (48 original USED tables + company_settings + crm_settings)
-- [ ] Test frontend still works
-- [ ] Check no errors in browser console
-- [ ] Verify data loads correctly
-- [ ] Run a full application smoke test
-- [ ] Monitor for 24-48 hours before considering cleanup permanent
