# MIGRATION BRIEF: CatchaCRM Legacy to NEW GENESIS

**Created:** 2026-01-23
**Milestone:** M02 - Legacy codebase migration
**Purpose:** Document migration inventory, strategy, and sequencing

---

## 1. LEGACY SYSTEM INVENTORY

### 1.1 Frontend Application
**Technology:** Next.js (version TBD)
**Location:** To be identified

**Key Modules to Migrate:**
- [ ] Authentication pages (login, signup, password reset)
- [ ] Dashboard/Home page
- [ ] CRM core modules:
  - Contacts/Leads management
  - Accounts/Companies
  - Opportunities/Pipeline
  - Activities/Timeline
  - Tasks & Calendar
- [ ] Settings & Configuration UI
- [ ] Admin portal
- [ ] User management
- [ ] Billing/Subscription pages
- [ ] Reporting & Analytics UI
- [ ] Search interfaces
- [ ] Communication integrations UI (email, VoIP, SMS)

**Component Library:**
- [ ] Shared UI components
- [ ] Form components
- [ ] Data tables
- [ ] Charts/visualization components
- [ ] Layout components

**Frontend Dependencies:**
- React version
- UI framework (Tailwind/other)
- State management (Redux/Zustand/Context)
- Form libraries
- Chart libraries
- Icon libraries

### 1.2 Backend & API Layer
**Technology:** Next.js API routes / External API (TBD)
**Location:** To be identified

**API Endpoints to Migrate:**
- [ ] `/api/auth/*` - Authentication endpoints
- [ ] `/api/contacts/*` - Contact management
- [ ] `/api/accounts/*` - Account/company management
- [ ] `/api/opportunities/*` - Sales pipeline
- [ ] `/api/activities/*` - Activity logging
- [ ] `/api/users/*` - User management
- [ ] `/api/billing/*` - Subscription/payment handling
- [ ] `/api/search/*` - Search functionality
- [ ] `/api/reports/*` - Analytics & reporting
- [ ] `/api/webhooks/*` - Webhook handlers
- [ ] `/api/integrations/*` - Third-party integrations

**Service Layer:**
- [ ] Business logic modules
- [ ] Data validation rules
- [ ] Email service integration
- [ ] File upload/storage handlers
- [ ] Cron jobs/scheduled tasks

### 1.3 Database Schema
**Technology:** Supabase Postgres (existing)
**Location:** Supabase project (to be documented)

**Core Tables:**
- [ ] `users` - User accounts
- [ ] `organizations` - Companies/tenants
- [ ] `organization_users` - User-org relationships
- [ ] `roles` - Role definitions
- [ ] `permissions` - Permission matrix
- [ ] `contacts` - Contact records
- [ ] `accounts` - Account/company records
- [ ] `opportunities` - Sales opportunities
- [ ] `activities` - Activity timeline
- [ ] `tasks` - Task management
- [ ] `products` - Product catalog
- [ ] `quotes` - Quote/proposal records
- [ ] `invoices` - Billing records
- [ ] `subscriptions` - Subscription tracking
- [ ] `integrations` - Integration configurations
- [ ] `audit_logs` - Audit trail

**Schema Elements to Document:**
- Table structures (columns, types, constraints)
- Indexes and performance optimizations
- Foreign key relationships
- Triggers and stored procedures
- Views and materialized views
- Row Level Security (RLS) policies
- Realtime subscription configurations

### 1.4 n8n Workflows
**Location:** https://ai.bsbsbs.au
**Integration Points:** To be identified

**Workflows to Migrate:**
- [ ] Email sync workflows
- [ ] VoIP call logging
- [ ] SMS/WhatsApp automation
- [ ] Lead enrichment pipelines
- [ ] Notification workflows
- [ ] Data sync automations
- [ ] Scheduled reports
- [ ] Webhook receivers
- [ ] Third-party integrations

**For Each Workflow:**
- Workflow ID and name
- Trigger type (webhook, schedule, manual)
- Node configuration
- Credentials used
- Environment-specific settings
- Webhook URLs (production vs staging)

### 1.5 Environment Configuration
**Source:** Legacy `.env` files

**Environment Variables to Migrate:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `PAYPAL_CLIENT_ID` / `PAYPAL_SECRET`
- [ ] `N8N_WEBHOOK_BASE_URL`
- [ ] Email service credentials (SendGrid, Postmark, etc.)
- [ ] VoIP provider credentials
- [ ] SMS provider credentials
- [ ] OAuth app credentials (Google, Microsoft, etc.)
- [ ] Monitoring/logging service keys
- [ ] Analytics keys

**Configuration Files:**
- [ ] `next.config.js` settings
- [ ] Vercel deployment configuration
- [ ] Supabase migration files
- [ ] Package scripts and build configuration

### 1.6 Documentation & Assets
- [ ] API documentation
- [ ] Database schema documentation
- [ ] User guides
- [ ] Admin documentation
- [ ] Brand assets (logos, icons)
- [ ] Email templates
- [ ] Legal documents (Terms, Privacy Policy)

---

## 2. MIGRATION DEPENDENCIES & SEQUENCING

### Phase 1: Foundation (M02_01 - M02_04)
**Goal:** Import code structure and establish baseline

```
M02_01: Import legacy Next.js app
├─ Copy src/ directory structure
├─ Copy public/ assets
├─ Merge package.json dependencies
├─ Verify TypeScript configuration
└─ Initial build validation (expect failures)

M02_02: Migrate Supabase schema + RLS
├─ Export schema from legacy Supabase project
├─ Review and document table structures
├─ Create migration files
├─ Apply schema to new Supabase project
├─ Migrate RLS policies
└─ Test data access patterns

M02_03: Ingest n8n assets
├─ Export workflows from legacy n8n instance
├─ Document workflow dependencies
├─ Import workflows to new n8n workspace
├─ Update webhook URLs
└─ Test critical workflows

M02_04: Environment migration mapping
├─ Map all legacy env vars to new project
├─ Update .env.example
├─ Configure Vercel environment variables
├─ Document credential locations
└─ Verify configuration completeness
```

### Phase 2: Restoration (M02_05 - M02_08)
**Goal:** Restore functionality in new container

```
M02_05: Auth + session restoration
├─ Verify Supabase Auth configuration
├─ Test login/signup flows
├─ Validate session management
├─ Check protected route guards
└─ Verify RLS enforcement

M02_06: API clients + service wiring
├─ Initialize Supabase client
├─ Configure API route handlers
├─ Test database connectivity
├─ Verify external service connections
└─ Test error handling

M02_07: Build/test baseline validation
├─ Resolve TypeScript errors
├─ Fix import path issues
├─ Address dependency conflicts
├─ Achieve successful build
└─ Basic runtime smoke test

M02_08: Data migration checklist
├─ Plan data export from legacy DB
├─ Create data migration scripts
├─ Test data import process
├─ Validate data integrity
└─ Document rollback procedures
```

**Critical Path:**
1. Schema migration (M02_02) must complete before Auth (M02_05)
2. Environment setup (M02_04) must complete before API wiring (M02_06)
3. n8n workflows (M02_03) can run in parallel with schema work
4. Build validation (M02_07) depends on all previous shards

---

## 3. MIGRATION BLOCKERS & RISK ASSESSMENT

### 3.1 Known Blockers

| ID | Description | Impact | Mitigation | Owner |
|----|-------------|--------|------------|-------|
| MIG-001 | Legacy codebase location not yet provided | High | Request from user immediately | @Manager |
| MIG-002 | Legacy Supabase project credentials unknown | High | Request access credentials | @Tools |
| MIG-003 | n8n instance access details missing | Medium | Document webhook URLs and workflow IDs | @Automator |
| MIG-004 | Data migration volume/complexity unknown | Medium | Analyze DB size and create staged migration plan | @Consultant |
| MIG-005 | Third-party API credentials may need regeneration | Low | Audit and regenerate as needed | @Tools |

### 3.2 Technical Risks

**Breaking Changes:**
- Next.js version upgrades may require code refactoring
- React 18+ may introduce breaking changes in component lifecycle
- Supabase client library updates may change API surface
- Dependency version conflicts may require resolution

**Data Integrity:**
- Foreign key constraints may fail if referential integrity issues exist
- RLS policies may need adjustment for new org hierarchy model
- Enum values or check constraints may conflict with existing data

**Performance:**
- Large data migrations may take extended time
- Index rebuilding may impact performance temporarily
- Realtime subscriptions may need reconfiguration

**Security:**
- API keys and secrets must be rotated during migration
- OAuth redirect URLs must be updated
- Webhook signatures may need reconfiguration

### 3.3 Migration Validation Checklist

**Pre-Migration:**
- [ ] Legacy codebase backed up
- [ ] Database export completed
- [ ] All credentials documented
- [ ] Rollback plan documented

**During Migration:**
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Database schema matches legacy
- [ ] RLS policies enforced correctly
- [ ] API endpoints respond correctly

**Post-Migration:**
- [ ] User authentication works
- [ ] Data queries return expected results
- [ ] n8n workflows trigger successfully
- [ ] Third-party integrations functional
- [ ] Performance benchmarks met
- [ ] Security audit passed

---

## 4. DATA MIGRATION STRATEGY

### 4.1 Schema Migration
**Approach:** SQL migration files + Supabase CLI

```bash
# Export from legacy
supabase db dump --db-url <legacy-url> > legacy_schema.sql

# Review and adapt
# - Add new org_hierarchy tables
# - Update RLS policies for multi-tenancy
# - Add audit_logs enhancements

# Apply to new project
supabase db push
```

### 4.2 Data Migration
**Approach:** Phased migration with validation

**Phase 1: Reference Data**
- Organizations
- Roles & Permissions
- Product Catalog
- Configuration tables

**Phase 2: Core Business Data**
- Users (with proper org assignments)
- Contacts
- Accounts
- Opportunities

**Phase 3: Transactional Data**
- Activities
- Tasks
- Quotes
- Invoices

**Phase 4: Integrations & Logs**
- Integration configurations
- Audit logs (last 90 days)
- File attachments

**Validation Strategy:**
- Row count verification
- Key record spot checks
- Relationship integrity checks
- RLS policy enforcement tests

### 4.3 Rollback Procedures

**If migration fails:**
1. Stop new instance
2. Restore legacy instance to production
3. Document failure point
4. Fix issues in staging
5. Retry migration

**Backup Strategy:**
- Legacy DB snapshot before migration
- Point-in-time recovery enabled
- Critical data exported to CSV
- Automated backups retained for 30 days

---

## 5. SUCCESS CRITERIA

Migration is complete when:
- [ ] All legacy code successfully imported
- [ ] Project builds without errors
- [ ] All database tables migrated with data integrity
- [ ] RLS policies enforced and tested
- [ ] Authentication flow works end-to-end
- [ ] Critical API endpoints functional
- [ ] n8n workflows operational
- [ ] Environment variables configured in Vercel
- [ ] Basic smoke tests pass
- [ ] No data loss or corruption detected
- [ ] Performance within acceptable range

**Sign-off Required From:**
- @Tools - Infrastructure and environment setup
- @Consultant - Schema and data integrity
- @Developer - Code functionality
- @Automator - n8n workflow validation

---

## 6. NEXT STEPS

**Immediate Actions:**
1. User to provide legacy codebase location/repository
2. User to provide Supabase project credentials
3. User to provide n8n instance access details
4. @Tools to audit environment variables needed
5. @Consultant to review and document current schema

**Once Blockers Cleared:**
1. Begin M02_01: Import legacy Next.js app
2. Execute migration shards in sequence
3. Validate at each step
4. Document any deviations from plan

---

## 7. COMMUNICATION PLAN

**Status Updates:**
- Daily progress updates in DECISIONS.md
- Blocker escalation via immediate notification
- Weekly migration status report
- Milestone completion notifications via Telegram

**Stakeholders:**
- @Manager - Overall coordination
- @Consultant - Technical architecture
- @Developer - Implementation
- @Automator - Workflow migration
- @Tools - Infrastructure & deployment
- User - Decision maker & approver

---

**Document Status:** ✅ Complete
**Next Milestone:** M02_01 - Import legacy Next.js app
**Prepared By:** @Tools
**Date:** 2026-01-23

---

## APPENDICES

### Appendix A: Legacy System Access Details
*To be filled in by user*

**GitHub Repository:**
- URL:
- Branch:
- Access token:

**Supabase Project:**
- Project ID:
- Database URL:
- Service role key:
- API URL:

**n8n Instance:**
- URL: https://ai.bsbsbs.au
- Workspace:
- API key:

**Vercel Project:**
- Legacy project URL:
- Team:
- Project ID:

### Appendix B: Contact Directory
*Key people for migration questions*

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Product Owner | TBD | TBD | TBD |
| Tech Lead | TBD | TBD | TBD |
| Database Admin | TBD | TBD | TBD |
| DevOps | TBD | TBD | TBD |

### Appendix C: Reference Documentation
*Links to relevant documentation*

- Legacy system documentation:
- API documentation:
- Database schema docs:
- Deployment runbook:
- Security compliance docs:

---

**END OF MIGRATION BRIEF**
