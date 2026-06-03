# ViveKit — MVP Readiness Checklist

**Last Updated:** 2026-06-03  
**Status:** In Progress — 7 of 12 items complete

---

## ✅ CORE FEATURES — Complete & Validated

### 1. Conversation History Reading
- **Status**: ✅ Complete
- Full multi-turn conversation support (email threads, Slack dumps, support tickets)
- Persistence via `POST /api/conversations` 
- Retrieval via `GET /api/conversations`
- **Action**: Validate with real user data before launch

### 2. Lead Data Extraction & CRM Population
- **Status**: 🟡 Partial — Core extraction exists, needs validation
- Intelligence engine extracts: sentiment, urgency, risk flags, relationship signals
- **Action**: 
  - [Task #4] Auto-map extracted data to CRM fields (name, email, company, phone, service interest)
  - Show extraction confidence scores
  - Add manual override UI
  - Test edge cases (incomplete data, malformed input)

### 3. Response Generation with Config
- **Status**: 🟡 Partial — Implementation exists, needs testing
- Uses tone preference, business profile, service boundaries
- **Action**:
  - [Task #5] Full end-to-end test with sample conversations
  - Validate pricing policy enforcement (no discount overcommit)
  - Validate timeline constraints (no "next week" for multi-month projects)
  - Test brand safety blocking

### 4. CRM Context in Responses
- **Status**: 🟡 Partial — Retrieval pipeline exists, needs field validation
- RAG memory retrieval for past interactions
- Relationship scoring implemented
- **Action**:
  - [Task #6] Verify context surfaces correctly when CRM data populated
  - Test multi-conversation client threads
  - Validate relationship score impacts response tone

### 5. Business Profile Enforcement
- **Status**: 🟡 Partial — Configuration UI exists, needs constraint testing
- Business context state in dashboard
- Admin business profile page exists
- **Action**:
  - [Task #8] Enforce service catalog: block responses for services not offered
  - Enforce pricing policy: no manual discounts
  - Enforce tone: verify brand voice consistency
  - Test conflict resolution (client asks for service outside catalog)

---

## 🔴 MVP GAPS — Must Complete Before Launch

### 6. Usage Log Simplification
- **Status**: 🔴 Open
- Current observability page shows verbose telemetry
- **Action**: [Task #1]
  - Simplify to: Total Prompts | Avg Latency | Acceptance Rate | Error Count
  - Remove circuit breaker UI, routing stats detail
  - Focus on user-actionable metrics only
  - Keep admin dashboard for detailed metrics

### 7. AI Costs Simplification  
- **Status**: 🔴 Open
- Current performance page shows complex cost breakdown
- **Action**: [Task #2]
  - Simplify to: Tokens/Day | Est. Cost/Month | Cost by Provider | Budget Alert
  - Show cost per provider (Gemini, OpenAI, Claude)
  - Alert if approaching rate limits
  - Remove manual circuit breaker, verbose routing

### 8. My Data Dashboard
- **Status**: 🔴 Open — Page does not exist
- **Action**: [Task #3]
  - New `/admin/data` page (user-facing, not admin)
  - Show: Conversations stored | Embeddings count | Client profiles | Storage usage
  - Add export data (JSON/CSV) button
  - Add GDPR request button
  - Not system stats — only user's own data

### 9. API Key Documentation
- **Status**: 🔴 Open — `docs/api-keys.md` missing
- **Action**: [Task #9]
  - Guide per provider: Google Gemini, OpenAI, Anthropic
  - Step-by-step instructions, free tier notes
  - Official docs links
  - Security disclaimer: "Never share your key"

### 10. Privacy Policy & Terms
- **Status**: 🔴 Open — Legal pages missing
- **Action**: [Task #10]
  - `/app/legal/privacy/page.tsx`
  - `/app/legal/terms/page.tsx`
  - Link from footer and auth page
  - **Privacy must include:**
    - OAuth data collection
    - Vector embedding storage & tenant isolation
    - GDPR erasure rights
    - AI generation disclaimer
    - Third-party provider disclaimer (user keys never stored server-side)
  - **Terms must include:**
    - Free tool, no warranties, no SLA
    - Acceptable use policy
    - ViveScript's right to suspend abuse
    - Governing law

### 11. GDPR Erasure Pipeline
- **Status**: 🔴 Open
- **Action**: [Task #11]
  - `DELETE /api/gdpr/erase` — delete user's vector_memories, CRM data, profiles
  - Add workspace settings UI: "Delete my account and all data"
  - Confirmation modal (type username to confirm)
  - Redirect to goodbye page on success
  - Log erasure to security audit trail

### 12. Contributing Guidelines
- **Status**: 🔴 Open — `docs/CONTRIBUTING.md` missing
- **Action**: [Task #12]
  - JSDoc requirements for all routes & service files
  - File naming conventions
  - Task registry format (status, priority, effort)
  - Changelog requirements
  - PR process: update tasks.md on completion

---

## 📋 VALIDATION CHECKLIST

Before marking **MVP-Ready**, validate the following:

### Functional Tests
- [ ] Read raw conversation (email, Slack, ticket) → no errors
- [ ] Extract client data → shows confidence & allows override
- [ ] Generate response → respects tone, pricing, brand boundaries
- [ ] Retrieve past interactions → context surfaces correctly in draft
- [ ] Save approved reply → persists to vector memory, appears in future retrieval
- [ ] Switch provider (Gemini → OpenAI) → generates response with correct model
- [ ] Invalid API key → clear error message, not raw provider error
- [ ] User deletes account → all vector_memories, CRM data deleted; can't log back in
- [ ] Cost tracking → shows tokens consumed, estimated monthly spend

### UX Tests
- [ ] Usage log shows only key metrics (4 cards max)
- [ ] Cost page shows cost breakdown by provider (not verbose routing)
- [ ] My Data page shows only user data (conversations, embeddings, profiles)
- [ ] Privacy policy is clear, covers all data practices
- [ ] API key setup has inline help links for each provider
- [ ] Error messages are user-friendly (not raw API errors)

### Security & Compliance
- [ ] No API keys logged to console or DB
- [ ] RLS policies enforce row-level isolation
- [ ] GDPR deletion actually removes all user data (test with SQL after deletion)
- [ ] OAuth metadata not exposed in API responses
- [ ] Prompt injection detection on all AI endpoints

### Performance
- [ ] Sub-15ms vector retrieval (HNSW index)
- [ ] <3s response generation time
- [ ] 92%+ cache hit rate on profile lookups

### Documentation
- [ ] API key guide covers all 3 providers
- [ ] Contributing guide is comprehensive
- [ ] All API routes have JSDoc blocks
- [ ] All service files document purpose, inputs, outputs

---

## 🎯 LAUNCH READINESS SUMMARY

### What's Working ✅
- Conversation parsing & analysis
- Multi-provider AI routing
- Vector memory & RAG retrieval
- Business profile configuration
- Admin dashboards (CRM, security, workspace)

### What Needs Work 🔴
1. **Lead extraction auto-mapping** (UI/mapping logic)
2. **Usage log simplification** (UI redesign)
3. **Cost dashboard simplification** (UI redesign)
4. **My Data dashboard** (new page)
5. **API key docs** (markdown file)
6. **Privacy & Terms** (legal pages)
7. **GDPR erasure** (backend endpoint + UI)
8. **Contributing guide** (markdown file)

### Effort Estimate
- **UI Simplification**: 1-2 days
- **New Pages** (My Data, Legal): 1 day
- **Backend** (GDPR, docs): 0.5 days
- **Testing & Validation**: 1 day
- **Total**: ~3-4 days

### Recommended Priority Order
1. [Task #1] Simplify Usage Log (high-impact, visible)
2. [Task #2] Simplify AI Costs (high-impact, visible)
3. [Task #3] Create My Data Dashboard (new feature, user-facing)
4. [Task #4] Lead Extraction Auto-Map (completes core feature)
5. [Task #5] Response Generation Testing (validation)
6. [Task #9] API Key Docs (quick win)
7. [Task #10] Privacy & Terms (legal requirement)
8. [Task #11] GDPR Erasure (compliance requirement)
9. [Task #6] CRM Context Testing (validation)
10. [Task #8] Business Profile Testing (validation)
11. [Task #12] Contributing Guide (meta, can be post-launch)
12. [Task #7] Conversation History Testing (validation)

---

## 🚀 POST-LAUNCH ROADMAP

Once MVP launches:

### F-1. Autonomous Reply Workflow (2-3 weeks)
- Auto-send replies for trusted clients (confidence > 90%)
- Background job to approve & send

### F-2. Additional AI Providers (1-2 weeks each)
- Mistral, Cohere, xAI Grok
- Each requires provider implementation + docs

### F-3. Advanced Analytics
- Client lifetime value tracking
- Service upsell opportunities
- Sentiment trends over time

### F-4. Multi-Region Vector Replication
- Replicate pgvector tables across regions
- Reduce latency for international users

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**
