/**
 * Rate Limiter
 *
 * Distributed rate limiting using Upstash Redis with sliding window algorithm.
 * Falls back to in-memory rate limiting when Redis is not configured (development).
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ---------------------------------------------------------------------------
// Redis client (null when env vars are missing, e.g. local development)
// ---------------------------------------------------------------------------

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

// ---------------------------------------------------------------------------
// In-memory fallback for development
// ---------------------------------------------------------------------------

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

class InMemoryRateLimiter {
  private requests = new Map<string, RateLimitEntry>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
    this.startCleanup()
  }

  check(identifier: string): { allowed: boolean; resetAt: number; remaining: number } {
    const now = Date.now()
    const entry = this.requests.get(identifier)

    if (!entry || now >= entry.resetAt) {
      const resetAt = now + this.config.windowMs
      this.requests.set(identifier, { count: 1, resetAt })
      return { allowed: true, resetAt, remaining: this.config.maxRequests - 1 }
    }

    if (entry.count >= this.config.maxRequests) {
      return { allowed: false, resetAt: entry.resetAt, remaining: 0 }
    }

    this.requests.set(identifier, { ...entry, count: entry.count + 1 })
    return {
      allowed: true,
      resetAt: entry.resetAt,
      remaining: this.config.maxRequests - entry.count - 1,
    }
  }

  private startCleanup() {
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.requests.entries()) {
        if (now >= entry.resetAt) {
          this.requests.delete(key)
        }
      }
    }, 60_000)
  }
}

// ---------------------------------------------------------------------------
// Unified rate limiter type
// ---------------------------------------------------------------------------

type RateLimiterInstance = Ratelimit | InMemoryRateLimiter

function createLimiter(windowMs: number, maxRequests: number): RateLimiterInstance {
  if (redis) {
    const windowS = `${Math.round(windowMs / 1000)} s` as `${number} s`
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, windowS),
      analytics: true,
    })
  }
  return new InMemoryRateLimiter({ windowMs, maxRequests })
}

// ---------------------------------------------------------------------------
// Pre-configured rate limiters
// ---------------------------------------------------------------------------

// Webhook rate limiter: 100 requests per minute per IP
export const webhookRateLimiter = createLimiter(60 * 1000, 100)

// Auth rate limiter: 5 login attempts per 15 minutes per IP
export const authRateLimiter = createLimiter(15 * 60 * 1000, 5)

// Signup rate limiter: 3 signups per 15 minutes per IP
export const signupRateLimiter = createLimiter(15 * 60 * 1000, 3)

// Password reset rate limiter: 3 requests per 15 minutes per IP
export const passwordResetRateLimiter = createLimiter(15 * 60 * 1000, 3)

// API rate limiter: 100 requests per minute per user
export const apiRateLimiter = createLimiter(60 * 1000, 100)

// OTP send rate limiter: 3 sends per 15 minutes per phone
export const otpSendRateLimiter = createLimiter(15 * 60 * 1000, 3)

// OTP verify rate limiter: 10 verify attempts per 15 minutes per phone
export const otpVerifyRateLimiter = createLimiter(15 * 60 * 1000, 10)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get client IP address from request headers
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

/**
 * Check rate limit and throw error if exceeded.
 *
 * This function is async because Upstash Redis checks are network calls.
 * When using the in-memory fallback the async overhead is negligible.
 */
export async function checkRateLimit(
  rateLimiter: RateLimiterInstance,
  identifier: string
): Promise<void> {
  if (rateLimiter instanceof Ratelimit) {
    const result = await rateLimiter.limit(identifier)
    if (!result.success) {
      const resetInSeconds = Math.ceil((result.reset - Date.now()) / 1000)
      throw new Error(`Rate limit exceeded. Try again in ${resetInSeconds} seconds`)
    }
    return
  }

  // In-memory fallback
  const result = rateLimiter.check(identifier)
  if (!result.allowed) {
    const resetInSeconds = Math.ceil((result.resetAt - Date.now()) / 1000)
    throw new Error(`Rate limit exceeded. Try again in ${resetInSeconds} seconds`)
  }
}
