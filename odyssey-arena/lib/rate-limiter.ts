/**
 * Client-side rate limiter for battle actions.
 * Prevents spam-clicking and excessive API calls.
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export class RateLimiter {
  private requests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /** Check if a request is allowed */
  canMakeRequest(): boolean {
    this.cleanup();
    return this.requests.length < this.config.maxRequests;
  }

  /** Record a request */
  recordRequest(): void {
    this.requests.push(Date.now());
  }

  /** Get remaining requests in current window */
  remaining(): number {
    this.cleanup();
    return Math.max(0, this.config.maxRequests - this.requests.length);
  }

  /** Get ms until next request is allowed (0 if allowed now) */
  getWaitTime(): number {
    if (this.canMakeRequest()) return 0;
    const oldest = this.requests[0];
    return oldest + this.config.windowMs - Date.now();
  }

  /** Remove expired entries */
  private cleanup(): void {
    const cutoff = Date.now() - this.config.windowMs;
    this.requests = this.requests.filter((t) => t > cutoff);
  }
}

/** Global rate limiter: 30 actions per 60 seconds */
export const actionRateLimiter = new RateLimiter({
  maxRequests: 30,
  windowMs: 60_000,
});
