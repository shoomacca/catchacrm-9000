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

console.log('\n🔍 Getting Table Column Definitions...\n');

async function getTableColumns(tableName) {
  try {
    // Use Supabase REST API to get table schema
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'OPTIONS',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });

    const schema = await response.json();

    if (schema.definitions && schema.definitions[tableName]) {
      return Object.keys(schema.definitions[tableName].properties || {});
    }

    return null;
  } catch (err) {
    console.error(`Error for ${tableName}:`, err.message);
    return null;
  }
}

async function main() {
  const tables = ['accounts', 'contacts', 'leads', 'deals', 'tasks', 'campaigns', 'tickets'];

  for (const table of tables) {
    console.log(`\n📋 ${table}:`);
    const columns = await getTableColumns(table);
    if (columns) {
      console.log(`   ${columns.join(', ')}`);
    }
  }
}

main();
