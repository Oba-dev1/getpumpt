'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { normalizePhone } from '@/lib/otp-helpers'
import { initializeMembershipPayment } from '@/lib/actions/payments'
import { createBooking } from '@/lib/actions/bookings'
import type { MemberActionState } from '@/components/member/MemberActionForm'
import {
  updateProfileSchema,
  changePasswordSchema,
  membershipPaymentSchema,
  cancelBookingSchema,
  notificationIdSchema,
  classBookingSchema,
} from '@/lib/validations'

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    'http://localhost:3000'
  )
}

export async function getMemberProfile() {
  const user = await requireAuth()

  return prisma.user.findFirst({
    where: { id: user.id, gymId: user.gymId, deletedAt: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function updateMemberProfile(
  _prevState: MemberActionState,
  formData: FormData
) {
  const user = await requireAuth()

  const parsed = updateProfileSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
  })

  if (!parsed.success) {
    const error = parsed.error.issues[0]
    return { status: 'error' as const, message: error?.message || 'Invalid input' }
  }

  try {
    await prisma.user.update({
      where: { id: user.id, gymId: user.gymId },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        // Store phone in E.164 so it matches the format used by phone/OTP login lookups.
        phone: parsed.data.phone ? normalizePhone(parsed.data.phone) : null,
      },
    })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: unknown }).code === 'P2002') {
      return { status: 'error' as const, message: 'That phone number is already in use by another member.' }
    }
    throw error
  }

  revalidatePath('/member/profile')
  revalidatePath('/member')
  return { status: 'success' as const, message: 'Profile updated.' }
}

export async function changeMemberPassword(
  _prevState: MemberActionState,
  formData: FormData
) {
  const user = await requireAuth()

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    const error = parsed.error.issues[0]
    return { status: 'error' as const, message: error?.message || 'Invalid input' }
  }

  const dbUser = await prisma.user.findFirst({
    where: { id: user.id, gymId: user.gymId, deletedAt: null },
    select: { passwordHash: true },
  })

  if (!dbUser?.passwordHash) {
    return { status: 'error' as const, message: 'Password change is not available for this account.' }
  }

  const isMatch = await bcrypt.compare(parsed.data.currentPassword, dbUser.passwordHash)
  if (!isMatch) {
    return { status: 'error' as const, message: 'Current password is incorrect.' }
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10)

  await prisma.user.update({
    where: { id: user.id, gymId: user.gymId },
    data: { passwordHash: newHash },
  })

  revalidatePath('/member/profile')
  return { status: 'success' as const, message: 'Password updated successfully.' }
}

export async function getMemberMembership() {
  const user = await requireAuth()

  const membership = await prisma.membership.findUnique({
    where: { userId: user.id, gymId: user.gymId },
    include: {
      plan: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!membership) return null

  return {
    id: membership.id,
    status: membership.status,
    startDate: membership.startDate,
    endDate: membership.endDate,
    autoRenew: membership.autoRenew,
    plan: {
      id: membership.plan.id,
      name: membership.plan.name,
      price: Number(membership.plan.price),
      currency: membership.plan.currency,
      billingCycle: membership.plan.billingCycle,
      durationValue: membership.plan.durationValue,
      durationType: membership.plan.durationType,
      classCredits: membership.plan.classCredits,
      features: membership.plan.features,
    },
    payments: membership.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      paymentMethod: p.paymentMethod,
      description: p.description,
      createdAt: p.createdAt,
    })),
  }
}

export async function startMembershipPayment(
  _prevState: MemberActionState,
  formData: FormData
) {
  const user = await requireAuth()

  const parsed = membershipPaymentSchema.safeParse({
    membershipId: formData.get('membershipId'),
  })

  if (!parsed.success) {
    const error = parsed.error.issues[0]
    return { status: 'error' as const, message: error?.message || 'Invalid input' }
  }

  try {
    const callbackUrl = `${getAppUrl()}/api/payments/verify`
    const payment = await initializeMembershipPayment(
      user.gymId,
      user.id,
      parsed.data.membershipId,
      callbackUrl
    )
    redirect(payment.authorizationUrl)
  } catch (error: any) {
    if (isRedirectError(error)) throw error
    return { status: 'error' as const, message: error?.message || 'Unable to start payment.' }
  }

  return { status: 'success' as const, message: 'Redirecting to payment...' }
}

export async function getMemberPayments() {
  const user = await requireAuth()

  const payments = await prisma.payment.findMany({
    where: { userId: user.id, gymId: user.gymId },
    orderBy: { createdAt: 'desc' },
    take: 25,
    include: {
      membership: {
        include: {
          plan: { select: { name: true } },
        },
      },
    },
  })

  return payments.map((payment) => ({
    id: payment.id,
    amount: Number(payment.amount),
    currency: payment.currency,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    description: payment.description,
    createdAt: payment.createdAt,
    planName: payment.membership?.plan?.name ?? null,
  }))
}

export async function getMemberBookings() {
  const user = await requireAuth()

  return prisma.classBooking.findMany({
    where: { userId: user.id, gymId: user.gymId },
    orderBy: { date: 'desc' },
    include: {
      schedule: {
        include: {
          gymClass: { select: { name: true, duration: true } },
          trainer: { select: { firstName: true, lastName: true } },
        },
      },
    },
    take: 30,
  })
}

export async function cancelMemberBooking(
  _prevState: MemberActionState,
  formData: FormData
) {
  const user = await requireAuth()

  const parsed = cancelBookingSchema.safeParse({
    bookingId: formData.get('bookingId'),
  })

  if (!parsed.success) {
    const error = parsed.error.issues[0]
    return { status: 'error' as const, message: error?.message || 'Invalid input' }
  }

  const booking = await prisma.classBooking.findUnique({
    where: { id: parsed.data.bookingId },
  })

  if (!booking || booking.userId !== user.id) {
    return { status: 'error' as const, message: 'Booking not found.' }
  }

  if (booking.status !== 'CONFIRMED') {
    return { status: 'error' as const, message: 'Only confirmed bookings can be cancelled.' }
  }

  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (booking.date < startOfToday) {
    return { status: 'error' as const, message: 'Past bookings cannot be cancelled.' }
  }

  await prisma.classBooking.update({
    where: { id: parsed.data.bookingId },
    data: { status: 'CANCELLED' },
  })

  revalidatePath('/member/bookings')
  revalidatePath('/member')
  return { status: 'success' as const, message: 'Booking cancelled.' }
}

export async function getMemberClasses() {
  const user = await requireAuth()

  const schedules = await prisma.classSchedule.findMany({
    where: {
      gymId: user.gymId,
      isActive: true,
      gymClass: { isActive: true },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    select: {
      id: true,
      dayOfWeek: true,
      startTime: true,
      endTime: true,
      location: true,
      maxCapacity: true,
      gymClass: {
        select: {
          name: true,
          description: true,
          duration: true,
          category: true,
        },
      },
      trainer: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    take: 50,
  })

  const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const
  const today = new Date()
  const todayIndex = today.getDay()

  const nextDateForDay = (dayOfWeek: string) => {
    const targetIndex = dayMap.indexOf(dayOfWeek as typeof dayMap[number])
    if (targetIndex === -1) return null
    const diff = targetIndex >= todayIndex ? targetIndex - todayIndex : 7 - (todayIndex - targetIndex)
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff)
  }

  const scheduleWithAvailability = await Promise.all(
    schedules.map(async (schedule) => {
      const nextDate = nextDateForDay(schedule.dayOfWeek)
      const booked = nextDate
        ? await prisma.classBooking.count({
            where: {
              scheduleId: schedule.id,
              date: nextDate,
              status: { not: 'CANCELLED' },
            },
          })
        : 0
      const remaining = Math.max(schedule.maxCapacity - booked, 0)

      return {
        ...schedule,
        nextDate,
        remainingSpots: remaining,
        bookedSpots: booked,
      }
    })
  )

  return scheduleWithAvailability
}

export async function getMemberDashboardData() {
  const user = await requireAuth()

  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const [membership, upcomingBookings, recentPayments, unreadNotifications] = await Promise.all([
    prisma.membership.findUnique({
      where: { userId: user.id, gymId: user.gymId },
      include: { plan: true },
    }),
    prisma.classBooking.findMany({
      where: { userId: user.id, gymId: user.gymId, date: { gte: startOfToday } },
      orderBy: { date: 'asc' },
      take: 3,
      include: {
        schedule: {
          include: {
            gymClass: { select: { name: true, duration: true } },
            trainer: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.payment.findMany({
      where: { userId: user.id, gymId: user.gymId },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        membership: { include: { plan: { select: { name: true } } } },
      },
    }),
    prisma.notification.count({
      where: { userId: user.id, gymId: user.gymId, isRead: false },
    }),
  ])

  return {
    membership: membership
      ? {
          id: membership.id,
          status: membership.status,
          startDate: membership.startDate,
          endDate: membership.endDate,
          autoRenew: membership.autoRenew,
          plan: {
            id: membership.plan.id,
            name: membership.plan.name,
            price: Number(membership.plan.price),
            currency: membership.plan.currency,
            billingCycle: membership.plan.billingCycle,
          },
        }
      : null,
    upcomingBookings,
    recentPayments: recentPayments.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
      planName: payment.membership?.plan?.name ?? null,
    })),
    unreadNotifications,
  }
}

export async function getMemberNotifications() {
  const user = await requireAuth()

  return prisma.notification.findMany({
    where: { userId: user.id, gymId: user.gymId },
    orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
    take: 50,
  })
}

export async function markMemberNotificationReadAction(
  _prevState: MemberActionState,
  formData: FormData
) {
  const user = await requireAuth()

  const parsed = notificationIdSchema.safeParse({
    notificationId: formData.get('notificationId'),
  })

  if (!parsed.success) {
    const error = parsed.error.issues[0]
    return { status: 'error' as const, message: error?.message || 'Invalid input' }
  }

  const notification = await prisma.notification.findUnique({
    where: { id: parsed.data.notificationId },
  })

  if (!notification || notification.userId !== user.id) {
    return { status: 'error' as const, message: 'Notification not found.' }
  }

  await prisma.notification.update({
    where: { id: parsed.data.notificationId },
    data: { isRead: true },
  })

  revalidatePath('/member/notifications')
  return { status: 'success' as const, message: 'Marked as read.' }
}

export async function markAllMemberNotificationsReadAction(
  _prevState: MemberActionState,
  _formData: FormData
) {
  const user = await requireAuth()

  await prisma.notification.updateMany({
    where: { userId: user.id, gymId: user.gymId, isRead: false },
    data: { isRead: true },
  })

  revalidatePath('/member/notifications')
  return { status: 'success' as const, message: 'All notifications marked as read.' }
}

export async function createMemberBooking(
  _prevState: MemberActionState,
  formData: FormData
) {
  const user = await requireAuth()

  const parsed = classBookingSchema.safeParse({
    scheduleId: formData.get('scheduleId'),
    date: formData.get('date'),
  })

  if (!parsed.success) {
    const error = parsed.error.issues[0]
    return { status: 'error' as const, message: error?.message || 'Invalid input' }
  }

  const schedule = await prisma.classSchedule.findUnique({
    where: { id: parsed.data.scheduleId },
    select: { id: true, gymId: true },
  })

  if (!schedule || schedule.gymId !== user.gymId) {
    return { status: 'error' as const, message: 'Invalid class schedule.' }
  }

  const bookingDate = typeof parsed.data.date === 'string'
    ? new Date(`${parsed.data.date}T00:00:00`)
    : parsed.data.date

  try {
    await createBooking({
      gymId: user.gymId,
      userId: user.id,
      scheduleId: parsed.data.scheduleId,
      date: bookingDate,
    })
  } catch (error: any) {
    return { status: 'error' as const, message: error?.message || 'Unable to create booking.' }
  }

  revalidatePath('/member/bookings')
  revalidatePath('/member')
  return { status: 'success' as const, message: 'Booking created.' }
}
