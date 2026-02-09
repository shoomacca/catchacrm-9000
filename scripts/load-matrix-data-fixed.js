#!/usr/bin/env node

/**
 * Load Matrix Mock Data - FIXED VERSION
 * Matches actual database columns
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

console.log('\n🎬 Matrix Data Loader (FIXED)\n');

async function getOrgId() {
  const { data } = await supabase.from('organizations').select('id').limit(1).single();
  return data?.id || '00000000-0000-0000-0000-000000000001';
}

async function getFirstUserId() {
  // Get or create a default user
  const { data: existing } = await supabase.from('users').select('id').limit(1).single();
  if (existing) return existing.id;

  // Create default user
  const orgId = await getOrgId();
  const { data: newUser } = await supabase.from('users').insert({
    org_id: orgId,
    name: 'System Admin',
    email: 'admin@zion.io',
    role: 'admin'
  }).select('id').single();

  return newUser?.id || '00000000-0000-0000-0000-000000000002';
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

async function loadData() {
  const orgId = await getOrgId();
  const userId = await getFirstUserId();
  const results = {};

  console.log(`📌 Organization ID: ${orgId}`);
  console.log(`👤 User ID: ${userId}\n`);

  // === ACCOUNTS ===
  const accountsResult = await safeInsert('accounts', [
    {
      org_id: orgId,
      name: 'Nebuchadnezzar',
      industry: 'Hovercraft Operations',
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
      name: 'MetaCortex',
      industry: 'Software',
      type: 'lead',
      status: 'active',
      email: 'info@metacortex.com',
      phone: '555-1999',
      website: 'metacortex.com',
      employee_count: 5000,
      tier: 'Tier C'
    }
  ]);

  // Get account IDs
  const { data: accounts } = await supabase.from('accounts').select('id, name').eq('org_id', orgId);
  const accountMap = {};
  if (accounts) {
    accounts.forEach(acc => {
      accountMap[acc.name] = acc.id;
    });
  }

  // === CONTACTS ===
  const contactsResult = await safeInsert('contacts', [
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
    }
  ]);

  // Get contact IDs
  const { data: contacts } = await supabase.from('contacts').select('id, name').eq('org_id', orgId);
  const contactMap = {};
  if (contacts) {
    contacts.forEach(contact => {
      contactMap[contact.name] = contact.id;
    });
  }

  // === LEADS ===
  await safeInsert('leads', [
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
      notes: 'High potential candidate'
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
      estimated_value: 30000
    }
  ]);

  // === DEALS ===
  await safeInsert('deals', [
    {
      org_id: orgId,
      name: 'Operation Exodus',
      amount: 500000,
      stage: 'negotiation',
      probability: 75,
      account_id: accountMap['Zion Command'],
      contact_id: contactMap['Neo Anderson'],
      assignee_id: userId,
      expected_close_date: '2026-03-15'
    },
    {
      org_id: orgId,
      name: 'Source Code Recovery',
      amount: 750000,
      stage: 'proposal',
      probability: 60,
      account_id: accountMap['Oracle Services'],
      contact_id: contactMap['Morpheus'],
      assignee_id: userId,
      expected_close_date: '2026-04-01'
    }
  ]);

  // === TASKS ===
  await safeInsert('tasks', [
    {
      org_id: orgId,
      title: 'Learn Kung Fu',
      description: 'Upload combat training programs',
      status: 'completed',
      priority: 'high',
      assignee_id: userId,
      related_to_id: accountMap['Zion Command'],
      related_to_type: 'accounts',
      due_date: '2026-03-01',
      completed: true
    },
    {
      org_id: orgId,
      title: 'Free Minds from Matrix',
      description: 'Locate and extract potential recruits',
      status: 'pending',
      priority: 'critical',
      assignee_id: userId,
      related_to_id: accountMap['Zion Command'],
      related_to_type: 'accounts',
      due_date: '2026-04-01',
      completed: false
    }
  ]);

  // === CAMPAIGNS ===
  await safeInsert('campaigns', [
    {
      org_id: orgId,
      name: 'Resistance Recruitment 2026',
      type: 'Referral',
      budget: 100000,
      start_date: '2026-01-01',
      end_date: '2026-12-31'
    },
    {
      org_id: orgId,
      name: 'Matrix Awareness Campaign',
      type: 'Event',
      budget: 50000,
      start_date: '2026-02-01',
      end_date: '2026-06-30'
    }
  ]);

  // === TICKETS ===
  await safeInsert('tickets', [
    {
      org_id: orgId,
      ticket_number: 'TKT-2026-0001',
      subject: 'Déjà Vu Glitch',
      description: 'User experiencing repeated events',
      priority: 'high',
      status: 'open',
      requester_id: userId,
      assignee_id: userId,
      sla_deadline: '2026-02-15T18:00:00Z',
      messages: JSON.stringify([{
        sender: 'Neo',
        senderId: userId,
        text: 'I just saw a black cat twice',
        time: new Date().toISOString()
      }])
    },
    {
      org_id: orgId,
      ticket_number: 'TKT-2026-0002',
      subject: 'Agent Smith Replication',
      description: 'Uncontrolled multiplication detected',
      priority: 'critical',
      status: 'open',
      requester_id: userId,
      assignee_id: userId,
      sla_deadline: '2026-02-10T12:00:00Z',
      messages: JSON.stringify([])
    }
  ]);

  // === PRODUCTS ===
  await safeInsert('products', [
    {
      org_id: orgId,
      name: 'Red Pill',
      sku: 'PILL-RED',
      description: 'Wake up to reality',
      unit_price: 999999,
      cost_price: 1,
      category: 'Awakening',
      tax_rate: 0,
      is_active: true,
      stock_level: 100
    },
    {
      org_id: orgId,
      name: 'Blue Pill',
      sku: 'PILL-BLUE',
      description: 'Stay in Wonderland',
      unit_price: 0,
      cost_price: 0,
      category: 'Comfort',
      tax_rate: 0,
      is_active: true,
      stock_level: 999
    },
    {
      org_id: orgId,
      name: 'EMP Device',
      sku: 'EMP-001',
      description: 'Electromagnetic pulse generator',
      unit_price: 50000,
      cost_price: 30000,
      category: 'Defense',
      tax_rate: 10,
      is_active: true,
      stock_level: 5
    }
  ]);

  // === SERVICES ===
  await safeInsert('services', [
    {
      org_id: orgId,
      name: 'Operator Support',
      code: 'SVC-OPR',
      description: 'Real-time Matrix navigation',
      unit_price: 8000,
      cost_price: 2000,
      billing_cycle: 'monthly',
      tax_rate: 10,
      is_active: true
    },
    {
      org_id: orgId,
      name: 'Combat Training',
      code: 'SVC-TRN',
      description: 'Kung Fu instant knowledge transfer',
      unit_price: 25000,
      cost_price: 5000,
      billing_cycle: 'one-off',
      tax_rate: 10,
      is_active: true,
      duration_hours: 10
    }
  ]);

  // === CALENDAR EVENTS ===
  await safeInsert('calendar_events', [
    {
      org_id: orgId,
      title: 'Council Meeting',
      type: 'Meeting',
      start_time: '2026-02-10T10:00:00Z',
      end_time: '2026-02-10T12:00:00Z',
      location: 'Zion Council Chambers',
      description: 'Strategic planning',
      is_all_day: false
    },
    {
      org_id: orgId,
      title: 'Combat Training',
      type: 'Internal',
      start_time: '2026-02-11T14:00:00Z',
      end_time: '2026-02-11T16:00:00Z',
      location: 'Training Construct',
      description: 'Advanced martial arts',
      is_all_day: false
    }
  ]);

  console.log('\n🎉 Matrix data loaded successfully!\n');
}

loadData().catch(console.error);
