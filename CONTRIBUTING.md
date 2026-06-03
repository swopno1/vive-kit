# Contributing to ViveKit

Thank you for your interest in contributing to ViveKit! This guide explains our development standards, coding conventions, and contribution process.

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Supabase account (free tier works)
- Git

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/ViveScript-Solutions/rag-agent.git
cd rag-agent
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

NEXT_PUBLIC_VERCEL_URL=http://localhost:3000

# AI Providers (optional for testing)
GEMINI_API_KEY=optional
OPENAI_API_KEY=optional
ANTHROPIC_API_KEY=optional
```

4. **Start development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run tests**

```bash
npm run test
```

## Code Standards

### TypeScript

All code should be written in TypeScript with strict mode enabled:

```typescript
// ✅ Good: Explicit types
async function parseConversation(
  rawText: string,
  format: 'email' | 'slack' | 'ticket'
): Promise<ConversationData> {
  // Implementation
}

// ❌ Bad: Implicit any
async function parseConversation(rawText, format) {
  // Implementation
}
```

### JSDoc Documentation

All functions must include JSDoc with:
- Description
- @param types and descriptions
- @returns type and description
- @throws if applicable
- @example if complex

```typescript
/**
 * Parse an email thread into structured conversation turns.
 *
 * Extracts individual messages, timestamps, senders, and thread context
 * from raw email thread text. Handles common email formats and quoting styles.
 *
 * @param emailText - Raw email thread text (forwarded or copy-paste)
 * @param options - Parsing options
 * @returns Parsed conversation with turns, participants, and metadata
 * @throws Error if email format is unrecognizable
 *
 * @example
 * const conversation = parseEmailThread(emailText, {
 *   detectInlineQuotes: true,
 *   extractMetadata: true
 * });
 */
export function parseEmailThread(
  emailText: string,
  options?: EmailParsingOptions
): ConversationData {
  // Implementation
}
```

### File Organization

```
src/
├── app/                    # Next.js app router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   └── legal/             # Legal pages (privacy, terms)
├── components/
│   ├── ui/                # Reusable UI components (buttons, cards)
│   ├── intelligence/      # Intelligence-related components
│   └── admin/             # Admin dashboard components
├── lib/
│   ├── ai/                # AI-related utilities
│   │   ├── providers/     # AI provider implementations
│   │   ├── prompts/       # Prompt templates and management
│   │   ├── memory/        # Vector memory and RAG
│   │   └── business-engine.ts
│   ├── conversation/      # Conversation parsing and history
│   ├── crm/               # CRM integration
│   └── utils/             # General utilities
└── types/                 # TypeScript type definitions
```

### Naming Conventions

```typescript
// Files: kebab-case
src/lib/ai/response-validator.ts
src/components/admin/usage-dashboard.tsx

// Classes/Interfaces: PascalCase
class ResponseValidator {}
interface BusinessContext {}

// Functions/Variables: camelCase
function validateResponse() {}
const businessContext = {}

// Constants: UPPER_SNAKE_CASE
const MAX_DISCOUNT = 0.10;
const API_TIMEOUT_MS = 30000;

// Private/Internal: _leadingUnderscore
private _validateSignature() {}
const _internalHelper = () => {}
```

### Error Handling

Always provide meaningful error messages:

```typescript
// ✅ Good: Clear context
throw new Error(
  'Conversation parsing failed: Email format unrecognized. ' +
  'Please provide a full email thread with From/To/Date headers.'
);

// ❌ Bad: No context
throw new Error('Parse error');
```

## Testing Standards

### Test Organization

```typescript
/**
 * File: tests/response-validation.test.ts
 * Tests for ResponseValidator
 */

describe('Response Validation', () => {
  describe('Timeline Constraints', () => {
    test('should reject promise of delivery "by tomorrow"', () => {
      // Arrange
      const response = "I can deliver this by tomorrow.";
      
      // Act
      const result = ResponseValidator.validate(response, context);
      
      // Assert
      expect(result.critical_violations).toBeGreaterThan(0);
    });
  });
});
```

### Coverage Requirements

- All public functions must have tests
- Aim for 80%+ code coverage
- Test both happy paths and error cases
- Use mock data for external dependencies

**Run tests with coverage:**

```bash
npm run test -- --coverage
```

## API Route Standards

All API routes should:

1. Include JSDoc header
2. Validate input
3. Authenticate user
4. Check permissions
5. Perform operation
6. Return consistent response format

```typescript
/**
 * POST /api/ai/generate
 *
 * Generate an AI response given conversation context and business profile.
 * Validates business rules before returning response.
 */
export async function POST(request: Request) {
  try {
    // 1. Validate input
    const body = await request.json();
    if (!body.conversation) {
      return NextResponse.json(
        { error: 'Missing required field: conversation' },
        { status: 400 }
      );
    }

    // 2. Authenticate
    const user = await auth.getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 3. Check permissions
    const customerId = body.customerId;
    const hasAccess = await crm.userHasAccessTo(user.id, customerId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 4. Perform operation
    const response = await aiService.generate({
      conversation: body.conversation,
      businessProfile: user.businessProfile,
      customerId: customerId
    });

    // 5. Validate response against business rules
    const validation = ResponseValidator.validate(
      response,
      user.businessProfile
    );

    if (!validation.is_valid && validation.critical_violations > 0) {
      return NextResponse.json(
        {
          error: 'Response violates business policy',
          violations: validation.violations
        },
        { status: 400 }
      );
    }

    // 6. Return response
    return NextResponse.json({
      reply: response,
      validationStatus: validation
    });
  } catch (error) {
    console.error('Error in /api/ai/generate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Git Workflow

### Branch Naming

```
feature/feature-name          # New features
bugfix/bug-name              # Bug fixes
docs/documentation-name      # Documentation
refactor/refactoring-name    # Refactoring
test/test-name               # Test additions
```

### Commit Messages

Follow conventional commits:

```
feat: Add new AI provider routing logic
fix: Correct timeline validation logic
docs: Update API documentation
test: Add tests for CRM context integration
refactor: Simplify conversation parser
```

### Pull Request Process

1. **Create feature branch** from `main`
2. **Write code** following standards above
3. **Add/update tests** (aim for 80%+ coverage)
4. **Update documentation** if needed
5. **Create pull request** with:
   - Clear description of changes
   - Reference related issues
   - Test coverage details
   - Screenshots for UI changes

Example PR description:

```markdown
## Description

Implement CRM context assembly to surface client history in responses.

## Changes

- Created ContextAssembler utility to merge memories and profiles
- Added memory optimization with token budgeting
- Implemented relationship strength impact on response tone
- Added 30+ test cases validating context behavior

## Testing

- Tests added: tests/crm-context.test.ts
- Coverage: 95%
- All tests passing ✅

## Related Issues

Closes #42 (CRM Context Integration)
```

## Deployment

### Staging Deployment

Push to `staging` branch to deploy to staging environment:

```bash
git push origin main:staging
```

Staging URL: https://kit-staging.vivereply.com

### Production Deployment

Push to `main` branch to deploy to production:

```bash
git push origin feature/my-feature:main
```

Production URL: https://kit.vivereply.com

**Deployment checks:**

- All tests pass ✅
- Code coverage maintained ✅
- No console errors ✅
- Performance acceptable ✅
- Security audit passed ✅

## Common Tasks

### Add a New Admin Page

1. Create page component: `src/app/admin/[feature]/page.tsx`
2. Add API route: `src/app/api/[feature]/route.ts`
3. Add JSDoc to API route
4. Create tests: `tests/[feature].test.ts`
5. Update navigation: `src/components/Sidebar.tsx`
6. Update `docs/tasks.md` when complete

### Add a New AI Provider

1. Create provider: `src/lib/ai/providers/[provider].provider.ts`
2. Implement `AIProvider` interface
3. Add to registry: `src/lib/ai/ai-config.ts`
4. Update factory: `src/lib/ai/providers/provider-factory.ts`
5. Add API settings UI: `src/components/settings/ApiKeySettings.tsx`
6. Document in `docs/api-keys.md`
7. Add cost tracking
8. Test with sample conversation

### Run Test Suite

```bash
# All tests
npm run test

# Specific test file
npm run test -- response-validation.test.ts

# With coverage
npm run test -- --coverage

# Watch mode
npm run test -- --watch
```

### Build for Production

```bash
npm run build
npm start
```

## Documentation Standards

All documentation should:

1. **Be clear and concise** - Use simple language
2. **Include examples** - Show real usage
3. **Have table of contents** - Help navigation
4. **Be up to date** - Update with code changes
5. **Include diagrams** - For complex processes

Documentation checklist:

- [ ] README.md updated (if relevant)
- [ ] API documentation updated
- [ ] Configuration options explained
- [ ] Examples provided
- [ ] Troubleshooting section added
- [ ] Last Updated date included

## Questions?

- **Technical questions:** Create an issue on GitHub
- **Design questions:** Reach out to Alex (alex@vivescriptsolutions.com)
- **General questions:** Email team@vivescriptsolutions.com

---

Thank you for contributing to ViveKit! 🚀

Last Updated: 2026-06-03
