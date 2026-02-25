import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  if (!token) {
    return NextResponse.redirect(new URL('/signup?error=invalid-token', appUrl))
  }

  try {
    const redis = getRedis()
    const raw = await redis.get(`email:verify:${token}`)

    if (!raw) {
      return NextResponse.redirect(new URL('/signup?error=expired-token', appUrl))
    }

    const { email, gymSlug } = raw as { email: string; gymSlug: string }

    await prisma.gym.update({
      where: { slug: gymSlug },
      data: { isActive: true },
    })

    await redis.del(`email:verify:${token}`)

    return NextResponse.redirect(new URL(`/login?verified=true&email=${encodeURIComponent(email)}`, appUrl))
  } catch {
    return NextResponse.redirect(new URL('/signup?error=verification-failed', appUrl))
  }
}
