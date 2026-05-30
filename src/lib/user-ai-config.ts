'use client';

/**
 * Client-side helper for reading/writing the user's AI provider config.
 * Stored only in localStorage — never sent to the server except as request headers.
 */

export type SupportedProvider = 'google' | 'openai' | 'anthropic';

export interface UserAIConfig {
  provider: SupportedProvider;
  model: string;
  apiKey: string;
}

const STORAGE_KEY = 'vivekit_ai_config';

export function getUserAIConfig(): UserAIConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserAIConfig;
  } catch {
    return null;
  }
}

export function setUserAIConfig(config: UserAIConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearUserAIConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Returns the headers to inject into AI fetch requests.
 * Returns an empty object when no user config is set (falls back to server env-var key).
 */
export function getAIRequestHeaders(): Record<string, string> {
  const config = getUserAIConfig();
  if (!config) return {};
  return {
    'x-ai-provider': config.provider,
    'x-ai-model': config.model,
    'x-ai-key': config.apiKey,
  };
}
