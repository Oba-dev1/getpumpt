'use server'

import { prisma } from '@/lib/prisma'
import { requireGymAdminAuth } from '@/lib/auth-helpers'

export async function getDashboardStats(gymId: string) {
  await requireGymAdminAuth(gymId)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const totalMembers = await prisma.user.count({
    where: { gymId, role: 'MEMBER', status: 'ACTIVE' },
  })

  const newMembersThisMonth = await prisma.user.count({
    where: {
      gymId,
      role: 'MEMBER',
      createdAt: { gte: startOfMonth },
    },
  })

  const monthlyRevenue = await prisma.payment.aggregate({
    where: {
      gymId,
      status: 'COMPLETED',
      createdAt: { gte: startOfMonth },
    },
    _sum: { amount: true },
  })

  const todayBookings = await prisma.classBooking.count({
    where: {
      gymId,
      date: { gte: startOfDay },
      status: 'CONFIRMED',
    },
  })

  const expiringMemberships = await prisma.membership.count({
    where: {
      gymId,
      status: 'ACTIVE',
      endDate: { gte: now, lte: sevenDaysFromNow },
    },
  })

  const expiringMembershipList = await prisma.membership.findMany({
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
  })

  const recentPayments = await prisma.payment.findMany({
    where: { gymId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const membersByPlan = await prisma.membership.groupBy({
    by: ['planId'],
    where: { gymId, status: 'ACTIVE' },
    _count: { id: true },
  })

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
