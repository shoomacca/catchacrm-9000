# CatchaCRM Complete Mechanical Audit Report

**Date:** 2026-02-12
**Auditor:** Claude Opus 4.6
**Scope:** READ-ONLY audit of all src/*.tsx and src/*.ts files
**Project:** catchacrm_flash_integrated

---

## STEP 1: COMPLETE FILE INVENTORY

**Total files found: 114**

```
src/App.tsx
src/components/BillAccountModal.tsx
src/components/BulkActionsBar.tsx
src/components/DebugPanel.tsx
src/components/EmailComposer.tsx
src/components/GenerateQuoteModal.tsx
src/components/PaymentModal.tsx
src/components/PhotoUploader.tsx
src/components/ProtectedRoute.tsx
src/components/RecordModal.tsx
src/components/ResetDemoButton.tsx
src/components/SignatureCapture.tsx
src/components/SMSComposer.tsx
src/components/ui/Button.tsx
src/components/ui/ButtonGroup.tsx
src/components/ui/Card.tsx
src/components/ui/Checkbox.tsx
src/components/ui/IconButton.tsx
src/components/ui/index.ts
src/components/ui/Input.tsx
src/components/ui/Panel.tsx
src/components/ui/Radio.tsx
src/components/ui/Select.tsx
src/components/ui/Textarea.tsx
src/components/UserModal.tsx
src/context/AuthContext.tsx
src/context/CRMContext.tsx
src/hooks/useSupabaseData.ts
src/index.tsx
src/lib/api-client.ts
src/lib/service-config.ts
src/lib/supabase.ts
src/pages/AccountsPage.tsx
src/pages/AIImageSuite.tsx
src/pages/AIWritingTools.tsx
src/pages/BillingView.tsx
src/pages/BlueprintDetailPage.tsx
src/pages/BlueprintListPage.tsx
src/pages/CalendarView.tsx
src/pages/CampaignsPage.tsx
src/pages/CommsHub.tsx
src/pages/ComponentShowcase.tsx
src/pages/ContactsPage.tsx
src/pages/CrewsPage.tsx
src/pages/CustomEntityListPage.tsx
src/pages/Dashboard.tsx
src/pages/DealsPage.tsx
src/pages/DemoMode.tsx
src/pages/DetailView.tsx
src/pages/Diagnostics.tsx
src/pages/EntityDetail.tsx
src/pages/EquipmentPage.tsx
src/pages/FieldServicesDashboard.tsx
src/pages/Financials/BankFeed.tsx
src/pages/Financials/ExpensesList.tsx
src/pages/Financials/FinancialHub.tsx
src/pages/Financials/InvoiceDetail.tsx
src/pages/Financials/InvoicesList.tsx
src/pages/Financials/ItemsCatalog.tsx
src/pages/Financials/PurchaseLedger.tsx
src/pages/Financials/QuoteDetail.tsx
src/pages/Financials/QuotesList.tsx
src/pages/Financials/SubscriptionsList.tsx
src/pages/FinancialsView.tsx
src/pages/InventoryPage.tsx
src/pages/JobMarketplacePage.tsx
src/pages/JobsPage.tsx
src/pages/LeadsPage.tsx
src/pages/ListView.tsx
src/pages/Login.tsx
src/pages/Logistics/DispatchMatrix.tsx
src/pages/Logistics/JobMarketplace.tsx
src/pages/Logistics/Procurement.tsx
src/pages/Logistics/Warehouse.tsx
src/pages/LogisticsDashboard.tsx
src/pages/Marketing/InboundEngine.tsx
src/pages/Marketing/ReferralEngine.tsx
src/pages/Marketing/ReputationManager.tsx
src/pages/MarketingDashboard.tsx
src/pages/MySchedule.tsx
src/pages/Operations/TacticalQueue.tsx
src/pages/OpsDashboard.tsx
src/pages/ProcurementPage.tsx
src/pages/ProductDetail.tsx
src/pages/PurchaseOrdersPage.tsx
src/pages/RecordDetail.tsx
src/pages/Reports.tsx
src/pages/SalesDashboard.tsx
src/pages/ServiceDetail.tsx
src/pages/SettingsView.tsx
src/pages/Signup.tsx
src/pages/SupportHub.tsx
src/pages/SupportTickets.tsx
src/pages/TaskManagement.tsx
src/pages/TeamChat.tsx
src/pages/TicketManagement.tsx
src/pages/WarehousePage.tsx
src/pages/ZonesPage.tsx
src/services/email.ts
src/services/gemini.ts
src/services/index.ts
src/services/n8n.ts
src/services/paypal.ts
src/services/stripe.ts
src/services/supabaseData.ts
src/types.ts
src/utils/auditEngine.ts
src/utils/csvExport.ts
src/utils/currencies.ts
src/utils/formatters.ts
src/utils/industryBlueprints.ts
src/utils/seedData.ts
src/utils/tableMapping.ts
src/vite-env.d.ts
```

---

## STEP 2: FILE-BY-FILE ANALYSIS

### src/App.tsx
- **PURPOSE:** Main app shell — sidebar navigation, header, routing, branding
- **IMPORTS FROM:** All page components, RecordModal, DebugPanel, ResetDemoButton, CRMContext, AuthContext, ProtectedRoute, Login, Signup, DemoMode, ComponentShowcase
- **IMPORTED BY:** src/index.tsx
- **SUPABASE CALLS:** none (routing only)
- **FORM HANDLING:** none
- **MODAL USED:** RecordModal (always rendered), DebugPanel (toggle)
- **STATUS:** PARTIAL — imports TicketManagement and SupportHub but uses neither in any route. Dead imports.

### src/components/BillAccountModal.tsx
- **PURPOSE:** Modal to create an invoice for an account with line items and recurring billing
- **IMPORTS FROM:** context/CRMContext, types
- **IMPORTED BY:** pages/BillingView.tsx, pages/EntityDetail.tsx
- **SUPABASE CALLS:** none (uses CRMContext.upsertRecord for 'invoices', 'subscriptions')
- **FORM HANDLING:** raw useState
- **MODAL USED:** self (is a modal)
- **STATUS:** WORKING

### src/components/BulkActionsBar.tsx
- **PURPOSE:** Floating bar for bulk delete, status update, and assign operations on selected records
- **IMPORTS FROM:** none (standalone, receives props)
- **IMPORTED BY:** pages/LeadsPage.tsx, pages/DealsPage.tsx, pages/ContactsPage.tsx, pages/AccountsPage.tsx, pages/CampaignsPage.tsx, pages/JobsPage.tsx, pages/CrewsPage.tsx, pages/EquipmentPage.tsx, pages/InventoryPage.tsx, pages/PurchaseOrdersPage.tsx, pages/ZonesPage.tsx
- **SUPABASE CALLS:** none
- **FORM HANDLING:** none
- **MODAL USED:** none
- **STATUS:** WORKING

### src/components/DebugPanel.tsx
- **PURPOSE:** Floating debug panel showing CRM context state, data counts, and settings health
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **SUPABASE CALLS:** none
- **FORM HANDLING:** none
- **MODAL USED:** none
- **STATUS:** WORKING

### src/components/EmailComposer.tsx
- **PURPOSE:** Modal to compose and send emails with templates
- **IMPORTS FROM:** context/CRMContext, types
- **IMPORTED BY:** pages/EntityDetail.tsx
- **SUPABASE CALLS:** none (uses CRMContext.upsertRecord for 'communications')
- **FORM HANDLING:** raw useState
- **MODAL USED:** self (is a modal)
- **STATUS:** WORKING (mock mode — no actual email sending)

### src/components/GenerateQuoteModal.tsx
- **PURPOSE:** Modal to generate a quote with line items from product/service catalog
- **IMPORTS FROM:** context/CRMContext, types
- **IMPORTED BY:** pages/EntityDetail.tsx
- **SUPABASE CALLS:** none (uses CRMContext.upsertRecord for 'quotes')
- **FORM HANDLING:** raw useState
- **MODAL USED:** self (is a modal)
- **STATUS:** WORKING

### src/components/PaymentModal.tsx
- **PURPOSE:** Modal to record payments against invoices with multiple payment methods
- **IMPORTS FROM:** context/CRMContext, types
- **IMPORTED BY:** pages/Financials/InvoiceDetail.tsx
- **SUPABASE CALLS:** none (uses CRMContext.upsertRecord for 'payments')
- **FORM HANDLING:** raw useState
- **MODAL USED:** self (is a modal)
- **STATUS:** WORKING

### src/components/PhotoUploader.tsx
- **PURPOSE:** Photo upload component for job evidence with drag-and-drop
- **IMPORTS FROM:** none (standalone component)
- **IMPORTED BY:** pages/EntityDetail.tsx
- **SUPABASE CALLS:** none
- **FORM HANDLING:** none (parent manages state via callbacks)
- **MODAL USED:** none
- **STATUS:** WORKING

### src/components/ProtectedRoute.tsx
- **PURPOSE:** Route guard — redirects to /login or /demo based on auth state
- **IMPORTS FROM:** context/AuthContext
- **IMPORTED BY:** App.tsx
- **SUPABASE CALLS:** none
- **FORM HANDLING:** none
- **MODAL USED:** none
- **STATUS:** WORKING

### src/components/RecordModal.tsx
- **PURPOSE:** Universal create/edit modal for all CRM entity types
- **IMPORTS FROM:** context/CRMContext, types
- **IMPORTED BY:** App.tsx (always rendered)
- **SUPABASE CALLS:** none (uses CRMContext.upsertRecord)
- **FORM HANDLING:** raw useState
- **MODAL USED:** self (is a modal, driven by CRMContext.modalState)
- **STATUS:** BROKEN — 10 TypeScript errors: all `Parameter 'e' implicitly has an 'any' type` on event handlers at lines 451-455, 491-495

### src/components/ResetDemoButton.tsx
- **PURPOSE:** Button to reset demo data + DataSourceIndicator showing connection status
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **SUPABASE CALLS:** none (uses CRMContext.resetDemoData)
- **FORM HANDLING:** none
- **MODAL USED:** none
- **STATUS:** WORKING

### src/components/SignatureCapture.tsx
- **PURPOSE:** Canvas-based signature capture component for job completions
- **IMPORTS FROM:** none (standalone)
- **IMPORTED BY:** pages/EntityDetail.tsx
- **SUPABASE CALLS:** none
- **FORM HANDLING:** none (canvas + callbacks)
- **MODAL USED:** none
- **STATUS:** WORKING

### src/components/SMSComposer.tsx
- **PURPOSE:** Modal to compose and send SMS messages
- **IMPORTS FROM:** context/CRMContext, types
- **IMPORTED BY:** pages/EntityDetail.tsx
- **SUPABASE CALLS:** none (uses CRMContext.upsertRecord for 'communications')
- **FORM HANDLING:** raw useState
- **MODAL USED:** self (is a modal)
- **STATUS:** WORKING (mock mode — no actual SMS sending)

### src/components/UserModal.tsx
- **PURPOSE:** Modal to create/edit CRM users with role and permission assignment
- **IMPORTS FROM:** context/CRMContext, types
- **IMPORTED BY:** pages/SettingsView.tsx
- **SUPABASE CALLS:** none (uses CRMContext.upsertRecord for 'users')
- **FORM HANDLING:** raw useState
- **MODAL USED:** self (is a modal)
- **STATUS:** WORKING

### src/components/ui/Button.tsx
- **PURPOSE:** Reusable button component with variants (primary, secondary, danger, ghost)
- **IMPORTS FROM:** none
- **IMPORTED BY:** components/ui/index.ts (barrel export) → only ComponentShowcase.tsx
- **SUPABASE CALLS:** none
- **STATUS:** DEAD — only used via ComponentShowcase.tsx, never in production pages

### src/components/ui/ButtonGroup.tsx
- **PURPOSE:** Button group wrapper component
- **IMPORTS FROM:** none
- **IMPORTED BY:** components/ui/index.ts → only ComponentShowcase.tsx
- **STATUS:** DEAD — only used in showcase

### src/components/ui/Card.tsx
- **PURPOSE:** Card component with CardHeader, CardBody, CardFooter sub-components
- **IMPORTS FROM:** none
- **IMPORTED BY:** components/ui/index.ts → only ComponentShowcase.tsx
- **SUPABASE CALLS:** none
- **STATUS:** BROKEN — 1 TSC error: Type incompatibility on `type` property (line 106). Also DEAD (only in showcase).

### src/components/ui/Checkbox.tsx
- **PURPOSE:** Styled checkbox component
- **IMPORTS FROM:** none
- **IMPORTED BY:** components/ui/index.ts → only ComponentShowcase.tsx
- **STATUS:** DEAD — only used in showcase

### src/components/ui/IconButton.tsx
- **PURPOSE:** Icon-only button component
- **IMPORTS FROM:** none
- **IMPORTED BY:** components/ui/index.ts → only ComponentShowcase.tsx
- **STATUS:** DEAD — only used in showcase

### src/components/ui/index.ts
- **PURPOSE:** Barrel export for all UI components
- **IMPORTS FROM:** All ui/*.tsx components
- **IMPORTED BY:** pages/ComponentShowcase.tsx
- **STATUS:** DEAD — only serves showcase page

### src/components/ui/Input.tsx
- **PURPOSE:** Styled text input component
- **IMPORTS FROM:** none
- **IMPORTED BY:** components/ui/index.ts → only ComponentShowcase.tsx
- **STATUS:** DEAD — only used in showcase

### src/components/ui/Panel.tsx
- **PURPOSE:** Panel/section wrapper component
- **IMPORTS FROM:** none
- **IMPORTED BY:** components/ui/index.ts → only ComponentShowcase.tsx
- **STATUS:** DEAD — only used in showcase

### src/components/ui/Radio.tsx
- **PURPOSE:** Radio button group component
- **IMPORTS FROM:** none
- **IMPORTED BY:** components/ui/index.ts → only ComponentShowcase.tsx
- **STATUS:** DEAD — only used in showcase

### src/components/ui/Select.tsx
- **PURPOSE:** Styled select dropdown component
- **IMPORTS FROM:** none
- **IMPORTED BY:** components/ui/index.ts → only ComponentShowcase.tsx
- **STATUS:** DEAD — only used in showcase

### src/components/ui/Textarea.tsx
- **PURPOSE:** Styled textarea component
- **IMPORTS FROM:** none
- **IMPORTED BY:** components/ui/index.ts → only ComponentShowcase.tsx
- **STATUS:** DEAD — only used in showcase

### src/context/AuthContext.tsx
- **PURPOSE:** Authentication context — Supabase auth with mock mode fallback
- **IMPORTS FROM:** lib/supabase
- **IMPORTED BY:** App.tsx, components/ProtectedRoute.tsx
- **SUPABASE CALLS:** supabase.auth.getSession, supabase.auth.signInWithPassword, supabase.auth.signUp, supabase.auth.signOut, supabase.auth.resetPasswordForEmail, supabase.auth.onAuthStateChange
- **FORM HANDLING:** none
- **STATUS:** WORKING (degrades gracefully to mock mode)

### src/context/CRMContext.tsx
- **PURPOSE:** Central CRM state management — holds all entity data, CRUD operations, search, settings
- **IMPORTS FROM:** types, services/supabaseData, utils/seedData, utils/industryBlueprints, utils/auditEngine, utils/tableMapping, hooks/useSupabaseData
- **IMPORTED BY:** Almost every component and page in the app
- **SUPABASE CALLS:** .from('organizations') for settings load
- **FORM HANDLING:** none
- **STATUS:** BROKEN — 1 TSC error: Missing `createdBy` property in AuditLog type at line 1252. Also: `updateRecord` and `addRecord` methods are NOT on the context type (referenced by 4 financial pages but don't exist).

### src/hooks/useSupabaseData.ts
- **PURPOSE:** Hook to detect Supabase connection status and load org settings
- **IMPORTS FROM:** lib/supabase
- **IMPORTED BY:** context/CRMContext.tsx
- **SUPABASE CALLS:** .from('organizations')
- **STATUS:** PARTIAL — 1 TODO: "Get user's org when auth is implemented" (line 86), org ID hardcoded to demo org

### src/index.tsx
- **PURPOSE:** Application entry point — renders App inside BrowserRouter
- **IMPORTS FROM:** App
- **IMPORTED BY:** index.html (entry point)
- **STATUS:** WORKING

### src/lib/api-client.ts
- **PURPOSE:** Generic API client for external service calls
- **IMPORTS FROM:** lib/service-config
- **IMPORTED BY:** services/email.ts, services/gemini.ts, services/n8n.ts, services/paypal.ts, services/stripe.ts
- **STATUS:** WORKING

### src/lib/service-config.ts
- **PURPOSE:** Configuration for external API endpoints (n8n, Gemini, email, payment)
- **IMPORTS FROM:** none
- **IMPORTED BY:** lib/api-client.ts
- **STATUS:** WORKING

### src/lib/supabase.ts
- **PURPOSE:** Supabase client initialization
- **IMPORTS FROM:** none (uses env vars)
- **IMPORTED BY:** context/AuthContext.tsx, hooks/useSupabaseData.ts, services/supabaseData.ts
- **STATUS:** WORKING

### src/pages/AccountsPage.tsx
- **PURPOSE:** Accounts list page with grid/table views, revenue stats, filtering
- **IMPORTS FROM:** context/CRMContext, BulkActionsBar, utils/csvExport
- **IMPORTED BY:** App.tsx
- **SUPABASE CALLS:** none (uses CRMContext)
- **FORM HANDLING:** raw useState (filters)
- **STATUS:** BROKEN — 2 TSC errors: `Property 'amount' does not exist on type 'Invoice'` (lines 37, 63). Should use `invoice.total` instead.

### src/pages/AIImageSuite.tsx
- **PURPOSE:** AI image generation page using Gemini API
- **IMPORTS FROM:** services (gemini)
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (depends on Gemini API key)

### src/pages/AIWritingTools.tsx
- **PURPOSE:** AI copywriting tools page — email, social, ad copy generation
- **IMPORTS FROM:** services (gemini)
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (depends on Gemini API key)

### src/pages/BillingView.tsx
- **PURPOSE:** Account billing overview with payment history and subscription management
- **IMPORTS FROM:** context/CRMContext, BillAccountModal
- **IMPORTED BY:** **NOTHING** — not imported in App.tsx or any other file
- **STATUS:** DEAD — superseded by Financials/SubscriptionsList.tsx

### src/pages/BlueprintDetailPage.tsx
- **PURPOSE:** Detail view for an industry blueprint showing entities, fields, workflows
- **IMPORTS FROM:** context/CRMContext, utils/industryBlueprints
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 8 TSC errors: `.find()` on Record type (should be Object.values), implicit `any` on parameters, `unknown` type on fields

### src/pages/BlueprintListPage.tsx
- **PURPOSE:** List page showing all available industry blueprints
- **IMPORTS FROM:** context/CRMContext, utils/industryBlueprints
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 2 TSC errors: `.find()` on Record type (same issue as detail page)

### src/pages/CalendarView.tsx
- **PURPOSE:** Calendar page with month/week/day views and event creation
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 9 TSC errors: `string | undefined` not assignable to `string` on calendar event fields

### src/pages/CampaignsPage.tsx
- **PURPOSE:** Marketing campaigns list with ROI tracking and status management
- **IMPORTS FROM:** context/CRMContext, BulkActionsBar, utils/csvExport
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 7 TSC errors: Case-sensitive enum mismatch ('"Email"' vs '"email"'), `spent` possibly undefined

### src/pages/CommsHub.tsx
- **PURPOSE:** Unified communications hub — email, calls, SMS with inbox/outbox views
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 8 TSC errors: `status` and `notes` properties don't exist on Communication type

### src/pages/ComponentShowcase.tsx
- **PURPOSE:** Component library showcase page for UI design system
- **IMPORTS FROM:** components/ui (all UI components via barrel)
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (showcase/demo only)

### src/pages/ContactsPage.tsx
- **PURPOSE:** Contacts list page with card/table views, filtering, relationship enrichment
- **IMPORTS FROM:** context/CRMContext, BulkActionsBar, utils/csvExport
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 11 TSC errors: `role`, `contactId`, `interactionCount`, `lastActivityDate` don't exist on Contact/Lead types

### src/pages/CrewsPage.tsx
- **PURPOSE:** Crews/team management page with skills tracking
- **IMPORTS FROM:** context/CRMContext, BulkActionsBar, utils/csvExport
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/CustomEntityListPage.tsx
- **PURPOSE:** Generic list page for industry blueprint custom entities
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/Dashboard.tsx
- **PURPOSE:** Main dashboard with revenue charts, pipeline, recent activity
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** **NOTHING** — not imported in App.tsx or any other file
- **STATUS:** DEAD + BROKEN — Not used anywhere. Also has 11 TSC errors: `items` on Invoice, `amount` on objects, `date`/`contactId`/`summary` on Communication. Root route redirects to /my-schedule.

### src/pages/DealsPage.tsx
- **PURPOSE:** Deals page with Kanban board and table views
- **IMPORTS FROM:** context/CRMContext, BulkActionsBar, utils/csvExport
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 3 TSC errors: `description` doesn't exist on Deal, `color` doesn't exist on deal stage

### src/pages/DemoMode.tsx
- **PURPOSE:** Demo mode landing page that sets demo flag and redirects
- **IMPORTS FROM:** context/AuthContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING

### src/pages/DetailView.tsx
- **PURPOSE:** Generic detail/edit view for CRM records
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** **NOTHING** — not imported anywhere
- **STATUS:** DEAD — superseded by EntityDetail.tsx

### src/pages/Diagnostics.tsx
- **PURPOSE:** System health diagnostics — Supabase connection, API status, data integrity
- **IMPORTS FROM:** context/CRMContext, context/AuthContext, lib/supabase
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/EntityDetail.tsx
- **PURPOSE:** Universal entity detail page — shows record data, related items, communications, actions
- **IMPORTS FROM:** context/CRMContext, EmailComposer, SMSComposer, BillAccountModal, GenerateQuoteModal, SignatureCapture, PhotoUploader
- **IMPORTED BY:** App.tsx (used for all /:id detail routes)
- **STATUS:** BROKEN — 3 TSC errors: `swmsSignedAt` unknown property, `completedAt` unknown property, `email.metadata` possibly undefined

### src/pages/EquipmentPage.tsx
- **PURPOSE:** Equipment/fleet management page
- **IMPORTS FROM:** context/CRMContext, BulkActionsBar, utils/csvExport
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/FieldServicesDashboard.tsx
- **PURPOSE:** Field services dashboard — job stats, crew utilization, map view
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 2 TSC errors: `notes` doesn't exist on Job type

### src/pages/Financials/BankFeed.tsx
- **PURPOSE:** Bank feed page showing bank transactions with reconciliation
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/Financials/ExpensesList.tsx
- **PURPOSE:** Expenses list with category filtering and approval workflow
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 1 TSC error: `updateRecord` does not exist on CRMContextType

### src/pages/Financials/FinancialHub.tsx
- **PURPOSE:** Financial overview dashboard — revenue, expenses, cash flow charts
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 9 TSC errors: Enum case mismatch ("Monthly" vs "monthly"), `items` and `tax` don't exist on Invoice

### src/pages/Financials/InvoiceDetail.tsx
- **PURPOSE:** Invoice detail page with line items, payments, PDF preview
- **IMPORTS FROM:** context/CRMContext, PaymentModal
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 5 TSC errors: `billingAddress` doesn't exist on Account type

### src/pages/Financials/InvoicesList.tsx
- **PURPOSE:** Invoices list with status filtering and batch operations
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 1 TSC error: `updateRecord` does not exist on CRMContextType

### src/pages/Financials/ItemsCatalog.tsx
- **PURPOSE:** Product/service catalog with tabs, pricing, and inventory management
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 1 TSC error: `amount` doesn't exist on stat card type

### src/pages/Financials/PurchaseLedger.tsx
- **PURPOSE:** Purchase ledger showing supplier invoices and purchase orders
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 1 TSC error: `updateRecord` does not exist on CRMContextType

### src/pages/Financials/QuoteDetail.tsx
- **PURPOSE:** Quote detail page with line items and conversion to invoice
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 1 TSC error: Address type not assignable to ReactNode

### src/pages/Financials/QuotesList.tsx
- **PURPOSE:** Quotes list with status filtering and quick actions
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 3 TSC errors: `updateRecord`/`addRecord` don't exist on CRMContextType, `tax` doesn't exist on Quote

### src/pages/Financials/SubscriptionsList.tsx
- **PURPOSE:** Subscriptions/billing management page
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 1 TSC error: "weekly" comparison on billing cycle enum that doesn't include "weekly"

### src/pages/FinancialsView.tsx
- **PURPOSE:** Legacy financial overview page
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** **NOTHING** — not imported anywhere
- **STATUS:** DEAD + BROKEN — 2 TSC errors (enum case mismatch). Superseded by Financials/FinancialHub.tsx

### src/pages/InventoryPage.tsx
- **PURPOSE:** Inventory management with stock levels, categories, reorder alerts
- **IMPORTS FROM:** context/CRMContext, BulkActionsBar, utils/csvExport
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 3 TSC errors: `supplier`, `lastRestocked`, `location` don't exist on InventoryItem

### src/pages/JobMarketplacePage.tsx
- **PURPOSE:** Job marketplace for subcontractor bidding
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/JobsPage.tsx
- **PURPOSE:** Jobs list page with status tracking and crew assignment
- **IMPORTS FROM:** context/CRMContext, BulkActionsBar, utils/csvExport
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 1 TSC error: `j.name` possibly undefined

### src/pages/LeadsPage.tsx
- **PURPOSE:** Leads management with Kanban and table views, lead scoring
- **IMPORTS FROM:** context/CRMContext, BulkActionsBar, utils/csvExport
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 7 TSC errors: `amount` doesn't exist on Lead type (should use `estimatedValue`)

### src/pages/ListView.tsx
- **PURPOSE:** Generic list view for entities (automation workflows, webhooks, templates)
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 2 TSC errors: `name` doesn't exist on PurchaseOrder type

### src/pages/Login.tsx
- **PURPOSE:** Login page with email/password auth and demo mode link
- **IMPORTS FROM:** context/AuthContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/Logistics/DispatchMatrix.tsx
- **PURPOSE:** Dispatch matrix for real-time crew/job scheduling
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/Logistics/JobMarketplace.tsx
- **PURPOSE:** Legacy job marketplace page
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** **NOTHING** — not imported anywhere
- **STATUS:** DEAD — superseded by pages/JobMarketplacePage.tsx

### src/pages/Logistics/Procurement.tsx
- **PURPOSE:** Legacy procurement page
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** **NOTHING** — not imported anywhere
- **STATUS:** DEAD — superseded by pages/ProcurementPage.tsx

### src/pages/Logistics/Warehouse.tsx
- **PURPOSE:** Legacy warehouse management page
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** **NOTHING** — not imported anywhere
- **STATUS:** DEAD — superseded by pages/WarehousePage.tsx

### src/pages/LogisticsDashboard.tsx
- **PURPOSE:** Logistics overview dashboard — fleet, warehouses, supply chain stats
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/Marketing/InboundEngine.tsx
- **PURPOSE:** Inbound marketing tools — forms, chat widgets, calculators
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 4 TSC errors: CalculatorType assignment issues, type narrowing failures

### src/pages/Marketing/ReferralEngine.tsx
- **PURPOSE:** Referral program management with reward tracking
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/Marketing/ReputationManager.tsx
- **PURPOSE:** Review/reputation management with response templates
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/MarketingDashboard.tsx
- **PURPOSE:** Marketing overview — campaign ROI, lead sources, channel performance
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 7 TSC errors: possibly undefined properties (conversionRate, conversations, avgResponseTime, usageCount, leadConversionRate)

### src/pages/MySchedule.tsx
- **PURPOSE:** Personal schedule — upcoming tasks, today's jobs, support tickets
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 4 TSC errors: Type incompatibilities (name possibly undefined), `category`/`assignedTo` don't exist on Ticket

### src/pages/Operations/TacticalQueue.tsx
- **PURPOSE:** Priority-based tactical task queue for operations
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/OpsDashboard.tsx
- **PURPOSE:** Operations overview — ticket stats, SLA compliance, team workload
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/ProcurementPage.tsx
- **PURPOSE:** Procurement management with RFQs and supplier quotes
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/ProductDetail.tsx
- **PURPOSE:** Product detail page with pricing, inventory, sales history
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 1 TSC error: `amount` doesn't exist on pricing dimension type

### src/pages/PurchaseOrdersPage.tsx
- **PURPOSE:** Purchase orders list and management
- **IMPORTS FROM:** context/CRMContext, BulkActionsBar, utils/csvExport
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/RecordDetail.tsx
- **PURPOSE:** Legacy record detail page
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** **NOTHING** — not imported anywhere
- **STATUS:** DEAD — superseded by EntityDetail.tsx

### src/pages/Reports.tsx
- **PURPOSE:** Reports page with revenue, pipeline, activity, and team charts
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 7 TSC errors: "In Progress" not in JobStatus enum, "Meeting" not in Communication type, `amount`/`amounts` on wrong types

### src/pages/SalesDashboard.tsx
- **PURPOSE:** Sales overview — pipeline value, conversion, revenue charts
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 7 TSC errors: `totalAmount` on Quote, `amount` on Subscription, enum case mismatch ("Monthly"/"Yearly")

### src/pages/ServiceDetail.tsx
- **PURPOSE:** Service detail page with pricing tiers and booking history
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/SettingsView.tsx
- **PURPOSE:** Settings page with tabs: General, Modules, Users, Integrations, Automation, Diagnostics
- **IMPORTS FROM:** context/CRMContext, UserModal
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 118 TSC errors: All `Parameter 'v' implicitly has an 'any' type` on settings update handlers. Functional but untidy.

### src/pages/Signup.tsx
- **PURPOSE:** Signup page with email/password registration
- **IMPORTS FROM:** context/AuthContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/SupportHub.tsx
- **PURPOSE:** Support overview dashboard
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx (imported but NOT routed)
- **STATUS:** DEAD — imported in App.tsx but no route renders it

### src/pages/SupportTickets.tsx
- **PURPOSE:** Support ticket list with inbox-style UI and message threads
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 6 TSC errors: `assignedTo` should be `assigneeId` on Ticket type

### src/pages/TaskManagement.tsx
- **PURPOSE:** Task management page (legacy)
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** **NOTHING** — App.tsx has comment "TaskManagement removed - consolidated into MySchedule"
- **STATUS:** DEAD — explicitly deprecated

### src/pages/TeamChat.tsx
- **PURPOSE:** Internal team chat with channels, DMs, and file sharing
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** BROKEN — 5 TSC errors: `title` prop on Lucide icon, implicit `any`, `phone` doesn't exist on User

### src/pages/TicketManagement.tsx
- **PURPOSE:** Ticket management page (legacy)
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx (imported but NOT routed)
- **STATUS:** DEAD — imported in App.tsx but no route renders it

### src/pages/WarehousePage.tsx
- **PURPOSE:** Warehouse management with locations, stock levels, transfers
- **IMPORTS FROM:** context/CRMContext
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/pages/ZonesPage.tsx
- **PURPOSE:** Service zone management with coverage areas
- **IMPORTS FROM:** context/CRMContext, BulkActionsBar, utils/csvExport
- **IMPORTED BY:** App.tsx
- **STATUS:** WORKING (no TSC errors)

### src/services/email.ts
- **PURPOSE:** Email service API client (SendGrid/SMTP integration)
- **IMPORTS FROM:** lib/api-client
- **IMPORTED BY:** services/index.ts
- **STATUS:** PLACEHOLDER — API endpoints configured but actual sending requires backend

### src/services/gemini.ts
- **PURPOSE:** Google Gemini AI API client for image/text generation
- **IMPORTS FROM:** lib/api-client
- **IMPORTED BY:** services/index.ts, pages/AIImageSuite.tsx, pages/AIWritingTools.tsx
- **STATUS:** WORKING (depends on API key)

### src/services/index.ts
- **PURPOSE:** Barrel export for all service modules
- **IMPORTS FROM:** email, gemini, n8n, paypal, stripe
- **IMPORTED BY:** various pages
- **STATUS:** WORKING

### src/services/n8n.ts
- **PURPOSE:** n8n webhook/workflow integration client
- **IMPORTS FROM:** lib/api-client
- **IMPORTED BY:** services/index.ts
- **STATUS:** PLACEHOLDER — requires n8n instance

### src/services/paypal.ts
- **PURPOSE:** PayPal payment processing client
- **IMPORTS FROM:** lib/api-client
- **IMPORTED BY:** services/index.ts
- **STATUS:** PLACEHOLDER — requires PayPal integration

### src/services/stripe.ts
- **PURPOSE:** Stripe payment processing client
- **IMPORTS FROM:** lib/api-client
- **IMPORTED BY:** services/index.ts
- **STATUS:** PLACEHOLDER — requires Stripe integration

### src/services/supabaseData.ts
- **PURPOSE:** Supabase CRUD operations, org setup, demo reset, data loading
- **IMPORTS FROM:** lib/supabase, types
- **IMPORTED BY:** context/CRMContext.tsx
- **SUPABASE CALLS:** Generic .from(table) for all CRUD, plus specific: deals, contacts, jobs, organization_users, organizations, users, accounts
- **STATUS:** WORKING

### src/types.ts
- **PURPOSE:** All TypeScript type/interface definitions for the entire CRM
- **IMPORTS FROM:** none
- **IMPORTED BY:** Almost every file in the project
- **STATUS:** PARTIAL — Types are mostly complete but have mismatches with what pages expect (missing fields like `amount` on Lead, `role` on Contact, `billingAddress` on Account, `notes` on Job/Communication, `assignedTo` vs `assigneeId` on Ticket)

### src/utils/auditEngine.ts
- **PURPOSE:** Audit log engine for tracking entity changes
- **IMPORTS FROM:** types
- **IMPORTED BY:** context/CRMContext.tsx
- **STATUS:** WORKING

### src/utils/csvExport.ts
- **PURPOSE:** CSV export utility for any entity array
- **IMPORTS FROM:** none
- **IMPORTED BY:** Most list pages (AccountsPage, ContactsPage, DealsPage, LeadsPage, etc.)
- **STATUS:** WORKING

### src/utils/currencies.ts
- **PURPOSE:** Currency data and formatting utilities
- **IMPORTS FROM:** none
- **IMPORTED BY:** context/CRMContext.tsx, pages/SettingsView.tsx
- **STATUS:** WORKING

### src/utils/formatters.ts
- **PURPOSE:** Number, date, and currency formatting utilities
- **IMPORTS FROM:** none
- **IMPORTED BY:** Various pages
- **STATUS:** WORKING

### src/utils/industryBlueprints.ts
- **PURPOSE:** Industry blueprint definitions (Solar, HVAC, Legal, etc.) with custom entities
- **IMPORTS FROM:** types
- **IMPORTED BY:** context/CRMContext.tsx, pages/BlueprintListPage.tsx, pages/BlueprintDetailPage.tsx
- **STATUS:** WORKING

### src/utils/seedData.ts
- **PURPOSE:** Demo/seed data generator for all CRM entities
- **IMPORTS FROM:** types
- **IMPORTED BY:** context/CRMContext.tsx
- **STATUS:** BROKEN — 18 TSC errors: Case mismatches ("cold" vs "Cold"), missing Ticket properties (ticketNumber, description, slaDeadline), wrong types ("Medical"/"Weapons" not in InventoryItem category enum), string/number mismatches, "AssignOwner" not in WorkflowActionType

### src/utils/tableMapping.ts
- **PURPOSE:** Maps frontend EntityType (camelCase) to Supabase table names (snake_case)
- **IMPORTS FROM:** types
- **IMPORTED BY:** context/CRMContext.tsx, services/supabaseData.ts
- **STATUS:** WORKING

### src/vite-env.d.ts
- **PURPOSE:** Vite environment type declarations
- **IMPORTS FROM:** none
- **IMPORTED BY:** TypeScript compiler (ambient)
- **STATUS:** WORKING

---

## STEP 3: SUPABASE SCHEMA CROSS-REFERENCE

### Tables Referenced in Code (via TABLE_MAP + supabaseData.ts)

41 tables mapped in code:
```
accounts, automation_workflows, bank_transactions, calculators, calendar_events,
campaigns, chat_messages, chat_widgets, communications, contacts, conversations,
crews, currencies, deals, dispatch_alerts, equipment, expenses, inbound_forms,
industry_templates, inventory_items, invoices, jobs, leads, organization_users,
organizations, payments, products, purchase_orders, quotes, referral_rewards,
reviews, rfqs, roles, services, subscriptions, supplier_quotes, tactical_queue,
tasks, tickets, users, warehouse_locations, warehouses, webhooks, zones
```

### Actual Supabase Tables (120 tables)

```
accounts, api_logs, api_logs_y2026m01, api_rate_limits, approval_processes,
approval_requests, approval_steps, assignment_rule_entries, assignment_rules,
audit_log, audit_logs, auto_response_entries, auto_response_rules,
automation_workflows, bank_transactions, business_hours, calculators,
calendar_events, campaigns, chat_messages, chat_widgets, communications,
company_settings, contacts, conversations, credit_notes, crews, crm_settings,
currencies, custom_fields, custom_objects, data_retention_policies,
dated_exchange_rates, deals, dependent_picklists, dispatch_alerts, documents,
duplicate_rules, email_accounts, email_letterheads, email_sequence_enrollments,
email_sequence_steps, email_sequences, email_settings, email_templates,
email_threads, email_tracking_settings, emails, equipment, escalation_actions,
escalation_rules, expenses, export_jobs, field_history, field_history_tracking,
field_permissions, fiscal_year_settings, holidays, import_jobs, inbound_forms,
industry_templates, inventory_items, invoices, ip_restrictions, jobs,
kb_articles, kb_categories, leads, line_items, login_history,
mass_operation_jobs, matching_rules, notifications, object_permissions,
organization_users, organization_wide_addresses, organizations,
page_layout_assignments, page_layouts, payments, permission_sets, products,
public_group_members, public_groups, purchase_orders, queue_members, queues,
quote_line_items, quotes, record_type_assignments, record_types,
referral_rewards, reviews, rfqs, roles, scheduled_action_queue,
scheduled_actions, services, session_settings, setup_audit_trail, sharing_rules,
sms_messages, sms_templates, subscription_items, subscriptions, supplier_quotes,
tactical_queue, tasks, team_members, teams, territories, territory_assignments,
ticket_messages, tickets, user_permission_sets, users, validation_rules,
warehouse_locations, warehouses, webhook_configs, webhook_logs, webhooks,
workflow_actions, workflow_rules, zones
```

### Comparison

| Status | Tables |
|--------|--------|
| **OK — in code AND Supabase** | accounts, automation_workflows, bank_transactions, calculators, calendar_events, campaigns, chat_messages, chat_widgets, communications, contacts, conversations, crews, currencies, deals, dispatch_alerts, equipment, expenses, inbound_forms, industry_templates, inventory_items, invoices, jobs, leads, organization_users, organizations, payments, products, purchase_orders, quotes, referral_rewards, reviews, rfqs, roles, services, subscriptions, supplier_quotes, tactical_queue, tasks, tickets, users, warehouse_locations, warehouses, webhooks, zones |
| **MISMATCH — code uses `audit_log` but Supabase has both `audit_log` AND `audit_logs`** | audit_log / audit_logs |
| **UNUSED in code — exist only in Supabase** | api_logs, api_rate_limits, approval_processes, approval_requests, approval_steps, assignment_rule_entries, assignment_rules, auto_response_entries, auto_response_rules, business_hours, company_settings, credit_notes, crm_settings, custom_fields, custom_objects, data_retention_policies, dated_exchange_rates, dependent_picklists, documents (table exists but code uses local state), duplicate_rules, email_accounts, email_letterheads, email_sequence_enrollments, email_sequence_steps, email_sequences, email_settings, email_templates, email_threads, email_tracking_settings, emails, escalation_actions, escalation_rules, export_jobs, field_history, field_history_tracking, field_permissions, fiscal_year_settings, holidays, import_jobs, ip_restrictions, kb_articles, kb_categories, line_items, login_history, mass_operation_jobs, matching_rules, notifications (in code via local state, not fetched from this table properly), object_permissions, organization_wide_addresses, page_layout_assignments, page_layouts, permission_sets, public_group_members, public_groups, queue_members, queues, quote_line_items, record_type_assignments, record_types, scheduled_action_queue, scheduled_actions, session_settings, setup_audit_trail, sharing_rules, sms_messages, sms_templates, subscription_items, team_members, teams, territories, territory_assignments, ticket_messages, user_permission_sets, validation_rules, webhook_configs, webhook_logs, workflow_actions, workflow_rules |

**Note:** Many "unused" Supabase tables are admin/governance tables that would be used by backend features not yet built in the frontend (email sequences, approval workflows, field-level security, etc.). These are NOT broken — they're future functionality.

---

## STEP 4: ROUTE & NAVIGATION AUDIT

### All Routes (from App.tsx)

| Route | Component | In Sidebar? | Status |
|-------|-----------|-------------|--------|
| `/` | Redirect → `/my-schedule` | N/A | OK |
| `/my-schedule` | MySchedule | Yes | BROKEN (4 TSC errors) |
| `/sales` | SalesDashboard | Yes | BROKEN (7 TSC errors) |
| `/ops` | OpsDashboard | Yes | OK |
| `/marketing` | MarketingDashboard | Yes | BROKEN (7 TSC errors) |
| `/field-services` | FieldServicesDashboard | Yes | BROKEN (2 TSC errors) |
| `/logistics-hub` | LogisticsDashboard | No (dead route) | OK |
| `/ai-suite` | AIImageSuite | No (dead route) | OK |
| `/financials` | FinancialHub | Yes | BROKEN (9 TSC errors) |
| `/financials/ledger/income` | InvoicesList | Yes | BROKEN (1 error) |
| `/financials/ledger/income/:id` | InvoiceDetail | Via list | BROKEN (5 errors) |
| `/financials/ledger/quotes` | QuotesList | Yes | BROKEN (3 errors) |
| `/financials/ledger/quotes/:id` | QuoteDetail | Via list | BROKEN (1 error) |
| `/financials/ledger/purchases` | PurchaseLedger | Yes | BROKEN (1 error) |
| `/financials/ledger/expenses` | ExpensesList | Yes | BROKEN (1 error) |
| `/financials/ledger/bank` | BankFeed | Yes | OK |
| `/financials/billing` | SubscriptionsList | Yes | BROKEN (1 error) |
| `/financials/catalog` | ItemsCatalog | Yes | BROKEN (1 error) |
| `/financials/catalog/products/:id` | ProductDetail | Via catalog | BROKEN (1 error) |
| `/financials/catalog/services/:id` | ServiceDetail | Via catalog | OK |
| `/ops/tactical-queue` | TacticalQueue | Yes | OK |
| `/ops/support-inbox` | SupportTickets | Yes | BROKEN (6 errors) |
| `/ops/comms-hub` | CommsHub | Yes | BROKEN (8 errors) |
| `/ops/reports` | Reports | Yes | BROKEN (7 errors) |
| `/chat` | TeamChat | Yes | BROKEN (5 errors) |
| `/logistics/warehouse` | WarehousePage | Yes | OK |
| `/logistics/procurement` | ProcurementPage | Yes | OK |
| `/logistics/job-marketplace` | JobMarketplacePage | Yes | OK |
| `/logistics/dispatch-matrix` | DispatchMatrix | Yes | OK |
| `/marketing/reputation` | ReputationManager | Yes | OK |
| `/marketing/referral-engine` | ReferralEngine | Yes | OK |
| `/marketing/inbound-engine` | InboundEngine | Yes | BROKEN (4 errors) |
| `/marketing/ai-tools` | AIWritingTools | Yes | OK |
| `/leads` | LeadsPage | Yes | BROKEN (7 errors) |
| `/deals` | DealsPage | Yes | BROKEN (3 errors) |
| `/accounts` | AccountsPage | Yes | BROKEN (2 errors) |
| `/contacts` | ContactsPage | Yes | BROKEN (11 errors) |
| `/campaigns` | CampaignsPage | Yes | BROKEN (7 errors) |
| `/jobs` | JobsPage | Yes | BROKEN (1 error) |
| `/crews` | CrewsPage | Yes | OK |
| `/zones` | ZonesPage | Yes | OK |
| `/equipment` | EquipmentPage | Yes | OK |
| `/inventory` | InventoryPage | Yes | BROKEN (3 errors) |
| `/purchase-orders` | PurchaseOrdersPage | Yes | OK |
| `/calendar` | CalendarView | Yes | BROKEN (9 errors) |
| `/settings` | SettingsView | Yes | BROKEN (118 errors) |
| `/settings/modules` | SettingsView(MODULES) | Yes | BROKEN (same) |
| `/settings/users` | SettingsView(USERS_ACCESS) | Yes | BROKEN (same) |
| `/settings/integrations` | SettingsView(INTEGRATIONS) | Yes | BROKEN (same) |
| `/settings/automation` | SettingsView(AUTOMATION) | Yes | BROKEN (same) |
| `/settings/diagnostics` | SettingsView(DIAGNOSTICS) | Via header | BROKEN (same) |
| `/blueprints` | BlueprintListPage | Yes | BROKEN (2 errors) |
| `/blueprints/:blueprintId` | BlueprintDetailPage | Via list | BROKEN (8 errors) |
| `/diagnostics` | Diagnostics | Yes | OK |
| `/showcase` | ComponentShowcase | No | OK (dev only) |
| `/login` | Login | N/A (public) | OK |
| `/signup` | Signup | N/A (public) | OK |
| `/demo` | DemoMode | N/A (public) | OK |

**Routes NOT accessible from sidebar:**
- `/logistics-hub` — LogisticsDashboard has no sidebar link
- `/ai-suite` — AIImageSuite has no sidebar link

**Sidebar links with NO issues:** All sidebar links point to valid routes.

---

## STEP 5: BUTTON & HANDLER AUDIT

### Empty/Placeholder onClick Handlers

All onClick handlers examined appear to call real functions (navigate, state setters, or handler functions). **No empty `() => {}` or `console.log`-only onClick handlers found on buttons.**

The only "placeholder" patterns are:
- NavContext default: `toggleGroup: () => {}` and `closeAllGroups: () => {}` — these are React context defaults, overridden immediately by the Provider. **Not a bug.**

### console.log Statements (Non-button)

Found in:
- `src/context/AuthContext.tsx` — 5 occurrences (mock mode logging, intentional)
- `src/context/CRMContext.tsx` — 4 occurrences (Supabase connection logging, intentional)

### TODO/FIXME/HACK/XXX Findings

| File | Line | Content |
|------|------|---------|
| `src/hooks/useSupabaseData.ts` | 86 | `setOrgId(demoMode ? DEMO_ORG_ID : DEMO_ORG_ID); // TODO: Get user's org when auth is implemented` |

**Only 1 TODO found. No FIXME, HACK, or XXX markers.**

---

## STEP 6: TYPESCRIPT HEALTH CHECK

**Total: ~210 unique errors across 327 output lines in 34 files**

### Errors by File (sorted by count)

| File | Errors | Category |
|------|--------|----------|
| SettingsView.tsx | 118 | Implicit `any` on all settings update handlers |
| seedData.ts | 18 | Type mismatches with entity interfaces |
| Dashboard.tsx | 11 | Missing properties (DEAD file) |
| ContactsPage.tsx | 11 | Missing `role`, `contactId`, `lastActivityDate`, `interactionCount` on types |
| RecordModal.tsx | 10 | Implicit `any` on event handlers |
| FinancialHub.tsx | 9 | Enum case mismatch, missing `items`/`tax` on Invoice |
| CalendarView.tsx | 9 | `string | undefined` not assignable to `string` |
| CommsHub.tsx | 8 | Missing `status`/`notes` on Communication |
| BlueprintDetailPage.tsx | 8 | `.find()` on Record type, implicit `any` |
| SalesDashboard.tsx | 7 | Missing properties, enum case mismatch |
| Reports.tsx | 7 | Missing `amount`, enum mismatch |
| MarketingDashboard.tsx | 7 | Possibly undefined properties |
| LeadsPage.tsx | 7 | `amount` doesn't exist on Lead |
| CampaignsPage.tsx | 7 | Enum case mismatch, possibly undefined |
| SupportTickets.tsx | 6 | `assignedTo` should be `assigneeId` |
| TeamChat.tsx | 5 | `title` prop, implicit `any`, missing `phone` |
| InvoiceDetail.tsx | 5 | Missing `billingAddress` on Account |
| MySchedule.tsx | 4 | Type incompatibilities, wrong property names |
| InboundEngine.tsx | 4 | Type narrowing failures |
| InventoryPage.tsx | 3 | Missing `supplier`, `lastRestocked`, `location` |
| QuotesList.tsx | 3 | Missing context methods, missing `tax` |
| EntityDetail.tsx | 3 | Unknown properties in type |
| DealsPage.tsx | 3 | Missing `description`, `color` |
| ListView.tsx | 2 | `name` doesn't exist on PurchaseOrder |
| FinancialsView.tsx | 2 | Enum case mismatch (DEAD file) |
| FieldServicesDashboard.tsx | 2 | Missing `notes` on Job |
| BlueprintListPage.tsx | 2 | `.find()` on Record type |
| AccountsPage.tsx | 2 | `amount` doesn't exist on Invoice |
| Card.tsx | 1 | Type incompatibility |
| CRMContext.tsx | 1 | Missing `createdBy` in AuditLog |
| ExpensesList.tsx | 1 | Missing `updateRecord` on context |
| InvoicesList.tsx | 1 | Missing `updateRecord` on context |
| PurchaseLedger.tsx | 1 | Missing `updateRecord` on context |
| SubscriptionsList.tsx | 1 | Enum mismatch |
| ProductDetail.tsx | 1 | Missing `amount` |
| JobsPage.tsx | 1 | Possibly undefined |
| QuoteDetail.tsx | 1 | Address as ReactNode |
| ItemsCatalog.tsx | 1 | Missing `amount` |

### Root Causes (Systemic)

1. **Type definition gaps (types.ts):** Many fields used in pages don't exist in the type definitions — `amount` on Lead/Invoice, `role`/`lastActivityDate` on Contact, `billingAddress` on Account, `notes` on Job/Communication, `description` on Deal, `color` on DealStage
2. **Enum case mismatches:** Code uses "Monthly"/"Yearly" but types define "monthly"/"yearly"; code uses "email"/"social" but types define "Email"/"Social"
3. **Missing CRMContext methods:** 4 financial pages reference `updateRecord` and `addRecord` which don't exist on CRMContextType (should use `upsertRecord`)
4. **Implicit `any` epidemic:** SettingsView.tsx and RecordModal.tsx have ~130 combined implicit `any` errors from untyped event/value parameters
5. **Seed data drift:** seedData.ts types have diverged from types.ts (missing required fields, wrong enum values)

---

## STEP 8: CHECKSUM VERIFICATION

**Audit covers 114 of 114 files. Missing: none.**

Every file from Step 1 has an entry in Step 2.

---

## SUMMARY OF FINDINGS

### By Status

| Status | Count | Files |
|--------|-------|-------|
| WORKING | 48 | Core infra, many pages, services, utils |
| BROKEN | 34 | Pages with TSC errors (type mismatches) |
| DEAD | 14 | Unused files (superseded or unreferenced) |
| PARTIAL | 2 | App.tsx (dead imports), useSupabaseData (TODO) |
| PLACEHOLDER | 4 | email.ts, n8n.ts, paypal.ts, stripe.ts |

### Dead Files (14 — candidates for deletion)

1. `src/pages/Dashboard.tsx` — superseded by SalesDashboard + MySchedule
2. `src/pages/BillingView.tsx` — superseded by Financials/SubscriptionsList
3. `src/pages/DetailView.tsx` — superseded by EntityDetail
4. `src/pages/RecordDetail.tsx` — superseded by EntityDetail
5. `src/pages/TaskManagement.tsx` — consolidated into MySchedule
6. `src/pages/FinancialsView.tsx` — superseded by Financials/FinancialHub
7. `src/pages/Logistics/Warehouse.tsx` — superseded by WarehousePage
8. `src/pages/Logistics/Procurement.tsx` — superseded by ProcurementPage
9. `src/pages/Logistics/JobMarketplace.tsx` — superseded by JobMarketplacePage
10. `src/pages/SupportHub.tsx` — imported but never routed
11. `src/pages/TicketManagement.tsx` — imported but never routed
12. `src/components/ui/*` (10 files) — only used by ComponentShowcase, never in production

### Critical Type Mismatches

The root problem is **types.ts is out of sync with what pages expect**. This creates a cascade of ~210 TSC errors.
