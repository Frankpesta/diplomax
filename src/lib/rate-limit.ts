export interface RateLimitStore {
  get(key: string): { count: number; resetAt: number } | undefined;
  set(key: string, value: { count: number; resetAt: number }): void;
}

// Default module-level store — persists across warm Edge instances
const defaultStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Returns true if the request should be allowed, false if it should be blocked.
 * Allows up to `limit` requests per `windowMs` milliseconds per key.
 */
export function allowRequest(
  key: string,
  opts: { limit?: number; windowMs?: number; now?: number; store?: RateLimitStore } = {}
): boolean {
  const { limit = 5, windowMs = 60_000, now = Date.now(), store = defaultStore } = opts;

  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
