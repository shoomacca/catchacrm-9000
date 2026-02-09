# Execute This - Simple 3-Step Process

## Step 1: Drop Old Tables (2 min)

1. Go to: https://supabase.com/dashboard/project/anawatvgypmrpbmjfcht
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy/paste this entire SQL block:

```sql
-- Drop all existing tables
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bank_transactions CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS crews CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organization_users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS subscription_tiers CASCADE;
DROP TABLE IF EXISTS activities CASCADE;

SELECT 'All tables dropped!' AS status;
```

5. Click **RUN**
6. Should see: "All tables dropped!"

---

## Step 2: Create Fresh Schema (3 min)

1. Still in SQL Editor, click **New Query**
2. Open file: **`supabase/schema_from_frontend.sql`**
3. Copy the ENTIRE file (scroll to bottom - it's ~900 lines)
4. Paste into SQL Editor
5. Click **RUN**
6. Wait ~10 seconds
7. Should see: "Schema created successfully!"

---

## Step 3: Load Matrix Data (1 min)

Back in your terminal:

```bash
cd C:\Users\Corsa\.antigravity\projects\catchacrm_flash_integrated

node scripts/load-matrix-data.js
```

Should see:
```
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

## Step 4: Verify (1 min)

Open browser: http://localhost:3002

Check these pages:
- **Contacts** → See Neo, Morpheus, Trinity ✅
- **Accounts** → See Nebuchadnezzar, Logos ✅
- **Products** → See Red Pill, Blue Pill ✅

---

## Done! 🎉

Total time: ~7 minutes

Your CRM now has a fresh database built from your TypeScript types with Matrix data!
