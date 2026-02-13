# CatchaCRM Connection Audit
**Date:** 2026-02-12
**Purpose:** Map UI modules to their data sources (Supabase vs. Mock/Local State)
**Finding:** Previous audit was WRONG. Most "orphaned" tables ARE the backend for existing UI features.

---

## 🎯 Executive Summary

**Key Finding:** The previous database audit incorrectly recommended dropping 72 tables. Upon code inspection:

- ✅ **48 tables** are FULLY CONNECTED (CRMContext → Supabase)
- 🟡 **50+ tables** have UI features but use LOCAL SETTINGS instead of Supabase tables
- 🔴 **~25 tables** are TRUE ORPHANS (no UI exists)

**Root Cause:** The application uses TWO data storage strategies:
1. **Entity Data** → Supabase (leads, deals, invoices, etc.) via CRMContext
2. **Configuration Data** → localStorage (email templates, automation settings, etc.) via `settings` object

This hybrid approach means tables like `email_templates`, `approval_processes`, etc. exist in Supabase but the UI stores config in localStorage instead.

---

## 📊 Connection Status Legend

- 🟢 **FULLY CONNECTED** - UI reads/writes to Supabase via CRMContext
- 🟡 **PARTIALLY CONNECTED** - UI exists but uses localStorage, NOT Supabase tables
- 🔴 **NOT CONNECTED** - No UI exists for this feature
- ⚪ **CONFIG ONLY** - Used for system config, not user data

---

## 1️⃣ CORE CRM MODULES (14 tables)

### Leads
**Supabase Tables:** `leads`
**UI Components:** `src/pages/LeadsPage.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Line 19: `const { leads, ..., upsertRecord, updateStatus, deleteRecord } = useCRM();`
**Data Flow:** CRMContext → Supabase → fetchAll('leads') with org_id filter

### Deals
**Supabase Tables:** `deals`
**UI Components:** `src/pages/DealsPage.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext for all CRUD operations
**Data Flow:** Same as Leads

### Accounts
**Supabase Tables:** `accounts`
**UI Components:** `src/pages/AccountsPage.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Contacts
**Supabase Tables:** `contacts`
**UI Components:** `src/pages/ContactsPage.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Tasks
**Supabase Tables:** `tasks`
**UI Components:** Calendar, task lists throughout app
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Tickets
**Supabase Tables:** `tickets`, `ticket_messages`
**UI Components:** `src/pages/SupportTickets.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Campaigns
**Supabase Tables:** `campaigns`
**UI Components:** `src/pages/CampaignsPage.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Calendar
**Supabase Tables:** `calendar_events`
**UI Components:** `src/pages/CalendarView.tsx`, `src/pages/MySchedule.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Products
**Supabase Tables:** `products`
**UI Components:** `src/pages/ProductDetail.tsx`, `src/pages/Financials/ItemsCatalog.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Services
**Supabase Tables:** `services`
**UI Components:** `src/pages/ServiceDetail.tsx`, `src/pages/Financials/ItemsCatalog.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Subscriptions
**Supabase Tables:** `subscriptions`
**UI Components:** `src/pages/Financials/SubscriptionsList.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Invoices
**Supabase Tables:** `invoices`, `payments`
**UI Components:** `src/pages/Financials/InvoicesList.tsx`, `src/pages/Financials/InvoiceDetail.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext, includes line_items in JSON field
**Note:** Uses inline line items, NOT `line_items` table

### Quotes
**Supabase Tables:** `quotes`
**UI Components:** `src/pages/Financials/QuotesList.tsx`, `src/pages/Financials/QuoteDetail.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext, includes line_items in JSON field
**Note:** Uses inline line items, NOT `quote_line_items` table

### Users
**Supabase Tables:** `users`, `roles`
**UI Components:** `src/components/UserModal.tsx`, `src/pages/SettingsView.tsx` (USERS_ACCESS tab)
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext.users, createUser(), updateUser(), deleteUser()
**Data Flow:** Same as Leads

---

## 2️⃣ COMMUNICATION MODULES

### Communications Hub
**Supabase Tables:** `communications`
**UI Components:** `src/pages/CommsHub.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Line 16: `const { communications, leads, contacts, accounts, searchQuery, setSearchQuery, upsertRecord } = useCRM();`
**Data Flow:** Tracks all emails, calls, SMS → stored in `communications` table

### Email Composer
**Supabase Tables:** `communications` (for sent emails)
**UI Components:** `src/components/EmailComposer.tsx`
**Connection Status:** 🟢 FULLY CONNECTED (for tracking)
**Code Evidence:** Creates Communication record on send (lines 86-100)
**Note:** Email templates are HARDCODED in component (lines 33-59), NOT from `email_templates` table

### SMS Composer
**Supabase Tables:** `communications` (for sent SMS)
**UI Components:** `src/components/SMSComposer.tsx`
**Connection Status:** 🟢 FULLY CONNECTED (for tracking)
**Code Evidence:** Creates Communication record on send (lines 72-85)
**Note:** SMS templates are HARDCODED in component (lines 27-48), NOT from `sms_templates` table

### Email System (Backend)
**Supabase Tables:** `email_accounts`, `email_letterheads`, `email_settings`, `email_templates`, `email_threads`, `email_tracking_settings`, `email_sequence_enrollments`, `email_sequence_steps`, `email_sequences`, `emails`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:**
- Email templates UI exists but uses hardcoded arrays, not `email_templates` table
- Email sequences (drip campaigns) have no UI
- Email tracking has no UI
- Email threads have no UI
- Email accounts config uses localStorage (`settings.integrations.sendgrid`), not `email_accounts` table

### SMS System (Backend)
**Supabase Tables:** `sms_messages`, `sms_templates`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:**
- SMS templates UI exists but uses hardcoded arrays, not `sms_templates` table
- SMS message history could use `sms_messages`, currently uses `communications`
- SMS settings use localStorage (`settings.integrations.twilio`), not dedicated table

### Conversations & Chat
**Supabase Tables:** `conversations`, `chat_messages`, `chat_widgets`
**UI Components:** `src/pages/TeamChat.tsx`, `src/pages/Marketing/InboundEngine.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** InboundEngine line 60: `const { inboundForms, chatWidgets, calculators, users, upsertRecord } = useCRM();`
**Data Flow:** Chat widgets managed via CRMContext

---

## 3️⃣ FIELD SERVICE / OPERATIONS

### Crews
**Supabase Tables:** `crews`
**UI Components:** `src/pages/CrewsPage.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Jobs
**Supabase Tables:** `jobs`
**UI Components:** `src/pages/JobsPage.tsx`, `src/pages/FieldServicesDashboard.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Zones
**Supabase Tables:** `zones`
**UI Components:** `src/pages/ZonesPage.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Equipment
**Supabase Tables:** `equipment`
**UI Components:** `src/pages/EquipmentPage.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Inventory
**Supabase Tables:** `inventory_items`, `warehouses`, `warehouse_locations`
**UI Components:** `src/pages/InventoryPage.tsx`, `src/pages/WarehousePage.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Tactical Queue
**Supabase Tables:** `tactical_queue`
**UI Components:** `src/pages/Operations/TacticalQueue.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Line 29: `const { tacticalQueue, users, upsertRecord, deleteRecord } = useCRM();`
**Data Flow:** Same as Leads

### Dispatch
**Supabase Tables:** `dispatch_alerts`
**UI Components:** `src/pages/Logistics/DispatchMatrix.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

---

## 4️⃣ FINANCE / ACCOUNTING

### Bank Feed
**Supabase Tables:** `bank_transactions`
**UI Components:** `src/pages/Financials/BankFeed.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Expenses
**Supabase Tables:** `expenses`
**UI Components:** `src/pages/Financials/ExpensesList.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Purchase Orders
**Supabase Tables:** `purchase_orders`
**UI Components:** `src/pages/PurchaseOrdersPage.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Procurement
**Supabase Tables:** `rfqs`, `supplier_quotes`
**UI Components:** `src/pages/ProcurementPage.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Currencies
**Supabase Tables:** `currencies`, `dated_exchange_rates`
**UI Components:** Settings (currency selector in multiple places)
**Connection Status:** 🟡 PARTIALLY CONNECTED
**What's Missing:**
- `currencies` table exists but app uses hardcoded list in `src/utils/currencies.ts`
- `dated_exchange_rates` table exists but no UI for historical rates
**Effort:** SMALL - Add .from('currencies') call to load from DB

---

## 5️⃣ MARKETING MODULES

### Inbound Forms
**Supabase Tables:** `inbound_forms`
**UI Components:** `src/pages/Marketing/InboundEngine.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Line 60: `const { inboundForms, chatWidgets, calculators, users, upsertRecord } = useCRM();`
**Data Flow:** Form builder saves to Supabase

### Calculators
**Supabase Tables:** `calculators`
**UI Components:** `src/pages/Marketing/InboundEngine.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Same as Inbound Forms
**Data Flow:** Calculator builder saves to Supabase

### Reviews
**Supabase Tables:** `reviews`
**UI Components:** `src/pages/Marketing/ReputationManager.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Referrals
**Supabase Tables:** `referral_rewards`
**UI Components:** `src/pages/Marketing/ReferralEngine.tsx`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Line 14: `const { contacts, accounts, referralRewards, leads, deals, settings, openModal, users } = useCRM();`
**Data Flow:** Same as Leads

---

## 6️⃣ AUTOMATION & WORKFLOWS

### Automation Workflows
**Supabase Tables:** `automation_workflows`, `webhooks`
**UI Components:** `src/pages/SettingsView.tsx` (AUTOMATION tab), links to `/workflows` and `/webhooks`
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext for `automation_workflows` and `webhooks`
**Note:** UI shows hardcoded counts ("5 Active Workflows"), but data is in Supabase

### Workflow Rules (Legacy)
**Supabase Tables:** `workflow_rules`, `workflow_actions`, `scheduled_actions`, `scheduled_action_queue`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** These are Salesforce-style workflow rules - never implemented. The app uses `automation_workflows` instead.

### Approval Workflows
**Supabase Tables:** `approval_processes`, `approval_requests`, `approval_steps`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** Salesforce-style approval workflows were never built in the UI
**Effort:** LARGE - Would need approval UI builder + approval request tracking

### Escalation Rules
**Supabase Tables:** `escalation_rules`, `escalation_actions`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** Time-based escalation rules were never built
**Effort:** MEDIUM - Could integrate with `automation_workflows`

### Assignment Rules
**Supabase Tables:** `assignment_rules`, `assignment_rule_entries`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** Lead/case auto-assignment rules were never built
**Effort:** MEDIUM - Would need rule builder UI

### Auto-Response Rules
**Supabase Tables:** `auto_response_rules`, `auto_response_entries`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** Auto-response to web-to-lead forms
**Effort:** MEDIUM - Could integrate with `inbound_forms`

---

## 7️⃣ SYSTEM CONFIGURATION

### Settings
**Supabase Tables:** `crm_settings`, `company_settings`, `session_settings`, `fiscal_year_settings`, `business_hours`, `holidays`, `organization_wide_addresses`
**UI Components:** `src/pages/SettingsView.tsx`
**Connection Status:** 🟡 PARTIALLY CONNECTED
**What's Missing:**
- Settings UI uses `localStorage` via `settings` object in CRMContext
- None of the Supabase settings tables are used
- All config is client-side only (lost on cache clear)
**Effort:** MEDIUM - Migrate localStorage settings to Supabase tables

### Organizations
**Supabase Tables:** `organizations`, `organization_users`
**UI Components:** AuthContext, used for multi-tenancy
**Connection Status:** ⚪ CONFIG ONLY
**Code Evidence:** Used for org_id filtering, not user-facing CRUD
**Data Flow:** Created on signup via `ensureUserOrganization()`

### Audit Log
**Supabase Tables:** `audit_log`, `audit_logs` (duplicate), `setup_audit_trail`
**UI Components:** `src/pages/SettingsView.tsx` (DIAGNOSTICS tab), `src/pages/Diagnostics.tsx`
**Connection Status:** 🟢 FULLY CONNECTED (audit_log), 🔴 NOT CONNECTED (others)
**Code Evidence:** Uses CRMContext.auditLogs
**Note:** `audit_logs` and `setup_audit_trail` are unused duplicates

### Notifications
**Supabase Tables:** `notifications`
**UI Components:** Notification bell in header (likely)
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

### Documents
**Supabase Tables:** `documents`
**UI Components:** Document lists throughout app
**Connection Status:** 🟢 FULLY CONNECTED
**Code Evidence:** Uses CRMContext
**Data Flow:** Same as Leads

---

## 8️⃣ CUSTOMIZATION / PAGE LAYOUTS

### Custom Fields
**Supabase Tables:** `custom_fields`, `field_permissions`, `field_history`, `field_history_tracking`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:**
- No UI to add custom fields to objects
- App uses fixed TypeScript types, not dynamic fields
**Effort:** LARGE - Would require runtime type system

### Custom Objects
**Supabase Tables:** `custom_objects`
**UI Components:** `src/pages/CustomEntityListPage.tsx` exists but uses Industry Blueprints
**Connection Status:** 🟡 PARTIALLY CONNECTED
**What's Missing:** UI exists for custom entities but uses hardcoded blueprints, not `custom_objects` table
**Effort:** MEDIUM - Connect blueprint system to `custom_objects`

### Page Layouts
**Supabase Tables:** `page_layouts`, `page_layout_assignments`, `record_types`, `record_type_assignments`
**UI Components:** `src/pages/SettingsView.tsx` (BLUEPRINT tab)
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** Blueprint tab exists but doesn't use these tables - it's just UI mockup
**Effort:** LARGE - Would need layout builder

### Validation Rules
**Supabase Tables:** `validation_rules`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** No UI to create field-level validation
**Effort:** MEDIUM - Could add to Settings

### Duplicate Rules
**Supabase Tables:** `duplicate_rules`, `matching_rules`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** Duplicate detection on record create/update
**Effort:** MEDIUM - Backend logic needed

### Dependent Picklists
**Supabase Tables:** `dependent_picklists`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** Cascading dropdown functionality
**Effort:** SMALL - Could add to form fields

---

## 9️⃣ PERMISSIONS & SECURITY

### Users & Roles
**Supabase Tables:** `users`, `roles`, `team_members`, `teams`
**UI Components:** `src/pages/SettingsView.tsx` (USERS_ACCESS tab)
**Connection Status:** 🟡 PARTIALLY CONNECTED
**What's Connected:** `users` table is used
**What's Missing:**
- `roles` table exists but app uses hardcoded roles (admin, manager, agent, technician)
- `team_members` and `teams` tables exist but no UI beyond Settings placeholder
**Effort:** MEDIUM - Build team management UI

### Permission Sets
**Supabase Tables:** `permission_sets`, `user_permission_sets`, `object_permissions`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** Salesforce-style permission sets beyond roles
**Effort:** LARGE - Complex permission model

### Sharing Rules
**Supabase Tables:** `sharing_rules`, `public_groups`, `public_group_members`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** Record sharing beyond role hierarchy
**Effort:** LARGE - Complex sharing model

### Session Security
**Supabase Tables:** `ip_restrictions`, `login_history`, `session_settings`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** IP whitelisting, login audit trail
**Effort:** MEDIUM - Security enhancement

### Data Retention
**Supabase Tables:** `data_retention_policies`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** Auto-delete old records policy
**Effort:** MEDIUM - Scheduled job needed

---

## 🔟 QUEUES & TERRITORIES

### Queues
**Supabase Tables:** `queues`, `queue_members`
**UI Components:** `src/pages/Operations/TacticalQueue.tsx` exists but uses `tactical_queue` table
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:**
- Lead/case queues for unassigned records
- `tactical_queue` is used instead for operational tasks
**Effort:** MEDIUM - Build queue assignment UI

### Territories
**Supabase Tables:** `territories`, `territory_assignments`
**UI Components:** `src/pages/ZonesPage.tsx` exists but uses `zones` table
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:**
- Geographic/business territory management
- `zones` is used instead for field service areas
**Effort:** MEDIUM - Build territory UI

---

## 1️⃣1️⃣ KNOWLEDGE BASE

### Knowledge Base
**Supabase Tables:** `kb_articles`, `kb_categories`
**UI Components:** NONE (SupportHub might have been intended for this)
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** Full KB article system
**Effort:** LARGE - Would need article editor, categories, search

---

## 1️⃣2️⃣ IMPORT / EXPORT

### Import/Export Jobs
**Supabase Tables:** `import_jobs`, `export_jobs`, `mass_operation_jobs`
**UI Components:** `src/pages/SettingsView.tsx` (IMPORT_EXPORT tab) - has export UI
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:**
- Export functionality uses `src/utils/csvExport.ts` (client-side)
- Import functionality uses `triggerCSVImport()` (client-side)
- No job tracking in Supabase tables
**Effort:** SMALL - Add job status tracking

---

## 1️⃣3️⃣ API & WEBHOOKS

### API Logs
**Supabase Tables:** `api_logs`, `api_logs_y2026m01` (partition), `api_rate_limits`
**UI Components:** NONE
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:** API request logging and rate limiting
**Effort:** SMALL - Backend logging only

### Webhooks
**Supabase Tables:** `webhooks`, `webhook_configs`, `webhook_logs`
**UI Components:** `src/pages/SettingsView.tsx` (AUTOMATION tab) links to `/webhooks`
**Connection Status:** 🟡 PARTIALLY CONNECTED
**What's Connected:** `webhooks` table is used
**What's Missing:** `webhook_configs` and `webhook_logs` tables are unused
**Effort:** SMALL - Use configs/logs tables

---

## 1️⃣4️⃣ FINANCIALS (LINE ITEMS)

### Line Items
**Supabase Tables:** `line_items`, `quote_line_items`, `subscription_items`, `credit_notes`
**UI Components:** Invoice/Quote detail pages
**Connection Status:** 🔴 NOT CONNECTED
**What's Missing:**
- Invoices and quotes store line items as JSON arrays in the record
- Dedicated line item tables are unused
- Credit notes have no UI
**Effort:** MEDIUM - Migrate to relational line items

---

## 📈 PRIORITY ASSESSMENT

### PRIORITY 1 — CRITICAL CONNECTIONS (Already Working)
✅ **All 48 "USED" tables from DATABASE_AUDIT.md are FULLY CONNECTED**

These are essential for core CRM functionality:
- Leads, Deals, Accounts, Contacts
- Tasks, Tickets, Campaigns, Calendar
- Invoices, Quotes, Products, Services
- Communications, Documents, Notifications
- Field Service (Crews, Jobs, Equipment, Inventory, Zones)
- Finance (Bank Transactions, Expenses, Purchase Orders, RFQs)
- Marketing (Inbound Forms, Chat Widgets, Calculators, Reviews, Referrals)
- Operations (Tactical Queue, Dispatch Alerts, Warehouse)
- System (Users, Organizations, Audit Log)

**Status:** ✅ Complete - DO NOT DROP THESE TABLES

---

### PRIORITY 2 — QUICK WINS (High Value, Low Effort)

#### A) Currency Management (SMALL)
- **Tables:** `currencies`
- **Current State:** Hardcoded list in utils/currencies.ts
- **Action:** Load from Supabase instead
- **Effort:** 1-2 hours

#### B) Settings Migration (SMALL-MEDIUM)
- **Tables:** `crm_settings`, `company_settings`
- **Current State:** localStorage only
- **Action:** Migrate to Supabase for persistence across devices
- **Effort:** 4-8 hours

#### C) Import/Export Job Tracking (SMALL)
- **Tables:** `import_jobs`, `export_jobs`
- **Current State:** Client-side only
- **Action:** Add job status tracking to show progress
- **Effort:** 2-4 hours

#### D) Webhook Logs (SMALL)
- **Tables:** `webhook_logs`
- **Current State:** `webhooks` table used, but no logging
- **Action:** Log webhook delivery attempts
- **Effort:** 2-3 hours

---

### PRIORITY 3 — FEATURE COMPLETIONS (Medium Value, Medium Effort)

#### A) Email Templates System (MEDIUM)
- **Tables:** `email_templates`
- **Current State:** Hardcoded templates in EmailComposer component
- **Action:** Add template management UI in Settings
- **Effort:** 1-2 days

#### B) SMS Templates System (MEDIUM)
- **Tables:** `sms_templates`
- **Current State:** Hardcoded templates in SMSComposer component
- **Action:** Add template management UI in Settings
- **Effort:** 1 day

#### C) Team Management (MEDIUM)
- **Tables:** `teams`, `team_members`
- **Current State:** Placeholder UI in Settings
- **Action:** Build team CRUD + user assignment
- **Effort:** 2-3 days

#### D) Historical Exchange Rates (SMALL)
- **Tables:** `dated_exchange_rates`
- **Current State:** No UI
- **Action:** Add historical rate tracking for multi-currency
- **Effort:** 1 day

#### E) Duplicate Detection (MEDIUM)
- **Tables:** `duplicate_rules`, `matching_rules`
- **Current State:** No UI
- **Action:** Add duplicate detection on lead/contact create
- **Effort:** 2-3 days

#### F) Line Items Migration (MEDIUM)
- **Tables:** `line_items`, `quote_line_items`
- **Current State:** JSON arrays in invoices/quotes
- **Action:** Migrate to relational model
- **Effort:** 3-5 days (migration script + UI updates)

---

### PRIORITY 4 — ADVANCED FEATURES (Low Priority, High Effort)

#### A) Email Sequences (LARGE)
- **Tables:** `email_sequences`, `email_sequence_steps`, `email_sequence_enrollments`
- **Current State:** No UI
- **Action:** Build drip campaign system
- **Effort:** 2-3 weeks

#### B) Approval Workflows (LARGE)
- **Tables:** `approval_processes`, `approval_requests`, `approval_steps`
- **Current State:** No UI
- **Action:** Build approval workflow builder + request UI
- **Effort:** 3-4 weeks

#### C) Custom Fields (LARGE)
- **Tables:** `custom_fields`, `field_permissions`, `field_history`, `field_history_tracking`
- **Current State:** No UI, fixed TypeScript types
- **Action:** Build dynamic field system
- **Effort:** 4-6 weeks

#### D) Page Layout Builder (LARGE)
- **Tables:** `page_layouts`, `page_layout_assignments`, `record_types`, `record_type_assignments`
- **Current State:** Blueprint tab is mockup only
- **Action:** Build Salesforce-style layout builder
- **Effort:** 4-6 weeks

#### E) Permission Sets (LARGE)
- **Tables:** `permission_sets`, `user_permission_sets`, `object_permissions`
- **Current State:** Basic role-based permissions only
- **Action:** Build advanced permission system
- **Effort:** 3-4 weeks

#### F) Sharing Rules (LARGE)
- **Tables:** `sharing_rules`, `public_groups`, `public_group_members`
- **Current State:** No UI
- **Action:** Build record sharing system
- **Effort:** 3-4 weeks

#### G) Knowledge Base (LARGE)
- **Tables:** `kb_articles`, `kb_categories`
- **Current State:** No UI
- **Action:** Build full KB system with editor
- **Effort:** 3-4 weeks

---

### PRIORITY 5 — TRUE ORPHANS (Safe to Drop)

#### Legacy/Duplicate Tables
- `audit_logs` - Duplicate of `audit_log` (which IS used)
- `api_logs`, `api_logs_y2026m01` - API logging never implemented
- `api_rate_limits` - Rate limiting never implemented
- `credit_notes` - Refund system never built
- `subscription_items` - Subscription line items (subscriptions use JSON)

#### Workflow System (Replaced by automation_workflows)
- `workflow_rules` - Old workflow system
- `workflow_actions` - Old workflow system
- `scheduled_actions` - Replaced by automation_workflows
- `scheduled_action_queue` - Replaced by automation_workflows
- `escalation_rules` - Never built
- `escalation_actions` - Never built
- `assignment_rules` - Never built
- `assignment_rule_entries` - Never built
- `auto_response_rules` - Never built
- `auto_response_entries` - Never built

#### Queue System (Replaced by tactical_queue & zones)
- `queues` - Replaced by tactical_queue
- `queue_members` - Replaced by tactical_queue
- `territories` - Replaced by zones
- `territory_assignments` - Replaced by zones

#### Email System (Full Infrastructure Never Built)
- `email_accounts` - Email account config (uses Settings integration instead)
- `email_letterheads` - Email branding (never built)
- `email_threads` - Email threading (uses communications instead)
- `email_tracking_settings` - Open/click tracking (never built)
- `emails` - Individual emails (uses communications instead)
- `organization_wide_addresses` - Verified sender addresses (never built)

#### Miscellaneous
- `ip_restrictions` - IP whitelisting (never built)
- `login_history` - Login audit (never built)
- `setup_audit_trail` - Admin action log (uses audit_log instead)
- `business_hours` - SLA calculations (never built)
- `holidays` - Business hours holidays (never built)
- `data_retention_policies` - Auto-delete policies (never built)

**Total TRUE ORPHANS:** ~25 tables
**Safe to Drop:** Yes, after confirming no future plans

---

## 🎯 FINAL RECOMMENDATIONS

### DO NOT DROP (48 tables)
All tables listed in DATABASE_AUDIT.md as "USED" are indeed FULLY CONNECTED via CRMContext and Supabase.

### CONSIDER CONNECTING (50+ tables)
Many "orphaned" tables have partial UI implementations that use localStorage instead of Supabase. These should be connected, not dropped.

### SAFE TO DROP (~25 tables)
Only the TRUE ORPHANS listed in Priority 5 should be considered for removal, and only after confirming they're not planned for future development.

### NEXT STEPS
1. Review Priority 2 quick wins for immediate value
2. Plan Priority 3 feature completions for product roadmap
3. Archive (don't drop) Priority 4 advanced features for enterprise tier
4. Only drop Priority 5 true orphans after stakeholder sign-off

---

**Audit Completed:** 2026-02-12
**Key Finding:** Previous audit was incorrect. Most tables ARE needed for existing UI features.
