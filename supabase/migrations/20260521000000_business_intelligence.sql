-- =========================================================================
-- Supabase DB Migration - Phase 8: Business Context & Operational Intelligence Engine
-- =========================================================================

-- 1. Service Profiles Table
CREATE TABLE IF NOT EXISTS public.service_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_context_id uuid REFERENCES public.business_contexts(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  price_min float NOT NULL,
  price_max float,
  pricing_type text NOT NULL DEFAULT 'fixed', -- fixed, hourly, recurring, custom
  duration_days int,
  deliverables text[] DEFAULT '{}'::text[] NOT NULL,
  revision_policy text,
  scope_boundaries text,
  upsell_opportunities text,
  support_policy text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.service_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to service_profiles" ON public.service_profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_service_profiles_business_id ON public.service_profiles(business_context_id);


-- 2. Operational Rules Table
CREATE TABLE IF NOT EXISTS public.operational_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_context_id uuid REFERENCES public.business_contexts(id) ON DELETE CASCADE,
  category text NOT NULL, -- timeline, guarantees, pricing, refund, communication
  rule_trigger text NOT NULL, -- e.g. "deliver_under_5_days", "money_back_guarantee", "direct_call_promise"
  rule_action text NOT NULL, -- block, flag, warn
  forbidden_phrases text[] DEFAULT '{}'::text[] NOT NULL,
  description text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.operational_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to operational_rules" ON public.operational_rules
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_operational_rules_business_id ON public.operational_rules(business_context_id);


-- 3. Communication Brand Profiles Table
CREATE TABLE IF NOT EXISTS public.communication_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_context_id uuid REFERENCES public.business_contexts(id) ON DELETE CASCADE,
  tone_style text NOT NULL, -- professional, executive, consulting, friendly, specialist
  formality_level text NOT NULL DEFAULT 'high', -- high, medium, casual
  emotional_calibration text NOT NULL DEFAULT 'balanced', -- enthusiastic, empathetic, reserved, strict
  technical_depth text NOT NULL DEFAULT 'intermediate', -- conceptual, intermediate, deep_specialist
  persuasion_style text NOT NULL DEFAULT 'consultative', -- direct, soft_sell, educational, consultative
  vocabulary_rules jsonb DEFAULT '{"allow": [], "avoid": []}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.communication_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to communication_profiles" ON public.communication_profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_communication_profiles_business_id ON public.communication_profiles(business_context_id);


-- 4. Strategic Decision Playbooks Table
CREATE TABLE IF NOT EXISTS public.decision_playbooks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_context_id uuid REFERENCES public.business_contexts(id) ON DELETE CASCADE,
  scenario_type text NOT NULL, -- pricing_objection, scope_creep, refund_request, difficult_client, upsell
  objection_triggers text[] DEFAULT '{}'::text[] NOT NULL,
  action_framework text NOT NULL, -- The specific step-by-step strategy for the AI
  negotiation_boundary float, -- e.g., max discount percentage (0.15 for 15%)
  escalation_triggers text[] DEFAULT '{}'::text[] NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.decision_playbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to decision_playbooks" ON public.decision_playbooks
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_decision_playbooks_business_id ON public.decision_playbooks(business_context_id);


-- 5. Business Knowledge Base Table
CREATE TABLE IF NOT EXISTS public.business_knowledge_base (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_context_id uuid REFERENCES public.business_contexts(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL, -- onboarding, FAQs, policies, delivery_workflows, capabilities
  tags text[] DEFAULT '{}'::text[] NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.business_knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to business_knowledge_base" ON public.business_knowledge_base
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_business_id ON public.business_knowledge_base(business_context_id);


-- 6. Response Governance Logs Table
CREATE TABLE IF NOT EXISTS public.response_governance_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  suggested_reply_id uuid REFERENCES public.suggested_replies(id) ON DELETE SET NULL,
  risk_score float DEFAULT 0.0 NOT NULL,
  risk_category text NOT NULL DEFAULT 'low', -- low, medium, high, critical
  violation_details jsonb DEFAULT '[]'::jsonb NOT NULL, -- List of failed operational rules
  is_approved boolean DEFAULT false NOT NULL,
  escalated_to text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.response_governance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to response_governance_logs" ON public.response_governance_logs
  FOR ALL USING (true) WITH CHECK (true);


-- 7. Business Memory Layer Table (AI learnings)
CREATE TABLE IF NOT EXISTS public.business_memories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_context_id uuid REFERENCES public.business_contexts(id) ON DELETE CASCADE,
  key_learning text NOT NULL,
  category text NOT NULL, -- negotiation_patterns, common_objections, retention_insights, delivery_bottlenecks
  importance_score float DEFAULT 0.5 NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.business_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to business_memories" ON public.business_memories
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_business_memories_business_id ON public.business_memories(business_context_id);


-- 8. Business Analytics Events Table
CREATE TABLE IF NOT EXISTS public.business_analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_context_id uuid REFERENCES public.business_contexts(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- objection_logged, negotiation_success, conversion_pattern, support_escalation
  payload jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.business_analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to business_analytics_events" ON public.business_analytics_events
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_business_analytics_events_business_id ON public.business_analytics_events(business_context_id);
