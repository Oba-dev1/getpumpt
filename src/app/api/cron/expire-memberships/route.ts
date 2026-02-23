import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNotification } from '@/lib/notification-helpers'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron secret is not configured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')?.trim()
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Find all ACTIVE memberships whose end date has passed
  const expiredMemberships = await prisma.membership.findMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: now },
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      plan: { select: { name: true } },
    },
  })

  if (expiredMemberships.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No memberships to expire',
      expired: 0,
    })
  }

  const membershipIds = expiredMemberships.map((m) => m.id)
  const gymIds = [...new Set(expiredMemberships.map((m) => m.gymId))]

  // Expire all memberships in one query
  await prisma.membership.updateMany({
    where: { id: { in: membershipIds } },
    data: { status: 'EXPIRED' },
  })

  // Fetch admins for all affected gyms
  const gymAdmins = await prisma.user.findMany({
    where: {
      gymId: { in: gymIds },
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
      status: 'ACTIVE',
    },
    select: { id: true, gymId: true },
  })

  const adminsByGym = new Map<string, string[]>()
  for (const admin of gymAdmins) {
    const existing = adminsByGym.get(admin.gymId) ?? []
    adminsByGym.set(admin.gymId, [...existing, admin.id])
  }

  // Send notifications
  for (const membership of expiredMemberships) {
    const { gymId, user, plan } = membership
    const memberName = `${user.firstName} ${user.lastName}`

    // Notify the member
    sendNotification(
      gymId,
      user.id,
      'MEMBERSHIP',
      'Membership Expired',
      `Your ${plan.name} membership has expired. Visit the gym to renew and regain access.`,
      '/member/membership'
    )

    // Notify every admin in the gym
    const admins = adminsByGym.get(gymId) ?? []
    for (const adminId of admins) {
      sendNotification(
        gymId,
        adminId,
        'MEMBERSHIP',
        'Member Subscription Expired',
        `${memberName}'s ${plan.name} membership has expired. They no longer have active access.`,
        `/admin/members/${user.id}`
      )
    }
  }

  return NextResponse.json({
    success: true,
    message: `Expired ${expiredMemberships.length} membership(s)`,
    expired: expiredMemberships.length,
  })
}
