# DECISIONS LOG

**Project:** CatchaCRM NG v11
**Created:** 2026-01-23 00:00:00
**Last Updated:** 2026-01-23 00:00:00
**Ralph Wiggum Mode:** Inactive

<!-- All dates use ISO 8601 format: YYYY-MM-DD HH:MM:SS -->

---

## Current Status

| Phase        | Agent       | Status      |
| ------------ | ----------- | ----------- |
| Discovery    | @Manager    | Complete       |
| Architecture | @Consultant | Pending/Complete       |
| Development  | @Developer  | Pending/Complete       |
| Automation   | @Automator  | Pending/Complete       |
| Deployment   | @Tools      | Pending/Complete       |

---

## Decision Registry

All architectural and technical decisions are tracked with unique IDs for easy reference.

| ID      | Decision                  | Rationale                | Agent       | Date       | Status  |
| ------- | ------------------------- | ------------------------ | ----------- | ---------- | ------- |
| DEC-001 | Select OpenCode environment | Aligns with chosen execution runtime | @Manager | 2026-01-23 | Active |
| DEC-002 | Classify as TYPE 1 B2B SaaS | CRM multi-tenant model | @Manager | 2026-01-23 | Active |
| DEC-003 | Single Supabase project with optional dedicated enterprise projects | Shared tenancy now, enterprise isolation later | @Manager | 2026-01-23 | Active |
| DEC-004 | Per-seat billing with Stripe + PayPal | Matches licensing model and payment needs | @Manager | 2026-01-23 | Active |
| DEC-005 | Demo account resets every 24 hours | Enables safe trial without free tier | @Manager | 2026-01-23 | Active |
| DEC-006 | Org hierarchy with parent/child companies | Supports reseller and wholesale tenants | @Manager | 2026-01-23 | Active |
| DEC-007 | Keep Vite + React instead of Next.js | Legacy uses Vite. Faster migration (4-6hr vs 2-3 days). RLS provides security. Can migrate to Next.js later if needed. | @Tools | 2026-01-23 | Active |
| DEC-008 | Multi-tenant CRM schema with strict RLS | All tables have org_id (except global tables). RLS enabled on all tables with 35 policies total. Supports org hierarchy and role-based access. | @Consultant | 2026-01-23 | Active |

### Rejected Alternatives

Track what was considered but not chosen (prevents revisiting):

| ID      | What Was Rejected  | Why Rejected                      | Date       |
| ------- | ------------------ | --------------------------------- | ---------- |
| REJ-001 | PostgreSQL + Auth0 | Supabase more integrated          | [Date]     |
| REJ-002 | Custom UI library  | Shadcn faster, well-maintained    | [Date]     |
| REJ-003 | Railway hosting    | Vercel better for Next.js         | [Date]     |

---

## Stack Decisions (@Consultant)

| Decision | Choice   | Rationale | Date   |
| -------- | -------- | --------- | ------ |
| Database | Supabase | [Why]     | [Date] |
| Auth     | [Choice] | [Why]     | [Date] |
| Hosting  | Vercel   | [Why]     | [Date] |

---

## Schema (@Consultant)

**Status:** Complete (M02_02)
**Location:** `supabase/complete_setup_v2.sql`
**Verification:** ✅ PASS (All multi-tenancy checks passed)

### Core Tables

**Multi-Tenant Tables (with org_id):**
- `organizations` - Tenant table with hierarchical support (parent_org_id)
- `organization_users` - User-org membership and roles
- `contacts` - CRM contacts/leads
- `accounts` - CRM accounts/companies
- `opportunities` - CRM deals/opportunities
- `activities` - Timeline activities and tasks
- `products` - Product catalog
- `quotes` - CPQ quotes
- `audit_log` - Audit trail for governance

**Global Tables (no org_id):**
- `subscription_tiers` - Subscription tier definitions

### Multi-Tenancy Features

✅ All tenant-scoped tables have `org_id UUID REFERENCES organizations(id) ON DELETE CASCADE`
✅ RLS enabled on all tables (10/10)
✅ Comprehensive RLS policies (35 policies total)
✅ Org hierarchy support via `parent_org_id`
✅ Role-based access control via `organization_users.role`

### RLS Policy Pattern

All tenant-scoped tables use this RLS pattern:
```sql
-- SELECT: Users can only see data from their org
FOR SELECT USING (
  org_id IN (
    SELECT org_id FROM organization_users
    WHERE user_id = auth.uid()
  )
);

-- INSERT/UPDATE/DELETE: Users can modify data in their org
FOR INSERT/UPDATE/DELETE WITH CHECK/USING (
  org_id IN (
    SELECT org_id FROM organization_users
    WHERE user_id = auth.uid()
  )
);
```

### Performance Indexes

- Indexes on all `org_id` columns
- Indexes on frequently queried fields (email, user_id)
- Foreign key indexes for joins

### Triggers

- `updated_at` auto-update triggers on all tables

---

## API Contracts (@Consultant)

```
POST /api/example
Request: { field: string }
Response: { id: string, created: timestamp }
```

---

## Webhook URLs (@Automator)

**Status:** M02_03 Complete - No existing workflows to migrate

Legacy CatchaCRM does not currently use n8n workflows. The n8n instance at https://ai.bsbsbs.au is available and ready for future integrations.

**Planned Future Workflows:**
- Professional email automation (campaign emails, notifications)
- Chatbot integration (customer support)
- VoIP call logging (optional)
- SMS/WhatsApp notifications (optional)
- General webhook handlers for external services

**Documentation:** See `docs/N8N_INTEGRATION.md` for details.

| Workflow    | URL                                   | Purpose       | Status |
| ----------- | ------------------------------------- | ------------- | ------ |
| (None yet)  | https://ai.bsbsbs.au/webhook/catchacrm/* | Reserved for future use | Planned |

---

## Environment Variables (@Tools)

| Variable                     | Set In  | Status |
| ---------------------------- | ------- | ------ |
| NEXT_PUBLIC_SUPABASE_URL     | Vercel  | Pending/Complete  |
| NEXT_PUBLIC_SUPABASE_ANON_KEY| Vercel  | Pending/Complete  |
| SUPABASE_SERVICE_ROLE_KEY    | Vercel  | Pending/Complete  |

---

## Current Sprint (@Manager)

| Task ID  | Description   | Assignee   | Status         |
| -------- | ------------- | ---------- | -------------- |
| TASK-001 | [Description] | @Developer | In Progress |
| TASK-002 | [Description] | @Automator | Complete    |

---

## Dependencies & Blockers

Track what's blocking progress or what we're waiting on:

| ID      | Type       | Description              | Assigned To | Status      | Resolution Date | Notes |
| ------- | ---------- | ------------------------ | ----------- | ----------- | --------------- | ----- |
| BLK-001 | Blocker    | Waiting on API keys      | @Tools      | Blocked  | -               | Need Stripe key |
| DEP-001 | Dependency | Logo design from client  | @Manager    | Waiting  | -               | Due Friday |
| DEP-002 | Dependency | SSL certificate approval | @Tools      | Complete | 2026-01-09      | Resolved |

### How to use:
- **Blocker**: Stops work completely
- **Dependency**: Needed to proceed but work can continue elsewhere
- Mark as Complete when resolved

---

## Performance Benchmarks

Track performance targets and actual measurements:

| Metric                  | Target      | Current     | Date Measured  | Status | Notes |
| ----------------------- | ----------- | ----------- | -------------- | ------ | ----- |
| Page Load Time (FCP)    | < 1.5s      | TBD         | -              | Pending | First Contentful Paint |
| Page Load Time (LCP)    | < 2.5s      | TBD         | -              | Pending | Largest Contentful Paint |
| API Response Time (p95) | < 200ms     | TBD         | -              | Pending | 95th percentile |
| Database Query Time     | < 50ms      | TBD         | -              | Pending | Average |
| Lighthouse Score        | > 90        | TBD         | -              | Pending | Performance score |
| Time to Interactive     | < 3s        | TBD         | -              | Pending | TTI metric |
| Bundle Size (JS)        | < 200KB     | TBD         | -              | Pending | Initial load |

### How to measure:
```bash
# Lighthouse
npx lighthouse https://your-url.vercel.app --view

# Bundle analysis
npx @next/bundle-analyzer

# API response times
# Check Vercel Analytics or add custom logging
```

---

## Blockers (Legacy - use Dependencies & Blockers above)

- [ ] [Blocker description] - Waiting on [what]

---

## Change Log

| Date   | Agent       | Change                   |
| ------ | ----------- | ------------------------ |
| 2026-01-23 | @Manager    | Initialized CatchaCRM NG v11 discovery artifacts |
| 2026-01-23 | @Consultant | Created multi-tenant CRM schema with RLS (M02_02) |
| 2026-01-24 | @Automator  | Documented n8n integration state - no existing workflows to migrate (M02_03) |
| [Date] | @Consultant | Added users table schema |
| [Date] | @Developer  | Implemented auth flow    |
| [Date] | @Automator  | Built notification workflow |
| [Date] | @Tools      | Deployed to production   |

---

## Project Links

| Resource | URL |
| -------- | --- |
| GitHub   | https://github.com/shoomacca/[repo] |
| Linear   | https://linear.app/bsbsbs/project/[project] |
| Vercel   | https://[project].vercel.app |
| n8n      | https://ai.bsbsbs.au |
