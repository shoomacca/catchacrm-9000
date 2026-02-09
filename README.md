# CatchaCRM 9000

**Enterprise CRM for Trades & Field Service Businesses**

[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Connected-3FCF8E)](https://supabase.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.x-06B6D4)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF)](https://vitejs.dev/)

---

## Overview

CatchaCRM 9000 is a **production-ready, multi-tenant CRM platform** built for trades and field service businesses. Features the **Flash UI** design system with **66 pages** across **8 modules** and **37 entity types**.

**Target Industries:**
- Solar Installation
- HVAC Services
- Electrical Contractors
- Plumbing Services
- Property Maintenance
- Construction
- Landscaping
- Cleaning Services
- Security Systems
- General Trades

---

## Key Stats

| Metric | Value |
|--------|-------|
| Total Pages | 66 |
| Entity Types | 37 |
| UI Components | 23 |
| Industry Blueprints | 10 |
| Supabase Tables | 30+ |

---

## Modules

### 1. Sales Module (8 pages)
- **SalesDashboard** - Pipeline visualization, weighted forecasts, win rates
- **LeadsPage** - Lead management with scoring and qualification workflow
- **DealsPage** - Opportunity tracking, stage progression, probability
- **AccountsPage** - Company records, hierarchy, lifetime value
- **ContactsPage** - Contact management, communication history
- **CampaignsPage** - Marketing campaigns, ROI tracking

### 2. Financial Module (12 pages)
- **FinancialHub** - Revenue dashboard, cash flow, AR/AP aging
- **InvoicesList / InvoiceDetail** - Invoice management with status tracking
- **QuotesList / QuoteDetail** - CPQ interface, approval workflow
- **SubscriptionsList** - Recurring billing management
- **ItemsCatalog** - Products and services catalog
- **BankFeed** - Bank transaction import and reconciliation
- **ExpensesList** - Expense tracking with receipt upload

### 3. Field Service Module (7 pages)
- **FieldServicesDashboard** - Job metrics, crew utilization, completion rates
- **JobsPage** - Job management with 5-step workflow
- **CrewsPage** - Crew configuration, member assignment
- **ZonesPage** - Service territory management
- **EquipmentPage** - Asset tracking, maintenance schedules
- **DispatchMatrix** - Visual job scheduling grid
- **JobMarketplacePage** - Available jobs for crew assignment

### 4. Operations Module (7 pages)
- **OpsDashboard** - Operational KPIs, ticket queues, SLA tracking
- **TacticalQueue** - Priority-based task queue for teams
- **SupportTickets** - Ticket management with SLA timers
- **SupportHub** - Unified support interface
- **TaskManagement** - Task assignment, due dates, dependencies
- **TeamChat** - Internal messaging with channels
- **CommsHub** - Email, SMS, call logging center

### 5. Logistics Module (5 pages)
- **LogisticsDashboard** - Inventory levels, PO status, warehouse metrics
- **WarehousePage** - Warehouse management, stock levels
- **InventoryPage** - Inventory items with reorder points
- **ProcurementPage** - Procurement workflow
- **PurchaseOrdersPage** - PO management with approval

### 6. Marketing Module (6 pages)
- **MarketingDashboard** - Campaign performance, lead sources, ROI
- **ReputationManager** - Review monitoring across platforms
- **ReferralEngine** - Referral program management
- **InboundEngine** - Lead capture forms, chat widgets
- **AIImageSuite** - AI-powered image generation
- **AIWritingTools** - AI content generation

### 7. System Module (8 pages)
- **SettingsView** - 5-tab settings (General, Modules, Users, Integrations, Data)
- **CalendarView** - Full calendar with event management
- **MySchedule** - Personal schedule view
- **BlueprintListPage** - Industry template browser
- **BlueprintDetailPage** - Blueprint configuration
- **Diagnostics** - System health monitoring
- **Reports** - Standard report library
- **ComponentShowcase** - UI component documentation

### 8. Auth Module (3 pages)
- **Login** - Supabase auth login
- **Signup** - New user registration
- **DemoMode** - Demo environment with sample data

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + TypeScript |
| **Build** | Vite 6.x with HMR |
| **Styling** | Tailwind CSS + Flash UI Design System |
| **State** | React Context (CRMContext) |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Hosting** | Vercel |

---

## Quick Start

```bash
# Clone repository
git clone https://github.com/shoomacca/catchacrm-9000.git
cd catchacrm-9000

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials:
# VITE_SUPABASE_URL=your-project-url
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Entity Types (37)

**Core CRM:**
`leads` `deals` `accounts` `contacts` `tasks` `tickets` `campaigns` `users`

**Financial:**
`invoices` `quotes` `products` `services` `subscriptions` `bankTransactions` `expenses`

**Field Service:**
`jobs` `crews` `zones` `equipment`

**Logistics:**
`inventoryItems` `purchaseOrders`

**Communication:**
`calendarEvents` `communications` `conversations` `chatMessages` `documents` `notifications`

**Marketing:**
`reviews` `referralRewards` `inboundForms` `chatWidgets` `calculators`

**Automation:**
`automationWorkflows` `webhooks` `industryTemplates`

**Audit:**
`auditLogs`

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # Flash UI primitives (Button, Card, Input, etc.)
│   ├── RecordModal.tsx  # Universal CRUD modal for all 37 entities
│   ├── EmailComposer.tsx
│   ├── SMSComposer.tsx
│   └── ...
├── context/
│   ├── AuthContext.tsx  # Supabase authentication
│   └── CRMContext.tsx   # CRUD operations for all entities
├── pages/               # 66 page components
│   ├── Financials/      # Invoice, Quote, Bank Feed, etc.
│   ├── Logistics/       # Warehouse, Dispatch, etc.
│   ├── Marketing/       # Reputation, Referral, Inbound
│   ├── Operations/      # Tactical Queue
│   └── ...
├── services/
│   └── supabaseData.ts  # Supabase data layer
├── utils/
│   ├── industryBlueprints.ts  # 10 industry templates
│   ├── seedData.ts      # Demo data generation
│   └── ...
└── types.ts             # 37 entity type definitions
```

---

## Supabase Integration

- **Multi-tenant RLS** - Row Level Security on all tables with `org_id` enforcement
- **30+ Tables** - Complete schema matching all 37 entity types
- **Demo Organization** - Pre-seeded Australian business data (UUID: `00000000-0000-0000-0000-000000000001`)
- **Real-time Subscriptions** - Live data updates
- **Role-based Access** - Admin, Manager, Agent, Technician roles

---

## Industry Blueprints

10 pre-configured templates with:
- Custom entity configurations
- Pre-defined custom fields
- Tailored pipelines and stages
- Industry-specific terminology

1. Solar Installation
2. HVAC Services
3. Electrical Contractors
4. Plumbing Services
5. Property Maintenance
6. Construction
7. Landscaping
8. Cleaning Services
9. Security Systems
10. General Trades

---

## Component Library (Flash UI)

**Primitives:**
- Button (primary, secondary, ghost, danger variants)
- Card (with header, body, footer slots)
- Input (with validation states)
- Select (single and multi-select)
- Textarea (auto-resize)
- Checkbox, Radio
- Panel (collapsible sections)
- IconButton, ButtonGroup

**Business Components:**
- RecordModal - Universal CRUD modal for all 37 entities
- EmailComposer - Rich email composition
- SMSComposer - SMS with templates
- PaymentModal - Payment recording
- SignatureCapture - Digital signature pad
- PhotoUploader - Multi-photo upload with preview
- BulkActionsBar - Bulk operations for list views

---

## Links

- **Linear Project:** [CatchaCRM 9000](https://linear.app/bsbsbs/project/catchacrm-9000-e1b35d51d22f)
- **GitHub:** [shoomacca/catchacrm-9000](https://github.com/shoomacca/catchacrm-9000)

---

## License

Proprietary - All rights reserved.

---

**Built with NEW GENESIS v1.1**
