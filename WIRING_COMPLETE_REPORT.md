# CatchaCRM Wiring Complete - Smoke Test Report
**Date:** 2026-02-13
**Test Type:** READ-ONLY Smoke Test
**Scope:** 11 Phases of UI-to-Supabase Wiring

---

## Executive Summary

| Metric | Result | Status |
|--------|--------|--------|
| **TypeScript Errors** | 0 | ✅ PASS |
| **Build Status** | Success | ✅ PASS |
| **Tables Created** | 20/20 | ✅ PASS |
| **Tables with org_id** | 20/20 | ✅ PASS |
| **Tables with Data** | 5/20 | ℹ️ INFO |
| **RLS Enabled** | Unknown | ⚠️ NEEDS MANUAL CHECK |
| **allow_all Policies** | Unknown | ⚠️ NEEDS MANUAL CHECK |
| **Critical Bugs** | 1 | 🔴 BLOCKER |

---

## 1. TypeScript Health Check ✅

**Command:** `npx tsc --noEmit`

**Result:** ✅ **0 errors**

All TypeScript types are valid. No compilation errors detected.

---

## 2. Build Status ✅

**Command:** `npm run build`

**Result:** ✅ **BUILD SUCCESSFUL**

```
✓ built in 28.04s
dist/index.html                      2.14 kB │ gzip:   0.96 kB
dist/assets/index-GrpdleKl.css      98.10 kB │ gzip:  18.79 kB
dist/assets/index-Cis5i8ax.js    2,455.69 kB │ gzip: 556.17 kB
```

**⚠️ Warning:** Chunk size exceeds 500 kB (not a blocker, but consider code-splitting)

---

## 3. Table Status (20 Tables Checked)

### ✅ All Tables Exist with org_id

| Table | Exists | org_id | RLS | Rows | Notes |
|-------|--------|--------|-----|------|-------|
| company_settings | ✅ | YES | ? | 1 | ✅ Has data |
| crm_settings | ✅ | YES | ? | 1 | ✅ Has data |
| email_templates | ✅ | YES | ? | 0 | Empty (waiting for data) |
| sms_templates | ✅ | YES | ? | 0 | Empty (waiting for data) |
| roles | ✅ | YES | ? | 6 | ✅ Has data |
| teams | ✅ | YES | ? | 0 | Empty (waiting for data) |
| team_members | ✅ | YES | ? | 0 | Empty (waiting for data) |
| currencies | ✅ | YES | ? | 1 | ✅ Has data |
| import_jobs | ✅ | YES | ? | 0 | Empty (waiting for jobs) |
| export_jobs | ✅ | YES | ? | 0 | Empty (waiting for jobs) |
| webhook_configs | ✅ | YES | ? | 0 | Empty (waiting for configs) |
| webhook_logs | ✅ | YES | ? | 0 | Empty (waiting for logs) |
| kb_articles | ✅ | YES | ? | 0 | Empty (waiting for data) |
| kb_categories | ✅ | YES | ? | 0 | Empty (waiting for data) |
| business_hours | ✅ | YES | ? | 1 | ✅ Has data |
| holidays | ✅ | YES | ? | 0 | Empty (waiting for data) |
| custom_objects | ✅ | YES | ⚠️ | 0 | Empty + RLS bug (see Issue #2) |
| login_history | ✅ | YES | ? | 0 | Empty (waiting for logins) |
| duplicate_rules | ✅ | YES | ⚠️ | 0 | Empty + RLS bug (see Issue #2) |
| matching_rules | ✅ | YES | ⚠️ | 0 | Empty + RLS bug (see Issue #2) |

**Summary:**
- ✅ 20/20 tables exist
- ✅ 20/20 tables have org_id
- ✅ 5/20 tables have data (company_settings, crm_settings, roles, currencies, business_hours)
- ⚠️ 3/20 tables have RLS policy bugs (custom_objects, duplicate_rules, matching_rules)

---

## 4. Critical Issues Found 🔴

### ~~Issue #1: Missing org_id on Most Tables~~ ✅ RESOLVED

**Status:** ✅ **FALSE ALARM** - All 20 tables have org_id columns.

**Root Cause:** Original smoke test script (`smoke-test.js`) had a bug - it only checked for org_id when tables had data. Improved smoke test (`smoke-test-v2.js`) correctly detects org_id even on empty tables.

**Verification:** All tables confirmed to have org_id via direct column selection query.

### Issue #2: RLS Policy Column Mismatch (Critical Bug) 🔴 **CONFIRMED**

**Migration files found for:**
- `custom_objects` (supabase/migrations/20260212231045_create_custom_objects.sql)
- `duplicate_rules` & `matching_rules` (supabase/migrations/20260213000001_create_duplicate_detection.sql)

**Bug:** RLS policies reference `organization_id` but `organization_users` table uses `org_id`:

```sql
-- FROM MIGRATION FILE (INCORRECT):
USING (org_id IN (
  SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
))
```

**Expected:**
```sql
USING (org_id IN (
  SELECT org_id FROM organization_users WHERE user_id = auth.uid()
))
```

**Verification Result:** ✅ **BUG CONFIRMED**
- organization_users table columns: `id, org_id, user_id, role, active, created_at, updated_at`
- Query with `org_id`: ✅ Works (7 rows)
- Query with `organization_id`: ❌ **FAILS** (column does not exist)

**Impact:** RLS policies will FAIL when executed, causing query errors or allowing unauthorized access.

---

## 5. Migration Status

### ✅ Migrations Found (2)

1. **20260212231045_create_custom_objects.sql**
   - Creates: custom_objects table
   - Status: ⚠️ Has RLS policy bug (organization_id vs org_id)

2. **20260213000001_create_duplicate_detection.sql**
   - Creates: duplicate_rules, matching_rules
   - Status: ⚠️ Has RLS policy bug (organization_id vs org_id)

### ⚠️ Migrations Needed (18 tables)

The following tables exist in Supabase but have NO migration files in `supabase/migrations/`:

1. email_templates
2. sms_templates
3. teams
4. team_members
5. import_jobs
6. export_jobs
7. webhook_configs
8. webhook_logs
9. kb_articles
10. kb_categories
11. holidays
12. login_history

**Note:** company_settings and crm_settings have migration file `migration_settings_tables.sql` (NOT in migrations folder).

### 📋 Standalone Migration Files (Need to be Run)

These migrations exist but are NOT in the `supabase/migrations/` folder:

1. **migration_settings_tables.sql**
   - Creates: company_settings, crm_settings
   - Status: ✅ Uses user_org_ids() helper (correct pattern)
   - Location: Root directory (should be in supabase/migrations/)

---

## 6. RLS Policy Check ⚠️

**Status:** MANUAL CHECK REQUIRED

Run these queries in Supabase SQL Editor:

### Query 1: Check RLS is Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'company_settings','crm_settings','email_templates','sms_templates','roles',
    'teams','team_members','currencies','import_jobs','export_jobs',
    'webhook_configs','webhook_logs','kb_articles','kb_categories',
    'business_hours','holidays','custom_objects','login_history',
    'duplicate_rules','matching_rules'
  )
ORDER BY tablename;
```

### Query 2: Check Policies Exist

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN (
  'company_settings','crm_settings','email_templates','sms_templates','roles',
  'teams','team_members','currencies','import_jobs','export_jobs',
  'webhook_configs','webhook_logs','kb_articles','kb_categories',
  'business_hours','holidays','custom_objects','login_history',
  'duplicate_rules','matching_rules'
)
ORDER BY tablename, policyname;
```

### Query 3: Find allow_all Policies (Security Holes)

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE policyname LIKE '%allow_all%'
ORDER BY tablename;
```

**Expected Result:** 0 allow_all policies (any found = security hole)

---

## 7. Missing Migration Files (Documentation Gap)

**Status:** All tables already exist in Supabase with org_id, but migration files are missing for documentation.

The following tables exist in Supabase but have NO migration files in `supabase/migrations/`:

### High Priority (Create migration files for documentation)

1. **email_templates** - Need migration file with:
   - CREATE TABLE statement
   - RLS policies
   - Indexes on org_id

2. **sms_templates** - Need migration file with:
   - CREATE TABLE statement
   - RLS policies
   - Indexes on org_id

3. **teams** - Need migration file with:
   - CREATE TABLE statement
   - RLS policies
   - Indexes on org_id

4. **team_members** - Need migration file with:
   - CREATE TABLE statement
   - RLS policies
   - Indexes on org_id

5. **kb_articles** - Need migration file with:
   - CREATE TABLE statement
   - RLS policies
   - Indexes on org_id

6. **kb_categories** - Need migration file with:
   - CREATE TABLE statement
   - RLS policies
   - Indexes on org_id

### Medium Priority (System/Admin)

7. **import_jobs**
8. **export_jobs**
9. **webhook_configs**
10. **webhook_logs**
11. **login_history**
12. **holidays**

**Note:** These tables were likely created via the large COMPLETE_REBUILD.sql or similar files, but should have individual migration files for version control and documentation.

---

## 8. Recommended Actions

### Immediate (Before Production) 🔴 BLOCKER

1. **Fix RLS Policy Bug in Migrations** (CRITICAL)
   - File: `supabase/migrations/20260212231045_create_custom_objects.sql`
   - File: `supabase/migrations/20260213000001_create_duplicate_detection.sql`
   - Change: `SELECT organization_id FROM organization_users` → `SELECT org_id FROM organization_users`
   - Impact: Without this fix, RLS policies will FAIL and block all queries to these tables

2. **Re-run Fixed Migrations in Supabase**
   - Drop existing policies
   - Run corrected migration files
   - Verify policies work with test queries

3. **Run Manual RLS Verification Queries**
   - Execute all 3 queries in section 6
   - Document which tables have RLS enabled
   - Identify any allow_all policies

### Before Next Phase (Documentation)

4. **Move migration_settings_tables.sql to migrations/**
   - Current: Root directory
   - Target: `supabase/migrations/20260213100000_create_settings_tables.sql`
   - Keeps all migrations in one location

5. **Create Missing Migration Files (for documentation)**
   - Extract CREATE TABLE statements from COMPLETE_REBUILD.sql or database
   - Create individual migration files for 12 tables
   - Add proper RLS policies to each

6. **Enable RLS on All Tables**
   - Verify RLS enabled on all 20 tables
   - Create org-isolation policies for tables that lack them
   - Test with multi-tenant scenario

7. **Remove any allow_all Policies**
   - Query for them
   - Replace with proper org-scoped policies

---

## 9. Database Schema Verification Queries

Run these in Supabase SQL Editor to verify schema:

### Check org_id Column Exists

```sql
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'company_settings','crm_settings','email_templates','sms_templates','roles',
    'teams','team_members','currencies','import_jobs','export_jobs',
    'webhook_configs','webhook_logs','kb_articles','kb_categories',
    'business_hours','holidays','custom_objects','login_history',
    'duplicate_rules','matching_rules'
  )
  AND column_name = 'org_id'
ORDER BY table_name;
```

### Check Foreign Keys to organizations

```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND ccu.table_name = 'organizations'
  AND tc.table_name IN (
    'company_settings','crm_settings','email_templates','sms_templates','roles',
    'teams','team_members','currencies','import_jobs','export_jobs',
    'webhook_configs','webhook_logs','kb_articles','kb_categories',
    'business_hours','holidays','custom_objects','login_history',
    'duplicate_rules','matching_rules'
  )
ORDER BY tc.table_name;
```

---

## 10. Test Artifacts

**Smoke Test Scripts:**

1. `smoke-test.js` (v1) - Had bug, only detected org_id on tables with data
   - Result: 5/20 tables reported with org_id (INCORRECT)

2. `smoke-test-v2.js` (v2) - Fixed bug, detects org_id on empty tables
   - Result: 20/20 tables with org_id (CORRECT)

**Verification Scripts:**

1. `verify-org-users.js` - Confirmed organization_users uses org_id, not organization_id
   - Result: Confirmed RLS policy bug in migration files

2. `verify-custom-objects.js` - Verified custom_objects, duplicate_rules, matching_rules have org_id
   - Result: All 3 tables have org_id column

**Final Smoke Test Output (v2):**
```
=== CATCHACRM SMOKE TEST V2 (Improved) ===
Tables checked: 20
Tables exist: 20/20
Tables with org_id: 20/20
Tables with data: 5/20
```

---

## Conclusion

**Overall Status:** ⚠️ **MOSTLY FUNCTIONAL - ONE CRITICAL BUG**

**Good News:**
- ✅ TypeScript compiles clean (0 errors)
- ✅ Build succeeds
- ✅ All 20 tables exist in database
- ✅ All 20 tables have org_id columns
- ✅ 5 tables have data (initial settings: company_settings, crm_settings, roles, currencies, business_hours)

**Critical Issue (BLOCKER):**
- 🔴 **RLS policy bug in 2 migration files** - Queries `organization_id` instead of `org_id` from organization_users table
  - Affects: custom_objects, duplicate_rules, matching_rules
  - Impact: RLS policies will FAIL when executed
  - Status: Bug confirmed via database verification
  - Fix: 2-line change in each migration file

**Medium Priority Issues:**
- ⚠️ RLS status unknown for most tables (need manual verification)
- ⚠️ Migration files not standardized (some in root, some in migrations/)
- ⚠️ No migration files for 12 tables (they exist in DB but lack version-controlled migration files)

**Next Steps:**
1. 🔴 **URGENT:** Fix RLS policy bug in 2 migration files (organization_id → org_id)
2. Re-run fixed migrations in Supabase
3. Run manual RLS verification queries (section 6)
4. Create missing migration files for documentation
5. Verify no allow_all policies exist

**Blocker for Production:** RLS policy bug must be fixed before deploying to production, or custom_objects/duplicate_rules/matching_rules will fail.

---

**Report Generated:** 2026-02-13
**By:** Claude Code Smoke Test
**Test Mode:** READ-ONLY (No modifications made)
