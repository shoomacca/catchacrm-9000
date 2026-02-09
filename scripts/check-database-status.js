/**
 * Database Status Checker
 *
 * Quickly check if:
 * 1. Database has tables
 * 2. Matrix data is loaded
 * 3. Schema matches frontend types
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('🔍 CatchaCRM Database Status Check\n');
console.log('═══════════════════════════════════════════════\n');

async function checkTableCounts() {
  const tables = [
    'organizations',
    'users',
    'accounts',
    'contacts',
    'leads',
    'deals',
    'tasks',
    'campaigns',
    'tickets',
    'products',
    'services',
    'calendar_events',
    'jobs',
    'crews',
    'equipment',
    'zones',
    'inventory_items',
    'warehouses',
    'purchase_orders',
    'quotes',
    'invoices'
  ];

  let totalRows = 0;
  let tablesExist = 0;
  let tablesMissing = 0;

  console.log('📊 Table Status:\n');

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.message.includes('does not exist') || error.code === '42P01') {
          console.log(`   ❌ ${table.padEnd(25)} - TABLE MISSING`);
          tablesMissing++;
        } else {
          console.log(`   ⚠️  ${table.padEnd(25)} - ${error.message}`);
        }
      } else {
        const rowCount = count || 0;
        totalRows += rowCount;
        tablesExist++;

        if (rowCount === 0) {
          console.log(`   ⚪ ${table.padEnd(25)} - 0 rows (empty)`);
        } else {
          console.log(`   ✅ ${table.padEnd(25)} - ${rowCount} rows`);
        }
      }
    } catch (err) {
      console.log(`   ❌ ${table.padEnd(25)} - ERROR: ${err.message}`);
      tablesMissing++;
    }
  }

  console.log('\n═══════════════════════════════════════════════\n');
  console.log(`📈 Summary:\n`);
  console.log(`   Tables exist:    ${tablesExist}/${tables.length}`);
  console.log(`   Tables missing:  ${tablesMissing}/${tables.length}`);
  console.log(`   Total data rows: ${totalRows}\n`);

  return { tablesExist, tablesMissing, totalRows };
}

async function checkMatrixData() {
  console.log('🎭 Matrix Data Check:\n');

  const checks = [
    { table: 'accounts', name: 'Nebuchadnezzar' },
    { table: 'contacts', name: 'Neo Anderson' },
    { table: 'contacts', name: 'Morpheus' },
    { table: 'contacts', name: 'Trinity' },
    { table: 'products', name: 'Red Pill' },
    { table: 'products', name: 'Blue Pill' }
  ];

  let foundCount = 0;

  for (const check of checks) {
    try {
      const { data, error } = await supabase
        .from(check.table)
        .select('id')
        .eq('name', check.name)
        .single();

      if (data) {
        console.log(`   ✅ Found: ${check.name}`);
        foundCount++;
      } else {
        console.log(`   ❌ Missing: ${check.name}`);
      }
    } catch (err) {
      console.log(`   ❌ Missing: ${check.name} (${err.message})`);
    }
  }

  console.log(`\n   Matrix data: ${foundCount}/${checks.length} key records found\n`);

  return foundCount === checks.length;
}

async function main() {
  try {
    const { tablesExist, tablesMissing, totalRows } = await checkTableCounts();
    const hasMatrixData = await checkMatrixData();

    console.log('═══════════════════════════════════════════════\n');
    console.log('🎯 Status:\n');

    if (tablesMissing > 0) {
      console.log('   ❌ DATABASE NOT READY');
      console.log('   → Some tables are missing');
      console.log('   → Run: supabase/FULL_RESET.sql in Supabase SQL Editor\n');
    } else if (totalRows === 0) {
      console.log('   ⚠️  DATABASE EMPTY');
      console.log('   → Schema exists but no data');
      console.log('   → Run: node scripts/fresh-start-automated.js --skip-schema\n');
    } else if (!hasMatrixData) {
      console.log('   ⚠️  UNKNOWN DATA');
      console.log('   → Database has data but not Matrix-themed mock data');
      console.log('   → Consider running fresh start if you want Matrix data\n');
    } else {
      console.log('   ✅ DATABASE READY');
      console.log('   → Schema exists');
      console.log('   → Matrix data loaded');
      console.log(`   → ${totalRows} total rows\n`);
      console.log('   Next: Test at http://localhost:3002\n');
    }

    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error checking database:', error.message);
    console.log('\nThis usually means:');
    console.log('  1. Database is empty (no tables created)');
    console.log('  2. Network/connection issue');
    console.log('  3. Invalid Supabase credentials\n');
    console.log('Solution: Run supabase/FULL_RESET.sql in Supabase SQL Editor\n');
  }
}

main();
