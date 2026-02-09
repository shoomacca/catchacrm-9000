# CRITICAL FINDING: Legacy Tech Stack Mismatch

**Date:** 2026-01-23
**Milestone:** M02_01
**Severity:** HIGH - Requires immediate decision

---

## Issue

The legacy CatchaCRM codebase at `catchacrm-master/` uses:
- ✅ **Vite** as build tool
- ✅ **React 19** (latest)
- ✅ **react-router-dom** for client-side routing
- ❌ **NOT Next.js**

**Expected Tech Stack (from BRIEF.md):**
- Next.js 14 with App Router
- Server-side rendering
- API routes in Next.js

**Actual Legacy Tech Stack:**
```json
{
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-router-dom": "^7.11.0",
    "recharts": "^3.6.0",
    "@google/genai": "^1.34.0",
    "lucide-react": "^0.562.0"
  },
  "devDependencies": {
    "vite": "^6.2.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2"
  }
}
```

---

## Impact Assessment

### Architecture
- **Client-side only** (no SSR, no API routes in app)
- **Static build** (Vite outputs static HTML/JS/CSS)
- **No server middleware** (all API calls are external)
- **Supabase direct from browser** (anon key in client)

### Migration Options

#### Option 1: Convert to Next.js (HIGH EFFORT)
**Effort:** 2-3 days
**Pros:**
- Aligns with NEW GENESIS tech stack
- Enables SSR and server components
- Better for SEO and performance
- API routes for server-side logic
- Middleware for auth/RLS enforcement

**Cons:**
- Requires rewriting routing (react-router → Next.js App Router)
- Need to refactor components for server/client split
- More complex deployment
- Higher learning curve

**Tasks:**
1. Convert `pages/` to Next.js `app/` directory structure
2. Rewrite react-router routes to Next.js file-based routing
3. Split components into server/client components
4. Move Supabase calls to server actions/API routes
5. Add middleware for auth
6. Test SSR compatibility

#### Option 2: Keep Vite (LOW EFFORT)
**Effort:** 4-6 hours
**Pros:**
- Minimal migration work
- Keep existing routing
- Faster builds (Vite is faster than Next.js)
- Simpler deployment (static files)
- No breaking changes to code

**Cons:**
- Deviates from NEW GENESIS standard stack
- No SSR benefits
- All API calls from browser (less secure)
- Can't use Next.js middleware or API routes
- Need separate backend for server logic

**Tasks:**
1. Copy `catchacrm-master/` code into new repo
2. Update import paths
3. Configure Vercel for Vite deployment
4. Test build and routes

---

## Security Implications

### Vite (Current)
- ✅ Supabase RLS handles security at database level
- ✅ Anon key safe to expose (RLS policies protect data)
- ⚠️ All queries visible in browser DevTools
- ⚠️ No server-side validation before DB calls

### Next.js (Migration)
- ✅ Server actions can use service role key safely
- ✅ Hide business logic from client
- ✅ Server-side validation before DB
- ✅ Middleware for auth checks
- ⚠️ More complex to implement

---

## Recommendation

### If security and SSR are priorities: **Option 1 (Convert to Next.js)**
- Better alignment with multi-tenant requirements
- Stronger security model
- Future-proof for server-side features

### If speed to production is priority: **Option 2 (Keep Vite)**
- Faster migration (ship in days, not weeks)
- RLS at database level provides adequate security
- Can always migrate to Next.js later as M10+

---

## Decision Required

**Question:** Which path should we take?

1. **Convert to Next.js** (aligns with plan, more work)
2. **Keep Vite** (faster, deviates from plan)
3. **Hybrid** (migrate to Vite now, convert to Next.js in M10)

**Recommendation:** Start with **Option 2 (Keep Vite)** to unblock progress, then plan Next.js conversion as separate milestone after M09.

---

## Updated Blockers

- ✅ MIG-001: Legacy codebase location - RESOLVED (`catchacrm-master/`)
- ✅ MIG-002: Supabase credentials - RESOLVED (provided)
- ⚠️ **MIG-004: Tech stack mismatch** - NEW BLOCKER (requires decision)
- ⚠️ MIG-003: n8n instance access - PENDING (can proceed without this initially)

---

## Next Steps (Pending Decision)

**If Option 1 (Next.js):**
1. Update M02 shards to include conversion tasks
2. Increase M02 estimate from 8 to 12+ shards
3. Begin conversion in M02_01

**If Option 2 (Vite):**
1. Update STACK.md to reflect Vite instead of Next.js
2. Update deployment configs for Vite
3. Proceed with M02_01 as simple copy/import
4. Add M10: Next.js Conversion milestone (optional future work)

---

**Awaiting user decision before proceeding with M02_01.**
