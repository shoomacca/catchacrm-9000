# UI TO SUPABASE SCHEMA MAPPING

**Generated:** 2026-02-11
**Source:** `src/types.ts` (1308 lines)
**Purpose:** Generate SQL schema from TypeScript interfaces

---

## ENTITY TYPE LIST (46 entities)

From `EntityType` union:
```
leads, deals, accounts, contacts, tasks, tickets, campaigns, users,
calendarEvents, invoices, quotes, products, services, subscriptions,
documents, communications, conversations, chatMessages, crews, jobs,
zones, equipment, inventoryItems, purchaseOrders, bankTransactions,
expenses, reviews, referralRewards, inboundForms, chatWidgets,
calculators, automationWorkflows, webhooks, industryTemplates,
currencies, payments, warehouses, roles, tacticalQueue,
warehouseLocations, dispatchAlerts, rfqs, supplierQuotes
```

---

## BASE FIELDS (CRMBase)

All entities inherit:
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
created_by UUID,
owner_id UUID
```

---

## TABLE DEFINITIONS FROM UI TYPES

### 1. organizations
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  user_limit INTEGER DEFAULT 5,
  storage_limit_gb INTEGER DEFAULT 10,
  api_calls_per_day INTEGER DEFAULT 1000,
  current_user_count INTEGER DEFAULT 0,
  current_storage_bytes BIGINT DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. organization_users
```sql
CREATE TABLE organization_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);
```

### 3. users (from User interface)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'agent', -- admin, manager, agent, technician
  avatar TEXT,
  manager_id UUID REFERENCES users(id),
  team TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 4. accounts (from Account interface)
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  employee_count INTEGER,
  avatar TEXT,
  tier TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  logo TEXT,
  address JSONB, -- { street, suburb, state, postcode, country }
  revenue NUMERIC(15,2),
  status TEXT DEFAULT 'Active', -- Active, Inactive, Prospect
  type TEXT, -- Customer, Vendor, Partner, Reseller
  commission_rate NUMERIC(5,2),
  custom_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);
```

### 5. contacts (from Contact interface)
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id),
  email TEXT,
  phone TEXT,
  mobile TEXT,
  title TEXT,
  avatar TEXT,
  company TEXT,
  department TEXT,
  is_primary BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Active',
  address JSONB,
  custom_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);
```

### 6. leads (from Lead interface)
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'New',
  source TEXT,
  campaign_id UUID,
  account_id UUID REFERENCES accounts(id),
  estimated_value NUMERIC(15,2) DEFAULT 0,
  avatar TEXT,
  score INTEGER DEFAULT 0,
  address JSONB,
  last_contact_date TIMESTAMPTZ,
  notes TEXT,
  commission_rate NUMERIC(5,2),
  temperature TEXT, -- Cold, Warm, Hot
  assigned_to UUID REFERENCES users(id),
  converted_to_deal_id UUID,
  converted_at TIMESTAMPTZ,
  converted_by UUID,
  custom_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);
```

### 7. deals (from Deal interface)
```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id),
  contact_id UUID REFERENCES contacts(id),
  amount NUMERIC(15,2) DEFAULT 0,
  stage TEXT DEFAULT 'Discovery',
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  assignee_id UUID REFERENCES users(id),
  avatar TEXT,
  stage_entry_date TIMESTAMPTZ,
  campaign_id UUID,
  commission_rate NUMERIC(5,2),
  commission_amount NUMERIC(15,2),
  notes TEXT,
  lead_id UUID REFERENCES leads(id),
  won_at TIMESTAMPTZ,
  created_account_id UUID,
  created_contact_id UUID,
  custom_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);
```

### 8. tasks (from Task interface)
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES users(id),
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Open',
  priority TEXT DEFAULT 'Medium',
  related_to_id UUID,
  related_to_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);
```

### 9. calendar_events (from CalendarEvent interface)
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  type TEXT DEFAULT 'Meeting', -- Meeting, Call, Internal, Deadline, Personal, Follow-up
  location TEXT,
  related_to_type TEXT,
  related_to_id UUID,
  priority TEXT, -- high, medium, low
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);
```

### 10. campaigns (from Campaign interface)
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Email', -- Email, Social, Search, Event, Referral
  budget NUMERIC(15,2) DEFAULT 0,
  spent NUMERIC(15,2) DEFAULT 0,
  revenue NUMERIC(15,2) DEFAULT 0,
  revenue_generated NUMERIC(15,2) DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Planning', -- Planning, Active, Paused, Completed, Cancelled
  start_date DATE,
  end_date DATE,
  description TEXT,
  expected_cpl NUMERIC(15,2),
  target_audience TEXT,
  template_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);
```

### 11. communications (from Communication interface)
```sql
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- Email, Call, SMS, Note
  subject TEXT,
  content TEXT,
  direction TEXT DEFAULT 'Outbound', -- Inbound, Outbound
  related_to_type TEXT NOT NULL,
  related_to_id UUID NOT NULL,
  outcome TEXT, -- answered, no-answer, voicemail, meeting-booked, converted
  next_step TEXT,
  next_follow_up_date TIMESTAMPTZ,
  duration INTEGER, -- seconds
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);
```

### 12. tickets (from Ticket interface)
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL, -- TKT-YYYY-XXXX
  subject TEXT NOT NULL,
  description TEXT,
  requester_id UUID,
  account_id UUID REFERENCES accounts(id),
  assignee_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'Open',
  priority TEXT DEFAULT 'Medium',
  sla_deadline TIMESTAMPTZ,
  messages JSONB DEFAULT '[]',
  internal_notes JSONB DEFAULT '[]',
  custom_data JSONB DEFAULT '{}',
  related_to_id UUID,
  related_to_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);
```

### 13. conversations (from Conversation interface)
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  participant_ids UUID[] DEFAULT '{}',
  participants UUID[] DEFAULT '{}',
  name TEXT,
  is_system BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'direct', -- direct, group, channel
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 14. chat_messages (from ChatMessage interface)
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 15. crews (from Crew interface)
```sql
CREATE TABLE crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  leader_id UUID REFERENCES users(id),
  member_ids UUID[] DEFAULT '{}',
  color TEXT,
  specialty TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 16. zones (from Zone interface)
```sql
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  region TEXT,
  description TEXT,
  color TEXT,
  type TEXT,
  status TEXT DEFAULT 'Active',
  coordinates JSONB, -- [{ lat, lng }]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 17. jobs (from Job interface)
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_number TEXT NOT NULL, -- JOB-YYYY-XXXX
  name TEXT,
  subject TEXT NOT NULL,
  description TEXT,
  account_id UUID REFERENCES accounts(id),
  assignee_id UUID REFERENCES users(id),
  crew_id UUID REFERENCES crews(id),
  job_type TEXT DEFAULT 'Service', -- Install, Service, Emergency, Inspection, Audit
  status TEXT DEFAULT 'Scheduled', -- Scheduled, InProgress, Completed, Cancelled, OnHold
  priority TEXT DEFAULT 'Medium',
  zone TEXT,
  estimated_duration INTEGER, -- minutes
  scheduled_date TIMESTAMPTZ,
  scheduled_end_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  job_fields JSONB DEFAULT '[]',
  swms_signed BOOLEAN DEFAULT false,
  completion_signature TEXT,
  evidence_photos TEXT[] DEFAULT '{}',
  bom JSONB DEFAULT '[]', -- Bill of Materials
  invoice_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID REFERENCES users(id)
);
```

### 18. equipment (from Equipment interface)
```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  barcode TEXT,
  condition TEXT DEFAULT 'Good', -- Excellent, Good, Fair, Poor, Damaged
  location TEXT,
  assigned_to UUID REFERENCES users(id),
  last_service_date DATE,
  next_service_date DATE,
  purchase_date DATE,
  purchase_price NUMERIC(15,2),
  model TEXT,
  status TEXT DEFAULT 'Available', -- Available, In Use, Maintenance, Retired
  value NUMERIC(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 19. inventory_items (from InventoryItem interface)
```sql
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  warehouse_qty INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  category TEXT DEFAULT 'Material', -- Asset, Material
  unit_price NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 20. purchase_orders (from PurchaseOrder interface)
```sql
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  po_number TEXT NOT NULL,
  supplier_id UUID REFERENCES accounts(id),
  account_id UUID REFERENCES accounts(id),
  status TEXT DEFAULT 'Draft', -- Draft, Ordered, Dispatched, Delivered
  items JSONB DEFAULT '[]', -- [{ sku, name, qty, price }]
  total NUMERIC(15,2) DEFAULT 0,
  linked_job_id UUID REFERENCES jobs(id),
  expected_delivery DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 21. bank_transactions (from BankTransaction interface)
```sql
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT,
  amount NUMERIC(15,2) NOT NULL,
  type TEXT NOT NULL, -- Credit, Debit
  status TEXT DEFAULT 'unmatched', -- unmatched, matched, ignored
  match_confidence TEXT DEFAULT 'none', -- none, amber, green
  matched_to_id UUID,
  matched_to_type TEXT, -- invoices, expenses, other
  reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID,
  bank_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 22. expenses (from Expense interface)
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  category TEXT DEFAULT 'Other', -- Materials, Fuel, Subbies, Rent, Other
  date DATE NOT NULL,
  status TEXT DEFAULT 'Pending', -- Paid, Pending
  receipt_url TEXT,
  approved_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 23. products (from Product interface)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  code TEXT,
  description TEXT,
  category TEXT,
  type TEXT,
  unit_price NUMERIC(15,2) DEFAULT 0,
  cost_price NUMERIC(15,2),
  tax_rate NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  stock_level INTEGER,
  reorder_point INTEGER,
  reorder_quantity INTEGER,
  specifications TEXT,
  images TEXT[] DEFAULT '{}',
  dimensions JSONB, -- { length, width, height, unit }
  weight JSONB, -- { value, unit }
  manufacturer TEXT,
  supplier TEXT,
  supplier_sku TEXT,
  warranty_months INTEGER,
  warranty_details TEXT,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 24. services (from Service interface)
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  sku TEXT,
  description TEXT,
  category TEXT,
  type TEXT,
  billing_cycle TEXT DEFAULT 'one-off', -- one-off, monthly, quarterly, yearly
  unit_price NUMERIC(15,2) DEFAULT 0,
  cost_price NUMERIC(15,2),
  tax_rate NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  duration_hours INTEGER,
  duration_minutes INTEGER,
  prerequisites TEXT,
  deliverables TEXT,
  skills_required TEXT[] DEFAULT '{}',
  crew_size INTEGER,
  equipment_needed TEXT[] DEFAULT '{}',
  sla_response_hours INTEGER,
  sla_completion_days INTEGER,
  quality_checklist TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 25. quotes (from Quote interface)
```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  deal_id UUID REFERENCES deals(id),
  account_id UUID REFERENCES accounts(id),
  status TEXT DEFAULT 'Draft', -- Draft, Sent, Accepted, Declined, Expired, Superseded
  issue_date DATE,
  expiry_date DATE,
  line_items JSONB DEFAULT '[]', -- [{ itemType, itemId, description, qty, unitPrice, taxRate, lineTotal }]
  subtotal NUMERIC(15,2) DEFAULT 0,
  tax_total NUMERIC(15,2) DEFAULT 0,
  total NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  terms TEXT,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID,
  superseded_by UUID,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 26. invoices (from Invoice interface)
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id),
  deal_id UUID REFERENCES deals(id),
  quote_id UUID REFERENCES quotes(id),
  status TEXT DEFAULT 'Draft', -- Draft, Sent, Paid, Overdue, Cancelled
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid, partially_paid, failed
  issue_date DATE,
  invoice_date DATE,
  due_date DATE,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  line_items JSONB DEFAULT '[]',
  subtotal NUMERIC(15,2) DEFAULT 0,
  tax_total NUMERIC(15,2) DEFAULT 0,
  total NUMERIC(15,2) DEFAULT 0,
  amount_paid NUMERIC(15,2) DEFAULT 0,
  balance_due NUMERIC(15,2),
  late_fee_rate NUMERIC(5,2),
  notes TEXT,
  terms TEXT,
  credits JSONB DEFAULT '[]', -- [{ amount, reason, appliedAt }]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 27. subscriptions (from Subscription interface)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Active', -- Active, Paused, Cancelled
  billing_cycle TEXT DEFAULT 'monthly', -- one-off, monthly, quarterly, yearly, custom
  next_bill_date DATE,
  start_date DATE,
  end_date DATE,
  items JSONB DEFAULT '[]', -- line items without lineTotal
  auto_generate_invoice BOOLEAN DEFAULT true,
  last_invoice_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 28. payments (from Payment interface)
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),
  amount NUMERIC(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT, -- Credit Card, Bank Transfer, Cash, Check, PayPal, Stripe, Other
  method TEXT, -- alternative
  status TEXT DEFAULT 'Pending', -- Pending, Completed, Failed, Refunded
  transaction_id TEXT,
  reference_number TEXT,
  reference TEXT,
  notes TEXT,
  processed_by UUID,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 29. currencies (from Currency interface)
```sql
CREATE TABLE currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  iso_code TEXT NOT NULL, -- USD, AUD, EUR
  name TEXT NOT NULL,
  symbol TEXT NOT NULL, -- $, €, £
  conversion_rate NUMERIC(15,6) DEFAULT 1.0,
  decimal_places INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  is_corporate BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 30. documents (from Document interface)
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  name TEXT,
  file_type TEXT,
  file_size TEXT,
  url TEXT,
  file_url TEXT,
  related_to_type TEXT NOT NULL,
  related_to_id UUID NOT NULL,
  content_text TEXT,
  embedding FLOAT[] DEFAULT '{}',
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  processed_at TIMESTAMPTZ,
  uploaded_by UUID,
  version INTEGER DEFAULT 1,
  parent_document_id UUID,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 31. notifications (from Notification interface)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  content TEXT,
  type TEXT DEFAULT 'info', -- info, warning, success, urgent
  read BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  link TEXT,
  action_url TEXT,
  user_id UUID,
  related_to_type TEXT,
  related_to_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 32. audit_log (from AuditLog interface)
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  metadata JSONB DEFAULT '{}',
  batch_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 33. reviews (from Review interface)
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  content TEXT,
  platform TEXT DEFAULT 'Google', -- Google, Facebook, Yelp, Trustpilot, Internal
  status TEXT DEFAULT 'New', -- New, Replied, Escalated, Ignored
  replied BOOLEAN DEFAULT false,
  reply_content TEXT,
  replied_at TIMESTAMPTZ,
  job_id UUID REFERENCES jobs(id),
  account_id UUID REFERENCES accounts(id),
  sentiment TEXT DEFAULT 'Neutral', -- Positive, Neutral, Negative
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 34. referral_rewards (from ReferralReward interface)
```sql
CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL,
  referred_lead_id UUID REFERENCES leads(id),
  reward_amount NUMERIC(15,2) NOT NULL,
  status TEXT DEFAULT 'Active', -- Active, Pending Payout, Paid, Cancelled
  payout_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 35. inbound_forms (from InboundForm interface)
```sql
CREATE TABLE inbound_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT, -- Contact, Lead, Quote Request, Support
  fields JSONB DEFAULT '[]', -- form field definitions
  submit_button_text TEXT DEFAULT 'Submit',
  success_message TEXT DEFAULT 'Thank you!',
  target_campaign_id UUID,
  submission_count INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2),
  status TEXT DEFAULT 'Active', -- Active, Inactive, Draft
  embed_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 36. chat_widgets (from ChatWidget interface)
```sql
CREATE TABLE chat_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  page TEXT,
  bubble_color TEXT DEFAULT '#0000FF',
  welcome_message TEXT DEFAULT 'Hi! How can I help?',
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'Active',
  routing_user_id UUID REFERENCES users(id),
  conversations INTEGER DEFAULT 0,
  avg_response_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 37. calculators (from Calculator interface)
```sql
CREATE TABLE calculators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- ROI, Repayment, SolarYield
  base_rate NUMERIC(15,4),
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'Active',
  usage_count INTEGER DEFAULT 0,
  lead_conversion_rate NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 38. automation_workflows (from AutomationWorkflow interface)
```sql
CREATE TABLE automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger JSONB NOT NULL, -- { type, entity, config }
  nodes JSONB DEFAULT '[]', -- workflow nodes
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  category TEXT DEFAULT 'System', -- Sales, Operations, Logistics, System
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 39. webhooks (from Webhook interface)
```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  method TEXT DEFAULT 'POST', -- GET, POST, PUT, DELETE
  headers JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  trigger_event TEXT NOT NULL,
  last_triggered_at TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 40. industry_templates (from IndustryTemplate interface)
```sql
CREATE TABLE industry_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  industry TEXT NOT NULL,
  sections JSONB DEFAULT '[]', -- layout sections with fields
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 41. warehouses (from Warehouse interface)
```sql
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 42. roles (from Role interface)
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  color TEXT,
  parent_role_id UUID REFERENCES roles(id),
  hierarchy_level INTEGER DEFAULT 0,
  can_view_all_data BOOLEAN DEFAULT false,
  can_modify_all_data BOOLEAN DEFAULT false,
  portal_type TEXT DEFAULT 'internal', -- internal, customer, partner
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);
```

### 43. tactical_queue (from TacticalQueueItem interface)
```sql
CREATE TABLE tactical_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium', -- critical, high, medium, low
  priority_score INTEGER DEFAULT 50,
  status TEXT DEFAULT 'open', -- open, in_progress, escalated, resolved, closed
  assignee_id UUID REFERENCES users(id),
  sla_deadline TIMESTAMPTZ,
  escalation_level INTEGER DEFAULT 0,
  related_to_type TEXT,
  related_to_id UUID,
  related_to_name TEXT,
  notes JSONB DEFAULT '[]', -- [{ text, addedBy, addedAt }]
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 44. warehouse_locations (from WarehouseLocation interface)
```sql
CREATE TABLE warehouse_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id),
  name TEXT NOT NULL,
  code TEXT, -- A-01-03
  type TEXT DEFAULT 'bin', -- zone, aisle, rack, bin, floor
  description TEXT,
  capacity INTEGER,
  current_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_pickable BOOLEAN DEFAULT true,
  is_receivable BOOLEAN DEFAULT true,
  parent_location_id UUID REFERENCES warehouse_locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 45. dispatch_alerts (from DispatchAlert interface)
```sql
CREATE TABLE dispatch_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info', -- info, warning, urgent, critical
  related_to_type TEXT, -- jobs, crews, equipment, zones
  related_to_id UUID,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 46. rfqs (from RFQ interface)
```sql
CREATE TABLE rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rfq_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft', -- draft, sent, received, evaluating, awarded, closed, cancelled
  supplier_ids UUID[] DEFAULT '{}',
  line_items JSONB DEFAULT '[]', -- [{ name, qty, specs, unitPrice }]
  issue_date DATE,
  due_date DATE,
  valid_until DATE,
  purchase_order_id UUID,
  job_id UUID REFERENCES jobs(id),
  winning_supplier_id UUID,
  awarded_at TIMESTAMPTZ,
  total_value NUMERIC(15,2),
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

### 47. supplier_quotes (from SupplierQuote interface)
```sql
CREATE TABLE supplier_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  quote_number TEXT,
  rfq_id UUID REFERENCES rfqs(id),
  supplier_id UUID NOT NULL REFERENCES accounts(id),
  status TEXT DEFAULT 'received', -- received, under_review, accepted, rejected, expired
  line_items JSONB DEFAULT '[]', -- [{ name, qty, unitPrice, total }]
  subtotal NUMERIC(15,2),
  tax_total NUMERIC(15,2),
  total NUMERIC(15,2),
  received_date DATE,
  valid_until DATE,
  evaluation_score INTEGER,
  evaluation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  owner_id UUID
);
```

---

## EXECUTION PLAN

1. **Backup existing data** (if any)
2. **Drop existing tables** (or ALTER to add missing columns)
3. **Create tables in order** (parent tables first)
4. **Create indexes** for foreign keys and common queries
5. **Enable RLS** on all tables
6. **Create RLS policies** for org_id isolation
7. **Create triggers** (handle_new_user, audit_log)
8. **Seed demo data**

---

## NEXT STEPS

1. Use Supabase MCP to execute CREATE TABLE statements
2. Verify all tables match TypeScript interfaces
3. Test CRUD operations from UI
4. Deploy triggers for signup and audit
