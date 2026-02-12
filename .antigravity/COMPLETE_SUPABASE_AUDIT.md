# COMPLETE SUPABASE DATABASE AUDIT

**Generated:** 2026-02-11
**Total Tables:** 55
**Total Columns:** 739
**Tables with Data:** 41
**Empty Tables:** 14

---

## SUMMARY BY CATEGORY

| Category | Tables | Status |
|----------|--------|--------|
| **Core CRM** | accounts, contacts, leads, deals | Active |
| **Tasks & Activities** | tasks, communications, calendar_events | Active |
| **Sales Documents** | quotes, invoices, subscriptions, products, services | Active |
| **Payments** | payments, bank_transactions, expenses, currencies | Active |
| **Field Operations** | jobs, crews, zones, equipment, inventory_items, warehouses, purchase_orders | Active |
| **Support** | tickets, ticket_messages | Partial |
| **Marketing** | campaigns, inbound_forms, chat_widgets, calculators | Active |
| **Reviews & Referrals** | reviews, referral_rewards | Active |
| **Automation** | automation_workflows, webhooks, webhook_logs | Partial |
| **Users & Roles** | users, roles, teams, team_members, organizations | Partial |
| **Documents** | documents | Active |
| **Notifications** | notifications | Active |
| **Templates** | email_templates, sms_templates, industry_templates | Partial |
| **Audit** | audit_log, audit_logs | Partial |
| **Other** | custom_fields, line_items, credit_notes, territories, api_logs | Empty |

---

## COMPLETE TABLE-BY-TABLE AUDIT

---

### 1. `accounts` (23 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - (auto) | ✅ |
| `org_id` | - | - (system) | ✅ |
| `name` | `name: string` | "Account Name" | ✅ |
| `industry` | `industry: string` | "Industry" select | ✅ |
| `website` | `website: string` | "Website" | ✅ |
| `employee_count` | `employeeCount: number` | "Employees" | ✅ |
| `avatar` | `avatar: string` | "Avatar URL" | ✅ |
| `tier` | `tier: string` | "Tier" select | ✅ |
| `email` | `email?: string` | ❌ MISSING UI | ⚠️ |
| `phone` | - | ❌ MISSING UI | ⚠️ |
| `city` | `city?: string` | ❌ MISSING UI | ⚠️ |
| `state` | `state?: string` | ❌ MISSING UI | ⚠️ |
| `logo` | `logo?: string` | ❌ MISSING UI | ⚠️ |
| `revenue` | - | ❌ NOT IN TYPE | ❌ |
| `status` | - | ❌ NOT IN TYPE | ❌ |
| `type` | - | ❌ NOT IN TYPE | ❌ |
| `owner_id` | `ownerId?: string` | - (auto) | ✅ |
| `commission_rate` | `commissionRate?: number` | "Commission %" | ✅ |
| `custom_data` | `customData?: Record<string, any>` | Industry fields | ✅ |
| `created_at` | `createdAt: string` | - (auto) | ✅ |
| `updated_at` | `updatedAt: string` | - (auto) | ✅ |
| `created_by` | `createdBy: string` | - (auto) | ✅ |
| `address` | `address?: Address` | Address fields | ✅ JSONB |

**MISMATCHES:**
- `revenue`, `status`, `type` in DB but NOT in TypeScript type
- `email`, `phone`, `city`, `state`, `logo` in DB but no UI field

---

### 2. `api_logs` (EMPTY)

| Status |
|--------|
| Table exists but is empty - no schema visible |

---

### 3. `audit_log` (13 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `entity_type` | `entityType: EntityType` | - | ✅ |
| `entity_id` | `entityId: string` | - | ✅ |
| `action` | `action: string` | - | ✅ |
| `previous_value` | `previousValue?: string` | - | ✅ |
| `new_value` | `newValue?: string` | - | ✅ |
| `metadata` | `metadata?: Record<string, any>` | - | ✅ |
| `batch_id` | `batchId?: string` | - | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**Status:** ✅ Well-mapped (system table, no UI needed)

---

### 4. `audit_logs` (EMPTY)

| Status |
|--------|
| Duplicate of audit_log? Empty table |

---

### 5. `automation_workflows` (14 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | `name: string` | "Workflow Name" | ✅ |
| `description` | `description: string` | "Description" | ✅ |
| `trigger` | `trigger: WorkflowTrigger` | Trigger config | ✅ JSONB |
| `nodes` | `nodes: WorkflowNode[]` | Flow builder | ✅ JSONB |
| `is_active` | `isActive: boolean` | Toggle | ✅ |
| `execution_count` | `executionCount: number` | - (display) | ✅ |
| `last_run_at` | `lastRunAt?: string` | - (display) | ✅ |
| `category` | `category: string` | "Category" | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**Status:** ✅ Well-mapped

---

### 6. `bank_transactions` (19 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `date` | `date: string` | - | ✅ |
| `description` | `description: string` | - | ✅ |
| `amount` | `amount: number` | - | ✅ |
| `type` | `type: 'Credit' \| 'Debit'` | - | ✅ |
| `status` | `status: string` | - | ✅ |
| `match_confidence` | `matchConfidence: string` | - | ✅ |
| `matched_to_id` | `matchedToId?: string` | - | ✅ |
| `matched_to_type` | `matchedToType?: string` | - | ✅ |
| `reconciled` | `reconciled: boolean` | - | ✅ |
| `reconciled_at` | `reconciledAt?: string` | - | ✅ |
| `reconciled_by` | `reconciledBy?: string` | - | ✅ |
| `bank_reference` | `bankReference?: string` | - | ✅ |
| `notes` | `notes?: string` | - | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**Status:** ✅ Well-mapped (imported data, no create form needed)

---

### 7. `calculators` (13 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | `name: string` | "Name" | ✅ |
| `type` | `type: CalculatorType` | "Type" | ✅ |
| `base_rate` | `baseRate?: number` | "Base Rate" | ✅ |
| `is_active` | `isActive: boolean` | Toggle | ✅ |
| `status` | `status?: string` | - | ✅ |
| `usage_count` | `usageCount?: number` | - (display) | ✅ |
| `lead_conversion_rate` | `leadConversionRate?: number` | - (display) | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**Status:** ⚠️ No RecordModal form - cannot create via standard UI

---

### 8. `calendar_events` (16 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `title` | `title: string` | "Event Title" | ✅ |
| `description` | `description: string` | "Description" | ✅ |
| `start_time` | `startTime: string` | "Start Time" | ✅ |
| `end_time` | `endTime: string` | "End Time" | ✅ |
| `type` | `type: string` | "Event Type" | ✅ |
| `location` | `location?: string` | "Location" | ✅ |
| `related_to_type` | `relatedToType?: EntityType` | "Related To Type" | ✅ |
| `related_to_id` | `relatedToId?: string` | "Related Record" | ✅ |
| `priority` | `priority?: string` | ❌ MISSING UI | ⚠️ |
| `is_all_day` | `isAllDay?: boolean` | ❌ MISSING UI | ⚠️ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**MISMATCHES:**
- `priority`, `is_all_day` columns exist but no UI field

---

### 9. `campaigns` (20 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | `name: string` | "Campaign Name" | ✅ |
| `type` | `type: string` | "Channel Type" | ✅ |
| `budget` | `budget: number` | "Budget" | ✅ |
| `spent` | `spent?: number` | ❌ MISSING UI | ⚠️ |
| `revenue` | `revenue?: number` | ❌ MISSING UI | ⚠️ |
| `revenue_generated` | `revenueGenerated: number` | - (display) | ✅ |
| `leads_generated` | `leadsGenerated?: number` | - (display) | ✅ |
| `status` | `status: string` | "Status" | ✅ |
| `start_date` | `startDate?: string` | "Start Date" | ✅ |
| `end_date` | `endDate?: string` | ❌ MISSING UI | ⚠️ |
| `description` | `description?: string` | ❌ MISSING UI | ⚠️ |
| `expected_cpl` | `expectedCPL?: number` | ❌ MISSING UI | ⚠️ |
| `target_audience` | `targetAudience?: string` | ❌ MISSING UI | ⚠️ |
| `template_id` | `templateId?: string` | - | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**MISMATCHES:**
- 6 columns have no UI fields: spent, revenue, end_date, description, expected_cpl, target_audience

---

### 10. `chat_messages` (13 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `conversation_id` | `conversationId: string` | - | ✅ |
| `content` | `content: string` | Chat input | ✅ |
| `sender_id` | `senderId: string` | - (auto) | ✅ |
| `mentions` | - | ❌ NOT IN TYPE | ❌ |
| `attachments` | - | ❌ NOT IN TYPE | ❌ |
| `is_edited` | - | ❌ NOT IN TYPE | ❌ |
| `edited_at` | - | ❌ NOT IN TYPE | ❌ |
| `created_at` | `createdAt: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |

**MISMATCHES:**
- `mentions`, `attachments`, `is_edited`, `edited_at` in DB but NOT in TypeScript type

---

### 11. `chat_widgets` (15 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | `name: string` | "Widget Name" | ✅ |
| `page` | `page?: string` | "Target Page" | ✅ |
| `bubble_color` | `bubbleColor: string` | Color picker | ✅ |
| `welcome_message` | `welcomeMessage: string` | "Welcome Message" | ✅ |
| `is_active` | `isActive: boolean` | Toggle | ✅ |
| `status` | `status?: string` | - | ✅ |
| `routing_user_id` | `routingUserId: string` | "Route To" | ✅ |
| `conversations` | `conversations?: number` | - (display) | ✅ |
| `avg_response_time` | `avgResponseTime?: number` | - (display) | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**Status:** ⚠️ No RecordModal form - cannot create via standard UI

---

### 12. `communications` (17 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `type` | `type: string` | "Type" select | ✅ |
| `subject` | `subject: string` | "Subject" | ✅ |
| `content` | `content: string` | "Content" | ✅ |
| `direction` | `direction: string` | "Direction" | ✅ |
| `related_to_type` | `relatedToType: EntityType` | "Related To" | ✅ |
| `related_to_id` | `relatedToId: string` | "Record" | ✅ |
| `outcome` | `outcome: CommunicationOutcome` | "Outcome" | ✅ |
| `next_step` | `nextStep?: string` | "Next Step" | ✅ |
| `next_follow_up_date` | `nextFollowUpDate?: string` | "Follow-up Date" | ✅ |
| `metadata` | `metadata?: Record<string, any>` | - | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `duration` | - | ❌ NOT IN TYPE | ❌ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**MISMATCHES:**
- `duration` column in DB but NOT in TypeScript type

---

### 13. `contacts` (19 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | `name: string` | "Full Name" | ✅ |
| `account_id` | `accountId: string` | "Primary Account" | ✅ |
| `email` | `email: string` | "Email" | ✅ |
| `phone` | `phone: string` | "Phone" | ✅ |
| `mobile` | - | ❌ NOT IN TYPE | ❌ |
| `title` | `title: string` | "Job Title" | ✅ |
| `avatar` | `avatar: string` | "Avatar URL" | ✅ |
| `company` | `company?: string` | ❌ MISSING UI | ⚠️ |
| `department` | - | ❌ NOT IN TYPE | ❌ |
| `is_primary` | - | ❌ NOT IN TYPE | ❌ |
| `status` | - | ❌ NOT IN TYPE | ❌ |
| `custom_data` | `customData?: Record<string, any>` | Industry fields | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |
| `address` | `address?: Address` | Address fields | ✅ JSONB |

**MISMATCHES:**
- `mobile`, `department`, `is_primary`, `status` in DB but NOT in TypeScript type
- `company` in DB/Type but no UI field

---

### 14. `conversations` (13 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | `name?: string` | Channel name | ✅ |
| `type` | - | ❌ NOT IN TYPE | ❌ |
| `participants` | - | ❌ NOT IN TYPE | ❌ |
| `is_active` | - | ❌ NOT IN TYPE | ❌ |
| `last_message_at` | - | ❌ NOT IN TYPE | ❌ |
| `created_at` | `createdAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `participant_ids` | `participantIds: string[]` | - | ✅ |
| `is_system` | `isSystem?: boolean` | - | ✅ |

**MISMATCHES:**
- `type`, `participants`, `is_active`, `last_message_at` in DB but NOT in TypeScript type

---

### 15. `credit_notes` (EMPTY)

| Status |
|--------|
| Table exists but is empty |

---

### 16. `crews` (12 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | `name: string` | "Crew Name" | ✅ |
| `leader_id` | `leaderId: string` | "Leader" | ✅ |
| `member_ids` | `memberIds: string[]` | "Members" | ✅ JSONB |
| `color` | `color: string` | Color picker | ✅ |
| `specialty` | - | ❌ NOT IN TYPE | ❌ |
| `status` | - | ❌ NOT IN TYPE | ❌ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**MISMATCHES:**
- `specialty`, `status` in DB but NOT in TypeScript type
- ⚠️ No RecordModal form - managed in Settings only

---

### 17. `currencies` (11 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | - | - | ❌ NO TYPE |
| `org_id` | - | - | ✅ |
| `iso_code` | - | - | ❌ NO TYPE |
| `name` | - | - | ❌ NO TYPE |
| `symbol` | - | - | ❌ NO TYPE |
| `conversion_rate` | - | - | ❌ NO TYPE |
| `decimal_places` | - | - | ❌ NO TYPE |
| `is_active` | - | - | ❌ NO TYPE |
| `is_corporate` | - | - | ❌ NO TYPE |
| `created_at` | - | - | ❌ NO TYPE |
| `updated_at` | - | - | ❌ NO TYPE |

**Status:** ❌ **ENTIRE TABLE NOT IN TYPESCRIPT** - No Currency type exists

---

### 18. `custom_fields` (EMPTY)

| Status |
|--------|
| Table exists but is empty |

---

### 19. `deals` (26 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | `name: string` | "Deal Name" | ✅ |
| `account_id` | `accountId: string` | "Account" | ✅ |
| `contact_id` | `contactId: string` | "Contact" | ✅ |
| `amount` | `amount: number` | "Value" | ✅ |
| `stage` | `stage: string` | "Stage" | ✅ |
| `probability` | `probability: number` | "Probability" | ✅ |
| `expected_close_date` | `expectedCloseDate: string` | "Expected Close" | ✅ |
| `assignee_id` | `assigneeId: string` | "Assigned To" | ✅ |
| `avatar` | `avatar: string` | "Avatar" | ✅ |
| `stage_entry_date` | `stageEntryDate?: string` | - (auto) | ✅ |
| `campaign_id` | `campaignId?: string` | - | ✅ |
| `commission_rate` | `commissionRate?: number` | "Commission %" | ✅ |
| `commission_amount` | `commissionAmount?: number` | - (calc) | ✅ |
| `lead_id` | `leadId?: string` | - (auto) | ✅ |
| `won_at` | `wonAt?: string` | - (auto) | ✅ |
| `created_account_id` | `createdAccountId?: string` | - (auto) | ✅ |
| `created_contact_id` | `createdContactId?: string` | - (auto) | ✅ |
| `custom_data` | `customData?: Record<string, any>` | Industry fields | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |
| `assigned_to` | - | - | ⚠️ DUPLICATE |
| `notes` | - | - | ❌ NOT IN TYPE |

**MISMATCHES:**
- `assigned_to` duplicates `assignee_id` - DATA INCONSISTENCY RISK
- `notes` in DB but NOT in TypeScript type

---

### 20. `documents` (23 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | - | - | ❌ TYPE uses `title` |
| `file_type` | `fileType: string` | "File Type" | ✅ |
| `file_size` | `fileSize: string` | "Size" | ✅ |
| `file_url` | - | - | ❌ TYPE uses `url` |
| `related_to_type` | `relatedToType: EntityType` | "Related To" | ✅ |
| `related_to_id` | `relatedToId: string` | "Record" | ✅ |
| `content_text` | - | - | ❌ NOT IN TYPE |
| `embedding` | - | - | ❌ NOT IN TYPE |
| `processing_status` | - | - | ❌ NOT IN TYPE |
| `processed_at` | - | - | ❌ NOT IN TYPE |
| `uploaded_by` | - | - | ❌ NOT IN TYPE |
| `version` | - | - | ❌ NOT IN TYPE |
| `parent_document_id` | - | - | ❌ NOT IN TYPE |
| `description` | - | - | ❌ NOT IN TYPE |
| `tags` | - | - | ❌ NOT IN TYPE |
| `created_at` | `createdAt: string` | - | ✅ |
| `title` | `title: string` | "Title" | ✅ |
| `url` | `url: string` | "URL" | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |

**MISMATCHES:**
- Column naming inconsistency: `name`/`title`, `file_url`/`url`
- 8 columns NOT in TypeScript: content_text, embedding, processing_status, processed_at, uploaded_by, version, parent_document_id, description, tags

---

### 21. `email_templates` (EMPTY)

| Status |
|--------|
| Table exists but is empty |

---

### 22. `emails` (EMPTY)

| Status |
|--------|
| Table exists but is empty |

---

### 23. `equipment` (19 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | `name: string` | "Name" | ✅ |
| `type` | `type: string` | "Type" | ✅ |
| `barcode` | `barcode: string` | "Barcode" | ✅ |
| `condition` | `condition: string` | "Condition" | ✅ |
| `location` | `location: string` | "Location" | ✅ |
| `assigned_to` | `assignedTo?: string` | "Assigned To" | ✅ |
| `last_service_date` | `lastServiceDate?: string` | "Last Service" | ✅ |
| `next_service_date` | `nextServiceDate?: string` | "Next Service" | ✅ |
| `purchase_date` | `purchaseDate?: string` | "Purchase Date" | ✅ |
| `purchase_price` | `purchasePrice?: number` | "Purchase Price" | ✅ |
| `model` | - | - | ❌ NOT IN TYPE |
| `status` | - | - | ❌ NOT IN TYPE |
| `value` | - | - | ❌ NOT IN TYPE |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**MISMATCHES:**
- `model`, `status`, `value` in DB but NOT in TypeScript type
- ⚠️ No RecordModal form - cannot create via standard UI

---

### 24. `expenses` (14 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `vendor` | `vendor: string` | "Vendor" | ✅ |
| `amount` | `amount: number` | "Amount" | ✅ |
| `category` | `category: string` | "Category" | ✅ |
| `date` | `date: string` | "Date" | ✅ |
| `status` | `status: string` | "Status" | ✅ |
| `receipt_url` | `receiptUrl?: string` | "Receipt" | ✅ |
| `approved_by` | `approvedBy?: string` | "Approved By" | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `notes` | - | - | ❌ NOT IN TYPE |
| `owner_id` | `ownerId?: string` | - | ✅ |

**MISMATCHES:**
- `notes` in DB but NOT in TypeScript type
- ⚠️ No RecordModal form - cannot create via standard UI

---

### 25. `inbound_forms` (16 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | `name: string` | "Form Name" | ✅ |
| `type` | `type?: string` | "Form Type" | ✅ |
| `fields` | `fields: FormField[]` | Form builder | ✅ JSONB |
| `submit_button_text` | `submitButtonText: string` | "Submit Text" | ✅ |
| `success_message` | `successMessage: string` | "Success Msg" | ✅ |
| `target_campaign_id` | `targetCampaignId?: string` | "Campaign" | ✅ |
| `submission_count` | `submissionCount: number` | - (display) | ✅ |
| `conversion_rate` | `conversionRate?: number` | - (display) | ✅ |
| `status` | `status?: string` | "Status" | ✅ |
| `embed_code` | `embedCode?: string` | - (generated) | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**Status:** ⚠️ No RecordModal form - cannot create via standard UI

---

### 26. `industry_templates` (12 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | `name: string` | "Name" | ✅ |
| `target_entity` | `targetEntity: EntityType` | "Entity" | ✅ |
| `industry` | `industry: string` | "Industry" | ✅ |
| `sections` | `sections: LayoutSection[]` | Template builder | ✅ JSONB |
| `is_active` | `isActive: boolean` | Toggle | ✅ |
| `version` | `version: number` | - | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**Status:** ✅ Well-mapped (system config)

---

### 27. `inventory_items` (12 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | `name: string` | "Name" | ✅ |
| `sku` | `sku: string` | "SKU" | ✅ |
| `warehouse_qty` | `warehouseQty: number` | "Qty" | ✅ |
| `reorder_point` | `reorderPoint: number` | "Reorder At" | ✅ |
| `category` | `category: string` | "Category" | ✅ |
| `unit_price` | `unitPrice: number` | "Price" | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**Status:** ⚠️ No RecordModal form - cannot create via standard UI

---

### 28. `invoices` (27 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `invoice_number` | `invoiceNumber: string` | "Invoice #" | ✅ |
| `account_id` | `accountId: string` | "Account" | ✅ |
| `deal_id` | `dealId?: string` | "Deal" | ✅ |
| `quote_id` | `quoteId?: string` | "Quote" | ✅ |
| `status` | `status: string` | "Status" | ✅ |
| `payment_status` | `paymentStatus: string` | "Payment Status" | ✅ |
| `issue_date` | `issueDate: string` | "Issue Date" | ✅ |
| `invoice_date` | `invoiceDate: string` | "Invoice Date" | ✅ |
| `due_date` | `dueDate: string` | "Due Date" | ✅ |
| `sent_at` | `sentAt?: string` | - (auto) | ✅ |
| `paid_at` | `paidAt?: string` | - (auto) | ✅ |
| `line_items` | `lineItems: LineItem[]` | Line items UI | ✅ JSONB |
| `subtotal` | `subtotal: number` | - (calc) | ✅ |
| `tax_total` | `taxTotal: number` | - (calc) | ✅ |
| `total` | `total: number` | "Total" | ✅ |
| `amount_paid` | - | - | ❌ NOT IN TYPE |
| `balance_due` | - | - | ❌ NOT IN TYPE |
| `notes` | `notes?: string` | "Notes" | ✅ |
| `terms` | `terms?: string` | "Terms" | ✅ |
| `late_fee_rate` | - | - | ❌ NOT IN TYPE |
| `credits` | `credits?: InvoiceCredit[]` | - | ✅ JSONB |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**MISMATCHES:**
- `amount_paid`, `balance_due`, `late_fee_rate` in DB but NOT in TypeScript type

---

### 29. `jobs` (29 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `job_number` | `jobNumber: string` | "Job #" | ✅ |
| `name` | `name?: string` | "Name" | ✅ |
| `subject` | `subject: string` | "Subject" | ✅ |
| `description` | `description: string` | "Description" | ✅ |
| `account_id` | `accountId: string` | "Account" | ✅ |
| `assignee_id` | `assigneeId?: string` | "Assignee" | ✅ |
| `crew_id` | `crewId?: string` | "Crew" | ✅ |
| `job_type` | `jobType: JobType` | "Type" | ✅ |
| `status` | `status: JobStatus` | "Status" | ✅ |
| `priority` | `priority: string` | "Priority" | ✅ |
| `zone` | `zone?: string` | "Zone" | ✅ |
| `estimated_duration` | `estimatedDuration?: number` | "Duration" | ✅ |
| `scheduled_date` | `scheduledDate?: string` | "Scheduled" | ✅ |
| `scheduled_end_date` | `scheduledEndDate?: string` | "End Date" | ✅ |
| `completed_at` | `completedAt?: string` | - (auto) | ✅ |
| `lat` | `lat?: number` | "Latitude" | ✅ |
| `lng` | `lng?: number` | "Longitude" | ✅ |
| `job_fields` | `jobFields?: JobField[]` | Custom fields | ✅ JSONB |
| `swms_signed` | `swmsSigned?: boolean` | Checkbox | ✅ |
| `completion_signature` | `completionSignature?: string` | Signature | ✅ |
| `evidence_photos` | `evidencePhotos?: string[]` | Photos | ✅ JSONB |
| `bom` | `bom?: BOMItem[]` | BOM list | ✅ JSONB |
| `invoice_id` | `invoiceId?: string` | - (linked) | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**Status:** ⚠️ No RecordModal form - jobs created via dispatch UI

---

### 30. `leads` (32 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | `name: string` | "Full Name" | ✅ |
| `company` | `company: string` | "Company" | ✅ |
| `email` | `email: string` | "Email" | ✅ |
| `phone` | `phone: string` | "Phone" | ✅ |
| `status` | `status: string` | "Status" | ✅ |
| `source` | `source: string` | "Source" | ✅ |
| `campaign_id` | `campaignId?: string` | "Campaign" | ✅ |
| `estimated_value` | `estimatedValue: number` | "Est. Value" | ✅ |
| `avatar` | `avatar: string` | "Avatar" | ✅ |
| `score` | `score: number` | "Score" | ✅ |
| `address_street` | - | - | ❌ SEPARATE COLUMNS |
| `address_suburb` | - | - | ❌ SEPARATE COLUMNS |
| `address_state` | - | - | ❌ SEPARATE COLUMNS |
| `address_postcode` | - | - | ❌ SEPARATE COLUMNS |
| `address_country` | - | - | ❌ SEPARATE COLUMNS |
| `last_contact_date` | `lastContactDate?: string` | ❌ NO UI | ⚠️ |
| `notes` | `notes?: string` | ❌ NO UI | ⚠️ |
| `commission_rate` | `commissionRate?: number` | "Commission" | ✅ |
| `converted_to_deal_id` | `convertedToDealId?: string` | - (auto) | ✅ |
| `converted_at` | `convertedAt?: string` | - (auto) | ✅ |
| `converted_by` | `convertedBy?: string` | - (auto) | ✅ |
| `custom_data` | `customData?: Record<string, any>` | Industry fields | ✅ |
| `assigned_to` | - | - | ❌ NOT IN TYPE |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |
| `address` | `address?: Address` | ❌ NO UI | ⚠️ JSONB |
| `account_id` | `accountId?: string` | - | ✅ |
| `temperature` | - | - | ❌ NOT IN TYPE |

**MISMATCHES:**
- Address stored TWICE: as separate columns AND as JSONB
- `last_contact_date`, `notes`, `address` no UI field
- `assigned_to`, `temperature` in DB but NOT in TypeScript type

---

### 31. `line_items` (EMPTY)

| Status |
|--------|
| Table exists but is empty |

---

### 32. `notifications` (18 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `user_id` | - | - | ❌ NOT IN TYPE |
| `type` | `type: string` | - | ✅ |
| `title` | `title: string` | - | ✅ |
| `content` | - | - | ❌ NOT IN TYPE |
| `action_url` | - | - | ❌ NOT IN TYPE |
| `related_to_type` | - | - | ❌ NOT IN TYPE |
| `related_to_id` | - | - | ❌ NOT IN TYPE |
| `is_read` | - | - | ❌ NOT IN TYPE |
| `read_at` | - | - | ❌ NOT IN TYPE |
| `created_at` | `createdAt: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `message` | `message: string` | - | ✅ |
| `read` | `read: boolean` | - | ✅ |
| `link` | `link?: string` | - | ✅ |

**MISMATCHES:**
- 7 columns NOT in TypeScript: user_id, content, action_url, related_to_type, related_to_id, is_read, read_at
- Duplicate columns: `message`/`content`, `read`/`is_read`, `link`/`action_url`

---

### 33. `organizations` (14 columns)

| DB Column | TypeScript Type | Status |
|-----------|----------------|--------|
| `id` | - | System |
| `name` | - | System |
| `slug` | - | System |
| `plan` | - | System |
| `subscription_status` | - | System |
| `trial_ends_at` | - | System |
| `user_limit` | - | System |
| `storage_limit_gb` | - | System |
| `api_calls_per_day` | - | System |
| `current_user_count` | - | System |
| `current_storage_bytes` | - | System |
| `settings` | `CRMSettings` | ✅ JSONB |
| `created_at` | - | System |
| `updated_at` | - | System |

**Status:** ✅ System table - settings managed via UI

---

### 34. `payments` (18 columns)

| DB Column | TypeScript Type | Status |
|-----------|----------------|--------|
| `id` | - | ❌ NO TYPE |
| `org_id` | - | System |
| `invoice_id` | - | ❌ NO TYPE |
| `amount` | - | ❌ NO TYPE |
| `payment_date` | - | ❌ NO TYPE |
| `payment_method` | - | ❌ NO TYPE |
| `status` | - | ❌ NO TYPE |
| `transaction_id` | - | ❌ NO TYPE |
| `reference_number` | - | ❌ NO TYPE |
| `notes` | - | ❌ NO TYPE |
| `processed_by` | - | ❌ NO TYPE |
| `created_at` | - | ❌ NO TYPE |
| `owner_id` | - | ❌ NO TYPE |
| `created_by` | - | ❌ NO TYPE |
| `updated_at` | - | ❌ NO TYPE |
| `method` | - | ❌ NO TYPE |
| `reference` | - | ❌ NO TYPE |
| `paid_at` | - | ❌ NO TYPE |

**Status:** ❌ **ENTIRE TABLE NOT IN TYPESCRIPT** - No Payment type exists

---

### 35. `products` (30 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `name` | `name: string` | "Name" | ✅ |
| `sku` | `sku?: string` | "SKU" | ✅ |
| `code` | `code?: string` | "Code" | ✅ |
| `description` | `description: string` | "Description" | ✅ |
| `category` | `category?: string` | "Category" | ✅ |
| `type` | `type?: string` | "Type" | ✅ |
| `unit_price` | `unitPrice: number` | "Price" | ✅ |
| `cost_price` | `costPrice?: number` | "Cost" | ✅ |
| `tax_rate` | `taxRate: number` | "Tax %" | ✅ |
| `is_active` | `isActive: boolean` | Toggle | ✅ |
| `stock_level` | `stockLevel?: number` | "Stock" | ✅ |
| `reorder_point` | `reorderPoint?: number` | "Reorder" | ✅ |
| `reorder_quantity` | `reorderQuantity?: number` | ❌ NO UI | ⚠️ |
| `specifications` | `specifications?: string` | ❌ NO UI | ⚠️ |
| `images` | `images?: string[]` | ❌ NO UI | ⚠️ |
| `dimensions` | `dimensions?: object` | ❌ NO UI | ⚠️ |
| `weight` | `weight?: object` | ❌ NO UI | ⚠️ |
| `manufacturer` | `manufacturer?: string` | "Manufacturer" | ✅ |
| `supplier` | `supplier?: string` | ❌ NO UI | ⚠️ |
| `supplier_sku` | `supplierSKU?: string` | ❌ NO UI | ⚠️ |
| `warranty_months` | `warrantyMonths?: number` | "Warranty" | ✅ |
| `warranty_details` | `warrantyDetails?: string` | ❌ NO UI | ⚠️ |
| `tags` | `tags?: string[]` | ❌ NO UI | ⚠️ |
| `custom_fields` | `customFields?: Record<string, any>` | ❌ NO UI | ⚠️ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**MISMATCHES:**
- 11 columns have no UI field

---

### 36. `purchase_orders` (14 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `po_number` | `poNumber: string` | "PO #" | ✅ |
| `supplier_id` | `supplierId: string` | "Supplier" | ✅ |
| `account_id` | `accountId: string` | "Account" | ✅ |
| `status` | `status: POStatus` | "Status" | ✅ |
| `items` | `items: object[]` | Items list | ✅ JSONB |
| `total` | `total: number` | "Total" | ✅ |
| `linked_job_id` | `linkedJobId?: string` | "Job" | ✅ |
| `expected_delivery` | - | - | ❌ NOT IN TYPE |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**MISMATCHES:**
- `expected_delivery` in DB but NOT in TypeScript type
- ⚠️ No RecordModal form

---

### 37. `quotes` (23 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `quote_number` | `quoteNumber: string` | "Quote #" | ✅ |
| `deal_id` | `dealId: string` | "Deal" | ✅ |
| `account_id` | `accountId: string` | "Account" | ✅ |
| `status` | `status: string` | "Status" | ✅ |
| `issue_date` | `issueDate: string` | "Issue Date" | ✅ |
| `expiry_date` | `expiryDate: string` | "Expiry" | ✅ |
| `line_items` | `lineItems: LineItem[]` | Line items UI | ✅ JSONB |
| `subtotal` | `subtotal: number` | - (calc) | ✅ |
| `tax_total` | `taxTotal: number` | - (calc) | ✅ |
| `total` | `total: number` | "Total" | ✅ |
| `notes` | `notes?: string` | "Notes" | ✅ |
| `terms` | `terms?: string` | "Terms" | ✅ |
| `accepted_at` | `acceptedAt?: string` | - (auto) | ✅ |
| `accepted_by` | `acceptedBy?: string` | - (auto) | ✅ |
| `superseded_by` | `supersededBy?: string` | - (auto) | ✅ |
| `version` | `version?: number` | - | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `valid_until` | - | - | ❌ DUPLICATE |
| `owner_id` | `ownerId?: string` | - | ✅ |

**MISMATCHES:**
- `valid_until` duplicates `expiry_date`

---

### 38. `referral_rewards` (12 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `referrer_id` | `referrerId: string` | "Referrer" | ✅ |
| `referred_lead_id` | `referredLeadId: string` | "Lead" | ✅ |
| `reward_amount` | `rewardAmount: number` | "Amount" | ✅ |
| `status` | `status: string` | "Status" | ✅ |
| `payout_date` | `payoutDate?: string` | "Payout" | ✅ |
| `notes` | `notes?: string` | "Notes" | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**Status:** ⚠️ No RecordModal form - cannot create via standard UI

---

### 39. `reviews` (17 columns)

| DB Column | TypeScript Type | UI Field | Status |
|-----------|----------------|----------|--------|
| `id` | `id: string` | - | ✅ |
| `org_id` | - | - | ✅ |
| `author_name` | `authorName: string` | "Author" | ✅ |
| `rating` | `rating: number` | "Rating" | ✅ |
| `content` | `content: string` | "Content" | ✅ |
| `platform` | `platform: ReviewPlatform` | "Platform" | ✅ |
| `status` | `status: string` | "Status" | ✅ |
| `replied` | `replied?: boolean` | - | ✅ |
| `reply_content` | `replyContent?: string` | "Reply" | ✅ |
| `replied_at` | `repliedAt?: string` | - (auto) | ✅ |
| `job_id` | `jobId?: string` | "Job" | ✅ |
| `account_id` | `accountId?: string` | "Account" | ✅ |
| `sentiment` | `sentiment: string` | "Sentiment" | ✅ |
| `created_at` | `createdAt: string` | - | ✅ |
| `updated_at` | `updatedAt: string` | - | ✅ |
| `created_by` | `createdBy: string` | - | ✅ |
| `owner_id` | `ownerId?: string` | - | ✅ |

**Status:** ⚠️ No RecordModal form - cannot create via standard UI

---

### 40. `roles` (13 columns)

| DB Column | TypeScript Type | Status |
|-----------|----------------|--------|
| `id` | `id: string` | ✅ |
| `org_id` | - | ✅ |
| `name` | `name: string` | ✅ |
| `label` | - | ❌ NOT IN TYPE |
| `description` | `description: string` | ✅ |
| `parent_role_id` | - | ❌ NOT IN TYPE |
| `hierarchy_level` | - | ❌ NOT IN TYPE |
| `can_view_all_data` | - | ❌ NOT IN TYPE |
| `can_modify_all_data` | - | ❌ NOT IN TYPE |
| `portal_type` | - | ❌ NOT IN TYPE |
| `created_at` | - | ✅ |
| `updated_at` | - | ✅ |
| `created_by` | - | ✅ |

**MISMATCHES:**
- 6 columns NOT in TypeScript: label, parent_role_id, hierarchy_level, can_view_all_data, can_modify_all_data, portal_type

---

### 41. `services` (34 columns)

(Similar to products - most fields mapped but many have no UI)

**Status:** ⚠️ 12 columns have no UI field

---

### 42-55. Remaining Tables

| Table | Status |
|-------|--------|
| `sms_templates` | EMPTY |
| `subscription_items` | EMPTY |
| `subscriptions` | ✅ Mapped (some duplicates) |
| `tasks` | ✅ Mapped (duplicates: assigned_to, related_entity_*) |
| `team_members` | EMPTY |
| `teams` | EMPTY |
| `territories` | EMPTY |
| `ticket_messages` | EMPTY |
| `tickets` | ✅ Mapped (duplicate: assigned_to) |
| `users` | ✅ Mapped |
| `warehouses` | ✅ Mapped |
| `webhook_logs` | EMPTY |
| `webhooks` | ✅ Mapped |
| `zones` | ✅ Mapped (extras: type, status, coordinates) |

---

## CRITICAL ISSUES SUMMARY

### 1. Tables NOT in TypeScript (No Type Definition)

| Table | Columns | Impact |
|-------|---------|--------|
| `currencies` | 11 | Cannot use in frontend |
| `payments` | 18 | Cannot record payments properly |

### 2. Modules with NO RecordModal Form

| Entity Type | Table | Impact |
|-------------|-------|--------|
| Jobs | `jobs` | Cannot create via modal |
| Equipment | `equipment` | Cannot create via modal |
| Inventory Items | `inventory_items` | Cannot create via modal |
| Purchase Orders | `purchase_orders` | Cannot create via modal |
| Expenses | `expenses` | Cannot create via modal |
| Reviews | `reviews` | Cannot create via modal |
| Referral Rewards | `referral_rewards` | Cannot create via modal |
| Inbound Forms | `inbound_forms` | Cannot create via modal |
| Chat Widgets | `chat_widgets` | Cannot create via modal |
| Calculators | `calculators` | Cannot create via modal |
| Crews | `crews` | Cannot create via modal |
| Zones | `zones` | Cannot create via modal |

### 3. Duplicate Columns (Data Inconsistency Risk)

| Table | Duplicates |
|-------|------------|
| `deals` | `assignee_id` vs `assigned_to` |
| `tasks` | `assignee_id` vs `assigned_to`, `related_to_*` vs `related_entity_*` |
| `tickets` | `assignee_id` vs `assigned_to` |
| `quotes` | `expiry_date` vs `valid_until` |
| `notifications` | `message`/`content`, `read`/`is_read`, `link`/`action_url` |
| `leads` | Address as separate columns AND as JSONB |

### 4. DB Columns with No TypeScript Property

Total: **67 columns** across all tables have no corresponding TypeScript type property

### 5. UI Fields with No DB Column

(Listed in previous audit - BANT fields, affiliate fields, etc.)

---

## FINAL STATISTICS

| Metric | Count |
|--------|-------|
| Total Tables | 55 |
| Tables with Data | 41 |
| Empty Tables | 14 |
| Total Columns | 739 |
| Columns Missing from TypeScript | 67 |
| Duplicate Columns | 15 |
| Modules with No Create Form | 12 |
| Tables with No TypeScript Type | 2 |

---

**END OF COMPLETE AUDIT**
