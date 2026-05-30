import { AIProvider, AIResponse, GenerationRequest } from '../types';

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string;
  abstract generate(request: GenerationRequest): Promise<AIResponse>;
  abstract stream(request: GenerationRequest): Promise<ReadableStream>;

  protected calculateLatency(startTime: number): number {
    return Date.now() - startTime;
  }
}
