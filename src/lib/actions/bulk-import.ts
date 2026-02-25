'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import { requireGymPermission } from '@/lib/auth-helpers'
import { sendPasswordResetEmail, buildFromEmail } from '@/lib/email'
import { logActivity } from '@/lib/audit'
import { bulkMemberImportSchema, type BulkMemberImportInput } from '@/lib/validations'
import { generateSecurePassword } from '@/lib/password-generator'

export interface ImportResult {
  created: number
  updated: number
  skipped: number
  failed: Array<{ row: number; email: string; error: string }>
}

async function sendSetupEmailForMember(
  gymId: string,
  email: string,
  firstName: string,
  lastName: string
): Promise<void> {
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { name: true, slug: true, email: true, customDomain: true },
  })

  if (!gym) return

  await prisma.passwordResetToken.deleteMany({ where: { email } })

  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  // 7-day expiry for bulk imports (more time than single-member 1-hour tokens)
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: { email, token: tokenHash, expires },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${appUrl}/reset-password?token=${rawToken}`

  await sendPasswordResetEmail(email, {
    name: `${firstName} ${lastName}`,
    resetUrl,
  }, buildFromEmail(gym))
}

export async function bulkImportMembers(input: BulkMemberImportInput): Promise<ImportResult> {
  const validated = bulkMemberImportSchema.parse(input)
  const adminUser = await requireGymPermission(validated.gymId, 'members:create')

  const result: ImportResult = { created: 0, updated: 0, skipped: 0, failed: [] }

  // Pre-fetch all emails in this batch to avoid N+1 queries for duplicate detection
  const emailsInBatch = validated.members.map((m) => m.email.toLowerCase())
  const existingUsers = await prisma.user.findMany({
    where: { gymId: validated.gymId, email: { in: emailsInBatch } },
    select: { id: true, email: true },
  })
  const existingEmailMap = new Map(existingUsers.map((u) => [u.email.toLowerCase(), u.id]))

  for (let i = 0; i < validated.members.length; i++) {
    const member = validated.members[i]
    const rowNumber = i + 1
    const emailLower = member.email.toLowerCase()

    try {
      const existingUserId = existingEmailMap.get(emailLower)

      if (existingUserId) {
        if (validated.duplicateStrategy === 'skip') {
          result.skipped++
          continue
        }

        // Update existing member's profile fields (never overwrite password)
        await prisma.user.update({
          where: { id: existingUserId },
          data: {
            firstName: member.firstName,
            lastName: member.lastName,
            ...(member.phone ? { phone: member.phone } : {}),
          },
        })

        result.updated++
        continue
      }

      // Create new member with auto-generated password
      const password = generateSecurePassword()
      const hashedPassword = await bcrypt.hash(password, 10)

      await prisma.user.create({
        data: {
          gymId: validated.gymId,
          firstName: member.firstName,
          lastName: member.lastName,
          email: emailLower,
          phone: member.phone || undefined,
          passwordHash: hashedPassword,
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      })

      result.created++

      // Send account setup email fire-and-forget
      if (validated.sendWelcomeEmail) {
        sendSetupEmailForMember(validated.gymId, emailLower, member.firstName, member.lastName).catch(
          () => {
            // Email failure must not block or roll back the import
          }
        )
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      result.failed.push({ row: rowNumber, email: member.email, error: message })
    }
  }

  logActivity({
    gymId: validated.gymId,
    userId: adminUser.id,
    action: 'CREATE',
    resourceType: 'MEMBER',
    description: `Bulk imported members: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped, ${result.failed.length} failed`,
    metadata: {
      totalRows: validated.members.length,
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
      failedCount: result.failed.length,
    },
  })

  revalidatePath('/admin/members')

  return result
}
