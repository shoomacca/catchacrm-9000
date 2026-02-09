# NEW GENESIS: New Project Flow (Operator Guide)

**Purpose:** Plain‑English guide for starting a NEW GENESIS project and handing off between roles (Manager → Consultant → Developer → Automator → Tools → Overseer).

---

## 1) Start a New Project

Run:
```bash
ng "<project idea>"
```

The Manager flow will:
- Ask Matrix questions
- Classify archetype
- Create the project folder
- Scaffold `.antigravity/` with BRIEF/STACK/PLAN/shards/progress

---

## 2) Environment Selection

Choose one:
- **OpenCode** → uses `opencode.json`
- **Claude Code** → uses `.claudecode-config.json`

The selected environment is saved in `.antigravity/status/progress.json` and used by `scripts/genesis.js`.

---

## 3) Run Indiana Genesis (Project Creation)

From the **project root**:
```bash
node scripts/indiana.js
```

This creates:
- GitHub repo
- Linear project + tasks
- Vercel project
- Writes `.antigravity/PROJECT_IDS.json`

---

## 4) Shard Execution (Developer)

From the **project root**:
```bash
node scripts/genesis.js
```

This will:
- Load BRIEF + STACK
- Run each shard in order
- Mark shards complete in `progress.json`

---

## 5) Milestone Completion (Developer)

After all shards for a milestone are done:
```bash
node scripts/indiana_milestone.js "@Developer" "M01_COMPLETE" "@NextAgent" "Summary" '["TASK-001","TASK-002"]'
```

This will:
- Post milestone notes to Linear
- Mark tasks Done
- Commit + push to `dev`

---

## 6) Role Hand‑Off (Overseer Guidance Only)

The **environment/agent decides what’s next** by reading the context files. The Overseer only opens a new window and provides the instruction to **open the project** and **read the required context** (see section 8). No handoff commands are required for the Overseer.

---

## 7) Overseer Audit + Ship

When everything is complete:
```bash
node scripts/ng-verify-milestone.js
node scripts/indiana_merge.js
```

---

## 8) What Each LLM Session Needs

**Every new LLM session should read only:**
1. `.antigravity/context/BRIEF.md`
2. `.antigravity/context/STACK.md`
3. Current shard file in `.antigravity/shards/`

Then execute **only that shard** and exit.
