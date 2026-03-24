'use server'

import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { signupRateLimiter, getClientIp, checkRateLimit } from '@/lib/rate-limiter'
import { getRedis } from '@/lib/redis'
import { verifyTurnstile } from '@/lib/turnstile'
import { sendMemberVerificationEmail } from '@/lib/email'

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

type MemberSignupFormData = MemberSignupInput & {
  honeypot?: string
  turnstileToken?: string
}

const VERIFICATION_TOKEN_TTL = 60 * 60 * 24 // 24 hours in seconds

export async function signupMember(input: MemberSignupFormData) {
  try {
    // Honeypot check — silently succeed if a hidden field was filled (bot behaviour)
    if (input.honeypot) {
      return { success: true, data: { memberId: '', gymId: input.gymId } }
    }

    const headersList = await headers()
    const clientIp = getClientIp(headersList)
    await checkRateLimit(signupRateLimiter, clientIp)

    // Turnstile verification
    const turnstileOk = await verifyTurnstile(input.turnstileToken ?? '', clientIp)
    if (!turnstileOk) {
      return {
        success: false,
        error: 'Security check failed. Please refresh the page and try again.',
      }
    }

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

    // Send email verification — fire-and-forget so signup still succeeds if email fails
    const token = randomBytes(32).toString('hex')
    const redis = getRedis()
    redis
      .setex(
        `member:email:verify:${token}`,
        VERIFICATION_TOKEN_TTL,
        JSON.stringify({
          userId: member.id,
          gymId: validated.gymId,
          email: validated.email,
          gymSlug: gym.slug,
        })
      )
      .catch(() => {})
    sendMemberVerificationEmail(validated.email, {
      name: validated.firstName,
      gymName: gym.name,
      verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-member-email?token=${token}`,
    }).catch(() => {})

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

    if (error instanceof Error && error.message.includes('Rate limit')) {
      return {
        success: false,
        error: 'Too many signup attempts. Please try again later.',
      }
    }

    return {
      success: false,
      error: 'Failed to create account. Please try again.',
    }
  }
}
