# ViveKit — API Architecture

> Last Updated: 2026-05-29

---

## Route Catalog

All routes are Next.js 16 App Router handlers under `src/app/api/`.

### AI Orchestration

| Method | Route | Description |
|:---:|:---|:---|
| `POST` | `/api/ai/stream` | SSE streaming of AI reply. Runs prompt injection scan, RAG retrieval, and Gemini 2.0 streaming. |
| `POST` | `/api/ai/generate` | Blocking AI generation. Returns complete reply JSON. |
| `POST` | `/api/ai/analyze` | Conversation intelligence analysis — sentiment, risk score, entities, intent. |
| `POST` | `/api/ai/strategy` | Multi-reply strategy generation — returns 5 strategic draft variants with tradeoff analysis. |

### Business Intelligence

| Method | Route | Description |
|:---:|:---|:---|
| `GET` | `/api/business/profile` | Retrieve business context (service profiles, operational rules, communication style). |
| `POST` | `/api/business/governance/validate` | Policy check — scan a draft reply against operational rules and return violations. |
| `GET/POST` | `/api/business/analytics` | Business event analytics — log and retrieve business outcome events. |

### CRM

| Method | Route | Description |
|:---:|:---|:---|
| `GET/POST` | `/api/crm/clients` | List and create customer profiles with CRM data. |
| `GET/PATCH/DELETE` | `/api/crm/clients/[id]` | Retrieve, update, or delete a specific client profile. |
| `POST` | `/api/crm/clients/log-decision` | Log an AI strategy selection and optional human override for reinforcement data. |

### Approvals

| Method | Route | Description |
|:---:|:---|:---|
| `GET/POST` | `/api/approvals` | List pending approval workflows or create a new approval record. |
| `PATCH` | `/api/approvals/[id]` | Transition approval state (approve/reject/escalate) with audit log entry. |

### Workspace & Collaboration

| Method | Route | Description |
|:---:|:---|:---|
| `GET/POST` | `/api/workspace` | List workspace details or send team invitations. |
| `POST` | `/api/workspace/comments` | Post an internal collaboration comment on a conversation. |

### Observability & Operations

| Method | Route | Description |
|:---:|:---|:---|
| `GET` | `/api/observability` | Retrieve observability events, latency stats, and AI quality metrics. |
| `GET` | `/api/performance` | Retrieve Redis hit rate, vector latency, circuit breaker state, and cost data. |
| `POST` | `/api/security` | Scan a prompt for injection patterns and log security incidents. |

---

## Common Middleware Stack

Every request to an API route passes through:

1. **`src/proxy.ts`** — Supabase session refresh + superadmin gate
2. **`src/lib/supabase/middleware.ts`** — JWT claims validation
3. **Route handler** — Zod schema validation → business logic → Supabase query

AI routes additionally run:

4. **`SecurityEngine.scanPromptInjection()`** — prompt injection filter before any model call
5. **Rate limiter** — `@upstash/ratelimit` per-user request quota

---

## Request/Response Contracts

All AI endpoints use the shared schema from `src/lib/validation.ts`:

```ts
const chatRequestSchema = z.object({
  rawConversation: z.string().max(50000),
  additionalInstructions: z.string().max(5000).optional(),
  tone: z.string().optional(),
  customerContext: z.object({ id: z.string(), ... }).optional(),
})
```

All errors return:
```json
{ "error": "Descriptive message" }
```

with appropriate HTTP status codes (400 Validation, 403 Forbidden, 429 Rate Limited, 500 Server Error).

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
