# Brownfield Integration Guide

**Guide for integrating New Genesis into existing projects**

---

## Overview

Brownfield integration is the process of adopting New Genesis workflow into an existing codebase. Unlike greenfield (new) projects, brownfield requires:

1. **Analysis** of existing code
2. **Mapping** current state to Genesis structure
3. **Planning** remaining work from current position
4. **Integrating** without disrupting existing functionality

---

## When to Use Brownfield

Use brownfield integration when:
- ✅ Project has existing code (any amount)
- ✅ Some features already built
- ✅ Want to adopt Genesis workflow mid-project
- ✅ Taking over someone else's codebase
- ✅ Resuming abandoned project

Do **NOT** use for:
- ❌ Brand new projects (use `/ng:new-project`)
- ❌ Empty repositories
- ❌ Just planning (no code yet)

---

## The Integration Process

### High-Level Flow

```
Existing Project
    ↓
/ng:integrate (Analysis)
    ↓
Confirm Findings
    ↓
Modified Matrix Interview
    ↓
Generate .planning/ Structure
    ↓
/ng:map (Detailed Analysis)
    ↓
Continue with Genesis Workflow
```

### Detailed Steps

#### Step 1: Pre-Integration Checklist

Before running `/ng:integrate`:

```bash
# 1. Ensure you're in the project root
pwd

# 2. Verify git repository exists
git status

# 3. Ensure main files exist (package.json, etc.)
ls -la

# 4. Commit any uncommitted changes
git add .
git commit -m "Pre-integration checkpoint"
```

#### Step 2: Run Integration Command

```bash
/ng:integrate
```

**What Happens:**
1. System scans project structure
2. Detects tech stack automatically
3. Identifies existing features
4. Guesses project archetype
5. Presents findings for confirmation

#### Step 3: Confirm Analysis

System shows something like:

```
═══════════════════════════════════════════
CODEBASE ANALYSIS COMPLETE
═══════════════════════════════════════════

Project: TaskMaster (from package.json)
Tech Stack: Next.js 14, TypeScript, Supabase
Lines of Code: 12,450
Archetype: TYPE 01 - B2B SaaS (85% confidence)

Existing Features:
✓ Authentication
✓ User management
✓ Dashboard
⚠ Settings (50% complete)
✗ Billing
✗ Teams

Is this correct? (yes/no/explain)
```

**You can:**
- Type "yes" to confirm
- Type "no" and explain what's wrong
- Correct individual items

#### Step 4: Modified Matrix Interview

Unlike greenfield `/ng:new-project`, the interview focuses on **what's missing**:

**Greenfield (new project):**
```
Q: What billing model do you want?
A: Per-seat pricing
```

**Brownfield (existing):**
```
I detected: No billing system exists
Q: Do you need billing?
A: Yes
Q: What model?
A: Per-seat pricing
```

Answer questions about:
- Missing features you need
- Technical debt to address
- Bugs to fix
- v2 enhancements

#### Step 5: Review Generated Files

Check `.planning/`:

```bash
ls -la .planning/

# Should see:
# BRIEF.md          - Brownfield format (existing + remaining)
# STACK.md          - Detected + confirmed stack
# REQUIREMENTS.md   - What's left to build
# ROADMAP.md        - Future milestones
# STATE.md          - Current position (v0.X → v1.0)
# DECISIONS.md      - Going forward decisions
# progress.json     - Start tracking
```

**Key Differences from Greenfield:**

| File | Greenfield | Brownfield |
|------|-----------|------------|
| BRIEF.md | All new features | Existing + Remaining |
| STATE.md | "M01 not started" | "v0.5 → v1.0" |
| ROADMAP.md | Build from scratch | Complete in-progress work first |

#### Step 6: Deep Analysis

System automatically runs:

```bash
/ng:map
```

Creates `.planning/codebase/`:
- ANALYSIS.md - Overall summary
- ARCHITECTURE.md - System design
- COMPONENTS.md - Component catalog
- DATABASE.md - Schema documentation
- ROUTES.md - API/page routes
- TECHNICAL_DEBT.md - Issues found
- METRICS.md - Code quality

**Review these files** before planning milestones.

#### Step 7: Commit Integration

```bash
git add .planning/ scripts/ .claude/ .opencode/
git commit -m "[@Manager] INTEGRATION_COMPLETE: Genesis brownfield integration

Integrated existing v0.5 codebase.

Analysis:
- 12,450 LOC
- 60% feature complete
- TYPE 01 - B2B SaaS

Created planning structure and roadmap."
```

#### Step 8: Continue with Genesis

Now use normal workflow:

```bash
# Shatter first milestone (usually M01: Complete In-Progress Work)
/ng:shatter 1

# Execute shards
/ng:execute 1.1
/ng:execute 1.2

# Verify and complete
/ng:verify 1
/ng:complete 1 "Completed partial features"

# Move to next milestone
/ng:next
```

---

## Brownfield-Specific Milestones

Typical brownfield roadmap structure:

### M01: Complete In-Progress Work
**Goal:** Finish anything 50% done

**Why First:**
- Gets project to stable state
- Quick wins
- Clear the decks for new work

**Example Tasks:**
- Finish settings page (UI done, logic needed)
- Complete organization schema → UI
- Fix half-implemented features

### M02: Critical Missing Features
**Goal:** Must-haves for v1.0

**Example Tasks:**
- Billing system
- Team invites
- Email notifications
- Onboarding

### M03: Technical Debt & Quality
**Goal:** Code quality and maintainability

**Example Tasks:**
- Add unit tests (currently 0%)
- Refactor inconsistent API patterns
- Add error boundaries
- Remove console.log statements
- Fix TypeScript "any" types

### M04: v2.0 Features
**Goal:** Nice-to-haves and enhancements

**Example Tasks:**
- Advanced analytics
- API for integrations
- Mobile app
- Slack integration

---

## Key Differences: Greenfield vs Brownfield

| Aspect | Greenfield | Brownfield |
|--------|-----------|------------|
| **Starting Point** | Empty folder | Existing code |
| **Matrix Interview** | All features | Missing features |
| **M01 Milestone** | Setup project | Complete in-progress |
| **BRIEF.md Format** | Future work | Existing + Future |
| **STATE.md** | "Not started" | "v0.X → v1.0" |
| **Technical Debt** | None yet | Identified and planned |
| **Database** | Create schema | Document existing |
| **Risk** | Low (clean slate) | Higher (breaking changes) |

---

## Common Pitfalls

### 1. Not Committing Before Integration
**Problem:** Integration adds many files
**Solution:** Always commit existing code first

### 2. Ignoring Analysis Results
**Problem:** Proceed without reading ANALYSIS.md
**Solution:** Actually review codebase analysis

### 3. Skipping Technical Debt
**Problem:** Only plan new features
**Solution:** Create M03 for quality/debt

### 4. Wrong Archetype
**Problem:** System guesses TYPE 01 but it's actually TYPE 09
**Solution:** Correct during confirmation step

### 5. Overwriting Existing Structure
**Problem:** Project has `.planning/` already
**Solution:** Integration merges, doesn't overwrite

### 6. Not Understanding Current State
**Problem:** Jump straight to new features
**Solution:** Read ARCHITECTURE.md, DATABASE.md first

---

## Integration Examples

### Example 1: 3-Month-Old SaaS (60% Complete)

**Scenario:**
- Next.js project, 3 months old
- Auth works, dashboard exists
- Settings page 50% done
- No billing, no teams

**Integration Output:**
```
Current Version: v0.6
Target Version: v1.0
Progress: 60%

Roadmap:
- M01: Complete Settings Page (1 week)
- M02: Billing System (3 weeks)
- M03: Team Features (2 weeks)
- M04: Technical Debt (2 weeks)
- M05: v2 Features (ongoing)
```

### Example 2: Abandoned Project Takeover

**Scenario:**
- Someone else's code, handed off to you
- 6 months old, no activity for 2 months
- Unknown feature completeness
- Lots of TODO comments

**Integration Output:**
```
Current Version: v0.3 (estimated)
Target Version: v0.5 (stabilize first)
Progress: 30%
Technical Debt: HIGH

Roadmap:
- M01: Code Audit & Stabilization (2 weeks)
- M02: Fix Critical Bugs (2 weeks)
- M03: Complete Half-Done Features (3 weeks)
- M04: Technical Debt Reduction (3 weeks)
- [Then plan v1.0 milestones]
```

### Example 3: MVP → Production

**Scenario:**
- MVP launched, users exist
- Now need to productionize
- Add missing enterprise features

**Integration Output:**
```
Current Version: v0.9 (MVP in prod)
Target Version: v1.0 (production-ready)
Progress: 90%

CRITICAL: Can't break existing users

Roadmap:
- M01: Security Audit (1 week)
- M02: Add Tests (2 weeks)
- M03: Enterprise Features (4 weeks)
- M04: Performance Optimization (2 weeks)
- M05: Launch v1.0 (1 week)
```

---

## Constraints in Brownfield

Things you **usually can't change**:

### Database
- ❌ Can't switch databases (users' data exists)
- ✅ Can add tables/columns
- ✅ Can migrate data
- ⚠ Must be careful with schema changes

### Authentication
- ❌ Can't change auth provider (users logged in)
- ✅ Can add OAuth providers
- ✅ Can improve flow
- ⚠ Must maintain existing sessions

### Hosting
- ⚠ Can change but risky
- ✅ Can add additional services
- ⚠ DNS changes require planning

### Tech Stack
- ❌ Usually locked in (rewrite = months)
- ✅ Can upgrade versions carefully
- ✅ Can add libraries
- ⚠ Major changes = separate milestone

---

## Success Metrics

Integration is successful when:

✅ All .planning/ files created
✅ Existing code still works (no breakage)
✅ Analysis complete (ANALYSIS.md exists)
✅ Roadmap makes sense (M01 = complete in-progress)
✅ You understand current codebase
✅ Can execute first shard without confusion

---

## Next Steps After Integration

1. **Read Analysis Files**
   ```bash
   cat .planning/codebase/ANALYSIS.md
   cat .planning/codebase/TECHNICAL_DEBT.md
   ```

2. **Review Roadmap**
   ```bash
   cat .planning/ROADMAP.md
   ```

3. **Understand Current State**
   ```bash
   cat .planning/STATE.md
   ```

4. **Plan M01**
   ```bash
   /ng:shatter 1
   ```

5. **Execute First Shard**
   ```bash
   /ng:execute 1.1
   ```

---

## Troubleshooting

### "Integration failed - BRIEF.md already exists"

**Cause:** Project already has Genesis structure

**Solution:**
1. Check if previous integration was incomplete
2. If so, delete `.planning/` and re-run
3. Or manually merge files

### "Archetype detection returned TYPE 10 but it's wrong"

**Cause:** Code patterns match multiple archetypes

**Solution:**
- When asked "Is this correct?", say "no"
- Specify correct archetype: "It's TYPE 01 - B2B SaaS"
- System will use your archetype instead

### "Analysis shows 0 lines of code"

**Cause:** Code in non-standard location

**Solution:**
- Agent searches `app/`, `src/`, `components/`, `pages/`
- If code elsewhere, manually update ANALYSIS.md
- Or wait for `/ng:map` which searches more thoroughly

### "Can't detect database schema"

**Cause:** No migration files or schema files

**Solution:**
- Manually document schema in `.planning/codebase/DATABASE.md`
- Or run migrations, then re-run `/ng:map`

---

## FAQs

**Q: Can I integrate if project has no git?**
A: Yes, but create git first: `git init && git add . && git commit -m "Initial"`

**Q: What if I have no tests?**
A: Normal for brownfield. System will note "0% coverage" and suggest adding tests in M03.

**Q: Should I fix technical debt before adding features?**
A: Depends. Usually:
- M01: Complete in-progress (quick wins)
- M02: Critical features (business value)
- M03: Technical debt (quality)

**Q: Can I integrate a monorepo?**
A: Yes, run `/ng:integrate` in each package folder separately.

**Q: What if my stack isn't detected?**
A: System will ask. Manually specify during confirmation.

**Q: Can I re-run integration?**
A: Yes, delete `.planning/` first. But you'll lose planning work.

---

## Reference

**Commands:**
- `/ng:integrate` - Main brownfield integration
- `/ng:map` - Deep codebase analysis
- `/ng:detect` - Archetype detection only
- `/ng:audit-existing` - Quality audit

**Files Created:**
- `.planning/BRIEF.md` (brownfield format)
- `.planning/STATE.md` (current version → target)
- `.planning/ROADMAP.md` (future milestones)
- `.planning/codebase/ANALYSIS.md` (summary)
- `.planning/codebase/TECHNICAL_DEBT.md` (issues)

---

**Brownfield integration is your path from existing code to structured Genesis workflow.**
