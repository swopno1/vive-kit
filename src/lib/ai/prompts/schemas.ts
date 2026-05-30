import { z } from 'zod';

export const SentimentSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative', 'frustrated']),
  score: z.number().min(0).max(1),
  reasoning: z.string(),
});

export const MemoryExtractionSchema = z.object({
  keyFacts: z.array(z.string()),
  entities: z.array(z.object({
    name: z.string(),
    type: z.string(),
    context: z.string().optional(),
  })),
  summary: z.string(),
});

export const RiskDetectionSchema = z.object({
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  riskTypes: z.array(z.enum(['churn', 'legal', 'technical_escalation', 'billing_dispute'])),
  summary: z.string(),
  suggestedAction: z.string(),
});

export const ReplyDraftSchema = z.object({
  reply: z.string(),
  toneCheck: z.string(),
  completenessScore: z.number().min(0).max(100),
});

export const AnalysisSchema = z.object({
  sentiment: SentimentSchema,
  risks: RiskDetectionSchema,
  summary: z.string(),
});
