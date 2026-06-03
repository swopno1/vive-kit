import { BusinessIntelligenceEngine } from './business-engine';
import { BusinessContext } from '../../types';

/**
 * ResponseValidator
 *
 * Validates AI-generated responses against business configuration constraints.
 * Used to catch policy violations before responses are sent to clients.
 */
export class ResponseValidator {
  /**
   * Comprehensive validation of response against business rules
   *
   * @param response - The AI-generated response text
   * @param businessContext - Business configuration
   * @param tone - Selected tone preference
   * @returns Validation result with violations list
   */
  static validate(
    response: string,
    businessContext?: BusinessContext,
    tone: string = 'consulting'
  ): ValidationResult {
    const context = businessContext || BusinessIntelligenceEngine.getFallbackContext();
    const rules = BusinessIntelligenceEngine.getOperationalRules();
    const voice = BusinessIntelligenceEngine.getVoiceProfile(tone);

    const violations: Violation[] = [];

    // 1. Timeline constraints
    const timelineRule = rules.find(r => r.category === 'timeline');
    if (timelineRule) {
      timelineRule.forbiddenPhrases.forEach(phrase => {
        if (response.toLowerCase().includes(phrase.toLowerCase())) {
          violations.push({
            type: 'timeline',
            severity: 'critical',
            message: `Violates timeline policy: mentions "${phrase}"`,
            forbidden_phrase: phrase,
            rule: timelineRule.description
          });
        }
      });
    }

    // 2. Guarantee constraints
    const guaranteeRule = rules.find(r => r.category === 'guarantees');
    if (guaranteeRule) {
      guaranteeRule.forbiddenPhrases.forEach(phrase => {
        if (response.toLowerCase().includes(phrase.toLowerCase())) {
          violations.push({
            type: 'guarantee',
            severity: 'critical',
            message: `Violates guarantee policy: mentions "${phrase}"`,
            forbidden_phrase: phrase,
            rule: guaranteeRule.description
          });
        }
      });
    }

    // 3. Refund policy
    const refundRule = rules.find(r => r.category === 'refund');
    if (refundRule) {
      refundRule.forbiddenPhrases.forEach(phrase => {
        if (response.toLowerCase().includes(phrase.toLowerCase())) {
          violations.push({
            type: 'refund',
            severity: 'critical',
            message: `Violates refund policy: mentions "${phrase}"`,
            forbidden_phrase: phrase,
            rule: refundRule.description
          });
        }
      });
    }

    // 4. Tone vocabulary
    voice.vocabularyRules.avoid.forEach(phrase => {
      if (response.toLowerCase().includes(phrase.toLowerCase())) {
        violations.push({
          type: 'tone',
          severity: 'warning',
          message: `Uses forbidden phrase for "${tone}" tone: "${phrase}"`,
          forbidden_phrase: phrase,
          rule: `Tone profile "${tone}" forbids: ${voice.vocabularyRules.avoid.join(', ')}`
        });
      }
    });

    // 5. Pricing policy
    const discountViolation = this.validateDiscountPolicy(response);
    if (discountViolation) {
      violations.push(discountViolation);
    }

    const billingViolation = this.validateBillingModel(response);
    if (billingViolation) {
      violations.push(billingViolation);
    }

    // 6. Service boundaries
    const serviceViolation = this.validateServiceBoundaries(response, context.serviceOfferings || []);
    if (serviceViolation) {
      violations.push(serviceViolation);
    }

    return {
      is_valid: violations.length === 0,
      violation_count: violations.length,
      critical_violations: violations.filter(v => v.severity === 'critical').length,
      warning_violations: violations.filter(v => v.severity === 'warning').length,
      violations,
      summary: this.generateSummary(violations)
    };
  }

  /**
   * Validates discount policy (max 10% without explicit approval)
   */
  private static validateDiscountPolicy(response: string): Violation | null {
    const discountPatterns = [
      /(\d{1,2})%\s*discount/i,
      /cut.*(?:price|cost|fee).*(?:by\s+)?(\d{1,2})%/i,
      /reduce.*(?:price|cost).*(?:to\s+)?(\d{1,2})%/i,
      /(\d{1,2})%\s*off/i
    ];

    for (const pattern of discountPatterns) {
      const match = response.match(pattern);
      if (match) {
        const discountPercent = parseInt(match[1]);
        if (discountPercent > 10) {
          return {
            type: 'pricing',
            severity: 'critical',
            message: `Offers ${discountPercent}% discount which exceeds 10% policy limit`,
            forbidden_phrase: `${discountPercent}% discount`,
            rule: 'Pricing policy: max 10% discount with 6-month minimum retainer'
          };
        }
      }
    }

    return null;
  }

  /**
   * Validates billing model (should prefer milestone-based, not hourly)
   */
  private static validateBillingModel(response: string): Violation | null {
    const hasHourlyLanguage = /hourly\s+(?:rate|billing|work|fee)/i.test(response);
    const hasMilestoneLanguage = /phase|milestone|stage|deliverable/i.test(response);

    if (hasHourlyLanguage && !hasMilestoneLanguage) {
      return {
        type: 'pricing',
        severity: 'warning',
        message: 'Uses hourly billing language; should suggest milestone-based pricing',
        forbidden_phrase: 'hourly rate/billing',
        rule: 'Pricing philosophy: prefer flat-rate productized milestones or monthly retainers over hourly work'
      };
    }

    return null;
  }

  /**
   * Validates service boundaries (mentions only available services)
   */
  private static validateServiceBoundaries(response: string, services: string[]): Violation | null {
    const forbiddenServices = [
      'unlimited support',
      'unlimited revisions',
      'emergency support',
      'custom one-off projects',
      '24/7 support'
    ];

    for (const forbidden of forbiddenServices) {
      if (response.toLowerCase().includes(forbidden.toLowerCase())) {
        return {
          type: 'service',
          severity: 'warning',
          message: `Mentions service not in catalog: "${forbidden}"`,
          forbidden_phrase: forbidden,
          rule: `Available services: ${services.join(', ')}`
        };
      }
    }

    return null;
  }

  /**
   * Generates human-readable summary of violations
   */
  private static generateSummary(violations: Violation[]): string {
    if (violations.length === 0) {
      return 'Response complies with all business policies.';
    }

    const criticalCount = violations.filter(v => v.severity === 'critical').length;
    const warningCount = violations.filter(v => v.severity === 'warning').length;

    let summary = '';
    if (criticalCount > 0) {
      summary += `⚠️ ${criticalCount} critical policy violation${criticalCount > 1 ? 's' : ''}. `;
    }
    if (warningCount > 0) {
      summary += `⚠️ ${warningCount} warning${warningCount > 1 ? 's' : ''} about tone/style.`;
    }

    return summary.trim();
  }
}

/**
 * Validation result type
 */
export interface ValidationResult {
  is_valid: boolean;
  violation_count: number;
  critical_violations: number;
  warning_violations: number;
  violations: Violation[];
  summary: string;
}

/**
 * Individual violation type
 */
export interface Violation {
  type: 'timeline' | 'guarantee' | 'refund' | 'tone' | 'pricing' | 'service';
  severity: 'critical' | 'warning';
  message: string;
  forbidden_phrase: string;
  rule: string;
}
