# ViveKit — Human Approval & Operational Safety Workflows

> Last Updated: 2026-05-29

---

## Human-in-the-Loop Approval State Machine

AI replies are never sent to clients automatically. Every generated reply passes through the approval pipeline:

```
[AI Reply Generated]
        │
        ▼
   [draft]
        │
        ▼
[pending_review] ──────────────────────────────────┐
        │                                          │
        ├── Operator approves ─────────────────────┤
        ├── Operator edits ──► [edited] ───────────┤
        └── High risk flagged ──► [escalated] ─────┤
                                                   │
                                                   ▼
                                            [approved]
                                                   │
                                                   ▼
                                         Reply sent to client
                                                   │
                                                   ▼ (async)
                                    Memory stored to vector_memories
```

States: `draft | pending_review | edited | approved | rejected | archived | escalated`

---

## Approval Workflow Tables

### `crm_approval_workflows`

One record per conversation undergoing review:

| Column | Type | Description |
|:---|:---|:---|
| `active_state` | text | Current pipeline state |
| `original_draft` | text | Raw AI output — immutable reference |
| `current_text` | text | Editable version |
| `revisions_count` | integer | Edit counter |
| `risk_assessment` | jsonb | Risk scores, policy violations list |
| `business_priority` | text | `profitability / relationship / compliance` |

### `crm_approval_audits`

Immutable audit trail — one row per state transition:

| Column | Description |
|:---|:---|
| `action` | `create / edit / approve / reject / escalate / rollback` |
| `performed_by` | Operator identifier |
| `previous_state` | State before transition |
| `next_state` | State after transition |
| `text_delta` | Text change diff |

---

## Governance Risk Scanning

Before entering `pending_review`, `ApprovalEngine` performs keyword-based risk scoring:

**High-risk signals:**
- Absolute delivery promises under 5 days
- Unauthorized money-back guarantees
- Discount offers exceeding 15%
- Legal liability commitments
- Data privacy promises beyond platform capabilities

Each violation is logged in `risk_assessment.violations[]` and contributes to `risk_score`. High-risk replies auto-escalate to `escalated` state.

---

## Decision Logging (Reinforcement Foundation)

Every strategy selection is logged to `crm_decision_logs`:

- `selected_strategy` — which of 5 variants was chosen
- `user_overrode` — whether operator manually edited
- `override_text` — the edited version
- `outcome_satisfaction_rating` — post-send feedback (1–5)

This dataset supports future AI reply optimization via reinforcement learning.

---

## Post-Approval Memory Storage

On approval, conversation and reply are embedded and stored to `vector_memories`:
- Chunked by semantic boundary
- Tagged with `customer_id`, `category`, `importance_score`
- HNSW-indexed for future RAG retrieval on the same client

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
