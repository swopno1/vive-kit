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
  // ── Google Gemini ──────────────────────────────────────────
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    provider: 'google',
    name: 'Gemini 2.5 Flash',
    description: 'Latest Gemini — adaptive thinking, fastest responses, free tier.',
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    provider: 'google',
    name: 'Gemini 2.5 Pro',
    description: 'Most powerful Gemini — deep reasoning, 2M context window.',
    contextWindow: 2097152,
    maxOutputTokens: 65536,
    costPer1kInput: 0.00125,
    costPer1kOutput: 0.01,
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    provider: 'google',
    name: 'Gemini 2.0 Flash',
    description: 'Stable and fast — great for high-volume generation.',
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    costPer1kInput: 0.0001,
    costPer1kOutput: 0.0004,
  },
  // ── OpenAI ────────────────────────────────────────────────
  'gpt-4.1': {
    id: 'gpt-4.1',
    provider: 'openai',
    name: 'GPT-4.1',
    description: 'Latest OpenAI flagship — best coding and instruction following.',
    contextWindow: 1047576,
    maxOutputTokens: 32768,
    costPer1kInput: 0.002,
    costPer1kOutput: 0.008,
  },
  'gpt-4.1-mini': {
    id: 'gpt-4.1-mini',
    provider: 'openai',
    name: 'GPT-4.1 Mini',
    description: 'Fast and affordable — ideal for everyday generation tasks.',
    contextWindow: 1047576,
    maxOutputTokens: 32768,
    costPer1kInput: 0.0004,
    costPer1kOutput: 0.0016,
  },
  'gpt-4o': {
    id: 'gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    description: 'Reliable multimodal model — stable and widely supported.',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    costPer1kInput: 0.0025,
    costPer1kOutput: 0.01,
  },
  // ── Anthropic Claude ──────────────────────────────────────
  'claude-3-7-sonnet-20250219': {
    id: 'claude-3-7-sonnet-20250219',
    provider: 'anthropic',
    name: 'Claude 3.7 Sonnet',
    description: 'Latest Claude — extended thinking, best for complex reasoning.',
    contextWindow: 200000,
    maxOutputTokens: 64000,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
  },
  'claude-3-5-sonnet-20241022': {
    id: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    name: 'Claude 3.5 Sonnet',
    description: 'Proven and balanced — great writing and analysis quality.',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
  },
  'claude-3-5-haiku-20241022': {
    id: 'claude-3-5-haiku-20241022',
    provider: 'anthropic',
    name: 'Claude 3.5 Haiku',
    description: 'Fastest Claude — low latency, great for quick replies.',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    costPer1kInput: 0.0008,
    costPer1kOutput: 0.004,
  },
};

// 3. Routing Rules
export const ROUTING_RULES = {
  DEFAULT_MODEL: 'gemini-2.5-flash' as AIModelType,
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
