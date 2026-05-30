# ViveKit — RAG Architecture

> Last Updated: 2026-05-29

---

## RAG Pipeline Overview

```
Operator Input (raw conversation text)
        │
        ▼
EmbeddingService.embed(text)
  ─ Google text-embedding-004 (768 dimensions)
  ─ In-memory LRU cache (1,000 items) — skips API on duplicate queries
        │
        ▼
RetrievalEngine.searchMemories(embedding)
  ─ Supabase RPC: match_memories_v2()
  ─ Cosine similarity via pgvector HNSW index (< 15ms)
  ─ Filters: customer_id, category, match_threshold, match_count
  ─ Returns: id, content, metadata, category, importance_score, similarity, weighted_score
  ─ Bypass: skips DB if customer_id = '00000000-...' (placeholder UUID)
        │
        ▼
ContextAssembler.assemble(memories)
  ─ Groups retrieved memories by category
  ─ Formats with relevance percentages and importance scores
  ─ optimize(): enforces 1,000-token budget via TokenEstimator
        │
        ▼
PromptBuilder.build(context, input, business, tone)
  ─ Stacks 11 modular prompt sections
  ─ Injects assembled RAG context into prompt
        │
        ▼
Gemini 2.0 Flash / Pro
        │
        ▼
Generated Reply (streamed or blocking)
        │
        ▼ (post-approval, async)
MemoryManager.storeMemory()
  ─ Embeds approved reply chunks
  ─ Inserts into vector_memories with metadata
  ─ mark_memory_accessed() — wrapped in try/catch (non-blocking)
```

---

## Vector Memory Table

**Table**: `public.vector_memories`
**Embedding model**: Google `text-embedding-004` — 768 dimensions
**Column type**: `vector(768)`

Key columns:
- `content` — text chunk being stored
- `embedding` — 768-dim float vector
- `metadata` — jsonb (source, category tags, timestamp)
- `customer_id` — FK for customer isolation
- `category` — memory type (preferences, objections, goals, etc.)
- `importance_score` — float 0.0–1.0, affects `weighted_score` in retrieval
- `last_accessed_at` — updated on each retrieval hit

---

## HNSW Index

Applied in migration 12:

```sql
CREATE INDEX IF NOT EXISTS idx_vector_memories_hnsw
  ON public.vector_memories
  USING hnsw (embedding vector_cosine_ops);
```

Reduces cosine similarity search from ~45ms to **sub-15ms** at scale.

---

## match_memories_v2 Function

```sql
CREATE OR REPLACE FUNCTION match_memories_v2 (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_customer_id uuid DEFAULT NULL,
  p_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid, content text, metadata jsonb, category text,
  importance_score float, similarity float, weighted_score float
)
```

`weighted_score = similarity × (0.8 + importance_score × 0.4)` — boosts high-importance memories in ranking.

---

## Workspace Isolation

Every vector record is scoped to a customer via `customer_id`. RLS policies enforce `authenticated`-only access, preventing cross-tenant memory leakage.

---

## Embedding Cache

`EmbeddingService` maintains an in-memory Map of `text → embedding vector`:
- Capacity: 1,000 entries (evicts oldest on overflow)
- Purpose: avoid redundant Gemini API calls for repeated conversation inputs
- Scope: per-serverless-instance (not shared across Vercel functions)

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
