# N8N Workflow Enhancements

These additions will make your workflow create GitHub README and add Linear project comments.

## Enhancement 1: Add README to GitHub Repo

### New Node: "GitHub: Add README"

**Type:** HTTP Request
**Position:** After "GitHub: Create Repo"
**Trigger:** On success of "GitHub: Create Repo"

**Settings:**
```
Method: PUT
URL: https://api.github.com/repos/{{ $('Validate & Clean Input').item.json.projectName }}/contents/README.md
Authentication: Same as "GitHub: Create Repo" (HTTP Header Auth)
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/vnd.github+json

Body (JSON):
{
  "message": "docs: Add project brief",
  "content": "{{ Buffer.from($('Validate & Clean Input').item.json.brief).toString('base64') }}"
}

Continue On Fail: true
```

**JavaScript Alternative (Code Node):**
```javascript
const brief = $('Validate & Clean Input').item.json.brief;
const projectName = $('Validate & Clean Input').item.json.projectName;

return {
  json: {
    message: "docs: Add project brief",
    content: Buffer.from(brief).toString('base64'),
    projectName: projectName
  }
};
```

Then connect to HTTP Request node with:
```
URL: https://api.github.com/repos/shoomacca/{{ $json.projectName }}/contents/README.md
Body: {{ $json }}
```

---

## Enhancement 2: Add Initial Linear Project Comment

### New Node: "Linear: Add Project Comment"

**Type:** HTTP Request
**Position:** After "Linear: Create Project"
**Trigger:** On success of "Linear: Create Project"

**Settings:**
```
Method: POST
URL: https://api.linear.app/graphql
Authentication: Same as "Linear: Create Project"

Body (JSON):
{
  "query": "mutation CreateComment($projectId: String!, $body: String!) { commentCreate(input: { projectId: $projectId, body: $body }) { success } }",
  "variables": {
    "projectId": "{{ $('Linear: Create Project').item.json.data.projectCreate.project.id }}",
    "body": "🚀 Project initialized by New Genesis\n\nReady to begin milestone execution.\n\n**Archetype:** {{ $('Validate & Clean Input').item.json.archetype }}\n**Tasks:** {{ $('Validate & Clean Input').item.json.taskCount }}"
  }
}

Continue On Fail: true
```

---

## Updated Workflow Flow

```
Webhook: Indiana Genesis
  ↓
Validate & Clean Input
  ↓
  ├─→ GitHub: Create Repo
  │     ↓
  │   GitHub: Add README ← NEW
  │     ↓
  │   Vercel: Create Project
  │     ↓
  │   Wait for Both (input 0)
  │
  └─→ Linear: Create Project
        ↓
      Linear: Add Project Comment ← NEW
        ↓
      Has Tasks?
        ↓ (yes)
      Split Tasks
        ↓
      Linear: Create Issues
        ↓
      Wait for Both (input 1)

Wait for Both
  ↓
Compile Results
  ↓
Telegram: Notify
  ↓
Build Webhook Response
  ↓
Respond to Webhook ← FIX THIS (use {{ $json }})
```

---

## Quick Add Instructions

### Option 1: Export and Import

I'll create an updated workflow JSON with these nodes added. Import it to n8n.

### Option 2: Manual Add (Recommended)

1. **Open workflow in n8n**
2. **After "GitHub: Create Repo" node:**
   - Add HTTP Request node
   - Name: "GitHub: Add README"
   - Configure as shown above
   - Connect "GitHub: Create Repo" → "GitHub: Add README" → "Vercel: Create Project"

3. **After "Linear: Create Project" node:**
   - Add HTTP Request node
   - Name: "Linear: Add Project Comment"
   - Configure as shown above
   - Connect "Linear: Create Project" → "Linear: Add Project Comment" → "Has Tasks?"

4. **Fix "Respond to Webhook" node:**
   - Change responseBody to: `{{ $json }}`
   - Save workflow

5. **Test:**
   ```bash
   node scripts/indiana.js
   ```

---

## Benefits

After these changes:

✅ GitHub repo will have README.md with full BRIEF content
✅ Linear project will have initial comment/update
✅ Webhook will return REAL values (not template expressions)
✅ PROJECT_IDS.json will have actual IDs

All done through YOUR n8n workflow, not bypassed.
