# Indiana.js - Genesis Automation Script

## Overview

**indiana.js** creates your project infrastructure in one command:
- ✅ GitHub repository with README (containing your BRIEF)
- ✅ Linear project with initial update
- ✅ ALL Linear tasks (issues) created from BRIEF.md
- ✅ PROJECT_IDS.json with mappings

## What Changed (Latest Update)

### Previous Issues
- Webhook returned `null` values due to unresolved n8n template expressions
- GitHub repo created without README
- No initial Linear project update
- Unreliable task creation

### Fixes
- **Direct API Integration**: Bypasses webhook for critical operations
- **GitHub README**: Automatically creates README.md with BRIEF content
- **Linear First Update**: Adds initialization comment to project
- **Reliable Task Creation**: Creates ALL 54 tasks with proper error handling
- **Better Logging**: Clear progress indicators and error messages
- **Fallback Strategy**: Webhook used only for notifications (non-critical)

## Prerequisites

### 1. Create `.env` file

```bash
# Copy the example file
cp .env.example .env
```

### 2. Add Your Tokens

Edit `.env` and add:

**GitHub Token** (https://github.com/settings/tokens):
- Classic token with `repo` scope
- Or fine-grained token with repository permissions

**Linear API Key** (https://linear.app/settings/api):
- Create API key with write permissions

```env
GITHUB_TOKEN=your_github_token_here
GITHUB_ORG=your_org_or_username

LINEAR_API_KEY=your_linear_api_key_here
LINEAR_TEAM_ID=your_linear_team_id
```

## Usage

### Standard Run

```bash
node scripts/indiana.js
```

### Dry Run (Test Mode)

```bash
node scripts/indiana.js --dry-run
```

Or:

```bash
DRY_RUN=true node scripts/indiana.js
```

## What It Does

### Step 1: Validation
- Reads `.antigravity/context/BRIEF.md`
- Validates required fields (PROJECT BRIEF header, Archetype)
- Extracts tasks using regex: `- [ ] TASK-XXX: Description`

### Step 2: GitHub Repository
- Creates private repo: `{GITHUB_ORG}/{project-name}`
- Description: `{archetype} - Created by New Genesis`
- Initializes with README.md containing full BRIEF content

### Step 3: Linear Project
- Creates project in team: `{LINEAR_TEAM_ID}`
- Description includes archetype and full BRIEF
- Adds initial comment: "🚀 Project initialized by New Genesis"

### Step 4: Linear Tasks
- Creates ALL tasks from BRIEF (e.g., 54 tasks)
- Format: `TASK-001: M01_01 Bootstrap repository container`
- Batched creation (5 at a time) to avoid rate limits
- Progress indicator shows: `Created 5/54 tasks...`

### Step 5: PROJECT_IDS.json
Saves complete mapping to `.antigravity/PROJECT_IDS.json`:

```json
{
  "projectName": "catchacrm-ng-v11",
  "archetype": "TYPE 1",
  "github": {
    "id": 123456789,
    "nodeId": "R_kgDOABCDEF",
    "url": "https://github.com/shoomacca/catchacrm-ng-v11"
  },
  "linear": {
    "projectId": "abc123-def456-ghi789",
    "teamId": "2782310d-ec67-461f-ac02-6e3c87f83a04",
    "projectUrl": "https://linear.app/bsbsbs/project/catchacrm-ng-v11-abc123"
  },
  "tasks": {
    "TASK-001": {
      "linearId": "issue-id-001",
      "linearIdentifier": "BSB-123",
      "linearUrl": "https://linear.app/bsbsbs/issue/BSB-123",
      "title": "M01_01 Bootstrap repository container"
    },
    ...
  }
}
```

### Step 6: Notification (Best Effort)
- Sends webhook to n8n for Telegram notification
- Non-critical - script succeeds even if this fails

## Output Example

```
🚀 NEW GENESIS - Project Genesis Initialization

============================================================

📋 Project: catchacrm-ng-v11
📦 Archetype: TYPE 1
📝 Tasks: 54

============================================================

📦 Creating GitHub repository...
📝 Adding README with project brief...
✅ README created successfully

📋 Creating Linear project...
💬 Adding initial project update...
✅ Project update added successfully

📝 Creating 54 Linear tasks...
   Created 5/54 tasks...
   Created 10/54 tasks...
   Created 15/54 tasks...
   ...
   Created 54/54 tasks...
✅ Task creation complete: 54 succeeded, 0 failed

📡 Sending notification webhook...

============================================================

✅ PROJECT GENESIS COMPLETE

📁 Project IDs saved: ./.antigravity/PROJECT_IDS.json

✅ GitHub: https://github.com/shoomacca/catchacrm-ng-v11
✅ Linear: https://linear.app/bsbsbs/project/catchacrm-ng-v11-abc123
✅ Tasks: 54/54 created

============================================================
```

## Error Handling

### GitHub Token Missing
```
⚠️  GITHUB_TOKEN not set, skipping GitHub repo creation
❌ GitHub: Failed - No token
```

### Linear Token Missing
```
⚠️  LINEAR_API_KEY not set, skipping Linear project creation
❌ Linear: Failed - No token
```

### Partial Task Creation
If some tasks fail, you'll see:
```
⚠️  Failed to create task TASK-042: HTTP 429
✅ Task creation complete: 52 succeeded, 2 failed
```

The script still saves PROJECT_IDS.json with partial results.

### Critical Failure
If both GitHub AND Linear fail:
```
⚠️  WARNING: Some resources failed to create. Check errors above.
```
Script exits with code 1.

## Troubleshooting

### "No BRIEF.md found"
Ensure `.antigravity/context/BRIEF.md` exists with tasks in format:
```markdown
## 2.5 INITIAL TASKS

- [ ] TASK-001: M01_01 Bootstrap repository container
- [ ] TASK-002: M01_02 Migration staging brief
```

### "BRIEF validation failed"
BRIEF.md must include:
- `# PROJECT BRIEF:` header
- `**Archetype**` field with `TYPE X`

### Rate Limiting
Linear/GitHub may rate limit. The script:
- Batches requests (5 tasks per batch)
- Adds 500ms delay between batches
- Retries failed requests (up to 3 times)

### Webhook Timeout
If the notification webhook times out (10s), it's ignored - all critical work is already done.

## Migration from Old indiana.js

The old script relied on the webhook to create everything. Issues:
1. Webhook returned n8n template expressions like `={{ $json.id }}`
2. sanitizeValue() stripped these to `null`
3. PROJECT_IDS.json had no real data

The new script:
- Creates resources directly via GitHub/Linear APIs
- Saves real IDs immediately
- Webhook is optional (notifications only)

## Next Steps

After running indiana.js:

1. **Verify GitHub**: Check README contains your BRIEF
2. **Verify Linear**: All tasks exist and are linked to project
3. **Run Milestone Script**: `node scripts/indiana_milestone.js` to update task status
4. **Begin Development**: Start executing shards from `.antigravity/shards/`

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | Yes | - | GitHub personal access token |
| `GITHUB_ORG` | No | `shoomacca` | GitHub organization/username |
| `LINEAR_API_KEY` | Yes | - | Linear API key |
| `LINEAR_TEAM_ID` | No | `2782310d...` | Linear team UUID |
| `RESEARCH_WEBHOOK_URL` | No | `https://ai.bsbsbs.au/webhook/research_role` | Research webhook |
| `DRY_RUN` | No | `false` | Test mode (no changes) |

## License

Part of NEW GENESIS v1.1 - Automated Team System
