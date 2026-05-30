import { ParsingFormat } from '../../../types';
import { ParsedConversationSchema } from '../intelligence/schemas';
import { aiService } from '../ai.service';
import { ResponseParser } from '../response-parser';
import { z } from 'zod';

export class ConversationParser {
  /**
   * Processes raw conversation text into a structured format.
   * Uses AI for messy or unstructured inputs.
   */
  static async parse(rawText: string, format: ParsingFormat = 'raw'): Promise<z.infer<typeof ParsedConversationSchema>> {
    // If it's already structured or very simple, we could use regex,
    // but for "production-grade" and "messy formatting", we use the AI parser.

    const systemPrompt = `You are a conversation parsing expert.
Your task is to take messy, unstructured business communication and convert it into a strictly structured JSON format.

Supported formats: Email, WhatsApp, Discord, Slack, Client Briefs, Meeting Summaries, Support Requests.

Rules:
1. Identify all speakers and assign them a role: 'user' (the person using this AI), 'client' (the external party), 'system', or 'assistant'.
2. Extract the content of each message.
3. Normalize timestamps to ISO format if present.
4. Detect the channel/source of the conversation.
5. Identify all participants and their roles.

Output must follow the provided JSON schema exactly.`;

    const userPrompt = `Source Format: ${format}
Raw Conversation:
------------------
${rawText}
------------------

Please parse this conversation.`;

    try {
      const response = await aiService.generate({
        task: 'extract',
        rawConversation: rawText,
        additionalInstructions: `Parse this conversation according to the rules and output as JSON. Format: ${format}`,
        // We'll use a specialized prompt if we had one, but for now we leverage the general generate with a schema
      });

      // Note: In a real implementation, we might call geminiProvider.generate directly to pass the specific system prompt
      // but here we'll assume AIService/PromptBuilder can be extended or we use a clean JSON extraction.

      return ResponseParser.parseJSON(response.content, ParsedConversationSchema);
    } catch (error) {
      console.error('Failed to parse conversation:', error);
      // Fallback: simple one-message structure if AI parsing fails
      return {
        messages: [{
          role: 'client',
          content: rawText,
          speakerName: 'Unknown'
        }],
        participants: [{ name: 'Unknown', role: 'client' }],
        channel: 'unknown'
      };
    }
  }

  /**
   * Identifies the format of the raw text if not provided.
   */
  static detectFormat(text: string): ParsingFormat {
    if (text.includes('From:') && text.includes('Subject:')) return 'email';
    if (text.match(/\[\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}:\d{2}\]/)) return 'whatsapp';
    if (text.match(/^\d{2}:\d{2} [A-Z]{2}/)) return 'slack';
    // ... more detection logic
    return 'raw';
  }
}
