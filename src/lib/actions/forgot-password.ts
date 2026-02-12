'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { passwordResetRateLimiter, getClientIp, checkRateLimit } from '@/lib/rate-limiter'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function requestPasswordReset(input: { email: string }) {
  try {
    const headersList = await headers()
    const clientIp = getClientIp(headersList)
    checkRateLimit(passwordResetRateLimiter, clientIp)

    const validated = forgotPasswordSchema.parse(input)

    // TODO: Implement actual password reset email via Resend
    // For now, always return success to prevent email enumeration
    return {
      success: true,
      message: 'If an account with that email exists, we have sent you a link to reset your password.',
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
        error: 'Too many reset attempts. Please try again later.',
      }
    }

    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    }
  }
}
