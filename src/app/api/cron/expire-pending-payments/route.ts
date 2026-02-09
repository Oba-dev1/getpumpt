import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PENDING_TIMEOUT_MINUTES = 30

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - PENDING_TIMEOUT_MINUTES * 60 * 1000)

  const stalePayments = await prisma.payment.findMany({
    where: {
      status: 'PENDING',
      createdAt: { lt: cutoff },
    },
    include: { membership: true },
  })

  if (stalePayments.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No stale pending payments found',
      expired: 0,
    })
  }

  const membershipIds = stalePayments
    .filter((p) => p.membership && p.membership.status === 'PENDING')
    .map((p) => p.membershipId!)

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: {
        id: { in: stalePayments.map((p) => p.id) },
      },
      data: { status: 'FAILED' },
    }),
    ...(membershipIds.length > 0
      ? [
          prisma.membership.updateMany({
            where: { id: { in: membershipIds } },
            data: { status: 'EXPIRED' },
          }),
        ]
      : []),
  ])

  return NextResponse.json({
    success: true,
    message: `Expired ${stalePayments.length} stale payment(s) and ${membershipIds.length} membership(s)`,
    expiredPayments: stalePayments.length,
    expiredMemberships: membershipIds.length,
  })
}
