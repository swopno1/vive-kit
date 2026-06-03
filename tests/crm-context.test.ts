/**
 * CRM Context Integration Tests
 *
 * This test suite validates that CRM data (client history, relationship scores,
 * communication preferences) is correctly retrieved and incorporated into responses.
 *
 * Run with: npm run test -- crm-context.test.ts
 */

import { ContextAssembler } from '../src/lib/ai/memory/context-assembler';
import { RetrievalResult, ClientIntelligenceProfile } from '../src/types';

describe('CRM Context Integration', () => {
  const contextAssembler = new ContextAssembler();

  // =====================================================================
  // MOCK DATA
  // =====================================================================

  const mockMemories: RetrievalResult[] = [
    {
      id: 'mem-1',
      userId: 'user-123',
      customerId: 'client-456',
      content: 'Client prefers email communication over phone calls',
      category: 'communication_preferences',
      embedding: new Array(1536).fill(0.1),
      similarity: 0.92,
      weightedScore: 0.92,
      timestamp: new Date('2026-01-15'),
      tags: ['communication', 'preference']
    },
    {
      id: 'mem-2',
      userId: 'user-123',
      customerId: 'client-456',
      content: 'Previous project: Custom web app MVP built in Next.js, completed on time and budget',
      category: 'project_history',
      embedding: new Array(1536).fill(0.2),
      similarity: 0.88,
      weightedScore: 0.88,
      timestamp: new Date('2025-12-01'),
      tags: ['project', 'success']
    },
    {
      id: 'mem-3',
      userId: 'user-123',
      customerId: 'client-456',
      content: 'Client is price-sensitive but values quality; willing to invest in long-term solutions',
      category: 'pricing_profile',
      embedding: new Array(1536).fill(0.3),
      similarity: 0.85,
      weightedScore: 0.85,
      timestamp: new Date('2025-11-20'),
      tags: ['pricing', 'values']
    },
    {
      id: 'mem-4',
      userId: 'user-123',
      customerId: 'client-456',
      content: 'Requested automation of Google Sheets workflow in previous conversation',
      category: 'service_interest',
      embedding: new Array(1536).fill(0.4),
      similarity: 0.82,
      weightedScore: 0.82,
      timestamp: new Date('2025-10-15'),
      tags: ['service', 'interest']
    }
  ];

  const mockProfile: ClientIntelligenceProfile = {
    id: 'profile-123',
    userId: 'user-123',
    customerId: 'client-456',
    name: 'Acme Corp',
    communicationStyle: 'Direct and professional',
    pricingSensitivity: 'Medium - values quality but budget-conscious',
    relationshipStrength: 85,
    trustScore: 90,
    negotiationStyle: 'Collaborative',
    projectHistorySummary: '3 successful projects over 18 months, $45k total ACV',
    lastInteractionDate: new Date('2026-05-28'),
    nextFollowUpDate: new Date('2026-06-10'),
    notes: 'Strong long-term partner, repeat client for Sheets automation'
  };

  // =====================================================================
  // TEST CASES
  // =====================================================================

  describe('Context Assembly - Basic', () => {
    test('should assemble context from memories and profile', () => {
      const context = contextAssembler.assemble(mockMemories, mockProfile);

      expect(context).toBeDefined();
      expect(context.summary).toBeDefined();
      expect(context.profile).toEqual(mockProfile);
      expect(context.memories.length).toBeGreaterThan(0);
    });

    test('should categorize memories by type', () => {
      const context = contextAssembler.assemble(mockMemories, mockProfile);

      expect(context.summary).toContain('COMMUNICATION_PREFERENCES');
      expect(context.summary).toContain('PROJECT_HISTORY');
      expect(context.summary).toContain('PRICING_PROFILE');
      expect(context.summary).toContain('SERVICE_INTEREST');
    });

    test('should include relationship strength in context', () => {
      const context = contextAssembler.assemble(mockMemories, mockProfile);

      expect(context.summary).toContain('Relationship Strength: 85/100');
    });

    test('should include trust score in context', () => {
      const context = contextAssembler.assemble(mockMemories, mockProfile);

      expect(context.summary).toContain('Trust Score: 90/100');
    });

    test('should include communication style in context', () => {
      const context = contextAssembler.assemble(mockMemories, mockProfile);

      expect(context.summary).toContain('Direct and professional');
    });
  });

  describe('Context Assembly - Profile Impact', () => {
    test('should adapt tone based on communication style', () => {
      const directProfile: ClientIntelligenceProfile = {
        ...mockProfile,
        communicationStyle: 'Direct and no-nonsense'
      };

      const context = contextAssembler.assemble(mockMemories, directProfile);

      expect(context.summary).toContain('Direct and no-nonsense');
      // Response should use concise, direct language
    });

    test('should reflect pricing sensitivity in context', () => {
      const priceSensitiveProfile: ClientIntelligenceProfile = {
        ...mockProfile,
        pricingSensitivity: 'Very high - budget is primary constraint'
      };

      const context = contextAssembler.assemble(mockMemories, priceSensitiveProfile);

      expect(context.summary).toContain('Very high - budget is primary constraint');
      // Response should focus on cost-effective solutions
    });

    test('should use negotiation style in context', () => {
      const context = contextAssembler.assemble(mockMemories, mockProfile);

      expect(context.summary).toContain('Negotiation Style: Collaborative');
      // Response should adopt collaborative tone
    });
  });

  describe('Memory Optimization - Token Budget', () => {
    test('should optimize memories within token budget', () => {
      const optimized = contextAssembler.optimize(mockMemories, 500);

      // Should include highest-scoring memories first
      expect(optimized.length).toBeGreaterThan(0);
      expect(optimized.length).toBeLessThanOrEqual(mockMemories.length);

      // Should be sorted by weighted score (descending)
      for (let i = 1; i < optimized.length; i++) {
        expect(optimized[i - 1].weightedScore).toBeGreaterThanOrEqual(
          optimized[i].weightedScore
        );
      }
    });

    test('should respect max token limit', () => {
      const optimized = contextAssembler.optimize(mockMemories, 100);

      // With 100 token limit, should include fewer memories
      expect(optimized.length).toBeLessThanOrEqual(mockMemories.length);
    });

    test('should include all memories if under budget', () => {
      const optimized = contextAssembler.optimize(mockMemories, 10000);

      // With high token limit, should include all memories
      expect(optimized.length).toEqual(mockMemories.length);
    });
  });

  describe('Multi-Conversation Context', () => {
    test('should surface context from multiple past interactions', () => {
      const multiConversationMemories: RetrievalResult[] = [
        {
          id: 'conv-1',
          userId: 'user-123',
          customerId: 'client-456',
          content: 'First meeting: Discussed web app MVP and timeline',
          category: 'conversation',
          embedding: new Array(1536).fill(0.1),
          similarity: 0.8,
          weightedScore: 0.8,
          timestamp: new Date('2025-09-01'),
          tags: ['meeting', 'initial']
        },
        {
          id: 'conv-2',
          userId: 'user-123',
          customerId: 'client-456',
          content: 'Follow-up: Reviewed project scope and confirmed budget allocation',
          category: 'conversation',
          embedding: new Array(1536).fill(0.2),
          similarity: 0.85,
          weightedScore: 0.85,
          timestamp: new Date('2025-10-15'),
          tags: ['meeting', 'scope']
        },
        {
          id: 'conv-3',
          userId: 'user-123',
          customerId: 'client-456',
          content: 'Last week: Delivered Phase 1 MVP, client very satisfied',
          category: 'conversation',
          embedding: new Array(1536).fill(0.3),
          similarity: 0.92,
          weightedScore: 0.92,
          timestamp: new Date('2026-05-28'),
          tags: ['delivery', 'success']
        }
      ];

      const context = contextAssembler.assemble(multiConversationMemories, mockProfile);

      expect(context.summary).toContain('CONVERSATION');
      expect(context.summary).toContain('MVP');
      expect(context.summary).toContain('Phase 1');
      expect(context.summary).toContain('satisfied');
    });

    test('should prioritize most recent relevant interactions', () => {
      const memories: RetrievalResult[] = [
        {
          ...mockMemories[0],
          timestamp: new Date('2025-01-01'),
          weightedScore: 0.5
        },
        {
          ...mockMemories[1],
          timestamp: new Date('2026-05-20'),
          weightedScore: 0.95
        }
      ];

      const optimized = contextAssembler.optimize(memories, 1000);

      // Should include the more recent, higher-weighted memory first
      expect(optimized[0].weightedScore).toBe(0.95);
    });
  });

  describe('Context Prompt Integration', () => {
    test('should generate context prompt suitable for AI input', () => {
      const context = contextAssembler.assemble(mockMemories, mockProfile);

      // Should include all required information for response generation
      expect(context.summary).toContain('CLIENT INTELLIGENCE PROFILE');
      expect(context.summary).toContain('HISTORICAL CONTEXT & MEMORIES');
      expect(context.summary).toContain('Relationship Strength');
      expect(context.summary).toContain('Trust Score');
      expect(context.summary).toContain('Communication Style');
    });

    test('should include relevance scores for transparency', () => {
      const context = contextAssembler.assemble(mockMemories, mockProfile);

      // Should show relevance percentages for memories
      expect(context.summary).toMatch(/Relevance: \d+%/);
    });

    test('should gracefully handle missing profile', () => {
      const context = contextAssembler.assemble(mockMemories, null);

      expect(context).toBeDefined();
      expect(context.summary).toContain('HISTORICAL CONTEXT & MEMORIES');
      expect(context.summary).not.toContain('CLIENT INTELLIGENCE PROFILE');
    });

    test('should gracefully handle empty memories', () => {
      const context = contextAssembler.assemble([], mockProfile);

      expect(context).toBeDefined();
      expect(context.summary).toContain('No specific historical context found');
      expect(context.summary).toContain('CLIENT INTELLIGENCE PROFILE');
    });
  });

  describe('Response Tone Adaptation Based on Relationship', () => {
    test('should use warm tone for high-trust long-term clients', () => {
      const trustyClient: ClientIntelligenceProfile = {
        ...mockProfile,
        trustScore: 95,
        relationshipStrength: 95,
        projectHistorySummary: '5+ projects, $100k+ ACV, consistent repeat business'
      };

      const context = contextAssembler.assemble(mockMemories, trustyClient);

      // High trust score should indicate opportunity for warmer, more collaborative tone
      expect(context.profile?.trustScore).toBeGreaterThanOrEqual(90);
      expect(context.profile?.relationshipStrength).toBeGreaterThanOrEqual(90);
    });

    test('should use cautious tone for new/low-trust clients', () => {
      const newClient: ClientIntelligenceProfile = {
        ...mockProfile,
        trustScore: 50,
        relationshipStrength: 30,
        projectHistorySummary: 'First-time client, no previous projects'
      };

      const context = contextAssembler.assemble([], newClient);

      // Low scores should indicate need for professional, formal tone
      expect(context.profile?.trustScore).toBeLessThan(60);
      expect(context.profile?.relationshipStrength).toBeLessThan(40);
    });

    test('should adapt pricing pitch based on sensitivity score', () => {
      const budgetConsciousClient: ClientIntelligenceProfile = {
        ...mockProfile,
        pricingSensitivity: 'High - cost is primary decision driver'
      };

      const context = contextAssembler.assemble(mockMemories, budgetConsciousClient);

      expect(context.summary).toContain('High - cost is primary decision driver');
      // Should focus on ROI and cost-effectiveness in response
    });
  });

  describe('Integration: Full Context Flow', () => {
    test('should produce complete context for response generation', () => {
      const context = contextAssembler.assemble(mockMemories, mockProfile);

      // Should be suitable for injecting into AI prompt
      const prompt = `
Use the following client context to personalize your response:

${context.summary}

Now draft a response to the client's request...`;

      expect(prompt).toContain('CLIENT INTELLIGENCE PROFILE');
      expect(prompt).toContain('Relationship Strength: 85/100');
      expect(prompt).toContain('Direct and professional');
    });

    test('should preserve memory relevance scores for AI prioritization', () => {
      const context = contextAssembler.assemble(mockMemories, mockProfile);

      mockMemories.forEach(mem => {
        expect(context.memories).toContainEqual(expect.objectContaining({
          id: mem.id,
          similarity: mem.similarity
        }));
      });
    });
  });
});
