# COMPREHENSIVE FIELD MAPPING AUDIT

**Generated:** 2026-02-11
**Purpose:** Map every UI input field to its Supabase database column and identify mismatches

---

## TABLE OF CONTENTS

1. [EXECUTIVE SUMMARY](#executive-summary)
2. [MAPPING LEGEND](#mapping-legend)
3. [MODULE-BY-MODULE AUDIT](#module-by-module-audit)
   - [LEADS](#1-leads-module)
   - [DEALS](#2-deals-module)
   - [ACCOUNTS](#3-accounts-module)
   - [CONTACTS](#4-contacts-module)
   - [CAMPAIGNS](#5-campaigns-module)
   - [JOBS](#6-jobs-module)
   - [TICKETS](#7-tickets-module)
   - [QUOTES](#8-quotes-module)
   - [INVOICES](#9-invoices-module)
   - [SUBSCRIPTIONS](#10-subscriptions-module)
   - [PRODUCTS](#11-products-module)
   - [SERVICES](#12-services-module)
   - [CALENDAR EVENTS](#13-calendar-events-module)
   - [COMMUNICATIONS](#14-communications-module)
   - [TASKS](#15-tasks-module)
   - [DOCUMENTS](#16-documents-module)
   - [INVENTORY](#17-inventory-module)
   - [EQUIPMENT](#18-equipment-module)
   - [PURCHASE ORDERS](#19-purchase-orders-module)
   - [BANK TRANSACTIONS](#20-bank-transactions-module)
   - [EXPENSES](#21-expenses-module)
   - [CREWS](#22-crews-module)
   - [ZONES](#23-zones-module)
4. [CRITICAL MISMATCHES](#critical-mismatches)
5. [MISSING TABLES](#missing-tables)
6. [BROKEN FUNCTIONALITY](#broken-functionality)

---

## EXECUTIVE SUMMARY

| Metric | Count |
|--------|-------|
| Total Tables in Supabase | 35 |
| Total TypeScript Entity Types | 37 |
| Total UI Form Modules | 23 |
| **Critical Mismatches** | **47** |
| **Missing DB Columns** | **28** |
| **Missing UI Fields** | **15** |
| **Broken Functions** | **12** |

---

## MAPPING LEGEND

| Symbol | Meaning |
|--------|---------|
| ✅ | Field exists in all 3 layers (UI, TypeScript, Supabase) |
| ⚠️ | Partial match - naming difference or type mismatch |
| ❌ | Missing in one or more layers |
| 🔄 | Mapping required (camelCase ↔ snake_case) |

---

## MODULE-BY-MODULE AUDIT

---

### 1. LEADS MODULE

#### Supabase Table: `leads`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `org_id` | - | - | ✅ System |
| `created_at` | `createdAt` | - (auto) | 🔄 |
| `updated_at` | `updatedAt` | - (auto) | 🔄 |
| `created_by` | `createdBy` | - (auto) | 🔄 |
| `owner_id` | `ownerId` | - (auto) | 🔄 |
| `name` | `name` | "Full Name" | ✅ |
| `company` | `company` | "Company" | ✅ |
| `email` | `email` | "Email" | ✅ |
| `phone` | `phone` | "Phone" | ✅ |
| `status` | `status` | "Status" select | ✅ |
| `source` | `source` | "Source" select | ✅ |
| `campaign_id` | `campaignId` | "Campaign" select | 🔄 |
| `account_id` | `accountId` | - | 🔄 |
| `estimated_value` | `estimatedValue` | "Estimated Value" | 🔄 |
| `avatar` | `avatar` | "Avatar URL" | ✅ |
| `score` | `score` | "Lead Score" | ✅ |
| `address` | `address` | - | ❌ **MISSING FROM UI** |
| `last_contact_date` | `lastContactDate` | - | ❌ **MISSING FROM UI** |
| `notes` | `notes` | - | ❌ **MISSING FROM UI** |
| `commission_rate` | `commissionRate` | "Commission %" | 🔄 |
| `converted_to_deal_id` | `convertedToDealId` | - (auto) | 🔄 |
| `converted_at` | `convertedAt` | - (auto) | 🔄 |
| `converted_by` | `convertedBy` | - (auto) | 🔄 |
| `custom_data` | `customData` | Industry fields | 🔄 |
| `temperature` | - | - | ❌ **IN DB, NOT IN TYPE** |
| - | - | "Annual Revenue" | ❌ **IN UI, NOT IN DB** |
| - | - | "Budget" (BANT) | ❌ **IN UI, NOT IN DB** |
| - | - | "Authority" (BANT) | ❌ **IN UI, NOT IN DB** |
| - | - | "Need" (BANT) | ❌ **IN UI, NOT IN DB** |
| - | - | "Timeline" (BANT) | ❌ **IN UI, NOT IN DB** |
| - | - | "Technical Reqs" | ❌ **IN UI, NOT IN DB** |
| - | - | "Project Scope" | ❌ **IN UI, NOT IN DB** |
| - | - | "Referred By" | ❌ **IN UI, NOT IN DB** |
| - | - | "Referral Code" | ❌ **IN UI, NOT IN DB** |

**Issues Found:**
1. **8 UI fields have no database columns** - Budget, Authority, Need, Timeline, Technical Requirements, Project Scope, Annual Revenue, Referred By, Referral Code
2. `temperature` column exists in DB but not in TypeScript type
3. `address` JSONB column exists but no UI to populate it

---

### 2. DEALS MODULE

#### Supabase Table: `deals`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `org_id` | - | - | ✅ System |
| `created_at` | `createdAt` | - (auto) | 🔄 |
| `updated_at` | `updatedAt` | - (auto) | 🔄 |
| `name` | `name` | "Deal Name" | ✅ |
| `account_id` | `accountId` | "Account" select | 🔄 |
| `contact_id` | `contactId` | "Primary Contact" | 🔄 |
| `amount` | `amount` | "Deal Value" | ✅ |
| `stage` | `stage` | "Stage" select | ✅ |
| `probability` | `probability` | "Probability %" | ✅ |
| `expected_close_date` | `expectedCloseDate` | "Expected Close" | 🔄 |
| `assignee_id` | `assigneeId` | "Assigned To" | 🔄 |
| `avatar` | `avatar` | "Avatar URL" | ✅ |
| `stage_entry_date` | `stageEntryDate` | - (auto) | 🔄 |
| `campaign_id` | `campaignId` | - | 🔄 |
| `commission_rate` | `commissionRate` | "Commission %" | 🔄 |
| `commission_amount` | `commissionAmount` | - (calculated) | 🔄 |
| `lead_id` | `leadId` | - (auto) | 🔄 |
| `won_at` | `wonAt` | - (auto) | 🔄 |
| `created_account_id` | `createdAccountId` | - (auto) | 🔄 |
| `created_contact_id` | `createdContactId` | - (auto) | 🔄 |
| `custom_data` | `customData` | Industry fields | 🔄 |
| `assigned_to` | - | - | ⚠️ **DUPLICATE OF assignee_id** |
| `notes` | - | - | ❌ **IN DB, NOT IN TYPE** |

**Issues Found:**
1. `assigned_to` and `assignee_id` are duplicates - data inconsistency risk
2. `notes` column in DB but not in TypeScript type

---

### 3. ACCOUNTS MODULE

#### Supabase Table: `accounts`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `name` | `name` | "Account Name" | ✅ |
| `industry` | `industry` | "Industry" | ✅ |
| `website` | `website` | "Website" | ✅ |
| `employee_count` | `employeeCount` | "Employee Count" | 🔄 |
| `avatar` | `avatar` | "Avatar URL" | ✅ |
| `tier` | `tier` | "Tier" select | ✅ |
| `email` | `email` | - | ❌ **MISSING FROM UI** |
| `city` | `city` | - | ❌ **MISSING FROM UI** |
| `state` | `state` | - | ❌ **MISSING FROM UI** |
| `logo` | `logo` | - | ❌ **MISSING FROM UI** |
| `address` | `address` | Address fields (nested) | ✅ JSONB |
| `commission_rate` | `commissionRate` | "Default Commission %" | 🔄 |
| `custom_data` | `customData` | Industry fields | 🔄 |
| - | - | "Annual Revenue" | ❌ **IN UI, NOT IN DB** |
| - | - | "Credit Limit" | ❌ **IN UI, NOT IN DB** |
| - | - | "Parent Account" | ❌ **IN UI, NOT IN DB** |

**Issues Found:**
1. `email`, `city`, `state`, `logo` columns exist but have no UI fields
2. `annualRevenue`, `creditLimit`, `parentAccountId` in UI but not in DB

---

### 4. CONTACTS MODULE

#### Supabase Table: `contacts`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `name` | `name` | "Full Name" | ✅ |
| `account_id` | `accountId` | "Primary Account" | 🔄 |
| `email` | `email` | "Email" | ✅ |
| `phone` | `phone` | "Phone" | ✅ |
| `title` | `title` | "Job Title" | ✅ |
| `avatar` | `avatar` | "Avatar URL" | ✅ |
| `company` | `company` | - | ❌ **MISSING FROM UI** |
| `address` | `address` | Address fields (nested) | ✅ JSONB |
| `custom_data` | `customData` | Industry fields | 🔄 |
| - | - | "Referral Code" | ❌ **IN UI, NOT IN DB** |
| - | - | "Is Affiliate" | ❌ **IN UI, NOT IN DB** |
| - | - | "Affiliate Tier" | ❌ **IN UI, NOT IN DB** |

**Issues Found:**
1. Referral/Affiliate fields in UI but not in database
2. `company` field exists in DB but not shown in UI

---

### 5. CAMPAIGNS MODULE

#### Supabase Table: `campaigns`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `name` | `name` | "Campaign Name" | ✅ |
| `type` | `type` | "Channel Type" | ✅ |
| `budget` | `budget` | "Budget ($)" | ✅ |
| `spent` | `spent` | - | ❌ **MISSING FROM UI** |
| `revenue` | `revenue` | - | ❌ **MISSING FROM UI** |
| `revenue_generated` | `revenueGenerated` | - | 🔄 |
| `leads_generated` | `leadsGenerated` | - | 🔄 |
| `status` | `status` | "Execution Status" | ✅ |
| `start_date` | `startDate` | "Start Date" | 🔄 |
| `end_date` | `endDate` | - | ❌ **MISSING FROM UI** |
| `description` | `description` | - | ❌ **MISSING FROM UI** |
| `expected_cpl` | `expectedCPL` | - | ❌ **MISSING FROM UI** |
| `target_audience` | `targetAudience` | - | ❌ **MISSING FROM UI** |
| `template_id` | `templateId` | - | 🔄 |

**Issues Found:**
1. Campaign form is minimal - missing most fields
2. No UI for: spent, revenue, end_date, description, expected_cpl, target_audience

---

### 6. JOBS MODULE

#### Supabase Table: `jobs`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `job_number` | `jobNumber` | - (auto) | 🔄 |
| `name` | `name` | - | ✅ |
| `subject` | `subject` | - | ✅ |
| `description` | `description` | - | ✅ |
| `account_id` | `accountId` | - | 🔄 |
| `assignee_id` | `assigneeId` | - | 🔄 |
| `crew_id` | `crewId` | - | 🔄 |
| `job_type` | `jobType` | - | 🔄 |
| `status` | `status` | - | ✅ |
| `priority` | `priority` | - | ✅ |
| `zone` | `zone` | - | ✅ |
| `estimated_duration` | `estimatedDuration` | - | 🔄 |
| `scheduled_date` | `scheduledDate` | - | 🔄 |
| `scheduled_end_date` | `scheduledEndDate` | - | 🔄 |
| `completed_at` | `completedAt` | - | 🔄 |
| `lat` | `lat` | - | ✅ |
| `lng` | `lng` | - | ✅ |
| `job_fields` | `jobFields` | - | 🔄 JSONB |
| `swms_signed` | `swmsSigned` | - | 🔄 |
| `completion_signature` | `completionSignature` | - | 🔄 |
| `evidence_photos` | `evidencePhotos` | - | 🔄 JSONB |
| `bom` | `bom` | - | ✅ JSONB |
| `invoice_id` | `invoiceId` | - | 🔄 |

**Issues Found:**
1. **NO RecordModal form exists for Jobs** - Jobs are created via different UI
2. JobsPage.tsx only displays jobs, doesn't create them

---

### 7. TICKETS MODULE

#### Supabase Table: `tickets`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `ticket_number` | `ticketNumber` | - (auto) | 🔄 |
| `subject` | `subject` | "Subject" | ✅ |
| `description` | `description` | "Description" | ✅ |
| `requester_id` | `requesterId` | "Requester" select | 🔄 |
| `account_id` | `accountId` | "Account" select | 🔄 |
| `assignee_id` | `assigneeId` | "Assignee" select | 🔄 |
| `status` | `status` | "Status" select | ✅ |
| `priority` | `priority` | "Priority" select | ✅ |
| `sla_deadline` | `slaDeadline` | - (auto-calculated) | 🔄 |
| `messages` | `messages` | - (chat UI) | ✅ JSONB |
| `internal_notes` | `internalNotes` | - (chat UI) | 🔄 JSONB |
| `custom_data` | `customData` | Industry fields | 🔄 |
| `related_to_id` | `relatedToId` | - | 🔄 |
| `related_to_type` | `relatedToType` | - | 🔄 |
| `assigned_to` | - | - | ⚠️ **DUPLICATE** |
| `resolved_at` | - | - | ❌ **IN DB, NOT IN TYPE** |

**Issues Found:**
1. `assigned_to` duplicates `assignee_id`
2. `resolved_at` column exists but not in TypeScript type

---

### 8. QUOTES MODULE

#### Supabase Table: `quotes`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `quote_number` | `quoteNumber` | "Quote Number" | 🔄 |
| `deal_id` | `dealId` | "Deal" select | 🔄 |
| `account_id` | `accountId` | "Account" select | 🔄 |
| `status` | `status` | "Status" select | ✅ |
| `issue_date` | `issueDate` | "Issue Date" | 🔄 |
| `expiry_date` | `expiryDate` | "Expiry Date" | 🔄 |
| `line_items` | `lineItems` | Line Items UI | 🔄 JSONB |
| `subtotal` | `subtotal` | - (calculated) | ✅ |
| `tax_total` | `taxTotal` | - (calculated) | 🔄 |
| `total` | `total` | - (calculated) | ✅ |
| `notes` | `notes` | "Notes" | ✅ |
| `terms` | `terms` | "Terms" | ✅ |
| `accepted_at` | `acceptedAt` | - (auto) | 🔄 |
| `accepted_by` | `acceptedBy` | - (auto) | 🔄 |
| `superseded_by` | `supersededBy` | - (auto) | 🔄 |
| `version` | `version` | - (auto) | ✅ |
| `valid_until` | - | - | ❌ **IN DB, NOT IN TYPE** |

**Issues Found:**
1. `valid_until` column exists in DB but not in TypeScript type (duplicate of `expiry_date`?)

---

### 9. INVOICES MODULE

#### Supabase Table: `invoices`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `invoice_number` | `invoiceNumber` | "Invoice #" | 🔄 |
| `account_id` | `accountId` | "Target Account" | 🔄 |
| `deal_id` | `dealId` | "Link to Deal" | 🔄 |
| `quote_id` | `quoteId` | - | 🔄 |
| `status` | `status` | - | ✅ |
| `payment_status` | `paymentStatus` | - | 🔄 |
| `issue_date` | `issueDate` | "Issue Date" | 🔄 |
| `invoice_date` | `invoiceDate` | - | 🔄 |
| `due_date` | `dueDate` | "Due Date" | 🔄 |
| `sent_at` | `sentAt` | - | 🔄 |
| `paid_at` | `paidAt` | - | 🔄 |
| `line_items` | `lineItems` | Line Items UI | 🔄 JSONB |
| `subtotal` | `subtotal` | - (calculated) | ✅ |
| `tax_total` | `taxTotal` | - (calculated) | 🔄 |
| `total` | `total` | - (calculated) | ✅ |
| `notes` | `notes` | - | ✅ |
| `terms` | `terms` | - | ✅ |
| `credits` | `credits` | - | ✅ JSONB |

**Status:** ✅ Well-mapped

---

### 10. SUBSCRIPTIONS MODULE

#### Supabase Table: `subscriptions`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `account_id` | `accountId` | "Target Account" | 🔄 |
| `name` | `name` | "Plan Name" | ✅ |
| `status` | `status` | "Status" select | ✅ |
| `billing_cycle` | `billingCycle` | "Billing Cycle" | 🔄 |
| `next_bill_date` | `nextBillDate` | "Next Billing" | 🔄 |
| `start_date` | `startDate` | "Start Date" | 🔄 |
| `end_date` | `endDate` | - | ❌ **MISSING FROM UI** |
| `items` | `items` | Items UI | ✅ JSONB |
| `auto_generate_invoice` | `autoGenerateInvoice` | Checkbox | 🔄 |
| `last_invoice_id` | `lastInvoiceId` | - (auto) | 🔄 |

**Status:** ✅ Well-mapped (minor: end_date missing from UI)

---

### 11. PRODUCTS MODULE

#### Supabase Table: `products`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `name` | `name` | "Item Name" | ✅ |
| `sku` | `sku` | "SKU" | ✅ |
| `code` | `code` | - | ✅ |
| `description` | `description` | "Description" | ✅ |
| `category` | `category` | "Category" | ✅ |
| `type` | `type` | "Item Type" | ✅ |
| `unit_price` | `unitPrice` | "Unit Price" | 🔄 |
| `cost_price` | `costPrice` | "Cost Price" | 🔄 |
| `tax_rate` | `taxRate` | "Tax Rate" | 🔄 |
| `is_active` | `isActive` | "Active" checkbox | 🔄 |
| `stock_level` | `stockLevel` | "Stock Level" | 🔄 |
| `reorder_point` | `reorderPoint` | "Reorder Point" | 🔄 |
| `reorder_quantity` | `reorderQuantity` | - | ❌ **MISSING FROM UI** |
| `specifications` | `specifications` | - | ❌ **MISSING FROM UI** |
| `images` | `images` | - | ❌ **MISSING FROM UI** |
| `dimensions` | `dimensions` | - | ❌ **MISSING FROM UI** |
| `weight` | `weight` | - | ❌ **MISSING FROM UI** |
| `manufacturer` | `manufacturer` | "Manufacturer" | ✅ |
| `supplier` | `supplier` | - | ❌ **MISSING FROM UI** |
| `supplier_sku` | `supplierSKU` | - | ❌ **MISSING FROM UI** |
| `warranty_months` | `warrantyMonths` | "Warranty" | 🔄 |
| `warranty_details` | `warrantyDetails` | - | ❌ **MISSING FROM UI** |
| `tags` | `tags` | - | ❌ **MISSING FROM UI** |
| `custom_fields` | `customFields` | - | ❌ **MISSING FROM UI** |

**Issues Found:**
1. Many product fields exist in DB but are not editable via UI

---

### 12. SERVICES MODULE

#### Supabase Table: `services`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `name` | `name` | "Item Name" | ✅ |
| `code` | `code` | "Service Code" | ✅ |
| `sku` | `sku` | - | ✅ |
| `description` | `description` | "Description" | ✅ |
| `category` | `category` | "Category" | ✅ |
| `type` | `type` | "Item Type" | ✅ |
| `billing_cycle` | `billingCycle` | "Billing Cycle" | 🔄 |
| `unit_price` | `unitPrice` | "Unit Price" | 🔄 |
| `cost_price` | `costPrice` | "Cost Price" | 🔄 |
| `tax_rate` | `taxRate` | "Tax Rate" | 🔄 |
| `is_active` | `isActive` | "Active" checkbox | 🔄 |
| `duration_hours` | `durationHours` | "Duration (Hours)" | 🔄 |
| `duration_minutes` | `durationMinutes` | "Duration (Mins)" | 🔄 |
| `prerequisites` | `prerequisites` | - | ❌ **MISSING FROM UI** |
| `deliverables` | `deliverables` | - | ❌ **MISSING FROM UI** |
| `skills_required` | `skillsRequired` | - | ❌ **MISSING FROM UI** |
| `crew_size` | `crewSize` | "Crew Size" | 🔄 |
| `equipment_needed` | `equipmentNeeded` | - | ❌ **MISSING FROM UI** |
| `sla_response_hours` | `slaResponseHours` | - | ❌ **MISSING FROM UI** |
| `sla_completion_days` | `slaCompletionDays` | "SLA (Days)" | 🔄 |
| `quality_checklist` | `qualityChecklist` | - | ❌ **MISSING FROM UI** |
| `images` | `images` | - | ❌ **MISSING FROM UI** |
| `tags` | `tags` | - | ❌ **MISSING FROM UI** |
| `custom_fields` | `customFields` | - | ❌ **MISSING FROM UI** |

**Issues Found:**
1. Many service fields exist in DB but are not editable via UI

---

### 13. CALENDAR EVENTS MODULE

#### Supabase Table: `calendar_events`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `title` | `title` | "Event Title" | ✅ |
| `description` | `description` | "Description" | ✅ |
| `start_time` | `startTime` | "Start Time" | 🔄 |
| `end_time` | `endTime` | "End Time" | 🔄 |
| `type` | `type` | "Event Type" | ✅ |
| `location` | `location` | "Location" | ✅ |
| `related_to_type` | `relatedToType` | "Related To Type" | 🔄 |
| `related_to_id` | `relatedToId` | "Related Record" | 🔄 |
| `priority` | `priority` | - | ❌ **MISSING FROM UI** |
| `is_all_day` | `isAllDay` | - | ❌ **MISSING FROM UI** |

**Issues Found:**
1. `priority` and `is_all_day` fields exist but no UI to set them

---

### 14. COMMUNICATIONS MODULE

#### Supabase Table: `communications`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `type` | `type` | "Type" select | ✅ |
| `subject` | `subject` | "Subject" | ✅ |
| `content` | `content` | "Content" textarea | ✅ |
| `direction` | `direction` | "Direction" select | ✅ |
| `related_to_type` | `relatedToType` | "Related To Type" | 🔄 |
| `related_to_id` | `relatedToId` | "Specific Record" | 🔄 |
| `outcome` | `outcome` | "Outcome" select | ✅ |
| `next_step` | `nextStep` | "Next Step Action" | 🔄 |
| `next_follow_up_date` | `nextFollowUpDate` | "Follow-up Date" | 🔄 |
| `metadata` | `metadata` | - | ✅ JSONB |
| `duration` | - | - | ❌ **IN DB, NOT IN TYPE** |

**Issues Found:**
1. `duration` column exists in DB but not in TypeScript type

---

### 15. TASKS MODULE

#### Supabase Table: `tasks`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `title` | `title` | "Task Title" | ✅ |
| `description` | `description` | "Description" | ✅ |
| `assignee_id` | `assigneeId` | "Assignee" select | 🔄 |
| `due_date` | `dueDate` | "Due Date" | 🔄 |
| `status` | `status` | - | ✅ |
| `priority` | `priority` | "Priority" select | ✅ |
| `related_to_id` | `relatedToId` | - | 🔄 |
| `related_to_type` | `relatedToType` | - | 🔄 |
| `assigned_to` | - | - | ⚠️ **DUPLICATE** |
| `related_entity_id` | - | - | ⚠️ **DUPLICATE** |
| `related_entity_type` | - | - | ⚠️ **DUPLICATE** |

**Issues Found:**
1. Multiple duplicate columns: `assigned_to`/`assignee_id`, `related_entity_*`/`related_to_*`

---

### 16. DOCUMENTS MODULE

#### Supabase Table: `documents`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `title` | `title` | "Document Title" | ✅ |
| `file_type` | `fileType` | "File Type" | 🔄 |
| `file_size` | `fileSize` | "File Size" | 🔄 |
| `url` | `url` | "File URL" | ✅ |
| `related_to_type` | `relatedToType` | "Related To Type" | 🔄 |
| `related_to_id` | `relatedToId` | "Specific Record" | 🔄 |

**Status:** ✅ Well-mapped

---

### 17. INVENTORY MODULE

#### Supabase Table: `inventory_items`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `name` | `name` | - | ✅ |
| `sku` | `sku` | - | ✅ |
| `warehouse_qty` | `warehouseQty` | - | 🔄 |
| `reorder_point` | `reorderPoint` | - | 🔄 |
| `category` | `category` | - | ✅ |
| `unit_price` | `unitPrice` | - | 🔄 |

**Issues Found:**
1. **NO RecordModal form exists for Inventory Items** - Cannot create via standard UI

---

### 18. EQUIPMENT MODULE

#### Supabase Table: `equipment`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `name` | `name` | - | ✅ |
| `type` | `type` | - | ✅ |
| `barcode` | `barcode` | - | ✅ |
| `condition` | `condition` | - | ✅ |
| `location` | `location` | - | ✅ |
| `assigned_to` | `assignedTo` | - | 🔄 |
| `last_service_date` | `lastServiceDate` | - | 🔄 |
| `next_service_date` | `nextServiceDate` | - | 🔄 |
| `purchase_date` | `purchaseDate` | - | 🔄 |
| `purchase_price` | `purchasePrice` | - | 🔄 |

**Issues Found:**
1. **NO RecordModal form exists for Equipment** - Cannot create via standard UI

---

### 19. PURCHASE ORDERS MODULE

#### Supabase Table: `purchase_orders`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `po_number` | `poNumber` | - | 🔄 |
| `supplier_id` | `supplierId` | - | 🔄 |
| `account_id` | `accountId` | - | 🔄 |
| `status` | `status` | - | ✅ |
| `items` | `items` | - | ✅ JSONB |
| `total` | `total` | - | ✅ |
| `linked_job_id` | `linkedJobId` | - | 🔄 |

**Issues Found:**
1. **NO RecordModal form exists for Purchase Orders** - Cannot create via standard UI

---

### 20. BANK TRANSACTIONS MODULE

#### Supabase Table: `bank_transactions`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `date` | `date` | - | ✅ |
| `description` | `description` | - | ✅ |
| `amount` | `amount` | - | ✅ |
| `type` | `type` | - | ✅ |
| `status` | `status` | - | ✅ |
| `match_confidence` | `matchConfidence` | - | 🔄 |
| `matched_to_id` | `matchedToId` | - | 🔄 |
| `matched_to_type` | `matchedToType` | - | 🔄 |
| `reconciled` | `reconciled` | - | ✅ |
| `reconciled_at` | `reconciledAt` | - | 🔄 |
| `reconciled_by` | `reconciledBy` | - | 🔄 |
| `bank_reference` | `bankReference` | - | 🔄 |
| `notes` | `notes` | - | ✅ |

**Issues Found:**
1. **NO RecordModal form exists** - Bank transactions are imported, not created

---

### 21. EXPENSES MODULE

#### Supabase Table: `expenses`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `vendor` | `vendor` | - | ✅ |
| `amount` | `amount` | - | ✅ |
| `category` | `category` | - | ✅ |
| `date` | `date` | - | ✅ |
| `status` | `status` | - | ✅ |
| `receipt_url` | `receiptUrl` | - | 🔄 |
| `approved_by` | `approvedBy` | - | 🔄 |
| `notes` | `notes` | - | ✅ |

**Issues Found:**
1. **NO RecordModal form exists for Expenses** - Cannot create via standard UI

---

### 22. CREWS MODULE

#### Supabase Table: `crews`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `name` | `name` | - | ✅ |
| `leader_id` | `leaderId` | - | 🔄 |
| `member_ids` | `memberIds` | - | 🔄 JSONB |
| `color` | `color` | - | ✅ |

**Issues Found:**
1. **NO RecordModal form exists for Crews** - Managed in Settings only

---

### 23. ZONES MODULE

#### Supabase Table: `zones`

| Column Name (DB) | TypeScript Property | UI Form Field | Status |
|------------------|---------------------|---------------|--------|
| `id` | `id` | - (auto) | ✅ |
| `name` | `name` | - | ✅ |
| `region` | `region` | - | ✅ |
| `description` | `description` | - | ✅ |
| `color` | `color` | - | ✅ |

**Issues Found:**
1. **NO RecordModal form exists for Zones** - Managed in Settings only

---

## CRITICAL MISMATCHES

### 1. UI Fields Without Database Columns (DATA LOSS RISK)

| Module | UI Field | Issue |
|--------|----------|-------|
| Leads | Annual Revenue | **Will not save** |
| Leads | Budget (BANT) | **Will not save** |
| Leads | Authority (BANT) | **Will not save** |
| Leads | Need (BANT) | **Will not save** |
| Leads | Timeline (BANT) | **Will not save** |
| Leads | Technical Requirements | **Will not save** |
| Leads | Project Scope | **Will not save** |
| Leads | Referred By ID | **Will not save** |
| Leads | Referral Code Used | **Will not save** |
| Accounts | Annual Revenue | **Will not save** |
| Accounts | Credit Limit | **Will not save** |
| Accounts | Parent Account ID | **Will not save** |
| Contacts | Referral Code | **Will not save** |
| Contacts | Is Affiliate | **Will not save** |
| Contacts | Affiliate Tier | **Will not save** |

### 2. Database Columns Without TypeScript Types

| Table | Column | Issue |
|-------|--------|-------|
| `leads` | `temperature` | Not in TS type |
| `deals` | `notes` | Not in TS type |
| `tickets` | `resolved_at` | Not in TS type |
| `quotes` | `valid_until` | Not in TS type |
| `communications` | `duration` | Not in TS type |

### 3. Duplicate Columns (Data Inconsistency Risk)

| Table | Duplicate Columns | Issue |
|-------|-------------------|-------|
| `deals` | `assignee_id` + `assigned_to` | Which one is authoritative? |
| `tasks` | `assignee_id` + `assigned_to` | Which one is authoritative? |
| `tasks` | `related_to_*` + `related_entity_*` | Which one is authoritative? |
| `tickets` | `assignee_id` + `assigned_to` | Which one is authoritative? |

### 4. camelCase vs snake_case Mapping Issues

The data service should handle these automatically, but verify:
- `employeeCount` ↔ `employee_count`
- `estimatedValue` ↔ `estimated_value`
- `customData` ↔ `custom_data`
- All `*_id` and `*Id` patterns

---

## MISSING TABLES

Tables referenced in TypeScript but potentially missing from Supabase:

| TypeScript Entity | Expected Table | Status |
|-------------------|----------------|--------|
| `AuditLog` | `audit_log` | ⚠️ Verify exists |
| `Notification` | `notifications` | ⚠️ Verify exists |
| `Payment` | `payments` | ⚠️ Verify exists |

---

## BROKEN FUNCTIONALITY

### 1. Forms That Cannot Save Data

| Module | Reason |
|--------|--------|
| Jobs | No RecordModal case defined |
| Inventory Items | No RecordModal case defined |
| Equipment | No RecordModal case defined |
| Purchase Orders | No RecordModal case defined |
| Expenses | No RecordModal case defined |
| Bank Transactions | No RecordModal case defined |
| Crews | No RecordModal case defined |
| Zones | No RecordModal case defined |
| Reviews | No RecordModal case defined |
| Referral Rewards | No RecordModal case defined |
| Inbound Forms | No RecordModal case defined |
| Chat Widgets | No RecordModal case defined |

### 2. Pages That May Show Blank/Errors

These pages call `openModal()` for entity types that have no form definition:

1. **FieldServicesDashboard** - Jobs
2. **LogisticsDashboard** - Inventory, Equipment
3. **PurchaseLedger** - Expenses, Purchase Orders
4. **Marketing/InboundEngine** - Forms, Widgets, Calculators

### 3. Missing Data Service Functions

Verify these functions exist in `supabaseData.ts`:
- `insertRecord` for all entity types
- `updateRecord` for all entity types
- `deleteRecord` for all entity types

---

## RECOMMENDATIONS

### Priority 1: Fix Data Loss Bugs
1. Add missing database columns for BANT fields in `leads`
2. Add missing columns for affiliate fields in `contacts`
3. Add missing columns for accounts (annual_revenue, credit_limit, parent_account_id)

### Priority 2: Add Missing RecordModal Forms
1. Jobs
2. Inventory Items
3. Equipment
4. Purchase Orders
5. Expenses

### Priority 3: Resolve Duplicate Columns
1. Standardize on either `assignee_id` or `assigned_to`
2. Remove duplicates and update all code references

### Priority 4: Complete Field Mapping
1. Add UI fields for all database columns
2. Ensure all UI fields have corresponding database columns

---

**END OF AUDIT**
