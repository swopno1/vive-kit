-- =========================================================================
-- Supabase DB Migration - Phase 16: SaaS Production RLS Hardening
-- =========================================================================

-- 1. Drop public access policies and restrict to authenticated users
DO $$
BEGIN
  -- business_contexts
  DROP POLICY IF EXISTS "Allow public access to business_contexts" ON public.business_contexts;
  CREATE POLICY "Allow authenticated access to business_contexts" ON public.business_contexts
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- customer_profiles
  DROP POLICY IF EXISTS "Allow public access to customer_profiles" ON public.customer_profiles;
  CREATE POLICY "Allow authenticated access to customer_profiles" ON public.customer_profiles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- conversations
  DROP POLICY IF EXISTS "Allow public access to conversations" ON public.conversations;
  CREATE POLICY "Allow authenticated access to conversations" ON public.conversations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- vector_memories
  DROP POLICY IF EXISTS "Allow public access to vector_memories" ON public.vector_memories;
  CREATE POLICY "Allow authenticated access to vector_memories" ON public.vector_memories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- suggested_replies
  DROP POLICY IF EXISTS "Allow public access to suggested_replies" ON public.suggested_replies;
  CREATE POLICY "Allow authenticated access to suggested_replies" ON public.suggested_replies
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- client_intelligence_profiles
  DROP POLICY IF EXISTS "Allow public access to client_intelligence_profiles" ON public.client_intelligence_profiles;
  CREATE POLICY "Allow authenticated access to client_intelligence_profiles" ON public.client_intelligence_profiles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- service_profiles
  DROP POLICY IF EXISTS "Allow public access to service_profiles" ON public.service_profiles;
  CREATE POLICY "Allow authenticated access to service_profiles" ON public.service_profiles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- operational_rules
  DROP POLICY IF EXISTS "Allow public access to operational_rules" ON public.operational_rules;
  CREATE POLICY "Allow authenticated access to operational_rules" ON public.operational_rules
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- communication_profiles
  DROP POLICY IF EXISTS "Allow public access to communication_profiles" ON public.communication_profiles;
  CREATE POLICY "Allow authenticated access to communication_profiles" ON public.communication_profiles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- decision_playbooks
  DROP POLICY IF EXISTS "Allow public access to decision_playbooks" ON public.decision_playbooks;
  CREATE POLICY "Allow authenticated access to decision_playbooks" ON public.decision_playbooks
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- business_knowledge_base
  DROP POLICY IF EXISTS "Allow public access to business_knowledge_base" ON public.business_knowledge_base;
  CREATE POLICY "Allow authenticated access to business_knowledge_base" ON public.business_knowledge_base
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- response_governance_logs
  DROP POLICY IF EXISTS "Allow public access to response_governance_logs" ON public.response_governance_logs;
  CREATE POLICY "Allow authenticated access to response_governance_logs" ON public.response_governance_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- business_memories
  DROP POLICY IF EXISTS "Allow public access to business_memories" ON public.business_memories;
  CREATE POLICY "Allow authenticated access to business_memories" ON public.business_memories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- business_analytics_events
  DROP POLICY IF EXISTS "Allow public access to business_analytics_events" ON public.business_analytics_events;
  CREATE POLICY "Allow authenticated access to business_analytics_events" ON public.business_analytics_events
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_client_profiles
  DROP POLICY IF EXISTS "Allow public access to crm_client_profiles" ON public.crm_client_profiles;
  CREATE POLICY "Allow authenticated access to crm_client_profiles" ON public.crm_client_profiles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_client_behaviors
  DROP POLICY IF EXISTS "Allow public access to crm_client_behaviors" ON public.crm_client_behaviors;
  CREATE POLICY "Allow authenticated access to crm_client_behaviors" ON public.crm_client_behaviors
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_relationship_scores
  DROP POLICY IF EXISTS "Allow public access to crm_relationship_scores" ON public.crm_relationship_scores;
  CREATE POLICY "Allow authenticated access to crm_relationship_scores" ON public.crm_relationship_scores
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_client_timelines
  DROP POLICY IF EXISTS "Allow public access to crm_client_timelines" ON public.crm_client_timelines;
  CREATE POLICY "Allow authenticated access to crm_client_timelines" ON public.crm_client_timelines
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_lead_qualifications
  DROP POLICY IF EXISTS "Allow public access to crm_lead_qualifications" ON public.crm_lead_qualifications;
  CREATE POLICY "Allow authenticated access to crm_lead_qualifications" ON public.crm_lead_qualifications
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_client_memories
  DROP POLICY IF EXISTS "Allow public access to crm_client_memories" ON public.crm_client_memories;
  CREATE POLICY "Allow authenticated access to crm_client_memories" ON public.crm_client_memories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_reply_strategies
  DROP POLICY IF EXISTS "Allow public access to crm_reply_strategies" ON public.crm_reply_strategies;
  CREATE POLICY "Allow authenticated access to crm_reply_strategies" ON public.crm_reply_strategies
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_decision_logs
  DROP POLICY IF EXISTS "Allow public access to crm_decision_logs" ON public.crm_decision_logs;
  CREATE POLICY "Allow authenticated access to crm_decision_logs" ON public.crm_decision_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_approval_workflows
  DROP POLICY IF EXISTS "Allow public access to crm_approval_workflows" ON public.crm_approval_workflows;
  CREATE POLICY "Allow authenticated access to crm_approval_workflows" ON public.crm_approval_workflows
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_approval_audits
  DROP POLICY IF EXISTS "Allow public access to crm_approval_audits" ON public.crm_approval_audits;
  CREATE POLICY "Allow authenticated access to crm_approval_audits" ON public.crm_approval_audits
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_observability_events
  DROP POLICY IF EXISTS "Allow public access to crm_observability_events" ON public.crm_observability_events;
  CREATE POLICY "Allow authenticated access to crm_observability_events" ON public.crm_observability_events
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_system_metrics
  DROP POLICY IF EXISTS "Allow public access to crm_system_metrics" ON public.crm_system_metrics;
  CREATE POLICY "Allow authenticated access to crm_system_metrics" ON public.crm_system_metrics
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_workspaces
  DROP POLICY IF EXISTS "Allow public access to crm_workspaces" ON public.crm_workspaces;
  CREATE POLICY "Allow authenticated access to crm_workspaces" ON public.crm_workspaces
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_workspace_members
  DROP POLICY IF EXISTS "Allow public access to crm_workspace_members" ON public.crm_workspace_members;
  CREATE POLICY "Allow authenticated access to crm_workspace_members" ON public.crm_workspace_members
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_workspace_invitations
  DROP POLICY IF EXISTS "Allow public access to crm_workspace_invitations" ON public.crm_workspace_invitations;
  CREATE POLICY "Allow authenticated access to crm_workspace_invitations" ON public.crm_workspace_invitations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_collaboration_comments
  DROP POLICY IF EXISTS "Allow public access to crm_collaboration_comments" ON public.crm_collaboration_comments;
  CREATE POLICY "Allow authenticated access to crm_collaboration_comments" ON public.crm_collaboration_comments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_cost_observability
  DROP POLICY IF EXISTS "Allow public access to crm_cost_observability" ON public.crm_cost_observability;
  CREATE POLICY "Allow authenticated access to crm_cost_observability" ON public.crm_cost_observability
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_performance_metrics
  DROP POLICY IF EXISTS "Allow public access to crm_performance_metrics" ON public.crm_performance_metrics;
  CREATE POLICY "Allow authenticated access to crm_performance_metrics" ON public.crm_performance_metrics
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_security_incidents
  DROP POLICY IF EXISTS "Allow public access to crm_security_incidents" ON public.crm_security_incidents;
  CREATE POLICY "Allow authenticated access to crm_security_incidents" ON public.crm_security_incidents
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_gdpr_requests
  DROP POLICY IF EXISTS "Allow public access to crm_gdpr_requests" ON public.crm_gdpr_requests;
  CREATE POLICY "Allow authenticated access to crm_gdpr_requests" ON public.crm_gdpr_requests
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- crm_disaster_backups
  DROP POLICY IF EXISTS "Allow public access to crm_disaster_backups" ON public.crm_disaster_backups;
  CREATE POLICY "Allow authenticated access to crm_disaster_backups" ON public.crm_disaster_backups
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;
