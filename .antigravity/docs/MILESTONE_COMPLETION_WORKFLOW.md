# Shard Completion Workflow

**NEW GENESIS v1.0**

---

## When a Shard is Complete

1. Verify shard steps
2. Commit atomically
3. Mark shard complete via orchestrator:

```bash
node scripts/genesis_complete.js MXX_YY
```

---

## When a Milestone is Complete

When all shards in a milestone are complete:

1. Run milestone verification:

```bash
node scripts/ng-verify-milestone.js
```

2. Mark milestone complete:

```bash
node scripts/indiana_milestone.js "@Developer" "MXX_COMPLETE" "MXX+1" "Summary" '["TASK-001"]'
```
