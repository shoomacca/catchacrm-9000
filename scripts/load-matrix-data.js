#!/usr/bin/env node

/**
 * Load Matrix Mock Data
 * Works with fresh schema created from frontend types
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
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('\n🎬 Matrix Data Loader\n');

async function getOrgId() {
  const { data } = await supabase.from('organizations').select('id').limit(1).single();
  return data?.id || '00000000-0000-0000-0000-000000000001';
}

async function safeInsert(tableName, records) {
  console.log(`📝 ${tableName}:`);

  if (!Array.isArray(records) || records.length === 0) {
    console.log(`   ⚠️  No data to insert`);
    return { success: false, count: 0 };
  }

  const { data, error } = await supabase
    .from(tableName)
    .insert(records)
    .select();

  if (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, count: 0, error: error.message };
  }

  console.log(`   ✅ Inserted ${data.length} rows`);
  return { success: true, count: data.length };
}

async function main() {
  const orgId = await getOrgId();
  console.log(`📌 Organization ID: ${orgId}\n`);

  const results = {};
  let totalRows = 0;

  // === ACCOUNTS (Ships) ===
  results.accounts = await safeInsert('accounts', [
    {
      org_id: orgId,
      name: 'Nebuchadnezzar',
      industry: 'Reconnaissance',
      type: 'customer',
      status: 'active',
      email: 'nebuchadnezzar@zion.io',
      phone: '555-2001',
      website: 'nebuchadnezzar.zion',
      employee_count: 9,
      tier: 'Tier A'
    },
    {
      org_id: orgId,
      name: 'Logos',
      industry: 'Strike Force',
      type: 'customer',
      status: 'active',
      email: 'logos@zion.io',
      phone: '555-2002',
      website: 'logos.zion',
      employee_count: 4,
      tier: 'Tier A'
    },
    {
      org_id: orgId,
      name: 'Mjolnir (Hammer)',
      industry: 'Heavy Assault',
      type: 'customer',
      status: 'active',
      email: 'hammer@zion.io',
      phone: '555-2003',
      website: 'hammer.zion',
      employee_count: 12,
      tier: 'Tier A'
    },
    {
      org_id: orgId,
      name: 'Vigilant',
      industry: 'Surveillance',
      type: 'customer',
      status: 'active',
      email: 'vigilant@zion.io',
      phone: '555-2004',
      website: 'vigilant.zion',
      employee_count: 5,
      tier: 'Tier B'
    },
    {
      org_id: orgId,
      name: 'Zion Command',
      industry: 'Government',
      type: 'customer',
      status: 'active',
      email: 'command@zion.io',
      phone: '555-2000',
      website: 'zion.io',
      employee_count: 250,
      tier: 'Tier S'
    },
    {
      org_id: orgId,
      name: 'Machine City',
      industry: 'AI Systems',
      type: 'competitor',
      status: 'active',
      email: 'contact@machinecity.matrix',
      phone: '555-9000',
      website: 'machinecity.matrix',
      employee_count: 10000,
      tier: 'Tier S'
    },
    {
      org_id: orgId,
      name: 'Agent Program',
      industry: 'Matrix Operations',
      type: 'competitor',
      status: 'active',
      email: 'agents@matrix.io',
      phone: '555-9100',
      website: 'agents.matrix',
      employee_count: 100,
      tier: 'Tier A'
    },
    {
      org_id: orgId,
      name: 'Oracle Services',
      industry: 'Consulting',
      type: 'partner',
      status: 'active',
      email: 'contact@oracle.io',
      phone: '555-8000',
      website: 'oracle.io',
      employee_count: 1,
      tier: 'Tier S'
    },
    {
      org_id: orgId,
      name: 'Keymaker Industries',
      industry: 'Access Solutions',
      type: 'partner',
      status: 'active',
      email: 'contact@keymaker.io',
      phone: '555-8001',
      website: 'keymaker.io',
      employee_count: 1,
      tier: 'Tier A'
    },
    {
      org_id: orgId,
      name: 'Merovingian Exchange',
      industry: 'Information Trading',
      type: 'partner',
      status: 'active',
      email: 'contact@exchange.io',
      phone: '555-8002',
      website: 'exchange.io',
      employee_count: 50,
      tier: 'Tier A'
    }
  ]);

  // Get account IDs for foreign keys
  const { data: accounts } = await supabase.from('accounts').select('id, name').eq('org_id', orgId);
  const accountMap = {};
  if (accounts) {
    accounts.forEach(acc => {
      accountMap[acc.name] = acc.id;
    });
  }

  // === CONTACTS (Crew Members) ===
  results.contacts = await safeInsert('contacts', [
    {
      org_id: orgId,
      name: 'Neo Anderson',
      email: 'neo@zion.io',
      phone: '555-0001',
      title: 'The One',
      account_id: accountMap['Zion Command'],
      company: 'Zion Command',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Morpheus',
      email: 'morpheus@zion.io',
      phone: '555-0002',
      title: 'Captain',
      account_id: accountMap['Nebuchadnezzar'],
      company: 'Nebuchadnezzar',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Trinity',
      email: 'trinity@zion.io',
      phone: '555-0003',
      title: 'First Mate',
      account_id: accountMap['Nebuchadnezzar'],
      company: 'Nebuchadnezzar',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Niobe',
      email: 'niobe@zion.io',
      phone: '555-0004',
      title: 'Captain',
      account_id: accountMap['Logos'],
      company: 'Logos',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Tank',
      email: 'tank@zion.io',
      phone: '555-0006',
      title: 'Operator',
      account_id: accountMap['Nebuchadnezzar'],
      company: 'Nebuchadnezzar',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Dozer',
      email: 'dozer@zion.io',
      phone: '555-0007',
      title: 'Engineer',
      account_id: accountMap['Nebuchadnezzar'],
      company: 'Nebuchadnezzar',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'The Oracle',
      email: 'oracle@zion.io',
      phone: '555-0200',
      title: 'Consultant',
      account_id: accountMap['Oracle Services'],
      company: 'Oracle Services',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'The Keymaker',
      email: 'keymaker@keymaker.io',
      phone: '555-0201',
      title: 'Access Specialist',
      account_id: accountMap['Keymaker Industries'],
      company: 'Keymaker Industries',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Commander Lock',
      email: 'lock@zion.io',
      phone: '555-0008',
      title: 'Military Commander',
      account_id: accountMap['Zion Command'],
      company: 'Zion Command',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Agent Smith',
      email: 'smith@agents.matrix',
      phone: '555-0100',
      title: 'Lead Agent',
      account_id: accountMap['Agent Program'],
      company: 'Agent Program',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'The Architect',
      email: 'architect@machine.io',
      phone: '555-0300',
      title: 'System Designer',
      account_id: accountMap['Machine City'],
      company: 'Machine City',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'The Merovingian',
      email: 'merovingian@exchange.io',
      phone: '555-0202',
      title: 'Information Broker',
      account_id: accountMap['Merovingian Exchange'],
      company: 'Merovingian Exchange',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Persephone',
      email: 'persephone@exchange.io',
      phone: '555-0203',
      title: 'Associate',
      account_id: accountMap['Merovingian Exchange'],
      company: 'Merovingian Exchange',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Councillor Hamann',
      email: 'hamann@zion.io',
      phone: '555-0009',
      title: 'Council Member',
      account_id: accountMap['Zion Command'],
      company: 'Zion Command',
      status: 'active'
    }
  ]);

  // === LEADS (Potential Recruits) ===
  results.leads = await safeInsert('leads', [
    {
      org_id: orgId,
      name: 'Thomas A. Anderson',
      email: 'tanderson@metacortex.com',
      company: 'MetaCortex',
      phone: '555-1001',
      status: 'new',
      source: 'Oracle Referral',
      score: 85,
      estimated_value: 50000,
      notes: 'High potential, shows signs of awakening'
    },
    {
      org_id: orgId,
      name: 'Switch',
      email: 'switch@resistance.net',
      company: 'Independent',
      phone: '555-1002',
      status: 'contacted',
      source: 'Resistance Network',
      score: 70,
      estimated_value: 30000,
      notes: 'Skilled hacker, good infiltration skills'
    },
    {
      org_id: orgId,
      name: 'Apoc',
      email: 'apoc@resistance.net',
      company: 'Independent',
      phone: '555-1003',
      status: 'qualified',
      source: 'Resistance Network',
      score: 75,
      estimated_value: 35000,
      notes: 'Technical expertise in systems'
    },
    {
      org_id: orgId,
      name: 'Mouse',
      email: 'mouse@resistance.net',
      company: 'Independent',
      phone: '555-1004',
      status: 'qualified',
      source: 'Zion Database',
      score: 60,
      estimated_value: 25000,
      notes: 'Young but talented programmer'
    },
    {
      org_id: orgId,
      name: 'Potential Recruit #5',
      email: 'recruit5@matrix.com',
      company: 'Unknown',
      phone: '555-1005',
      status: 'new',
      source: 'Anomaly Detection',
      score: 65,
      estimated_value: 40000,
      notes: 'Under observation, shows promise'
    }
  ]);

  // === DEALS (Operations) ===
  results.deals = await safeInsert('deals', [
    {
      org_id: orgId,
      name: 'Operation Exodus',
      amount: 500000,
      stage: 'negotiation',
      probability: 75,
      account_id: accountMap['Zion Command'],
      notes: 'Mass evacuation planning',
      expected_close_date: '2026-03-15'
    },
    {
      org_id: orgId,
      name: 'Source Code Recovery',
      amount: 750000,
      stage: 'proposal',
      probability: 60,
      account_id: accountMap['Oracle Services'],
      notes: 'Retrieve critical system access codes',
      expected_close_date: '2026-04-01'
    },
    {
      org_id: orgId,
      name: 'Sentinel Defense System',
      amount: 300000,
      stage: 'qualification',
      probability: 40,
      account_id: accountMap['Zion Command'],
      notes: 'EMP weapon upgrades',
      expected_close_date: '2026-05-20'
    }
  ]);

  // === TASKS (Mission Objectives) ===
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  results.tasks = await safeInsert('tasks', [
    {
      org_id: orgId,
      title: 'Learn Kung Fu',
      description: 'Upload combat training programs',
      status: 'completed',
      priority: 'high',
      due_date: dueDate,
      completed: true
    },
    {
      org_id: orgId,
      title: 'Dodge Bullets',
      description: 'Master bullet-time perception',
      status: 'completed',
      priority: 'high',
      due_date: dueDate,
      completed: true
    },
    {
      org_id: orgId,
      title: 'Free Minds from Matrix',
      description: 'Locate and extract potential recruits',
      status: 'pending',
      priority: 'critical',
      due_date: dueDate,
      completed: false
    },
    {
      org_id: orgId,
      title: 'Investigate Anomaly',
      description: 'Track unusual system behavior',
      status: 'pending',
      priority: 'medium',
      due_date: dueDate,
      completed: false
    },
    {
      org_id: orgId,
      title: 'Meet with Oracle',
      description: 'Consultation scheduled',
      status: 'pending',
      priority: 'high',
      due_date: dueDate,
      completed: false
    },
    {
      org_id: orgId,
      title: 'Repair EMP Device',
      description: 'Nebuchadnezzar maintenance',
      status: 'in_progress',
      priority: 'high',
      due_date: dueDate,
      completed: false
    },
    {
      org_id: orgId,
      title: 'Decode Prophecy',
      description: 'Analyze Oracle predictions',
      status: 'pending',
      priority: 'medium',
      due_date: dueDate,
      completed: false
    },
    {
      org_id: orgId,
      title: 'Training Simulation',
      description: 'Combat scenarios in construct',
      status: 'pending',
      priority: 'low',
      due_date: dueDate,
      completed: false
    }
  ]);

  // === CAMPAIGNS ===
  results.campaigns = await safeInsert('campaigns', [
    {
      org_id: orgId,
      name: 'Wake Up Campaign',
      type: 'Email',
      status: 'Active',
      start_date: '2026-01-01',
      budget: 50000,
      spent: 35000,
      revenue: 125000,
      revenue_generated: 125000,
      leads_generated: 12,
      target_audience: 'Potential Bluepills',
      description: 'Email campaign targeting high-awareness candidates'
    },
    {
      org_id: orgId,
      name: 'Red Pill Distribution',
      type: 'Referral',
      status: 'Active',
      start_date: '2026-01-15',
      budget: 30000,
      spent: 18000,
      revenue: 85000,
      revenue_generated: 85000,
      leads_generated: 8,
      target_audience: 'High-Score Leads',
      description: 'Referral program for red pill distribution'
    },
    {
      org_id: orgId,
      name: 'Resistance Recruitment Drive',
      type: 'Event',
      status: 'Planning',
      start_date: '2026-03-01',
      budget: 75000,
      spent: 0,
      revenue: 0,
      revenue_generated: 0,
      leads_generated: 0,
      target_audience: 'Awakened Individuals',
      description: 'Major recruitment event for freed minds'
    }
  ]);

  // === TICKETS (Glitches) ===
  results.tickets = await safeInsert('tickets', [
    {
      org_id: orgId,
      subject: 'Déjà Vu Glitch',
      description: 'User experiencing repeated events',
      priority: 'high',
      status: 'open',
      ticket_number: 'TKT-2026-0001'
    },
    {
      org_id: orgId,
      subject: 'Agent Smith Replication Bug',
      description: 'Uncontrolled multiplication detected',
      priority: 'critical',
      status: 'open',
      ticket_number: 'TKT-2026-0002'
    },
    {
      org_id: orgId,
      subject: 'Phone Line Disconnection',
      description: 'Lost connection during extraction',
      priority: 'high',
      status: 'resolved',
      ticket_number: 'TKT-2026-0003'
    }
  ]);

  // === PRODUCTS (Matrix Tech) ===
  results.products = await safeInsert('products', [
    {
      org_id: orgId,
      name: 'Red Pill',
      sku: 'PILL-RED',
      description: 'Wake up to reality. No going back.',
      unit_price: 999999,
      category: 'Awakening',
      tax_rate: 0,
      is_active: true,
      stock_level: 100
    },
    {
      org_id: orgId,
      name: 'Blue Pill',
      sku: 'PILL-BLUE',
      description: 'Stay in Wonderland. Story ends.',
      unit_price: 0,
      category: 'Comfort',
      tax_rate: 0,
      is_active: true,
      stock_level: 999
    },
    {
      org_id: orgId,
      name: 'Construct Program',
      sku: 'PROG-CON',
      description: 'Loading program for combat training.',
      unit_price: 50000,
      category: 'Training',
      tax_rate: 10,
      is_active: true,
      stock_level: 50
    },
    {
      org_id: orgId,
      name: 'Hardline Phone',
      sku: 'HARD-PHONE',
      description: 'Exit point connection device.',
      unit_price: 15000,
      category: 'Equipment',
      tax_rate: 10,
      is_active: true,
      stock_level: 25
    },
    {
      org_id: orgId,
      name: 'EMP Device',
      sku: 'WEAP-EMP',
      description: 'Electromagnetic pulse weapon for Sentinel defense.',
      unit_price: 250000,
      category: 'Defense',
      tax_rate: 10,
      is_active: true,
      stock_level: 10
    },
    {
      org_id: orgId,
      name: 'Neural Interface',
      sku: 'PLUG-NEUR',
      description: 'Direct brain-computer connection port.',
      unit_price: 75000,
      category: 'Hardware',
      tax_rate: 10,
      is_active: true,
      stock_level: 30
    },
    {
      org_id: orgId,
      name: 'Hoverpod',
      sku: 'POD-001',
      description: 'Single-person transport vehicle.',
      unit_price: 85000,
      category: 'Transport',
      tax_rate: 10,
      is_active: true,
      stock_level: 15
    },
    {
      org_id: orgId,
      name: 'Combat Simulation',
      sku: 'SIM-COMBAT',
      description: 'Virtual reality combat training environment.',
      unit_price: 35000,
      category: 'Training',
      tax_rate: 10,
      is_active: true,
      stock_level: 40
    },
    {
      org_id: orgId,
      name: 'Sentinel Tracker',
      sku: 'TRACK-SEN',
      description: 'Real-time Sentinel detection system.',
      unit_price: 45000,
      category: 'Equipment',
      tax_rate: 10,
      is_active: true,
      stock_level: 20
    },
    {
      org_id: orgId,
      name: 'Matrix Code Scanner',
      sku: 'SCAN-CODE',
      description: 'Decode and analyze Matrix code streams.',
      unit_price: 60000,
      category: 'Equipment',
      tax_rate: 10,
      is_active: true,
      stock_level: 25
    }
  ]);

  // === SERVICES (Zion Services) ===
  results.services = await safeInsert('services', [
    {
      org_id: orgId,
      name: 'Operator Support',
      code: 'SVC-OPR',
      description: 'Real-time Matrix navigation and exit coordination.',
      unit_price: 8000,
      billing_cycle: 'monthly',
      tax_rate: 10,
      is_active: true
    },
    {
      org_id: orgId,
      name: 'Combat Training Upload',
      code: 'SVC-TRN',
      description: 'Kung Fu, weapons, piloting - instant knowledge transfer.',
      unit_price: 25000,
      billing_cycle: 'one-off',
      tax_rate: 10,
      is_active: true,
      duration_hours: 10
    },
    {
      org_id: orgId,
      name: 'Sentinel Watch',
      code: 'SVC-SEN',
      description: 'Early warning system for machine attacks.',
      unit_price: 120000,
      billing_cycle: 'yearly',
      tax_rate: 0,
      is_active: true
    },
    {
      org_id: orgId,
      name: 'Hovercraft Maintenance',
      code: 'SVC-HOV',
      description: 'Full ship systems diagnostic and repair.',
      unit_price: 15000,
      billing_cycle: 'monthly',
      tax_rate: 10,
      is_active: true
    },
    {
      org_id: orgId,
      name: 'Oracle Consultation',
      code: 'SVC-ORC',
      description: 'Prophetic guidance and future insight.',
      unit_price: 50000,
      billing_cycle: 'one-off',
      tax_rate: 0,
      is_active: true
    },
    {
      org_id: orgId,
      name: 'Construct Access',
      code: 'SVC-CON',
      description: '24/7 access to training construct environments.',
      unit_price: 10000,
      billing_cycle: 'monthly',
      tax_rate: 10,
      is_active: true
    },
    {
      org_id: orgId,
      name: 'Emergency Extraction',
      code: 'SVC-EXT',
      description: 'Rapid extraction service from Matrix with armed support.',
      unit_price: 100000,
      billing_cycle: 'one-off',
      tax_rate: 10,
      is_active: true
    },
    {
      org_id: orgId,
      name: 'Code Analysis',
      code: 'SVC-CODE',
      description: 'Deep dive Matrix code pattern analysis and decryption.',
      unit_price: 30000,
      billing_cycle: 'monthly',
      tax_rate: 10,
      is_active: true
    },
    {
      org_id: orgId,
      name: 'Zion Dock Space',
      code: 'SVC-DOCK',
      description: 'Secure docking bay rental at Zion.',
      unit_price: 5000,
      billing_cycle: 'monthly',
      tax_rate: 0,
      is_active: true
    },
    {
      org_id: orgId,
      name: 'Weapons Training',
      code: 'SVC-WEAP',
      description: 'Advanced firearms and explosives training.',
      unit_price: 18000,
      billing_cycle: 'one-off',
      tax_rate: 10,
      is_active: true,
      duration_hours: 20
    }
  ]);

  // === CALENDAR EVENTS ===
  results.calendar_events = await safeInsert('calendar_events', [
    {
      org_id: orgId,
      title: 'Council Meeting',
      type: 'Meeting',
      start_time: '2026-02-10T10:00:00Z',
      end_time: '2026-02-10T12:00:00Z',
      location: 'Zion Council Chambers',
      description: 'Strategic planning session',
      is_all_day: false
    },
    {
      org_id: orgId,
      title: 'Combat Training',
      type: 'Internal',
      start_time: '2026-02-11T14:00:00Z',
      end_time: '2026-02-11T16:00:00Z',
      location: 'Training Construct',
      description: 'Advanced martial arts simulation',
      is_all_day: false
    },
    {
      org_id: orgId,
      title: 'Oracle Consultation',
      type: 'Meeting',
      start_time: '2026-02-15T09:00:00Z',
      end_time: '2026-02-15T10:00:00Z',
      location: "Oracle's Apartment",
      description: 'Prophecy interpretation',
      is_all_day: false
    }
  ]);

  // Calculate totals
  Object.values(results).forEach(result => {
    if (result.success) totalRows += result.count;
  });

  console.log('\n\n📊 SUMMARY:\n');
  console.log(`✅ accounts                  - ${results.accounts.count} rows`);
  console.log(`✅ contacts                  - ${results.contacts.count} rows`);
  console.log(`✅ leads                     - ${results.leads.count} rows`);
  console.log(`✅ deals                     - ${results.deals.count} rows`);
  console.log(`✅ tasks                     - ${results.tasks.count} rows`);
  console.log(`✅ campaigns                 - ${results.campaigns.count} rows`);
  console.log(`✅ tickets                   - ${results.tickets.count} rows`);
  console.log(`✅ products                  - ${results.products.count} rows`);
  console.log(`✅ services                  - ${results.services.count} rows`);
  console.log(`✅ calendar_events           - ${results.calendar_events.count} rows`);

  console.log(`\n🎉 Total: ${totalRows} rows inserted successfully!\n`);

  console.log('📋 Next Steps:');
  console.log('   1. Open browser: http://localhost:3002');
  console.log('   2. Navigate to Contacts to see Neo, Morpheus, Trinity');
  console.log('   3. Navigate to Accounts to see Nebuchadnezzar, Logos');
  console.log('   4. Check Products for Red Pill, Blue Pill');
  console.log('   5. Check Services for Operator Support, Combat Training\n');
}

main().catch(console.error);
