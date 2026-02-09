# UI TYPES AUDIT (src/types.ts)
Generated: 2026-02-08T15:57:13.886Z
Interfaces: 67

## User (6 fields)
| Field | Type | Required |
|-------|------|----------|
| name | string | YES |
| email | string | YES |
| role | OperationalDomain | YES |
| avatar | string | YES |
| managerId | string | NO |
| team | string | NO |

## Account (13 fields)
| Field | Type | Required |
|-------|------|----------|
| name | string | YES |
| industry | string | YES |
| website | string | YES |
| employeeCount | number | YES |
| avatar | string | YES |
| tier | string | YES |
| email | string | NO |
| city | string | NO |
| state | string | NO |
| logo | string | NO |
| address | Address | NO |
| commissionRate | number | NO |
| customData | Record<string, any> | NO |

## Contact (9 fields)
| Field | Type | Required |
|-------|------|----------|
| name | string | YES |
| accountId | string | YES |
| email | string | YES |
| phone | string | YES |
| title | string | YES |
| avatar | string | YES |
| company | string | NO |
| address | Address | NO |
| customData | Record<string, any> | NO |

## Lead (18 fields)
| Field | Type | Required |
|-------|------|----------|
| name | string | YES |
| company | string | YES |
| email | string | YES |
| phone | string | YES |
| status | string | YES |
| source | string | YES |
| campaignId | string | NO |
| estimatedValue | number | YES |
| avatar | string | YES |
| score | number | YES |
| address | Address | NO |
| lastContactDate | string | NO |
| notes | string | NO |
| commissionRate | number | NO |
| convertedToDealId | string | NO |
| convertedAt | string | NO |
| convertedBy | string | NO |
| customData | Record<string, any> | NO |

## Deal (18 fields)
| Field | Type | Required |
|-------|------|----------|
| name | string | YES |
| accountId | string | YES |
| contactId | string | YES |
| amount | number | YES |
| stage | string | YES |
| probability | number | YES |
| expectedCloseDate | string | YES |
| assigneeId | string | YES |
| avatar | string | YES |
| stageEntryDate | string | NO |
| campaignId | string | NO |
| commissionRate | number | NO |
| commissionAmount | number | NO |
| leadId | string | NO |
| wonAt | string | NO |
| createdAccountId | string | NO |
| createdContactId | string | NO |
| customData | Record<string, any> | NO |

## Task (8 fields)
| Field | Type | Required |
|-------|------|----------|
| title | string | YES |
| description | string | YES |
| assigneeId | string | YES |
| dueDate | string | YES |
| status | string | YES |
| priority | string | YES |
| relatedToId | string | YES |
| relatedToType | EntityType | YES |

## CalendarEvent (10 fields)
| Field | Type | Required |
|-------|------|----------|
| title | string | YES |
| description | string | YES |
| startTime | string | YES |
| endTime | string | YES |
| type | 'Meeting' | 'Call' | 'Internal' | 'De... | YES |
| location | string | NO |
| relatedToType | EntityType | NO |
| relatedToId | string | NO |
| priority | 'high' | 'medium' | 'low' | NO |
| isAllDay | boolean | NO |

## Campaign (14 fields)
| Field | Type | Required |
|-------|------|----------|
| name | string | YES |
| type | 'Email' | 'Social' | 'Search' | 'Even... | YES |
| budget | number | YES |
| spent | number | NO |
| revenue | number | NO |
| revenueGenerated | number | YES |
| leadsGenerated | number | NO |
| status | 'Planning' | 'Active' | 'Paused' | 'C... | YES |
| startDate | string | NO |
| endDate | string | NO |
| description | string | NO |
| expectedCPL | number | NO |
| targetAudience | string | NO |
| templateId | string | NO |

## Communication (10 fields)
| Field | Type | Required |
|-------|------|----------|
| type | 'Email' | 'Call' | 'SMS' | 'Note' | YES |
| subject | string | YES |
| content | string | YES |
| direction | 'Inbound' | 'Outbound' | YES |
| relatedToType | EntityType | YES |
| relatedToId | string | YES |
| outcome | CommunicationOutcome | YES |
| nextStep | string | NO |
| nextFollowUpDate | string | NO |
| metadata | Record<string, any> | NO |

## Ticket (14 fields)
| Field | Type | Required |
|-------|------|----------|
| ticketNumber | string | YES |
| subject | string | YES |
| description | string | YES |
| requesterId | string | YES |
| accountId | string | NO |
| assigneeId | string | YES |
| status | string | YES |
| priority | string | YES |
| slaDeadline | string | YES |
| messages | TicketMessage[] | YES |
| internalNotes | TicketMessage[] | NO |
| customData | Record<string, any> | NO |
| relatedToId | string | NO |
| relatedToType | EntityType | NO |

## Product (24 fields)
| Field | Type | Required |
|-------|------|----------|
| name | string | YES |
| sku | string | NO |
| code | string | NO |
| description | string | YES |
| category | string | NO |
| type | string | NO |
| unitPrice | number | YES |
| costPrice | number | NO |
| taxRate | number | YES |
| isActive | boolean | YES |
| stockLevel | number | NO |
| reorderPoint | number | NO |
| reorderQuantity | number | NO |
| specifications | string | NO |
| images | string[] | NO |
| dimensions | { length?: number; width?: number; he... | NO |
| weight | { value?: number; unit?: string } | NO |
| manufacturer | string | NO |
| supplier | string | NO |
| supplierSKU | string | NO |
| warrantyMonths | number | NO |
| warrantyDetails | string | NO |
| tags | string[] | NO |
| customFields | Record<string, any> | NO |

## Service (24 fields)
| Field | Type | Required |
|-------|------|----------|
| name | string | YES |
| code | string | NO |
| sku | string | NO |
| description | string | YES |
| category | string | NO |
| type | string | NO |
| billingCycle | 'one-off' | 'monthly' | 'quarterly' |... | YES |
| unitPrice | number | YES |
| costPrice | number | NO |
| taxRate | number | YES |
| isActive | boolean | YES |
| durationHours | number | NO |
| durationMinutes | number | NO |
| prerequisites | string | NO |
| deliverables | string | NO |
| skillsRequired | string[] | NO |
| crewSize | number | NO |
| equipmentNeeded | string[] | NO |
| slaResponseHours | number | NO |
| slaCompletionDays | number | NO |
| qualityChecklist | string[] | NO |
| images | string[] | NO |
| tags | string[] | NO |
| customFields | Record<string, any> | NO |

## Quote (16 fields)
| Field | Type | Required |
|-------|------|----------|
| quoteNumber | string | YES |
| dealId | string | YES |
| accountId | string | YES |
| status | 'Draft' | 'Sent' | 'Accepted' | 'Decl... | YES |
| issueDate | string | YES |
| expiryDate | string | YES |
| lineItems | LineItem[] | YES |
| subtotal | number | YES |
| taxTotal | number | YES |
| total | number | YES |
| notes | string | NO |
| terms | string | NO |
| acceptedAt | string | NO |
| acceptedBy | string | NO |
| supersededBy | string | NO |
| version | number | NO |

## Invoice (18 fields)
| Field | Type | Required |
|-------|------|----------|
| invoiceNumber | string | YES |
| accountId | string | YES |
| dealId | string | NO |
| quoteId | string | NO |
| status | 'Draft' | 'Sent' | 'Paid' | 'Overdue'... | YES |
| paymentStatus | 'unpaid' | 'paid' | 'partially_paid' ... | YES |
| issueDate | string | YES |
| invoiceDate | string | YES |
| dueDate | string | YES |
| sentAt | string | NO |
| paidAt | string | NO |
| lineItems | LineItem[] | YES |
| subtotal | number | YES |
| taxTotal | number | YES |
| total | number | YES |
| notes | string | NO |
| terms | string | NO |
| credits | InvoiceCredit[] | NO |

## Job (23 fields)
| Field | Type | Required |
|-------|------|----------|
| jobNumber | string | YES |
| name | string | NO |
| subject | string | YES |
| description | string | YES |
| accountId | string | YES |
| assigneeId | string | NO |
| crewId | string | NO |
| jobType | JobType | YES |
| status | JobStatus | YES |
| priority | string | YES |
| zone | string | NO |
| estimatedDuration | number | NO |
| scheduledDate | string | NO |
| scheduledEndDate | string | NO |
| completedAt | string | NO |
| lat | number | NO |
| lng | number | NO |
| jobFields | JobField[] | NO |
| swmsSigned | boolean | NO |
| completionSignature | string | NO |
| evidencePhotos | string[] | NO |
| bom | BOMItem[] | NO |
| invoiceId | string | NO |

## Crew (4 fields)
| Field | Type | Required |
|-------|------|----------|
| name | string | YES |
| leaderId | string | YES |
| memberIds | string[] | YES |
| color | string | YES |

## Zone (4 fields)
| Field | Type | Required |
|-------|------|----------|
| name | string | YES |
| region | string | YES |
| description | string | NO |
| color | string | NO |

## Equipment (10 fields)
| Field | Type | Required |
|-------|------|----------|
| name | string | YES |
| type | string | YES |
| barcode | string | YES |
| condition | 'Excellent' | 'Good' | 'Fair' | 'Poor... | YES |
| location | string | YES |
| assignedTo | string | NO |
| lastServiceDate | string | NO |
| nextServiceDate | string | NO |
| purchaseDate | string | NO |
| purchasePrice | number | NO |

## InventoryItem (6 fields)
| Field | Type | Required |
|-------|------|----------|
| name | string | YES |
| sku | string | YES |
| warehouseQty | number | YES |
| reorderPoint | number | YES |
| category | 'Asset' | 'Material' | YES |
| unitPrice | number | YES |

## PurchaseOrder (7 fields)
| Field | Type | Required |
|-------|------|----------|
| poNumber | string | YES |
| supplierId | string | YES |
| accountId | string | YES |
| status | POStatus | YES |
| items | { sku: string; name: string; qty: num... | YES |
| total | number | YES |
| linkedJobId | string | NO |

## BankTransaction (13 fields)
| Field | Type | Required |
|-------|------|----------|
| date | string | YES |
| description | string | YES |
| amount | number | YES |
| type | 'Credit' | 'Debit' | YES |
| status | 'unmatched' | 'matched' | 'ignored' | YES |
| matchConfidence | 'none' | 'amber' | 'green' | YES |
| matchedToId | string | NO |
| matchedToType | 'invoices' | 'expenses' | 'other' | NO |
| reconciled | boolean | YES |
| reconciledAt | string | NO |
| reconciledBy | string | NO |
| bankReference | string | NO |
| notes | string | NO |

## Expense (7 fields)
| Field | Type | Required |
|-------|------|----------|
| vendor | string | YES |
| amount | number | YES |
| category | 'Materials' | 'Fuel' | 'Subbies' | 'R... | YES |
| date | string | YES |
| status | 'Paid' | 'Pending' | YES |
| receiptUrl | string | NO |
| approvedBy | string | NO |

## Review (11 fields)
| Field | Type | Required |
|-------|------|----------|
| authorName | string | YES |
| rating | number | YES |
| content | string | YES |
| platform | ReviewPlatform | YES |
| status | 'New' | 'Replied' | 'Escalated' | 'Ig... | YES |
| replied | boolean | NO |
| replyContent | string | NO |
| repliedAt | string | NO |
| jobId | string | NO |
| accountId | string | NO |
| sentiment | 'Positive' | 'Neutral' | 'Negative' | YES |

## Warehouse (4 fields)
| Field | Type | Required |
|-------|------|----------|
| id | string | YES |
| name | string | YES |
| address | string | YES |
| isDefault | boolean | YES |

## Subscription (10 fields)
| Field | Type | Required |
|-------|------|----------|
| accountId | string | YES |
| name | string | YES |
| status | 'Active' | 'Paused' | 'Cancelled' | YES |
| billingCycle | 'one-off' | 'monthly' | 'quarterly' |... | YES |
| nextBillDate | string | YES |
| startDate | string | YES |
| endDate | string | NO |
| items | Omit<LineItem, 'lineTotal'>[] | YES |
| autoGenerateInvoice | boolean | YES |
| lastInvoiceId | string | NO |

## Document (6 fields)
| Field | Type | Required |
|-------|------|----------|
| title | string | YES |
| fileType | string | YES |
| fileSize | string | YES |
| url | string | YES |
| relatedToType | EntityType | YES |
| relatedToId | string | YES |

## AuditLog (7 fields)
| Field | Type | Required |
|-------|------|----------|
| entityType | EntityType | YES |
| entityId | string | YES |
| action | string | YES |
| previousValue | string | NO |
| newValue | string | NO |
| metadata | Record<string, any> | NO |
| batchId | string | NO |

