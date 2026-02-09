const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.anawatvgypmrpbmjfcht:3uC0J5DUgiDDCMOe@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixRLS() {
  await client.connect();
  console.log('=== FIXING RLS POLICIES ===\n');

  // Get all tables with RLS enabled
  const { rows: rlsTables } = await client.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public' AND rowsecurity = true
    ORDER BY tablename
  `);

  // Get tables that already have policies
  const { rows: policiedTables } = await client.query(`
    SELECT DISTINCT tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  `);

  const tablesWithPolicies = new Set(policiedTables.map(t => t.tablename));

  // Find tables missing policies
  const missingPolicies = rlsTables.filter(t => !tablesWithPolicies.has(t.tablename));

  console.log('Tables with RLS enabled but NO policies: ' + missingPolicies.length);

  if (missingPolicies.length === 0) {
    console.log('All RLS-enabled tables have policies!');
    await client.end();
    return;
  }

  console.log('\nAdding allow_all policies to:');

  let fixed = 0;
  let errors = 0;

  for (const table of missingPolicies) {
    const tableName = table.tablename;
    const policyName = `allow_all_${tableName}`;

    try {
      // Drop existing policy if any (shouldn't exist but just in case)
      await client.query(`DROP POLICY IF EXISTS "${policyName}" ON "${tableName}"`);

      // Create new allow_all policy
      await client.query(`
        CREATE POLICY "${policyName}" ON "${tableName}"
        FOR ALL
        USING (true)
        WITH CHECK (true)
      `);

      console.log('  ✓ ' + tableName);
      fixed++;
    } catch (e) {
      console.log('  ✗ ' + tableName + ': ' + e.message.substring(0, 50));
      errors++;
    }
  }

  // Also fix tables that have RLS disabled but should have it enabled with allow_all
  console.log('\n\nEnabling RLS on remaining tables with allow_all policies:');

  const criticalTables = [
    'documents', 'subscriptions', 'subscription_items', 'payments',
    'credit_notes', 'emails', 'email_templates', 'email_threads',
    'email_accounts', 'sms_messages', 'sms_templates', 'ticket_messages',
    'kb_articles', 'kb_categories', 'line_items', 'crm_settings',
    'workflow_rules', 'workflow_actions', 'webhook_configs', 'webhook_logs',
    'email_sequences', 'email_sequence_steps', 'email_sequence_enrollments'
  ];

  for (const tableName of criticalTables) {
    try {
      // Check if table exists
      const { rows: exists } = await client.query(`
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      `, [tableName]);

      if (exists.length === 0) continue;

      // Enable RLS
      await client.query(`ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY`);

      // Drop existing policy if any
      const policyName = `allow_all_${tableName}`;
      await client.query(`DROP POLICY IF EXISTS "${policyName}" ON "${tableName}"`);

      // Create allow_all policy
      await client.query(`
        CREATE POLICY "${policyName}" ON "${tableName}"
        FOR ALL
        USING (true)
        WITH CHECK (true)
      `);

      console.log('  ✓ ' + tableName);
      fixed++;
    } catch (e) {
      if (!e.message.includes('already exists')) {
        console.log('  ✗ ' + tableName + ': ' + e.message.substring(0, 50));
        errors++;
      }
    }
  }

  console.log('\n=== COMPLETE ===');
  console.log('Fixed: ' + fixed);
  console.log('Errors: ' + errors);

  // Verify
  console.log('\n=== VERIFICATION ===');

  const { rows: finalCheck } = await client.query(`
    SELECT
      t.tablename,
      t.rowsecurity as rls_enabled,
      COUNT(p.policyname) as policy_count
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
    WHERE t.schemaname = 'public'
    GROUP BY t.tablename, t.rowsecurity
    HAVING t.rowsecurity = true AND COUNT(p.policyname) = 0
    ORDER BY t.tablename
  `);

  if (finalCheck.length === 0) {
    console.log('✓ All RLS-enabled tables now have policies!');
  } else {
    console.log('⚠ Tables still missing policies:');
    for (const t of finalCheck) {
      console.log('  - ' + t.tablename);
    }
  }

  await client.end();
}

fixRLS().catch(console.error);
