# Flash UI Design System

**Version:** 1.0
**Last Updated:** 2026-02-08

## Overview

Flash UI is the consistent, modern design language for CatchaCRM. All modules must adhere to these exact specifications to maintain visual consistency across the platform.

---

## Color Palette

### Primary Colors
- **Primary Blue**: `#3B82F6` (blue-600)
- **Dark Slate**: `#0F172A` (slate-900)
- **White**: `#FFFFFF`

### Sidebar (Default)
- **Background**: `bg-white` (NOT blue/brand mode by default)
- **Border**: `border-slate-200`
- **Text**: `text-slate-900`

### Status Colors
- **Success**: `emerald-600` / `emerald-50` background
- **Warning**: `amber-600` / `amber-50` background
- **Error**: `rose-600` / `rose-50` background
- **Info**: `blue-600` / `blue-50` background
- **Neutral**: `slate-600` / `slate-50` background

---

## Typography

### Headings
- **Page Title (H1)**: `text-5xl font-black text-slate-900 tracking-tight leading-none`
- **Section Title (H2)**: `text-2xl font-black text-slate-900`
- **Card Title (H3)**: `text-sm font-black text-slate-900`

### Body Text
- **Primary**: `text-sm font-semibold text-slate-900`
- **Secondary**: `text-xs font-bold text-slate-500`
- **Small Labels**: `text-[10px] font-black text-slate-400 uppercase tracking-widest`

### Stat Numbers
- **Large Stats**: `text-2xl font-black` (NOT text-3xl)
- **Small Stats**: `text-sm font-bold`

---

## Spacing

### Grid Gaps
- **Stat Cards Grid**: `gap-4` (16px)
- **Content Cards Grid**: `gap-4` (16px)
- **Large Content Grid**: `gap-6` (24px) - only for very large feature cards

### Padding
- **Stat Cards**: `p-5` (20px)
- **Content Cards**: `p-6` (24px)
- **Tables**: `px-6 py-4` for cells

### Margins
- **Section Spacing**: `space-y-6` between major sections

---

## Border Radius

### Standard Sizes
- **Small Elements**: `rounded-xl` (12px) - buttons, badges, inputs
- **Cards (Standard)**: `rounded-2xl` (16px) - stat cards, small content cards
- **Cards (Large)**: `rounded-[25px]` - large feature cards, modals
- **Tables/Containers**: `rounded-[35px]` - only for full-width tables

**RULE**: Stat cards MUST use `rounded-2xl` (16px) for consistency.

---

## Components

### Stat Card (Standard)
```tsx
<div className="bg-white border border-slate-200 rounded-2xl p-5">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
    </div>
    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
      <Icon size={22} className="text-blue-600" />
    </div>
  </div>
</div>
```

### Stat Card Icon Container
- **Size**: `w-12 h-12` (NOT w-10 h-10, NOT w-20 h-20)
- **Border Radius**: `rounded-xl`
- **Icon Size**: `size={22}` or `size={20}`

### Buttons
- **Primary**: `bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase`
- **Secondary**: `bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl text-[10px] font-black uppercase`
- **Ghost**: `bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold`

### Tables
- **Container**: `bg-white border border-slate-200 rounded-[35px] overflow-hidden`
- **Header Row**: `bg-slate-50/50 border-b border-slate-100`
- **Header Cell**: `px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest`
- **Body Cell**: `px-6 py-4 text-sm font-semibold`
- **Row Hover**: `hover:bg-slate-50 transition-all`

### Badges
- **Status**: `px-3 py-1 rounded-full text-[9px] font-black uppercase border`
- **Tag**: `px-2 py-1 rounded text-[10px] font-bold`

---

## Layout

### Max Width
- **Standard Pages**: `max-w-[1800px] mx-auto`
- **Compact Pages**: `max-w-[1400px] mx-auto`

### Page Structure
```tsx
<div className="space-y-6 animate-slide-up max-w-[1800px] mx-auto pb-20">
  {/* Header */}
  <div className="flex justify-between items-end">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Module Name</p>
      <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Page Title</h1>
    </div>
    <div className="flex items-center gap-3">
      {/* Action buttons */}
    </div>
  </div>

  {/* Stats Row */}
  <div className="grid grid-cols-6 gap-4">
    {/* Stat cards here */}
  </div>

  {/* Content */}
</div>
```

---

## Animation

### Entrance Animations
- **Page Load**: `animate-slide-up` on main container
- **Staggered Cards**: Use `style={{ animationDelay: \`\${index * 0.03}s\` }}`

### Transitions
- **Standard**: `transition-all duration-200`
- **Hover Scale**: `active:scale-95 transition-all`

---

## DO NOT

❌ Use `rounded-[35px]` for stat cards (too big)
❌ Use `text-3xl` for stat numbers (too big)
❌ Use `w-10 h-10` for stat card icons (too small)
❌ Use `gap-6` for stat card grids (too wide)
❌ Use blue sidebar background by default
❌ Mix gradient backgrounds with solid backgrounds in same module
❌ Use different padding on similar cards in same view

---

## Checklist for New Pages

- [ ] Page uses `max-w-[1800px]` or `max-w-[1400px]`
- [ ] Stat cards use `rounded-2xl p-5 gap-4`
- [ ] Stat numbers use `text-2xl font-black`
- [ ] Icon containers use `w-12 h-12 rounded-xl`
- [ ] Section labels use `text-[10px] font-black uppercase tracking-widest`
- [ ] Tables use `rounded-[35px]` container
- [ ] Buttons use consistent padding and text sizing
- [ ] Colors match the defined palette
- [ ] Animations are consistent with other pages

---

**Reference Pages (Good Examples):**
- `LeadsPage.tsx` - Perfect stat card implementation
- `DealsPage.tsx` - Correct sizing and spacing
- `AccountsPage.tsx` - Good layout structure
- `ContactsPage.tsx` - Proper typography usage
- `BillingView.tsx` - Correct component sizing
