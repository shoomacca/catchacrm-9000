#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('\n📊 Checking Database Schema...\n');

async function checkSchema() {
  try {
    // Check which tables exist
    const tables = [
      'organizations',
      'organization_users',
      'contacts',
      'accounts',
      'opportunities',
      'products',
      'quotes',
      'activities',
      'audit_log',
      'subscription_tiers'
    ];

    console.log('🔍 Checking for tables:\n');

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table.padEnd(20)} - Not found`);
      } else {
        console.log(`✅ ${table.padEnd(20)} - Found (${count} rows)`);
      }
    }

    // Check organizations data
    console.log('\n📋 Organizations Table:\n');
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*');

    if (!orgsError && orgs) {
      console.log(`Found ${orgs.length} organization(s):`);
      orgs.forEach(org => {
        console.log(`  - ${org.name || org.id} (ID: ${org.id})`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema();
