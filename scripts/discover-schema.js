#!/usr/bin/env node

/**
 * Discover actual table schemas by querying the database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 Discovering Database Schema...\n');

async function discoverSchema() {
  try {
    // Use Supabase REST API OPTIONS request to get schema
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'OPTIONS',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const schema = await response.json();

    if (schema.definitions) {
      const tables = ['accounts', 'contacts', 'leads', 'deals', 'tasks', 'tickets', 'products', 'services', 'calendar_events'];

      tables.forEach(table => {
        const tableDef = schema.definitions[table];

        if (tableDef && tableDef.properties) {
          console.log(`\n📋 ${table.toUpperCase()}:`);
          console.log('   Columns:');

          Object.keys(tableDef.properties).forEach(col => {
            const prop = tableDef.properties[col];
            let type = prop.type || 'unknown';

            if (prop.enum) {
              type += ` (enum: ${prop.enum.join(', ')})`;
            }
            if (prop.format) {
              type += ` [${prop.format}]`;
            }

            const required = tableDef.required?.includes(col) ? ' *REQUIRED*' : '';
            console.log(`      - ${col.padEnd(30)} ${type}${required}`);
          });
        } else {
          console.log(`\n❌ ${table}: Not found in schema`);
        }
      });

      console.log('\n✅ Schema discovery complete!\n');
    } else {
      console.log('❌ Could not retrieve schema definitions');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

discoverSchema();
