SECTION 2: FINANCIALS (The "Cashbook" Engine)
MODULE 2.0: FINANCIAL OVERVIEW (The Missing Cockpit)
Goal: The "Pulse" of the business. Real-time cash position without asking the accountant.

1. The "Cash King" Header (KPI Cards)

Cash at Bank: Live balance from the Bank Feed.

Cash In (Mtd): Total paid invoices this month.

Cash Out (Mtd): Total expenses + bills paid this month.

Net Cashflow: Green/Red indicator (In minus Out).

Tax Estimate: "GST Collected" minus "GST Paid" (Rough BAS estimate).

2. The "Money Map" Charts

Cashflow Forecast: Line chart showing projected bank balance based on Expected Invoice Dates vs Bill Due Dates.

Aged Receivables: Bar chart of who owes money (Current, >30 days, >60 days).

Action: Click the red bar to jump to a "Send Chasers" list.

Top Expenses: Pie chart (Materials vs Fuel vs Subbies).

MODULE 2.1: QUOTES (Estimating)
Goal: Profitable pricing with flexible billing rules.

1. Billing Method Choice (Your Requirement)

Feature: When creating a Quote/Job, the User selects the "Billing Logic":

Fixed Price: "I quoted $500, I invoice $500." (Timesheets are just for internal cost tracking).

Do & Charge: "I invoice based on actual Timesheets + Materials used."

Retainer: "Bill $200/month automatically."

Result: This choice dictates how the Invoice is auto-generated later.

2. CSV Import (Items)

Feature: "Update Prices" button.

Action: User uploads a CSV from their supplier (e.g., Reece).

Logic: System matches by SKU. Updates buy_price and sell_price (based on set markup) instantly.

MODULE 2.2: INVOICES & RECEIVABLES
Goal: The "Income" side of the Ledger.

1. The "Single Ledger" Logic

Instead of just "Invoices", we write to a central ledger_entries table.

Status: Paid / Unpaid / Overdue.

Integration: When a Client pays (Stripe or Bank Transfer), it marks the Invoice as PAID and credits the Ledger.

MODULE 2.3: PURCHASES & EXPENSES
Goal: The "Outcome" side of the Ledger.

1. Unified Purchasing

Expenses: Instant receipt snaps (Bunnings).

Bills/POs: Larger supplier invoices (Reece Account) with Due Dates.

Status: Paid / Unpaid.

MODULE 2.4: BANKING & REPORTING (The "Accountant Replacement")
Goal: The 15-Day Consolidation Workflow.

1. The Bank Feed (The Source of Truth)

We pull raw transactions from the bank.

The "Traffic Light" Matcher:

Green: "We found an exact match (Amount + Date) in the Ledger. Click OK."

Amber: "We found similar amounts. Is it this one?"

Red: "No match found. Create an Expense record now?"

2. The "Period Close" Workflow (The Accountant's Dream)

Frequency: User selects (e.g., "Every 15 Days" or "Monthly").

Action: User clicks "Reconcile Period".

System checks all Bank Lines are matched to Ledger Lines.

System "Locks" those records (Cannot be edited).

Output: Generates the "Accountant Pack" (PDF + CSV).

Contains: P&L Summary, Tax Summary (GST), and detailed Transaction Log.

Result: You email this zip file to the accountant. They do the tax return. You don't pay for Xero.

DOCUMENT 2: SECTION 2 (FINANCIALS) - FUNCTIONAL BREAKDOWN
Markdown

# Section 2: FINANCIALS - Functional Specification

## MODULE 2.0: FINANCIAL OVERVIEW (The Cockpit)
**1. Real-Time Cash Position**
* **Data Sources:** Sum of `bank_transactions` (Live Feed) vs Sum of `ledger_entries` (Expected).
* **Visuals:**
    * "Cash at Bank" (Actual).
    * "Runway" (Days until money runs out if no new sales).
    * "Tax Collector" (Estimated GST liability).

**2. Action Center**
* **Overdue Invoices:** List of clients who need chasing.
* **Bills to Pay:** List of Supplier POs due this week.
* **Unreconciled Lines:** Counter of bank transactions waiting to be matched (e.g., "5 Transactions to Review").

---

## MODULE 2.1: QUOTES & ITEMS

**1. Billing Logic Selector**
* **Trigger:** Quote Creation.
* **Field:** `billing_method` (Enum: 'Fixed', 'Time_Materials', 'Retainer').
* **Effect:**
    * If 'Fixed': Invoice = Quote Total.
    * If 'Time_Materials': Invoice = Sum of Job Timesheets + Stock Used.

**2. Item Management (Self-Serve)**
* **Bulk Update:** Admin can upload `supplier_price_list.csv`.
* **Logic:** System parses SKU -> Finds Item -> Updates Cost Price.
    * *Optional:* "Auto-Adjust Retail Price?" (Maintains Margin % automatically).

---

## MODULE 2.4: BANKING & "THE LEDGER"

**1. The "Single Ledger" Architecture**
* **Concept:** One massive table `ledger_entries` that stores EVERYTHING.
* **Structure:**
    * `entry_id`
    * `type` (Income / Expense)
    * `category` (Sales / Fuel / Materials)
    * `amount` (Net + GST)
    * `status` (Paid / Unpaid)
    * `linked_record` (Invoice ID / PO ID / Expense ID)

**2. Bank Feed Reconciliation**
* **Interface:** Split screen. Left = Bank Feed. Right = Ledger.
* **Matching Logic:**
    * User clicks "Match".
    * System links `bank_transaction_id` to `ledger_entry_id`.
    * Status updates to `Reconciled`.

**3. The "Accountant Report" Generator**
* **Trigger:** Manual click "Run Monthly Report".
* **Validation:** Checks that `Unreconciled Transactions == 0` for the period.
* **Output:**
    1.  **Cash Summary:** Opening Balance -> In -> Out -> Closing Balance.
    2.  **Tax Summary:** Total GST Collected vs GST Paid.
    3.  **Category Breakdown:** Totals by GL Code (e.g., $500 on Fuel, $2000 on Materials).