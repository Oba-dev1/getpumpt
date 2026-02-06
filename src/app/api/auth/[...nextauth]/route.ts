import { handlers } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { authRateLimiter, getClientIp, checkRateLimit } from '@/lib/rate-limiter'

const { GET: authGET, POST: authPOST } = handlers

function shouldRateLimit(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Only rate-limit credential sign-in/callback attempts.
  // Session/CSRF/provider GETs are high-frequency and must not be throttled.
  return (
    request.method === 'POST' &&
    (path.endsWith('/signin/credentials') || path.endsWith('/callback/credentials'))
  )
}

export async function GET(request: NextRequest) {
  try {
    if (shouldRateLimit(request)) {
      const clientIp = getClientIp(request.headers)
      checkRateLimit(authRateLimiter, clientIp)
    }
    return authGET(request)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Rate limit exceeded'
    return NextResponse.json(
      { error: message },
      { status: 429 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (shouldRateLimit(request)) {
      const clientIp = getClientIp(request.headers)
      checkRateLimit(authRateLimiter, clientIp)
    }
    return authPOST(request)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Rate limit exceeded'
    return NextResponse.json(
      { error: message },
      { status: 429 }
    )
  }
}
