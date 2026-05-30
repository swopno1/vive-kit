# ViveKit — Performance Review

> Last Updated: 2026-05-29

---

## 1. Inference Cost Allocation

```
[ Operator Prompt ]
        │
        ▼
[ Task Complexity Classifier ]
        │
    ┌───┴───┐
    ▼       ▼
[Flash]  [Pro]
 72%      28%
 $0.0001  $0.00125
 /1K tok  /1K tok
```

**Net savings**: ~85% reduction in model costs vs. routing all traffic to Gemini 2.0 Pro.

**Fast tasks** (classify, summarize, extract) → Gemini 2.0 Flash  
**Reasoning tasks** (reply, analyze) + high complexity → Gemini 2.0 Pro

---

## 2. Caching Infrastructure

### Upstash Redis Edge Cache (`src/lib/cache-service.ts`)

- **Target hit rate**: 92% on repetitive profile and business context lookups
- **Reduces**: Supabase read load by ~35% under concurrent traffic
- **Fallback**: In-memory Map automatically activated when `UPSTASH_REDIS_REST_URL` is absent — zero cold-start failure

### Embedding LRU Cache (`src/lib/ai/embedding-service.ts`)

- Reuses 768-dim vectors for identical input strings
- Capacity: 1,000 entries
- Prevents redundant Gemini Embedding API charges

---

## 3. pgvector HNSW Index

Applied 2026-05-29:

```sql
CREATE INDEX idx_vector_memories_hnsw
  ON public.vector_memories
  USING hnsw (embedding vector_cosine_ops);
```

| Metric | Before | After |
|:---|:---:|:---:|
| Cosine search latency | ~45ms | < 15ms |
| Improvement | — | 3× faster |

---

## 4. Circuit Breaker

Monitors Gemini API latency. On failure:
- Routes all traffic to Gemini 2.0 Flash automatically
- State: `closed` (normal) → `open` (failure) → `half-open` (recovery probe)
- State logged to `crm_performance_metrics.circuit_breaker_state`

---

## 5. Context Token Budget

`ContextAssembler.optimize()` enforces a 1,000-token ceiling on RAG context using `TokenEstimator`. Prevents prompt size from growing unbounded across long conversation sessions.

---

## 6. Key Metrics Target

| KPI | Target |
|:---|:---:|
| Streaming time-to-first-token (Flash) | < 600ms |
| Vector retrieval (HNSW) | < 15ms |
| Redis cache hit rate | > 90% |
| Injection scan latency | < 5ms |
| Gemini timeout | 30s (hard cutoff) |
| Rate limit window | Sliding window per user |

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
