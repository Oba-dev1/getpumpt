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
import { normalizePhone } from '@/lib/otp-helpers'

export interface ImportResult {
  created: number
  updated: number
  skipped: number
  expiredMemberships: number
  failed: Array<{ row: number; identifier: string; error: string }>
  unrecognizedPlanNames: string[]
  membersWithPaymentDateNoPlan: Array<{ name: string; identifier: string; paymentDate: string }>
}

function calculateEndDate(startDate: Date, durationValue: number, durationType: 'DAYS' | 'MONTHS' | 'YEARS'): Date {
  const end = new Date(startDate)
  if (durationType === 'DAYS') end.setDate(end.getDate() + durationValue)
  else if (durationType === 'MONTHS') end.setMonth(end.getMonth() + durationValue)
  else end.setFullYear(end.getFullYear() + durationValue)
  return end
}

function parseStartDate(value: string): Date | null {
  if (!value.trim()) return null

  // Try DD/MM/YYYY or DD-MM-YYYY first — common in Nigeria/UK and avoids
  // the JS ambiguity where new Date("03/04/2025") → March 4, not April 3
  const ddmmyyyy = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy
    const parsed = new Date(Number(year), Number(month) - 1, Number(day))
    if (!isNaN(parsed.getTime())) return parsed
  }

  // Fallback: ISO 8601 (YYYY-MM-DD) and unambiguous named-month formats
  // Guard to ISO-style or named-month only — avoids re-parsing MM/DD/YYYY
  if (/^\d{4}-\d{2}-\d{2}/.test(value) || /[a-zA-Z]/.test(value)) {
    const direct = new Date(value)
    if (!isNaN(direct.getTime())) return direct
  }

  return null
}

type PlanEntry = { id: string; name: string; durationValue: number; durationType: string }

// Multi-strategy plan name matching.
// Tries: (1) exact lowercase match, (2) collapse all internal spaces, then scans
// every plan key with the same two strategies.  This lets "1 month", "1month",
// and "1Month" all resolve to the same plan without an external fuzzy library.
function matchPlan(rawName: string, planByName: Map<string, PlanEntry>): PlanEntry | undefined {
  if (!rawName) return undefined

  const lower = rawName.toLowerCase().trim()
  const noSpaces = lower.replace(/\s+/g, '')

  // 1. Exact lower-cased key
  const exact = planByName.get(lower)
  if (exact) return exact

  // 2. Collapsed-spaces key
  const collapsed = planByName.get(noSpaces)
  if (collapsed) return collapsed

  // 3. Scan all plan keys and compare collapsed forms
  for (const [key, plan] of planByName) {
    if (key.replace(/\s+/g, '') === noSpaces) return plan
  }

  return undefined
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

  const result: ImportResult = { created: 0, updated: 0, skipped: 0, expiredMemberships: 0, failed: [], unrecognizedPlanNames: [], membersWithPaymentDateNoPlan: [] }
  const unrecognizedPlans = new Set<string>()

  // Pre-fetch all active plans for this gym so we can match by name (case-insensitive)
  const gymPlans = await prisma.membershipPlan.findMany({
    where: { gymId: validated.gymId, isActive: true },
    select: { id: true, name: true, durationValue: true, durationType: true },
  })
  const planByName = new Map(gymPlans.map((p) => [p.name.toLowerCase().trim(), p]))

  // Pre-fetch all emails and phones in this batch to avoid N+1 queries for duplicate detection
  const emailsInBatch = validated.members
    .map((m) => m.email?.toLowerCase())
    .filter((e): e is string => Boolean(e))
  const phonesInBatch = validated.members
    .map((m) => m.phone ? normalizePhone(m.phone) : undefined)
    .filter((p): p is string => Boolean(p))

  const [existingByEmail, existingByPhone] = await Promise.all([
    emailsInBatch.length > 0
      ? prisma.user.findMany({
          where: { gymId: validated.gymId, email: { in: emailsInBatch }, deletedAt: null },
          select: { id: true, email: true, phone: true },
        })
      : [],
    phonesInBatch.length > 0
      ? prisma.user.findMany({
          where: { gymId: validated.gymId, phone: { in: phonesInBatch }, deletedAt: null },
          select: { id: true, email: true, phone: true },
        })
      : [],
  ])

  const existingEmailMap = new Map(existingByEmail.map((u) => [(u.email ?? '').toLowerCase(), u.id]))
  const existingPhoneMap = new Map(existingByPhone.map((u) => [u.phone ?? '', u.id]))

  for (let i = 0; i < validated.members.length; i++) {
    const member = validated.members[i]
    const rowNumber = i + 1
    const emailLower = member.email?.toLowerCase()
    const identifier = emailLower ?? member.phone ?? `row ${rowNumber}`

    try {
      const normalizedPhone = member.phone ? normalizePhone(member.phone) : undefined
      const existingUserId =
        (emailLower && existingEmailMap.get(emailLower)) ||
        (normalizedPhone && existingPhoneMap.get(normalizedPhone)) ||
        undefined

      // resolvedUserId tracks the final userId for membership assignment;
      // set from existingUserId or from the newly created user's returned id
      let resolvedUserId: string | undefined = existingUserId

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
            ...(normalizedPhone ? { phone: normalizedPhone } : {}),
          },
        })

        result.updated++
      } else {
        // Create new member with auto-generated password — capture return value to avoid
        // a second query for the userId (prevents race conditions under concurrent imports)
        const password = generateSecurePassword()
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
          data: {
            gymId: validated.gymId,
            firstName: member.firstName,
            lastName: member.lastName,
            ...(emailLower ? { email: emailLower } : {}),
            phone: normalizedPhone || undefined,
            passwordHash: hashedPassword,
            role: 'MEMBER',
            status: 'ACTIVE',
          },
          select: { id: true },
        })

        resolvedUserId = newUser.id
        result.created++

        // Send account setup email fire-and-forget (only for newly created members with email)
        if (validated.sendWelcomeEmail && emailLower) {
          sendSetupEmailForMember(validated.gymId, emailLower, member.firstName, member.lastName).catch(
            () => {
              // Email failure must not block or roll back the import
            }
          )
        }
      }

      // Create or update membership if a plan name was provided
      let membershipCreated = false
      if (member.planName && resolvedUserId) {
        const plan = matchPlan(member.planName, planByName)
        if (!plan) unrecognizedPlans.add(member.planName)
        if (plan) {
          const parsedStart = member.startDate ? parseStartDate(member.startDate) : null
          // If a start date was given but could not be parsed, record a warning and skip
          // membership creation for this row rather than silently defaulting to today
          if (member.startDate && !parsedStart) {
            result.failed.push({
              row: rowNumber,
              identifier,
              error: `Unrecognised start date "${member.startDate}" — use YYYY-MM-DD or DD/MM/YYYY. Member was created without a membership.`,
            })
          }
          if (!parsedStart && member.startDate) continue
          const startDate = parsedStart ?? new Date()
          const endDate = calculateEndDate(startDate, plan.durationValue, plan.durationType as 'DAYS' | 'MONTHS' | 'YEARS')
          const status = (endDate < new Date() ? 'EXPIRED' : 'ACTIVE') as 'EXPIRED' | 'ACTIVE'
          const membershipData = { planId: plan.id, status, startDate, endDate }

          // Use explicit find+create/update instead of upsert so we can enforce gymId
          // on the update path — satisfies multi-tenancy rule for all DB queries
          const existing = await prisma.membership.findFirst({
            where: { userId: resolvedUserId, gymId: validated.gymId },
            select: { id: true },
          })

          if (existing) {
            await prisma.membership.update({
              where: { id: existing.id },
              data: membershipData,
            })
          } else {
            await prisma.membership.create({
              data: { gymId: validated.gymId, userId: resolvedUserId, ...membershipData },
            })
          }

          membershipCreated = true
          if (status === 'EXPIRED') result.expiredMemberships++
        }
      }

      // If a payment date was provided but no membership could be assigned, preserve
      // the date in the result so the admin can use it when manually assigning a plan
      if (resolvedUserId && member.startDate && !membershipCreated) {
        result.membersWithPaymentDateNoPlan.push({
          name: `${member.firstName} ${member.lastName}`.trim(),
          identifier,
          paymentDate: member.startDate,
        })
      }

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      result.failed.push({ row: rowNumber, identifier, error: message })
    }
  }

  result.unrecognizedPlanNames = [...unrecognizedPlans]

  logActivity({
    gymId: validated.gymId,
    userId: adminUser.id,
    action: 'CREATE',
    resourceType: 'MEMBER',
    description: `Bulk imported members: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped, ${result.expiredMemberships} expired memberships, ${result.failed.length} failed`,
    metadata: {
      totalRows: validated.members.length,
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
      expiredMemberships: result.expiredMemberships,
      failedCount: result.failed.length,
      unrecognizedPlanNames: result.unrecognizedPlanNames,
    },
  })

  revalidatePath('/admin/members')

  return result
}
