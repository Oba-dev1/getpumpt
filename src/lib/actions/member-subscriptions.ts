'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { initializeMembershipPayment } from '@/lib/actions/payments'
import type { MemberActionState } from '@/components/member/MemberActionForm'

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    'http://localhost:3000'
  )
}

function calculateEndDate(
  startDate: Date,
  durationValue: number,
  durationType: 'DAYS' | 'MONTHS' | 'YEARS'
): Date {
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

export async function getMembershipPlans() {
  const user = await requireAuth()

  if (!user.gymId) {
    throw new Error('User gym ID not found. Please contact support.')
  }

  const plans = await prisma.membershipPlan.findMany({
    where: {
      gymId: user.gymId,
      isActive: true,
    },
    orderBy: [
      { isFeatured: 'desc' },
      { sortOrder: 'asc' },
      { price: 'asc' },
    ],
  })

  return plans.map((plan) => ({
    id: plan.id,
    gymId: plan.gymId,
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
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  }))
}

export async function subscribeToPlan(
  _prevState: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  const user = await requireAuth()
  const planId = formData.get('planId') as string

  if (!planId) {
    return { status: 'error', message: 'Plan ID is required' }
  }

  try {
    const existingMembership = await prisma.membership.findUnique({
      where: { userId: user.id },
    })

    if (existingMembership?.status === 'ACTIVE') {
      return {
        status: 'error',
        message: 'You already have an active membership. Please cancel it before subscribing to a new plan.',
      }
    }

    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId, gymId: user.gymId },
    })

    if (!plan) {
      return { status: 'error', message: 'Plan not found' }
    }

    if (!plan.isActive) {
      return { status: 'error', message: 'This plan is no longer available' }
    }

    const startDate = new Date()
    const endDate = calculateEndDate(startDate, plan.durationValue, plan.durationType)

    const membership = existingMembership
      ? await prisma.membership.update({
          where: { id: existingMembership.id },
          data: {
            planId: plan.id,
            status: 'PENDING',
            startDate,
            endDate,
            autoRenew: false,
          },
        })
      : await prisma.membership.create({
          data: {
            gymId: user.gymId,
            userId: user.id,
            planId: plan.id,
            status: 'PENDING',
            startDate,
            endDate,
            autoRenew: false,
          },
        })

    const callbackUrl = `${getAppUrl()}/member/payments/verify`
    const payment = await initializeMembershipPayment(
      user.gymId,
      user.id,
      membership.id,
      callbackUrl
    )

    redirect(payment.authorizationUrl)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to initialize subscription. Please try again.'
    return {
      status: 'error',
      message: errorMessage,
    }
  }

  return { status: 'success', message: 'Redirecting to payment...' }
}
