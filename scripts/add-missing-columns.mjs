/**
 * Add Missing Columns to Supabase Tables
 * Executes ALTER TABLE statements to add columns matching types.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anawatvgypmrpbmjfcht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYXdhdHZneXBtcnBibWpmY2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwNDMwOSwiZXhwIjoyMDg0MjgwMzA5fQ.njigvMg4pdmKMtoWngrgNtw1c59JcM9K_aAaHv-ddwU';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// All columns needed for each table (from types.ts)
const tableColumns = {
  users: {
    name: 'TEXT',
    email: 'TEXT',
    role: 'TEXT',
    avatar: 'TEXT',
    manager_id: 'UUID',
    team: 'TEXT',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  accounts: {
    name: 'TEXT',
    industry: 'TEXT',
    website: 'TEXT',
    employee_count: 'INTEGER',
    avatar: 'TEXT',
    tier: 'TEXT',
    email: 'TEXT',
    city: 'TEXT',
    state: 'TEXT',
    logo: 'TEXT',
    address: 'JSONB',
    commission_rate: 'DECIMAL(5,2)',
    custom_data: 'JSONB',
    status: 'TEXT DEFAULT \'Active\'',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  contacts: {
    name: 'TEXT',
    account_id: 'UUID',
    email: 'TEXT',
    phone: 'TEXT',
    title: 'TEXT',
    avatar: 'TEXT',
    company: 'TEXT',
    address: 'JSONB',
    is_primary: 'BOOLEAN DEFAULT false',
    custom_data: 'JSONB',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  leads: {
    name: 'TEXT',
    company: 'TEXT',
    email: 'TEXT',
    phone: 'TEXT',
    status: 'TEXT DEFAULT \'new\'',
    source: 'TEXT',
    campaign_id: 'UUID',
    account_id: 'UUID',
    estimated_value: 'DECIMAL(12,2)',
    avatar: 'TEXT',
    score: 'INTEGER DEFAULT 0',
    temperature: 'TEXT',
    address: 'JSONB',
    last_contact_date: 'DATE',
    notes: 'TEXT',
    commission_rate: 'DECIMAL(5,2)',
    converted_to_deal_id: 'UUID',
    converted_at: 'TIMESTAMPTZ',
    converted_by: 'TEXT',
    custom_data: 'JSONB',
    assigned_to: 'UUID',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  deals: {
    name: 'TEXT',
    account_id: 'UUID',
    contact_id: 'UUID',
    amount: 'DECIMAL(12,2)',
    stage: 'TEXT DEFAULT \'discovery\'',
    probability: 'DECIMAL(5,2)',
    expected_close_date: 'DATE',
    assignee_id: 'UUID',
    assigned_to: 'UUID',
    avatar: 'TEXT',
    stage_entry_date: 'DATE',
    campaign_id: 'UUID',
    commission_rate: 'DECIMAL(5,2)',
    commission_amount: 'DECIMAL(12,2)',
    lead_id: 'UUID',
    won_at: 'TIMESTAMPTZ',
    created_account_id: 'UUID',
    created_contact_id: 'UUID',
    notes: 'TEXT',
    custom_data: 'JSONB',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  campaigns: {
    name: 'TEXT',
    type: 'TEXT',
    budget: 'DECIMAL(12,2)',
    spent: 'DECIMAL(12,2) DEFAULT 0',
    revenue: 'DECIMAL(12,2) DEFAULT 0',
    revenue_generated: 'DECIMAL(12,2) DEFAULT 0',
    leads_generated: 'INTEGER DEFAULT 0',
    status: 'TEXT DEFAULT \'Planning\'',
    start_date: 'DATE',
    end_date: 'DATE',
    description: 'TEXT',
    expected_cpl: 'DECIMAL(10,2)',
    target_audience: 'TEXT',
    template_id: 'UUID',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  tasks: {
    title: 'TEXT',
    description: 'TEXT',
    assignee_id: 'UUID',
    assigned_to: 'UUID',
    due_date: 'DATE',
    status: 'TEXT DEFAULT \'pending\'',
    priority: 'TEXT DEFAULT \'medium\'',
    related_to_id: 'UUID',
    related_to_type: 'TEXT',
    related_entity_id: 'UUID',
    related_entity_type: 'TEXT',
    completed: 'BOOLEAN DEFAULT false',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  tickets: {
    ticket_number: 'TEXT',
    subject: 'TEXT',
    description: 'TEXT',
    requester_id: 'UUID',
    account_id: 'UUID',
    assignee_id: 'UUID',
    assigned_to: 'UUID',
    status: 'TEXT DEFAULT \'Open\'',
    priority: 'TEXT DEFAULT \'Medium\'',
    sla_deadline: 'TIMESTAMPTZ',
    messages: 'JSONB DEFAULT \'[]\'',
    internal_notes: 'JSONB DEFAULT \'[]\'',
    custom_data: 'JSONB',
    related_to_id: 'UUID',
    related_to_type: 'TEXT',
    resolved_at: 'TIMESTAMPTZ',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  calendar_events: {
    title: 'TEXT',
    description: 'TEXT',
    start_time: 'TIMESTAMPTZ',
    end_time: 'TIMESTAMPTZ',
    type: 'TEXT',
    location: 'TEXT',
    related_to_type: 'TEXT',
    related_to_id: 'UUID',
    priority: 'TEXT',
    is_all_day: 'BOOLEAN DEFAULT false',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  communications: {
    type: 'TEXT',
    subject: 'TEXT',
    content: 'TEXT',
    direction: 'TEXT',
    related_to_type: 'TEXT',
    related_to_id: 'UUID',
    outcome: 'TEXT',
    duration: 'TEXT',
    next_step: 'TEXT',
    next_follow_up_date: 'DATE',
    metadata: 'JSONB',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  products: {
    name: 'TEXT',
    sku: 'TEXT',
    code: 'TEXT',
    description: 'TEXT',
    category: 'TEXT',
    type: 'TEXT',
    unit_price: 'DECIMAL(12,2)',
    cost_price: 'DECIMAL(12,2)',
    tax_rate: 'DECIMAL(5,2) DEFAULT 10',
    is_active: 'BOOLEAN DEFAULT true',
    stock_level: 'INTEGER',
    reorder_point: 'INTEGER',
    reorder_quantity: 'INTEGER',
    specifications: 'TEXT',
    images: 'JSONB',
    dimensions: 'JSONB',
    weight: 'JSONB',
    manufacturer: 'TEXT',
    supplier: 'TEXT',
    supplier_sku: 'TEXT',
    warranty_months: 'INTEGER',
    warranty_details: 'TEXT',
    tags: 'JSONB',
    custom_fields: 'JSONB',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  services: {
    name: 'TEXT',
    code: 'TEXT',
    sku: 'TEXT',
    description: 'TEXT',
    category: 'TEXT',
    type: 'TEXT',
    billing_cycle: 'TEXT DEFAULT \'one-off\'',
    unit_price: 'DECIMAL(12,2)',
    cost_price: 'DECIMAL(12,2)',
    tax_rate: 'DECIMAL(5,2) DEFAULT 10',
    is_active: 'BOOLEAN DEFAULT true',
    duration_hours: 'INTEGER',
    duration_minutes: 'INTEGER',
    prerequisites: 'TEXT',
    deliverables: 'TEXT',
    skills_required: 'JSONB',
    crew_size: 'INTEGER',
    equipment_needed: 'JSONB',
    sla_response_hours: 'INTEGER',
    sla_completion_days: 'INTEGER',
    quality_checklist: 'JSONB',
    images: 'JSONB',
    tags: 'JSONB',
    custom_fields: 'JSONB',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  quotes: {
    quote_number: 'TEXT',
    deal_id: 'UUID',
    account_id: 'UUID',
    status: 'TEXT DEFAULT \'Draft\'',
    issue_date: 'DATE',
    expiry_date: 'DATE',
    valid_until: 'DATE',
    line_items: 'JSONB DEFAULT \'[]\'',
    subtotal: 'DECIMAL(12,2)',
    tax_total: 'DECIMAL(12,2)',
    total: 'DECIMAL(12,2)',
    notes: 'TEXT',
    terms: 'TEXT',
    accepted_at: 'TIMESTAMPTZ',
    accepted_by: 'TEXT',
    superseded_by: 'UUID',
    version: 'INTEGER DEFAULT 1',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  invoices: {
    invoice_number: 'TEXT',
    account_id: 'UUID',
    deal_id: 'UUID',
    quote_id: 'UUID',
    status: 'TEXT DEFAULT \'Draft\'',
    payment_status: 'TEXT DEFAULT \'unpaid\'',
    issue_date: 'DATE',
    invoice_date: 'DATE',
    due_date: 'DATE',
    sent_at: 'TIMESTAMPTZ',
    paid_at: 'TIMESTAMPTZ',
    line_items: 'JSONB DEFAULT \'[]\'',
    subtotal: 'DECIMAL(12,2)',
    tax_total: 'DECIMAL(12,2)',
    total: 'DECIMAL(12,2)',
    notes: 'TEXT',
    terms: 'TEXT',
    credits: 'JSONB',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  subscriptions: {
    account_id: 'UUID',
    name: 'TEXT',
    status: 'TEXT DEFAULT \'Active\'',
    billing_cycle: 'TEXT DEFAULT \'monthly\'',
    next_bill_date: 'DATE',
    start_date: 'DATE',
    end_date: 'DATE',
    items: 'JSONB DEFAULT \'[]\'',
    auto_generate_invoice: 'BOOLEAN DEFAULT true',
    last_invoice_id: 'UUID',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  bank_transactions: {
    date: 'DATE',
    description: 'TEXT',
    amount: 'DECIMAL(12,2)',
    type: 'TEXT',
    status: 'TEXT DEFAULT \'unmatched\'',
    match_confidence: 'TEXT DEFAULT \'none\'',
    matched_to_id: 'UUID',
    matched_to_type: 'TEXT',
    reconciled: 'BOOLEAN DEFAULT false',
    reconciled_at: 'TIMESTAMPTZ',
    reconciled_by: 'TEXT',
    bank_reference: 'TEXT',
    notes: 'TEXT',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  expenses: {
    vendor: 'TEXT',
    amount: 'DECIMAL(12,2)',
    category: 'TEXT',
    date: 'DATE',
    status: 'TEXT DEFAULT \'Pending\'',
    receipt_url: 'TEXT',
    approved_by: 'TEXT',
    notes: 'TEXT',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  crews: {
    name: 'TEXT',
    leader_id: 'UUID',
    member_ids: 'UUID[]',
    color: 'TEXT',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  zones: {
    name: 'TEXT',
    region: 'TEXT',
    description: 'TEXT',
    color: 'TEXT',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  jobs: {
    job_number: 'TEXT',
    name: 'TEXT',
    subject: 'TEXT',
    description: 'TEXT',
    account_id: 'UUID',
    assignee_id: 'UUID',
    crew_id: 'UUID',
    job_type: 'TEXT',
    status: 'TEXT DEFAULT \'Scheduled\'',
    priority: 'TEXT DEFAULT \'Medium\'',
    zone: 'TEXT',
    estimated_duration: 'INTEGER',
    scheduled_date: 'DATE',
    scheduled_end_date: 'DATE',
    completed_at: 'TIMESTAMPTZ',
    lat: 'DECIMAL(10,8)',
    lng: 'DECIMAL(11,8)',
    job_fields: 'JSONB',
    swms_signed: 'BOOLEAN DEFAULT false',
    completion_signature: 'TEXT',
    evidence_photos: 'JSONB',
    bom: 'JSONB',
    invoice_id: 'UUID',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  equipment: {
    name: 'TEXT',
    type: 'TEXT',
    barcode: 'TEXT',
    condition: 'TEXT',
    location: 'TEXT',
    assigned_to: 'UUID',
    last_service_date: 'DATE',
    next_service_date: 'DATE',
    purchase_date: 'DATE',
    purchase_price: 'DECIMAL(12,2)',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  inventory_items: {
    name: 'TEXT',
    sku: 'TEXT',
    warehouse_qty: 'INTEGER DEFAULT 0',
    reorder_point: 'INTEGER DEFAULT 0',
    category: 'TEXT',
    unit_price: 'DECIMAL(12,2)',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  purchase_orders: {
    po_number: 'TEXT',
    supplier_id: 'UUID',
    account_id: 'UUID',
    status: 'TEXT DEFAULT \'Draft\'',
    items: 'JSONB DEFAULT \'[]\'',
    total: 'DECIMAL(12,2)',
    linked_job_id: 'UUID',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  reviews: {
    author_name: 'TEXT',
    rating: 'INTEGER',
    content: 'TEXT',
    platform: 'TEXT',
    status: 'TEXT DEFAULT \'New\'',
    replied: 'BOOLEAN DEFAULT false',
    reply_content: 'TEXT',
    replied_at: 'TIMESTAMPTZ',
    job_id: 'UUID',
    account_id: 'UUID',
    sentiment: 'TEXT',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  referral_rewards: {
    referrer_id: 'UUID',
    referred_lead_id: 'UUID',
    reward_amount: 'DECIMAL(12,2) DEFAULT 0',
    status: 'TEXT DEFAULT \'Active\'',
    payout_date: 'DATE',
    notes: 'TEXT',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  inbound_forms: {
    name: 'TEXT',
    type: 'TEXT',
    fields: 'JSONB DEFAULT \'[]\'',
    submit_button_text: 'TEXT DEFAULT \'Submit\'',
    success_message: 'TEXT DEFAULT \'Thank you!\'',
    target_campaign_id: 'UUID',
    submission_count: 'INTEGER DEFAULT 0',
    conversion_rate: 'DECIMAL(5,2)',
    status: 'TEXT DEFAULT \'Active\'',
    embed_code: 'TEXT',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  chat_widgets: {
    name: 'TEXT',
    page: 'TEXT',
    bubble_color: 'TEXT DEFAULT \'#3B82F6\'',
    welcome_message: 'TEXT DEFAULT \'Hi! How can we help?\'',
    is_active: 'BOOLEAN DEFAULT true',
    status: 'TEXT DEFAULT \'Active\'',
    routing_user_id: 'UUID',
    conversations: 'INTEGER DEFAULT 0',
    avg_response_time: 'INTEGER',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  calculators: {
    name: 'TEXT',
    type: 'TEXT',
    base_rate: 'DECIMAL(10,4)',
    is_active: 'BOOLEAN DEFAULT true',
    status: 'TEXT DEFAULT \'Active\'',
    usage_count: 'INTEGER DEFAULT 0',
    lead_conversion_rate: 'DECIMAL(5,2)',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  automation_workflows: {
    name: 'TEXT',
    description: 'TEXT',
    trigger: 'JSONB',
    nodes: 'JSONB DEFAULT \'[]\'',
    is_active: 'BOOLEAN DEFAULT true',
    execution_count: 'INTEGER DEFAULT 0',
    last_run_at: 'TIMESTAMPTZ',
    category: 'TEXT',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  webhooks: {
    name: 'TEXT',
    url: 'TEXT',
    method: 'TEXT DEFAULT \'POST\'',
    headers: 'JSONB',
    is_active: 'BOOLEAN DEFAULT true',
    trigger_event: 'TEXT',
    last_triggered_at: 'TIMESTAMPTZ',
    success_count: 'INTEGER DEFAULT 0',
    failure_count: 'INTEGER DEFAULT 0',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  industry_templates: {
    name: 'TEXT',
    target_entity: 'TEXT',
    industry: 'TEXT',
    sections: 'JSONB DEFAULT \'[]\'',
    is_active: 'BOOLEAN DEFAULT true',
    version: 'INTEGER DEFAULT 1',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  conversations: {
    participant_ids: 'UUID[]',
    name: 'TEXT',
    is_system: 'BOOLEAN DEFAULT false',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  chat_messages: {
    conversation_id: 'UUID',
    sender_id: 'UUID',
    content: 'TEXT',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  documents: {
    title: 'TEXT',
    file_type: 'TEXT',
    file_size: 'TEXT',
    url: 'TEXT',
    related_to_type: 'TEXT',
    related_to_id: 'UUID',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  notifications: {
    user_id: 'UUID',
    title: 'TEXT',
    message: 'TEXT',
    type: 'TEXT DEFAULT \'info\'',
    read: 'BOOLEAN DEFAULT false',
    link: 'TEXT',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  audit_log: {
    entity_type: 'TEXT',
    entity_id: 'UUID',
    action: 'TEXT',
    previous_value: 'TEXT',
    new_value: 'TEXT',
    metadata: 'JSONB',
    batch_id: 'UUID',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  payments: {
    invoice_id: 'UUID',
    amount: 'DECIMAL(12,2)',
    method: 'TEXT',
    reference: 'TEXT',
    note: 'TEXT',
    paid_at: 'TIMESTAMPTZ DEFAULT NOW()',
    owner_id: 'UUID',
    created_by: 'TEXT'
  },
  warehouses: {
    name: 'TEXT',
    address: 'TEXT',
    is_default: 'BOOLEAN DEFAULT false',
    owner_id: 'UUID',
    created_by: 'TEXT'
  }
};

async function addMissingColumns() {
  console.log('🔧 Adding missing columns to all tables...\n');

  for (const [tableName, columns] of Object.entries(tableColumns)) {
    console.log(`📋 ${tableName}:`);

    for (const [columnName, columnType] of Object.entries(columns)) {
      // Try to add the column (will fail silently if exists)
      const sql = `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${columnName} ${columnType}`;

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
          // Column might already exist, try direct approach
          const { error: error2 } = await supabase
            .from(tableName)
            .select(columnName)
            .limit(0);

          if (error2 && error2.message.includes('does not exist')) {
            console.log(`  ❌ ${columnName}: Could not add`);
          } else {
            console.log(`  ✓ ${columnName}: exists`);
          }
        } else {
          console.log(`  ✅ ${columnName}: added`);
        }
      } catch (err) {
        // Silently handle - column likely exists
      }
    }
    console.log('');
  }
}

// Check what columns actually exist in each table
async function auditColumns() {
  console.log('🔍 Auditing table columns...\n');

  for (const [tableName, expectedColumns] of Object.entries(tableColumns)) {
    console.log(`📋 ${tableName}:`);

    const missingColumns = [];

    for (const columnName of Object.keys(expectedColumns)) {
      const { error } = await supabase
        .from(tableName)
        .select(columnName)
        .limit(0);

      if (error && error.message.includes('does not exist')) {
        missingColumns.push(columnName);
        console.log(`  ❌ ${columnName}: MISSING`);
      } else {
        console.log(`  ✓ ${columnName}`);
      }
    }

    if (missingColumns.length > 0) {
      console.log(`\n  ⚠️ ${missingColumns.length} columns missing: ${missingColumns.join(', ')}\n`);
    } else {
      console.log(`  ✅ All columns present\n`);
    }
  }
}

// Run audit first
auditColumns().catch(console.error);
