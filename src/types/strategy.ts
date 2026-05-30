/**
 * ViveKit Phase 10 - Multi-Reply Strategy & Decision Intelligence Types
 */

export type CRMStrategyCategory = 
  | 'relationship_focused' 
  | 'profit_protective' 
  | 'premium_positioning' 
  | 'concise_operational' 
  | 'strict_boundary';

export interface OutcomePrediction {
  conversionProbability: number; // 0-100
  retentionLikelihood: number; // 0-100
  escalationRisk: 'low' | 'medium' | 'high';
  clientSatisfactionImpact: number; // 0-100
  upsellPotential: 'low' | 'medium' | 'high';
  negotiationSuccessProb: number; // 0-100
  timelineRisk: 'low' | 'medium' | 'high';
  confidenceScore: number; // 0-100
}

export interface StrategicTradeoffs {
  strategicObjective: string;
  communicationStyle: string;
  negotiationPosture: string;
  emotionalImpact: string;
  tradeoffsExplanation: string;
  potentialRisks: string;
}

export interface ReplyStrategy {
  id: string;
  category: CRMStrategyCategory;
  name: string;
  draftText: string;
  prediction: OutcomePrediction;
  tradeoffs: StrategicTradeoffs;
  recommended: boolean;
}

export interface StrategyDashboardPayload {
  conversationId: string;
  leverageScore: number; // 0-100
  trustIndicator: number; // 0-100
  urgencyLevel: 'low' | 'medium' | 'high';
  projectValueEst: number;
  businessPriorityMode: string; // profitability, retention, speed, satisfaction
  strategies: ReplyStrategy[];
  strategicWarning?: string;
}
