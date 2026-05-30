import { createGoogleGenerativeAI, GoogleGenerativeAIProvider } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { BaseAIProvider } from './providers/base-provider';
import { AIResponse, GenerationRequest, AIModelType } from './types';
import { env, AI_CONFIG } from './ai-config';

export class GeminiProvider extends BaseAIProvider {
  name = 'Gemini';
  private google: GoogleGenerativeAIProvider;

  /**
   * @param apiKey - Optional user-supplied key. Falls back to the GEMINI_API_KEY env var.
   */
  constructor(apiKey?: string) {
    super();
    this.google = createGoogleGenerativeAI({
      apiKey: apiKey || env.GEMINI_API_KEY,
    });
  }

  async generate(request: GenerationRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const modelId = request.options?.model || 'gemini-3.5-flash';

    const { text, usage } = await generateText({
      model: this.google(modelId),
      messages: request.messages,
      system: request.systemPrompt,
      temperature: request.options?.temperature ?? AI_CONFIG.DEFAULT_TEMPERATURE,
      maxRetries: AI_CONFIG.MAX_RETRIES,
      abortSignal: AbortSignal.timeout(AI_CONFIG.TIMEOUT_MS),
    });

    return {
      content: text,
      model: modelId as AIModelType,
      usage: {
        promptTokens: (usage as Record<string, any>)?.promptTokens ?? 0,
        completionTokens: (usage as Record<string, any>)?.completionTokens ?? 0,
        totalTokens: (usage as Record<string, any>)?.totalTokens ?? 0,
        latencyMs: this.calculateLatency(startTime),
      },
    };
  }

  async stream(request: GenerationRequest): Promise<ReadableStream> {
    const modelId = request.options?.model || 'gemini-3.5-flash';

    const result = await streamText({
      model: this.google(modelId),
      messages: request.messages,
      system: request.systemPrompt,
      temperature: request.options?.temperature ?? AI_CONFIG.DEFAULT_TEMPERATURE,
      maxRetries: AI_CONFIG.MAX_RETRIES,
      abortSignal: AbortSignal.timeout(AI_CONFIG.TIMEOUT_MS),
    });

    const response = result.toTextStreamResponse();
    if (!response.body) {
      throw new Error('Failed to generate streaming response body');
    }
    return response.body;
  }
}
