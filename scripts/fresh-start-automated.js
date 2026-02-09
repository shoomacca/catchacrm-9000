/**
 * Fresh Start - Automated Database Reset
 *
 * This script:
 * 1. Drops all existing tables
 * 2. Creates fresh schema from TypeScript types
 * 3. Loads Matrix mock data
 *
 * Total time: ~2 minutes (fully automated)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client with service role (admin privileges)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🎬 Fresh Start - Automated Database Reset\n');
console.log('This will:');
console.log('  1. Drop all existing tables');
console.log('  2. Create fresh schema from TypeScript types');
console.log('  3. Load Matrix mock data (69 rows)');
console.log('\n⚠️  WARNING: This will DELETE ALL DATA in your database!\n');

// Step 1: Drop all tables
async function dropAllTables() {
  console.log('📦 Step 1/3: Dropping all existing tables...');

  const dropSQL = fs.readFileSync(
    path.resolve(__dirname, '../supabase/00_drop_all_tables.sql'),
    'utf-8'
  );

  const { error } = await supabase.rpc('exec_sql', { sql: dropSQL });

  if (error) {
    // Try direct execution if RPC doesn't exist
    const { error: execError } = await supabase.from('_').select('*').limit(0);

    // Execute SQL in chunks to avoid RPC limitations
    const statements = dropSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.includes('DROP TABLE') || statement.includes('DROP TYPE')) {
        // These need to be executed via pg admin - use the SQL editor approach
        console.log('⚠️  Cannot drop tables via API - requires manual SQL execution');
        console.log('\nPlease run this SQL manually:');
        console.log('1. Go to: https://supabase.com/dashboard/project/anawatvgypmrpbmjfcht');
        console.log('2. Click SQL Editor → New Query');
        console.log('3. Copy/paste contents of: supabase/00_drop_all_tables.sql');
        console.log('4. Click RUN');
        console.log('\nThen run this script again.\n');
        process.exit(1);
      }
    }
  }

  console.log('✅ All tables dropped\n');
}

// Step 2: Create fresh schema
async function createFreshSchema() {
  console.log('🏗️  Step 2/3: Creating fresh schema...');

  const schemaSQL = fs.readFileSync(
    path.resolve(__dirname, '../supabase/schema_from_frontend.sql'),
    'utf-8'
  );

  // Split into chunks to avoid size limitations
  const statements = schemaSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`   Executing ${statements.length} SQL statements...`);

  // Note: Supabase JS client doesn't support raw SQL execution
  // We need to use the SQL editor or Supabase CLI
  console.log('⚠️  Cannot create schema via API - requires manual SQL execution');
  console.log('\nPlease run this SQL manually:');
  console.log('1. Go to: https://supabase.com/dashboard/project/anawatvgypmrpbmjfcht');
  console.log('2. Click SQL Editor → New Query');
  console.log('3. Copy/paste contents of: supabase/schema_from_frontend.sql');
  console.log('4. Click RUN');
  console.log('\nThen run this script again with --skip-schema flag.\n');
  process.exit(1);
}

// Step 3: Load Matrix data
async function loadMatrixData() {
  console.log('🎭 Step 3/3: Loading Matrix mock data...\n');

  const orgId = '00000000-0000-0000-0000-000000000001';
  const userId = '00000000-0000-0000-0000-000000000001';

  let totalInserted = 0;
  const results = {};

  // Helper function for safe inserts
  async function safeInsert(table, data) {
    const { data: inserted, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) {
      console.log(`   ❌ ${table}: ${error.message}`);
      return [];
    }

    console.log(`   ✅ ${table.padEnd(25)} - ${data.length} rows`);
    totalInserted += data.length;
    return inserted || [];
  }

  // Accounts
  const accounts = await safeInsert('accounts', [
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
      industry: 'Hovercraft Operations',
      type: 'customer',
      status: 'active',
      email: 'logos@zion.io',
      phone: '555-2002',
      employee_count: 7,
      tier: 'Tier A'
    },
    {
      org_id: orgId,
      name: 'Zion Command',
      industry: 'Military Command',
      type: 'customer',
      status: 'active',
      email: 'command@zion.io',
      phone: '555-3000',
      employee_count: 250,
      tier: 'Tier S'
    },
    {
      org_id: orgId,
      name: 'The Osiris',
      industry: 'Deep Reconnaissance',
      type: 'customer',
      status: 'active',
      email: 'osiris@zion.io',
      phone: '555-2003',
      employee_count: 8,
      tier: 'Tier A'
    },
    {
      org_id: orgId,
      name: 'The Vigilant',
      industry: 'Defense',
      type: 'prospect',
      status: 'active',
      email: 'vigilant@zion.io',
      phone: '555-2004',
      employee_count: 10,
      tier: 'Tier B'
    },
    {
      org_id: orgId,
      name: 'The Hammer',
      industry: 'Assault Operations',
      type: 'customer',
      status: 'active',
      email: 'hammer@zion.io',
      phone: '555-2005',
      employee_count: 12,
      tier: 'Tier A'
    },
    {
      org_id: orgId,
      name: 'The Oracle\'s Apartment',
      industry: 'Intelligence',
      type: 'partner',
      status: 'active',
      email: 'oracle@matrix.io',
      phone: '555-4000',
      employee_count: 2,
      tier: 'Tier S'
    },
    {
      org_id: orgId,
      name: 'Metacortex',
      industry: 'Software Development',
      type: 'lead',
      status: 'active',
      email: 'info@metacortex.com',
      phone: '555-1999',
      website: 'metacortex.com',
      employee_count: 5000,
      tier: 'Tier C'
    },
    {
      org_id: orgId,
      name: 'The Merovingian Club',
      industry: 'Information Brokerage',
      type: 'competitor',
      status: 'active',
      email: 'merovingian@matrix.io',
      phone: '555-5000',
      employee_count: 50,
      tier: 'Tier B'
    },
    {
      org_id: orgId,
      name: 'Zion Engineering',
      industry: 'Manufacturing',
      type: 'customer',
      status: 'active',
      email: 'engineering@zion.io',
      phone: '555-3001',
      employee_count: 120,
      tier: 'Tier A'
    }
  ]);

  results.accounts = accounts;

  // Create account map for foreign keys
  const accountMap = {};
  accounts.forEach(acc => {
    accountMap[acc.name] = acc.id;
  });

  // Contacts
  const contacts = await safeInsert('contacts', [
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
      name: 'Agent Smith',
      email: 'smith@matrix.io',
      phone: '555-9999',
      title: 'Senior Agent',
      account_id: accountMap['Metacortex'],
      company: 'Metacortex',
      status: 'inactive'
    },
    {
      org_id: orgId,
      name: 'The Oracle',
      email: 'oracle@matrix.io',
      phone: '555-4000',
      title: 'Prophet',
      account_id: accountMap["The Oracle's Apartment"],
      company: "The Oracle's Apartment",
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Cypher',
      email: 'cypher@zion.io',
      phone: '555-0004',
      title: 'Operator',
      account_id: accountMap['Nebuchadnezzar'],
      company: 'Nebuchadnezzar',
      status: 'inactive'
    },
    {
      org_id: orgId,
      name: 'Tank',
      email: 'tank@zion.io',
      phone: '555-0005',
      title: 'Operator',
      account_id: accountMap['Nebuchadnezzar'],
      company: 'Nebuchadnezzar',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Dozer',
      email: 'dozer@zion.io',
      phone: '555-0006',
      title: 'Pilot',
      account_id: accountMap['Nebuchadnezzar'],
      company: 'Nebuchadnezzar',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Apoc',
      email: 'apoc@zion.io',
      phone: '555-0007',
      title: 'Crew Member',
      account_id: accountMap['Nebuchadnezzar'],
      company: 'Nebuchadnezzar',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Switch',
      email: 'switch@zion.io',
      phone: '555-0008',
      title: 'Crew Member',
      account_id: accountMap['Nebuchadnezzar'],
      company: 'Nebuchadnezzar',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Mouse',
      email: 'mouse@zion.io',
      phone: '555-0009',
      title: 'Programmer',
      account_id: accountMap['Nebuchadnezzar'],
      company: 'Nebuchadnezzar',
      status: 'deceased'
    },
    {
      org_id: orgId,
      name: 'Niobe',
      email: 'niobe@zion.io',
      phone: '555-0010',
      title: 'Captain',
      account_id: accountMap['Logos'],
      company: 'Logos',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Commander Lock',
      email: 'lock@zion.io',
      phone: '555-3000',
      title: 'Commander',
      account_id: accountMap['Zion Command'],
      company: 'Zion Command',
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'The Architect',
      email: 'architect@matrix.io',
      phone: '555-0000',
      title: 'System Designer',
      account_id: accountMap['Metacortex'],
      company: 'Metacortex',
      status: 'active'
    }
  ]);

  results.contacts = contacts;

  // Leads
  const leads = await safeInsert('leads', [
    {
      org_id: orgId,
      name: 'Potential Recruit Alpha',
      email: 'alpha@matrix.io',
      phone: '555-1001',
      status: 'new',
      source: 'Referral',
      score: 85,
      company: 'Unknown',
      title: 'Software Engineer'
    },
    {
      org_id: orgId,
      name: 'Potential Recruit Beta',
      email: 'beta@matrix.io',
      phone: '555-1002',
      status: 'contacted',
      source: 'Surveillance',
      score: 70,
      company: 'Tech Corp',
      title: 'Data Analyst'
    },
    {
      org_id: orgId,
      name: 'Potential Recruit Gamma',
      email: 'gamma@matrix.io',
      phone: '555-1003',
      status: 'qualified',
      source: 'Oracle Recommendation',
      score: 95,
      company: 'Innovate Inc',
      title: 'System Administrator'
    },
    {
      org_id: orgId,
      name: 'Potential Recruit Delta',
      email: 'delta@matrix.io',
      phone: '555-1004',
      status: 'new',
      source: 'Web Search',
      score: 60,
      company: 'Startup Co',
      title: 'Developer'
    },
    {
      org_id: orgId,
      name: 'Potential Recruit Epsilon',
      email: 'epsilon@matrix.io',
      phone: '555-1005',
      status: 'nurturing',
      source: 'Event',
      score: 75,
      company: 'Enterprise Ltd',
      title: 'Network Engineer'
    }
  ]);

  results.leads = leads;

  // Deals
  const deals = await safeInsert('deals', [
    {
      org_id: orgId,
      name: 'Hovercraft Upgrade Package',
      account_id: accountMap['Nebuchadnezzar'],
      value: 50000,
      stage: 'proposal',
      probability: 75,
      expected_close_date: new Date('2026-03-15').toISOString(),
      created_by: userId
    },
    {
      org_id: orgId,
      name: 'EMP Device Procurement',
      account_id: accountMap['The Hammer'],
      value: 120000,
      stage: 'negotiation',
      probability: 60,
      expected_close_date: new Date('2026-04-01').toISOString(),
      created_by: userId
    },
    {
      org_id: orgId,
      name: 'Training Simulation License',
      account_id: accountMap['Zion Command'],
      value: 200000,
      stage: 'closed_won',
      probability: 100,
      expected_close_date: new Date('2026-02-01').toISOString(),
      created_by: userId
    }
  ]);

  results.deals = deals;

  // Tasks
  const tasks = await safeInsert('tasks', [
    {
      org_id: orgId,
      title: 'Follow up with Neo on training progress',
      description: 'Check if he can dodge bullets yet',
      due_date: new Date('2026-02-15').toISOString(),
      priority: 'high',
      status: 'pending',
      assigned_to: userId,
      created_by: userId
    },
    {
      org_id: orgId,
      title: 'Review Oracle\'s latest prophecy',
      description: 'Analyze implications for Zion defense',
      due_date: new Date('2026-02-10').toISOString(),
      priority: 'critical',
      status: 'in_progress',
      assigned_to: userId,
      created_by: userId
    },
    {
      org_id: orgId,
      title: 'Upgrade Nebuchadnezzar EMP system',
      description: 'Install new capacitors',
      due_date: new Date('2026-03-01').toISOString(),
      priority: 'medium',
      status: 'pending',
      assigned_to: userId,
      created_by: userId
    },
    {
      org_id: orgId,
      title: 'Investigate Agent Smith anomaly',
      description: 'Replication behavior is concerning',
      due_date: new Date('2026-02-20').toISOString(),
      priority: 'critical',
      status: 'pending',
      assigned_to: userId,
      created_by: userId
    },
    {
      org_id: orgId,
      title: 'Schedule training session with Morpheus',
      description: 'Combat training in dojo construct',
      due_date: new Date('2026-02-12').toISOString(),
      priority: 'medium',
      status: 'completed',
      assigned_to: userId,
      created_by: userId
    },
    {
      org_id: orgId,
      title: 'Repair Logos hover pads',
      description: 'Niobe reported instability',
      due_date: new Date('2026-02-25').toISOString(),
      priority: 'high',
      status: 'in_progress',
      assigned_to: userId,
      created_by: userId
    },
    {
      org_id: orgId,
      title: 'Update Zion defense protocols',
      description: 'Incorporate lessons from last sentinel attack',
      due_date: new Date('2026-03-10').toISOString(),
      priority: 'high',
      status: 'pending',
      assigned_to: userId,
      created_by: userId
    },
    {
      org_id: orgId,
      title: 'Debrief Tank on operator procedures',
      description: 'Document best practices',
      due_date: new Date('2026-02-18').toISOString(),
      priority: 'low',
      status: 'pending',
      assigned_to: userId,
      created_by: userId
    }
  ]);

  results.tasks = tasks;

  // Campaigns
  const campaigns = await safeInsert('campaigns', [
    {
      org_id: orgId,
      name: 'Resistance Recruitment Drive 2026',
      description: 'Identify and recruit new redpill candidates',
      type: 'email',
      status: 'active',
      start_date: new Date('2026-01-01').toISOString(),
      end_date: new Date('2026-06-30').toISOString(),
      budget: 10000,
      created_by: userId
    },
    {
      org_id: orgId,
      name: 'Hovercraft Maintenance Awareness',
      description: 'Educate crews on preventive maintenance',
      type: 'event',
      status: 'active',
      start_date: new Date('2026-02-01').toISOString(),
      end_date: new Date('2026-02-28').toISOString(),
      budget: 5000,
      created_by: userId
    },
    {
      org_id: orgId,
      name: 'Matrix Threat Intelligence',
      description: 'Share agent behavior patterns across ships',
      type: 'webinar',
      status: 'completed',
      start_date: new Date('2026-01-15').toISOString(),
      end_date: new Date('2026-01-31').toISOString(),
      budget: 2000,
      created_by: userId
    }
  ]);

  results.campaigns = campaigns;

  // Tickets
  const tickets = await safeInsert('tickets', [
    {
      org_id: orgId,
      title: 'Construct loading failure',
      description: 'Jump program not loading correctly',
      priority: 'high',
      status: 'open',
      category: 'technical',
      created_by: userId
    },
    {
      org_id: orgId,
      title: 'Request for combat training session',
      description: 'Need access to dojo construct',
      priority: 'medium',
      status: 'in_progress',
      category: 'request',
      created_by: userId
    },
    {
      org_id: orgId,
      title: 'Operator phone line static',
      description: 'Interference during last jack-in',
      priority: 'low',
      status: 'resolved',
      category: 'technical',
      created_by: userId
    }
  ]);

  results.tickets = tickets;

  // Products
  const products = await safeInsert('products', [
    {
      org_id: orgId,
      name: 'Red Pill',
      sku: 'PILL-RED-001',
      description: 'Shows you how deep the rabbit hole goes',
      category: 'Pharmaceuticals',
      price: 0,
      cost: 0,
      unit_of_measure: 'pill',
      stock_quantity: 50,
      reorder_point: 10,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Blue Pill',
      sku: 'PILL-BLUE-001',
      description: 'The story ends, you wake up and believe whatever you want',
      category: 'Pharmaceuticals',
      price: 0,
      cost: 0,
      unit_of_measure: 'pill',
      stock_quantity: 100,
      reorder_point: 20,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'EMP Device',
      sku: 'EMP-STANDARD-001',
      description: 'Electromagnetic pulse generator for sentinel defense',
      category: 'Defense Equipment',
      price: 50000,
      cost: 30000,
      unit_of_measure: 'unit',
      stock_quantity: 5,
      reorder_point: 2,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Hovercraft Hover Pad',
      sku: 'HOVER-PAD-001',
      description: 'Electromagnetic levitation component',
      category: 'Hovercraft Parts',
      price: 15000,
      cost: 8000,
      unit_of_measure: 'unit',
      stock_quantity: 8,
      reorder_point: 3,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Neural Interface Cable',
      sku: 'CABLE-NEURAL-001',
      description: 'High-bandwidth connection for Matrix jack-in',
      category: 'Interface Equipment',
      price: 2000,
      cost: 800,
      unit_of_measure: 'unit',
      stock_quantity: 25,
      reorder_point: 10,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Construct Loading Program',
      sku: 'SOFT-CONSTRUCT-001',
      description: 'Software for loading training constructs',
      category: 'Software',
      price: 5000,
      cost: 100,
      unit_of_measure: 'license',
      stock_quantity: 999,
      reorder_point: 0,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Sentinel Detection System',
      sku: 'DEFENSE-SENTINEL-001',
      description: 'Early warning system for sentinel presence',
      category: 'Defense Equipment',
      price: 25000,
      cost: 15000,
      unit_of_measure: 'unit',
      stock_quantity: 12,
      reorder_point: 5,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Zion Rations - Protein',
      sku: 'FOOD-PROTEIN-001',
      description: 'Single cell protein sustenance',
      category: 'Food',
      price: 10,
      cost: 5,
      unit_of_measure: 'bowl',
      stock_quantity: 5000,
      reorder_point: 1000,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Operator Console Upgrade Kit',
      sku: 'HARDWARE-CONSOLE-001',
      description: 'Enhanced displays and controls for operators',
      category: 'Hardware',
      price: 8000,
      cost: 4000,
      unit_of_measure: 'kit',
      stock_quantity: 6,
      reorder_point: 2,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Training Simulation License',
      sku: 'SOFT-TRAINING-001',
      description: 'Access to combat and skill training programs',
      category: 'Software',
      price: 3000,
      cost: 200,
      unit_of_measure: 'license',
      stock_quantity: 999,
      reorder_point: 0,
      status: 'active'
    }
  ]);

  results.products = products;

  // Services
  const services = await safeInsert('services', [
    {
      org_id: orgId,
      name: 'Operator Support - Standard',
      description: 'Real-time operator assistance during Matrix operations',
      category: 'Operations',
      default_price: 100,
      default_cost: 50,
      billing_type: 'hourly',
      duration_minutes: 60,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Combat Training - Basic',
      description: 'Fundamental combat skills in training construct',
      category: 'Training',
      default_price: 500,
      default_cost: 200,
      billing_type: 'fixed',
      duration_minutes: 240,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Combat Training - Advanced',
      description: 'Advanced techniques with Morpheus',
      category: 'Training',
      default_price: 1500,
      default_cost: 600,
      billing_type: 'fixed',
      duration_minutes: 480,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Hovercraft Maintenance - Routine',
      description: 'Regular maintenance and system checks',
      category: 'Maintenance',
      default_price: 2000,
      default_cost: 1000,
      billing_type: 'fixed',
      duration_minutes: 480,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Hovercraft Repair - Emergency',
      description: 'Critical repairs for damaged systems',
      category: 'Maintenance',
      default_price: 5000,
      default_cost: 2500,
      billing_type: 'hourly',
      duration_minutes: 120,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Oracle Consultation',
      description: 'Prophetic guidance and strategic advice',
      category: 'Consulting',
      default_price: 0,
      default_cost: 0,
      billing_type: 'fixed',
      duration_minutes: 30,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Construct Development',
      description: 'Custom training environment creation',
      category: 'Development',
      default_price: 3000,
      default_cost: 1200,
      billing_type: 'fixed',
      duration_minutes: 960,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Intelligence Briefing',
      description: 'Matrix threat analysis and strategic intelligence',
      category: 'Intelligence',
      default_price: 800,
      default_cost: 300,
      billing_type: 'fixed',
      duration_minutes: 120,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Neural Interface Calibration',
      description: 'Optimize jack-in connection quality',
      category: 'Technical',
      default_price: 300,
      default_cost: 100,
      billing_type: 'fixed',
      duration_minutes: 60,
      status: 'active'
    },
    {
      org_id: orgId,
      name: 'Sentinel Evasion Training',
      description: 'Tactics for avoiding and escaping sentinels',
      category: 'Training',
      default_price: 1000,
      default_cost: 400,
      billing_type: 'fixed',
      duration_minutes: 360,
      status: 'active'
    }
  ]);

  results.services = services;

  // Calendar Events
  const calendarEvents = await safeInsert('calendar_events', [
    {
      org_id: orgId,
      title: 'Zion Council Meeting',
      description: 'Quarterly strategic planning',
      start_time: new Date('2026-02-15T10:00:00Z').toISOString(),
      end_time: new Date('2026-02-15T12:00:00Z').toISOString(),
      location: 'Zion Command Center',
      event_type: 'meeting',
      attendees: [userId],
      created_by: userId
    },
    {
      org_id: orgId,
      title: 'Dojo Training - Neo',
      description: 'Advanced combat techniques',
      start_time: new Date('2026-02-16T14:00:00Z').toISOString(),
      end_time: new Date('2026-02-16T18:00:00Z').toISOString(),
      location: 'Training Construct',
      event_type: 'task',
      attendees: [userId],
      created_by: userId
    },
    {
      org_id: orgId,
      title: 'Hovercraft Captains Briefing',
      description: 'Intelligence update on sentinel movements',
      start_time: new Date('2026-02-20T09:00:00Z').toISOString(),
      end_time: new Date('2026-02-20T10:30:00Z').toISOString(),
      location: 'Zion Briefing Room',
      event_type: 'meeting',
      attendees: [userId],
      created_by: userId
    }
  ]);

  results.calendar_events = calendarEvents;

  console.log(`\n🎉 Total: ${totalInserted} rows inserted successfully!\n`);

  return results;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const skipSchema = args.includes('--skip-schema');

  try {
    if (!skipSchema) {
      console.log('\n⚠️  This script requires manual SQL execution in Supabase Dashboard\n');
      console.log('Please follow these steps:\n');
      console.log('STEP 1: Drop All Tables');
      console.log('  1. Go to: https://supabase.com/dashboard/project/anawatvgypmrpbmjfcht');
      console.log('  2. Click SQL Editor → New Query');
      console.log('  3. Copy/paste: supabase/00_drop_all_tables.sql');
      console.log('  4. Click RUN\n');

      console.log('STEP 2: Create Fresh Schema');
      console.log('  1. Click New Query');
      console.log('  2. Copy/paste: supabase/schema_from_frontend.sql');
      console.log('  3. Click RUN\n');

      console.log('STEP 3: Load Matrix Data');
      console.log('  Run: node scripts/fresh-start-automated.js --skip-schema\n');

      console.log('────────────────────────────────────────────────\n');
      process.exit(0);
    }

    // Only load data if --skip-schema flag is present
    await loadMatrixData();

    console.log('✅ Fresh start complete!\n');
    console.log('Next steps:');
    console.log('  1. Start dev server: npm run dev');
    console.log('  2. Open: http://localhost:3002');
    console.log('  3. Check Contacts → See Neo, Morpheus, Trinity');
    console.log('  4. Check Accounts → See Nebuchadnezzar, Logos\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
