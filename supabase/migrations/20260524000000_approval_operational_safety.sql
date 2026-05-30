-- =========================================================================
-- Supabase DB Migration - Phase 11: Human Approval & Safety Governance
-- =========================================================================

-- 1. CRM Approval Workflows Table
CREATE TABLE IF NOT EXISTS public.crm_approval_workflows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  active_state text NOT NULL DEFAULT 'draft', -- draft, pending_review, edited, approved, rejected, archived, escalated
  risk_assessment jsonb DEFAULT '{}'::jsonb NOT NULL, -- scores, legal/pricing warnings, revisions
  original_draft text NOT NULL,
  current_text text NOT NULL,
  revisions_count integer DEFAULT 0 NOT NULL,
  assigned_reviewer text,
  business_priority text DEFAULT 'profitability' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_approval_workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_approval_workflows" ON public.crm_approval_workflows
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_approval_workflows_conversation_id ON public.crm_approval_workflows(conversation_id);
CREATE INDEX IF NOT EXISTS idx_crm_approval_workflows_state ON public.crm_approval_workflows(active_state);


-- 2. CRM Approval Audit Logs & Delta Revisions Table
CREATE TABLE IF NOT EXISTS public.crm_approval_audits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id uuid REFERENCES public.crm_approval_workflows(id) ON DELETE CASCADE,
  action text NOT NULL, -- create, edit, approve, reject, escalate, rollback
  performed_by text NOT NULL DEFAULT 'operator',
  previous_state text NOT NULL,
  next_state text NOT NULL,
  text_delta text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_approval_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to crm_approval_audits" ON public.crm_approval_audits
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_approval_audits_workflow_id ON public.crm_approval_audits(workflow_id);
