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
  if (shouldRateLimit(request)) {
    try {
      const clientIp = getClientIp(request.headers)
      checkRateLimit(authRateLimiter, clientIp)
    } catch {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }
  return authGET(request)
}

export async function POST(request: NextRequest) {
  if (shouldRateLimit(request)) {
    try {
      const clientIp = getClientIp(request.headers)
      checkRateLimit(authRateLimiter, clientIp)
    } catch {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }
  return authPOST(request)
}
