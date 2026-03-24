import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

function gymLoginUrl(gymSlug: string | undefined, baseDomain: string, appUrl: string, params: string): string {
  if (gymSlug) {
    return `https://${gymSlug}.${baseDomain}/login?${params}`
  }
  return new URL(`/login?${params}`, appUrl).toString()
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const baseDomain = appUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid-token', appUrl))
  }

  try {
    const redis = getRedis()
    const raw = await redis.get(`member:email:verify:${token}`)

    if (!raw) {
      return NextResponse.redirect(new URL('/login?error=expired-token', appUrl))
    }

    const { userId, gymSlug } = raw as { userId: string; email: string; gymId: string; gymSlug: string }

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    })

    await redis.del(`member:email:verify:${token}`)

    return NextResponse.redirect(gymLoginUrl(gymSlug, baseDomain, appUrl, 'verified=true'))
  } catch {
    return NextResponse.redirect(new URL('/login?error=verification-failed', appUrl))
  }
}
