/**
 * Deploy SQL to Supabase
 * Uses the Supabase Management API to execute SQL directly
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://anawatvgypmrpbmjfcht.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYXdhdHZneXBtcnBibWpmY2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwNDMwOSwiZXhwIjoyMDg0MjgwMzA5fQ.njigvMg4pdmKMtoWngrgNtw1c59JcM9K_aAaHv-ddwU';

// Create admin client with service role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSql(sql, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${description}`);
  console.log('='.repeat(60));

  try {
    // Use the rpc call to execute raw SQL via a postgres function
    // First try using the pg_execute function if it exists
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, we'll need another approach
      console.log('RPC exec_sql not available, trying alternative...');
      throw error;
    }

    console.log('✅ SQL executed successfully');
    return { success: true, data };
  } catch (err) {
    console.log('❌ Error:', err.message);
    return { success: false, error: err };
  }
}

async function checkTableExists(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('id')
    .limit(1);

  return !error;
}

async function deployHandleNewUser() {
  console.log('\n' + '='.repeat(60));
  console.log('  DEPLOYING HANDLE_NEW_USER TRIGGER');
  console.log('='.repeat(60));

  // Check prerequisites
  console.log('\n📋 Checking prerequisites...');

  const orgExists = await checkTableExists('organizations');
  console.log(`  organizations table: ${orgExists ? '✅' : '❌'}`);

  const usersExists = await checkTableExists('users');
  console.log(`  users table: ${usersExists ? '✅' : '❌'}`);

  const accountsExists = await checkTableExists('accounts');
  console.log(`  accounts table: ${accountsExists ? '✅' : '❌'}`);

  const contactsExists = await checkTableExists('contacts');
  console.log(`  contacts table: ${contactsExists ? '✅' : '❌'}`);

  // Check if organization_users exists
  const orgUsersExists = await checkTableExists('organization_users');
  console.log(`  organization_users table: ${orgUsersExists ? '✅' : '❌ (will create)'}`);

  if (!orgExists || !usersExists || !accountsExists || !contactsExists) {
    console.log('\n❌ Missing required tables. Please run the schema setup first.');
    return false;
  }

  // Try to create organization_users table
  if (!orgUsersExists) {
    console.log('\n📦 Creating organization_users table...');

    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS organization_users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          user_id UUID NOT NULL,
          role TEXT NOT NULL DEFAULT 'member',
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(org_id, user_id)
        );
        CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON organization_users(user_id);
        CREATE INDEX IF NOT EXISTS idx_organization_users_org_id ON organization_users(org_id);
      `
    });

    if (createError) {
      console.log('  Note: organization_users creation may need manual SQL execution');
    }
  }

  console.log('\n✅ Prerequisites check complete');
  console.log('\n⚠️  IMPORTANT: The trigger function needs to be deployed via Supabase Dashboard SQL Editor');
  console.log('   File: supabase/handle_new_user.sql');
  console.log('\n   This is because:');
  console.log('   1. Triggers on auth.users require SECURITY DEFINER');
  console.log('   2. The service role key cannot create triggers via REST API');
  console.log('   3. Only the Supabase Dashboard or CLI with direct DB access can do this');

  return true;
}

async function testSignupFlow() {
  console.log('\n' + '='.repeat(60));
  console.log('  TESTING SIGNUP FLOW');
  console.log('='.repeat(60));

  // Check if we can query organization_users
  const { data: orgUsers, error: orgUsersError } = await supabase
    .from('organization_users')
    .select('*')
    .limit(5);

  if (orgUsersError) {
    console.log('\n❌ organization_users table not accessible:', orgUsersError.message);
    console.log('   Run this SQL in Supabase Dashboard to create it:');
    console.log(`
    CREATE TABLE IF NOT EXISTS organization_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id UUID NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(org_id, user_id)
    );
    `);
  } else {
    console.log(`\n✅ organization_users accessible (${orgUsers?.length || 0} records)`);
  }

  // Check organizations
  const { data: orgs, error: orgsError } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .limit(5);

  if (orgsError) {
    console.log('❌ organizations not accessible:', orgsError.message);
  } else {
    console.log(`✅ organizations accessible (${orgs?.length || 0} records)`);
    if (orgs && orgs.length > 0) {
      console.log('   Sample orgs:', orgs.map(o => o.name).join(', '));
    }
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('  SUPABASE SQL DEPLOYMENT TOOL');
  console.log('='.repeat(60));
  console.log(`  URL: ${supabaseUrl}`);
  console.log(`  Using: Service Role Key`);

  await deployHandleNewUser();
  await testSignupFlow();

  console.log('\n' + '='.repeat(60));
  console.log('  NEXT STEPS');
  console.log('='.repeat(60));
  console.log(`
  1. Go to Supabase Dashboard: ${supabaseUrl.replace('.co', '.co/project/anawatvgypmrpbmjfcht')}
  2. Navigate to: SQL Editor
  3. Paste and run: supabase/handle_new_user.sql
  4. Test signup in the app
  `);
}

main().catch(console.error);
