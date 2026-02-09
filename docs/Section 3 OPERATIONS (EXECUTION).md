Section 3: OPERATIONS (EXECUTION) - Functional Specification

**Goal:** A unified engine for Planning (Office) and Doing (Field).
**UX Context:** "FlashUI" Sidebar item: `OPERATIONS (EXECUTION)`.

## MODULE 3.1: OPS OVERVIEW (The Pulse)
* **Purpose:** Instant visibility on team velocity and bottlenecks.
* **Visuals (KPI Cards):**
    * **Efficiency Baseline:** Avg hours per job vs Target (e.g., "42.0 hrs").
    * **Execution Velocity:** Jobs completed this week (e.g., "12").
    * **SLA Breach Risk:** Counter of jobs approaching deadline (e.g., "5 Jobs > 24hrs").
    * **Overdue Tasks:** Aggregated count of blocking issues.
* **Daily Workflow:**
    * Calendar Widget showing today's volume.
    * **Tactical Task List:** Rolling feed of urgent "To-Dos" (e.g., "Verification missing Job #102").

## MODULE 3.2: THE JOB MARKETPLACE (Formerly 'Tickets')
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

## MODULE 3.3: SCHEDULE (Dispatch Map)
* **Purpose:** Visual Logistics and Crew Management.
* **The Live Map:**
    * **Tech Layer:** Real-time GPS dots of clocked-on staff.
    * **Job Layer:** Pins color-coded by Status (Red=Emergency, Green=Routine).
* **The Gantt Timeline:**
    * Horizontal rows per Tech/Crew.
    * **Conflict Logic:** System alerts if booking overlaps with "Leave" or "RDO".
    * **Crew Grouping:** Ability to assign a job to "Install Team 1" (3 Users) in one drag.

## MODULE 3.4: JOB CARDS (The Field App)
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

## MODULE 3.5: INVENTORY (Project Stock)
* **Purpose:** Just-in-Time Logistics for "Big Ticket" items.
* **Workflow:**
    * **Trigger:** Job Created -> BOM (Bill of Materials) generated.
    * **Action:**
        * **Warehouse:** Picker receives "Pick List" for Job #123.
        * **Supplier:** Admin converts BOM to Purchase Order for direct-to-site delivery.
* **Asset Tracking:**
    * Tracks serial numbers of installed assets (e.g., Inverters) against the Client Record for warranty.
    * *Note:* Does not track "consumables" (screws/tape) in Van Stock.

## MODULE 3.6: TEAM CHAT (Internal)
* **Purpose:** Context-aware communication (WhatsApp Replacement).
* **Job Channels:**
    * System auto-creates a temporary channel `#job-1234` when the job starts.
    * All assigned crew + Admin are added.
    * Channel archives when Job = Complete.
* **Broadcasts:**
    * Admin "Push to All" feature for safety alerts (e.g., "Stop work - Heavy Rain").