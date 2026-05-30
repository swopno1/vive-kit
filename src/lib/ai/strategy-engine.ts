import { 
  StrategyDashboardPayload, 
  ReplyStrategy, 
  OutcomePrediction, 
  StrategicTradeoffs,
  CRMStrategyCategory
} from '../../types/strategy';

/**
 * ViveKit Phase 10 - Multi-Reply Strategy & Decision Intelligence Engine
 */
export class StrategyEngine {

  /**
   * Orchestrates dynamic generation of multi-strategy responses.
   * Leverages client relationship metrics and business priority sliders to adapt suggestions.
   */
  public static generateMultiReplies(
    rawConversation: string,
    businessPriority: string = 'profitability',
    clientContext?: any
  ): StrategyDashboardPayload {
    
    // Leverage & trust assessments
    const leverageScore = clientContext?.scores?.trustScore ? Math.round(100 - clientContext.scores.churnRiskScore) : 75;
    const trustIndicator = clientContext?.scores?.trustScore || 80;
    const urgencyLevel = rawConversation.toLowerCase().includes('tomorrow') || rawConversation.toLowerCase().includes('urgent') ? 'high' : 'medium';
    const projectValue = clientContext?.profile?.revenuePotential || 25000;

    // Clean up base reply for draft creation
    const baseReply = rawConversation || "Thank you for reaching out. We look forward to collaborating.";

    // A. Generate Strategy 1: Relationship-Focused
    const relDraftText = baseReply.toLowerCase().includes("value our partnership")
      ? baseReply
      : `Thank you for sharing your feedback. We value our partnership deeply and want to make sure your systems are perfectly stable.\n\n${baseReply}`;

    const relStrategy: ReplyStrategy = {
      id: 'strat-rel',
      category: 'relationship_focused',
      name: 'Relationship-Focused',
      draftText: relDraftText,
      prediction: {
        conversionProbability: 92,
        retentionLikelihood: 95,
        escalationRisk: 'low',
        clientSatisfactionImpact: 90,
        upsellPotential: 'medium',
        negotiationSuccessProb: 75,
        timelineRisk: 'medium',
        confidenceScore: 94
      },
      tradeoffs: {
        strategicObjective: "Maximize account goodwill, prevent churn, and build trust-building moments.",
        communicationStyle: "Warm, empathetic, highly collaborative.",
        negotiationPosture: "Flexible and cooperative. Defends margins by adjusting sequence timelines rather than reducing rates.",
        emotionalImpact: "Highly reassuring. Diffuses customer frustration.",
        tradeoffsExplanation: "Increases timeline pressure on the delivery team but strongly guarantees retention.",
        potentialRisks: "May invite client scope creep if boundaries are not strictly monitored in follow-up calls."
      },
      recommended: businessPriority === 'retention' || businessPriority === 'satisfaction'
    };

    // B. Generate Strategy 2: Profit-Protective
    const profitDraftText = baseReply.includes("$")
      ? baseReply
      : `${baseReply}\n\nTo maintain our delivery quality and high test coverage, our custom development milestones start from a flat rate of $4,900. We protect our engineering margins to deliver high-quality code.`;

    const profitStrategy: ReplyStrategy = {
      id: 'strat-profit',
      category: 'profit_protective',
      name: 'Profit-Protective',
      draftText: profitDraftText,
      prediction: {
        conversionProbability: 74,
        retentionLikelihood: 80,
        escalationRisk: 'medium',
        clientSatisfactionImpact: 70,
        upsellPotential: 'low',
        negotiationSuccessProb: 88,
        timelineRisk: 'low',
        confidenceScore: 90
      },
      tradeoffs: {
        strategicObjective: "Protect cash flow margins and defend pricing retainer integrity.",
        communicationStyle: "Assertive, professional, precise.",
        negotiationPosture: "Firm and protective. Explicitly rejects discounts while offering modular scope options.",
        emotionalImpact: "Neutral and professional. Signals mature, business-grade operations.",
        tradeoffsExplanation: "Guarantees high-yield revenue and team delivery margins. May cause temporary friction.",
        potentialRisks: "Slight risk of short-term satisfaction drops if the client is highly budget-sensitive."
      },
      recommended: businessPriority === 'profitability' || businessPriority === 'growth'
    };

    // C. Generate Strategy 3: Premium Positioning
    const premiumDraftText = baseReply.toLowerCase().includes("premium")
      ? baseReply
      : `For tight timelines like this, we recommend upgrading to our premium VIP track ($14,500/mo) for dedicated support and architecture reviews:\n\n${baseReply}`;

    const premiumStrategy: ReplyStrategy = {
      id: 'strat-premium',
      category: 'premium_positioning',
      name: 'Premium Positioning',
      draftText: premiumDraftText,
      prediction: {
        conversionProbability: 55,
        retentionLikelihood: 85,
        escalationRisk: 'low',
        clientSatisfactionImpact: 95,
        upsellPotential: 'high',
        negotiationSuccessProb: 65,
        timelineRisk: 'low',
        confidenceScore: 88
      },
      tradeoffs: {
        strategicObjective: "Upsell account value, establish authority, and unlock VVIP developer resources.",
        communicationStyle: "Executive-grade, authoritative, premium.",
        negotiationPosture: "Value-assertive. Positions tight timelines as premium deliverables.",
        emotionalImpact: "Inspires confidence and signals elite expertise.",
        tradeoffsExplanation: "Drastically increases average contract value (ACV) and builds long-term authority. Lower immediate conversion rate.",
        potentialRisks: "Unsuitable if client has zero budget availability."
      },
      recommended: businessPriority === 'premium'
    };

    // Setup fallback recommended strategy if none matched
    const strategies = [relStrategy, profitStrategy, premiumStrategy];
    const hasRecommendation = strategies.some(s => s.recommended);
    if (!hasRecommendation) {
      profitStrategy.recommended = true; // Default to profit-protective
    }

    const strategicWarning = urgencyLevel === 'high' 
      ? "⚠ High Urgency Warning: Client has tight launch schedules. Avoid making concrete delivery date promises before engineering review."
      : undefined;

    return {
      conversationId: crypto.randomUUID(),
      leverageScore,
      trustIndicator,
      urgencyLevel,
      projectValueEst: projectValue,
      businessPriorityMode: businessPriority,
      strategies,
      strategicWarning
    };
  }
}
