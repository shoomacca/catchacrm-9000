import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anawatvgypmrpbmjfcht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYXdhdHZneXBtcnBibWpmY2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwNDMwOSwiZXhwIjoyMDg0MjgwMzA5fQ.njigvMg4pdmKMtoWngrgNtw1c59JcM9K_aAaHv-ddwU';

const supabase = createClient(supabaseUrl, supabaseKey);

const tablesToCheck = [
  'company_settings',
  'crm_settings',
  'email_templates',
  'sms_templates',
  'roles',
  'teams',
  'team_members',
  'currencies',
  'import_jobs',
  'export_jobs',
  'webhook_configs',
  'webhook_logs',
  'kb_articles',
  'kb_categories',
  'business_hours',
  'holidays',
  'custom_objects',
  'login_history',
  'duplicate_rules',
  'matching_rules'
];

async function checkTable(tableName) {
  try {
    // Check if table exists and get row count
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        table: tableName,
        exists: false,
        error: error.message
      };
    }

    // Check if table has org_id column
    const { data: sampleRow } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
      .single();

    const hasOrgId = sampleRow && 'org_id' in sampleRow;

    return {
      table: tableName,
      exists: true,
      rowCount: count || 0,
      hasOrgId,
      hasData: count > 0
    };
  } catch (err) {
    return {
      table: tableName,
      exists: false,
      error: err.message
    };
  }
}

async function checkRLSPolicies() {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT tablename, policyname, permissive, cmd
      FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename IN (${tablesToCheck.map(t => `'${t}'`).join(',')})
      ORDER BY tablename, policyname;
    `
  });

  if (error) {
    // Try alternative method
    const query = `
      SELECT tablename, policyname
      FROM pg_policies
      WHERE tablename IN (${tablesToCheck.map(t => `'${t}'`).join(',')})
      ORDER BY tablename, policyname;
    `;

    console.log('\n=== RLS POLICIES QUERY ===');
    console.log(query);
    console.log('Note: Run this query in Supabase SQL Editor to check policies\n');
    return null;
  }

  return data;
}

async function checkAllowAllPolicies() {
  const query = `
    SELECT tablename, policyname
    FROM pg_policies
    WHERE policyname LIKE '%allow_all%'
    ORDER BY tablename;
  `;

  console.log('\n=== ALLOW_ALL POLICIES QUERY ===');
  console.log(query);
  console.log('Note: Run this query in Supabase SQL Editor to find security holes\n');
}

async function main() {
  console.log('=== CATCHACRM SMOKE TEST ===\n');
  console.log('Checking Supabase tables...\n');

  const results = [];

  for (const table of tablesToCheck) {
    const result = await checkTable(table);
    results.push(result);

    const status = result.exists ? '✓' : '✗';
    const orgId = result.hasOrgId ? 'YES' : 'NO';
    const rows = result.rowCount !== undefined ? result.rowCount : 'N/A';

    console.log(`${status} ${table.padEnd(25)} | Exists: ${result.exists} | org_id: ${orgId.padEnd(3)} | Rows: ${rows}`);

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  console.log('\n=== SUMMARY ===');
  const existing = results.filter(r => r.exists).length;
  const withOrgId = results.filter(r => r.hasOrgId).length;
  const withData = results.filter(r => r.hasData).length;
  const missing = results.filter(r => !r.exists);

  console.log(`Tables checked: ${tablesToCheck.length}`);
  console.log(`Tables exist: ${existing}/${tablesToCheck.length}`);
  console.log(`Tables with org_id: ${withOrgId}/${existing}`);
  console.log(`Tables with data: ${withData}/${existing}`);

  if (missing.length > 0) {
    console.log('\n⚠️  MISSING TABLES:');
    missing.forEach(m => console.log(`   - ${m.table}`));
  }

  await checkRLSPolicies();
  await checkAllowAllPolicies();

  return results;
}

main().catch(console.error);
