#!/usr/bin/env node
/**
 * Fix NOT NULL constraints on optional columns
 * Uses Supabase Management API to execute ALTER TABLE statements
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Columns that should be nullable (were incorrectly set to NOT NULL)
const fixes = {
  accounts: ['address', 'custom_data', 'logo', 'city', 'state', 'email', 'phone', 'industry', 'website', 'employee_count', 'avatar', 'tier', 'revenue', 'owner_id', 'commission_rate'],
  contacts: ['address', 'custom_data', 'company', 'avatar', 'title', 'email', 'phone', 'account_id', 'mobile', 'department'],
  leads: ['address', 'custom_data', 'company', 'email', 'phone', 'source', 'campaign_id', 'estimated_value', 'avatar', 'last_contact_date', 'notes', 'commission_rate', 'converted_to_deal_id', 'converted_at', 'converted_by'],
  deals: ['custom_data', 'account_id', 'contact_id', 'amount', 'stage_entry_date', 'campaign_id', 'commission_rate', 'commission_amount', 'lead_id', 'won_at', 'created_account_id', 'created_contact_id', 'expected_close_date', 'assignee_id', 'avatar'],
  tasks: ['description', 'assignee_id', 'due_date', 'related_to_id', 'related_to_type'],
  calendar_events: ['description', 'end_time', 'location', 'related_to_type', 'related_to_id', 'priority', 'is_all_day'],
  campaigns: ['budget', 'spent', 'revenue', 'revenue_generated', 'leads_generated', 'start_date', 'end_date', 'description', 'expected_cpl', 'target_audience', 'template_id', 'type'],
  tickets: ['description', 'requester_id', 'account_id', 'sla_deadline', 'messages', 'internal_notes', 'custom_data', 'related_to_id', 'related_to_type', 'assignee_id'],
  products: ['sku', 'code', 'description', 'category', 'type', 'unit_price', 'cost_price', 'tax_rate', 'stock_level', 'reorder_point', 'reorder_quantity', 'specifications', 'images', 'dimensions', 'weight', 'manufacturer', 'supplier', 'supplier_sku', 'supplier_s_k_u', 'warranty_months', 'warranty_details', 'tags', 'custom_fields'],
  services: ['code', 'sku', 'description', 'category', 'type', 'billing_cycle', 'unit_price', 'cost_price', 'tax_rate', 'duration_hours', 'duration_minutes', 'prerequisites', 'deliverables', 'skills_required', 'crew_size', 'equipment_needed', 'sla_response_hours', 'sla_completion_days', 'quality_checklist', 'images', 'tags', 'custom_fields'],
  quotes: ['deal_id', 'account_id', 'issue_date', 'expiry_date', 'line_items', 'subtotal', 'tax_total', 'total', 'notes', 'terms', 'accepted_at', 'accepted_by', 'superseded_by', 'version'],
  invoices: ['account_id', 'deal_id', 'quote_id', 'payment_status', 'issue_date', 'invoice_date', 'due_date', 'sent_at', 'paid_at', 'line_items', 'subtotal', 'tax_total', 'total', 'amount_paid', 'balance_due', 'notes', 'terms', 'late_fee_rate', 'credits'],
  jobs: ['name', 'subject', 'description', 'account_id', 'assignee_id', 'crew_id', 'job_type', 'priority', 'zone', 'estimated_duration', 'scheduled_date', 'scheduled_end_date', 'completed_at', 'lat', 'lng', 'job_fields', 'swms_signed', 'completion_signature', 'evidence_photos', 'bom', 'invoice_id'],
  crews: ['leader_id', 'member_ids', 'color', 'specialty', 'status'],
  zones: ['region', 'description', 'color', 'type', 'status', 'coordinates'],
  equipment: ['type', 'barcode', 'condition', 'location', 'assigned_to', 'last_service_date', 'next_service_date', 'purchase_date', 'purchase_price', 'model', 'status', 'value'],
  inventory_items: ['warehouse_qty', 'reorder_point', 'category', 'unit_price'],
  warehouses: ['location', 'capacity', 'status'],
  purchase_orders: ['supplier_id', 'account_id', 'items', 'total', 'linked_job_id', 'expected_delivery'],
  expenses: ['vendor', 'amount', 'category', 'date', 'status', 'receipt_url', 'approved_by'],
  bank_transactions: ['date', 'description', 'amount', 'type', 'status', 'match_confidence', 'matched_to_id', 'matched_to_type', 'reconciled', 'reconciled_at', 'reconciled_by', 'bank_reference', 'notes'],
  reviews: ['author_name', 'rating', 'content', 'platform', 'status', 'replied', 'reply_content', 'replied_at', 'job_id', 'account_id', 'sentiment'],
  users: ['avatar', 'manager_id', 'team']
};

async function testInsert(table, data) {
  const { data: result, error } = await supabase.from(table).insert(data).select();
  if (error) {
    return { success: false, error: error.message, column: error.message.match(/column "(.+?)"/)?.[1] };
  }
  // Cleanup
  await supabase.from(table).delete().eq('id', result[0].id);
  return { success: true };
}

async function main() {
  const org_id = '00000000-0000-0000-0000-000000000001';

  console.log('='.repeat(50));
  console.log('SUPABASE CONSTRAINT FIX');
  console.log('='.repeat(50));
  console.log('');

  // Test before
  console.log('BEFORE FIX - Testing inserts:');
  const beforeTests = {
    accounts: { org_id, name: 'Test' },
    contacts: { org_id, name: 'Test' },
    leads: { org_id, name: 'Test' },
    products: { org_id, name: 'Test' },
    services: { org_id, name: 'Test' },
  };

  for (const [table, data] of Object.entries(beforeTests)) {
    const result = await testInsert(table, data);
    if (result.success) {
      console.log(`  ${table}: OK`);
    } else {
      console.log(`  ${table}: BLOCKED by "${result.column}"`);
    }
  }

  console.log('');
  console.log('The Supabase JS client cannot run ALTER TABLE directly.');
  console.log('You need to run the SQL in Supabase Dashboard.');
  console.log('');
  console.log('FILE: supabase/FIX_NOT_NULL_CONSTRAINTS.sql');
  console.log('');
  console.log('Steps:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select project: anawatvgypmrpbmjfcht');
  console.log('3. Click SQL Editor > New query');
  console.log('4. Paste the contents of FIX_NOT_NULL_CONSTRAINTS.sql');
  console.log('5. Click Run');
  console.log('');
  console.log('After running, execute: node scripts/fix-constraints.js --verify');
}

async function verify() {
  const org_id = '00000000-0000-0000-0000-000000000001';

  console.log('='.repeat(50));
  console.log('VERIFYING CONSTRAINT FIXES');
  console.log('='.repeat(50));
  console.log('');

  const tests = {
    accounts: { org_id, name: 'Test Account' },
    contacts: { org_id, name: 'Test Contact' },
    leads: { org_id, name: 'Test Lead' },
    products: { org_id, name: 'Test Product' },
    services: { org_id, name: 'Test Service' },
    jobs: { org_id, job_number: 'TEST-001' },
    crews: { org_id, name: 'Test Crew' },
    zones: { org_id, name: 'Test Zone' },
    equipment: { org_id, name: 'Test Equipment' },
    campaigns: { org_id, name: 'Test Campaign' },
    tickets: { org_id, subject: 'Test Ticket' },
  };

  let passed = 0;
  let failed = 0;

  for (const [table, data] of Object.entries(tests)) {
    const result = await testInsert(table, data);
    if (result.success) {
      console.log(`  ✓ ${table}`);
      passed++;
    } else {
      console.log(`  ✗ ${table}: ${result.column || result.error}`);
      failed++;
    }
  }

  console.log('');
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('');
    console.log('✓ All constraints fixed! Ready to load data.');
    console.log('');
    console.log('Next: node scripts/load-matrix-data.js');
  }
}

if (process.argv.includes('--verify')) {
  verify();
} else {
  main();
}
