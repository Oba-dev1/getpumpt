'use server'

import { prisma } from '@/lib/prisma'

export async function getDashboardStats(gymId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [
    totalMembers,
    newMembersThisMonth,
    monthlyRevenue,
    todayBookings,
    expiringMemberships,
    expiringMembershipList,
    recentPayments,
    membersByPlan,
  ] = await Promise.all([
    prisma.user.count({
      where: { gymId, role: 'MEMBER', status: 'ACTIVE' },
    }),

    prisma.user.count({
      where: {
        gymId,
        role: 'MEMBER',
        createdAt: { gte: startOfMonth },
      },
    }),

    prisma.payment.aggregate({
      where: {
        gymId,
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),

    prisma.classBooking.count({
      where: {
        gymId,
        date: { gte: startOfDay },
        status: 'CONFIRMED',
      },
    }),

    prisma.membership.count({
      where: {
        gymId,
        status: 'ACTIVE',
        endDate: { gte: now, lte: sevenDaysFromNow },
      },
    }),

    prisma.membership.findMany({
      where: {
        gymId,
        status: 'ACTIVE',
        endDate: { gte: now, lte: sevenDaysFromNow },
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        plan: { select: { name: true } },
      },
      orderBy: { endDate: 'asc' },
      take: 5,
    }),

    prisma.payment.findMany({
      where: { gymId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),

    prisma.membership.groupBy({
      by: ['planId'],
      where: { gymId, status: 'ACTIVE' },
      _count: { id: true },
    }),
  ])

  const planDetails = await prisma.membershipPlan.findMany({
    where: { gymId },
    select: { id: true, name: true },
  })

  const planMap = new Map(planDetails.map((p) => [p.id, p.name]))

  const membershipBreakdown = membersByPlan.map((group) => ({
    planName: planMap.get(group.planId) ?? 'Unknown',
    count: group._count.id,
  }))
  const sortedMembershipBreakdown = [...membershipBreakdown].sort(
    (a, b) => b.count - a.count
  )

  return {
    totalMembers,
    newMembersThisMonth,
    monthlyRevenue: Number(monthlyRevenue._sum.amount ?? 0),
    todayBookings,
    expiringMemberships,
    expiringMembershipList: expiringMembershipList.map((membership) => ({
      id: membership.id,
      memberId: membership.userId,
      memberName: `${membership.user.firstName} ${membership.user.lastName}`,
      memberEmail: membership.user.email,
      planName: membership.plan.name,
      endDate: membership.endDate,
    })),
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      description: p.description,
      memberName: `${p.user.firstName} ${p.user.lastName}`,
      memberEmail: p.user.email,
      createdAt: p.createdAt,
    })),
    membershipBreakdown: sortedMembershipBreakdown,
  }
}
