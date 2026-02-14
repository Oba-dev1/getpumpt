'use server'

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

interface LogActivityParams {
  gymId: string
  userId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  resourceType: string
  resourceId?: string
  description: string
  metadata?: Prisma.InputJsonValue
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  prisma.activityLog
    .create({
      data: {
        gymId: params.gymId,
        userId: params.userId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        description: params.description,
        metadata: params.metadata ?? undefined,
      },
    })
    .catch(() => {
      // Fire-and-forget: audit log failure should never block the main action
    })
}
