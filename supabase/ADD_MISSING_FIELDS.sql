-- ============================================
-- ADD MISSING FIELDS TO EXISTING TABLES
-- Safe approach - no data loss
-- ============================================

-- ============================================
-- ACCOUNTS - Add missing fields
-- ============================================
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS address_street TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS address_suburb TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS address_city TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS address_state TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS address_postcode TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS address_country TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_address_street TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_address_suburb TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_address_city TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_address_state TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_address_postcode TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_address_country TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS shipping_address_street TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS shipping_address_suburb TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS shipping_address_city TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS shipping_address_state TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS shipping_address_postcode TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS shipping_address_country TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS annual_revenue DECIMAL(15,2);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS rating TEXT; -- Hot, Warm, Cold
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS parent_account_id UUID REFERENCES accounts(id);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS social_linkedin TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS social_twitter TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS social_facebook TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12,2);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS tax_number TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS custom_data JSONB;

-- ============================================
-- CONTACTS - Add missing fields
-- ============================================
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS fax TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS assistant_name TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS assistant_phone TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS reports_to_id UUID REFERENCES contacts(id);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS lead_source TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address_street TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address_suburb TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address_city TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address_state TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address_postcode TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address_country TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS mailing_address_street TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS mailing_address_suburb TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS mailing_address_city TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS mailing_address_state TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS mailing_address_postcode TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS mailing_address_country TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS social_linkedin TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS social_twitter TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS social_facebook TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_decision_maker BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS email_opt_out BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS custom_data JSONB;

-- ============================================
-- LEADS - Add missing fields
-- ============================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS annual_revenue DECIMAL(15,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS rating TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_owner_id UUID REFERENCES users(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS mailing_address_street TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS mailing_address_suburb TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS mailing_address_city TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS mailing_address_state TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS mailing_address_postcode TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS mailing_address_country TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS custom_fields JSONB;

-- ============================================
-- DEALS - Add missing fields
-- ============================================
ALTER TABLE deals ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS close_reason TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS lost_reason TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS competitor TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS next_step TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE deals ADD COLUMN IF NOT EXISTS products JSONB; -- Array of products in this deal
ALTER TABLE deals ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE deals ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);

-- ============================================
-- TASKS - Add missing fields
-- ============================================
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_datetime TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_rule TEXT; -- RRULE format
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subtasks JSONB;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS time_estimate_hours DECIMAL(5,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS time_spent_hours DECIMAL(5,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);

-- ============================================
-- CALENDAR EVENTS - Add missing fields
-- ============================================
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS attendees JSONB; -- Array of attendee objects
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS organizer_id UUID REFERENCES users(id);
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS meeting_url TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS meeting_platform TEXT; -- Zoom, Teams, Meet, etc.
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS reminder_minutes INTEGER[];
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS recurrence_rule TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS visibility TEXT; -- public, private
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS status TEXT; -- confirmed, tentative, cancelled
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS tags TEXT[];

-- ============================================
-- CAMPAIGNS - Add missing fields
-- ============================================
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planning'; -- planning, active, paused, completed
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS expected_revenue DECIMAL(12,2);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS actual_revenue DECIMAL(12,2);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS goals TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS metrics JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS leads_generated INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS deals_generated INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS emails_sent INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS emails_opened INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS emails_clicked INTEGER DEFAULT 0;

-- ============================================
-- TICKETS - Add missing fields
-- ============================================
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS channel TEXT; -- email, phone, chat, portal, social
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolution TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolution_time_minutes INTEGER;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS first_response_time_minutes INTEGER;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS attachments JSONB;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS satisfaction_rating INTEGER; -- 1-5
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS satisfaction_comment TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT false;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS escalated_to UUID REFERENCES users(id);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- ============================================
-- PRODUCTS - Add missing fields
-- ============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_order_quantity INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS lead_time_days INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin_country TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS hs_code TEXT; -- Harmonized System code for customs
ALTER TABLE products ADD COLUMN IF NOT EXISTS requires_shipping BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_taxable BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price DECIMAL(12,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_start_date DATE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_end_date DATE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating_average DECIMAL(3,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0;

-- ============================================
-- SERVICES - Add missing fields
-- ============================================
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS recurring_interval TEXT; -- daily, weekly, monthly, quarterly, yearly
ALTER TABLE services ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS trial_period_days INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS setup_fee DECIMAL(12,2);
ALTER TABLE services ADD COLUMN IF NOT EXISTS cancellation_fee DECIMAL(12,2);
ALTER TABLE services ADD COLUMN IF NOT EXISTS min_commitment_months INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS rating_average DECIMAL(3,2);
ALTER TABLE services ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS booking_count INTEGER DEFAULT 0;

-- ============================================
-- QUOTES - Add missing fields (if table exists)
-- ============================================
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS quote_number TEXT;
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'; -- draft, sent, viewed, accepted, rejected, expired
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS valid_until DATE;
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS terms TEXT;
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2);
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2);
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2);
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2);
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(12,2);
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2);
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS line_items JSONB;
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS converted_to_deal_id UUID;
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);
ALTER TABLE IF EXISTS quotes ADD COLUMN IF NOT EXISTS tags TEXT[];

-- ============================================
-- INVOICES - Add missing fields (if table exists)
-- ============================================
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'; -- draft, sent, viewed, paid, overdue, cancelled
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS issue_date DATE;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS paid_date DATE;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS payment_terms TEXT; -- Net 30, Net 60, Due on Receipt, etc.
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2);
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2);
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2);
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2);
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(12,2);
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2);
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(12,2) DEFAULT 0;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS amount_due DECIMAL(12,2);
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS line_items JSONB;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS attachments TEXT[];

-- ============================================
-- JOBS - Add missing fields (Field Services)
-- ============================================
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS job_number TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS job_type TEXT; -- installation, repair, maintenance, inspection, etc.
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS actual_start TIMESTAMPTZ;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS actual_end TIMESTAMPTZ;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS duration_estimate_hours DECIMAL(5,2);
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS duration_actual_hours DECIMAL(5,2);
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS assigned_crew_id UUID;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS assigned_technician_id UUID REFERENCES users(id);
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS equipment_needed TEXT[];
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS materials_needed JSONB;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS site_address_street TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS site_address_suburb TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS site_address_city TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS site_address_state TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS site_address_postcode TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS site_address_country TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS site_contact_name TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS site_contact_phone TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS special_instructions TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS completion_notes TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS customer_signature TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS technician_signature TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS photos TEXT[];
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS custom_data JSONB;

-- ============================================
-- Add indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_accounts_owner_id ON accounts(owner_id);
CREATE INDEX IF NOT EXISTS idx_accounts_parent_account_id ON accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_contacts_account_id ON contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_reports_to_id ON contacts(reports_to_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_lead_owner_id ON leads(lead_owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_account_id ON deals(account_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_assignee_id ON deals(assignee_id);
CREATE INDEX IF NOT EXISTS idx_deals_owner_id ON deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_related_to_id ON tasks(related_to_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_organizer_id ON calendar_events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_requester_id ON tickets(requester_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee_id ON tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- ============================================
-- Success message
-- ============================================
SELECT 'All missing fields added successfully!' AS status;
