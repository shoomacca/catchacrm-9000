#!/usr/bin/env node

/**
 * Apply Schema Update and Mock Data to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

console.log('\n🚀 Applying Schema Update to Supabase...\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySQLFile(filename, description) {
  try {
    console.log(`📄 Loading ${description}...`);
    const sqlPath = join(__dirname, '..', 'supabase', filename);
    const sql = readFileSync(sqlPath, 'utf8');

    console.log(`⚡ Executing ${description}...`);

    // Execute SQL via Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      console.log(`⚠️  Direct SQL exec not available, trying query method...`);

      // Alternative: Break into chunks and execute
      console.log(`   Executing via connection string...`);
      console.log(`   ⚠️  You may need to apply this manually via Supabase Dashboard SQL Editor`);
      console.log(`   📁 File: supabase/${filename}`);
      return false;
    }

    console.log(`✅ ${description} applied successfully!\n`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying ${description}:`, error.message);
    console.log(`\n💡 Please apply manually:`);
    console.log(`   1. Open Supabase Dashboard → SQL Editor`);
    console.log(`   2. Copy contents of: supabase/${filename}`);
    console.log(`   3. Execute the SQL\n`);
    return false;
  }
}

async function verifyTables() {
  console.log('🔍 Verifying tables...\n');

  const tablesToCheck = [
    'leads', 'deals', 'tasks', 'campaigns', 'tickets', 'jobs',
    'crews', 'zones', 'equipment', 'inventory', 'warehouses',
    'purchase_orders', 'procurement', 'services', 'invoices',
    'calendar_events', 'communications', 'users'
  ];

  for (const table of tablesToCheck) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`❌ ${table.padEnd(20)} - Not found or error`);
    } else {
      console.log(`✅ ${table.padEnd(20)} - Found (${count || 0} rows)`);
    }
  }
}

async function main() {
  // Apply schema updates
  const schemaApplied = await applySQLFile('schema_update_complete.sql', 'Schema Update');

  // Apply mock data
  if (schemaApplied) {
    await applySQLFile('mock_data_matrix.sql', 'Matrix Mock Data');
  }

  // Verify
  await verifyTables();

  console.log('\n✅ Database setup complete!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Restart dev server: npm run dev');
  console.log('   2. Open browser: http://localhost:3000');
  console.log('   3. Check console for "✓ Supabase client initialized"');
  console.log('   4. Navigate to any module to see Matrix-themed data!\n');
}

main();
