'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireGymPermission } from '@/lib/auth-helpers'
import { logActivity } from '@/lib/audit'
import { checkInSchema, type CheckInInput } from '@/lib/validations'

export async function searchMembersForCheckIn(gymId: string, query: string) {
  await requireGymPermission(gymId, 'members:checkin')

  if (!query || query.trim().length < 2) {
    return []
  }

  const members = await prisma.user.findMany({
    where: {
      gymId,
      role: 'MEMBER',
      status: 'ACTIVE',
      deletedAt: null,
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
      membership: {
        select: {
          id: true,
          status: true,
          startDate: true,
          endDate: true,
          plan: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    take: 10,
    orderBy: { firstName: 'asc' },
  })

  return members
}

export async function checkInMember(gymId: string, input: CheckInInput) {
  const staff = await requireGymPermission(gymId, 'members:checkin')

  const validated = checkInSchema.parse(input)

  const member = await prisma.user.findUnique({
    where: { id: validated.userId, gymId, role: 'MEMBER', deletedAt: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  })

  if (!member) {
    throw new Error('Member not found')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existingCheckIn = await prisma.checkIn.findFirst({
    where: {
      gymId,
      userId: validated.userId,
      createdAt: { gte: today },
    },
  })

  if (existingCheckIn) {
    throw new Error('Member has already been checked in today')
  }

  const checkIn = await prisma.checkIn.create({
    data: {
      gymId,
      userId: validated.userId,
      checkedInBy: staff.id,
      notes: validated.notes,
    },
  })

  logActivity({
    gymId,
    userId: staff.id,
    action: 'CREATE',
    resourceType: 'CHECK_IN',
    resourceId: checkIn.id,
    description: `Checked in member ${member.firstName} ${member.lastName}`,
  })

  revalidatePath('/admin/check-in')

  return {
    ...checkIn,
    memberName: `${member.firstName} ${member.lastName}`,
  }
}

export async function getRecentCheckIns(gymId: string, limit = 20) {
  await requireGymPermission(gymId, 'members:checkin')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const checkIns = await prisma.checkIn.findMany({
    where: {
      gymId,
      createdAt: { gte: today },
    },
    select: {
      id: true,
      notes: true,
      createdAt: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          membership: {
            select: {
              status: true,
              plan: { select: { name: true } },
            },
          },
        },
      },
      staff: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return checkIns
}
