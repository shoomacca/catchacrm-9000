Section 1: SALES (The Revenue Engine)

## MODULE 1.0: SALES OVERVIEW 

1. The "North Star" Metrics (Header)
 Design: "FlashUI" KPI cards with trend indicators (Green/Red arrows vs last month).
 Key Metrics:
     Pipeline Value: Sum of all Open Deals  Weighted Probability.
     Revenue Closed: Sum of 'Won' Deals this month.
     Activity Score: Gamified metric (Calls + Emails + Meetings) to track effort vs results.
     Conversion Rate: Percentage of Leads turning into Deals.

2. The Pipeline Funnel (Visual)
 Visualization: Inverted pyramid chart.
 Stages: Lead -> Qualified -> Quote Sent -> Negotiation -> Won.
 Logic: Shows drop-off rates between stages.
     Insight: "You are losing 60% of leads at the 'Quote Sent' stage. Check your pricing."

3. "Focus Mode" (The Action List)
 Purpose: Removes "Analysis Paralysis" by telling the rep exactly what to do next.
 Logic: An AI-sorted list of the top 5 actions, prioritized by:
    1.  Stalled Deals: Deals > 7 days in "Quote Sent" (Action: Follow up).
    2.  Hot Leads: New leads < 1 hour old (Action: Call).
    3.  Closing Soon: Deals with `close_date` = This Week.

## MODULE 1.1: LEADS (The Data Hub)

1. Data Ingestion & Creation
 Manual Entry: "New Lead" Modal.
     Fields: First Name, Last Name, Mobile, Email, Company, Address.
     Logic: As Mobile/Email is typed, trigger `CheckDuplicate(tenant_id)` instantly.
 API Ingestion: Webhook endpoint accepts JSON payload -> Maps to Lead Fields.
 Custom Fields: Rendered dynamically based on Tenant Config.

2. The Duplicate Guard
 Scope: Strict Multi-Tenant isolation (WHERE `tenant_id` = User's Tenant).
 Trigger: On `Insert` or `Update` of Mobile/Email.
 Action: If match found, block save or display "Potential Duplicate: [Link to Record]".

3. Communication Console (In-App)
 Click-to-Call: Clicking the phone icon opens the Softphone Dialer.
     Action: Initiates Twilio call.
     Post-Call: Auto-saves `Call Log` entry with `duration` and `recording_url` to the History tab.
 SMS Chat: Chat UI embedded in the "Communication" tab.
     Action: Sends SMS via Twilio. Incoming replies appear in real-time (Websockets).
 Email Composer: Rich Text Editor within the "Communication" tab.
     Action: Sends via SMTP/API. Saves copy to History.

## MODULE 1.2: DEALS (Flexible Pipeline)

1. Multi-Pipeline Architecture
 Concept: "Deals" are not just money; they are processes.
 Selector: User selects Pipeline Type (e.g., "Sales", "Appointment Setting", "Renewals").
 Result: The Board re-renders with different Stages defined in Admin Settings.

2. Stage Automation
 Movement Trigger: When a card is dragged from Stage A to Stage B.
 Actions:
     Update `win_probability` %.
     Update `last_activity_at` timestamp.
     Optional: Fire automation (e.g., Send Email Template).

3. The "Won" Conversion
 Trigger: Card dragged to "Won" (or equivalent Success stage).
 Workflow:
    1.  Prompt: "Convert to Client/Job?"
    2.  Create Client: Copies Lead/Deal data to `clients` table.
    3.  Create Job: Copies relevant scope/notes to `jobs` table.
    4.  Preserve History: All notes/files from the Deal are linked to the new Client.

## MODULE 1.3: CLIENTS (Accounts)

1. Hierarchy Management
 Parent/Child: Ability to link a Client record to a "Parent" Client.
     Use Case: "Unit 1" (Child) links to "Strata Corp" (Parent).
     Billing: Invoice can be addressed to the Child OR the Parent.

2. Financial Governance
 Credit Limit Check:
     Logic: `SUM(Unpaid Invoices) + Current Quote > Credit Limit`.
     Result: Hard Block on Job Creation (unless overridden by Admin role).
 PO Enforcement:
     Checkbox `requires_po`. If True, Invoice cannot be changed to "Sent" without a text string in `po_reference`.

3. Billing Configuration
 Default Terms: Dropdown (Net 7, Net 30, COD).
 Default Price Tier: Dropdown (Retail, Wholesale, VIP).
     Action: Auto-selects the correct `unit_price` from the Price Book when creating Quotes/Invoices for this client.

## MODULE 1.4: CONTACTS (The Humans)

1. Multi-Account Linking (The "Property Manager" Logic)
 Problem: In Trades/Real Estate, one person (e.g., Sarah the Property Manager) may manage 50 different sites (Clients).
 Solution: "Many-to-Many" Relationship.
     Primary Account: The agency she works for (e.g., Ray White).
     Linked Accounts: The properties she manages (e.g., 10 Bond St, 50 George St).
 UI: "Linked Assets" tab on the Contact record showing every building they control.

2. Role & Influence Tagging
 Role Tags: Dropdown with visual badges.
     "Billing Contact": Receives the invoices (The Money).
     "Site Contact": The Tenant/Security Guard (Access Only).
     "Decision Maker": The Owner (Signs the Quote).
 Logic:
     When sending an Invoice, system auto-selects the email with the "Billing Contact" tag.
     When creating a Job, system auto-populates the "Site Contact" mobile number for the tech.

3. The "Network Effect" View
 Purpose: See a person's value across the whole database.
 View: "History" tab aggregates data from ALL linked accounts.
     Insight: "Sarah has approved $50k of work across 12 different sites this year. Treat her as a VIP."

4. Data Fields (Specific)
 Standard: First Name, Last Name, Mobile, Landline, Email, Job Title.
 Communication Prefs: Checkboxes (Do Not Call, SMS Only, Email Only).
 Gatekeeper Status: Boolean. (If True, highlights "Must bypass" in red).
 Custom Attributes: JSONB column (e.g., "Coffee Order", "Birthday").