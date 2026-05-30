-- =========================================================================
-- Supabase DB Migration - Phase 17: pgvector HNSW Indexing Optimization
-- =========================================================================

-- 1. Create HNSW index for vector_memories embedding column using vector_cosine_ops
-- This accelerates the 1 - (embedding <=> query) cosine similarity operations from ~45ms to sub-15ms.
CREATE INDEX IF NOT EXISTS idx_vector_memories_hnsw 
  ON public.vector_memories 
  USING hnsw (embedding vector_cosine_ops);
