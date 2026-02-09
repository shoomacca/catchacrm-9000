# ENVIRONMENT SETUP GUIDE

**Project:** CatchaCRM NG v11
**Created:** 2026-01-23
**Purpose:** Document environment variables, secrets storage, and local development setup

---

## 1. ENVIRONMENT VARIABLES INVENTORY

### 1.1 Core Application Variables

| Variable | Required | Storage Location | Description | Example Value |
|----------|----------|------------------|-------------|---------------|
| `NODE_ENV` | Yes | Local, Vercel | Environment mode | `development` / `production` |
| `NEXT_PUBLIC_APP_URL` | Yes | Local, Vercel | Application base URL | `https://catchacrm.vercel.app` |

### 1.2 Supabase Configuration

| Variable | Required | Storage Location | Description | Example Value |
|----------|----------|------------------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Local, Vercel | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Local, Vercel | Public anonymous key (safe for browser) | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Vercel only | Server-side admin key (SECRET) | `eyJhbGc...` |

**Security Notes:**
- ✅ `NEXT_PUBLIC_*` variables are exposed to browser (use for public keys only)
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - NEVER expose to client
- Store in Vercel environment variables for production
- Use local `.env.local` for development (git-ignored)

### 1.3 n8n Integration

| Variable | Required | Storage Location | Description | Example Value |
|----------|----------|------------------|-------------|---------------|
| `N8N_API_URL` | Yes | Local, Vercel | n8n instance base URL | `https://ai.bsbsbs.au` |
| `N8N_API_KEY` | Yes | Vercel only | n8n API authentication key | `n8n_api_xxx` |
| `N8N_WEBHOOK_BASE_URL` | Yes | Local, Vercel | Webhook URL prefix | `https://ai.bsbsbs.au/webhook` |

**n8n Workflow Webhook URLs:**
- Email sync: `${N8N_WEBHOOK_BASE_URL}/email-sync`
- VoIP call logging: `${N8N_WEBHOOK_BASE_URL}/call-log`
- SMS webhook: `${N8N_WEBHOOK_BASE_URL}/sms-received`
- Lead enrichment: `${N8N_WEBHOOK_BASE_URL}/enrich-lead`
- Notification workflows: `${N8N_WEBHOOK_BASE_URL}/notify`

### 1.4 Billing & Payment Processing

#### Stripe (Primary - Per-seat billing)

| Variable | Required | Storage Location | Description | Example Value |
|----------|----------|------------------|-------------|---------------|
| `STRIPE_SECRET_KEY` | Yes | Vercel only | Stripe API secret key | `sk_test_xxx` / `sk_live_xxx` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Local, Vercel | Stripe public key | `pk_test_xxx` / `pk_live_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Vercel only | Webhook signature verification | `whsec_xxx` |

**Stripe Webhook Events:**
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Seat count changes
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment

#### PayPal (Secondary)

| Variable | Required | Storage Location | Description | Example Value |
|----------|----------|------------------|-------------|---------------|
| `PAYPAL_CLIENT_ID` | Yes | Vercel only | PayPal app client ID | `AYxxx` |
| `PAYPAL_CLIENT_SECRET` | Yes | Vercel only | PayPal app secret | `ELxxx` |
| `PAYPAL_MODE` | Yes | Local, Vercel | PayPal environment | `sandbox` / `live` |

### 1.5 Communication Integrations (M05)

#### Email Provider (SendGrid, Postmark, or SMTP)

| Variable | Required | Storage Location | Description | Example Value |
|----------|----------|------------------|-------------|---------------|
| `SMTP_HOST` | Optional | Vercel | SMTP server hostname | `smtp.sendgrid.net` |
| `SMTP_PORT` | Optional | Vercel | SMTP port | `587` |
| `SMTP_USER` | Optional | Vercel | SMTP username | `apikey` |
| `SMTP_PASSWORD` | Optional | Vercel | SMTP password/API key | `SG.xxx` |
| `SMTP_FROM` | Optional | Local, Vercel | Default sender email | `noreply@catchacrm.com` |

#### VoIP Integration (Twilio, Vonage, or similar)

| Variable | Required | Storage Location | Description | Example Value |
|----------|----------|------------------|-------------|---------------|
| `VOIP_PROVIDER_API_KEY` | Optional | Vercel | VoIP provider API key | `xxx` |
| `VOIP_PROVIDER_URL` | Optional | Local, Vercel | VoIP API base URL | `https://api.twilio.com` |
| `VOIP_WEBHOOK_SECRET` | Optional | Vercel | VoIP webhook signature key | `xxx` |

#### SMS/WhatsApp (Twilio)

| Variable | Required | Storage Location | Description | Example Value |
|----------|----------|------------------|-------------|---------------|
| `TWILIO_ACCOUNT_SID` | Optional | Vercel | Twilio account identifier | `ACxxx` |
| `TWILIO_AUTH_TOKEN` | Optional | Vercel | Twilio authentication token | `xxx` |
| `TWILIO_PHONE_NUMBER` | Optional | Local, Vercel | Twilio phone number | `+1234567890` |
| `TWILIO_WHATSAPP_NUMBER` | Optional | Local, Vercel | WhatsApp Business number | `whatsapp:+1234567890` |

### 1.6 Demo Account Configuration

| Variable | Required | Storage Location | Description | Example Value |
|----------|----------|------------------|-------------|---------------|
| `DEMO_ACCOUNT_EMAIL` | Yes | Local, Vercel | Demo account email | `demo@catchacrm.com` |
| `DEMO_ACCOUNT_RESET_INTERVAL` | Yes | Local, Vercel | Reset interval (ms) | `86400000` (24 hours) |
| `DEMO_ACCOUNT_ORG_ID` | Yes | Vercel | Demo organization UUID | `uuid` |

### 1.7 Genesis System (Infrastructure)

| Variable | Required | Storage Location | Description | Example Value |
|----------|----------|------------------|-------------|---------------|
| `GITHUB_TOKEN` | Yes | Local only | GitHub PAT for repo creation | `ghp_xxx` |
| `GITHUB_ORG` | Yes | Local | GitHub organization | `shoomacca` |
| `LINEAR_API_KEY` | Yes | Local only | Linear API key | `lin_api_xxx` |
| `LINEAR_TEAM_ID` | Yes | Local | Linear team UUID | `uuid` |
| `RESEARCH_WEBHOOK_URL` | Optional | Local | Research role webhook | `https://ai.bsbsbs.au/webhook/research_role` |
| `DRY_RUN` | Optional | Local | Test mode flag | `false` |

**Security Notes:**
- Genesis infrastructure variables are for local development only
- NEVER commit these to Vercel or expose in application code
- Used only by `scripts/indiana.js` and related automation

### 1.8 Monitoring & Observability (Optional)

| Variable | Required | Storage Location | Description | Example Value |
|----------|----------|------------------|-------------|---------------|
| `SENTRY_DSN` | Optional | Vercel | Sentry error tracking | `https://xxx@sentry.io/xxx` |
| `SENTRY_AUTH_TOKEN` | Optional | Vercel | Sentry API token | `xxx` |
| `VERCEL_ANALYTICS_ID` | Optional | Vercel | Vercel Analytics | Auto-injected |

---

## 2. SECRETS STORAGE MATRIX

### 2.1 Storage Locations by Environment

| Secret Type | Local Dev | Vercel Preview | Vercel Production | Supabase |
|-------------|-----------|----------------|-------------------|----------|
| Supabase URL | `.env.local` | Vercel Env | Vercel Env | N/A |
| Supabase Anon Key | `.env.local` | Vercel Env | Vercel Env | N/A |
| Supabase Service Key | `.env.local` | Vercel Env | Vercel Env | N/A |
| Stripe Secret | `.env.local` | Vercel Env | Vercel Env | N/A |
| PayPal Secret | `.env.local` | Vercel Env | Vercel Env | N/A |
| n8n API Key | `.env.local` | Vercel Env | Vercel Env | N/A |
| SMTP Password | `.env.local` | Vercel Env | Vercel Env | N/A |
| Genesis Tokens | `.env.local` | NEVER | NEVER | N/A |
| Database Connection | N/A | N/A | N/A | Supabase |

### 2.2 Security Best Practices

**DO:**
- ✅ Use `.env.local` for local development (git-ignored by default)
- ✅ Store all production secrets in Vercel environment variables
- ✅ Use separate API keys for test/sandbox and production
- ✅ Rotate secrets after team member departures
- ✅ Use Vercel's secret encryption for sensitive values
- ✅ Prefix browser-safe variables with `NEXT_PUBLIC_`
- ✅ Enable Vercel's automatic HTTPS

**DON'T:**
- ❌ Commit `.env.local` or `.env` files to git
- ❌ Share secrets via Slack, email, or unencrypted channels
- ❌ Use production keys in development
- ❌ Expose service role keys to the browser
- ❌ Hardcode secrets in source code
- ❌ Use the same secret across multiple environments

---

## 3. LOCAL DEVELOPMENT SETUP

### 3.1 Initial Setup (First Time)

**Step 1: Clone Repository**
```bash
git clone https://github.com/shoomacca/catchacrm-ng-v11.git
cd catchacrm-ng-v11
```

**Step 2: Install Dependencies**
```bash
npm install
```

**Step 3: Configure Environment Variables**
```bash
# Copy example file
cp .env.example .env.local

# Edit with your development credentials
# Use test/sandbox keys for all services
```

**Step 4: Obtain Development Credentials**

**Supabase:**
1. Log in to https://supabase.com
2. Select your project (or create new for dev)
3. Go to Settings → API
4. Copy Project URL and `anon` public key to `.env.local`
5. For backend work, copy `service_role` key (keep secret!)

**Stripe:**
1. Log in to https://dashboard.stripe.com
2. Toggle to "Test mode" (top right)
3. Go to Developers → API keys
4. Copy test keys to `.env.local`
5. Create webhook endpoint: `http://localhost:3000/api/webhooks/stripe`

**n8n:**
1. Access https://ai.bsbsbs.au
2. Get API key from user settings
3. Note webhook base URL

**Step 5: Initialize Database**
```bash
# If using Supabase migrations
npx supabase db push

# Or run migration SQL manually in Supabase dashboard
```

**Step 6: Start Development Server**
```bash
npm run dev
```

App should be running at http://localhost:3000

### 3.2 Environment Variable Precedence

Next.js loads environment variables in this order (later overrides earlier):

1. `.env` - Committed defaults (never include secrets)
2. `.env.local` - Local overrides (git-ignored, use this for secrets)
3. `.env.development` / `.env.production` - Environment-specific
4. `.env.development.local` / `.env.production.local` - Environment-specific local overrides

**Recommendation:** Use `.env.local` for all local development secrets.

### 3.3 Required vs Optional Variables

**Minimal viable setup (authentication + basic CRM):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**For billing features (M07):**
- Add Stripe test keys
- Add PayPal sandbox keys

**For automation features (M05):**
- Add n8n credentials
- Add SMTP settings
- Add Twilio credentials (optional)

**For production deployment:**
- All variables in `.env.example`
- Production keys (not test/sandbox)
- Valid webhook endpoints

### 3.4 Troubleshooting

**Issue: "Supabase client error"**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check anon key matches project
- Ensure Supabase project is not paused

**Issue: "Stripe webhook signature verification failed"**
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Update `STRIPE_WEBHOOK_SECRET` with CLI-provided secret

**Issue: "n8n workflow not triggering"**
- Verify n8n workflow is active
- Check webhook URL is accessible
- Review n8n execution logs

**Issue: "Build fails with missing env var"**
- All `NEXT_PUBLIC_*` vars must be set at build time
- Vercel: Set in project settings → Environment Variables
- Local: Ensure variables are in `.env.local`

---

## 4. VERCEL DEPLOYMENT CONFIGURATION

### 4.1 Environment Variables Setup in Vercel

**Go to:** https://vercel.com/shoomacca/catchacrm-ng-v11/settings/environment-variables

**Add variables for each environment:**
- Production - Live customer data, production API keys
- Preview - Staging/test environment
- Development - Local development (often not needed, use `.env.local`)

### 4.2 Environment-Specific Configuration

**Production:**
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://catchacrm.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
STRIPE_SECRET_KEY=sk_live_xxx
PAYPAL_MODE=live
```

**Preview/Staging:**
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://catchacrm-git-dev.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
STRIPE_SECRET_KEY=sk_test_xxx
PAYPAL_MODE=sandbox
```

### 4.3 Vercel Build Configuration

**Automatic (from `package.json`):**
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`

**Environment variables available at build time:**
- All `NEXT_PUBLIC_*` variables
- Server-side variables available at runtime only

### 4.4 Domain Configuration

**Production domains:**
- Primary: `app.catchacrm.com` (configure DNS)
- Vercel default: `catchacrm.vercel.app`

**Update environment variables when domains change:**
- `NEXT_PUBLIC_APP_URL`
- Stripe webhook endpoints
- PayPal redirect URLs
- OAuth callback URLs

---

## 5. ENVIRONMENT VARIABLE VALIDATION

### 5.1 Runtime Validation

Create `src/lib/env.ts` to validate required variables:

```typescript
// Runtime validation (server-side only)
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ] as const;

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
```

### 5.2 Build-Time Validation

Next.js will automatically fail builds if `NEXT_PUBLIC_*` variables are referenced but not defined.

---

## 6. MIGRATION CHECKLIST

When migrating from legacy system, ensure:

- [ ] All legacy `.env` variables identified
- [ ] Variables mapped to new structure
- [ ] Test/sandbox keys obtained for development
- [ ] Production keys obtained and stored securely
- [ ] Vercel environment variables configured
- [ ] Webhook endpoints updated in third-party services
- [ ] OAuth redirect URLs updated
- [ ] DNS records updated for custom domains
- [ ] SSL certificates validated
- [ ] Build succeeds in all environments
- [ ] Runtime validation passes
- [ ] No secrets committed to git (audit with `git log -p | grep -i secret`)

---

## 7. APPENDIX: GENERATING NEW CREDENTIALS

### GitHub Personal Access Token
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`, `admin:org`
4. Copy token immediately (only shown once)

### Linear API Key
1. Go to https://linear.app/settings/api
2. Create new API key
3. Copy key immediately

### Stripe Test Keys
1. Log in to https://dashboard.stripe.com
2. Toggle to Test mode
3. Go to Developers → API keys
4. Use test keys for development

### Supabase Service Role Key
1. Go to project settings in Supabase dashboard
2. API section
3. Copy `service_role` key (never expose to client)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-23
**Status:** ✅ Complete
**Next Review:** Before M02 migration begins
