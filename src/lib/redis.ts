import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;
let _redisUnavailable = false;

function getRedis(): Redis | null {
  if (_redisUnavailable) return null;

  if (!_redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token || url.startsWith("your_")) {
      console.warn("[Redis] Not configured — caching disabled, hitting API directly.");
      _redisUnavailable = true;
      return null;
    }

    try {
      _redis = new Redis({ url, token });
    } catch (e) {
      console.warn("[Redis] Failed to initialize:", e);
      _redisUnavailable = true;
      return null;
    }
  }
  return _redis;
}

/**
 * Cache wrapper that checks Redis for a cached value before executing a fetch function.
 * On cache miss, executes the fetcher, stores the result with the given TTL, and returns it.
 * If Redis is unavailable, falls back to calling the fetcher directly.
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const redis = getRedis();

  // No Redis — just fetch directly
  if (!redis) {
    return fetcher();
  }

  try {
    // Try cache first
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (e) {
    console.warn("[Redis] Cache read failed, fetching directly:", e);
  }

  // Cache miss or error — fetch fresh data
  const data = await fetcher();

  // Try to store in cache (non-blocking, don't let cache write errors break things)
  try {
    if (redis) {
      await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
    }
  } catch (e) {
    console.warn("[Redis] Cache write failed:", e);
  }

  return data;
}

/** Common TTL values in seconds */
export const CacheTTL = {
  /** 5 minutes — for live/frequently changing data */
  LIVE: 5 * 60,
  /** 1 hour — for semi-static data like standings */
  STANDARD: 60 * 60,
  /** 24 hours — for static/historical data */
  LONG: 24 * 60 * 60,
} as const;
