/**
 * Supabase Schema Audit Script
 * Reads all tables and columns from Supabase and compares with types.ts
 * Run with: npx tsx scripts/audit-supabase-schema.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

// Expected columns from types.ts (camelCase -> snake_case)
const expectedSchema: Record<string, string[]> = {
  users: ['id', 'org_id', 'name', 'email', 'role', 'avatar', 'manager_id', 'team', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  accounts: ['id', 'org_id', 'name', 'industry', 'website', 'employee_count', 'avatar', 'tier', 'email', 'city', 'state', 'logo', 'address', 'commission_rate', 'custom_data', 'status', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  contacts: ['id', 'org_id', 'name', 'account_id', 'email', 'phone', 'title', 'avatar', 'company', 'address', 'is_primary', 'custom_data', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  leads: ['id', 'org_id', 'name', 'company', 'email', 'phone', 'status', 'source', 'campaign_id', 'account_id', 'estimated_value', 'avatar', 'score', 'temperature', 'address', 'last_contact_date', 'notes', 'commission_rate', 'converted_to_deal_id', 'converted_at', 'converted_by', 'custom_data', 'assigned_to', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  deals: ['id', 'org_id', 'name', 'account_id', 'contact_id', 'amount', 'stage', 'probability', 'expected_close_date', 'assignee_id', 'assigned_to', 'avatar', 'stage_entry_date', 'campaign_id', 'commission_rate', 'commission_amount', 'lead_id', 'won_at', 'created_account_id', 'created_contact_id', 'notes', 'custom_data', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  campaigns: ['id', 'org_id', 'name', 'type', 'budget', 'spent', 'revenue', 'revenue_generated', 'leads_generated', 'status', 'start_date', 'end_date', 'description', 'expected_cpl', 'target_audience', 'template_id', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  tasks: ['id', 'org_id', 'title', 'description', 'assignee_id', 'assigned_to', 'due_date', 'status', 'priority', 'related_to_id', 'related_to_type', 'related_entity_id', 'related_entity_type', 'completed', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  tickets: ['id', 'org_id', 'ticket_number', 'subject', 'description', 'requester_id', 'account_id', 'assignee_id', 'assigned_to', 'status', 'priority', 'sla_deadline', 'messages', 'internal_notes', 'custom_data', 'related_to_id', 'related_to_type', 'resolved_at', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  calendar_events: ['id', 'org_id', 'title', 'description', 'start_time', 'end_time', 'type', 'location', 'related_to_type', 'related_to_id', 'priority', 'is_all_day', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  communications: ['id', 'org_id', 'type', 'subject', 'content', 'direction', 'related_to_type', 'related_to_id', 'outcome', 'duration', 'next_step', 'next_follow_up_date', 'metadata', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  products: ['id', 'org_id', 'name', 'sku', 'code', 'description', 'category', 'type', 'unit_price', 'cost_price', 'tax_rate', 'is_active', 'stock_level', 'reorder_point', 'reorder_quantity', 'specifications', 'images', 'dimensions', 'weight', 'manufacturer', 'supplier', 'supplier_sku', 'warranty_months', 'warranty_details', 'tags', 'custom_fields', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  services: ['id', 'org_id', 'name', 'code', 'sku', 'description', 'category', 'type', 'billing_cycle', 'unit_price', 'cost_price', 'tax_rate', 'is_active', 'duration_hours', 'duration_minutes', 'prerequisites', 'deliverables', 'skills_required', 'crew_size', 'equipment_needed', 'sla_response_hours', 'sla_completion_days', 'quality_checklist', 'images', 'tags', 'custom_fields', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  quotes: ['id', 'org_id', 'quote_number', 'deal_id', 'account_id', 'status', 'issue_date', 'expiry_date', 'valid_until', 'line_items', 'subtotal', 'tax_total', 'total', 'notes', 'terms', 'accepted_at', 'accepted_by', 'superseded_by', 'version', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  invoices: ['id', 'org_id', 'invoice_number', 'account_id', 'deal_id', 'quote_id', 'status', 'payment_status', 'issue_date', 'invoice_date', 'due_date', 'sent_at', 'paid_at', 'line_items', 'subtotal', 'tax_total', 'total', 'notes', 'terms', 'credits', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  subscriptions: ['id', 'org_id', 'account_id', 'name', 'status', 'billing_cycle', 'next_bill_date', 'start_date', 'end_date', 'items', 'auto_generate_invoice', 'last_invoice_id', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  bank_transactions: ['id', 'org_id', 'date', 'description', 'amount', 'type', 'status', 'match_confidence', 'matched_to_id', 'matched_to_type', 'reconciled', 'reconciled_at', 'reconciled_by', 'bank_reference', 'notes', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  expenses: ['id', 'org_id', 'vendor', 'amount', 'category', 'date', 'status', 'receipt_url', 'approved_by', 'notes', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  crews: ['id', 'org_id', 'name', 'leader_id', 'member_ids', 'color', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  zones: ['id', 'org_id', 'name', 'region', 'description', 'color', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  jobs: ['id', 'org_id', 'job_number', 'name', 'subject', 'description', 'account_id', 'assignee_id', 'crew_id', 'job_type', 'status', 'priority', 'zone', 'estimated_duration', 'scheduled_date', 'scheduled_end_date', 'completed_at', 'lat', 'lng', 'job_fields', 'swms_signed', 'completion_signature', 'evidence_photos', 'bom', 'invoice_id', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  equipment: ['id', 'org_id', 'name', 'type', 'barcode', 'condition', 'location', 'assigned_to', 'last_service_date', 'next_service_date', 'purchase_date', 'purchase_price', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  inventory_items: ['id', 'org_id', 'name', 'sku', 'warehouse_qty', 'reorder_point', 'category', 'unit_price', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  purchase_orders: ['id', 'org_id', 'po_number', 'supplier_id', 'account_id', 'status', 'items', 'total', 'linked_job_id', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  reviews: ['id', 'org_id', 'author_name', 'rating', 'content', 'platform', 'status', 'replied', 'reply_content', 'replied_at', 'job_id', 'account_id', 'sentiment', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  referral_rewards: ['id', 'org_id', 'referrer_id', 'referred_lead_id', 'reward_amount', 'status', 'payout_date', 'notes', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  inbound_forms: ['id', 'org_id', 'name', 'type', 'fields', 'submit_button_text', 'success_message', 'target_campaign_id', 'submission_count', 'conversion_rate', 'status', 'embed_code', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  chat_widgets: ['id', 'org_id', 'name', 'page', 'bubble_color', 'welcome_message', 'is_active', 'status', 'routing_user_id', 'conversations', 'avg_response_time', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  calculators: ['id', 'org_id', 'name', 'type', 'base_rate', 'is_active', 'status', 'usage_count', 'lead_conversion_rate', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  automation_workflows: ['id', 'org_id', 'name', 'description', 'trigger', 'nodes', 'is_active', 'execution_count', 'last_run_at', 'category', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  webhooks: ['id', 'org_id', 'name', 'url', 'method', 'headers', 'is_active', 'trigger_event', 'last_triggered_at', 'success_count', 'failure_count', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  industry_templates: ['id', 'org_id', 'name', 'target_entity', 'industry', 'sections', 'is_active', 'version', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  conversations: ['id', 'org_id', 'participant_ids', 'name', 'is_system', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  chat_messages: ['id', 'org_id', 'conversation_id', 'sender_id', 'content', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  documents: ['id', 'org_id', 'title', 'file_type', 'file_size', 'url', 'related_to_type', 'related_to_id', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  notifications: ['id', 'org_id', 'user_id', 'title', 'message', 'type', 'read', 'link', 'owner_id', 'created_at', 'updated_at', 'created_by'],

  audit_log: ['id', 'org_id', 'entity_type', 'entity_id', 'action', 'previous_value', 'new_value', 'metadata', 'batch_id', 'owner_id', 'created_at', 'updated_at', 'created_by'],
};

async function getSupabaseSchema(): Promise<Map<string, string[]>> {
  const { data, error } = await supabase.rpc('get_schema_info');

  if (error) {
    // Fallback: Query information_schema directly
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns' as any)
      .select('table_name, column_name')
      .eq('table_schema', 'public');

    if (schemaError) {
      console.error('Error fetching schema:', schemaError);

      // Last resort: use raw SQL
      const { data: rawData, error: rawError } = await supabase.rpc('exec_sql', {
        sql: `SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position`
      });

      if (rawError) {
        console.log('Creating helper function...');
        return new Map();
      }

      const schema = new Map<string, string[]>();
      for (const row of rawData || []) {
        const table = row.table_name;
        if (!schema.has(table)) schema.set(table, []);
        schema.get(table)!.push(row.column_name);
      }
      return schema;
    }

    const schema = new Map<string, string[]>();
    for (const row of columns || []) {
      const table = row.table_name;
      if (!schema.has(table)) schema.set(table, []);
      schema.get(table)!.push(row.column_name);
    }
    return schema;
  }

  const schema = new Map<string, string[]>();
  for (const row of data || []) {
    const table = row.table_name;
    if (!schema.has(table)) schema.set(table, []);
    schema.get(table)!.push(row.column_name);
  }
  return schema;
}

async function main() {
  console.log('🔍 Auditing Supabase Schema...\n');
  console.log(`Supabase URL: ${supabaseUrl}\n`);

  // Try to get list of tables first
  const { data: tables, error: tablesError } = await supabase
    .from('pg_tables' as any)
    .select('tablename')
    .eq('schemaname', 'public');

  if (tablesError) {
    console.log('Cannot query pg_tables directly, trying alternative...\n');
  } else {
    console.log('Tables found:', tables?.map(t => t.tablename).join(', '));
  }

  // Generate ALTER TABLE statements for missing columns
  console.log('\n📋 Generating migration SQL...\n');

  let sql = `-- Schema Migration: Add Missing Columns\n-- Generated: ${new Date().toISOString()}\n\n`;

  for (const [table, expectedColumns] of Object.entries(expectedSchema)) {
    sql += `-- Table: ${table}\n`;
    for (const col of expectedColumns) {
      if (['id', 'created_at', 'updated_at'].includes(col)) continue;

      let dataType = 'TEXT';
      if (col.endsWith('_id')) dataType = 'UUID';
      else if (col.endsWith('_ids')) dataType = 'UUID[]';
      else if (col.endsWith('_at')) dataType = 'TIMESTAMPTZ';
      else if (col.endsWith('_date')) dataType = 'DATE';
      else if (col === 'amount' || col.includes('price') || col.includes('total') || col.includes('rate')) dataType = 'DECIMAL(12,2)';
      else if (col === 'count' || col.endsWith('_count') || col === 'score' || col === 'rating') dataType = 'INTEGER';
      else if (col.startsWith('is_') || col === 'read' || col === 'reconciled' || col === 'replied' || col === 'completed') dataType = 'BOOLEAN DEFAULT false';
      else if (['items', 'line_items', 'messages', 'internal_notes', 'fields', 'nodes', 'sections', 'address', 'custom_data', 'metadata', 'headers', 'trigger', 'bom', 'job_fields', 'evidence_photos', 'images', 'dimensions', 'weight', 'tags', 'custom_fields', 'skills_required', 'equipment_needed', 'quality_checklist', 'credits'].includes(col)) dataType = 'JSONB';
      else if (col === 'lat') dataType = 'DECIMAL(10,8)';
      else if (col === 'lng') dataType = 'DECIMAL(11,8)';

      sql += `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${dataType};\n`;
    }
    sql += '\n';
  }

  // Write to file
  const outputPath = path.join(__dirname, '..', 'supabase', 'MIGRATION_ADD_COLUMNS.sql');
  fs.writeFileSync(outputPath, sql);
  console.log(`✅ Migration SQL written to: ${outputPath}`);

  // Also output to console
  console.log('\n--- SQL Preview ---\n');
  console.log(sql.slice(0, 3000) + '...\n');
}

main().catch(console.error);
