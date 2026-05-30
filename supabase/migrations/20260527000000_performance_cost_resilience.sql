-- =========================================================================
-- Supabase DB Migration - Phase 14: AI Cost Control & Performance Caching
-- =========================================================================

-- 1. AI Infrastructure Cost Auditing Ledger
CREATE TABLE IF NOT EXISTS public.crm_cost_observability (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id text NOT NULL,
  tokens_used integer DEFAULT 0 NOT NULL,
  cost_usd float DEFAULT 0.0 NOT NULL,
  model_name text NOT NULL, -- gemini-flash, gemini-pro
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_cost_observability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_cost_observability" ON public.crm_cost_observability
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_cost_observability_workspace ON public.crm_cost_observability(workspace_id);
CREATE INDEX IF NOT EXISTS idx_crm_cost_observability_time ON public.crm_cost_observability(timestamp);


-- 2. Infrastructure Latency & Caching Diagnostics Table
CREATE TABLE IF NOT EXISTS public.crm_performance_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  redis_hit_rate float DEFAULT 0.0 NOT NULL,
  vector_latency_ms integer DEFAULT 0 NOT NULL,
  circuit_breaker_state text DEFAULT 'closed' NOT NULL, -- closed, open, half-open
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_performance_metrics" ON public.crm_performance_metrics
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_performance_metrics_time ON public.crm_performance_metrics(timestamp);
