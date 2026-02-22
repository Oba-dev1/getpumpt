import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron secret is not configured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')?.trim()
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Database ping failed' },
      { status: 503 }
    )
  }
}
