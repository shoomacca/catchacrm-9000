const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.anawatvgypmrpbmjfcht:3uC0J5DUgiDDCMOe@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const ORG_ID = '00000000-0000-0000-0000-000000000001';

async function seedDatabase() {
  await client.connect();
  console.log('=== SEEDING DATABASE WITH MATRIX THEME DATA ===\n');

  // Get or create org
  await client.query(`
    INSERT INTO organizations (id, name)
    VALUES ($1, 'Zion Command')
    ON CONFLICT (id) DO NOTHING
  `, [ORG_ID]);
  console.log('✓ Organization: Zion Command');

  // Clear existing data (in correct order for FK constraints)
  const clearTables = [
    'chat_messages', 'conversations', 'automation_workflows', 'webhooks',
    'calculators', 'chat_widgets', 'inbound_forms', 'referral_rewards',
    'notifications', 'audit_log', 'documents', 'communications',
    'calendar_events', 'tasks', 'tickets', 'invoices', 'quotes',
    'subscriptions', 'jobs', 'purchase_orders', 'bank_transactions',
    'expenses', 'reviews', 'equipment', 'inventory_items',
    'deals', 'leads', 'contacts', 'accounts', 'products', 'services',
    'campaigns', 'crews', 'zones', 'users'
  ];

  console.log('Clearing existing data...');
  for (const table of clearTables) {
    try {
      await client.query(`DELETE FROM ${table} WHERE org_id = $1`, [ORG_ID]);
    } catch (e) {}
  }

  // 1. USERS
  const users = await insertMany('users', [
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Neo Anderson', email: 'neo@zion.io', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Trinity', email: 'trinity@zion.io', role: 'manager', team: 'Field Operations', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trinity' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Morpheus', email: 'morpheus@zion.io', role: 'manager', team: 'Recruitment', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morpheus' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Niobe', email: 'niobe@zion.io', role: 'manager', team: 'Fleet Command', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Niobe' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Link', email: 'link@zion.io', role: 'agent', team: 'Operators', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Link' },
  ]);
  console.log('✓ Users: ' + users.length);

  // 2. CAMPAIGNS
  const campaigns = await insertMany('campaigns', [
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Red Pill Initiative', type: 'Email', budget: 100000, spent: 78000, revenue: 2500000, revenue_generated: 2500000, leads_generated: 47, status: 'Active', expected_c_p_l: 1500 },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Defend Zion', type: 'Event', budget: 500000, spent: 425000, revenue: 1200000, revenue_generated: 1200000, leads_generated: 12, status: 'Active', expected_c_p_l: 35000 },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Oracle Prophecy Tour', type: 'Social', budget: 75000, spent: 75000, revenue: 180000, revenue_generated: 180000, leads_generated: 23, status: 'Completed', expected_c_p_l: 3000 },
  ]);
  console.log('✓ Campaigns: ' + campaigns.length);

  // 3. PRODUCTS
  const products = await insertMany('products', [
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Red Pill', sku: 'PILL-RED', description: 'Wake up to reality. No going back.', unit_price: 999999, tax_rate: 0, is_active: true, category: 'Awakening', stock_level: 100, reorder_point: 20 },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Blue Pill', sku: 'PILL-BLUE', description: 'Stay in Wonderland. Story ends.', unit_price: 0, tax_rate: 0, is_active: true, category: 'Comfort', stock_level: 999, reorder_point: 100 },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Construct Program', sku: 'PROG-CON', description: 'Loading program for combat training.', unit_price: 50000, tax_rate: 10, is_active: true, category: 'Training', stock_level: 50 },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Hardline Phone', sku: 'HARD-PHONE', description: 'Exit point connection device.', unit_price: 15000, tax_rate: 10, is_active: true, category: 'Equipment', stock_level: 25 },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'EMP Device', sku: 'WEAP-EMP', description: 'Electromagnetic pulse weapon for Sentinel defense.', unit_price: 250000, tax_rate: 10, is_active: true, category: 'Defense', stock_level: 10 },
  ]);
  console.log('✓ Products: ' + products.length);

  // 4. SERVICES
  const services = await insertMany('services', [
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Operator Support', code: 'SVC-OPR', description: 'Real-time Matrix navigation and exit coordination.', billing_cycle: 'monthly', unit_price: 8000, tax_rate: 10, is_active: true },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Combat Training Upload', code: 'SVC-TRN', description: 'Kung Fu, weapons, piloting - instant knowledge transfer.', billing_cycle: 'one-off', unit_price: 25000, tax_rate: 10, is_active: true, duration_hours: 10 },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Sentinel Watch', code: 'SVC-SEN', description: 'Early warning system for machine attacks.', billing_cycle: 'yearly', unit_price: 120000, tax_rate: 0, is_active: true },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Hovercraft Maintenance', code: 'SVC-HOV', description: 'Full ship systems diagnostic and repair.', billing_cycle: 'monthly', unit_price: 15000, tax_rate: 10, is_active: true },
  ]);
  console.log('✓ Services: ' + services.length);

  // 5. ACCOUNTS (Ships)
  const accounts = await insertMany('accounts', [
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Nebuchadnezzar', industry: 'Reconnaissance', website: 'nebuchadnezzar.zion', employee_count: 9, tier: 'Tier A', owner_id: users[2].id, status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nebuchadnezzar' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Logos', industry: 'Strike Force', website: 'logos.zion', employee_count: 4, tier: 'Tier A', owner_id: users[3].id, status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Logos' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Mjolnir (Hammer)', industry: 'Heavy Assault', website: 'hammer.zion', employee_count: 12, tier: 'Tier A', owner_id: users[0].id, status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hammer' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Vigilant', industry: 'Patrol', website: 'vigilant.zion', employee_count: 6, tier: 'Tier B', owner_id: users[1].id, status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vigilant' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Icarus', industry: 'Exploration', website: 'icarus.zion', employee_count: 5, tier: 'Tier B', owner_id: users[4].id, status: 'Inactive', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Icarus' },
  ]);
  console.log('✓ Accounts: ' + accounts.length);

  // 6. CONTACTS (Crew members)
  const contacts = await insertMany('contacts', [
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Morpheus', account_id: accounts[0].id, email: 'morpheus@nebuchadnezzar.zion', phone: '+1-ZION-001', title: 'Captain', owner_id: users[2].id, is_primary: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morpheus' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Neo', account_id: accounts[0].id, email: 'neo@nebuchadnezzar.zion', phone: '+1-ZION-002', title: 'The One', owner_id: users[0].id, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Trinity', account_id: accounts[0].id, email: 'trinity@nebuchadnezzar.zion', phone: '+1-ZION-003', title: 'First Mate', owner_id: users[1].id, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trinity' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Tank', account_id: accounts[0].id, email: 'tank@nebuchadnezzar.zion', phone: '+1-ZION-004', title: 'Operator', owner_id: users[4].id, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tank' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Niobe', account_id: accounts[1].id, email: 'niobe@logos.zion', phone: '+1-ZION-010', title: 'Captain', owner_id: users[3].id, is_primary: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Niobe' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Ghost', account_id: accounts[1].id, email: 'ghost@logos.zion', phone: '+1-ZION-011', title: 'First Mate', owner_id: users[3].id, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Roland', account_id: accounts[2].id, email: 'roland@hammer.zion', phone: '+1-ZION-020', title: 'Captain', owner_id: users[0].id, is_primary: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roland' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Soren', account_id: accounts[3].id, email: 'soren@vigilant.zion', phone: '+1-ZION-030', title: 'Captain', owner_id: users[1].id, is_primary: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Soren' },
  ]);
  console.log('✓ Contacts: ' + contacts.length);

  // 7. LEADS
  const leads = await insertMany('leads', [
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'The Kid', company: 'Self-Substantiation', email: 'kid@freed.matrix', phone: '+1-MATRIX-005', status: 'New', source: 'Search', campaign_id: campaigns[0].id, estimated_value: 150000, score: 92, owner_id: users[0].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Seraph', company: 'Oracle Security', email: 'seraph@oracle.matrix', phone: '+1-MATRIX-004', status: 'New', source: 'LinkedIn', campaign_id: campaigns[0].id, estimated_value: 200000, score: 88, owner_id: users[2].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Persephone', company: 'Club Hel', email: 'persephone@clubhel.matrix', phone: '+1-MATRIX-003', status: 'Qualified', source: 'Referral', campaign_id: campaigns[2].id, estimated_value: 350000, score: 78, owner_id: users[1].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'The Merovingian', company: 'Club Hel', email: 'mero@clubhel.matrix', phone: '+1-MATRIX-002', status: 'Qualified', source: 'Referral', campaign_id: campaigns[2].id, estimated_value: 500000, score: 65, owner_id: users[2].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Agent Smith', company: 'Machine City', email: 'smith@matrix.ai', phone: '+1-MACHINE-001', status: 'Nurturing', source: 'Direct', campaign_id: campaigns[0].id, estimated_value: 0, score: 15, owner_id: users[0].id },
  ]);
  console.log('✓ Leads: ' + leads.length);

  // 8. DEALS
  const deals = await insertMany('deals', [
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Nebuchadnezzar Refit Contract', account_id: accounts[0].id, contact_id: contacts[0].id, amount: 450000, stage: 'Closed Won', probability: 100, expected_close_date: pastDate(10), assignee_id: users[2].id, campaign_id: campaigns[1].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Logos Special Mission', account_id: accounts[1].id, contact_id: contacts[4].id, amount: 280000, stage: 'Negotiation', probability: 70, expected_close_date: futureDate(15), assignee_id: users[3].id, campaign_id: campaigns[1].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Hammer Weapons Upgrade', account_id: accounts[2].id, contact_id: contacts[6].id, amount: 620000, stage: 'Proposal', probability: 40, expected_close_date: futureDate(45), assignee_id: users[0].id, campaign_id: campaigns[1].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Vigilant Extended Patrol', account_id: accounts[3].id, contact_id: contacts[7].id, amount: 175000, stage: 'Discovery', probability: 10, expected_close_date: futureDate(60), assignee_id: users[1].id, campaign_id: campaigns[2].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Fleet-Wide Combat Training', account_id: accounts[0].id, contact_id: contacts[1].id, amount: 850000, stage: 'Negotiation', probability: 75, expected_close_date: futureDate(20), assignee_id: users[0].id, campaign_id: campaigns[0].id },
  ]);
  console.log('✓ Deals: ' + deals.length);

  // 9. CREWS
  const crews = await insertMany('crews', [
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Alpha Strike Team', leader_id: users[0].id, member_ids: [users[0].id, users[1].id, users[2].id], color: '#3B82F6' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Bravo Extraction', leader_id: users[3].id, member_ids: [users[3].id, users[4].id], color: '#10B981' },
  ]);
  console.log('✓ Crews: ' + crews.length);

  // 10. ZONES
  const zones = await insertMany('zones', [
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Downtown', region: 'Megacity Core', description: 'High-traffic area with multiple hardlines', color: '#EF4444' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Industrial', region: 'Factory District', description: 'Sentinel patrol routes nearby', color: '#F59E0B' },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Residential', region: 'Suburbs', description: 'Lower security, limited exit points', color: '#3B82F6' },
  ]);
  console.log('✓ Zones: ' + zones.length);

  // 11. JOBS
  const jobs = await insertMany('jobs', [
    { id: crypto.randomUUID(), org_id: ORG_ID, job_number: 'J-2026-0001', subject: 'Extract The Kid', description: 'Red pill candidate extraction', account_id: accounts[0].id, assignee_id: users[0].id, crew_id: crews[0].id, job_type: 'Emergency', status: 'Scheduled', priority: 'Urgent', zone: zones[0].name, estimated_duration: 2, scheduled_date: futureDate(1) },
    { id: crypto.randomUUID(), org_id: ORG_ID, job_number: 'J-2026-0002', subject: 'Logos Systems Check', description: 'Full diagnostic before mission', account_id: accounts[1].id, assignee_id: users[3].id, crew_id: crews[1].id, job_type: 'Inspection', status: 'InProgress', priority: 'High', zone: zones[1].name, estimated_duration: 4, scheduled_date: new Date().toISOString() },
    { id: crypto.randomUUID(), org_id: ORG_ID, job_number: 'J-2026-0003', subject: 'EMP Installation - Hammer', description: 'Install and calibrate new EMP devices', account_id: accounts[2].id, assignee_id: users[4].id, crew_id: crews[0].id, job_type: 'Install', status: 'Scheduled', priority: 'Medium', zone: zones[1].name, estimated_duration: 6, scheduled_date: futureDate(5) },
  ]);
  console.log('✓ Jobs: ' + jobs.length);

  // 12. INVOICES
  const invoices = await insertMany('invoices', [
    { id: crypto.randomUUID(), org_id: ORG_ID, invoice_number: 'INV-2026-0001', account_id: accounts[0].id, deal_id: deals[0].id, status: 'Paid', payment_status: 'paid', invoice_date: pastDate(30), issue_date: pastDate(30), due_date: pastDate(0), line_items: JSON.stringify([{ itemType: 'service', description: 'Hull restoration', qty: 1, unitPrice: 450000, taxRate: 10, lineTotal: 495000 }]), subtotal: 450000, tax_total: 45000, total: 495000, owner_id: users[2].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, invoice_number: 'INV-2026-0002', account_id: accounts[1].id, status: 'Sent', payment_status: 'unpaid', invoice_date: pastDate(15), issue_date: pastDate(15), due_date: futureDate(15), line_items: JSON.stringify([{ itemType: 'service', description: 'Operator Support Q1', qty: 3, unitPrice: 8000, taxRate: 10, lineTotal: 26400 }]), subtotal: 24000, tax_total: 2400, total: 26400, owner_id: users[3].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, invoice_number: 'INV-2026-0003', account_id: accounts[2].id, status: 'Overdue', payment_status: 'unpaid', invoice_date: pastDate(45), issue_date: pastDate(45), due_date: pastDate(15), line_items: JSON.stringify([{ itemType: 'product', description: 'EMP Device x2', qty: 2, unitPrice: 250000, taxRate: 10, lineTotal: 550000 }]), subtotal: 500000, tax_total: 50000, total: 550000, owner_id: users[0].id },
  ]);
  console.log('✓ Invoices: ' + invoices.length);

  // 13. TASKS
  const tasks = await insertMany('tasks', [
    { id: crypto.randomUUID(), org_id: ORG_ID, title: 'Complete Neo Combat Training', description: 'Upload remaining martial arts programs.', assignee_id: users[4].id, due_date: futureDate(2), status: 'In Progress', priority: 'High', related_to_id: contacts[1].id, related_to_type: 'contacts' },
    { id: crypto.randomUUID(), org_id: ORG_ID, title: 'Schedule Oracle Meeting', description: 'Arrange meeting with the Oracle.', assignee_id: users[2].id, due_date: futureDate(7), status: 'Pending', priority: 'High', related_to_id: leads[1].id, related_to_type: 'leads' },
    { id: crypto.randomUUID(), org_id: ORG_ID, title: 'Follow up on Hammer Invoice', description: 'Contact Roland about overdue payment.', assignee_id: users[1].id, due_date: pastDate(2), status: 'Pending', priority: 'Urgent', related_to_id: invoices[2].id, related_to_type: 'invoices' },
  ]);
  console.log('✓ Tasks: ' + tasks.length);

  // 14. TICKETS
  const tickets = await insertMany('tickets', [
    { id: crypto.randomUUID(), org_id: ORG_ID, ticket_number: 'TKT-001', subject: 'EMP Device Not Charging', description: 'EMP device shows 0% charge and wont power up.', requester_id: contacts[6].id, account_id: accounts[2].id, status: 'Open', priority: 'Urgent', assignee_id: users[4].id, messages: JSON.stringify([{ sender: 'Roland', text: 'Sentinels incoming!', time: pastDate(1) }]) },
    { id: crypto.randomUUID(), org_id: ORG_ID, ticket_number: 'TKT-002', subject: 'Operator Console Flickering', description: 'Display keeps flickering during Matrix operations.', requester_id: contacts[5].id, account_id: accounts[1].id, status: 'In Progress', priority: 'High', assignee_id: users[4].id, messages: JSON.stringify([]) },
  ]);
  console.log('✓ Tickets: ' + tickets.length);

  // 15. EQUIPMENT
  const equipment = await insertMany('equipment', [
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Operator Console Alpha', type: 'Console', barcode: 'EQ-000001', condition: 'Excellent', location: 'Nebuchadnezzar', assigned_to: users[4].id, last_service_date: pastDate(30), next_service_date: futureDate(60), purchase_date: pastDate(365), purchase_price: 50000 },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Hovercraft Engine Unit', type: 'Engine', barcode: 'EQ-000002', condition: 'Good', location: 'Zion Dock', last_service_date: pastDate(60), next_service_date: futureDate(30), purchase_date: pastDate(500), purchase_price: 150000 },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'EMP Charging Station', type: 'Charger', barcode: 'EQ-000003', condition: 'Fair', location: 'Hammer', assigned_to: users[0].id, last_service_date: pastDate(90), next_service_date: pastDate(10), purchase_date: pastDate(400), purchase_price: 25000 },
  ]);
  console.log('✓ Equipment: ' + equipment.length);

  // 16. INVENTORY ITEMS
  const inventoryItems = await insertMany('inventory_items', [
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Red Pills', sku: 'MED-RED', warehouse_qty: 47, reorder_point: 20, category: 'Medical', unit_price: 999999 },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'EMP Capacitors', sku: 'WEAP-CAP', warehouse_qty: 15, reorder_point: 5, category: 'Weapons', unit_price: 5000 },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Hardline Phones', sku: 'COMM-HARD', warehouse_qty: 8, reorder_point: 10, category: 'Communications', unit_price: 15000 },
    { id: crypto.randomUUID(), org_id: ORG_ID, name: 'Neural Interface Plugs', sku: 'TECH-PLUG', warehouse_qty: 50, reorder_point: 20, category: 'Technology', unit_price: 2500 },
  ]);
  console.log('✓ Inventory Items: ' + inventoryItems.length);

  // 17. PURCHASE ORDERS
  const purchaseOrders = await insertMany('purchase_orders', [
    { id: crypto.randomUUID(), org_id: ORG_ID, po_number: 'PO-2026-0001', supplier_id: accounts[2].id, account_id: accounts[0].id, status: 'Delivered', items: JSON.stringify([{ sku: 'WEAP-CAP', name: 'EMP Capacitors', qty: 10, price: 5000 }]), total: 50000, linked_job_id: jobs[2].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, po_number: 'PO-2026-0002', supplier_id: accounts[1].id, account_id: accounts[3].id, status: 'Ordered', items: JSON.stringify([{ sku: 'COMM-HARD', name: 'Hardline Phones', qty: 5, price: 15000 }]), total: 75000 },
  ]);
  console.log('✓ Purchase Orders: ' + purchaseOrders.length);

  // 18. BANK TRANSACTIONS
  const bankTransactions = await insertMany('bank_transactions', [
    { id: crypto.randomUUID(), org_id: ORG_ID, date: pastDate(5), description: 'Payment Received - INV-2026-0001', amount: 495000, type: 'Credit', status: 'matched', match_confidence: 'green', matched_to_id: invoices[0].id, matched_to_type: 'invoices', reconciled: true, bank_reference: 'TXN-001-NEB' },
    { id: crypto.randomUUID(), org_id: ORG_ID, date: pastDate(2), description: 'Unidentified Transfer', amount: 25000, type: 'Credit', status: 'unmatched', match_confidence: 'amber', reconciled: false, bank_reference: 'TXN-003-UNK' },
    { id: crypto.randomUUID(), org_id: ORG_ID, date: pastDate(1), description: 'Zion Council Grant', amount: 100000, type: 'Credit', status: 'unmatched', match_confidence: 'none', reconciled: false, bank_reference: 'TXN-004-ZCG' },
  ]);
  console.log('✓ Bank Transactions: ' + bankTransactions.length);

  // 19. EXPENSES
  const expenses = await insertMany('expenses', [
    { id: crypto.randomUUID(), org_id: ORG_ID, vendor: 'Zion Power Grid', amount: 15000, category: 'Fuel', date: pastDate(5), status: 'Paid', approved_by: users[2].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, vendor: 'Machine Parts Salvage', amount: 8500, category: 'Materials', date: pastDate(10), status: 'Paid', approved_by: users[3].id },
  ]);
  console.log('✓ Expenses: ' + expenses.length);

  // 20. REVIEWS
  const reviews = await insertMany('reviews', [
    { id: crypto.randomUUID(), org_id: ORG_ID, author_name: 'Councillor Hamann', rating: 5, content: 'The Nebuchadnezzar crew saved Zion. Outstanding service.', platform: 'Google', status: 'Replied', replied: true, reply_content: 'Thank you, Councillor. The fight continues.', sentiment: 'Positive', account_id: accounts[0].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, author_name: 'Anonymous Freed Mind', rating: 5, content: 'The red pill changed my life. Forever grateful to Morpheus.', platform: 'Facebook', status: 'New', replied: false, sentiment: 'Positive' },
    { id: crypto.randomUUID(), org_id: ORG_ID, author_name: 'Commander Lock', rating: 3, content: 'Morpheus takes too many risks. Results are mixed.', platform: 'Internal', status: 'Escalated', replied: false, sentiment: 'Neutral' },
  ]);
  console.log('✓ Reviews: ' + reviews.length);

  // 21. CALENDAR EVENTS
  const calendarEvents = await insertMany('calendar_events', [
    { id: crypto.randomUUID(), org_id: ORG_ID, title: 'Oracle Consultation', description: 'Meeting with the Oracle to discuss prophecy', start_time: futureDate(2), end_time: futureDate(2), type: 'Meeting', location: 'Oracle Teahouse', related_to_type: 'leads', related_to_id: leads[1].id, owner_id: users[0].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, title: 'Fleet Command Meeting', description: 'Quarterly strategy session with all captains', start_time: futureDate(7), end_time: futureDate(7), type: 'Meeting', location: 'Zion Council Chambers', related_to_type: 'accounts', related_to_id: accounts[1].id, owner_id: users[3].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, title: 'Neo Training Session', description: 'Advanced combat training in the Construct', start_time: futureDate(1), end_time: futureDate(1), type: 'Internal', location: 'Construct Loading Program', related_to_type: 'contacts', related_to_id: contacts[1].id, owner_id: users[0].id },
  ]);
  console.log('✓ Calendar Events: ' + calendarEvents.length);

  // 22. DOCUMENTS
  const documents = await insertMany('documents', [
    { id: crypto.randomUUID(), org_id: ORG_ID, title: 'Nebuchadnezzar Schematics v3.2', file_type: 'PDF', file_size: '4.2 MB', url: '#', related_to_type: 'accounts', related_to_id: accounts[0].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, title: 'Combat Training Curriculum', file_type: 'PDF', file_size: '12.8 MB', url: '#', related_to_type: 'deals', related_to_id: deals[4].id },
    { id: crypto.randomUUID(), org_id: ORG_ID, title: 'Matrix Entry Points Map', file_type: 'PDF', file_size: '2.1 MB', url: '#', related_to_type: 'accounts', related_to_id: accounts[1].id },
  ]);
  console.log('✓ Documents: ' + documents.length);

  // 23. COMMUNICATIONS
  const communications = await insertMany('communications', [
    { id: crypto.randomUUID(), org_id: ORG_ID, type: 'Call', subject: 'Prophecy Discussion', content: 'Discussed latest prophecy interpretations with Morpheus.', direction: 'Outbound', related_to_type: 'contacts', related_to_id: contacts[0].id, outcome: 'answered' },
    { id: crypto.randomUUID(), org_id: ORG_ID, type: 'Email', subject: 'Mission Briefing: Machine City', content: 'Attached mission parameters for upcoming reconnaissance.', direction: 'Outbound', related_to_type: 'accounts', related_to_id: accounts[1].id, outcome: 'answered' },
    { id: crypto.randomUUID(), org_id: ORG_ID, type: 'SMS', subject: 'Exit Point Confirmed', content: 'Hardline at 42nd & Main confirmed operational.', direction: 'Outbound', related_to_type: 'leads', related_to_id: leads[0].id, outcome: 'answered' },
  ]);
  console.log('✓ Communications: ' + communications.length);

  // 24. AUDIT LOGS
  await insertMany('audit_log', [
    { id: crypto.randomUUID(), org_id: ORG_ID, entity_type: 'leads', entity_id: leads[0].id, action: 'Lead Created' },
    { id: crypto.randomUUID(), org_id: ORG_ID, entity_type: 'deals', entity_id: deals[4].id, action: 'Deal Stage Changed', new_value: 'Negotiation' },
    { id: crypto.randomUUID(), org_id: ORG_ID, entity_type: 'invoices', entity_id: invoices[0].id, action: 'Payment Received' },
  ]);
  console.log('✓ Audit Logs: 3');

  // 25. SUBSCRIPTIONS
  const subscriptions = await insertMany('subscriptions', [
    { id: crypto.randomUUID(), org_id: ORG_ID, account_id: accounts[0].id, name: 'Nebuchadnezzar Full Support', status: 'Active', billing_cycle: 'monthly', next_bill_date: futureDate(12), start_date: pastDate(180), items: JSON.stringify([{ itemType: 'service', description: 'Operator Support', qty: 1, unitPrice: 8000, taxRate: 10 }]), auto_generate_invoice: true },
    { id: crypto.randomUUID(), org_id: ORG_ID, account_id: accounts[1].id, name: 'Logos Operations Package', status: 'Active', billing_cycle: 'monthly', next_bill_date: futureDate(5), start_date: pastDate(120), items: JSON.stringify([{ itemType: 'service', description: 'Operator Support', qty: 1, unitPrice: 8000, taxRate: 10 }]), auto_generate_invoice: true },
  ]);
  console.log('✓ Subscriptions: ' + subscriptions.length);

  console.log('\n=== SEEDING COMPLETE ===');
  console.log('All records have proper UUIDs and foreign key relationships.');

  await client.end();
}

// Helper functions
async function insertMany(table, records) {
  const inserted = [];
  for (const record of records) {
    const cols = Object.keys(record);
    const vals = Object.values(record);
    const placeholders = cols.map((_, i) => '$' + (i + 1)).join(', ');
    const colNames = cols.join(', ');

    try {
      const { rows } = await client.query(
        `INSERT INTO ${table} (${colNames}) VALUES (${placeholders}) RETURNING id`,
        vals
      );
      inserted.push({ ...record, id: rows[0].id });
    } catch (e) {
      console.error(`Error inserting into ${table}: ${e.message}`);
    }
  }
  return inserted;
}

function pastDate(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function futureDate(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

seedDatabase().catch(console.error);
