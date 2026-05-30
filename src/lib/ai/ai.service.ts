import { AIServiceLayer, AIRequestConfig, AIResponse, AIModelType, AIProvider } from './types';
import { GeminiProvider } from './gemini.provider';
import { PromptBuilder } from './prompt-builder';
import { ROUTING_RULES, AI_CONFIG } from './ai-config';
import { AILogger } from './ai-logger';
import { AnalysisSchema } from './prompts/schemas';
import { retrievalEngine } from './memory/retrieval-engine';
import { contextAssembler } from './memory/context-assembler';
import { createProvider, UserProviderConfig } from './providers/provider-factory';

export class AIService implements AIServiceLayer {
  private geminiProvider: GeminiProvider;

  constructor() {
    this.geminiProvider = new GeminiProvider();
  }

  /**
   * Routes a request to the appropriate model based on task and complexity.
   * When a userConfig is supplied the user-chosen model takes precedence.
   */
  private routeModel(config: AIRequestConfig, userConfig?: UserProviderConfig): AIModelType {
    if (userConfig?.model) return userConfig.model as AIModelType;
    if (config.complexity === 'high') return 'gemini-2.0-pro';
    if (ROUTING_RULES.TASKS.REASONING.includes(config.task as any)) return 'gemini-2.0-pro';
    return ROUTING_RULES.DEFAULT_MODEL;
  }

  /** Returns the correct provider — user-supplied key beats env var. */
  private resolveProvider(userConfig?: UserProviderConfig): AIProvider {
    if (userConfig) return createProvider(userConfig);
    return this.geminiProvider;
  }

  /**
   * Performs an analysis on the conversation history.
   * Accepts an optional userConfig to use the user-supplied API key and model.
   */
  async analyze(config: AIRequestConfig, userConfig?: UserProviderConfig): Promise<AIResponse> {
    const analysisConfig: AIRequestConfig = {
      ...config,
      task: 'analyze',
    };

    const systemPrompt = PromptBuilder.buildSystemInstructions(analysisConfig);
    const messages = PromptBuilder.buildMessages(analysisConfig);
    const provider = this.resolveProvider(userConfig);
    // Prefer user-chosen model; fall back to flash for fast analysis
    const model = (userConfig?.model as AIModelType) || 'gemini-2.0-flash';

    return await provider.generate({
      messages,
      systemPrompt,
      schema: AnalysisSchema,
      options: { model, temperature: 0.1 },
    });
  }

  async generate(config: AIRequestConfig, userConfig?: UserProviderConfig): Promise<AIResponse> {
    const requestId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'manual-id-' + Date.now();
    const model = this.routeModel(config, userConfig);
    const provider = this.resolveProvider(userConfig);

    // Phase 6: Semantic Memory Retrieval
    let enrichedConfig = { ...config };
    const isDummyId = config.customerContext?.id === '00000000-0000-0000-0000-000000000000';
    if (config.customerContext?.id && !isDummyId && config.task !== 'analyze') {
      try {
        const memories = await retrievalEngine.retrieve({
          query: config.rawConversation,
          customerId: config.customerContext.id,
          limit: 10
        });

        const profile = await retrievalEngine.getClientProfile(config.customerContext.id);
        const retrievalContext = contextAssembler.assemble(memories, profile);

        enrichedConfig.memorySnippets = [
          ...(config.memorySnippets || []),
          retrievalContext.summary
        ];
      } catch (error) {
        console.error('Memory retrieval failed in AIService:', error);
      }
    }

    const systemPrompt = PromptBuilder.buildSystemInstructions({
      ...enrichedConfig,
      promptVersion: PromptBuilder.getSystemVersion()
    });
    const messages = PromptBuilder.buildMessages(enrichedConfig);

    try {
      const response = await provider.generate({
        messages,
        systemPrompt,
        options: { model, temperature: AI_CONFIG.DEFAULT_TEMPERATURE },
      });

      await AILogger.log({
        requestId,
        model: response.model,
        task: config.task,
        latencyMs: response.usage.latencyMs,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        status: 'success',
        metadata: {
          promptVersion: PromptBuilder.getSystemVersion(),
          riskLevel: config.riskLevel,
        }
      });

      return response;
    } catch (error: Error | unknown) {
      await AILogger.logError(requestId, error, { config, enrichedConfig, model });
      throw error;
    }
  }

  async stream(config: AIRequestConfig, userConfig?: UserProviderConfig): Promise<ReadableStream> {
    const model = this.routeModel(config, userConfig);
    const provider = this.resolveProvider(userConfig);

    // Phase 6: Semantic Memory Retrieval (simplified for streaming)
    let enrichedConfig = { ...config };
    const isDummyId = config.customerContext?.id === '00000000-0000-0000-0000-000000000000';
    if (config.customerContext?.id && !isDummyId && config.task !== 'analyze') {
      try {
        const memories = await retrievalEngine.retrieve({
          query: config.rawConversation,
          customerId: config.customerContext.id,
          limit: 5
        });
        const profile = await retrievalEngine.getClientProfile(config.customerContext.id);
        const retrievalContext = contextAssembler.assemble(memories, profile);
        enrichedConfig.memorySnippets = [
          ...(config.memorySnippets || []),
          retrievalContext.summary
        ];
      } catch (error) {
        console.error('Memory retrieval failed in AIService (stream):', error);
      }
    }

    const systemPrompt = PromptBuilder.buildSystemInstructions({
      ...enrichedConfig,
      promptVersion: PromptBuilder.getSystemVersion()
    });
    const messages = PromptBuilder.buildMessages(enrichedConfig);

    try {
      return await provider.stream({
        messages,
        systemPrompt,
        options: { model, temperature: AI_CONFIG.DEFAULT_TEMPERATURE },
      });
    } catch (error: Error | unknown) {
      const requestId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'manual-id-' + Date.now();
      await AILogger.logError(requestId, error, { config, enrichedConfig, model });
      throw error;
    }
  }
}

// Export a singleton instance
export const aiService = new AIService();
