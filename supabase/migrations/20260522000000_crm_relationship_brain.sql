-- =========================================================================
-- Supabase DB Migration - Phase 9: Client Relationship Intelligence & CRM Brain
-- =========================================================================

-- 1. Extended CRM Client Profiles Table
CREATE TABLE IF NOT EXISTS public.crm_client_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE CASCADE UNIQUE,
  lifecycle_stage text NOT NULL DEFAULT 'lead', -- lead, prospect, active, inactive, churned
  client_segmentation text NOT NULL DEFAULT 'growth_opportunity', -- premium, high_maintenance, growth_opportunity, budget_sensitive, enterprise_prospect
  strategic_importance text NOT NULL DEFAULT 'medium', -- low, medium, high, vip
  account_status text NOT NULL DEFAULT 'active', -- active, paused, suspended
  channel_preferences text[] DEFAULT '{"email"}'::text[] NOT NULL,
  revenue_potential float DEFAULT 0.0 NOT NULL,
  lifetime_value_est float DEFAULT 0.0 NOT NULL,
  payment_reliability float DEFAULT 100.0 NOT NULL, -- 0-100 rating
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_client_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_client_profiles" ON public.crm_client_profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_client_profiles_customer_id ON public.crm_client_profiles(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_client_profiles_segment ON public.crm_client_profiles(client_segmentation);


-- 2. CRM Client Behavioral Analytics Table
CREATE TABLE IF NOT EXISTS public.crm_client_behaviors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE CASCADE UNIQUE,
  negotiation_style text NOT NULL DEFAULT 'standard', -- aggressive, protective, flexible, standard
  pricing_sensitivity text NOT NULL DEFAULT 'medium', -- low, medium, high, extreme
  urgency_behavior text NOT NULL DEFAULT 'medium', -- low, medium, high
  emotional_volatility text NOT NULL DEFAULT 'stable', -- stable, moderate, volatile
  technical_depth_understanding text NOT NULL DEFAULT 'intermediate', -- non_technical, intermediate, technical
  decision_making_pattern text NOT NULL DEFAULT 'deliberate', -- fast, deliberate, bureaucratic
  commitment_consistency float DEFAULT 100.0 NOT NULL, -- 0-100 score tracking follow-through
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_client_behaviors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_client_behaviors" ON public.crm_client_behaviors
  FOR ALL USING (true) WITH CHECK (true);


-- 3. CRM Dynamic Relationship Scores Table
CREATE TABLE IF NOT EXISTS public.crm_relationship_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE CASCADE UNIQUE,
  trust_score float DEFAULT 50.0 NOT NULL, -- 0-100 scale
  relationship_strength float DEFAULT 50.0 NOT NULL, -- 0-100 scale
  trajectory_trend text NOT NULL DEFAULT 'stable', -- improving, stable, declining
  churn_risk_score float DEFAULT 0.0 NOT NULL, -- 0-100 scale
  responsiveness_ratio float DEFAULT 100.0 NOT NULL, -- 0-100 ratio
  satisfaction_indicator float DEFAULT 75.0 NOT NULL, -- 0-100 scale
  last_evaluated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_relationship_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_relationship_scores" ON public.crm_relationship_scores
  FOR ALL USING (true) WITH CHECK (true);


-- 4. CRM Chronological Relationship Timelines Table
CREATE TABLE IF NOT EXISTS public.crm_client_timelines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- conversation, project, negotiation, support, payment, milestone, state_change
  title text NOT NULL,
  description text NOT NULL,
  event_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  semantic_tags text[] DEFAULT '{}'::text[] NOT NULL,
  importance_weight float DEFAULT 0.5 NOT NULL, -- 0.0 to 1.0
  payload jsonb DEFAULT '{}'::jsonb NOT NULL, -- Flexible event data
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_client_timelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_client_timelines" ON public.crm_client_timelines
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_client_timelines_customer_id ON public.crm_client_timelines(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_client_timelines_event_type ON public.crm_client_timelines(event_type);


-- 5. CRM Lead Qualification Engine Table
CREATE TABLE IF NOT EXISTS public.crm_lead_qualifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE CASCADE UNIQUE,
  budget_qualified boolean DEFAULT false NOT NULL,
  intent_score float DEFAULT 0.0 NOT NULL, -- 0-100 scale
  qualification_status text NOT NULL DEFAULT 'unqualified', -- unqualified, working, qualified, dead
  buying_signals text[] DEFAULT '{}'::text[] NOT NULL,
  project_clarity_notes text,
  qualification_notes text,
  ai_scoring_details jsonb DEFAULT '{}'::jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_lead_qualifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_lead_qualifications" ON public.crm_lead_qualifications
  FOR ALL USING (true) WITH CHECK (true);


-- 6. CRM Client Memory Intelligence Table
CREATE TABLE IF NOT EXISTS public.crm_client_memories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  category text NOT NULL, -- preferences, frustrations, goals, objection_history, trust_moments
  content text NOT NULL,
  relevance_weight float DEFAULT 0.5 NOT NULL, -- 0.0 to 1.0 weight
  last_triggered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_client_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_client_memories" ON public.crm_client_memories
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_client_memories_customer_id ON public.crm_client_memories(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_client_memories_category ON public.crm_client_memories(category);
