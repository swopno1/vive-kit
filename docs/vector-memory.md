# ViveKit — Vector Memory & Client Profiling

> Last Updated: 2026-05-29

---

## Embedding Model

- **Model**: Google `text-embedding-004`
- **Dimensions**: 768
- **Column type**: `vector(768)` in Postgres (pgvector extension)
- **Index**: HNSW with `vector_cosine_ops` — sub-15ms retrieval

---

## Memory Schema

`public.vector_memories` stores text chunks with semantic embeddings:

| Column | Type | Description |
|:---|:---|:---|
| `id` | uuid | Primary key |
| `content` | text | The text snippet being stored |
| `embedding` | vector(768) | 768-dim float embedding |
| `metadata` | jsonb | Source, category tags, timestamp |
| `customer_id` | uuid (FK) | Customer isolation key |
| `category` | text | Memory type (preferences, frustrations, goals, objections) |
| `importance_score` | float | 0.0–1.0 — affects retrieval ranking |
| `last_accessed_at` | timestamptz | Updated on each retrieval hit |
| `created_at` | timestamptz | Creation timestamp |

---

## Client Intelligence Profiles

`public.client_intelligence_profiles` — AI-synthesized relationship scores per customer:

- `trust_score` — 0–100 composite trust metric
- `relationship_strength` — 0–100 strength indicator
- `communication_style` — detected communication preference
- `pricing_sensitivity` — low / medium / high / extreme
- `negotiation_style` — aggressive / protective / flexible / standard
- `payment_behavior` — historical payment pattern assessment
- `project_history_summary` — AI-summarized past engagement history
- `intelligence_data` — jsonb blob for additional structured insights

---

## Memory Lifecycle

1. **Ingestion**: Operator pastes raw conversation → `EmbeddingService` generates 768-dim vector
2. **Storage**: Approved replies and key conversation segments inserted into `vector_memories` with category and importance tags
3. **Retrieval**: `match_memories_v2()` RPC performs HNSW cosine search against incoming query embedding
4. **Access tracking**: `mark_memory_accessed(memory_ids[])` updates `last_accessed_at` (non-blocking — wrapped in try/catch)
5. **Pruning**: Planned — conversation partitions older than 7 days are summarized into `client_intelligence_profiles` to preserve token budgets

---

## Tenant Isolation

All vector records carry `customer_id`. Combined with `authenticated`-only RLS, cross-tenant retrieval is impossible at the database level.

---

## Retrieval Weighted Scoring

```
weighted_score = similarity × (0.8 + importance_score × 0.4)
```

High-importance memories (e.g., `importance_score = 1.0`) receive a `1.2×` boost over baseline similarity. This surfaces critical relationship facts even when semantic similarity is moderate.

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
