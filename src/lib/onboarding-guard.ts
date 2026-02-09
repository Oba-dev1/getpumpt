import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export const isGymOnboardingComplete = cache(async (gymId: string) => {
  if (!gymId) return false
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { onboardingCompletedAt: true },
  })

  return Boolean(gym?.onboardingCompletedAt)
})
