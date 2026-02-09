# Supabase Database Schema - Comprehensive Table Mapping

**Project:** CatchaCRM Multi-Industry
**Date:** February 8, 2026
**Total Tables:** 100+ (industry-adaptive)

---

## Overview

This document maps all tables needed for a production Supabase deployment. The schema supports multiple industries with dynamic custom entities and fields.

---

## 1. Core CRM Tables (37 Base Tables)

### Sales Engine

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `leads` | Lead records | id, name, email, phone, company, status, source, score, estimated_value, created_at |
| `deals` | Deal/Opportunity records | id, name, amount, stage, probability, account_id, contact_id, expected_close_date |
| `accounts` | Account/Company records | id, name, industry, website, employee_count, tier, annual_revenue |
| `contacts` | Contact persons | id, name, email, phone, title, account_id, is_primary |
| `campaigns` | Marketing campaigns | id, name, type, budget, spent, revenue_generated, status, start_date, end_date |

### Financial

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `invoices` | Invoice records | id, invoice_number, account_id, deal_id, status, total, due_date, paid_at |
| `quotes` | Quote/Proposal records | id, quote_number, deal_id, account_id, status, total, expiry_date |
| `products` | Product catalog | id, name, sku, description, unit_price, cost_price, tax_rate, stock_level |
| `services` | Service catalog | id, name, code, description, unit_price, billing_cycle, duration_hours |
| `subscriptions` | Recurring subscriptions | id, account_id, name, status, billing_cycle, next_bill_date, auto_generate_invoice |
| `line_items` | Invoice/Quote line items | id, parent_id, parent_type, item_type, item_id, qty, unit_price, line_total |
| `invoice_credits` | Credit memos | id, invoice_id, amount, reason, applied_at |
| `bank_transactions` | Bank feed transactions | id, date, description, amount, type, status, match_confidence, matched_to_id |
| `expenses` | Expense records | id, vendor, amount, category, date, status, receipt_url |

### Operations & Support

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `tickets` | Support tickets | id, ticket_number, subject, description, requester_id, assignee_id, status, priority, sla_deadline |
| `ticket_messages` | Ticket conversation | id, ticket_id, sender_id, text, is_internal, created_at |
| `tasks` | Tasks/To-dos | id, title, description, assignee_id, due_date, status, priority, related_to_id, related_to_type |
| `jobs` | Field service jobs | id, job_number, subject, description, account_id, crew_id, job_type, status, scheduled_date |
| `job_fields` | Custom job fields | id, job_id, field_id, value |
| `bom_items` | Bill of materials | id, job_id, inventory_item_id, qty_required, qty_picked, serial_numbers |
| `crews` | Service crews | id, name, leader_id, member_ids, color |
| `zones` | Service zones | id, name, region, description, color, assigned_crew_ids |
| `equipment` | Equipment tracking | id, name, type, barcode, condition, location, assigned_to, last_service_date |

### Inventory & Logistics

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `inventory_items` | Inventory | id, name, sku, warehouse_qty, reorder_point, category, unit_price |
| `warehouses` | Warehouse locations | id, name, address, is_default |
| `purchase_orders` | Purchase orders | id, po_number, supplier_id, account_id, status, total, linked_job_id |
| `po_line_items` | PO line items | id, po_id, sku, name, qty, price |

### Calendar & Communication

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `calendar_events` | Calendar events | id, title, description, start_time, end_time, type, related_to_type, related_to_id |
| `communications` | Communication log | id, type, subject, content, direction, related_to_type, related_to_id, outcome |
| `documents` | Document storage | id, title, file_type, file_size, url, related_to_type, related_to_id |

### Marketing

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `reviews` | Customer reviews | id, author_name, rating, content, platform, status, replied, job_id, account_id |
| `referral_rewards` | Referral program | id, referrer_id, referred_lead_id, reward_amount, status, payout_date |
| `inbound_forms` | Lead capture forms | id, name, type, fields, submit_button_text, submission_count, status |
| `chat_widgets` | Chat widgets | id, name, bubble_color, welcome_message, is_active, routing_user_id |
| `calculators` | Interactive calculators | id, name, type, base_rate, is_active, usage_count |

### Automation

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `automation_workflows` | Workflow definitions | id, name, description, trigger, nodes, is_active, execution_count |
| `webhooks` | Webhook integrations | id, name, url, method, headers, is_active, trigger_event, success_count |
| `industry_templates` | Industry templates | id, name, target_entity, industry, sections, is_active, version |

---

## 2. Industry-Specific Custom Entity Tables (20+ Tables)

### Real Estate Industry

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `properties` | Property listings | id, address, property_type, bedrooms, bathrooms, sqft, lot_size, list_price, status, mls_number |
| `showings` | Property showings | id, property_id, scheduled_date, contact_id, status, feedback, interested |
| `offers` | Purchase offers | id, property_id, buyer_contact_id, offer_amount, earnest_money, closing_date, status |

### Solar Industry

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `site_surveys` | Solar site surveys | id, property_address, survey_date, roof_type, roof_condition, roof_area, avg_monthly_usage |
| `installations` | Solar installations | id, job_number, account_id, system_size, panel_model, inverter_model, install_date, status |

### Construction Industry

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `projects` | Construction projects | id, project_name, site_address, project_type, start_date, completion_date, budget_amount, status |
| `change_orders` | Project change orders | id, project_id, change_order_number, description, reason, cost_impact, time_impact, status |

### Finance Industry

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `loan_applications` | Loan applications | id, applicant_id, loan_type, requested_amount, term, employment_status, annual_income, credit_score, status |

### Healthcare Industry

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `patients` | Patient records | id, name, dob, medical_record_number, insurance_provider, primary_physician_id |
| `appointments` | Medical appointments | id, patient_id, provider_id, appointment_date, reason, status, notes |
| `prescriptions` | Prescriptions | id, patient_id, medication, dosage, frequency, start_date, end_date, refills |

### Legal Industry

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `cases` | Legal cases | id, case_number, client_id, case_type, filing_date, status, court, judge |
| `billable_hours` | Time tracking | id, case_id, attorney_id, date, hours, hourly_rate, description, billable |

### Automotive Industry

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `vehicles` | Vehicle inventory | id, vin, make, model, year, mileage, price, status, location |
| `test_drives` | Test drive appointments | id, vehicle_id, contact_id, scheduled_date, status, driver_license_verified |
| `trade_ins` | Trade-in vehicles | id, owner_contact_id, vin, make, model, year, mileage, offered_value, accepted |

### Hospitality Industry

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `rooms` | Hotel rooms | id, room_number, room_type, capacity, rate, amenities, status |
| `reservations` | Room reservations | id, guest_id, room_id, check_in, check_out, total_amount, status |
| `events` | Event bookings | id, event_name, venue, event_date, guest_count, catering, total_amount |

### Manufacturing Industry

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `production_orders` | Production orders | id, product_id, qty_ordered, qty_produced, start_date, completion_date, status |
| `quality_inspections` | QC inspections | id, production_order_id, inspector_id, inspection_date, passed, defect_count, notes |
| `raw_materials` | Raw material inventory | id, material_name, unit, qty_available, reorder_level, supplier_id |

---

## 3. System & Configuration Tables (15+ Tables)

### User Management

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `users` | User accounts | id, name, email, role, avatar, manager_id, team, is_active, last_login |
| `roles` | Role definitions | id, name, description, is_system, color |
| `permissions` | Role permissions | id, role_id, module, view_global, view_team, view_own, create, edit, delete, export |
| `teams` | Team structure | id, name, manager_id, member_ids, description |
| `field_security_rules` | Field-level security | id, entity_type, field_name, hidden_from_roles |

### Customization

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `custom_field_definitions` | Custom field schemas | id, entity_type, label, field_type, options, required, default_value, help_text |
| `custom_field_values` | Custom field data | id, entity_type, entity_id, field_id, value |
| `pipelines` | Custom pipelines | id, name, entity_type, stages, is_default |
| `pipeline_stages` | Pipeline stage details | id, pipeline_id, label, probability, color, order |
| `lead_scoring_rules` | Lead scoring config | id, trigger, points, description |
| `validation_rules` | Field validation rules | id, entity_type, field, rule_type, value, message, enabled |

### Configuration

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `settings` | Global settings (JSONB) | id, organization, localization, branding, modules, integrations, automation |
| `industry_blueprints` | Industry templates | id, name, type, description, custom_entities, custom_fields, pipelines, modules |
| `tax_rates` | Tax configuration | id, name, rate, is_default, region |
| `ledger_mappings` | GL code mappings | id, event_type, gl_code, description |

### Audit & Logs

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `audit_logs` | Audit trail | id, entity_type, entity_id, action, user_id, previous_value, new_value, metadata, created_at |
| `notifications` | User notifications | id, user_id, title, message, type, read, link, created_at |

### Messaging

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `conversations` | Chat conversations | id, participant_ids, name, is_system |
| `chat_messages` | Chat messages | id, conversation_id, sender_id, content, created_at |

---

## 4. Relational Junction Tables (10+ Tables)

| Table | Description | Purpose |
|-------|-------------|---------|
| `account_contacts` | Account-Contact many-to-many | Links contacts to multiple accounts |
| `deal_products` | Deal-Product association | Products in a deal |
| `job_equipment` | Job-Equipment assignment | Equipment assigned to jobs |
| `campaign_leads` | Campaign-Lead tracking | Leads generated by campaigns |
| `crew_members` | Crew-User assignment | Users assigned to crews |
| `zone_crews` | Zone-Crew assignment | Crews assigned to zones |
| `document_tags` | Document tagging | Tags for documents |
| `industry_integrations` | Industry-Integration mapping | Recommended integrations per industry |

---

## 5. Total Table Count by Category

| Category | Table Count | Notes |
|----------|-------------|-------|
| **Core CRM** | 37 | Standard entities (leads, deals, etc.) |
| **Industry-Specific** | 25+ | Varies by active industry |
| **System/Config** | 15 | Users, roles, settings |
| **Junction Tables** | 10 | Many-to-many relationships |
| **Audit/Logs** | 3 | Audit logs, notifications |
| **Customization** | 8 | Custom fields, validation rules |
| **Real-time Features** | 2 | Chat conversations, messages |
| **TOTAL** | **100+** | Dynamic based on industry |

---

## 6. Row Level Security (RLS) Policies

### Global Policies (All Tables)

```sql
-- Policy 1: Users can view their own records
CREATE POLICY "Users view own records"
ON <table_name>
FOR SELECT
USING (owner_id = auth.uid() OR created_by = auth.uid());

-- Policy 2: Admins can view all
CREATE POLICY "Admins view all"
ON <table_name>
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 3: Team visibility
CREATE POLICY "Team view team records"
ON <table_name>
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u1
    JOIN users u2 ON u1.team = u2.team
    WHERE u1.id = auth.uid()
    AND u2.id = <table_name>.owner_id
  )
);

-- Policy 4: Insert with ownership
CREATE POLICY "Users create records"
ON <table_name>
FOR INSERT
WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());
```

### Specific Policies

- **Financial data:** Restricted to finance role + admins
- **HR data:** Restricted to managers + admins
- **Custom entities:** Dynamic based on industry blueprint

---

## 7. Indexes for Performance

### Critical Indexes

```sql
-- Foreign key indexes
CREATE INDEX idx_<table>_<fk>_id ON <table>(<fk>_id);

-- Search indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_accounts_name ON accounts(name);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Status/filter indexes
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Date range indexes
CREATE INDEX idx_calendar_events_date ON calendar_events(start_time);
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);

-- Full-text search
CREATE INDEX idx_leads_search ON leads USING gin(to_tsvector('english', name || ' ' || company || ' ' || email));
```

---

## 8. Migration Strategy

### Phase 1: Core Tables (Week 1)
1. Create users, roles, permissions
2. Create core CRM tables (leads, deals, accounts, contacts)
3. Set up RLS policies
4. Migrate localStorage data

### Phase 2: Financial Tables (Week 2)
5. Create invoices, quotes, products, services
6. Create line_items, subscriptions
7. Integrate Stripe

### Phase 3: Operations Tables (Week 2-3)
8. Create tickets, tasks, jobs
9. Create crews, zones, equipment
10. Create inventory, purchase orders

### Phase 4: Industry-Specific (Week 3-4)
11. Create industry custom entity tables
12. Implement custom field system
13. Test blueprint switching

### Phase 5: Optimization (Week 4)
14. Add indexes
15. Tune RLS policies
16. Load testing
17. Real-time subscriptions

---

## 9. Estimated Storage

| Data Type | Avg Row Size | Estimated Rows | Total Size |
|-----------|--------------|----------------|------------|
| Core CRM | 2 KB | 100,000 | 200 MB |
| Financial | 1 KB | 50,000 | 50 MB |
| Operations | 1.5 KB | 75,000 | 112 MB |
| Industry-Specific | 2 KB | 50,000 | 100 MB |
| Custom Fields | 500 bytes | 200,000 | 100 MB |
| Audit Logs | 1 KB | 500,000 | 500 MB |
| **TOTAL** | | | **~1 GB** |

*Estimated for first year with 1,000 active users*

---

## 10. Next Steps

1. ✅ Define industry blueprints (COMPLETE)
2. ✅ Create table mapping document (THIS DOCUMENT)
3. ⏭️ Generate SQL schema from types
4. ⏭️ Create Supabase migration files
5. ⏭️ Set up RLS policies
6. ⏭️ Implement real-time subscriptions
7. ⏭️ Migrate data from localStorage
8. ⏭️ Test all CRUD operations
9. ⏭️ Deploy to production

---

**Document Version:** 1.0
**Last Updated:** February 8, 2026
**Status:** Ready for implementation
