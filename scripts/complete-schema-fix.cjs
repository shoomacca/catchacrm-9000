const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.anawatvgypmrpbmjfcht:3uC0J5DUgiDDCMOe@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixAll() {
  await client.connect();
  console.log('=== COMPLETE SCHEMA FIX ===\n');

  const fixes = [
    // Remove duplicate columns with wrong naming
    'ALTER TABLE products DROP COLUMN IF EXISTS supplier_s_k_u',
    'ALTER TABLE campaigns DROP COLUMN IF EXISTS expected_c_p_l',

    // Warehouse - add isDefault
    'ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false',

    // Documents - ensure all fields
    'ALTER TABLE documents ADD COLUMN IF NOT EXISTS url TEXT',
    'ALTER TABLE documents ADD COLUMN IF NOT EXISTS title TEXT',

    // Add owner_id to tables that need it
    'ALTER TABLE leads ADD COLUMN IF NOT EXISTS owner_id UUID',
    'ALTER TABLE deals ADD COLUMN IF NOT EXISTS owner_id UUID',
    'ALTER TABLE contacts ADD COLUMN IF NOT EXISTS owner_id UUID',

    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id UUID,
      title TEXT NOT NULL,
      message TEXT,
      type TEXT DEFAULT 'info',
      read BOOLEAN DEFAULT false,
      link TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by TEXT
    )`,

    // Referral rewards table
    `CREATE TABLE IF NOT EXISTS referral_rewards (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      referrer_id UUID,
      referred_lead_id UUID,
      reward_amount DECIMAL(12,2),
      status TEXT DEFAULT 'Active',
      payout_date DATE,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by TEXT
    )`,

    // Inbound forms table
    `CREATE TABLE IF NOT EXISTS inbound_forms (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT,
      fields JSONB,
      submit_button_text TEXT,
      success_message TEXT,
      target_campaign_id UUID,
      submission_count INTEGER DEFAULT 0,
      conversion_rate DECIMAL(5,2),
      status TEXT DEFAULT 'Draft',
      embed_code TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by TEXT
    )`,

    // Chat widgets table
    `CREATE TABLE IF NOT EXISTS chat_widgets (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      page TEXT,
      bubble_color TEXT,
      welcome_message TEXT,
      is_active BOOLEAN DEFAULT true,
      status TEXT DEFAULT 'Active',
      routing_user_id UUID,
      conversations INTEGER DEFAULT 0,
      avg_response_time INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by TEXT
    )`,

    // Calculators table
    `CREATE TABLE IF NOT EXISTS calculators (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT,
      base_rate DECIMAL(12,2),
      is_active BOOLEAN DEFAULT true,
      status TEXT DEFAULT 'Active',
      usage_count INTEGER DEFAULT 0,
      lead_conversion_rate DECIMAL(5,2),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by TEXT
    )`,

    // Automation workflows table
    `CREATE TABLE IF NOT EXISTS automation_workflows (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      trigger JSONB,
      nodes JSONB,
      is_active BOOLEAN DEFAULT false,
      execution_count INTEGER DEFAULT 0,
      last_run_at TIMESTAMPTZ,
      category TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by TEXT
    )`,

    // Webhooks table (if not exists)
    `CREATE TABLE IF NOT EXISTS webhooks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      method TEXT DEFAULT 'POST',
      headers JSONB,
      is_active BOOLEAN DEFAULT true,
      trigger_event TEXT,
      last_triggered_at TIMESTAMPTZ,
      success_count INTEGER DEFAULT 0,
      failure_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by TEXT
    )`,

    // Industry templates table
    `CREATE TABLE IF NOT EXISTS industry_templates (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      target_entity TEXT,
      industry TEXT,
      sections JSONB,
      is_active BOOLEAN DEFAULT true,
      version INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by TEXT
    )`,

    // Conversations table (for team chat)
    `CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      participant_ids UUID[],
      name TEXT,
      is_system BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by TEXT
    )`,

    // Chat messages table
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      conversation_id UUID,
      sender_id UUID,
      content TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by TEXT
    )`,
  ];

  // RLS and policies
  const rlsFixes = [
    'ALTER TABLE notifications ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE inbound_forms ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE chat_widgets ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE calculators ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE industry_templates ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE conversations ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY',
  ];

  const policies = [
    'CREATE POLICY "allow_all_notifications" ON notifications FOR ALL USING (true)',
    'CREATE POLICY "allow_all_referral_rewards" ON referral_rewards FOR ALL USING (true)',
    'CREATE POLICY "allow_all_inbound_forms" ON inbound_forms FOR ALL USING (true)',
    'CREATE POLICY "allow_all_chat_widgets" ON chat_widgets FOR ALL USING (true)',
    'CREATE POLICY "allow_all_calculators" ON calculators FOR ALL USING (true)',
    'CREATE POLICY "allow_all_automation_workflows" ON automation_workflows FOR ALL USING (true)',
    'CREATE POLICY "allow_all_webhooks" ON webhooks FOR ALL USING (true)',
    'CREATE POLICY "allow_all_industry_templates" ON industry_templates FOR ALL USING (true)',
    'CREATE POLICY "allow_all_conversations" ON conversations FOR ALL USING (true)',
    'CREATE POLICY "allow_all_chat_messages" ON chat_messages FOR ALL USING (true)',
  ];

  let success = 0;
  let skipped = 0;

  // Run schema fixes
  for (const sql of fixes) {
    try {
      await client.query(sql);
      const match = sql.match(/(?:CREATE TABLE|ALTER TABLE|ADD COLUMN).*?(\w+)/i);
      console.log('OK: ' + (match ? match[1] : 'query'));
      success++;
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('does not exist')) {
        skipped++;
      } else {
        console.log('ERR: ' + err.message.substring(0, 80));
      }
    }
  }

  // Run RLS
  console.log('\nEnabling RLS...');
  for (const sql of rlsFixes) {
    try {
      await client.query(sql);
    } catch (err) {}
  }

  // Run policies
  console.log('Adding policies...');
  for (const sql of policies) {
    try {
      await client.query(sql);
    } catch (err) {}
  }

  console.log('\n=== COMPLETE ===');
  console.log('Success: ' + success);
  console.log('Skipped: ' + skipped);

  // Verify table count
  const { rows } = await client.query(
    "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
  );
  console.log('Total tables: ' + rows[0].count);

  await client.end();
}

fixAll().catch(console.error);
