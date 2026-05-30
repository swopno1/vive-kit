import { z } from 'zod';
import { BusinessContext, CustomerProfile, TonePreference } from '../../types';

export type AIModelType = 'gemini-2.0-flash' | 'gemini-2.0-pro' | 'gpt-4o' | 'claude-3-5-sonnet';

export interface ModelMetadata {
  id: AIModelType;
  provider: 'google' | 'openai' | 'anthropic';
  name: string;
  description: string;
  contextWindow: number;
  maxOutputTokens: number;
  costPer1kInput: number;
  costPer1kOutput: number;
}

export interface AIResponse<T = unknown> {
  content: string;
  data?: T;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
  };
  model: AIModelType;
}

export interface ProviderOptions {
  model: AIModelType;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface GenerationRequest {
  messages: any[];
  options?: ProviderOptions;
  systemPrompt?: string;
  schema?: z.ZodType<unknown>;
}

export interface AIProvider {
  name: string;
  generate(request: GenerationRequest): Promise<AIResponse>;
  stream(request: GenerationRequest): Promise<ReadableStream>;
}

export interface RoutingDecision {
  model: AIModelType;
  reason: string;
}

export interface AIServiceLayer {
  generate(config: AIRequestConfig): Promise<AIResponse>;
  stream(config: AIRequestConfig): Promise<ReadableStream>;
}

export type OutputStyle = 'concise' | 'detailed' | 'markdown' | 'email' | 'whatsapp' | 'proposal' | 'follow-up';
export type NegotiationMode = 'standard' | 'aggressive' | 'flexible' | 'premium' | 'protective';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AIRequestConfig {
  task: 'reply' | 'summarize' | 'classify' | 'analyze' | 'extract' | 'negotiate';
  rawConversation: string;
  additionalInstructions?: string;
  businessContext?: BusinessContext;
  customerContext?: CustomerProfile;
  selectedTone?: TonePreference;
  memorySnippets?: string[];
  complexity?: 'low' | 'high';

  // Phase 4 additions
  outputStyle?: OutputStyle;
  negotiationMode?: NegotiationMode;
  riskLevel?: RiskLevel;
  promptVersion?: string;
}

export interface AILogEntry {
  timestamp: string;
  requestId: string;
  model: AIModelType;
  task: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  status: 'success' | 'error';
  error?: string;
  metadata?: {
    promptVersion?: string;
    riskLevel?: RiskLevel;
    [key: string]: unknown;
  };
}

export interface PromptModule {
  id: string;
  name: string;
  version: string;
  description: string;
  content: (config: AIRequestConfig) => string;
  priority: number;
}

export interface PromptRegistry {
  [id: string]: PromptModule;
}

export interface ContextIntelligence {
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated';
  urgency: 'low' | 'medium' | 'high';
  leadQuality: number; // 0-100
  objections: string[];
  suggestedStrategy: string;
}
