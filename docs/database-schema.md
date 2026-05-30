# ViveKit — Database Schema Reference

> Supabase Project: **ViveFlow** (`utvaibekuiotpkerlgck`) · Region: ap-northeast-1 · Status: ACTIVE_HEALTHY
> Last Updated: 2026-05-29 | All 12 migrations applied | 35 tables live

---

## Migration History

| # | Migration File | Applied | Summary |
|:--|:---|:---:|:---|
| 1 | `20260518000000_init_schema.sql` | ✅ 2026-05-29 | Core tables + pgvector extension |
| 2 | `20260520000000_vector_memory_v2.sql` | ✅ 2026-05-29 | Enhanced vector memory + client intelligence |
| 3 | `20260521000000_business_intelligence.sql` | ✅ 2026-05-29 | Service profiles, rules, knowledge base |
| 4 | `20260522000000_crm_relationship_brain.sql` | ✅ 2026-05-29 | CRM profiles, behaviors, timelines |
| 5 | `20260523000000_strategy_decision_intelligence.sql` | ✅ 2026-05-29 | Reply strategies + decision logs |
| 6 | `20260524000000_approval_operational_safety.sql` | ✅ 2026-05-29 | Approval workflows + audit trail |
| 7 | `20260525000000_observability_performance.sql` | ✅ 2026-05-29 | Event logging + system metrics |
| 8 | `20260526000000_multi_workspace_collaboration.sql` | ✅ 2026-05-29 | Workspaces, members, invites, comments |
| 9 | `20260527000000_performance_cost_resilience.sql` | ✅ 2026-05-29 | Cost tracking + performance metrics |
| 10 | `20260528000000_production_security_compliance.sql` | ✅ 2026-05-29 | Security incidents, GDPR, backups |
| 11 | `20260529000000_secure_rls_policies.sql` | ✅ 2026-05-29 | Drop public RLS → authenticated-only |
| 12 | `20260530000000_vector_hnsw_index.sql` | ✅ 2026-05-29 | HNSW cosine index on embeddings |

---

## Table Reference (35 Tables)

### Core Communication Layer

#### `business_contexts`
Business profile settings — name, industry, tone, pricing instructions, general context.
- RLS: `authenticated` only
- Key columns: `business_name`, `industry`, `pricing_instructions`, `general_context`, `tone_preference`

#### `customer_profiles`
CRM-lite customer records — email, name, company, relationship notes.
- RLS: `authenticated` only
- Unique: `email`

#### `conversations`
Raw pasted conversation threads linked to customers.
- RLS: `authenticated` only
- FK: `customer_id → customer_profiles(id)` ON DELETE SET NULL
- Key columns: `channel` (email/chat/sms), `raw_history`, `external_conversation_id`

#### `suggested_replies`
AI-generated reply drafts with approval lifecycle.
- RLS: `authenticated` only
- FK: `conversation_id → conversations(id)` ON DELETE CASCADE
- States: `pending | approved | rejected | modified`

---

### Vector Memory Layer

#### `vector_memories`
Core RAG table — content chunks with 768-dim Gemini embeddings.
- RLS: `authenticated` only
- Embedding: `vector(768)` — Google `text-embedding-004`
- Indexes: `idx_vector_memories_customer_id`, `idx_vector_memories_category`, `idx_vector_memories_hnsw` (HNSW cosine, sub-15ms)
- Added columns (migration 2): `customer_id`, `importance_score`, `category`, `last_accessed_at`

#### `client_intelligence_profiles`
AI-synthesized client relationship intelligence scores.
- RLS: `authenticated` only
- FK: `customer_id → customer_profiles(id)` UNIQUE
- Key columns: `trust_score`, `relationship_strength`, `intelligence_data` (jsonb)

---

### Business Intelligence Layer

#### `service_profiles`
Service catalog with pricing ranges, deliverables, revision policies.
- FK: `business_context_id → business_contexts(id)` ON DELETE CASCADE
- Key columns: `price_min`, `price_max`, `pricing_type`, `deliverables[]`

#### `operational_rules`
Business policy rules that govern AI reply generation.
- Key columns: `category`, `rule_trigger`, `rule_action`, `forbidden_phrases[]`, `is_active`

#### `communication_profiles`
Brand voice configuration — formality, emotional calibration, persuasion style.
- Key columns: `tone_style`, `formality_level`, `emotional_calibration`, `technical_depth`, `vocabulary_rules` (jsonb)

#### `decision_playbooks`
Tactical playbooks for specific negotiation scenarios.
- Key columns: `scenario_type`, `objection_triggers[]`, `action_framework`, `negotiation_boundary`, `escalation_triggers[]`

#### `business_knowledge_base`
Structured FAQ, policy, and workflow documentation.
- Key columns: `title`, `content`, `category`, `tags[]`

#### `response_governance_logs`
Risk assessment records for generated replies.
- Key columns: `risk_score`, `risk_category` (low/medium/high/critical), `violation_details` (jsonb), `is_approved`

#### `business_memories`
AI-learned negotiation patterns and delivery insights.
- Key columns: `key_learning`, `category`, `importance_score`

#### `business_analytics_events`
Business outcome and pattern event ledger.
- Key columns: `event_type`, `payload` (jsonb)

---

### CRM Relationship Brain

#### `crm_client_profiles`
Extended CRM data — lifecycle stage, segmentation, revenue potential.
- FK: `customer_id → customer_profiles(id)` UNIQUE
- Key columns: `lifecycle_stage`, `client_segmentation`, `strategic_importance`, `payment_reliability`

#### `crm_client_behaviors`
Behavioral analytics — negotiation style, pricing sensitivity, decision patterns.
- FK: `customer_id → customer_profiles(id)` UNIQUE
- Key columns: `negotiation_style`, `pricing_sensitivity`, `emotional_volatility`, `commitment_consistency`

#### `crm_relationship_scores`
Dynamic relationship health metrics per client.
- FK: `customer_id → customer_profiles(id)` UNIQUE
- Key columns: `trust_score`, `relationship_strength`, `trajectory_trend`, `churn_risk_score`, `satisfaction_indicator`

#### `crm_client_timelines`
Chronological relationship event log.
- Index: `customer_id`, `event_type`
- Key columns: `event_type`, `title`, `description`, `event_date`, `semantic_tags[]`, `importance_weight`

#### `crm_lead_qualifications`
Lead scoring and qualification data.
- Key columns: `budget_qualified`, `intent_score`, `qualification_status`, `buying_signals[]`

#### `crm_client_memories`
Categorical memory records per client — preferences, frustrations, goals.
- Index: `customer_id`, `category`
- Key columns: `category`, `content`, `relevance_weight`, `last_triggered_at`

---

### Strategy & Decision Layer

#### `crm_reply_strategies`
Multi-strategy AI reply drafts with tradeoff analysis.
- Index: `conversation_id`, `category`
- Key columns: `category`, `draft_text`, `prediction_payload` (jsonb), `tradeoffs_payload` (jsonb), `recommended`

#### `crm_decision_logs`
Human override and strategy selection records (reinforcement learning foundation).
- Key columns: `selected_strategy`, `user_overrode`, `override_text`, `outcome_satisfaction_rating`

---

### Approval & Safety Layer

#### `crm_approval_workflows`
Human-in-the-loop approval state machine.
- States: `draft | pending_review | edited | approved | rejected | archived | escalated`
- Key columns: `client_name`, `active_state`, `risk_assessment` (jsonb), `original_draft`, `current_text`, `revisions_count`

#### `crm_approval_audits`
Immutable audit trail for all approval state transitions.
- FK: `workflow_id → crm_approval_workflows(id)` ON DELETE CASCADE
- Key columns: `action`, `performed_by`, `previous_state`, `next_state`, `text_delta`

---

### Observability Layer

#### `crm_observability_events`
Event ledger for AI operations — generation, retrieval, approval, system status.
- Index: `event_type`, `timestamp`
- Key columns: `event_type`, `duration_ms`, `success`, `message`, `payload` (jsonb)

#### `crm_system_metrics`
Time-series system performance metrics.
- Index: `metric_name`, `timestamp`
- Key columns: `metric_name`, `metric_value`

---

### Workspace & Collaboration Layer

#### `crm_workspaces`
SaaS multi-tenant workspace registry.
- Unique: `slug`, `tenant_id`
- Key columns: `name`, `plan` (free/growth/enterprise), `max_seats`

#### `crm_workspace_members`
User-to-workspace role mappings (RBAC).
- FK: `workspace_id → crm_workspaces(id)` ON DELETE CASCADE
- Roles: `owner | admin | manager | agent | viewer`

#### `crm_workspace_invitations`
Pending workspace onboarding invitations.
- Key columns: `email`, `role`, `invited_by`, `status` (pending/accepted/expired), `expires_at`

#### `crm_collaboration_comments`
Internal team annotations on conversations.
- Key columns: `author_name`, `author_role`, `text`

---

### Cost & Performance Layer

#### `crm_cost_observability`
AI token consumption and cost audit per workspace.
- Index: `workspace_id`, `timestamp`
- Key columns: `tokens_used`, `cost_usd`, `model_name`

#### `crm_performance_metrics`
Infrastructure latency and caching diagnostics.
- Key columns: `redis_hit_rate`, `vector_latency_ms`, `circuit_breaker_state`

---

### Security & Compliance Layer

#### `crm_security_incidents`
Security event registry — rate limit violations, injection attempts.
- Key columns: `event_type`, `severity` (low/medium/high/critical), `details`, `workspace_id`

#### `crm_gdpr_requests`
GDPR compliance request ledger — export and deletion workflows.
- Key columns: `request_type` (export/delete), `requester_email`, `status` (pending/completed)

#### `crm_disaster_backups`
Backup operation log for disaster recovery tracking.
- Key columns: `backup_type`, `size_bytes`, `backup_url`, `status`

---

## Database Functions

| Function | Parameters | Returns | Description |
|:---|:---|:---|:---|
| `match_memories` | `query_embedding vector(768), match_threshold float, match_count int` | Table | Basic cosine similarity search |
| `match_memories_v2` | `+ p_customer_id uuid, p_category text` | Table with `weighted_score` | Customer-filtered weighted retrieval |
| `mark_memory_accessed` | `memory_ids uuid[]` | void | Updates `last_accessed_at` timestamps |

---

## RLS Policy Summary

All 35 tables use `authenticated`-only RLS enforced in migration 11:

```sql
CREATE POLICY "Allow authenticated access to <table>" ON public.<table>
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

Anonymous/public access is **blocked** on all tables. Valid Supabase OAuth session required.

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
