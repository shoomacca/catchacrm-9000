# Section 4: EXECUTION (Field & Jobs)
**UX Context:** The "Field" view (Mobile/Tablet) and Job Management.

## MODULE 4.1: THE JOB MARKETPLACE (Formerly 'Tickets')
* **Purpose:** The "Uber-style" allocation engine for self-assignment.
* **The "Job Pool" Logic:**
    * **View:** List or Map view of "Unassigned Work" filtered by User's Zone.
    * **Actions:**
        * **Grab It:** Tech clicks -> Job Status moves to "Scheduled" -> Assigned to Tech.
        * **Dispatch:** Admin drags job to specific Tech -> Tech receives Push Notification.
* **Job Types (Templates):**
    * **Install:** Multi-day block bookings (e.g., Solar Install).
    * **Service:** Short duration slots (e.g., Inverter Check).
    * **Audit:** Inspection slots.

## MODULE 4.2: JOB CARDS (The Field App)
* **Purpose:** Data capture and execution (Online-First).
* **Industry Template Engine (JSONB):**
    * **Concept:** Admin defines field sets per Job Type.
    * **Solar Template:** Renders inputs for "Inverter Serial", "Panel Wattage", "Roof Pitch".
    * **Electrical Template:** Renders inputs for "Circuit Resistance", "Safety Switch Test".
* **Evidence Vault:**
    * **Blocking Logic:** User cannot click "Complete" until mandatory items are present:
        * [ ] Serial Number Scanned.
        * [ ] Before/After Photos uploaded.
        * [ ] SWMS Signed.
* **Sign-off:**
    * **Sign-on-Glass:** Captures client signature blob.
    * **Auto-Cert:** Generates Compliance PDF (e.g., STC Form/CES) upon completion.

## MODULE 4.3: INVENTORY (Project Stock)
* **Purpose:** Just-in-Time Logistics for "Big Ticket" items.
* **Workflow:**
    * **Trigger:** Job Created -> BOM (Bill of Materials) generated.
    * **Action:**
        * **Warehouse:** Picker receives "Pick List" for Job #123.
        * **Supplier:** Admin converts BOM to Purchase Order for direct-to-site delivery.
* **Asset Tracking:**
    * Tracks serial numbers of installed assets (e.g., Inverters) against the Client Record for warranty.