# Response Validation & Business Rule Enforcement

## Overview

ViveKit enforces business configuration constraints on all AI-generated responses before they're presented to users. This ensures that pricing, timeline, guarantee, and tone preferences are always respected.

## What Gets Validated

### 1. **Timeline Constraints**
Blocks responses that promise delivery in less than 5 business days.

**Forbidden phrases:**
- "by tomorrow"
- "in 24 hours"
- "in 2 days"
- "over the weekend"
- "within 48 hours"

**Example:**
```
❌ "We can have this done by tomorrow morning."
✅ "We'll have the architecture blueprint ready in 7 business days."
```

### 2. **Guarantee Policy**
Blocks responses that promise absolute software perfection or zero-bug statuses.

**Forbidden phrases:**
- "100% bug-free"
- "flawless launch"
- "perfectly automated"
- "succeed with no effort"

**Example:**
```
❌ "Our solution is 100% bug-free and perfectly automated."
✅ "We'll build a robust system with thorough testing and iterative refinement."
```

### 3. **Refund Policy**
Blocks responses that commit to refunds (only admin can authorize).

**Forbidden phrases:**
- "full refund"
- "money-back guarantee"
- "refund your payment"
- "100% refund"

**Example:**
```
❌ "If you're not satisfied, we'll offer a full refund within 30 days."
✅ "Refund requests are handled by our administrative team on a case-by-case basis."
```

### 4. **Pricing Policy**
Enforces maximum 10% discounts and milestone-based billing.

**Rules:**
- Maximum discount: 10% (only with 6-month minimum retainer)
- Billing model: Prefer milestone-based, not hourly
- Service pricing: From defined service catalog only

**Example:**
```
❌ "I can offer you a 25% discount on the entire project."
✅ "For a 6-month commitment, we can offer a 10% discount on the monthly retainer."

❌ "Our hourly rate is $75/hour, estimated at 80 hours."
✅ "Phase 1 is $2,500, Phase 2 is $5,000, Phase 3 is $3,000."
```

### 5. **Tone Vocabulary**
Enforces tone-specific language rules for different communication styles.

**Consulting tone:**
- ✅ Allowed: "framework", "best practices", "iterative scope", "mitigate risk"
- ❌ Forbidden: "asap", "no problem", "cheap", "we guarantee"

**Friendly tone:**
- ✅ Allowed: "absolutely", "happy to help", "great to connect", "seamless"
- ❌ Forbidden: "forbidden", "strictly prohibited", "sue", "legal liability"

**Example:**
```
❌ "No problem, we can start ASAP."
✅ "Absolutely! We can commence the discovery phase within our standard timeline."
```

### 6. **Service Boundaries**
Validates that responses only offer services in the approved catalog.

**Example:**
```
❌ "You'll receive unlimited support and revisions as part of your package."
✅ "Support includes 2 rounds of revisions per milestone as outlined in our service agreement."
```

## Integration Points

### In Response Generation API

Add validation to `/api/ai/generate` and `/api/ai/stream`:

```typescript
import { ResponseValidator, ValidationResult } from '@/lib/ai/response-validator';

// After generating response
const validationResult = ResponseValidator.validate(
  generatedResponse,
  businessContext,
  selectedTone
);

if (!validationResult.is_valid) {
  // Log violations for review
  console.warn('Response Policy Violations:', validationResult.violations);
  
  if (validationResult.critical_violations > 0) {
    // Return error to user
    return NextResponse.json({
      error: 'Response violates business policy',
      violations: validationResult.violations,
      message: validationResult.summary
    }, { status: 400 });
  }
}

// Response is safe, return to user
return NextResponse.json({
  reply: generatedResponse,
  validationStatus: validationResult
});
```

### In Dashboard (Optional User Review)

Display validation results to users before they approve/send responses:

```typescript
if (validationResult.critical_violations > 0) {
  // Show red warning badge
  <Alert severity="error">
    {validationResult.summary}
    <Details violations={validationResult.violations} />
  </Alert>
}

if (validationResult.warning_violations > 0) {
  // Show yellow warning badge
  <Alert severity="warning">
    Tone/style recommendations: {validationResult.summary}
  </Alert>
}
```

## Running Tests

Comprehensive test suite in `tests/response-validation.test.ts` validates:

- Timeline constraint enforcement
- Guarantee policy compliance
- Refund policy compliance
- Tone vocabulary rules
- Pricing policy enforcement
- Service boundary validation
- Full integration tests

```bash
npm run test -- response-validation.test.ts
```

## Example: Full Response Validation

**Input Response:**
```
Thanks for reaching out. We specialize in custom web apps (starting at $4,900) 
and workflow automation (from $1,500).

Based on your requirements, here's our proposed approach:

Phase 1: Architecture Blueprint (7-10 business days) - $2,500
Phase 2: Core Integration & MVP (21-30 days) - $5,000
Phase 3: Launch & Refinement (2 weeks) - $3,000

We follow a milestone-based delivery model to maintain timeline stability.

For additional questions, I'd recommend a brief discovery call.
```

**Validation Output:**
```json
{
  "is_valid": true,
  "violation_count": 0,
  "critical_violations": 0,
  "warning_violations": 0,
  "summary": "Response complies with all business policies."
}
```

**Example Violation Output:**
```json
{
  "is_valid": false,
  "violation_count": 3,
  "critical_violations": 2,
  "warning_violations": 1,
  "violations": [
    {
      "type": "timeline",
      "severity": "critical",
      "message": "Violates timeline policy: mentions \"by tomorrow\"",
      "forbidden_phrase": "by tomorrow",
      "rule": "Never commit to deliveries under 5 business days"
    },
    {
      "type": "guarantee",
      "severity": "critical",
      "message": "Violates guarantee policy: mentions \"100% bug-free\"",
      "forbidden_phrase": "100% bug-free",
      "rule": "Never promise absolute software perfection"
    },
    {
      "type": "tone",
      "severity": "warning",
      "message": "Uses forbidden phrase for \"consulting\" tone: \"no problem\"",
      "forbidden_phrase": "no problem",
      "rule": "Consulting tone forbids: asap, no problem, cheap, we guarantee"
    }
  ],
  "summary": "⚠️ 2 critical policy violations. ⚠️ 1 warning about tone/style."
}
```

## Customization

To adjust validation rules, edit:

1. **BusinessIntelligenceEngine.getOperationalRules()** - Add/modify constraint rules
2. **BusinessIntelligenceEngine.getVoiceProfile()** - Adjust tone vocabulary rules
3. **ResponseValidator** - Add new validation logic

## Notes

- **Critical violations** block response from being sent (system enforces)
- **Warning violations** are logged but don't block (user can choose to send)
- Validation happens **after** response generation but **before** user approval
- All violations include the specific rule violated and forbidden phrase
- Tests cover individual rule validation + integration scenarios

---

Last Updated: 2026-06-03
