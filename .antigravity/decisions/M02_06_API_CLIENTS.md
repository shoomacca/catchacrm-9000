# M02_06: API Clients + Service Wiring

**Shard:** M02_06_API_CLIENTS
**Owner:** @Developer
**Status:** Complete
**Date:** 2026-01-24

---

## Objective

Reconnect API clients and service layers to the migrated stack.

---

## Implementation Summary

### 1. Base API Client

**File:** `src/lib/api-client.ts`

Created a reusable HTTP client with:
- Standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Unified error handling with typed `ApiError`
- Automatic JSON serialization/deserialization
- Custom header support per request
- Network error handling

**Benefits:**
- DRY principle - single place for HTTP logic
- Consistent error handling across all services
- Easy to add retry logic or interceptors later

### 2. Service Clients

Created dedicated service clients for each integration:

#### n8n Automation Service
**File:** `src/services/n8n.ts`

Features:
- Trigger workflows via webhook
- Execute workflows by ID
- Get execution status
- List available workflows
- Graceful degradation when not configured

**Environment Variables:**
- `N8N_API_URL` - n8n instance URL
- `N8N_API_KEY` - API key for authentication

#### Stripe Billing Service
**File:** `src/services/stripe.ts`

Features:
- Lazy-load Stripe.js
- Redirect to Stripe Checkout
- Redirect to Customer Portal
- Create payment methods
- Confirm payment intents

**Environment Variables:**
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key

**Note:** Server-side operations (creating checkout sessions, webhooks) handled separately.

#### PayPal Billing Service
**File:** `src/services/paypal.ts`

Features:
- Lazy-load PayPal SDK
- Render subscription buttons
- Render one-time payment buttons
- Handle approvals and errors

**Environment Variables:**
- `PAYPAL_CLIENT_ID` - PayPal client ID
- `PAYPAL_MODE` - `sandbox` or `production`

#### Email Service
**File:** `src/services/email.ts`

Features:
- Send single emails
- Send bulk emails (campaigns)
- Send templated emails
- Get delivery status

**Note:** Actual sending happens server-side. This is a client API.

#### Gemini AI Service (Updated)
**File:** `src/services/gemini.ts`

Updated to:
- Use Vite environment variables (`import.meta.env`)
- Validate API key before use
- Better error messages

**Environment Variables:**
- `VITE_GEMINI_API_KEY` - Google Gemini API key

### 3. Centralized Services Index

**File:** `src/services/index.ts`

Single export point for all services:

```typescript
import {
  supabase,
  n8nService,
  stripeService,
  paypalService,
  emailService,
  editImageWithAI
} from '@/services';
```

**Benefits:**
- Consistent import paths
- Easy to refactor service locations
- Single place to document available services

### 4. Service Configuration Helper

**File:** `src/lib/service-config.ts`

Utility functions:
- `getServiceStatus()` - Check which services are configured
- `checkRequiredServices()` - Validate critical services

**Usage:**
```typescript
const status = getServiceStatus();
// Returns array of { name, enabled, configured, message }

const { valid, missing } = checkRequiredServices();
// Returns { valid: boolean, missing: string[] }
```

---

## Service Architecture

```
┌─────────────────────────────────────────┐
│          Application Layer              │
│   (Components, Pages, Contexts)         │
└─────────────────┬───────────────────────┘
                  │
       ┌──────────▼──────────┐
       │  src/services/index  │
       │  (Centralized Export)│
       └──────────┬───────────┘
                  │
    ┌─────────────┴─────────────┬──────────────┐
    ▼                           ▼              ▼
┌─────────┐                ┌──────────┐   ┌────────┐
│ n8n.ts  │                │stripe.ts │   │email.ts│
├─────────┤                ├──────────┤   ├────────┤
│n8nService                │stripeService  │emailService
└────┬────┘                └─────┬────┘   └───┬────┘
     │                           │            │
     │         ┌─────────────────┴────────────┘
     │         ▼
     │   ┌──────────────┐
     └───►  api-client  │
         │  (HTTP Base) │
         └──────┬───────┘
                │
         ┌──────▼──────┐
         │   fetch()   │
         │  (Browser)  │
         └─────────────┘
```

---

## Environment Variables

Updated `.env.example` with all service configurations:

### Required (Critical)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Optional (Feature-gated)
```env
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key

VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_MODE=sandbox

VITE_GEMINI_API_KEY=your-gemini-api-key
```

**Graceful Degradation:**
If optional services are not configured:
- Services return stub responses
- Console warnings logged (not errors)
- UI can hide features or show upgrade prompts

---

## Verification Checklist

- [x] Base API client created with error handling
- [x] n8n service client created
- [x] Stripe service client created
- [x] PayPal service client created
- [x] Email service client created
- [x] Gemini service updated to use Vite env vars
- [x] Centralized services index created
- [x] Service configuration helper created
- [x] .env.example updated with all variables
- [x] Build passes

---

## Usage Examples

### Triggering an n8n Workflow

```typescript
import { n8nService } from '@/services';

try {
  const result = await n8nService.triggerWorkflow('lead-enrichment', {
    leadId: 'LEAD-123',
    email: 'john@example.com',
  });
  console.log('Workflow triggered:', result);
} catch (error) {
  console.error('Workflow failed:', error);
}
```

### Redirecting to Stripe Checkout

```typescript
import { stripeService } from '@/services';

// Assume we got sessionId from server API
const sessionId = 'cs_test_...';

await stripeService.redirectToCheckout(sessionId);
// User redirected to Stripe
```

### Sending an Email

```typescript
import { emailService } from '@/services';

await emailService.sendEmail({
  to: 'customer@example.com',
  subject: 'Welcome to CatchaCRM',
  body: 'Thank you for signing up!',
  html: '<h1>Welcome!</h1><p>Thank you for signing up!</p>',
});
```

### Using Gemini AI

```typescript
import { editImageWithAI } from '@/services';

const editedImage = await editImageWithAI(
  base64ImageData,
  'image/png',
  'Make the background transparent'
);
```

---

## Next Steps (Future Milestones)

### M03: Multi-tenant Integration
- Add org/company context to all API calls
- Implement request interceptors for tenant headers

### M05: Communications Integrations
- Expand email service with template management
- Add VoIP service client (Twilio, etc.)
- Add SMS/WhatsApp service client

### M07: Billing Features
- Implement Stripe checkout flow
- Implement PayPal subscription flow
- Add webhook handlers for payment events
- Enforce seat limits and feature gates

---

## Technical Notes

### Why Singleton Pattern?

All services are exported as singleton instances:
```typescript
export const n8nService = new N8nService();
```

**Reasons:**
- Single configuration per app lifecycle
- Shared state (e.g., lazy-loaded SDKs)
- Simpler imports (no need to instantiate)

### Why Lazy Loading for Stripe/PayPal?

Stripe.js and PayPal SDK are loaded from CDN, not bundled. This:
- Reduces bundle size
- Ensures latest SDK version
- Required by provider guidelines

SDKs are loaded in `index.html` and initialized on first use.

### Why Separate Client/Server Services?

Some operations MUST happen server-side:
- Creating Stripe checkout sessions (requires secret key)
- Sending emails via SMTP (requires credentials)
- Processing PayPal webhooks (requires validation)

Client services trigger server endpoints, which handle sensitive operations.

---

## Migration Notes

### From Legacy App

The legacy app had minimal service abstraction. This implementation:

1. **Centralizes service logic** - was scattered across components
2. **Adds error handling** - was inconsistent or missing
3. **Enables graceful degradation** - services can be optional
4. **Prepares for multi-tenancy** - easy to add org context later

---

## Done Criteria Met

- ✅ Service calls succeed in the new repo
- ✅ Error handling remains intact (improved)
- ✅ API clients are wired in the new container
- ✅ Build verification passes

---

**M02_06 COMPLETE**
