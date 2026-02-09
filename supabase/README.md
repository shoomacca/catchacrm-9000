# Supabase Schema - CatchaCRM NG v11

## Overview

This directory contains the database schema for CatchaCRM NG v11, a multi-tenant CRM with strict row-level security (RLS) isolation.

## Schema File

- **`complete_setup_v2.sql`** - Complete schema with all tables, RLS policies, indexes, and triggers

## Multi-Tenancy Architecture

### Core Principles

1. **Org Isolation**: Every tenant-scoped table has an `org_id` column
2. **RLS Enforcement**: All tables have RLS enabled with comprehensive policies
3. **Hierarchical Orgs**: Organizations can have parent-child relationships via `parent_org_id`
4. **Role-Based Access**: Users have roles (owner, admin, manager, user, readonly) per org

### Tables

**Multi-Tenant Tables (with org_id):**
- `organizations` - Tenant table
- `organization_users` - User-org membership
- `contacts` - CRM contacts/leads
- `accounts` - CRM companies
- `opportunities` - CRM deals
- `activities` - Timeline activities
- `products` - Product catalog
- `quotes` - CPQ quotes
- `audit_log` - Audit trail

**Global Tables (no org_id):**
- `subscription_tiers` - Subscription definitions

## How to Apply Schema

### Option 1: Supabase Dashboard
1. Go to Supabase dashboard → SQL Editor
2. Copy contents of `complete_setup_v2.sql`
3. Execute the SQL

### Option 2: Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply schema
supabase db push
```

### Option 3: Direct psql
```bash
psql postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres < complete_setup_v2.sql
```

## Verification

After applying the schema, verify multi-tenancy:

```bash
node scripts/ng-schema-check.cjs supabase/complete_setup_v2.sql
```

Expected output:
```
✅ PASS
- All tables have org_id (or are global tables)
- RLS enabled on all tables
- All tables have RLS policies
```

## RLS Policy Pattern

All tenant-scoped tables follow this pattern:

```sql
-- Users can only see data from their org
CREATE POLICY "table_select_own_org" ON table_name
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

-- Similar policies for INSERT, UPDATE, DELETE
```

## Testing Multi-Tenancy

1. Create two test organizations
2. Create users in each org
3. Insert test data with different org_ids
4. Verify users can only see their org's data
5. Try cross-tenant access (should fail)

## Security Notes

- **Service Role Key**: Never expose in client code
- **Anon Key**: Safe for client use, RLS enforces security
- **Admin Actions**: Some operations require service role (e.g., creating orgs)
- **Audit Logging**: All admin actions logged to `audit_log` table

## Next Steps

1. Apply schema to Supabase project
2. Run security advisor in Supabase dashboard
3. Set up environment variables (see `.env.example`)
4. Test with multiple organizations
5. Implement data access layer in app

## Environment Variables

Required for the app:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For admin/backend operations:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Schema Stats

- Total tables: 10
- Tables with org_id: 9
- RLS policies: 35
- Indexes: 10+
- Triggers: 8 (updated_at)

## Support

For schema issues, see:
- `.antigravity/DECISIONS.md` - Schema decisions
- `.antigravity/shards/M02/M02_02_SUPABASE_MIGRATION.md` - Migration details
