'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function resetPassword(input: { token: string; password: string }) {
  try {
    const validated = resetPasswordSchema.parse(input)

    const tokenHash = crypto.createHash('sha256').update(validated.token).digest('hex')

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
    })

    if (!resetToken) {
      return {
        success: false as const,
        error: 'Invalid or expired reset link. Please request a new one.',
      }
    }

    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      })
      return {
        success: false as const,
        error: 'This reset link has expired. Please request a new one.',
      }
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10)

    // Update password for all accounts with this email (cross-gym)
    await prisma.user.updateMany({
      where: { email: resetToken.email },
      data: { passwordHash: hashedPassword },
    })

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    return {
      success: true as const,
      message: 'Your password has been reset successfully.',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error: error.issues[0].message,
      }
    }

    return {
      success: false as const,
      error: 'Something went wrong. Please try again.',
    }
  }
}
