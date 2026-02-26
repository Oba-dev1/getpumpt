'use server'

import prisma from '@/lib/prisma'
import { sendOtpSms } from '@/lib/sms'
import { generateOtpCode, hashOtpCode, normalizePhone } from '@/lib/otp-helpers'
import { sendOtpSchema } from '@/lib/validations'
import { checkRateLimit, otpSendRateLimiter } from '@/lib/rate-limiter'
import { logActivity } from '@/lib/audit'

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

export async function sendOtp(
  gymId: string,
  phone: string
): Promise<{ success: boolean; message: string }> {
  const parsed = sendOtpSchema.safeParse({ gymId, phone })
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const normalized = normalizePhone(parsed.data.phone)

  try {
    await checkRateLimit(otpSendRateLimiter, `otp:send:${normalized}`)
  } catch {
    return { success: false, message: 'Too many OTP requests. Please wait 15 minutes and try again.' }
  }

  // Look up member — use generic response to prevent phone enumeration
  const user = await prisma.user.findFirst({
    where: { gymId, phone: normalized, role: 'MEMBER', status: 'ACTIVE' },
    select: { id: true, firstName: true },
  })

  const genericResponse = {
    success: true,
    message: 'If this number is registered, you will receive a one-time code shortly.',
  }

  if (!user) {
    return genericResponse
  }

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { name: true },
  })

  if (!gym) {
    return genericResponse
  }

  const code = generateOtpCode()
  const hashed = hashOtpCode(code)
  const expires = new Date(Date.now() + OTP_TTL_MS)

  // Upsert: delete any existing OTP for this gym+phone, then create fresh one
  await prisma.$transaction([
    prisma.otpToken.deleteMany({ where: { gymId, phone: normalized } }),
    prisma.otpToken.create({
      data: { gymId, phone: normalized, code: hashed, expires },
    }),
  ])

  // Fire-and-forget SMS delivery — log failures so operators can detect broken delivery
  sendOtpSms(normalized, code, gym.name).catch((err: unknown) => {
    console.error(`[OTP] SMS delivery failed gym=${gymId} phone=${normalized}:`, err)
  })

  // Log send event (no code logged)
  logActivity({
    gymId,
    userId: user.id,
    action: 'CREATE',
    resourceType: 'MEMBER',
    resourceId: user.id,
    description: `OTP sent to member via SMS`,
  })

  return genericResponse
}
