# ViveKit — Environment Setup Guide

> Last Updated: 2026-05-29

---

## Prerequisites

- Node.js 20.x or higher
- pnpm (recommended) or npm
- A Supabase project (ViveFlow — `utvaibekuiotpkerlgck` for production)
- Google Gemini API key
- Upstash Redis account (for rate limiting and caching)

---

## Local Setup

### 1. Clone and Install

```bash
git clone <repo>
cd rag_agent
pnpm install
```

### 2. Configure Environment

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

`.env.local` variables:

```bash
# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=https://utvaibekuiotpkerlgck.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>

# --- Google Gemini ---
GEMINI_API_KEY=<your_gemini_api_key>

# --- Upstash Redis (rate limiting + cache) ---
UPSTASH_REDIS_REST_URL=<your_upstash_url>
UPSTASH_REDIS_REST_TOKEN=<your_upstash_token>

# --- App ---
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# --- Access Control ---
SUPERADMIN_EMAILS=your@email.com
```

> Upstash Redis is optional for local dev — the rate limiter and cache service automatically fall back to an in-memory driver when Redis credentials are absent.

### 3. Supabase Auth (Local Dev)

For local OAuth to work, add `http://localhost:3000/auth/callback` to your Supabase project's Redirect URLs (Authentication → URL Configuration).

For production, the Site URL must be `https://kit.vivereply.com` and the redirect URL `https://kit.vivereply.com/auth/callback`.

### 4. Run Development Server

```bash
pnpm run dev
# or
npm run dev
```

Navigate to `http://localhost:3000`.

---

## Supabase Keys

Find your keys in the Supabase dashboard → Project Settings → API:

| Key | Dashboard Location | Use |
|:---|:---|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Public — safe for browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / `public` key | Public — safe for browser |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key | **Secret** — server-only, never expose |

---

## Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Add as `GEMINI_API_KEY` in `.env.local`

The app uses Gemini 2.0 Flash (default) and Gemini 2.0 Pro (complex tasks). Both use the same API key.

---

## Upstash Redis (Optional for Local Dev)

1. Create a Redis database at [upstash.com](https://upstash.com)
2. Copy the REST URL and token from the console
3. Add to `.env.local` as `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

Without these, the app runs with in-memory rate limiting and caching — fully functional but not shared across serverless instances.

---

## Verification Checklist

```bash
# TypeScript type check
npx tsc --noEmit

# Production build test
npm run build

# Lint check
npm run lint
```

Expect: zero TypeScript errors, zero ESLint errors, successful Next.js build with 35+ routes.

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
