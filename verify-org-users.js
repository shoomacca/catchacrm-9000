import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anawatvgypmrpbmjfcht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYXdhdHZneXBtcnBibWpmY2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwNDMwOSwiZXhwIjoyMDg0MjgwMzA5fQ.njigvMg4pdmKMtoWngrgNtw1c59JcM9K_aAaHv-ddwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrgUsersSchema() {
  console.log('=== organization_users Table Schema ===\n');

  // Get one row to see the column names
  const { data, error } = await supabase
    .from('organization_users')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]).join(', '));
    console.log('\nSample row:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('No data in organization_users table');
  }

  // Check if the column is org_id or organization_id
  console.log('\n=== Testing Policy Query Pattern ===');

  // Test pattern 1: org_id
  const { count: count1, error: error1 } = await supabase
    .from('organization_users')
    .select('org_id', { count: 'exact', head: true });

  console.log('Pattern 1 (org_id):', error1 ? `ERROR: ${error1.message}` : `✅ Works (count: ${count1})`);

  // Test pattern 2: organization_id
  const { count: count2, error: error2 } = await supabase
    .from('organization_users')
    .select('organization_id', { count: 'exact', head: true });

  console.log('Pattern 2 (organization_id):', error2 ? `ERROR: ${error2.message}` : `✅ Works (count: ${count2})`);
}

checkOrgUsersSchema().catch(console.error);
