# UI TYPES SCHEMA - COMPLETE AUDIT
Generated: 2026-02-08T18:16:22.321Z
Source: src/types.ts

## Summary
Total Interfaces: 67
Total Type Aliases: 10

## Table of Contents

### Core Entities
- [User](#1-user)
- [Account](#2-account)
- [Contact](#3-contact)
- [Lead](#4-lead)
- [Deal](#5-deal)

### Sales & Revenue
- [Campaign](#6-campaign)
- [Quote](#7-quote)
- [Invoice](#8-invoice)
- [Subscription](#9-subscription)

### Service & Operations
- [Task](#10-task)
- [Ticket](#11-ticket)
- [Job](#12-job)
- [Crew](#13-crew)
- [Zone](#14-zone)
- [Equipment](#15-equipment)

### Products & Inventory
- [Product](#16-product)
- [Service](#17-service)
- [InventoryItem](#18-inventoryitem)
- [PurchaseOrder](#19-purchaseorder)
- [Warehouse](#20-warehouse)

### Financial
- [BankTransaction](#21-banktransaction)
- [Expense](#22-expense)

### Communication & Docs
- [Communication](#23-communication)
- [CalendarEvent](#24-calendarevent)
- [Document](#25-document)
- [Review](#26-review)

### Marketing & Inbound
- [ReferralReward](#27-referralreward)
- [InboundForm](#28-inboundform)
- [ChatWidget](#29-chatwidget)
- [Calculator](#30-calculator)

### System & Automation
- [AutomationWorkflow](#31-automationworkflow)
- [Webhook](#32-webhook)
- [IndustryTemplate](#33-industrytemplate)
- [AuditLog](#34-auditlog)
- [Notification](#35-notification)

### Other Interfaces
- Address
- CustomFieldDefinition
- CRMBase
- TicketMessage
- ChatMessage
- Conversation
- JobField
- BOMItem
- FormField
- WorkflowTrigger
- WorkflowNode
- CustomFieldDef
- LayoutSection
- LineItem
- InvoiceCredit
- Role
- PermissionMatrix
- Team
- CrewConfig
- FieldSecurityRule
- Pipeline
- LeadScoringRule
- TaxRate
- LedgerMapping
- JobTemplate
- ZoneConfig
- CRMSettings
- ValidationRule
- IndustryBlueprint
- CustomEntityDefinition
- ... and 2 more

---

# Core Entities

## 1. User
Extends: `CRMBase`
Fields: 6

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | email | `string` | ● |
| 3 | role | `OperationalDomain` | ● |
| 4 | avatar | `string` | ● |
| 5 | managerId | `string` | ○ |
| 6 | team | `string` | ○ |

## 2. Account
Extends: `CRMBase`
Fields: 13

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | industry | `string` | ● |
| 3 | website | `string` | ● |
| 4 | employeeCount | `number` | ● |
| 5 | avatar | `string` | ● |
| 6 | tier | `string` | ● |
| 7 | email | `string` | ○ |
| 8 | city | `string` | ○ |
| 9 | state | `string` | ○ |
| 10 | logo | `string` | ○ |
| 11 | address | `Address` | ○ |
| 12 | commissionRate | `number` | ○ |
| 13 | customData | `Record<string, any>` | ○ |

## 3. Contact
Extends: `CRMBase`
Fields: 9

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | accountId | `string` | ● |
| 3 | email | `string` | ● |
| 4 | phone | `string` | ● |
| 5 | title | `string` | ● |
| 6 | avatar | `string` | ● |
| 7 | company | `string` | ○ |
| 8 | address | `Address` | ○ |
| 9 | customData | `Record<string, any>` | ○ |

## 4. Lead
Extends: `CRMBase`
Fields: 18

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | company | `string` | ● |
| 3 | email | `string` | ● |
| 4 | phone | `string` | ● |
| 5 | status | `string` | ● |
| 6 | source | `string` | ● |
| 7 | campaignId | `string` | ○ |
| 8 | estimatedValue | `number` | ● |
| 9 | avatar | `string` | ● |
| 10 | score | `number` | ● |
| 11 | address | `Address` | ○ |
| 12 | lastContactDate | `string` | ○ |
| 13 | notes | `string` | ○ |
| 14 | commissionRate | `number` | ○ |
| 15 | convertedToDealId | `string` | ○ |
| 16 | convertedAt | `string` | ○ |
| 17 | convertedBy | `string` | ○ |
| 18 | customData | `Record<string, any>` | ○ |

## 5. Deal
Extends: `CRMBase`
Fields: 18

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | accountId | `string` | ● |
| 3 | contactId | `string` | ● |
| 4 | amount | `number` | ● |
| 5 | stage | `string` | ● |
| 6 | probability | `number` | ● |
| 7 | expectedCloseDate | `string` | ● |
| 8 | assigneeId | `string` | ● |
| 9 | avatar | `string` | ● |
| 10 | stageEntryDate | `string` | ○ |
| 11 | campaignId | `string` | ○ |
| 12 | commissionRate | `number` | ○ |
| 13 | commissionAmount | `number` | ○ |
| 14 | leadId | `string` | ○ |
| 15 | wonAt | `string` | ○ |
| 16 | createdAccountId | `string` | ○ |
| 17 | createdContactId | `string` | ○ |
| 18 | customData | `Record<string, any>` | ○ |

# Sales & Revenue

## 6. Campaign
Extends: `CRMBase`
Fields: 14

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | type | `'Email' | 'Social' | 'Search' | 'Event' | 'Referral'` | ● |
| 3 | budget | `number` | ● |
| 4 | spent | `number` | ○ |
| 5 | revenue | `number` | ○ |
| 6 | revenueGenerated | `number` | ● |
| 7 | leadsGenerated | `number` | ○ |
| 8 | status | `'Planning' | 'Active' | 'Paused' | 'Completed' | 'Cancelled'` | ● |
| 9 | startDate | `string` | ○ |
| 10 | endDate | `string` | ○ |
| 11 | description | `string` | ○ |
| 12 | expectedCPL | `number` | ○ |
| 13 | targetAudience | `string` | ○ |
| 14 | templateId | `string` | ○ |

## 7. Quote
Extends: `CRMBase`
Fields: 16

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | quoteNumber | `string` | ● |
| 2 | dealId | `string` | ● |
| 3 | accountId | `string` | ● |
| 4 | status | `'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired' | ...` | ● |
| 5 | issueDate | `string` | ● |
| 6 | expiryDate | `string` | ● |
| 7 | lineItems | `LineItem[]` | ● |
| 8 | subtotal | `number` | ● |
| 9 | taxTotal | `number` | ● |
| 10 | total | `number` | ● |
| 11 | notes | `string` | ○ |
| 12 | terms | `string` | ○ |
| 13 | acceptedAt | `string` | ○ |
| 14 | acceptedBy | `string` | ○ |
| 15 | supersededBy | `string` | ○ |
| 16 | version | `number` | ○ |

## 8. Invoice
Extends: `CRMBase`
Fields: 18

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | invoiceNumber | `string` | ● |
| 2 | accountId | `string` | ● |
| 3 | dealId | `string` | ○ |
| 4 | quoteId | `string` | ○ |
| 5 | status | `'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'` | ● |
| 6 | paymentStatus | `'unpaid' | 'paid' | 'partially_paid' | 'failed'` | ● |
| 7 | issueDate | `string` | ● |
| 8 | invoiceDate | `string` | ● |
| 9 | dueDate | `string` | ● |
| 10 | sentAt | `string` | ○ |
| 11 | paidAt | `string` | ○ |
| 12 | lineItems | `LineItem[]` | ● |
| 13 | subtotal | `number` | ● |
| 14 | taxTotal | `number` | ● |
| 15 | total | `number` | ● |
| 16 | notes | `string` | ○ |
| 17 | terms | `string` | ○ |
| 18 | credits | `InvoiceCredit[]` | ○ |

## 9. Subscription
Extends: `CRMBase`
Fields: 10

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | accountId | `string` | ● |
| 2 | name | `string` | ● |
| 3 | status | `'Active' | 'Paused' | 'Cancelled'` | ● |
| 4 | billingCycle | `'one-off' | 'monthly' | 'quarterly' | 'yearly' | 'custom'` | ● |
| 5 | nextBillDate | `string` | ● |
| 6 | startDate | `string` | ● |
| 7 | endDate | `string` | ○ |
| 8 | items | `Omit<LineItem, 'lineTotal'>[]` | ● |
| 9 | autoGenerateInvoice | `boolean` | ● |
| 10 | lastInvoiceId | `string` | ○ |

# Service & Operations

## 10. Task
Extends: `CRMBase`
Fields: 8

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | title | `string` | ● |
| 2 | description | `string` | ● |
| 3 | assigneeId | `string` | ● |
| 4 | dueDate | `string` | ● |
| 5 | status | `string` | ● |
| 6 | priority | `string` | ● |
| 7 | relatedToId | `string` | ● |
| 8 | relatedToType | `EntityType` | ● |

## 11. Ticket
Extends: `CRMBase`
Fields: 14

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | ticketNumber | `string` | ● |
| 2 | subject | `string` | ● |
| 3 | description | `string` | ● |
| 4 | requesterId | `string` | ● |
| 5 | accountId | `string` | ○ |
| 6 | assigneeId | `string` | ● |
| 7 | status | `string` | ● |
| 8 | priority | `string` | ● |
| 9 | slaDeadline | `string` | ● |
| 10 | messages | `TicketMessage[]` | ● |
| 11 | internalNotes | `TicketMessage[]` | ○ |
| 12 | customData | `Record<string, any>` | ○ |
| 13 | relatedToId | `string` | ○ |
| 14 | relatedToType | `EntityType` | ○ |

## 12. Job
Extends: `CRMBase`
Fields: 23

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | jobNumber | `string` | ● |
| 2 | name | `string` | ○ |
| 3 | subject | `string` | ● |
| 4 | description | `string` | ● |
| 5 | accountId | `string` | ● |
| 6 | assigneeId | `string` | ○ |
| 7 | crewId | `string` | ○ |
| 8 | jobType | `JobType` | ● |
| 9 | status | `JobStatus` | ● |
| 10 | priority | `string` | ● |
| 11 | zone | `string` | ○ |
| 12 | estimatedDuration | `number` | ○ |
| 13 | scheduledDate | `string` | ○ |
| 14 | scheduledEndDate | `string` | ○ |
| 15 | completedAt | `string` | ○ |
| 16 | lat | `number` | ○ |
| 17 | lng | `number` | ○ |
| 18 | jobFields | `JobField[]` | ○ |
| 19 | swmsSigned | `boolean` | ○ |
| 20 | completionSignature | `string` | ○ |
| 21 | evidencePhotos | `string[]` | ○ |
| 22 | bom | `BOMItem[]` | ○ |
| 23 | invoiceId | `string` | ○ |

## 13. Crew
Extends: `CRMBase`
Fields: 4

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | leaderId | `string` | ● |
| 3 | memberIds | `string[]` | ● |
| 4 | color | `string` | ● |

## 14. Zone
Extends: `CRMBase`
Fields: 4

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | region | `string` | ● |
| 3 | description | `string` | ○ |
| 4 | color | `string` | ○ |

## 15. Equipment
Extends: `CRMBase`
Fields: 10

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | type | `string` | ● |
| 3 | barcode | `string` | ● |
| 4 | condition | `'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged'` | ● |
| 5 | location | `string` | ● |
| 6 | assignedTo | `string` | ○ |
| 7 | lastServiceDate | `string` | ○ |
| 8 | nextServiceDate | `string` | ○ |
| 9 | purchaseDate | `string` | ○ |
| 10 | purchasePrice | `number` | ○ |

# Products & Inventory

## 16. Product
Extends: `CRMBase`
Fields: 24

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | sku | `string` | ○ |
| 3 | code | `string` | ○ |
| 4 | description | `string` | ● |
| 5 | category | `string` | ○ |
| 6 | type | `string` | ○ |
| 7 | unitPrice | `number` | ● |
| 8 | costPrice | `number` | ○ |
| 9 | taxRate | `number` | ● |
| 10 | isActive | `boolean` | ● |
| 11 | stockLevel | `number` | ○ |
| 12 | reorderPoint | `number` | ○ |
| 13 | reorderQuantity | `number` | ○ |
| 14 | specifications | `string` | ○ |
| 15 | images | `string[]` | ○ |
| 16 | dimensions | `{ length?: number; width?: number; height?: number; unit?...` | ○ |
| 17 | weight | `{ value?: number; unit?: string }` | ○ |
| 18 | manufacturer | `string` | ○ |
| 19 | supplier | `string` | ○ |
| 20 | supplierSKU | `string` | ○ |
| 21 | warrantyMonths | `number` | ○ |
| 22 | warrantyDetails | `string` | ○ |
| 23 | tags | `string[]` | ○ |
| 24 | customFields | `Record<string, any>` | ○ |

## 17. Service
Extends: `CRMBase`
Fields: 24

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | code | `string` | ○ |
| 3 | sku | `string` | ○ |
| 4 | description | `string` | ● |
| 5 | category | `string` | ○ |
| 6 | type | `string` | ○ |
| 7 | billingCycle | `'one-off' | 'monthly' | 'quarterly' | 'yearly'` | ● |
| 8 | unitPrice | `number` | ● |
| 9 | costPrice | `number` | ○ |
| 10 | taxRate | `number` | ● |
| 11 | isActive | `boolean` | ● |
| 12 | durationHours | `number` | ○ |
| 13 | durationMinutes | `number` | ○ |
| 14 | prerequisites | `string` | ○ |
| 15 | deliverables | `string` | ○ |
| 16 | skillsRequired | `string[]` | ○ |
| 17 | crewSize | `number` | ○ |
| 18 | equipmentNeeded | `string[]` | ○ |
| 19 | slaResponseHours | `number` | ○ |
| 20 | slaCompletionDays | `number` | ○ |
| 21 | qualityChecklist | `string[]` | ○ |
| 22 | images | `string[]` | ○ |
| 23 | tags | `string[]` | ○ |
| 24 | customFields | `Record<string, any>` | ○ |

## 18. InventoryItem
Extends: `CRMBase`
Fields: 6

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | sku | `string` | ● |
| 3 | warehouseQty | `number` | ● |
| 4 | reorderPoint | `number` | ● |
| 5 | category | `'Asset' | 'Material'` | ● |
| 6 | unitPrice | `number` | ● |

## 19. PurchaseOrder
Extends: `CRMBase`
Fields: 7

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | poNumber | `string` | ● |
| 2 | supplierId | `string` | ● |
| 3 | accountId | `string` | ● |
| 4 | status | `POStatus` | ● |
| 5 | items | `{ sku: string; name: string; qty: number; price: number }[]` | ● |
| 6 | total | `number` | ● |
| 7 | linkedJobId | `string` | ○ |

## 20. Warehouse
Fields: 4

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | name | `string` | ● |
| 3 | address | `string` | ● |
| 4 | isDefault | `boolean` | ● |

# Financial

## 21. BankTransaction
Extends: `CRMBase`
Fields: 13

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | date | `string` | ● |
| 2 | description | `string` | ● |
| 3 | amount | `number` | ● |
| 4 | type | `'Credit' | 'Debit'` | ● |
| 5 | status | `'unmatched' | 'matched' | 'ignored'` | ● |
| 6 | matchConfidence | `'none' | 'amber' | 'green'` | ● |
| 7 | matchedToId | `string` | ○ |
| 8 | matchedToType | `'invoices' | 'expenses' | 'other'` | ○ |
| 9 | reconciled | `boolean` | ● |
| 10 | reconciledAt | `string` | ○ |
| 11 | reconciledBy | `string` | ○ |
| 12 | bankReference | `string` | ○ |
| 13 | notes | `string` | ○ |

## 22. Expense
Extends: `CRMBase`
Fields: 7

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | vendor | `string` | ● |
| 2 | amount | `number` | ● |
| 3 | category | `'Materials' | 'Fuel' | 'Subbies' | 'Rent' | 'Other'` | ● |
| 4 | date | `string` | ● |
| 5 | status | `'Paid' | 'Pending'` | ● |
| 6 | receiptUrl | `string` | ○ |
| 7 | approvedBy | `string` | ○ |

# Communication & Docs

## 23. Communication
Extends: `CRMBase`
Fields: 10

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | type | `'Email' | 'Call' | 'SMS' | 'Note'` | ● |
| 2 | subject | `string` | ● |
| 3 | content | `string` | ● |
| 4 | direction | `'Inbound' | 'Outbound'` | ● |
| 5 | relatedToType | `EntityType` | ● |
| 6 | relatedToId | `string` | ● |
| 7 | outcome | `CommunicationOutcome` | ● |
| 8 | nextStep | `string` | ○ |
| 9 | nextFollowUpDate | `string` | ○ |
| 10 | metadata | `Record<string, any>` | ○ |

## 24. CalendarEvent
Extends: `CRMBase`
Fields: 10

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | title | `string` | ● |
| 2 | description | `string` | ● |
| 3 | startTime | `string` | ● |
| 4 | endTime | `string` | ● |
| 5 | type | `'Meeting' | 'Call' | 'Internal' | 'Deadline' | 'Personal'...` | ● |
| 6 | location | `string` | ○ |
| 7 | relatedToType | `EntityType` | ○ |
| 8 | relatedToId | `string` | ○ |
| 9 | priority | `'high' | 'medium' | 'low'` | ○ |
| 10 | isAllDay | `boolean` | ○ |

## 25. Document
Extends: `CRMBase`
Fields: 6

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | title | `string` | ● |
| 2 | fileType | `string` | ● |
| 3 | fileSize | `string` | ● |
| 4 | url | `string` | ● |
| 5 | relatedToType | `EntityType` | ● |
| 6 | relatedToId | `string` | ● |

## 26. Review
Extends: `CRMBase`
Fields: 11

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | authorName | `string` | ● |
| 2 | rating | `number` | ● |
| 3 | content | `string` | ● |
| 4 | platform | `ReviewPlatform` | ● |
| 5 | status | `'New' | 'Replied' | 'Escalated' | 'Ignored'` | ● |
| 6 | replied | `boolean` | ○ |
| 7 | replyContent | `string` | ○ |
| 8 | repliedAt | `string` | ○ |
| 9 | jobId | `string` | ○ |
| 10 | accountId | `string` | ○ |
| 11 | sentiment | `'Positive' | 'Neutral' | 'Negative'` | ● |

# Marketing & Inbound

## 27. ReferralReward
Extends: `CRMBase`
Fields: 6

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | referrerId | `string` | ● |
| 2 | referredLeadId | `string` | ● |
| 3 | rewardAmount | `number` | ● |
| 4 | status | `'Active' | 'Pending Payout' | 'Paid' | 'Cancelled'` | ● |
| 5 | payoutDate | `string` | ○ |
| 6 | notes | `string` | ○ |

## 28. InboundForm
Extends: `CRMBase`
Fields: 10

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | type | `'Contact' | 'Lead' | 'Quote Request' | 'Support'` | ○ |
| 3 | fields | `FormField[]` | ● |
| 4 | submitButtonText | `string` | ● |
| 5 | successMessage | `string` | ● |
| 6 | targetCampaignId | `string` | ○ |
| 7 | submissionCount | `number` | ● |
| 8 | conversionRate | `number` | ○ |
| 9 | status | `'Active' | 'Inactive' | 'Draft'` | ○ |
| 10 | embedCode | `string` | ○ |

## 29. ChatWidget
Extends: `CRMBase`
Fields: 9

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | page | `string` | ○ |
| 3 | bubbleColor | `string` | ● |
| 4 | welcomeMessage | `string` | ● |
| 5 | isActive | `boolean` | ● |
| 6 | status | `'Active' | 'Inactive'` | ○ |
| 7 | routingUserId | `string` | ● |
| 8 | conversations | `number` | ○ |
| 9 | avgResponseTime | `number` | ○ |

## 30. Calculator
Extends: `CRMBase`
Fields: 7

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | type | `CalculatorType` | ● |
| 3 | baseRate | `number` | ○ |
| 4 | isActive | `boolean` | ● |
| 5 | status | `'Active' | 'Inactive'` | ○ |
| 6 | usageCount | `number` | ○ |
| 7 | leadConversionRate | `number` | ○ |

# System & Automation

## 31. AutomationWorkflow
Extends: `CRMBase`
Fields: 8

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | description | `string` | ● |
| 3 | trigger | `WorkflowTrigger` | ● |
| 4 | nodes | `WorkflowNode[]` | ● |
| 5 | isActive | `boolean` | ● |
| 6 | executionCount | `number` | ● |
| 7 | lastRunAt | `string` | ○ |
| 8 | category | `'Sales' | 'Operations' | 'Logistics' | 'System'` | ● |

## 32. Webhook
Extends: `CRMBase`
Fields: 9

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | url | `string` | ● |
| 3 | method | `'GET' | 'POST' | 'PUT' | 'DELETE'` | ● |
| 4 | headers | `Record<string, string>` | ○ |
| 5 | isActive | `boolean` | ● |
| 6 | triggerEvent | `string` | ● |
| 7 | lastTriggeredAt | `string` | ○ |
| 8 | successCount | `number` | ● |
| 9 | failureCount | `number` | ● |

## 33. IndustryTemplate
Extends: `CRMBase`
Fields: 6

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | name | `string` | ● |
| 2 | targetEntity | `EntityType` | ● |
| 3 | industry | `string` | ● |
| 4 | sections | `LayoutSection[]` | ● |
| 5 | isActive | `boolean` | ● |
| 6 | version | `number` | ● |

## 34. AuditLog
Extends: `CRMBase`
Fields: 7

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | entityType | `EntityType` | ● |
| 2 | entityId | `string` | ● |
| 3 | action | `string` | ● |
| 4 | previousValue | `string` | ○ |
| 5 | newValue | `string` | ○ |
| 6 | metadata | `Record<string, any>` | ○ |
| 7 | batchId | `string` | ○ |

## 35. Notification
Extends: `CRMBase`
Fields: 5

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | title | `string` | ● |
| 2 | message | `string` | ● |
| 3 | type | `'info' | 'warning' | 'success' | 'urgent'` | ● |
| 4 | read | `boolean` | ● |
| 5 | link | `string` | ○ |

# Other Interfaces

## 36. Address
Fields: 5

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | street | `string` | ● |
| 2 | suburb | `string` | ● |
| 3 | state | `string` | ● |
| 4 | postcode | `string` | ● |
| 5 | country | `string` | ● |

## 37. CustomFieldDefinition
Fields: 5

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | label | `string` | ● |
| 3 | type | `'text' | 'number' | 'select' | 'date' | 'checkbox'` | ● |
| 4 | options | `string[]` | ○ |
| 5 | required | `boolean` | ● |

## 38. CRMBase
Fields: 5

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | createdAt | `string` | ● |
| 3 | updatedAt | `string` | ● |
| 4 | createdBy | `string` | ● |
| 5 | ownerId | `string` | ○ |

## 39. TicketMessage
Fields: 6

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | sender | `string` | ● |
| 2 | senderId | `string` | ● |
| 3 | text | `string` | ● |
| 4 | time | `string` | ● |
| 5 | isMe | `boolean` | ○ |
| 6 | isBot | `boolean` | ○ |

## 40. ChatMessage
Extends: `CRMBase`
Fields: 3

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | conversationId | `string` | ● |
| 2 | senderId | `string` | ● |
| 3 | content | `string` | ● |

## 41. Conversation
Extends: `CRMBase`
Fields: 3

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | participantIds | `string[]` | ● |
| 2 | name | `string` | ○ |
| 3 | isSystem | `boolean` | ○ |

## 42. JobField
Fields: 6

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | label | `string` | ● |
| 3 | type | `CustomFieldType` | ● |
| 4 | options | `string[]` | ○ |
| 5 | value | `any` | ○ |
| 6 | required | `boolean` | ● |

## 43. BOMItem
Fields: 4

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | inventoryItemId | `string` | ● |
| 2 | qtyRequired | `number` | ● |
| 3 | qtyPicked | `number` | ● |
| 4 | serialNumbers | `string[]` | ○ |

## 44. FormField
Fields: 7

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | label | `string` | ● |
| 3 | type | `'text' | 'email' | 'phone' | 'select' | 'file'` | ● |
| 4 | placeholder | `string` | ○ |
| 5 | required | `boolean` | ● |
| 6 | options | `string[]` | ○ |
| 7 | logic | `{ showIfField: string; showIfValue: string }` | ○ |

## 45. WorkflowTrigger
Fields: 3

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | type | `WorkflowTriggerType` | ● |
| 2 | entity | `EntityType` | ● |
| 3 | config | `Record<string, any>` | ● |

## 46. WorkflowNode
Fields: 6

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | type | `WorkflowNodeType` | ● |
| 3 | actionType | `WorkflowActionType` | ○ |
| 4 | config | `Record<string, any>` | ● |
| 5 | nextId | `string` | ○ |
| 6 | failId | `string` | ○ |

## 47. CustomFieldDef
Fields: 8

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | label | `string` | ● |
| 3 | type | `CustomFieldType` | ● |
| 4 | placeholder | `string` | ○ |
| 5 | required | `boolean` | ● |
| 6 | options | `string[]` | ○ |
| 7 | defaultValue | `any` | ○ |
| 8 | helpText | `string` | ○ |

## 48. LayoutSection
Fields: 3

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | title | `string` | ● |
| 3 | fields | `CustomFieldDef[]` | ● |

## 49. LineItem
Fields: 7

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | itemType | `'product' | 'service'` | ● |
| 2 | itemId | `string` | ● |
| 3 | description | `string` | ● |
| 4 | qty | `number` | ● |
| 5 | unitPrice | `number` | ● |
| 6 | taxRate | `number` | ● |
| 7 | lineTotal | `number` | ● |

## 50. InvoiceCredit
Fields: 3

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | amount | `number` | ● |
| 2 | reason | `string` | ● |
| 3 | appliedAt | `string` | ● |

## 51. Role
Fields: 5

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | name | `string` | ● |
| 3 | description | `string` | ● |
| 4 | isSystem | `boolean` | ● |
| 5 | color | `string` | ● |

## 52. PermissionMatrix
Fields: 7

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | viewGlobal | `boolean` | ● |
| 2 | viewTeam | `boolean` | ● |
| 3 | viewOwn | `boolean` | ● |
| 4 | create | `boolean` | ● |
| 5 | edit | `boolean` | ● |
| 6 | delete | `boolean` | ● |
| 7 | export | `boolean` | ● |

## 53. Team
Fields: 5

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | name | `string` | ● |
| 3 | managerId | `string` | ● |
| 4 | memberIds | `string[]` | ● |
| 5 | description | `string` | ● |

## 54. CrewConfig
Fields: 5

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | name | `string` | ● |
| 3 | memberIds | `string[]` | ● |
| 4 | zoneId | `string` | ○ |
| 5 | skills | `string[]` | ● |

## 55. FieldSecurityRule
Fields: 4

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | entityType | `EntityType` | ● |
| 3 | fieldName | `string` | ● |
| 4 | hiddenFromRoles | `string[]` | ● |

## 56. Pipeline
Fields: 5

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | name | `string` | ● |
| 3 | entityType | `'leads' | 'deals' | 'tickets' | 'jobs'` | ● |
| 4 | stages | `{ label: string; probability?: number; color: string; ord...` | ● |
| 5 | isDefault | `boolean` | ● |

## 57. LeadScoringRule
Fields: 4

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | trigger | `string` | ● |
| 3 | points | `number` | ● |
| 4 | description | `string` | ● |

## 58. TaxRate
Fields: 5

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | name | `string` | ● |
| 3 | rate | `number` | ● |
| 4 | isDefault | `boolean` | ● |
| 5 | region | `string` | ○ |

## 59. LedgerMapping
Fields: 4

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | eventType | `string` | ● |
| 3 | glCode | `string` | ● |
| 4 | description | `string` | ● |

## 60. JobTemplate
Fields: 7

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | name | `string` | ● |
| 3 | description | `string` | ● |
| 4 | estimatedDuration | `number` | ● |
| 5 | requiredSkills | `string[]` | ● |
| 6 | customFields | `CustomFieldDefinition[]` | ● |
| 7 | checklistItems | `string[]` | ● |

## 61. ZoneConfig
Fields: 5

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | name | `string` | ● |
| 3 | color | `string` | ● |
| 4 | polygon | `{ lat: number; lng: number }[]` | ○ |
| 5 | assignedCrewIds | `string[]` | ● |

## 62. CRMSettings
Fields: 189

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | organization | `{` | ● |
| 2 | legalName | `string` | ● |
| 3 | tradingName | `string` | ● |
| 4 | taxId | `string` | ● |
| 5 | supportEmail | `string` | ● |
| 6 | billingEmail | `string` | ● |
| 7 | emergencyPhone | `string` | ● |
| 8 | industry | `IndustryType` | ● |
| 9 | localization | `{` | ● |
| 10 | timezone | `string` | ● |
| 11 | currency | `string` | ● |
| 12 | currencySymbol | `string` | ● |
| 13 | dateFormat | `'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'` | ● |
| 14 | timeFormat | `'12h' | '24h'` | ● |
| 15 | multiCurrencyEnabled | `boolean` | ● |
| 16 | taxRate | `number` | ● |
| 17 | branding | `{` | ● |
| 18 | name | `string` | ● |
| 19 | slogan | `string` | ● |
| 20 | primaryColor | `string` | ● |
| 21 | sidebarMode | `'dark' | 'light' | 'brand'` | ● |
| 22 | theme | `'light' | 'dark'` | ● |
| 23 | logoLight | `string` | ● |
| 24 | logoDark | `string` | ● |
| 25 | favicon | `string` | ● |
| 26 | pwaIcon | `string` | ● |
| 27 | customDomain | `string` | ● |
| 28 | modules | `{` | ● |
| 29 | salesEngine | `boolean` | ● |
| 30 | financials | `boolean` | ● |
| 31 | fieldLogistics | `boolean` | ● |
| 32 | marketing | `boolean` | ● |
| 33 | bankFeeds | `boolean` | ● |
| 34 | inventory | `boolean` | ● |
| 35 | dispatch | `boolean` | ● |
| 36 | reputation | `boolean` | ● |
| 37 | referrals | `boolean` | ● |
| 38 | inboundForms | `boolean` | ● |
| 39 | chatWidgets | `boolean` | ● |
| 40 | subscriptions | `boolean` | ● |
| 41 | purchaseOrders | `boolean` | ● |
| 42 | roles | `Role[]` | ● |
| 43 | permissions | `PermissionMatrix` | ● |
| 44 | teams | `Team[]` | ● |
| 45 | crews | `CrewConfig[]` | ● |
| 46 | fieldLevelSecurity | `FieldSecurityRule[]` | ● |
| 47 | integrations | `{` | ● |
| 48 | stripe | `{` | ● |
| 49 | enabled | `boolean` | ● |
| 50 | mode | `'test' | 'live'` | ● |
| 51 | publicKey | `string` | ● |
| 52 | secretKey | `string` | ● |
| 53 | webhookSecret | `string` | ○ |
| 54 | webhookEndpoint | `string` | ○ |
| 55 | passSurcharge | `boolean` | ● |
| 56 | paypal | `{` | ● |
| 57 | enabled | `boolean` | ● |
| 58 | mode | `'sandbox' | 'live'` | ● |
| 59 | clientId | `string` | ● |
| 60 | clientSecret | `string` | ● |
| 61 | webhookId | `string` | ○ |
| 62 | xero | `{` | ● |
| 63 | enabled | `boolean` | ● |
| 64 | syncFrequency | `'daily' | 'weekly' | 'manual'` | ● |
| 65 | clientId | `string` | ○ |
| 66 | tenantId | `string` | ○ |
| 67 | twilio | `{` | ● |
| 68 | enabled | `boolean` | ● |
| 69 | accountSid | `string` | ● |
| 70 | authToken | `string` | ● |
| 71 | phoneNumber | `string` | ● |
| 72 | callerId | `string` | ● |
| 73 | statusCallbackUrl | `string` | ○ |
| 74 | sendgrid | `{` | ● |
| 75 | enabled | `boolean` | ● |
| 76 | apiKey | `string` | ● |
| 77 | domain | `string` | ● |
| 78 | fromEmail | `string` | ○ |
| 79 | fromName | `string` | ○ |
| 80 | webhookUrl | `string` | ○ |
| 81 | byoSip | `{` | ● |
| 82 | enabled | `boolean` | ● |
| 83 | provider | `string` | ● |
| 84 | sipServer | `string` | ● |
| 85 | sipPort | `number` | ● |
| 86 | username | `string` | ● |
| 87 | password | `string` | ● |
| 88 | realm | `string` | ○ |
| 89 | outboundProxy | `string` | ○ |
| 90 | callerIdName | `string` | ○ |
| 91 | callerIdNumber | `string` | ○ |
| 92 | transport | `'udp' | 'tcp' | 'tls'` | ○ |
| 93 | registerExpires | `number` | ○ |
| 94 | byoSms | `{` | ● |
| 95 | enabled | `boolean` | ● |
| 96 | provider | `string` | ● |
| 97 | apiEndpoint | `string` | ● |
| 98 | apiKey | `string` | ● |
| 99 | apiSecret | `string` | ○ |
| 100 | fromNumber | `string` | ● |
| 101 | fromName | `string` | ○ |
| 102 | webhookUrl | `string` | ○ |
| 103 | authMethod | `'basic' | 'bearer' | 'header'` | ○ |
| 104 | googleMaps | `{` | ● |
| 105 | enabled | `boolean` | ● |
| 106 | apiKey | `string` | ● |
| 107 | defaultRegion | `string` | ○ |
| 108 | openai | `{` | ● |
| 109 | enabled | `boolean` | ● |
| 110 | apiKey | `string` | ● |
| 111 | organizationId | `string` | ○ |
| 112 | defaultModel | `string` | ○ |
| 113 | maxTokens | `number` | ○ |
| 114 | googleCalendar | `{` | ● |
| 115 | enabled | `boolean` | ● |
| 116 | syncEnabled | `boolean` | ● |
| 117 | clientId | `string` | ○ |
| 118 | calendarId | `string` | ○ |
| 119 | outlook | `{` | ● |
| 120 | enabled | `boolean` | ● |
| 121 | syncEnabled | `boolean` | ● |
| 122 | clientId | `string` | ○ |
| 123 | tenantId | `string` | ○ |
| 124 | automation | `{` | ● |
| 125 | executionMode | `'synchronous' | 'asynchronous' | 'scheduled'` | ● |
| 126 | retryPolicy | `number` | ● |
| 127 | loggingEnabled | `boolean` | ● |
| 128 | errorNotifications | `boolean` | ● |
| 129 | emailFrom | `string` | ● |
| 130 | emailFromName | `string` | ● |
| 131 | trackOpens | `boolean` | ● |
| 132 | pipelines | `Pipeline[]` | ● |
| 133 | leadScoring | `LeadScoringRule[]` | ● |
| 134 | lostReasons | `string[]` | ● |
| 135 | quoteValidityDays | `number` | ● |
| 136 | paymentTerms | `string` | ● |
| 137 | taxEngine | `TaxRate[]` | ● |
| 138 | ledgerMapping | `LedgerMapping[]` | ● |
| 139 | numberingSeries | `{` | ● |
| 140 | invoicePrefix | `string` | ● |
| 141 | invoiceNextNumber | `number` | ● |
| 142 | quotePrefix | `string` | ● |
| 143 | quoteNextNumber | `number` | ● |
| 144 | poPrefix | `string` | ● |
| 145 | poNextNumber | `number` | ● |
| 146 | jobTemplates | `JobTemplate[]` | ● |
| 147 | zones | `ZoneConfig[]` | ● |
| 148 | inventoryRules | `{` | ● |
| 149 | warehouses | `Warehouse[]` | ● |
| 150 | lowStockThreshold | `number` | ● |
| 151 | criticalStockThreshold | `number` | ● |
| 152 | autoReorderEnabled | `boolean` | ● |
| 153 | scheduling | `{` | ● |
| 154 | bookingBuffer | `number` | ● |
| 155 | workingHoursStart | `string` | ● |
| 156 | workingHoursEnd | `string` | ● |
| 157 | maxJobsPerCrewPerDay | `number` | ● |
| 158 | defaultServiceRadius | `number` | ● |
| 159 | reviewPlatforms | `{ name: string; url: string; enabled: boolean }[]` | ● |
| 160 | referralSettings | `{` | ● |
| 161 | referrerReward | `number` | ● |
| 162 | refereeDiscount | `number` | ● |
| 163 | minPurchaseForReward | `number` | ● |
| 164 | senderProfiles | `{ name: string; email: string; isDefault: boolean }[]` | ● |
| 165 | diagnostics | `{` | ● |
| 166 | auditLogRetentionDays | `number` | ● |
| 167 | emailLogRetentionDays | `number` | ● |
| 168 | apiUsageTracking | `boolean` | ● |
| 169 | dataIntegrityChecks | `boolean` | ● |
| 170 | leadStatuses | `string[]` | ● |
| 171 | leadSources | `string[]` | ● |
| 172 | dealStages | `{ label: string; probability: number }[]` | ● |
| 173 | ticketStatuses | `string[]` | ● |
| 174 | ticketPriorities | `string[]` | ● |
| 175 | ticketCategories | `string[]` | ● |
| 176 | taskStatuses | `string[]` | ● |
| 177 | taskPriorities | `string[]` | ● |
| 178 | slaConfig | `Record<string, number>` | ● |
| 179 | defaultAssignments | `Partial<Record<EntityType, string>>` | ● |
| 180 | industries | `string[]` | ● |
| 181 | tiers | `string[]` | ● |
| 182 | accountTypes | `string[]` | ● |
| 183 | dealLossReasons | `string[]` | ● |
| 184 | customFields | `Partial<Record<EntityType, CustomFieldDefinition[]>>` | ● |
| 185 | requiredFields | `Partial<Record<EntityType, string[]>>` | ● |
| 186 | validationRules | `Partial<Record<EntityType, ValidationRule[]>>` | ● |
| 187 | activeIndustry | `IndustryType` | ● |
| 188 | industryBlueprints | `Record<IndustryType, IndustryBlueprint>` | ● |
| 189 | customEntities | `Record<string, any[]>` | ● |

## 63. ValidationRule
Fields: 6

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | field | `string` | ● |
| 3 | rule | `'required' | 'email' | 'phone' | 'url' | 'min' | 'max' | ...` | ● |
| 4 | value | `any` | ○ |
| 5 | message | `string` | ● |
| 6 | enabled | `boolean` | ● |

## 64. IndustryBlueprint
Fields: 14

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | name | `string` | ● |
| 3 | type | `IndustryType` | ● |
| 4 | description | `string` | ● |
| 5 | icon | `string` | ● |
| 6 | customEntities | `CustomEntityDefinition[]` | ● |
| 7 | customFields | `Partial<Record<EntityType, CustomFieldDefinition[]>>` | ● |
| 8 | requiredFields | `Partial<Record<EntityType, string[]>>` | ● |
| 9 | pipelines | `Pipeline[]` | ● |
| 10 | statuses | `Record<string, string[]>` | ● |
| 11 | integrations | `string[]` | ● |
| 12 | modules | `{` | ● |
| 13 | enabled | `string[]` | ● |
| 14 | disabled | `string[]` | ● |

## 65. CustomEntityDefinition
Fields: 9

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | id | `string` | ● |
| 2 | name | `string` | ● |
| 3 | namePlural | `string` | ● |
| 4 | icon | `string` | ● |
| 5 | fields | `CustomFieldDefinition[]` | ● |
| 6 | relationTo | `EntityType[]` | ○ |
| 7 | hasTimeline | `boolean` | ○ |
| 8 | hasDocuments | `boolean` | ○ |
| 9 | hasWorkflow | `boolean` | ○ |

## 66. AuditFailure
Fields: 7

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | failureCode | `'SELECTOR_BYPASS' | 'RELATION_KEY_MISMATCH' | 'RELATION_C...` | ● |
| 2 | entityType | `string` | ● |
| 3 | recordId | `string` | ● |
| 4 | expected | `any` | ● |
| 5 | actual | `any` | ● |
| 6 | likelyCause | `string` | ● |
| 7 | whereToLook | `string` | ● |

## 67. AuditReport
Fields: 26

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | summary | `{` | ● |
| 2 | totalChecks | `number` | ● |
| 3 | passed | `number` | ● |
| 4 | failed | `number` | ● |
| 5 | integrityScore | `number` | ● |
| 6 | collections | `Record<string, number>` | ● |
| 7 | settings | `{` | ● |
| 8 | health | `'healthy' | 'unhealthy'` | ● |
| 9 | checks | `Record<string, { ok: boolean; issues: string[] }>` | ● |
| 10 | relationships | `{` | ● |
| 11 | orphanCount | `number` | ● |
| 12 | orphans | `{ parentType: string; parentId: string; childId: string; ...` | ● |
| 13 | casingIssues | `string[]` | ● |
| 14 | selectors | `{` | ● |
| 15 | discrepancies | `{ name: string; expected: number; actual: number; id: str...` | ● |
| 16 | tabCoverage | `Record<string, { id: string; name: string; tabs: Record<s...` | ● |
| 17 | personaFilters | `{` | ● |
| 18 | totalHidden | `number` | ● |
| 19 | activeUser | `string` | ● |
| 20 | activeRole | `string` | ● |
| 21 | impactByCollection | `Record<string, { total: number; visible: number; hidden: ...` | ● |
| 22 | seedIntegrity | `{` | ● |
| 23 | status | `'pristine' | 'modified' | 'corrupt'` | ● |
| 24 | issues | `string[]` | ● |
| 25 | failures | `AuditFailure[]` | ● |
| 26 | timestamp | `string` | ● |

---

# Type Aliases

| Type | Definition |
|------|------------|
| OperationalDomain | `'admin' | 'manager' | 'agent' | 'technician'` |
| CommunicationOutcome | `'answered' | 'no-answer' | 'voicemail' | 'meeting-booked' | 'converted'` |
| JobType | `'Install' | 'Service' | 'Emergency' | 'Inspection' | 'Audit'` |
| JobStatus | `'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'OnHold'` |
| POStatus | `'Draft' | 'Ordered' | 'Dispatched' | 'Delivered'` |
| ReviewPlatform | `'Google' | 'Facebook' | 'Yelp' | 'Trustpilot' | 'Internal'` |
| CalculatorType | `'ROI' | 'Repayment' | 'SolarYield'` |
| WorkflowTriggerType | `'RecordCreated' | 'FieldUpdated' | 'ThresholdReached' | 'FormSubmitted' | 'Da...` |
| WorkflowNodeType | `'Action' | 'Filter' | 'Delay'` |
| WorkflowActionType | `'SendEmail' | 'SendSMS' | 'CreateTask' | 'UpdateField' | 'Webhook'` |
