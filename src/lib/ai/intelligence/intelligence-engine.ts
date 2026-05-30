import { IntelligenceRequestConfig } from '../../../types';
import { ConversationIntelligence, ConversationIntelligenceSchema } from './schemas';
import { ConversationParser } from '../parsing/conversation-parser';
import { aiService } from '../ai.service';
import { ResponseParser } from '../response-parser';
import { memoryManager } from '../memory/memory-manager';

export class IntelligenceEngine {
  /**
   * Orchestrates the full conversation intelligence pipeline.
   */
  static async analyze(config: IntelligenceRequestConfig): Promise<ConversationIntelligence> {
    const { rawConversation, format, businessContext, customerContext, instructions } = config;

    // 1. Detect format if not provided
    const detectedFormat = format || ConversationParser.detectFormat(rawConversation);

    try {
      // 2. Perform deep analysis using a multi-step orchestration prompt
      const response = await aiService.generate({
        task: 'analyze',
        rawConversation,
        businessContext,
        customerContext,
        additionalInstructions: instructions,
        complexity: 'high', // Use Gemini 2.0 Pro for deep intelligence
      });

      // 3. Parse and validate the comprehensive intelligence object
      const intelligence = ResponseParser.parseJSON(response.content, ConversationIntelligenceSchema);

      // 4. Phase 6: Automatically store memories if a customer context is provided
      if (customerContext?.id) {
        // We run this asynchronously to not block the response, but we might want to await it depending on use case
        memoryManager.processIntelligence(customerContext.id, 'temp-id', intelligence)
          .catch(err => console.error('Failed to store memories from intelligence:', err));
      }

      return intelligence;
    } catch (error) {
      console.error('Intelligence Engine Analysis Failed:', error);
      throw new Error(`Failed to generate conversation intelligence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generates specific intelligence fragments (e.g., just risk analysis).
   */
  static async getQuickRisk(rawConversation: string): Promise<number> {
    const intelligence = await this.analyze({ rawConversation });
    return intelligence.riskAnalysis.riskScore;
  }
}
