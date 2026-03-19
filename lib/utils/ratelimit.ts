/**
 * Simple in-memory rate limiter.
 * Not suitable for multi-instance deployments — use Upstash Redis there.
 * Good enough for single-instance (Railway, Render, etc.).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

/**
 * Returns true if the request is allowed, false if rate limited.
 * @param key      Unique identifier (e.g. IP address or "register:ip")
 * @param limit    Max requests per window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}
