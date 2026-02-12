/**
 * SUPABASE INTEGRATION AUDIT SCRIPT
 *
 * This script validates that every UI input field correctly maps to its
 * corresponding Supabase database column by creating REAL records.
 *
 * Run with: node scripts/audit-supabase-integration.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Results tracking
const auditResults = [];

function logResult(module, action, status, inputPayload, dbResponse, issues = []) {
  const result = {
    module,
    action,
    status,
    inputPayload,
    dbResponse,
    issues
  };
  auditResults.push(result);

  console.log('\n' + '='.repeat(70));
  console.log(`📋 MODULE: ${module}`);
  console.log(`🎯 ACTION: ${action}`);
  console.log(`📊 STATUS: ${status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log('\n📤 INPUT PAYLOAD:');
  console.log(JSON.stringify(inputPayload, null, 2));
  console.log('\n📥 DATABASE RESPONSE:');
  console.log(JSON.stringify(dbResponse, null, 2));
  if (issues.length > 0) {
    console.log('\n⚠️ ISSUES:');
    issues.forEach(i => console.log(`   - ${i}`));
  }
  console.log('='.repeat(70));
}

// Store IDs for relational tests
const createdIds = {};

// ============================================================
// TEST 1: SALES MODULE - Create Lead
// ============================================================
async function testCreateLead() {
  console.log('\n🚀 TEST 1: SALES MODULE - Create Lead');

  const payload = {
    // Required fields
    name: 'John Audit Test',
    company: 'Solar Dynamics Pty Ltd',
    email: 'john.audit@solardynamics.com.au',
    phone: '+61 412 345 678',
    status: 'New',
    source: 'Web',
    score: 85,
    estimated_value: 25000,
    avatar: 'https://ui-avatars.com/api/?name=John+Audit',

    // Complex JSONB: address
    address: {
      street: '123 Test Street',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      country: 'Australia',
      lat: -33.8688,
      lng: 151.2093
    },

    // Complex JSONB: custom_data
    custom_data: {
      industry: 'Solar',
      roof_type: 'Tile',
      system_size_kw: 10,
      interested_products: ['Solar Panels', 'Battery Storage']
    },

    // Optional fields
    notes: 'High-value lead from website form. Interested in 10kW system.',
    commission_rate: 5.5,
    temperature: 'Hot',

    // System fields
    org_id: DEMO_ORG_ID,
    created_by: 'audit-script'
  };

  const { data, error } = await supabase
    .from('leads')
    .insert(payload)
    .select()
    .single();

  if (error) {
    logResult('SALES MODULE', 'Create Lead', 'FAIL', payload, { error: error.message }, [error.message]);
    return null;
  }

  // Verify all fields
  const issues = [];
  if (data.name !== payload.name) issues.push(`name mismatch: expected "${payload.name}", got "${data.name}"`);
  if (data.score !== payload.score) issues.push(`score mismatch: expected ${payload.score}, got ${data.score}`);
  if (!data.address || data.address.street !== payload.address.street) issues.push('address JSONB not saved correctly');
  if (!data.custom_data || data.custom_data.industry !== payload.custom_data.industry) issues.push('custom_data JSONB not saved correctly');

  const status = issues.length === 0 ? 'PASS' : 'FAIL';
  logResult('SALES MODULE', 'Create Lead', status, payload, data, issues);

  createdIds.lead = data.id;
  return data;
}

// ============================================================
// TEST 2: FINANCIALS MODULE - Create Account + Quote
// ============================================================
async function testCreateQuote() {
  console.log('\n🚀 TEST 2: FINANCIALS MODULE - Create Quote');

  // First create an Account (required for Quote)
  const accountPayload = {
    name: 'Audit Test Company',
    industry: 'Solar Installation',
    website: 'https://audittest.com.au',
    employee_count: 15,
    tier: 'Premium',
    avatar: 'https://ui-avatars.com/api/?name=ATC',
    email: 'accounts@audittest.com.au',
    city: 'Melbourne',
    state: 'VIC',
    address: {
      street: '456 Corporate Drive',
      suburb: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
      country: 'Australia'
    },
    custom_data: {
      payment_terms: 'Net 30',
      credit_limit: 50000
    },
    org_id: DEMO_ORG_ID,
    created_by: 'audit-script'
  };

  const { data: account, error: accError } = await supabase
    .from('accounts')
    .insert(accountPayload)
    .select()
    .single();

  if (accError) {
    logResult('FINANCIALS MODULE', 'Create Account (prereq)', 'FAIL', accountPayload, { error: accError.message }, [accError.message]);
    return null;
  }

  createdIds.account = account.id;
  console.log(`   ✅ Account created: ${account.id}`);

  // Create a Deal (required for Quote)
  const dealPayload = {
    name: 'Solar Installation - Audit Test',
    account_id: account.id,
    amount: 28500,
    stage: 'Proposal',
    probability: 60,
    expected_close_date: '2026-03-15',
    avatar: 'https://ui-avatars.com/api/?name=SA',
    custom_data: {
      system_type: 'Residential',
      panels_count: 20
    },
    org_id: DEMO_ORG_ID,
    created_by: 'audit-script'
  };

  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .insert(dealPayload)
    .select()
    .single();

  if (dealError) {
    logResult('FINANCIALS MODULE', 'Create Deal (prereq)', 'FAIL', dealPayload, { error: dealError.message }, [dealError.message]);
    return null;
  }

  createdIds.deal = deal.id;
  console.log(`   ✅ Deal created: ${deal.id}`);

  // Now create the Quote with line items
  const quotePayload = {
    quote_number: `QT-AUDIT-${Date.now()}`,
    deal_id: deal.id,
    account_id: account.id,
    status: 'Draft',
    issue_date: '2026-02-11',
    expiry_date: '2026-03-11',

    // Line items array (JSONB)
    line_items: [
      {
        itemType: 'product',
        itemId: 'prod-001',
        description: 'Solar Panel 400W Mono',
        qty: 20,
        unitPrice: 450,
        taxRate: 10,
        lineTotal: 9900
      },
      {
        itemType: 'product',
        itemId: 'prod-002',
        description: 'Hybrid Inverter 5kW',
        qty: 1,
        unitPrice: 3500,
        taxRate: 10,
        lineTotal: 3850
      },
      {
        itemType: 'service',
        itemId: 'svc-001',
        description: 'Installation Labor',
        qty: 1,
        unitPrice: 2500,
        taxRate: 10,
        lineTotal: 2750
      }
    ],

    subtotal: 15000,
    tax_total: 1500,
    total: 16500,

    notes: 'Quote valid for 30 days. Installation within 14 days of acceptance.',
    terms: 'Payment Terms: 50% deposit on acceptance, 50% on completion.',
    version: 1,

    org_id: DEMO_ORG_ID,
    created_by: 'audit-script'
  };

  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .insert(quotePayload)
    .select()
    .single();

  if (quoteError) {
    logResult('FINANCIALS MODULE', 'Create Quote', 'FAIL', quotePayload, { error: quoteError.message }, [quoteError.message]);
    return null;
  }

  // Verify quote fields
  const issues = [];
  if (!quote.line_items || quote.line_items.length !== 3) issues.push('line_items array not saved correctly');
  if (quote.total !== quotePayload.total) issues.push(`total mismatch: expected ${quotePayload.total}, got ${quote.total}`);
  if (quote.deal_id !== deal.id) issues.push('deal_id relation not saved');
  if (quote.account_id !== account.id) issues.push('account_id relation not saved');

  const status = issues.length === 0 ? 'PASS' : 'FAIL';
  logResult('FINANCIALS MODULE', 'Create Quote with Line Items', status, quotePayload, quote, issues);

  createdIds.quote = quote.id;
  return quote;
}

// ============================================================
// TEST 3: OPERATIONS MODULE - Create Job
// ============================================================
async function testCreateJob() {
  console.log('\n🚀 TEST 3: OPERATIONS MODULE - Create Job');

  // First create a Crew
  const crewPayload = {
    name: 'Audit Test Crew',
    color: '#4CAF50',
    member_ids: [],
    org_id: DEMO_ORG_ID,
    created_by: 'audit-script'
  };

  const { data: crew, error: crewError } = await supabase
    .from('crews')
    .insert(crewPayload)
    .select()
    .single();

  if (crewError) {
    console.log(`   ⚠️ Crew creation failed (non-blocking): ${crewError.message}`);
  } else {
    createdIds.crew = crew.id;
    console.log(`   ✅ Crew created: ${crew.id}`);
  }

  // Create the Job
  const jobPayload = {
    job_number: `JOB-AUDIT-${Date.now()}`,
    name: 'Solar Installation - Audit Site',
    subject: 'Install 10kW Solar System',
    description: 'Full installation of 20x 400W panels with 5kW hybrid inverter',
    account_id: createdIds.account,
    crew_id: createdIds.crew || null,
    job_type: 'Install',
    status: 'Scheduled',
    priority: 'High',
    zone: 'North',
    estimated_duration: 480, // 8 hours in minutes
    scheduled_date: '2026-02-20T08:00:00Z',
    scheduled_end_date: '2026-02-20T16:00:00Z',

    // GPS coordinates
    lat: -33.8688,
    lng: 151.2093,

    // Custom job fields (JSONB)
    job_fields: [
      {
        id: 'inverter_serial',
        label: 'Inverter Serial Number',
        type: 'text',
        value: 'SN-12345-AUDIT',
        required: true
      },
      {
        id: 'grid_voltage',
        label: 'Grid Voltage',
        type: 'select',
        options: ['230V', '240V', '415V'],
        value: '240V',
        required: true
      },
      {
        id: 'meter_number',
        label: 'Meter Number',
        type: 'text',
        value: 'MTR-98765',
        required: false
      }
    ],

    // Bill of Materials (JSONB)
    bom: [
      {
        inventoryItemId: 'inv-001',
        qtyRequired: 20,
        qtyPicked: 0,
        serialNumbers: []
      },
      {
        inventoryItemId: 'inv-002',
        qtyRequired: 1,
        qtyPicked: 0,
        serialNumbers: []
      }
    ],

    swms_signed: false,

    org_id: DEMO_ORG_ID,
    created_by: 'audit-script'
  };

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert(jobPayload)
    .select()
    .single();

  if (jobError) {
    logResult('OPERATIONS MODULE', 'Create Job', 'FAIL', jobPayload, { error: jobError.message }, [jobError.message]);
    return null;
  }

  // Verify job fields
  const issues = [];
  if (job.status !== 'Scheduled') issues.push('status not saved correctly');
  if (!job.job_fields || job.job_fields.length !== 3) issues.push('job_fields JSONB not saved correctly');
  if (!job.bom || job.bom.length !== 2) issues.push('bom JSONB not saved correctly');
  if (job.lat !== jobPayload.lat) issues.push('lat coordinate not saved');
  if (job.lng !== jobPayload.lng) issues.push('lng coordinate not saved');

  const status = issues.length === 0 ? 'PASS' : 'FAIL';
  logResult('OPERATIONS MODULE', 'Create Job', status, jobPayload, job, issues);

  createdIds.job = job.id;
  return job;
}

// ============================================================
// TEST 4: FIELD MODULE - Update Job Completion
// ============================================================
async function testJobCompletion() {
  console.log('\n🚀 TEST 4: FIELD MODULE - Job Completion');

  if (!createdIds.job) {
    console.log('   ⚠️ Skipping: No job to complete');
    return null;
  }

  const updatePayload = {
    status: 'Completed',
    completed_at: new Date().toISOString(),

    // Evidence vault (photos array)
    evidence_photos: [
      'https://storage.example.com/jobs/audit/before-install.jpg',
      'https://storage.example.com/jobs/audit/after-install.jpg',
      'https://storage.example.com/jobs/audit/inverter-label.jpg',
      'https://storage.example.com/jobs/audit/meter-reading.jpg'
    ],

    // Completion signature
    completion_signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...==',

    // SWMS signed
    swms_signed: true,

    // Update job fields with completion data
    job_fields: [
      {
        id: 'inverter_serial',
        label: 'Inverter Serial Number',
        type: 'text',
        value: 'SN-12345-AUDIT',
        required: true
      },
      {
        id: 'grid_voltage',
        label: 'Grid Voltage',
        type: 'select',
        options: ['230V', '240V', '415V'],
        value: '240V',
        required: true
      },
      {
        id: 'meter_number',
        label: 'Meter Number',
        type: 'text',
        value: 'MTR-98765',
        required: false
      },
      {
        id: 'completion_notes',
        label: 'Completion Notes',
        type: 'text',
        value: 'Installation completed successfully. Customer satisfied.',
        required: false
      }
    ],

    // Update BOM with picked quantities
    bom: [
      {
        inventoryItemId: 'inv-001',
        qtyRequired: 20,
        qtyPicked: 20,
        serialNumbers: ['SN-P001', 'SN-P002', 'SN-P003', 'SN-P004', 'SN-P005']
      },
      {
        inventoryItemId: 'inv-002',
        qtyRequired: 1,
        qtyPicked: 1,
        serialNumbers: ['SN-INV-001']
      }
    ],

    updated_at: new Date().toISOString()
  };

  const { data: updatedJob, error } = await supabase
    .from('jobs')
    .update(updatePayload)
    .eq('id', createdIds.job)
    .eq('org_id', DEMO_ORG_ID)
    .select()
    .single();

  if (error) {
    logResult('FIELD MODULE', 'Job Completion', 'FAIL', updatePayload, { error: error.message }, [error.message]);
    return null;
  }

  // Verify completion fields
  const issues = [];
  if (updatedJob.status !== 'Completed') issues.push('status not updated to Completed');
  if (!updatedJob.completed_at) issues.push('completed_at not saved');
  if (!updatedJob.evidence_photos || updatedJob.evidence_photos.length !== 4) issues.push('evidence_photos not saved correctly');
  if (!updatedJob.completion_signature) issues.push('completion_signature not saved');
  if (!updatedJob.swms_signed) issues.push('swms_signed not updated');

  const status = issues.length === 0 ? 'PASS' : 'FAIL';
  logResult('FIELD MODULE', 'Job Completion', status, updatePayload, updatedJob, issues);

  return updatedJob;
}

// ============================================================
// TEST 5: MARKETING MODULE - Create Campaign
// ============================================================
async function testCreateCampaign() {
  console.log('\n🚀 TEST 5: MARKETING MODULE - Create Campaign');

  const campaignPayload = {
    name: 'Summer Solar Blast',
    type: 'Email',
    status: 'Active',
    budget: 5000,
    spent: 1250,
    revenue_generated: 45000,
    leads_generated: 32,
    start_date: '2026-02-01',
    end_date: '2026-03-31',
    description: 'Summer promotion targeting homeowners in Northern suburbs',
    expected_cpl: 150,
    target_audience: JSON.stringify({
      logic: 'AND',
      rules: [
        { field: 'zone', op: 'eq', value: 'North' },
        { field: 'system_age', op: 'gt', value: 3 },
        { field: 'roof_type', op: 'in', value: ['Tile', 'Metal'] }
      ]
    }),

    org_id: DEMO_ORG_ID,
    created_by: 'audit-script'
  };

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert(campaignPayload)
    .select()
    .single();

  if (error) {
    logResult('MARKETING MODULE', 'Create Campaign', 'FAIL', campaignPayload, { error: error.message }, [error.message]);
    return null;
  }

  // Verify campaign fields
  const issues = [];
  if (campaign.name !== campaignPayload.name) issues.push('name not saved correctly');
  if (campaign.type !== campaignPayload.type) issues.push('type not saved correctly');
  if (Number(campaign.budget) !== campaignPayload.budget) issues.push(`budget mismatch: expected ${campaignPayload.budget}, got ${campaign.budget}`);
  if (!campaign.target_audience) issues.push('target_audience (segmentation) not saved');

  const status = issues.length === 0 ? 'PASS' : 'FAIL';
  logResult('MARKETING MODULE', 'Create Campaign', status, campaignPayload, campaign, issues);

  createdIds.campaign = campaign.id;
  return campaign;
}

// ============================================================
// TEST 6: SYSTEM MODULE - Create/Update Organization Settings
// ============================================================
async function testOrganizationSettings() {
  console.log('\n🚀 TEST 6: SYSTEM MODULE - Organization Settings');

  // First check if organization exists
  const { data: existingOrg, error: fetchError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', DEMO_ORG_ID)
    .single();

  const settingsPayload = {
    name: 'Audit Test Organization',
    settings: {
      branding: {
        name: 'Catcha CRM',
        slogan: 'Catch Every Lead',
        primaryColor: '#FF5733',
        logoLight: 'https://example.com/logo-light.png',
        logoDark: 'https://example.com/logo-dark.png',
        sidebarMode: 'dark',
        theme: 'light'
      },
      modules: {
        salesEngine: true,
        financials: true,
        fieldLogistics: true,
        marketing: true,
        bankFeeds: true,
        inventory: false, // Disabled as per test spec
        dispatch: true,
        reputation: true,
        referrals: true,
        inboundForms: true,
        chatWidgets: true,
        subscriptions: true,
        purchaseOrders: true
      },
      localization: {
        timezone: 'Australia/Sydney',
        currency: 'AUD',
        currencySymbol: '$',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        taxRate: 10
      },
      integrations: {
        stripe: {
          enabled: true,
          mode: 'test',
          publicKey: 'pk_test_audit123'
        },
        twilio: {
          enabled: true,
          accountSid: 'AC_audit_test',
          phoneNumber: '+61400000000'
        },
        googleMaps: {
          enabled: true,
          apiKey: 'AIza_audit_test',
          defaultRegion: 'AU'
        }
      }
    },
    updated_at: new Date().toISOString()
  };

  let result;
  let error;

  if (existingOrg) {
    // Update existing
    const response = await supabase
      .from('organizations')
      .update(settingsPayload)
      .eq('id', DEMO_ORG_ID)
      .select()
      .single();
    result = response.data;
    error = response.error;
  } else {
    // Insert new
    const response = await supabase
      .from('organizations')
      .insert({ id: DEMO_ORG_ID, ...settingsPayload })
      .select()
      .single();
    result = response.data;
    error = response.error;
  }

  if (error) {
    logResult('SYSTEM MODULE', 'Organization Settings', 'FAIL', settingsPayload, { error: error.message }, [error.message]);
    return null;
  }

  // Verify settings
  const issues = [];
  if (!result.settings) issues.push('settings JSONB not saved');
  if (result.settings && result.settings.branding?.primaryColor !== '#FF5733') {
    issues.push('branding.primaryColor not saved correctly');
  }
  if (result.settings && result.settings.modules?.inventory !== false) {
    issues.push('modules.inventory should be false (disabled)');
  }

  const status = issues.length === 0 ? 'PASS' : 'FAIL';
  logResult('SYSTEM MODULE', 'Organization Settings', status, settingsPayload, result, issues);

  return result;
}

// ============================================================
// TEST 7: SUPPORT MODULE - Create Ticket
// ============================================================
async function testCreateTicket() {
  console.log('\n🚀 TEST 7: SUPPORT MODULE - Create Ticket');

  const ticketPayload = {
    ticket_number: `TKT-AUDIT-${Date.now()}`,
    subject: 'Audit Test - System Performance Issue',
    description: 'Testing ticket creation with all fields populated correctly.',
    status: 'Open',
    priority: 'High',
    sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    account_id: createdIds.account || null,

    // Messages array (JSONB)
    messages: [
      {
        sender: 'System',
        senderId: 'system',
        text: 'Ticket created via audit script.',
        time: new Date().toISOString(),
        isBot: true
      }
    ],

    // Internal notes (JSONB)
    internal_notes: [
      {
        sender: 'Audit Bot',
        senderId: 'audit-bot',
        text: 'This is an internal audit note - not visible to customer.',
        time: new Date().toISOString()
      }
    ],

    // Custom data (JSONB)
    custom_data: {
      source: 'API',
      browser: 'Chrome 120',
      os: 'Windows 11',
      severity_level: 3
    },

    org_id: DEMO_ORG_ID,
    created_by: 'audit-script'
  };

  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert(ticketPayload)
    .select()
    .single();

  if (error) {
    logResult('SUPPORT MODULE', 'Create Ticket', 'FAIL', ticketPayload, { error: error.message }, [error.message]);
    return null;
  }

  // Verify ticket fields
  const issues = [];
  if (!ticket.messages || ticket.messages.length !== 1) issues.push('messages JSONB not saved correctly');
  if (!ticket.internal_notes || ticket.internal_notes.length !== 1) issues.push('internal_notes JSONB not saved correctly');
  if (!ticket.custom_data || ticket.custom_data.source !== 'API') issues.push('custom_data JSONB not saved correctly');

  const status = issues.length === 0 ? 'PASS' : 'FAIL';
  logResult('SUPPORT MODULE', 'Create Ticket', status, ticketPayload, ticket, issues);

  createdIds.ticket = ticket.id;
  return ticket;
}

// ============================================================
// TEST 8: INVENTORY MODULE - Create Inventory Item
// ============================================================
async function testCreateInventoryItem() {
  console.log('\n🚀 TEST 8: INVENTORY MODULE - Create Inventory Item');

  const inventoryPayload = {
    name: 'Solar Panel 400W Monocrystalline',
    sku: 'SP-400W-MONO-AUDIT',
    warehouse_qty: 150,
    reorder_point: 20,
    category: 'Material',
    unit_price: 450.00,

    org_id: DEMO_ORG_ID,
    created_by: 'audit-script'
  };

  const { data: item, error } = await supabase
    .from('inventory_items')
    .insert(inventoryPayload)
    .select()
    .single();

  if (error) {
    logResult('INVENTORY MODULE', 'Create Inventory Item', 'FAIL', inventoryPayload, { error: error.message }, [error.message]);
    return null;
  }

  // Verify inventory item fields
  const issues = [];
  if (item.name !== inventoryPayload.name) issues.push('name not saved correctly');
  if (item.sku !== inventoryPayload.sku) issues.push('sku not saved correctly');
  if (item.warehouse_qty !== inventoryPayload.warehouse_qty) issues.push('warehouse_qty not saved correctly');
  if (item.category !== inventoryPayload.category) issues.push('category not saved correctly');

  const status = issues.length === 0 ? 'PASS' : 'FAIL';
  logResult('INVENTORY MODULE', 'Create Inventory Item', status, inventoryPayload, item, issues);

  createdIds.inventoryItem = item.id;
  return item;
}

// ============================================================
// CLEANUP - Delete test records
// ============================================================
async function cleanup() {
  console.log('\n🧹 CLEANUP - Removing test records...');

  const tables = [
    { name: 'tickets', id: createdIds.ticket },
    { name: 'inventory_items', id: createdIds.inventoryItem },
    { name: 'campaigns', id: createdIds.campaign },
    { name: 'jobs', id: createdIds.job },
    { name: 'crews', id: createdIds.crew },
    { name: 'quotes', id: createdIds.quote },
    { name: 'deals', id: createdIds.deal },
    { name: 'accounts', id: createdIds.account },
    { name: 'leads', id: createdIds.lead }
  ];

  for (const { name, id } of tables) {
    if (id) {
      const { error } = await supabase
        .from(name)
        .delete()
        .eq('id', id);

      if (error) {
        console.log(`   ⚠️ Failed to delete from ${name}: ${error.message}`);
      } else {
        console.log(`   ✅ Deleted from ${name}: ${id}`);
      }
    }
  }
}

// ============================================================
// MAIN EXECUTION
// ============================================================
async function runAudit() {
  console.log('\n' + '█'.repeat(70));
  console.log('  SUPABASE INTEGRATION AUDIT');
  console.log('  Testing UI-to-Database Field Mapping');
  console.log('█'.repeat(70));
  console.log(`\n⏱️  Started: ${new Date().toISOString()}`);
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🏢 Org ID: ${DEMO_ORG_ID}\n`);

  try {
    // Run all tests
    await testCreateLead();
    await testCreateQuote();
    await testCreateJob();
    await testJobCompletion();
    await testCreateCampaign();
    await testOrganizationSettings();
    await testCreateTicket();
    await testCreateInventoryItem();

    // Generate summary
    console.log('\n' + '█'.repeat(70));
    console.log('  AUDIT SUMMARY');
    console.log('█'.repeat(70));

    const passed = auditResults.filter(r => r.status === 'PASS').length;
    const failed = auditResults.filter(r => r.status === 'FAIL').length;
    const total = auditResults.length;

    console.log(`\n📊 Results: ${passed}/${total} PASSED`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Score: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      auditResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`   - ${r.module}: ${r.action}`);
          r.issues.forEach(i => console.log(`     └─ ${i}`));
        });
    }

    // Cleanup
    console.log('\n');
    const shouldCleanup = process.argv.includes('--cleanup');
    if (shouldCleanup) {
      await cleanup();
    } else {
      console.log('💡 TIP: Run with --cleanup flag to remove test records');
      console.log('\n📝 Created Record IDs:');
      Object.entries(createdIds).forEach(([key, value]) => {
        if (value) console.log(`   ${key}: ${value}`);
      });
    }

    console.log(`\n⏱️  Completed: ${new Date().toISOString()}`);
    console.log('█'.repeat(70) + '\n');

    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);

  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err);
    process.exit(1);
  }
}

// Run the audit
runAudit();
