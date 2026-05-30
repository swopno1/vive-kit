# ViveKit — Security Architecture

> Last Updated: 2026-05-29

---

## 1. Authentication

- **Provider**: Google OAuth via Supabase Auth
- **Session**: Cookie-based (`HttpOnly`, `SameSite`) managed by `@supabase/ssr`
- **Middleware**: `src/proxy.ts` — intercepts every request, calls `updateSession()`, enforces superadmin gate
- **Superadmin gate**: Only emails in `SUPERADMIN_EMAILS` env var gain access; all others → `/auth/unauthorized`

---

## 2. Database Authorization (RLS)

All 35 Supabase tables enforce `authenticated`-only Row Level Security:

```sql
CREATE POLICY "Allow authenticated access to <table>" ON public.<table>
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

Applied in migration `20260529000000_secure_rls_policies.sql` (2026-05-29). Anonymous access is blocked at the DB level.

---

## 3. Prompt Injection Defense

`SecurityEngine.scanPromptInjection()` runs before any model call:

**Blocked patterns**: `"ignore previous instructions"`, `"system override"`, `"reveal system prompt"`, `<script>`, `DROP TABLE`, `DELETE FROM`, SQL comment `--`

**On match**: `HTTP 403` + `[SECURITY_BLOCKED]` log + write to `crm_security_incidents`

---

## 4. Input Validation

```ts
rawConversation:        z.string().max(50000)  // src/lib/validation.ts
additionalInstructions: z.string().max(5000)
```

Rejects oversized inputs before any AI processing.

---

## 5. Rate Limiting

`src/lib/rate-limiter.ts` — sliding window per authenticated user:
- **Primary**: `@upstash/ratelimit` (Upstash Redis)
- **Fallback**: In-memory counter (auto-activated when Redis absent)

Applied at the top of all AI route handlers.

---

## 6. Production Auth URL Configuration (Fixed 2026-05-29)

Supabase dashboard → Authentication → URL Configuration:
- **Site URL**: `https://kit.vivereply.com`
- **Redirect URLs**: `https://kit.vivereply.com/auth/callback`

Required: without these, OAuth redirects fall back to localhost.

---

## 7. Audit Logging

Structured event tags on all sensitive operations:
```
[SECURITY_BLOCKED]             — injection attempt
[APPROVAL_CONFIRMED]           — reply approved
[CRM_DECISION_AUDIT_LOGGED]   — strategy selected
[WORKSPACE_ONBOARDING_INVITE_SENT] — team invite
```

Optionally persisted to `crm_observability_events` and `crm_security_incidents`.

---

## 8. Open Items

| Item | Priority |
|:---|:---:|
| CORS headers on API routes | P2 |
| Real GDPR erasure pipeline | P2 |
| Live security dashboard data | P3 |

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
