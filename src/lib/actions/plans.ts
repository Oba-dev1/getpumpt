'use server'

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireGymAdminAuth } from '@/lib/auth-helpers'

interface CreatePlanInput {
  gymId: string
  name: string
  description?: string
  price: number
  currency?: string
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  durationValue: number
  durationType: 'DAYS' | 'MONTHS' | 'YEARS'
  classCredits?: number
  features?: string[]
  isActive?: boolean
  isFeatured?: boolean
}

interface UpdatePlanInput {
  name?: string
  description?: string
  price?: number
  currency?: string
  billingCycle?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  durationValue?: number
  durationType?: 'DAYS' | 'MONTHS' | 'YEARS'
  classCredits?: number
  features?: string[]
  isActive?: boolean
  isFeatured?: boolean
}

export async function getMembershipPlans(gymId: string, includeInactive = false) {
  await requireGymAdminAuth(gymId)

  const plans = await prisma.membershipPlan.findMany({
    where: {
      gymId,
      ...(includeInactive ? {} : { isActive: true }),
    },
    include: {
      _count: {
        select: { memberships: { where: { status: 'ACTIVE' } } },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: Number(plan.price),
    currency: plan.currency,
    billingCycle: plan.billingCycle,
    durationValue: plan.durationValue,
    durationType: plan.durationType,
    classCredits: plan.classCredits,
    features: plan.features,
    isActive: plan.isActive,
    isFeatured: plan.isFeatured,
    sortOrder: plan.sortOrder,
    subscriberCount: plan._count.memberships,
    createdAt: plan.createdAt,
  }))
}

export async function getPlanById(gymId: string, planId: string) {
  await requireGymAdminAuth(gymId)

  const plan = await prisma.membershipPlan.findUnique({
    where: { id: planId, gymId },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      currency: true,
      billingCycle: true,
      durationValue: true,
      durationType: true,
      classCredits: true,
      features: true,
      isActive: true,
      isFeatured: true,
    },
  })

  if (!plan) {
    throw new Error('Plan not found')
  }

  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: Number(plan.price),
    currency: plan.currency,
    billingCycle: plan.billingCycle,
    durationValue: plan.durationValue,
    durationType: plan.durationType,
    classCredits: plan.classCredits,
    features: plan.features,
    isActive: plan.isActive,
    isFeatured: plan.isFeatured,
  }
}

export async function createMembershipPlan(
  input: CreatePlanInput
): Promise<{ id?: string; error?: string }> {
  try {
    await requireGymAdminAuth(input.gymId)

    if (!input.gymId) {
      return { error: 'Gym ID is required' }
    }

    if (!input.name || input.name.trim().length < 2) {
      return { error: 'Plan name must be at least 2 characters' }
    }

    if (Number.isNaN(input.price) || input.price <= 0) {
      return { error: 'Price must be a valid positive number' }
    }

    if (Number.isNaN(input.durationValue) || input.durationValue <= 0) {
      return { error: 'Duration must be a valid positive number' }
    }

    const maxSortOrder = await prisma.membershipPlan.aggregate({
      where: { gymId: input.gymId },
      _max: { sortOrder: true },
    })

    const plan = await prisma.membershipPlan.create({
      data: {
        gymId: input.gymId,
        name: input.name,
        description: input.description,
        price: input.price,
        currency: input.currency ?? 'NGN',
        billingCycle: input.billingCycle,
        durationValue: input.durationValue,
        durationType: input.durationType,
        classCredits: input.classCredits,
        features: input.features ?? [],
        isActive: input.isActive ?? true,
        isFeatured: input.isFeatured ?? false,
        sortOrder: (maxSortOrder._max.sortOrder ?? 0) + 1,
      },
    })

    if (input.isFeatured) {
      await prisma.membershipPlan.updateMany({
        where: {
          gymId: input.gymId,
          id: { not: plan.id },
          isFeatured: true,
        },
        data: { isFeatured: false },
      })
    }

    const gym = await prisma.gym.findUnique({
      where: { id: input.gymId },
      select: { slug: true },
    })

    revalidatePath('/admin/plans')
    if (gym) {
      revalidatePath(`/gym/${gym.slug}`)
    }
    revalidatePath('/member')
    return { id: plan.id }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { error: 'A plan with this name already exists' }
      }
      if (error.code === 'P2003') {
        return { error: 'Invalid gym ID' }
      }
      return { error: `Database error: ${error.code}` }
    }
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function updateMembershipPlan(
  gymId: string,
  planId: string,
  input: UpdatePlanInput
) {
  await requireGymAdminAuth(gymId)

  const plan = await prisma.membershipPlan.update({
    where: { id: planId, gymId },
    data: input,
  })

  if (input.isFeatured === true) {
    await prisma.membershipPlan.updateMany({
      where: {
        gymId,
        id: { not: planId },
        isFeatured: true,
      },
      data: { isFeatured: false },
    })
  }

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { slug: true },
  })

  revalidatePath('/admin/plans')
  revalidatePath(`/admin/plans/${planId}`)
  if (gym) {
    revalidatePath(`/gym/${gym.slug}`)
  }
  revalidatePath('/member')
  return { id: plan.id }
}

export async function deleteMembershipPlan(gymId: string, planId: string) {
  await requireGymAdminAuth(gymId)

  const activeSubscribers = await prisma.membership.count({
    where: { planId, gymId, status: 'ACTIVE' },
  })

  if (activeSubscribers > 0) {
    throw new Error('Cannot delete plan with active subscribers')
  }

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { slug: true },
  })

  await prisma.membershipPlan.delete({
    where: { id: planId, gymId },
  })

  revalidatePath('/admin/plans')
  if (gym) {
    revalidatePath(`/gym/${gym.slug}`)
  }
  revalidatePath('/member')
}

export async function togglePlanStatus(gymId: string, planId: string) {
  await requireGymAdminAuth(gymId)

  const plan = await prisma.membershipPlan.findUnique({
    where: { id: planId, gymId },
  })

  if (!plan) {
    throw new Error('Plan not found')
  }

  const [updated, gym] = await Promise.all([
    prisma.membershipPlan.update({
      where: { id: planId },
      data: { isActive: !plan.isActive },
    }),
    prisma.gym.findUnique({
      where: { id: gymId },
      select: { slug: true },
    }),
  ])

  revalidatePath('/admin/plans')
  if (gym) {
    revalidatePath(`/gym/${gym.slug}`)
  }
  revalidatePath('/member')
  return { id: updated.id, isActive: updated.isActive }
}
