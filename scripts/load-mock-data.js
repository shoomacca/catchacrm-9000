#!/usr/bin/env node

/**
 * Load Matrix-themed Mock Data via Supabase Client
 * Uses JavaScript client to insert data instead of raw SQL
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('\n🎬 Loading Matrix-themed Mock Data...\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getOrgId() {
  const { data, error } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single();

  if (error || !data) {
    console.error('❌ No organization found. Please create one first.');
    process.exit(1);
  }

  return data.id;
}

async function clearExistingData() {
  console.log('🧹 Clearing existing data...\n');

  const tables = [
    'communications', 'calendar_events', 'invoices', 'services',
    'procurement', 'purchase_orders', 'inventory', 'warehouses',
    'equipment', 'zones', 'crews', 'jobs', 'tickets', 'campaigns',
    'tasks', 'deals', 'leads', 'contacts', 'accounts'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error && !error.message.includes('does not exist')) {
      console.log(`   ⚠️  ${table}: ${error.message}`);
    } else {
      console.log(`   ✅ ${table} cleared`);
    }
  }
}

async function loadAccounts(orgId) {
  console.log('\n📦 Loading Accounts (Matrix Organizations)...\n');

  const accounts = [
    { name: 'Zion Command', industry: 'Resistance', type: 'customer', status: 'active', revenue: 1000000 },
    { name: 'Nebuchadnezzar Crew', industry: 'Hovercraft Operations', type: 'customer', status: 'active', revenue: 500000 },
    { name: 'Logos', industry: 'Hovercraft Operations', type: 'customer', status: 'active', revenue: 400000 },
    { name: 'Mjolnir', industry: 'Hovercraft Operations', type: 'customer', status: 'active', revenue: 450000 },
    { name: 'Machine City', industry: 'AI Systems', type: 'competitor', status: 'active', revenue: 10000000 },
    { name: 'Sentinel Fleet', industry: 'Security', type: 'competitor', status: 'active', revenue: 2000000 },
    { name: 'Agent Program', industry: 'Matrix Operations', type: 'competitor', status: 'active', revenue: 5000000 },
    { name: 'Oracle Services', industry: 'Consulting', type: 'partner', status: 'active', revenue: 750000 },
    { name: 'Keymaker Industries', industry: 'Access Solutions', type: 'partner', status: 'active', revenue: 300000 },
    { name: 'Merovingian Exchange', industry: 'Information Trading', type: 'partner', status: 'active', revenue: 900000 }
  ];

  const accountsWithOrg = accounts.map(acc => ({
    ...acc,
    org_id: orgId,
    website: `https://${acc.name.toLowerCase().replace(/\s+/g, '')}.matrix`,
    employees: Math.floor(Math.random() * 1000) + 100,
    description: `${acc.name} - Key player in the Matrix resistance`
  }));

  const { data, error } = await supabase.from('accounts').insert(accountsWithOrg).select();

  if (error) {
    console.error('❌ Error loading accounts:', error.message);
    return [];
  }

  console.log(`✅ Loaded ${data.length} accounts\n`);
  return data;
}

async function loadContacts(orgId, accounts) {
  console.log('👥 Loading Contacts (Matrix Characters)...\n');

  const accountMap = {};
  accounts.forEach(acc => {
    accountMap[acc.name] = acc.id;
  });

  const contacts = [
    { first_name: 'Neo', last_name: 'Anderson', email: 'neo@zion.matrix', phone: '555-0001', title: 'The One', account: 'Zion Command' },
    { first_name: 'Morpheus', last_name: '', email: 'morpheus@nebuchadnezzar.matrix', phone: '555-0002', title: 'Captain', account: 'Nebuchadnezzar Crew' },
    { first_name: 'Trinity', last_name: '', email: 'trinity@nebuchadnezzar.matrix', phone: '555-0003', title: 'First Mate', account: 'Nebuchadnezzar Crew' },
    { first_name: 'Agent', last_name: 'Smith', email: 'smith@agents.matrix', phone: '555-0100', title: 'Lead Agent', account: 'Agent Program' },
    { first_name: 'The', last_name: 'Oracle', email: 'oracle@oracle.matrix', phone: '555-0200', title: 'Consultant', account: 'Oracle Services' },
    { first_name: 'The', last_name: 'Architect', email: 'architect@machine.matrix', phone: '555-0300', title: 'System Designer', account: 'Machine City' },
    { first_name: 'Niobe', last_name: '', email: 'niobe@logos.matrix', phone: '555-0004', title: 'Captain', account: 'Logos' },
    { first_name: 'Cypher', last_name: '', email: 'cypher@nebuchadnezzar.matrix', phone: '555-0005', title: 'Operator (Former)', account: 'Nebuchadnezzar Crew' },
    { first_name: 'Tank', last_name: '', email: 'tank@nebuchadnezzar.matrix', phone: '555-0006', title: 'Operator', account: 'Nebuchadnezzar Crew' },
    { first_name: 'Dozer', last_name: '', email: 'dozer@nebuchadnezzar.matrix', phone: '555-0007', title: 'Engineer', account: 'Nebuchadnezzar Crew' },
    { first_name: 'The', last_name: 'Keymaker', email: 'keymaker@keymaker.matrix', phone: '555-0201', title: 'Access Specialist', account: 'Keymaker Industries' },
    { first_name: 'The', last_name: 'Merovingian', email: 'merovingian@exchange.matrix', phone: '555-0202', title: 'Information Broker', account: 'Merovingian Exchange' },
    { first_name: 'Persephone', last_name: '', email: 'persephone@exchange.matrix', phone: '555-0203', title: 'Associate', account: 'Merovingian Exchange' },
    { first_name: 'Commander', last_name: 'Lock', email: 'lock@zion.matrix', phone: '555-0008', title: 'Military Commander', account: 'Zion Command' },
    { first_name: 'Councillor', last_name: 'Hamann', email: 'hamann@zion.matrix', phone: '555-0009', title: 'Council Member', account: 'Zion Command' }
  ];

  const contactsWithOrg = contacts.map(contact => ({
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email,
    phone: contact.phone,
    title: contact.title,
    account_id: accountMap[contact.account],
    org_id: orgId,
    status: 'active'
  }));

  const { data, error } = await supabase.from('contacts').insert(contactsWithOrg).select();

  if (error) {
    console.error('❌ Error loading contacts:', error.message);
    return [];
  }

  console.log(`✅ Loaded ${data.length} contacts\n`);
  return data;
}

async function loadLeads(orgId) {
  console.log('🎯 Loading Leads (Potential Recruits)...\n');

  const leads = [
    { name: 'Thomas A. Anderson', email: 'tanderson@metacortex.com', company: 'MetaCortex', phone: '555-1001', status: 'new', source: 'Oracle Referral', estimated_value: 50000, score: 85, notes: 'High potential, shows signs of awakening' },
    { name: 'Switch', email: 'switch@resistance.net', company: 'Independent', phone: '555-1002', status: 'contacted', source: 'Resistance Network', estimated_value: 30000, score: 70, notes: 'Skilled hacker, good infiltration skills' },
    { name: 'Apoc', email: 'apoc@resistance.net', company: 'Independent', phone: '555-1003', status: 'qualified', source: 'Resistance Network', estimated_value: 35000, score: 75, notes: 'Technical expertise in systems' },
    { name: 'Mouse', email: 'mouse@resistance.net', company: 'Independent', phone: '555-1004', status: 'qualified', source: 'Zion Database', estimated_value: 25000, score: 60, notes: 'Young but talented programmer' },
    { name: 'Potential Recruit #5', email: 'recruit5@matrix.com', company: 'Unknown', phone: '555-1005', status: 'new', source: 'Anomaly Detection', estimated_value: 40000, score: 65, notes: 'Under observation, shows promise' }
  ];

  const leadsWithOrg = leads.map(lead => ({ ...lead, org_id: orgId }));

  const { data, error } = await supabase.from('leads').insert(leadsWithOrg).select();

  if (error) {
    console.error('❌ Error loading leads:', error.message);
    return [];
  }

  console.log(`✅ Loaded ${data.length} leads\n`);
  return data;
}

async function loadDeals(orgId, accounts) {
  console.log('💰 Loading Deals (Operations)...\n');

  const accountMap = {};
  accounts.forEach(acc => {
    accountMap[acc.name] = acc.id;
  });

  const deals = [
    { name: 'Operation Exodus', amount: 500000, stage: 'negotiation', probability: 75, account: 'Zion Command', notes: 'Mass evacuation planning' },
    { name: 'Source Code Recovery', amount: 750000, stage: 'proposal', probability: 60, account: 'Oracle Services', notes: 'Retrieve critical system access codes' },
    { name: 'Sentinel Defense System', amount: 300000, stage: 'qualification', probability: 40, account: 'Zion Command', notes: 'EMP weapon upgrades' },
    { name: 'Mainframe Infiltration', amount: 1000000, stage: 'negotiation', probability: 80, account: 'Keymaker Industries', notes: 'Access to Source through back doors' },
    { name: 'Agent Countermeasure Training', amount: 200000, stage: 'closed_won', probability: 100, account: 'Nebuchadnezzar Crew', notes: 'Combat training complete' }
  ];

  const dealsWithOrg = deals.map(deal => ({
    name: deal.name,
    amount: deal.amount,
    stage: deal.stage,
    probability: deal.probability,
    account_id: accountMap[deal.account],
    org_id: orgId,
    notes: deal.notes,
    expected_close_date: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));

  const { data, error } = await supabase.from('deals').insert(dealsWithOrg).select();

  if (error) {
    console.error('❌ Error loading deals:', error.message);
    return [];
  }

  console.log(`✅ Loaded ${data.length} deals\n`);
  return data;
}

async function loadTasks(orgId) {
  console.log('✅ Loading Tasks (Mission Objectives)...\n');

  const tasks = [
    { title: 'Learn Kung Fu', description: 'Upload combat training programs', status: 'completed', priority: 'high', completed: true },
    { title: 'Dodge Bullets', description: 'Master bullet-time perception', status: 'completed', priority: 'high', completed: true },
    { title: 'Free Minds from Matrix', description: 'Locate and extract potential recruits', status: 'in_progress', priority: 'critical', completed: false },
    { title: 'Investigate Anomaly', description: 'Track unusual system behavior', status: 'pending', priority: 'medium', completed: false },
    { title: 'Meet with Oracle', description: 'Consultation scheduled', status: 'pending', priority: 'high', completed: false },
    { title: 'Repair EMP Device', description: 'Nebuchadnezzar maintenance', status: 'in_progress', priority: 'high', completed: false },
    { title: 'Decode Prophecy', description: 'Analyze Oracle predictions', status: 'pending', priority: 'medium', completed: false },
    { title: 'Training Simulation', description: 'Combat scenarios in construct', status: 'pending', priority: 'low', completed: false }
  ];

  const tasksWithOrg = tasks.map(task => ({
    ...task,
    org_id: orgId,
    due_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));

  const { data, error } = await supabase.from('tasks').insert(tasksWithOrg).select();

  if (error) {
    console.error('❌ Error loading tasks:', error.message);
    return [];
  }

  console.log(`✅ Loaded ${data.length} tasks\n`);
  return data;
}

async function loadCampaigns(orgId) {
  console.log('📢 Loading Campaigns...\n');

  const campaigns = [
    { name: 'Wake Up Campaign', type: 'email', status: 'active', start_date: '2026-01-01', budget: 50000, target_audience: 'Potential Bluepills' },
    { name: 'Red Pill Distribution', type: 'outbound', status: 'active', start_date: '2026-01-15', budget: 30000, target_audience: 'High-Score Leads' },
    { name: 'Resistance Recruitment Drive', type: 'social', status: 'planning', start_date: '2026-03-01', budget: 75000, target_audience: 'Awakened Individuals' },
    { name: 'Zion Awareness', type: 'email', status: 'active', start_date: '2026-02-01', budget: 40000, target_audience: 'Recently Freed' },
    { name: 'Oracle Consultation Outreach', type: 'referral', status: 'completed', start_date: '2025-12-01', budget: 20000, target_audience: 'Key Decision Makers' }
  ];

  const campaignsWithOrg = campaigns.map(campaign => ({ ...campaign, org_id: orgId }));

  const { data, error } = await supabase.from('campaigns').insert(campaignsWithOrg).select();

  if (error) {
    console.error('❌ Error loading campaigns:', error.message);
    return [];
  }

  console.log(`✅ Loaded ${data.length} campaigns\n`);
  return data;
}

async function loadTickets(orgId) {
  console.log('🎫 Loading Support Tickets (Glitches)...\n');

  const tickets = [
    { subject: 'Déjà Vu Glitch', description: 'User experiencing repeated events', priority: 'high', status: 'open', category: 'technical' },
    { subject: 'Agent Smith Replication Bug', description: 'Uncontrolled multiplication detected', priority: 'critical', status: 'in_progress', category: 'security' },
    { subject: 'Phone Line Disconnection', description: 'Lost connection during extraction', priority: 'high', status: 'resolved', category: 'technical' },
    { subject: 'Construct Loading Error', description: 'Training program won\'t load', priority: 'medium', status: 'open', category: 'technical' },
    { subject: 'Sentinel Detection Range', description: 'EMP effective radius question', priority: 'low', status: 'open', category: 'general' }
  ];

  const ticketsWithOrg = tickets.map(ticket => ({ ...ticket, org_id: orgId }));

  const { data, error } = await supabase.from('tickets').insert(ticketsWithOrg).select();

  if (error) {
    console.error('❌ Error loading tickets:', error.message);
    return [];
  }

  console.log(`✅ Loaded ${data.length} tickets\n`);
  return data;
}

async function loadFieldServiceData(orgId, accounts) {
  console.log('🚁 Loading Field Service Data (Hovercrafts & Missions)...\n');

  const accountMap = {};
  accounts.forEach(acc => {
    accountMap[acc.name] = acc.id;
  });

  // Jobs
  const jobs = [
    { title: 'Extraction: Neo', description: 'Extract Thomas Anderson from Matrix', status: 'completed', priority: 'critical', account: 'Zion Command', scheduled_start: '2025-12-15', scheduled_end: '2025-12-15' },
    { title: 'Recon: Machine City', description: 'Surveillance of Machine City perimeter', status: 'in_progress', priority: 'high', account: 'Zion Command', scheduled_start: '2026-02-01', scheduled_end: '2026-02-10' },
    { title: 'Oracle Visit', description: 'Consultation transport', status: 'scheduled', priority: 'medium', account: 'Oracle Services', scheduled_start: '2026-02-15', scheduled_end: '2026-02-15' },
    { title: 'Keymaker Rescue', description: 'Retrieve Keymaker from Château', status: 'completed', priority: 'critical', account: 'Keymaker Industries', scheduled_start: '2026-01-20', scheduled_end: '2026-01-20' },
    { title: 'Broadcast Tower Defense', description: 'Protect Zion broadcast', status: 'scheduled', priority: 'high', account: 'Zion Command', scheduled_start: '2026-02-20', scheduled_end: '2026-02-25' }
  ];

  const jobsWithOrg = jobs.map(job => ({
    title: job.title,
    description: job.description,
    status: job.status,
    priority: job.priority,
    account_id: accountMap[job.account],
    org_id: orgId,
    scheduled_start: job.scheduled_start,
    scheduled_end: job.scheduled_end
  }));

  const { data: jobsData, error: jobsError } = await supabase.from('jobs').insert(jobsWithOrg).select();

  if (jobsError) {
    console.error('❌ Error loading jobs:', jobsError.message);
  } else {
    console.log(`✅ Loaded ${jobsData.length} jobs`);
  }

  // Crews
  const crews = [
    { name: 'Nebuchadnezzar Crew', members: 8, leader: 'Morpheus', status: 'active', specialty: 'Extraction & Infiltration' },
    { name: 'Logos Crew', members: 6, leader: 'Niobe', status: 'active', specialty: 'Combat & Recon' },
    { name: 'Mjolnir Crew', members: 7, leader: 'Roland', status: 'active', specialty: 'Heavy Combat' },
    { name: 'Vigilant Crew', members: 5, leader: 'Captain Soren', status: 'inactive', specialty: 'Surveillance' }
  ];

  const crewsWithOrg = crews.map(crew => ({ ...crew, org_id: orgId }));

  const { data: crewsData, error: crewsError } = await supabase.from('crews').insert(crewsWithOrg).select();

  if (crewsError) {
    console.error('❌ Error loading crews:', crewsError.message);
  } else {
    console.log(`✅ Loaded ${crewsData.length} crews`);
  }

  // Equipment
  const equipment = [
    { name: 'Nebuchadnezzar', type: 'hovercraft', model: 'Mark III No. 11', status: 'operational', location: 'Zion Dock 7', value: 5000000 },
    { name: 'Logos', type: 'hovercraft', model: 'Mark III No. 12', status: 'operational', location: 'Zion Dock 3', value: 5000000 },
    { name: 'EMP Device', type: 'weapon', model: 'Standard', status: 'operational', location: 'Nebuchadnezzar', value: 250000 },
    { name: 'Hovercraft Scanner', type: 'surveillance', model: 'Advanced', status: 'operational', location: 'Logos', value: 150000 },
    { name: 'Construct Terminal', type: 'training', model: 'Neural Interface', status: 'operational', location: 'Nebuchadnezzar', value: 300000 }
  ];

  const equipmentWithOrg = equipment.map(eq => ({ ...eq, org_id: orgId }));

  const { data: equipmentData, error: equipmentError } = await supabase.from('equipment').insert(equipmentWithOrg).select();

  if (equipmentError) {
    console.error('❌ Error loading equipment:', equipmentError.message);
  } else {
    console.log(`✅ Loaded ${equipmentData.length} equipment items`);
  }

  // Zones
  const zones = [
    { name: 'Zion Territory', type: 'safe_zone', status: 'active', description: 'Last human city, deep underground', coordinates: '34.0522° N, 118.2437° W' },
    { name: 'Machine City Perimeter', type: 'danger_zone', status: 'active', description: 'Outer boundary of 01', coordinates: '40.7128° N, 74.0060° W' },
    { name: 'Broadcast Depth', type: 'service_zone', status: 'active', description: 'Maximum transmission range for Zion', coordinates: '51.5074° N, 0.1278° W' },
    { name: 'Old Seattle Ruins', type: 'scavenge_zone', status: 'inactive', description: 'Pre-war urban ruins', coordinates: '47.6062° N, 122.3321° W' },
    { name: 'Mainframe Access Point', type: 'critical_zone', status: 'active', description: 'Direct line to Source', coordinates: 'Classified' }
  ];

  const zonesWithOrg = zones.map(zone => ({ ...zone, org_id: orgId }));

  const { data: zonesData, error: zonesError } = await supabase.from('zones').insert(zonesWithOrg).select();

  if (zonesError) {
    console.error('❌ Error loading zones:', zonesError.message);
  } else {
    console.log(`✅ Loaded ${zonesData.length} zones\n`);
  }
}

async function loadCalendarEvents(orgId) {
  console.log('📅 Loading Calendar Events...\n');

  const events = [
    { title: 'Council Meeting', type: 'meeting', start_time: '2026-02-10T10:00:00Z', end_time: '2026-02-10T12:00:00Z', location: 'Zion Council Chambers', description: 'Strategic planning session' },
    { title: 'Combat Training', type: 'task', start_time: '2026-02-11T14:00:00Z', end_time: '2026-02-11T16:00:00Z', location: 'Training Construct', description: 'Advanced martial arts simulation' },
    { title: 'Oracle Consultation', type: 'appointment', start_time: '2026-02-15T09:00:00Z', end_time: '2026-02-15T10:00:00Z', location: 'Oracle\'s Apartment', description: 'Prophecy interpretation' },
    { title: 'Hovercraft Maintenance', type: 'task', start_time: '2026-02-12T08:00:00Z', end_time: '2026-02-12T17:00:00Z', location: 'Zion Dock 7', description: 'Routine systems check' },
    { title: 'Emergency Drill', type: 'event', start_time: '2026-02-14T15:00:00Z', end_time: '2026-02-14T16:00:00Z', location: 'All Zones', description: 'Sentinel attack simulation' }
  ];

  const eventsWithOrg = events.map(event => ({ ...event, org_id: orgId, all_day: false }));

  const { data, error } = await supabase.from('calendar_events').insert(eventsWithOrg).select();

  if (error) {
    console.error('❌ Error loading calendar events:', error.message);
    return [];
  }

  console.log(`✅ Loaded ${data.length} calendar events\n`);
  return data;
}

async function main() {
  try {
    const orgId = await getOrgId();
    console.log(`✅ Using Organization ID: ${orgId}\n`);

    // Clear existing data
    await clearExistingData();

    // Load data in dependency order
    const accounts = await loadAccounts(orgId);
    const contacts = await loadContacts(orgId, accounts);
    const leads = await loadLeads(orgId);
    const deals = await loadDeals(orgId, accounts);
    const tasks = await loadTasks(orgId);
    const campaigns = await loadCampaigns(orgId);
    const tickets = await loadTickets(orgId);
    await loadFieldServiceData(orgId, accounts);
    const events = await loadCalendarEvents(orgId);

    console.log('\n🎉 Matrix Mock Data Loaded Successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${accounts.length} Accounts (Organizations)`);
    console.log(`   - ${contacts.length} Contacts (Characters)`);
    console.log(`   - ${leads.length} Leads (Potential Recruits)`);
    console.log(`   - ${deals.length} Deals (Operations)`);
    console.log(`   - ${tasks.length} Tasks (Mission Objectives)`);
    console.log(`   - ${campaigns.length} Campaigns`);
    console.log(`   - ${tickets.length} Support Tickets`);
    console.log(`   - Field Service Data (Jobs, Crews, Equipment, Zones)`);
    console.log(`   - ${events.length} Calendar Events\n`);

    console.log('📋 Next Steps:');
    console.log('   1. Restart dev server: npm run dev');
    console.log('   2. Open browser: http://localhost:3000');
    console.log('   3. Navigate to modules to see Matrix data!');
    console.log('   4. Check Contacts for Neo, Morpheus, Trinity, etc.');
    console.log('   5. Check Accounts for Zion Command, Nebuchadnezzar, etc.\n');

  } catch (error) {
    console.error('\n❌ Error loading mock data:', error.message);
    process.exit(1);
  }
}

main();
