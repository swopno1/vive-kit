import { AIProvider } from '../types';
import { GeminiProvider } from '../gemini.provider';
import { OpenAIProvider } from './openai.provider';
import { AnthropicProvider } from './anthropic.provider';
import { env } from '../ai-config';

export type SupportedProvider = 'google' | 'openai' | 'anthropic';

export interface UserProviderConfig {
  provider: SupportedProvider;
  model: string;
  apiKey: string;
}

/**
 * Returns an AIProvider instance for the given config.
 * When a user-supplied key is present it takes precedence over env vars.
 * Falls back to the Gemini env-var provider when no user config is given.
 */
export function createProvider(config?: UserProviderConfig): AIProvider {
  if (!config) {
    // Default: env-var Gemini
    return new GeminiProvider();
  }

  switch (config.provider) {
    case 'google':
      // Re-instantiate Gemini with the user-supplied key
      return new GeminiProvider(config.apiKey);
    case 'openai':
      return new OpenAIProvider(config.apiKey);
    case 'anthropic':
      return new AnthropicProvider(config.apiKey);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

/**
 * Parse the three X-AI-* request headers into a UserProviderConfig.
 * Returns undefined when any required header is missing or empty.
 */
export function parseUserProviderHeaders(
  req: Request
): UserProviderConfig | undefined {
  const provider = req.headers.get('x-ai-provider')?.trim() as SupportedProvider | null;
  const model = req.headers.get('x-ai-model')?.trim();
  const apiKey = req.headers.get('x-ai-key')?.trim();

  if (!provider || !model || !apiKey) return undefined;
  if (!['google', 'openai', 'anthropic'].includes(provider)) return undefined;

  return { provider, model, apiKey };
}
