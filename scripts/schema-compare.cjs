const { Client } = require('pg');
const fs = require('fs');

// UI Types extracted from types.ts (camelCase)
const uiTypes = {
  User: ['name', 'email', 'role', 'avatar', 'managerId', 'team'],
  Account: ['name', 'industry', 'website', 'employeeCount', 'avatar', 'tier', 'email', 'city', 'state', 'logo', 'address', 'commissionRate', 'customData', 'phone', 'revenue', 'status', 'type', 'ownerId'],
  Contact: ['name', 'accountId', 'email', 'phone', 'title', 'avatar', 'company', 'address', 'customData', 'mobile', 'department', 'isPrimary', 'status'],
  Lead: ['name', 'company', 'email', 'phone', 'status', 'source', 'campaignId', 'estimatedValue', 'avatar', 'score', 'address', 'lastContactDate', 'notes', 'commissionRate', 'convertedToDealId', 'convertedAt', 'convertedBy', 'customData', 'assignedTo'],
  Deal: ['name', 'accountId', 'contactId', 'amount', 'stage', 'probability', 'expectedCloseDate', 'assigneeId', 'avatar', 'stageEntryDate', 'campaignId', 'commissionRate', 'commissionAmount', 'leadId', 'wonAt', 'createdAccountId', 'createdContactId', 'customData'],
  Task: ['title', 'description', 'assigneeId', 'dueDate', 'status', 'priority', 'relatedToId', 'relatedToType', 'completed', 'completedAt'],
  CalendarEvent: ['title', 'description', 'startTime', 'endTime', 'type', 'location', 'relatedToType', 'relatedToId', 'priority', 'isAllDay'],
  Campaign: ['name', 'type', 'budget', 'spent', 'revenue', 'revenueGenerated', 'leadsGenerated', 'status', 'startDate', 'endDate', 'description', 'expectedCPL', 'targetAudience', 'templateId'],
  Communication: ['type', 'subject', 'content', 'direction', 'relatedToType', 'relatedToId', 'outcome', 'nextStep', 'nextFollowUpDate', 'metadata'],
  Ticket: ['ticketNumber', 'subject', 'description', 'requesterId', 'accountId', 'assigneeId', 'status', 'priority', 'slaDeadline', 'messages', 'internalNotes', 'customData', 'relatedToId', 'relatedToType'],
  Product: ['name', 'sku', 'code', 'description', 'category', 'type', 'unitPrice', 'costPrice', 'taxRate', 'isActive', 'stockLevel', 'reorderPoint', 'reorderQuantity', 'specifications', 'images', 'dimensions', 'weight', 'manufacturer', 'supplier', 'supplierSKU', 'warrantyMonths', 'warrantyDetails', 'tags', 'customFields'],
  Service: ['name', 'code', 'sku', 'description', 'category', 'type', 'billingCycle', 'unitPrice', 'costPrice', 'taxRate', 'isActive', 'durationHours', 'durationMinutes', 'prerequisites', 'deliverables', 'skillsRequired', 'crewSize', 'equipmentNeeded', 'slaResponseHours', 'slaCompletionDays', 'qualityChecklist', 'images', 'tags', 'customFields', 'slaHours', 'requiresEquipment', 'equipmentList', 'certificationRequired'],
  Quote: ['quoteNumber', 'dealId', 'accountId', 'status', 'issueDate', 'expiryDate', 'lineItems', 'subtotal', 'taxTotal', 'total', 'notes', 'terms', 'acceptedAt', 'acceptedBy', 'supersededBy', 'version'],
  Invoice: ['invoiceNumber', 'accountId', 'dealId', 'quoteId', 'status', 'paymentStatus', 'issueDate', 'invoiceDate', 'dueDate', 'sentAt', 'paidAt', 'lineItems', 'subtotal', 'taxTotal', 'total', 'amountPaid', 'balanceDue', 'notes', 'terms', 'lateFeeRate', 'credits'],
  Job: ['jobNumber', 'name', 'subject', 'description', 'accountId', 'assigneeId', 'crewId', 'jobType', 'status', 'priority', 'zone', 'estimatedDuration', 'scheduledDate', 'scheduledEndDate', 'completedAt', 'lat', 'lng', 'jobFields', 'swmsSigned', 'completionSignature', 'evidencePhotos', 'bom', 'invoiceId'],
  Crew: ['name', 'leaderId', 'memberIds', 'color', 'specialty', 'status'],
  Zone: ['name', 'region', 'description', 'color', 'type', 'status', 'coordinates'],
  Equipment: ['name', 'type', 'barcode', 'condition', 'location', 'assignedTo', 'lastServiceDate', 'nextServiceDate', 'purchaseDate', 'purchasePrice', 'model', 'status', 'value'],
  InventoryItem: ['name', 'sku', 'warehouseQty', 'reorderPoint', 'category', 'unitPrice'],
  PurchaseOrder: ['poNumber', 'supplierId', 'accountId', 'status', 'items', 'total', 'linkedJobId', 'expectedDelivery'],
  BankTransaction: ['date', 'description', 'amount', 'type', 'status', 'matchConfidence', 'matchedToId', 'matchedToType', 'reconciled', 'reconciledAt', 'reconciledBy', 'bankReference', 'notes'],
  Expense: ['vendor', 'amount', 'category', 'date', 'status', 'receiptUrl', 'approvedBy'],
  Review: ['authorName', 'rating', 'content', 'platform', 'status', 'replied', 'replyContent', 'repliedAt', 'jobId', 'accountId', 'sentiment'],
  Warehouse: ['name', 'address', 'isDefault'],
  Subscription: ['accountId', 'name', 'status', 'billingCycle', 'nextBillDate', 'startDate', 'endDate', 'items', 'autoGenerateInvoice', 'lastInvoiceId'],
  Document: ['title', 'fileType', 'fileSize', 'url', 'relatedToType', 'relatedToId'],
  AuditLog: ['entityType', 'entityId', 'action', 'previousValue', 'newValue', 'metadata', 'batchId']
};

// Map UI type names to DB table names
const typeToTable = {
  User: 'users',
  Account: 'accounts',
  Contact: 'contacts',
  Lead: 'leads',
  Deal: 'deals',
  Task: 'tasks',
  CalendarEvent: 'calendar_events',
  Campaign: 'campaigns',
  Communication: 'communications',
  Ticket: 'tickets',
  Product: 'products',
  Service: 'services',
  Quote: 'quotes',
  Invoice: 'invoices',
  Job: 'jobs',
  Crew: 'crews',
  Zone: 'zones',
  Equipment: 'equipment',
  InventoryItem: 'inventory_items',
  PurchaseOrder: 'purchase_orders',
  BankTransaction: 'bank_transactions',
  Expense: 'expenses',
  Review: 'reviews',
  Warehouse: 'warehouses',
  Subscription: 'subscriptions',
  Document: 'documents',
  AuditLog: 'audit_log'
};

// Convert camelCase to snake_case
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => '_' + letter.toLowerCase());
}

// Convert snake_case to camelCase
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

const client = new Client({
  connectionString: 'postgresql://postgres.anawatvgypmrpbmjfcht:3uC0J5DUgiDDCMOe@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function compare() {
  await client.connect();

  let output = '# SCHEMA COMPARISON: UI vs DATABASE\n';
  output += 'Generated: ' + new Date().toISOString() + '\n\n';
  output += '## Legend\n';
  output += '- ✅ = Field exists in both UI and DB with matching names\n';
  output += '- ⚠️ = Field in UI but NOT in DB (needs to be added)\n';
  output += '- ❓ = Field in DB but NOT in UI (orphan or different name)\n';
  output += '- 🔄 = Possible name mismatch (similar field exists)\n\n';

  let totalMissing = 0;
  let totalOrphans = 0;
  let totalMatched = 0;

  for (const [typeName, uiFields] of Object.entries(uiTypes)) {
    const tableName = typeToTable[typeName];
    if (!tableName) continue;

    // Get DB columns
    const { rows: dbCols } = await client.query(
      `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
      [tableName]
    );

    if (dbCols.length === 0) {
      output += '## ' + typeName + ' (' + tableName + ')\n';
      output += '❌ TABLE DOES NOT EXIST IN DATABASE\n\n';
      continue;
    }

    const dbColNames = dbCols.map(c => c.column_name);
    const systemCols = ['id', 'org_id', 'created_at', 'updated_at', 'created_by', 'owner_id'];

    output += '## ' + typeName + ' (' + tableName + ')\n';
    output += '| UI Field | DB Column | Status |\n';
    output += '|----------|-----------|--------|\n';

    const matched = [];
    const missing = [];
    const orphans = [];

    // Check each UI field
    for (const uiField of uiFields) {
      const snakeField = toSnakeCase(uiField);

      if (dbColNames.includes(snakeField)) {
        matched.push({ ui: uiField, db: snakeField });
        output += '| ' + uiField + ' | ' + snakeField + ' | ✅ |\n';
      } else {
        // Check for similar names
        const similar = dbColNames.find(db =>
          db.includes(snakeField.replace(/_/g, '')) ||
          snakeField.includes(db.replace(/_/g, ''))
        );
        if (similar) {
          output += '| ' + uiField + ' | ' + similar + '? | 🔄 |\n';
        } else {
          missing.push(uiField);
          output += '| ' + uiField + ' | - | ⚠️ MISSING |\n';
        }
      }
    }

    // Check for orphan DB columns
    for (const dbCol of dbColNames) {
      if (systemCols.includes(dbCol)) continue;

      const camelCol = toCamelCase(dbCol);
      if (!uiFields.includes(camelCol) && !uiFields.some(f => toSnakeCase(f) === dbCol)) {
        orphans.push(dbCol);
        output += '| - | ' + dbCol + ' | ❓ ORPHAN |\n';
      }
    }

    output += '\n';
    output += 'Summary: ' + matched.length + ' matched, ' + missing.length + ' missing, ' + orphans.length + ' orphans\n\n';

    totalMatched += matched.length;
    totalMissing += missing.length;
    totalOrphans += orphans.length;
  }

  output += '---\n';
  output += '# GRAND TOTAL\n';
  output += '- Matched: ' + totalMatched + '\n';
  output += '- Missing in DB: ' + totalMissing + '\n';
  output += '- Orphan in DB: ' + totalOrphans + '\n';

  fs.writeFileSync('SCHEMA_COMPARISON.md', output);
  console.log('Written to SCHEMA_COMPARISON.md');
  console.log('Matched: ' + totalMatched + ', Missing: ' + totalMissing + ', Orphans: ' + totalOrphans);

  await client.end();
}

compare().catch(console.error);
