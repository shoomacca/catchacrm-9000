# M02_08: Data Migration Checklist

**Shard:** M02_08_DATA_MIGRATION
**Owner:** @Consultant
**Status:** Complete
**Date:** 2026-01-24

---

## Objective

Define the data migration checklist for schema and content to ensure smooth transition from legacy localStorage-based system to Supabase multi-tenant database.

---

## Schema Overview

**Total Tables:** 10

### Core Tables
1. `organizations` - Tenant/company table with hierarchy support
2. `organization_users` - User-org membership with roles
3. `contacts` - Contact records scoped to org
4. `accounts` - Account/company records scoped to org
5. `opportunities` - Deals/pipeline records scoped to org

### Supporting Tables
6. `activities` - Timeline/interaction records
7. `products` - Product catalog (shared or org-scoped)
8. `quotes` - Quote records linked to opportunities
9. `subscription_tiers` - Billing tier definitions
10. `audit_log` - Audit trail for compliance

---

## Migration Phases

### Phase 1: Schema Deployment

**Objective:** Deploy database schema to Supabase project.

**Steps:**
1. Review schema file: `supabase/complete_setup_v2.sql`
2. Connect to Supabase project SQL editor
3. Execute schema DDL statements
4. Verify all tables created
5. Verify all RLS policies enabled
6. Verify all indexes created

**Validation:**
```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected: 10 tables

-- Check RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true;

-- Expected: All 10 tables with RLS enabled
```

**Rollback:**
```sql
-- Drop all tables (CASCADE removes dependencies)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS subscription_tiers CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF NOT EXISTS activities CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS organization_users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
```

---

### Phase 2: Reference Data Seeding

**Objective:** Populate static/reference data.

**Required Data:**

#### Subscription Tiers
```sql
INSERT INTO subscription_tiers (name, slug, price_monthly, price_yearly, max_seats, features) VALUES
  ('Free', 'free', 0, 0, 5, '["basic_crm", "5_users"]'),
  ('Pro', 'pro', 29, 290, 20, '["advanced_crm", "20_users", "email_integration"]'),
  ('Enterprise', 'enterprise', 99, 990, 100, '["full_crm", "100_users", "sso", "priority_support"]');
```

#### Demo Organization
```sql
-- Create demo org
INSERT INTO organizations (id, name, slug, org_type, subscription_tier, max_seats)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'Demo Company', 'demo', 'standard', 'free', 5);

-- Create demo user mapping (after first user signs up)
-- This happens automatically via signup workflow
```

**Validation:**
```sql
-- Check subscription tiers
SELECT COUNT(*) FROM subscription_tiers;
-- Expected: 3

-- Check demo org exists
SELECT * FROM organizations WHERE slug = 'demo';
-- Expected: 1 row
```

---

### Phase 3: User Onboarding Flow

**Objective:** Ensure new user signup creates necessary records.

**Signup Workflow:**

1. **User Signs Up (Supabase Auth)**
   - Email/password captured via `AuthContext.signUp()`
   - Supabase creates `auth.users` record
   - User receives verification email

2. **Organization Creation (Service Role)**
   - Trigger: First login after verification
   - Create organization record
   - Set org slug from company name
   - Default tier: `free`

3. **User-Org Mapping**
   - Insert into `organization_users`
   - Set role: `owner` for first user
   - Set active: `true`

4. **Welcome Email (n8n)**
   - Trigger n8n workflow: `user-onboarding`
   - Send welcome email with getting started guide

**Implementation:**
```typescript
// In AuthContext or signup page
const handleSignupComplete = async (user: User) => {
  // Call backend API to create org
  await fetch('/api/onboarding/create-org', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: user.id,
      companyName: user.user_metadata.company_name,
      fullName: user.user_metadata.full_name,
    }),
  });
};
```

**Validation:**
```sql
-- After signup, verify org created
SELECT o.*, ou.*
FROM organizations o
JOIN organization_users ou ON o.id = ou.org_id
WHERE ou.user_id = '<NEW_USER_ID>';

-- Expected: 1 org, 1 mapping with role='owner'
```

---

### Phase 4: Legacy Data Migration (If Applicable)

**Objective:** Migrate data from old CatchaCRM instance to new multi-tenant schema.

**Source:** Legacy CatchaCRM (if exists)

**Export Sequence:**
1. Export organizations/companies
2. Export users and map to orgs
3. Export contacts
4. Export accounts
5. Export opportunities/deals
6. Export activities
7. Export products (merge duplicates)
8. Export quotes

**Import Sequence:**
(Reverse order to respect foreign keys)

1. **Organizations**
   ```sql
   INSERT INTO organizations (id, name, slug, org_type, subscription_tier, max_seats, settings)
   SELECT ... FROM legacy_companies;
   ```

2. **Organization Users**
   ```sql
   INSERT INTO organization_users (org_id, user_id, role, active)
   SELECT ... FROM legacy_user_company_mappings;
   ```

3. **Contacts**
   ```sql
   INSERT INTO contacts (org_id, name, email, phone, title, account_id)
   SELECT ... FROM legacy_contacts;
   ```

4. **Accounts**
   ```sql
   INSERT INTO accounts (org_id, name, website, industry, employees)
   SELECT ... FROM legacy_accounts;
   ```

5. **Opportunities**
   ```sql
   INSERT INTO opportunities (org_id, name, account_id, amount, stage, probability)
   SELECT ... FROM legacy_deals;
   ```

6. **Activities**
   ```sql
   INSERT INTO activities (org_id, related_to_type, related_to_id, activity_type, subject, notes)
   SELECT ... FROM legacy_activities;
   ```

7. **Products**
   ```sql
   INSERT INTO products (name, sku, price, category)
   SELECT DISTINCT ... FROM legacy_products;
   ```

8. **Quotes**
   ```sql
   INSERT INTO quotes (org_id, opportunity_id, quote_number, line_items, total)
   SELECT ... FROM legacy_quotes;
   ```

**De-duplication Strategy:**
- Products: Merge by SKU, keep highest price
- Contacts: Merge by email within same org
- Accounts: Merge by domain (e.g., @acme.com)

---

### Phase 5: Demo Mode Migration

**Objective:** Preserve demo mode functionality with localStorage fallback.

**Current State:**
- Demo mode uses `CRMContext` with localStorage
- Seed data generated via `generateDemoData()`
- Resets every 24 hours

**Target State:**
- Demo mode remains localStorage-based for evaluation
- Production users use Supabase
- Demo flag prevents Supabase queries

**Implementation:**
```typescript
// In CRMContext
const isDemoMode = localStorage.getItem('catchacrm_demo_mode') === 'true';

const fetchLeads = async () => {
  if (isDemoMode) {
    // Use localStorage
    return JSON.parse(localStorage.getItem('catchacrm_db_v3') || '{}').leads;
  } else {
    // Use Supabase
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('org_id', currentOrg.id);
    return data;
  }
};
```

**No Migration Required:**
Demo data is ephemeral and regenerated on demand.

---

## Validation Checkpoints

### Checkpoint 1: Schema Integrity
```sql
-- All tables have RLS enabled
SELECT COUNT(*) FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;
-- Expected: 10

-- All foreign keys valid
SELECT conname FROM pg_constraint
WHERE contype = 'f' AND connamespace = 'public'::regnamespace;
-- Expected: 8+ foreign keys
```

### Checkpoint 2: Data Integrity
```sql
-- No orphaned records (contacts without org)
SELECT COUNT(*) FROM contacts WHERE org_id NOT IN (SELECT id FROM organizations);
-- Expected: 0

-- All opportunities have valid accounts
SELECT COUNT(*) FROM opportunities
WHERE account_id IS NOT NULL
  AND account_id NOT IN (SELECT id FROM accounts);
-- Expected: 0

-- All org users reference valid orgs
SELECT COUNT(*) FROM organization_users
WHERE org_id NOT IN (SELECT id FROM organizations);
-- Expected: 0
```

### Checkpoint 3: RLS Enforcement
```sql
-- Set session to test user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO '<TEST_USER_ID>';

-- Try to access another org's data (should return 0)
SELECT COUNT(*) FROM contacts WHERE org_id != '<USER_ORG_ID>';
-- Expected: 0 (RLS blocks cross-org access)
```

### Checkpoint 4: Performance
```sql
-- Check for missing indexes
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected indexes:
-- - org_id on all tenant-scoped tables
-- - account_id on contacts/opportunities
-- - created_at on activities (for timeline)
```

---

## Rollback Procedures

### Rollback Level 1: Data Only (Preserve Schema)
```sql
TRUNCATE TABLE audit_log CASCADE;
TRUNCATE TABLE quotes CASCADE;
TRUNCATE TABLE activities CASCADE;
TRUNCATE TABLE opportunities CASCADE;
TRUNCATE TABLE accounts CASCADE;
TRUNCATE TABLE contacts CASCADE;
TRUNCATE TABLE organization_users CASCADE;
TRUNCATE TABLE organizations CASCADE;
TRUNCATE TABLE subscription_tiers CASCADE;
TRUNCATE TABLE products CASCADE;
```

### Rollback Level 2: Full Reset (Drop Everything)
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### Rollback Level 3: Restore from Backup
```bash
# Supabase automatic backups (Enterprise)
# Restore via Supabase dashboard > Database > Backups

# Manual restore from pg_dump
psql -h db.project.supabase.co -U postgres -d postgres < backup.sql
```

---

## Migration Schedule

### Pre-Production
- [x] Schema designed (M02_02)
- [x] RLS policies defined (M02_02)
- [ ] Schema deployed to staging Supabase project
- [ ] Reference data seeded
- [ ] Test user onboarding flow
- [ ] Validate RLS enforcement
- [ ] Performance testing with sample data

### Production Launch
- [ ] Schema deployed to production Supabase project
- [ ] Reference data seeded
- [ ] Legacy data migration (if applicable)
- [ ] Validation checkpoints passed
- [ ] Monitor first 24 hours
- [ ] Enable demo reset automation

### Post-Launch
- [ ] Monitor RLS policy performance
- [ ] Add missing indexes based on slow query log
- [ ] Optimize large table queries
- [ ] Set up automated backups
- [ ] Configure point-in-time recovery

---

## Data Migration Tools

### Supabase Studio
- Web-based SQL editor
- Data browser for manual inspection
- Export/import CSV via UI

### pg_dump / pg_restore
```bash
# Export from legacy DB
pg_dump -h legacy-db.com -U user -d crm_db > legacy_export.sql

# Import to Supabase (careful with RLS!)
psql -h db.project.supabase.co -U postgres -d postgres < legacy_export.sql
```

### Custom Migration Script
```typescript
// scripts/migrate-legacy-data.ts
import { createClient } from '@supabase/supabase-js';
import legacyData from './legacy-export.json';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function migrateOrgs() {
  for (const org of legacyData.companies) {
    await supabase.from('organizations').insert({
      id: org.id,
      name: org.name,
      slug: org.slug,
      // ...
    });
  }
}

await migrateOrgs();
await migrateUsers();
await migrateContacts();
// ...
```

---

## Monitoring & Alerts

### Key Metrics
- **Signup Success Rate:** >95%
- **Org Creation Rate:** 1:1 with signups
- **RLS Policy Hit Rate:** 100% (no policy bypasses)
- **Query Performance:** p95 <200ms

### Alerts
- Failed org creation → Slack alert
- RLS policy disabled → Critical alert
- Slow query (>1s) → Warning
- Orphaned records detected → Daily report

---

## Done Criteria Met

- ✅ Required tables identified (10 tables)
- ✅ Export/import sequence defined
- ✅ Validation checkpoints captured
- ✅ Migration checklist reviewed
- ✅ Rollback procedures documented
- ✅ Data migration plan ready

---

## Next Steps (Future Milestones)

### M03: Multi-tenant Enforcement
- Implement org context in CRMContext
- Add org_id to all Supabase queries
- Test cross-org isolation
- Validate RLS policies in production

### M07: Billing Integration
- Subscription tier enforcement
- Seat limit checks
- Payment webhook handlers
- Trial period automation

---

**M02_08 COMPLETE**

Data migration strategy documented and ready for execution in production deployment.
