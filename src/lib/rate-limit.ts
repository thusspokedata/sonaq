/**
 * In-memory sliding window rate limiter.
 * Single-process safe (VPS + PM2 single instance). Resets on restart.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Prune entries older than the window to avoid unbounded memory growth
function prune(entry: RateLimitEntry, windowMs: number, now: number) {
  const cutoff = now - windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key    Unique identifier (e.g. "checkout:1.2.3.4" or "newsletter:email@x.com")
 * @param limit  Max requests allowed within windowMs
 * @param windowMs  Time window in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  prune(entry, windowMs, now);

  if (entry.timestamps.length >= limit) {
    return false;
  }

  entry.timestamps.push(now);
  return true;
}

// Periodically clear fully-expired keys to prevent memory leak on long-running processes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    // Use a generous 2-hour window for cleanup; keys with no recent activity are dropped
    prune(entry, 2 * 60 * 60 * 1000, now);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 10 * 60 * 1000); // run every 10 minutes
