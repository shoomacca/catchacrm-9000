# CRM Settings - Supabase Mapping

**Date:** 2026-02-12
**Status:** ✅ Implemented
**Purpose:** Document how CRMSettings fields map to Supabase tables

---

## Overview

CRM settings are now persisted to **Supabase** instead of only localStorage. This enables:
- ✅ Settings persist across devices
- ✅ Settings survive cache clears
- ✅ Settings are organization-scoped (multi-tenant safe)
- ✅ localStorage remains as a cache/fallback

---

## Table Mapping

### `company_settings` (Organization Profile)

| Field | Type | Description |
|-------|------|-------------|
| `org_id` | uuid | Organization ID (FK to organizations) |
| `organization` | jsonb | Legal name, trading name, tax ID, emails, phone, industry |
| `localization` | jsonb | Timezone, currency, date format, time format, tax rate |
| `branding` | jsonb | Name, slogan, colors, logos, theme, custom domain |
| `created_at` | timestamptz | Record creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**Example `organization` JSONB:**
```json
{
  "legalName": "Acme Corporation",
  "tradingName": "Acme",
  "taxId": "12-3456789",
  "supportEmail": "support@acme.com",
  "billingEmail": "billing@acme.com",
  "emergencyPhone": "+1-555-1234",
  "industry": "general"
}
```

**Example `localization` JSONB:**
```json
{
  "timezone": "America/New_York",
  "currency": "USD",
  "currencySymbol": "$",
  "dateFormat": "MM/DD/YYYY",
  "timeFormat": "12h",
  "multiCurrencyEnabled": false,
  "taxRate": 10
}
```

**Example `branding` JSONB:**
```json
{
  "name": "Catcha",
  "slogan": "Catch. Connect. Close.",
  "primaryColor": "#3B82F6",
  "sidebarMode": "light",
  "theme": "light",
  "logoLight": "",
  "logoDark": "",
  "favicon": "",
  "pwaIcon": "",
  "customDomain": ""
}
```

---

### `crm_settings` (CRM Configuration)

| Field | Type | Description |
|-------|------|-------------|
| `org_id` | uuid | Organization ID (FK to organizations) |
| `modules` | jsonb | Feature flags (salesEngine, financials, etc.) |
| `roles` | jsonb | User roles (admin, manager, user, field tech) |
| `permissions` | jsonb | Permission matrix by role |
| `teams` | jsonb | Team configurations |
| `crews` | jsonb | Field crew configurations |
| `field_level_security` | jsonb | Field-level security rules |
| `integrations` | jsonb | Stripe, PayPal, Twilio, SendGrid, etc. |
| `automation` | jsonb | Workflow automation settings |
| `pipelines` | jsonb | Sales/lead pipelines |
| `lead_scoring` | jsonb | Lead scoring rules |
| `lost_reasons` | jsonb | Deal loss reasons |
| `quote_validity_days` | integer | Default quote validity period |
| `payment_terms` | text | Default payment terms |
| `tax_engine` | jsonb | Tax rates and configurations |
| `ledger_mapping` | jsonb | GL code mappings |
| `numbering_series` | jsonb | Invoice/quote/PO number prefixes |
| `job_templates` | jsonb | Field job templates |
| `zones` | jsonb | Service zone configurations |
| `inventory_rules` | jsonb | Warehouse and stock rules |
| `scheduling` | jsonb | Scheduling constraints |
| `review_platforms` | jsonb | Review platform integrations |
| `referral_settings` | jsonb | Referral program settings |
| `sender_profiles` | jsonb | Email sender profiles |
| `diagnostics` | jsonb | Diagnostic and logging settings |
| `lead_statuses` | jsonb | Available lead statuses |
| `lead_sources` | jsonb | Lead source options |
| `deal_stages` | jsonb | Deal stage definitions |
| `ticket_statuses` | jsonb | Ticket status options |
| `ticket_priorities` | jsonb | Ticket priority levels |
| `ticket_categories` | jsonb | Ticket categories |
| `task_statuses` | jsonb | Task status options |
| `task_priorities` | jsonb | Task priority levels |
| `sla_config` | jsonb | SLA configuration by priority |
| `default_assignments` | jsonb | Default assignees by entity type |
| `industries` | jsonb | Industry options |
| `tiers` | jsonb | Account tier options |
| `account_types` | jsonb | Account type options |
| `deal_loss_reasons` | jsonb | Reasons for lost deals |
| `custom_fields` | jsonb | Custom field definitions |
| `required_fields` | jsonb | Required fields by entity type |
| `validation_rules` | jsonb | Validation rules by entity type |
| `active_industry` | text | Currently active industry blueprint |
| `industry_blueprints` | jsonb | Industry-specific configurations |
| `custom_entities` | jsonb | Custom entity data storage |
| `created_at` | timestamptz | Record creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

---

## Data Flow

### Load Settings (On App Init)
```
1. User logs in
2. CRMContext.initializeData() runs
3. getCurrentOrgId() → "abc-123-xyz"
4. loadOrgSettings("abc-123-xyz", DEFAULT_SETTINGS)
   ├─ Query company_settings WHERE org_id = "abc-123-xyz"
   ├─ Query crm_settings WHERE org_id = "abc-123-xyz"
   └─ Merge with defaults → Complete CRMSettings object
5. setSettings(merged)
6. saveToDisk({ settings: merged }) // Cache in localStorage
```

### Save Settings (When User Changes Settings)
```
1. User modifies settings in SettingsView
2. handleSave() calls updateSettings(newSettings)
3. updateSettings() in CRMContext:
   ├─ Merge: prev settings + new settings
   ├─ saveToDisk({ settings: updated }) // Update localStorage cache
   └─ saveOrgSettings(orgId, updated) // Save to Supabase (async)
      ├─ splitSettings() → { company, crm }
      ├─ UPSERT company_settings WHERE org_id = orgId
      └─ UPSERT crm_settings WHERE org_id = orgId
```

---

## Files Modified

### Created Files
- ✅ `src/services/settingsService.ts` - Settings persistence service
- ✅ `migration_settings_tables.sql` - Table creation migration
- ✅ `SETTINGS_MAPPING.md` - This documentation

### Modified Files
- ✅ `src/context/CRMContext.tsx` - Wire settings service
  - Added `loadOrgSettings()` call in initialization
  - Modified `updateSettings()` to save to Supabase
  - Modified `restoreDefaultSettings()` to save to Supabase
- ✅ `fix_3_drop_orphaned_tables.sql` - Exclude settings tables from cleanup

---

## SQL Verification Queries

### Check if settings tables exist
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('company_settings', 'crm_settings');
```

### Check RLS is enabled
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('company_settings', 'crm_settings');
```

### View settings for your organization
```sql
-- Replace <your-org-id> with your actual org_id
SELECT * FROM company_settings WHERE org_id = '<your-org-id>';
SELECT * FROM crm_settings WHERE org_id = '<your-org-id>';
```

### Count total settings records
```sql
SELECT
  (SELECT COUNT(*) FROM company_settings) as company_settings_count,
  (SELECT COUNT(*) FROM crm_settings) as crm_settings_count;
```

---

## Testing Checklist

### Before Migration
- [x] TypeScript compilation passes (0 errors)
- [x] No breaking changes to CRMContext API
- [x] localStorage cache still works (backward compatible)

### After Migration (Manual Testing Required)
- [ ] Run `migration_settings_tables.sql` in Supabase SQL Editor
- [ ] Verify tables created with correct schema
- [ ] Verify RLS policies exist
- [ ] Sign in to CatchaCRM
- [ ] Navigate to Settings
- [ ] Modify a setting (e.g., organization name)
- [ ] Click Save
- [ ] Check Supabase: `SELECT * FROM company_settings WHERE org_id = '<your-org-id>';`
- [ ] Verify setting saved to Supabase
- [ ] Clear browser cache and localStorage
- [ ] Refresh page
- [ ] Verify settings loaded from Supabase (not defaults)
- [ ] Test on different browser/device
- [ ] Verify same settings appear (cross-device sync)

---

## Migration Steps

### 1. Run the Migration SQL
Open Supabase SQL Editor and execute `migration_settings_tables.sql`:
```sql
-- Creates company_settings and crm_settings tables
-- Adds RLS policies
-- Adds indexes
```

### 2. Verify Tables Created
```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('company_settings', 'crm_settings')
ORDER BY table_name, ordinal_position;
```

### 3. Test Settings Persistence
1. Open CatchaCRM in browser
2. Go to Settings → General
3. Change organization name to "Test Org"
4. Click Save
5. Open browser DevTools Console
6. Look for: `✅ Settings saved to Supabase`
7. Check Supabase database:
   ```sql
   SELECT organization->>'legalName' as org_name
   FROM company_settings
   WHERE org_id = (SELECT id FROM organizations LIMIT 1);
   ```
8. Should show "Test Org"

### 4. Test Cross-Device Sync
1. Open CatchaCRM in a different browser
2. Sign in with the same account
3. Verify organization name shows "Test Org"
4. Settings are synced! ✅

---

## Backward Compatibility

### localStorage Fallback
If Supabase fails to load settings:
- ✅ Falls back to DEFAULT_SETTINGS
- ✅ Settings still cached in localStorage
- ✅ UI continues to function

### Demo Mode
- ✅ Demo mode (unauthenticated users) still uses seed data
- ✅ No Supabase queries in demo mode
- ✅ Settings saved to localStorage only

---

## Performance Considerations

### Load Time
- Settings loaded **once** on app initialization
- Cached in React state (no repeated queries)
- Cached in localStorage for offline fallback

### Save Time
- Settings save is **async** (non-blocking)
- UI updates immediately from React state
- Supabase upsert happens in background
- If save fails, settings still in localStorage cache

---

## Security

### Row-Level Security (RLS)
- ✅ All queries filtered by `org_id`
- ✅ Users can only access their organization's settings
- ✅ Enforced at database level (not just app level)

### Sensitive Data
- ⚠️ Integration API keys stored in plain text JSONB
- TODO: Consider encrypting sensitive fields (Stripe keys, Twilio tokens, etc.)
- For now: Rely on Supabase RLS + HTTPS + database encryption at rest

---

## Future Enhancements

### Potential Improvements
1. **Encryption** - Encrypt sensitive integration keys in `integrations` JSONB
2. **Audit Trail** - Track settings changes in `audit_log` table
3. **Validation** - Server-side validation before upsert
4. **Versioning** - Keep historical versions of settings
5. **Granular Updates** - Use `saveSettingsSection()` for better performance

---

## Troubleshooting

### "Error loading company_settings"
- Check if migration ran successfully
- Verify table exists: `SELECT * FROM information_schema.tables WHERE table_name = 'company_settings';`
- Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'company_settings';`

### Settings not saving
- Check browser console for errors
- Verify `getCurrentOrgId()` returns valid org_id
- Check Supabase logs for errors
- Verify user is authenticated (not demo mode)

### Settings reset to defaults
- Check if `company_settings` and `crm_settings` rows exist for your org
- Run: `SELECT * FROM company_settings WHERE org_id = '<your-org-id>';`
- If empty, settings service will use defaults and create new rows on first save

---

**Status:** ✅ Implementation complete, ready for migration and testing.
