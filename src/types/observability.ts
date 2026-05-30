/**
 * ViveKit Phase 12 - Analytics, Observability & AI Performance Types
 */

export interface AIQualityMetrics {
  generationLatencyAvg: number; // in milliseconds
  hallucinationFreqRatio: number; // 0.0 - 1.0 percentage
  acceptanceRatio: number; // 0.0 - 1.0 percentage
  retryRate: number; // 0.0 - 1.0 percentage
  promptAcceptanceRate: number; // percentage
  editFrequencyRatio: number; // percentage of drafts manually edited
  confidenceScoreAvg: number; // 0-100 scale
}

export interface RAGDiagnostics {
  relevanceAvg: number; // 0-100 scale
  contextQualityScore: number; // 0-100 scale
  hitRateRatio: number; // percentage
  failureRateRatio: number; // percentage
  avgRetrievalLatencyMs: number;
  contextUtilizationRatio: number; // percentage of retrieved tokens utilized
  tokenEfficiencyScore: number; // 0-100
}

export interface OutcomeMetrics {
  conversionSuccessRate: number; // percentage
  retentionRatio: number; // percentage
  negotiationYield: number; // average billing contract increase ratio
  upsellSuccessRate: number; // percentage
  pricingConsistencyScore: number; // 0-100 rating
  workflowEfficiencyHoursSaved: number;
}

export interface SystemHealthMetrics {
  apiUptimePercent: number; // e.g. 99.98
  queueBacklogCount: number;
  embeddingLatencyMs: number;
  streamingFailureRate: number; // percentage
  vectorDbLatencyMs: number;
  activeWorkersCount: number;
}

export interface ObservabilityEvent {
  id: string;
  eventType: 'generation' | 'retrieval' | 'prompt_exec' | 'approval' | 'system_status' | 'business_outcome';
  timestamp: string;
  durationMs: number;
  success: boolean;
  message: string;
  payload: Record<string, any>;
}

export interface ObservabilityDashboardPayload {
  aiQuality: AIQualityMetrics;
  ragDiagnostics: RAGDiagnostics;
  outcomes: OutcomeMetrics;
  systemHealth: SystemHealthMetrics;
  recentEvents: ObservabilityEvent[];
}
