/**
 * Rate Limiter
 *
 * Simple in-memory rate limiter for protecting API endpoints and webhooks.
 * For production, consider using a distributed solution like Upstash Redis.
 */

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
    this.startCleanup()
  }

  /**
   * Check if request is allowed
   *
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @returns Whether request is allowed
   */
  check(identifier: string): { allowed: boolean; resetAt: number; remaining: number } {
    const now = Date.now()
    const entry = this.requests.get(identifier)

    if (!entry || now >= entry.resetAt) {
      const resetAt = now + this.config.windowMs
      this.requests.set(identifier, {
        count: 1,
        resetAt,
      })

      return {
        allowed: true,
        resetAt,
        remaining: this.config.maxRequests - 1,
      }
    }

    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        resetAt: entry.resetAt,
        remaining: 0,
      }
    }

    entry.count++
    this.requests.set(identifier, entry)

    return {
      allowed: true,
      resetAt: entry.resetAt,
      remaining: this.config.maxRequests - entry.count,
    }
  }

  /**
   * Clean up expired entries every minute
   */
  private startCleanup() {
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.requests.entries()) {
        if (now >= entry.resetAt) {
          this.requests.delete(key)
        }
      }
    }, 60000)
  }
}

// Webhook rate limiter: 100 requests per minute per IP
export const webhookRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
})

// Auth rate limiter: 5 login attempts per 15 minutes per IP
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
})

// Signup rate limiter: 3 signups per 15 minutes per IP
export const signupRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 3,
})

// Password reset rate limiter: 3 requests per 15 minutes per IP
export const passwordResetRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 3,
})

// API rate limiter: 100 requests per minute per user
export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
})

/**
 * Get client IP address from request headers
 *
 * @param headers - Request headers
 * @returns Client IP address
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

/**
 * Check rate limit and throw error if exceeded
 *
 * @param rateLimiter - Rate limiter instance
 * @param identifier - Unique identifier
 * @throws Error if rate limit exceeded
 */
export function checkRateLimit(rateLimiter: RateLimiter, identifier: string): void {
  const result = rateLimiter.check(identifier)

  if (!result.allowed) {
    const resetInSeconds = Math.ceil((result.resetAt - Date.now()) / 1000)
    throw new Error(`Rate limit exceeded. Try again in ${resetInSeconds} seconds`)
  }
}
