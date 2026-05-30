# ViveKit — Known Issues & Troubleshooting Guide

> Last Updated: 2026-05-29

---

## Resolved Issues

### 1. OAuth Redirect Pointing to localhost in Production (Fixed 2026-05-29)

**Symptom:** Logging in at `https://kit.vivereply.com/auth/login` redirected to `http://localhost:3000/?code=<auth_code>` instead of the production callback.

**Root Cause:** The Supabase project's **Site URL** was set to `http://localhost:3000`. When `redirectTo` in `signInWithOAuth` is not on Supabase's allowed redirect list, Supabase falls back to the Site URL.

**Fix:** Updated the Supabase dashboard (Authentication → URL Configuration):
- **Site URL**: `https://kit.vivereply.com`
- **Redirect URLs**: Added `https://kit.vivereply.com/auth/callback`

No code changes were required. The login page already uses `window.location.origin` dynamically.

---

### 2. Dynamic Route Handler Type Mismatches (Fixed)

**Symptom:** Next.js 16 Turbopack compilation errors:
```
Type does not satisfy the constraint RouteHandlerConfig
```

**Root Cause:** Dynamic route params in Next.js 16 App Router must be awaited as `Promise<{ id: string }>`.

**Fix:** All GET and POST handlers in `src/app/api/**/[id]/route.ts` updated to accept and `await` the params Promise.

---

### 3. pgvector Dimension Mismatch on Similarity Search (Fixed)

**Symptom:** Query failures during semantic memory lookups.

**Root Cause:** Comparing query embeddings of different dimensions against the stored `vector(768)` column (e.g., accidentally using a 1536-dim OpenAI model against a 768-dim Gemini table).

**Fix:** `EmbeddingService` consistently uses Google `text-embedding-004` (768 dimensions). Column is typed `vector(768)`. Dimension mismatch now throws at query time.

---

### 4. Missing `/api/context` Route (Fixed)

**Symptom:** 404 error on page load from `page.tsx` calling `/api/context`.

**Fix:** Replaced the dynamic API call with a direct static import of `BusinessIntelligenceEngine.getFallbackContext()`.

---

## Open Issues

### 5. Admin Dashboards Serve Hardcoded Data

**Affected Routes:** `/admin/performance`, `/admin/security`, `/admin/observability`, `/admin/workspace`, `/admin/crm`, `/admin/business`

**Symptom:** All admin panels show plausible but hardcoded/fabricated data — not live Supabase queries.

**Impact:** Medium — dashboards work as a demo but give no real operational visibility.

**Fix Required:** Wire each engine file to its corresponding Supabase table. No blocking issues for the current superadmin-gated MVP, but required before multi-user SaaS launch.

---

### 6. No CORS Headers on API Routes

**Symptom:** API routes accept requests from any origin.

**Impact:** Low — mitigated by Supabase auth cookie requirement (cross-origin requests lack valid session cookies).

**Fix Required:** Add explicit `Access-Control-Allow-Origin` headers in Next.js route handlers or middleware.

---

### 7. GDPR Erasure Not Implemented

**Symptom:** The `/admin/security` GDPR panel shows mock data; no real deletion pipeline exists.

**Impact:** Low for current superadmin-only access, compliance risk if opening to external users.

**Fix Required:** Implement actual Supabase cascading deletion across `customer_profiles`, `vector_memories`, `crm_client_*` tables when a GDPR erasure request is received.

---

### 8. Hardcoded Mock Customer UUID

**File:** `src/app/page.tsx:79`

**Symptom:** Customer context uses `'00000000-0000-0000-0000-000000000000'` as the customer ID, bypassing real DB RAG lookups.

**Impact:** Low — RAG pipeline correctly detects this UUID and skips DB queries. No production data risk.

**Fix Required:** Replace with the authenticated user's actual Supabase user ID once CRM onboarding flow is implemented.

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
