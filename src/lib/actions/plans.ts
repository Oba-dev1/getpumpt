'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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

export async function createMembershipPlan(input: CreatePlanInput) {
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

  revalidatePath('/admin/plans')
  return { id: plan.id }
}

export async function updateMembershipPlan(
  gymId: string,
  planId: string,
  input: UpdatePlanInput
) {
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

  revalidatePath('/admin/plans')
  revalidatePath(`/admin/plans/${planId}`)
  return { id: plan.id }
}

export async function deleteMembershipPlan(gymId: string, planId: string) {
  const activeSubscribers = await prisma.membership.count({
    where: { planId, status: 'ACTIVE' },
  })

  if (activeSubscribers > 0) {
    throw new Error('Cannot delete plan with active subscribers')
  }

  await prisma.membershipPlan.delete({
    where: { id: planId, gymId },
  })

  revalidatePath('/admin/plans')
}

export async function togglePlanStatus(gymId: string, planId: string) {
  const plan = await prisma.membershipPlan.findUnique({
    where: { id: planId, gymId },
  })

  if (!plan) {
    throw new Error('Plan not found')
  }

  const updated = await prisma.membershipPlan.update({
    where: { id: planId },
    data: { isActive: !plan.isActive },
  })

  revalidatePath('/admin/plans')
  return { id: updated.id, isActive: updated.isActive }
}
