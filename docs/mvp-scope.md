# ViveKit — MVP Feature Scope

> Last Updated: 2026-05-29

---

## Core MVP Features (Live)

### A. Conversation Paste Console

Operator pastes raw client emails, Slack threads, or chat exports into the textarea on `https://kit.vivereply.com`. The input is validated (50K char limit), sanitized for injection patterns, and submitted to the AI pipeline.

### B. Business Instruction Injection

Optional instruction field: "Push delivery date by 3 days politely" or "Do not offer discounts under any circumstances." Injected directly into the prompt alongside operational rules from the database.

### C. AI Strategic Reply Generation

- **Streaming mode** (`/api/ai/stream`): SSE real-time token-by-token display via Vercel AI SDK
- **Strategy mode** (`/api/ai/strategy`): 5 reply variants (relationship-focused, profit-protective, premium-positioning, concise-operational, strict-boundary) with tradeoff analysis
- **Analysis mode** (`/api/ai/analyze`): Sentiment, risk score, entity extraction, intent classification

### D. Tone Selection

11 preset tones selectable via `ToneSelector.tsx`: Professional, Executive, Consulting, Friendly, Specialist, Strategic, Empathetic, Direct, Concise, Diplomatic, Technical.

### E. Human Approval & Review Desk

AI drafts enter the `crm_approval_workflows` state machine. Operators can approve, manually edit, or reject. Every state transition is immutably logged in `crm_approval_audits`.

### F. Authentication

Google OAuth via Supabase. Only emails in `SUPERADMIN_EMAILS` gain access. All others are redirected to `/auth/unauthorized`.

---

## Admin Modules (Demo Scaffolding — Live UI, Hardcoded Data)

These panels exist with full UI but return static data until wired to live DB:

| Module | Route | Tables Needed |
|:---|:---|:---|
| CRM Intelligence | `/admin/crm` | `crm_client_profiles`, relationship tables |
| Approval Queue | `/admin/approvals` | `crm_approval_workflows`, `crm_approval_audits` |
| Business Settings | `/admin/business` | `service_profiles`, `operational_rules`, `communication_profiles` |
| Observability | `/admin/observability` | `crm_observability_events`, `crm_system_metrics` |
| Performance | `/admin/performance` | `crm_cost_observability`, `crm_performance_metrics` |
| Security | `/admin/security` | `crm_security_incidents`, `crm_gdpr_requests` |
| Workspace | `/admin/workspace` | `crm_workspaces`, `crm_workspace_members` |

---

## Deliberately Out of MVP Scope

- Autonomous email sending (requires trust scoring + confidence gates)
- Real-time Slack / Gmail / Intercom integrations
- Multi-tenant self-serve registration (requires Stripe billing)
- Custom fine-tuned AI models
- White-label branding per workspace

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
