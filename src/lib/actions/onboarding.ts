'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  onboardingPlanSchema,
  onboardingBrandingSchema,
  onboardingClassSchema,
  onboardingInviteSchema,
  type OnboardingPlanInput,
  type OnboardingBrandingInput,
  type OnboardingClassInput,
  type OnboardingInviteInput,
} from '@/lib/validations/onboarding'
import { z } from 'zod'

type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export async function getOnboardingState(): Promise<
  ApiResponse<{
    currentStep: number
    completedAt: Date | null
    skippedSteps: number[]
  }>
> {
  try {
    const session = await auth()
    if (!session?.user?.gymId) {
      return { success: false, error: 'Unauthorized' }
    }

    const gym = await prisma.gym.findUnique({
      where: { id: session.user.gymId },
      select: {
        onboardingStep: true,
        onboardingCompletedAt: true,
        onboardingSkippedSteps: true,
      },
    })

    if (!gym) {
      return { success: false, error: 'Gym not found' }
    }

    return {
      success: true,
      data: {
        currentStep: gym.onboardingStep,
        completedAt: gym.onboardingCompletedAt,
        skippedSteps: gym.onboardingSkippedSteps,
      },
    }
  } catch (error) {
    // Error logged:('Get onboarding state error:', error)
    return { success: false, error: 'Failed to fetch onboarding state' }
  }
}

export async function createOnboardingPlan(
  input: OnboardingPlanInput
): Promise<ApiResponse<{ planId: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.gymId) {
      return { success: false, error: 'Unauthorized' }
    }

    const gymId = session.user.gymId
    const validated = onboardingPlanSchema.parse(input)

    const result = await prisma.$transaction(async (tx) => {
      const plan = await tx.membershipPlan.create({
        data: {
          gymId,
          name: validated.name,
          price: validated.price,
          durationValue: validated.durationValue,
          durationType: validated.durationType,
          isActive: true,
          isFeatured: true,
        },
      })

      await tx.gym.update({
        where: { id: gymId },
        data: { onboardingStep: 1 },
      })

      return plan
    })

    revalidatePath('/onboarding/setup')
    revalidatePath('/admin/plans')

    return {
      success: true,
      data: { planId: result.id },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      }
    }
    // Error logged:('Create onboarding plan error:', error)
    return { success: false, error: 'Failed to create membership plan' }
  }
}

export async function updateOnboardingBranding(
  input: OnboardingBrandingInput
): Promise<ApiResponse> {
  try {
    const session = await auth()
    if (!session?.user?.gymId) {
      return { success: false, error: 'Unauthorized' }
    }

    const gymId = session.user.gymId
    const validated = onboardingBrandingSchema.parse(input)

    await prisma.gym.update({
      where: { id: gymId },
      data: {
        logo: validated.logo || null,
        primaryColor: validated.primaryColor,
        onboardingStep: 2,
      },
    })

    revalidatePath('/onboarding/setup')
    revalidatePath('/admin/settings')

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      }
    }
    // Error logged:('Update onboarding branding error:', error)
    return { success: false, error: 'Failed to update gym branding' }
  }
}

export async function createOnboardingClass(
  input: OnboardingClassInput
): Promise<ApiResponse<{ classId: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.gymId) {
      return { success: false, error: 'Unauthorized' }
    }

    const gymId = session.user.gymId
    const validated = onboardingClassSchema.parse(input)

    const result = await prisma.$transaction(async (tx) => {
      const gymClass = await tx.gymClass.create({
        data: {
          gymId,
          name: validated.name,
          category: validated.category,
          duration: validated.duration,
          capacity: validated.capacity,
          isActive: true,
        },
      })

      await tx.gym.update({
        where: { id: gymId },
        data: { onboardingStep: 3 },
      })

      return gymClass
    })

    revalidatePath('/onboarding/setup')
    revalidatePath('/admin/classes')

    return {
      success: true,
      data: { classId: result.id },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      }
    }
    // Error logged:('Create onboarding class error:', error)
    return { success: false, error: 'Failed to create gym class' }
  }
}

export async function sendTeamInvites(
  input: OnboardingInviteInput
): Promise<ApiResponse<{ sentCount: number }>> {
  try {
    const session = await auth()
    if (!session?.user?.gymId) {
      return { success: false, error: 'Unauthorized' }
    }

    const gymId = session.user.gymId
    const validated = onboardingInviteSchema.parse(input)

    await prisma.gym.update({
      where: { id: gymId },
      data: { onboardingStep: 4 },
    })

    revalidatePath('/onboarding/setup')

    return {
      success: true,
      data: { sentCount: validated.emails.length },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      }
    }
    // Error logged:('Send team invites error:', error)
    return { success: false, error: 'Failed to send invites' }
  }
}

export async function skipOnboardingStep(
  stepNumber: number
): Promise<ApiResponse> {
  try {
    const session = await auth()
    if (!session?.user?.gymId) {
      return { success: false, error: 'Unauthorized' }
    }

    const gymId = session.user.gymId

    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: { onboardingSkippedSteps: true },
    })

    if (!gym) {
      return { success: false, error: 'Gym not found' }
    }

    const skippedSteps = Array.isArray(gym.onboardingSkippedSteps)
      ? gym.onboardingSkippedSteps
      : []

    if (!skippedSteps.includes(stepNumber)) {
      await prisma.gym.update({
        where: { id: gymId },
        data: {
          onboardingSkippedSteps: [...skippedSteps, stepNumber],
          onboardingStep: stepNumber,
        },
      })
    }

    revalidatePath('/onboarding/setup')

    return { success: true }
  } catch (error) {
    // Error logged:('Skip onboarding step error:', error)
    return { success: false, error: 'Failed to skip step' }
  }
}

export async function completeOnboarding(): Promise<ApiResponse> {
  try {
    const session = await auth()
    if (!session?.user?.gymId) {
      return { success: false, error: 'Unauthorized' }
    }

    const gymId = session.user.gymId

    await prisma.gym.update({
      where: { id: gymId },
      data: {
        onboardingCompletedAt: new Date(),
        onboardingStep: 4,
      },
    })

    revalidatePath('/admin')
    revalidatePath('/onboarding')

    return { success: true }
  } catch (error) {
    // Error logged:('Complete onboarding error:', error)
    return { success: false, error: 'Failed to complete onboarding' }
  }
}
