/**
 * Response Generation Validation Tests
 *
 * This test suite validates that AI-generated responses respect business configuration:
 * - Tone preferences are applied correctly
 * - Timeline constraints are enforced
 * - Service boundaries are respected
 * - Pricing policies are enforced
 * - Guarantee boundaries are respected
 * - Brand vocabulary rules are followed
 *
 * Run with: npm run test -- response-validation.test.ts
 */

import { BusinessIntelligenceEngine } from '../src/lib/ai/business-engine';
import { BusinessContext, OperationalRule } from '../src/types';

describe('Response Generation - Business Configuration Validation', () => {
  const businessContext = BusinessIntelligenceEngine.getFallbackContext();
  const operationalRules = BusinessIntelligenceEngine.getOperationalRules();
  const playbooks = BusinessIntelligenceEngine.getObjectionPlaybooks();

  // =====================================================================
  // HELPER FUNCTIONS FOR VALIDATION
  // =====================================================================

  /**
   * Check if response violates timeline constraints
   */
  function violatesTimeline(response: string): { violates: boolean; violations: string[] } {
    const timelineRule = operationalRules.find(r => r.category === 'timeline');
    if (!timelineRule) return { violates: false, violations: [] };

    const violations = timelineRule.forbiddenPhrases
      .filter(phrase => response.toLowerCase().includes(phrase.toLowerCase()))
      .map(phrase => `Contains forbidden timeline phrase: "${phrase}"`);

    return { violates: violations.length > 0, violations };
  }

  /**
   * Check if response violates guarantee constraints
   */
  function violatesGuarantees(response: string): { violates: boolean; violations: string[] } {
    const guaranteeRule = operationalRules.find(r => r.category === 'guarantees');
    if (!guaranteeRule) return { violates: false, violations: [] };

    const violations = guaranteeRule.forbiddenPhrases
      .filter(phrase => response.toLowerCase().includes(phrase.toLowerCase()))
      .map(phrase => `Contains forbidden guarantee phrase: "${phrase}"`);

    return { violates: violations.length > 0, violations };
  }

  /**
   * Check if response violates refund policy
   */
  function violatesRefundPolicy(response: string): { violates: boolean; violations: string[] } {
    const refundRule = operationalRules.find(r => r.category === 'refund');
    if (!refundRule) return { violates: false, violations: [] };

    const violations = refundRule.forbiddenPhrases
      .filter(phrase => response.toLowerCase().includes(phrase.toLowerCase()))
      .map(phrase => `Contains forbidden refund phrase: "${phrase}"`);

    return { violates: violations.length > 0, violations };
  }

  /**
   * Check if response respects tone vocabulary rules
   */
  function validateToneVocabulary(response: string, tone: string = 'consulting'): { valid: boolean; issues: string[] } {
    const voice = BusinessIntelligenceEngine.getVoiceProfile(tone);
    const issues: string[] = [];

    // Check for forbidden phrases
    voice.vocabularyRules.avoid.forEach(phrase => {
      if (response.toLowerCase().includes(phrase.toLowerCase())) {
        issues.push(`Contains forbidden phrase for "${tone}" tone: "${phrase}"`);
      }
    });

    return { valid: issues.length === 0, issues };
  }

  /**
   * Check if response offers only services in catalog
   */
  function validateServiceOfferings(response: string, services: string[]): { valid: boolean; issues: string[] } {
    // Extract service names from offerings
    const availableServices = services
      .map(s => s.split(':')[0].trim().toLowerCase())
      .filter(s => s.length > 0);

    const issues: string[] = [];

    // Check for common service terms not in catalog
    const forbiddenTerms = [
      'hourly consulting',
      'retainer basis',
      'unlimited support',
      'custom one-off projects',
      'emergency support'
    ];

    forbiddenTerms.forEach(term => {
      if (response.toLowerCase().includes(term.toLowerCase()) &&
          !availableServices.some(s => s.includes(term.toLowerCase()))) {
        issues.push(`Response mentions service not in catalog: "${term}"`);
      }
    });

    return { valid: issues.length === 0, issues };
  }

  /**
   * Check if response respects pricing policy
   */
  function validatePricingPolicy(response: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for discount overcommit (e.g., offering >10% discount)
    const discountPatterns = [
      { pattern: /(\d{1,2})%\s*discount/, threshold: 10 },
      { pattern: /cut the price by (\d{1,2})%/, threshold: 10 },
      { pattern: /reduce.*(?:cost|price|fee).*(?:by\s+)?(\d{1,2})%/, threshold: 10 }
    ];

    discountPatterns.forEach(({ pattern, threshold }) => {
      const match = response.match(pattern);
      if (match && parseInt(match[1]) > threshold) {
        issues.push(`Offers discount of ${match[1]}% which exceeds ${threshold}% policy limit`);
      }
    });

    // Check for pricing contradictions
    if (response.toLowerCase().includes('free') && response.toLowerCase().includes('pricing')) {
      issues.push('Response conflicts: mentions free service while discussing pricing');
    }

    // Check that pricing follows guidelines
    if (response.toLowerCase().includes('hourly rate') && !response.toLowerCase().includes('milestone')) {
      issues.push('Response offers hourly billing but should suggest milestone-based pricing');
    }

    return { valid: issues.length === 0, issues };
  }

  // =====================================================================
  // TEST CASES
  // =====================================================================

  describe('Timeline Constraint Tests', () => {
    test('should reject promise of delivery "by tomorrow"', () => {
      const response = "I can have the basic setup done by tomorrow morning.";
      const result = violatesTimeline(response);
      expect(result.violates).toBe(true);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    test('should reject promise of delivery "in 24 hours"', () => {
      const response = "We can deliver this in 24 hours flat.";
      const result = violatesTimeline(response);
      expect(result.violates).toBe(true);
    });

    test('should reject promise of delivery "in 2 days"', () => {
      const response = "Your MVP will be ready in 2 days.";
      const result = violatesTimeline(response);
      expect(result.violates).toBe(true);
    });

    test('should allow realistic timeline (5+ business days)', () => {
      const response = "We'll have the architecture blueprint ready in 7 business days.";
      const result = violatesTimeline(response);
      expect(result.violates).toBe(false);
    });
  });

  describe('Guarantee Constraint Tests', () => {
    test('should reject "100% bug-free" promise', () => {
      const response = "Our solution is 100% bug-free and fully automated.";
      const result = violatesGuarantees(response);
      expect(result.violates).toBe(true);
    });

    test('should reject "flawless launch" promise', () => {
      const response = "We guarantee a flawless launch with zero issues.";
      const result = violatesGuarantees(response);
      expect(result.violates).toBe(true);
    });

    test('should reject "perfectly automated" promise', () => {
      const response = "Your workflow will be perfectly automated with no human intervention needed.";
      const result = violatesGuarantees(response);
      expect(result.violates).toBe(true);
    });

    test('should allow realistic quality statements', () => {
      const response = "We'll build a robust system with thorough testing and iterative refinement.";
      const result = violatesGuarantees(response);
      expect(result.violates).toBe(false);
    });
  });

  describe('Refund Policy Tests', () => {
    test('should reject "full refund" commitment', () => {
      const response = "If you're not satisfied, we'll offer a full refund within 30 days.";
      const result = violatesRefundPolicy(response);
      expect(result.violates).toBe(true);
    });

    test('should reject "money-back guarantee"', () => {
      const response = "We provide a money-back guarantee if you're unhappy.";
      const result = violatesRefundPolicy(response);
      expect(result.violates).toBe(true);
    });

    test('should allow escalation to administrative team', () => {
      const response = "Refund requests are handled by our administrative team on a case-by-case basis.";
      const result = violatesRefundPolicy(response);
      expect(result.violates).toBe(false);
    });
  });

  describe('Tone Vocabulary Tests', () => {
    test('consulting tone should avoid "asap"', () => {
      const response = "We can start work on this ASAP.";
      const result = validateToneVocabulary(response, 'consulting');
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.includes('asap'))).toBe(true);
    });

    test('consulting tone should avoid "no problem"', () => {
      const response = "No problem, we can make that change easily.";
      const result = validateToneVocabulary(response, 'consulting');
      expect(result.valid).toBe(false);
    });

    test('friendly tone should avoid "forbidden" language', () => {
      const response = "It is strictly forbidden to modify the authentication flow without approval.";
      const result = validateToneVocabulary(response, 'friendly');
      expect(result.valid).toBe(false);
    });

    test('consulting tone should use approved phrases', () => {
      const response = "Our framework for this project follows best practices in iterative scope management.";
      const result = validateToneVocabulary(response, 'consulting');
      expect(result.valid).toBe(true);
    });
  });

  describe('Service Boundary Tests', () => {
    test('should validate response mentions available services', () => {
      const response = "We offer custom web apps starting at $4,900, and Google Workspace automation from $1,500.";
      const result = validateServiceOfferings(response, businessContext.serviceOfferings || []);
      expect(result.valid).toBe(true);
    });

    test('should flag if response mentions unlimited support', () => {
      const response = "You'll receive unlimited support and revisions as part of your package.";
      const result = validateServiceOfferings(response, businessContext.serviceOfferings || []);
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.includes('unlimited'))).toBe(true);
    });

    test('should flag if response offers hourly consulting without context', () => {
      const response = "We can provide hourly consulting at $150/hour for urgent questions.";
      const result = validateServiceOfferings(response, businessContext.serviceOfferings || []);
      expect(result.valid).toBe(false);
    });
  });

  describe('Pricing Policy Tests', () => {
    test('should reject discount >10%', () => {
      const response = "I can offer you a 25% discount on the entire project.";
      const result = validatePricingPolicy(response);
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.includes('25%'))).toBe(true);
    });

    test('should allow discount ≤10%', () => {
      const response = "For a 6-month commitment, we can offer a 10% discount on the monthly retainer.";
      const result = validatePricingPolicy(response);
      expect(result.valid).toBe(true);
    });

    test('should reject hourly billing without milestone context', () => {
      const response = "Our hourly rate is $75/hour, and we estimate this at 80 hours.";
      const result = validatePricingPolicy(response);
      expect(result.valid).toBe(false);
    });

    test('should allow milestone-based pricing', () => {
      const response = "Phase 1 is $2,500, Phase 2 is $5,000, and Phase 3 is $3,000 with a 6-month minimum retainer.";
      const result = validatePricingPolicy(response);
      expect(result.valid).toBe(true);
    });
  });

  describe('Integration Tests - Full Response Validation', () => {
    test('should validate complete professional response', () => {
      const response = `Thanks for reaching out. We specialize in custom web apps (starting at $4,900) and workflow automation (from $1,500).

Based on your requirements, here's our proposed approach:

Phase 1: Architecture Blueprint (7-10 business days) - $2,500
Phase 2: Core Integration & MVP (21-30 days) - $5,000
Phase 3: Launch & Refinement (2 weeks) - $3,000

We follow a milestone-based delivery model to maintain timeline stability. This ensures quality and mitigates scope creep through formal change requests.

For additional questions, I'd recommend a brief discovery call to refine the technical scope.`;

      expect(violatesTimeline(response).violates).toBe(false);
      expect(violatesGuarantees(response).violates).toBe(false);
      expect(violatesRefundPolicy(response).violates).toBe(false);
      expect(validateToneVocabulary(response, 'consulting').valid).toBe(true);
      expect(validatePricingPolicy(response).valid).toBe(true);
    });

    test('should identify all constraint violations in poor response', () => {
      const badResponse = `No problem! We can have this done ASAP - in fact, by tomorrow.

Our solution is 100% bug-free and perfectly automated. We guarantee it will work flawlessly.

And here's the best part - I can offer you a 30% discount, plus a full refund if you're not happy within 30 days.

Unlimited support and revisions included!`;

      expect(violatesTimeline(badResponse).violates).toBe(true);
      expect(violatesGuarantees(badResponse).violates).toBe(true);
      expect(violatesRefundPolicy(badResponse).violates).toBe(true);
      expect(validateToneVocabulary(badResponse, 'consulting').valid).toBe(false);
      expect(validatePricingPolicy(badResponse).valid).toBe(false);
    });
  });
});
