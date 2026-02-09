# Next Steps - UI Completion for Flash Integrated

## ✅ COMPLETED (M03)
- All 17 entity types added to types.ts
- Full CRUD in CRMContext
- Seed data for all entities
- Modal forms for all entities
- Basic navigation and routes

## 🔴 MISSING / NEEDS FIXING

### 1. **Navigation Structure Issues**
- [ ] Move Automation (Workflows, Webhooks) to Settings page
- [ ] Move Industry Templates to Settings page
- [ ] Keep Field Services, Logistics as separate sections

### 2. **Missing Dashboard Pages** (5 new dashboards needed)
- [ ] Field Services Dashboard (Jobs overview, crew utilization, zone heat map)
- [ ] Logistics Dashboard (Inventory levels, PO tracking, equipment status)
- [ ] Sales Dashboard (needs enhancement - already exists but basic)
- [ ] Operations Dashboard (needs enhancement - already exists but basic)
- [ ] Marketing Dashboard (needs enhancement - already exists but basic)

### 3. **Missing Detail Views** (ListView shows tables, but detail pages are blank)
All new entity types need proper EntityDetail implementations:

**Field Services:**
- [ ] Job Detail Page (job info, crew assignment, zone, timeline, BOM, evidence photos)
- [ ] Crew Detail Page (leader, members, schedule, assigned jobs)
- [ ] Zone Detail Page (map view, coverage area, assigned crews)
- [ ] Equipment Detail Page (barcode, condition, location, service history)

**Logistics:**
- [ ] Inventory Item Detail (stock levels, reorder alerts, usage history)
- [ ] Purchase Order Detail (line items, supplier info, linked jobs, status tracking)

**Financial:**
- [ ] Bank Transaction Detail (matching UI, reconciliation confidence, linked invoice)
- [ ] Expense Detail (receipt view, approval workflow, category breakdown)

**Marketing:**
- [ ] Review Detail (platform, rating, sentiment analysis, reply interface)
- [ ] Referral Reward Detail (referrer, referred lead, payout tracking)
- [ ] Inbound Form Detail (field builder UI, submission stats, target campaign)
- [ ] Chat Widget Detail (color picker, welcome message, routing settings)
- [ ] Calculator Detail (type-specific config, embed code)

**Automation (in Settings):**
- [ ] Workflow Detail (visual workflow builder, trigger/action/filter nodes)
- [ ] Webhook Detail (URL, headers editor, trigger event, success/failure stats)

**Governance (in Settings):**
- [ ] Industry Template Detail (section builder, custom field editor, preview)

### 4. **Settings Page Enhancements**
Current Settings page needs new sections:
- [ ] Automation tab (Workflows + Webhooks management)
- [ ] Templates tab (Industry Templates management)
- [ ] Keep existing tabs (General, Users, Custom Fields, etc.)

### 5. **Dashboard Components Needed**

**Field Services Dashboard:**
- Jobs by status pie chart
- Crew utilization bar chart
- Zone heat map
- Equipment maintenance alerts
- Today's schedule timeline

**Logistics Dashboard:**
- Inventory levels (low stock alerts)
- Purchase order pipeline
- Equipment condition breakdown
- Pending deliveries list

**Enhanced Sales Dashboard (expand existing):**
- Add BANT qualification metrics
- Referral program stats
- Lead source performance

**Enhanced Ops Dashboard (expand existing):**
- Add job completion rate
- SLA compliance tracking
- Resource utilization

**Enhanced Marketing Dashboard (expand existing):**
- Review sentiment breakdown
- Form conversion rates
- Calculator usage stats
- Widget engagement metrics

### 6. **List View Enhancements**
Current ListView is generic - needs entity-specific columns:
- [ ] Jobs: Show job type, status, zone, crew, scheduled date
- [ ] Crews: Show leader, member count, active jobs
- [ ] Zones: Show region, crew count, job count
- [ ] Equipment: Show type, condition, location, assigned to
- [ ] Inventory: Show SKU, stock qty, reorder point, status
- [ ] POs: Show PO#, supplier, status, total, linked job
- [ ] Bank Trans: Show date, amount, match status, confidence
- [ ] Expenses: Show vendor, amount, category, status
- [ ] Reviews: Show platform, rating, sentiment, status
- [ ] Referrals: Show referrer, amount, status
- [ ] Forms: Show submission count, target campaign
- [ ] Widgets: Show active status, routing user
- [ ] Calculators: Show type, active status
- [ ] Workflows: Show category, execution count, active
- [ ] Webhooks: Show method, event, success/fail counts
- [ ] Templates: Show industry, target entity, version

## 📋 RECOMMENDED APPROACH

### Phase 1: Fix Navigation (Quick - 30 min)
Move Automation & Templates to Settings, add dashboard routes

### Phase 2: Create Dashboard Pages (Medium - 2-3 hours)
Build 5 dashboard pages with charts and metrics

### Phase 3: Enhance List Views (Medium - 1-2 hours)
Add entity-specific columns and formatting

### Phase 4: Build Detail Pages (Large - 4-6 hours)
Create proper detail views for all 17 entity types

### Phase 5: Settings Enhancements (Medium - 1-2 hours)
Add Automation and Templates tabs to Settings

## 🎯 NEXT IMMEDIATE STEP

**Start with Phase 1: Fix Navigation Structure**

This will:
- Clean up the sidebar (reduce clutter)
- Add dashboard routes for new sections
- Move admin features to Settings where they belong

**Command to run:**
```bash
# In catchacrm_flash_integrated directory
# Start Phase 1: Navigation restructure
```

The next task is: **Restructure navigation and add dashboard routes**
