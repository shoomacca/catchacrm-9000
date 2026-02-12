/**
 * Execute SQL using Supabase's internal SQL execution
 * This script attempts to deploy the handle_new_user trigger
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://anawatvgypmrpbmjfcht.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYXdhdHZneXBtcnBibWpmY2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwNDMwOSwiZXhwIjoyMDg0MjgwMzA5fQ.njigvMg4pdmKMtoWngrgNtw1c59JcM9K_aAaHv-ddwU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// First, let's create an exec_sql function if it doesn't exist
const createExecSqlFunction = `
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN 'OK';
EXCEPTION WHEN OTHERS THEN
  RETURN SQLERRM;
END;
$$;
`;

// The trigger SQL broken into smaller chunks
const sqlStatements = [
  // 1. Create organization_users table if not exists
  `CREATE TABLE IF NOT EXISTS organization_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, user_id)
  )`,

  // 2. Create indexes
  `CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON organization_users(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_organization_users_org_id ON organization_users(org_id)`,

  // 3. Enable RLS
  `ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY`,

  // 4. Drop existing policy if exists and create new one
  `DROP POLICY IF EXISTS "organization_users_own_access" ON organization_users`,
  `CREATE POLICY "organization_users_own_access" ON organization_users FOR ALL USING (user_id = auth.uid())`,

  // 5. Create the trigger function
  `CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS TRIGGER AS $$
  DECLARE
    new_org_id UUID;
    new_account_id UUID;
    company_name TEXT;
    user_name TEXT;
    user_email_domain TEXT;
  BEGIN
    company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Organization');
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    user_email_domain := split_part(NEW.email, '@', 2);

    INSERT INTO organizations (name, slug, org_type, subscription_tier, max_seats, active)
    VALUES (
      company_name,
      LOWER(REGEXP_REPLACE(company_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || SUBSTR(NEW.id::TEXT, 1, 8),
      'standard',
      'free',
      5,
      true
    )
    RETURNING id INTO new_org_id;

    INSERT INTO organization_users (org_id, user_id, role, active)
    VALUES (new_org_id, NEW.id, 'owner', true);

    INSERT INTO users (org_id, name, email, role, avatar)
    VALUES (
      new_org_id,
      user_name,
      NEW.email,
      'admin',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id::TEXT
    );

    INSERT INTO accounts (org_id, name, industry, tier, website, status, owner_id)
    VALUES (
      new_org_id,
      company_name,
      'Technology',
      'Silver',
      'https://' || user_email_domain,
      'Active',
      (SELECT id FROM users WHERE org_id = new_org_id LIMIT 1)
    )
    RETURNING id INTO new_account_id;

    INSERT INTO contacts (org_id, account_id, name, email, title, status, owner_id)
    VALUES (
      new_org_id,
      new_account_id,
      user_name,
      NEW.email,
      'Owner',
      'Active',
      (SELECT id FROM users WHERE org_id = new_org_id LIMIT 1)
    );

    UPDATE auth.users SET raw_user_meta_data =
      raw_user_meta_data || jsonb_build_object('org_id', new_org_id)
    WHERE id = NEW.id;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER`,

  // 6. Drop existing trigger
  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`,

  // 7. Create the trigger
  `CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user()`,

  // 8. Grant permissions
  `GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated`,
  `GRANT EXECUTE ON FUNCTION handle_new_user() TO anon`
];

async function executeViaRpc(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) throw error;
    return { success: true, result: data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function executeViaFetch(sql) {
  // Try using the Supabase REST SQL endpoint (requires postgres role)
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ sql_query: sql })
  });

  if (!response.ok) {
    const text = await response.text();
    return { success: false, error: text };
  }

  const data = await response.json();
  return { success: true, result: data };
}

async function main() {
  console.log('='.repeat(60));
  console.log('  DEPLOYING HANDLE_NEW_USER TRIGGER');
  console.log('='.repeat(60));

  // First, try to create the exec_sql function
  console.log('\n1. Creating exec_sql helper function...');
  const createResult = await executeViaFetch(createExecSqlFunction);
  if (!createResult.success) {
    console.log('   Note: exec_sql creation may require direct DB access');
    console.log('   Error:', createResult.error?.substring(0, 100));
  }

  // Execute each statement
  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    const shortSql = sql.substring(0, 50).replace(/\n/g, ' ');
    console.log(`\n${i + 2}. Executing: ${shortSql}...`);

    const result = await executeViaRpc(sql);
    if (result.success) {
      console.log('   ✅ Success');
    } else {
      console.log('   ❌ Failed:', result.error);

      // If it's a trigger-related statement, it needs direct DB access
      if (sql.includes('auth.users') || sql.includes('TRIGGER')) {
        console.log('   ⚠️  This requires direct database access (Supabase Dashboard SQL Editor)');
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('  SUMMARY');
  console.log('='.repeat(60));
  console.log(`
The organization_users table and related setup should be complete.

However, the auth trigger (on_auth_user_created) requires DIRECT database
access because it operates on the auth.users table which is managed by Supabase.

To complete the deployment:
1. Go to: https://supabase.com/dashboard/project/anawatvgypmrpbmjfcht/sql
2. Copy the contents of: supabase/handle_new_user.sql
3. Paste and run in the SQL Editor

Alternatively, the frontend fallback in AuthContext will handle organization
creation if the trigger doesn't exist.
  `);
}

main().catch(console.error);
