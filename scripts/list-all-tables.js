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

console.log('\n📋 Listing ALL Tables in Database...\n');

async function listAllTables() {
  // Query pg_tables to get all tables in public schema
  const { data, error } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public')
    .order('tablename');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`Found ${data.length} tables:\n`);

  for (const table of data) {
    // Get row count for each table
    const { count } = await supabase
      .from(table.tablename)
      .select('*', { count: 'exact', head: true });

    console.log(`  - ${table.tablename.padEnd(40)} (${count || 0} rows)`);
  }

  console.log(`\n✅ Total: ${data.length} tables\n`);
}

listAllTables();
