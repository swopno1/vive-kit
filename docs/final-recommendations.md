# ViveKit — Final Architectural Recommendations

> Last Updated: 2026-05-29

---

## Immediate Next Steps (P1)

### 1. Wire Admin Dashboards to Live Database

**Action**: Replace hardcoded fallback data in all engine files with real Supabase queries.

Priority order:
1. `crm-engine.ts` → `crm_client_profiles`, `crm_relationship_scores`, `crm_client_timelines`
2. `observability-engine.ts` → `crm_observability_events`, `crm_system_metrics`
3. `security-engine.ts` → `crm_security_incidents`, `crm_gdpr_requests`
4. `performance-engine.ts` → `crm_cost_observability`, `crm_performance_metrics`
5. `workspace-engine.ts` → `crm_workspaces`, `crm_workspace_members`

Use `createClient()` from `src/lib/supabase/server.ts` in all engine files.

**Effort**: 3-5 days
**Impact**: Full operational visibility into AI costs, security events, and client relationships.

---

### 2. Legal Documentation

- **Privacy Policy**: Document vector embedding storage, data isolation by `customer_id`, retention/deletion rights
- **Terms of Service**: Disclaim AI generation accuracy; define operator responsibilities for AI-assisted replies
- **GDPR Runbook**: Define SLA for honoring deletion requests (recommended: 30 days)

Required before opening registration to external users.

---

## P2 Recommendations

### 3. CORS Headers

```ts
// src/app/api/[...route]/route.ts
headers: {
  'Access-Control-Allow-Origin': 'https://kit.vivereply.com',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
}
```

Add to Next.js middleware or per-route response.

---

### 4. GDPR Erasure Pipeline

Implement actual cascading deletion:

```ts
// On verified GDPR erasure request:
await supabase.from('customer_profiles').delete().eq('email', requesterEmail)
// (cascading FK deletes propagate to crm_client_*, vector_memories, conversations, etc.)
await supabase.from('crm_gdpr_requests').update({ status: 'completed' }).eq('id', requestId)
```

---

### 5. Stripe Billing Integration

- Create Stripe products for Free / Growth / Enterprise tiers
- Webhook: `customer.subscription.updated` → update `crm_workspaces.plan` and `max_seats`
- Embed Stripe billing portal link in `/admin/business`

---

## P3 Recommendations

### 6. Real User Identity in CRM Flow

Replace hardcoded `'00000000-...'` customer UUID with the authenticated user's actual Supabase `auth.uid()`. This unlocks real RAG lookups against stored customer memories.

### 7. Autonomous Reply Workflow

Allow AI drafts to bypass the approval queue for trusted clients when:
- `crm_relationship_scores.trust_score > 90`
- AI strategy confidence score > 90%
- Client is in `lifecycle_stage = 'active'` and `strategic_importance = 'vip'`

Include an emergency override kill switch in `/admin/workspace`.

### 8. Multi-Region Supabase Deployment

Replicate the `vector_memories` table across Supabase regions (US, EU) using logical replication to reduce latency for international operators.

### 9. Analytics Integration

Add Vercel Analytics or PostHog to track:
- Reply generation success rate
- Approval → send conversion rate
- Average time-to-approval
- Model routing distribution

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
