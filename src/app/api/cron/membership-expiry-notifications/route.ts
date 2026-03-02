import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNotification } from '@/lib/notification-helpers'

/**
 * Notification thresholds (days before expiry) per plan duration.
 *
 * Plan duration  | Thresholds
 * -------------- | ----------
 * 1 day          | none (daily pass — no advance warning useful)
 * ≤ 7 days       | 3 days
 * ≤ 14 days      | 7, 3 days
 * ≤ 31 days      | 7, 3 days
 * ≤ 92 days      | 14, 7 days
 * > 92 days      | 30, 7 days
 */
function getThresholdsForPlan(planDays: number): number[] {
  if (planDays <= 1) return []
  if (planDays <= 7) return [3]
  if (planDays <= 31) return [7, 3]
  if (planDays <= 92) return [14, 7]
  return [30, 7]
}

function planDurationDays(durationValue: number, durationType: string): number {
  switch (durationType) {
    case 'DAYS':
      return durationValue
    case 'MONTHS':
      return durationValue * 30
    case 'YEARS':
      return durationValue * 365
    default:
      return durationValue
  }
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

// Maximum look-ahead window across all thresholds
const MAX_DAYS_AHEAD = 31

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

  // Single query: all active memberships expiring within the next 31 days
  const expiringMemberships = await prisma.membership.findMany({
    where: {
      status: 'ACTIVE',
      endDate: {
        gte: now,
        lt: addDays(now, MAX_DAYS_AHEAD),
      },
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      plan: { select: { name: true, durationValue: true, durationType: true } },
    },
  })

  if (expiringMemberships.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No memberships expiring soon',
      sent: 0,
    })
  }

  const gymIds = [...new Set(expiringMemberships.map((m) => m.gymId))]

  // Fetch dedup data and admins in parallel
  const [recentNotifications, gymAdmins] = await Promise.all([
    prisma.notification.findMany({
      where: {
        gymId: { in: gymIds },
        type: 'MEMBERSHIP',
        title: { contains: 'Expiring' },
        createdAt: { gte: addDays(now, -3) },
      },
      select: { userId: true, link: true, title: true },
    }),
    prisma.user.findMany({
      where: {
        gymId: { in: gymIds },
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true, gymId: true },
    }),
  ])

  // Dedup key: "userId:link:title" — prevents re-sending the same alert within 3 days
  const alreadySent = new Set(
    recentNotifications.map((n) => `${n.userId}:${n.link ?? ''}:${n.title}`)
  )

  const adminsByGym = new Map<string, string[]>()
  for (const admin of gymAdmins) {
    const existing = adminsByGym.get(admin.gymId) ?? []
    adminsByGym.set(admin.gymId, [...existing, admin.id])
  }

  let totalSent = 0

  for (const membership of expiringMemberships) {
    const { gymId, userId, user, plan, endDate } = membership

    const daysUntilExpiry = (endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
    const planDays = planDurationDays(plan.durationValue, plan.durationType)
    const thresholds = getThresholdsForPlan(planDays)

    // Find which threshold this membership currently sits at (±1 day window)
    const matchedThreshold = thresholds.find(
      (t) => daysUntilExpiry >= t - 1 && daysUntilExpiry < t + 1
    )
    if (matchedThreshold === undefined) continue

    const dayLabel = `${matchedThreshold} day${matchedThreshold === 1 ? '' : 's'}`
    const memberName = `${user.firstName} ${user.lastName}`
    const endDateStr = endDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    const memberTitle = `Membership Expiring in ${dayLabel}`
    const adminTitle = `Member Subscription Expiring in ${dayLabel}`

    // Notify the member
    const memberLink = '/member/membership'
    const memberDedupKey = `${userId}:${memberLink}:${memberTitle}`
    if (!alreadySent.has(memberDedupKey)) {
      sendNotification(
        gymId,
        userId,
        'MEMBERSHIP',
        memberTitle,
        `Your ${plan.name} membership expires in ${dayLabel} (${endDateStr}). Renew now to keep your access.`,
        memberLink
      )
      alreadySent.add(memberDedupKey)
      totalSent++
    }

    // Notify every admin in the gym
    const admins = adminsByGym.get(gymId) ?? []
    for (const adminId of admins) {
      const adminLink = `/admin/members/${userId}`
      const adminDedupKey = `${adminId}:${adminLink}:${adminTitle}`
      if (!alreadySent.has(adminDedupKey)) {
        sendNotification(
          gymId,
          adminId,
          'MEMBERSHIP',
          adminTitle,
          `${memberName}'s ${plan.name} membership expires in ${dayLabel} (${endDateStr}).`,
          adminLink
        )
        alreadySent.add(adminDedupKey)
        totalSent++
      }
    }
  }

  return NextResponse.json({
    success: true,
    message: `Sent ${totalSent} membership expiry notification(s)`,
    sent: totalSent,
  })
}
