-- =========================================================================
-- Supabase DB Migration - Phase 12: Analytics, Observability & Health
-- =========================================================================

-- 1. CRM Observability Event Logging Ledger
CREATE TABLE IF NOT EXISTS public.crm_observability_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL, -- generation, retrieval, prompt_exec, approval, system_status, business_outcome
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  duration_ms integer DEFAULT 0 NOT NULL,
  success boolean DEFAULT true NOT NULL,
  message text,
  payload jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_observability_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_observability_events" ON public.crm_observability_events
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_observability_events_type ON public.crm_observability_events(event_type);
CREATE INDEX IF NOT EXISTS idx_crm_observability_events_time ON public.crm_observability_events(timestamp);


-- 2. CRM System Time-series Metrics Logger
CREATE TABLE IF NOT EXISTS public.crm_system_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name text NOT NULL, -- api_uptime, queue_backlog, embedding_speed, vector_latency
  metric_value float DEFAULT 0.0 NOT NULL,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_system_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_system_metrics" ON public.crm_system_metrics
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_system_metrics_name ON public.crm_system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_crm_system_metrics_time ON public.crm_system_metrics(timestamp);
