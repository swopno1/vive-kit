import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

class RateLimiter {
  private ratelimit: Ratelimit | null = null;
  // Local memory fallback rate limiting
  private localLimitMap = new Map<string, { count: number; resetTime: number }>();

  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
      try {
        const redis = new Redis({ url, token });
        this.ratelimit = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(20, '60 s'), // 20 requests per 60 seconds
          analytics: true,
          prefix: 'ratelimit:vivekit',
        });
        console.log('[RATELIMIT] Initialized Upstash Redis rate limiting.');
      } catch (err) {
        console.warn('[RATELIMIT] Failed to initialize Upstash Ratelimit, using memory fallback:', err);
      }
    } else {
      console.log('[RATELIMIT] Upstash Redis credentials not configured. Using local in-memory rate limiting.');
    }
  }

  async limit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    if (this.ratelimit) {
      try {
        const result = await this.ratelimit.limit(identifier);
        return {
          success: result.success,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
        };
      } catch (err) {
        console.warn(`[RATELIMIT] Upstash rate limit call failed for ${identifier}:`, err);
      }
    }

    // Local in-memory fixed window fallback rate limiting
    const now = Date.now();
    const windowMs = 60 * 1000; // 60 seconds
    const limitCount = 20;

    let record = this.localLimitMap.get(identifier);
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    record.count += 1;
    this.localLimitMap.set(identifier, record);

    const success = record.count <= limitCount;
    return {
      success,
      limit: limitCount,
      remaining: Math.max(0, limitCount - record.count),
      reset: record.resetTime,
    };
  }
}

export const rateLimiter = new RateLimiter();
