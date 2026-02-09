# Shard Anatomy

A shard is the atomic unit of work in New Genesis. Each shard should be completable in one session with clear verification steps.

## Structure

```markdown
# Shard M1.2: Database Schema

**Goal:** Create Supabase tables with RLS policies
**Dependencies:** M1.1 (Project Setup)

## Tasks

### 1. Create users table
**Files:** `supabase/migrations/001_users.sql`
**Action:** Create users table with id, email, created_at
**Verify:** Table appears in Supabase dashboard

### 2. Create RLS policies
**Files:** `supabase/migrations/002_rls.sql`
**Action:** Enable RLS, create select/insert policies
**Verify:** Policies visible in Auth settings

## Done When
- [ ] Users table created
- [ ] RLS enabled
- [ ] Policies allow authenticated access only
- [ ] Migration files committed
```

## Components

### Goal
One sentence describing the outcome. Should be:
- Specific and measurable
- Achievable in one session
- Valuable on its own

### Dependencies
Other shards that must complete first:
- `None` - Can start immediately
- `M1.1` - Requires shard 1 of milestone 1
- Multiple dependencies separated by commas

### Tasks
3-5 atomic tasks within the shard:

| Field | Purpose |
|-------|---------|
| **Name** | What this task does |
| **Files** | Exact file paths to create/modify |
| **Action** | Step-by-step instructions |
| **Verify** | How to confirm it worked |

### Done When
Checklist of verifiable criteria:
- Use checkbox format `- [ ]`
- Must be objectively verifiable
- Include build/test requirements
- All must pass before commit

## Sizing Guidelines

A well-sized shard:
- **3-5 tasks** - More suggests splitting
- **15-60 minutes** - Longer suggests splitting
- **Single concern** - One logical unit of work
- **Clear boundaries** - Obvious where it starts/ends

## Examples

### Good Shard
```
# Shard M1.1: Project Setup

**Goal:** Initialize Next.js project with TypeScript
**Dependencies:** None

## Tasks
1. Create Next.js app with create-next-app
2. Configure TypeScript strict mode
3. Install core dependencies (tailwind, etc.)

## Done When
- [ ] `npm run dev` starts without errors
- [ ] TypeScript compilation succeeds
- [ ] Tailwind classes apply correctly
```

### Bad Shard (Too Big)
```
# Shard M1.1: Complete Authentication System

**Goal:** Build entire auth system
**Dependencies:** None

## Tasks
1. Set up Supabase
2. Create auth components
3. Implement login/logout
4. Add password reset
5. Configure OAuth providers
6. Create user profile pages
7. Add role-based access
8. Write auth tests

## Done When
- [ ] Users can sign up
- [ ] Users can log in
- [ ] Password reset works
- [ ] Social login works
- [ ] Roles enforced
```

This should be split into 3-4 separate shards.

## File Naming

Shard files live in `.planning/milestones/`:

```
.planning/
└── milestones/
    └── 01-foundation/
        ├── SHARDS.md      # Overview of all shards
        ├── 01-SHARD.md    # First shard
        ├── 02-SHARD.md    # Second shard
        ├── 03-SHARD.md    # Third shard
        └── SUMMARY.md     # Created after completion
```

## Execution

When executing a shard (`/ng:execute 1.2`):

1. Read the shard file
2. Execute each task in order
3. Run verification after each task
4. Check all "Done When" criteria
5. Commit with shard ID
6. Update STATE.md
