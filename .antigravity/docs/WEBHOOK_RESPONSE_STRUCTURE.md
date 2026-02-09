# Webhook Response Structure Analysis

**Date:** 2026-01-14
**Issue:** Task ID mappings not preserved between scripts

---

## Problem Identified

When `indiana.js` runs, the webhook creates:
- ✅ GitHub repo
- ✅ Linear project
- ✅ 10 Linear tasks

But the responses are separate and don't create a mapping file.

### What Webhook Creates

**GitHub Repo:**
```json
{
  "id": 1133115280,
  "node_id": "R_kgDOQ4n3kA",
  "name": "test-todo-app",
  "html_url": "https://github.com/shoomacca/test-todo-app"
}
```

**Linear Project:**
```json
{
  "id": "15590e36-c33e-46f5-9bf1-f93180f44716",
  "name": "test-todo-app",
  "url": "https://linear.app/bsbsbs/project/test-todo-app-92d2e431e7aa"
}
```

**Linear Tasks (10 separate responses):**
```json
[
  {
    "id": "4ba7db70-ad2e-4e92-bd7c-f01ddf3350fd",
    "identifier": "ANT-220",
    "title": ": Setup Next.js 15 project with TypeScript"
  },
  {
    "id": "e66e4893-e096-4c75-81a1-44ad2df5b1c8",
    "identifier": "ANT-216",
    "title": ": Install Tailwind CSS and configure"
  },
  ...
]
```

### The Missing Link

**Problem:** No mapping between:
- `TASK-001` (from BRIEF.md) → `ANT-220` (Linear identifier) → `4ba7db70-ad2e-4e92-bd7c-f01ddf3350fd` (Linear ID)

**Impact:** When `indiana_milestone.js` sends:
```json
{
  "completedTasks": ["TASK-001", "TASK-002", "TASK-003"]
}
```

The webhook receives "TASK-001" but doesn't know which Linear task to mark complete!

---

## Solution: Two Approaches

### Option 1: Webhook Returns Unified Response (Ideal)

**Change n8n workflow to return:**
```json
{
  "success": true,
  "project": {
    "name": "test-todo-app",
    "github": {
      "id": 1133115280,
      "nodeId": "R_kgDOQ4n3kA",
      "url": "https://github.com/shoomacca/test-todo-app"
    },
    "linear": {
      "projectId": "15590e36-c33e-46f5-9bf1-f93180f44716",
      "teamId": "bsbsbs",
      "url": "https://linear.app/bsbsbs/project/test-todo-app-92d2e431e7aa"
    },
    "vercel": {
      "projectId": "...",
      "url": "https://test-todo-app.vercel.app"
    }
  },
  "tasks": [
    {
      "taskId": "TASK-001",
      "linear": {
        "id": "4ba7db70-ad2e-4e92-bd7c-f01ddf3350fd",
        "identifier": "ANT-220",
        "url": "https://linear.app/bsbsbs/issue/ANT-220"
      }
    },
    {
      "taskId": "TASK-002",
      "linear": {
        "id": "e66e4893-e096-4c75-81a1-44ad2df5b1c8",
        "identifier": "ANT-216",
        "url": "https://linear.app/bsbsbs/issue/ANT-216"
      }
    }
    // ... all 10 tasks
  ]
}
```

Then `indiana.js` saves this to `.antigravity/PROJECT_IDS.json`.

### Option 2: Scripts Build Mapping Locally (Workaround)

If webhook can't be changed easily, `indiana.js` builds the mapping:

```javascript
// After webhook call, extract data from separate responses
const projectIds = {
  projectName: "test-todo-app",
  github: {
    id: githubResponse[0].id,
    nodeId: githubResponse[0].node_id,
    url: githubResponse[0].html_url
  },
  linear: {
    projectId: linearProjectResponse[0].data.projectCreate.project.id,
    teamId: "bsbsbs",  // hardcoded or from env
    url: linearProjectResponse[0].data.projectCreate.project.url
  },
  tasks: linearTasksResponse.map((taskResp, index) => ({
    taskId: inputPayload.tasks[index].id, // TASK-001, TASK-002, etc
    linear: {
      id: taskResp.data.issueCreate.issue.id,
      identifier: taskResp.data.issueCreate.issue.identifier,
      url: taskResp.data.issueCreate.issue.url
    }
  }))
};

// Save to file
fs.writeFileSync('./.antigravity/PROJECT_IDS.json', JSON.stringify(projectIds, null, 2));
```

---

## Required: PROJECT_IDS.json Structure

```json
{
  "projectName": "test-todo-app",
  "archetype": "TYPE 6",
  "createdAt": "2026-01-12T22:47:23.741Z",

  "github": {
    "id": 1133115280,
    "nodeId": "R_kgDOQ4n3kA",
    "url": "https://github.com/shoomacca/test-todo-app"
  },

  "linear": {
    "projectId": "15590e36-c33e-46f5-9bf1-f93180f44716",
    "teamId": "bsbsbs",
    "projectUrl": "https://linear.app/bsbsbs/project/test-todo-app-92d2e431e7aa"
  },

  "vercel": {
    "projectId": "...",
    "url": "https://test-todo-app.vercel.app"
  },

  "tasks": {
    "TASK-001": {
      "linearId": "4ba7db70-ad2e-4e92-bd7c-f01ddf3350fd",
      "linearIdentifier": "ANT-220",
      "linearUrl": "https://linear.app/bsbsbs/issue/ANT-220",
      "title": "Setup Next.js 15 project with TypeScript"
    },
    "TASK-002": {
      "linearId": "e66e4893-e096-4c75-81a1-44ad2df5b1c8",
      "linearIdentifier": "ANT-216",
      "linearUrl": "https://linear.app/bsbsbs/issue/ANT-216",
      "title": "Install Tailwind CSS and configure"
    },
    "TASK-003": {
      "linearId": "0277e632-5b3c-4c97-acfe-25b49adb7f13",
      "linearIdentifier": "ANT-218",
      "linearUrl": "https://linear.app/bsbsbs/issue/ANT-218",
      "title": "Setup Supabase client and environment variables"
    },
    "TASK-004": {
      "linearId": "ce58c204-71f8-4c80-89cf-5fbd22574e48",
      "linearIdentifier": "ANT-217",
      "linearUrl": "https://linear.app/bsbsbs/issue/ANT-217",
      "title": "Create database schema for tasks table"
    },
    "TASK-005": {
      "linearId": "3bff094a-81eb-4bb9-813d-1706491a7d84",
      "linearIdentifier": "ANT-219",
      "linearUrl": "https://linear.app/bsbsbs/issue/ANT-219",
      "title": "Verify build passes with no errors"
    },
    "TASK-006": {
      "linearId": "f697bc00-736d-4607-9a59-b91573b9f46c",
      "linearIdentifier": "ANT-222",
      "linearUrl": "https://linear.app/bsbsbs/issue/ANT-222",
      "title": "Create task list component with fetch from Supabase"
    },
    "TASK-007": {
      "linearId": "e5d051fb-eccd-4b7c-9f52-68faa141e728",
      "linearIdentifier": "ANT-223",
      "linearUrl": "https://linear.app/bsbsbs/issue/ANT-223",
      "title": "Implement 'Add Task' form with validation"
    },
    "TASK-008": {
      "linearId": "05099fc2-8362-4777-bb00-019a2635ed16",
      "linearIdentifier": "ANT-221",
      "linearUrl": "https://linear.app/bsbsbs/issue/ANT-221",
      "title": "Add 'Mark Complete' toggle functionality"
    },
    "TASK-009": {
      "linearId": "d0170360-e2e6-4433-9004-34dae991b204",
      "linearIdentifier": "ANT-224",
      "linearUrl": "https://linear.app/bsbsbs/issue/ANT-224",
      "title": "Add task deletion feature"
    },
    "TASK-010": {
      "linearId": "340bc848-7b9c-485a-9c7d-bc6c55384bb4",
      "linearIdentifier": "ANT-225",
      "linearUrl": "https://linear.app/bsbsbs/issue/ANT-225",
      "title": "Style components with Tailwind"
    }
  }
}
```

---

## Updated Workflow

### Step 1: indiana.js (Genesis) - After webhook response

```javascript
// Webhook responds with all the data above
// OR we build it from separate responses

// Save mappings
fs.writeFileSync('./.antigravity/PROJECT_IDS.json', JSON.stringify(projectIds, null, 2));
console.log('✅ Project IDs saved to .antigravity/PROJECT_IDS.json');
```

### Step 2: indiana_milestone.js (Checkpoint) - Include mappings

```javascript
// Read mappings
const projectIds = JSON.parse(fs.readFileSync('./.antigravity/PROJECT_IDS.json', 'utf8'));

// Build payload with Linear IDs
const payload = {
  projectName: projectIds.projectName,
  agent: "@Developer",
  milestone: "M1_COMPLETE",
  completedTasks: ["TASK-001", "TASK-002", "TASK-003"], // From args

  // ADD THESE - so webhook knows which Linear tasks to mark complete:
  completedLinearTasks: [
    {
      taskId: "TASK-001",
      linearId: projectIds.tasks["TASK-001"].linearId,
      linearIdentifier: projectIds.tasks["TASK-001"].linearIdentifier
    },
    {
      taskId: "TASK-002",
      linearId: projectIds.tasks["TASK-002"].linearId,
      linearIdentifier: projectIds.tasks["TASK-002"].linearIdentifier
    },
    {
      taskId: "TASK-003",
      linearId: projectIds.tasks["TASK-003"].linearId,
      linearIdentifier: projectIds.tasks["TASK-003"].linearIdentifier
    }
  ],

  // Project IDs for context
  linearProjectId: projectIds.linear.projectId,
  linearTeamId: projectIds.linear.teamId,
  githubRepoId: projectIds.github.id,

  nextAgent: "@Developer",
  summary: "Built foundation",
  timestamp: new Date().toISOString()
};

// Send to webhook
await fetch(MILESTONE_WEBHOOK, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

### Step 3: Webhook marks tasks complete

Now the webhook receives:
```json
{
  "completedLinearTasks": [
    {
      "taskId": "TASK-001",
      "linearId": "4ba7db70-ad2e-4e92-bd7c-f01ddf3350fd",
      "linearIdentifier": "ANT-220"
    }
  ]
}
```

And can mark Linear issue `4ba7db70-ad2e-4e92-bd7c-f01ddf3350fd` as Done!

---

## Implementation Priority

**Recommendation:** Use Option 2 (build mapping locally) because:
1. ✅ Doesn't require changing n8n workflow
2. ✅ Can implement immediately in scripts
3. ✅ Backward compatible

**Steps:**
1. Update `indiana.js` to build and save PROJECT_IDS.json
2. Update `indiana_milestone.js` to read and include mappings
3. Update `indiana_merge.js` to read and include mappings
4. Update n8n milestone webhook to use `completedLinearTasks`

---

## Next: Update Scripts

I'll now update:
1. `indiana.js` - Parse webhook responses, build PROJECT_IDS.json
2. `indiana_milestone.js` - Read PROJECT_IDS.json, send completedLinearTasks
3. `indiana_merge.js` - Read PROJECT_IDS.json, send all task IDs
