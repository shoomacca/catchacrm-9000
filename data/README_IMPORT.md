# Matrix Mock Data - CSV Import Files

This folder contains CSV files with Matrix-themed mock data ready for import into your CRM.

## Available Files

1. **matrix_accounts.csv** - 10 accounts (ships and organizations)
2. **matrix_contacts.csv** - 14 contacts (crew members and characters)
3. **matrix_leads.csv** - 5 leads (potential recruits)
4. **matrix_products.csv** - 10 products (Matrix technology)
5. **matrix_services.csv** - 10 services (Zion services)

## How to Import

### Via UI (Recommended)

1. **Open your browser**: http://localhost:3002
2. **Navigate to the module**:
   - Accounts → Click "Import CSV" button
   - Contacts → Click "Import CSV" button
   - Leads → Click "Import CSV" button (already implemented)
   - Products → Click "Import CSV" button
   - Services → Click "Import CSV" button

3. **Select the corresponding CSV file** from this `data/` folder
4. **Verify the import** - check that data loaded correctly

### Import Order

Import in this order to maintain referential integrity:
1. Accounts first (referenced by Contacts)
2. Contacts second
3. Leads, Products, Services (independent, any order)

## Bulk Actions Needed

Your app needs bulk action buttons for common operations:

- **Bulk Delete**: Select multiple records → Delete all
- **Bulk Status Update**: Select multiple → Change status (e.g., cancel 300 services at once)
- **Bulk Assignment**: Select multiple → Assign to user
- **Bulk Export**: Select multiple → Export to CSV

### Suggested Implementation

Add these buttons to all list pages:
```tsx
<button onClick={handleBulkDelete}>Delete Selected ({selectedCount})</button>
<button onClick={handleBulkStatusUpdate}>Update Status</button>
<button onClick={handleBulkExport}>Export Selected</button>
```

## Current Status

✅ CSV Export - Working for all modules
✅ CSV Import - Working for Leads
⚠️  CSV Import - Needs to be added to: Accounts, Contacts, Products, Services, Invoices, etc.
⚠️  Bulk Actions - Not implemented yet

## Next Steps

1. Add CSV import buttons to all major modules
2. Implement bulk action menu (checkbox selection + bulk operations)
3. Test import with these Matrix CSV files
4. Create import templates for other modules (Deals, Tasks, Campaigns, Jobs, etc.)

---

**Note**: These CSV files are configured to work with your existing database schema. If import fails, check:
- Column name mismatches (e.g., "Price" vs "unit_price")
- Enum value mismatches (e.g., status values)
- Required fields missing
