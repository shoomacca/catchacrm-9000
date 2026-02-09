const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.anawatvgypmrpbmjfcht:3uC0J5DUgiDDCMOe@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const ORG_ID = '00000000-0000-0000-0000-000000000001';

async function insertRemaining() {
  await client.connect();

  // Get existing IDs
  const { rows: users } = await client.query('SELECT id FROM users WHERE org_id = $1', [ORG_ID]);
  const { rows: accounts } = await client.query('SELECT id FROM accounts WHERE org_id = $1', [ORG_ID]);
  const { rows: leads } = await client.query('SELECT id FROM leads WHERE org_id = $1', [ORG_ID]);
  const { rows: deals } = await client.query('SELECT id FROM deals WHERE org_id = $1', [ORG_ID]);

  console.log('Found users:', users.length);
  console.log('Found accounts:', accounts.length);
  console.log('Found leads:', leads.length);
  console.log('Found deals:', deals.length);

  if (users.length === 0 || accounts.length === 0) {
    console.log('No base data found. Please run seed-database.cjs first.');
    await client.end();
    return;
  }

  // Insert calendar_events
  try {
    await client.query(`
      INSERT INTO calendar_events (id, org_id, title, description, start_time, end_time, type, location, related_to_type, related_to_id, owner_id)
      VALUES ($1, $2, 'Oracle Consultation', 'Meeting with the Oracle', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days', 'Meeting', 'Oracle Teahouse', 'leads', $3, $4)
    `, [crypto.randomUUID(), ORG_ID, leads[0].id, users[0].id]);

    await client.query(`
      INSERT INTO calendar_events (id, org_id, title, description, start_time, end_time, type, location, related_to_type, related_to_id, owner_id)
      VALUES ($1, $2, 'Fleet Command Meeting', 'Quarterly strategy session', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days', 'Meeting', 'Zion Council', 'accounts', $3, $4)
    `, [crypto.randomUUID(), ORG_ID, accounts[1].id, users[3].id]);

    await client.query(`
      INSERT INTO calendar_events (id, org_id, title, description, start_time, end_time, type, location, related_to_type, related_to_id, owner_id)
      VALUES ($1, $2, 'Neo Training Session', 'Combat training in the Construct', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day', 'Internal', 'Construct', 'contacts', $3, $4)
    `, [crypto.randomUUID(), ORG_ID, accounts[0].id, users[0].id]);

    console.log('✓ Inserted calendar_events: 3');
  } catch (e) {
    console.log('Calendar events error:', e.message);
  }

  // Insert documents
  try {
    await client.query(`
      INSERT INTO documents (id, org_id, title, file_type, file_size, url, related_to_type, related_to_id)
      VALUES ($1, $2, 'Nebuchadnezzar Schematics v3.2', 'PDF', '4.2 MB', '#', 'accounts', $3)
    `, [crypto.randomUUID(), ORG_ID, accounts[0].id]);

    await client.query(`
      INSERT INTO documents (id, org_id, title, file_type, file_size, url, related_to_type, related_to_id)
      VALUES ($1, $2, 'Combat Training Curriculum', 'PDF', '12.8 MB', '#', 'deals', $3)
    `, [crypto.randomUUID(), ORG_ID, deals[4].id]);

    await client.query(`
      INSERT INTO documents (id, org_id, title, file_type, file_size, url, related_to_type, related_to_id)
      VALUES ($1, $2, 'Matrix Entry Points Map', 'PDF', '2.1 MB', '#', 'accounts', $3)
    `, [crypto.randomUUID(), ORG_ID, accounts[1].id]);

    console.log('✓ Inserted documents: 3');
  } catch (e) {
    console.log('Documents error:', e.message);
  }

  // Insert subscriptions with correct enum value (lowercase 'active')
  try {
    await client.query(`
      INSERT INTO subscriptions (id, org_id, account_id, name, status, billing_cycle, next_bill_date, start_date, items, auto_generate_invoice)
      VALUES ($1, $2, $3, 'Nebuchadnezzar Full Support', 'active', 'monthly', NOW() + INTERVAL '12 days', NOW() - INTERVAL '180 days', '[{"itemType":"service","description":"Support","qty":1,"unitPrice":8000}]', true)
    `, [crypto.randomUUID(), ORG_ID, accounts[0].id]);

    await client.query(`
      INSERT INTO subscriptions (id, org_id, account_id, name, status, billing_cycle, next_bill_date, start_date, items, auto_generate_invoice)
      VALUES ($1, $2, $3, 'Logos Operations Package', 'active', 'monthly', NOW() + INTERVAL '5 days', NOW() - INTERVAL '120 days', '[{"itemType":"service","description":"Support","qty":1,"unitPrice":8000}]', true)
    `, [crypto.randomUUID(), ORG_ID, accounts[1].id]);

    console.log('✓ Inserted subscriptions: 2');
  } catch (e) {
    console.log('Subscriptions error:', e.message);
  }

  await client.end();
  console.log('\nDone!');
}

insertRemaining().catch(console.error);
