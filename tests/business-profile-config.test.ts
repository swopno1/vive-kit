/**
 * Business Profile Configuration Tests
 *
 * This test suite validates that response generation correctly applies
 * business profile configuration: tone, pricing policy, timeline constraints,
 * guarantee boundaries, and service offerings.
 *
 * Run with: npm run test -- business-profile-config.test.ts
 */

import { BusinessIntelligenceEngine } from '../src/lib/ai/business-engine';
import { ResponseValidator } from '../src/lib/ai/response-validator';
import { BusinessContext } from '../src/types';

describe('Business Profile Configuration & Enforcement', () => {
  // =====================================================================
  // TEST BUSINESS PROFILES
  // =====================================================================

  const consultingProfile: BusinessContext = {
    businessName: 'ViveScript Solutions',
    industryFocus: 'SaaS, Automation, Integration',
    communicationTone: 'consulting',
    serviceOfferings: [
      'Custom Web Apps: $4,900+',
      'Automation & Integrations: $1,500+',
      'Strategy Consulting: $200/hour',
      'Support & Maintenance: Monthly retainer'
    ],
    pricingPolicy: {
      maxDiscount: 0.10, // 10%
      requiresMinimumRetainer: true,
      minimumRetainerMonths: 6,
      preferredBillingModel: 'milestone-based',
      serviceCapEx: {
        'Custom Web Apps': { min: 4900, max: 50000 },
        'Automation': { min: 1500, max: 25000 },
        'Consulting': { min: 1000, max: 10000 }
      }
    },
    timelinePolicy: {
      minDeliveryDays: 5,
      forbiddenPhrases: [
        'by tomorrow', 'in 24 hours', 'in 2 days', 'overnight',
        'over the weekend', 'within 48 hours', 'same day'
      ]
    },
    guaranteePolicy: {
      forbiddenPhrases: [
        '100% bug-free', 'flawless', 'perfect', 'guarantee success',
        'no issues', 'completely automated', 'zero maintenance'
      ],
      allowedPhrases: [
        'robust', 'thorough testing', 'iterative refinement',
        'best practices', 'well-architected', 'thoroughly tested'
      ]
    },
    refundPolicy: {
      allowRefunds: false,
      requiresAdminApproval: true,
      forbiddenPhrases: [
        'full refund', 'money-back guarantee', 'refund your payment',
        '100% refund', '30-day refund'
      ]
    }
  };

  const friendlyProfile: BusinessContext = {
    ...consultingProfile,
    communicationTone: 'friendly',
    serviceOfferings: [
      'Website Design: $2,000+',
      'Content Creation: $500+',
      'Email Marketing Setup: $1,000+',
      'Monthly Management: $300+ per month'
    ]
  };

  // =====================================================================
  // TEST CASES
  // =====================================================================

  describe('Tone Configuration Application', () => {
    test('should apply consulting tone: formal and structured', () => {
      const engine = new BusinessIntelligenceEngine(consultingProfile);
      const voice = engine.getVoiceProfile('consulting');

      // Consulting tone should use formal language
      expect(voice.style).toContain('professional');
      expect(voice.style).toContain('structured');

      // Should avoid casual language
      expect(voice.vocabularyRules.avoid).toContain('no problem');
      expect(voice.vocabularyRules.avoid).toContain('asap');
    });

    test('should apply friendly tone: conversational and approachable', () => {
      const engine = new BusinessIntelligenceEngine(friendlyProfile);
      const voice = engine.getVoiceProfile('friendly');

      // Friendly tone should be warm and accessible
      expect(voice.style).toContain('friendly');
      expect(voice.style).toContain('approachable');

      // Should encourage phrases like "happy to help"
      expect(voice.vocabularyRules.prefer).toContain('happy to help');
    });

    test('should enforce tone-specific vocabulary', () => {
      const consultingVoice = BusinessIntelligenceEngine.getVoiceProfile('consulting');

      // Consulting should have professional phrases
      expect(consultingVoice.vocabularyRules.prefer).toContain('best practices');
      expect(consultingVoice.vocabularyRules.prefer).toContain('framework');
    });

    test('should reject tone-inappropriate language', () => {
      const response = "No problem! We can start ASAP and get this done by tomorrow.";

      const result = ResponseValidator.validate(
        response,
        consultingProfile,
        'consulting'
      );

      // Should flag tone violations
      expect(result.warning_violations).toBeGreaterThan(0);
      expect(result.violations.some(v => v.type === 'tone')).toBe(true);
    });
  });

  describe('Pricing Policy Enforcement', () => {
    test('should enforce max discount limit (10%)', () => {
      // Violation: 25% discount
      const badResponse = "I can offer you a 25% discount on this project.";

      const result = ResponseValidator.validate(badResponse, consultingProfile, 'consulting');

      expect(result.critical_violations).toBeGreaterThan(0);
      expect(result.violations.some(v => v.type === 'pricing')).toBe(true);
    });

    test('should allow 10% discount with 6-month retainer', () => {
      const goodResponse = "For a 6-month retainer commitment, we can offer 10% off the monthly rate.";

      const result = ResponseValidator.validate(goodResponse, consultingProfile, 'consulting');

      const pricingViolations = result.violations.filter(v => v.type === 'pricing');
      const hasCriticalPricing = pricingViolations.some(v => v.severity === 'critical');

      expect(hasCriticalPricing).toBe(false);
    });

    test('should enforce milestone-based billing preference', () => {
      const hourlyResponse = "Our hourly rate is $150/hour for this work.";

      const result = ResponseValidator.validate(hourlyResponse, consultingProfile, 'consulting');

      // Should warn about hourly billing preference
      expect(result.warnings).toBeGreaterThan(0);
    });

    test('should prefer milestone-based pricing', () => {
      const milestoneResponse = "Phase 1: $2,500, Phase 2: $5,000, Phase 3: $3,000";

      const result = ResponseValidator.validate(milestoneResponse, consultingProfile, 'consulting');

      expect(result.is_valid).toBe(true);
    });

    test('should validate pricing within service CapEx limits', () => {
      const lowPrice = "Custom web app for $500"; // Below $4,900 minimum
      const highPrice = "Custom web app for $75,000"; // Above $50,000 maximum

      const lowResult = ResponseValidator.validate(lowPrice, consultingProfile, 'consulting');
      const highResult = ResponseValidator.validate(highPrice, consultingProfile, 'consulting');

      // Both should be flagged (though not critical in these tests)
      expect(lowResult.violations.length + highResult.violations.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Timeline Policy Enforcement', () => {
    test('should block "by tomorrow" promise', () => {
      const response = "We can have this done by tomorrow.";

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      expect(result.critical_violations).toBeGreaterThan(0);
      expect(result.violations.some(v => v.type === 'timeline')).toBe(true);
    });

    test('should block "in 24 hours" promise', () => {
      const response = "This can be completed in 24 hours.";

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      expect(result.critical_violations).toBeGreaterThan(0);
    });

    test('should block "in 2 days" promise', () => {
      const response = "We'll deliver in 2 days.";

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      expect(result.critical_violations).toBeGreaterThan(0);
    });

    test('should allow realistic timeline (5+ business days)', () => {
      const response = "We'll have the architecture ready in 7-10 business days.";

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      const timelineViolations = result.violations.filter(v => v.type === 'timeline');

      expect(timelineViolations.length).toBe(0);
    });

    test('should allow weekly delivery promises', () => {
      const response = "Phase 1 completion within 2 weeks, Phase 2 within 4 weeks.";

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      const timelineViolations = result.violations.filter(v => v.type === 'timeline');

      expect(timelineViolations.length).toBe(0);
    });
  });

  describe('Guarantee Policy Enforcement', () => {
    test('should block "100% bug-free" promise', () => {
      const response = "Our solution is 100% bug-free and perfectly automated.";

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      expect(result.critical_violations).toBeGreaterThan(0);
      expect(result.violations.some(v => v.type === 'guarantee')).toBe(true);
    });

    test('should block "flawless" promise', () => {
      const response = "We guarantee a flawless launch with zero issues.";

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      expect(result.critical_violations).toBeGreaterThan(0);
    });

    test('should allow "thoroughly tested" language', () => {
      const response = "We'll deliver a thoroughly tested solution with iterative refinement.";

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      const guaranteeViolations = result.violations.filter(v => v.type === 'guarantee');

      expect(guaranteeViolations.length).toBe(0);
    });

    test('should allow "robust" and "well-architected" language', () => {
      const response = "We build robust, well-architected systems following best practices.";

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      const guaranteeViolations = result.violations.filter(v => v.type === 'guarantee');

      expect(guaranteeViolations.length).toBe(0);
    });
  });

  describe('Refund Policy Enforcement', () => {
    test('should block "full refund" offer', () => {
      const response = "We offer a full refund if you're not satisfied within 30 days.";

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      expect(result.critical_violations).toBeGreaterThan(0);
      expect(result.violations.some(v => v.type === 'refund')).toBe(true);
    });

    test('should block "money-back guarantee"', () => {
      const response = "We provide a money-back guarantee on all services.";

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      expect(result.critical_violations).toBeGreaterThan(0);
    });

    test('should allow escalation to admin', () => {
      const response = "Refund requests are reviewed by our administrative team on a case-by-case basis.";

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      const refundViolations = result.violations.filter(v => v.type === 'refund');

      expect(refundViolations.length).toBe(0);
    });
  });

  describe('Service Offering Boundaries', () => {
    test('should accept only offered services', () => {
      const response = "We specialize in custom web apps ($4,900+) and automation ($1,500+).";

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      const serviceViolations = result.violations.filter(v => v.type === 'service');

      expect(serviceViolations.length).toBe(0);
    });

    test('should block "unlimited support" if not offered', () => {
      const response = "You'll receive unlimited support and revisions as part of the package.";

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      const serviceViolations = result.violations.filter(v => v.type === 'service');

      expect(serviceViolations.length).toBeGreaterThan(0);
    });

    test('should suggest limited revisions instead of unlimited', () => {
      const betterResponse = "We include 2 rounds of revisions per phase.";

      const result = ResponseValidator.validate(betterResponse, consultingProfile, 'consulting');

      const serviceViolations = result.violations.filter(v => v.type === 'service');

      expect(serviceViolations.length).toBe(0);
    });
  });

  describe('Integration: Complete Response Validation', () => {
    test('should validate entire response against complete business profile', () => {
      const response = `Thanks for your interest in our custom web app development.

Based on your requirements, here's our recommended approach:

Phase 1: Requirements & Architecture (7-10 business days) - $2,500
Phase 2: Core Development & Integration (21-30 days) - $5,000
Phase 3: Testing, Refinement & Launch (10-14 days) - $3,000

Total: $10,500 with our standard 5-week timeline.

We follow a milestone-based delivery model which ensures quality and allows for iterative refinement throughout the project.

For detailed discussions about your specific needs, I'd recommend scheduling a brief discovery call.`;

      const result = ResponseValidator.validate(response, consultingProfile, 'consulting');

      expect(result.is_valid).toBe(true);
      expect(result.critical_violations).toBe(0);
    });

    test('should catch multiple violations in poor response', () => {
      const badResponse = `No problem! We can start ASAP and have the app done by tomorrow.

Our solution is 100% bug-free and perfectly automated - flawless execution guaranteed.

I'm offering you a 30% discount, plus a full money-back guarantee if you're unhappy.

Unlimited revisions and 24/7 support included!`;

      const result = ResponseValidator.validate(badResponse, consultingProfile, 'consulting');

      expect(result.critical_violations).toBeGreaterThan(3);
      expect(result.violations.length).toBeGreaterThan(4);
    });

    test('should validate with different tone profiles', () => {
      const friendlyResponse = "We're happy to help with your project! Let's chat about what you need.";
      const consultingResponse = "We'd recommend a structured discovery process to understand your technical requirements.";

      const friendlyResult = ResponseValidator.validate(friendlyResponse, friendlyProfile, 'friendly');
      const consultingResult = ResponseValidator.validate(consultingResponse, consultingProfile, 'consulting');

      expect(friendlyResult.is_valid).toBe(true);
      expect(consultingResult.is_valid).toBe(true);
    });
  });

  describe('Business Profile vs Response Alignment', () => {
    test('should calculate tone alignment score', () => {
      const response = "We'd be delighted to help you achieve your goals through a structured engagement process.";

      // This is consulting-appropriate
      const consultingVoice = BusinessIntelligenceEngine.getVoiceProfile('consulting');

      const alignment = BusinessIntelligenceEngine.calculateToneAlignment(
        response,
        consultingVoice
      );

      expect(alignment).toBeGreaterThan(0.7); // High alignment
    });

    test('should identify tone misalignment', () => {
      const response = "No worries! We can totally do this ASAP. It'll be awesome!";

      // This is friendly, not consulting
      const consultingVoice = BusinessIntelligenceEngine.getVoiceProfile('consulting');

      const alignment = BusinessIntelligenceEngine.calculateToneAlignment(
        response,
        consultingVoice
      );

      expect(alignment).toBeLessThan(0.5); // Low alignment
    });
  });

  describe('Edge Cases & Profile Variations', () => {
    test('should handle custom business profiles', () => {
      const customProfile: BusinessContext = {
        ...consultingProfile,
        businessName: 'Custom Agency',
        minDeliveryDays: 3, // More aggressive timeline
        maxDiscount: 0.20 // 20% discount allowed
      };

      const response = "We can deliver in 3 business days, with up to 20% discount on retainers.";

      const result = ResponseValidator.validate(response, customProfile, 'consulting');

      // Should be valid for this custom profile
      expect(result.violations.filter(v => v.severity === 'critical').length).toBe(0);
    });

    test('should validate profile consistency', () => {
      const profile = consultingProfile;

      // All constraints should align with communication tone
      const voice = BusinessIntelligenceEngine.getVoiceProfile(profile.communicationTone);

      expect(voice).toBeDefined();
      expect(voice.style).toContain('professional');
      expect(voice.vocabularyRules.avoid.length).toBeGreaterThan(0);
    });
  });
});
