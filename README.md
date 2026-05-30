# ViveKit — Free AI Client Communication Toolkit

> Transform raw client conversations into strategic, business-aware replies — powered by your own AI key.

**Live at [kit.vivereply.com](https://kit.vivereply.com)** · A free tool by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**

---

## What is ViveKit?

ViveKit is a free, production-ready AI workspace for freelancers, agencies, consultants, and account managers. Paste a raw client conversation — email thread, Slack dump, support ticket — and ViveKit drafts a strategic, context-aware reply that respects your service boundaries, pricing policies, and client relationship history.

**No subscription. No hidden cost. Bring your own API key.**

---

## Key Features

| Feature | Description |
|---|---|
| **BYOK — Bring Your Own Key** | Connect Google Gemini, OpenAI, or Anthropic using your own API key. Stored only in your browser — never on our servers. |
| **Context-Aware Replies** | Merges your business profile, service catalog, and long-term client memory to draft replies that actually fit your brand. |
| **RAG Memory** | Every approved reply is embedded and stored in a per-tenant pgvector index. Future replies surface relevant history automatically. |
| **Conversation Intelligence** | Deep analysis of each thread — urgency, sentiment, risk flags, relationship signals, upsell opportunities. |
| **Human-in-the-Loop Approval** | AI drafts never send automatically. Review, edit, approve — then copy. |
| **Brand Safety Engine** | Blocks output that promises discounts, over-commits delivery timelines, or violates your governance policy. |
| **Admin Dashboards** | CRM, workspace team management, observability logs, AI cost tracking, and security audit — all live from your Supabase database. |

---

## Supported AI Providers

| Provider | Models | Status |
|---|---|---|
| **Google Gemini** | Gemini 2.0 Flash, Gemini 2.0 Pro | ✅ Active |
| **OpenAI** | GPT-4o | ✅ Active |
| **Anthropic** | Claude 3.5 Sonnet | ✅ Active |
| Mistral | — | 🔜 Coming soon |
| Cohere | — | 🔜 Coming soon |
| xAI Grok | — | 🔜 Coming soon |

Configure your provider from the sidebar → click the AI status badge → paste your key. It never leaves your browser.

---

## Tech Stack

### Frontend
- **Next.js 16** (App Router, Turbopack)
- **React 19** with Server Components
- **Tailwind CSS v4** — dark charcoal design system
- **shadcn/ui** — accessible component primitives

### Backend & AI
- **Supabase PostgreSQL** — multi-tenant relational data
- **pgvector** with HNSW indexing — sub-15ms semantic retrieval
- **Vercel AI SDK** — unified provider interface (`@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/anthropic`)
- **Upstash Redis** — edge caching (92% hit rate) + rate limiting

### Security
- Row-Level Security on all 35 tables (no `USING (true)` public policies)
- Prompt injection detection on every AI endpoint
- User API keys stored in `localStorage` only — forwarded as request headers, never persisted

---

## Project Structure

```text
src/
├── app/
│   ├── admin/          # CRM, approvals, security, observability, performance, workspace
│   ├── api/
│   │   ├── ai/         # generate · stream · analyze · strategy
│   │   ├── conversations/
│   │   ├── crm/
│   │   ├── workspace/
│   │   ├── security/
│   │   ├── observability/
│   │   └── performance/
│   ├── auth/           # Login, OAuth callback, sign-out
│   └── page.tsx        # Intelligence Desk (main workspace)
├── components/
│   ├── settings/       # ApiKeySettings, ApiKeyModal
│   ├── dashboard/      # Sidebar, ConversationInput, ResponsePanel
│   ├── intelligence/   # IntelligenceDashboard, MemoryTimeline
│   └── ui/             # shadcn primitives
├── lib/
│   ├── ai/
│   │   ├── providers/  # GeminiProvider, OpenAIProvider, AnthropicProvider, factory
│   │   ├── memory/     # RetrievalEngine, MemoryManager, ContextAssembler
│   │   ├── intelligence/ # IntelligenceEngine, schemas
│   │   └── prompts/    # PromptManager, PromptBuilder
│   ├── supabase/       # server · client · middleware
│   ├── user-ai-config.ts  # localStorage helpers for BYOK
│   ├── cache-service.ts
│   └── rate-limiter.ts
├── types/              # Unified TypeScript contracts
supabase/
└── migrations/         # 12 migrations, 35 tables, HNSW vector index
docs/
└── tasks.md            # Implementation & production task registry
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (PostgreSQL + pgvector extension)
- An API key from [Google AI Studio](https://aistudio.google.com/app/apikey), [OpenAI](https://platform.openai.com/api-keys), or [Anthropic](https://console.anthropic.com/settings/keys)

### 1. Clone & Install

```bash
git clone https://github.com/swopno1/vive-kit.git
cd vive-kit
npm install
```

### 2. Configure Environment

Create `.env.local` in the project root:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Default AI key — used when users have not configured their own (optional)
GEMINI_API_KEY=your_gemini_key

# Optional — only needed for server-side env-var fallback for these providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Rate limiting (optional — falls back to in-memory limiter)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

> **Note**: Users can supply their own API key directly in the UI. The `GEMINI_API_KEY` is only used as a fallback when no user key is configured.

### 3. Apply Database Migrations

```bash
# Using Supabase CLI
supabase db push
```

Or apply the SQL files in `supabase/migrations/` in order via the Supabase dashboard SQL editor.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Configuring Your AI Provider (In-App)

1. Open the app and sign in with Google.
2. In the sidebar, click the **AI status badge** at the bottom (e.g. "Gemini 2.0 · Default key").
3. Select a provider — **Google Gemini**, **OpenAI**, or **Anthropic**.
4. Choose a model from the dropdown.
5. Paste your API key. Click **Save API Key**.

Your key is stored in your browser's `localStorage` only. Each AI request forwards it as a header directly to the provider — ViveScript never sees or stores it.

**Getting your key:**
- Google Gemini → [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) *(free tier available)*
- OpenAI → [platform.openai.com/api-keys](https://platform.openai.com/api-keys) *(prepaid credits required)*
- Anthropic → [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) *(paid account required)*

---

## Documentation

| Doc | Description |
|---|---|
| [tasks.md](./docs/tasks.md) | Implementation registry — completed tasks + open MVP items |
| [architecture.md](./docs/architecture.md) | Multi-layer system diagrams and database layout |
| [ai-systems.md](./docs/ai-systems.md) | Model routing, prompt builder, provider factory |
| [rag-architecture.md](./docs/rag-architecture.md) | Semantic + hybrid search pipeline |
| [vector-memory.md](./docs/vector-memory.md) | pgvector embedding storage and tenant isolation |
| [security.md](./docs/security.md) | RLS policies, prompt injection, GDPR pipeline |
| [deployment.md](./docs/deployment.md) | Vercel + Supabase production runbook |
| [environment-setup.md](./docs/environment-setup.md) | Full env variable reference |

---

## Contributing

See [docs/tasks.md](./docs/tasks.md) for the open task list. PRs should:
- Mark the relevant task ✅ in `tasks.md` with the completion date
- Include a JSDoc block on every new API route and service file
- Follow the code comment philosophy: comment the *why*, not the *what*

---

## License

This project is source-available. All rights reserved by **ViveScript Solutions**.  
You may fork for personal or evaluation use. Commercial redistribution requires written permission.

---

Developed and maintained by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**

- Production: [kit.vivereply.com](https://kit.vivereply.com)
- Support: [vivescriptsolutions.com/en/contact](https://www.vivescriptsolutions.com/en/contact)
- Partner: [ViveReply](https://vivereply.com)
