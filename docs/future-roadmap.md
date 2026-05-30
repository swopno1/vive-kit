# ViveKit — Future Product Roadmap

> Last Updated: 2026-05-29

---

## Near-Term (0–3 months)

### 1. Admin Dashboards → Live Data

Wire all 6 admin dashboards to their corresponding Supabase tables. This is the single highest-impact near-term item for operational legitimacy.

- CRM dashboard → `crm_client_profiles`, relationship scores, timelines
- Performance dashboard → `crm_cost_observability`, `crm_performance_metrics`
- Security dashboard → `crm_security_incidents`, `crm_gdpr_requests`
- Observability dashboard → `crm_observability_events`, `crm_system_metrics`

### 2. Multi-User Registration & Billing

- Stripe integration for Free / Growth / Enterprise tiers
- Workspace seat limits enforced via webhook → `crm_workspaces.max_seats`
- Registration flow that creates a `crm_workspaces` record and links the user as `owner`

### 3. GDPR Compliance Pipeline

- Real cascading data deletion across all customer-linked tables
- Automated export to downloadable JSON
- 30-day SLA tracking in `crm_gdpr_requests`

### 4. Legal Documentation

- Privacy Policy (vector embedding storage disclosure)
- Terms of Service (AI generation disclaimer)
- Cookie Policy (Supabase auth cookies)

---

## Mid-Term (3–9 months)

### 5. Autonomous Reply for Trusted Clients

Allow AI drafts to skip manual approval for low-risk, high-trust clients:
- Trigger condition: `trust_score > 90` AND AI confidence > 90%
- Kill switch: operator toggle per client in `/admin/crm`
- Safety: blocked automatically if `risk_score > 0.3` or operational rule violation detected

### 6. Conversation History Persistence

Persist conversation sessions to the `conversations` table. Enable operators to browse historical threads and surface them as RAG context in future sessions.

### 7. Real CRM Onboarding Flow

Replace the placeholder customer UUID with authenticated user identity. Auto-create `customer_profiles`, `crm_client_profiles`, and `crm_relationship_scores` records on first login.

### 8. Decision Reinforcement Learning Loop

Use `crm_decision_logs` (strategy selections, human overrides, satisfaction ratings) to:
- Surface the statistically preferred strategy category per client segment
- Boost recommended strategies based on historical acceptance rates

---

## Long-Term (9+ months)

### 9. Multi-Region Vector Replication

Replicate `vector_memories` across Supabase regions (EU, US, AP) via logical replication. Target: < 10ms round-trip for all global operators.

### 10. Multi-Provider AI Routing

Route prompts to alternative providers based on reasoning requirements or availability:
- Anthropic Claude 4.x for nuanced negotiation reasoning
- Fine-tuned Gemini models for industry-specific vocabulary
- Automatic failover on provider outage

### 11. Integrations Layer

- Zapier / n8n connectors for importing conversations from Gmail, Slack, Intercom, Zendesk
- Webhook-based export of approved replies back to external systems
- Google Workspace integration for direct Gmail compose injection

### 12. White-Label & Agency Mode

- Custom domain per workspace
- White-label branding panel in `/admin/workspace`
- Sub-account management for agencies managing multiple client businesses

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
