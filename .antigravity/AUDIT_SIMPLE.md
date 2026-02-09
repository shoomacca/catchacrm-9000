# Settings Audit - What Works vs What Doesn't

**Date:** February 8, 2026
**Status:** In Progress - Fixing Non-Working Items

---

## ✅ WORKING

### General Tab
- ✅ Organization name input
- ✅ Industry dropdown (WILL BE REMOVED - duplicate)
- ✅ Tax rate input
- ✅ Currency selector
- ✅ Date format selector
- ✅ Theme selector (Dark/Light/Auto)
- ✅ Sidebar mode (Expanded/Collapsed)
- ✅ Save button

### Modules Tab
- ✅ Feature flag toggles (Sales Engine, Financials, etc.)
- ✅ Sub-module toggles
- ✅ Data dictionary lists (Lead Sources, Industries, Account Types, Ticket Categories)
- ✅ Add/Remove items in dictionaries
- ✅ Field visibility grid (shows all fields)
- ✅ Field toggles (on/off)
- ✅ Make Required/Optional buttons

### Users & Access Tab
- ✅ User directory cards display
- ✅ Add User button
- ✅ Edit User button (on hover)
- ✅ Delete User button
- ✅ Reset Password button (placeholder alert)
- ✅ Switch User session
- ✅ User Modal opens
- ✅ Create user form
- ✅ Update user form
- ✅ Role selector (grid buttons)
- ✅ Manager dropdown

### Blueprint Tab
- ✅ Industry blueprint grid (10 industries)
- ✅ Click to select industry
- ✅ Active indicator (checkmark)
- ✅ Module layouts section (visual only)
- ✅ Required fields section
- ✅ Required fields checkboxes

### Integrations Tab
- ✅ Integration cards display
- ✅ Toggle switches
- ✅ Config inputs

### Automation Tab
- ✅ Email settings
- ✅ Toggle switches

### Domain Config Tab
- ✅ Tab switching (Sales/Financial/Field/Marketing)
- ✅ All config inputs
- ✅ Toggles

### Diagnostics Tab
- ✅ System stats display
- ✅ Audit log viewer
- ✅ Filters
- ✅ Reset buttons (Restore Metadata, Re-seed Entities, Nuke Everything)

---

## ❌ NON-WORKING

### Calendar
- ❌ **CRITICAL:** Menu appears on wrong day (click Monday → shows Thursday)
- ❌ Date offset issue

### General Tab
- ❌ **Timezone selector - MISSING** (needs to be added)
- ❌ Industry selector should NOT be here (duplicate from Blueprint tab)

### Modules Tab
- ❌ "Add Custom Field" button in Field Visibility (no functionality)

### Blueprint Tab
- ❌ "Create Custom Blueprint" button (no functionality)
- ❌ "Add Section" button in Module Layouts (no functionality)
- ❌ Settings button in layout sections (no functionality)
- ❌ "Add Custom Field" button (no functionality)

### Users & Access Tab
- ❌ Team field is text input (should be dropdown with predefined teams)

### Integrations Tab
- ❌ Most are placeholder toggles (not connected to real APIs)

---

## 🔧 PRIORITY FIXES NEEDED

### CRITICAL (Blocking Use)
1. **Calendar date offset** - Shows wrong day when clicking
2. **Remove duplicate industry selector** from General tab
3. **Team dropdown** - Change from text to select in UserModal

### HIGH (Missing Core Features)
4. **Add timezone selector** to General settings
5. **Wire up "Create Custom Blueprint"** button
6. **Wire up "Add Custom Field"** buttons (in Blueprint and Modules tabs)

### MEDIUM (Nice to Have)
7. Wire up layout section management
8. Add real integration configurations
9. Field reordering (drag and drop)

---

## 📋 FIX PLAN

### Step 1: Calendar Fix
- Fix date creation to avoid timezone issues
- Ensure dayMenuDate matches clicked day

### Step 2: Settings Cleanup
- Remove industry selector from General tab
- Add timezone selector to General tab
- Change Team to dropdown in UserModal

### Step 3: Wire Up Buttons
- Create Custom Blueprint modal
- Add Custom Field modal
- Connect buttons to modals

### Step 4: Test Everything
- Verify calendar shows correct day
- Verify all forms work
- Verify all toggles work
- Verify all saves persist

---

**Next:** Implementing fixes in order of priority
