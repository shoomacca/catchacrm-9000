
/**
 * ng-audit.js
 * Verify that audit files requirements are being followed in the project
 *
 * Usage: node scripts/ng-audit.js
 */

const fs = require('fs');
const path = require('path');

const AUDIT_DIR = path.join(__dirname, '..', '.antigravity', 'docs', 'audit');
const SUPABASE_DIR = path.join(__dirname, '..', 'supabase');

const AUDIT_FILES = [
  'MISSING_FEATURES.md',
  'UPGRADE_PLAN.md',
  'ENTERPRISE_FEATURES.md'
];

function checkAuditFilesExist() {
  console.log('\n📁 Checking audit files exist...\n');

  let allExist = true;
  AUDIT_FILES.forEach((file) => {
    const filePath = path.join(AUDIT_DIR, file);
    const exists = fs.existsSync(filePath);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allExist = false;
  });

  return allExist;
}

function parseUpgradePlan() {
  const upgradePlanPath = path.join(AUDIT_DIR, 'UPGRADE_PLAN.md');
  if (!fs.existsSync(upgradePlanPath)) return null;

  const content = fs.readFileSync(upgradePlanPath, 'utf-8');

  const baseTables = content.match(/(\d+) Base CRM Tables/i)?.[1] || '0';
  const enterpriseTables = content.match(/(\d+) Enterprise Tables/i)?.[1] || '0';
  const totalTables = parseInt(baseTables, 10) + parseInt(enterpriseTables, 10);

  const features = [];
  const lines = content.split('\n');
  lines.forEach((line) => {
    if (line.match(/^[-*]\s+\[.\]\s+/)) {
      features.push(line.trim());
    }
  });

  return {
    baseTables: parseInt(baseTables, 10),
    enterpriseTables: parseInt(enterpriseTables, 10),
    totalTables,
    features
  };
}

function checkSchemaCompliance() {
  console.log('\n🗄️  Checking database schema compliance...\n');

  const upgradePlan = parseUpgradePlan();
  if (!upgradePlan) {
    console.log('   ⚠️  Could not parse UPGRADE_PLAN.md');
    return false;
  }

  console.log(
    `   📊 Expected tables: ${upgradePlan.totalTables} (${upgradePlan.baseTables} base + ${upgradePlan.enterpriseTables} enterprise)`
  );

  const schemaFiles = [
    'complete_setup.sql',
    'complete_setup_v2.sql',
    'schema.sql',
    'schema_enterprise.sql'
  ];

  let foundSchema = null;
  schemaFiles.forEach((file) => {
    const filePath = path.join(SUPABASE_DIR, file);
    if (fs.existsSync(filePath)) {
      foundSchema = file;
      console.log(`   ✅ Found schema file: ${file}`);
    }
  });

  if (!foundSchema) {
    console.log('   ❌ No schema file found in supabase/');
    return false;
  }

  const schemaPath = path.join(SUPABASE_DIR, foundSchema);
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

  const orgIdMatches = schemaContent.match(/org_id/g) || [];
  const tableCreations = schemaContent.match(/CREATE TABLE/gi) || [];

  console.log(`   📋 Tables in schema: ${tableCreations.length}`);
  console.log(`   🔑 org_id references: ${orgIdMatches.length}`);

  if (foundSchema.includes('v2')) {
    const expectedOrgIds = upgradePlan.totalTables - 1;
    if (orgIdMatches.length >= expectedOrgIds) {
      console.log('   ✅ Schema appears to have proper multi-tenancy (v2)');
      return true;
    }

    console.log('   ⚠️  Schema may be missing org_id on some tables');
    return false;
  }

  console.log(`   ⚠️  Using old schema (${foundSchema}) - should use complete_setup_v2.sql`);
  return false;
}

function checkMissingFeatures() {
  console.log('\n🔍 Checking missing features implementation...\n');

  const missingFeaturesPath = path.join(AUDIT_DIR, 'MISSING_FEATURES.md');
  if (!fs.existsSync(missingFeaturesPath)) {
    console.log('   ⚠️  MISSING_FEATURES.md not found');
    return;
  }

  const content = fs.readFileSync(missingFeaturesPath, 'utf-8');
  const categories = content.match(/###\s+(.+)/g) || [];
  console.log(`   📝 Feature categories to implement: ${categories.length}`);

  categories.slice(0, 5).forEach((cat) => {
    console.log(`      - ${cat.replace('###', '').trim()}`);
  });

  if (categories.length > 5) {
    console.log(`      ... and ${categories.length - 5} more`);
  }
}

function checkEnterpriseFeatures() {
  console.log('\n🏢 Checking enterprise features implementation...\n');

  const enterpriseFeaturesPath = path.join(AUDIT_DIR, 'ENTERPRISE_FEATURES.md');
  if (!fs.existsSync(enterpriseFeaturesPath)) {
    console.log('   ⚠️  ENTERPRISE_FEATURES.md not found');
    return;
  }

  const content = fs.readFileSync(enterpriseFeaturesPath, 'utf-8');
  const keyTables = [
    'roles',
    'permissions',
    'role_permissions',
    'user_roles',
    'custom_fields',
    'field_definitions',
    'teams',
    'team_members',
    'audit_logs',
    'company_settings'
  ];

  const schemaFile = fs.existsSync(path.join(SUPABASE_DIR, 'complete_setup_v2.sql'))
    ? 'complete_setup_v2.sql'
    : 'complete_setup.sql';

  if (!fs.existsSync(path.join(SUPABASE_DIR, schemaFile))) {
    console.log(`   ⚠️  Schema file ${schemaFile} not found`);
    return;
  }

  const schemaContent = fs.readFileSync(path.join(SUPABASE_DIR, schemaFile), 'utf-8');

  console.log('   Checking enterprise tables:');
  keyTables.forEach((table) => {
    const exists =
      schemaContent.includes(`CREATE TABLE ${table}`) ||
      schemaContent.includes(`CREATE TABLE IF NOT EXISTS ${table}`);
    console.log(`      ${exists ? '✅' : '❌'} ${table}`);
  });
}

function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('  NEW GENESIS - AUDIT COMPLIANCE REPORT');
  console.log('='.repeat(80));

  const auditFilesExist = checkAuditFilesExist();
  const schemaCompliant = checkSchemaCompliance();

  checkMissingFeatures();
  checkEnterpriseFeatures();

  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY:');
  console.log(`   Audit Files: ${auditFilesExist ? '✅ All present' : '❌ Some missing'}`);
  console.log(`   Schema Compliance: ${schemaCompliant ? '✅ Compliant' : '⚠️  Needs review'}`);
  console.log('='.repeat(80) + '\n');

  console.log('💡 RECOMMENDATIONS:');
  if (!schemaCompliant) {
    console.log('   1. Review audit files to understand all requirements');
    console.log('   2. Create complete_setup_v2.sql with org_id on ALL tables');
    console.log('   3. Verify all enterprise features are included');
  } else {
    console.log('   ✅ Schema appears compliant with audit requirements');
    console.log('   💡 Continue with milestone implementation');
  }
  console.log('\n');
}

if (require.main === module) {
  generateReport();
}

module.exports = { checkAuditFilesExist, checkSchemaCompliance };
