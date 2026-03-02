'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import crypto from 'crypto'
import { requireGymPermission } from '@/lib/auth-helpers'
import { sendPasswordResetEmail, sendWelcomeEmail, buildFromEmail } from '@/lib/email'
import { logActivity } from '@/lib/audit'
import { sendNotification } from '@/lib/notification-helpers'
import { normalizePhone } from '@/lib/otp-helpers'
import {
  createMemberSchema,
  updateMemberSchema,
  type CreateMemberInput,
  type UpdateMemberInput,
} from '@/lib/validations'

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

export async function getMembers(gymId: string, options?: {
  search?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  sortBy?: 'NAME' | 'JOINED' | 'STATUS'
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}) {
  await requireGymPermission(gymId, 'members:view')

  const page = options?.page ?? 1
  const limit = options?.limit ?? 20
  const skip = (page - 1) * limit
  const sortBy = options?.sortBy ?? 'JOINED'
  const sortDir = options?.sortDir ?? 'desc'

  const where: Prisma.UserWhereInput = {
    gymId,
    role: 'MEMBER',
    deletedAt: null,
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
  await requireGymPermission(gymId, 'members:view')

  const member = await prisma.user.findUnique({
    where: { id: memberId, gymId, deletedAt: null },
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

  return {
    id: member.id,
    gymId: member.gymId,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone,
    avatar: member.avatar,
    status: member.status,
    role: member.role,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    membership: member.membership
      ? {
          id: member.membership.id,
          status: member.membership.status,
          startDate: member.membership.startDate,
          endDate: member.membership.endDate,
          autoRenew: member.membership.autoRenew,
          plan: {
            id: member.membership.plan.id,
            name: member.membership.plan.name,
            price: Number(member.membership.plan.price),
            currency: member.membership.plan.currency,
            billingCycle: member.membership.plan.billingCycle,
            durationValue: member.membership.plan.durationValue,
            durationType: member.membership.plan.durationType,
          },
          payments: member.membership.payments.map((p) => ({
            id: p.id,
            amount: Number(p.amount),
            currency: p.currency,
            status: p.status,
            description: p.description,
            createdAt: p.createdAt,
          })),
        }
      : null,
    payments: member.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      paymentMethod: p.paymentMethod,
      description: p.description,
      createdAt: p.createdAt,
    })),
    bookings: member.bookings.map((b) => ({
      id: b.id,
      date: b.date,
      status: b.status,
      className: b.schedule?.gymClass?.name ?? null,
      trainerName: b.schedule?.trainer
        ? `${b.schedule.trainer.firstName} ${b.schedule.trainer.lastName}`
        : null,
    })),
  }
}

function isPrismaUniqueError(error: unknown): error is { code: string; meta?: { target?: string[] } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'P2002'
  )
}

export async function createMember(input: CreateMemberInput) {
  const validated = createMemberSchema.parse(input)
  const user = await requireGymPermission(validated.gymId, 'members:create')

  const hashedPassword = await bcrypt.hash(validated.password, 10)
  const phoneNormalized = validated.phone ? normalizePhone(validated.phone) : undefined

  let member: Awaited<ReturnType<typeof prisma.user.update>>
  let reactivated = false

  try {
    member = await prisma.user.create({
      data: {
        gymId: validated.gymId,
        firstName: validated.firstName,
        lastName: validated.lastName,
        email: validated.email,
        phone: phoneNormalized,
        passwordHash: hashedPassword,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    })
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      // Check if the conflict is with a previously soft-deleted member
      const orConditions: Prisma.UserWhereInput[] = []
      if (validated.email) orConditions.push({ email: validated.email })
      if (phoneNormalized) orConditions.push({ phone: phoneNormalized })

      const softDeleted = orConditions.length > 0
        ? await prisma.user.findFirst({
            where: { gymId: validated.gymId, deletedAt: { not: null }, OR: orConditions },
          })
        : null

      if (softDeleted) {
        member = await prisma.user.update({
          where: { id: softDeleted.id },
          data: {
            firstName: validated.firstName,
            lastName: validated.lastName,
            email: validated.email,
            phone: phoneNormalized,
            passwordHash: hashedPassword,
            deletedAt: null,
            status: 'ACTIVE',
          },
        })
        reactivated = true
      } else {
        const fields = (error.meta?.target as string[]) ?? []
        if (fields.includes('phone')) {
          throw new Error('A member with this phone number already exists in your gym.')
        }
        if (fields.includes('email')) {
          throw new Error('A member with this email address already exists in your gym.')
        }
        throw new Error('A member with these details already exists.')
      }
    } else {
      throw error
    }
  }

  if (validated.planId) {
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: validated.planId, gymId: validated.gymId },
    })

    if (plan) {
      const startDate = validated.startDate ?? new Date()
      const endDate = calculateEndDate(startDate, plan.durationValue, plan.durationType)
      const membershipStatus = endDate < new Date() ? 'EXPIRED' : 'ACTIVE'

      // Use upsert pattern: reactivated members may already have a membership record
      const existingMembership = await prisma.membership.findUnique({ where: { userId: member.id } })
      if (existingMembership) {
        await prisma.membership.update({
          where: { userId: member.id },
          data: { planId: validated.planId, status: membershipStatus, startDate, endDate },
        })
      } else {
        await prisma.membership.create({
          data: {
            gymId: validated.gymId,
            userId: member.id,
            planId: validated.planId,
            status: membershipStatus,
            startDate,
            endDate,
          },
        })
      }
    }
  }

  logActivity({
    gymId: validated.gymId,
    userId: user.id,
    action: reactivated ? 'UPDATE' : 'CREATE',
    resourceType: 'MEMBER',
    resourceId: member.id,
    description: reactivated
      ? `Reactivated member ${validated.firstName} ${validated.lastName}`
      : `Created member ${validated.firstName} ${validated.lastName}`,
  })

  // Send account setup email for new members only (not reactivations)
  if (!reactivated && validated.email) {
    try {
      const gym = await prisma.gym.findUnique({
        where: { id: validated.gymId },
        select: { name: true, slug: true, email: true, customDomain: true },
      })

      if (gym) {
        await prisma.passwordResetToken.deleteMany({
          where: { email: validated.email },
        })

        const rawToken = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
        const expires = new Date(Date.now() + 60 * 60 * 1000)

        await prisma.passwordResetToken.create({
          data: {
            email: validated.email,
            token: tokenHash,
            expires,
          },
        })

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const resetUrl = `${appUrl}/reset-password?token=${rawToken}`
        const fromEmail = buildFromEmail(gym)
        await sendPasswordResetEmail(validated.email, {
          name: `${validated.firstName} ${validated.lastName}`,
          resetUrl,
        }, fromEmail)

        sendWelcomeEmail(validated.email, {
          name: `${validated.firstName} ${validated.lastName}`,
          gymName: gym.name,
          loginUrl: `${appUrl}/login`,
        }, fromEmail).catch(() => {})
      }
    } catch {
      // Email failure should not block member creation
    }
  }

  if (!reactivated) {
    sendNotification(
      validated.gymId,
      member.id,
      'GENERAL',
      'Welcome!',
      `Your account has been created, ${validated.firstName}. Sign in to explore your member portal.`,
      '/member/dashboard'
    )
  }

  revalidatePath('/admin/members')
  return member
}

export async function updateMember(
  gymId: string,
  memberId: string,
  input: UpdateMemberInput
) {
  const validated = updateMemberSchema.parse(input)
  const user = await requireGymPermission(gymId, 'members:edit')

  let member: Awaited<ReturnType<typeof prisma.user.update>>
  try {
    member = await prisma.user.update({
      where: { id: memberId, gymId },
      data: validated,
    })
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      const fields = (error.meta?.target as string[]) ?? []
      if (fields.includes('phone')) {
        throw new Error('A member with this phone number already exists in your gym.')
      }
      throw new Error('A member with these details already exists.')
    }
    throw error
  }

  logActivity({
    gymId,
    userId: user.id,
    action: 'UPDATE',
    resourceType: 'MEMBER',
    resourceId: memberId,
    description: `Updated member ${memberId}`,
  })

  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${memberId}`)
  return member
}

export async function deleteMember(gymId: string, memberId: string) {
  const user = await requireGymPermission(gymId, 'members:delete')

  const member = await prisma.user.findUnique({
    where: { id: memberId, gymId },
    select: { membership: { select: { status: true, endDate: true } } },
  })

  if (!member) throw new Error('Member not found')

  if (member.membership?.status === 'ACTIVE' && member.membership.endDate > new Date()) {
    throw new Error('Cannot delete a member with an active membership. Cancel their membership first.')
  }

  await prisma.user.update({
    where: { id: memberId, gymId },
    data: { deletedAt: new Date() },
  })

  logActivity({
    gymId,
    userId: user.id,
    action: 'DELETE',
    resourceType: 'MEMBER',
    resourceId: memberId,
    description: `Deleted member ${memberId}`,
  })

  revalidatePath('/admin/members')
}

export async function bulkDeleteMembers(gymId: string, memberIds: string[]): Promise<{ deleted: number }> {
  const user = await requireGymPermission(gymId, 'members:delete')

  if (memberIds.length === 0) throw new Error('No members selected')
  if (memberIds.length > 100) throw new Error('Maximum 100 members per bulk delete')

  // Enforce the same rule as single delete: cannot delete members with an active membership
  const deleted = await prisma.user.updateMany({
    where: {
      id: { in: memberIds },
      gymId,
      deletedAt: null,
      NOT: { membership: { status: 'ACTIVE', endDate: { gt: new Date() } } },
    },
    data: { deletedAt: new Date() },
  })

  logActivity({
    gymId,
    userId: user.id,
    action: 'DELETE',
    resourceType: 'MEMBER',
    description: `Bulk deleted ${deleted.count} member${deleted.count !== 1 ? 's' : ''}`,
    metadata: { memberIds, deleted: deleted.count },
  })

  revalidatePath('/admin/members')
  return { deleted: deleted.count }
}

export async function assignMembership(
  gymId: string,
  memberId: string,
  planId: string,
  startDate?: Date
) {
  const user = await requireGymPermission(gymId, 'members:edit')

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

  logActivity({
    gymId,
    userId: user.id,
    action: 'UPDATE',
    resourceType: 'MEMBER',
    resourceId: memberId,
    description: `Assigned membership plan to member ${memberId}`,
  })

  revalidatePath(`/admin/members/${memberId}`)
  revalidatePath('/admin/members')
}
