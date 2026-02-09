# Environment Variables Migration Mapping

**Created:** 2026-01-24
**Milestone:** M02_04
**Purpose:** Map legacy environment variables to new CatchaCRM NG v11 structure

---

## Executive Summary

The legacy CatchaCRM application was a minimal AI Studio prototype with only one environment variable (GEMINI_API_KEY). The new CatchaCRM NG v11 is a full-featured, multi-tenant B2B SaaS CRM requiring comprehensive environment configuration across multiple domains: infrastructure, database, authentication, billing, communications, and automation.

**Migration Status:** ⚠️ Requires Configuration
**Legacy Variables:** 1
**New Variables:** 27
**Configured:** 3 (Supabase production credentials)
**Pending:** 24

---

## 1. Legacy Environment Variables

### 1.1 AI Studio App (catchacrm-master)

| Variable | Value Location | Usage | Migration Status |
|----------|----------------|-------|------------------|
| `GEMINI_API_KEY` | Not tracked | Google Gemini AI integration | ❌ **DEPRECATED** - Not used in new architecture |

**Note:** The legacy app used Gemini AI for conversational features. This functionality will be replaced by n8n workflows and custom AI integrations in the new architecture.

---

## 2. New Environment Structure

### 2.1 Infrastructure & DevOps

Required for Genesis automation, CI/CD, and project management.

| Variable | Purpose | Current Status | Priority | Notes |
|----------|---------|----------------|----------|-------|
| `GITHUB_TOKEN` | GitHub API access for repo operations | ⚠️ Empty in .env | HIGH | Required for indiana.js scripts |
| `GITHUB_ORG` | GitHub organization name | ✅ Set: `shoomacca` | HIGH | - |
| `LINEAR_API_KEY` | Linear API for task management | ⚠️ Empty in .env | HIGH | Required for indiana.js scripts |
| `LINEAR_TEAM_ID` | Linear team identifier | ✅ Set: `2782310d-ec67-461f-ac02-6e3c87f83a04` | HIGH | - |
| `RESEARCH_WEBHOOK_URL` | Genesis research webhook | ✅ Set: `https://ai.bsbsbs.au/webhook/research_role` | MEDIUM | - |
| `DRY_RUN` | Test mode flag | ✅ Set: `false` | LOW | Development helper |

**Action Required:**
- Generate GitHub personal access token with `repo` scope: https://github.com/settings/tokens
- Generate Linear API key: https://linear.app/settings/api

---

### 2.2 Database & Authentication (Supabase)

| Variable | Purpose | Current Status | Priority | Notes |
|----------|---------|----------------|----------|-------|
| `VITE_SUPABASE_URL` | Supabase project URL (client-side) | ✅ Configured in .env.local | HIGH | Used by src/lib/supabase.ts |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (client-side) | ✅ Configured in .env.local | HIGH | RLS-enforced access |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side) | ✅ Configured in .env.local | HIGH | Bypasses RLS - use with caution |
| `SUPABASE_DB_PASSWORD` | Direct database connection password | ✅ Configured in .env.local | MEDIUM | For migrations and admin tasks |

**Production Values (Configured):**
- Project: `anawatvgypmrpbmjfcht.supabase.co`
- Keys are valid and active
- RLS policies are in place (M02_02)

**Security Notes:**
- `VITE_` prefixed variables are exposed to client-side code
- Service role key must never be used in browser code
- Database password should only be used in secure server contexts

---

### 2.3 Automation & Workflows (n8n)

| Variable | Purpose | Current Status | Priority | Notes |
|----------|---------|----------------|----------|-------|
| `N8N_API_URL` | n8n instance URL | ⚠️ Template value | HIGH | Required for M05 (Automation milestone) |
| `N8N_API_KEY` | n8n API authentication | ⚠️ Template value | HIGH | Must be generated from n8n instance |

**Action Required (M05):**
- Deploy n8n instance (self-hosted or cloud)
- Generate API key from n8n settings
- Configure webhook endpoints for CRM events

**Integration Points:**
- Lead capture workflows
- Email/SMS automation
- Data enrichment pipelines
- Call logging and VoIP integration

---

### 2.4 Billing & Payments

Per-seat billing with Stripe (primary) and PayPal (alternative).

#### Stripe Configuration

| Variable | Purpose | Current Status | Priority | Notes |
|----------|---------|----------------|----------|-------|
| `STRIPE_SECRET_KEY` | Stripe API secret key (server-side) | ⚠️ Template value | HIGH | Required for M07_01 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side) | ⚠️ Template value | HIGH | Safe to expose |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification | ⚠️ Template value | HIGH | Generated after webhook setup |

**Note:** Variable prefix inconsistency detected. Template uses `NEXT_PUBLIC_` but project uses Vite. Should be:
- ❌ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY`

**Action Required (M07):**
1. Create Stripe account (or use existing)
2. Get API keys from https://dashboard.stripe.com/apikeys
3. Configure webhook endpoint: `https://[your-domain]/api/stripe/webhook`
4. Copy webhook secret from Stripe dashboard
5. Update variable prefix to `VITE_` in .env.example and code

#### PayPal Configuration

| Variable | Purpose | Current Status | Priority | Notes |
|----------|---------|----------------|----------|-------|
| `PAYPAL_CLIENT_ID` | PayPal REST API client ID | ⚠️ Template value | MEDIUM | Alternative payment method |
| `PAYPAL_CLIENT_SECRET` | PayPal REST API secret | ⚠️ Template value | MEDIUM | Server-side only |
| `PAYPAL_MODE` | PayPal environment | ✅ Set: `sandbox` | MEDIUM | Use `live` for production |

**Action Required (M07):**
1. Create PayPal developer account: https://developer.paypal.com
2. Create REST API app
3. Get credentials from app dashboard
4. Switch to `live` mode before production launch

---

### 2.5 Communications (Email, VoIP, SMS)

Optional integrations for M05 milestone.

#### Email Provider (SMTP)

| Variable | Purpose | Current Status | Priority | Notes |
|----------|---------|----------------|----------|-------|
| `SMTP_HOST` | SMTP server hostname | ⚠️ Template value | MEDIUM | For transactional emails |
| `SMTP_PORT` | SMTP server port | ✅ Set: `587` | MEDIUM | Standard TLS port |
| `SMTP_USER` | SMTP authentication username | ⚠️ Template value | MEDIUM | Usually email address |
| `SMTP_PASSWORD` | SMTP authentication password | ⚠️ Template value | MEDIUM | Store securely |
| `SMTP_FROM` | Default sender email | ⚠️ Template value | MEDIUM | Must match domain |

**Recommended Providers:**
- **SendGrid** - 100 emails/day free tier
- **Mailgun** - Good deliverability
- **Amazon SES** - Cost-effective at scale
- **Resend** - Developer-friendly

#### VoIP Integration

| Variable | Purpose | Current Status | Priority | Notes |
|----------|---------|----------------|----------|-------|
| `VOIP_PROVIDER_API_KEY` | VoIP service API key | ⚠️ Template value | LOW | Optional for M05_04 |
| `VOIP_PROVIDER_URL` | VoIP service endpoint | ⚠️ Template value | LOW | Provider-specific |

**Recommended Providers:**
- **Twilio Voice** - Well-documented API
- **Vonage (Nexmo)** - Good pricing
- **Plivo** - Alternative option

#### SMS & WhatsApp (Twilio)

| Variable | Purpose | Current Status | Priority | Notes |
|----------|---------|----------------|----------|-------|
| `TWILIO_ACCOUNT_SID` | Twilio account identifier | ⚠️ Template value | MEDIUM | Required for M05_05 |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token | ⚠️ Template value | MEDIUM | Server-side only |
| `TWILIO_PHONE_NUMBER` | Twilio sending phone number | ⚠️ Template value | MEDIUM | Must be purchased from Twilio |

**Action Required (M05):**
1. Create Twilio account: https://www.twilio.com/console
2. Purchase a phone number
3. Get Account SID and Auth Token from console
4. Configure WhatsApp sender (requires business verification)

---

### 2.6 Application Settings

| Variable | Purpose | Current Status | Priority | Notes |
|----------|---------|----------------|----------|-------|
| `NEXT_PUBLIC_APP_URL` | Application base URL | ⚠️ Template: `http://localhost:3000` | HIGH | **Should be `VITE_APP_URL`** |
| `NODE_ENV` | Node.js environment | ✅ Set: `development` | HIGH | Auto-set by Vite |

**Variable Prefix Issue:**
- Template uses `NEXT_PUBLIC_` (Next.js convention)
- Project uses Vite, which requires `VITE_` prefix
- **Action Required:** Update all `NEXT_PUBLIC_*` to `VITE_*` in .env.example and codebase

**Environment Values:**
- Development: `http://localhost:3000`
- Production: `https://catchacrm.com` (or actual domain)

---

### 2.7 Demo Account Management

| Variable | Purpose | Current Status | Priority | Notes |
|----------|---------|----------------|----------|-------|
| `DEMO_ACCOUNT_RESET_INTERVAL` | Reset interval in milliseconds | ✅ Set: `86400000` (24 hours) | MEDIUM | As per BRIEF.md requirement |
| `DEMO_ACCOUNT_EMAIL` | Demo account email address | ⚠️ Template: `demo@catchacrm.com` | MEDIUM | Must be created in Supabase |

**Action Required (M07_02):**
1. Create demo account in Supabase with special flag
2. Implement reset automation (n8n workflow or cron job)
3. Populate with realistic mock data

---

## 3. Migration Checklist

### Phase 1: Foundation (M02 - Current)
- [x] Document legacy environment variables
- [x] Map to new structure
- [x] Identify all required variables
- [x] Flag missing configurations
- [x] Configure Supabase credentials (.env.local)
- [ ] Fix variable prefix inconsistencies (NEXT_PUBLIC → VITE)
- [ ] Update .env.example with corrected prefixes
- [ ] Configure GitHub token
- [ ] Configure Linear API key

### Phase 2: Development Infrastructure (M03)
- [ ] Set up GitHub Actions (if using CI/CD)
- [ ] Configure Vercel environment variables
- [ ] Test Genesis automation with real credentials

### Phase 3: Automation & Communications (M05)
- [ ] Deploy n8n instance
- [ ] Configure n8n API credentials
- [ ] Set up SMTP provider
- [ ] Configure Twilio (SMS/WhatsApp)
- [ ] Optional: VoIP provider setup

### Phase 4: Billing & Licensing (M07)
- [ ] Set up Stripe account and API keys
- [ ] Configure Stripe webhook
- [ ] Set up PayPal sandbox
- [ ] Test payment flows
- [ ] Switch PayPal to live mode (production only)
- [ ] Implement demo account reset automation

### Phase 5: Production Deployment (M09)
- [ ] Update all template values with production credentials
- [ ] Verify all secrets are in secure storage (Vercel, GitHub Secrets)
- [ ] Remove .env.local from repository (git-ignored)
- [ ] Document credential rotation procedures
- [ ] Set up monitoring for API quota/usage

---

## 4. Security Recommendations

### 4.1 Secrets Management

**Never commit to repository:**
- `.env` (tracked in .gitignore)
- `.env.local` (tracked in .gitignore)
- Any file containing actual credentials

**Safe to commit:**
- `.env.example` (template with placeholder values)

### 4.2 Variable Prefix Strategy

| Prefix | Exposure | Use Case | Example |
|--------|----------|----------|---------|
| `VITE_` | Client-side (bundled into app) | Public config, API endpoints, feature flags | `VITE_SUPABASE_URL` |
| No prefix | Server-side only | Secrets, private keys, admin credentials | `SUPABASE_SERVICE_ROLE_KEY` |

### 4.3 Credential Rotation

Recommend rotating these credentials:
- **Quarterly:** API keys (GitHub, Linear, n8n)
- **Annually:** Database passwords, service role keys
- **Immediately if compromised:** All secrets

### 4.4 Production Secrets Storage

**Vercel (recommended for this project):**
- Store all secrets in Vercel project settings: Environment Variables
- Separate values for Preview vs Production
- Use Vercel CLI for local development: `vercel env pull`

**Alternatives:**
- **HashiCorp Vault** - Enterprise secret management
- **AWS Secrets Manager** - Cloud-native solution
- **Doppler** - Developer-focused secrets management

---

## 5. Deprecated Variables

| Variable | Legacy Usage | Deprecation Reason | Replacement |
|----------|--------------|-------------------|-------------|
| `GEMINI_API_KEY` | Google Gemini AI integration | Not part of new architecture | n8n workflows with custom AI integrations |
| `API_KEY` | Alias for GEMINI_API_KEY | Not part of new architecture | - |

---

## 6. Variable Naming Inconsistencies Detected

### Issue: Mixed Framework Prefixes

The `.env.example` file contains Next.js conventions (`NEXT_PUBLIC_*`) but the project uses Vite, which requires `VITE_*` prefix for client-side variables.

**Variables to Update:**

| Current (Incorrect) | Correct (Vite) | Location |
|-------------------|----------------|----------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `VITE_STRIPE_PUBLISHABLE_KEY` | .env.example:34 |
| `NEXT_PUBLIC_APP_URL` | `VITE_APP_URL` | .env.example:59 |

**Action Required:**
1. Update .env.example with correct prefixes
2. Search codebase for usage of these variables
3. Update all references to use `import.meta.env.VITE_*`
4. Test build to ensure no references to `process.env.NEXT_PUBLIC_*`

---

## 7. Next Steps (Immediate)

1. **Update .env.example** - Fix variable prefix inconsistencies
2. **Generate GitHub Token** - Required for indiana.js automation
3. **Generate Linear API Key** - Required for task management integration
4. **Update Vite Config** - Ensure proper environment variable handling
5. **Test Build** - Verify no undefined variables in production build

**Commands to verify:**
```bash
# Check for NEXT_PUBLIC references
grep -r "NEXT_PUBLIC" src/

# Check for process.env references (should use import.meta.env in Vite)
grep -r "process\.env" src/

# Test build
npm run build
```

---

## 8. File Locations

| File | Purpose | Git Status |
|------|---------|------------|
| `.env.example` | Template with placeholder values | ✅ Tracked |
| `.env` | Local development (infrastructure only) | ❌ Git-ignored |
| `.env.local` | Local development (app + secrets) | ❌ Git-ignored |
| `vite.config.ts` | Vite configuration and env loading | ✅ Tracked |
| `src/lib/supabase.ts` | Supabase client initialization | ✅ Tracked |

---

## 9. Verification Checklist

Before marking M02_04 complete:

- [x] Legacy variables documented
- [x] New variables inventoried
- [x] Variable prefix issues identified
- [x] Security recommendations documented
- [x] Migration checklist created
- [ ] .env.example updated with correct prefixes
- [ ] Codebase updated to use correct variable names
- [ ] Build verified with no undefined variables
- [ ] GitHub and Linear credentials configured

---

## 10. References

- **BRIEF.md** - Project requirements (M02_TASK-008)
- **STACK.md** - Tech stack (Vite + React 19)
- **M02_02 Summary** - Supabase RLS migration
- **M02_03 Summary** - n8n integration state
- **Vite Env Docs** - https://vitejs.dev/guide/env-and-mode.html

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-01-24
**Next Review:** M05 (Automation milestone) and M07 (Billing milestone)
