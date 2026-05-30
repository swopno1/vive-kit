-- =========================================================================
-- Supabase DB Migration - Phase 10: Multi-Reply Strategy & Decision Intelligence
-- =========================================================================

-- 1. CRM Multi-Reply Strategies Table
CREATE TABLE IF NOT EXISTS public.crm_reply_strategies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  category text NOT NULL, -- relationship_focused, profit_protective, premium_positioning, concise_operational, strict_boundary
  draft_text text NOT NULL,
  prediction_payload jsonb DEFAULT '{}'::jsonb NOT NULL, -- conversion rates, confidence bounds, risks
  tradeoffs_payload jsonb DEFAULT '{}'::jsonb NOT NULL, -- objectives, risks, style description
  recommended boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_reply_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_reply_strategies" ON public.crm_reply_strategies
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_reply_strategies_conversation_id ON public.crm_reply_strategies(conversation_id);
CREATE INDEX IF NOT EXISTS idx_crm_reply_strategies_category ON public.crm_reply_strategies(category);


-- 2. CRM Decision & Human Override Logs Table (Reinforcement Learning Foundation)
CREATE TABLE IF NOT EXISTS public.crm_decision_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  selected_strategy text NOT NULL, -- category selected by user
  user_overrode boolean DEFAULT false NOT NULL, -- whether user manually edited the draft
  override_text text, -- exact text user modified it to
  outcome_satisfaction_rating float, -- future feedback rating (1-5 star or 0-100)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_decision_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_decision_logs" ON public.crm_decision_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_decision_logs_conversation_id ON public.crm_decision_logs(conversation_id);
