# Ralph Loop - Execution Protocol

The Ralph Loop is the core execution pattern for New Genesis shard execution.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      RALPH LOOP                              │
│                                                              │
│   ┌─────────┐    ┌─────────┐    ┌──────────┐    ┌────────┐ │
│   │  READ   │───▶│ ATTEMPT │───▶│  VERIFY  │───▶│ COMMIT │ │
│   └─────────┘    └─────────┘    └──────────┘    └────────┘ │
│        │              │              │               │      │
│        │              │              ▼               │      │
│        │              │         ┌────────┐          │      │
│        │              └────────▶│  FIX   │──────────┘      │
│        │                        └────────┘                  │
│        │                             │                      │
│        └─────────────────────────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Phases

### 1. READ
- Load shard file from `.planning/milestones/`
- Understand goal, tasks, and "Done When" criteria
- Check dependencies are complete
- Never proceed without understanding

### 2. ATTEMPT
- Execute each task in order
- Write code, create files, configure systems
- Follow task action instructions exactly
- Track what was done

### 3. VERIFY
- Run all verification steps from shard
- Check each "Done When" criterion
- Run build if applicable: `npm run build`
- All must pass to proceed

### 4. FIX (if verify fails)
- Identify what failed
- Make corrections
- Re-run verification
- Do NOT proceed until all pass

### 5. COMMIT
- Stage only files from this shard
- Commit with shard ID in message
- Format: `feat(M1-01): Shard name`
- Push if connected to remote

## Rules

1. **One shard at a time** - Never work on multiple shards
2. **Verify before commit** - Never commit failing code
3. **Atomic commits** - Each shard = one commit
4. **Update state** - Always update STATE.md after completion
5. **Stop if blocked** - Document blockers, don't push through

## Verification Checklist

Before marking a shard complete:

- [ ] All tasks executed
- [ ] All "Done When" criteria pass
- [ ] Build succeeds (if applicable)
- [ ] Tests pass (if applicable)
- [ ] Commit created with shard ID
- [ ] STATE.md updated
- [ ] No uncommitted changes

## Anti-Patterns

**DON'T:**
- Skip verification steps
- Batch commits at end of milestone
- Continue when blocked
- Modify files outside shard scope
- Mark done without verifying
