/**
 * FlowMind AI — Global Gemini Response Cache
 * 
 * Caches Gemini responses keyed by a hash of the prompt content.
 * TTL: 10 minutes. Prevents identical prompts from hitting the API twice.
 */

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Generate a simple but effective hash key from prompt content.
 * Uses a fast djb2-style hash for in-memory lookups.
 */
export function generateCacheKey(content: string): string {
  let hash = 5381;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) + hash + content.charCodeAt(i)) & 0x7fffffff;
  }
  return `gemini_cache_${hash.toString(36)}`;
}

/**
 * Retrieve a cached response if it exists and hasn't expired.
 * Returns null if no valid cache entry exists.
 */
export function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  console.log(`[Gemini Cache Hit] Key: ${key} | Age: ${Math.round((Date.now() - entry.timestamp) / 1000)}s`);
  return entry.data;
}

/**
 * Store a response in the cache.
 */
export function setCache(key: string, data: any): void {
  // Evict expired entries periodically (every 20 writes)
  if (cache.size > 0 && cache.size % 20 === 0) {
    evictExpired();
  }
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Remove all expired entries from the cache.
 */
function evictExpired(): void {
  const now = Date.now();
  let evicted = 0;
  for (const [key, entry] of cache) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      cache.delete(key);
      evicted++;
    }
  }
  if (evicted > 0) {
    console.log(`[Gemini Cache] Evicted ${evicted} expired entries. Active: ${cache.size}`);
  }
}

export function getCacheSize(): number {
  return cache.size;
}
