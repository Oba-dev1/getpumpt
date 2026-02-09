'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const memberSignupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  gymId: z.string().min(1, 'Please select a gym'),
  planId: z.string().optional(),
})

export type MemberSignupInput = z.infer<typeof memberSignupSchema>

export async function signupMember(input: MemberSignupInput) {
  try {
    const validated = memberSignupSchema.parse(input)

    const existingUser = await prisma.user.findFirst({
      where: {
        email: validated.email,
        gymId: validated.gymId,
      },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'An account with this email already exists at this gym',
      }
    }

    const gym = await prisma.gym.findUnique({
      where: { id: validated.gymId, isActive: true },
    })

    if (!gym) {
      return {
        success: false,
        error: 'Gym not found',
      }
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10)

    const member = await prisma.user.create({
      data: {
        gymId: validated.gymId,
        firstName: validated.firstName,
        lastName: validated.lastName,
        email: validated.email,
        phone: validated.phone,
        passwordHash: hashedPassword,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    })

    if (validated.planId) {
      const plan = await prisma.membershipPlan.findUnique({
        where: { id: validated.planId, gymId: validated.gymId },
      })

      if (plan) {
        const startDate = new Date()
        const endDate = new Date(startDate)

        switch (plan.durationType) {
          case 'DAYS':
            endDate.setDate(endDate.getDate() + plan.durationValue)
            break
          case 'MONTHS':
            endDate.setMonth(endDate.getMonth() + plan.durationValue)
            break
          case 'YEARS':
            endDate.setFullYear(endDate.getFullYear() + plan.durationValue)
            break
        }

        await prisma.membership.create({
          data: {
            gymId: validated.gymId,
            userId: member.id,
            planId: validated.planId,
            status: 'PENDING',
            startDate,
            endDate,
          },
        })
      }
    }

    return {
      success: true,
      data: {
        memberId: member.id,
        gymId: validated.gymId,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      }
    }

    return {
      success: false,
      error: 'Failed to create account. Please try again.',
    }
  }
}

