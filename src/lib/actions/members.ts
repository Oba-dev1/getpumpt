'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'

function calculateEndDate(startDate: Date, durationValue: number, durationType: 'DAYS' | 'MONTHS' | 'YEARS'): Date {
  const end = new Date(startDate)
  switch (durationType) {
    case 'DAYS':
      end.setDate(end.getDate() + durationValue)
      break
    case 'MONTHS':
      end.setMonth(end.getMonth() + durationValue)
      break
    case 'YEARS':
      end.setFullYear(end.getFullYear() + durationValue)
      break
  }
  return end
}

interface CreateMemberInput {
  gymId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  planId?: string
  startDate?: Date
}

interface UpdateMemberInput {
  firstName?: string
  lastName?: string
  phone?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
}

export async function getMembers(gymId: string, options?: {
  search?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  sortBy?: 'NAME' | 'JOINED' | 'STATUS'
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}) {
  const page = options?.page ?? 1
  const limit = options?.limit ?? 20
  const skip = (page - 1) * limit
  const sortBy = options?.sortBy ?? 'JOINED'
  const sortDir = options?.sortDir ?? 'desc'

  const where: Prisma.UserWhereInput = {
    gymId,
    role: 'MEMBER',
    ...(options?.search && {
      OR: [
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ],
    }),
    ...(options?.status && { status: options.status }),
  }

  const orderBy: Prisma.UserOrderByWithRelationInput[] =
    sortBy === 'NAME'
      ? [{ firstName: sortDir }, { lastName: sortDir }]
      : sortBy === 'STATUS'
        ? [{ status: sortDir }, { createdAt: 'desc' }]
        : [{ createdAt: sortDir }]

  const [members, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        membership: {
          include: {
            plan: { select: { name: true, price: true, currency: true } },
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return {
    members: members.map((m) => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      phone: m.phone,
      avatar: m.avatar,
      status: m.status,
      createdAt: m.createdAt,
      membership: m.membership ? {
        plan: m.membership.plan.name,
        status: m.membership.status,
        endDate: m.membership.endDate,
      } : null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getMemberById(gymId: string, memberId: string) {
  const member = await prisma.user.findUnique({
    where: { id: memberId, gymId },
    include: {
      membership: {
        include: {
          plan: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      },
      bookings: {
        include: {
          schedule: {
            include: {
              gymClass: true,
              trainer: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        take: 10,
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!member) {
    throw new Error('Member not found')
  }

  return member
}

export async function createMember(input: CreateMemberInput) {
  const hashedPassword = await bcrypt.hash(input.password, 10)

  const member = await prisma.user.create({
    data: {
      gymId: input.gymId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      passwordHash: hashedPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
    },
  })

  if (input.planId) {
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: input.planId },
    })

    if (plan) {
      const startDate = input.startDate ?? new Date()
      const endDate = calculateEndDate(startDate, plan.durationValue, plan.durationType)

      await prisma.membership.create({
        data: {
          gymId: input.gymId,
          userId: member.id,
          planId: input.planId,
          status: 'ACTIVE',
          startDate,
          endDate,
        },
      })
    }
  }

  revalidatePath('/admin/members')
  return member
}

export async function updateMember(
  gymId: string,
  memberId: string,
  input: UpdateMemberInput
) {
  const member = await prisma.user.update({
    where: { id: memberId, gymId },
    data: input,
  })

  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${memberId}`)
  return member
}

export async function deleteMember(gymId: string, memberId: string) {
  await prisma.user.delete({
    where: { id: memberId, gymId },
  })

  revalidatePath('/admin/members')
}

export async function assignMembership(
  gymId: string,
  memberId: string,
  planId: string,
  startDate?: Date
) {
  const plan = await prisma.membershipPlan.findUnique({
    where: { id: planId, gymId },
  })

  if (!plan) {
    throw new Error('Plan not found')
  }

  const start = startDate ?? new Date()
  const endDate = calculateEndDate(start, plan.durationValue, plan.durationType)

  const existingMembership = await prisma.membership.findUnique({
    where: { userId: memberId },
  })

  if (existingMembership) {
    await prisma.membership.update({
      where: { userId: memberId },
      data: {
        planId,
        status: 'ACTIVE',
        startDate: start,
        endDate,
      },
    })
  } else {
    await prisma.membership.create({
      data: {
        gymId,
        userId: memberId,
        planId,
        status: 'ACTIVE',
        startDate: start,
        endDate,
      },
    })
  }

  revalidatePath(`/admin/members/${memberId}`)
  revalidatePath('/admin/members')
}
