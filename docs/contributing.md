# ViveKit — Contributing Guide

> Last Updated: 2026-05-29

---

## Development Setup

See [environment-setup.md](environment-setup.md) for full local setup instructions.

Quick start:
```bash
pnpm install
cp .env.local.example .env.local   # Fill in your keys
pnpm run dev
```

---

## Branch Conventions

| Prefix | Use Case |
|:---|:---|
| `feature/` | New features or capabilities |
| `bugfix/` | Bug fixes and patches |
| `docs/` | Documentation-only changes |
| `refactor/` | Code quality improvements (no behavior change) |

Example: `feature/live-crm-dashboard`, `bugfix/cors-headers`

---

## Code Standards

### TypeScript

- Zero TypeScript errors required — run `npx tsc --noEmit` before committing
- All dynamic route parameters must use `Promise<{ id: string }>` pattern (Next.js 16)
- No `any` types — use proper TypeScript interfaces from `src/types/`

### Supabase

- Server-side modules **must** use `createClient()` from `src/lib/supabase/server.ts`
- Browser components may use `createClient()` from `src/lib/supabase/client.ts`
- Never use the browser client in API routes or server-side logic

### AI Routes

- All AI endpoints must call `SecurityEngine.scanPromptInjection()` before processing
- All AI endpoints must apply rate limiting before processing
- Input must be validated through the Zod schema in `src/lib/validation.ts`

### Logging

Use structured tags, never raw `console.log`:

```ts
console.info('[YOUR_TAG]', { key: value })
console.error('[YOUR_TAG_ERROR]', error)
```

### No Placeholder Merges

Never merge hardcoded UUIDs, mock data constants, or TODO-placeholder code paths into `main`. All merged code must be fully functional or explicitly flagged as a known demo fallback with a GitHub issue reference.

---

## Pre-PR Checklist

```bash
# 1. Type check
npx tsc --noEmit

# 2. Build test
npm run build

# 3. Lint
npm run lint
```

All three must pass with zero errors before opening a pull request.

---

## Database Changes

New tables or schema changes require a migration file:

```bash
# Filename pattern: YYYYMMDDHHMMSS_description.sql
supabase/migrations/20260601000000_add_new_feature.sql
```

Apply locally via the Supabase CLI (`supabase db push`) before committing. Include the migration in the PR.

---

## Attribution

ViveKit is developed and maintained by **ViveScript Solutions**. All contributions must align with the architectural and quality standards set by the core team.

- **Corporate Site**: https://www.vivescriptsolutions.com
- **Contact**: info@vivescriptsolutions.com
- © ViveScript Solutions. All rights reserved.
