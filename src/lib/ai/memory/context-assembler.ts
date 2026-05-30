import {
  RetrievalResult,
  ClientIntelligenceProfile,
  RetrievalContext
} from '../../../types';
import { TokenEstimator } from '../token-estimator';

export class ContextAssembler {
  /**
   * Assembles retrieved memories and profile data into a structured prompt context.
   */
  assemble(
    memories: RetrievalResult[],
    profile?: ClientIntelligenceProfile | null
  ): RetrievalContext {
    // Optimize memory list to prevent token waste and keep prompt size under budget
    const optimizedMemories = this.optimize(memories);

    // 1. Group memories by category for structured presentation
    const categorized = optimizedMemories.reduce((acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    }, {} as Record<string, RetrievalResult[]>);

    // 2. Generate a concise summary of memories
    const sections = Object.entries(categorized).map(([category, items]) => {
      const header = category.replace('_', ' ').toUpperCase();
      const content = items
        .map(i => `- ${i.content} (Relevance: ${(i.similarity * 100).toFixed(0)}%)`)
        .join('\n');
      return `### ${header}\n${content}`;
    });

    const summary = sections.length > 0
      ? `**HISTORICAL CONTEXT & MEMORIES:**\n\n${sections.join('\n\n')}`
      : 'No specific historical context found.';

    // 3. Include profile insights if available
    let profileSummary = '';
    if (profile) {
      profileSummary = `
**CLIENT INTELLIGENCE PROFILE:**
- Communication Style: ${profile.communicationStyle}
- Pricing Sensitivity: ${profile.pricingSensitivity}
- Relationship Strength: ${profile.relationshipStrength.toFixed(0)}/100
- Trust Score: ${profile.trustScore.toFixed(0)}/100
- Negotiation Style: ${profile.negotiationStyle}
- Project History: ${profile.projectHistorySummary}
`;
    }

    return {
      memories,
      profile: profile || undefined,
      summary: `${profileSummary}\n\n${summary}`.trim()
    };
  }

  optimize(memories: RetrievalResult[], maxTokens: number = 1000): RetrievalResult[] {
    // Sort by weighted score descending
    const sorted = [...memories].sort((a, b) => b.weightedScore - a.weightedScore);
    
    const result: RetrievalResult[] = [];
    let currentTokens = 0;
    
    for (const memory of sorted) {
      const tokens = TokenEstimator.estimateTokens(memory.content);
      if (currentTokens + tokens > maxTokens) {
        break; // Stop adding memories if we exceed our token budget
      }
      result.push(memory);
      currentTokens += tokens;
    }
    
    return result;
  }
}

export const contextAssembler = new ContextAssembler();
