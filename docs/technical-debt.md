# ViveKit — Technical Debt & Code Optimization

> Last Updated: 2026-05-29

---

## Resolved Technical Debt

| Item | Fix | Date |
|:---|:---|:---:|
| Next.js 16 async route params | All dynamic handlers use `Promise<{ id: string }>` | Pre-launch |
| Global browser Supabase singleton | Removed — server modules use `server.ts` | Pre-launch |
| Missing Error Boundary | `src/app/error.tsx` added | Pre-launch |
| Duplicate env validation schemas | Unified into `src/lib/ai/ai-config.ts` | Pre-launch |
| Non-null assertion on stream body | Replaced with type-safe runtime check | Pre-launch |
| Missing HNSW vector index | `20260530000000_vector_hnsw_index.sql` | 2026-05-29 |
| Public RLS on all tables | `20260529000000_secure_rls_policies.sql` | 2026-05-29 |
| DB migrations never applied | All 12 migrations applied to ViveFlow | 2026-05-29 |
| Auth redirect to localhost | Supabase Site URL + redirect URL updated | 2026-05-29 |
| No rate limiting | `@upstash/ratelimit` + memory fallback | Pre-launch |
| `/api/context` 404 on page load | Replaced with static `getFallbackContext()` import | Pre-launch |
| Unstructured `console.log` in routes | Upgraded to tagged `console.info('[TAG]')` | Pre-launch |

---

## Open Technical Debt

### High Priority

#### Admin Dashboards Return Hardcoded Data

All engine files (`crm-engine.ts`, `observability-engine.ts`, `performance-engine.ts`, `security-engine.ts`, `workspace-engine.ts`, `strategy-engine.ts`) return static demo data. None query actual Supabase tables.

**Impact**: Admin dashboards give no real operational visibility. Misleading in a multi-user production context.
**Fix**: Wire each engine to its corresponding Supabase tables using `createClient()` from `server.ts`.
**Effort**: 3-5 days

#### Hardcoded Customer UUID

**File**: `src/app/page.tsx:79`

```ts
const customerContext = { id: '00000000-0000-0000-0000-000000000000', ... }
```

RAG pipeline detects this placeholder and bypasses DB queries. Works for sandbox but means no real customer memory retrieval.

**Fix**: Resolve authenticated user's customer profile from Supabase on page load.
**Effort**: 1 day

### Medium Priority

#### No CORS Headers

API routes have no explicit CORS configuration. Auth cookies mitigate cross-origin misuse, but headers should be explicit.

**Fix**: Add `Access-Control-Allow-Origin: https://kit.vivereply.com` in Next.js middleware or per-route.
**Effort**: 2 hours

#### GDPR Erasure is Mocked

`security-engine.ts` returns fabricated GDPR request entries. No actual deletion runs.

**Fix**: Implement cascading `DELETE` across `customer_profiles`, `vector_memories`, `crm_client_*` tables on GDPR erasure request.
**Effort**: 1-2 days

#### Random `conversationId` in Strategy Engine

**File**: `src/lib/ai/strategy-engine.ts:123`

```ts
conversationId: Math.random().toString()
```

Generates non-persistent conversation IDs. Prevents storing strategy decisions back to `crm_decision_logs`.

**Fix**: Accept `conversationId` as a parameter from the caller.
**Effort**: 2 hours

### Low Priority

#### Backup URLs Are Fabricated

`security-engine.ts` references non-existent S3 bucket URLs.

**Fix**: Remove or implement real backup integration (e.g., Supabase storage or AWS S3).
**Effort**: 1 day

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
