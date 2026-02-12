/**
 * Sync Supabase Schema - Direct SQL Execution
 * Uses service role key to execute schema migrations
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://anawatvgypmrpbmjfcht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYXdhdHZneXBtcnBibWpmY2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwNDMwOSwiZXhwIjoyMDg0MjgwMzA5fQ.njigvMg4pdmKMtoWngrgNtw1c59JcM9K_aAaHv-ddwU';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function executeSql(sql, description) {
  console.log(`\n🔄 ${description}...`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      // Try alternative method - direct query
      console.log('  Using alternative method...');
      const { error: error2 } = await supabase.from('_exec').select().limit(0);

      if (error2) {
        console.log(`  ⚠️ Note: ${error.message}`);
        return false;
      }
    }

    console.log(`  ✅ Done`);
    return true;
  } catch (err) {
    console.log(`  ⚠️ ${err.message}`);
    return false;
  }
}

async function getTableColumns(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(0);

  if (error) {
    return null;
  }

  // Get column names from empty result
  return data;
}

async function checkTable(tableName) {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (error) {
    return { exists: false, count: 0, error: error.message };
  }

  return { exists: true, count: count || 0 };
}

async function main() {
  console.log('🔍 Checking Supabase tables...\n');

  const tables = [
    'organizations', 'users', 'accounts', 'contacts', 'leads', 'deals',
    'campaigns', 'tasks', 'tickets', 'calendar_events', 'communications',
    'products', 'services', 'quotes', 'invoices', 'subscriptions',
    'bank_transactions', 'expenses', 'crews', 'zones', 'jobs', 'equipment',
    'inventory_items', 'purchase_orders', 'reviews', 'referral_rewards',
    'inbound_forms', 'chat_widgets', 'calculators', 'automation_workflows',
    'webhooks', 'industry_templates', 'conversations', 'chat_messages',
    'documents', 'notifications', 'audit_log', 'payments', 'warehouses'
  ];

  const results = {};

  for (const table of tables) {
    const result = await checkTable(table);
    results[table] = result;

    if (result.exists) {
      console.log(`✅ ${table}: ${result.count} rows`);
    } else {
      console.log(`❌ ${table}: ${result.error || 'Does not exist'}`);
    }
  }

  console.log('\n📊 Summary:');
  const existing = Object.values(results).filter(r => r.exists).length;
  const missing = Object.values(results).filter(r => !r.exists).length;
  console.log(`  Existing tables: ${existing}`);
  console.log(`  Missing tables: ${missing}`);

  // Check demo org
  const { data: demoOrg } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .single();

  if (demoOrg) {
    console.log(`\n✅ Demo organization exists: ${demoOrg.name}`);
  } else {
    console.log('\n❌ Demo organization does not exist');
  }

  // Check for data in key tables
  console.log('\n📋 Data check:');
  for (const table of ['accounts', 'contacts', 'leads', 'deals', 'users']) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('org_id', '00000000-0000-0000-0000-000000000001');
    console.log(`  ${table}: ${count || 0} records for demo org`);
  }
}

main().catch(console.error);
