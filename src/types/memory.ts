import { ConversationIntelligence } from '../lib/ai/intelligence/schemas';

export type MemoryCategory =
  | 'client_preference'
  | 'pricing_discussion'
  | 'project_requirement'
  | 'negotiation_outcome'
  | 'communication_pattern'
  | 'emotional_signal'
  | 'technical_preference'
  | 'business_risk'
  | 'trust_indicator'
  | 'general';

export interface MemoryObject {
  id?: string;
  content: string;
  embedding?: number[];
  importanceScore: number;
  category: MemoryCategory;
  customerId?: string;
  metadata: {
    sourceConversationId?: string;
    timestamp: string;
    relevanceTags: string[];
    originalText?: string;
    [key: string]: any;
  };
  lastAccessedAt?: string;
  createdAt?: string;
}

export interface ClientIntelligenceProfile {
  id?: string;
  customerId: string;
  trustScore: number;
  communicationStyle: string;
  pricingSensitivity: 'low' | 'medium' | 'high' | 'extreme';
  relationshipStrength: number;
  responsivenessPattern: string;
  negotiationStyle: string;
  paymentBehavior: string;
  projectHistorySummary: string;
  intelligenceData: Partial<ConversationIntelligence>;
  lastUpdatedAt: string;
  createdAt: string;
}

export interface RetrievalResult extends MemoryObject {
  similarity: number;
  weightedScore: number;
}

export interface RetrievalContext {
  memories: RetrievalResult[];
  profile?: ClientIntelligenceProfile;
  summary: string;
}

export interface EmbeddingJob {
  id: string;
  text: string;
  metadata: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
