import { z } from 'zod';

// Request validation schema for chat endpoint
export const chatRequestSchema = z.object({
  rawConversation: z.string().min(5, 'Conversation must be at least 5 characters long').max(50000, 'Conversation exceeds maximum length (50,000 characters)'),
  additionalInstructions: z.string().max(5000, 'Instructions exceed maximum length (5,000 characters)').optional(),
  selectedTone: z.enum(['professional', 'casual', 'empathetic', 'urgent', 'strategic', 'friendly', 'technical', 'sales-focused', 'strict', 'concise', 'premium']).default('professional'),
  businessContext: z.any().optional(),
  customerContext: z.object({
    id: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().optional(),
    relationshipNotes: z.string().optional(),
  }).optional(),
});
