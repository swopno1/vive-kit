<!-- BEGIN:nextjs-agent-rules -->
# ViveKit Development Conventions

This document defines rules, patterns, and conventions for agents working on ViveKit. **Always read this before making code changes.**

---

## 🚨 Critical: Next.js 16 Breaking Changes

This project uses **Next.js 16 with Turbopack**, which has breaking changes from standard Next.js patterns:

1. **Dynamic Route Parameters**: All `[id]` route handlers must accept `Promise<{ id: string }>` parameter type
   ```typescript
   // ✅ CORRECT
   export async function GET(
     req: Request,
     { params }: { params: Promise<{ id: string }> }
   ) {
     const { id } = await params;
     // ...
   }
   
   // ❌ WRONG (will cause Turbopack errors)
   export async function GET(req: Request, { params: { id } }) { }
   ```

2. **Server vs Client Components**: Explicitly mark components with `'use client'` if they use React hooks or client state
3. **Environment Variables**: Prefix public vars with `NEXT_PUBLIC_` to make them available client-side
4. **API Routes**: Use `src/app/api/` structure; routes are automatically available at `/api/`

**Reference**: Check `node_modules/next/dist/docs/` for latest Next.js 16 patterns.

---

## 📋 Code Standards

### API Routes (All Required)

Every new API route MUST include a JSDoc block:

```typescript
/**
 * POST /api/conversations
 * 
 * Creates a new conversation record with AI analysis.
 * Requires: authenticated user, valid X-AI-Provider header
 * 
 * @param {Request} req - HTTP request with body: { 
 *   rawConversation: string, 
 *   customerId?: string 
 * }
 * @returns {Response} { 
 *   success: boolean, 
 *   conversationId?: string, 
 *   error?: string 
 * }
 * @throws 401 if not authenticated
 * @throws 400 if invalid input
 */
export async function POST(req: Request) {
  // Implementation
}
```

### Service Files (All Required)

Every service file in `src/lib/ai/` must document:

```typescript
/**
 * IntelligenceEngine
 * 
 * Analyzes conversations for sentiment, urgency, risk flags, relationship signals.
 * Outputs structured intelligence for downstream reply generation.
 * 
 * Dependencies:
 * - Requires: AIProvider (from user config or env vars)
 * - Uses: pgvector for semantic search if memory context needed
 * - Reads env: GEMINI_API_KEY (fallback only)
 * 
 * Usage:
 *   const intel = await IntelligenceEngine.analyze(rawConversation);
 *   // intel = { sentiment, urgency, riskFlags, relationshipSignals }
 */
export class IntelligenceEngine { }
```

### Component Props (All TypeScript)

All React components must use TypeScript interfaces:

```typescript
interface MyComponentProps {
  /** Display text for the button */
  label: string;
  /** Callback fired on click; receives click event */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** If true, button is disabled and greyed out */
  disabled?: boolean;
}

export function MyComponent({ label, onClick, disabled }: MyComponentProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}
```

### Code Comments

**Only comment the *why*, not the *what*:**

```typescript
// ❌ BAD: Restates what the code does
// Convert the string to lowercase
const lower = input.toLowerCase();

// ✅ GOOD: Explains why
// Normalize email to lowercase for consistent CRM deduplication
const lower = input.toLowerCase();

// ✅ GOOD: Non-obvious constraint
// Rate limiter uses Upstash Redis; fall back to in-memory if Redis unavailable
// to prevent blocking user generation on cache failures
const limiter = new RateLimiter(redisClient || new MemoryLimiter());
```

---

## 🔀 Git & Task Workflow

### Before You Start
1. Check `docs/tasks.md` for existing work
2. Check `MVP-READINESS-CHECKLIST.md` for priority order
3. Use `TaskCreate` to create a task, or `TaskList` to find existing ones
4. Update task status: `in_progress` when starting, `completed` when done

### When You Commit
- Update `docs/tasks.md`: mark completed tasks with ✅ and today's date
- Update `docs/CHANGELOG.md` (Keep A Changelog format) for any breaking changes or new features
- All commit messages should reference the task: "Implement [Task #N]: [description]"

### PR Process
1. Branch from `main`
2. Make changes, test locally
3. Update task status to `completed`
4. Update `docs/tasks.md` with completion date
5. Open PR with description & task reference
6. Code review → merge

---

## 🧠 AI Provider Integration

### Adding a New Provider (e.g., Mistral)

1. **Create Provider Implementation**
   ```typescript
   // src/lib/ai/providers/mistral.provider.ts
   import { AIProvider } from './interface';
   
   export class MistralProvider implements AIProvider {
     constructor(private apiKey: string, private model: string) {}
     
     async generate(prompt: string): Promise<string> {
       // Call Mistral API
     }
     
     async *stream(prompt: string): AsyncGenerator<string> {
       // Stream implementation
     }
   }
   ```

2. **Register in Factory**
   ```typescript
   // src/lib/ai/providers/provider-factory.ts
   case 'mistral':
     return new MistralProvider(apiKey, model);
   ```

3. **Add to Model Registry**
   ```typescript
   // src/lib/ai/ai-config.ts
   MODEL_REGISTRY: {
     mistral: ['mistral-large-2407', 'mistral-medium-2407'],
     // ...
   }
   ```

4. **Update Settings UI**
   ```typescript
   // src/components/settings/ApiKeySettings.tsx
   // Add mistral to provider selector, update docs link
   ```

5. **Document in Guides**
   ```markdown
   // docs/api-keys.md
   ## Mistral AI
   [Step-by-step instructions...]
   ```

---

## 🗄️ Database Conventions

### Migrations

- File naming: `20260603000000_descriptive_name.sql`
- Always include comments explaining the *why*
- Test migrations locally before deploying to production
- Never use `USING (true)` in RLS policies — always scope to `authenticated` role

### Row-Level Security (RLS)

Every table must enforce RLS:

```sql
-- ✅ CORRECT: Scope to authenticated user
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY my_table_user_isolation ON my_table
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ❌ WRONG: Public access
CREATE POLICY my_table_public ON my_table USING (true);
```

### Vector Embeddings

- Store in `vector_memories` table with tenant isolation
- Always include `user_id` column for filtering
- Index with HNSW for sub-15ms retrieval
- Embeddings are ~1536 dimensions (pgvector `vector(1536)`)

---

## 🔐 Security Rules

### API Keys & Secrets

- ✅ Accept user API keys via `X-AI-Key` header only
- ✅ Never log or store user keys in database
- ✅ Never expose raw provider errors to client (sanitize before returning)
- ✅ Validate all user input with `zod` schemas before AI calls
- ❌ Never hardcode API keys in code
- ❌ Never send keys to third-party analytics services

### Prompt Injection Protection

All AI endpoints (`/api/ai/*`) must run prompt injection detection:

```typescript
import { detectPromptInjection } from '@/lib/security/prompt-injection';

export async function POST(req: Request) {
  const { conversation } = await req.json();
  
  // Reject if injection detected
  if (detectPromptInjection(conversation)) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }
  
  // Safe to process
}
```

### User Data Privacy

- Delete user data on request (GDPR erasure)
- Never share user data across tenants
- Anonymize logs: strip email, names, PII
- Test data deletion before any public launch

---

## 🧪 Testing Conventions

### Unit Tests

```typescript
// tests/lib/ai/intelligence-engine.test.ts
describe('IntelligenceEngine', () => {
  it('should extract sentiment from conversation', async () => {
    const result = await IntelligenceEngine.analyze(mockConversation);
    expect(result.sentiment).toBe('positive');
  });
});
```

### Integration Tests

```typescript
// tests/api/ai/generate.test.ts
it('should generate reply respecting business profile', async () => {
  const res = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'X-AI-Provider': 'google', 'X-AI-Model': 'gemini-2.0-flash' },
    body: JSON.stringify({ conversation, businessContext })
  });
  
  const data = await res.json();
  expect(data.reply).toContain('professional tone');
});
```

### Test Data

Keep test data in `tests/fixtures/`:
- Mock conversations in `conversations.fixture.ts`
- Mock CRM profiles in `crm-profiles.fixture.ts`
- Mock intelligence outputs in `intelligence.fixture.ts`

---

## 📚 Documentation Standards

### Every new feature must document:

1. **What it does** (one paragraph)
2. **Why it exists** (business or technical reason)
3. **How to use it** (code example)
4. **What it depends on** (env vars, databases, external services)

### File Organization

```
docs/
├── tasks.md                    # Task registry (updated on every task completion)
├── api-keys.md                 # User guide for getting API keys
├── architecture.md             # System diagrams
├── ai-systems.md              # AI provider routing, prompts
├── rag-architecture.md        # Vector memory & retrieval
├── security.md                # RLS policies, prompt injection, GDPR
├── deployment.md              # Vercel + Supabase production runbook
├── environment-setup.md       # All env vars documented
├── CONTRIBUTING.md            # Contribution guidelines (TBD)
└── CHANGELOG.md               # Keep A Changelog format
```

---

## 🚀 Pre-Launch Checklist

Before marking any feature as `completed`:

- [ ] Code has JSDoc blocks (routes & services)
- [ ] Tests written and passing
- [ ] No API keys in logs or database
- [ ] RLS policies enforced
- [ ] Error messages are user-friendly
- [ ] Performance: <3s generation, sub-15ms retrieval
- [ ] Task updated in `docs/tasks.md` with ✅ and date
- [ ] `CHANGELOG.md` updated if user-facing changes

---

## 🔧 Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run migrations
supabase db push

# Generate TypeScript types from Supabase
npx supabase gen types typescript --project-id [PROJECT_ID] > types/supabase.ts

# Check for TypeScript errors
npx tsc --noEmit
```

---

## 📞 When in Doubt

1. Check `docs/tasks.md` for similar work
2. Check `docs/architecture.md` for system layout
3. Search codebase for `AIProvider` or `IntelligenceEngine` patterns
4. Ask Claude (in Cowork) by linking to this file: `@AGENTS.md`
5. Update this file if you discover a new convention

---

**Last Updated**: 2026-06-03  
**Maintainer**: Md Amirhossain Limon (amirhossain.limon@gmail.com)

<!-- END:nextjs-agent-rules -->
