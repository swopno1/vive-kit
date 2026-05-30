# ViveKit — Production Readiness Manual

> Last Updated: 2026-05-29
> Production URL: https://kit.vivereply.com

---

## Final Deployment Checklist

- [x] `npm run build` passes — zero errors, zero TypeScript warnings
- [x] All 12 migrations applied to ViveFlow (`utvaibekuiotpkerlgck`) — 35 tables live
- [x] RLS policies enforced (`authenticated` only) on all 35 tables
- [x] pgvector HNSW index active on `vector_memories.embedding`
- [x] Google OAuth active — `proxy.ts` + `middleware.ts` + superadmin gate
- [x] Supabase Site URL = `https://kit.vivereply.com` (fixed 2026-05-29)
- [x] Redirect URL `https://kit.vivereply.com/auth/callback` registered
- [x] Environment variables provisioned in Vercel
- [x] Rate limiting active (`@upstash/ratelimit` + memory fallback)
- [x] Edge caching active (Upstash Redis + memory fallback)
- [x] Prompt injection scanner on all 3 AI endpoints
- [x] Zod validation with 50K/5K char limits
- [x] Request timeouts (30s) + retries (3x) on Gemini

---

## Production Deployment Commands

```bash
# 1. Type check
npx tsc --noEmit

# 2. Build verification
npm run build

# 3. Lint check
npm run lint
```

Deploy via Vercel Git integration (push to `main` triggers automatic deploy).

---

## Vercel Configuration

| Setting | Value |
|:---|:---|
| Framework | Next.js |
| Build Command | `npm run build` |
| Node.js Version | 20.x |
| Functions Region | `hnd1` (Tokyo — matches Supabase ap-northeast-1) |
| Branch | `main` |

---

## Rollback Strategy

### Vercel

```bash
vercel rollback <stable-deployment-id>
```

Vercel preserves the last 5 deployments. Use the Vercel dashboard → Deployments to promote a previous build.

### Database

Supabase provides automated daily backups on Pro plan. Manual restore:

```bash
pg_restore -h db.utvaibekuiotpkerlgck.supabase.co -U postgres -d postgres -v backup.sql
```

Backup history tracked in `public.crm_disaster_backups`.

---

## Operational Monitoring

| Signal | Location |
|:---|:---|
| App errors | Vercel Dashboard → Functions |
| Auth events | Supabase Dashboard → Auth |
| DB query health | Supabase Dashboard → Database |
| AI event logs | `/admin/observability` (demo data currently) |
| Cost tracking | `/admin/performance` (demo data currently) |
| Security events | `/admin/security` (demo data currently) |

---

## Known Operational Limitations (2026-05-29)

1. **Admin dashboards serve hardcoded data** — no live Supabase queries yet.
2. **Single superadmin account** — only `SUPERADMIN_EMAILS` can log in.
3. **No Stripe billing** — workspace plans are not enforced.
4. **GDPR erasure is mocked** — no real deletion pipeline.

These are acceptable for the current controlled MVP with a single superadmin operator.

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
