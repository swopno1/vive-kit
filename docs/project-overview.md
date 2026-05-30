# ViveKit — Project Overview

> Last Updated: 2026-05-29
> Live at: **https://kit.vivereply.com**
> Developed by: ViveScript Solutions

---

## What Is ViveKit?

ViveKit is an **AI-powered client communication operating system** for freelancers, agencies, and consultants. It transforms raw, unstructured client conversations into strategic, context-aware business replies — enforcing pricing boundaries, brand voice, and operational policies while maintaining a complete human-in-the-loop review chain.

---

## The Problem

Client-facing professionals spend hours parsing unstructured email threads to reply — and during negotiations, minor wording errors can compromise pricing, trigger scope creep, or breach SLAs.

Generic AI tools fail here because they are:

1. **Context-blind** — no persistent memory of client history or relationship dynamics
2. **Operationally blind** — no awareness of service boundaries, discount caps, or delivery timelines
3. **Risk-unaware** — freely promise impossible deliverables or unauthorized refunds

---

## The ViveKit Solution

ViveKit acts as a centralized **Client Strategy & Relationship Intelligence Engine**:

- **Ingests** raw conversation pastes directly
- **Recalls** client history via pgvector semantic search (RAG)
- **Enforces** operational policies, brand voice, and pricing boundaries in every AI prompt
- **Generates** multiple strategic reply variants with tradeoff analysis
- **Governs** output through a human approval workflow before anything reaches clients
- **Learns** from operator overrides to build reinforcement data for future optimization

---

## Current Status (2026-05-29)

| Dimension | Status |
|:---|:---:|
| Production URL | ✅ Live — https://kit.vivereply.com |
| Database | ✅ 35 tables live — ViveFlow (ap-northeast-1) |
| Authentication | ✅ Google OAuth + superadmin gate |
| Core AI flow | ✅ Streaming + blocking + strategy |
| RAG pipeline | ✅ pgvector HNSW, sub-15ms retrieval |
| Rate limiting | ✅ Upstash + memory fallback |
| Edge caching | ✅ Upstash Redis + memory fallback |
| Admin dashboards | ⚠️ Demo data — not wired to live DB |
| Multi-user SaaS | ⚠️ Pending — billing + legal not complete |

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript |
| AI | Google Gemini 2.0 Flash / Pro via `@ai-sdk/google` |
| Database | Supabase Postgres 17 + pgvector |
| Auth | Supabase Auth (Google OAuth) |
| Caching | Upstash Redis + in-memory fallback |
| Rate limiting | `@upstash/ratelimit` |
| Hosting | Vercel |
| Styling | Tailwind CSS ("Midnight & Neon" design system) |

---

## Ownership

ViveKit is developed and maintained by **ViveScript Solutions**.

- **Product URL**: https://kit.vivereply.com
- **Corporate Site**: https://www.vivescriptsolutions.com
- **Contact**: info@vivescriptsolutions.com
- © ViveScript Solutions. All rights reserved.
