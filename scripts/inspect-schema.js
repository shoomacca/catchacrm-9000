#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('\n🔍 Inspecting Database Schema...\n');

async function inspectTable(tableName) {
  try {
    // Get first row to see structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      return null;
    }

    // Get count
    const { count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    return {
      name: tableName,
      columns: data && data.length > 0 ? Object.keys(data[0]) : [],
      count: count || 0
    };
  } catch (err) {
    return null;
  }
}

async function main() {
  // Try common CRM tables
  const potentialTables = [
    'accounts', 'contacts', 'leads', 'deals', 'opportunities',
    'tasks', 'campaigns', 'tickets', 'jobs', 'crews', 'equipment',
    'zones', 'inventory', 'warehouses', 'purchase_orders', 'procurement',
    'services', 'invoices', 'products', 'quotes', 'calendar_events',
    'communications', 'users', 'organizations', 'organization_users',
    'activities', 'audit_log', 'subscription_tiers'
  ];

  console.log('Checking known CRM tables:\n');

  const existingTables = [];

  for (const table of potentialTables) {
    const info = await inspectTable(table);
    if (info) {
      existingTables.push(info);
      console.log(`✅ ${info.name.padEnd(25)} - ${info.count} rows, ${info.columns.length} columns`);
      if (info.columns.length > 0) {
        console.log(`   Columns: ${info.columns.join(', ')}`);
      }
      console.log('');
    }
  }

  console.log(`\n📊 Found ${existingTables.length} tables\n`);

  // Show which tables are missing
  const missingTables = potentialTables.filter(
    t => !existingTables.find(et => et.name === t)
  );

  if (missingTables.length > 0) {
    console.log('❌ Missing tables:');
    missingTables.forEach(t => console.log(`   - ${t}`));
    console.log('');
  }
}

main();
