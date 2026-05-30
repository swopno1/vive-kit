import { Redis } from '@upstash/redis';

class CacheService {
  private redis: Redis | null = null;
  private memoryCache = new Map<string, { value: any; expiresAt: number }>();

  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
      try {
        this.redis = new Redis({ url, token });
        console.log('[CACHE] Initialized Upstash Redis Edge connection.');
      } catch (err) {
        console.warn('[CACHE] Failed to initialize Upstash Redis, using memory fallback:', err);
      }
    } else {
      console.log('[CACHE] Upstash Redis credentials not configured. Using in-memory fallback cache.');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redis) {
      try {
        const data = await this.redis.get<T>(key);
        return data;
      } catch (err) {
        console.warn(`[CACHE] Redis GET error for key ${key}:`, err);
      }
    }

    // Memory Fallback
    const cached = this.memoryCache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.set(key, value, { ex: ttlSeconds });
        return;
      } catch (err) {
        console.warn(`[CACHE] Redis SET error for key ${key}:`, err);
      }
    }

    // Memory Fallback
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.del(key);
        return;
      } catch (err) {
        console.warn(`[CACHE] Redis DEL error for key ${key}:`, err);
      }
    }

    // Memory Fallback
    this.memoryCache.delete(key);
  }
}

export const cacheService = new CacheService();
