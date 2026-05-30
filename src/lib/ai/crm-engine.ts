import {
  CRMClientBehavior,
  CRMRelationshipScore,
  CRMClientProfile,
  CRMClientStrategyRecommendation,
} from '../../types/crm';

export class CRMBrainEngine {
  public static calculateDynamicScores(
    behavior: CRMClientBehavior,
    profile: CRMClientProfile
  ): CRMRelationshipScore {
    let trustScore = 75;
    let relationshipStrength = 70;
    let churnRiskScore = 15;
    const responsivenessRatio = 90;
    let satisfactionIndicator = 80;

    if (behavior.emotionalVolatility === 'volatile') {
      trustScore -= 15; satisfactionIndicator -= 20; churnRiskScore += 35;
    } else if (behavior.emotionalVolatility === 'moderate') {
      trustScore -= 5; churnRiskScore += 10;
    }

    if (behavior.negotiationStyle === 'aggressive') {
      relationshipStrength -= 15; churnRiskScore += 15;
    } else if (behavior.negotiationStyle === 'flexible') {
      relationshipStrength += 10;
    }

    const diff = 100 - behavior.commitmentConsistency;
    trustScore -= diff * 0.4;
    satisfactionIndicator -= diff * 0.3;
    churnRiskScore += diff * 0.5;

    const payDiff = 100 - profile.paymentReliability;
    churnRiskScore += payDiff * 0.8;
    trustScore -= payDiff * 0.3;

    let trajectoryTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (churnRiskScore > 45) trajectoryTrend = 'declining';
    else if (trustScore > 80 && satisfactionIndicator > 85) trajectoryTrend = 'improving';

    return {
      customerId: behavior.customerId,
      trustScore: Math.max(0, Math.min(100, Math.round(trustScore))),
      relationshipStrength: Math.max(0, Math.min(100, Math.round(relationshipStrength))),
      trajectoryTrend,
      churnRiskScore: Math.max(0, Math.min(100, Math.round(churnRiskScore))),
      responsivenessRatio: Math.max(0, Math.min(100, Math.round(responsivenessRatio))),
      satisfactionIndicator: Math.max(0, Math.min(100, Math.round(satisfactionIndicator))),
    };
  }

  public static getStrategicRecommendation(
    behavior: CRMClientBehavior,
    scores: CRMRelationshipScore,
    profile: CRMClientProfile
  ): CRMClientStrategyRecommendation {
    const isRisky = scores.churnRiskScore > 40 || behavior.emotionalVolatility === 'volatile';
    const isPremium = profile.clientSegmentation === 'premium' || profile.strategicImportance === 'vip';
    const isBudgetSens = profile.clientSegmentation === 'budget_sensitive';

    return {
      negotiationApproach: isPremium
        ? 'Defend high margins with value-based SLA commits. Emphasize exclusive custom resources and dedicated dev pipelines.'
        : isBudgetSens
        ? 'Steer toward flat-rate productized offers. Lock scope tightly. Reject custom adapters.'
        : 'Consultative and cooperative pricing alignment. Emphasize standard recurring retainers.',

      communicationToneAdvice: isPremium
        ? 'Formality level: 85%+. Technical, specialized language. Address using detailed status briefs.'
        : isRisky
        ? 'Highly empathetic, reassuring, and calm. Clear milestone checklists; avoid developer buzzwords.'
        : 'Consultative, responsive, professional but collaborative.',

      upsellTiming: isRisky
        ? 'BLOCKED. Priority is account stabilization and trust rebuild. Postpone sales discussions for 60 days.'
        : isPremium && scores.satisfactionIndicator > 80
        ? 'HIGH OPPORTUNITY. Pitch dedicated enterprise expansion in next review session.'
        : 'Warm. Pitch retainer extensions during standard sprint hand-offs.',

      followUpStrategy: isRisky
        ? 'High frequency. Daily touchpoints. Progress updates every 24 hours.'
        : 'Weekly status round-ups with milestone delivery logs.',

      retentionTactics: isRisky
        ? 'Execute emergency SLA review. Schedule VIP developer session to resolve pending frustrations.'
        : 'Proactively deliver bonus optimizations to maintain high goodwill.',

      escalationRules: isRisky
        ? 'Escalate instantly to VIP Operations Lead on any dissatisfaction. SLA response: <30 minutes.'
        : 'Standard support routing. SLA response: <4 hours.',

      riskMitigationPlan: isRisky
        ? 'Identify exact objection logs and resolve with flat-rate concessions rather than fee discounts.'
        : 'Review monthly retainer alignment to maintain stable communication path.',
    };
  }
}
