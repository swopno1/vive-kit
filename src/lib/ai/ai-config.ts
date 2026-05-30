import { z } from 'zod';
import { AIModelType, ModelMetadata } from './types';

// 1. Environment Variable Validation
const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const getSafeEnv = () => {
  const result = envSchema.safeParse({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NODE_ENV: process.env.NODE_ENV || 'development',
  });

  if (!result.success) {
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
    if (process.env.NODE_ENV === 'production' && !isBuildPhase) {
      throw new Error(`Invalid environment variables configuration: ${JSON.stringify(result.error.format())}`);
    }

    // In production build environment (like Vercel build time), provide dummy values to prevent crash
    return {
      GEMINI_API_KEY: 'dummy_key',
      OPENAI_API_KEY: undefined,
      ANTHROPIC_API_KEY: undefined,
      NEXT_PUBLIC_SUPABASE_URL: 'https://dummy.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'dummy_anon',
      NODE_ENV: 'production' as const,
    };
  }

  return result.data;
};

export const env = getSafeEnv();

// 2. Model Registry
export const MODEL_REGISTRY: Record<AIModelType, ModelMetadata> = {
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    provider: 'google',
    name: 'Gemini 2.0 Flash',
    description: 'Fast, efficient model for simple tasks and high-speed streaming.',
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    costPer1kInput: 0.0001,
    costPer1kOutput: 0.0004,
  },
  'gemini-2.0-pro': {
    id: 'gemini-2.0-pro',
    provider: 'google',
    name: 'Gemini 2.0 Pro',
    description: 'Highly capable model for complex reasoning and high-context generation.',
    contextWindow: 2097152,
    maxOutputTokens: 8192,
    costPer1kInput: 0.00125,
    costPer1kOutput: 0.00375,
  },
  'gpt-4o': {
    id: 'gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    description: 'OpenAI multi-modal flagship model.',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    costPer1kInput: 0.005,
    costPer1kOutput: 0.015,
  },
  'claude-3-5-sonnet': {
    id: 'claude-3-5-sonnet',
    provider: 'anthropic',
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic state-of-the-art model.',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
  },
};

// 3. Routing Rules
export const ROUTING_RULES = {
  DEFAULT_MODEL: 'gemini-2.0-flash' as AIModelType,
  COMPLEXITY_THRESHOLD: 'high',
  TASKS: {
    FAST: ['classify', 'summarize', 'extract'] as const,
    REASONING: ['reply', 'analyze'] as const,
  },
};

// 4. Global AI Configuration
export const AI_CONFIG = {
  DEFAULT_TEMPERATURE: 0.2,
  MAX_RETRIES: 3,
  TIMEOUT_MS: 30000,
  SYSTEM_NAME: 'ViveKit AI Core',
};
