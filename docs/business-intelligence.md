# ViveKit — Business Operational Intelligence Engine

> Last Updated: 2026-05-29

---

## Overview

The Business Intelligence layer enforces standard operating rules, brand voice settings, service catalog boundaries, and strategic playbooks — injected into every AI prompt.

---

## Database Tables

All business intelligence is persisted in Supabase (live as of 2026-05-29):

| Table | Purpose |
|:---|:---|
| `business_contexts` | Master business profile — name, industry, tone, pricing instructions |
| `service_profiles` | Service catalog with price ranges, deliverables, revision policies |
| `operational_rules` | Policy rules — forbidden phrases, discount caps, delivery limits |
| `communication_profiles` | Brand voice config — formality, emotional calibration, vocabulary rules |
| `decision_playbooks` | Tactical playbooks for pricing objections, scope creep, refund requests |
| `business_knowledge_base` | FAQs, delivery workflows, capability docs |
| `business_memories` | AI-learned negotiation patterns and delivery insights |
| `business_analytics_events` | Business outcome event ledger |
| `response_governance_logs` | Risk assessment records for generated replies |

---

## Brand Voice Calibration

Operators configure communication style in `/admin/business`:

- **Formality Level**: `high | medium | casual`
- **Emotional Calibration**: `enthusiastic | empathetic | reserved | strict`
- **Technical Depth**: `conceptual | intermediate | deep_specialist`
- **Persuasion Style**: `direct | soft_sell | educational | consultative`
- **Vocabulary Rules**: jsonb — `{ "allow": [], "avoid": [] }` word lists

These settings map to the `communication_profiles` table and are injected into prompt construction by `prompt-builder.ts`.

---

## Operational Rules Engine

Rules in `operational_rules` are evaluated by `SecurityEngine` before reply approval:

| Rule Category | Examples |
|:---|:---|
| `timeline` | Block promises under 5-day delivery |
| `guarantees` | Block money-back guarantee language |
| `pricing` | Warn if discount > 15% |
| `refund` | Block unconditional refund language |
| `communication` | Prevent direct call/phone promises |

Rule actions: `block` (hard stop) | `flag` (warning) | `warn` (soft alert)

---

## Response Governance Playground

The `/admin/business` governance validator allows operators to test draft replies against active rules before sending:

```
POST /api/business/governance/validate
  body: { draft: string }
  response: { violations: [], riskScore: float, riskCategory: "low|medium|high|critical" }
```

Results are stored in `response_governance_logs`.

---

## Business Context in Prompts

`BusinessIntelligenceEngine.getContext()` (or `getFallbackContext()` for sandbox) returns a structured object injected into every prompt:

```ts
{
  businessName, industry, websiteUrl,
  pricingInstructions,   // discount caps, payment terms
  generalContext,         // services, FAQs, capabilities
  tonePreference,         // professional / casual / executive
  serviceProfiles[],      // price ranges, deliverables
  operationalRules[],     // active forbidden patterns
  communicationProfile,   // formality, vocabulary rules
}
```

This context is the primary mechanism preventing hallucinated prices, impossible delivery timelines, and off-brand communication.

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
