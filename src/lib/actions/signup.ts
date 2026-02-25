'use server'

import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { signupRateLimiter, getClientIp, checkRateLimit } from '@/lib/rate-limiter'
import { getRedis } from '@/lib/redis'
import { sendGymOwnerVerificationEmail } from '@/lib/email'

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  gymName: z.string().min(2, 'Gym name must be at least 2 characters').max(100),
  country: z.string().min(2, 'Country is required'),
})

export type SignupInput = z.infer<typeof signupSchema>

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function generateUniqueSlug(baseName: string): Promise<string> {
  let slug = generateSlug(baseName)
  let counter = 1

  while (true) {
    const existing = await prisma.gym.findUnique({
      where: { slug },
    })

    if (!existing) {
      return slug
    }

    slug = `${generateSlug(baseName)}-${counter}`
    counter++
  }
}

const VERIFICATION_TOKEN_TTL = 60 * 60 * 24 // 24 hours in seconds

export async function signupGymOwner(input: SignupInput) {
  try {
    const headersList = await headers()
    const clientIp = getClientIp(headersList)
    await checkRateLimit(signupRateLimiter, clientIp)

    const validated = signupSchema.parse(input)

    const existingUser = await prisma.user.findFirst({
      where: { email: validated.email },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'An account with this email already exists',
      }
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10)
    const gymSlug = await generateUniqueSlug(validated.gymName)

    await prisma.$transaction(async (tx) => {
      const gym = await tx.gym.create({
        data: {
          name: validated.gymName,
          slug: gymSlug,
          country: validated.country,
          isActive: false,
        },
      })

      await tx.user.create({
        data: {
          gymId: gym.id,
          firstName: validated.firstName,
          lastName: validated.lastName,
          email: validated.email,
          passwordHash: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      })

      return gym
    })

    const token = randomBytes(32).toString('hex')
    const redis = getRedis()
    await redis.setex(
      `email:verify:${token}`,
      VERIFICATION_TOKEN_TTL,
      JSON.stringify({ email: validated.email, gymSlug })
    )

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`
    await sendGymOwnerVerificationEmail(validated.email, {
      name: validated.firstName,
      gymName: validated.gymName,
      verifyUrl,
    })

    return {
      success: true,
      requiresVerification: true,
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
