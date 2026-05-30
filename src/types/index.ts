import { ConversationIntelligence } from '../lib/ai/intelligence/schemas';

export type { ConversationIntelligence };

export type TonePreference =
  | 'professional'
  | 'casual'
  | 'empathetic'
  | 'urgent'
  | 'strategic'
  | 'friendly'
  | 'technical'
  | 'sales-focused'
  | 'strict'
  | 'concise'
  | 'premium';

export interface BusinessContext {
  id?: string;
  businessName: string;
  industry?: string;
  websiteUrl?: string;
  pricingInstructions: string;
  generalContext: string;
  tonePreference: TonePreference;

  // Expanded fields for Phase 4
  pricingPhilosophy?: string;
  negotiationStrategy?: string;
  deliveryProcess?: string;
  boundaries?: string;
  serviceOfferings?: string[];

  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerProfile {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  relationshipNotes?: string;
  createdAt?: string;
}

export interface Conversation {
  id?: string;
  customerId?: string;
  externalConversationId?: string;
  channel: 'email' | 'chat' | 'sms' | 'whatsapp' | 'discord' | 'slack' | 'brief' | 'meeting' | 'support';
  rawHistory: string;
  createdAt?: string;
}

export interface VectorMemory {
  id?: string;
  content: string;
  embedding?: number[];
  metadata: {
    source?: string;
    category?: string;
    [key: string]: unknown;
  };
  customer_id?: string;
  importance_score?: number;
  category?: string;
  created_at?: string;
}

export interface SuggestedReply {
  id?: string;
  conversationId?: string;
  promptUsed: string;
  generatedReply: string;
  editedReply?: string;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerationConfig {
  rawConversation: string;
  additionalInstructions?: string;
  businessContext?: BusinessContext;
  memorySnippets?: string[];
  customerContext?: CustomerProfile;
  selectedTone: TonePreference;
}

/**
 * PHASE 5: Conversation Intelligence Types
 */

export interface IntelligenceResult {
  id: string;
  conversationId: string;
  analysis: any;
  riskScore: number;
  leadQuality: number;
  createdAt: string;
}

export type ParsingFormat = 'email' | 'whatsapp' | 'discord' | 'slack' | 'brief' | 'meeting' | 'support' | 'raw';

export interface IntelligenceRequestConfig {
  rawConversation: string;
  format?: ParsingFormat;
  businessContext?: any;
  customerContext?: any;
  instructions?: string;
}

// Re-export memory types
export * from './memory';
export * from './business';
export * from './crm';
export * from './strategy';
export * from './approval';
export * from './observability';
export * from './workspace';
export * from './performance';
export * from './security';
