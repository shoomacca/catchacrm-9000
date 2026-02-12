/**
 * Seed Demo Data to Supabase
 * Inserts Matrix-themed demo data directly
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anawatvgypmrpbmjfcht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYXdhdHZneXBtcnBibWpmY2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwNDMwOSwiZXhwIjoyMDg0MjgwMzA5fQ.njigvMg4pdmKMtoWngrgNtw1c59JcM9K_aAaHv-ddwU';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Generate UUIDs
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function seedData() {
  console.log('🌱 Seeding demo data to Supabase...\n');

  // User IDs
  const user_neo = uuid();
  const user_trinity = uuid();
  const user_morpheus = uuid();
  const user_niobe = uuid();
  const user_link = uuid();

  // Account IDs
  const account_neb = uuid();
  const account_logos = uuid();
  const account_hammer = uuid();
  const account_vigilant = uuid();
  const account_icarus = uuid();

  // Contact IDs
  const contact_morpheus = uuid();
  const contact_neo = uuid();
  const contact_trinity = uuid();
  const contact_tank = uuid();
  const contact_niobe = uuid();
  const contact_ghost = uuid();
  const contact_roland = uuid();
  const contact_soren = uuid();

  // Lead IDs
  const lead_kid = uuid();
  const lead_seraph = uuid();
  const lead_persephone = uuid();
  const lead_mero = uuid();
  const lead_smith = uuid();

  // Campaign IDs
  const campaign_redpill = uuid();
  const campaign_defend = uuid();
  const campaign_oracle = uuid();

  // Product/Service IDs
  const product_redpill = uuid();
  const product_bluepill = uuid();
  const product_construct = uuid();
  const product_hardline = uuid();
  const product_emp = uuid();
  const service_operator = uuid();
  const service_combat = uuid();
  const service_sentinel = uuid();
  const service_hovercraft = uuid();

  // Deal IDs
  const deal_refit = uuid();
  const deal_logos = uuid();
  const deal_hammer = uuid();
  const deal_vigilant = uuid();
  const deal_combat = uuid();

  // Other IDs
  const crew_alpha = uuid();
  const crew_bravo = uuid();
  const zone_downtown = uuid();
  const zone_industrial = uuid();
  const zone_residential = uuid();
  const job1 = uuid();
  const job2 = uuid();
  const job3 = uuid();
  const invoice1 = uuid();
  const invoice2 = uuid();
  const invoice3 = uuid();

  // === USERS ===
  console.log('👤 Inserting users...');
  const { error: usersError } = await supabase.from('users').upsert([
    { id: user_neo, org_id: DEMO_ORG_ID, name: 'Neo Anderson', email: 'neo@demo.catchacrm.com', role: 'admin', team: 'Field Operations', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo' },
    { id: user_trinity, org_id: DEMO_ORG_ID, name: 'Trinity', email: 'trinity@demo.catchacrm.com', role: 'manager', team: 'Field Operations', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trinity' },
    { id: user_morpheus, org_id: DEMO_ORG_ID, name: 'Morpheus', email: 'morpheus@demo.catchacrm.com', role: 'manager', team: 'Recruitment', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morpheus' },
    { id: user_niobe, org_id: DEMO_ORG_ID, name: 'Niobe', email: 'niobe@demo.catchacrm.com', role: 'manager', team: 'Fleet Command', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Niobe' },
    { id: user_link, org_id: DEMO_ORG_ID, name: 'Link', email: 'link@demo.catchacrm.com', role: 'agent', team: 'Operators', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Link' },
  ], { onConflict: 'id' });
  if (usersError) console.log('  ⚠️ Users:', usersError.message);
  else console.log('  ✅ 5 users inserted');

  // === CAMPAIGNS ===
  console.log('📢 Inserting campaigns...');
  const { error: campaignsError } = await supabase.from('campaigns').upsert([
    { id: campaign_redpill, org_id: DEMO_ORG_ID, name: 'Red Pill Initiative', type: 'Email', budget: 100000, spent: 78000, revenue: 2500000, revenue_generated: 2500000, leads_generated: 47, status: 'Active', expected_cpl: 1500 },
    { id: campaign_defend, org_id: DEMO_ORG_ID, name: 'Defend Zion', type: 'Event', budget: 500000, spent: 425000, revenue: 1200000, revenue_generated: 1200000, leads_generated: 12, status: 'Active', expected_cpl: 35000 },
    { id: campaign_oracle, org_id: DEMO_ORG_ID, name: 'Oracle Prophecy Tour', type: 'Social', budget: 75000, spent: 75000, revenue: 180000, revenue_generated: 180000, leads_generated: 23, status: 'Completed', expected_cpl: 3000 },
  ], { onConflict: 'id' });
  if (campaignsError) console.log('  ⚠️ Campaigns:', campaignsError.message);
  else console.log('  ✅ 3 campaigns inserted');

  // === PRODUCTS ===
  console.log('📦 Inserting products...');
  const { error: productsError } = await supabase.from('products').upsert([
    { id: product_redpill, org_id: DEMO_ORG_ID, name: 'Red Pill', sku: 'PILL-RED', description: 'Wake up to reality. No going back.', unit_price: 999999, tax_rate: 0, is_active: true, category: 'Awakening', stock_level: 100, reorder_point: 20 },
    { id: product_bluepill, org_id: DEMO_ORG_ID, name: 'Blue Pill', sku: 'PILL-BLUE', description: 'Stay in Wonderland. Story ends.', unit_price: 0, tax_rate: 0, is_active: true, category: 'Comfort', stock_level: 999, reorder_point: 100 },
    { id: product_construct, org_id: DEMO_ORG_ID, name: 'Construct Program', sku: 'PROG-CON', description: 'Loading program for combat training.', unit_price: 50000, tax_rate: 10, is_active: true, category: 'Training', stock_level: 50, reorder_point: 10 },
    { id: product_hardline, org_id: DEMO_ORG_ID, name: 'Hardline Phone', sku: 'HARD-PHONE', description: 'Exit point connection device.', unit_price: 15000, tax_rate: 10, is_active: true, category: 'Equipment', stock_level: 25, reorder_point: 5 },
    { id: product_emp, org_id: DEMO_ORG_ID, name: 'EMP Device', sku: 'WEAP-EMP', description: 'Electromagnetic pulse weapon for Sentinel defense.', unit_price: 250000, tax_rate: 10, is_active: true, category: 'Defense', stock_level: 10, reorder_point: 2 },
  ], { onConflict: 'id' });
  if (productsError) console.log('  ⚠️ Products:', productsError.message);
  else console.log('  ✅ 5 products inserted');

  // === SERVICES ===
  console.log('🔧 Inserting services...');
  const { error: servicesError } = await supabase.from('services').upsert([
    { id: service_operator, org_id: DEMO_ORG_ID, name: 'Operator Support', code: 'SVC-OPR', description: 'Real-time Matrix navigation and exit coordination.', billing_cycle: 'monthly', unit_price: 8000, tax_rate: 10, is_active: true },
    { id: service_combat, org_id: DEMO_ORG_ID, name: 'Combat Training Upload', code: 'SVC-TRN', description: 'Kung Fu, weapons, piloting - instant knowledge transfer.', billing_cycle: 'one-off', unit_price: 25000, tax_rate: 10, is_active: true, duration_hours: 10 },
    { id: service_sentinel, org_id: DEMO_ORG_ID, name: 'Sentinel Watch', code: 'SVC-SEN', description: 'Early warning system for machine attacks.', billing_cycle: 'yearly', unit_price: 120000, tax_rate: 0, is_active: true },
    { id: service_hovercraft, org_id: DEMO_ORG_ID, name: 'Hovercraft Maintenance', code: 'SVC-HOV', description: 'Full ship systems diagnostic and repair.', billing_cycle: 'monthly', unit_price: 15000, tax_rate: 10, is_active: true },
  ], { onConflict: 'id' });
  if (servicesError) console.log('  ⚠️ Services:', servicesError.message);
  else console.log('  ✅ 4 services inserted');

  // === ACCOUNTS ===
  console.log('🏢 Inserting accounts...');
  const { error: accountsError } = await supabase.from('accounts').upsert([
    { id: account_neb, org_id: DEMO_ORG_ID, name: 'Nebuchadnezzar', industry: 'Reconnaissance', website: 'nebuchadnezzar.zion', employee_count: 9, tier: 'Tier A', owner_id: user_morpheus, status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nebuchadnezzar' },
    { id: account_logos, org_id: DEMO_ORG_ID, name: 'Logos', industry: 'Strike Force', website: 'logos.zion', employee_count: 4, tier: 'Tier A', owner_id: user_niobe, status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Logos' },
    { id: account_hammer, org_id: DEMO_ORG_ID, name: 'Mjolnir (Hammer)', industry: 'Heavy Assault', website: 'hammer.zion', employee_count: 12, tier: 'Tier A', owner_id: user_neo, status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hammer' },
    { id: account_vigilant, org_id: DEMO_ORG_ID, name: 'Vigilant', industry: 'Patrol', website: 'vigilant.zion', employee_count: 6, tier: 'Tier B', owner_id: user_trinity, status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vigilant' },
    { id: account_icarus, org_id: DEMO_ORG_ID, name: 'Icarus', industry: 'Exploration', website: 'icarus.zion', employee_count: 5, tier: 'Tier B', owner_id: user_link, status: 'Inactive', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Icarus' },
  ], { onConflict: 'id' });
  if (accountsError) console.log('  ⚠️ Accounts:', accountsError.message);
  else console.log('  ✅ 5 accounts inserted');

  // === CONTACTS ===
  console.log('👥 Inserting contacts...');
  const { error: contactsError } = await supabase.from('contacts').upsert([
    { id: contact_morpheus, org_id: DEMO_ORG_ID, name: 'Morpheus', account_id: account_neb, email: 'morpheus@nebuchadnezzar.zion', phone: '+1-ZION-001', title: 'Captain', is_primary: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morpheus' },
    { id: contact_neo, org_id: DEMO_ORG_ID, name: 'Neo', account_id: account_neb, email: 'neo@nebuchadnezzar.zion', phone: '+1-ZION-002', title: 'The One', is_primary: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo' },
    { id: contact_trinity, org_id: DEMO_ORG_ID, name: 'Trinity', account_id: account_neb, email: 'trinity@nebuchadnezzar.zion', phone: '+1-ZION-003', title: 'First Mate', is_primary: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trinity' },
    { id: contact_tank, org_id: DEMO_ORG_ID, name: 'Tank', account_id: account_neb, email: 'tank@nebuchadnezzar.zion', phone: '+1-ZION-004', title: 'Operator', is_primary: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tank' },
    { id: contact_niobe, org_id: DEMO_ORG_ID, name: 'Niobe', account_id: account_logos, email: 'niobe@logos.zion', phone: '+1-ZION-010', title: 'Captain', is_primary: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Niobe' },
    { id: contact_ghost, org_id: DEMO_ORG_ID, name: 'Ghost', account_id: account_logos, email: 'ghost@logos.zion', phone: '+1-ZION-011', title: 'First Mate', is_primary: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost' },
    { id: contact_roland, org_id: DEMO_ORG_ID, name: 'Roland', account_id: account_hammer, email: 'roland@hammer.zion', phone: '+1-ZION-020', title: 'Captain', is_primary: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roland' },
    { id: contact_soren, org_id: DEMO_ORG_ID, name: 'Soren', account_id: account_vigilant, email: 'soren@vigilant.zion', phone: '+1-ZION-030', title: 'Captain', is_primary: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Soren' },
  ], { onConflict: 'id' });
  if (contactsError) console.log('  ⚠️ Contacts:', contactsError.message);
  else console.log('  ✅ 8 contacts inserted');

  // === LEADS ===
  console.log('🎯 Inserting leads...');
  const { error: leadsError } = await supabase.from('leads').upsert([
    { id: lead_kid, org_id: DEMO_ORG_ID, name: 'The Kid', company: 'Self-Substantiation', email: 'kid@freed.matrix', phone: '+1-MATRIX-005', status: 'new', source: 'Search', campaign_id: campaign_redpill, estimated_value: 150000, score: 92, assigned_to: user_neo },
    { id: lead_seraph, org_id: DEMO_ORG_ID, name: 'Seraph', company: 'Oracle Security', email: 'seraph@oracle.matrix', phone: '+1-MATRIX-004', status: 'new', source: 'LinkedIn', campaign_id: campaign_redpill, estimated_value: 200000, score: 88, assigned_to: user_morpheus },
    { id: lead_persephone, org_id: DEMO_ORG_ID, name: 'Persephone', company: 'Club Hel', email: 'persephone@clubhel.matrix', phone: '+1-MATRIX-003', status: 'qualified', source: 'Referral', campaign_id: campaign_oracle, estimated_value: 350000, score: 78, assigned_to: user_trinity },
    { id: lead_mero, org_id: DEMO_ORG_ID, name: 'The Merovingian', company: 'Club Hel', email: 'mero@clubhel.matrix', phone: '+1-MATRIX-002', status: 'qualified', source: 'Referral', campaign_id: campaign_oracle, estimated_value: 500000, score: 65, assigned_to: user_morpheus },
    { id: lead_smith, org_id: DEMO_ORG_ID, name: 'Agent Smith', company: 'Machine City', email: 'smith@matrix.ai', phone: '+1-MACHINE-001', status: 'nurturing', source: 'Direct', campaign_id: campaign_redpill, estimated_value: 0, score: 15, assigned_to: user_neo },
  ], { onConflict: 'id' });
  if (leadsError) console.log('  ⚠️ Leads:', leadsError.message);
  else console.log('  ✅ 5 leads inserted');

  // === DEALS ===
  console.log('💰 Inserting deals...');
  const today = new Date().toISOString().split('T')[0];
  const { error: dealsError } = await supabase.from('deals').upsert([
    { id: deal_refit, org_id: DEMO_ORG_ID, name: 'Nebuchadnezzar Refit Contract', account_id: account_neb, contact_id: contact_morpheus, amount: 450000, stage: 'won', probability: 100, expected_close_date: today, assigned_to: user_morpheus, campaign_id: campaign_defend },
    { id: deal_logos, org_id: DEMO_ORG_ID, name: 'Logos Special Mission', account_id: account_logos, contact_id: contact_niobe, amount: 280000, stage: 'negotiation', probability: 70, expected_close_date: today, assigned_to: user_niobe, campaign_id: campaign_defend },
    { id: deal_hammer, org_id: DEMO_ORG_ID, name: 'Hammer Weapons Upgrade', account_id: account_hammer, contact_id: contact_roland, amount: 620000, stage: 'proposal', probability: 40, expected_close_date: today, assigned_to: user_neo, campaign_id: campaign_defend },
    { id: deal_vigilant, org_id: DEMO_ORG_ID, name: 'Vigilant Extended Patrol', account_id: account_vigilant, contact_id: contact_soren, amount: 175000, stage: 'discovery', probability: 10, expected_close_date: today, assigned_to: user_trinity, campaign_id: campaign_oracle },
    { id: deal_combat, org_id: DEMO_ORG_ID, name: 'Fleet-Wide Combat Training', account_id: account_neb, contact_id: contact_neo, amount: 850000, stage: 'negotiation', probability: 75, expected_close_date: today, assigned_to: user_neo, campaign_id: campaign_redpill },
  ], { onConflict: 'id' });
  if (dealsError) console.log('  ⚠️ Deals:', dealsError.message);
  else console.log('  ✅ 5 deals inserted');

  // === CREWS ===
  console.log('👷 Inserting crews...');
  const { error: crewsError } = await supabase.from('crews').upsert([
    { id: crew_alpha, org_id: DEMO_ORG_ID, name: 'Alpha Strike Team', leader_id: user_neo, member_ids: [user_neo, user_trinity, user_morpheus], color: '#3B82F6' },
    { id: crew_bravo, org_id: DEMO_ORG_ID, name: 'Bravo Extraction', leader_id: user_niobe, member_ids: [user_niobe, user_link], color: '#10B981' },
  ], { onConflict: 'id' });
  if (crewsError) console.log('  ⚠️ Crews:', crewsError.message);
  else console.log('  ✅ 2 crews inserted');

  // === ZONES ===
  console.log('🗺️ Inserting zones...');
  const { error: zonesError } = await supabase.from('zones').upsert([
    { id: zone_downtown, org_id: DEMO_ORG_ID, name: 'Downtown', region: 'Megacity Core', description: 'High-traffic area with multiple hardlines', color: '#EF4444' },
    { id: zone_industrial, org_id: DEMO_ORG_ID, name: 'Industrial', region: 'Factory District', description: 'Sentinel patrol routes nearby', color: '#F59E0B' },
    { id: zone_residential, org_id: DEMO_ORG_ID, name: 'Residential', region: 'Suburbs', description: 'Lower security, limited exit points', color: '#3B82F6' },
  ], { onConflict: 'id' });
  if (zonesError) console.log('  ⚠️ Zones:', zonesError.message);
  else console.log('  ✅ 3 zones inserted');

  // === JOBS ===
  console.log('📋 Inserting jobs...');
  const { error: jobsError } = await supabase.from('jobs').upsert([
    { id: job1, org_id: DEMO_ORG_ID, job_number: 'J-2026-0001', subject: 'Extract The Kid', description: 'Red pill candidate extraction', account_id: account_neb, assignee_id: user_neo, crew_id: crew_alpha, job_type: 'Emergency', status: 'Scheduled', priority: 'Urgent', zone: 'Downtown', estimated_duration: 2, scheduled_date: today },
    { id: job2, org_id: DEMO_ORG_ID, job_number: 'J-2026-0002', subject: 'Logos Systems Check', description: 'Full diagnostic before mission', account_id: account_logos, assignee_id: user_niobe, crew_id: crew_bravo, job_type: 'Inspection', status: 'InProgress', priority: 'High', zone: 'Industrial', estimated_duration: 4, scheduled_date: today },
    { id: job3, org_id: DEMO_ORG_ID, job_number: 'J-2026-0003', subject: 'EMP Installation - Hammer', description: 'Install and calibrate new EMP devices', account_id: account_hammer, assignee_id: user_link, crew_id: crew_alpha, job_type: 'Install', status: 'Scheduled', priority: 'Medium', zone: 'Industrial', estimated_duration: 6, scheduled_date: today },
  ], { onConflict: 'id' });
  if (jobsError) console.log('  ⚠️ Jobs:', jobsError.message);
  else console.log('  ✅ 3 jobs inserted');

  // === INVOICES ===
  console.log('📄 Inserting invoices...');
  const { error: invoicesError } = await supabase.from('invoices').upsert([
    { id: invoice1, org_id: DEMO_ORG_ID, invoice_number: 'INV-2026-0001', account_id: account_neb, deal_id: deal_refit, status: 'Paid', payment_status: 'paid', invoice_date: today, issue_date: today, due_date: today, line_items: [{ description: 'Hull restoration', qty: 1, unitPrice: 450000, taxRate: 10, lineTotal: 495000 }], subtotal: 450000, tax_total: 45000, total: 495000 },
    { id: invoice2, org_id: DEMO_ORG_ID, invoice_number: 'INV-2026-0002', account_id: account_logos, status: 'Sent', payment_status: 'unpaid', invoice_date: today, issue_date: today, due_date: today, line_items: [{ description: 'Operator Support Q1', qty: 3, unitPrice: 8000, taxRate: 10, lineTotal: 26400 }], subtotal: 24000, tax_total: 2400, total: 26400 },
    { id: invoice3, org_id: DEMO_ORG_ID, invoice_number: 'INV-2026-0003', account_id: account_hammer, status: 'Overdue', payment_status: 'unpaid', invoice_date: today, issue_date: today, due_date: today, line_items: [{ description: 'EMP Device x2', qty: 2, unitPrice: 250000, taxRate: 10, lineTotal: 550000 }], subtotal: 500000, tax_total: 50000, total: 550000 },
  ], { onConflict: 'id' });
  if (invoicesError) console.log('  ⚠️ Invoices:', invoicesError.message);
  else console.log('  ✅ 3 invoices inserted');

  // === TASKS ===
  console.log('✅ Inserting tasks...');
  const { error: tasksError } = await supabase.from('tasks').upsert([
    { id: uuid(), org_id: DEMO_ORG_ID, title: 'Complete Neo Combat Training', description: 'Upload remaining martial arts programs.', assignee_id: user_link, due_date: today, status: 'in_progress', priority: 'high', related_to_id: contact_neo, related_to_type: 'contacts' },
    { id: uuid(), org_id: DEMO_ORG_ID, title: 'Schedule Oracle Meeting', description: 'Arrange meeting with the Oracle.', assignee_id: user_morpheus, due_date: today, status: 'pending', priority: 'high', related_to_id: lead_seraph, related_to_type: 'leads' },
    { id: uuid(), org_id: DEMO_ORG_ID, title: 'Follow up on Hammer Invoice', description: 'Contact Roland about overdue payment.', assignee_id: user_trinity, due_date: today, status: 'pending', priority: 'urgent', related_to_id: invoice3, related_to_type: 'invoices' },
  ], { onConflict: 'id' });
  if (tasksError) console.log('  ⚠️ Tasks:', tasksError.message);
  else console.log('  ✅ 3 tasks inserted');

  // === TICKETS ===
  console.log('🎫 Inserting tickets...');
  const { error: ticketsError } = await supabase.from('tickets').upsert([
    { id: uuid(), org_id: DEMO_ORG_ID, ticket_number: 'TKT-001', subject: 'EMP Device Not Charging', description: 'EMP device shows 0% charge and wont power up.', requester_id: contact_roland, account_id: account_hammer, status: 'Open', priority: 'Urgent', assignee_id: user_link },
    { id: uuid(), org_id: DEMO_ORG_ID, ticket_number: 'TKT-002', subject: 'Operator Console Flickering', description: 'Display keeps flickering during Matrix operations.', requester_id: contact_ghost, account_id: account_logos, status: 'In Progress', priority: 'High', assignee_id: user_link },
  ], { onConflict: 'id' });
  if (ticketsError) console.log('  ⚠️ Tickets:', ticketsError.message);
  else console.log('  ✅ 2 tickets inserted');

  // === EQUIPMENT ===
  console.log('🔧 Inserting equipment...');
  const { error: equipmentError } = await supabase.from('equipment').upsert([
    { id: uuid(), org_id: DEMO_ORG_ID, name: 'Operator Console Alpha', type: 'Console', barcode: 'EQ-000001', condition: 'Excellent', location: 'Nebuchadnezzar', assigned_to: user_link, purchase_price: 50000 },
    { id: uuid(), org_id: DEMO_ORG_ID, name: 'Hovercraft Engine Unit', type: 'Engine', barcode: 'EQ-000002', condition: 'Good', location: 'Zion Dock', purchase_price: 150000 },
    { id: uuid(), org_id: DEMO_ORG_ID, name: 'EMP Charging Station', type: 'Charger', barcode: 'EQ-000003', condition: 'Fair', location: 'Hammer', assigned_to: user_neo, purchase_price: 25000 },
  ], { onConflict: 'id' });
  if (equipmentError) console.log('  ⚠️ Equipment:', equipmentError.message);
  else console.log('  ✅ 3 equipment inserted');

  // === INVENTORY ITEMS ===
  console.log('📦 Inserting inventory items...');
  const { error: inventoryError } = await supabase.from('inventory_items').upsert([
    { id: uuid(), org_id: DEMO_ORG_ID, name: 'Red Pills', sku: 'MED-RED', warehouse_qty: 47, reorder_point: 20, category: 'Material', unit_price: 999999 },
    { id: uuid(), org_id: DEMO_ORG_ID, name: 'EMP Capacitors', sku: 'WEAP-CAP', warehouse_qty: 15, reorder_point: 5, category: 'Material', unit_price: 5000 },
    { id: uuid(), org_id: DEMO_ORG_ID, name: 'Hardline Phones', sku: 'COMM-HARD', warehouse_qty: 8, reorder_point: 10, category: 'Asset', unit_price: 15000 },
    { id: uuid(), org_id: DEMO_ORG_ID, name: 'Neural Interface Plugs', sku: 'TECH-PLUG', warehouse_qty: 50, reorder_point: 20, category: 'Material', unit_price: 2500 },
  ], { onConflict: 'id' });
  if (inventoryError) console.log('  ⚠️ Inventory:', inventoryError.message);
  else console.log('  ✅ 4 inventory items inserted');

  // === REVIEWS ===
  console.log('⭐ Inserting reviews...');
  const { error: reviewsError } = await supabase.from('reviews').upsert([
    { id: uuid(), org_id: DEMO_ORG_ID, author_name: 'Councillor Hamann', rating: 5, content: 'The Nebuchadnezzar crew saved Zion. Outstanding service.', platform: 'Google', status: 'Replied', replied: true, reply_content: 'Thank you, Councillor. The fight continues.', sentiment: 'Positive', account_id: account_neb },
    { id: uuid(), org_id: DEMO_ORG_ID, author_name: 'Anonymous Freed Mind', rating: 5, content: 'The red pill changed my life. Forever grateful to Morpheus.', platform: 'Facebook', status: 'New', replied: false, sentiment: 'Positive' },
    { id: uuid(), org_id: DEMO_ORG_ID, author_name: 'Commander Lock', rating: 3, content: 'Morpheus takes too many risks. Results are mixed.', platform: 'Internal', status: 'Escalated', replied: false, sentiment: 'Neutral' },
  ], { onConflict: 'id' });
  if (reviewsError) console.log('  ⚠️ Reviews:', reviewsError.message);
  else console.log('  ✅ 3 reviews inserted');

  // === SUBSCRIPTIONS ===
  console.log('📅 Inserting subscriptions...');
  const { error: subscriptionsError } = await supabase.from('subscriptions').upsert([
    { id: uuid(), org_id: DEMO_ORG_ID, account_id: account_neb, name: 'Nebuchadnezzar Operations Package', status: 'Active', billing_cycle: 'monthly', next_bill_date: today, start_date: today, items: [{ itemType: 'service', description: 'Operator Support', qty: 1, unitPrice: 8000, taxRate: 10 }, { itemType: 'service', description: 'Sentinel Watch', qty: 1, unitPrice: 10000, taxRate: 0 }], auto_generate_invoice: true },
    { id: uuid(), org_id: DEMO_ORG_ID, account_id: account_logos, name: 'Logos Premium Support', status: 'Active', billing_cycle: 'monthly', next_bill_date: today, start_date: today, items: [{ itemType: 'service', description: 'Operator Support', qty: 1, unitPrice: 8000, taxRate: 10 }], auto_generate_invoice: true },
    { id: uuid(), org_id: DEMO_ORG_ID, account_id: account_hammer, name: 'Hammer Defense Package', status: 'Paused', billing_cycle: 'yearly', next_bill_date: today, start_date: today, items: [{ itemType: 'service', description: 'Sentinel Watch Annual', qty: 1, unitPrice: 120000, taxRate: 0 }], auto_generate_invoice: true },
  ], { onConflict: 'id' });
  if (subscriptionsError) console.log('  ⚠️ Subscriptions:', subscriptionsError.message);
  else console.log('  ✅ 3 subscriptions inserted');

  // === BANK TRANSACTIONS ===
  console.log('💳 Inserting bank transactions...');
  const { error: bankError } = await supabase.from('bank_transactions').upsert([
    { id: uuid(), org_id: DEMO_ORG_ID, date: today, description: 'PAYMENT - NEBUCHADNEZZAR', amount: 495000, type: 'Credit', status: 'matched', match_confidence: 'green', reconciled: true, bank_reference: 'REF-001234' },
    { id: uuid(), org_id: DEMO_ORG_ID, date: today, description: 'ZION DOCK SERVICES', amount: -45000, type: 'Debit', status: 'matched', match_confidence: 'green', reconciled: true, bank_reference: 'REF-001235' },
    { id: uuid(), org_id: DEMO_ORG_ID, date: today, description: 'UNKNOWN TRANSFER', amount: 8800, type: 'Credit', status: 'unmatched', match_confidence: 'amber', reconciled: false, bank_reference: 'REF-001236' },
  ], { onConflict: 'id' });
  if (bankError) console.log('  ⚠️ Bank Transactions:', bankError.message);
  else console.log('  ✅ 3 bank transactions inserted');

  // === EXPENSES ===
  console.log('💸 Inserting expenses...');
  const { error: expensesError } = await supabase.from('expenses').upsert([
    { id: uuid(), org_id: DEMO_ORG_ID, vendor: 'Zion Dock Services', amount: 45000, category: 'Materials', date: today, status: 'Paid', approved_by: user_morpheus },
    { id: uuid(), org_id: DEMO_ORG_ID, vendor: 'Fuel Depot Alpha', amount: 12500, category: 'Fuel', date: today, status: 'Paid', approved_by: user_niobe },
    { id: uuid(), org_id: DEMO_ORG_ID, vendor: 'Matrix Tech Supply', amount: 28000, category: 'Materials', date: today, status: 'Pending' },
  ], { onConflict: 'id' });
  if (expensesError) console.log('  ⚠️ Expenses:', expensesError.message);
  else console.log('  ✅ 3 expenses inserted');

  // === NOTIFICATIONS ===
  console.log('🔔 Inserting notifications...');
  const { error: notificationsError } = await supabase.from('notifications').upsert([
    { id: uuid(), org_id: DEMO_ORG_ID, user_id: user_neo, title: 'New Lead Assigned', message: 'The Kid has been assigned to you as a new lead.', type: 'info', read: false, link: '/leads' },
    { id: uuid(), org_id: DEMO_ORG_ID, user_id: user_trinity, title: 'Invoice Overdue', message: 'Invoice INV-2026-0003 for Hammer is now overdue.', type: 'warning', read: false, link: '/financials/ledger/income' },
    { id: uuid(), org_id: DEMO_ORG_ID, user_id: user_morpheus, title: 'Deal Won!', message: 'Nebuchadnezzar Refit Contract has been closed as won!', type: 'success', read: true, link: '/deals' },
  ], { onConflict: 'id' });
  if (notificationsError) console.log('  ⚠️ Notifications:', notificationsError.message);
  else console.log('  ✅ 3 notifications inserted');

  // === WAREHOUSES ===
  console.log('🏭 Inserting warehouses...');
  const { error: warehousesError } = await supabase.from('warehouses').upsert([
    { id: uuid(), org_id: DEMO_ORG_ID, name: 'Zion Main Warehouse', address: 'Dock Level 3, Zion', is_default: true },
    { id: uuid(), org_id: DEMO_ORG_ID, name: 'Nebuchadnezzar Storage', address: 'Cargo Bay, Nebuchadnezzar', is_default: false },
  ], { onConflict: 'id' });
  if (warehousesError) console.log('  ⚠️ Warehouses:', warehousesError.message);
  else console.log('  ✅ 2 warehouses inserted');

  console.log('\n🎉 Demo data seeding complete!\n');

  // Verify
  console.log('📊 Verification:');
  for (const table of ['users', 'accounts', 'contacts', 'leads', 'deals', 'products', 'services', 'jobs', 'invoices']) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('org_id', DEMO_ORG_ID);
    console.log(`  ${table}: ${count} records`);
  }
}

seedData().catch(console.error);
