# ViveKit — Backend Architecture

> Last Updated: 2026-05-29

---

## Runtime Environment

- **Vercel Serverless Functions** — primary REST route handlers (CRM, approvals, business, workspace)
- **Vercel Edge Runtime** — low-latency AI streaming via `/api/ai/stream` (SSE)
- **Next.js 16.2.6** — App Router with async dynamic params (`Promise<{ id: string }>`)

---

## Core Libraries

| Library | Version | Purpose |
|:---|:---:|:---|
| `@ai-sdk/google` | ^3.0.75 | Gemini 2.0 Flash / Pro integration |
| `ai` (Vercel AI SDK) | ^6.0.184 | Streaming SSE, `streamText`, `generateText` |
| `@supabase/ssr` | ^0.10.3 | Server-side Supabase client with cookie auth |
| `@supabase/supabase-js` | ^2.106.0 | Database queries, RPC calls |
| `@upstash/ratelimit` | ^2.0.8 | Token-bucket rate limiting |
| `@upstash/redis` | ^1.38.0 | Edge cache + rate limit storage |
| `zod` | — | Input validation at all API boundaries |

---

## AI Engine Layer (`src/lib/ai/`)

| File | Responsibility |
|:---|:---|
| `ai-config.ts` | Model registry, routing rules, Zod env validation |
| `ai.service.ts` | Main orchestration — RAG → prompt build → generate |
| `gemini.provider.ts` | Gemini API adapter, streaming with runtime body check |
| `prompt-builder.ts` | 11-module dynamic prompt assembly |
| `embedding-service.ts` | Google `text-embedding-004` calls + in-memory LRU cache |
| `retrieval-engine.ts` | `match_memories_v2()` RPC + placeholder UUID bypass |
| `context-assembler.ts` | Token-budget-aware RAG context formatting (1K tokens max) |
| `token-estimator.ts` | Lightweight GPT-tokenizer-compatible token counter |
| `security-engine.ts` | Prompt injection scanner + security incident logging |
| `business-engine.ts` | Business context loading + fallback context |
| `crm-engine.ts` | CRM profile loading (hardcoded fallback — pending live DB) |
| `strategy-engine.ts` | Multi-reply strategy generation (5 variants) |
| `approval-engine.ts` | Approval workflow state transitions |
| `observability-engine.ts` | Event logging + metrics (hardcoded fallback — pending live DB) |
| `performance-engine.ts` | Cost/cache metrics (hardcoded fallback — pending live DB) |
| `workspace-engine.ts` | Workspace/team data (hardcoded fallback — pending live DB) |
| `ai-logger.ts` | Centralized structured AI telemetry logging |
| `response-parser.ts` | Gemini response parsing and normalization |

---

## Supabase Client Architecture

Two distinct clients are used — never mixed:

| Client | File | Used By | Auth |
|:---|:---|:---|:---:|
| Server client | `src/lib/supabase/server.ts` | API routes, server components | Session cookies (RLS context) |
| Browser client | `src/lib/supabase/client.ts` | Client components only | Anon key |

The server client correctly propagates the authenticated session to Supabase RLS policies.

---

## Background Processing

Long-latency operations are handled asynchronously to avoid blocking response streams:

- **Memory embedding insertion** — runs after reply approval, inserts new conversation chunks into `vector_memories`
- **Telemetry logging** — cost and usage events written to `crm_cost_observability` and `crm_observability_events` in background
- **Memory access tracking** — `mark_memory_accessed()` wrapped in `try/catch` so tracking failures never block RAG retrieval

---

## Rate Limiting Architecture

`src/lib/rate-limiter.ts` — sliding window rate limiter:

- **Primary**: Upstash Redis via `@upstash/ratelimit`
- **Fallback**: Local in-memory counter (auto-activated when `UPSTASH_REDIS_REST_URL` is absent)
- Applied at the top of all AI route handlers before any processing

---

## Caching Architecture

`src/lib/cache-service.ts` — multi-driver cache:

- **Primary**: Upstash Redis (shared across serverless instances)
- **Fallback**: In-memory `Map` (per-instance, suitable for single-node dev)
- Used for: client profile caching, business context caching
- Target hit rate: 92% on repetitive profile lookups

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
