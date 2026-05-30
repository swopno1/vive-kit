import { AILogEntry } from './types';
import { MODEL_REGISTRY } from './ai-config';

export class AILogger {
  static async log(entry: Omit<AILogEntry, 'timestamp' | 'cost'>) {
    const modelMetadata = MODEL_REGISTRY[entry.model];
    const cost = (entry.promptTokens / 1000) * (modelMetadata?.costPer1kInput || 0) +
                 (entry.completionTokens / 1000) * (modelMetadata?.costPer1kOutput || 0);

    const fullEntry: AILogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      cost,
    };

    // In production, this would go to a database or external logging service
    console.log('[AI_LOG]', JSON.stringify(fullEntry));

    // Preparation for future database logging
    // await supabase.from('ai_logs').insert(fullEntry);
  }

  static async logError(requestId: string, error: Error | unknown, context?: Record<string, unknown>) {
    console.error('[AI_ERROR]', requestId, error, context);
  }
}
