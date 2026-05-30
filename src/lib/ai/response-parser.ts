import { z } from 'zod';

export class ResponseParser {
  /**
   * Safely parses JSON from an AI response string, handling potential markdown blocks.
   */
  static parseJSON<T>(content: string, schema: z.ZodType<T>): T {
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      return schema.parse(parsed);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', content);
      throw new Error(`AI response parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extracts JSON from a potentially mixed text/JSON response.
   */
  static extractJSON(content: string): unknown {
    const jsonRegex = /\{[\s\S]*\}/;
    const match = content.match(jsonRegex);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}
