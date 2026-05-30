import { z } from 'zod';

// --- Conversation Parsing & Segmentation ---

export const MessageRoleSchema = z.enum(['user', 'client', 'system', 'assistant']);

export const ParsedMessageSchema = z.object({
  id: z.string().optional(),
  role: MessageRoleSchema,
  speakerName: z.string().optional(),
  content: z.string(),
  timestamp: z.string().optional(), // Normalized ISO string
  metadata: z.record(z.string(), z.any()).optional(),
});

export const ParsedConversationSchema = z.object({
  messages: z.array(ParsedMessageSchema),
  participants: z.array(z.object({
    name: z.string(),
    role: MessageRoleSchema,
  })),
  channel: z.enum(['email', 'whatsapp', 'discord', 'slack', 'brief', 'meeting_summary', 'support', 'unknown']),
  threadId: z.string().optional(),
});

// --- Emotional Analysis ---

export const EmotionalAnalysisSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative', 'frustrated', 'delighted']),
  frustrationLevel: z.number().min(0).max(100),
  excitementLevel: z.number().min(0).max(100),
  urgencyEmotion: z.number().min(0).max(100),
  trustIndicators: z.array(z.string()),
  emotionalVolatility: z.number().min(0).max(100),
  primaryEmotion: z.string(),
});

// --- Business Intelligence ---

export const BusinessIntelligenceSchema = z.object({
  pricingSensitivity: z.enum(['low', 'medium', 'high', 'extreme']),
  budgetSignals: z.array(z.string()),
  scopeExpansionRisk: z.number().min(0).max(100),
  paymentRisk: z.number().min(0).max(100),
  upsellOpportunity: z.number().min(0).max(100),
  leadQuality: z.number().min(0).max(100),
  clientSeriousness: z.number().min(0).max(100),
  decisionPowerLevel: z.enum(['unknown', 'influencer', 'decision_maker', 'champion']),
});

// --- Communication Intelligence ---

export const CommunicationIntelligenceSchema = z.object({
  toneStyle: z.string(),
  communicationPreference: z.string(),
  responsivenessPattern: z.string(),
  negotiationBehavior: z.string(),
  technicalUnderstandingLevel: z.number().min(0).max(100),
  clarityScore: z.number().min(0).max(100),
});

// --- Project Intelligence ---

export const ProjectIntelligenceSchema = z.object({
  requestedDeliverables: z.array(z.string()),
  timelineExpectations: z.string(),
  deadlinePressure: z.number().min(0).max(100),
  projectComplexity: z.enum(['low', 'medium', 'high', 'enterprise']),
  missingRequirements: z.array(z.string()),
  ambiguityLevel: z.number().min(0).max(100),
});

// --- Client Intent Detection ---

export const IntentClassificationSchema = z.object({
  primaryIntent: z.string(),
  secondaryIntents: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

// --- Risk Analysis ---

export const RiskAnalysisSchema = z.object({
  riskScore: z.number().min(0).max(100),
  riskFactors: z.array(z.object({
    type: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    explanation: z.string(),
  })),
  cautionIndicators: z.array(z.string()),
  suggestedMitigation: z.string(),
});

// --- Negotiation Signals ---

export const NegotiationSignalsSchema = z.object({
  hasDiscountRequest: z.boolean(),
  urgencyPressureTactics: z.array(z.string()),
  comparisonShoppingSignals: z.boolean(),
  hesitationSignals: z.array(z.string()),
  commitmentSignals: z.array(z.string()),
  buyingIntentScore: z.number().min(0).max(100),
  authorityLevel: z.string(),
  decisionMakingStage: z.string(),
});

// --- Summarization ---

export const ConversationSummarySchema = z.object({
  executiveSummary: z.string(),
  actionItems: z.array(z.string()),
  pendingDecisions: z.array(z.string()),
  followUpRecommendations: z.array(z.string()),
  unresolvedQuestions: z.array(z.string()),
  clientExpectationsSummary: z.string(),
});

// --- Entity Extraction ---

export const EntityExtractionSchema = z.object({
  names: z.array(z.string()),
  companies: z.array(z.string()),
  projectReferences: z.array(z.string()),
  budgets: z.array(z.string()),
  deadlines: z.array(z.string()),
  deliverables: z.array(z.string()),
  technologies: z.array(z.string()),
  locations: z.array(z.string()),
  paymentTerms: z.array(z.string()),
});

// --- Memory Preparation ---

export const MemoryPreparationSchema = z.object({
  memoryChunks: z.array(z.object({
    content: z.string(),
    importance: z.number().min(0).max(1),
    tags: z.array(z.string()),
  })),
  semanticSummary: z.string(),
  searchableContext: z.string(),
  retrievalTags: z.array(z.string()),
});

// --- Master Orchestration Schema ---

export const ConversationIntelligenceSchema = z.object({
  parsedConversation: ParsedConversationSchema,
  emotionalAnalysis: EmotionalAnalysisSchema,
  businessIntelligence: BusinessIntelligenceSchema,
  communicationIntelligence: CommunicationIntelligenceSchema,
  projectIntelligence: ProjectIntelligenceSchema,
  intents: IntentClassificationSchema,
  riskAnalysis: RiskAnalysisSchema,
  negotiationSignals: NegotiationSignalsSchema,
  summary: ConversationSummarySchema,
  entities: EntityExtractionSchema,
  memoryPreparation: MemoryPreparationSchema,
});

export type ConversationIntelligence = z.infer<typeof ConversationIntelligenceSchema>;
