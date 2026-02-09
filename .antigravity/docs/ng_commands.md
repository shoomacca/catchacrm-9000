# NEW GENESIS Commands Reference

**Version:** 1.0
**Last Updated:** 2026-01-19
**Compatible With:** Claude Code & OpenCode

---

## Core Commands

### `ng`
Start new project interview (Matrix + Shatter Protocol).

### `ng:status`
Show shard progress from `status/progress.json` (orchestrator view).

### `ng:plan`
Create PLAN.md (milestones only) and generate shards.

### `ng:execute`
Run the next shard in amnesia mode.

### `ng:worktree`
Create a git worktree for a shard (parallel execution).

### `ng:worktree-merge`
Merge a shard worktree branch back into the current branch.

### `ng:opencode-verify`
Run OpenCode formatting + TypeScript checks.

### `ng:complete`
Mark current shard complete (updates progress.json via orchestrator).

### `ng:handoff`
Create handoff document for session break.

### `ng:export`
Generate project reports.

---

## Utility Scripts

- `node scripts/ng-status.js` - Show progress from `status/progress.json`
- `node scripts/ng-verify-milestone.js` - Verify milestone readiness
- `node scripts/ng-commit-helper.js` - Format commit messages
- `node scripts/ng-schema-check.js` - Validate Supabase schema
- `node scripts/ng-audit.js` - Check audit compliance

---

## Indiana Scripts

- `node scripts/indiana.js` - Genesis (run once after BRIEF + STACK)
- `node scripts/indiana_milestone.js` - Milestone completion (after all shards complete)
- `node scripts/indiana_merge.js` - Ship to production

---

**Commands Version:** 1.1
