# CatchaCRM 9000 - Supabase Integration Audit Plan

**Created:** 2026-02-09
**Status:** Ready for Execution
**Goal:** Verify all 100+ Supabase tables are correctly mapped to UI types and CRUD operations work

---

## Quick Start

```bash
# 1. Start dev server
cd C:\Users\Corsa\.antigravity\projects\catchacrm_flash_integrated
npm run dev

# 2. Check Supabase connection
# Open browser console - should see "✓ Supabase client initialized"

# 3. Enter demo mode to test with data
# Go to /demo or click "Try Demo Mode" on login page
```

---

## Phase 1: Schema Discovery

### 1.1 Get All Supabase Tables

Run this SQL in Supabase SQL Editor:

```sql
SELECT table_name,
       (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### 1.2 Get All Columns Per Table

```sql
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

### 1.3 Export Current Schema

```bash
# Run from project root
node scripts/discover-schema.js > .antigravity/SUPABASE_SCHEMA_CURRENT.md
```

---

## Phase 2: UI Types Mapping

### 2.1 Frontend Entity Types

Located in: `src/types.ts`

**37 Entity Types Defined:**

| Category | Types |
|----------|-------|
| Core CRM | leads, deals, accounts, contacts, tasks, tickets, campaigns, users |
| Financial | invoices, quotes, products, services, subscriptions, bankTransactions, expenses |
| Field Service | jobs, crews, zones, equipment |
| Logistics | inventoryItems, purchaseOrders |
| Communication | calendarEvents, communications, conversations, chatMessages, documents, notifications |
| Marketing | reviews, referralRewards, inboundForms, chatWidgets, calculators |
| Automation | automationWorkflows, webhooks, industryTemplates |
| Audit | auditLogs |

### 2.2 Type-to-Table Mapping

Check `src/utils/tableMapping.ts` for snake_case conversions:

```typescript
// Example mappings
leads → leads
bankTransactions → bank_transactions
inventoryItems → inventory_items
purchaseOrders → purchase_orders
calendarEvents → calendar_events
```

### 2.3 Audit Script

```bash
node scripts/audit-types.cjs
```

This compares:
- Types defined in `src/types.ts`
- Tables in Supabase
- Fields in each type vs columns in each table

---

## Phase 3: CRUD Operations Verification

### 3.1 CRMContext Methods

Located in: `src/context/CRMContext.tsx`

Verify these methods exist for each entity type:

| Method | Purpose |
|--------|---------|
| `get{Entity}s()` | Fetch all records |
| `get{Entity}ById(id)` | Fetch single record |
| `create{Entity}(data)` | Create new record |
| `update{Entity}(id, data)` | Update existing |
| `delete{Entity}(id)` | Delete record |

### 3.2 Supabase Data Service

Located in: `src/services/supabaseData.ts`

Core functions:
- `fetchAll(table, orgId)`
- `fetchById(table, id)`
- `insertRecord(table, data)`
- `updateRecord(table, id, data)`
- `deleteRecord(table, id)`

### 3.3 Manual CRUD Test Checklist

For each entity type, test:

- [ ] **CREATE**: Add new record via RecordModal
- [ ] **READ**: View record in list page
- [ ] **UPDATE**: Edit record via RecordModal
- [ ] **DELETE**: Delete record (with confirmation)
- [ ] **PERSIST**: Refresh page, data still there

---

## Phase 4: Field-by-Field Audit

### 4.1 Required Fields Check

For each entity, verify:
- Required fields in type have `NOT NULL` in DB
- Optional fields allow null
- Default values match

### 4.2 Foreign Key Relationships

Check these relationships exist:

| Entity | Foreign Key | References |
|--------|-------------|------------|
| contacts | account_id | accounts.id |
| deals | account_id | accounts.id |
| deals | contact_id | contacts.id |
| jobs | account_id | accounts.id |
| jobs | crew_id | crews.id |
| invoices | account_id | accounts.id |
| invoices | deal_id | deals.id |
| quotes | account_id | accounts.id |
| quotes | deal_id | deals.id |
| tasks | assigned_to | users.id |
| tickets | account_id | accounts.id |
| tickets | contact_id | contacts.id |

### 4.3 Enum/Status Fields

Verify these match between UI and DB:

**Lead Status:**
- new, contacted, qualified, proposal, negotiation, won, lost

**Deal Stage:**
- discovery, proposal, negotiation, closed_won, closed_lost

**Job Status:**
- pending, scheduled, in_progress, completed, cancelled

**Ticket Status:**
- open, in_progress, waiting, resolved, closed

**Invoice Status:**
- draft, sent, paid, overdue, cancelled

---

## Phase 5: RLS Policy Verification

### 5.1 Check RLS Enabled

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;
```

### 5.2 Verify org_id Isolation

All tables should have:
```sql
-- SELECT policy
CREATE POLICY "Users can view own org data" ON table_name
FOR SELECT USING (org_id = auth.jwt() ->> 'org_id');

-- INSERT policy
CREATE POLICY "Users can insert own org data" ON table_name
FOR INSERT WITH CHECK (org_id = auth.jwt() ->> 'org_id');
```

### 5.3 Test Cross-Tenant Isolation

1. Login as User A (org_id = X)
2. Create a lead
3. Login as User B (org_id = Y)
4. Verify User B cannot see User A's lead

---

## Phase 6: Data Sync Verification

### 6.1 Real-time Subscriptions

Check `src/hooks/useSupabaseData.ts`:
- Subscriptions set up for all tables
- Changes reflect immediately in UI
- No duplicate listeners

### 6.2 Optimistic Updates

Verify:
- UI updates immediately on action
- Rollback on server error
- Loading states shown appropriately

### 6.3 Offline/Error Handling

Test:
- What happens when Supabase is unreachable?
- Does localStorage fallback work?
- Error messages shown to user?

---

## Phase 7: Page-by-Page Verification

### Sales Module
- [ ] SalesDashboard - Pipeline metrics load from DB
- [ ] LeadsPage - CRUD works, filters work
- [ ] DealsPage - Stage progression saves
- [ ] AccountsPage - Hierarchy displays
- [ ] ContactsPage - Account relationship works

### Financial Module
- [ ] FinancialHub - Revenue calculates correctly
- [ ] InvoicesList - Status filters work
- [ ] QuotesList - Expiry dates calculate
- [ ] BankFeed - Transactions import/display
- [ ] ExpensesList - Receipt upload works

### Field Service Module
- [ ] FieldServicesDashboard - Job metrics accurate
- [ ] JobsPage - 5-step workflow progresses
- [ ] CrewsPage - Member assignment works
- [ ] ZonesPage - Territory boundaries save
- [ ] EquipmentPage - Maintenance tracking works

### Operations Module
- [ ] OpsDashboard - SLA calculations correct
- [ ] SupportTickets - Timer updates
- [ ] TaskManagement - Assignment works
- [ ] TeamChat - Messages persist

### Logistics Module
- [ ] WarehousePage - Stock levels accurate
- [ ] InventoryPage - Reorder alerts work
- [ ] PurchaseOrdersPage - Approval flow works

### Marketing Module
- [ ] MarketingDashboard - Campaign ROI calculates
- [ ] ReputationManager - Reviews sync
- [ ] ReferralEngine - Rewards track

---

## Phase 8: Execution Commands

### Run Full Audit Script

```bash
# Compare types to Supabase schema
node scripts/audit-supabase-full.cjs

# Output: .antigravity/AUDIT_RESULTS.md
```

### Check for Missing Tables

```bash
node scripts/schema-compare.cjs
```

### Seed Demo Data

```bash
node scripts/seed-database.cjs
```

### Reset Demo Organization

```bash
node scripts/clear-all-data.js
node scripts/seed-database.cjs
```

---

## Phase 9: Issue Tracking

### Issue Template

```markdown
## Issue: [ENTITY] - [PROBLEM]

**Entity:** leads/deals/etc
**Table:** table_name
**Severity:** Critical/High/Medium/Low

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Steps to Reproduce
1. Go to...
2. Click...
3. See error...

### Fix Required
- [ ] Add missing column
- [ ] Update type definition
- [ ] Fix CRUD method
- [ ] Update RLS policy
```

### Priority Matrix

| Severity | Definition | SLA |
|----------|------------|-----|
| Critical | Data loss, security breach | Immediate |
| High | Feature broken, no workaround | Same day |
| Medium | Feature degraded, workaround exists | 2-3 days |
| Low | Cosmetic, minor inconvenience | Backlog |

---

## Phase 10: Completion Checklist

### Schema Alignment
- [ ] All 37 entity types have matching tables
- [ ] All fields map correctly (types match)
- [ ] Foreign keys properly defined
- [ ] Indexes on common query fields

### CRUD Operations
- [ ] Create works for all entities
- [ ] Read returns correct data
- [ ] Update persists changes
- [ ] Delete removes records
- [ ] Bulk operations work

### Security
- [ ] RLS enabled on all tables
- [ ] org_id isolation verified
- [ ] No cross-tenant data leaks
- [ ] Audit logging works

### Data Integrity
- [ ] Required fields enforced
- [ ] Cascade deletes work correctly
- [ ] Timestamps auto-update
- [ ] UUID generation works

### Performance
- [ ] List pages load < 2s
- [ ] Detail pages load < 1s
- [ ] No N+1 query issues
- [ ] Pagination works

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/types.ts` | All 37 entity type definitions |
| `src/context/CRMContext.tsx` | CRUD operations and state |
| `src/services/supabaseData.ts` | Supabase API wrapper |
| `src/hooks/useSupabaseData.ts` | Real-time sync hook |
| `src/utils/tableMapping.ts` | Type-to-table name mapping |
| `src/lib/supabase.ts` | Supabase client config |
| `supabase/*.sql` | Schema migration files |

---

## Support

- **Linear Project:** https://linear.app/bsbsbs/project/catchacrm-9000-e1b35d51d22f
- **GitHub:** https://github.com/shoomacca/catchacrm-9000
- **Vercel:** https://catchacrmflashintegrated.vercel.app

---

**Next Step:** Start with Phase 1 - run the schema discovery SQL to get current state of Supabase tables.
