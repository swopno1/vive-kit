import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { BaseAIProvider } from './base-provider';
import { AIResponse, AIModelType, GenerationRequest } from '../types';
import { AI_CONFIG } from '../ai-config';

export class OpenAIProvider extends BaseAIProvider {
  name = 'OpenAI';
  private client: ReturnType<typeof createOpenAI>;

  constructor(apiKey: string) {
    super();
    this.client = createOpenAI({ apiKey });
  }

  async generate(request: GenerationRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const modelId = (request.options?.model || 'gpt-5.5') as string;

    const { text, usage } = await generateText({
      model: this.client(modelId),
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
    const modelId = (request.options?.model || 'gpt-5.5') as string;

    const result = await streamText({
      model: this.client(modelId),
      messages: request.messages,
      system: request.systemPrompt,
      temperature: request.options?.temperature ?? AI_CONFIG.DEFAULT_TEMPERATURE,
      maxRetries: AI_CONFIG.MAX_RETRIES,
      abortSignal: AbortSignal.timeout(AI_CONFIG.TIMEOUT_MS),
    });

    const response = result.toTextStreamResponse();
    if (!response.body) throw new Error('Failed to generate streaming response body');
    return response.body;
  }
}
