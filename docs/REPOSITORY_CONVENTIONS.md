# REPOSITORY CONVENTIONS

**Project:** CatchaCRM NG v11
**Created:** 2026-01-23
**Purpose:** Document repository hygiene, conventions, and standards for NEW GENESIS v1.1

---

## 1. REPOSITORY STRUCTURE

### 1.1 Top-Level Directories

```
catchacrm_ng_v11/
├── .antigravity/         # NEW GENESIS system files (DO NOT MODIFY)
├── .claude/              # Claude Code configuration
├── .git/                 # Git repository data
├── docs/                 # Project documentation
├── public/               # Static assets (images, fonts, etc.)
├── scripts/              # Automation scripts (indiana, chronos, etc.)
├── src/                  # Application source code
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── CLAUDE.md             # Claude AI instructions
├── next.config.js        # Next.js configuration
├── opencode.json         # OpenCode environment selection
├── package.json          # Node.js dependencies
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

### 1.2 .antigravity/ System Structure

**DO NOT manually edit files in .antigravity/** - These are managed by NEW GENESIS automation.

```
.antigravity/
├── commands/             # Slash command definitions
│   ├── build-fix.md
│   ├── code-review.md
│   ├── plan.md
│   ├── refactor-clean.md
│   ├── test-coverage.md
│   ├── update-codemaps.md
│   └── update-docs.md
├── context/              # Global project context
│   ├── BRIEF.md          # Project specification
│   └── STACK.md          # Tech stack and constraints
├── docs/                 # NEW GENESIS system documentation
│   ├── AGENT_RULES.md    # Agent behavior rules
│   ├── AGENT_MCP_TOOLS.md
│   ├── ng_commands.md    # Command reference
│   └── [other system docs]
├── hooks/                # Git hooks and automation
│   └── hooks.json
├── reports/              # Generated reports (milestone summaries)
├── roles/                # Agent role definitions
│   ├── ROLE_MANAGER.md
│   ├── ROLE_CONSULTANT.md
│   ├── ROLE_DEVELOPER.md
│   ├── ROLE_AUTOMATOR.md
│   ├── ROLE_TOOLS.md
│   └── ROLE_OVERSEER.md
├── rules/                # System rules
│   ├── agents.md
│   ├── coding-style.md
│   └── shatter.md
├── shards/               # Atomic execution contexts
│   ├── M01/              # Milestone 01 shards
│   ├── M02/              # Milestone 02 shards
│   └── [...]
├── skills/               # Reusable skill definitions
├── status/               # Progress tracking
│   └── progress.json     # Shard completion status
├── DECISIONS.md          # Decision log
├── HANDOFF.md            # Session handoff document
├── PLAN.md               # Milestone index
└── PROJECT_IDS.json      # GitHub/Linear/Vercel IDs
```

### 1.3 src/ Application Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Auth-related routes
│   ├── (dashboard)/      # Main app routes
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   └── layouts/          # Layout components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client
│   ├── api/              # API utilities
│   └── utils.ts          # Helper functions
├── styles/               # Global styles
│   └── globals.css       # Tailwind imports
└── types/                # TypeScript type definitions
    ├── database.ts       # Supabase types
    └── [feature].ts      # Feature-specific types
```

### 1.4 docs/ Documentation Structure

```
docs/
├── ENVIRONMENT_SETUP.md     # Environment variables guide
├── MIGRATION_BRIEF.md       # Legacy migration strategy
├── REPOSITORY_CONVENTIONS.md # This file
├── API_REFERENCE.md         # API documentation (to be created)
├── DATABASE_SCHEMA.md       # Schema documentation (to be created)
└── DEPLOYMENT_GUIDE.md      # Deployment instructions (to be created)
```

---

## 2. BRANCH STRATEGY

### 2.1 Primary Branches

**Branch: `main`**
- Production-ready code only
- Protected branch (no direct pushes)
- Only @Overseer (human) merges via `node scripts/indiana_merge.js`
- Auto-deploys to Vercel production

**Branch: `dev`**
- Active development branch
- All agent work happens here
- Merged to `main` after review
- Auto-deploys to Vercel preview

### 2.2 Working with Branches

**Starting work:**
```bash
# Always work on dev branch
git checkout dev
git pull origin dev
```

**Committing work:**
```bash
# Atomic commits per shard
git add [files]
git commit -m "feat(M01_02): Description"
git push origin dev
```

**Merging to production:**
```bash
# Only after @Overseer approval
node scripts/indiana_merge.js
```

### 2.3 Branch Protection Rules

**main branch:**
- Require pull request reviews
- Require status checks to pass
- No force pushes
- No deletions

**dev branch:**
- Allow direct pushes (for agents)
- Require CI checks to pass (optional)

---

## 3. COMMIT CONVENTIONS

### 3.1 Commit Message Format

Follow Conventional Commits specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Type:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, no logic change)
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes

**Scope:**
- Milestone/shard ID (e.g., `M01_02`, `M02_05`)
- Feature name (e.g., `auth`, `billing`)
- Component name (e.g., `ContactForm`, `Dashboard`)

**Description:**
- Imperative mood ("add" not "added")
- No period at end
- Max 72 characters

**Footer:**
- `Linear: TASK-XXX` - Link to Linear task
- `Closes #123` - Link to GitHub issue
- `BREAKING CHANGE:` - Breaking changes

### 3.2 Commit Examples

**Feature commits:**
```bash
feat(M01_01): Bootstrap repository container

- Created core directory structure (src/, public/, docs/)
- Added Next.js 14 project configuration
- Set up TypeScript with strict mode

Linear: TASK-001
```

**Bug fix:**
```bash
fix(M02_05): Resolve Supabase auth session timeout

Fixed session expiration by implementing automatic token refresh
in middleware. Sessions now persist across page reloads.

Linear: TASK-012
Closes #45
```

**Documentation:**
```bash
docs(M01_03): Document environment setup procedures

Added comprehensive guide for local development setup,
including credential acquisition and troubleshooting.

Linear: TASK-003
```

### 3.3 Commit Frequency

**IMPORTANT:** Commits are atomic per shard, not batched.

- ✅ Commit after each shard completes
- ✅ Each commit is self-contained and functional
- ✅ Commit messages reference Linear task IDs
- ❌ Do NOT batch multiple shards into one commit
- ❌ Do NOT commit incomplete work
- ❌ Do NOT commit commented-out code

---

## 4. CODE QUALITY STANDARDS

### 4.1 TypeScript

**Strict mode enabled:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Best practices:**
- All files use `.ts` or `.tsx` extensions
- Avoid `any` type (use `unknown` if needed)
- Define interfaces for all data structures
- Use type guards for runtime checks

### 4.2 Code Style

**Enforced by tooling:**
- Prettier for formatting (configured in `package.json`)
- ESLint for linting (Next.js default config)
- Tailwind for styling (no inline styles)

**Naming conventions:**
- Components: PascalCase (`ContactForm.tsx`)
- Files: kebab-case (`auth-utils.ts`)
- Functions: camelCase (`getUserById`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)

### 4.3 File Organization

**Component structure:**
```tsx
// src/components/ContactForm.tsx
import { useState } from 'react';
import type { Contact } from '@/types/database';

interface ContactFormProps {
  onSubmit: (contact: Contact) => void;
}

export function ContactForm({ onSubmit }: ContactFormProps) {
  // Implementation
}
```

**API route structure:**
```typescript
// src/app/api/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // Implementation
}

export async function POST(request: NextRequest) {
  // Implementation
}
```

### 4.4 Testing Requirements

**Unit tests:**
- Place next to component: `ContactForm.test.tsx`
- Use Jest + React Testing Library
- Minimum 70% coverage for critical paths

**Integration tests:**
- Place in `src/__tests__/integration/`
- Test API endpoints and database interactions

**E2E tests:**
- Use Playwright or Cypress
- Place in `tests/e2e/`
- Test critical user flows

---

## 5. DOCUMENTATION REQUIREMENTS

### 5.1 Code Documentation

**Functions:**
```typescript
/**
 * Fetches a user by ID from the database
 * @param id - The user's UUID
 * @returns User object or null if not found
 * @throws {Error} If database connection fails
 */
async function getUserById(id: string): Promise<User | null> {
  // Implementation
}
```

**Components:**
```tsx
/**
 * ContactForm component for creating/editing contacts
 *
 * @example
 * <ContactForm
 *   onSubmit={handleSubmit}
 *   initialData={contact}
 * />
 */
export function ContactForm({ onSubmit, initialData }: ContactFormProps) {
  // Implementation
}
```

### 5.2 Project Documentation

**Required docs:**
- [ ] README.md - Project overview and quick start
- [ ] docs/ENVIRONMENT_SETUP.md - Environment configuration
- [ ] docs/MIGRATION_BRIEF.md - Migration strategy
- [ ] docs/REPOSITORY_CONVENTIONS.md - This file
- [ ] docs/API_REFERENCE.md - API endpoint documentation
- [ ] docs/DATABASE_SCHEMA.md - Schema and RLS policies
- [ ] docs/DEPLOYMENT_GUIDE.md - Deployment procedures

**Optional docs:**
- [ ] docs/ARCHITECTURE.md - System architecture
- [ ] docs/SECURITY.md - Security considerations
- [ ] docs/TROUBLESHOOTING.md - Common issues

### 5.3 Decision Documentation

**Use .antigravity/DECISIONS.md for:**
- Architectural decisions
- Technology choices
- API contracts
- Schema changes
- Performance benchmarks

**Format:**
```markdown
| ID      | Decision                  | Rationale            | Date       | Status  |
| ------- | ------------------------- | -------------------- | ---------- | ------- |
| DEC-001 | Use Supabase RLS          | Security + Simplicity| 2026-01-23 | Active  |
```

---

## 6. GITIGNORE RULES

### 6.1 Current .gitignore

```gitignore
# Dependencies
node_modules/

# Build outputs
.next/
build/
.vercel/

# Environment files
.env
.env.local
.env.*.local

# System files
.DS_Store
*.log

# Test coverage
coverage/

# NEW GENESIS
.ralph_wiggum_state
.genesis_worktrees/
```

### 6.2 What to Commit

**✅ DO commit:**
- Source code (`src/`)
- Configuration files (`*.config.js`, `tsconfig.json`)
- Documentation (`docs/`, `README.md`)
- `.env.example` (template, no secrets)
- `.antigravity/` system files
- `package.json` and lock files
- Public assets (`public/`)

**❌ DO NOT commit:**
- `node_modules/`
- `.next/` build output
- `.env`, `.env.local` (secrets)
- Log files (`*.log`)
- OS files (`.DS_Store`)
- Test coverage reports
- Personal IDE settings (except shared `.vscode/settings.json` if team agrees)

---

## 7. CONTINUOUS INTEGRATION

### 7.1 Vercel Deployment

**Automatic deployments:**
- `dev` branch → Preview deployment
- `main` branch → Production deployment

**Build command:**
```bash
npm run build
```

**Environment variables:**
- Set in Vercel dashboard
- Separate configs for Preview and Production

### 7.2 GitHub Actions (Optional)

**Example workflow:**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

---

## 8. TOOLING SETUP

### 8.1 Required Tools

**Local development:**
- Node.js 18+ (LTS)
- npm or yarn
- Git
- Code editor (VS Code recommended)

**Optional tools:**
- Supabase CLI for database management
- Stripe CLI for webhook testing
- Docker for local services

### 8.2 VS Code Extensions (Recommended)

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Import Sorter
- GitLens

### 8.3 Scripts

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  }
}
```

**NEW GENESIS scripts:**
- `node scripts/indiana.js` - Genesis initialization
- `node scripts/indiana_milestone.js` - Milestone completion
- `node scripts/indiana_merge.js` - Merge dev → main
- `node scripts/ng-status.js` - Check shard progress
- `node scripts/ng-export.js` - Generate reports
- `node scripts/chronos.js` - Automated scheduler

---

## 9. SECURITY GUIDELINES

### 9.1 Secrets Management

**NEVER commit:**
- API keys or tokens
- Database passwords
- Private keys
- OAuth client secrets
- Service role keys

**Always use:**
- `.env.local` for local development
- Vercel environment variables for production
- Supabase Vault for sensitive config

### 9.2 Code Security

**Best practices:**
- Validate all user input
- Use parameterized queries (Supabase handles this)
- Enforce RLS on all tenant-scoped tables
- Sanitize HTML output
- Use HTTPS everywhere
- Implement rate limiting on API routes
- Use CORS properly

**Dependencies:**
- Run `npm audit` regularly
- Update dependencies monthly
- Review `package-lock.json` changes in PRs

---

## 10. REVIEW CHECKLIST

### 10.1 Before Committing

- [ ] Code compiles without errors
- [ ] TypeScript checks pass
- [ ] ESLint shows no errors
- [ ] Prettier has formatted code
- [ ] Tests pass
- [ ] No console.log or debugger statements
- [ ] No commented-out code
- [ ] Commit message follows conventions
- [ ] Linear task ID included

### 10.2 Before Merging to Main

- [ ] All shards in milestone complete
- [ ] `npm run build` succeeds
- [ ] All tests pass
- [ ] Documentation updated
- [ ] .antigravity/DECISIONS.md updated
- [ ] Environment variables documented
- [ ] Breaking changes noted
- [ ] @Overseer approval received

---

## 11. MILESTONE WORKFLOW

### 11.1 Shard Execution

**Process:**
1. Orchestrator selects next shard from `status/progress.json`
2. Builder agent reads:
   - `.antigravity/context/BRIEF.md`
   - `.antigravity/context/STACK.md`
   - `.antigravity/shards/M0X_YY_NAME.md`
3. Builder executes shard in disposable context
4. Builder creates atomic commit
5. Orchestrator marks shard complete

**Rules:**
- Each shard = one commit
- No reading `progress.json` by builder agents
- Verify shard completion before marking done
- Update `DECISIONS.md` if architectural changes made

### 11.2 Milestone Completion

**When all shards in milestone complete:**
```bash
node scripts/indiana_milestone.js \
  "@Developer" \
  "M01_COMPLETE" \
  "Milestone 2" \
  "Completed genesis foundation" \
  '["TASK-001","TASK-002","TASK-003","TASK-004"]'
```

**This will:**
- Commit all changes to dev branch
- Push to GitHub
- Mark Linear tasks as Done
- Send Telegram notification
- Create milestone summary in `.antigravity/reports/`

---

## 12. TROUBLESHOOTING

### 12.1 Common Issues

**Build fails:**
- Check environment variables
- Clear `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`

**TypeScript errors:**
- Run `npm run type-check`
- Update `.d.ts` type definitions
- Check `tsconfig.json` settings

**Git conflicts:**
- Always pull before starting work
- Resolve conflicts manually
- Test build after resolving

**Deployment fails:**
- Check Vercel logs
- Verify environment variables in Vercel dashboard
- Ensure build succeeds locally first

### 12.2 Getting Help

**Resources:**
- `.antigravity/docs/` - System documentation
- `docs/` - Project documentation
- GitHub Issues - Bug reports
- Linear - Task tracking

---

## 13. HYGIENE CHECKLIST

### 13.1 Repository Health

- [ ] No unused dependencies in `package.json`
- [ ] No `TODO` comments older than 30 days
- [ ] No large files (>1MB) committed
- [ ] No binaries committed (use Git LFS if needed)
- [ ] `.gitignore` covers all secrets
- [ ] All branches except `main` and `dev` deleted after merge
- [ ] Commit history is clean (no force pushes to `main`)

### 13.2 Code Health

- [ ] No duplicate code (DRY principle)
- [ ] No overly complex functions (keep under 50 lines)
- [ ] No magic numbers (use named constants)
- [ ] No dead code
- [ ] Consistent naming throughout
- [ ] Proper error handling everywhere

### 13.3 Documentation Health

- [ ] README up to date
- [ ] API docs match actual endpoints
- [ ] Environment variables documented
- [ ] Schema changes documented
- [ ] Decision log current

---

**Document Version:** 1.0
**Last Updated:** 2026-01-23
**Status:** ✅ Complete
**Next Review:** Before M02 migration begins

---

## APPENDIX A: Quick Reference

### Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run type-check         # Check TypeScript

# Git
git status                 # Check status
git add .                  # Stage all changes
git commit -m "..."        # Commit changes
git push origin dev        # Push to dev branch

# NEW GENESIS
node scripts/ng-status.js          # Check progress
node scripts/indiana.js            # Initialize project
node scripts/indiana_milestone.js  # Complete milestone
node scripts/indiana_merge.js      # Merge to main
```

### File Locations

- Project brief: `.antigravity/context/BRIEF.md`
- Tech stack: `.antigravity/context/STACK.md`
- Milestone index: `.antigravity/PLAN.md`
- Decision log: `.antigravity/DECISIONS.md`
- Shards: `.antigravity/shards/`
- Progress: `.antigravity/status/progress.json`

---

**END OF REPOSITORY CONVENTIONS**
