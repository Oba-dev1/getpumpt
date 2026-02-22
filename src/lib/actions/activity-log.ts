'use server'

import { prisma } from '@/lib/prisma'
import { requireGymPermission } from '@/lib/auth-helpers'
import { activityLogFilterSchema, type ActivityLogFilterInput } from '@/lib/validations'
import type { Prisma } from '@prisma/client'

export async function getActivityLogs(input: ActivityLogFilterInput) {
  const validated = activityLogFilterSchema.parse(input)
  await requireGymPermission(validated.gymId, 'activity:view')

  const page = validated.page ?? 1
  const limit = validated.limit ?? 25
  const skip = (page - 1) * limit

  const where: Prisma.ActivityLogWhereInput = {
    gymId: validated.gymId,
    ...(validated.resourceType && { resourceType: validated.resourceType }),
    ...(validated.userId && { userId: validated.userId }),
    ...(validated.search && {
      description: { contains: validated.search, mode: 'insensitive' as const },
    }),
    ...((validated.startDate || validated.endDate) && {
      createdAt: {
        ...(validated.startDate && { gte: validated.startDate }),
        ...(validated.endDate && { lte: validated.endDate }),
      },
    }),
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.activityLog.count({ where }),
  ])

  return {
    logs: logs.map((log) => ({
      id: log.id,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      description: log.description,
      metadata: log.metadata,
      createdAt: log.createdAt,
      user: {
        id: log.user.id,
        firstName: log.user.firstName,
        lastName: log.user.lastName,
        role: log.user.role,
        avatar: log.user.avatar,
      },
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getActivityLogStaff(gymId: string) {
  await requireGymPermission(gymId, 'activity:view')

  const staff = await prisma.user.findMany({
    where: {
      gymId,
      role: { in: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
    },
    orderBy: { firstName: 'asc' },
  })

  return staff
}
