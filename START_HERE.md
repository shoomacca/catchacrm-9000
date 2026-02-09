# Fresh Start - 2 Steps Only

Total time: **5 minutes**

---

## Step 1: Reset Database (2 min)

1. **Open Supabase SQL Editor:**
   https://supabase.com/dashboard/project/anawatvgypmrpbmjfcht/sql

2. **Click "New Query"**

3. **Copy the ENTIRE file:**
   `supabase/FULL_RESET.sql` (use Ctrl+A to select all ~1000 lines)

4. **Paste into SQL Editor**

5. **Click RUN** (or Ctrl+Enter)

6. **Wait ~10 seconds** - Should see:
   ```
   ✅ All tables dropped successfully!
   ✅ Schema created successfully!
   ```

---

## Step 2: Load Matrix Data (1 min)

In your terminal:

```bash
cd C:\Users\Corsa\.antigravity\projects\catchacrm_flash_integrated

node scripts/fresh-start-automated.js --skip-schema
```

You should see:

```
🎭 Step 3/3: Loading Matrix mock data...

   ✅ accounts                  - 10 rows
   ✅ contacts                  - 14 rows
   ✅ leads                     - 5 rows
   ✅ deals                     - 3 rows
   ✅ tasks                     - 8 rows
   ✅ campaigns                 - 3 rows
   ✅ tickets                   - 3 rows
   ✅ products                  - 10 rows
   ✅ services                  - 10 rows
   ✅ calendar_events           - 3 rows

🎉 Total: 69 rows inserted successfully!
```

---

## Step 3: Verify (2 min)

1. **Start dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open browser:**
   http://localhost:3002

3. **Check these pages:**
   - **Contacts** → See Neo, Morpheus, Trinity ✅
   - **Accounts** → See Nebuchadnezzar, Logos ✅
   - **Leads** → See potential recruits ✅
   - **Products** → See Red Pill, Blue Pill ✅
   - **Tasks** → See 8 Matrix-themed tasks ✅

---

## Done! 🎉

Your CRM now has:
- ✅ Fresh database schema matching TypeScript types
- ✅ 69 rows of Matrix-themed mock data
- ✅ All 25+ tables with RLS enabled
- ✅ Foreign keys properly linked
- ✅ Ready for CRUD operations

---

## What's Next?

1. **Test bulk actions** - Go to Leads → Select checkboxes → Bulk delete
2. **Test CSV import** - Settings → Import/Export (UI ready, needs wiring)
3. **Copy bulk pattern** to other pages (Accounts, Contacts, etc.)
4. **Add more mock data** - Run data loader again or create manually

---

## Files Created

- ✅ `supabase/FULL_RESET.sql` - One-file database reset (drop + create)
- ✅ `scripts/fresh-start-automated.js` - Smart Matrix data loader
- ✅ `data/matrix_*.csv` - CSV import templates

---

**Need help?** Check `EXECUTE_THIS.md` or `FRESH_START_QUICKSTART.md` for detailed guides.
