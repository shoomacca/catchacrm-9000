# SUPABASE SCHEMA REBUILD PLAN

**Created:** 2026-02-11
**Purpose:** Rebuild all Supabase tables from UI definitions to ensure 100% mapping

---

## PHASE 1: AUDIT & DOCUMENT (Current State)

### Existing Data
- **55 tables** with **739 columns** documented in COMPLETE_SUPABASE_AUDIT.md
- **TypeScript types** defined in `src/types.ts`
- **UI Fields** mapped in RecordModal.tsx and individual page components

### Issues Found
1. Schema mismatches (columns in DB not in TypeScript or vice versa)
2. Missing UI fields for some DB columns
3. Module pages using mock data instead of Supabase
4. Missing tables for some modules (tactical_queue, warehouse_locations, dispatch_alerts, rfqs, supplier_quotes)
5. Organization/signup flow not creating proper records

---

## PHASE 2: SCHEMA REBUILD (Using Supabase MCP)

### 2.1 Core Tables to Verify/Rebuild

| Table | Priority | Action |
|-------|----------|--------|
| `organizations` | P0 | Verify columns match signup flow |
| `organization_users` | P0 | Ensure exists for user-org linking |
| `users` | P0 | Verify all profile fields |
| `accounts` | P1 | Add missing: email, phone, city, state, logo, revenue, status, type |
| `contacts` | P1 | Verify all fields |
| `leads` | P1 | Verify lead scoring fields |
| `deals` | P1 | Verify pipeline/stage fields |
| `tasks` | P1 | Verify all fields |
| `tickets` | P1 | Verify SLA fields |

### 2.2 Document Tables

| Table | Priority | Action |
|-------|----------|--------|
| `quotes` | P1 | Verify line items structure |
| `invoices` | P1 | Verify payment tracking fields |
| `products` | P2 | Verify all fields |
| `services` | P2 | Verify all fields |
| `subscriptions` | P2 | Verify billing fields |

### 2.3 Operations Tables

| Table | Priority | Action |
|-------|----------|--------|
| `jobs` | P1 | Verify workflow fields (SWMS, signature, etc.) |
| `crews` | P2 | Verify all fields |
| `zones` | P2 | Verify geographic fields |
| `equipment` | P2 | Verify tracking fields |
| `inventory_items` | P2 | Verify stock fields |
| `purchase_orders` | P2 | Verify line items |
| `warehouses` | P2 | Verify location fields |
| `warehouse_locations` | P1 | CREATE - doesn't exist properly |
| `tactical_queue` | P1 | CREATE - doesn't exist properly |
| `dispatch_alerts` | P1 | CREATE - doesn't exist properly |

### 2.4 Marketing Tables

| Table | Priority | Action |
|-------|----------|--------|
| `campaigns` | P2 | Verify all fields |
| `inbound_forms` | P2 | Verify form builder fields |
| `chat_widgets` | P2 | Verify config fields |
| `calculators` | P2 | Verify formula fields |
| `reviews` | P2 | Verify rating fields |
| `referral_rewards` | P2 | Verify tracking fields |

### 2.5 Automation Tables

| Table | Priority | Action |
|-------|----------|--------|
| `automation_workflows` | P2 | Verify trigger/node JSONB |
| `webhooks` | P2 | Verify config fields |

### 2.6 Procurement Tables (NEW)

| Table | Priority | Action |
|-------|----------|--------|
| `rfqs` | P1 | CREATE - exists but verify schema |
| `supplier_quotes` | P1 | CREATE - exists but verify schema |

---

## PHASE 3: TRIGGER DEPLOYMENT

### 3.1 Handle New User Trigger
Deploy `handle_new_user.sql` to create on signup:
- Organization record
- organization_users link
- CRM user record
- Initial account
- Initial contact

### 3.2 Other Triggers Needed
- Audit log trigger (auto-log changes)
- Notification trigger (create notifications on events)

---

## PHASE 4: SEED DATA

### 4.1 Demo Organization
- Verify demo org has all required data
- Add sample data for all modules

### 4.2 Industry Blueprints
Add custom fields for each blueprint:
- Field Services (HVAC, plumbing, electrical)
- Real Estate
- Healthcare
- Construction
- Logistics
- etc.

---

## PHASE 5: INTEGRATION FIXES

### 5.1 Pages Using Mock Data → Supabase
- [x] TacticalQueue.tsx
- [x] WarehousePage.tsx
- [x] DispatchMatrix.tsx
- [x] ProcurementPage.tsx

### 5.2 Missing Context Connections
Verify all pages use `useCRM()` for:
- upsertRecord()
- deleteRecord()
- Real-time data

### 5.3 Auth Flow
- [x] Signup creates organization
- [x] Signup creates user record
- [x] Signup creates account/contact
- [ ] Password reset works
- [ ] Email verification works

---

## EXECUTION ORDER

```
1. Use Supabase MCP to list current tables/columns
2. Generate ALTER TABLE statements for missing columns
3. Generate CREATE TABLE statements for missing tables
4. Execute schema changes via Supabase MCP
5. Deploy triggers via Supabase MCP
6. Verify all UI fields map to DB columns
7. Test signup flow end-to-end
8. Test each module's CRUD operations
```

---

## FILES TO UPDATE

| File | Changes |
|------|---------|
| `src/types.ts` | Add any missing type definitions |
| `src/utils/tableMapping.ts` | Ensure all entity mappings |
| `src/services/supabaseData.ts` | Add any missing table names |
| `src/context/CRMContext.tsx` | Ensure all arrays and setters |
| `supabase/handle_new_user.sql` | Already updated |
| `supabase/COMPLETE_SCHEMA_SYNC.sql` | Generate from UI |

---

## SUCCESS CRITERIA

- [ ] All 55+ tables have correct columns matching TypeScript types
- [ ] All UI forms save data to Supabase
- [ ] Signup creates organization + user + account + contact
- [ ] Demo mode works with seeded data
- [ ] All modules connected to Supabase (no mock data)
- [ ] Industry blueprints have custom fields defined
