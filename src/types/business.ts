export type PricingType = 'fixed' | 'hourly' | 'recurring' | 'custom';
export type RuleAction = 'block' | 'flag' | 'warn';
export type RuleCategory = 'timeline' | 'guarantees' | 'pricing' | 'refund' | 'communication';
export type BrandVoiceTone = 'professional' | 'executive' | 'consulting' | 'friendly' | 'specialist';
export type FormalityLevel = 'high' | 'medium' | 'casual';
export type EmotionalCalibration = 'enthusiastic' | 'empathetic' | 'reserved' | 'strict' | 'balanced';
export type TechnicalDepth = 'conceptual' | 'intermediate' | 'deep_specialist';
export type PersuasionStyle = 'direct' | 'soft_sell' | 'educational' | 'consultative';
export type PlaybookScenario = 'pricing_objection' | 'scope_creep' | 'refund_request' | 'difficult_client' | 'upsell';
export type KnowledgeCategory = 'onboarding' | 'FAQs' | 'policies' | 'delivery_workflows' | 'capabilities';
export type GovernanceRiskCategory = 'low' | 'medium' | 'high' | 'critical';
export type BusinessMemoryCategory = 'negotiation_patterns' | 'common_objections' | 'retention_insights' | 'delivery_bottlenecks';

export interface ServiceProfile {
  id?: string;
  businessContextId: string;
  name: string;
  description: string;
  priceMin: number;
  priceMax?: number;
  pricingType: PricingType;
  durationDays?: number;
  deliverables: string[];
  revisionPolicy?: string;
  scopeBoundaries?: string;
  upsellOpportunities?: string;
  supportPolicy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OperationalRule {
  id?: string;
  businessContextId: string;
  category: RuleCategory;
  ruleTrigger: string; // unique keyword identifying trigger event (e.g. deliver_under_5_days)
  ruleAction: RuleAction;
  forbiddenPhrases: string[];
  description: string;
  isActive: boolean;
  createdAt?: string;
}

export interface CommunicationProfile {
  id?: string;
  businessContextId: string;
  toneStyle: BrandVoiceTone;
  formalityLevel: FormalityLevel;
  emotionalCalibration: EmotionalCalibration;
  technicalDepth: TechnicalDepth;
  persuasionStyle: PersuasionStyle;
  vocabularyRules: {
    allow: string[];
    avoid: string[];
  };
  createdAt?: string;
}

export interface DecisionPlaybook {
  id?: string;
  businessContextId: string;
  scenarioType: PlaybookScenario;
  objectionTriggers: string[];
  actionFramework: string; // The step-by-step strategy for the AI to recommend
  negotiationBoundary?: number; // e.g. 0.15 represents max 15% discount
  escalationTriggers: string[];
  createdAt?: string;
}

export interface KnowledgeBaseArticle {
  id?: string;
  businessContextId: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ResponseGovernanceLog {
  id?: string;
  conversationId?: string;
  suggestedReplyId?: string;
  riskScore: number;
  riskCategory: GovernanceRiskCategory;
  violationDetails: Array<{
    ruleId: string;
    category: string;
    description: string;
    actionTriggered: RuleAction;
    detectedPhrases?: string[];
  }>;
  isApproved: boolean;
  escalatedTo?: string;
  createdAt?: string;
}

export interface BusinessMemory {
  id?: string;
  businessContextId: string;
  keyLearning: string;
  category: BusinessMemoryCategory;
  importanceScore: number;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export interface BusinessAnalyticsEvent {
  id?: string;
  businessContextId: string;
  eventType: string; // objection_logged | negotiation_success | conversion_pattern | support_escalation
  payload: Record<string, any>;
  createdAt?: string;
}
