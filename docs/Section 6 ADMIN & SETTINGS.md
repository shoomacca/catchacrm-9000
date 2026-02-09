Section 6: ADMIN & SETTINGS (The Brain)
UX Context: Sidebar Group `SETTINGS` (Restricted to Admin Role).
Goal: A "No-Code" environment to configure the entire OS.

## MODULE 6.1: ORGANIZATION & BRANDING
 Purpose: White-labeling the "FlashUI".
 Identity:
     Org Details: Name, ABN/Tax ID, Support Contact.
     Localization: Timezone (Critical for Scheduler), Currency (AUD), Date Format.
 Theming Engine:
     Brand Colors: Picker for Primary (Buttons/Links) and Secondary colors.
     Assets: Logo Uploads (Light Mode / Dark Mode / Favicon).
     Invoice Template: Custom HTML/CSS editor for PDF outputs.

## MODULE 6.2: USER MANAGEMENT & SECURITY (RBAC)
 Purpose: Granular access control and workforce setup.
 User Accounts:
     Profile: Name, Email, Mobile, Hourly Cost Rate (for Profit analysis).
     Shift Patterns: Define "Working Hours" per user (e.g., Mon-Fri 7am-3pm) to block scheduler slots.
 The Permissions Matrix (10x RBAC):
     Visual Grid: Rows = Modules (e.g., `Sales`, `Financials`, `Jobs`). Columns = Roles.
     Granularity: Checkboxes for:
         [ ] View Global (See everyone's data)
         [ ] View Own (See only my data)
         [ ] Create/Edit
         [ ] Delete (Hard restriction)
         [ ] Export (Prevent data theft)
 Security: 2FA Enforcement, Session Timeout settings.

## MODULE 6.3: INDUSTRY TEMPLATE BUILDER (The Engine)
 Purpose: Customizing the CRM for Solar, Plumbing, HVAC, etc.
 Field Manager (JSONB):
     Target: Select Entity (`Lead`, `Job`, `Asset`, `Contact`).
     Builder: Drag-and-Drop Interface to add:
         Text / Number / Currency
         Date / Time
         Dropdown (Define Options)
         Signature Block
         File Upload
         Barcode Scanner
 Layout Editor: Drag fields into Sections/Tabs to organize the "Details" view.

## MODULE 6.4: AUTOMATION WORKFLOWS
 Purpose: "If This, Then That" Logic Engine.
 Trigger Builder:
     `Record Created` / `Field Updated` / `Date Arrived` / `Form Submitted`.
 Logic Nodes:
     `Delay` (Wait 2 days).
     `Filter` (If Job Value > $10k).
 Action Nodes:
     `Send Email` (Template).
     `Send SMS`.
     `Create Task`.
     `Update Field`.
     `Webhook` (Send data to n8n, zaiper etc).

## MODULE 6.5: INTEGRATIONS HUB
 Purpose: Central API Management.
 Payments (Multi-Gateway):
     Stripe Connect: API Keys for Credit Card processing.
     PayPal: Client ID / Secret for "Pay with PayPal" button on Invoices.
     Surcharge Logic: Option to pass fees (1.75%) to the client.
 Communications:
     Twilio: SID/Token for Voice & SMS.
     SMTP/IMAP: Credentials for Email Sync.
 AI & Maps:
     OpenAI: API Key for Marketing Suite.
     Google Maps: API Key for Address Autocomplete & Distance Matrix.

## MODULE 6.6: DATA GOVERNANCE
 Purpose: Safety and Migration.
 Import Wizard:
     Smart CSV Mapper for Clients, Contacts, and Inventory Items.
     "Undo Last Import" safety button.
 Audit Logs:
     Deep Search: "Who changed Invoice #102?"
     Diff View: Shows `Old Value: $500` -> `New Value: $200`.
 Recycle Bin:
     Soft-delete logic. Restore deleted records within 30 days.
 Export:
     Full SQL/CSV Dump generator (Admin Only).