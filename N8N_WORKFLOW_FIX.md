# N8N Workflow Fix - "Respond to Webhook" Node

## The Problem

The "Respond to Webhook" node is manually constructing JSON with template expressions like:
```
"archetype": "={{ $('Validate & Clean Input').item.json.archetype }}"
```

This results in the webhook returning unresolved expressions instead of actual values:
```json
{
  "archetype": "={{ $('Validate & Clean Input').item.json.archetype }}",
  "project": {
    "github": {
      "id": "={{ $('GitHub: Create Repo').item.json.id || null }}"
    }
  }
}
```

## The Solution

The workflow already has a "Build Webhook Response" node that correctly constructs the JSON. The "Respond to Webhook" node just needs to USE it.

### Fix Instructions

1. **Open n8n workflow:** "Indiana Genesis - Github & Linear Sync"

2. **Click on "Respond to Webhook" node**

3. **Change these settings:**
   - **Respond With:** `Using 'Respond to Webhook' Node` (keep as is)
   - **Response Mode:** Delete the current `responseBody` content
   - **Replace with:** `{{ $json }}`

   This tells it to return the JSON object from the previous node ("Build Webhook Response") directly.

### Alternative Fix (Simpler)

If the above doesn't work, try:

1. **Delete the "Respond to Webhook" node**
2. **Add a new "Respond to Webhook" node**
3. **Connect it after "Build Webhook Response"**
4. **Settings:**
   - Respond With: `Using 'Respond to Webhook' Node`
   - Response Data Source: `First Incoming Item`

   Leave everything else default.

## Verification

After fixing, test with:

```bash
node scripts/indiana.js
```

Check `.antigravity/PROJECT_IDS.json` - all values should be real (not null):

```json
{
  "github": {
    "id": 123456789,  // Real number, not null
    "url": "https://github.com/..."  // Real URL, not null
  },
  "linear": {
    "projectId": "abc123...",  // Real UUID, not null
    "projectUrl": "https://linear.app/..."  // Real URL, not null
  },
  "tasks": {
    "TASK-001": {
      "linearId": "real-uuid",  // Real value
      "linearIdentifier": "BSB-123",  // Real identifier
      "linearUrl": "https://linear.app/..."  // Real URL
    }
  }
}
```

## Technical Explanation

### Why String Templates Don't Work

When you use:
```json
"responseBody": "{ \"id\": \"={{ $json.id }}\" }"
```

n8n treats this as a STRING, not JSON. The `={{ }}` expressions inside strings aren't evaluated.

### Correct Approach

The "Build Webhook Response" node creates a proper JavaScript object:
```javascript
return {
  json: {
    success: true,
    project: {
      github: {
        id: githubData.id  // Actual value, not string template
      }
    }
  }
}
```

Then "Respond to Webhook" should just pass it through with `{{ $json }}`.

## If You Can't Edit the Workflow

If you can't access n8n to fix the workflow, use the direct API version of indiana.js that I created. But the PROPER fix is to correct the n8n workflow as described above.
