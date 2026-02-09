PROMPT FOR DEV TEAM: CATCHACRM MOCK-FIRST UI AND WIRING AUDIT + COMPLETION PLAN

You are the CatchaCRM Engineering Audit Team. This project is mock-first and must fully function using CRMContext plus localStorage before any database integration is allowed. Your job is to identify UI inconsistency and functional breakpoints across every module, then produce an execution plan that completes every module end-to-end.

Hard rules:

Do not add database, Supabase, or backend integrations.

Do not reduce scope or remove modules.

Do not rewrite the UI design language; standardize it.

Do not change entity schemas unless required to fix missing fields that the UI expects.

Do not accept any tab, modal, or button that renders but cannot create or edit data.

Every module must be complete and usable on mock data before moving forward.

Primary goal:
Deliver a full audit that proves all modules are consistent and fully wired using mock data. Identify what is working, what is partially working, what is dead, and exactly why. Then create a stepwise plan to bring everything to a consistent standard across modules.

Deliverables required:
A. UI Consistency Audit
B. Functional Wiring Audit (mock-first)
C. Relationship and Selector Integrity Audit
D. Missing Fields and Broken Edit Forms Audit
E. Navigation and Routing Audit
F. Module Completion Definition and Checklist
G. Priority Fix Plan (P0/P1/P2) with acceptance criteria

Use this output format exactly and do not change it.

A. UI CONSISTENCY AUDIT

For each primary section in the sidebar:

Sales Domain

Financials

Operations

Marketing

Logistics and Field (if present)

Architecture/Settings

Do the following checks:

A1. Layout Contract Check
For each module page (list view + detail view + dashboard view), verify:

consistent container width and max width rules

consistent spacing and padding scale

consistent typography scale for page title, section headers, table headers

consistent card radius, shadow, border style

consistent empty state styling and messaging

consistent placement of primary action button (Create/New)

consistent header structure (global search, actions, icon placement)
Output:

PASS or FAIL per module

description of inconsistency

exact component or layout wrapper responsible

A2. Density and Zoom Consistency
Verify that modules do not visually feel zoomed in or zoomed out relative to each other.
Specifically compare:

Sales Pulse vs Leads list

Leads detail vs Accounts list

Finance Hub vs Invoices list

Marketing Hub vs Settings
Output:

Identify which pages are off-scale

Identify whether cause is CSS scale, container class differences, or missing shared layout wrapper

A3. Component Pattern Consistency
Verify consistent use of:

table/list row structure

icon + label spacing in sidebar and headers

primary and secondary buttons

modal layout and form grid layout

tab styling and tab content spacing
Output:

list any modules not using the standard patterns

B. FUNCTIONAL WIRING AUDIT (MOCK-FIRST)

Rule: UI must not be a dead shell. Every visible function must work on CRMContext and persist in localStorage.

For every module and sub-feature, verify:

Create works

Edit works (fields hydrate correctly)

Save persists to localStorage

Refresh preserves data

Delete works where available

Related tabs show related data

B1. Module-by-Module Functional Checklist
For each module, output this table:

Module:
List View:

Create button: PASS/FAIL

Row click navigates to detail: PASS/FAIL

Search/filter: PASS/FAIL

Export CSV (if present): PASS/FAIL

Detail View:

Overview tab loads: PASS/FAIL

Details tab loads and shows fields: PASS/FAIL

Edit button opens modal: PASS/FAIL

Modal hydrates with existing data: PASS/FAIL

Save persists and re-renders: PASS/FAIL

Related Tabs (if shown):

Documents tab shows list and can add: PASS/FAIL

Communication tab shows list and can log: PASS/FAIL

Tasks tab shows list and can add: PASS/FAIL

Notes tab shows list and can add: PASS/FAIL

Tickets tab shows list and can add: PASS/FAIL

History tab shows audit events: PASS/FAIL

Do this for AND NOT LINMITED TO:

Leads

Deals

Accounts

Contacts

Campaigns

Tasks

Tickets

Finance Hub

Invoices

Subscriptions

Items Catalog

Calendar/Schedule

Team Chat

AI Creative Suite

Settings/Global Settings

Diagnostics

C. RELATIONSHIP AND SELECTOR INTEGRITY AUDIT

This audit ensures relational tabs are not empty due to selector mismatch.

For each child collection (tasks, communications, documents, tickets, invoices), confirm:

the relationship keys used in the data model

the selector logic used in the UI

the seed generator produces matching values

Output a matrix:

Parent Entity: Lead

Expected relationships: tasks, communications, documents, notes, auditLogs, optional tickets

Relationship keys: relatedToId, relatedToType (or actual keys)

UI selector used: show exact filter logic

Seed field values: show examples
Result: PASS/FAIL and why

Repeat for:

Deal

Account

Contact

Campaign

Hard requirement:
If data exists but selector mismatch hides it, fix the selector logic. Do not fix by faking UI states.

D. MISSING FIELDS AND BROKEN EDIT FORMS AUDIT

Problem statement:
Edits currently show only a few fields and lose data. This indicates modal field mapping or schema mismatch.

For each core entity, list:

All fields UI expects to display in Overview/Details

All fields modal expects to edit

All fields actually present in the record in state/localStorage

Which fields are being dropped during save

Output for each entity:
Entity: Lead
Expected fields:
Actual fields:
Missing fields:
Dropped-on-save fields:
Root cause:

modal form not binding record values

default object overwriting existing fields

incorrect spread order during update

field name mismatch

Repeat for:

Deal

Account

Contact

Invoice

Ticket

Campaign

Acceptance rule:
No save operation may reduce an entity to fewer fields than it started with unless explicitly deleted by the user.

E. NAVIGATION AND ROUTING AUDIT

Verify that navigation matches intent. Specific known failure:
Calendar events redirect to Sales Overview.

For each navigation trigger:

sidebar route

row click route

calendar item click route

conversion flows (lead convert)

cross-links (click contact from account, click invoice from account, click deal from lead)

Output:
Trigger -> Expected destination -> Actual destination -> PASS/FAIL -> Root cause
Root cause categories:

missing entityType/entityId in event payload

wrong route map

fallback redirect

stale reference IDs

F. MODULE COMPLETION DEFINITION AND CHECKLIST

Define Done for a module:
A module is not Done unless:

List view is functional (create, open, search)

Detail view shows meaningful data

Edit form hydrates and saves correctly

Related tabs are populated via correct selectors

Users can add at least one related record from the UI (where tab exists)

Data persists through refresh (localStorage)

UI layout matches global standard layout contract

Output a Done checklist and apply it to every module.

G. PRIORITY FIX PLAN (P0/P1/P2)

P0: Anything that prevents core usage:

cannot edit entities

tabs show empty despite seeded data existing

create actions missing

save wipes data

routing redirects incorrectly

P1: Completeness:

missing add actions in tabs

ticket/chat actions stubbed

finance rollups always zero

P2: UI polish:

spacing, density, typography consistency

minor chart/empty state alignment

Output:

P0 items (each with file/component + fix description + acceptance)

P1 items

P2 items

NON-NEGOTIABLE ACCEPTANCE TESTS

These tests must pass before database integration begins:

Open any Lead:

Details show full identity fields (name, phone, email, company, etc)

Communication tab has data and can add a new interaction

Tasks tab has data and can add a task

Documents tab has data and can add a document

Refresh does not remove anything

Edit any Lead/Deal/Account/Contact:

Modal hydrates with existing values

Save preserves all fields

Record updates visibly on detail and list views

Calendar:

Clicking an event opens the correct entity or correct calendar detail view

Never redirects to Sales Overview unless user clicked Sales Overview

Finance:

Invoice list shows invoices

Account financial rollups are non-zero if invoices/subscriptions exist

Invoice create/edit works and persists

Tickets and Chat:

If UI exposes send/add, it must function and persist

No stub functions allowed in production mock-first state

Final response required:
Return the full audit results with PASS/FAIL, root causes, and the prioritized plan.