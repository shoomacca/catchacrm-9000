# The Scribe - Intelligent Milestone Summarizer

**Version:** 1.1
**File:** `scripts/scribe.js`
**Purpose:** Automatically generate release notes from git commits using LLM

---

## Overview

The Scribe is an intelligent agent that:
1. **Reads git commits** from a completed milestone
2. **Uses a fast LLM** (Claude Haiku or GPT-4o-mini) to summarize the work
3. **Generates polished release notes** in markdown format
4. **Posts to Slack/Telegram** via n8n webhook

---

## How It Works

### Trigger

The Scribe is called automatically by `genesis.js` when a milestone completes:

```javascript
// In genesis.js, when milestone complete:
if (milestone.status === 'complete') {
  triggerMilestoneScribe(milestone);
  // Calls: node scripts/scribe.js M01 "@Developer"
}
```

### Execution Flow

```
1. Load progress.json and find milestone M01
   ↓
2. Search git log for commits matching M01:
   - Searches for: "[.*M01", "feat(M01_", "fix(M01_"
   - Falls back to recent commits if none found
   ↓
3. Parse commits into structured list:
   - feat(M01_01): Add users table
   - feat(M01_02): Implement GET /api/users
   - fix(M01_03): Fix session refresh token
   ↓
4. Build LLM prompt:
   - Context: Milestone ID, name, commit count
   - Task: Generate release notes
   - Format: Markdown with categories
   ↓
5. Call LLM API (Anthropic or OpenAI):
   - Model: claude-3-5-haiku-20241022 (fast, cheap)
   - OR: gpt-4o-mini (fast, cheap)
   - Max tokens: 1024
   ↓
6. Receive structured summary:
   ## M01: Foundation Setup

   ### 🎯 What Was Built
   - Database schema with users, posts, comments tables
   - RESTful API endpoints with pagination
   - Authentication flow with Supabase

   ### 🐛 Fixes
   - Fixed timestamp defaults
   - Fixed session refresh handling

   ### 📊 Stats
   - Commits: 11
   ↓
7. Save to .antigravity/milestones/M01_SUMMARY.md
   ↓
8. Call indiana_milestone.js with summary:
   - Posts to n8n webhook
   - n8n sends to Slack/Telegram
   - Updates Linear project
   - Commits to GitHub
```

---

## Configuration

### Environment Variables

```bash
# LLM Provider (default: anthropic)
export SCRIBE_LLM_PROVIDER="anthropic"  # or "openai"

# Anthropic API Key
export SCRIBE_ANTHROPIC_API_KEY="sk-ant-..."
# OR use existing:
export ANTHROPIC_API_KEY="sk-ant-..."

# OpenAI API Key
export SCRIBE_OPENAI_API_KEY="sk-..."
# OR use existing:
export OPENAI_API_KEY="sk-..."
```

### Model Selection

**Anthropic (default):**
- Model: `claude-3-5-haiku-20241022`
- Speed: ~2-3 seconds
- Cost: $0.001 per 1K tokens (~$0.003 per summary)

**OpenAI:**
- Model: `gpt-4o-mini`
- Speed: ~2-3 seconds
- Cost: $0.15/$0.60 per 1M tokens (~$0.001 per summary)

**Fallback (if no API key):**
- Generates basic summary without LLM
- Lists commits as-is
- Still saves to file and posts to n8n

---

## Usage

### Automatic (via genesis.js)

The Scribe is triggered automatically when a milestone completes:

```bash
# Run Genesis orchestrator
node scripts/genesis.js

# When M01 complete:
# ╔═══════════════════════════════════════════════════════════════════╗
# ║  MILESTONE M01 COMPLETE: Foundation Setup                          ║
# ╚═══════════════════════════════════════════════════════════════════╝
#
# 📝 Triggering The Scribe (scribe.js)...
# [Scribe generates summary and posts to n8n]
```

### Manual (for testing)

```bash
# Run The Scribe for a specific milestone
node scripts/scribe.js M01 "@Developer"

# Parameters:
#   M01 - Milestone ID
#   "@Developer" - Agent name (optional, default: @Developer)
```

### Test Script

```bash
# Run test without posting to n8n
node scripts/test-scribe.js

# Creates fake project, commits, and tests The Scribe
# Shows generated summary without sending notifications
```

---

## Output Format

### Generated Summary

```markdown
## M01: Foundation Setup

### 🎯 What Was Built
- **Database Schema**: Created users, posts, and comments tables with UUID primary keys and proper foreign key relationships
- **API Layer**: Implemented RESTful endpoints for user management with pagination support
- **Authentication**: Set up Supabase auth client with login/logout functionality and session management

### 🐛 Fixes
- Fixed timestamp defaults to use NOW() instead of hardcoded values
- Fixed session refresh token handling to prevent auth errors

### 🔧 Infrastructure
- Updated API documentation with new endpoints and examples

### 📊 Stats
- Commits: 11
- Tables: 3
- Endpoints: 5
```

### Saved Location

```
.antigravity/
└── milestones/
    ├── M01_SUMMARY.md
    ├── M02_SUMMARY.md
    └── M03_SUMMARY.md
```

---

## Integration with n8n

### Workflow Requirements

Your n8n workflow at `https://ai.bsbsbs.au/webhook/indiana-milestone` should:

1. **Receive payload:**
   ```json
   {
     "projectName": "test-app",
     "agent": "@Developer",
     "milestone": "M01_COMPLETE",
     "summary": "Completed Foundation Setup",
     "milestone_notes": "[The Scribe's generated summary in markdown]",
     "completedLinearTasks": [...],
     "linearProjectId": "...",
     "timestamp": "..."
   }
   ```

2. **Extract milestone_notes:**
   - Contains the rich markdown summary from The Scribe

3. **Post to Slack:**
   ```
   📋 Milestone M01 Complete!

   [milestone_notes content]

   Linear: [link]
   GitHub: [link]
   ```

4. **Post to Telegram:**
   ```
   🎉 Milestone M01: Foundation Setup - COMPLETE

   [milestone_notes content]
   ```

5. **Update Linear:**
   - Mark all completed tasks as Done
   - Add comment with summary to project

---

## Git Commit Detection

### Search Strategy

The Scribe searches for commits in order of specificity:

1. **Milestone-specific commits:**
   ```bash
   git log --grep="\[.*M01"    # [M01], [@Developer M01]
   git log --grep="feat(M01_"   # feat(M01_01), feat(M01_02)
   git log --grep="fix(M01_"    # fix(M01_03)
   ```

2. **Recent commits (fallback):**
   ```bash
   git log -n 50  # Last 50 commits
   ```

### Commit Message Format

**Recommended format for best results:**

```bash
# Feature commits
git commit -m "feat(M01_01): Add users table with UUID primary key"
git commit -m "feat(M01_02): Implement GET /api/users endpoint"

# Fix commits
git commit -m "fix(M01_03): Fix session refresh token handling"

# Other commits
git commit -m "docs(M01): Update API documentation"
git commit -m "test(M01_02): Add user endpoint tests"
```

**Format breakdown:**
- `feat(M01_01):` - Type and shard ID
- `Add users table` - Brief description

The Scribe will:
- Group by type (feat, fix, docs, test)
- Extract meaningful descriptions
- Categorize appropriately

---

## Prompt Engineering

### LLM Prompt Structure

```markdown
You are a technical writer creating release notes for a software project milestone.

# Context
Milestone: M01 - Foundation Setup
Number of commits: 11

# Git Commits
- feat(M01_01): Add users table with UUID primary key
- feat(M01_01): Add posts table with foreign key to users
- [... more commits ...]

# Task
Generate a concise, professional release note summary in markdown format.

# Requirements
1. Group commits by category (Features, Fixes, Infrastructure, etc.)
2. Use bullet points
3. Be technical but clear
4. Max 300 words
5. Focus on WHAT was built, not HOW

# Output Format
## M01: Foundation Setup

### 🎯 What Was Built
[Bulleted list of features and changes]

### 🐛 Fixes
[Bulleted list of bug fixes, if any]

### 🔧 Infrastructure
[Bulleted list of tooling/infrastructure changes, if any]

### 📊 Stats
- Commits: 11
- [Any other relevant stats]

Generate the release notes now:
```

### Customization

To customize the prompt, edit `scribe.js`:

```javascript
function buildPromptForSummarization(milestoneId, milestoneName, commits) {
  // Modify this function to change the prompt structure
  // Add more context, change requirements, adjust format
}
```

---

## Error Handling

### No Git Commits Found

**Cause:** No commits match the milestone pattern

**Behavior:**
- Scribe warns: `⚠️ No milestone-specific commits found`
- Falls back to recent 50 commits
- Generates summary from recent work

**Solution:**
- Use proper commit message format: `feat(M01_01): ...`
- Or manually specify commit range

### LLM API Failure

**Cause:** API key invalid, rate limit, network error

**Behavior:**
- Scribe warns: `⚠️ LLM summarization failed`
- Falls back to basic summary (lists commits as-is)
- Still saves file and posts to n8n

**Solution:**
- Check API key is valid
- Check network connection
- Verify API quota/rate limits

### indiana_milestone.js Failure

**Cause:** n8n webhook down, network error

**Behavior:**
- Scribe reports error: `❌ Failed to call indiana_milestone.js`
- Summary still saved to file
- Orchestrator continues to next milestone

**Solution:**
- Check n8n workflow is active
- Manually post summary to Slack/Telegram
- Re-run scribe.js for that milestone

---

## Testing

### Quick Test

```bash
# Set API key
export ANTHROPIC_API_KEY="sk-ant-..."

# Run test script
node scripts/test-scribe.js
```

**Expected output:**
```
╔═══════════════════════════════════════════════════════════════════╗
║                  THE SCRIBE - TEST SCRIPT                         ║
╚═══════════════════════════════════════════════════════════════════╝

📦 Setting up test environment...
✅ Created test progress.json
✅ Created 11 test commits

🔍 Checking LLM configuration...
Provider: anthropic
Anthropic API Key: ✅ Set

🚀 Running The Scribe...

╔═══════════════════════════════════════════════════════════════════╗
║                     THE SCRIBE v1.1                               ║
║              Milestone Summary Generator                          ║
╚═══════════════════════════════════════════════════════════════════╝

📋 Milestone: M01
👤 Agent: @Developer

📖 Loading progress.json...
✅ Found milestone: Foundation Setup
   Status: complete
   Shards: 3

📜 Reading git log...
✅ Found 11 commits

🤖 Generating summary using ANTHROPIC (claude-3-5-haiku-20241022)...

📝 Generated Summary:
─────────────────────────────────────────────────────────────────
## M01: Foundation Setup

### 🎯 What Was Built
- Database schema with users, posts, and comments tables
- RESTful API endpoints with pagination
- Authentication with Supabase

### 🐛 Fixes
- Fixed timestamp defaults
- Fixed session refresh handling

### 📊 Stats
- Commits: 11
─────────────────────────────────────────────────────────────────

✅ Summary saved to: .test-scribe/.antigravity/milestones/M01_SUMMARY.md

✨ Test complete!
```

### Manual Test with Real Project

```bash
# In a real Genesis project
cd /path/to/project

# Ensure milestone is complete in progress.json

# Run The Scribe
node scripts/scribe.js M01 "@Developer"

# Check output
cat .antigravity/milestones/M01_SUMMARY.md
```

---

## Troubleshooting

### "progress.json not found"

**Problem:** Running scribe.js outside a Genesis project

**Solution:**
```bash
# Ensure you're in project root
cd /path/to/project

# Ensure .antigravity/status/progress.json exists
ls -la .antigravity/status/progress.json
```

### "Milestone M01 not found"

**Problem:** Milestone ID doesn't exist in progress.json

**Solution:**
```bash
# Check available milestones
cat .antigravity/status/progress.json | grep '"id"'

# Use correct milestone ID
node scripts/scribe.js M02 "@Developer"
```

### "No commits found"

**Problem:** Git log returned no commits

**Solution:**
```bash
# Check git repo exists
git log --oneline -n 5

# Use proper commit format in future
git commit -m "feat(M01_01): description"
```

### "LLM API error: 401"

**Problem:** Invalid API key

**Solution:**
```bash
# Check API key is set
echo $ANTHROPIC_API_KEY

# Set correct key
export ANTHROPIC_API_KEY="sk-ant-..."

# Or use OpenAI instead
export SCRIBE_LLM_PROVIDER="openai"
export OPENAI_API_KEY="sk-..."
```

---

## Advanced Usage

### Custom LLM Provider

To add a new LLM provider (e.g., Gemini, Mistral):

1. Edit `scribe.js`
2. Add new function:
   ```javascript
   async function callGeminiAPI(prompt) {
     // Implement Gemini API call
   }
   ```
3. Update provider switch:
   ```javascript
   if (LLM_PROVIDER === 'gemini') {
     return await callGeminiAPI(prompt);
   }
   ```
4. Set environment variable:
   ```bash
   export SCRIBE_LLM_PROVIDER="gemini"
   export SCRIBE_GEMINI_API_KEY="..."
   ```

### Custom Summary Format

To change the summary format:

1. Edit `buildPromptForSummarization()` in `scribe.js`
2. Modify the `# Output Format` section
3. Add custom sections, emojis, structure

Example custom format:
```markdown
### 🚀 New Features
- [Features list]

### 🔨 Breaking Changes
- [Breaking changes list]

### 📈 Metrics
- Lines of code: XXX
- Files changed: XXX
```

---

## Comparison: Before vs After

### Without The Scribe

```
Milestone complete → indiana_milestone.js
  ↓
Posts to Slack: "Milestone M01 complete"
  ↓
User has to manually review commits
```

### With The Scribe

```
Milestone complete → scribe.js
  ↓
Reads git commits
  ↓
LLM generates rich summary
  ↓
Posts to Slack: [Detailed release notes with categories]
  ↓
User sees exactly what was built
```

---

## Success Criteria

The Scribe is working correctly when:

- ✅ Reads git commits for milestone
- ✅ Calls LLM API successfully (or falls back gracefully)
- ✅ Generates structured markdown summary
- ✅ Saves summary to `.antigravity/milestones/`
- ✅ Calls indiana_milestone.js with summary
- ✅ Summary appears in Slack/Telegram notification
- ✅ Summary is professional and concise

---

**THE SCRIBE v1.1** - Intelligent milestone summarization with LLM.

**Key Innovation:** Transforms raw commit messages into polished release notes automatically.
