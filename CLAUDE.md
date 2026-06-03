# ViveKit — MVP Readiness Context

**User**: Md Amirhossain Limon (amirhossain.limon@gmail.com)  
**Project**: ViveKit — Free AI Client Communication Toolkit  
**Status**: MVP In Progress (7/12 items complete, 3-4 days to launch)  
**Last Updated**: 2026-06-03

---

## 📋 What is ViveKit?

A free, production-ready AI workspace for freelancers, agencies, consultants. Paste raw conversations (email, Slack, tickets) → AI drafts context-aware replies that respect your business profile, pricing policy, and client relationship history.

**Live at**: [kit.vivereply.com](https://kit.vivereply.com)  
**Tech Stack**: Next.js 16 · React 19 · Tailwind v4 · Supabase PostgreSQL · pgvector RAG · Vercel AI SDK

---

## ✅ MVP CHECKLIST — 7/12 Complete

### Core Features (Ready) ✅
- ✅ Conversation history reading (email threads, Slack dumps, tickets)
- ✅ Lead data extraction (sentiment, urgency, relationship signals)
- ✅ Response generation with business config (tone, pricing, boundaries)
- ✅ CRM context integration (past interactions, relationship scoring)
- ✅ Multi-provider AI routing (Gemini, OpenAI, Claude via BYOK)
- ✅ Admin dashboards (CRM, security, workspace, observability, performance)

### MVP Gaps (Must Complete) 🔴 — 5 Open
1. **Usage Log Simplification** [Task #1] — Reduce observability page clutter
2. **AI Costs Simplification** [Task #2] — Show only tokens/day, cost/month, by provider
3. **My Data Dashboard** [Task #3] — New `/admin/data` page for user data visibility
4. **Lead Auto-Mapping** [Task #4] — Auto-populate CRM fields from extracted data
5. **Response Validation** [Task #5] — Test business rule enforcement

### Legal/Compliance (Blockers) 🔴 — 3 Open
6. **Privacy & Terms Pages** [Task #10] — `/legal/privacy` and `/legal/terms`
7. **GDPR Erasure Pipeline** [Task #11] — `DELETE /api/gdpr/erase` + UI
8. **API Key Documentation** [Task #9] — `docs/api-keys.md` for all 3 providers

### Testing/Docs — 4 Open
9. **CRM Context Testing** [Task #6] — Validate retrieval with real client data
10. **Business Profile Testing** [Task #8] — Enforce constraints end-to-end
11. **Conversation History Testing** [Task #7] — Multi-turn thread validation
12. **Contributing Guide** [Task #12] — `docs/CONTRIBUTING.md` standards

---

## 🚀 Priority Queue (Recommended Order)

1. **Simplify Usage Log** [Task #1] — 4-6 hours, high visibility
2. **Simplify AI Costs** [Task #2] — 4-6 hours, high visibility
3. **Create My Data Dashboard** [Task #3] — 4-6 hours, new feature
4. **Lead Auto-Mapping** [Task #4] — 6-8 hours, completes core feature
5. **Privacy & Terms** [Task #10] — 4-6 hours, legal gate
6. **GDPR Erasure** [Task #11] — 4-6 hours, compliance gate
7. **API Key Docs** [Task #9] — 2-3 hours, quick win
8. **All Validation Tests** [Tasks #5-8] — 8-12 hours combined

**Total Effort**: 3-4 days to MVP-ready launch

---

## 📝 Task Tracking

Use the task list in Cowork to track progress:
```
TaskCreate: New task with subject & description
TaskUpdate: Mark as in_progress when starting, completed when done
TaskList: View all open tasks
```

Each task has a corresponding number (#1-#12) and full details in `MVP-READINESS-CHECKLIST.md`.

---

## 🔗 Key References

- **MVP Checklist**: `./MVP-READINESS-CHECKLIST.md` (detailed)
- **Implementation Tasks**: `./docs/tasks.md` (historical registry)
- **Architecture**: `./docs/architecture.md`
- **RAG System**: `./docs/rag-architecture.md`
- **Security**: `./docs/security.md`

---

## 🛠️ Common Development Tasks

### Add a New Admin Page
1. Create `src/app/admin/[feature]/page.tsx`
2. Add corresponding API route: `src/app/api/[feature]/route.ts`
3. Link from admin nav in `Sidebar.tsx`
4. Add JSDoc block to API route
5. Update `docs/tasks.md` when complete

### Add a New AI Provider
1. Create `src/lib/ai/providers/[provider].provider.ts` (implement `AIProvider` interface)
2. Add to `MODEL_REGISTRY` in `src/lib/ai/ai-config.ts`
3. Update provider factory in `src/lib/ai/providers/provider-factory.ts`
4. Update API key settings UI: `src/components/settings/ApiKeySettings.tsx`
5. Add docs section to `docs/api-keys.md`

### Test an End-to-End Flow
1. Start local dev server: `npm run dev`
2. Sign in with Google OAuth
3. Paste raw conversation in main workspace
4. Verify response generation uses correct context
5. Check admin dashboards for logged events
6. Validate vector memory storage via Supabase dashboard

---

## 🔐 Security Reminders

- **No API Keys in Logs**: User-supplied keys forwarded as `X-AI-Key` header only, never persisted
- **RLS Enforcement**: All 35 DB tables enforce row-level isolation via `authenticated` role gates
- **Prompt Injection Detection**: Enabled on all `/api/ai/*` endpoints
- **GDPR Compliance**: User can delete all personal data; erasure fully tested before launch

---

## 📞 Support & Contact

**Developed by**: ViveScript Solutions  
**Website**: [vivescriptsolutions.com](https://www.vivescriptsolutions.com)  
**Production**: [kit.vivereply.com](https://kit.vivereply.com)  
**Support**: [vivescriptsolutions.com/en/contact](https://www.vivescriptsolutions.com/en/contact)

---

**Next Step**: Review `MVP-READINESS-CHECKLIST.md` and start with Task #1 (Usage Log Simplification).
