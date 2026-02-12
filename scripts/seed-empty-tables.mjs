/**
 * Seed Demo Data for Empty Tables
 * Seeds: organization_users, tactical_queue, warehouse_locations, dispatch_alerts, rfqs, supplier_quotes
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anawatvgypmrpbmjfcht.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYXdhdHZneXBtcnBibWpmY2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwNDMwOSwiZXhwIjoyMDg0MjgwMzA5fQ.njigvMg4pdmKMtoWngrgNtw1c59JcM9K_aAaHv-ddwU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function getRandomUser() {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('org_id', DEMO_ORG_ID)
    .limit(1);
  return data?.[0]?.id;
}

async function getRandomAccount() {
  const { data } = await supabase
    .from('accounts')
    .select('id, name')
    .eq('org_id', DEMO_ORG_ID)
    .eq('type', 'Vendor')
    .limit(3);
  return data || [];
}

async function getRandomWarehouse() {
  const { data } = await supabase
    .from('warehouses')
    .select('id')
    .eq('org_id', DEMO_ORG_ID)
    .limit(1);
  return data?.[0]?.id;
}

async function getRandomJob() {
  const { data } = await supabase
    .from('jobs')
    .select('id, job_number')
    .eq('org_id', DEMO_ORG_ID)
    .limit(1);
  return data?.[0];
}

async function seedTacticalQueue() {
  console.log('\n📋 Seeding tactical_queue...');

  const userId = await getRandomUser();

  const items = [
    {
      org_id: DEMO_ORG_ID,
      title: 'Urgent: Customer complaint pending',
      description: 'VIP customer reported service issue - needs immediate attention',
      priority: 'critical',
      priority_score: 95,
      status: 'open',
      assignee_id: userId,
      sla_deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
      escalation_level: 1,
      related_to_type: 'tickets',
      related_to_name: 'TKT-2026-0042'
    },
    {
      org_id: DEMO_ORG_ID,
      title: 'Follow up: Quote approval needed',
      description: 'Quote QUO-2026-0015 waiting for customer approval - follow up required',
      priority: 'high',
      priority_score: 75,
      status: 'in_progress',
      assignee_id: userId,
      sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      escalation_level: 0,
      related_to_type: 'quotes',
      related_to_name: 'QUO-2026-0015'
    },
    {
      org_id: DEMO_ORG_ID,
      title: 'Equipment maintenance scheduled',
      description: 'Service van #3 due for quarterly maintenance',
      priority: 'medium',
      priority_score: 50,
      status: 'open',
      assignee_id: userId,
      sla_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      escalation_level: 0,
      related_to_type: 'equipment',
      related_to_name: 'VAN-003'
    },
    {
      org_id: DEMO_ORG_ID,
      title: 'Inventory restock required',
      description: 'AC filters below reorder point - procurement needed',
      priority: 'low',
      priority_score: 30,
      status: 'open',
      assignee_id: userId,
      escalation_level: 0,
      related_to_type: 'inventory_items',
      related_to_name: 'AC Filter - 20x25x1'
    }
  ];

  const { data, error } = await supabase
    .from('tactical_queue')
    .upsert(items, { onConflict: 'id' })
    .select();

  if (error) {
    console.log('  ❌ Error:', error.message);
  } else {
    console.log(`  ✅ Added ${data.length} items`);
  }
}

async function seedWarehouseLocations() {
  console.log('\n🏭 Seeding warehouse_locations...');

  const warehouseId = await getRandomWarehouse();

  if (!warehouseId) {
    // Create a warehouse first
    const { data: newWarehouse } = await supabase
      .from('warehouses')
      .insert({
        org_id: DEMO_ORG_ID,
        name: 'Main Warehouse',
        address: '123 Industrial Park, Sydney NSW 2000',
        is_default: true
      })
      .select()
      .single();

    if (newWarehouse) {
      console.log('  Created new warehouse');
    }
  }

  const finalWarehouseId = warehouseId || (await getRandomWarehouse());

  const locations = [
    {
      org_id: DEMO_ORG_ID,
      warehouse_id: finalWarehouseId,
      name: 'Zone A - HVAC Parts',
      code: 'A-00-00',
      type: 'zone',
      description: 'Main zone for HVAC components and parts',
      capacity: 1000,
      current_count: 450,
      is_active: true,
      is_pickable: true,
      is_receivable: true
    },
    {
      org_id: DEMO_ORG_ID,
      warehouse_id: finalWarehouseId,
      name: 'Aisle A1',
      code: 'A-01-00',
      type: 'aisle',
      description: 'AC units and compressors',
      capacity: 200,
      current_count: 85,
      is_active: true,
      is_pickable: true,
      is_receivable: true
    },
    {
      org_id: DEMO_ORG_ID,
      warehouse_id: finalWarehouseId,
      name: 'Rack A1-01',
      code: 'A-01-01',
      type: 'rack',
      description: 'Small AC units (up to 3.5kW)',
      capacity: 50,
      current_count: 28,
      is_active: true,
      is_pickable: true,
      is_receivable: true
    },
    {
      org_id: DEMO_ORG_ID,
      warehouse_id: finalWarehouseId,
      name: 'Bin A1-01-A',
      code: 'A-01-01-A',
      type: 'bin',
      description: 'Split system outdoor units',
      capacity: 10,
      current_count: 7,
      is_active: true,
      is_pickable: true,
      is_receivable: true
    },
    {
      org_id: DEMO_ORG_ID,
      warehouse_id: finalWarehouseId,
      name: 'Zone B - Plumbing',
      code: 'B-00-00',
      type: 'zone',
      description: 'Plumbing supplies and fixtures',
      capacity: 800,
      current_count: 312,
      is_active: true,
      is_pickable: true,
      is_receivable: true
    }
  ];

  const { data, error } = await supabase
    .from('warehouse_locations')
    .upsert(locations, { onConflict: 'id' })
    .select();

  if (error) {
    console.log('  ❌ Error:', error.message);
  } else {
    console.log(`  ✅ Added ${data.length} locations`);
  }
}

async function seedDispatchAlerts() {
  console.log('\n🚨 Seeding dispatch_alerts...');

  const userId = await getRandomUser();

  const alerts = [
    {
      org_id: DEMO_ORG_ID,
      title: 'Traffic delay - Northern suburbs',
      message: 'Major traffic incident on Pacific Highway. Jobs in Lane Cove, Chatswood area may be delayed 30+ minutes.',
      type: 'warning',
      related_to_type: 'zones',
      is_acknowledged: false,
      expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
    },
    {
      org_id: DEMO_ORG_ID,
      title: 'Equipment recall notice',
      message: 'Recall notice for Daikin FTXM25 units. Check serial numbers before installation.',
      type: 'urgent',
      related_to_type: 'equipment',
      is_acknowledged: true,
      acknowledged_by: userId,
      acknowledged_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
      org_id: DEMO_ORG_ID,
      title: 'Crew Alpha running ahead',
      message: 'Crew Alpha completed job early. Available for reassignment.',
      type: 'info',
      related_to_type: 'crews',
      is_acknowledged: false,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    },
    {
      org_id: DEMO_ORG_ID,
      title: 'Parts shortage - Copper pipe',
      message: 'Low stock on 3/8" copper pipe. Restocking ETA: Tomorrow 10am.',
      type: 'warning',
      related_to_type: 'inventory_items',
      is_acknowledged: false,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const { data, error } = await supabase
    .from('dispatch_alerts')
    .upsert(alerts, { onConflict: 'id' })
    .select();

  if (error) {
    console.log('  ❌ Error:', error.message);
  } else {
    console.log(`  ✅ Added ${data.length} alerts`);
  }
}

async function seedRFQs() {
  console.log('\n📄 Seeding rfqs...');

  const suppliers = await getRandomAccount();
  const job = await getRandomJob();

  const rfqs = [
    {
      org_id: DEMO_ORG_ID,
      rfq_number: 'RFQ-2026-0001',
      title: 'HVAC Equipment for Commercial Project',
      description: 'Request for quotes on HVAC equipment for new office building installation',
      status: 'evaluating',
      supplier_ids: suppliers.map(s => s.id),
      line_items: [
        { name: 'Daikin VRV System 28kW', qty: 2, specs: 'Outdoor unit for multi-split system', unitPrice: 0 },
        { name: 'Indoor units - cassette type', qty: 8, specs: '2.5kW each, 4-way blow', unitPrice: 0 },
        { name: 'Refrigerant copper pipe', qty: 100, specs: '3/8" x 5/8" paired, per meter', unitPrice: 0 }
      ],
      issue_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      job_id: job?.id,
      total_value: 45000,
      notes: 'Prefer Daikin brand. Need competitive pricing for ongoing projects.'
    },
    {
      org_id: DEMO_ORG_ID,
      rfq_number: 'RFQ-2026-0002',
      title: 'Plumbing Fixtures Bulk Order',
      description: 'Monthly bulk order for standard plumbing fixtures',
      status: 'sent',
      supplier_ids: suppliers.slice(0, 2).map(s => s.id),
      line_items: [
        { name: 'Mixer tap - Chrome', qty: 20, specs: 'Basin mixer, standard', unitPrice: 0 },
        { name: 'Toilet suite', qty: 10, specs: 'Close coupled, WELS 4 star', unitPrice: 0 },
        { name: 'Shower head', qty: 15, specs: 'Rain shower, 200mm', unitPrice: 0 }
      ],
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total_value: 8500,
      terms: 'Net 30. Free delivery for orders over $5000.'
    }
  ];

  const { data, error } = await supabase
    .from('rfqs')
    .upsert(rfqs, { onConflict: 'id' })
    .select();

  if (error) {
    console.log('  ❌ Error:', error.message);
  } else {
    console.log(`  ✅ Added ${data.length} RFQs`);
  }

  return data;
}

async function seedSupplierQuotes(rfqs) {
  console.log('\n💰 Seeding supplier_quotes...');

  const suppliers = await getRandomAccount();

  if (!rfqs || rfqs.length === 0) {
    console.log('  ⚠️ No RFQs to create quotes for');
    return;
  }

  const quotes = [];

  // Create quotes for the first RFQ
  if (rfqs[0] && suppliers.length > 0) {
    quotes.push({
      org_id: DEMO_ORG_ID,
      quote_number: 'SQ-2026-0001',
      rfq_id: rfqs[0].id,
      supplier_id: suppliers[0]?.id,
      status: 'under_review',
      line_items: [
        { name: 'Daikin VRV System 28kW', qty: 2, unitPrice: 8500, total: 17000 },
        { name: 'Indoor units - cassette type', qty: 8, unitPrice: 1200, total: 9600 },
        { name: 'Refrigerant copper pipe', qty: 100, unitPrice: 45, total: 4500 }
      ],
      subtotal: 31100,
      tax_total: 3110,
      total: 34210,
      received_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      evaluation_score: 85,
      evaluation_notes: 'Competitive pricing, good delivery terms'
    });

    if (suppliers[1]) {
      quotes.push({
        org_id: DEMO_ORG_ID,
        quote_number: 'SQ-2026-0002',
        rfq_id: rfqs[0].id,
        supplier_id: suppliers[1]?.id,
        status: 'received',
        line_items: [
          { name: 'Daikin VRV System 28kW', qty: 2, unitPrice: 8200, total: 16400 },
          { name: 'Indoor units - cassette type', qty: 8, unitPrice: 1350, total: 10800 },
          { name: 'Refrigerant copper pipe', qty: 100, unitPrice: 42, total: 4200 }
        ],
        subtotal: 31400,
        tax_total: 3140,
        total: 34540,
        received_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
  }

  if (quotes.length > 0) {
    const { data, error } = await supabase
      .from('supplier_quotes')
      .upsert(quotes, { onConflict: 'id' })
      .select();

    if (error) {
      console.log('  ❌ Error:', error.message);
    } else {
      console.log(`  ✅ Added ${data.length} supplier quotes`);
    }
  }
}

async function seedOrganizationUsers() {
  console.log('\n👥 Seeding organization_users...');

  // Get existing users for the demo org
  const { data: users } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('org_id', DEMO_ORG_ID);

  if (!users || users.length === 0) {
    console.log('  ⚠️ No users found for demo org');
    return;
  }

  // Create organization_users links
  const orgUsers = users.map((user, index) => ({
    org_id: DEMO_ORG_ID,
    user_id: user.id,
    role: index === 0 ? 'owner' : (user.role === 'admin' ? 'admin' : 'member'),
    active: true
  }));

  const { data, error } = await supabase
    .from('organization_users')
    .upsert(orgUsers, { onConflict: 'org_id,user_id' })
    .select();

  if (error) {
    console.log('  ❌ Error:', error.message);
  } else {
    console.log(`  ✅ Linked ${data?.length || 0} users to org`);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('  SEEDING EMPTY TABLES');
  console.log('='.repeat(60));

  try {
    await seedOrganizationUsers();
    await seedTacticalQueue();
    await seedWarehouseLocations();
    await seedDispatchAlerts();
    const rfqs = await seedRFQs();
    await seedSupplierQuotes(rfqs);

    console.log('\n' + '='.repeat(60));
    console.log('  SEEDING COMPLETE');
    console.log('='.repeat(60));
    console.log('\nAll empty tables now have demo data.');
  } catch (err) {
    console.error('Error during seeding:', err);
  }
}

main().catch(console.error);
