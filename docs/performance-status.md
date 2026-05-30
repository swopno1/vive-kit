# ViveKit — Performance Status Report

> Audited: 2026-05-29 | Last Updated: 2026-05-29

---

## AI System Performance

### Hallucination Risk: Low

- 11 modular prompt modules with explicit role definitions and output format constraints
- `risk-control.ts` and `tone-control.ts` provide boundary guardrails
- `StrategyEngine.generateMultiReplies()` constructs alternative strategy drafts from actual Gemini responses (not static templates)
- Temperature: 0.2 (conservative)

### Retrieval Quality: Optimized

- `retrieval-engine.ts` correctly calls `supabase.rpc('match_memories_v2')` with 768-dim embeddings
- `context-assembler.ts` groups memories by category with relevance percentages
- `assemble()` invokes `optimize()` enforcing a strict 1,000-token context budget via `TokenEstimator`
- `mark_memory_accessed()` wrapped in try/catch — tracking failures never block RAG retrieval

### Token Efficiency

- Embedding cache (in-memory LRU, 1,000 items) eliminates redundant Gemini API calls for duplicate inputs
- RAG DB queries completely bypassed when `customerContext.id` is the placeholder UUID `00000000-...`
- Token budget enforcement prevents runaway context costs on long sessions

---

## Infrastructure Performance

### Caching

| Layer | Status | Target Hit Rate |
|:---|:---:|:---:|
| Upstash Redis (edge) | ✅ Active | 92% |
| In-memory fallback | ✅ Active | 100% (when Redis offline) |
| Embedding LRU | ✅ Active | Per-instance |

### Vector Search

| Metric | Value |
|:---|:---:|
| Index type | HNSW (cosine) |
| Applied | 2026-05-29 (`20260530000000_vector_hnsw_index.sql`) |
| Target latency | < 15ms |
| Pre-HNSW baseline | ~45ms |

### Streaming

- Non-null assertion on Gemini stream `body!` replaced with runtime type check
- Stream failures captured by `error.tsx` error boundary
- SSE implementation via Vercel AI SDK `streamText()`

---

## Bottleneck Summary

| Bottleneck | Location | Status |
|:---|:---|:---:|
| Sequential RAG queries | `ai.service.ts` | ⚠️ Mitigated (UUID bypass + cache) |
| No input truncation | `validation.ts` | ✅ Fixed (50K limit) |
| 404 API call on page load | `page.tsx` | ✅ Fixed |
| `body!` non-null assertion | `gemini.provider.ts` | ✅ Fixed |
| Token estimator unused | `token-estimator.ts` | ✅ Integrated |
| No embedding cache | `embedding-service.ts` | ✅ Added |
| No HNSW index | `vector_memories` | ✅ Applied 2026-05-29 |
| No edge caching | `cache-service.ts` | ✅ Upstash + memory fallback |
| No rate limiting | API routes | ✅ Upstash ratelimit added |

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
