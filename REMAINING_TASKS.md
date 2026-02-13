# CatchaCRM Remaining Tasks

**Generated:** 2026-02-13
**Source:** TASKS_STATUS.md audit
**Total Remaining:** 2 confirmed + 28 needing verification

---

## CONFIRMED NEEDED (2 Tasks)

### Task 1: TASK-008 - Delete 13 Dead Files

**Priority:** P2
**Type:** DEAD CODE
**Effort:** 5 minutes

**What's wrong:**
All 13 dead files identified in the original audit still exist and are not imported by any active route or component. They add unnecessary bundle size and confusion.

**Files to delete:**
1. `src/pages/Dashboard.tsx`
2. `src/pages/BillingView.tsx`
3. `src/pages/DetailView.tsx`
4. `src/pages/RecordDetail.tsx`
5. `src/pages/TaskManagement.tsx`
6. `src/pages/FinancialsView.tsx`
7. `src/pages/Logistics/Warehouse.tsx`
8. `src/pages/Logistics/Procurement.tsx`
9. `src/pages/Logistics/JobMarketplace.tsx`
10. `src/pages/SupportHub.tsx`
11. `src/pages/TicketManagement.tsx`
12. `src/hooks/useSupabaseData.ts`
13. `src/lib/service-config.ts`

**Prompt for Claude Code:**

```
Delete the 13 dead files that are not imported anywhere:

GLOBAL RULES:
- READ ONLY verification first - confirm each file is truly unused
- Verify no import statements reference these files
- Run build after deletion to confirm no breakage

TASK:
1. Verify each file is not imported:
   - grep -r "from.*Dashboard'" src/
   - grep -r "from.*BillingView'" src/
   - grep -r "from.*DetailView'" src/
   - grep -r "from.*RecordDetail'" src/
   - grep -r "from.*TaskManagement'" src/
   - grep -r "from.*FinancialsView'" src/
   - grep -r "from.*Logistics/Warehouse'" src/
   - grep -r "from.*Logistics/Procurement'" src/
   - grep -r "from.*Logistics/JobMarketplace'" src/
   - grep -r "from.*SupportHub'" src/
   - grep -r "from.*TicketManagement'" src/
   - grep -r "from.*useSupabaseData'" src/
   - grep -r "from.*service-config'" src/

2. If all grep results are empty, delete files:
   rm src/pages/Dashboard.tsx
   rm src/pages/BillingView.tsx
   rm src/pages/DetailView.tsx
   rm src/pages/RecordDetail.tsx
   rm src/pages/TaskManagement.tsx
   rm src/pages/FinancialsView.tsx
   rm src/pages/Logistics/Warehouse.tsx
   rm src/pages/Logistics/Procurement.tsx
   rm src/pages/Logistics/JobMarketplace.tsx
   rm src/pages/SupportHub.tsx
   rm src/pages/TicketManagement.tsx
   rm src/hooks/useSupabaseData.ts
   rm src/lib/service-config.ts

3. Verify build still passes:
   npm run build

VERIFICATION:
- [ ] Each file confirmed unused via grep
- [ ] All 13 files deleted
- [ ] npm run build succeeds
- [ ] No import errors in console

COMMIT:
feat(cleanup): remove 13 dead files not referenced by any routes
```

---

### Task 2: TASK-044 - Fix JobMarketplacePage.tsx Hardcoded Mock Data

**Priority:** P3
**Type:** PARTIAL
**Effort:** 30-45 minutes

**What's wrong:**
JobMarketplacePage.tsx uses hardcoded mock data for contractors, customer jobs, and parts catalog (lines 67-89). Does not use CRMContext at all. Multiple buttons have no real onClick handlers because there's no data layer to interact with.

**Hardcoded data:**
- `contractors: Contractor[]` - 4 hardcoded contractors
- `customerJobs: CustomerJob[]` - 4 hardcoded jobs
- `partsCatalog: PartItem[]` - 5 hardcoded parts

**Noop buttons:**
- "Export" button
- "Add Contractor" / "Post Job" / "Add Part" button
- "Contact" button on contractor cards
- "View" button on contractor cards
- "Place Bid" button on customer jobs
- "View Details" button on customer jobs
- "Add to Cart" button on parts

**Resolution options:**

**OPTION A (Recommended):** Connect to real data
- Contractors → `accounts.filter(a => a.type === 'Vendor' || a.accountType === 'Contractor')`
- Customer jobs → `jobs` from CRMContext
- Parts → `products` or `inventoryItems` from CRMContext
- Wire all buttons to real handlers

**OPTION B:** Mark as preview/coming-soon
- Add visible "PREVIEW - NOT CONNECTED TO DATA" banner at top
- Disable all action buttons with tooltips explaining they're not available
- Keep mock data for visual reference

**Prompt for Claude Code (OPTION A - Connect to Real Data):**

```
Connect JobMarketplacePage.tsx to real CRMContext data and wire up all buttons.

GLOBAL RULES:
- Import useCRM hook from CRMContext
- Map existing CRM data to marketplace types
- Wire all buttons to real handlers (openModal, navigate, upsertRecord)
- Preserve existing UI/UX - only change data source and handlers

TASK:

1. Import CRM context:
   const { accounts, jobs, products, inventoryItems, openModal, upsertRecord } = useCRM();
   const navigate = useNavigate();

2. Replace hardcoded contractors with real accounts:
   const contractors = useMemo(() => {
     return accounts
       .filter(a => a.accountType === 'Vendor' || a.accountType === 'Contractor')
       .map(a => ({
         id: a.id,
         name: a.name,
         specialty: a.industry || 'General',
         rating: 4.5, // TODO: Add rating field to Account type
         completedJobs: 0, // TODO: Calculate from jobs
         hourlyRate: 95, // TODO: Add rate field to Account type
         location: a.address ? `${a.address.suburb}, ${a.address.state}` : 'Unknown',
         verified: true,
         available: true
       }));
   }, [accounts]);

3. Replace hardcoded customerJobs with real jobs:
   const customerJobs = useMemo(() => {
     return jobs
       .filter(j => j.status === 'Scheduled' || j.status === 'InProgress')
       .map(j => ({
         id: j.id,
         title: j.subject || j.name || 'Untitled Job',
         customerName: accounts.find(a => a.id === j.accountId)?.name || 'Unknown',
         location: j.location || 'Unknown',
         budget: j.estimatedValue || 0,
         urgency: j.priority === 1 ? 'Urgent' : j.priority === 2 ? 'High' : 'Medium',
         category: j.type || 'General',
         postedDate: j.createdAt || new Date().toISOString(),
         bids: 0 // TODO: Add bids tracking
       }));
   }, [jobs, accounts]);

4. Replace hardcoded partsCatalog with real products/inventory:
   const partsCatalog = useMemo(() => {
     const productItems = products.map(p => ({
       id: p.id,
       name: p.name,
       sku: p.sku || '',
       supplier: 'Product Catalog',
       price: p.unitPrice || 0,
       stock: 999, // Products don't track stock
       category: p.category || 'General',
       image: ''
     }));

     const inventoryParts = inventoryItems.map(i => ({
       id: i.id,
       name: i.name,
       sku: i.sku,
       supplier: i.supplier || 'Unknown',
       price: i.unitPrice || 0,
       stock: i.warehouseQty || 0,
       category: i.category || 'General',
       image: ''
     }));

     return [...productItems, ...inventoryParts];
   }, [products, inventoryItems]);

5. Wire up buttons:
   - "Add Contractor" → openModal('accounts', undefined, { accountType: 'Contractor' })
   - "Post Job" → openModal('jobs')
   - "Add Part" → openModal('products')
   - "Contact" (contractor) → navigate(`/accounts/${contractor.id}`)
   - "View" (contractor) → navigate(`/accounts/${contractor.id}`)
   - "View Details" (job) → navigate(`/jobs/${job.id}`)
   - "Place Bid" → openModal('quotes', undefined, { jobId: job.id })
   - "Add to Cart" → // TODO: Implement cart system or disable

VERIFICATION:
- [ ] Page imports useCRM hook
- [ ] Contractors list shows real vendor/contractor accounts
- [ ] Customer jobs list shows real jobs from CRMContext
- [ ] Parts catalog shows real products + inventory items
- [ ] "Add Contractor" button opens account modal
- [ ] "Post Job" button opens job modal
- [ ] "View" buttons navigate to entity detail pages
- [ ] npm run build succeeds
- [ ] No console errors

COMMIT:
feat(marketplace): connect JobMarketplacePage to real CRMContext data

- Replace hardcoded contractors with filtered accounts
- Replace hardcoded jobs with real jobs from context
- Replace hardcoded parts with products + inventory items
- Wire all action buttons to real handlers
- Remove 366 lines of mock data
```

**Prompt for Claude Code (OPTION B - Mark as Preview):**

```
Mark JobMarketplacePage.tsx as a preview/coming-soon feature with disabled buttons.

GLOBAL RULES:
- Add clear visual banner indicating preview mode
- Disable all action buttons
- Add tooltips explaining why buttons are disabled
- Keep mock data for visual reference

TASK:

1. Add preview banner at top of page (after breadcrumb):
   <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
     <div className="flex items-center gap-3">
       <AlertCircle className="w-5 h-5 text-yellow-600" />
       <div>
         <h3 className="font-medium text-yellow-900">Preview Mode</h3>
         <p className="text-sm text-yellow-700">
           This marketplace feature is not yet connected to your CRM data. The contractors, jobs, and parts shown are sample data for demonstration purposes only.
         </p>
       </div>
     </div>
   </div>

2. Disable all action buttons with tooltips:
   - "Export" → disabled with title="Feature coming soon"
   - "Add Contractor" → disabled with title="Connect to CRM data to add contractors"
   - "Post Job" → disabled with title="Connect to CRM data to post jobs"
   - "Add Part" → disabled with title="Connect to CRM data to manage parts"
   - "Contact" → disabled with title="Preview only - connect to CRM data to contact contractors"
   - "View" → disabled with title="Preview only"
   - "Place Bid" → disabled with title="Connect to CRM data to place bids"
   - "View Details" → disabled with title="Preview only"
   - "Add to Cart" → disabled with title="Cart feature coming soon"

3. Update button styling to show disabled state:
   className="... opacity-50 cursor-not-allowed"

VERIFICATION:
- [ ] Yellow preview banner visible at top
- [ ] All action buttons visually disabled
- [ ] Tooltips explain why buttons are disabled
- [ ] Page still renders correctly with mock data
- [ ] npm run build succeeds

COMMIT:
feat(marketplace): add preview mode banner and disable action buttons

- Add yellow banner explaining preview mode
- Disable all action buttons with explanatory tooltips
- Keep mock data for visual demonstration
```

---

## NEEDS MANUAL VERIFICATION (28 Tasks)

The following tasks require manual inspection that cannot be reliably automated via grep. Many may already be resolved during Supabase wiring phases:

### Noop Button Tasks (18 pages)

**Quick Check Script:**
```bash
# For each page, open in editor and search for onClick handlers
# Look for patterns like:
#   onClick={() => {}} - empty handler
#   onClick={(e) => e.stopPropagation()} - noop propagation stop
#   onClick={() => console.log(...)} - debug stub
#   onClick={() => alert(...)} - placeholder alert

# Pages to check:
src/pages/EquipmentPage.tsx           # TASK-041 - 5 buttons
src/pages/InventoryPage.tsx           # TASK-042 - 5 buttons + dynamic Tailwind
src/pages/JobsPage.tsx                # TASK-043 - 5 buttons + division by zero
src/pages/FieldServicesDashboard.tsx  # TASK-045 - 1 button
src/pages/LogisticsDashboard.tsx      # TASK-046 - 1 button + dead state
src/pages/Login.tsx                   # TASK-047 - "Remember me" checkbox
src/pages/ListView.tsx                # TASK-048 - Kanban drag-and-drop
src/pages/EntityDetail.tsx            # TASK-049 - 2 buttons + window.reload
src/pages/CrewsPage.tsx               # TASK-050 - 4 buttons
src/pages/AIWritingTools.tsx          # TASK-051 - 3 buttons + mocked AI
src/pages/CommsHub.tsx                # TASK-052 - "Reply" button
src/pages/BlueprintDetailPage.tsx     # TASK-053 - Eye/EyeOff toggles
src/pages/ProcurementPage.tsx         # TASK-053C - 6 buttons
src/pages/PurchaseOrdersPage.tsx      # TASK-053D - 4 buttons
src/pages/WarehousePage.tsx           # TASK-053E - 4 buttons
src/pages/TeamChat.tsx                # TASK-053F - 7+ buttons
src/pages/ZonesPage.tsx               # TASK-053G - 2 buttons
```

### Other Verification Tasks

**TASK-039** - useSupabaseData.ts hardcoded org ID
- File: `src/hooks/useSupabaseData.ts`
- Check line ~86 for: `setOrgId(demoMode ? DEMO_ORG_ID : DEMO_ORG_ID)`
- Expected: Non-demo branch should fetch user's actual org from Supabase
- Priority: P3

**TASK-040** - Missing sidebar links for orphaned routes
- Check if `/logistics-hub` and `/ai-suite` routes have sidebar navigation entries
- If not, decide whether to add links or remove routes
- Priority: P3

---

## Recommended Execution Strategy

### Phase 1: Quick Wins (15 minutes)
1. Execute TASK-008 (delete 13 dead files)
2. Verify build still passes

### Phase 2: High-Value Fix (45 minutes)
3. Execute TASK-044 Option A (connect JobMarketplacePage to real data)
   - OR Option B if time-constrained (mark as preview)

### Phase 3: Manual Verification Sprint (2-3 hours)
4. Go through noop button tasks systematically
5. For each page:
   - Open in editor
   - Search for `onClick`
   - Check each handler - is it functional or noop?
   - If noop, wire to real handler or disable with tooltip
   - Test the page manually
   - Commit atomic change

### Phase 4: Cleanup (30 minutes)
6. TASK-039 - Fix useSupabaseData.ts org ID (if file still used)
7. TASK-040 - Add sidebar links or remove orphaned routes

---

## Success Criteria

After completing all remaining tasks:

- [ ] 0 dead files in codebase
- [ ] JobMarketplacePage connected to real data OR clearly marked as preview
- [ ] All interactive buttons either functional or explicitly disabled
- [ ] No misleading UI (draggable cards that can't be dropped, checkboxes that don't persist, etc.)
- [ ] Build passes clean
- [ ] No console errors during normal navigation

---

## Notes

- The 366 onClick patterns found across the codebase include many functional handlers (setActiveTab, navigation, etc.). Manual verification is needed to separate functional from noop.
- Many noop button tasks may have been auto-resolved during the 11 Supabase wiring phases, but this cannot be confirmed without manual inspection.
- Focus on user-facing pages first (Jobs, Equipment, Inventory, Crews) before internal tools (AI Writing, Blueprints).

---

**Generated by:** READ ONLY audit (no code modified)
**Next step:** Execute TASK-008 and TASK-044, then begin manual verification sprint for noop buttons.
