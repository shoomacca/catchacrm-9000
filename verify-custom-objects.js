import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anawatvgypmrpbmjfcht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYXdhdHZneXBtcnBibWpmY2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwNDMwOSwiZXhwIjoyMDg0MjgwMzA5fQ.njigvMg4pdmKMtoWngrgNtw1c59JcM9K_aAaHv-ddwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure(tableName) {
  console.log(`\n=== ${tableName} Table ===`);

  // Try to insert a test row to see what columns are required
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error reading table:', error.message);
    return { exists: false, hasOrgId: false };
  }

  console.log('Table exists: YES');

  // If we have data, show columns
  if (data && data.length > 0) {
    const columns = Object.keys(data[0]);
    console.log('Columns:', columns.join(', '));
    console.log('Has org_id:', columns.includes('org_id') ? 'YES' : 'NO');
    return { exists: true, hasOrgId: columns.includes('org_id'), columns };
  } else {
    // No data, try to get schema via error
    console.log('No data in table, checking via insert attempt...');

    const testData = { org_id: '00000000-0000-0000-0000-000000000001' };
    const { error: insertError } = await supabase
      .from(tableName)
      .insert(testData)
      .select();

    if (insertError) {
      console.log('Insert error (expected):', insertError.message);

      // Check if error mentions org_id
      const hasOrgId = !insertError.message.includes('column "org_id" of relation') &&
                       !insertError.message.includes('org_id') ||
                       insertError.message.includes('null value in column "org_id"');

      console.log('Has org_id:', hasOrgId ? 'LIKELY YES' : 'NO');
      return { exists: true, hasOrgId, error: insertError.message };
    }
  }

  return { exists: true, hasOrgId: false };
}

async function main() {
  const tables = ['custom_objects', 'duplicate_rules', 'matching_rules'];

  for (const table of tables) {
    await checkTableStructure(table);
  }
}

main().catch(console.error);
