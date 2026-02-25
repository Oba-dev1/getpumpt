'use server'

import { headers } from 'next/headers'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail, buildFromEmail } from '@/lib/email'
import { passwordResetRateLimiter, getClientIp, checkRateLimit } from '@/lib/rate-limiter'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const TOKEN_EXPIRY_HOURS = 1

export async function requestPasswordReset(input: { email: string }) {
  try {
    const headersList = await headers()
    const clientIp = getClientIp(headersList)
    await checkRateLimit(passwordResetRateLimiter, clientIp)

    const validated = forgotPasswordSchema.parse(input)

    // Always return the same response to prevent email enumeration
    const successResponse = {
      success: true as const,
      message: 'If an account with that email exists, we have sent you a link to reset your password.',
    }

    // Look up the user (may exist in multiple gyms, send to first match)
    const user = await prisma.user.findFirst({
      where: { email: validated.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        gym: { select: { name: true, email: true, customDomain: true } },
      },
    })

    if (!user) {
      return successResponse
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: validated.email },
    })

    // Generate a cryptographically secure token and store only its hash
    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    await prisma.passwordResetToken.create({
      data: {
        email: validated.email,
        token: tokenHash,
        expires,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/reset-password?token=${token}`

    await sendPasswordResetEmail(validated.email, {
      name: user.firstName,
      resetUrl,
    }, user.gym ? buildFromEmail(user.gym) : undefined)

    return successResponse
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error: error.issues[0].message,
      }
    }

    if (error instanceof Error && error.message.includes('Rate limit')) {
      return {
        success: false as const,
        error: 'Too many reset attempts. Please try again later.',
      }
    }

    return {
      success: false as const,
      error: 'Something went wrong. Please try again.',
    }
  }
}
