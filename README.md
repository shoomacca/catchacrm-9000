# CatchaCRM NG v11

**Enterprise-grade, multi-tenant CRM built with NEW GENESIS v1.1**

> 🚀 **Status:** In Development - Milestone M01 Complete
>
> 📅 **Started:** 2026-01-23
> 🏗️ **Architecture:** B2B SaaS (TYPE 1)

---

## Overview

CatchaCRM NG v11 is a complete migration of the legacy CatchaCRM application into the NEW GENESIS container, adding automation-ready foundations, multi-tenant hierarchy, and per-seat billing capabilities.

**Target Users:**
- B2B sales organizations
- Agencies and resellers
- Enterprise CRM operators

**Key Features:**
- Multi-tenant with strict RLS isolation
- Per-seat, per-company licensing (Stripe + PayPal)
- Hierarchical organization structure (parent/child companies)
- n8n-powered automation workflows
- Demo account with 24-hour data reset

---

## Quick Start

### Prerequisites

- Node.js 18+ (LTS)
- npm or yarn
- Git
- Supabase account
- Vercel account (for deployment)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shoomacca/catchacrm-ng-v11.git
   cd catchacrm-ng-v11
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your development credentials
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Open http://localhost:3000 in your browser.

### Environment Configuration

See [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) for detailed setup instructions including:
- Obtaining Supabase credentials
- Configuring Stripe test keys
- Setting up n8n integration
- Troubleshooting common issues

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | React framework with server components |
| **Backend** | Supabase + n8n | Database, auth, and automation |
| **Database** | Supabase Postgres | RLS-based multi-tenancy |
| **Auth** | Supabase Auth | User authentication with optional SSO |
| **Billing** | Stripe + PayPal | Per-seat licensing |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Hosting** | Vercel | Automatic deployments |
| **Automation** | n8n | Workflow automation |

---

## Project Structure

```
catchacrm_ng_v11/
├── .antigravity/         # NEW GENESIS system files
│   ├── context/          # Global project context (BRIEF.md, STACK.md)
│   ├── shards/           # Atomic execution contexts
│   ├── status/           # Progress tracking
│   └── [system files]
├── docs/                 # Project documentation
│   ├── ENVIRONMENT_SETUP.md
│   ├── MIGRATION_BRIEF.md
│   └── REPOSITORY_CONVENTIONS.md
├── public/               # Static assets
├── scripts/              # Automation scripts
│   ├── indiana.js        # Genesis initialization
│   ├── indiana_milestone.js
│   └── indiana_merge.js
├── src/                  # Application source code
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── lib/              # Utility libraries
│   ├── styles/           # Global styles
│   └── types/            # TypeScript types
├── .env.example          # Environment variables template
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

---

## Development Workflow

### Branch Strategy

- **main** - Production-ready code (protected, requires approval)
- **dev** - Active development (all work happens here)

### Commit Convention

Follow Conventional Commits:

```bash
feat(M01_02): Add user authentication
fix(M02_05): Resolve session timeout issue
docs(M01_03): Update environment setup guide
```

### Shard-Based Execution

Work is broken into atomic **shards** (execution units):

1. Orchestrator selects next shard
2. Builder agent executes shard
3. Creates atomic commit
4. Marks shard complete

See [docs/REPOSITORY_CONVENTIONS.md](docs/REPOSITORY_CONVENTIONS.md) for full conventions.

---

## Milestones

- [x] **M01:** Genesis foundation + repo container ✅
- [ ] **M02:** Legacy codebase migration 🚧
- [ ] **M03:** Multi-tenant hierarchy + isolation
- [ ] **M04:** Core CRM module parity
- [ ] **M05:** Automation + comms integrations
- [ ] **M06:** Data intelligence + search
- [ ] **M07:** Billing + licensing
- [ ] **M08:** Analytics + governance
- [ ] **M09:** Launch readiness

---

## Scripts

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

### NEW GENESIS Automation

```bash
node scripts/indiana.js                    # Initialize project (one-time)
node scripts/indiana_milestone.js          # Complete milestone
node scripts/indiana_merge.js              # Merge dev to main (production)
node scripts/ng-status.js                  # Check shard progress
node scripts/ng-export.js                  # Generate project reports
```

---

## Documentation

- **[Environment Setup](docs/ENVIRONMENT_SETUP.md)** - Local development and deployment configuration
- **[Migration Brief](docs/MIGRATION_BRIEF.md)** - Legacy codebase migration strategy
- **[Repository Conventions](docs/REPOSITORY_CONVENTIONS.md)** - Coding standards and git workflow
- **[NEW GENESIS System Docs](.antigravity/docs/)** - Internal system documentation

---

## Key Features

### Multi-Tenant Architecture

- **Tenant Isolation:** Strict RLS enforcement at database level
- **Org Hierarchy:** Parent/child company relationships
- **Reseller Support:** Wholesale tenant model for agencies
- **Audit Logging:** Complete audit trail for admin actions

### Billing & Licensing

- **Per-Seat Model:** Charge per user, per company
- **Dual Payment:** Stripe (primary) + PayPal (secondary)
- **Demo Account:** Auto-resets every 24 hours with mock data
- **License Enforcement:** Real-time seat usage tracking

### Automation

- **n8n Integration:** Embedded workflow automation
- **Email Sync:** Automatic email logging and tracking
- **VoIP Integration:** Call logging and recording
- **SMS/WhatsApp:** Multi-channel communication
- **Lead Enrichment:** Automated data enrichment pipelines

---

## Security

- ✅ Row Level Security (RLS) on all tenant tables
- ✅ No cross-tenant data leakage
- ✅ Environment variables for all secrets
- ✅ HTTPS enforced everywhere
- ✅ OAuth 2.0 support (future)
- ✅ GDPR/CCPA compliance ready

See [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) for security best practices.

---

## Deployment

### Automatic Deployments (Vercel)

- **Push to `dev`** → Preview deployment
- **Merge to `main`** → Production deployment

### Manual Deployment

```bash
# Only after @Overseer approval
node scripts/indiana_merge.js
```

This will:
1. Merge `dev` → `main`
2. Push to GitHub
3. Trigger Vercel production deployment
4. Send completion notification

---

## Contributing

### For Agents

Follow the NEW GENESIS v1.1 workflow:

1. Read `.antigravity/context/BRIEF.md` and `STACK.md`
2. Execute assigned shard
3. Create atomic commit
4. Mark shard complete

### For Humans

1. Check `.antigravity/DECISIONS.md` for current status
2. Review shard definitions in `.antigravity/shards/`
3. Follow conventions in [docs/REPOSITORY_CONVENTIONS.md](docs/REPOSITORY_CONVENTIONS.md)
4. Obtain @Overseer approval before merging to main

---

## Troubleshooting

### Build Fails

```bash
# Clear build cache
rm -rf .next node_modules
npm install
npm run build
```

### Environment Issues

- Verify `.env.local` contains all required variables
- Check Vercel dashboard for production env vars
- See [docs/ENVIRONMENT_SETUP.md#troubleshooting](docs/ENVIRONMENT_SETUP.md)

### Database Connection

- Confirm Supabase project is not paused
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check anon key matches project

---

## License

**Proprietary** - CatchaCRM © 2026

---

## Support

- **GitHub Issues:** Bug reports and feature requests
- **Linear:** [Project workspace](https://linear.app/bsbsbs/project/catchacrm-ng-v11)
- **n8n Workflows:** https://ai.bsbsbs.au
- **Documentation:** [docs/](docs/)

---

## Project Status

**Current Milestone:** M01 - Genesis Foundation ✅
**Next Milestone:** M02 - Legacy Codebase Migration

**Progress:**
- [x] M01_01: Bootstrap repository container
- [x] M01_02: Migration staging brief
- [x] M01_03: Environment + secrets baseline
- [x] M01_04: Repo hygiene + docs

**Blockers:**
- MIG-001: Legacy codebase location needed (high priority)
- MIG-002: Supabase credentials required (high priority)
- MIG-003: n8n instance access details needed (medium priority)

See `.antigravity/DECISIONS.md` for detailed status.

---

**Built with NEW GENESIS v1.1** - Turn ideas into production
