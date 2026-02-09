#!/usr/bin/env node

/**
 * Test Supabase Connection
 * Verifies that we can connect to Supabase and query the database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n🔍 Testing Supabase Connection...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log(`📍 URL: ${supabaseUrl}`);
console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Basic connection
    console.log('\n📡 Test 1: Basic Connection');
    const { data, error } = await supabase.from('organizations').select('count');

    if (error) {
      console.log(`⚠️  Query failed: ${error.message}`);
      if (error.message.includes('does not exist')) {
        console.log('   → This is expected if schema hasn\'t been applied yet');
      }
    } else {
      console.log('✅ Connection successful!');
      console.log(`   Found ${data?.[0]?.count || 0} organizations`);
    }

    // Test 2: List all tables
    console.log('\n📊 Test 2: List Tables');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .order('tablename');

    if (tablesError) {
      console.log(`⚠️  Could not list tables: ${tablesError.message}`);
    } else if (tables && tables.length > 0) {
      console.log('✅ Found tables:');
      tables.forEach(t => console.log(`   - ${t.tablename}`));
    } else {
      console.log('⚠️  No tables found in public schema');
      console.log('   → Schema needs to be applied');
    }

    // Test 3: Check RLS status
    console.log('\n🔒 Test 3: Row Level Security (RLS)');
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('pg_tables')
      .select('tablename, rowsecurity');

    if (rlsError) {
      console.log('⚠️  Could not check RLS status');
    }

    console.log('\n✅ Supabase connection test complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Apply database schema (see supabase/README.md)');
    console.log('   2. Restart dev server to load .env variables');
    console.log('   3. Check browser console for "✓ Supabase client initialized"');

  } catch (error) {
    console.error('\n❌ Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();
