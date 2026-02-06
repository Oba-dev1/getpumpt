'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { requireGymAdminAuth, requireGymOwnerOrAdmin } from '@/lib/auth-helpers'

export async function getBookings(
  gymId: string,
  options?: {
    search?: string
    status?: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
    dateFrom?: Date
    dateTo?: Date
    classId?: string
    trainerId?: string
    page?: number
    limit?: number
  }
) {
  await requireGymAdminAuth(gymId)

  const page = options?.page ?? 1
  const limit = options?.limit ?? 20
  const skip = (page - 1) * limit

  const where: Prisma.ClassBookingWhereInput = {
    gymId,
    ...(options?.status && { status: options.status }),
    ...(options?.classId && { schedule: { classId: options.classId } }),
    ...(options?.trainerId && { schedule: { trainerId: options.trainerId } }),
    ...(options?.dateFrom || options?.dateTo
      ? {
          date: {
            ...(options?.dateFrom && { gte: options.dateFrom }),
            ...(options?.dateTo && { lte: options.dateTo }),
          },
        }
      : {}),
  }

  if (options?.search) {
    const term = options.search
    where.OR = [
      { user: { firstName: { contains: term, mode: 'insensitive' } } },
      { user: { lastName: { contains: term, mode: 'insensitive' } } },
      { user: { email: { contains: term, mode: 'insensitive' } } },
      { schedule: { gymClass: { name: { contains: term, mode: 'insensitive' } } } },
      { schedule: { trainer: { firstName: { contains: term, mode: 'insensitive' } } } },
      { schedule: { trainer: { lastName: { contains: term, mode: 'insensitive' } } } },
    ]
  }

  const [bookings, total] = await Promise.all([
    prisma.classBooking.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        schedule: {
          include: {
            gymClass: { select: { name: true } },
            trainer: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.classBooking.count({ where }),
  ])

  return {
    bookings: bookings.map((booking) => ({
      id: booking.id,
      date: booking.date,
      status: booking.status,
      memberName: `${booking.user.firstName} ${booking.user.lastName}`,
      memberEmail: booking.user.email,
      className: booking.schedule.gymClass.name,
      trainerName: `${booking.schedule.trainer.firstName} ${booking.schedule.trainer.lastName}`,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getBookingById(gymId: string, bookingId: string) {
  await requireGymAdminAuth(gymId)

  const booking = await prisma.classBooking.findUnique({
    where: { id: bookingId, gymId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      schedule: {
        include: {
          gymClass: { select: { name: true, description: true, category: true, duration: true } },
          trainer: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
  })

  if (!booking) {
    throw new Error('Booking not found')
  }

  return {
    id: booking.id,
    date: booking.date,
    status: booking.status,
    memberName: `${booking.user.firstName} ${booking.user.lastName}`,
    memberEmail: booking.user.email,
    className: booking.schedule.gymClass.name,
    classDescription: booking.schedule.gymClass.description,
    classCategory: booking.schedule.gymClass.category,
    classDuration: booking.schedule.gymClass.duration,
    trainerName: `${booking.schedule.trainer.firstName} ${booking.schedule.trainer.lastName}`,
    trainerEmail: booking.schedule.trainer.email,
    scheduleId: booking.scheduleId,
  }
}

export async function updateBookingStatus(
  gymId: string,
  bookingId: string,
  status: 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
) {
  await requireGymAdminAuth(gymId)

  const booking = await prisma.classBooking.findUnique({
    where: { id: bookingId, gymId },
  })

  if (!booking) {
    throw new Error('Booking not found')
  }

  const updated = await prisma.classBooking.update({
    where: { id: bookingId, gymId },
    data: { status },
  })

  revalidatePath('/admin/bookings')
  revalidatePath(`/admin/bookings/${bookingId}`)
  return { id: updated.id, status: updated.status }
}

export async function createBooking(input: {
  gymId: string
  userId: string
  scheduleId: string
  date: Date
  status?: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
}) {
  await requireGymOwnerOrAdmin(input.gymId, input.userId)

  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const bookingDate = new Date(
    input.date.getFullYear(),
    input.date.getMonth(),
    input.date.getDate()
  )

  if (bookingDate < startOfToday) {
    throw new Error('Cannot create a booking in the past')
  }

  const schedule = await prisma.classSchedule.findUnique({
    where: { id: input.scheduleId, gymId: input.gymId },
    select: { dayOfWeek: true, startTime: true, endTime: true, maxCapacity: true },
  })

  if (!schedule) {
    throw new Error('Schedule not found')
  }

  const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const bookingDay = dayMap[bookingDate.getDay()]
  if (schedule.dayOfWeek !== bookingDay) {
    throw new Error('Selected date does not match the schedule day')
  }

  const parseTime = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number)
    return hours * 60 + minutes
  }

  const activeBookings = await prisma.classBooking.count({
    where: {
      gymId: input.gymId,
      scheduleId: input.scheduleId,
      date: bookingDate,
      status: { not: 'CANCELLED' },
    },
  })

  if (activeBookings >= schedule.maxCapacity) {
    throw new Error('This class is fully booked for the selected date')
  }

  const newStart = parseTime(schedule.startTime)
  const newEnd = parseTime(schedule.endTime)

  const existingBookings = await prisma.classBooking.findMany({
    where: {
      gymId: input.gymId,
      userId: input.userId,
      date: bookingDate,
      status: { not: 'CANCELLED' },
    },
    include: {
      schedule: { select: { startTime: true, endTime: true } },
    },
  })

  const hasConflict = existingBookings.some((booking) => {
    const existingStart = parseTime(booking.schedule.startTime)
    const existingEnd = parseTime(booking.schedule.endTime)
    return newStart < existingEnd && newEnd > existingStart
  })

  if (hasConflict) {
    throw new Error('Member already has a booking that conflicts with this time')
  }

  const booking = await prisma.classBooking.create({
    data: {
      gymId: input.gymId,
      userId: input.userId,
      scheduleId: input.scheduleId,
      date: input.date,
      status: input.status ?? 'CONFIRMED',
    },
  })

  revalidatePath('/admin/bookings')
  return { id: booking.id }
}
