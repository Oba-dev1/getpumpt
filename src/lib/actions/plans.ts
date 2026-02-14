'use server'

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireGymAdminAuth } from '@/lib/auth-helpers'
import { logActivity } from '@/lib/audit'
import {
  createPlanSchema,
  updatePlanSchema,
  type CreatePlanInput,
  type UpdatePlanInput,
} from '@/lib/validations'

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
    const validated = createPlanSchema.parse(input)
    const user = await requireGymAdminAuth(validated.gymId)

    const maxSortOrder = await prisma.membershipPlan.aggregate({
      where: { gymId: validated.gymId },
      _max: { sortOrder: true },
    })

    const plan = await prisma.membershipPlan.create({
      data: {
        gymId: validated.gymId,
        name: validated.name,
        description: validated.description,
        price: validated.price,
        currency: validated.currency,
        billingCycle: validated.billingCycle,
        durationValue: validated.durationValue,
        durationType: validated.durationType,
        classCredits: validated.classCredits,
        features: validated.features,
        isActive: validated.isActive,
        isFeatured: validated.isFeatured,
        sortOrder: (maxSortOrder._max.sortOrder ?? 0) + 1,
      },
    })

    logActivity({
      gymId: validated.gymId,
      userId: user.id,
      action: 'CREATE',
      resourceType: 'PLAN',
      resourceId: plan.id,
      description: `Created plan ${validated.name}`,
    })

    if (validated.isFeatured) {
      await prisma.membershipPlan.updateMany({
        where: {
          gymId: validated.gymId,
          id: { not: plan.id },
          isFeatured: true,
        },
        data: { isFeatured: false },
      })
    }

    const gym = await prisma.gym.findUnique({
      where: { id: validated.gymId },
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
  const validated = updatePlanSchema.parse(input)
  const user = await requireGymAdminAuth(gymId)

  const plan = await prisma.membershipPlan.update({
    where: { id: planId, gymId },
    data: validated,
  })

  logActivity({
    gymId,
    userId: user.id,
    action: 'UPDATE',
    resourceType: 'PLAN',
    resourceId: planId,
    description: `Updated plan ${planId}`,
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
  const user = await requireGymAdminAuth(gymId)

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

  logActivity({
    gymId,
    userId: user.id,
    action: 'DELETE',
    resourceType: 'PLAN',
    resourceId: planId,
    description: `Deleted membership plan ${planId}`,
  })

  revalidatePath('/admin/plans')
  if (gym) {
    revalidatePath(`/gym/${gym.slug}`)
  }
  revalidatePath('/member')
}

export async function togglePlanStatus(gymId: string, planId: string) {
  const user = await requireGymAdminAuth(gymId)

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

  logActivity({
    gymId,
    userId: user.id,
    action: 'UPDATE',
    resourceType: 'PLAN',
    resourceId: planId,
    description: `${updated.isActive ? 'Activated' : 'Deactivated'} plan ${planId}`,
  })

  revalidatePath('/admin/plans')
  if (gym) {
    revalidatePath(`/gym/${gym.slug}`)
  }
  revalidatePath('/member')
  return { id: updated.id, isActive: updated.isActive }
}
