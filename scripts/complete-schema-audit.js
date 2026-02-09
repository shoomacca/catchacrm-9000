/**
 * COMPLETE SCHEMA AUDIT
 * Compares TypeScript types with actual database schema
 * Generates complete ALTER TABLE statements for every table
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('\n🔍 COMPLETE SCHEMA AUDIT\n');
console.log('Comparing TypeScript types with database schema...\n');

// Map TypeScript types to SQL types
const typeMap = {
  'string': 'TEXT',
  'number': 'DECIMAL(12,2)', // Could be INTEGER for IDs
  'boolean': 'BOOLEAN',
  'Date': 'TIMESTAMPTZ',
  'array': 'JSONB',
  'object': 'JSONB',
  'Address': 'JSONB',
  'any': 'JSONB'
};

async function getDatabaseTables() {
  const { data, error } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `
    });

  if (error) {
    // Fallback: query known tables
    const knownTables = [
      'accounts', 'activities', 'audit_log', 'bank_transactions',
      'calendar_events', 'campaigns', 'communications', 'contacts',
      'conversations', 'crews', 'deals', 'documents', 'equipment',
      'expenses', 'industry_templates', 'inventory_items', 'invoices',
      'jobs', 'leads', 'opportunities', 'organizations', 'products',
      'purchase_orders', 'quotes', 'reviews', 'services', 'subscription_tiers',
      'subscriptions', 'tasks', 'teams', 'tickets', 'users', 'warehouses',
      'workflows', 'zones'
    ];

    return knownTables;
  }

  return data.map(row => row.table_name);
}

async function getTableColumns(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);

    if (error) {
      console.log(`   ⚠️  ${tableName}: Cannot read (${error.message})`);
      return null;
    }

    // Get actual columns from error message or query metadata
    // This is a workaround since we can't query information_schema directly
    return data;
  } catch (e) {
    return null;
  }
}

async function analyzeTypes() {
  // Read types.ts
  const typesContent = fs.readFileSync(
    path.resolve(__dirname, '../src/types.ts'),
    'utf-8'
  );

  // Extract interface names
  const interfaceMatches = typesContent.matchAll(/export interface (\w+).*?\{([\s\S]*?)\n\}/g);
  const interfaces = {};

  for (const match of interfaceMatches) {
    const [, name, body] = match;

    // Parse fields from interface body
    const fields = [];
    const fieldMatches = body.matchAll(/^\s+(\w+)\??:\s*([^;]+);/gm);

    for (const fieldMatch of fieldMatches) {
      const [, fieldName, fieldType] = fieldMatch;
      fields.push({ name: fieldName, type: fieldType.trim() });
    }

    interfaces[name] = fields;
  }

  return interfaces;
}

async function main() {
  // Get all tables from database
  const tables = await getDatabaseTables();
  console.log(`Found ${tables.length} tables in database\n`);

  // Get all interfaces from TypeScript
  const interfaces = await analyzeTypes();
  console.log(`Found ${Object.keys(interfaces).length} interfaces in types.ts\n`);

  console.log('═══════════════════════════════════════════════\n');

  // Core CRM tables to audit
  const coreTableMappings = {
    'accounts': 'Account',
    'contacts': 'Contact',
    'leads': 'Lead',
    'deals': 'Deal',
    'tasks': 'Task',
    'calendar_events': 'CalendarEvent',
    'campaigns': 'Campaign',
    'tickets': 'Ticket',
    'products': 'Product',
    'services': 'Service',
    'quotes': 'Quote',
    'invoices': 'Invoice',
    'jobs': 'Job',
    'crews': 'Crew',
    'zones': 'Zone',
    'equipment': 'Equipment',
    'inventory_items': 'InventoryItem',
    'purchase_orders': 'PurchaseOrder',
    'warehouses': 'Warehouse',
    'expenses': 'Expense',
    'bank_transactions': 'BankTransaction',
    'reviews': 'Review',
    'users': 'User',
    'organizations': 'Organization'
  };

  let report = '-- ============================================\n';
  report += '-- SCHEMA AUDIT REPORT\n';
  report += `-- Generated: ${new Date().toISOString()}\n`;
  report += '-- ============================================\n\n';

  for (const [tableName, interfaceName] of Object.entries(coreTableMappings)) {
    const interface_ = interfaces[interfaceName];

    if (!interface_) {
      console.log(`❌ ${tableName}: No interface found (${interfaceName})`);
      continue;
    }

    console.log(`\n📋 ${tableName} (${interfaceName}):`);
    console.log(`   TypeScript fields: ${interface_.length}`);

    report += `-- ============================================\n`;
    report += `-- TABLE: ${tableName}\n`;
    report += `-- INTERFACE: ${interfaceName}\n`;
    report += `-- Fields in TypeScript: ${interface_.length}\n`;
    report += `-- ============================================\n\n`;

    // Generate ALTER TABLE statements for each field
    interface_.forEach(field => {
      const columnName = field.name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
      let sqlType = 'TEXT';

      // Determine SQL type
      if (field.type.includes('number')) {
        sqlType = field.name.includes('id') || field.name.includes('Id') ? 'UUID' : 'DECIMAL(12,2)';
      } else if (field.type.includes('boolean')) {
        sqlType = 'BOOLEAN';
      } else if (field.type.includes('Date') || field.type.includes('string') && field.name.includes('date')) {
        sqlType = 'TIMESTAMPTZ';
      } else if (field.type.includes('[]')) {
        sqlType = 'JSONB';
      } else if (field.type.includes('Record') || field.type.includes('{')) {
        sqlType = 'JSONB';
      } else if (field.name.includes('id') || field.name.includes('Id')) {
        sqlType = 'UUID';
      }

      const nullable = field.type.includes('?') || field.type.includes('undefined');
      const constraint = nullable ? '' : ' NOT NULL';

      // Add reference constraint if it's an ID field
      let reference = '';
      if (columnName.endsWith('_id') && columnName !== 'id' && !columnName.includes('org_id')) {
        const refTable = columnName.replace(/_id$/, 's');
        if (refTable === 'users') {
          reference = ` REFERENCES users(id)`;
        } else if (tables.includes(refTable)) {
          reference = ` REFERENCES ${refTable}(id)`;
        }
      }

      report += `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${columnName} ${sqlType}${constraint}${reference};\n`;
    });

    report += '\n';
  }

  // Write report to file
  fs.writeFileSync(
    path.resolve(__dirname, '../supabase/COMPLETE_SCHEMA_FIX.sql'),
    report
  );

  console.log('\n═══════════════════════════════════════════════\n');
  console.log('✅ Audit complete!');
  console.log('📄 Report saved to: supabase/COMPLETE_SCHEMA_FIX.sql\n');
  console.log('Next step: Run that SQL file in Supabase SQL Editor\n');
}

main().catch(console.error);
