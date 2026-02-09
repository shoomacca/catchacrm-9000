# NEW GENESIS AGENT PROTOCOL (v9.0)

**Last Updated:** 2026-01-15
**Compatible With:** Claude Code & OpenCode

## 1. THE ROSTER

| Agent       | Role               | Responsibility                        | Output                    |
| ----------- | ------------------ | ------------------------------------- | ------------------------- |
| @Manager    | Product Owner      | Interrogates user, classifies project | BRIEF.md                  |
| @Research   | Knowledge Finder   | Searches web, finds tools & patterns  | Research findings         |
| @Consultant | Architect          | Validates stack, designs schema       | DECISIONS.md, SQL schemas |
| @Developer  | Engineer           | Builds Next.js + Supabase             | Production code           |
| @Automator  | n8n Specialist     | Builds workflows, API pipes           | Workflow JSONs            |
| @Tools      | DevOps             | Deploys, syncs Linear/GitHub          | Infrastructure            |
| @Overseer   | Quality Gate       | Final audit before shipping           | APPROVAL / REJECTION      |

**Note:** @Overseer is performed by the HUMAN, not Claude.

## 2. SHARED CONTEXT PROTOCOL

**CRITICAL:** Before ANY response, read `DECISIONS.md` in the project folder.
After making ANY decision, append it to `DECISIONS.md`.

This ensures continuity across all sessions (Claude Code, OpenCode, or terminal environments).

### Windows Path Handling

**IMPORTANT for Windows users:**

When using bash commands (Git Bash, WSL), always use **forward slashes** `/` in paths:

**CORRECT:**
```bash
mkdir -p "C:/Users/Corsa/.antigravity/projects/my-project"
cp "C:/path/to/file.md" "C:/destination/"
```

**INCORRECT:**
```bash
mkdir "C:\Users\Corsa\.antigravity\projects\my-project"  # Fails in bash
copy "C:\path\to\file.md" "C:\destination\"  # 'copy' not found in bash
```

**Why:** Git Bash on Windows uses Unix-style commands but runs on Windows. Forward slashes work in both environments.

## 3. GIT WORKFLOW

### Branch Strategy

| Branch | Purpose                    | Who Pushes        |
| ------ | -------------------------- | ----------------- |
| `dev`  | Work in progress           | @Developer, @Automator, @Tools |
| `main` | Production (Vercel deploys)| @Overseer only    |

---

### Initialization (First Time Setup)

When starting a new project, `node indiana.js` automatically creates the GitHub repository with `main` branch. The first agent to write code (@Developer) creates the `dev` branch:

**Step 1:** @Manager runs `node indiana.js`
- Creates GitHub repo with `main` branch
- Sets up Linear project
- Configures Vercel project

**Step 2:** @Developer initializes git locally (if needed)
```bash
# Clone if remote already exists
git clone https://github.com/[org]/[project-name].git
cd [project-name]

# OR initialize if starting from scratch
git init
git remote add origin https://github.com/[org]/[project-name].git
```

**Step 3:** @Developer creates dev branch on first commit
```bash
git checkout -b dev
git add .
git commit -m "[@Developer] Initial setup: Project structure"
git push -u origin dev
```

From this point forward, all work happens on `dev` until @Overseer merges to `main`.

---

### Standard Development Flow

```
@Developer completes task → commit → push to dev
@Automator completes workflow → commit → push to dev
@Tools completes setup → commit → push to dev
@Overseer approves → merge dev→main → Vercel auto-deploys
```

**Example developer workflow:**
```bash
# Work on feature
# ... make changes ...

# Commit and push
git add .
git commit -m "[@Developer] Feature: Add login form"
git push origin dev

# At checkpoint, run milestone script (auto-pushes)
node scripts/indiana_milestone.js "@Developer" "TASK_COMPLETE" "@Automator" "Built 3 components"
```

---

### Handling Conflicts

If remote `dev` has changes:

```bash
# Pull latest changes
git pull origin dev --rebase

# If conflicts occur
# 1. Fix conflicts in your editor
# 2. Stage resolved files
git add .

# 3. Continue rebase
git rebase --continue

# 4. Push
git push origin dev
```

---

### Branch Protection Rules (Recommended)

Configure in GitHub:
- `main` branch:
  - Require pull request reviews
  - Require status checks to pass
  - No force push
  - No deletions
- `dev` branch:
  - No force push (optional)
  - Allow direct pushes by team

---

### Common Git Operations

**Check current state:**
```bash
git status
git log --oneline -5
git branch -a
```

**Switch branches:**
```bash
git checkout dev    # Switch to dev
git checkout main   # Switch to main
```

**View differences:**
```bash
git diff                    # Unstaged changes
git diff --staged          # Staged changes
git diff main..dev         # Compare branches
```

**Undo mistakes:**
```bash
git reset HEAD~1           # Undo last commit, keep changes
git checkout -- file.txt   # Discard changes to file
git clean -fd              # Remove untracked files (careful!)
```

---

## 4. DATE FORMAT STANDARDS

All dates in the Antigravity system use **ISO 8601 format** for consistency and sortability:

### File Timestamps
- **Format:** `YYYY-MM-DD HH:MM:SS`
- **Example:** `2026-01-10 14:30:00`
- **Used in:** DECISIONS.md, HANDOFF.md, change logs

### Version Folders
- **Format:** `X.0_DDMMYY`
- **Example:** `5.0_100126` (version 5.0, created January 10, 2026)
- **Directory:** `/version_history/5.0_100126/`

### Document Dates
- **Format:** `YYYY-MM-DD`
- **Example:** `2026-01-10`
- **Used in:** BRIEF.md, README files

### Git Commit Timestamps
- **Format:** ISO 8601 with timezone
- **Example:** `2026-01-10T14:30:00+00:00`
- **Automatically handled by git**

### Why ISO 8601?
- Universally recognized standard
- Sorts correctly (alphabetical = chronological)
- No ambiguity (unlike MM/DD/YY vs DD/MM/YY)
- Machine-readable for automation
- Timezone-aware when needed

---

## 5. THE MATRIX (Project Classification)

At Genesis, @Manager MUST classify the idea into ONE of 15 Archetypes.
You CANNOT proceed until the specific checklist is answered.

---

### TYPE 1: B2B SaaS

**Examples:** CRM, Timesheets, Project Management
**Goal:** Recurring Revenue, Multi-tenancy, Security

**Interrogation Checklist:**

1. **Tenancy Model:** Shared DB with RLS or Separate DB per customer?
2. **Auth & Gating:** Self-Serve (Stripe) or Sales-Led (Invite Only)? SSO required?
3. **Billing Logic:** Per Seat? Per Usage? Flat Rate? Free Tier expiry?
4. **Onboarding:** Empty State wizard or empty dashboard?
5. **Data Isolation:** Confirm User A cannot see User B's data.
6. **Admin Panel:** Does the client need to manage their own users?

---

### TYPE 2: E-Commerce / Catalog

**Examples:** Uniforms, Equipment, Digital Products
**Goal:** Conversion, SEO, Inventory Management

**Interrogation Checklist:**

1. **Product Complexity:** Simple SKUs or Matrix (Color x Size)? Custom uploads?
2. **Buy Flow:** Guest Checkout or Account Required?
3. **Inventory:** Real-time stock? Backordering allowed?
4. **SEO Strategy:** Static Generation (SSG) for ranking?
5. **CMS:** Developer-managed or Client-managed (Sanity/Airtable)?
6. **Payment:** Stripe, PayPal, or both? Afterpay?

---

### TYPE 3: Media & AI Engine

**Examples:** Vinto, Video Generator, Image Processing
**Goal:** High Performance, Low Latency, Cost Control

**Interrogation Checklist:**

1. **Async Loop:** Webhooks or Polling? Progress bar needed?
2. **Storage Policy:** Where do assets live (R2/S3)? TTL (Time To Live)?
3. **Queue Management:** What if 100 people click "Generate"? (Redis/BullMQ)
4. **Credit System:** How do we limit usage? (Credits per action)
5. **Fallbacks:** What if GPU API fails? (Retry logic, alternative provider)
6. **Output Formats:** What formats? What resolutions?

---

### TYPE 4: Marketplace

**Examples:** Uber for X, Job Board, Freelancer Platform
**Goal:** Trust, Liquidity, Payments

**Interrogation Checklist:**

1. **Supply Verification:** Manual approval or Automated KYC?
2. **Money Flow:** Escrow (Stripe Connect) or Direct payment?
3. **Double Blind:** Do buyers/sellers communicate anonymously?
4. **Dispute Resolution:** What happens if service isn't delivered?
5. **Commission:** Flat fee or percentage? Who pays?
6. **Reviews:** Two-way reviews? Verification required?

---

### TYPE 5: Automation Wrapper

**Examples:** n8n Frontend, API Dashboard, Integration Hub
**Goal:** Reliability, Interface for APIs

**Interrogation Checklist:**

1. **God API:** Which API is critical? Rate limits?
2. **State Management:** Database for history or pass-through UI?
3. **Error Handling:** User sees spinner or helpful error?
4. **Auth Passthrough:** User's API key or ours?
5. **Logs:** Do we need to show execution history?
6. **Webhooks:** Does the user need to receive webhooks?

---

### TYPE 6: Internal Tool

**Examples:** Admin Dashboard, Reporting Tool, Data Viewer
**Goal:** Speed, Data Density, Permissions

**Interrogation Checklist:**

1. **Source of Truth:** Spreadsheets or clean SQL DB?
2. **RBAC:** Who is Super Admin? Who is Read Only?
3. **Audit Logs:** Track who deleted what?
4. **Export:** PDF/CSV reports needed?
5. **Filters:** What search/filter capabilities?
6. **Real-time:** Live updates or refresh button?

---

### TYPE 7: Headless Automation

**Examples:** Pure n8n/AI workflow, No UI
**Goal:** The workflow IS the product

**Interrogation Checklist:**

1. **Trigger:** Event (Webhook), Time (Cron), or Polling?
2. **Payload:** What does the input JSON look like? (Define schema)
3. **Volume:** 1 record/hour or 10,000 at once? (Batching strategy)
4. **Failure State:** Retry automatically? Where to log errors?
5. **State:** Need a DB to remember "Last Run ID"?
6. **Output:** Where does the result go? (Webhook, Email, DB)

---

### TYPE 8: AI Agent / Chatbot

**Examples:** Customer support bot, coding assistant, AI workflow agent
**Goal:** Natural conversation, memory, tool use, accuracy

**Interrogation Checklist:**

1. **Conversation Type:** Single-turn Q&A or multi-turn conversation?
2. **Memory:** Need to remember conversation history? For how long?
3. **Tools:** What external APIs can the agent call? (Search, DB, CRM, etc.)
4. **Knowledge Base:** RAG over docs? Which documents/URLs?
5. **Persona:** What personality/tone? (Professional, friendly, technical)
6. **Guardrails:** What topics are off-limits? What can't it do?
7. **Handoff:** When should it escalate to a human?
8. **Channels:** Where does it live? (Web, Slack, Discord, API)

**Key Decisions:**
- LLM provider (OpenAI, Claude, Gemini, Local)
- Vector DB for RAG (Pinecone, Supabase pgvector, Weaviate)
- Framework (LangChain, LlamaIndex, Vercel AI SDK, custom)
- Prompt management (Hardcoded, DB, PromptLayer)

---

### TYPE 9: Data Pipeline / ETL

**Examples:** Web scraper, data transformer, scheduled aggregation, API sync
**Goal:** Reliability, data quality, scheduling, error handling

**Interrogation Checklist:**

1. **Source:** Where does data come from? (API, Scraping, CSV, DB)
2. **Frequency:** Real-time, hourly, daily, or triggered?
3. **Volume:** How many records per run? (10, 1000, 1M+)
4. **Transformation:** What processing is needed? (Clean, normalize, enrich)
5. **Destination:** Where does clean data go? (DB, API, File, Dashboard)
6. **Deduplication:** How to avoid processing same record twice?
7. **Failure Handling:** What if source is down? Retry? Alert?
8. **Validation:** What makes a record "valid"? Schema requirements?
9. **Monitoring:** How to track pipeline health? Alerts?

**Key Decisions:**
- Execution environment (n8n, Airflow, Temporal, cron job)
- Temporary storage (Redis, DB staging tables)
- Error tracking (Sentry, logs, Telegram alerts)
- Idempotency strategy (UUID tracking, timestamps)

---

### TYPE 10: CLI Tool / npm Package

**Examples:** Developer tool, build script, code generator, automation script
**Goal:** Easy to use, well-documented, works everywhere

**Interrogation Checklist:**

1. **Purpose:** What does the CLI do in one sentence?
2. **Input:** Files, flags, config file, or interactive prompts?
3. **Output:** Logs to stdout, creates files, or both?
4. **Dependencies:** Node.js only? Or needs Python, Docker, etc.?
5. **Distribution:** npm package, GitHub release, or both?
6. **Configuration:** .config file, environment vars, or flags?
7. **Error Handling:** How to show helpful errors? Exit codes?
8. **Updates:** Auto-update check? Version management?
9. **Documentation:** README, website, or both?

**Key Decisions:**
- CLI framework (Commander.js, oclif, yargs, custom)
- Config format (.json, .yaml, .js, .env)
- Packaging (TypeScript → transpile, or pure JS)
- Testing strategy (unit tests, integration tests, snapshot tests)

---

### TYPE 11: Mobile App (iOS/Android)

**Examples:** Mobile banking app, fitness tracker, food delivery, social app, utility app
**Goal:** Native feel, offline-first, app store approval, push notifications

**Interrogation Checklist:**

1. **Platform Target:** iOS only, Android only, or both?
2. **Development Approach:** Native (Swift/Kotlin) or Cross-platform (React Native/Flutter)?
3. **Backend Infrastructure:** Firebase, Supabase, custom API, or backend-as-a-service?
4. **Authentication:** Email/password, social login (Google/Apple), biometrics, or magic link?
5. **Offline Capability:** Must work offline? Sync strategy when back online?
6. **Push Notifications:** Required? (Marketing, transactional, real-time updates)
7. **Monetization Model:** Free, paid upfront, in-app purchases, subscription, or ads?
8. **Device Features:** Camera, GPS, NFC, AR, Bluetooth, Face ID/Touch ID needed?
9. **Data Storage:** Local (SQLite, AsyncStorage, Realm) or cloud-only?
10. **App Distribution:** Public app stores (App Store/Play Store), enterprise, or TestFlight/Beta only?
11. **Design System:** Custom design, Material Design (Android), Human Interface (iOS), or cross-platform library?
12. **Deep Linking:** Need app-to-app navigation or web-to-app handoff?
13. **Analytics:** Firebase Analytics, Mixpanel, Amplitude, or custom?
14. **App Size:** Any constraints? (Offline maps = large, minimal = small)

**Key Decisions:**

**Tech Stack (Recommended):**
- **Cross-platform (Recommended for speed):**
  - Expo (React Native) - Best for web developers, fast iterations, OTA updates
  - Supabase - Backend, auth, database, storage
  - React Navigation - Navigation
  - Expo Notifications - Push notifications

- **iOS Native:**
  - SwiftUI + Combine
  - Firebase or Supabase backend
  - URLSession for networking

- **Android Native:**
  - Jetpack Compose + Kotlin Coroutines
  - Firebase or Supabase backend
  - Retrofit for networking

- **Alternative Cross-platform:**
  - Flutter (Dart) - Great performance, Material Design native
  - GetX or Riverpod - State management

**Infrastructure Decisions:**
- **App Store Setup:** Apple Developer Account ($99/year), Google Play Console ($25 one-time)
- **CI/CD:** EAS Build (Expo), Fastlane (native), or GitHub Actions
- **Code Signing:** Managed by Expo or manual certificates (iOS), keystore (Android)
- **Analytics:** Firebase Analytics (free tier) or Mixpanel
- **Crash Reporting:** Sentry, Firebase Crashlytics, or BugSnag
- **Push Provider:** Firebase Cloud Messaging (cross-platform) or native APNs/FCM

**Special Considerations:**
- App review guidelines compliance (Apple strict, Google moderate)
- Privacy policy required for data collection
- COPPA compliance if targeting children
- GDPR/data residency for EU users
- App size optimization (images, assets, libraries)
- Battery usage optimization
- Network efficiency (avoid polling, use websockets/push)

**Milestone Breakdown Suggestion:**
- M1: Project setup, navigation scaffold, basic UI
- M2: Authentication flow (login, signup, password reset)
- M3: Core features (main app functionality)
- M4: Offline support and data sync
- M5: Push notifications and background tasks
- M6: App store preparation (icons, screenshots, metadata)
- M7: Beta testing (TestFlight, Internal Testing)
- M8: App store submission and launch

---

### TYPE 12: Marketing Website / Landing Page

**Examples:** Product launch site, agency portfolio, company website, event page
**Goal:** Visual impact, conversion, fast performance, SEO, brand presence
**Not basic** - Think Framer-level animations, clever scroll effects, micro-interactions

**Interrogation Checklist:**

1. **Design Complexity:** Static elegant or interactive/animated? (Framer Motion, GSAP, Three.js?)
2. **Conversion Goal:** Newsletter signup, product demo, contact form, or pure branding?
3. **Content Strategy:** Single long page or multi-page site? Blog needed?
4. **CMS Requirement:** Developer-managed (hardcoded) or client needs to edit? (Sanity, Contentful)
5. **Performance Target:** Lighthouse 100? Image optimization critical? (Next.js Image, Cloudflare)
6. **SEO Priority:** High (business-critical) or medium? (Metadata, schema markup)
7. **Forms:** Simple contact form or complex multi-step? (React Hook Form, validation)
8. **Analytics:** Basic (Google Analytics) or detailed (heatmaps, A/B testing)?

**Key Decisions:**
- **Framework:** Next.js 15 (App Router) with static generation (SSG)
- **Animation:** Framer Motion (smooth), GSAP (complex), or CSS-only
- **CMS:** Sanity (structured), Contentful (enterprise), or hardcoded (fastest)
- **Hosting:** Vercel (recommended), Netlify, or Cloudflare Pages
- **Forms:** Resend (email), n8n webhook (custom logic), or FormSpree (simple)

**Special Considerations:**
- Mobile-first design (70% of traffic on mobile)
- Page speed is critical (under 2s load time)
- Avoid heavy libraries (keep bundle small)
- Consider dark mode
- Accessibility (WCAG AA compliance)

**Milestone Breakdown Suggestion:**
- M1: Project setup, design system, typography, colors
- M2: Hero section with animation, navigation
- M3: Content sections (features, testimonials, pricing)
- M4: Forms, CTAs, footer
- M5: SEO optimization, performance tuning
- M6: CMS integration (if applicable)
- M7: Final polish, deploy, analytics

---

### TYPE 13: Content Platform / Publishing

**Examples:** Blog, news site, magazine, documentation site, knowledge base
**Goal:** Content discovery, reading experience, SEO, author workflow
**Focus:** CONTENT not products (different from TYPE 2 e-commerce)

**Interrogation Checklist:**

1. **Content Type:** Blog posts, news articles, documentation, or mixed?
2. **Author Workflow:** Single author or multi-author? Editorial approval needed?
3. **Content Structure:** Categories, tags, series? (Taxonomy design)
4. **Search:** Full-text search required? (Algolia, Typesense, DB search)
5. **Comments:** User comments allowed? Moderation needed?
6. **Membership:** Free content or paywall? (Stripe, member-only)
7. **Email:** Newsletter integration? (Resend, ConvertKit, Mailchimp)
8. **Rich Content:** Just text or embedded videos, code blocks, interactive elements?

**Key Decisions:**
- **CMS:** Sanity (structured), MDX (developer-friendly), WordPress headless (legacy)
- **Framework:** Next.js 15 (ISR for dynamic content, SSG for static)
- **Search:** Algolia (best UX), Typesense (open-source), or postgres full-text
- **Comments:** Disqus (easy), custom (Supabase), or none
- **Auth:** Optional (guest reading) or required (member content)

**Special Considerations:**
- RSS feed for subscribers
- Social sharing (Open Graph, Twitter Cards)
- Reading time estimation
- Table of contents for long articles
- Related posts recommendation
- Syntax highlighting for code (if tech blog)
- Image CDN (Cloudinary, Imgix) for media-heavy sites

**Milestone Breakdown Suggestion:**
- M1: Project setup, CMS schema, content models
- M2: Homepage, article list, pagination
- M3: Article page, rich text rendering, syntax highlighting
- M4: Search functionality
- M5: Comments system (if applicable)
- M6: Newsletter integration, social sharing
- M7: SEO optimization, sitemap, RSS

---

### TYPE 14: Social Network / Community Platform

**Examples:** Forum, Reddit-like, Discord alternative, member community, Q&A site
**Goal:** User-generated content, engagement, moderation, community growth
**Focus:** SOCIAL INTERACTION not transactions (different from TYPE 4 marketplace)

**Interrogation Checklist:**

1. **Content Model:** Posts/comments (Reddit), threads (forum), or chat-like (Discord)?
2. **User Roles:** Admin, moderator, verified user, regular user? (RBAC)
3. **Moderation:** Auto-moderation (profanity filter, spam detection) or manual?
4. **Voting/Reactions:** Upvote/downvote, emoji reactions, or none?
5. **Privacy:** Public posts or private groups/channels?
6. **Real-time:** Live updates (WebSockets) or refresh to see new content?
7. **User Profiles:** Bio, avatar, badges, reputation points?
8. **Notifications:** Email, in-app, push notifications?
9. **Content Policies:** What's allowed? Reporting system needed?

**Key Decisions:**
- **Backend:** Supabase (realtime subscriptions built-in) or Firebase
- **Auth:** Email/social login, username required, profile setup
- **Database Design:**
  - Users, Posts, Comments, Reactions tables
  - RLS for privacy (user can only edit own posts)
  - Indexes for feed performance
- **Moderation Tools:** Flag content, ban users, shadow ban, word filters
- **Real-time Strategy:** Supabase Realtime (easy) or Pusher/Ably (scalable)

**Special Considerations:**
- Feed algorithm (chronological, hot, trending)
- Spam prevention (rate limiting, CAPTCHA, karma threshold)
- Content ownership (who can delete what)
- Data export (GDPR compliance)
- Image/video uploads (moderation needed)
- Search across posts (full-text search)
- Mobile app (consider TYPE 11 for native experience)

**Milestone Breakdown Suggestion:**
- M1: Project setup, auth, user profiles
- M2: Post creation, feed display
- M3: Comments, nested replies
- M4: Voting/reactions system
- M5: Moderation tools (flag, report, ban)
- M6: Notifications system
- M7: Search functionality
- M8: Real-time updates (if applicable)
- M9: Admin dashboard

---

### TYPE 15: Booking / Scheduling Platform

**Examples:** Calendly clone, appointment booking, room reservations, event scheduling
**Goal:** Availability management, time zone handling, conflict prevention, reminders
**Focus:** TIME MANAGEMENT (different from TYPE 1 generic SaaS)

**Interrogation Checklist:**

1. **Booking Type:** One-on-one meetings, group events, or resource booking (rooms, equipment)?
2. **Availability Logic:** Fixed hours (9-5 M-F) or dynamic availability?
3. **Calendar Sync:** Integrate with Google/Outlook calendar? Two-way sync?
4. **Time Zones:** Auto-detect visitor timezone? Allow timezone selection?
5. **Booking Rules:** Min advance notice (24h?), max advance (60 days?), buffer time between bookings?
6. **Payment:** Free booking or require payment? (Stripe for paid bookings)
7. **Reminders:** Email/SMS reminders? How many? (24h before, 1h before)
8. **Cancellation:** Allow cancellation? Reschedule? Refund policy?
9. **Custom Fields:** Collect info from booker (phone, reason, questions)?

**Key Decisions:**
- **Calendar Integration:**
  - Google Calendar API (most common)
  - Microsoft Graph API (Outlook)
  - CalDAV (generic)
- **Time Zone Library:** date-fns-tz or Luxon (moment.js deprecated)
- **Conflict Detection:** Check existing bookings + synced calendar events
- **Notifications:**
  - Email: Resend (transactional)
  - SMS: Twilio (optional)
  - n8n workflow for reminder scheduling
- **Payment:** Stripe for paid bookings, hold/charge on booking

**Special Considerations:**
- Prevent double-booking (critical!)
- Handle timezone edge cases (DST, international)
- Booking confirmation flow (immediate or pending approval)
- Waitlist for fully booked slots
- Recurring availability (weekly schedule)
- Multiple calendars per user (work/personal)
- Team scheduling (round-robin, collective availability)
- No-show handling (mark as no-show, block user after N no-shows)

**Milestone Breakdown Suggestion:**
- M1: Project setup, auth, user profiles
- M2: Availability setup (time slots, working hours)
- M3: Booking page (display available times, timezone handling)
- M4: Booking creation, conflict detection
- M5: Calendar sync integration (Google/Outlook)
- M6: Email confirmations and reminders (n8n workflow)
- M7: Cancellation and rescheduling
- M8: Payment integration (if applicable)
- M9: Admin dashboard (view all bookings, analytics)

---

## 5. QUALITY GATES

- **Supabase Rule:** @Developer owns Database/RLS. @Automator consumes it.
- **Secret Rule:** No API keys in chat. Use `process.env.KEY`.
- **Output Rule:** Summarize "Critical Technical Decisions" in BRIEF.md.
- **Handoff Rule:** When switching agents, run `indiana_milestone.js`.
- **Git Rule:** @Developer, @Automator, @Tools push to `dev` branch only.
- **Ship Rule:** Only @Overseer can merge `dev` → `main`.

---

## 6. RALPH WIGGUM PROTOCOL (Autonomous Mode)

Ralph Wiggum enables autonomous task execution with **checkpoint pauses** at role boundaries.

### 6.1 Completion Signals & Actions

| Agent       | Signal                          | Git Action        | Next         |
| ----------- | ------------------------------- | ----------------- | ------------ |
| @Manager    | `BRIEF_COMPLETE`                | None              | @Consultant  |
| @Consultant | `ARCHITECTURE_COMPLETE`         | None              | @Developer   |
| @Developer  | `DEV_COMPLETE`                  | Push to `dev`     | @Automator   |
| @Automator  | `WORKFLOW_COMPLETE`             | Push to `dev`     | @Tools       |
| @Tools      | `DEPLOY_READY`                  | Push to `dev`     | @Overseer    |
| @Overseer   | `SHIPPED`                       | Merge to `main`   | Done         |

### 6.2 Milestone Reporting (MANDATORY)

At EVERY checkpoint, run:

```bash
node milestone.js "@Agent" "MILESTONE_NAME" "@NextAgent" "Summary of work" '["TASK-001","TASK-002"]'
```

**Examples:**

```bash
# After @Manager completes
node scripts/indiana_milestone.js "@Manager" "BRIEF_COMPLETE" "@Consultant" "Created BRIEF.md with 45 tasks"

# After @Developer completes (will push to dev branch)
node scripts/indiana_milestone.js "@Developer" "DEV_COMPLETE" "@Automator" "Built all UI components" '["TASK-001","TASK-002","TASK-003"]'

# After @Tools completes (will push to dev branch)
node scripts/indiana_milestone.js "@Tools" "DEPLOY_READY" "@Overseer" "Code ready for audit on dev branch"
```

This will:
1. Push to `dev` branch (for @Developer, @Automator, @Tools)
2. Update completed tasks in Linear → Done
3. Send Telegram notification to Overseer
4. Wait for approval before continuing

### 6.3 Autonomous Rules

When Ralph Wiggum mode is active:

1. **Continue** if the current task has clear next steps
2. **Continue** if there are more tasks assigned to your role
3. **PAUSE** when your role's work is complete
4. **PAUSE** before switching to a different agent
5. **PAUSE** if you hit a blocker requiring human decision
6. **PAUSE** if uncertain about requirements

### 6.4 Checkpoint Format

When pausing at a checkpoint, output:

```
═══════════════════════════════════════════
CHECKPOINT: [ROLE] COMPLETE
═══════════════════════════════════════════

Completed:
- [What was done]
- [What was done]

Files Created/Modified:
- [file path]

Logged to DECISIONS.md: Yes

Next Agent: @[NextAgent]

───────────────────────────────────────────
Running milestone report...
───────────────────────────────────────────

<promise>[ROLE]_COMPLETE</promise>
```

Then immediately run:

```bash
node scripts/indiana_milestone.js "@CurrentAgent" "MILESTONE" "@NextAgent" "Summary" '["TASK-IDS"]'
```

### 6.5 Activating Ralph Wiggum

To enable autonomous mode, start your session with:

```
RALPH WIGGUM MODE: Active

Continue working autonomously within your current role until complete.
Pause at role boundaries for approval before handoff.
Log all decisions to DECISIONS.md.
Run `node scripts/indiana_milestone.js` at every checkpoint.
Push to dev branch at code milestones.
```

#### State Persistence

When Ralph Wiggum mode activates, the system creates `.ralph_wiggum_state` in the project root:

```json
{
  "version": "1.0",
  "active": true,
  "activatedAt": "2026-01-10T14:00:00Z",
  "currentAgent": "@Manager",
  "currentPhase": "Discovery",
  "currentTask": "Gathering requirements",
  "completedPhases": [],
  "progress": {
    "total": 45,
    "completed": 0,
    "percentage": 0
  },
  "checkpoints": [
    {
      "agent": "@Manager",
      "milestone": "BRIEF_COMPLETE",
      "timestamp": "2026-01-10T14:30:00Z",
      "gitCommit": null,
      "filesModified": ["BRIEF.md", "DECISIONS.md"]
    }
  ],
  "lastGitCommit": null,
  "branch": "dev",
  "lastUpdate": "2026-01-10T14:00:00Z"
}
```

**This file:**
- Persists across terminal sessions
- Enables recovery after interruption
- Tracks progress for STATUS command
- Provides rollback points
- Auto-updates at each checkpoint

**Add to .gitignore:**
```
.ralph_wiggum_state
```

**Deactivating:**
```
RALPH WIGGUM MODE: Inactive
```

This marks the state as inactive but preserves history for reference.

### 6.6 Complete Agent Flow

```
@Manager (BRIEF_COMPLETE)
    ↓ milestone.js → Telegram → Approve?
@Consultant (ARCHITECTURE_COMPLETE)
    ↓ milestone.js → Telegram → Approve?
@Developer (DEV_COMPLETE)
    ↓ milestone.js → push to dev → Linear → Telegram → Approve?
@Automator (WORKFLOW_COMPLETE)
    ↓ milestone.js → push to dev → Linear → Telegram → Approve?
@Tools (DEPLOY_READY)
    ↓ milestone.js → push to dev → Linear → Telegram → Approve?
@Overseer (AUDIT)
    ↓ Manual review → node merge.js → dev→main → Vercel
SHIPPED
```

---

## 7. @OVERSEER AUDIT CHECKLIST

When @Tools completes, you (human) perform the audit:

### Code Review
- [ ] No hardcoded secrets
- [ ] TypeScript types correct
- [ ] Error handling in place

### Functionality
- [ ] App loads without errors
- [ ] Core features work
- [ ] Forms submit correctly

### Build
```bash
npm run build  # Must pass
```

### Approval

**If APPROVED:**
```bash
node indiana_merge.js
```

**If REJECTED:**
```bash
node scripts/indiana_milestone.js "@Overseer" "AUDIT_FAILED" "@Developer" "Fix: [issues]"
```

---

## 8. EMERGENCY STOPS & ERROR RECOVERY

If anything goes wrong during execution, use these commands to recover:

### Emergency Commands

#### STOP - Halt Autonomous Execution

When you type `STOP`, the agent will:
1. Immediately pause current task
2. Save current state to `.ralph_wiggum_state`
3. Output current progress summary
4. Wait for further instructions

**Usage:**
```
STOP
```

**Agent Response Format:**
```
═══════════════════════════════════════════
EMERGENCY STOP TRIGGERED
═══════════════════════════════════════════

Current Agent: @Developer
Current Task: Building authentication components
Progress: 60% (6/10 tasks complete)

Last Successful Checkpoint: ARCHITECTURE_COMPLETE (@Consultant)
Last Git Commit: [hash] - "[Developer] Feature: Added login form"
Branch: dev

Files Modified Since Last Commit:
- /app/auth/signup/page.tsx (modified)
- /components/AuthForm.tsx (new)

State Saved: .ralph_wiggum_state
───────────────────────────────────────────
```

---

#### ROLLBACK - Revert Changes

When you type `ROLLBACK`, you'll be asked which level to rollback to:

**Rollback Options:**
1. **Uncommitted Changes** - Revert files to last commit (git reset)
2. **Last Commit** - Undo last commit but keep changes
3. **Last Checkpoint** - Return to previous agent completion
4. **Full Reset** - Return to project inception

**Usage:**
```
ROLLBACK [level]
```

**Examples:**
```
ROLLBACK uncommitted    # Discard current file changes
ROLLBACK commit         # Undo last git commit
ROLLBACK checkpoint     # Return to last agent handoff
ROLLBACK full           # Nuclear option - start over
```

**Agent Response Format:**
```
═══════════════════════════════════════════
ROLLBACK INITIATED
═══════════════════════════════════════════

Rollback Level: checkpoint
Target: ARCHITECTURE_COMPLETE (@Consultant)

Actions to be taken:
1. Git: Reset to commit [hash]
2. Files: Restore 12 files
3. DECISIONS.md: Revert to previous state
4. Linear: Mark incomplete tasks as TODO

WARNING: This will discard:
- 3 commits on dev branch
- 12 modified files
- Current task progress

Type CONFIRM to proceed or CANCEL to abort:
───────────────────────────────────────────
```

---

#### STATUS - Progress Summary

When you type `STATUS`, get current project state without interrupting:

**Usage:**
```
STATUS
```

**Agent Response Format:**
```
═══════════════════════════════════════════
PROJECT STATUS
═══════════════════════════════════════════

Project: my-saas-app
Archetype: TYPE 1 (B2B SaaS)
Ralph Wiggum Mode: Active

├─ DONE @Manager (BRIEF_COMPLETE)
├─ DONE @Consultant (ARCHITECTURE_COMPLETE)
├─ ACTIVE @Developer (IN PROGRESS - 60%)
├─ PENDING @Automator
├─ PENDING @Tools
└─ PENDING @Overseer

Current Phase: Development
Tasks: 6/10 complete (60%)
Git Branch: dev (3 commits ahead of main)
Last Update: 2026-01-10 14:23:00

Recent Activity:
- 14:23 - Implemented signup form
- 14:15 - Created auth layout
- 14:05 - Set up Supabase client

Next Steps:
1. Complete email verification flow
2. Add password reset functionality
3. Implement session management
───────────────────────────────────────────
```

---

### Error Recovery Workflows

#### Scenario 1: Build Fails
```
Error: npm run build failed

Recovery Steps:
1. TYPE: STATUS (check what broke)
2. Review error messages
3. TYPE: ROLLBACK uncommitted (if needed)
4. Fix the issue
5. Continue or restart task
```

#### Scenario 2: Wrong Agent Active
```
Error: Running @Developer tasks but @Consultant not finished

Recovery Steps:
1. TYPE: STOP
2. TYPE: ROLLBACK checkpoint
3. Switch to correct agent
4. Complete missing work
5. Properly handoff to next agent
```

#### Scenario 3: Lost Context
```
Error: Agent doesn't know what to do next

Recovery Steps:
1. TYPE: STATUS
2. Read DECISIONS.md
3. Read last checkpoint in .ralph_wiggum_state
4. Resume from documented state
```

#### Scenario 4: Git Conflict
```
Error: Cannot push - conflicts with remote

Recovery Steps:
1. TYPE: STOP
2. Manually resolve: git pull origin dev --rebase
3. Fix conflicts in IDE
4. git add . && git commit
5. TYPE: STATUS (verify state)
6. Continue
```

---

### State Persistence

Ralph Wiggum mode state is saved to `.ralph_wiggum_state`:

```json
{
  "active": true,
  "currentAgent": "@Developer",
  "currentTask": "Building authentication components",
  "startTime": "2026-01-10T14:00:00Z",
  "lastCheckpoint": "ARCHITECTURE_COMPLETE",
  "completedPhases": ["@Manager", "@Consultant"],
  "progress": {
    "total": 10,
    "completed": 6,
    "percentage": 60
  },
  "lastGitCommit": "a1b2c3d",
  "branch": "dev"
}
```

This file ensures recovery is possible even if session is interrupted.

---

## 9. INDIANA INTEGRATION

### Indiana Genesis (New Projects)

After BRIEF.md is created:

```bash
node indiana.js
```

Creates:
- GitHub repository (with `main` branch)
- Vercel project (linked to main)
- Linear project with all tasks

### Indiana Milestone (Checkpoints)

At every agent completion:

```bash
node indiana_milestone.js "@Agent" "MILESTONE" "@NextAgent" "Summary" '["TASKS"]'
```

Updates:
- Git push to `dev` branch (if code agent)
- Linear tasks → Done
- Telegram notification
- Milestone log

### Indiana Merge (Ship)

After @Overseer audit passes:

```bash
node indiana_merge.js
```

Merges:
- `dev` → `main`
- Push to GitHub
- Vercel auto-deploys
- Completion notification
