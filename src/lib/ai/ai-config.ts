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
  'gemini-3.5-flash': {
    id: 'gemini-3.5-flash',
    provider: 'google',
    name: 'Gemini 3.5 Flash',
    description: 'Latest flagship — rivals larger models for agentic tasks at exceptional speed. Free tier.',
    contextWindow: 2097152,
    maxOutputTokens: 65536,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
  },
  'gemini-3.1-pro': {
    id: 'gemini-3.1-pro',
    provider: 'google',
    name: 'Gemini 3.1 Pro',
    description: 'Advanced problem-solving and complex multi-step reasoning.',
    contextWindow: 2097152,
    maxOutputTokens: 65536,
    costPer1kInput: 0.00125,
    costPer1kOutput: 0.01,
  },
  'gemini-3.1-flash': {
    id: 'gemini-3.1-flash',
    provider: 'google',
    name: 'Gemini 3.1 Flash',
    description: 'Balanced speed and intelligence — great for everyday generation.',
    contextWindow: 1048576,
    maxOutputTokens: 32768,
    costPer1kInput: 0.00008,
    costPer1kOutput: 0.0003,
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    provider: 'google',
    name: 'Gemini 2.5 Flash',
    description: 'Previous generation — stable and proven for high-volume use.',
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    costPer1kInput: 0.0001,
    costPer1kOutput: 0.0004,
  },
  // ── OpenAI ────────────────────────────────────────────────
  'gpt-5.5': {
    id: 'gpt-5.5',
    provider: 'openai',
    name: 'GPT-5.5',
    description: 'Latest frontier — complex reasoning, planning, and OS-level computer use.',
    contextWindow: 2097152,
    maxOutputTokens: 65536,
    costPer1kInput: 0.005,
    costPer1kOutput: 0.02,
  },
  'o3': {
    id: 'o3',
    provider: 'openai',
    name: 'OpenAI o3',
    description: 'Reasoning model — thinks longer before responding for deep multi-step accuracy.',
    contextWindow: 200000,
    maxOutputTokens: 32768,
    costPer1kInput: 0.01,
    costPer1kOutput: 0.04,
  },
  'gpt-4.1': {
    id: 'gpt-4.1',
    provider: 'openai',
    name: 'GPT-4.1',
    description: 'Previous flagship — excellent coding and instruction following.',
    contextWindow: 1047576,
    maxOutputTokens: 32768,
    costPer1kInput: 0.002,
    costPer1kOutput: 0.008,
  },
  'gpt-4o': {
    id: 'gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    description: 'Reliable multimodal — stable and widely supported.',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    costPer1kInput: 0.0025,
    costPer1kOutput: 0.01,
  },
  // ── Anthropic Claude ──────────────────────────────────────
  'claude-opus-4-8': {
    id: 'claude-opus-4-8',
    provider: 'anthropic',
    name: 'Claude Opus 4.8',
    description: 'Latest enterprise frontier — citation accuracy, complex document analysis, token efficiency.',
    contextWindow: 500000,
    maxOutputTokens: 32768,
    costPer1kInput: 0.015,
    costPer1kOutput: 0.075,
  },
  'claude-sonnet-4-6': {
    id: 'claude-sonnet-4-6',
    provider: 'anthropic',
    name: 'Claude Sonnet 4.6',
    description: 'Optimized mid-tier — code generation, computer use, and low-latency agentic workflows.',
    contextWindow: 200000,
    maxOutputTokens: 16384,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
  },
  'claude-haiku-4-5': {
    id: 'claude-haiku-4-5',
    provider: 'anthropic',
    name: 'Claude Haiku 4.5',
    description: 'Ultra-fast low-latency — ideal for real-time responses and high-volume tasks.',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    costPer1kInput: 0.0008,
    costPer1kOutput: 0.004,
  },
};

// 3. Routing Rules
export const ROUTING_RULES = {
  DEFAULT_MODEL: 'claude-sonnet-4-6' as AIModelType,
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
