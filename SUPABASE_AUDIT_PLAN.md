# Supabase Schema Audit Plan

## Objective
Ensure all frontend TypeScript types, CRM context operations, and UI modules match the actual Supabase database schema.

## Current Status

### What We Know
- ✅ Supabase connection configured (`.env` file exists)
- ✅ Some tables exist: accounts, contacts, leads, deals, tasks, campaigns, tickets, products, services, invoices, calendar_events, communications, users, organizations
- ❌ Many tables are missing: jobs, crews, equipment, zones, inventory, warehouses, purchase_orders, procurement
- ❌ Column name mismatches discovered:
  - `accounts` - missing `status` column
  - `leads` - missing `name` column (might be `first_name`/`last_name`)
  - `deals` - enum mismatch on `stage` column
  - `tasks` - enum mismatch on `priority` column
  - `tickets` - enum mismatch on `priority` column
  - `products` - missing `price` column (might be `unit_price`)
  - `services` - missing `price` column
  - `calendar_events` - missing `start_time`/`end_time` columns

### What We Imported Successfully
- ✅ Contacts - 5 rows (Matrix characters)
- ✅ Campaigns - 3 rows
- ❌ Everything else failed due to schema mismatches

## Audit Tasks

### Phase 1: Discovery (30 min)

#### Task 1.1: Get Complete Table List
```bash
node scripts/discover-schema.js
```
- List ALL tables in public schema
- Count rows in each table
- Identify which tables have data

#### Task 1.2: Get Table Schemas
For each table, discover:
- Column names (exact spelling, case)
- Data types (text, uuid, integer, decimal, boolean, timestamptz, etc.)
- Enum values (for status, priority, stage fields)
- Required vs optional columns
- Foreign key relationships

Create a script that queries the Supabase REST API schema endpoint:
```javascript
// GET https://[project].supabase.co/rest/v1/ (OPTIONS request)
// Returns OpenAPI schema with all table definitions
```

#### Task 1.3: Document Current State
Create `SUPABASE_SCHEMA_CURRENT.md` with:
- Table name
- All columns with types
- Sample data (1 row from each table)
- Enum constraints
- Required fields

### Phase 2: Compare with Frontend (45 min)

#### Task 2.1: Review TypeScript Types
Check `src/types.ts` for all interfaces:
- Lead, Deal, Account, Contact, Task, Campaign, Ticket
- Job, Crew, Equipment, Zone, Inventory, Warehouse
- Product, Service, Invoice, Quote, Subscription
- CalendarEvent, Communication, User, etc.

#### Task 2.2: Create Mismatch Report
For each entity type, document:
- ✅ **Matching fields** - Frontend field matches DB column
- ⚠️ **Name mismatches** - Field exists but different name (e.g., `price` vs `unit_price`)
- ❌ **Missing in DB** - Frontend expects field that doesn't exist in DB
- ❌ **Missing in Frontend** - DB has column not used in frontend
- ⚠️ **Type mismatches** - Field exists but wrong type (string vs number)
- ⚠️ **Enum mismatches** - Field exists but different enum values

#### Task 2.3: Review CRM Context
Check `src/context/CRMContext.tsx`:
- What fields does `upsertRecord` try to save?
- What queries does the app make?
- Are there any hardcoded field names?

### Phase 3: Create Migration Plan (30 min)

#### Decision Points

For each mismatch, decide:

**Option A: Update Database Schema**
- Add missing columns
- Rename columns to match frontend
- Add/modify enum types
- Pros: Frontend works immediately
- Cons: Requires ALTER TABLE statements

**Option B: Update Frontend Types**
- Change TypeScript interfaces
- Update all component imports
- Modify CRM context
- Pros: No DB changes needed
- Cons: More code to change

**Option C: Add Mapping Layer**
- Create utility functions to map between frontend/DB
- Keep both schemas as-is
- Pros: No breaking changes
- Cons: Maintenance overhead

#### Recommended Approach

**For this project: Option A (Update Database)**

Reasons:
1. Frontend is well-architected and consistent
2. Database schema appears to be from a different project/version
3. Fewer changes overall
4. Matrix mock data already matches frontend schema

### Phase 4: Implementation (2-3 hours)

#### Task 4.1: Create Migration SQL

Create `supabase/migration_schema_alignment.sql` with:

```sql
-- Add missing columns
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS revenue DECIMAL(12,2);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS employees INTEGER;

-- Rename columns
ALTER TABLE products RENAME COLUMN unit_price TO price;
ALTER TABLE services RENAME COLUMN unit_price TO price;

-- Add missing tables
CREATE TABLE IF NOT EXISTS jobs (...);
CREATE TABLE IF NOT EXISTS crews (...);
-- etc.

-- Update enum types
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
ALTER TABLE tasks ALTER COLUMN priority TYPE task_priority USING priority::task_priority;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_accounts_org_id ON accounts(org_id);
```

#### Task 4.2: Apply Migration

1. **Backup database first!** (Supabase Dashboard → Database → Backups)
2. Test migration on a development database
3. Apply to production via Supabase SQL Editor
4. Verify all tables and columns exist

#### Task 4.3: Update Mock Data Loader

Fix `scripts/smart-load-data.js` to:
- Use correct column names
- Use correct enum values
- Handle all data types properly
- Add error handling

#### Task 4.4: Test Data Import

Import all Matrix mock data:
1. Accounts (10 rows)
2. Contacts (14 rows)
3. Leads (5 rows)
4. Deals (5 rows)
5. Tasks (8 rows)
6. Products (10 rows)
7. Services (10 rows)
8. Calendar Events (5 rows)

Verify data appears correctly in UI.

### Phase 5: Verify & Document (30 min)

#### Task 5.1: Test All Modules

Navigate to each page and verify:
- [ ] Dashboard - Shows correct data
- [ ] Leads - List view works, details load
- [ ] Deals - Stages display correctly
- [ ] Accounts - All fields visible
- [ ] Contacts - Linked to accounts properly
- [ ] Tasks - Priority/status dropdowns work
- [ ] Campaigns - Data displays
- [ ] Tickets - Priority values correct
- [ ] Products - Pricing displays
- [ ] Services - Billing cycles work
- [ ] Calendar - Events show on correct dates
- [ ] Jobs - If table exists
- [ ] Crews - If table exists
- [ ] Equipment - If table exists
- [ ] Zones - If table exists

#### Task 5.2: Test CRUD Operations

For each module:
- [ ] Create new record
- [ ] Update existing record
- [ ] Delete record
- [ ] Verify data persists (refresh page)

#### Task 5.3: Create Final Report

Document in `SUPABASE_AUDIT_COMPLETE.md`:
- Tables created
- Columns added/renamed
- Enum types fixed
- Data imported
- Issues resolved
- Remaining issues (if any)

## Scripts Needed

### 1. `scripts/full-schema-discovery.js`
```javascript
// Query Supabase REST API for complete schema
// Output: JSON file with all tables, columns, types, enums
```

### 2. `scripts/compare-schemas.js`
```javascript
// Compare TypeScript types vs Supabase schema
// Output: Markdown report with all mismatches
```

### 3. `scripts/generate-migration.js`
```javascript
// Generate SQL migration based on comparison
// Output: SQL file ready to apply
```

### 4. `scripts/verify-schema.js`
```javascript
// After migration, verify everything matches
// Output: Pass/fail report
```

## Critical Files to Review

1. **`src/types.ts`** - All TypeScript interfaces (source of truth)
2. **`src/context/CRMContext.tsx`** - Field usage in CRUD operations
3. **`src/utils/seedData.ts`** - Expected data structure
4. **Supabase Dashboard** - Actual table schemas
5. **All page components** - Field usage in UI

## Estimated Time

- **Phase 1 (Discovery)**: 30 minutes
- **Phase 2 (Compare)**: 45 minutes
- **Phase 3 (Plan)**: 30 minutes
- **Phase 4 (Implement)**: 2-3 hours
- **Phase 5 (Verify)**: 30 minutes

**Total: 4-5 hours**

## Success Criteria

- [ ] All frontend types match Supabase schema
- [ ] All 10 Matrix accounts import successfully
- [ ] All 14 Matrix contacts import successfully
- [ ] All modules display data correctly
- [ ] CRUD operations work on all modules
- [ ] No console errors related to missing fields
- [ ] Bulk operations work (import CSV, bulk delete, etc.)
- [ ] Documentation complete

## Commands for Next Context

Start the audit with:

```bash
# 1. Discover current schema
node scripts/full-schema-discovery.js

# 2. Compare with frontend
node scripts/compare-schemas.js

# 3. Review the mismatch report
cat SCHEMA_MISMATCH_REPORT.md

# 4. Generate migration SQL
node scripts/generate-migration.js

# 5. Apply migration (via Supabase Dashboard SQL Editor)
# Copy contents of supabase/migration_schema_alignment.sql

# 6. Verify schema
node scripts/verify-schema.js

# 7. Import Matrix data
node scripts/smart-load-data.js

# 8. Test UI
npm run dev
```

## Notes

- Supabase URL: `https://anawatvgypmrpbmjfcht.supabase.co`
- Credentials are in `.env` file
- Use SERVICE_ROLE_KEY for schema modifications
- Always backup before applying migrations
- Test on dev database first if possible

---

**Created**: 2026-02-08
**Status**: Ready for execution
**Estimated Effort**: 4-5 hours
**Risk Level**: Medium (requires database modifications)
