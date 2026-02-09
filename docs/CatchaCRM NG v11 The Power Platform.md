CatchaCRM NG v11: The "Power Platform" Specification
Project Name: CatchaCRM NG v11 Archetype: Vertical Trade OS (Salesforce Power + ServiceMates Execution + "Shadow Ledger" ERP) UX Philosophy: "FlashUI" (Dark Mode, High Density, Speed-First) Core Architecture: Multi-Tenant, "Deep Data" (JSONB), In-App Communications.

1. CORE ARCHITECTURE & STANDARDS
1.1 The "360° Record" Standard
Every major entity (Lead, Deal, Client, Job) MUST utilize a unified Tabbed Layout:

Overview: Key KPIs (Score, Status, Next Step).

Details: Full data form including Custom Fields.

Communication: Integrated Console (SMS/Email/Phone).

Tasks: Linked To-Dos.

Notes: Internal text logs.

Documents: S3-backed file storage (Drag & Drop).

History: Immutable Audit Log (Who changed what/when).

1.2 The Custom Field Engine (Deep Data)
To support "Vertical" templates (Solar vs. Plumbing), all major tables must include a JSONB column custom_attributes.

Function: Allows Admin to define new fields (Text, Number, Date, Select) per Tenant without code changes.

Storage Example: {"inverter_serial": "XYZ-123", "roof_pitch": "20deg", "gate_code": "1234"}.

1.3 Integrated Communications Stack
Voice: Browser-based Softphone (Twilio Voice SDK). Click-to-dial, auto-recording.

SMS: Chat interface (Twilio Programmable Messaging). Real-time Websockets.

Email: 2-Way Sync (Gmail/Outlook API or SendGrid Inbound Parse).

SECTION 1: SALES (The Revenue Engine)
Focus: Deep data capture, multi-pipeline management, and aggressive follow-up.

MODULE 1.0: SALES OVERVIEW (The Cockpit)
1. The "North Star" Metrics (Header)

Pipeline Value: Sum of all Open Deals * Weighted Probability.

Revenue Closed: Sum of 'Won' Deals this month.

Activity Score: Gamified metric (Calls + Emails + Meetings) to track effort vs results.

Conversion Rate: Percentage of Leads turning into Deals. 2. The Pipeline Funnel (Visual)

Visualization: Inverted pyramid chart showing drop-off rates between stages. 3. "Focus Mode" (The Action List)

Logic: AI-sorted list of top 5 actions:

Stalled Deals: Deals > 7 days in "Quote Sent".

Hot Leads: New leads < 1 hour old.

Closing Soon: Deals with close_date = This Week.

MODULE 1.1: LEADS (The Data Hub)
1. Data Ingestion & Creation

Manual Entry: "New Lead" Modal. Triggers instant CheckDuplicate(tenant_id) on Mobile/Email entry.

API Ingestion: Webhook endpoint for website forms/ads.

Custom Fields: Rendered dynamically based on Tenant Config. 2. The Duplicate Guard

Scope: Strict Multi-Tenant isolation.

Action: If match found, block save or display "Potential Duplicate: [Link to Record]". 3. Communication Console (In-App)

Click-to-Call: Opens Softphone Dialer -> Auto-saves Call Log with recording to History.

SMS Chat: Embedded Chat UI.

Email Composer: Rich Text Editor within the tab.

MODULE 1.2: DEALS (Flexible Pipeline)
1. Multi-Pipeline Architecture

Selector: User toggles Pipeline Type (e.g., "Sales", "Appointment Setting", "Renewals").

Result: Board re-renders with stages specific to that pipeline. 2. Stage Automation

Movement Trigger: Dragging card updates win_probability % and last_activity_at.

Stagnation: Visual "Rust" effect on cards untouched for > 7 days. 3. The "Won" Conversion

Workflow:

Prompt: "Convert to Client/Job?"

Create Client: Copies Lead/Deal data to clients table.

Create Job: Copies relevant scope/notes to jobs table.

Preserve History: All notes/files from the Deal are linked to the new Client.

MODULE 1.3: CLIENTS (Accounts)
1. Hierarchy Management

Parent/Child: Link a Client record (Site) to a "Parent" Client (Head Office/Strata). 2. Financial Governance

Credit Limit Check: Logic: SUM(Unpaid Invoices) + Current Quote > Credit Limit. Result: Hard Block on Job Creation.

PO Enforcement: Checkbox requires_po. If True, Invoice cannot be "Sent" without a PO Number. 3. Billing Configuration

Default Terms: Dropdown (Net 7, Net 30, COD).

Default Price Tier: Dropdown (Retail, Wholesale, VIP). Auto-selects price book.

MODULE 1.4: CONTACTS (The Humans)
1. Multi-Account Linking

Many-to-Many: One Contact (Property Manager) linked to multiple Clients (Sites). 2. Role & Influence Tagging

Role Tags: "Billing Contact" (Receives Invoice), "Site Contact" (Access Only), "Decision Maker". 3. Communication Prefs: Checkboxes (Do Not Call, SMS Only, Email Only).

SECTION 2: FINANCIALS (The "Shadow Ledger")
Focus: Killing Xero dependency for day-to-day operations.

MODULE 2.0: FINANCIAL OVERVIEW
1. Real-Time Cash Position

Visuals: "Cash at Bank" (Live Feed), "Runway" (Days left), "Tax Collector" (Est. GST). 2. Action Center

Overdue Invoices: List of clients to chase.

Bills to Pay: Supplier POs due this week.

Unreconciled Lines: Counter of bank transactions waiting to be matched.

MODULE 2.1: QUOTES & ITEMS
1. Billing Logic Selector

Trigger: Quote Creation.

Field: billing_method (Enum: 'Fixed', 'Time_Materials', 'Retainer').

Effect: Dictates if Invoice is generated from Quote Total or Job Timesheets. 2. Item Management

Bundles: One-click add for Kits (e.g., "Solar Install Kit" adds 20 items).

CSV Import: Admin uploads supplier_price_list.csv to bulk update Buy Prices.

MODULE 2.2: INVOICES & RECEIVABLES
1. The "Single Ledger" Logic

Concept: Central table ledger_entries stores ALL Income and Expenses.

Automation:

Retainers: Auto-generate recurring invoices on 1st of month.

Chasers: Auto-email overdue reminders (7/14/30 days).

Payments: Stripe and PayPal buttons on PDF.

MODULE 2.3: PURCHASES & EXPENSES
1. Unified Purchasing

Expenses: Mobile photo snap -> OCR -> Auto-Categorize (Merchant Name Rules).

Bills/POs: Create Purchase Orders for Suppliers. Track "Received" vs "Billed".

MODULE 2.4: BANKING & REPORTING (The Accountant Replacement)
1. Bank Feed Reconciliation

Interface: Split screen (Bank Feed vs Ledger).

Matching Logic: User clicks "Match". System links bank_transaction_id to ledger_entry_id. 2. The "Accountant Pack" Generator

Workflow: User clicks "Run Monthly Report".

Output: PDF/CSV Zip containing P&L Summary, Tax Summary (GST), and Transaction Log.

Purpose: Email to accountant for tax return.

SECTION 3: OPERATIONS (Planning)
Focus: Logistics, Scheduling, and Internal Comms.

MODULE 3.1: OPS OVERVIEW (The Pulse)
Visuals: Efficiency Baseline (Avg hours/job), Execution Velocity (Jobs/week), SLA Breach Risk.

Tactical Task List: Rolling feed of operational blockers (e.g., "Missing SWMS").

MODULE 3.2: SCHEDULE (Dispatch Map)
1. The Hybrid Workflow

Direct Assignment: Drag job to Tech -> Push Notification.

Job Types: Toggle calendars for "Install" (Block days), "Service" (Hourly), "Audit". 2. The Gantt Timeline

Conflict Logic: Alerts if booking overlaps "Leave" or "RDO".

Crew Grouping: Assign job to "Team 1" (3 Users) in one drag.

MODULE 3.3: TEAM CHAT
1. Contextual Channels

Job Channels: Auto-create #job-1234 when job starts. Add assigned crew + Admin. Archive on completion. 2. Broadcasts: Admin "Push to All" feature for safety alerts.

SECTION 4: EXECUTION (Field & Jobs)
Focus: Mobile App, Data Capture, and Work.

MODULE 4.1: JOB MARKETPLACE
1. The "Open Pool" Logic

View: List/Map of "Unassigned Work" in User's Zone.

Action: Tech clicks "Grab It".

Result: Job moves to "Scheduled" (Assigned to Tech).

MODULE 4.2: JOB CARDS (The Field App)
1. Connectivity: Online-First architecture. 2. Industry Template Engine (JSONB)

Concept: Admin defines field sets per Job Type.

Solar Template: Renders inputs for "Inverter Serial", "Panel Wattage".

Electrical Template: Renders inputs for "Resistance Test". 3. Evidence Vault

Blocking Logic: Cannot click "Complete" until: Serial Scanned, Photos Uploaded, SWMS Signed.

MODULE 4.3: FORMS & COMPLIANCE
1. Sign-on-Glass: Captures client signature. 2. Auto-Cert: Generates Compliance PDF (e.g., STC Form/CES) using Job Data.

MODULE 4.4: PROJECT INVENTORY
1. Job-Specific Procurement

Trigger: Job Created -> BOM (Bill of Materials) generated.

Action: Warehouse Pick List OR Supplier PO (Deliver to Site). 2. Asset Tracking:

Logic: Tracks Serial Numbers installed on site. Does not track van consumables (screws).

SECTION 5: MARKETING (Growth)
Focus: Inbound, Outbound, and Automation.

MODULE 5.1: MARKETING HUB
Metrics: CAC (Cost per Acquisition), Campaign ROI, Lead Source Breakdown.

Live Feed: Stream of marketing engagement (Clicks, Replies, Form Fills).

MODULE 5.2: CAMPAIGNS & TEMPLATES
1. Global Template Library

Features: Drag-and-Drop HTML editor for ALL system emails/SMS (Sales, Service, Marketing).

Variables: {{client.name}}, {{job.date}}. 2. Automation Engine

Logic: Smart Segmentation (e.g., System Age > 3 Years).

Sequences: Drip flows (Email -> Wait -> SMS).

Safety: "Set and Forget" enabled. Approval Queue for lists > 500.

MODULE 5.3: INBOUND ENGINE
1. Form Builder

Features: Drag-and-Drop builder for website embed (Get Quote).

Logic: Conditional fields. 2. Chat Widget: Website bubble piping replies to Sales Inbox (Section 1). 3. Calculators: Industry widgets (e.g., Solar Savings).

MODULE 5.4: REPUTATION & REFERRALS
1. Reviews (Gatekeeper)

Workflow: Job Complete -> SMS "Thumbs Up/Down".

Up: Redirect to Google Maps. Down: Redirect to Private Form. 2. Referrals

Logic: Unique link per client. Track conversions -> Trigger "Pay Referral Bonus" task.

MODULE 5.5: AI CREATIVE SUITE
Tech: OpenAI API Integration.

Features: Ad Copy Generator, Review Reply Drafter, Image Generator.

SECTION 6: ADMIN & SETTINGS (The Brain)
Focus: No-Code Configuration and Governance.

MODULE 6.1: ORGANIZATION & BRANDING
Theming: White-label "FlashUI" (Colors, Logo, Invoice HTML).

Localization: Timezone, Currency, Tax ID.

MODULE 6.2: USER MANAGEMENT (10x RBAC)
Permissions Matrix: Granular Grid (View Global / View Own / Edit / Delete / Export) per Module.

User Details: Hourly Cost Rate (for profit analysis), Shift Patterns.

MODULE 6.3: INDUSTRY TEMPLATE BUILDER
Builder: Drag-and-Drop interface to add JSONB fields to Leads/Jobs/Assets.

Layout: Drag fields into Sections/Tabs to organize the "Details" view.

MODULE 6.4: AUTOMATION WORKFLOWS
Trigger Builder: Record Created / Field Updated / Date Arrived.

Nodes: Delay, Filter (Value > X), Action (Email, SMS, Task, Webhook).

MODULE 6.5: INTEGRATIONS HUB
Payments: Stripe Connect & PayPal (Client ID/Secret).

Comms: Twilio (Voice/SMS), SendGrid/Gmail (Email).

AI/Maps: OpenAI API, Google Maps API.

MODULE 6.6: DATA GOVERNANCE
Import Wizard: Smart CSV Mapper with "Undo".

Audit Logs: Deep search of all system changes (Old vs New Value).

Export: Full SQL/CSV Dump.