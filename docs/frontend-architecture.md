# ViveKit — Frontend Architecture

> Last Updated: 2026-05-29

---

## Stack

- **Framework**: Next.js 16.2.6 (App Router)
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS + custom design tokens
- **Icons**: Lucide React ^1.16.0
- **Component System**: `@base-ui/react` ^1.4.1 + `@radix-ui/react-*`
- **shadcn/ui**: ^4.7.0

---

## Directory Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── approvals/       # Human approval workflow panel
│   │   ├── business/        # Business intelligence profile settings
│   │   ├── crm/             # CRM relationship intelligence dashboard
│   │   ├── observability/   # Telemetry charts and ingestion logs
│   │   ├── performance/     # AI cost control & caching console
│   │   ├── security/        # Hardening controls & GDPR manager
│   │   └── workspace/       # SaaS roster and collaboration feed
│   ├── api/                 # REST route handlers (server-only)
│   ├── auth/
│   │   ├── callback/        # OAuth redirect handler (exchanges code for session)
│   │   ├── login/           # Google OAuth sign-in page
│   │   ├── signout/         # Session destruction route
│   │   └── unauthorized/    # Non-superadmin redirect page
│   ├── error.tsx            # Global error boundary (catches rendering failures)
│   ├── layout.tsx           # Root layout — metadata, global CSS, font loading
│   └── page.tsx             # Central Operator Intelligence Desk (main UI)
├── components/
│   ├── dashboard/           # Core dashboard panels (conversation, memory, response, sidebar)
│   ├── intelligence/        # Client intelligence cards, memory timeline
│   ├── ui/                  # Primitive UI components (button, card, badge, dialog, etc.)
│   └── vivekit/             # ViveKit-specific components (ConversationInput, ResponseViewer, ToneSelector, etc.)
├── lib/                     # Business logic, AI engines, utilities
└── types/                   # TypeScript type definitions
```

---

## Design System — "Midnight & Neon"

| Token | Hex | Use |
|:---|:---:|:---|
| Ink Black | `#02040a` | Global page background |
| Slate Graphite | `#0f1115` | Card surfaces, sidebar |
| Muted Charcoal | `#212328` | Borders, hover states |
| Off-White Core | `#f8f9fa` | Primary text, headings |
| Graphite Silver | `#a0a5b0` | Secondary labels |
| Electric Violet | `#7c3aed` | Brand accent, AI status |
| Neon Cyan | `#06b6d4` | Success states, vector nodes |

**Typography**: Geist Sans (UI) + Geist Mono (code, timestamps, vector tokens)

---

## Key Components

### `src/app/page.tsx` — Central Operator Intelligence Desk

Main application view. Handles:
- Conversation paste input
- AI streaming reply display
- Tone selection
- Intelligence analysis panel
- Approval workflow trigger

Currently uses hardcoded customer UUID (`'00000000-...'`) — bypasses DB RAG lookups, uses fallback business context.

### `src/components/vivekit/`

| Component | Purpose |
|:---|:---|
| `ConversationInput.tsx` | Textarea for pasting raw dialogue |
| `ResponseViewer.tsx` | Renders streaming/completed AI reply |
| `ToneSelector.tsx` | 11-preset tone picker |
| `GenerateButton.tsx` | AI generation trigger with loading state |
| `InstructionPanel.tsx` | Additional instructions input panel |
| `EmptyState.tsx` | Placeholder before first generation |
| `LoadingState.tsx` | Streaming animation |
| `ErrorState.tsx` | Error display |
| `FutureSidebar.tsx` | Upcoming features placeholder sidebar |

### `src/components/intelligence/`

| Component | Purpose |
|:---|:---|
| `IntelligenceDashboard.tsx` | Full analysis view — risk, sentiment, entities |
| `ClientIntelligenceCard.tsx` | Per-client intelligence summary card |
| `MemoryTimeline.tsx` | Chronological client interaction timeline |

---

## Auth Integration

- Login: `src/app/auth/login/page.tsx` — `supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: window.location.origin + '/auth/callback' })`
- Callback: `src/app/auth/callback/route.ts` — exchanges auth code for session via `exchangeCodeForSession()`
- Middleware: `src/proxy.ts` (Next.js middleware) — validates session on every request, enforces `SUPERADMIN_EMAILS` gate

---

## metadataBase

Set in `src/app/layout.tsx` to `https://kit.vivereply.com` — required for OG image and sitemap URL resolution.

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
