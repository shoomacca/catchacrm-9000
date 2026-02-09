# MCP Services for NEW GENESIS v8.2

**Version:** 8.2
**Last Updated:** 2026-01-14
**Purpose:** Document available MCP endpoints and their purposes

---

## Overview

NEW GENESIS uses MCP (Model Context Protocol) endpoints at your n8n instance (`https://ai.bsbsbs.au`) to provide specialized capabilities to different agents.

---

## Available MCP Endpoints

### 1. Research MCP (`/mcp/research`)

**Purpose:** Deep AI research using Perplexity
**Used by:** @Research agent
**Status:** ✅ **ACTIVE**

**What it does:**
- Receives research queries from @Research
- Calls Perplexity AI for current web information
- Returns researched answers with citations
- Saves tokens (88% reduction vs inline research)

**Example usage:**
```json
POST https://ai.bsbsbs.au/mcp/research
{
  "query": "Best authentication library for Next.js 15 with Supabase in 2026",
  "context": "Building B2B SaaS app, need RLS support",
  "depth": "detailed"
}
```

**Returns:**
```json
{
  "success": true,
  "answer": "Based on current research...",
  "citations": [
    {"url": "https://supabase.com/docs/...", "title": "..."},
    {"url": "https://github.com/supabase/...", "title": "..."}
  ],
  "timestamp": "2026-01-14T..."
}
```

**Benefits:**
- ✅ Current information (2025-2026)
- ✅ Token efficient
- ✅ Sourced answers
- ✅ Deep analysis capability

---

### 2. n8n Skills Repository (Direct GitHub Access)

**Purpose:** Search pre-built n8n workflows and skills
**Used by:** @Automator agent
**Status:** ✅ **AVAILABLE** (via GitHub API - no MCP needed)

**What it should do:**
- Search czlonkowski/n8n-skills repository
- Find pre-built workflows matching query
- Return workflow JSONs and metadata
- Help @Automator find existing solutions

**Proposed implementation:**
```json
POST https://ai.bsbsbs.au/mcp/n8n-skills
{
  "query": "stripe webhook handler",
  "category": "payments" // optional
}
```

**Should return:**
```json
{
  "success": true,
  "skills": [
    {
      "name": "stripe-webhook-handler",
      "url": "https://github.com/czlonkowski/n8n-skills/workflows/...",
      "description": "Handles Stripe webhooks with signature validation",
      "nodes": 8,
      "tags": ["stripe", "webhook", "payments"],
      "workflowJson": { ... } // optional: actual workflow
    }
  ]
}
```

**Implementation approach:**
1. Create n8n workflow at `https://ai.bsbsbs.au/workflow/mcp-n8n-skills`
2. Add webhook trigger: `/mcp/n8n-skills`
3. Use GitHub API to search czlonkowski/n8n-skills repo
4. Parse workflow JSON files
5. Return formatted results

---

### 3. Code Search (`/mcp/code-search`)

**Purpose:** Find GitHub repositories and code examples
**Used by:** @Research and @Developer agents
**Status:** ⏳ **OPTIONAL** (Can use Research MCP)

**What it should do:**
- Search GitHub for repos matching tech stack
- Filter by stars, language, recency
- Return repo metadata and examples
- Help find proven implementations

**Proposed implementation:**
```json
POST https://ai.bsbsbs.au/mcp/code-search
{
  "query": "Next.js 15 Supabase authentication example",
  "language": "typescript",
  "minStars": 100,
  "recency": "6months"
}
```

**Should return:**
```json
{
  "success": true,
  "repos": [
    {
      "name": "supabase/auth-helpers",
      "url": "https://github.com/supabase/auth-helpers",
      "stars": 2400,
      "description": "...",
      "lastUpdated": "2026-01-05",
      "language": "TypeScript",
      "examples": ["..."]
    }
  ]
}
```

**Note:** This can be handled by Research MCP (Perplexity searches GitHub), so lower priority.

---

## Current Status Summary

| MCP Endpoint | Status | Agent | Priority | Notes |
|--------------|--------|-------|----------|-------|
| `/mcp/research` | ✅ Active | @Research | High | Perplexity integration working |
| `/mcp/n8n-skills` | ⏳ Planned | @Automator | **CRITICAL** | Needed for workflow discovery |
| `/mcp/code-search` | ⏳ Optional | @Research/@Developer | Low | Can use Research MCP instead |

---

## Immediate Action: Build n8n Skills MCP

**Why it's critical:**
@Automator needs to find pre-built workflows to avoid reinventing the wheel. The n8n-skills repo (czlonkowski/n8n-skills) contains workflows for:
- Stripe webhooks
- Email validation
- Data transformations
- API integrations
- And more...

**Without this MCP:**
@Automator has to build everything from scratch (slow, error-prone)

**With this MCP:**
@Automator can:
1. Search for existing workflows
2. Clone and adapt them
3. Ship faster with proven patterns

---

## Building n8n Skills MCP

### Step 1: Create Workflow in n8n

**Workflow Name:** `MCP: n8n Skills Search`
**Webhook Path:** `/mcp/n8n-skills`

### Step 2: Workflow Structure

```
┌─────────────┐
│  Webhook    │  POST /mcp/n8n-skills
│  Trigger    │  { "query": "...", "category": "..." }
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Parse     │  Extract query and filters
│   Input     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   GitHub    │  Search code in czlonkowski/n8n-skills
│   API Call  │  GET /search/code?q={query}+repo:czlonkowski/n8n-skills
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Fetch     │  For each result, get workflow JSON
│   Workflows │  GET /repos/.../contents/{path}
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Format    │  Structure response with metadata
│   Response  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Return    │  JSON response to caller
│   JSON      │
└─────────────┘
```

### Step 3: Code Node Implementation

```javascript
// Node: GitHub API Search
const query = $json.query;
const category = $json.category || '';

// Search n8n-skills repo
const searchQuery = `${query} ${category} repo:czlonkowski/n8n-skills extension:json`;
const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=10`;

const searchResponse = await fetch(searchUrl, {
  headers: {
    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
  }
});

const searchData = await searchResponse.json();

// Fetch actual workflow files
const skills = await Promise.all(
  (searchData.items || []).map(async (item) => {
    try {
      const fileResponse = await fetch(item.url, {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3.raw'
        }
      });

      const workflow = await fileResponse.json();

      return {
        name: item.name.replace('.json', ''),
        path: item.path,
        url: item.html_url,
        description: workflow.meta?.description || workflow.name || 'No description',
        nodes: workflow.nodes?.length || 0,
        tags: workflow.meta?.tags || [],
        author: workflow.meta?.author || 'czlonkowski',
        lastUpdated: workflow.meta?.lastUpdated || item.repository?.updated_at,
        // Optional: include full workflow JSON if requested
        workflowJson: $json.includeJson ? workflow : null
      };
    } catch (error) {
      return null;
    }
  })
);

// Filter out any failed fetches
const validSkills = skills.filter(s => s !== null);

return {
  json: {
    success: true,
    query: query,
    resultsCount: validSkills.length,
    skills: validSkills,
    timestamp: new Date().toISOString()
  }
};
```

### Step 4: Environment Variables Needed

```bash
# In n8n environment
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx  # Personal access token with repo:read
```

---

## How @Automator Will Use It

### Scenario: Building Stripe Integration

**Without MCP:**
```
@Automator: "I need to build Stripe webhook handler from scratch"
→ Designs 15 nodes manually
→ Writes signature validation code
→ Implements retry logic
→ 2-3 hours of work
```

**With MCP:**
```
@Automator: "Let me search n8n-skills for Stripe webhook"
→ Calls /mcp/n8n-skills with query: "stripe webhook"
→ Finds: "stripe-webhook-handler.json"
→ Downloads workflow JSON
→ Adapts to project needs
→ 30 minutes of work
```

---

## Testing the MCP

Once built, test with:

```bash
curl -X POST https://ai.bsbsbs.au/mcp/n8n-skills \
  -H "Content-Type: application/json" \
  -d '{
    "query": "stripe webhook",
    "category": "payments"
  }'
```

Expected response:
```json
{
  "success": true,
  "query": "stripe webhook",
  "resultsCount": 3,
  "skills": [
    {
      "name": "stripe-webhook-handler",
      "url": "https://github.com/czlonkowski/n8n-skills/...",
      "description": "Handles Stripe webhooks with signature validation",
      "nodes": 8,
      "tags": ["stripe", "webhook", "payments"]
    }
  ]
}
```

---

## Next Steps

### Priority 1: Build n8n Skills MCP ⚡

This is **critical** for @Automator to function efficiently. Without it, every workflow is built from scratch.

**Timeline:** 30-45 minutes to build
**Impact:** 10x faster workflow development

### Priority 2: Update ROLE_AUTOMATOR.md

Once MCP is built, update ROLE_AUTOMATOR.md to reference the new endpoint.

### Priority 3: Test Integration

Test with real @Automator workflow in catchacrm project.

---

## Summary

**What exists:**
- ✅ Research MCP (`/mcp/research`) - Perplexity for deep research

**What's needed:**
- ⚠️ **n8n Skills MCP (`/mcp/n8n-skills`)** - **CRITICAL for @Automator**
- 🔵 Code Search MCP - Optional (Research MCP covers this)

**Recommendation:** Build n8n Skills MCP before testing with catchacrm so @Automator can function properly.

---

**Would you like me to help build the n8n Skills MCP workflow, or should we proceed with catchacrm and note this as a limitation for now?**
