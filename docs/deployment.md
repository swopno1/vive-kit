# ViveKit — Production Deployment & Operations

> Last Updated: 2026-05-29
> Production URL: **https://kit.vivereply.com**
> Supabase Project: ViveFlow (`utvaibekuiotpkerlgck`) · ap-northeast-1 · ACTIVE_HEALTHY

---

## Infrastructure Layout

```
                        [ User Browser ]
                                │ (HTTPS)
                                ▼
                       [ Vercel CDN Edge ]
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼ Serverless APIs                           ▼ Edge AI Streams
  [ Node.js Serverless ]                      [ Vercel Edge Runtime ]
          │                                           │
          ▼                                           ▼
 [ Supabase PostgreSQL + pgvector ] ◄────── [ Gemini 2.0 Flash / Pro ]
 [ ViveFlow · ap-northeast-1 ]
          ▲
          │
 [ Upstash Redis — Rate limiting & Edge Cache ]
```

---

## Supabase Configuration (Required)

### Authentication → URL Configuration

These must be set in the Supabase dashboard before any production login will work:

| Setting | Value |
|:---|:---|
| **Site URL** | `https://kit.vivereply.com` |
| **Redirect URLs** | `https://kit.vivereply.com/auth/callback` |

> **Note:** If the Site URL is `http://localhost:3000`, all OAuth logins redirect to localhost regardless of `redirectTo`. This was the production auth bug discovered and fixed on 2026-05-29.

---

## Environment Variables (Vercel)

Set the following in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://utvaibekuiotpkerlgck.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# Gemini API
GEMINI_API_KEY=<gemini_api_key>

# Upstash Redis (rate limiting + caching)
UPSTASH_REDIS_REST_URL=<upstash_url>
UPSTASH_REDIS_REST_TOKEN=<upstash_token>

# App
NEXT_PUBLIC_APP_URL=https://kit.vivereply.com
NODE_ENV=production

# Access Control
SUPERADMIN_EMAILS=amirhossain.limon@gmail.com
```

---

## Deployment Runbook

### 1. Database (One-time)

All 12 migrations are applied to ViveFlow. For a fresh Supabase project:

```bash
# Apply migrations in order via Supabase CLI
supabase db push
```

Or apply each file manually via the Supabase SQL editor in the order listed in `docs/database-schema.md`.

### 2. Vercel Deployment

Connect the Git repository to Vercel:

- **Build Command**: `npm run build` (or `pnpm run build`)
- **Output Directory**: Next.js default (`.next`)
- **Framework**: Next.js
- **Node.js Version**: 20.x

```bash
# Local build verification before deploy
npx tsc --noEmit
npm run build
```

### 3. Deploy Region

Match Vercel deployment region to Supabase region:
- Supabase: `ap-northeast-1` (Tokyo)
- Vercel: `hnd1` (Tokyo) — set under Project → Settings → Functions Region

---

## Disaster Recovery

### Vercel Rollback

```bash
vercel rollback <stable-deployment-id>
```

### Database Snapshot Restoration

Supabase provides point-in-time recovery (PITR) on Pro plans. For manual restoration:

```bash
pg_restore -h db.utvaibekuiotpkerlgck.supabase.co -U postgres -d postgres -v backup.sql
```

Backup operations are tracked in `public.crm_disaster_backups`.

---

## Operational Monitoring

| Dashboard | Route | Data |
|:---|:---|:---|
| AI observability | `/admin/observability` | Event logs, latency, hallucination rate |
| Cost tracking | `/admin/performance` | Token usage, model costs, Redis hit rate |
| Security hardening | `/admin/security` | Injection attempts, GDPR requests |
| Team workspace | `/admin/workspace` | Members, invitations, collaboration |

> Note: Admin dashboards currently render hardcoded demo data. Live DB wiring is a P1 follow-up task.

---

## SSL & Security Headers

Vercel automatically provisions TLS for `kit.vivereply.com`. No additional SSL configuration required.

Security headers configured via `next.config.ts`:
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
