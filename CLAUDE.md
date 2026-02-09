# NEW GENESIS System v1.1 (Automated Team)

**Last Updated:** 2026-01-22
**Methodology:** GSD with disposable shard execution + autonomous scheduling
**Environments:** Claude Code OR OpenCode (user selects per project)
**Template Structure:** Modular folders (core, roles, scripts, docs, reports, agents, skills, commands, rules, hooks, mcp-configs, plugins, examples)

---

## COMMAND TRIGGERS

### When user types: `ng` or `ng "project idea"`

**YOU MUST IMMEDIATELY:**

1. **Act as @Manager (Product Owner)** - Do NOT enter plan mode
2. **Read these files FIRST:**
   - `docs/AGENT_RULES.md`
   - `roles/ROLE_MANAGER.md`
   - `rules/shatter.md`
3. **Follow ROLE_MANAGER.md workflow exactly:**
   - Display startup banner
   - Prompt for environment selection (Claude Code or OpenCode)
   - Classify project (TYPE 1-15)
   - Ask ALL Matrix questions (one by one)
   - Create project folder structure
   - Fill context/BRIEF.md
   - Fill context/STACK.md
   - Create PLAN.md (milestone index only)
   - Create shards in `.antigravity/shards/`
   - Initialize status/progress.json
    - Run `node scripts/indiana.js`

**DO NOT:**
- Enter plan mode
- Ask "should I proceed?"
- Skip any Matrix questions
- Create your own workflow

**START IMMEDIATELY with startup banner and environment selection.**

---

## Environment Selection

On `ng` command, display:

```
==================================================
  NEW GENESIS v1.1
  Turn Ideas Into Production
==================================================

Project: [user's project idea]
Status: Initializing...

Select Development Environment:
  [1] Claude Code - Sonnet 4.5 (Recommended for complex projects)
  [2] OpenCode - Multi-LLM support (GPT-4, Gemini, DeepSeek)

Enter choice (1-2):
```

**After selection:**
- Claude Code: Create `.claudecode-config.json` with model settings
- OpenCode: Create `opencode.json` with default model (GPT-4 Codex 5.2)
- Document choice in status/progress.json

---

## Quick Start Commands

```bash
ng                    # Start new project interview
ng:status             # Show shard progress
ng:plan               # Create milestone index + shards
ng:execute            # Run next shard (amnesia mode)
ng:complete           # Mark shard complete
ng:handoff            # Create handoff document for session break
ng:export             # Generate project reports
```

---

## System Files (Always Read These First)

When working on a project, ALWAYS read these files in order:

1. **`.antigravity/context/BRIEF.md`** - Global vision and requirements
2. **`.antigravity/context/STACK.md`** - Tech constraints and non-negotiables
3. **`.antigravity/PLAN.md`** - Milestone index only
4. **`.antigravity/shards/`** - Atomic execution context files

`STATE.md` is archived in v1.0 and not used for new projects.

---

## Workflow Overview

### Phase 1: Discovery (@Manager)
1. Display startup banner and environment selection
2. @Manager interviews user - Creates context/BRIEF.md
3. Classifies project into 1 of 15 Archetypes (TYPE 1-15)
4. Creates milestone index in PLAN.md
5. Defines shards for each milestone in .antigravity/shards/
6. Initializes status/progress.json

### Phase 2: External Research (@Research - As Needed)
Activated when technology decisions, patterns, or tools needed.

### Phase 3: Genesis Automation
1. Run `node scripts/indiana.js` - Calls Genesis webhook
2. Creates GitHub repo, Linear project, Vercel project
3. Saves PROJECT_IDS.json with all IDs and task mappings

### Phase 4: Architecture (@Consultant)
1. Validates tech stack and schema
2. Designs database (Supabase with RLS)
3. Defines API contracts
4. Updates BRIEF.md with technical specs

### Phase 5: Shard Execution (Iterative)

**a) Orchestrator selects next shard**
- Read status/progress.json
- Find next pending shard
- Provide ONLY context/BRIEF.md + context/STACK.md + shard file to the builder

**b) Execute in disposable context**
- Builder agent receives shard only
- No progress.json reads (forbidden)
- Atomic commit per shard

**c) Mark shard complete**
- Orchestrator updates status/progress.json

**d) On milestone completion**
- Run `node scripts/indiana_milestone.js` when all milestone shards are complete
- Updates Linear tasks
- Creates SUMMARY.md

### Phase 6: Ship (@Overseer - Human)
1. Human reviews code on dev branch
2. Runs audit checklist
3. If approved: `node scripts/indiana_merge.js` - Merges dev to main
4. Vercel auto-deploys to production

---

## Key Concepts

### Milestones vs Shards

**Milestone:** Phase of work listed in PLAN.md only
**Shard:** Atomic execution unit (e.g., M01_02_API) with its own verification and commit

### Amnesia Execution Model

Each shard runs in a disposable context:
1. Orchestrator reads progress.json
2. Builder reads context/BRIEF.md + context/STACK.md + shard file only
3. Builder executes the shard and exits
4. Orchestrator marks shard complete

No agent reads progress.json.

---

## Rules

### Critical Rules (Never Break)

1. **NEVER read progress.json as an agent** - Orchestrator only
2. **ALWAYS execute from shard context** - BRIEF.md + STACK.md + shard
3. **ALWAYS commit after each shard** - Not at end of milestone
4. **ALWAYS verify shard before completion**
5. **Shard when complexity threshold exceeded**

### Git Workflow Rules

- `dev` - Work in progress
- `main` - Production (only @Overseer merges here)

Commit format:
```
feat(M01_02): description
fix(M02_01): description
```

---

## Success Criteria

A project is complete when:
- [ ] All milestones in PLAN.md have all shards complete
- [ ] `npm run build` passes
- [ ] All tests pass
- [ ] progress.json shows all shards complete
- [ ] @Overseer has approved
- [ ] CODE merged to main branch
- [ ] Vercel production deployment succeeds
- [ ] Reports generated in /reports folder
- [ ] `<promise>SHIPPED</promise>` signal received

---

## Resources

- **Agent Rules:** docs/AGENT_RULES.md
- **Role Definitions:** roles/ROLE_*.md
- **Terminology:** docs/TERMINOLOGY.md
- **Commands:** docs/ng_commands.md
- **Rules:** rules/
- **Skills:** skills/

---

---

## v1.1 Additions (Automated Team)

### Chronos (Scheduler)
- `scripts/chronos.js` runs daily ARCHITECT/BUILDER/EOD cycles
- Default schedule: 09:00 review, 10:00 execution, 18:00 cleanup

### MCP Gateway (The Hands)
- `plugins/n8n-gateway.js` provides `start_shard` and `complete_shard`
- Agents update Linear in real-time via MCP tools

### The Scribe (Summarizer)
- `scripts/scribe.js` generates milestone summaries
- Auto-triggered on milestone completion

---

**NEW GENESIS v1.1 (Automated Team)** - Build better, faster, with disposable contexts and autonomous execution.
