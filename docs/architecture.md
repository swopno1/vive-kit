# ViveKit — System Architecture

> Last Updated: 2026-05-29
> Production: https://kit.vivereply.com | Supabase: ViveFlow (utvaibekuiotpkerlgck)

---

## Core Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    Operator Interface                           │
│         Next.js 16 React (App Router, Server + Client)         │
│   https://kit.vivereply.com  ·  Vercel CDN Edge                │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                           │
│         Next.js App Route Handlers (src/app/api/)              │
│  /api/ai/*  /api/crm/*  /api/approvals/*  /api/workspace/*     │
└───────────────┬──────────────────────────────┬─────────────────┘
                │                              │
                ▼                              ▼
┌──────────────────────────┐   ┌──────────────────────────────────┐
│  AI Security Firewall    │   │   Business Intelligence Guard    │
│  SecurityEngine          │   │   OperationalRulesEngine         │
│  prompt injection scan   │   │   policy + price enforcement     │
└──────────────┬───────────┘   └──────────────────┬───────────────┘
               │                                  │
               ▼                                  │
┌──────────────────────────┐                      │
│  Model Router            │◄─────────────────────┘
│  gemini-2.0-flash (fast) │
│  gemini-2.0-pro (reason) │
└──────────────┬───────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐  ┌─────────────────────────┐
│ RAG Vector  │  │  Prompt Assembler       │
│ Retrieval   │  │  11-module dynamic      │
│ pgvector    │  │  prompt construction    │
│ HNSW index  │  └────────────┬────────────┘
└──────┬──────┘               │
       └──────────┬───────────┘
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Gemini API (via @ai-sdk/google)               │
│            Streaming (SSE) or Blocking (JSON)                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               Human Approval Review System                      │
│       crm_approval_workflows · crm_approval_audits              │
│   States: draft → pending_review → approved / rejected          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database & Memory Boundaries

| Layer | Technology | Purpose |
|:---|:---:|:---|
| **Relational** | Supabase Postgres 17 | 35 tables — workspaces, CRM, approvals, compliance |
| **Vector** | pgvector (`vector(768)`) | `vector_memories` — semantic RAG retrieval |
| **Index** | HNSW cosine ops | Sub-15ms similarity search at scale |
| **Cache** | Upstash Redis | Rate limiting + client profile edge caching |
| **Fallback** | In-memory (Map) | Redis offline fallback — no cold-start failure |

---

## Auth Flow

```
User → https://kit.vivereply.com/auth/login
  → Google OAuth (Supabase)
  → Callback: https://kit.vivereply.com/auth/callback
  → Session cookie set
  → proxy.ts: SUPERADMIN_EMAILS check
  → Allowed: /  |  Blocked: /auth/unauthorized
```

---

## Key Source Locations

| Area | Path |
|:---|:---|
| AI engines | `src/lib/ai/` |
| Supabase clients | `src/lib/supabase/` |
| Rate limiter | `src/lib/rate-limiter.ts` |
| Cache service | `src/lib/cache-service.ts` |
| Validation schemas | `src/lib/validation.ts` |
| API routes | `src/app/api/` |
| Admin UI | `src/app/admin/` |
| Auth routes | `src/app/auth/` |
| DB migrations | `supabase/migrations/` |
| Type definitions | `src/types/` |

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
