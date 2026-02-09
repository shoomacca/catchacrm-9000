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

async function showData() {
  console.log('\n📋 Actual Database Contents\n');

  // Accounts
  const { data: accounts } = await supabase.from('accounts').select('name').limit(20);
  console.log('ACCOUNTS:');
  accounts?.forEach(acc => console.log(`  - ${acc.name}`));

  // Contacts
  const { data: contacts } = await supabase.from('contacts').select('name').limit(20);
  console.log('\nCONTACTS:');
  contacts?.forEach(c => console.log(`  - ${c.name}`));

  // Products
  const { data: products } = await supabase.from('products').select('name').limit(10);
  console.log('\nPRODUCTS:');
  products?.forEach(p => console.log(`  - ${p.name}`));
}

showData();
