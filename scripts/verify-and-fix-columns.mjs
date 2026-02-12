/**
 * Verify and Fix Columns - Compare UI types with database
 * Adds any missing columns to ensure UI<->DB alignment
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anawatvgypmrpbmjfcht.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYXdhdHZneXBtcnBibWpmY2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwNDMwOSwiZXhwIjoyMDg0MjgwMzA5fQ.njigvMg4pdmKMtoWngrgNtw1c59JcM9K_aAaHv-ddwU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

// Expected columns from UI types (from UI_TO_SUPABASE_SCHEMA.md)
const expectedColumns = {
  organizations: ['id', 'name', 'slug', 'plan', 'subscription_status', 'user_limit', 'storage_limit_gb', 'api_calls_per_day', 'current_user_count', 'current_storage_bytes', 'settings', 'created_at', 'updated_at'],
  organization_users: ['id', 'org_id', 'user_id', 'role', 'active', 'created_at', 'updated_at'],
  users: ['id', 'org_id', 'name', 'email', 'role', 'avatar', 'manager_id', 'team', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  accounts: ['id', 'org_id', 'name', 'industry', 'website', 'employee_count', 'avatar', 'tier', 'email', 'phone', 'city', 'state', 'logo', 'address', 'revenue', 'status', 'type', 'commission_rate', 'custom_data', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  contacts: ['id', 'org_id', 'name', 'account_id', 'email', 'phone', 'mobile', 'title', 'avatar', 'company', 'department', 'is_primary', 'status', 'address', 'custom_data', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  leads: ['id', 'org_id', 'name', 'company', 'email', 'phone', 'status', 'source', 'campaign_id', 'account_id', 'estimated_value', 'avatar', 'score', 'address', 'last_contact_date', 'notes', 'commission_rate', 'temperature', 'assigned_to', 'converted_to_deal_id', 'converted_at', 'converted_by', 'custom_data', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  deals: ['id', 'org_id', 'name', 'account_id', 'contact_id', 'amount', 'stage', 'probability', 'expected_close_date', 'assignee_id', 'avatar', 'stage_entry_date', 'campaign_id', 'commission_rate', 'commission_amount', 'notes', 'lead_id', 'won_at', 'created_account_id', 'created_contact_id', 'custom_data', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  tasks: ['id', 'org_id', 'title', 'description', 'assignee_id', 'due_date', 'status', 'priority', 'related_to_id', 'related_to_type', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  calendar_events: ['id', 'org_id', 'title', 'description', 'start_time', 'end_time', 'type', 'location', 'related_to_type', 'related_to_id', 'priority', 'is_all_day', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  campaigns: ['id', 'org_id', 'name', 'type', 'budget', 'spent', 'revenue', 'revenue_generated', 'leads_generated', 'status', 'start_date', 'end_date', 'description', 'expected_cpl', 'target_audience', 'template_id', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  communications: ['id', 'org_id', 'type', 'subject', 'content', 'direction', 'related_to_type', 'related_to_id', 'outcome', 'next_step', 'next_follow_up_date', 'duration', 'metadata', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  tickets: ['id', 'org_id', 'ticket_number', 'subject', 'description', 'requester_id', 'account_id', 'assignee_id', 'status', 'priority', 'sla_deadline', 'messages', 'internal_notes', 'custom_data', 'related_to_id', 'related_to_type', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  conversations: ['id', 'org_id', 'participant_ids', 'participants', 'name', 'is_system', 'type', 'is_active', 'last_message_at', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  chat_messages: ['id', 'org_id', 'conversation_id', 'sender_id', 'content', 'mentions', 'attachments', 'is_edited', 'edited_at', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  crews: ['id', 'org_id', 'name', 'leader_id', 'member_ids', 'color', 'specialty', 'status', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  zones: ['id', 'org_id', 'name', 'region', 'description', 'color', 'type', 'status', 'coordinates', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  jobs: ['id', 'org_id', 'job_number', 'name', 'subject', 'description', 'account_id', 'assignee_id', 'crew_id', 'job_type', 'status', 'priority', 'zone', 'estimated_duration', 'scheduled_date', 'scheduled_end_date', 'completed_at', 'lat', 'lng', 'job_fields', 'swms_signed', 'completion_signature', 'evidence_photos', 'bom', 'invoice_id', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  equipment: ['id', 'org_id', 'name', 'type', 'barcode', 'condition', 'location', 'assigned_to', 'last_service_date', 'next_service_date', 'purchase_date', 'purchase_price', 'model', 'status', 'value', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  inventory_items: ['id', 'org_id', 'name', 'sku', 'warehouse_qty', 'reorder_point', 'category', 'unit_price', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  purchase_orders: ['id', 'org_id', 'po_number', 'supplier_id', 'account_id', 'status', 'items', 'total', 'linked_job_id', 'expected_delivery', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  bank_transactions: ['id', 'org_id', 'date', 'description', 'amount', 'type', 'status', 'match_confidence', 'matched_to_id', 'matched_to_type', 'reconciled', 'reconciled_at', 'reconciled_by', 'bank_reference', 'notes', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  expenses: ['id', 'org_id', 'vendor', 'amount', 'category', 'date', 'status', 'receipt_url', 'approved_by', 'notes', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  products: ['id', 'org_id', 'name', 'sku', 'code', 'description', 'category', 'type', 'unit_price', 'cost_price', 'tax_rate', 'is_active', 'stock_level', 'reorder_point', 'reorder_quantity', 'specifications', 'images', 'dimensions', 'weight', 'manufacturer', 'supplier', 'supplier_sku', 'warranty_months', 'warranty_details', 'tags', 'custom_fields', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  services: ['id', 'org_id', 'name', 'code', 'sku', 'description', 'category', 'type', 'billing_cycle', 'unit_price', 'cost_price', 'tax_rate', 'is_active', 'duration_hours', 'duration_minutes', 'prerequisites', 'deliverables', 'skills_required', 'crew_size', 'equipment_needed', 'sla_response_hours', 'sla_completion_days', 'quality_checklist', 'images', 'tags', 'custom_fields', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  quotes: ['id', 'org_id', 'quote_number', 'deal_id', 'account_id', 'status', 'issue_date', 'expiry_date', 'line_items', 'subtotal', 'tax_total', 'total', 'notes', 'terms', 'accepted_at', 'accepted_by', 'superseded_by', 'version', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  invoices: ['id', 'org_id', 'invoice_number', 'account_id', 'deal_id', 'quote_id', 'status', 'payment_status', 'issue_date', 'invoice_date', 'due_date', 'sent_at', 'paid_at', 'line_items', 'subtotal', 'tax_total', 'total', 'amount_paid', 'balance_due', 'late_fee_rate', 'notes', 'terms', 'credits', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  subscriptions: ['id', 'org_id', 'account_id', 'name', 'status', 'billing_cycle', 'next_bill_date', 'start_date', 'end_date', 'items', 'auto_generate_invoice', 'last_invoice_id', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  payments: ['id', 'org_id', 'invoice_id', 'amount', 'payment_date', 'payment_method', 'method', 'status', 'transaction_id', 'reference_number', 'reference', 'notes', 'processed_by', 'paid_at', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  currencies: ['id', 'org_id', 'iso_code', 'name', 'symbol', 'conversion_rate', 'decimal_places', 'is_active', 'is_corporate', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  documents: ['id', 'org_id', 'title', 'name', 'file_type', 'file_size', 'url', 'file_url', 'related_to_type', 'related_to_id', 'content_text', 'embedding', 'processing_status', 'processed_at', 'uploaded_by', 'version', 'parent_document_id', 'description', 'tags', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  notifications: ['id', 'org_id', 'title', 'message', 'content', 'type', 'read', 'is_read', 'read_at', 'link', 'action_url', 'user_id', 'related_to_type', 'related_to_id', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  audit_log: ['id', 'org_id', 'entity_type', 'entity_id', 'action', 'previous_value', 'new_value', 'metadata', 'batch_id', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  reviews: ['id', 'org_id', 'author_name', 'rating', 'content', 'platform', 'status', 'replied', 'reply_content', 'replied_at', 'job_id', 'account_id', 'sentiment', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  referral_rewards: ['id', 'org_id', 'referrer_id', 'referred_lead_id', 'reward_amount', 'status', 'payout_date', 'notes', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  inbound_forms: ['id', 'org_id', 'name', 'type', 'fields', 'submit_button_text', 'success_message', 'target_campaign_id', 'submission_count', 'conversion_rate', 'status', 'embed_code', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  chat_widgets: ['id', 'org_id', 'name', 'page', 'bubble_color', 'welcome_message', 'is_active', 'status', 'routing_user_id', 'conversations', 'avg_response_time', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  calculators: ['id', 'org_id', 'name', 'type', 'base_rate', 'is_active', 'status', 'usage_count', 'lead_conversion_rate', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  automation_workflows: ['id', 'org_id', 'name', 'description', 'trigger', 'nodes', 'is_active', 'execution_count', 'last_run_at', 'category', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  webhooks: ['id', 'org_id', 'name', 'url', 'method', 'headers', 'is_active', 'trigger_event', 'last_triggered_at', 'success_count', 'failure_count', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  industry_templates: ['id', 'org_id', 'name', 'target_entity', 'industry', 'sections', 'is_active', 'version', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  warehouses: ['id', 'org_id', 'name', 'address', 'is_default', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  roles: ['id', 'org_id', 'name', 'label', 'description', 'is_system', 'color', 'parent_role_id', 'hierarchy_level', 'can_view_all_data', 'can_modify_all_data', 'portal_type', 'created_at', 'updated_at', 'created_by'],
  tactical_queue: ['id', 'org_id', 'title', 'description', 'priority', 'priority_score', 'status', 'assignee_id', 'sla_deadline', 'escalation_level', 'related_to_type', 'related_to_id', 'related_to_name', 'notes', 'resolved_at', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  warehouse_locations: ['id', 'org_id', 'warehouse_id', 'name', 'code', 'type', 'description', 'capacity', 'current_count', 'is_active', 'is_pickable', 'is_receivable', 'parent_location_id', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  dispatch_alerts: ['id', 'org_id', 'title', 'message', 'type', 'related_to_type', 'related_to_id', 'is_acknowledged', 'acknowledged_by', 'acknowledged_at', 'expires_at', 'is_dismissed', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  rfqs: ['id', 'org_id', 'rfq_number', 'title', 'description', 'status', 'supplier_ids', 'line_items', 'issue_date', 'due_date', 'valid_until', 'purchase_order_id', 'job_id', 'winning_supplier_id', 'awarded_at', 'total_value', 'notes', 'terms', 'created_at', 'updated_at', 'created_by', 'owner_id'],
  supplier_quotes: ['id', 'org_id', 'quote_number', 'rfq_id', 'supplier_id', 'status', 'line_items', 'subtotal', 'tax_total', 'total', 'received_date', 'valid_until', 'evaluation_score', 'evaluation_notes', 'created_at', 'updated_at', 'created_by', 'owner_id']
};

// Column type mapping for ALTER TABLE
const columnTypes = {
  // Common types
  'id': 'UUID DEFAULT gen_random_uuid()',
  'org_id': 'UUID',
  'created_at': 'TIMESTAMPTZ DEFAULT NOW()',
  'updated_at': 'TIMESTAMPTZ DEFAULT NOW()',
  'created_by': 'UUID',
  'owner_id': 'UUID',

  // Common columns by name
  'name': 'TEXT',
  'email': 'TEXT',
  'phone': 'TEXT',
  'mobile': 'TEXT',
  'title': 'TEXT',
  'description': 'TEXT',
  'subject': 'TEXT',
  'content': 'TEXT',
  'message': 'TEXT',
  'notes': 'TEXT',
  'status': 'TEXT',
  'type': 'TEXT',
  'category': 'TEXT',
  'priority': 'TEXT',
  'source': 'TEXT',
  'slug': 'TEXT',
  'code': 'TEXT',
  'sku': 'TEXT',
  'avatar': 'TEXT',
  'logo': 'TEXT',
  'url': 'TEXT',
  'method': 'TEXT',
  'color': 'TEXT',
  'role': 'TEXT',
  'team': 'TEXT',
  'company': 'TEXT',
  'industry': 'TEXT',
  'website': 'TEXT',
  'city': 'TEXT',
  'state': 'TEXT',
  'region': 'TEXT',
  'location': 'TEXT',
  'zone': 'TEXT',
  'barcode': 'TEXT',
  'condition': 'TEXT',
  'model': 'TEXT',
  'platform': 'TEXT',
  'sentiment': 'TEXT',
  'direction': 'TEXT',
  'outcome': 'TEXT',
  'next_step': 'TEXT',
  'terms': 'TEXT',
  'label': 'TEXT',
  'portal_type': 'TEXT',
  'billing_cycle': 'TEXT',
  'payment_method': 'TEXT',
  'payment_status': 'TEXT',
  'iso_code': 'TEXT',
  'symbol': 'TEXT',
  'file_type': 'TEXT',
  'file_size': 'TEXT',
  'file_url': 'TEXT',
  'content_text': 'TEXT',
  'processing_status': 'TEXT',
  'embed_code': 'TEXT',
  'page': 'TEXT',
  'bubble_color': 'TEXT',
  'welcome_message': 'TEXT',
  'submit_button_text': 'TEXT',
  'success_message': 'TEXT',
  'manufacturer': 'TEXT',
  'supplier': 'TEXT',
  'supplier_sku': 'TEXT',
  'specifications': 'TEXT',
  'prerequisites': 'TEXT',
  'deliverables': 'TEXT',
  'warranty_details': 'TEXT',
  'trigger_event': 'TEXT',
  'target_entity': 'TEXT',
  'target_audience': 'TEXT',
  'job_number': 'TEXT',
  'ticket_number': 'TEXT',
  'quote_number': 'TEXT',
  'invoice_number': 'TEXT',
  'po_number': 'TEXT',
  'rfq_number': 'TEXT',
  'bank_reference': 'TEXT',
  'transaction_id': 'TEXT',
  'reference_number': 'TEXT',
  'reference': 'TEXT',
  'receipt_url': 'TEXT',
  'action_url': 'TEXT',
  'link': 'TEXT',
  'vendor': 'TEXT',
  'author_name': 'TEXT',
  'reply_content': 'TEXT',
  'completion_signature': 'TEXT',
  'job_type': 'TEXT',
  'specialty': 'TEXT',
  'temperature': 'TEXT',
  'match_confidence': 'TEXT',
  'matched_to_type': 'TEXT',
  'related_to_type': 'TEXT',
  'related_to_name': 'TEXT',
  'department': 'TEXT',

  // Foreign keys
  'account_id': 'UUID',
  'contact_id': 'UUID',
  'lead_id': 'UUID',
  'deal_id': 'UUID',
  'campaign_id': 'UUID',
  'assignee_id': 'UUID',
  'assigned_to': 'UUID',
  'requester_id': 'UUID',
  'manager_id': 'UUID',
  'leader_id': 'UUID',
  'user_id': 'UUID',
  'invoice_id': 'UUID',
  'quote_id': 'UUID',
  'job_id': 'UUID',
  'crew_id': 'UUID',
  'supplier_id': 'UUID',
  'template_id': 'UUID',
  'warehouse_id': 'UUID',
  'conversation_id': 'UUID',
  'sender_id': 'UUID',
  'referred_lead_id': 'UUID',
  'referrer_id': 'UUID',
  'target_campaign_id': 'UUID',
  'routing_user_id': 'UUID',
  'rfq_id': 'UUID',
  'linked_job_id': 'UUID',
  'last_invoice_id': 'UUID',
  'parent_document_id': 'UUID',
  'parent_role_id': 'UUID',
  'parent_location_id': 'UUID',
  'purchase_order_id': 'UUID',
  'winning_supplier_id': 'UUID',
  'superseded_by': 'UUID',
  'related_to_id': 'UUID',
  'matched_to_id': 'UUID',
  'converted_to_deal_id': 'UUID',
  'converted_by': 'UUID',
  'accepted_by': 'UUID',
  'approved_by': 'UUID',
  'reconciled_by': 'UUID',
  'processed_by': 'UUID',
  'uploaded_by': 'UUID',
  'acknowledged_by': 'UUID',
  'batch_id': 'UUID',
  'created_account_id': 'UUID',
  'created_contact_id': 'UUID',

  // Numeric
  'amount': 'NUMERIC(15,2)',
  'budget': 'NUMERIC(15,2)',
  'spent': 'NUMERIC(15,2)',
  'revenue': 'NUMERIC(15,2)',
  'revenue_generated': 'NUMERIC(15,2)',
  'estimated_value': 'NUMERIC(15,2)',
  'commission_rate': 'NUMERIC(5,2)',
  'commission_amount': 'NUMERIC(15,2)',
  'unit_price': 'NUMERIC(15,2)',
  'cost_price': 'NUMERIC(15,2)',
  'tax_rate': 'NUMERIC(5,2)',
  'subtotal': 'NUMERIC(15,2)',
  'tax_total': 'NUMERIC(15,2)',
  'total': 'NUMERIC(15,2)',
  'total_value': 'NUMERIC(15,2)',
  'amount_paid': 'NUMERIC(15,2)',
  'balance_due': 'NUMERIC(15,2)',
  'late_fee_rate': 'NUMERIC(5,2)',
  'reward_amount': 'NUMERIC(15,2)',
  'base_rate': 'NUMERIC(15,4)',
  'conversion_rate': 'NUMERIC(15,6)',
  'lead_conversion_rate': 'NUMERIC(5,2)',
  'expected_cpl': 'NUMERIC(15,2)',
  'purchase_price': 'NUMERIC(15,2)',
  'value': 'NUMERIC(15,2)',
  'lat': 'NUMERIC(10,7)',
  'lng': 'NUMERIC(10,7)',

  // Integer
  'probability': 'INTEGER',
  'score': 'INTEGER',
  'employee_count': 'INTEGER',
  'leads_generated': 'INTEGER',
  'stock_level': 'INTEGER',
  'reorder_point': 'INTEGER',
  'reorder_quantity': 'INTEGER',
  'warehouse_qty': 'INTEGER',
  'duration': 'INTEGER',
  'duration_hours': 'INTEGER',
  'duration_minutes': 'INTEGER',
  'estimated_duration': 'INTEGER',
  'sla_response_hours': 'INTEGER',
  'sla_completion_days': 'INTEGER',
  'warranty_months': 'INTEGER',
  'crew_size': 'INTEGER',
  'version': 'INTEGER DEFAULT 1',
  'execution_count': 'INTEGER DEFAULT 0',
  'usage_count': 'INTEGER DEFAULT 0',
  'submission_count': 'INTEGER DEFAULT 0',
  'success_count': 'INTEGER DEFAULT 0',
  'failure_count': 'INTEGER DEFAULT 0',
  'conversations': 'INTEGER DEFAULT 0',
  'avg_response_time': 'INTEGER',
  'decimal_places': 'INTEGER DEFAULT 2',
  'user_limit': 'INTEGER DEFAULT 5',
  'storage_limit_gb': 'INTEGER DEFAULT 10',
  'api_calls_per_day': 'INTEGER DEFAULT 1000',
  'current_user_count': 'INTEGER DEFAULT 0',
  'hierarchy_level': 'INTEGER DEFAULT 0',
  'capacity': 'INTEGER',
  'current_count': 'INTEGER DEFAULT 0',
  'priority_score': 'INTEGER DEFAULT 50',
  'escalation_level': 'INTEGER DEFAULT 0',
  'rating': 'INTEGER',
  'evaluation_score': 'INTEGER',

  // Bigint
  'current_storage_bytes': 'BIGINT DEFAULT 0',

  // Boolean
  'is_primary': 'BOOLEAN DEFAULT false',
  'is_active': 'BOOLEAN DEFAULT true',
  'active': 'BOOLEAN DEFAULT true',
  'is_all_day': 'BOOLEAN DEFAULT false',
  'is_edited': 'BOOLEAN DEFAULT false',
  'is_system': 'BOOLEAN DEFAULT false',
  'replied': 'BOOLEAN DEFAULT false',
  'read': 'BOOLEAN DEFAULT false',
  'is_read': 'BOOLEAN DEFAULT false',
  'reconciled': 'BOOLEAN DEFAULT false',
  'swms_signed': 'BOOLEAN DEFAULT false',
  'auto_generate_invoice': 'BOOLEAN DEFAULT true',
  'is_corporate': 'BOOLEAN DEFAULT false',
  'is_default': 'BOOLEAN DEFAULT false',
  'can_view_all_data': 'BOOLEAN DEFAULT false',
  'can_modify_all_data': 'BOOLEAN DEFAULT false',
  'is_pickable': 'BOOLEAN DEFAULT true',
  'is_receivable': 'BOOLEAN DEFAULT true',
  'is_acknowledged': 'BOOLEAN DEFAULT false',
  'is_dismissed': 'BOOLEAN DEFAULT false',

  // Date
  'due_date': 'DATE',
  'start_date': 'DATE',
  'end_date': 'DATE',
  'issue_date': 'DATE',
  'expiry_date': 'DATE',
  'invoice_date': 'DATE',
  'payment_date': 'DATE',
  'payout_date': 'DATE',
  'date': 'DATE',
  'last_service_date': 'DATE',
  'next_service_date': 'DATE',
  'purchase_date': 'DATE',
  'next_bill_date': 'DATE',
  'expected_close_date': 'DATE',
  'expected_delivery': 'DATE',
  'valid_until': 'DATE',
  'received_date': 'DATE',

  // Timestamp
  'start_time': 'TIMESTAMPTZ',
  'end_time': 'TIMESTAMPTZ',
  'scheduled_date': 'TIMESTAMPTZ',
  'scheduled_end_date': 'TIMESTAMPTZ',
  'completed_at': 'TIMESTAMPTZ',
  'won_at': 'TIMESTAMPTZ',
  'last_contact_date': 'TIMESTAMPTZ',
  'converted_at': 'TIMESTAMPTZ',
  'sla_deadline': 'TIMESTAMPTZ',
  'stage_entry_date': 'TIMESTAMPTZ',
  'accepted_at': 'TIMESTAMPTZ',
  'sent_at': 'TIMESTAMPTZ',
  'paid_at': 'TIMESTAMPTZ',
  'replied_at': 'TIMESTAMPTZ',
  'last_triggered_at': 'TIMESTAMPTZ',
  'last_run_at': 'TIMESTAMPTZ',
  'last_message_at': 'TIMESTAMPTZ',
  'edited_at': 'TIMESTAMPTZ',
  'next_follow_up_date': 'TIMESTAMPTZ',
  'reconciled_at': 'TIMESTAMPTZ',
  'read_at': 'TIMESTAMPTZ',
  'processed_at': 'TIMESTAMPTZ',
  'resolved_at': 'TIMESTAMPTZ',
  'awarded_at': 'TIMESTAMPTZ',
  'acknowledged_at': 'TIMESTAMPTZ',
  'expires_at': 'TIMESTAMPTZ',

  // JSONB
  'address': 'JSONB',
  'custom_data': 'JSONB DEFAULT \'{}\'',
  'custom_fields': 'JSONB DEFAULT \'{}\'',
  'settings': 'JSONB DEFAULT \'{}\'',
  'metadata': 'JSONB DEFAULT \'{}\'',
  'messages': 'JSONB DEFAULT \'[]\'',
  'internal_notes': 'JSONB DEFAULT \'[]\'',
  'line_items': 'JSONB DEFAULT \'[]\'',
  'items': 'JSONB DEFAULT \'[]\'',
  'fields': 'JSONB DEFAULT \'[]\'',
  'trigger': 'JSONB',
  'nodes': 'JSONB DEFAULT \'[]\'',
  'headers': 'JSONB DEFAULT \'{}\'',
  'sections': 'JSONB DEFAULT \'[]\'',
  'coordinates': 'JSONB',
  'job_fields': 'JSONB DEFAULT \'[]\'',
  'bom': 'JSONB DEFAULT \'[]\'',
  'credits': 'JSONB DEFAULT \'[]\'',
  'dimensions': 'JSONB',
  'weight': 'JSONB',
  'images': 'JSONB DEFAULT \'[]\'',
  'tags': 'JSONB DEFAULT \'[]\'',
  'skills_required': 'JSONB DEFAULT \'[]\'',
  'equipment_needed': 'JSONB DEFAULT \'[]\'',
  'quality_checklist': 'JSONB DEFAULT \'[]\'',
  'embedding': 'FLOAT[] DEFAULT \'{}\'',

  // Arrays
  'participant_ids': 'UUID[] DEFAULT \'{}\'',
  'participants': 'UUID[] DEFAULT \'{}\'',
  'member_ids': 'UUID[] DEFAULT \'{}\'',
  'mentions': 'UUID[] DEFAULT \'{}\'',
  'attachments': 'TEXT[] DEFAULT \'{}\'',
  'evidence_photos': 'TEXT[] DEFAULT \'{}\'',
  'supplier_ids': 'UUID[] DEFAULT \'{}\''
};

async function getTableColumns(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (error) {
    return null;
  }

  if (data && data.length > 0) {
    return Object.keys(data[0]);
  }

  // Try with limit 0 to get schema
  const { data: data2, error: error2 } = await supabase
    .from(tableName)
    .select('*')
    .limit(0);

  // For empty tables, try inserting a minimal record to see what columns exist
  return [];
}

function getColumnType(columnName) {
  return columnTypes[columnName] || 'TEXT';
}

async function main() {
  console.log('='.repeat(60));
  console.log('  COLUMN VERIFICATION & FIX REPORT');
  console.log('='.repeat(60));

  const missingByTable = {};
  let totalMissing = 0;
  let totalTables = 0;

  for (const [table, expectedCols] of Object.entries(expectedColumns)) {
    const actualCols = await getTableColumns(table);

    if (actualCols === null) {
      console.log(`\n❌ ${table}: TABLE DOES NOT EXIST`);
      missingByTable[table] = { exists: false, missing: expectedCols };
      totalMissing += expectedCols.length;
      totalTables++;
      continue;
    }

    const missing = expectedCols.filter(col => !actualCols.includes(col));

    if (missing.length > 0) {
      console.log(`\n⚠️ ${table}: Missing ${missing.length} columns`);
      missing.forEach(col => console.log(`   - ${col}`));
      missingByTable[table] = { exists: true, missing };
      totalMissing += missing.length;
    } else {
      console.log(`\n✅ ${table}: All ${expectedCols.length} columns present`);
    }
    totalTables++;
  }

  console.log('\n' + '='.repeat(60));
  console.log('  SUMMARY');
  console.log('='.repeat(60));
  console.log(`Tables checked: ${totalTables}`);
  console.log(`Total missing columns: ${totalMissing}`);

  if (totalMissing > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('  ALTER TABLE STATEMENTS');
    console.log('='.repeat(60));

    for (const [table, info] of Object.entries(missingByTable)) {
      if (!info.exists) {
        console.log(`\n-- Table ${table} needs to be created`);
        continue;
      }

      if (info.missing.length > 0) {
        console.log(`\n-- ${table}`);
        for (const col of info.missing) {
          const colType = getColumnType(col);
          console.log(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${colType};`);
        }
      }
    }
  }

  return { missingByTable, totalMissing };
}

main().catch(console.error);
