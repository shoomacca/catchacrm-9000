# Agent MCP Tools Reference

**Version:** 1.1 (Automated Team)
**Last Updated:** 2026-01-22
**Purpose:** Quick reference for agents using NEW GENESIS MCP tools

---

## Overview

As of v1.1, agents can update Linear tasks in real-time using MCP tools. This eliminates the need for manual script calls and provides instant visibility into shard progress.

---

## Available Tools

### 1. `start_shard`

**Purpose:** Mark a shard as "In Progress" in Linear

**When to use:**
- At the beginning of shard execution
- Before reading files or making changes
- To signal you've started work

**Syntax:**
```javascript
start_shard({
  shardId: "M01_01"  // or "TASK-001"
})
```

**Example:**
```javascript
// Agent starts M01_01 shard
start_shard({ shardId: "M01_01" })

// Response:
{
  "success": true,
  "shardId": "M01_01",
  "linearHandle": "ANT-220",
  "action": "start_shard"
}
```

**What happens:**
1. Tool reads `.antigravity/PROJECT_IDS.json`
2. Maps `M01_01` → `TASK-001` → `ANT-220`
3. Posts to n8n webhook with `action: "start_shard"`
4. Linear task ANT-220 status → "In Progress"

---

### 2. `complete_shard`

**Purpose:** Mark a shard as "Done" in Linear

**When to use:**
- After all verification steps pass
- After committing changes
- Before exiting shard execution

**Syntax:**
```javascript
complete_shard({
  shardId: "M01_01",
  notes: "Optional completion summary"
})
```

**Example:**
```javascript
// Agent completes M01_01 shard
complete_shard({
  shardId: "M01_01",
  notes: "Database schema created. 3 tables added: users, posts, comments. Migration 001 applied successfully."
})

// Response:
{
  "success": true,
  "shardId": "M01_01",
  "linearHandle": "ANT-220",
  "action": "complete_shard",
  "notes": "Database schema created..."
}
```

**What happens:**
1. Tool reads `.antigravity/PROJECT_IDS.json`
2. Maps `M01_01` → `ANT-220`
3. Posts to n8n webhook with `action: "complete_shard"`
4. Linear task ANT-220 status → "Done"
5. Notes appear in Linear task comments

---

## Integration with Shard Execution

### Standard Shard Workflow (v1.1)

```
1. Orchestrator assigns shard to agent
2. Agent receives: BRIEF.md + STACK.md + M01_01.md
3. Agent calls: start_shard({ shardId: "M01_01" })
   ├─ Linear task ANT-220 → "In Progress"
   └─ User sees real-time update
4. Agent executes shard (read, write, build, verify)
5. Agent commits changes: git commit -m "feat(M01_01): ..."
6. Agent calls: complete_shard({ shardId: "M01_01", notes: "..." })
   ├─ Linear task ANT-220 → "Done"
   └─ Notes added to Linear task
7. Agent exits (amnesia architecture)
```

---

## Error Handling

### "PROJECT_IDS.json not found"

**Cause:** Project not initialized with `node scripts/indiana.js`

**Solution:**
```bash
cd /path/to/project
node scripts/indiana.js
```

### "No Linear task mapping found for shard M01_01"

**Cause:** Shard ID not in PROJECT_IDS.json

**Solution:**
1. Check `.antigravity/PROJECT_IDS.json` structure
2. Verify shard ID format (M01_01 or TASK-001)
3. Ensure shard is listed in BRIEF.md tasks
4. Re-run `node scripts/indiana.js` if tasks were added

### "Webhook returned HTTP 404"

**Cause:** n8n workflow not active or URL incorrect

**Solution:**
1. Test webhook: `node scripts/test-gateway.js start_shard ANT-001`
2. Check n8n dashboard: https://ai.bsbsbs.au/
3. Verify webhook URL in `.claude/mcp.json` or `opencode.json`

---

## Best Practices

### DO ✅

- **Call `start_shard` at the beginning** of shard execution
- **Call `complete_shard` at the end** of shard execution
- **Include meaningful notes** in `complete_shard` (what was built, files changed, verification status)
- **Use the exact shard ID** from the shard file name (e.g., M01_01)

### DON'T ❌

- Don't call `start_shard` multiple times for the same shard
- Don't call `complete_shard` if verification failed (leave as "In Progress")
- Don't skip these calls thinking they're optional (they provide critical visibility)
- Don't use arbitrary shard IDs (must match PROJECT_IDS.json)

---

## Testing

### Manual Test (Outside Agent Context)

```bash
# Test start_shard
node scripts/test-gateway.js start_shard ANT-001

# Test complete_shard
node scripts/test-gateway.js complete_shard ANT-001 "Test complete"
```

### Verify Linear Update

1. Go to Linear project: https://linear.app/bsbsbs/project/...
2. Find task ANT-001
3. Check status changed to "In Progress" or "Done"
4. Check comments for notes

---

## v1.0 → v1.1 Differences

| Aspect | v1.0 (Shatter) | v1.1 (Automated Team) |
|--------|----------------|------------------------|
| **Linear Updates** | Only at milestone boundaries | Real-time per shard |
| **Status Visibility** | Manual script calls | Automatic via MCP tools |
| **Agent Workflow** | Silent execution | Reports start/complete |
| **User Visibility** | Check progress.json locally | Check Linear board live |
| **Tools Required** | None (orchestrator only) | start_shard, complete_shard |

---

## Orchestrator Integration

The orchestrator (genesis.js or equivalent) can also use these tools to:

- Mark shards as started before spawning agent
- Mark shards as complete after agent exits
- Handle failures by NOT calling complete_shard (leaves as "In Progress")

**Example orchestrator flow:**
```javascript
// Before spawning agent
await start_shard({ shardId: currentShard.id })

// Spawn agent with amnesia context
const result = await spawnAgent(briefMd, stackMd, shardMd)

// After agent exits successfully
if (result.success) {
  await complete_shard({
    shardId: currentShard.id,
    notes: `Completed by ${result.agent}. ${result.summary}`
  })
}
```

---

## Debugging

### Enable Verbose Logging

Set environment variable before running:
```bash
export DEBUG=mcp:*
node plugins/n8n-gateway.js
```

### Check MCP Server Status

**Claude Code:**
```bash
# Check if server is loaded
claude mcp list
```

**OpenCode:**
```bash
# Check if server is configured
cat opencode.json | grep genesis-gateway
```

### Inspect Webhook Payload

Use test script with verbose output:
```bash
node scripts/test-gateway.js start_shard ANT-001
```

---

**AGENT_MCP_TOOLS.md Version:** 1.1
**Purpose:** Enable real-time Linear updates during shard execution
