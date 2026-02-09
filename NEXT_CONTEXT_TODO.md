# Next Context: Supabase Schema Audit & Alignment

## What We Completed in This Session

✅ Added Import/Export tab to Settings
✅ Created BulkActionsBar component
✅ Implemented bulk actions on Leads page
✅ Created Matrix-themed CSV import files
✅ Discovered schema mismatches

## What Needs to Be Done Next

### Critical Issue Identified
**The Supabase database schema does NOT match the frontend TypeScript types.**

Example mismatches we found:
- `accounts.status` - Column doesn't exist in DB
- `leads.name` - Column doesn't exist (might be `first_name`/`last_name` instead)
- `deals.stage` - Enum values don't match ("negotiation" rejected, DB expects different values)
- `tasks.priority` - Enum values don't match ("high" rejected)
- `products.price` - Column doesn't exist (might be `unit_price`)
- Missing tables: jobs, crews, equipment, zones, inventory, warehouses, purchase_orders

### The Big Job (4-5 hours)

#### Step 1: Full Schema Discovery (30 min)
1. Create script to query Supabase REST API for complete schema
2. Get all table names, column names, data types, enum values
3. Document current state in `SUPABASE_SCHEMA_CURRENT.md`

#### Step 2: Compare with Frontend (45 min)
1. Compare all TypeScript interfaces in `src/types.ts` with DB schema
2. Create detailed mismatch report showing:
   - Missing columns in DB
   - Wrong column names (frontend expects one thing, DB has another)
   - Wrong enum values
   - Missing tables
3. Output: `SCHEMA_MISMATCH_REPORT.md`

#### Step 3: Create Migration SQL (30 min)
Based on mismatches, create `supabase/migration_schema_alignment.sql`:
- ADD missing columns to existing tables
- RENAME columns to match frontend (e.g., `unit_price` → `price`)
- CREATE missing tables (jobs, crews, equipment, etc.)
- FIX enum types to match frontend expectations
- ADD necessary indexes

#### Step 4: Apply Migration (1 hour)
1. **BACKUP DATABASE FIRST!**
2. Test migration on dev database if available
3. Apply via Supabase Dashboard → SQL Editor
4. Verify all tables/columns created successfully

#### Step 5: Import Matrix Data (30 min)
1. Fix `scripts/smart-load-data.js` to use correct column names
2. Run import script to load all Matrix mock data
3. Verify data in Supabase dashboard
4. Verify data appears in UI

#### Step 6: Test Everything (1 hour)
- Test all module pages (Leads, Contacts, Accounts, etc.)
- Test CRUD operations (Create, Read, Update, Delete)
- Test bulk operations
- Test CSV import/export
- Fix any remaining issues

#### Step 7: Document Results (30 min)
Create final audit report with:
- What was fixed
- What data was imported
- Any remaining issues
- Updated architecture diagram

## Files Already Created (Ready to Use)

1. **`SUPABASE_AUDIT_PLAN.md`** - Complete audit plan with detailed steps
2. **`data/matrix_*.csv`** - Ready-to-import Matrix mock data (5 files)
3. **`BULK_OPERATIONS_IMPLEMENTATION.md`** - What we built today
4. **`.env`** - Supabase credentials already configured
5. **`scripts/smart-load-data.js`** - Data loader (needs updating for schema)

## Files to Create in Next Context

1. **`scripts/full-schema-discovery.js`** - Query Supabase for complete schema
2. **`scripts/compare-schemas.js`** - Compare DB vs Frontend types
3. **`SCHEMA_MISMATCH_REPORT.md`** - Detailed mismatch report
4. **`supabase/migration_schema_alignment.sql`** - SQL to align schemas
5. **`SUPABASE_SCHEMA_CURRENT.md`** - Current DB schema documentation
6. **`SUPABASE_AUDIT_COMPLETE.md`** - Final audit report

## Quick Start Command for Next Context

```bash
# Read the audit plan first
cat SUPABASE_AUDIT_PLAN.md

# Then follow Phase 1 → Phase 5
```

## Key Decision Made

**Approach: Update Database to Match Frontend**

Why?
- Frontend types are well-architected and consistent
- Matrix mock data already matches frontend schema
- Database schema appears to be from different project version
- Fewer changes overall vs updating frontend everywhere

## Known Schema Issues to Fix

Based on testing, we know these need fixing:

### Accounts Table
```sql
ALTER TABLE accounts ADD COLUMN status TEXT;
ALTER TABLE accounts ADD COLUMN revenue DECIMAL(12,2);
ALTER TABLE accounts ADD COLUMN employees INTEGER;
```

### Leads Table
```sql
ALTER TABLE leads ADD COLUMN name TEXT;  -- Or merge first_name/last_name
```

### Deals Table
```sql
-- Fix enum: needs to accept "negotiation", "proposal", "qualification"
ALTER TYPE deal_stage ADD VALUE 'negotiation';
ALTER TYPE deal_stage ADD VALUE 'proposal';
ALTER TYPE deal_stage ADD VALUE 'qualification';
```

### Tasks Table
```sql
-- Fix enum: needs to accept "high", "medium", "low", "critical"
ALTER TYPE task_priority ADD VALUE 'high';
ALTER TYPE task_priority ADD VALUE 'critical';
```

### Products Table
```sql
ALTER TABLE products ADD COLUMN price DECIMAL(12,2);
-- Or rename: ALTER TABLE products RENAME COLUMN unit_price TO price;
```

### Missing Tables
```sql
CREATE TABLE jobs (...);
CREATE TABLE crews (...);
CREATE TABLE equipment (...);
CREATE TABLE zones (...);
CREATE TABLE inventory (...);
CREATE TABLE warehouses (...);
CREATE TABLE purchase_orders (...);
CREATE TABLE procurement (...);
```

## Success Criteria

When done, you should be able to:
1. ✅ Import all Matrix CSV files without errors
2. ✅ See Matrix data in all modules (Neo, Morpheus, Trinity, etc.)
3. ✅ Create/edit/delete records in all modules
4. ✅ No console errors about missing fields
5. ✅ Bulk operations work perfectly

## Estimated Time: 4-5 hours

This is a solid afternoon's work. Take breaks between phases!

---

**Status**: Ready to start fresh in new context
**Priority**: High - Blocks full CRM functionality
**Complexity**: Medium - Mostly SQL and data mapping
