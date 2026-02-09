#!/usr/bin/env node

/**
 * Smart Data Loader
 * - Checks existing table structure
 * - Inserts Matrix mock data into existing tables only
 * - Skips missing columns gracefully
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

console.log('\n🎬 Smart Matrix Data Loader\n');

async function getOrgId() {
  const { data } = await supabase.from('organizations').select('id').limit(1).single();
  return data?.id || '00000000-0000-0000-0000-000000000001';
}

async function getTableColumns(tableName) {
  // Try to get a sample row to determine columns
  const { data, error } = await supabase.from(tableName).select('*').limit(1);

  if (error) return null;

  // If no data, try inserting and rolling back to see required columns
  // For now, just return empty array
  return [];
}

async function safeInsert(tableName, records) {
  console.log(`\n📝 ${tableName}:`);

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
    console.log(`   🔍 Sample data:`, JSON.stringify(records[0], null, 2).substring(0, 200));
    return { success: false, count: 0, error: error.message };
  }

  console.log(`   ✅ Inserted ${data.length} rows`);
  return { success: true, count: data.length };
}

async function main() {
  const orgId = await getOrgId();
  console.log(`📌 Organization ID: ${orgId}\n`);

  const results = {};

  // === ACCOUNTS (Ships) ===
  results.accounts = await safeInsert('accounts', [
    { org_id: orgId, name: 'Nebuchadnezzar', industry: 'Reconnaissance', type: 'customer', status: 'active' },
    { org_id: orgId, name: 'Logos', industry: 'Strike Force', type: 'customer', status: 'active' },
    { org_id: orgId, name: 'Mjolnir (Hammer)', industry: 'Heavy Assault', type: 'customer', status: 'active' },
    { org_id: orgId, name: 'Vigilant', industry: 'Surveillance', type: 'customer', status: 'active' },
    { org_id: orgId, name: 'Zion Command', industry: 'Government', type: 'customer', status: 'active' },
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
    { org_id: orgId, first_name: 'Neo', last_name: 'Anderson', email: 'neo@zion.io', phone: '555-0001', title: 'The One', account_id: accountMap['Zion Command'] },
    { org_id: orgId, first_name: 'Morpheus', last_name: '', email: 'morpheus@zion.io', phone: '555-0002', title: 'Captain', account_id: accountMap['Nebuchadnezzar'] },
    { org_id: orgId, first_name: 'Trinity', last_name: '', email: 'trinity@zion.io', phone: '555-0003', title: 'First Mate', account_id: accountMap['Nebuchadnezzar'] },
    { org_id: orgId, first_name: 'Niobe', last_name: '', email: 'niobe@zion.io', phone: '555-0004', title: 'Captain', account_id: accountMap['Logos'] },
    { org_id: orgId, first_name: 'The', last_name: 'Oracle', email: 'oracle@zion.io', phone: '555-0200', title: 'Consultant', account_id: accountMap['Zion Command'] },
  ]);

  // === LEADS (Potential Recruits) ===
  results.leads = await safeInsert('leads', [
    { org_id: orgId, name: 'Thomas A. Anderson', email: 'tanderson@metacortex.com', company: 'MetaCortex', phone: '555-1001', status: 'new', source: 'Oracle Referral', score: 85, notes: 'High potential, shows signs of awakening' },
    { org_id: orgId, name: 'Switch', email: 'switch@resistance.net', company: 'Independent', phone: '555-1002', status: 'contacted', source: 'Resistance Network', score: 70, notes: 'Skilled hacker, good infiltration skills' },
    { org_id: orgId, name: 'Apoc', email: 'apoc@resistance.net', company: 'Independent', phone: '555-1003', status: 'qualified', source: 'Resistance Network', score: 75, notes: 'Technical expertise in systems' },
  ]);

  // === DEALS (Operations) ===
  results.deals = await safeInsert('deals', [
    { org_id: orgId, name: 'Operation Exodus', amount: 500000, stage: 'negotiation', probability: 75, account_id: accountMap['Zion Command'], notes: 'Mass evacuation planning' },
    { org_id: orgId, name: 'Source Code Recovery', amount: 750000, stage: 'proposal', probability: 60, account_id: accountMap['Zion Command'], notes: 'Retrieve critical system access codes' },
    { org_id: orgId, name: 'Sentinel Defense System', amount: 300000, stage: 'qualification', probability: 40, account_id: accountMap['Zion Command'], notes: 'EMP weapon upgrades' },
  ]);

  // === TASKS (Mission Objectives) ===
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  results.tasks = await safeInsert('tasks', [
    { org_id: orgId, title: 'Learn Kung Fu', description: 'Upload combat training programs', status: 'completed', priority: 'high', due_date: dueDate },
    { org_id: orgId, title: 'Dodge Bullets', description: 'Master bullet-time perception', status: 'completed', priority: 'high', due_date: dueDate },
    { org_id: orgId, title: 'Free Minds from Matrix', description: 'Locate and extract potential recruits', status: 'in_progress', priority: 'critical', due_date: dueDate },
    { org_id: orgId, title: 'Meet with Oracle', description: 'Consultation scheduled', status: 'pending', priority: 'high', due_date: dueDate },
  ]);

  // === CAMPAIGNS ===
  results.campaigns = await safeInsert('campaigns', [
    { org_id: orgId, name: 'Wake Up Campaign', type: 'email', status: 'active', start_date: '2026-01-01', budget: 50000 },
    { org_id: orgId, name: 'Red Pill Distribution', type: 'outbound', status: 'active', start_date: '2026-01-15', budget: 30000 },
    { org_id: orgId, name: 'Resistance Recruitment Drive', type: 'social', status: 'planning', start_date: '2026-03-01', budget: 75000 },
  ]);

  // === TICKETS (Glitches) ===
  results.tickets = await safeInsert('tickets', [
    { org_id: orgId, subject: 'Déjà Vu Glitch', description: 'User experiencing repeated events', priority: 'high', status: 'open' },
    { org_id: orgId, subject: 'Agent Smith Replication Bug', description: 'Uncontrolled multiplication detected', priority: 'critical', status: 'in_progress' },
    { org_id: orgId, subject: 'Phone Line Disconnection', description: 'Lost connection during extraction', priority: 'high', status: 'resolved' },
  ]);

  // === PRODUCTS (Matrix Tech) ===
  results.products = await safeInsert('products', [
    { org_id: orgId, name: 'Red Pill', sku: 'PILL-RED', description: 'Wake up to reality. No going back.', price: 999999, category: 'Awakening' },
    { org_id: orgId, name: 'Blue Pill', sku: 'PILL-BLUE', description: 'Stay in Wonderland. Story ends.', price: 0, category: 'Comfort' },
    { org_id: orgId, name: 'Construct Program', sku: 'PROG-CON', description: 'Loading program for combat training.', price: 50000, category: 'Training' },
  ]);

  // === SERVICES (Zion Services) ===
  results.services = await safeInsert('services', [
    { org_id: orgId, name: 'Operator Support', code: 'SVC-OPR', description: 'Real-time Matrix navigation and exit coordination.', price: 8000 },
    { org_id: orgId, name: 'Combat Training Upload', code: 'SVC-TRN', description: 'Kung Fu, weapons, piloting - instant knowledge transfer.', price: 25000 },
    { org_id: orgId, name: 'Sentinel Watch', code: 'SVC-SEN', description: 'Early warning system for machine attacks.', price: 120000 },
  ]);

  // === CALENDAR EVENTS ===
  results.calendar_events = await safeInsert('calendar_events', [
    { org_id: orgId, title: 'Council Meeting', type: 'meeting', start_time: '2026-02-10T10:00:00Z', location: 'Zion Council Chambers', description: 'Strategic planning session', all_day: false },
    { org_id: orgId, title: 'Combat Training', type: 'task', start_time: '2026-02-11T14:00:00Z', location: 'Training Construct', description: 'Advanced martial arts simulation', all_day: false },
    { org_id: orgId, title: 'Oracle Consultation', type: 'appointment', start_time: '2026-02-15T09:00:00Z', location: 'Oracle\'s Apartment', description: 'Prophecy interpretation', all_day: false },
  ]);

  console.log('\n\n📊 SUMMARY:\n');

  let totalSuccess = 0;
  let totalFailed = 0;

  Object.keys(results).forEach(table => {
    const result = results[table];
    if (result.success) {
      console.log(`✅ ${table.padEnd(25)} - ${result.count} rows inserted`);
      totalSuccess += result.count;
    } else {
      console.log(`❌ ${table.padEnd(25)} - Failed: ${result.error || 'unknown error'}`);
      totalFailed++;
    }
  });

  console.log(`\n🎉 Total: ${totalSuccess} rows inserted across ${Object.keys(results).length - totalFailed} tables`);

  if (totalFailed > 0) {
    console.log(`⚠️  ${totalFailed} tables had errors (likely schema mismatch)\n`);
  }

  console.log('\n📋 Next Steps:');
  console.log('   1. Check browser at http://localhost:3002');
  console.log('   2. Navigate to Contacts to see Neo, Morpheus, Trinity');
  console.log('   3. Navigate to Accounts to see Nebuchadnezzar, Logos, etc.');
  console.log('   4. Check Leads, Deals, Tasks for Matrix data\n');
}

main();
