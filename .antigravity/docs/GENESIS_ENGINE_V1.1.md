# Genesis Engine v1.1 - The Orchestrator

**Date:** 2026-01-22
**File:** `scripts/genesis.js`
**Version:** 1.1 (Automated Team)
**Status:** Ready for Testing

---

## What Changed from v1.0

### Core Upgrades

1. **MCP Gateway Integration** - Spawns agents with `--mcp-server node plugins/n8n-gateway.js`
2. **Agent Instructions** - Prompt now instructs agents to call `start_shard()` and `complete_shard()`
3. **Milestone Detection** - Automatically detects when all shards in a milestone are complete
4. **Auto-Scribe** - Triggers `scribe.js` on milestone completion (which calls `indiana_milestone.js`)
5. **Real-time Updates** - Agents update Linear during execution, not after

### Key Features

| Feature | v1.0 | v1.1 |
|---------|------|------|
| **Linear Updates** | Manual via scripts | Automatic via MCP tools |
| **Agent Prompt** | "Execute and say SHARD COMPLETE" | "Call start_shard → work → call complete_shard" |
| **MCP Server** | Not attached | Attached with --mcp-server flag |
| **Milestone Reports** | Manual script call | Auto-triggered on completion |
| **Environment Support** | Claude Code only | Claude Code + OpenCode |

---

## How It Works

### Execution Flow

```
1. Load progress.json
   ↓
2. Find first pending shard (e.g., M01/M01_01_SCHEMA.md)
   ↓
3. Load global context:
   - .antigravity/context/BRIEF.md
   - .antigravity/context/STACK.md
   ↓
4. Build prompt:
   - Global context
   - Shard instructions
   - MCP tool usage instructions (start_shard, complete_shard)
   ↓
5. Spawn agent with MCP Gateway:
   claude --file prompt.md --mcp-server 'node plugins/n8n-gateway.js'
   ↓
6. Agent executes:
   a. Calls start_shard({ shardId: "M01_01" })
      → Linear task ANT-220 → "In Progress"
   b. Reads files, writes code, verifies build
   c. Commits changes: git commit -m "feat(M01_01): ..."
   d. Calls complete_shard({ shardId: "M01_01", notes: "..." })
      → Linear task ANT-220 → "Done"
   e. Says "SHARD COMPLETE" and exits
   ↓
7. Orchestrator marks shard complete in progress.json
   ↓
8. Check if milestone complete:
    - If YES: Trigger scribe.js (The Scribe)
   - If NO: Continue to next shard
   ↓
9. Check if next shard is new milestone:
   - If YES: Pause, log milestone boundary
   - If NO: Continue
   ↓
10. Repeat from step 2 until all shards complete
```

### Agent Prompt Structure

The orchestrator builds a prompt that includes:

```markdown
🔴 GENESIS SYSTEM INSTRUCTION 🔴

YOU ARE A FRESH BUILDER AGENT WITH COMPLETE AMNESIA.

═══════════════════════════════════════════════════════════════════
                        YOUR GLOBAL CONTEXT
═══════════════════════════════════════════════════════════════════

[BRIEF.md content]
[STACK.md content]

═══════════════════════════════════════════════════════════════════
                     YOUR IMMEDIATE MISSION
                         SHARD: M01/M01_01_SCHEMA.md
                         SHARD ID: M01_01
═══════════════════════════════════════════════════════════════════

[Shard file content]

═══════════════════════════════════════════════════════════════════
                    CRITICAL: MCP TOOL USAGE
═══════════════════════════════════════════════════════════════════

YOU MUST CALL THESE TOOLS:

1. AT THE START (before any work):
   start_shard({ shardId: "M01_01" })

2. AT THE END (after verification passes):
   complete_shard({
     shardId: "M01_01",
     notes: "Brief summary of what you built"
   })

THESE TOOLS UPDATE LINEAR IN REAL-TIME.
If you skip them, the user won't see your progress!

═══════════════════════════════════════════════════════════════════
                        EXECUTION PROTOCOL
═══════════════════════════════════════════════════════════════════

WORKFLOW:

1. CALL start_shard({ shardId: "M01_01" })
2. READ the mission objective carefully
3. WRITE the code to fulfill the mission requirements
4. VERIFY your work (run build, run tests if specified)
5. CALL complete_shard({ shardId: "M01_01", notes: "..." })
6. STOP - Do not continue to other work

RULES YOU MUST FOLLOW:

- DO NOT read or update STATE.md, PLAN.md, or progress.json
- DO NOT work on any other shards or tasks
- DO NOT skip verification steps
- DO commit your changes with format: feat(M01_01): description
- DO call both start_shard and complete_shard tools

BEGIN EXECUTION NOW.
```

---

## Configuration

### Environment Variables

```bash
# Override webhook URL
export GENESIS_WEBHOOK_URL="https://ai.bsbsbs.au/webhook/genesis-update"

# Research role webhook
export RESEARCH_WEBHOOK_URL="https://ai.bsbsbs.au/webhook/research_role"

# Override agent command (advanced)
export GENESIS_AGENT_CMD="claude"
export GENESIS_AGENT_ARGS="--file {promptFile}"
```

### Optional Settings (.antigravity/config.json)

You can disable mandatory verification prompts (build/test requests) by setting:

```json
{
  "settings": {
    "requireVerification": false
  }
}
```

### Progress.json Format

**Legacy Format (v1.0):**
```json
{
  "version": "1.0",
  "pending": ["M01/M01_01.md", "M01/M01_02.md"],
  "completed": [],
  "failed": []
}
```

**Milestone Format (v1.1):**
```json
{
  "version": "1.1",
  "environment": "Claude Code",
  "milestones": [
    {
      "id": "M01",
      "name": "Foundation",
      "status": "in_progress",
      "shards": [
        {
          "id": "M01_01",
          "name": "Database Schema",
          "file": "M01/M01_01_SCHEMA.md",
          "status": "complete",
          "owner": "@Developer"
        },
        {
          "id": "M01_02",
          "name": "API Layer",
          "file": "M01/M01_02_API.md",
          "status": "pending",
          "owner": "@Developer"
        }
      ]
    }
  ]
}
```

---

## Usage

### Basic Execution

```bash
# Navigate to your project
cd /path/to/project

# Ensure .antigravity structure exists:
# .antigravity/
# ├── context/
# │   ├── BRIEF.md
# │   └── STACK.md
# ├── shards/
# │   └── M01/
# │       ├── M01_01_SCHEMA.md
# │       └── M01_02_API.md
# └── status/
#     └── progress.json

# Run the orchestrator
node scripts/genesis.js
```

### Expected Output

```
╔═══════════════════════════════════════════════════════════════════╗
║                    GENESIS ORCHESTRATOR v1.1                      ║
║                     "Automated Team"                              ║
╚═══════════════════════════════════════════════════════════════════╝

📖 Loading global context...
🔧 Resolving agent configuration...
   Agent: claude
   MCP Support: Yes

═══════════════════════════════════════════════════════════════════
🚀 SPAWNING GENESIS AGENT FOR: M01/M01_01_SCHEMA.md
   Shard ID: M01_01
   Agent: claude
   MCP Gateway: Enabled
═══════════════════════════════════════════════════════════════════

[Agent output appears here...]
[Agent calls start_shard → Linear updates to "In Progress"]
[Agent executes work...]
[Agent calls complete_shard → Linear updates to "Done"]

✅ SHARD M01/M01_01_SCHEMA.md COMPLETED
📊 Progress: 1/5 shards done

[Continues to next shard...]
```

### Milestone Completion

When all shards in a milestone are complete:

```
╔═══════════════════════════════════════════════════════════════════╗
║  MILESTONE M01 COMPLETE: Foundation                               ║
╚═══════════════════════════════════════════════════════════════════╝


📝 Triggering The Scribe (scribe.js)...

Running: node "scripts/scribe.js" "M01" "@Developer"

✅ Milestone report complete
🔗 Linear tasks updated
📤 GitHub commit pushed

✅ Milestone processing complete. Continuing to next milestone...
```

---

## Error Handling

### Shard Failure

If a shard fails (build error, verification failure, agent crash):

```
❌ SHARD M01/M01_02_API.md FAILED
   Error: Agent exited with code 1

🛑 STOPPING ORCHESTRATOR DUE TO FAILURE
   Fix the issue and re-run genesis.js to continue
```

**Recovery:**
1. Fix the issue in the codebase
2. Re-run `node scripts/genesis.js`
3. Orchestrator picks up from the failed shard

### Missing MCP Tools

If agent doesn't call `start_shard` or `complete_shard`:

```
❌ SHARD M01/M01_01_SCHEMA.md FAILED
   Error: Shard did not report completion (missing SHARD COMPLETE or complete_shard call)
```

**Common Causes:**
- MCP Gateway not installed
- Agent environment doesn't support MCP
- Agent forgot to call the tools

**Solutions:**
- Check MCP Gateway is installed: `ls plugins/n8n-gateway.js`
- Verify agent supports `--mcp-server` flag
- Re-run the shard

### OpenCode Environment

If using OpenCode (which doesn't support `--mcp-server` yet):

```
⚠️  WARNING: MCP tools not available in this environment
   Linear updates will only happen at milestone boundaries
```

**What happens:**
- Agents still execute shards
- No real-time Linear updates
- Milestone reports still work via `indiana_milestone.js`

---

## Advanced Features

### Shard ID Extraction

The orchestrator extracts shard IDs from file paths:

```javascript
"M01/M01_01_SCHEMA.md" → "M01_01"
"M02/M02_03_UI.md" → "M02_03"
```

This ID is used for:
- MCP tool calls: `start_shard({ shardId: "M01_01" })`
- Git commits: `feat(M01_01): Database schema`
- Linear task mapping: `M01_01` → `TASK-001` → `ANT-220`

### Agent Environment Detection

The orchestrator auto-detects the environment:

```javascript
// Check progress.json for "environment" field
// If "opencode" → Use opencode CLI
// If "claude code" or empty → Use claude CLI
// If GENESIS_AGENT_CMD set → Use custom command
```

### Milestone Boundary Detection

```javascript
function isNewMilestone(currentShardFile, nextShardFile, statusData) {
  // Extract milestone ID from current shard: M01/M01_02.md → M01
  // Extract milestone ID from next shard: M02/M02_01.md → M02
  // Return true if IDs differ
}
```

When detected:
- Log "MILESTONE BOUNDARY DETECTED"
- Pause briefly
- Log "Continuing to next milestone"

---

## Troubleshooting

### "No shards directory found"

**Problem:** `.antigravity/shards/` doesn't exist

**Solution:**
```bash
mkdir -p .antigravity/shards/M01
# Add shard files
```

### "No shard files found"

**Problem:** Shards directory is empty

**Solution:**
```bash
# Create shard files
echo "# SHARD M01_01" > .antigravity/shards/M01/M01_01_SCHEMA.md
```

### "MCP Gateway not found"

**Problem:** `plugins/n8n-gateway.js` doesn't exist

**Solution:**
```bash
cd ~/.antigravity/new_genesis/plugins
npm install
# Verify file exists
ls n8n-gateway.js
```

### "progress.json could not be parsed"

**Problem:** Invalid JSON in status file

**Solution:**
```bash
# Backup current file
mv .antigravity/status/progress.json .antigravity/status/progress.json.backup
# Delete to trigger re-initialization
rm .antigravity/status/progress.json
# Re-run orchestrator
node scripts/genesis.js
```

### Agent doesn't call MCP tools

**Problem:** Agent executes shard but doesn't call start_shard/complete_shard

**Possible Causes:**
1. MCP Gateway not loaded in agent environment
2. Agent doesn't see the tools
3. Agent skipped instructions

**Solution:**
```bash
# Verify MCP Gateway is installed
node scripts/install-gateway.js claude-code

# Restart Claude Code

# Check tools are available:
# In Claude Code, ask: "What tools do you have access to?"
# Should see: start_shard, complete_shard
```

---

## Testing

### Manual Test

1. Create a test project:
```bash
mkdir -p /tmp/test-genesis/.antigravity/{context,shards/M01,status}
cd /tmp/test-genesis
```

2. Create BRIEF.md:
```bash
cat > .antigravity/context/BRIEF.md << 'EOF'
# PROJECT BRIEF: Test Genesis

This is a test project for Genesis v1.1.
EOF
```

3. Create STACK.md:
```bash
cat > .antigravity/context/STACK.md << 'EOF'
# STACK

- Node.js
- TypeScript
EOF
```

4. Create test shard:
```bash
cat > .antigravity/shards/M01/M01_01_TEST.md << 'EOF'
# SHARD M01_01: Test Shard

## Objective
Create a simple test file

## Actions
1. Create test.txt with content "Hello Genesis v1.1"
2. Verify file exists

## Done When
- test.txt created with correct content
EOF
```

5. Copy genesis.js:
```bash
cp ~/.antigravity/new_genesis/scripts/genesis.js ./scripts/
```

6. Run orchestrator:
```bash
node scripts/genesis.js
```

---

## Integration with v1.1 Workflow

### Full Workflow

```
1. @Manager creates project:
   - Runs `ng "project idea"`
   - Creates BRIEF.md, STACK.md
   - Creates shards in .antigravity/shards/
   - Runs `node scripts/indiana.js` → Creates PROJECT_IDS.json
   ↓
2. User runs Genesis Engine:
   - `node scripts/genesis.js`
   ↓
3. Orchestrator loops through shards:
   - For each shard:
     a. Spawns agent with MCP Gateway
     b. Agent calls start_shard → Linear updates "In Progress"
     c. Agent executes work
     d. Agent calls complete_shard → Linear updates "Done"
     e. Orchestrator marks shard complete in progress.json
   ↓
4. When milestone completes:
   - Orchestrator triggers indiana_milestone.js
   - Creates SUMMARY.md
   - Commits and pushes to GitHub
   - Updates Linear project status
   ↓
5. Repeat until all milestones complete
   ↓
6. @Overseer reviews and approves:
   - Runs `node scripts/indiana_merge.js`
   - Merges dev → main
   - Vercel deploys to production
```

---

## Success Criteria

Genesis Engine v1.1 is working correctly when:

- ✅ Orchestrator starts and loads progress.json
- ✅ Agents spawn with MCP Gateway attached
- ✅ Agents call start_shard at beginning
- ✅ Linear tasks update to "In Progress" in real-time
- ✅ Agents execute shard work correctly
- ✅ Agents call complete_shard at end
- ✅ Linear tasks update to "Done" in real-time
- ✅ Orchestrator marks shards complete in progress.json
- ✅ Milestone completion triggers indiana_milestone.js
- ✅ Milestone boundaries are detected and logged
- ✅ All shards complete without errors

---

**GENESIS ENGINE v1.1** - Automated team execution with real-time Linear visibility.

**Next:** Test with a real project to verify end-to-end flow.
