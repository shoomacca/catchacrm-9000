const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.anawatvgypmrpbmjfcht:3uC0J5DUgiDDCMOe@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();

  console.log('=== FOREIGN KEY RELATIONSHIPS ===\n');

  // Check a deal with its account and contact
  const { rows: deals } = await client.query(`
    SELECT d.id, d.name, d.account_id, d.contact_id, d.amount, d.stage,
           a.name as account_name,
           c.name as contact_name
    FROM deals d
    LEFT JOIN accounts a ON d.account_id = a.id
    LEFT JOIN contacts c ON d.contact_id = c.id
    LIMIT 3
  `);

  console.log('DEALS with Account/Contact:');
  for (const d of deals) {
    console.log('  ' + d.name);
    console.log('    Amount: $' + d.amount + ', Stage: ' + d.stage);
    console.log('    Account: ' + (d.account_name || 'NULL') + ' (' + (d.account_id || 'NULL') + ')');
    console.log('    Contact: ' + (d.contact_name || 'NULL') + ' (' + (d.contact_id || 'NULL') + ')');
  }

  // Check contacts with their accounts
  const { rows: contacts } = await client.query(`
    SELECT c.id, c.name, c.account_id, a.name as account_name
    FROM contacts c
    LEFT JOIN accounts a ON c.account_id = a.id
    LIMIT 3
  `);

  console.log('\nCONTACTS with Account:');
  for (const c of contacts) {
    console.log('  ' + c.name + ' -> ' + (c.account_name || 'NO ACCOUNT'));
  }

  // Check leads with campaign
  const { rows: leads } = await client.query(`
    SELECT l.id, l.name, l.campaign_id, camp.name as campaign_name
    FROM leads l
    LEFT JOIN campaigns camp ON l.campaign_id = camp.id
    LIMIT 3
  `);

  console.log('\nLEADS with Campaign:');
  for (const l of leads) {
    console.log('  ' + l.name + ' -> Campaign: ' + (l.campaign_name || 'NULL'));
  }

  await client.end();
}

check().catch(console.error);
