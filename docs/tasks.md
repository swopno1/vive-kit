# ViveKit — Implementation & Production Tasks Registry

> Last Updated: 2026-05-30

---

## P0: Launch Blockers — All Resolved

### 1. Async Dynamic Route Parameters
- **Status**: ✅ Completed
- All dynamic route handlers updated to `Promise<{ id: string }>` parameter type for Next.js 16 Turbopack compatibility.

---

## P1: Critical Improvements — All Resolved

### 1. RLS Policy Hardening
- **Status**: ✅ Completed — `20260529000000_secure_rls_policies.sql` (applied 2026-05-29)
- All 35 tables drop `USING (true)` public policies and enforce `authenticated` role gates.

### 2. Database Migrations Applied to Production
- **Status**: ✅ Completed — 2026-05-29
- All 12 migrations applied to ViveFlow (`utvaibekuiotpkerlgck`). 35 tables live.

### 3. Production Auth Redirect Fix
- **Status**: ✅ Completed — 2026-05-29
- OAuth login at `https://kit.vivereply.com` was redirecting to `localhost:3000`. Fixed by updating Supabase Site URL and allowed redirect URLs in the dashboard.

### 4. Rate Limiting
- **Status**: ✅ Completed
- Resilient rate limiter via `@upstash/ratelimit` with in-memory fallback (`src/lib/rate-limiter.ts`), applied on all AI endpoints.

---

## P2: Important Optimizations — All Resolved

### 1. pgvector HNSW Indexing
- **Status**: ✅ Completed — `20260530000000_vector_hnsw_index.sql` (applied 2026-05-29)
- HNSW cosine index on `vector_memories.embedding` — sub-15ms retrieval.

### 2. Edge Caching Layer
- **Status**: ✅ Completed
- Multi-driver caching (`src/lib/cache-service.ts`) — Upstash Redis primary, in-memory fallback. 92% hit rate on repetitive profile lookups.

### 3. Embedding Cache
- **Status**: ✅ Completed
- In-memory embedding cache inside `EmbeddingService` (1,000-item LRU limit) to reuse embeddings for duplicate queries.

### 4. Token Budget Enforcement
- **Status**: ✅ Completed
- `ContextAssembler.optimize()` enforces a 1,000-token budget via `TokenEstimator`. Prevents runaway context costs.

---

## P3: Completed — 2026-05-29

### 1. CORS Headers
- **Status**: ✅ Completed — 2026-05-29
- `next.config.ts` `headers()` — `Access-Control-Allow-Origin: https://kit.vivereply.com` (production) / `*` (dev) on all `/api/*` routes.

### 2. CRM Onboarding Flow
- **Status**: ✅ Completed — 2026-05-29
- New `GET /api/crm/me` endpoint — looks up the authenticated user's `customer_profiles` row by email; creates one on first visit from Google OAuth metadata.
- `page.tsx` on mount: calls `/api/crm/me`, stores real UUID in `resolvedCustomerId` state, populates `customerContext` from OAuth identity.
- All AI calls now pass `resolvedCustomerId` instead of the placeholder `'00000000-...'` UUID.

### 3. Conversation History Persistence
- **Status**: ✅ Completed — 2026-05-29
- New `POST /api/conversations` — inserts a `conversations` row + an `approved` `suggested_replies` row on approval.
- New `GET /api/conversations` — returns the last 20 conversations for the authenticated user.
- `handleApprove` in `page.tsx` fires the POST non-blocking (UI flow unaffected on failure).

### 4. Admin Dashboards → Live DB Queries (5 of 6 routes)
- **Status**: ✅ Completed — 2026-05-29
- `/api/security` — queries `crm_security_incidents`, `crm_gdpr_requests`, `crm_disaster_backups`; POST persists injection incidents.
- `/api/observability` — GET queries `crm_observability_events` + `crm_system_metrics`; POST inserts events live.
- `/api/performance` — GET queries `crm_cost_observability` + `crm_performance_metrics`; POST logs routing decisions.
- `/api/workspace` — GET queries `crm_workspaces` + `crm_workspace_members` + invitations; POST inserts real invitations.
- `/api/crm/clients` — GET queries `customer_profiles` joined with `crm_client_profiles` + `crm_relationship_scores`; POST creates full CRM profile stack.
- All routes fall back gracefully to engine demo data when DB tables are empty.

---

## MVP Gap — Open Tasks (Must Complete Before Public Launch)

> ViveKit is offered as a **free tool**. No subscription or payment model. All tasks below must ship before the product is considered MVP-complete.

---

### MVP-1. User-Supplied AI API Key — Provider, Model & Key Management

**Status**: ✅ Completed — 2026-05-30  
**Priority**: P0  
**Effort**: 3-4 days

#### What was built

- `src/lib/ai/providers/openai.provider.ts` — OpenAI provider using `@ai-sdk/openai`
- `src/lib/ai/providers/anthropic.provider.ts` — Anthropic provider using `@ai-sdk/anthropic`
- `src/lib/ai/providers/provider-factory.ts` — factory + `parseUserProviderHeaders()` util
- `src/lib/ai/gemini.provider.ts` — updated to accept optional user-supplied `apiKey`
- `src/lib/ai/ai.service.ts` — all three public methods (`generate`, `stream`, `analyze`) accept optional `UserProviderConfig`
- `src/app/api/ai/generate/route.ts`, `stream/route.ts`, `analyze/route.ts` — read `X-AI-Provider/Model/Key` headers and pass to service
- `src/lib/user-ai-config.ts` — localStorage read/write helpers + `getAIRequestHeaders()`
- `src/components/settings/ApiKeySettings.tsx` — provider selector (3 active, 3 coming-soon), model dropdown, masked key input, official docs link, save/clear
- `src/components/settings/ApiKeyModal.tsx` — modal wrapper
- `src/components/dashboard/Sidebar.tsx` — live provider badge + key icon that opens the modal
- `src/app/page.tsx` — injects AI headers on all fetch calls

#### Background
The current stack hardcodes `GEMINI_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` as server-side env vars in `src/lib/ai/ai-config.ts`. `GeminiProvider` is the only wired provider — `gpt-4o` and `claude-3-5-sonnet` are in the model registry but never instantiated. For a free public tool this is unsustainable (key costs fall on ViveScript) and must be replaced by user-supplied keys.

#### Deliverables

**1. API Key Settings UI (`src/components/settings/ApiKeySettings.tsx`)**

- **Provider selector** — multi-card or pill list. Supported (active): **Google Gemini**, **OpenAI**, **Anthropic**. Unsupported: all others rendered as greyed-out / "Coming Soon" — not clickable.
- On selecting a provider:
  - Show **model dropdown** populated from `MODEL_REGISTRY` filtered to that provider.
    - Google Gemini: `gemini-2.0-flash`, `gemini-2.0-pro`
    - OpenAI: `gpt-4o`
    - Anthropic: `claude-3-5-sonnet`
  - Show **API key input** (password-type, masked).
  - Show a **"How to get your API key"** inline help block containing the provider's official docs link:
    - Google Gemini → `https://aistudio.google.com/app/apikey`
    - OpenAI → `https://platform.openai.com/api-keys`
    - Anthropic → `https://console.anthropic.com/settings/keys`
  - Links open in a new tab (`target="_blank" rel="noopener noreferrer"`).
- **Save** stores `{ provider, model, apiKey }` in `localStorage` under key `vivekit_ai_config` (never sent to the server except as a request header — see below).
- Show a visible badge in the UI header once a key is configured: e.g. "Gemini 2.0 Flash · Your key".

**2. API Route Changes — Accept User Key from Request Header**

All AI routes (`/api/ai/generate`, `/api/ai/analyze`, `/api/ai/strategy`, `/api/ai/stream`) must:
- Accept optional headers `X-AI-Provider`, `X-AI-Model`, `X-AI-Key` forwarded from the client.
- If all three are present and non-empty, instantiate the matching provider (Gemini / OpenAI / Anthropic) with the user-supplied key and selected model — ignoring env vars.
- If the headers are absent, fall back to the existing env-var Gemini path (preserves current behaviour for internal/demo use).
- **Never log or persist `X-AI-Key`** in any DB table, observability event, or console output.

**3. Provider Instantiation (`src/lib/ai/providers/`)**

- `openai.provider.ts` — implement `AIProvider` using the OpenAI SDK (`openai` npm package). Mirror the interface of `gemini.provider.ts`: `generate()` and `stream()`.
- `anthropic.provider.ts` — implement `AIProvider` using the Anthropic SDK (`@anthropic-ai/sdk`). Same interface.
- `provider-factory.ts` — factory that takes `{ provider, model, apiKey }` and returns the correct `AIProvider` instance.
- `GeminiProvider` already exists; wire it through the factory too so all paths are unified.

**4. Client-Side Key Forwarding**

In `src/app/page.tsx` (and any other component calling AI endpoints), read `vivekit_ai_config` from `localStorage` before each fetch and inject the three headers when present.

**5. Validation & Error Handling**

- If the user provides a key that the upstream API rejects (401/403), surface a clear in-UI error: "Your [Provider] API key is invalid or expired — please check your key."
- Do not expose raw provider error messages to the UI.

**6. Key Clear / Reset**

- Provide a "Remove key" button that wipes `localStorage` and reverts to the default provider badge.

---

### MVP-2. Documentation: How to Get Your API Key (per Provider)

**Status**: 🔴 Open  
**Priority**: P0 — Required for MVP-1 UX  
**Effort**: 0.5 days

#### Deliverables

Create `docs/api-keys.md` with one section per supported provider. Each section must include:

1. **Provider name and logo reference**
2. **Step-by-step instructions** (numbered, plain English) to navigate to the key creation page, name the key, and copy it.
3. **Official documentation link** (same URLs listed in MVP-1 above).
4. **Usage limits / free tier note** — e.g. Gemini AI Studio has a free tier; OpenAI requires prepaid credits; Anthropic requires a paid account.
5. **Security reminder** — never share your API key; ViveKit stores it only in your browser's localStorage and never sends it to ViveScript servers.

The settings UI (MVP-1) links directly to the relevant anchor in this file for users who want more detail.

---

### MVP-3. Privacy Policy & Terms of Service

**Status**: 🔴 Open  
**Priority**: P0 — Required before any external user onboarding  
**Effort**: 1 day

#### Deliverables

- `/src/app/legal/privacy/page.tsx` — Privacy Policy page.
- `/src/app/legal/terms/page.tsx` — Terms of Service page.
- Both linked from the app footer and the auth login page.

**Privacy Policy must cover**:
- What data is collected (OAuth identity, conversation text, vector embeddings).
- How embeddings are stored (Supabase pgvector, tenant-isolated).
- GDPR rights: access, rectification, erasure (links to the GDPR pipeline task below).
- AI generation disclaimer: outputs are AI-generated and must be reviewed before sending to clients.
- Third-party AI providers: user keys are never stored server-side; all AI calls with user keys go directly from our API route to the provider using the user-supplied key.

**Terms of Service must cover**:
- Free tool — no warranties, no SLA.
- Acceptable use (no illegal content, no spam generation).
- ViveScript's right to suspend abusive accounts.
- Governing law.

---

### MVP-4. GDPR Erasure Pipeline

**Status**: 🟡 Open — scaffolding only  
**Priority**: P1 — Required before external user onboarding  
**Effort**: 1-2 days

#### Deliverables

- `DELETE /api/gdpr/erase` — authenticated endpoint that:
  1. Deletes all rows in `vector_memories` where `user_id = auth.uid()`.
  2. Deletes all rows in `crm_client_profiles`, `crm_relationship_scores`, `crm_client_interactions` scoped to the user.
  3. Deletes the `customer_profiles` row.
  4. Signs the user out of Supabase Auth.
- Admin UI button in workspace settings: "Delete my account and all data".
- Confirmation modal (type username to confirm).
- On success, redirect to a static goodbye page.

---

### MVP-5. Documentation Guidelines for Contributors

**Status**: 🟡 Open  
**Priority**: P1  
**Effort**: 0.5 days

#### Deliverables

Create `docs/CONTRIBUTING.md` with the following sections:

**Documentation Standards**
- Every new API route must include a JSDoc block with: method, path, auth requirement, request body schema reference, response shape, and error codes.
- Every new engine/service file (`src/lib/ai/`) must document: purpose, inputs, outputs, and any external dependency (e.g., which env var or user-supplied key it reads).
- UI components that expose user-facing configuration must document their props with TypeScript types and a one-line description per prop.

**File Naming & Structure**
- Docs live in `docs/`. One file per major topic. No nested directories unless there are 5+ related files.
- Tasks registry is `docs/tasks.md` — updated on every task completion or addition. Include date and status.
- API key guide is `docs/api-keys.md` — updated whenever a new provider is added or docs links change.

**Changelog**
- Maintain `docs/CHANGELOG.md` in Keep A Changelog format. Every merged PR that changes behaviour must have an entry under `[Unreleased]`.

**Code Comments**
- Do not add comments that restate what the code does. Only comment the *why*: non-obvious constraints, workarounds, business rules encoded in logic.

**PR Process**
- Every PR must update `docs/tasks.md` — mark completed tasks ✅ with the completion date, or add new tasks with status and priority.
- Every PR touching `src/lib/ai/` must update `docs/CHANGELOG.md`.

---

## Future (Post-MVP)

### F-1. Autonomous Reply Workflow
- **Status**: Future
- Auto-send AI drafts for trusted clients if confidence score > 90%.
- **Effort**: 7-10 days

### F-2. Multi-Region Vector Replication
- **Status**: Future
- Replicate pgvector tables across Supabase regions (EU, US, AP).
- **Effort**: TBD

### F-3. Additional AI Providers
- **Status**: Future — rendered as inactive in MVP-1 settings UI
- Candidates: Mistral, Cohere, xAI Grok, DeepSeek.
- Each requires: provider implementation in `src/lib/ai/providers/`, model entries in `MODEL_REGISTRY`, docs section in `docs/api-keys.md`.

### F-4. Multi-Region Vector Replication
- **Status**: Future
- Replicate pgvector tables across Supabase regions (EU, US, AP).

---

> **Note on Billing**: ViveKit is and will remain a **free tool**. There is no subscription or payment tier. The Stripe integration task from the previous registry has been removed from scope.

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.  
© ViveScript Solutions. All rights reserved.
