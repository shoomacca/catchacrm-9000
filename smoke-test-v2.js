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

async function checkTableSchema(tableName) {
  try {
    // Get row count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return {
        table: tableName,
        exists: false,
        error: countError.message
      };
    }

    // Check for org_id by selecting it specifically
    const { error: orgIdError } = await supabase
      .from(tableName)
      .select('org_id')
      .limit(1);

    const hasOrgId = !orgIdError;

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

async function main() {
  console.log('=== CATCHACRM SMOKE TEST V2 (Improved) ===\n');
  console.log('Checking Supabase tables...\n');

  const results = [];

  for (const table of tablesToCheck) {
    const result = await checkTableSchema(table);
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
  const missingOrgId = results.filter(r => r.exists && !r.hasOrgId);

  console.log(`Tables checked: ${tablesToCheck.length}`);
  console.log(`Tables exist: ${existing}/${tablesToCheck.length}`);
  console.log(`Tables with org_id: ${withOrgId}/${existing}`);
  console.log(`Tables with data: ${withData}/${existing}`);

  if (missing.length > 0) {
    console.log('\n⚠️  MISSING TABLES:');
    missing.forEach(m => console.log(`   - ${m.table}`));
  }

  if (missingOrgId.length > 0) {
    console.log('\n⚠️  TABLES WITHOUT org_id:');
    missingOrgId.forEach(m => console.log(`   - ${m.table}`));
  }

  return results;
}

main().catch(console.error);
