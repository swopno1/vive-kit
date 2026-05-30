# ViveKit — Performance & Cost Engineering

> Last Updated: 2026-05-29

---

## Model Cost Allocation

| Model | Token Cost (Input) | Token Cost (Output) | Traffic Share |
|:---|:---:|:---:|:---:|
| Gemini 2.0 Flash | $0.0001 / 1K | $0.0004 / 1K | ~72% (fast tasks) |
| Gemini 2.0 Pro | $0.00125 / 1K | $0.00375 / 1K | ~28% (complex tasks) |

By routing fast tasks (classify, summarize, extract) to Gemini 2.0 Flash, overall inference cost drops ~85% vs. running everything on Gemini 2.0 Pro.

**Estimated savings**: ~$200–$250/month per active team workspace at moderate usage.

---

## Multi-Layer Caching

### Upstash Redis (Edge Cache)

- **Driver**: `@upstash/redis`
- **Target hit rate**: 92% on repetitive profile/context lookups
- **Cached data**: client profiles, business context, operational rules
- **Fallback**: in-memory `Map` when Upstash credentials are absent

### Embedding Cache (In-Memory LRU)

- **Location**: `EmbeddingService` in-memory Map
- **Capacity**: 1,000 entries (evicts oldest on overflow)
- **Benefit**: Skips Gemini embedding API call for duplicate conversation inputs
- **Scope**: per-serverless-instance

### RAG Bypass for Placeholder UUID

When `customerContext.id === '00000000-0000-0000-0000-000000000000'`, the entire vector DB query is skipped. Zero latency overhead during sandbox/demo sessions.

---

## Latency Stack

| Operation | Target Latency |
|:---|:---:|
| Redis cache hit | < 5ms |
| pgvector HNSW search | < 15ms |
| Gemini 2.0 Flash (stream first token) | ~500ms |
| Gemini 2.0 Pro (stream first token) | ~1,200ms |
| Full streaming reply (typical) | 2–6s |
| Prompt injection scan | < 5ms |

---

## Circuit Breaker

A circuit breaker monitors Gemini API latency. On sustained timeout or error:

1. **Closed** (normal) — requests flow to configured model
2. **Open** (degraded) — routes all traffic to Gemini 2.0 Flash regardless of task complexity
3. **Half-open** (recovery) — allows a probe request; reopens on success

Tracked in `crm_performance_metrics.circuit_breaker_state`.

---

## Token Budget Enforcement

`ContextAssembler.optimize()` enforces a **1,000-token RAG context budget** via `TokenEstimator`. This prevents runaway prompt sizes from exponential context growth over long conversation histories.

---

## Request Limits

- **Max conversation size**: 50,000 characters (Zod validation)
- **Max additional instructions**: 5,000 characters (Zod validation)
- **Request timeout**: 30,000ms (Gemini calls)
- **Max retries**: 3 (on transient Gemini errors)
- **Rate limit**: Sliding window via `@upstash/ratelimit` per authenticated user

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
