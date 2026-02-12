-- ============================================
-- CatchaCRM - Add ALL Missing Columns
-- Generated from types.ts on 2026-02-11
-- Run this to add any missing columns to existing tables
-- Safe to run multiple times (uses IF NOT EXISTS pattern)
-- ============================================

-- ============================================
-- USERS
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'agent';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS team TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- ACCOUNTS
-- ============================================
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS tier TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS address JSONB;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS custom_data JSONB;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- CONTACTS
-- ============================================
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS account_id UUID;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address JSONB;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS custom_data JSONB;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- LEADS
-- ============================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS account_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(12,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS temperature TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contact_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_to_deal_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_by TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS custom_data JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- DEALS
-- ============================================
ALTER TABLE deals ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS account_id UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS contact_id UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'discovery';
ALTER TABLE deals ADD COLUMN IF NOT EXISTS probability DECIMAL(5,2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS expected_close_date DATE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS assignee_id UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS stage_entry_date DATE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS campaign_id UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(12,2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS lead_id UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS won_at TIMESTAMPTZ;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS created_account_id UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS created_contact_id UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS custom_data JSONB;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- CAMPAIGNS
-- ============================================
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS budget DECIMAL(12,2);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS spent DECIMAL(12,2) DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS revenue DECIMAL(12,2) DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS revenue_generated DECIMAL(12,2) DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS leads_generated INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Planning';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS expected_cpl DECIMAL(10,2);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS template_id UUID;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- TASKS
-- ============================================
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_id UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS related_to_id UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS related_to_type TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS related_entity_id UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS related_entity_type TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- TICKETS
-- ============================================
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_number TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS requester_id UUID;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS account_id UUID;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assignee_id UUID;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Open';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS messages JSONB DEFAULT '[]';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS internal_notes JSONB DEFAULT '[]';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS custom_data JSONB;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS related_to_id UUID;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS related_to_type TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- CALENDAR_EVENTS
-- ============================================
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS related_to_type TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS related_to_id UUID;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS priority TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN DEFAULT false;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- COMMUNICATIONS
-- ============================================
ALTER TABLE communications ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS direction TEXT;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS related_to_type TEXT;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS related_to_id UUID;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS outcome TEXT;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS next_step TEXT;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS next_follow_up_date DATE;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- PRODUCTS
-- ============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(12,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_level INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_point INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_months INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_details TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS custom_fields JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- SERVICES
-- ============================================
ALTER TABLE services ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE services ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'one-off';
ALTER TABLE services ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12,2);
ALTER TABLE services ADD COLUMN IF NOT EXISTS cost_price DECIMAL(12,2);
ALTER TABLE services ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 10;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration_hours INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS prerequisites TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS deliverables TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS skills_required JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS crew_size INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS equipment_needed JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sla_response_hours INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sla_completion_days INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS quality_checklist JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS images JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS tags JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS custom_fields JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE services ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- QUOTES
-- ============================================
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_number TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS deal_id UUID;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS account_id UUID;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS issue_date DATE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS valid_until DATE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS tax_total DECIMAL(12,2);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS total DECIMAL(12,2);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS terms TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS accepted_by TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS superseded_by UUID;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- INVOICES
-- ============================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS account_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deal_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS quote_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS issue_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_total DECIMAL(12,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total DECIMAL(12,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS terms TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS credits JSONB;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- SUBSCRIPTIONS (NO mrr - matches types.ts)
-- ============================================
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS account_id UUID;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS next_bill_date DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS auto_generate_invoice BOOLEAN DEFAULT true;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_invoice_id UUID;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- BANK_TRANSACTIONS
-- ============================================
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2);
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unmatched';
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS match_confidence TEXT DEFAULT 'none';
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS matched_to_id UUID;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS matched_to_type TEXT;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS reconciled BOOLEAN DEFAULT false;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMPTZ;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS reconciled_by TEXT;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS bank_reference TEXT;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- EXPENSES
-- ============================================
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS vendor TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- CREWS
-- ============================================
ALTER TABLE crews ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE crews ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE crews ADD COLUMN IF NOT EXISTS leader_id UUID;
ALTER TABLE crews ADD COLUMN IF NOT EXISTS member_ids UUID[];
ALTER TABLE crews ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE crews ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE crews ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- ZONES
-- ============================================
ALTER TABLE zones ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- JOBS
-- ============================================
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_number TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS account_id UUID;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS assignee_id UUID;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS crew_id UUID;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Scheduled';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS zone TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS estimated_duration INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS scheduled_date DATE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS scheduled_end_date DATE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS lat DECIMAL(10,8);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS lng DECIMAL(11,8);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_fields JSONB;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS swms_signed BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS completion_signature TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS evidence_photos JSONB;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS bom JSONB;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS invoice_id UUID;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- EQUIPMENT
-- ============================================
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS condition TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS last_service_date DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS next_service_date DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(12,2);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- INVENTORY_ITEMS
-- ============================================
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS warehouse_qty INTEGER DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12,2);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- PURCHASE_ORDERS
-- ============================================
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS po_number TEXT;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS supplier_id UUID;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS account_id UUID;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS total DECIMAL(12,2);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS linked_job_id UUID;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- REVIEWS
-- ============================================
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'New';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS replied BOOLEAN DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reply_content TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS job_id UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS account_id UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS sentiment TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- REFERRAL_REWARDS
-- ============================================
ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS referrer_id UUID;
ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS referred_lead_id UUID;
ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS reward_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS payout_date DATE;
ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- INBOUND_FORMS
-- ============================================
ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS fields JSONB DEFAULT '[]';
ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS submit_button_text TEXT DEFAULT 'Submit';
ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS success_message TEXT DEFAULT 'Thank you!';
ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS target_campaign_id UUID;
ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS submission_count INTEGER DEFAULT 0;
ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2);
ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS embed_code TEXT;
ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE inbound_forms ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- CHAT_WIDGETS
-- ============================================
ALTER TABLE chat_widgets ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE chat_widgets ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE chat_widgets ADD COLUMN IF NOT EXISTS page TEXT;
ALTER TABLE chat_widgets ADD COLUMN IF NOT EXISTS bubble_color TEXT DEFAULT '#3B82F6';
ALTER TABLE chat_widgets ADD COLUMN IF NOT EXISTS welcome_message TEXT DEFAULT 'Hi! How can we help?';
ALTER TABLE chat_widgets ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE chat_widgets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE chat_widgets ADD COLUMN IF NOT EXISTS routing_user_id UUID;
ALTER TABLE chat_widgets ADD COLUMN IF NOT EXISTS conversations INTEGER DEFAULT 0;
ALTER TABLE chat_widgets ADD COLUMN IF NOT EXISTS avg_response_time INTEGER;
ALTER TABLE chat_widgets ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE chat_widgets ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- CALCULATORS
-- ============================================
ALTER TABLE calculators ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE calculators ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE calculators ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE calculators ADD COLUMN IF NOT EXISTS base_rate DECIMAL(10,4);
ALTER TABLE calculators ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE calculators ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE calculators ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE calculators ADD COLUMN IF NOT EXISTS lead_conversion_rate DECIMAL(5,2);
ALTER TABLE calculators ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE calculators ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- AUTOMATION_WORKFLOWS
-- ============================================
ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS trigger JSONB;
ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS nodes JSONB DEFAULT '[]';
ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS execution_count INTEGER DEFAULT 0;
ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS last_run_at TIMESTAMPTZ;
ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- WEBHOOKS
-- ============================================
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS method TEXT DEFAULT 'POST';
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS headers JSONB;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS trigger_event TEXT;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMPTZ;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS success_count INTEGER DEFAULT 0;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS failure_count INTEGER DEFAULT 0;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- INDUSTRY_TEMPLATES
-- ============================================
ALTER TABLE industry_templates ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE industry_templates ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE industry_templates ADD COLUMN IF NOT EXISTS target_entity TEXT;
ALTER TABLE industry_templates ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE industry_templates ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]';
ALTER TABLE industry_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE industry_templates ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE industry_templates ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE industry_templates ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- CONVERSATIONS
-- ============================================
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS participant_ids UUID[];
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- CHAT_MESSAGES
-- ============================================
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS conversation_id UUID;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_id UUID;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- DOCUMENTS
-- ============================================
ALTER TABLE documents ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS related_to_type TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS related_to_id UUID;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- NOTIFICATIONS
-- ============================================
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- AUDIT_LOG
-- ============================================
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS previous_value TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS new_value TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- Done!
-- ============================================
SELECT 'Migration complete - all columns added!';
