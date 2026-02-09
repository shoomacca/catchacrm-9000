/**
 * Check what columns actually exist in each table
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

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkColumns(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(0);

  if (error) {
    console.log(`❌ ${tableName}: ${error.message}`);
    return null;
  }

  // Get column names from the query
  const { data: schemaData, error: schemaError } = await supabase
    .rpc('get_table_columns', { table_name: tableName })
    .single();

  // Alternative: query information_schema
  return data;
}

async function main() {
  console.log('📋 Checking Actual Database Columns\n');

  const tables = ['leads', 'deals', 'tasks', 'tickets', 'products', 'services', 'calendar_events'];

  for (const table of tables) {
    try {
      // Insert empty row to see error
      const { data, error } = await supabase
        .from(table)
        .insert({})
        .select()
        .single();

      if (error) {
        console.log(`\n${table}:`);
        console.log(`  Error: ${error.message}`);

        // Try to extract column info from error
        if (error.message.includes('violates not-null constraint')) {
          const match = error.message.match(/column "([^"]+)"/);
          if (match) {
            console.log(`  Required column: ${match[1]}`);
          }
        }
      }
    } catch (e) {
      console.log(`${table}: ${e.message}`);
    }
  }

  // Better approach: Query information_schema directly
  console.log('\n\n📊 Querying information_schema for actual columns...\n');

  for (const table of tables) {
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', table)
      .order('ordinal_position');

    if (!error && columns) {
      console.log(`\n${table.toUpperCase()}:`);
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '' : ' (NOT NULL)';
        console.log(`  - ${col.column_name.padEnd(30)} ${col.data_type}${nullable}`);
      });
    }
  }
}

main();
