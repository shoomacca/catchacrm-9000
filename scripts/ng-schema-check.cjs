
/**
 * ng-schema-check.js
 * Verify database schema has proper multi-tenancy (org_id on all tables, RLS enabled)
 *
 * Usage: node scripts/ng-schema-check.js [schema-file]
 * Example: node scripts/ng-schema-check.js supabase/complete_setup_v2.sql
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const schemaFile = args[0] || path.join(__dirname, '..', 'supabase', 'complete_setup_v2.sql');

function parseSchema(content) {
  const tableRegex = /CREATE TABLE(?:\s+IF NOT EXISTS)?\s+(\w+)\s*\(([\s\S]*?)(?=\n\);|\);)/gi;
  const tables = [];
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    const tableName = match[1];
    const tableBody = match[2];

    const hasOrgId = /org_id\s+UUID/i.test(tableBody);
    const hasOrgFk = /REFERENCES\s+organizations\s*\(/i.test(tableBody);

    tables.push({
      name: tableName,
      hasOrgId,
      hasOrgFk
    });
  }

  const rlsRegex = /CREATE POLICY\s+"([^"]+)"\s+ON\s+(\w+)/gi;
  const policies = [];

  while ((match = rlsRegex.exec(content)) !== null) {
    policies.push({
      name: match[1],
      table: match[2]
    });
  }

  const rlsEnabledRegex = /ALTER TABLE\s+(\w+)\s+ENABLE ROW LEVEL SECURITY/gi;
  const rlsEnabledTables = [];

  while ((match = rlsEnabledRegex.exec(content)) !== null) {
    rlsEnabledTables.push(match[1]);
  }

  return {
    tables,
    policies,
    rlsEnabledTables
  };
}

function verifyMultiTenancy(schema) {
  console.log('\n' + '='.repeat(80));
  console.log('  NEW GENESIS - SCHEMA VERIFICATION');
  console.log('='.repeat(80) + '\n');

  console.log('📊 SCHEMA STATISTICS:');
  console.log(`   Total tables: ${schema.tables.length}`);
  console.log(`   Tables with org_id: ${schema.tables.filter((t) => t.hasOrgId).length}`);
  console.log(`   Tables with org FK: ${schema.tables.filter((t) => t.hasOrgFk).length}`);
  console.log(`   RLS enabled on: ${schema.rlsEnabledTables.length} tables`);
  console.log(`   Total RLS policies: ${schema.policies.length}\n`);

  const tablesWithoutOrgId = schema.tables.filter((t) => !t.hasOrgId);
  const globalTables = ['subscription_tiers', 'organizations', 'organization_users'];

  console.log('🔍 MULTI-TENANCY CHECK:\n');

  let problematicTables = [];
  if (tablesWithoutOrgId.length === 0) {
    console.log('   ✅ All tables have org_id column');
  } else {
    problematicTables = tablesWithoutOrgId.filter((t) => !globalTables.includes(t.name));

    if (problematicTables.length === 0) {
      console.log('   ✅ Only global tables lack org_id (expected):');
      tablesWithoutOrgId.forEach((t) => {
        console.log(`      - ${t.name}`);
      });
    } else {
      console.log(`   ❌ ${problematicTables.length} tables missing org_id (CRITICAL):\n`);
      problematicTables.forEach((t) => {
        console.log(`      - ${t.name}`);
      });
      console.log('\n   ⚠️  These tables will not be properly isolated per organization!');
    }
  }

  console.log('\n🔒 ROW LEVEL SECURITY CHECK:\n');

  const tablesWithoutRls = schema.tables.filter((t) => !schema.rlsEnabledTables.includes(t.name));

  if (tablesWithoutRls.length === 0) {
    console.log('   ✅ RLS enabled on all tables');
  } else {
    console.log(`   ❌ ${tablesWithoutRls.length} tables without RLS enabled:\n`);
    tablesWithoutRls.forEach((t) => {
      console.log(`      - ${t.name}`);
    });
    console.log('\n   ⚠️  These tables are exposed without row-level security!');
  }

  console.log('\n📋 RLS POLICY COVERAGE:\n');

  const policyCountByTable = {};
  schema.policies.forEach((policy) => {
    policyCountByTable[policy.table] = (policyCountByTable[policy.table] || 0) + 1;
  });

  const tablesWithoutPolicies = schema.rlsEnabledTables.filter((table) => !policyCountByTable[table]);

  if (tablesWithoutPolicies.length === 0) {
    console.log('   ✅ All RLS-enabled tables have policies');
  } else {
    console.log(`   ⚠️  ${tablesWithoutPolicies.length} tables with RLS but no policies:\n`);
    tablesWithoutPolicies.forEach((table) => {
      console.log(`      - ${table}`);
    });
    console.log('\n   💡 Tables with RLS but no policies will block all access');
  }

  const wellProtectedTables = Object.entries(policyCountByTable)
    .filter(([, count]) => count >= 4)
    .map(([table]) => table);

  console.log(`\n   ✅ ${wellProtectedTables.length} tables with comprehensive policies (4+):`);
  wellProtectedTables.slice(0, 5).forEach((table) => {
    console.log(`      - ${table} (${policyCountByTable[table]} policies)`);
  });
  if (wellProtectedTables.length > 5) {
    console.log(`      ... and ${wellProtectedTables.length - 5} more`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 OVERALL ASSESSMENT:\n');

  const critical = [];
  const warnings = [];
  const passed = [];

  if (problematicTables.length > 0) {
    critical.push(`${problematicTables.length} tables missing org_id`);
  } else {
    passed.push('All tables have org_id (or are global tables)');
  }

  if (tablesWithoutRls.length > 0) {
    critical.push(`${tablesWithoutRls.length} tables without RLS enabled`);
  } else {
    passed.push('RLS enabled on all tables');
  }

  if (tablesWithoutPolicies.length > 0) {
    warnings.push(`${tablesWithoutPolicies.length} tables missing RLS policies`);
  } else {
    passed.push('All tables have RLS policies');
  }

  if (critical.length > 0) {
    console.log('   ❌ CRITICAL ISSUES:');
    critical.forEach((issue) => console.log(`      - ${issue}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('   ⚠️  WARNINGS:');
    warnings.forEach((warning) => console.log(`      - ${warning}`));
    console.log('');
  }

  if (passed.length > 0) {
    console.log('   ✅ PASSED:');
    passed.forEach((pass) => console.log(`      - ${pass}`));
    console.log('');
  }

  const status = critical.length === 0 ? 'PASS' : 'FAIL';
  console.log('='.repeat(80));
  console.log(`   FINAL VERDICT: ${status === 'PASS' ? '✅' : '❌'} ${status}`);
  console.log('='.repeat(80) + '\n');

  if (status === 'FAIL') {
    console.log('💡 RECOMMENDATIONS:\n');
    console.log('   1. Add org_id UUID column to all tables (except global tables)');
    console.log('   2. Add REFERENCES organizations(id) ON DELETE CASCADE');
    console.log('   3. Enable RLS on all tables: ALTER TABLE [name] ENABLE ROW LEVEL SECURITY');
    console.log('   4. Create policies using org_id for isolation');
    console.log('   5. Run this script again to verify fixes\n');
  } else {
    console.log('💡 Schema is properly configured for multi-tenancy!\n');
    console.log('   Next steps:');
    console.log('   1. Apply schema to Supabase via SQL Editor');
    console.log('   2. Run security advisor to verify');
    console.log('   3. Test with multiple organizations\n');
  }

  return status === 'PASS';
}

function main() {
  if (!fs.existsSync(schemaFile)) {
    console.error(`❌ Schema file not found: ${schemaFile}\n`);
    console.log('Usage: node scripts/ng-schema-check.js [schema-file]');
    console.log('Example: node scripts/ng-schema-check.js supabase/complete_setup_v2.sql\n');
    process.exit(1);
  }

  console.log(`\n📄 Analyzing schema file: ${path.basename(schemaFile)}\n`);

  const content = fs.readFileSync(schemaFile, 'utf-8');
  const schema = parseSchema(content);

  const passed = verifyMultiTenancy(schema);
  process.exit(passed ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { parseSchema, verifyMultiTenancy };
