import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('\n🗑️  Clearing all data from tables...\n');

async function clearTable(tableName) {
  const { error } = await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.log(`❌ ${tableName}: ${error.message}`);
  } else {
    console.log(`✅ ${tableName}: cleared`);
  }
}

async function main() {
  // Clear in reverse dependency order
  const tables = [
    'calendar_events',
    'tickets',
    'tasks',
    'deals',
    'leads',
    'contacts',
    'accounts',
    'campaigns',
    'products',
    'services',
    'quotes',
    'invoices',
    'jobs',
    'crews',
    'equipment',
    'zones',
    'inventory_items',
    'warehouses',
    'purchase_orders',
    'expenses',
    'bank_transactions',
    'reviews',
    'audit_log',
    'users'
  ];

  for (const table of tables) {
    await clearTable(table);
  }

  console.log('\n✅ All data cleared! Tables are ready for fresh data.\n');
}

main();
