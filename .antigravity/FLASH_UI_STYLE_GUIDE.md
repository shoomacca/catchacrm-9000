# Flash UI Design System - Official Style Guide

**Version:** 1.0
**Date:** February 8, 2026
**Status:** CANONICAL REFERENCE - DO NOT DEVIATE

---

## OFFICIAL TERMINOLOGY

### Style 1: **FLASH UI MODULE**
**Used for:** Entity list/grid pages with CRUD operations
**Examples:** Leads, Deals, Accounts, Contacts, Campaigns, Billing, Comms Hub, Reports

### Style 2: **FLASH UI DASHBOARD**
**Used for:** Analytics/overview pages with metrics and charts
**Examples:** Sales Dashboard, Marketing Dashboard, Ops Dashboard, Field Services Dashboard, Logistics Dashboard

---

## STYLE 1: FLASH UI MODULE

### Component Structure
```tsx
<div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
  {/* Header Section */}
  {/* Stats Cards Section */}
  {/* Filters/Controls Bar */}
  {/* View Mode Toggle */}
  {/* Cards/List Grid */}
</div>
```

### Header Pattern
```tsx
<div className="flex justify-between items-end">
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">[Section Name]</p>
    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">[Page Title]</h1>
  </div>
  <div className="flex items-center gap-3">
    {/* Action buttons */}
  </div>
</div>
```

### Stats Cards Pattern
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">[Label]</p>
    <p className="text-3xl font-black text-slate-900">[Value]</p>
    <p className="text-xs text-slate-500 mt-1">[Subtitle]</p>
  </div>
</div>
```

### Filter Bar Pattern
```tsx
<div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
  <div className="flex flex-wrap items-center gap-3">
    {/* Search input */}
    <div className="relative flex-1 min-w-[300px]">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="text"
        placeholder="Search..."
        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>

    {/* Filter buttons */}
    <button className="px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 text-white">
      [Filter]
    </button>
  </div>
</div>
```

### View Mode Toggle Pattern
```tsx
<div className="flex items-center gap-2">
  <button
    onClick={() => setViewMode('cards')}
    className={`p-3 rounded-xl transition-all ${
      viewMode === 'cards'
        ? 'bg-slate-900 text-white shadow-lg'
        : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
    }`}
  >
    <LayoutGrid size={18} />
  </button>
  <button
    onClick={() => setViewMode('list')}
    className={`p-3 rounded-xl transition-all ${
      viewMode === 'list'
        ? 'bg-slate-900 text-white shadow-lg'
        : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
    }`}
  >
    <List size={18} />
  </button>
</div>
```

### Card Grid Pattern
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div
    className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    onClick={() => navigate(`/[entity]/${item.id}`)}
  >
    {/* Card content */}
  </div>
</div>
```

### List View Pattern
```tsx
<div className="bg-white border border-slate-200 rounded-[25px] overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="border-b border-slate-100 bg-slate-50">
        <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          [Column]
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
        <td className="p-4 text-sm font-bold text-slate-900">[Value]</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Primary Button Pattern
```tsx
<button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
  <Plus size={16} />
  Add [Entity]
</button>
```

### Secondary Button Pattern
```tsx
<button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all">
  <Icon size={16} />
  [Action]
</button>
```

### Badge Pattern
```tsx
<span className="px-3 py-1 bg-[color]-50 text-[color]-700 text-[9px] font-black uppercase tracking-wider rounded-full border border-[color]-200">
  [Status]
</span>
```

---

## STYLE 2: FLASH UI DASHBOARD

### Component Structure
```tsx
<div className="space-y-6 animate-slide-up pb-20">
  {/* Header Section */}
  {/* Metric Cards Grid */}
  {/* Charts Section */}
  {/* Quick Links/Actions */}
</div>
```

### Metric Card Pattern
```tsx
const MetricCard = ({ label, value, icon: Icon, color, alert, onClick }: any) => (
  <div
    onClick={onClick}
    className={`bg-white border ${alert ? 'border-amber-300 shadow-amber-100' : 'border-slate-200'} p-8 rounded-[35px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group`}
  >
    {alert && (
      <div className="absolute top-3 right-3">
        <AlertCircle size={16} className="text-amber-500" />
      </div>
    )}
    <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon size={24} className={color} />
    </div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-900">{value}</p>
  </div>
);
```

### Chart Container Pattern
```tsx
<div className="bg-white border border-slate-200 p-8 rounded-[35px] shadow-sm">
  <h3 className="text-xl font-black text-slate-900 mb-6">[Chart Title]</h3>
  <ResponsiveContainer width="100%" height={300}>
    {/* Chart component */}
  </ResponsiveContainer>
</div>
```

### Status Row Pattern
```tsx
const StatusRow = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full bg-${color}-500`} />
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </div>
    <span className="text-lg font-black text-slate-900">{value}</span>
  </div>
);
```

---

## SPACING & SIZING STANDARDS

### Container Spacing
- Page wrapper: `space-y-6 max-w-[1400px] mx-auto pb-20`
- Card padding: `p-6` for regular cards, `p-8` for dashboards
- Grid gaps: `gap-4` for stats, `gap-6` for entity cards

### Border Radius
- Containers/Cards: `rounded-[25px]`
- Dashboard cards: `rounded-[35px]`
- Buttons: `rounded-xl`
- Badges: `rounded-full`
- Icons/Avatars: `rounded-2xl`
- Small inputs: `rounded-xl`

### Shadows
- Default: `shadow-sm`
- Hover: `shadow-xl`
- Buttons: `shadow-lg shadow-blue-500/20`
- Alerts: `shadow-amber-100`

### Font Sizes
- Page title: `text-4xl font-black`
- Section header: `text-xl font-black`
- Card value: `text-3xl font-black`
- Labels: `text-[10px] font-black uppercase tracking-widest`
- Body text: `text-sm font-bold`
- Tiny text: `text-xs`
- Badge text: `text-[9px] font-black uppercase`

### Colors
- Primary: `slate-900` (black)
- Secondary: `slate-400`, `slate-500`, `slate-600`
- Accent: `blue-600`, `violet-600`
- Success: `emerald-500`, `green-500`
- Warning: `amber-500`, `orange-500`
- Error: `red-500`, `rose-500`
- Info: `blue-500`, `cyan-500`

---

## ANIMATION STANDARDS

### Page Load
```tsx
className="animate-slide-up"
```

### Card Hover
```tsx
className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
```

### Button Hover
```tsx
className="hover:shadow-xl hover:-translate-y-0.5 transition-all"
```

### Icon Hover
```tsx
className="group-hover:scale-110 transition-transform"
```

---

## MODULES REQUIRING FLASH UI MODULE STYLE

**Priority 1 - Financial:**
- ✅ Campaigns, Leads, Deals, Accounts, Contacts (CORRECT)
- ❌ Invoices List (src/pages/Financials/InvoicesList.tsx)
- ❌ Quotes List (src/pages/Financials/QuotesList.tsx)
- ❌ Expenses List (src/pages/Financials/ExpensesList.tsx)
- ❌ Subscriptions List (src/pages/Financials/SubscriptionsList.tsx)
- ❌ Purchase Ledger (src/pages/Financials/PurchaseLedger.tsx)
- ❌ Bank Feed (src/pages/Financials/BankFeed.tsx)

**Priority 2 - Catalog:**
- ❌ Products (src/pages/Financials/ItemsCatalog.tsx - Products section)
- ❌ Services (src/pages/Financials/ItemsCatalog.tsx - Services section)

**Priority 3 - Marketing:**
- ❌ Inbound Engine (src/pages/Marketing/InboundEngine.tsx)
- ❌ Referral Engine (src/pages/Marketing/ReferralEngine.tsx)
- ❌ Reputation Manager (src/pages/Marketing/ReputationManager.tsx)

**Priority 4 - Field Services:**
- ❌ Jobs (src/pages/JobsPage.tsx)
- ❌ Job Marketplace (src/pages/JobMarketplacePage.tsx)
- ❌ Crews (src/pages/CrewsPage.tsx)
- ❌ Equipment (src/pages/EquipmentPage.tsx)
- ❌ Zones (src/pages/ZonesPage.tsx)

**Priority 5 - Logistics:**
- ❌ Inventory (src/pages/InventoryPage.tsx)
- ❌ Warehouse (src/pages/WarehousePage.tsx)
- ❌ Procurement (src/pages/ProcurementPage.tsx)
- ❌ Purchase Orders (src/pages/PurchaseOrdersPage.tsx)

---

## VERIFICATION CHECKLIST

Before committing any module page, verify:

### Visual Elements
- [ ] Rounded corners: `rounded-[25px]` for cards
- [ ] Proper shadows: `shadow-sm` default, `shadow-xl` on hover
- [ ] Font weights: `font-black` for headers/labels, `font-bold` for body
- [ ] Text sizes: Match the standards above
- [ ] Proper spacing: `space-y-6`, `gap-4`, `gap-6`

### Interactive Elements
- [ ] Hover effects: `-translate-y-1` for cards, `-translate-y-0.5` for buttons
- [ ] Transitions: `transition-all duration-300` for cards, `transition-all` for buttons
- [ ] Cursor: `cursor-pointer` on clickable items
- [ ] Group hover: `group` on parent, `group-hover:` on children

### Structure
- [ ] Page wrapper: `space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20`
- [ ] Header pattern matches spec
- [ ] Stats cards pattern matches spec
- [ ] Filter bar pattern matches spec
- [ ] Card/list grid pattern matches spec

### Buttons
- [ ] Primary buttons use gradient: `from-blue-600 to-violet-600`
- [ ] Secondary buttons use white bg with border: `bg-white border border-slate-200`
- [ ] Button text: `text-xs font-black uppercase tracking-widest` (primary)
- [ ] Button text: `text-xs font-black uppercase tracking-wider` (secondary)

### Colors
- [ ] Use `slate-` palette for neutrals
- [ ] Use `blue-600`/`violet-600` for primary actions
- [ ] Status colors match standards (emerald, amber, red, blue)

---

## ENFORCEMENT

**This is the THIRD warning about style consistency.**

**Rule:** Every module page MUST match either FLASH UI MODULE or FLASH UI DASHBOARD style.
**Verification:** Before ANY commit, check against this style guide.
**No Exceptions:** If a page doesn't match, it MUST be fixed before moving on.

**When creating or modifying ANY page:**
1. Read this style guide
2. Determine if it's a MODULE or DASHBOARD page
3. Follow the EXACT patterns above
4. Verify against the checklist
5. Do NOT create custom variations

---

**This document is the CANONICAL source of truth for Flash UI styling.**
**Last Updated:** February 8, 2026
**Version:** 1.0 (LOCKED)
