-- Phase 6: Vector Memory & Retrieval Intelligence System

-- 1. Enhance vector_memories table
ALTER TABLE public.vector_memories
ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS importance_score float DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS last_accessed_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Create index for faster filtering by customer
CREATE INDEX IF NOT EXISTS idx_vector_memories_customer_id ON public.vector_memories(customer_id);
CREATE INDEX IF NOT EXISTS idx_vector_memories_category ON public.vector_memories(category);

-- 2. Create Client Intelligence Profiles
CREATE TABLE IF NOT EXISTS public.client_intelligence_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE CASCADE UNIQUE,
  trust_score float DEFAULT 50.0,
  communication_style text,
  pricing_sensitivity text,
  relationship_strength float DEFAULT 50.0,
  responsiveness_pattern text,
  negotiation_style text,
  payment_behavior text,
  project_history_summary text,
  intelligence_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  last_updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.client_intelligence_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to client_intelligence_profiles" ON public.client_intelligence_profiles
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Enhanced Similarity Search Function
-- This version supports customer filtering and weighted ranking
CREATE OR REPLACE FUNCTION match_memories_v2 (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_customer_id uuid DEFAULT NULL,
  p_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  category text,
  importance_score float,
  similarity float,
  weighted_score float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    metadata,
    category,
    importance_score,
    1 - (vector_memories.embedding <=> query_embedding) AS similarity,
    (1 - (vector_memories.embedding <=> query_embedding)) * (0.8 + (importance_score * 0.4)) AS weighted_score
  FROM vector_memories
  WHERE (1 - (vector_memories.embedding <=> query_embedding) > match_threshold)
    AND (p_customer_id IS NULL OR customer_id = p_customer_id)
    AND (p_category IS NULL OR category = p_category)
  ORDER BY weighted_score DESC
  LIMIT match_count;
$$;

-- 4. Function to update last_accessed_at
CREATE OR REPLACE FUNCTION mark_memory_accessed(memory_ids uuid[])
RETURNS void AS $$
BEGIN
  UPDATE public.vector_memories
  SET last_accessed_at = timezone('utc'::text, now())
  WHERE id = ANY(memory_ids);
END;
$$ LANGUAGE plpgsql;
