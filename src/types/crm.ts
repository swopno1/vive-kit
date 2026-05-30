/**
 * ViveKit CRM Brain - Phase 9 TypeScript Interfaces
 */

export type CRMClientLifecycleStage = 'lead' | 'prospect' | 'active' | 'inactive' | 'churned';

export type CRMClientSegmentation = 
  | 'premium' 
  | 'high_maintenance' 
  | 'growth_opportunity' 
  | 'budget_sensitive' 
  | 'enterprise_prospect';

export type CRMStrategicImportance = 'low' | 'medium' | 'high' | 'vip';

export type CRMAccountStatus = 'active' | 'paused' | 'suspended';

export interface CRMClientProfile {
  id?: string;
  customerId: string;
  lifecycleStage: CRMClientLifecycleStage;
  clientSegmentation: CRMClientSegmentation;
  strategicImportance: CRMStrategicImportance;
  accountStatus: CRMAccountStatus;
  channelPreferences: string[];
  revenuePotential: number;
  lifetimeValueEst: number;
  paymentReliability: number; // 0-100 rating
  createdAt?: string;
  updatedAt?: string;
}

export type CRMNegotiationStyle = 'aggressive' | 'protective' | 'flexible' | 'standard';
export type CRMPricingSensitivity = 'low' | 'medium' | 'high' | 'extreme';
export type CRMUrgencyBehavior = 'low' | 'medium' | 'high';
export type CRMEmotionalVolatility = 'stable' | 'moderate' | 'volatile';
export type CRMTechnicalUnderstanding = 'non_technical' | 'intermediate' | 'technical';
export type CRMDecisionMakingPattern = 'fast' | 'deliberate' | 'bureaucratic';

export interface CRMClientBehavior {
  id?: string;
  customerId: string;
  negotiationStyle: CRMNegotiationStyle;
  pricingSensitivity: CRMPricingSensitivity;
  urgencyBehavior: CRMUrgencyBehavior;
  emotionalVolatility: CRMEmotionalVolatility;
  technicalDepthUnderstanding: CRMTechnicalUnderstanding;
  decisionMakingPattern: CRMDecisionMakingPattern;
  commitmentConsistency: number; // 0-100 score
  updatedAt?: string;
}

export type CRMTrajectoryTrend = 'improving' | 'stable' | 'declining';

export interface CRMRelationshipScore {
  id?: string;
  customerId: string;
  trustScore: number; // 0-100
  relationshipStrength: number; // 0-100
  trajectoryTrend: CRMTrajectoryTrend;
  churnRiskScore: number; // 0-100
  responsivenessRatio: number; // 0-100
  satisfactionIndicator: number; // 0-100
  lastEvaluatedAt?: string;
}

export type CRMEventType = 
  | 'conversation' 
  | 'project' 
  | 'negotiation' 
  | 'support' 
  | 'payment' 
  | 'milestone' 
  | 'state_change';

export interface CRMClientTimeline {
  id?: string;
  customerId: string;
  eventType: CRMEventType;
  title: string;
  description: string;
  eventDate: string;
  semanticTags: string[];
  importanceWeight: number; // 0.0 - 1.0
  payload: Record<string, any>;
  createdAt?: string;
}

export type CRMLeadStatus = 'unqualified' | 'working' | 'qualified' | 'dead';

export interface CRMLeadQualification {
  id?: string;
  customerId: string;
  budgetQualified: boolean;
  intentScore: number; // 0-100
  qualificationStatus: CRMLeadStatus;
  buyingSignals: string[];
  projectClarityNotes?: string;
  qualificationNotes?: string;
  aiScoringDetails: Record<string, any>;
  updatedAt?: string;
}

export type CRMMemoryCategory = 'preferences' | 'frustrations' | 'goals' | 'objection_history' | 'trust_moments';

export interface CRMClientMemory {
  id?: string;
  customerId: string;
  category: CRMMemoryCategory;
  content: string;
  relevanceWeight: number; // 0.0 - 1.0
  lastTriggeredAt?: string;
  createdAt?: string;
}

export interface CRMClientStrategyRecommendation {
  negotiationApproach: string;
  communicationToneAdvice: string;
  upsellTiming: string;
  followUpStrategy: string;
  retentionTactics: string;
  escalationRules: string;
  riskMitigationPlan: string;
}
