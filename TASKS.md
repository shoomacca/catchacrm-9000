# CatchaCRM Task List

**Generated:** 2026-02-12
**Source:** AUDIT_REPORT.md (mechanical audit)
**Total TSC errors at generation:** ~210 across 34 files

---

## Foundation Tasks (Fix Root Causes First)

### TASK-001: Add missing fields to types.ts
**Type:** ERROR
**Priority:** P0
**Files to modify:** `src/types.ts`
**Files to delete:** none
**What's wrong:** Multiple interfaces in types.ts are missing fields that pages actively reference, causing ~60 TSC errors across 15+ files. Specifically:
- `Lead` — pages use `amount` but interface only has `estimatedValue`
- `Contact` — missing `role: string`, `lastActivityDate?: string`, `interactionCount?: number`
- `Account` — missing `billingAddress?: Address`
- `Communication` — missing `status?: string`, `notes?: string`, `date?: string`, `contactId?: string`, `summary?: string`
- `Job` — missing `notes?: string`
- `Ticket` — missing `assignedTo?: string` (alias for `assigneeId`), `category?: string`
- `User` — missing `phone?: string`
- `InventoryItem` — missing `supplier?: string`, `lastRestocked?: string`, `location?: string`
- `PurchaseOrder` — missing `name?: string`
- `DealStage` (in `CRMSettings.dealStages`) — missing `color?: string` (currently `{ label: string; probability: number }`)
**What "fixed" looks like:**
- All fields listed above are added to their respective interfaces as optional fields (with `?`) to avoid breaking existing code
- `Lead` gets `amount?: number` as an alias alongside `estimatedValue`
- `CRMSettings.dealStages` type becomes `{ label: string; probability: number; color?: string }[]`
- Running `npx tsc --noEmit 2>&1 | grep "does not exist on type"` returns zero results for these fields
**Dependencies:** none
**Supabase tables involved:** All tables — these type definitions mirror Supabase column structures

---

### TASK-002: Fix enum case mismatches between types and pages
**Type:** ERROR
**Priority:** P0
**Files to modify:** `src/types.ts`
**Files to delete:** none
**What's wrong:** Type definitions use one casing convention but pages and seed data use another, causing ~25 TSC errors:
- `Campaign.type`: defined as `'Email' | 'Social' | 'Search' | 'Event' | 'Referral'` but CampaignsPage.tsx filters with lowercase `'email' | 'search' | 'social' | 'event' | 'referral'`
- `Subscription.billingCycle`: defined as `'one-off' | 'monthly' | 'quarterly' | 'yearly' | 'custom'` but SalesDashboard.tsx and FinancialHub.tsx compare with `'Monthly' | 'Yearly'`
- `JobStatus`: defined as `'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'OnHold'` but Reports.tsx uses `'In Progress'` (with space)
- `Communication.type`: defined as `'Email' | 'Call' | 'SMS' | 'Note'` but Reports.tsx uses `'Meeting'`
- `InventoryItem.category`: defined as `'Asset' | 'Material'` but seedData.ts uses `'Medical' | 'Weapons' | 'Communications' | 'Technology'`
- `WorkflowActionType`: defined as `'SendEmail' | 'SendSMS' | 'CreateTask' | 'UpdateField' | 'Webhook'` but seedData.ts uses `'AssignOwner'`

**Resolution strategy — pick ONE direction:**
- Option A (recommended): Widen the type unions to accept both cases. Example: `Campaign.type` becomes `'Email' | 'email' | 'Social' | 'social' | ...`
- Option B: Normalize all page code to match existing type definitions

**What "fixed" looks like:**
- `npx tsc --noEmit 2>&1 | grep "has no overlap\|is not assignable to type"` returns zero results for enum values
- CampaignsPage filter pills work correctly with actual data
- SalesDashboard/FinancialHub billing cycle comparisons match
- seedData.ts compiles without type errors on category/status fields
**Dependencies:** none
**Supabase tables involved:** campaigns, subscriptions, jobs, communications, inventory_items, automation_workflows

---

### TASK-003: Fix CRMContext missing methods (updateRecord / addRecord)
**Type:** ERROR
**Priority:** P0
**Files to modify:** `src/context/CRMContext.tsx` (and its type definition section)
**Files to delete:** none
**What's wrong:** Four financial pages destructure `updateRecord` and `addRecord` from CRMContext, but these methods don't exist on the context. Only `upsertRecord` exists. This causes 4 TSC errors:
- `src/pages/Financials/ExpensesList.tsx` — `const { updateRecord } = useCRM()`
- `src/pages/Financials/InvoicesList.tsx` — `const { updateRecord } = useCRM()`
- `src/pages/Financials/PurchaseLedger.tsx` — `const { updateRecord } = useCRM()`
- `src/pages/Financials/QuotesList.tsx` — `const { updateRecord, addRecord } = useCRM()`

**Resolution strategy — pick ONE:**
- Option A (recommended): Add `updateRecord` and `addRecord` as thin wrappers around `upsertRecord` in CRMContext.tsx (both call `upsertRecord` internally)
- Option B: Change these 4 pages to use `upsertRecord` instead

**What "fixed" looks like:**
- All 4 financial pages compile without `Property 'updateRecord' does not exist` errors
- `updateRecord('invoices', id, data)` calls work at runtime (updates existing records)
- `addRecord('quotes', data)` calls work at runtime (creates new records)
**Dependencies:** none
**Supabase tables involved:** invoices, expenses, purchase_orders, quotes

---

### TASK-004: Fix implicit `any` in SettingsView.tsx (118 errors)
**Type:** ERROR
**Priority:** P1
**Files to modify:** `src/pages/SettingsView.tsx`
**Files to delete:** none
**What's wrong:** 118 TSC errors, all `Parameter 'v' implicitly has an 'any' type` on settings update handler arrow functions. Every settings field change handler passes an untyped value. Example pattern: `onChange={(v) => updateSetting('key', v)}` where `v` lacks a type annotation.
**What "fixed" looks like:**
- All 118 `implicitly has an 'any' type` errors in SettingsView.tsx are resolved
- Each handler parameter has an explicit type (e.g., `(v: string) =>`, `(v: boolean) =>`, `(e: React.ChangeEvent<HTMLInputElement>) =>`)
- `npx tsc --noEmit 2>&1 | grep "SettingsView"` returns 0 errors
**Dependencies:** none
**Supabase tables involved:** organizations (settings are stored on the org record)

---

### TASK-005: Fix implicit `any` in RecordModal.tsx (10 errors)
**Type:** ERROR
**Priority:** P1
**Files to modify:** `src/components/RecordModal.tsx`
**Files to delete:** none
**What's wrong:** 10 TSC errors at lines 451-455 and 491-495, all `Parameter 'e' implicitly has an 'any' type` on form input event handlers. These are onChange handlers on form fields in the create/edit record modal.
**What "fixed" looks like:**
- All 10 `implicitly has an 'any' type` errors in RecordModal.tsx are resolved
- Each event handler has explicit type: `(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>`
- `npx tsc --noEmit 2>&1 | grep "RecordModal"` returns 0 errors
**Dependencies:** none
**Supabase tables involved:** none (modal calls CRMContext.upsertRecord)

---

### TASK-006: Fix seedData.ts to match types.ts (18 errors)
**Type:** ERROR
**Priority:** P1
**Files to modify:** `src/utils/seedData.ts`
**Files to delete:** none
**What's wrong:** 18 TSC errors — seed data objects have diverged from their type definitions:
- Lines 166-170: Lead temperature uses `"cold"/"warm"/"hot"` instead of `"Cold"/"Warm"/"Hot"`
- Lines 218-222: Ticket objects missing required fields `ticketNumber`, `description`, `slaDeadline`
- Line 221: `resolvedAt` property doesn't exist on Ticket type
- Lines 227, 229: String values where numbers expected (likely `reorderPoint` or `unitPrice`)
- Lines 294-298: InventoryItem category uses `"Medical"/"Weapons"/"Communications"/"Technology"` instead of `"Asset"/"Material"`
- Line 375: AutomationWorkflow uses `"AssignOwner"` which isn't in WorkflowActionType enum

**What "fixed" looks like:**
- All seed data objects match their TypeScript interfaces exactly
- `npx tsc --noEmit 2>&1 | grep "seedData"` returns 0 errors
- Demo mode still loads correctly with realistic sample data
**Dependencies:** TASK-001 (if types.ts gains new fields, seed data should populate them), TASK-002 (if enum casing changes, seed data must match)
**Supabase tables involved:** none (seed data is local only, not pushed to Supabase)

---

### TASK-007: Fix CRMContext.tsx missing createdBy on AuditLog
**Type:** ERROR
**Priority:** P2
**Files to modify:** `src/context/CRMContext.tsx`
**Files to delete:** none
**What's wrong:** Line 1252 — `addAuditLog` function creates an AuditLog object without the required `createdBy` property. The `AuditLog` type extends `CRMBase` which requires `createdBy: string`.
**What "fixed" looks like:**
- The AuditLog object at line 1252 includes `createdBy: userId` (the userId is already available as a parameter)
- `npx tsc --noEmit 2>&1 | grep "CRMContext"` returns 0 errors
**Dependencies:** none
**Supabase tables involved:** audit_log, audit_logs

---

## Dead Code Removal

### TASK-008: Delete 16 dead files
**Type:** DEAD
**Priority:** P2
**Files to modify:** none
**Files to delete:**
1. `src/pages/Dashboard.tsx` — superseded by SalesDashboard + MySchedule
2. `src/pages/BillingView.tsx` — superseded by Financials/SubscriptionsList.tsx
3. `src/pages/DetailView.tsx` — superseded by EntityDetail.tsx (fully hardcoded placeholder)
4. `src/pages/RecordDetail.tsx` — superseded by EntityDetail.tsx
5. `src/pages/TaskManagement.tsx` — consolidated into MySchedule (comment in App.tsx confirms)
6. `src/pages/FinancialsView.tsx` — superseded by Financials/FinancialHub.tsx
7. `src/pages/Logistics/Warehouse.tsx` — superseded by pages/WarehousePage.tsx
8. `src/pages/Logistics/Procurement.tsx` — superseded by pages/ProcurementPage.tsx
9. `src/pages/Logistics/JobMarketplace.tsx` — superseded by pages/JobMarketplacePage.tsx
10. `src/pages/SupportHub.tsx` — imported in App.tsx but never routed
11. `src/pages/TicketManagement.tsx` — imported in App.tsx but never routed
12. `src/hooks/useSupabaseData.ts` — never imported anywhere; CRMContext.tsx duplicates its logic inline
13. `src/lib/service-config.ts` — never imported anywhere; fully implemented but zero consumers

**What's wrong:** These files are not imported by any active route or component. They are superseded by newer implementations and only add to bundle size and confusion.
**What "fixed" looks like:**
- All 13 files above are deleted
- `npm run build` still succeeds (no broken imports)
- No import statements reference these files anywhere
**Dependencies:** TASK-009 (remove dead imports from App.tsx first)
**Supabase tables involved:** none

---

### TASK-009: Remove dead imports from App.tsx
**Type:** DEAD
**Priority:** P2
**Files to modify:** `src/App.tsx`
**Files to delete:** none
**What's wrong:** App.tsx imports `TicketManagement` and `SupportHub` at the top of the file, but neither component is used in any `<Route>` or rendered anywhere. These are dead imports.
**What "fixed" looks like:**
- `import TicketManagement from './pages/TicketManagement'` removed
- `import SupportHub from './pages/SupportHub'` removed
- App.tsx compiles cleanly
- No runtime changes (these components were never rendered)
**Dependencies:** none
**Supabase tables involved:** none

---

### TASK-010: Delete dead UI component library (optional)
**Type:** DEAD
**Priority:** P3
**Files to modify:** none
**Files to delete:**
1. `src/components/ui/Button.tsx`
2. `src/components/ui/ButtonGroup.tsx`
3. `src/components/ui/Card.tsx`
4. `src/components/ui/Checkbox.tsx`
5. `src/components/ui/IconButton.tsx`
6. `src/components/ui/index.ts`
7. `src/components/ui/Input.tsx`
8. `src/components/ui/Panel.tsx`
9. `src/components/ui/Radio.tsx`
10. `src/components/ui/Select.tsx`
11. `src/components/ui/Textarea.tsx`

**What's wrong:** The entire `src/components/ui/` directory is only consumed by `ComponentShowcase.tsx` (a dev-only demo page at `/showcase`). No production page uses these components — all pages use inline Tailwind styling instead.
**What "fixed" looks like:**
- All 11 files deleted
- If ComponentShowcase.tsx is kept, update it to remove ui/ imports (or delete it too)
- `npm run build` succeeds
**Dependencies:** none
**Supabase tables involved:** none

---

## Page-Level Fixes (After Foundation Tasks)

### TASK-011: Fix AccountsPage.tsx — Invoice.amount → Invoice.total
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/AccountsPage.tsx`
**Files to delete:** none
**What's wrong:** Lines 37 and 63 reference `invoice.amount` but the Invoice type has `total` (not `amount`). Revenue calculation for accounts is broken.
**What "fixed" looks like:**
- Line 37: `invoice.amount` changed to `invoice.total`
- Line 63: `invoice.amount` changed to `invoice.total`
- `npx tsc --noEmit 2>&1 | grep "AccountsPage"` returns 0 errors
- Account revenue totals display correctly
**Dependencies:** TASK-001
**Supabase tables involved:** invoices, accounts

---

### TASK-012: Fix LeadsPage.tsx — amount → estimatedValue
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/LeadsPage.tsx`
**Files to delete:** none
**What's wrong:** 7 TSC errors — page references `lead.amount` but Lead type uses `estimatedValue`. All pipeline value calculations and display fields reference the wrong property.
**What "fixed" looks like:**
- All `lead.amount` references changed to `lead.estimatedValue` (or `lead.amount` if TASK-001 adds the alias)
- `npx tsc --noEmit 2>&1 | grep "LeadsPage"` returns 0 errors
- Lead pipeline values display correctly
**Dependencies:** TASK-001
**Supabase tables involved:** leads

---

### TASK-013: Fix ContactsPage.tsx — missing properties
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/ContactsPage.tsx`
**Files to delete:** none
**What's wrong:** 11 TSC errors — page references properties that don't exist on Contact/Lead types:
- `contact.role` — Contact has `title` but not `role`
- `contact.lastActivityDate` — not on Contact type
- `contact.interactionCount` — not on Contact type
- `lead.contactId` — not on Lead type (leads don't have a contactId, they ARE the contact)
**What "fixed" looks like:**
- Either add missing fields to types.ts (TASK-001) OR change page to use existing fields (`title` instead of `role`)
- `npx tsc --noEmit 2>&1 | grep "ContactsPage"` returns 0 errors
- Contact list page renders all columns correctly
**Dependencies:** TASK-001
**Supabase tables involved:** contacts, leads

---

### TASK-014: Fix DealsPage.tsx — missing description and color
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/DealsPage.tsx`
**Files to delete:** none
**What's wrong:** 3 TSC errors:
- `deal.description` doesn't exist on Deal type (Deal has `notes` but page expects `description`)
- `stage.color` doesn't exist on deal stage type (CRMSettings.dealStages has `{ label, probability }` but no `color`)
**What "fixed" looks like:**
- Deal references `notes` instead of `description`, OR TASK-001 adds `description` alias
- Stage color is either added to dealStages type (TASK-001) or a fallback color is used
- `npx tsc --noEmit 2>&1 | grep "DealsPage"` returns 0 errors
- Kanban columns show colored stage headers
**Dependencies:** TASK-001
**Supabase tables involved:** deals

---

### TASK-015: Fix CampaignsPage.tsx — enum case mismatch
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/CampaignsPage.tsx`
**Files to delete:** none
**What's wrong:** 7 TSC errors:
- Filter comparison uses lowercase (`'email'`, `'social'`) but Campaign.type is PascalCase (`'Email'`, `'Social'`)
- `campaign.spent` is possibly undefined (optional field)
**What "fixed" looks like:**
- Filter comparisons use correct casing: `campaign.type === 'Email'` (or lowercased if TASK-002 widens the type)
- `spent` access uses optional chaining or fallback: `campaign.spent ?? 0`
- `npx tsc --noEmit 2>&1 | grep "CampaignsPage"` returns 0 errors
**Dependencies:** TASK-002
**Supabase tables involved:** campaigns

---

### TASK-016: Fix CommsHub.tsx — missing status/notes on Communication
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/CommsHub.tsx`
**Files to delete:** none
**What's wrong:** 8 TSC errors — page references `communication.status` and `communication.notes` but neither exists on Communication type. Communication has `content` (not `notes`) and has no `status` field.
**What "fixed" looks like:**
- `notes` references changed to `content`
- `status` either added to Communication type (TASK-001) or removed from page logic
- `npx tsc --noEmit 2>&1 | grep "CommsHub"` returns 0 errors
**Dependencies:** TASK-001
**Supabase tables involved:** communications

---

### TASK-017: Fix CalendarView.tsx — undefined string assignments
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/CalendarView.tsx`
**Files to delete:** none
**What's wrong:** 9 TSC errors at lines 436-495 — assigning `string | undefined` to fields that require `string`. CalendarEvent fields like `title`, `description`, `startTime`, `endTime` are required but the form state initializes them as potentially undefined.
**What "fixed" looks like:**
- All form field assignments use fallback defaults: `title: formData.title || ''`
- OR the form state type is adjusted to always have string values
- `npx tsc --noEmit 2>&1 | grep "CalendarView"` returns 0 errors
**Dependencies:** none
**Supabase tables involved:** calendar_events

---

### TASK-018: Fix BlueprintDetailPage.tsx and BlueprintListPage.tsx — .find() on Record
**Type:** BROKEN
**Priority:** P2
**Files to modify:** `src/pages/BlueprintDetailPage.tsx`, `src/pages/BlueprintListPage.tsx`
**Files to delete:** none
**What's wrong:** 10 TSC errors combined:
- Both pages call `.find()` on `industryBlueprints` which is typed as `Record<IndustryType, IndustryBlueprint>` (an object, not an array). `.find()` only exists on arrays.
- BlueprintDetailPage also has implicit `any` on `entity`, `field`, `index` parameters and `unknown` type on `fields`
**What "fixed" looks like:**
- `.find()` replaced with `Object.values(industryBlueprints).find(b => ...)`
- All implicit `any` parameters given explicit types
- `fields` properly typed (e.g., `as CustomFieldDefinition[]`)
- `npx tsc --noEmit 2>&1 | grep "Blueprint"` returns 0 errors
**Dependencies:** none
**Supabase tables involved:** industry_templates

---

### TASK-019: Fix FinancialHub.tsx — enum case + missing Invoice properties
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/Financials/FinancialHub.tsx`
**Files to delete:** none
**What's wrong:** 9 TSC errors:
- Subscription billingCycle comparison uses `"Monthly"/"Yearly"` but type defines `"monthly"/"yearly"`
- References `invoice.items` but Invoice type has `lineItems`
- References `invoice.tax` but Invoice type has `taxTotal`
**What "fixed" looks like:**
- Billing cycle comparisons use correct case: `subscription.billingCycle === 'monthly'`
- `invoice.items` changed to `invoice.lineItems`
- `invoice.tax` changed to `invoice.taxTotal`
- `npx tsc --noEmit 2>&1 | grep "FinancialHub"` returns 0 errors
**Dependencies:** TASK-002
**Supabase tables involved:** invoices, subscriptions

---

### TASK-020: Fix InvoiceDetail.tsx — missing billingAddress on Account
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/Financials/InvoiceDetail.tsx`
**Files to delete:** none
**What's wrong:** 5 TSC errors — page renders `account.billingAddress` (street, suburb, state, postcode) but Account type has only `address?: Address` not `billingAddress`.
**What "fixed" looks like:**
- Either add `billingAddress?: Address` to Account type (TASK-001) OR change page to use `account.address`
- `npx tsc --noEmit 2>&1 | grep "InvoiceDetail"` returns 0 errors
- Invoice PDF preview shows correct address
**Dependencies:** TASK-001
**Supabase tables involved:** invoices, accounts

---

### TASK-021: Fix SupportTickets.tsx — assignedTo → assigneeId
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/SupportTickets.tsx`
**Files to delete:** none
**What's wrong:** 6 TSC errors — page uses `ticket.assignedTo` but Ticket type has `assigneeId`. TypeScript even suggests: "Did you mean 'assigneeId'?" at lines 25, 37, 38, 47, 49, 51.
**What "fixed" looks like:**
- All `ticket.assignedTo` changed to `ticket.assigneeId`
- `npx tsc --noEmit 2>&1 | grep "SupportTickets"` returns 0 errors
- Support inbox correctly shows assigned agents
**Dependencies:** none
**Supabase tables involved:** tickets

---

### TASK-022: Fix SalesDashboard.tsx — missing properties + enum mismatch
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/SalesDashboard.tsx`
**Files to delete:** none
**What's wrong:** 7 TSC errors:
- `quote.totalAmount` — Quote type has `total` not `totalAmount`
- `subscription.amount` — Subscription type has no `amount` field (must calculate from items)
- Billing cycle comparison uses `"Monthly"/"Yearly"` instead of `"monthly"/"yearly"`
**What "fixed" looks like:**
- `quote.totalAmount` changed to `quote.total`
- `subscription.amount` replaced with calculation from `subscription.items` or field added (TASK-001)
- Billing cycle uses lowercase: `'monthly'` / `'yearly'`
- `npx tsc --noEmit 2>&1 | grep "SalesDashboard"` returns 0 errors
**Dependencies:** TASK-001, TASK-002
**Supabase tables involved:** quotes, subscriptions, deals

---

### TASK-023: Fix Reports.tsx — enum mismatches + missing amounts
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/Reports.tsx`
**Files to delete:** none
**What's wrong:** 7 TSC errors:
- Uses `'In Progress'` but JobStatus enum defines `'InProgress'` (no space)
- Uses `'Meeting'` but Communication.type has no `'Meeting'` value
- References `amount` on various aggregation objects that have different field names
**What "fixed" looks like:**
- Job status comparison uses `'InProgress'` (or widen type in TASK-002)
- Communication type filter uses valid value or adds `'Meeting'` to type
- All property references match their actual type definitions
- `npx tsc --noEmit 2>&1 | grep "Reports"` returns 0 errors
**Dependencies:** TASK-001, TASK-002
**Supabase tables involved:** jobs, communications, invoices, deals

---

### TASK-024: Fix MarketingDashboard.tsx — possibly undefined properties
**Type:** BROKEN
**Priority:** P2
**Files to modify:** `src/pages/MarketingDashboard.tsx`
**Files to delete:** none
**What's wrong:** 7 TSC errors — page accesses optional properties without null checks:
- `chatWidget.conversations` (optional)
- `chatWidget.avgResponseTime` (optional)
- `calculator.usageCount` (optional)
- `calculator.leadConversionRate` (optional)
- `form.conversionRate` (optional)
**What "fixed" looks like:**
- All optional field accesses use optional chaining (`?.`) or nullish coalescing (`?? 0`)
- `npx tsc --noEmit 2>&1 | grep "MarketingDashboard"` returns 0 errors
**Dependencies:** none
**Supabase tables involved:** campaigns, chat_widgets, calculators, inbound_forms

---

### TASK-025: Fix MySchedule.tsx — type incompatibilities
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/MySchedule.tsx`
**Files to delete:** none
**What's wrong:** 4 TSC errors:
- `name` possibly undefined on a Job/Task join
- `ticket.category` doesn't exist on Ticket type
- `ticket.assignedTo` should be `ticket.assigneeId`
**What "fixed" looks like:**
- `name` access uses optional chaining or fallback
- `category` either added to Ticket type (TASK-001) or removed from display
- `assignedTo` changed to `assigneeId`
- `npx tsc --noEmit 2>&1 | grep "MySchedule"` returns 0 errors
**Dependencies:** TASK-001
**Supabase tables involved:** tasks, tickets, jobs

---

### TASK-026: Fix TeamChat.tsx — Lucide prop + missing User.phone
**Type:** BROKEN
**Priority:** P2
**Files to modify:** `src/pages/TeamChat.tsx`
**Files to delete:** none
**What's wrong:** 5 TSC errors:
- Line 292: Passing `title` prop to Lucide icon component — Lucide v0.x+ removed the `title` prop from SVG icons
- Lines 387: `url` and `i` parameters implicitly have `any` type (in a `.map()` callback)
- Lines 757-758: `user.phone` doesn't exist on User type
**What "fixed" looks like:**
- Remove `title` prop from Lucide icon (or wrap in a `<span title="...">`)
- Add explicit types to map callback: `(url: string, i: number) =>`
- Either add `phone?: string` to User type (TASK-001) or remove phone display from chat profile
- `npx tsc --noEmit 2>&1 | grep "TeamChat"` returns 0 errors
**Dependencies:** TASK-001
**Supabase tables involved:** chat_messages, conversations, users

---

### TASK-027: Fix InboundEngine.tsx — type narrowing failures
**Type:** BROKEN
**Priority:** P2
**Files to modify:** `src/pages/Marketing/InboundEngine.tsx`
**Files to delete:** none
**What's wrong:** 4 TSC errors — CalculatorType assignment issues and type narrowing failures in calculator configuration sections. Likely passing wrong type to a discriminated union or switch statement.
**What "fixed" looks like:**
- Calculator type checks use proper type guards
- All switch/if branches handle CalculatorType values correctly (`'ROI' | 'Repayment' | 'SolarYield'`)
- `npx tsc --noEmit 2>&1 | grep "InboundEngine"` returns 0 errors
**Dependencies:** none
**Supabase tables involved:** calculators, inbound_forms

---

### TASK-028: Fix FieldServicesDashboard.tsx — missing notes on Job
**Type:** BROKEN
**Priority:** P2
**Files to modify:** `src/pages/FieldServicesDashboard.tsx`
**Files to delete:** none
**What's wrong:** 2 TSC errors — page references `job.notes` but Job type doesn't have a `notes` field. Job has `description` instead.
**What "fixed" looks like:**
- `job.notes` changed to `job.description` (or add `notes?: string` to Job in TASK-001)
- `npx tsc --noEmit 2>&1 | grep "FieldServicesDashboard"` returns 0 errors
**Dependencies:** TASK-001
**Supabase tables involved:** jobs, crews

---

### TASK-029: Fix ListView.tsx — name on PurchaseOrder
**Type:** BROKEN
**Priority:** P2
**Files to modify:** `src/pages/ListView.tsx`
**Files to delete:** none
**What's wrong:** 2 TSC errors — page references `purchaseOrder.name` but PurchaseOrder type has no `name` field. PurchaseOrder has `poNumber` for display.
**What "fixed" looks like:**
- `name` reference changed to `poNumber` (or add `name?: string` to PurchaseOrder in TASK-001)
- `npx tsc --noEmit 2>&1 | grep "ListView"` returns 0 errors
**Dependencies:** TASK-001
**Supabase tables involved:** purchase_orders, automation_workflows, webhooks

---

### TASK-030: Fix EntityDetail.tsx — unknown properties
**Type:** BROKEN
**Priority:** P2
**Files to modify:** `src/pages/EntityDetail.tsx`
**Files to delete:** none
**What's wrong:** 3 TSC errors:
- `swmsSignedAt` — not on any type (Job has `swmsSigned: boolean` but not a timestamp)
- `completedAt` — Job does have `completedAt` so this may be a type access issue
- `email.metadata` possibly undefined — Communication metadata is optional
**What "fixed" looks like:**
- `swmsSignedAt` either removed or added to Job type as `swmsSignedAt?: string`
- Property access issues resolved with proper optional chaining
- `npx tsc --noEmit 2>&1 | grep "EntityDetail"` returns 0 errors
**Dependencies:** TASK-001
**Supabase tables involved:** All entity tables (this is the universal detail page)

---

### TASK-031: Fix QuoteDetail.tsx — Address rendered as ReactNode
**Type:** BROKEN
**Priority:** P2
**Files to modify:** `src/pages/Financials/QuoteDetail.tsx`
**Files to delete:** none
**What's wrong:** 1 TSC error — an Address object is being passed where a ReactNode is expected. The page likely renders `{account.address}` directly instead of formatting it as a string.
**What "fixed" looks like:**
- Address rendered as formatted string: `${address.street}, ${address.suburb} ${address.state} ${address.postcode}`
- `npx tsc --noEmit 2>&1 | grep "QuoteDetail"` returns 0 errors
**Dependencies:** none
**Supabase tables involved:** quotes, accounts

---

### TASK-032: Fix InventoryPage.tsx — missing properties
**Type:** BROKEN
**Priority:** P2
**Files to modify:** `src/pages/InventoryPage.tsx`
**Files to delete:** none
**What's wrong:** 3 TSC errors — page references `item.supplier`, `item.lastRestocked`, `item.location` but InventoryItem type only has: `name, sku, warehouseQty, reorderPoint, category, unitPrice`.
**What "fixed" looks like:**
- Either add `supplier?: string`, `lastRestocked?: string`, `location?: string` to InventoryItem type (TASK-001) OR remove these columns from the page
- `npx tsc --noEmit 2>&1 | grep "InventoryPage"` returns 0 errors
**Dependencies:** TASK-001
**Supabase tables involved:** inventory_items

---

### TASK-033: Fix QuotesList.tsx — missing methods + tax
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/Financials/QuotesList.tsx`
**Files to delete:** none
**What's wrong:** 3 TSC errors:
- `updateRecord` and `addRecord` don't exist on CRMContextType (covered by TASK-003)
- `quote.tax` should be `quote.taxTotal`
**What "fixed" looks like:**
- After TASK-003, `updateRecord`/`addRecord` resolve
- `quote.tax` changed to `quote.taxTotal`
- `npx tsc --noEmit 2>&1 | grep "QuotesList"` returns 0 errors
**Dependencies:** TASK-003
**Supabase tables involved:** quotes

---

### TASK-034: Fix ProductDetail.tsx — missing amount
**Type:** BROKEN
**Priority:** P2
**Files to modify:** `src/pages/ProductDetail.tsx`
**Files to delete:** none
**What's wrong:** 1 TSC error — references `amount` on a stat card computation. Likely should be `unitPrice` or `costPrice` from the Product type.
**What "fixed" looks like:**
- `amount` changed to the correct Product field
- `npx tsc --noEmit 2>&1 | grep "ProductDetail"` returns 0 errors
**Dependencies:** none
**Supabase tables involved:** products

---

### TASK-035: Fix ItemsCatalog.tsx — missing amount
**Type:** BROKEN
**Priority:** P2
**Files to modify:** `src/pages/Financials/ItemsCatalog.tsx`
**Files to delete:** none
**What's wrong:** 1 TSC error — similar to TASK-034, references `amount` in a stat card where `unitPrice` or another field should be used.
**What "fixed" looks like:**
- `amount` changed to correct field name
- `npx tsc --noEmit 2>&1 | grep "ItemsCatalog"` returns 0 errors
**Dependencies:** none
**Supabase tables involved:** products, services

---

### TASK-036: Fix SubscriptionsList.tsx — billingCycle enum mismatch
**Type:** BROKEN
**Priority:** P2
**Files to modify:** `src/pages/Financials/SubscriptionsList.tsx`
**Files to delete:** none
**What's wrong:** 1 TSC error — comparison against `"weekly"` which isn't in Subscription.billingCycle type (`'one-off' | 'monthly' | 'quarterly' | 'yearly' | 'custom'`).
**What "fixed" looks like:**
- Remove `"weekly"` comparison or add `'weekly'` to the Subscription.billingCycle union type
- `npx tsc --noEmit 2>&1 | grep "SubscriptionsList"` returns 0 errors
**Dependencies:** TASK-002
**Supabase tables involved:** subscriptions

---

### TASK-037: Fix Card.tsx — type prop incompatibility
**Type:** BROKEN
**Priority:** P3
**Files to modify:** `src/components/ui/Card.tsx`
**Files to delete:** none (unless TASK-010 deletes it)
**What's wrong:** Line 106 — the `type` prop on a button element is typed as `string | undefined` but `ButtonHTMLAttributes<HTMLButtonElement>` requires `"button" | "reset" | "submit" | undefined`.
**What "fixed" looks like:**
- The spread props explicitly cast or constrain the `type` attribute: `type={type as "button" | "reset" | "submit" | undefined}`
- OR the component's props interface constrains `type` to the valid button types
- `npx tsc --noEmit 2>&1 | grep "Card"` returns 0 errors
**Dependencies:** none (skip if TASK-010 deletes ui/ directory)
**Supabase tables involved:** none

---

### TASK-038: Fix JobsPage.tsx — possibly undefined name
**Type:** BROKEN
**Priority:** P2
**Files to modify:** `src/pages/JobsPage.tsx`
**Files to delete:** none
**What's wrong:** 1 TSC error — `j.name` is possibly undefined. Job type has `name?: string` (optional). The page renders it without a fallback.
**What "fixed" looks like:**
- `j.name` uses fallback: `j.name || j.subject || j.jobNumber`
- `npx tsc --noEmit 2>&1 | grep "JobsPage"` returns 0 errors
**Dependencies:** none
**Supabase tables involved:** jobs

---

## Housekeeping

### TASK-039: Fix useSupabaseData.ts — hardcoded org ID
**Type:** PARTIAL
**Priority:** P3
**Files to modify:** `src/hooks/useSupabaseData.ts`
**Files to delete:** none
**What's wrong:** Line 86 has a TODO: `setOrgId(demoMode ? DEMO_ORG_ID : DEMO_ORG_ID)` — both branches use the demo org ID. When real auth is implemented, the non-demo branch should fetch the user's actual org ID from Supabase.
**What "fixed" looks like:**
- Non-demo branch queries `organization_users` table with the authenticated user's ID to get their org
- Demo branch still uses `DEMO_ORG_ID`
- TODO comment removed
**Dependencies:** Requires auth implementation to be complete
**Supabase tables involved:** organization_users, organizations

---

### TASK-040: Add missing sidebar links for orphaned routes
**Type:** PARTIAL
**Priority:** P3
**Files to modify:** `src/App.tsx`
**Files to delete:** none
**What's wrong:** Two routes exist but have no sidebar navigation entry:
- `/logistics-hub` → LogisticsDashboard (accessible only by typing URL directly)
- `/ai-suite` → AIImageSuite (accessible only by typing URL directly)
**What "fixed" looks like:**
- Either add sidebar links for these routes in the appropriate nav section
- OR remove the routes if they're intentionally hidden (and note the decision)
**Dependencies:** none
**Supabase tables involved:** none

---

## Noop Handler / Placeholder UI Tasks

### TASK-041: Wire up EquipmentPage.tsx noop buttons
**Type:** PARTIAL
**Priority:** P2
**Files to modify:** `src/pages/EquipmentPage.tsx`
**Files to delete:** none
**What's wrong:** 5 buttons have no onClick handler (rendered as noop):
- Line ~291: "Schedule Maintenance" bulk action button
- Line ~293: "Update Status" bulk action button
- Line ~439: "Edit" button in expanded row
- Line ~442: "Schedule Service" button in expanded row
- Line ~485: "Schedule All" button in maintenance alert
**What "fixed" looks like:**
- Each button either calls a real handler (e.g., `openModal('equipment', item)` for Edit) or is removed/disabled with a tooltip explaining the feature isn't available yet
- No buttons silently do nothing on click
**Dependencies:** none
**Supabase tables involved:** equipment

---

### TASK-042: Wire up InventoryPage.tsx noop buttons + fix dynamic Tailwind
**Type:** PARTIAL
**Priority:** P2
**Files to modify:** `src/pages/InventoryPage.tsx`
**Files to delete:** none
**What's wrong:** 5 buttons have no onClick handler (rendered as noop):
- Line ~233: "Create PO" bulk action button
- Line ~236: "Adjust Stock" bulk action button
- Line ~381: "Adjust Stock" button in expanded row
- Line ~384: "Create PO" button in expanded row
- Line ~427: "Create Purchase Order" button in low stock alert

Also: Dynamic Tailwind class names using template strings (`` bg-${stockStatus.color}-50 ``) will not work with Tailwind JIT compilation since classes aren't statically detectable.
**What "fixed" looks like:**
- Noop buttons wired to real handlers or disabled with explanation
- Dynamic Tailwind classes replaced with a static class map: `const colorMap = { red: 'bg-red-50', yellow: 'bg-yellow-50', green: 'bg-green-50' }`
**Dependencies:** none
**Supabase tables involved:** inventory_items, purchase_orders

---

### TASK-043: Wire up JobsPage.tsx noop buttons
**Type:** PARTIAL
**Priority:** P2
**Files to modify:** `src/pages/JobsPage.tsx`
**Files to delete:** none
**What's wrong:** 5 buttons have no onClick handler (rendered as noop):
- Line ~314: "Assign Crew" bulk action button
- Line ~317: "Update Status" bulk action button
- Line ~463: "View Details" button in expanded row (should navigate to `/jobs/:id`)
- Line ~466: "Edit" button in expanded row
- Line ~469: "Assign Crew" button in expanded row

Also: Potential division by zero at line ~239 if `stats.total` is 0 when calculating `(stats.completed / stats.total) * 100`.
**What "fixed" looks like:**
- "View Details" navigates to `/jobs/${job.id}`
- "Edit" calls `openModal('jobs', job)`
- Bulk actions call appropriate handlers or are disabled
- Division by zero guarded: `stats.total > 0 ? (stats.completed / stats.total) * 100 : 0`
**Dependencies:** none
**Supabase tables involved:** jobs, crews

---

### TASK-044: Wire up or replace JobMarketplacePage.tsx (fully mock)
**Type:** PARTIAL
**Priority:** P3
**Files to modify:** `src/pages/JobMarketplacePage.tsx`
**Files to delete:** none
**What's wrong:** Entire page uses hardcoded mock data (4 contractors, 4 customer jobs, 5 parts). Does not use CRMContext at all. 7+ buttons have no onClick handler:
- "Export" button (line ~158)
- "Add Contractor" / "Post Job" / "Add Part" button (line ~162)
- "Contact" button on contractor cards (line ~295)
- "View" button on contractor cards (line ~298)
- "Place Bid" button on customer jobs (line ~359)
- "View Details" button on customer jobs (line ~362)
- "Add to Cart" button on parts (line ~415)
**What "fixed" looks like:**
- Either connect page to CRMContext data (contractors from accounts, jobs from jobs, parts from inventoryItems/products) and wire up buttons
- OR mark the entire page as a preview/coming-soon with a clear banner, and disable all action buttons
**Dependencies:** none
**Supabase tables involved:** accounts, jobs, products, inventory_items (if connected)

---

### TASK-045: Wire up FieldServicesDashboard.tsx noop button
**Type:** PARTIAL
**Priority:** P3
**Files to modify:** `src/pages/FieldServicesDashboard.tsx`
**Files to delete:** none
**What's wrong:** "Assign Crew" bulk action button (line ~420) has no onClick handler.
**What "fixed" looks like:**
- Button either triggers a crew assignment modal/flow or is disabled with explanation
**Dependencies:** none
**Supabase tables involved:** jobs, crews

---

### TASK-046: Fix LogisticsDashboard.tsx — noop button + dead state + dynamic Tailwind
**Type:** PARTIAL
**Priority:** P3
**Files to modify:** `src/pages/LogisticsDashboard.tsx`
**Files to delete:** none
**What's wrong:**
- "Create PO" bulk action button (line ~397) has no onClick handler
- `activeTab` state (`'inventory' | 'equipment' | 'pos'`) is declared but never used — no tab-switching UI is rendered, page always shows inventory
- Dynamic Tailwind class `` bg-${stockStatus.color}-50 `` won't work with JIT
**What "fixed" looks like:**
- PO button wired up or disabled
- Either add tab-switching UI or remove the dead `activeTab` state
- Dynamic Tailwind replaced with static class map
**Dependencies:** none
**Supabase tables involved:** inventory_items, equipment, purchase_orders

---

### TASK-047: Fix Login.tsx — decorative "Remember me" checkbox
**Type:** VISUAL
**Priority:** P3
**Files to modify:** `src/pages/Login.tsx`
**Files to delete:** none
**What's wrong:** "Remember me" checkbox (line ~106) is rendered but has no `checked` state or `onChange` handler. It's purely decorative — clicking it does nothing.
**What "fixed" looks like:**
- Either wire checkbox to `localStorage` to persist session preference
- OR remove the checkbox entirely if session persistence isn't planned
**Dependencies:** none
**Supabase tables involved:** none

---

### TASK-048: Fix ListView.tsx — incomplete Kanban drag-and-drop
**Type:** PARTIAL
**Priority:** P3
**Files to modify:** `src/pages/ListView.tsx`
**Files to delete:** none
**What's wrong:** Kanban board cards are marked `draggable` but no drag-and-drop handlers are implemented (`onDragStart`, `onDragOver`, `onDrop` are missing). Users can grab cards but can't drop them anywhere — the interaction is misleading.
**What "fixed" looks like:**
- Either implement drag-and-drop to update deal stages via `upsertRecord`
- OR remove the `draggable` attribute from cards to avoid misleading UI
**Dependencies:** none
**Supabase tables involved:** deals

---

### TASK-049: Fix EntityDetail.tsx — noop buttons + window.location.reload
**Type:** PARTIAL
**Priority:** P2
**Files to modify:** `src/pages/EntityDetail.tsx`
**Files to delete:** none
**What's wrong:**
- Line ~1110: "Forward" button has `onClick={(e) => e.stopPropagation()}` — stops propagation but does nothing else
- Line ~1251: "Add Note" button in expanded communication view — same noop pattern
- Lines ~163 and ~170-175: `window.location.reload()` used for deal closing and quote acceptance instead of React state refresh
- Heavy use of `(entity as any)` / `(e as any)` throughout
**What "fixed" looks like:**
- "Forward" button either opens a forward dialog or is removed
- "Add Note" button wires to the existing `addNote()` function
- `window.location.reload()` replaced with CRMContext state refresh (re-fetch or state mutation)
- `as any` casts reduced by using proper type guards based on entityType
**Dependencies:** TASK-001 (type fixes reduce need for `as any`)
**Supabase tables involved:** All entity tables

---

### TASK-050: Wire up CrewsPage.tsx noop buttons
**Type:** PARTIAL
**Priority:** P2
**Files to modify:** `src/pages/CrewsPage.tsx`
**Files to delete:** none
**What's wrong:** 4 buttons have no onClick handler:
- Line ~293: "Assign Job" bulk action button
- Line ~296: "Update Status" bulk action button
- Line ~444: "Edit" button in expanded row
- Line ~447: "Assign to Job" button in expanded row
**What "fixed" looks like:**
- "Edit" calls `openModal('crews', crew)`
- Bulk actions and "Assign to Job" either open assignment flows or are disabled with explanation
**Dependencies:** none
**Supabase tables involved:** crews, jobs

---

### TASK-051: Wire up AIWritingTools.tsx noop buttons + document mocked AI
**Type:** PARTIAL
**Priority:** P3
**Files to modify:** `src/pages/AIWritingTools.tsx`
**Files to delete:** none
**What's wrong:**
- AI text processing is mocked: `setTimeout` + hardcoded string transformations (not calling Gemini or any AI API)
- 3 buttons have no onClick handler:
  - Line ~254: "New Template" button
  - Line ~285: Template "Copy" button
  - Line ~316: "Configure Integration" button
**What "fixed" looks like:**
- Either connect AI processing to the Gemini service (`services/gemini.ts`) or add a visible "Mock Mode" banner
- Noop buttons wired to handlers or disabled
**Dependencies:** none
**Supabase tables involved:** none

---

### TASK-052: Fix CommsHub.tsx — "Reply" button noop
**Type:** PARTIAL
**Priority:** P2
**Files to modify:** `src/pages/CommsHub.tsx`
**Files to delete:** none
**What's wrong:** "Reply" button (line ~564) renders but has no onClick handler — clicking does nothing.
**What "fixed" looks like:**
- "Reply" opens EmailComposer or inline reply form pre-populated with the original communication context
**Dependencies:** TASK-016 (CommsHub type fixes)
**Supabase tables involved:** communications

---

### TASK-053A: Fix Reports.tsx — Object.amounts runtime crash + property mismatch
**Type:** BROKEN
**Priority:** P0
**Files to modify:** `src/pages/Reports.tsx`
**Files to delete:** none
**What's wrong:** Two critical runtime bugs beyond the TSC errors in TASK-023:
- Line ~498: `Object.amounts(metrics.dealsByStage)` — typo, should be `Object.values(...)`. This will throw a **runtime TypeError** and crash the Pipeline Analysis report tab.
- Lines ~168, ~184: SimpleBarChart and SimplePieChart components reference `item.amount`, but data objects use `item.value`. Charts render with undefined heights/slices.
- Line ~134: Export button handler is `alert('Export functionality would generate PDF/CSV reports')` — stub.
- All trend percentages ("+12%", "+5%", etc.) are hardcoded, not computed.
**What "fixed" looks like:**
- `Object.amounts` changed to `Object.values`
- Chart data property references use `item.value` consistently
- Pipeline Analysis tab renders without crashing
- Charts display correct data
**Dependencies:** TASK-023 (TSC errors in same file)
**Supabase tables involved:** deals, invoices, communications, jobs

---

### TASK-053B: Fix SettingsView.tsx — IntegrationCard field.amount bug + noop buttons
**Type:** BROKEN
**Priority:** P1
**Files to modify:** `src/pages/SettingsView.tsx`
**Files to delete:** none
**What's wrong:** Beyond the 118 implicit `any` errors (TASK-004):
- **Line ~2036:** IntegrationCard component renders `value={field.amount}` instead of `value={field.value}`. ALL integration configuration fields (Stripe keys, Twilio credentials, SendGrid API keys, etc.) display `undefined`/blank even when data is saved.
- 10+ buttons have no onClick handler:
  - "Add Custom Field", "Add Custom Role", "Create Team", "Create Custom Blueprint", "Add Section", delete custom field, "Add Tax Rate", "Add Warehouse", "Add Sender" buttons
  - Section gear button (line ~1067)
  - "Reset PW" button uses `alert()` only (line ~533)
  - "Recent Exports" download buttons are decorative with hardcoded data
- Hardcoded stats: "5 Active Workflows" (line ~879), "3 Active Webhooks" (line ~893)
**What "fixed" looks like:**
- `field.amount` changed to `field.value` in IntegrationCard
- Integration config fields display their stored values correctly
- Noop buttons either wired to handlers or disabled with tooltip
**Dependencies:** TASK-004 (implicit any in same file)
**Supabase tables involved:** organizations

---

### TASK-053C: Wire up ProcurementPage.tsx noop buttons
**Type:** PARTIAL
**Priority:** P2
**Files to modify:** `src/pages/ProcurementPage.tsx`
**Files to delete:** none
**What's wrong:** 6 buttons have no onClick handler:
- "Add Supplier" button (line ~245)
- "New RFQ" button (line ~248)
- "Add Supplier" empty state button (line ~469)
- "Create RFQ" empty state button (line ~560)
- "Send RFQ" selection action (line ~630)
- "Export" selection action (line ~632)
**What "fixed" looks like:**
- "Add Supplier" opens `openModal('accounts')` pre-filtered to vendor type
- "New RFQ" opens a create RFQ flow
- Selection actions wired or disabled
**Dependencies:** none
**Supabase tables involved:** accounts, rfqs, supplier_quotes

---

### TASK-053D: Wire up PurchaseOrdersPage.tsx noop buttons
**Type:** PARTIAL
**Priority:** P2
**Files to modify:** `src/pages/PurchaseOrdersPage.tsx`
**Files to delete:** none
**What's wrong:** 4 buttons have no onClick handler:
- "New PO" button (line ~192)
- "Create Purchase Order" empty state button (line ~463)
- "Update Status" selection action (line ~474)
- "Export Selected" selection action (line ~477)
**What "fixed" looks like:**
- "New PO" opens `openModal('purchaseOrders')`
- Selection actions wired or disabled
**Dependencies:** none
**Supabase tables involved:** purchase_orders

---

### TASK-053E: Wire up WarehousePage.tsx noop buttons
**Type:** PARTIAL
**Priority:** P2
**Files to modify:** `src/pages/WarehousePage.tsx`
**Files to delete:** none
**What's wrong:** 4 buttons have no onClick handler:
- "Stock Movement" button (line ~225)
- "Add Location" button (line ~228)
- "Move Items" selection action (line ~531)
- "Cycle Count" selection action (line ~534)
**What "fixed" looks like:**
- Buttons wired to appropriate handlers or disabled with explanation
**Dependencies:** none
**Supabase tables involved:** warehouse_locations, inventory_items

---

### TASK-053F: Wire up TeamChat.tsx noop buttons
**Type:** PARTIAL
**Priority:** P3
**Files to modify:** `src/pages/TeamChat.tsx`
**Files to delete:** none
**What's wrong:** 7+ buttons/features have no handler:
- "Pin Chat" (line ~441)
- "Mute Notifications" (line ~447)
- "Search in Chat" (line ~453)
- "Add to Favorites" (line ~457)
- "Archive Chat" (line ~461)
- "Leave Channel" (line ~466)
- Paperclip attachment button (line ~541)
- `getUnreadCount()` always returns 0 (line ~243)
- @mention commands (remind, task, meeting) are UI-only with no backend
**What "fixed" looks like:**
- Core actions (pin, mute, archive, leave) wired to CRMContext state updates
- Attachment button either opens file picker or is disabled
- `getUnreadCount` calculates from actual message timestamps
**Dependencies:** none
**Supabase tables involved:** chat_messages, conversations

---

### TASK-053G: Wire up ZonesPage.tsx noop buttons
**Type:** PARTIAL
**Priority:** P3
**Files to modify:** `src/pages/ZonesPage.tsx`
**Files to delete:** none
**What's wrong:** 2 buttons in expanded rows have no onClick handler:
- "Edit" button (line ~286)
- "View Jobs" button (line ~288)
**What "fixed" looks like:**
- "Edit" calls `openModal('zones', zone)`
- "View Jobs" navigates to `/jobs?zone=${zone.id}` or similar filter
**Dependencies:** none
**Supabase tables involved:** zones, jobs

---

### TASK-053H: Fix SupportTickets.tsx hardcoded currentUserId
**Type:** PARTIAL
**Priority:** P2
**Files to modify:** `src/pages/SupportTickets.tsx`
**Files to delete:** none
**What's wrong:** Line 29 hardcodes `currentUserId = 'user-1'` instead of getting the actual logged-in user from CRMContext. This means ticket ownership and "assigned to me" filters always reference user-1 regardless of who is logged in.
**What "fixed" looks like:**
- `currentUserId` sourced from `useCRM().currentUser?.id`
- Ticket views correctly filter by the actual logged-in user
**Dependencies:** none
**Supabase tables involved:** tickets, users

---

### TASK-053: Fix BlueprintDetailPage.tsx — decorative Eye/EyeOff toggles
**Type:** VISUAL
**Priority:** P3
**Files to modify:** `src/pages/BlueprintDetailPage.tsx`
**Files to delete:** none
**What's wrong:** Eye/EyeOff toggle buttons on entity fields (lines ~183, ~298-303) have no onClick handlers. They appear interactive but are purely decorative.
**What "fixed" looks like:**
- Either wire toggles to show/hide fields in the active blueprint configuration
- OR remove the toggle icons if field visibility control isn't planned
**Dependencies:** TASK-018 (BlueprintDetailPage type fixes)
**Supabase tables involved:** industry_templates

---

### TASK-054: Fix CRMContext resetSupabaseDemo — incomplete collection reload
**Type:** BROKEN
**Priority:** P2
**Files to modify:** `src/context/CRMContext.tsx`
**Files to delete:** none
**What's wrong:** The `resetSupabaseDemo` function (lines ~800-844) reloads some collections after reset but misses many: `quotes`, `communications`, `calendarEvents`, `purchaseOrders`, `bankTransactions`, `expenses`, `reviews`, `subscriptions`, `referralRewards`, `inboundForms`, `chatWidgets`, `calculators`, `automationWorkflows`, `webhooks`, `industryTemplates`, `conversations`, `chatMessages`, `notifications`, `documents`, `auditLogs`. After a demo reset, these collections retain stale data from the previous session.
**What "fixed" looks like:**
- `resetSupabaseDemo` reloads ALL collections via `loadAllCRMData()` after the RPC call completes
- OR individually reloads each missing collection
- Demo reset produces a clean state with no stale data
**Dependencies:** none
**Supabase tables involved:** All 41 mapped tables

---

### TASK-055: Fix env var prefix — n8n.ts and paypal.ts use non-VITE_ vars
**Type:** ERROR
**Priority:** P2
**Files to modify:** `src/services/n8n.ts`, `src/services/paypal.ts`, `src/vite-env.d.ts`
**Files to delete:** none
**What's wrong:** Vite only exposes `VITE_`-prefixed environment variables to client-side code. These services reference non-prefixed vars that will always be `undefined` at runtime:
- `n8n.ts`: uses `N8N_API_URL`, `N8N_API_KEY` (should be `VITE_N8N_API_URL`, `VITE_N8N_API_KEY`)
- `paypal.ts`: uses `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE` (should be `VITE_PAYPAL_CLIENT_ID`, etc.)
- `vite-env.d.ts`: declares types for these non-prefixed vars, giving a false sense of availability
**What "fixed" looks like:**
- All client-side env var references use `VITE_` prefix
- `vite-env.d.ts` updated to match
- Services correctly read their config when env vars are set
**Dependencies:** none
**Supabase tables involved:** none

---

### TASK-056: Fix types.ts typo — winningSupplierIdId
**Type:** ERROR
**Priority:** P3
**Files to modify:** `src/types.ts`
**Files to delete:** none
**What's wrong:** Line 1238 in the `RFQ` interface has a typo: `winningSupplierIdId` (double "Id"). Should be `winningSupplierId`.
**What "fixed" looks like:**
- `winningSupplierIdId` renamed to `winningSupplierId`
- Any code referencing this field updated to match
**Dependencies:** none
**Supabase tables involved:** rfqs

---

### TASK-057: Fix CRMContext hardcoded marketing/ops stats
**Type:** PARTIAL
**Priority:** P3
**Files to modify:** `src/context/CRMContext.tsx`
**Files to delete:** none
**What's wrong:** Dashboard stats are partially hardcoded instead of calculated from data:
- `marketingStats` (line ~2263): `roi: 3.5`, `leadsBySource: {}`, `campaignPerformance: []` are placeholder values
- `opsStats` (line ~2264): `efficiencySaved: 42`, `projectsCompleted: 12`, `urgentTickets: 5` are hardcoded
**What "fixed" looks like:**
- `marketingStats.roi` calculated from actual campaign spend vs revenue
- `leadsBySource` populated from leads grouped by source field
- `opsStats` derived from actual ticket/task/job data
**Dependencies:** none
**Supabase tables involved:** campaigns, leads, tickets, tasks, jobs

---

## Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0       | 4     | Foundation type fixes + runtime crash in Reports.tsx |
| P1       | 17    | Page-level fixes + implicit any cleanup + SettingsView integration bug |
| P2       | 27    | Lower-impact page fixes + dead code removal + noop buttons + data layer fixes |
| P3       | 17    | Housekeeping, optional cleanup, future work, placeholder UI |
| **Total** | **65** | |

### Recommended Execution Order

1. **TASK-001** + **TASK-002** + **TASK-003** (foundation — unblocks most downstream tasks)
2. **TASK-004** + **TASK-005** + **TASK-007** (implicit any + audit log fix)
3. **TASK-006** (seed data — depends on TASK-001/002)
4. **TASK-009** then **TASK-008** (dead imports then dead files)
5. **TASK-011 through TASK-038** (page fixes — many auto-resolve after step 1)
6. **TASK-041 through TASK-053** (noop buttons + placeholder UI)
7. **TASK-010**, **TASK-039**, **TASK-040** (optional cleanup)

After completing TASK-001 through TASK-003, re-run `npx tsc --noEmit` — many page-level errors may auto-resolve, potentially making TASK-011 through TASK-038 unnecessary or trivial.
