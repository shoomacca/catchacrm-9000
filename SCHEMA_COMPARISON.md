# SCHEMA COMPARISON: UI vs DATABASE
Generated: 2026-02-08T16:44:12.866Z

## Legend
- ✅ = Field exists in both UI and DB with matching names
- ⚠️ = Field in UI but NOT in DB (needs to be added)
- ❓ = Field in DB but NOT in UI (orphan or different name)
- 🔄 = Possible name mismatch (similar field exists)

## User (users)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| name | name | ✅ |
| email | email | ✅ |
| role | role | ✅ |
| avatar | avatar | ✅ |
| managerId | manager_id | ✅ |
| team | team | ✅ |
| - | instance_id | ❓ ORPHAN |
| - | aud | ❓ ORPHAN |
| - | encrypted_password | ❓ ORPHAN |
| - | email_confirmed_at | ❓ ORPHAN |
| - | invited_at | ❓ ORPHAN |
| - | confirmation_token | ❓ ORPHAN |
| - | confirmation_sent_at | ❓ ORPHAN |
| - | recovery_token | ❓ ORPHAN |
| - | recovery_sent_at | ❓ ORPHAN |
| - | email_change_token_new | ❓ ORPHAN |
| - | email_change | ❓ ORPHAN |
| - | email_change_sent_at | ❓ ORPHAN |
| - | last_sign_in_at | ❓ ORPHAN |
| - | raw_app_meta_data | ❓ ORPHAN |
| - | raw_user_meta_data | ❓ ORPHAN |
| - | is_super_admin | ❓ ORPHAN |
| - | phone | ❓ ORPHAN |
| - | phone_confirmed_at | ❓ ORPHAN |
| - | phone_change | ❓ ORPHAN |
| - | phone_change_token | ❓ ORPHAN |
| - | phone_change_sent_at | ❓ ORPHAN |
| - | confirmed_at | ❓ ORPHAN |
| - | email_change_token_current | ❓ ORPHAN |
| - | email_change_confirm_status | ❓ ORPHAN |
| - | banned_until | ❓ ORPHAN |
| - | reauthentication_token | ❓ ORPHAN |
| - | reauthentication_sent_at | ❓ ORPHAN |
| - | is_sso_user | ❓ ORPHAN |
| - | deleted_at | ❓ ORPHAN |
| - | is_anonymous | ❓ ORPHAN |

Summary: 6 matched, 0 missing, 30 orphans

## Account (accounts)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| name | name | ✅ |
| industry | industry | ✅ |
| website | website | ✅ |
| employeeCount | employee_count | ✅ |
| avatar | avatar | ✅ |
| tier | tier | ✅ |
| email | email | ✅ |
| city | city | ✅ |
| state | state | ✅ |
| logo | logo | ✅ |
| address | address | ✅ |
| commissionRate | commission_rate | ✅ |
| customData | custom_data | ✅ |
| phone | phone | ✅ |
| revenue | revenue | ✅ |
| status | status | ✅ |
| type | type | ✅ |
| ownerId | owner_id | ✅ |

Summary: 18 matched, 0 missing, 0 orphans

## Contact (contacts)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| name | name | ✅ |
| accountId | account_id | ✅ |
| email | email | ✅ |
| phone | phone | ✅ |
| title | title | ✅ |
| avatar | avatar | ✅ |
| company | company | ✅ |
| address | address | ✅ |
| customData | custom_data | ✅ |
| mobile | mobile | ✅ |
| department | department | ✅ |
| isPrimary | is_primary | ✅ |
| status | status | ✅ |

Summary: 13 matched, 0 missing, 0 orphans

## Lead (leads)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| name | name | ✅ |
| company | company | ✅ |
| email | email | ✅ |
| phone | phone | ✅ |
| status | status | ✅ |
| source | source | ✅ |
| campaignId | campaign_id | ✅ |
| estimatedValue | estimated_value | ✅ |
| avatar | avatar | ✅ |
| score | score | ✅ |
| address | address | ✅ |
| lastContactDate | last_contact_date | ✅ |
| notes | notes | ✅ |
| commissionRate | commission_rate | ✅ |
| convertedToDealId | converted_to_deal_id | ✅ |
| convertedAt | converted_at | ✅ |
| convertedBy | converted_by | ✅ |
| customData | custom_data | ✅ |
| assignedTo | assigned_to | ✅ |
| - | address_street | ❓ ORPHAN |
| - | address_suburb | ❓ ORPHAN |
| - | address_state | ❓ ORPHAN |
| - | address_postcode | ❓ ORPHAN |
| - | address_country | ❓ ORPHAN |

Summary: 19 matched, 0 missing, 5 orphans

## Deal (deals)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| name | name | ✅ |
| accountId | account_id | ✅ |
| contactId | contact_id | ✅ |
| amount | amount | ✅ |
| stage | stage | ✅ |
| probability | probability | ✅ |
| expectedCloseDate | expected_close_date | ✅ |
| assigneeId | assignee_id | ✅ |
| avatar | avatar | ✅ |
| stageEntryDate | stage_entry_date | ✅ |
| campaignId | campaign_id | ✅ |
| commissionRate | commission_rate | ✅ |
| commissionAmount | commission_amount | ✅ |
| leadId | lead_id | ✅ |
| wonAt | won_at | ✅ |
| createdAccountId | created_account_id | ✅ |
| createdContactId | created_contact_id | ✅ |
| customData | custom_data | ✅ |

Summary: 18 matched, 0 missing, 0 orphans

## Task (tasks)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| title | title | ✅ |
| description | description | ✅ |
| assigneeId | assignee_id | ✅ |
| dueDate | due_date | ✅ |
| status | status | ✅ |
| priority | priority | ✅ |
| relatedToId | related_to_id | ✅ |
| relatedToType | related_to_type | ✅ |
| completed | completed | ✅ |
| completedAt | completed_at | ✅ |

Summary: 10 matched, 0 missing, 0 orphans

## CalendarEvent (calendar_events)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| title | title | ✅ |
| description | description | ✅ |
| startTime | start_time | ✅ |
| endTime | end_time | ✅ |
| type | type | ✅ |
| location | location | ✅ |
| relatedToType | related_to_type | ✅ |
| relatedToId | related_to_id | ✅ |
| priority | priority | ✅ |
| isAllDay | is_all_day | ✅ |

Summary: 10 matched, 0 missing, 0 orphans

## Campaign (campaigns)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| name | name | ✅ |
| type | type | ✅ |
| budget | budget | ✅ |
| spent | spent | ✅ |
| revenue | revenue | ✅ |
| revenueGenerated | revenue_generated | ✅ |
| leadsGenerated | leads_generated | ✅ |
| status | status | ✅ |
| startDate | start_date | ✅ |
| endDate | end_date | ✅ |
| description | description | ✅ |
| expectedCPL | expected_c_p_l | ✅ |
| targetAudience | target_audience | ✅ |
| templateId | template_id | ✅ |

Summary: 14 matched, 0 missing, 0 orphans

## Communication (communications)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| type | type | ✅ |
| subject | subject | ✅ |
| content | content | ✅ |
| direction | direction | ✅ |
| relatedToType | related_to_type | ✅ |
| relatedToId | related_to_id | ✅ |
| outcome | outcome | ✅ |
| nextStep | next_step | ✅ |
| nextFollowUpDate | next_follow_up_date | ✅ |
| metadata | metadata | ✅ |

Summary: 10 matched, 0 missing, 0 orphans

## Ticket (tickets)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| ticketNumber | ticket_number | ✅ |
| subject | subject | ✅ |
| description | description | ✅ |
| requesterId | requester_id | ✅ |
| accountId | account_id | ✅ |
| assigneeId | assignee_id | ✅ |
| status | status | ✅ |
| priority | priority | ✅ |
| slaDeadline | sla_deadline | ✅ |
| messages | messages | ✅ |
| internalNotes | internal_notes | ✅ |
| customData | custom_data | ✅ |
| relatedToId | related_to_id | ✅ |
| relatedToType | related_to_type | ✅ |

Summary: 14 matched, 0 missing, 0 orphans

## Product (products)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| name | name | ✅ |
| sku | sku | ✅ |
| code | code | ✅ |
| description | description | ✅ |
| category | category | ✅ |
| type | type | ✅ |
| unitPrice | unit_price | ✅ |
| costPrice | cost_price | ✅ |
| taxRate | tax_rate | ✅ |
| isActive | is_active | ✅ |
| stockLevel | stock_level | ✅ |
| reorderPoint | reorder_point | ✅ |
| reorderQuantity | reorder_quantity | ✅ |
| specifications | specifications | ✅ |
| images | images | ✅ |
| dimensions | dimensions | ✅ |
| weight | weight | ✅ |
| manufacturer | manufacturer | ✅ |
| supplier | supplier | ✅ |
| supplierSKU | supplier? | 🔄 |
| warrantyMonths | warranty_months | ✅ |
| warrantyDetails | warranty_details | ✅ |
| tags | tags | ✅ |
| customFields | custom_fields | ✅ |
| - | supplier_sku | ❓ ORPHAN |

Summary: 23 matched, 0 missing, 1 orphans

## Service (services)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| name | name | ✅ |
| code | code | ✅ |
| sku | sku | ✅ |
| description | description | ✅ |
| category | category | ✅ |
| type | type | ✅ |
| billingCycle | billing_cycle | ✅ |
| unitPrice | unit_price | ✅ |
| costPrice | cost_price | ✅ |
| taxRate | tax_rate | ✅ |
| isActive | is_active | ✅ |
| durationHours | duration_hours | ✅ |
| durationMinutes | duration_minutes | ✅ |
| prerequisites | prerequisites | ✅ |
| deliverables | deliverables | ✅ |
| skillsRequired | skills_required | ✅ |
| crewSize | crew_size | ✅ |
| equipmentNeeded | equipment_needed | ✅ |
| slaResponseHours | sla_response_hours | ✅ |
| slaCompletionDays | sla_completion_days | ✅ |
| qualityChecklist | quality_checklist | ✅ |
| images | images | ✅ |
| tags | tags | ✅ |
| customFields | custom_fields | ✅ |
| slaHours | sla_hours | ✅ |
| requiresEquipment | requires_equipment | ✅ |
| equipmentList | equipment_list | ✅ |
| certificationRequired | certification_required | ✅ |

Summary: 28 matched, 0 missing, 0 orphans

## Quote (quotes)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| quoteNumber | quote_number | ✅ |
| dealId | deal_id | ✅ |
| accountId | account_id | ✅ |
| status | status | ✅ |
| issueDate | issue_date | ✅ |
| expiryDate | expiry_date | ✅ |
| lineItems | line_items | ✅ |
| subtotal | subtotal | ✅ |
| taxTotal | tax_total | ✅ |
| total | total | ✅ |
| notes | notes | ✅ |
| terms | terms | ✅ |
| acceptedAt | accepted_at | ✅ |
| acceptedBy | accepted_by | ✅ |
| supersededBy | superseded_by | ✅ |
| version | version | ✅ |

Summary: 16 matched, 0 missing, 0 orphans

## Invoice (invoices)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| invoiceNumber | invoice_number | ✅ |
| accountId | account_id | ✅ |
| dealId | deal_id | ✅ |
| quoteId | quote_id | ✅ |
| status | status | ✅ |
| paymentStatus | payment_status | ✅ |
| issueDate | issue_date | ✅ |
| invoiceDate | invoice_date | ✅ |
| dueDate | due_date | ✅ |
| sentAt | sent_at | ✅ |
| paidAt | paid_at | ✅ |
| lineItems | line_items | ✅ |
| subtotal | subtotal | ✅ |
| taxTotal | tax_total | ✅ |
| total | total | ✅ |
| amountPaid | amount_paid | ✅ |
| balanceDue | balance_due | ✅ |
| notes | notes | ✅ |
| terms | terms | ✅ |
| lateFeeRate | late_fee_rate | ✅ |
| credits | credits | ✅ |

Summary: 21 matched, 0 missing, 0 orphans

## Job (jobs)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| jobNumber | job_number | ✅ |
| name | name | ✅ |
| subject | subject | ✅ |
| description | description | ✅ |
| accountId | account_id | ✅ |
| assigneeId | assignee_id | ✅ |
| crewId | crew_id | ✅ |
| jobType | job_type | ✅ |
| status | status | ✅ |
| priority | priority | ✅ |
| zone | zone | ✅ |
| estimatedDuration | estimated_duration | ✅ |
| scheduledDate | scheduled_date | ✅ |
| scheduledEndDate | scheduled_end_date | ✅ |
| completedAt | completed_at | ✅ |
| lat | lat | ✅ |
| lng | lng | ✅ |
| jobFields | job_fields | ✅ |
| swmsSigned | swms_signed | ✅ |
| completionSignature | completion_signature | ✅ |
| evidencePhotos | evidence_photos | ✅ |
| bom | bom | ✅ |
| invoiceId | invoice_id | ✅ |

Summary: 23 matched, 0 missing, 0 orphans

## Crew (crews)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| name | name | ✅ |
| leaderId | leader_id | ✅ |
| memberIds | member_ids | ✅ |
| color | color | ✅ |
| specialty | specialty | ✅ |
| status | status | ✅ |

Summary: 6 matched, 0 missing, 0 orphans

## Zone (zones)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| name | name | ✅ |
| region | region | ✅ |
| description | description | ✅ |
| color | color | ✅ |
| type | type | ✅ |
| status | status | ✅ |
| coordinates | coordinates | ✅ |

Summary: 7 matched, 0 missing, 0 orphans

## Equipment (equipment)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| name | name | ✅ |
| type | type | ✅ |
| barcode | barcode | ✅ |
| condition | condition | ✅ |
| location | location | ✅ |
| assignedTo | assigned_to | ✅ |
| lastServiceDate | last_service_date | ✅ |
| nextServiceDate | next_service_date | ✅ |
| purchaseDate | purchase_date | ✅ |
| purchasePrice | purchase_price | ✅ |
| model | model | ✅ |
| status | status | ✅ |
| value | value | ✅ |

Summary: 13 matched, 0 missing, 0 orphans

## InventoryItem (inventory_items)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| name | name | ✅ |
| sku | sku | ✅ |
| warehouseQty | warehouse_qty | ✅ |
| reorderPoint | reorder_point | ✅ |
| category | category | ✅ |
| unitPrice | unit_price | ✅ |

Summary: 6 matched, 0 missing, 0 orphans

## PurchaseOrder (purchase_orders)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| poNumber | po_number | ✅ |
| supplierId | supplier_id | ✅ |
| accountId | account_id | ✅ |
| status | status | ✅ |
| items | items | ✅ |
| total | total | ✅ |
| linkedJobId | linked_job_id | ✅ |
| expectedDelivery | expected_delivery | ✅ |

Summary: 8 matched, 0 missing, 0 orphans

## BankTransaction (bank_transactions)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| date | date | ✅ |
| description | description | ✅ |
| amount | amount | ✅ |
| type | type | ✅ |
| status | status | ✅ |
| matchConfidence | match_confidence | ✅ |
| matchedToId | matched_to_id | ✅ |
| matchedToType | matched_to_type | ✅ |
| reconciled | reconciled | ✅ |
| reconciledAt | reconciled_at | ✅ |
| reconciledBy | reconciled_by | ✅ |
| bankReference | bank_reference | ✅ |
| notes | notes | ✅ |

Summary: 13 matched, 0 missing, 0 orphans

## Expense (expenses)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| vendor | vendor | ✅ |
| amount | amount | ✅ |
| category | category | ✅ |
| date | date | ✅ |
| status | status | ✅ |
| receiptUrl | receipt_url | ✅ |
| approvedBy | approved_by | ✅ |

Summary: 7 matched, 0 missing, 0 orphans

## Review (reviews)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| authorName | author_name | ✅ |
| rating | rating | ✅ |
| content | content | ✅ |
| platform | platform | ✅ |
| status | status | ✅ |
| replied | replied | ✅ |
| replyContent | reply_content | ✅ |
| repliedAt | replied_at | ✅ |
| jobId | job_id | ✅ |
| accountId | account_id | ✅ |
| sentiment | sentiment | ✅ |

Summary: 11 matched, 0 missing, 0 orphans

## Warehouse (warehouses)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| name | name | ✅ |
| address | address | ✅ |
| isDefault | is_default | ✅ |
| - | location | ❓ ORPHAN |
| - | capacity | ❓ ORPHAN |
| - | status | ❓ ORPHAN |

Summary: 3 matched, 0 missing, 3 orphans

## Subscription (subscriptions)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| accountId | account_id | ✅ |
| name | name | ✅ |
| status | status | ✅ |
| billingCycle | billing_cycle | ✅ |
| nextBillDate | next_bill_date | ✅ |
| startDate | start_date | ✅ |
| endDate | end_date | ✅ |
| items | items | ✅ |
| autoGenerateInvoice | auto_generate_invoice | ✅ |
| lastInvoiceId | last_invoice_id | ✅ |
| - | contact_id | ❓ ORPHAN |
| - | billing_period | ❓ ORPHAN |
| - | amount | ❓ ORPHAN |
| - | currency | ❓ ORPHAN |
| - | next_billing_date | ❓ ORPHAN |
| - | trial_end_date | ❓ ORPHAN |
| - | cancelled_at | ❓ ORPHAN |
| - | payment_method | ❓ ORPHAN |
| - | custom_fields | ❓ ORPHAN |

Summary: 10 matched, 0 missing, 9 orphans

## Document (documents)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| title | title | ✅ |
| fileType | file_type | ✅ |
| fileSize | file_size | ✅ |
| url | url | ✅ |
| relatedToType | related_to_type | ✅ |
| relatedToId | related_to_id | ✅ |
| - | name | ❓ ORPHAN |
| - | file_url | ❓ ORPHAN |
| - | content_text | ❓ ORPHAN |
| - | embedding | ❓ ORPHAN |
| - | processing_status | ❓ ORPHAN |
| - | processed_at | ❓ ORPHAN |
| - | uploaded_by | ❓ ORPHAN |
| - | version | ❓ ORPHAN |
| - | parent_document_id | ❓ ORPHAN |
| - | description | ❓ ORPHAN |
| - | tags | ❓ ORPHAN |

Summary: 6 matched, 0 missing, 11 orphans

## AuditLog (audit_log)
| UI Field | DB Column | Status |
|----------|-----------|--------|
| entityType | entity_type | ✅ |
| entityId | entity_id | ✅ |
| action | action | ✅ |
| previousValue | previous_value | ✅ |
| newValue | new_value | ✅ |
| metadata | metadata | ✅ |
| batchId | batch_id | ✅ |

Summary: 7 matched, 0 missing, 0 orphans

---
# GRAND TOTAL
- Matched: 340
- Missing in DB: 0
- Orphan in DB: 59
