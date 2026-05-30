/**
 * ViveKit Phase 14 - Performance Optimization, Cost Intelligence & Scalability Types
 */

export type ModelChoice = 'gemini-flash' | 'gemini-pro';

export interface RoutingDecision {
  modelChosen: ModelChoice;
  rationale: string;
  complexityScore: number; // 0 - 100
  promptTokensForecast: number;
  estimatedCostUSD: number;
}

export interface TokenBudget {
  maxContextTokens: number;
  promptTokensUsed: number;
  completionTokensUsed: number;
  budgetRemaining: number;
  compressContextRatio: number; // percentage of tokens compressed
}

export interface CachingDiagnostics {
  redisCacheHitRate: number; // percentage e.g. 92.4
  inMemoryHitRate: number; // percentage
  vectorSearchLatencyMs: number;
  embeddingCacheSavingsUSD: number;
}

export interface CircuitBreakerStatus {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime?: string;
  recoveryAttempts: number;
}

export interface CostBreakdown {
  totalTokensUsed: number;
  totalCostUSD: number;
  avgCostPerGenerationUSD: number;
  modelCostShare: {
    'gemini-flash': number; // percentage of requests
    'gemini-pro': number; // percentage of requests
  };
  optimizationsSavedUSD: number;
}

export interface OptimizationRecommendation {
  id: string;
  category: 'token_compression' | 'model_routing' | 'caching' | 'vector_indexing';
  title: string;
  description: string;
  estimatedSavingsUSD: number;
  impactScore: 'high' | 'medium' | 'low';
}

export interface OptimizationDashboardPayload {
  routing: RoutingDecision;
  tokenBudget: TokenBudget;
  caching: CachingDiagnostics;
  circuitBreaker: CircuitBreakerStatus;
  costs: CostBreakdown;
  recommendations: OptimizationRecommendation[];
}
