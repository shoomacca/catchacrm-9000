# Fresh Start - Quick Execution Guide

## Total Time: 15 minutes

Follow these steps exactly:

---

## Step 1: Drop All Existing Tables (2 min)

1. Open **Supabase Dashboard**: https://supabase.com/dashboard/project/anawatvgypmrpbmjfcht
2. Click **SQL Editor** in left sidebar
3. Click **New Query**
4. Copy entire contents of: **`supabase/00_drop_all_tables.sql`**
5. Paste into SQL Editor
6. Click **Run** (or Ctrl+Enter)
7. Wait for confirmation: "✅ All tables dropped successfully!"

---

## Step 2: Create Fresh Schema (3 min)

1. Still in **SQL Editor**, click **New Query**
2. Copy entire contents of: **`supabase/schema_from_frontend.sql`**
3. Paste into SQL Editor
4. Click **Run**
5. Wait for messages:
   - ✅ Schema created successfully from frontend types!
   - 📊 Tables created: 25+
   - 🔒 RLS enabled on all tables
   - 🎯 Ready to import Matrix data!

---

## Step 3: Import Matrix Data (5 min)

Back in your terminal/command prompt:

```bash
cd C:\Users\Corsa\.antigravity\projects\catchacrm_flash_integrated

node scripts/smart-load-data.js
```

You should see:

```
🎬 Smart Matrix Data Loader
📌 Organization ID: 00000000-0000-0000-0000-000000000001

📝 accounts:
   ✅ Inserted 10 rows

📝 contacts:
   ✅ Inserted 14 rows

📝 leads:
   ✅ Inserted 5 rows

📝 deals:
   ✅ Inserted 3 rows

📝 tasks:
   ✅ Inserted 8 rows

📝 campaigns:
   ✅ Inserted 3 rows

📝 tickets:
   ✅ Inserted 3 rows

📝 products:
   ✅ Inserted 10 rows

📝 services:
   ✅ Inserted 10 rows

📝 calendar_events:
   ✅ Inserted 3 rows

🎉 Total: 69 rows inserted across 10 tables
```

---

## Step 4: Verify in Supabase (2 min)

Go to **Supabase Dashboard → Table Editor**

Check these tables have data:
- ✅ accounts - 10 rows (Nebuchadnezzar, Logos, Zion Command, etc.)
- ✅ contacts - 14 rows (Neo, Morpheus, Trinity, Agent Smith, etc.)
- ✅ leads - 5 rows
- ✅ products - 10 rows (Red Pill, Blue Pill, EMP Device, etc.)
- ✅ services - 10 rows

---

## Step 5: Check UI (3 min)

1. Make sure dev server is running:
   ```bash
   npm run dev
   ```

2. Open browser: **http://localhost:3002**

3. Navigate to pages and verify Matrix data appears:
   - [ ] **Dashboard** - Shows stats
   - [ ] **Contacts** - See Neo, Morpheus, Trinity
   - [ ] **Accounts** - See Nebuchadnezzar, Logos
   - [ ] **Leads** - See potential recruits
   - [ ] **Products** - See Red Pill, Blue Pill
   - [ ] **Services** - See Operator Support, Combat Training
   - [ ] **Calendar** - See Council Meeting, Training events

4. Check browser console - should see:
   ```
   ✓ Supabase client initialized
   ```

---

## Troubleshooting

### If import fails:

**Problem**: "Could not find column 'xyz'"

**Solution**: The schema didn't apply correctly. Re-run Step 2.

---

**Problem**: "Organization not found"

**Solution**: The default organization wasn't created. Run this in SQL Editor:

```sql
INSERT INTO organizations (id, name, slug, plan, subscription_status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Organization',
  'demo',
  'enterprise',
  'active'
);
```

---

**Problem**: Data imports but doesn't show in UI

**Solution**: Hard refresh browser (Ctrl+Shift+R) to clear cache

---

## Success Checklist

After completing all steps, you should have:

- [x] Clean Supabase database (all old tables dropped)
- [x] Fresh schema matching frontend TypeScript types
- [x] 69 rows of Matrix-themed mock data imported
- [x] Neo, Morpheus, Trinity visible in Contacts page
- [x] Nebuchadnezzar, Logos visible in Accounts page
- [x] Red Pill, Blue Pill visible in Products page
- [x] No console errors
- [x] All modules working

---

## What's Next?

Once data is loading correctly:

1. **Test CRUD operations** - Create/edit/delete records
2. **Test CSV Import** - Settings → Import/Export → Upload CSV
3. **Test Bulk Actions** - Leads → List View → Select checkboxes
4. **Add more mock data** - Run import again or create manually
5. **Copy bulk actions pattern** to other pages (Accounts, Contacts, etc.)

---

## Files Created

- ✅ **supabase/00_drop_all_tables.sql** - Drops everything
- ✅ **supabase/schema_from_frontend.sql** - Fresh schema (25+ tables)
- ✅ **scripts/smart-load-data.js** - Matrix data importer
- ✅ **data/matrix_*.csv** - CSV import files (5 files)

---

**You're all set!** 🎉

The frontend now matches the database perfectly. Everything should just work!
